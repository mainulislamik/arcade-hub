import { useState, useEffect, useRef } from 'react';

export interface GamepadState {
  connected: boolean;
  id: string;
  buttons: boolean[];
  axes: number[];
}

export function useGamepad(targetIframeRef?: React.RefObject<HTMLIFrameElement | null>) {
  const [gamepadState, setGamepadState] = useState<GamepadState>({
    connected: false,
    id: '',
    buttons: [],
    axes: []
  });

  const prevButtonsRef = useRef<boolean[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const handleConnect = (e: GamepadEvent) => {
      console.log('Gamepad connected:', e.gamepad.id);
      setGamepadState({
        connected: true,
        id: e.gamepad.id,
        buttons: e.gamepad.buttons.map(b => b.pressed),
        axes: [...e.gamepad.axes]
      });
    };

    const handleDisconnect = () => {
      console.log('Gamepad disconnected');
      setGamepadState({
        connected: false,
        id: '',
        buttons: [],
        axes: []
      });
    };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);

    const emitKeyEvent = (key: string, code: string, type: 'keydown' | 'keyup') => {
      const event = new KeyboardEvent(type, {
        key,
        code,
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(event);
      document.dispatchEvent(event);

      // Also forward to iframe contentWindow if accessible
      if (targetIframeRef?.current?.contentWindow) {
        try {
          targetIframeRef.current.contentWindow.dispatchEvent(event);
        } catch {
          // Cross-origin safe ignore
        }
      }
    };

    // Polling loop for gamepad buttons
    const pollGamepad = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0] || gamepads[1];

      if (gp) {
        const pressed = gp.buttons.map(b => b.pressed);
        const prev = prevButtonsRef.current;

        // Button Mapping:
        // 0: A / Cross -> Space / Action
        // 1: B / Circle -> Escape / Back
        // 12: Dpad Up -> ArrowUp
        // 13: Dpad Down -> ArrowDown
        // 14: Dpad Left -> ArrowLeft
        // 15: Dpad Right -> ArrowRight
        // Axes 0 (Left Stick X): < -0.5 (Left), > 0.5 (Right)
        // Axes 1 (Left Stick Y): < -0.5 (Up), > 0.5 (Down)

        const mappings = [
          { btn: 0, key: ' ', code: 'Space' },
          { btn: 1, key: 'Escape', code: 'Escape' },
          { btn: 12, key: 'ArrowUp', code: 'ArrowUp' },
          { btn: 13, key: 'ArrowDown', code: 'ArrowDown' },
          { btn: 14, key: 'ArrowLeft', code: 'ArrowLeft' },
          { btn: 15, key: 'ArrowRight', code: 'ArrowRight' },
        ];

        mappings.forEach(({ btn, key, code }) => {
          if (pressed[btn] && !prev[btn]) {
            emitKeyEvent(key, code, 'keydown');
          } else if (!pressed[btn] && prev[btn]) {
            emitKeyEvent(key, code, 'keyup');
          }
        });

        // Analog stick support
        const stickX = gp.axes[0] || 0;
        const stickY = gp.axes[1] || 0;

        if (stickX < -0.5 && !prev[100]) {
          emitKeyEvent('ArrowLeft', 'ArrowLeft', 'keydown');
          prev[100] = true;
        } else if (stickX >= -0.5 && prev[100]) {
          emitKeyEvent('ArrowLeft', 'ArrowLeft', 'keyup');
          prev[100] = false;
        }

        if (stickX > 0.5 && !prev[101]) {
          emitKeyEvent('ArrowRight', 'ArrowRight', 'keydown');
          prev[101] = true;
        } else if (stickX <= 0.5 && prev[101]) {
          emitKeyEvent('ArrowRight', 'ArrowRight', 'keyup');
          prev[101] = false;
        }

        if (stickY < -0.5 && !prev[102]) {
          emitKeyEvent('ArrowUp', 'ArrowUp', 'keydown');
          prev[102] = true;
        } else if (stickY >= -0.5 && prev[102]) {
          emitKeyEvent('ArrowUp', 'ArrowUp', 'keyup');
          prev[102] = false;
        }

        if (stickY > 0.5 && !prev[103]) {
          emitKeyEvent('ArrowDown', 'ArrowDown', 'keydown');
          prev[103] = true;
        } else if (stickY <= 0.5 && prev[103]) {
          emitKeyEvent('ArrowDown', 'ArrowDown', 'keyup');
          prev[103] = false;
        }

        prevButtonsRef.current = pressed;

        setGamepadState(s => {
          if (!s.connected) {
            return {
              connected: true,
              id: gp.id,
              buttons: pressed,
              axes: [...gp.axes]
            };
          }
          return s;
        });
      }

      animationFrameRef.current = requestAnimationFrame(pollGamepad);
    };

    animationFrameRef.current = requestAnimationFrame(pollGamepad);

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetIframeRef]);

  return gamepadState;
}
