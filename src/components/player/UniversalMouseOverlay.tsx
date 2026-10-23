import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mouse,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Zap,
  Info,
  CheckCircle2
} from 'lucide-react';
import { HapticEngine } from '../../utils/hapticEngine';

interface UniversalMouseOverlayProps {
  onSendKey: (key: string, type: 'keydown' | 'keyup') => void;
  enabled?: boolean;
  onToggleEnabled?: (enabled: boolean) => void;
  className?: string;
  children?: React.ReactNode;
}

export const UniversalMouseOverlay: React.FC<UniversalMouseOverlayProps> = ({
  onSendKey,
  enabled: externalEnabled,
  onToggleEnabled,
  className = '',
  children
}) => {
  const [internalEnabled, setInternalEnabled] = useState<boolean>(true);
  const isEnabled = externalEnabled !== undefined ? externalEnabled : internalEnabled;

  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [gestureFeedback, setGestureFeedback] = useState<{
    active: boolean;
    direction: 'up' | 'down' | 'left' | 'right' | 'click' | 'rightclick' | null;
    x: number;
    y: number;
    deltaX: number;
    deltaY: number;
  }>({
    active: false,
    direction: null,
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0
  });

  const overlayRef = useRef<HTMLDivElement>(null);
  const isPointerDownRef = useRef<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const activeKeyRef = useRef<string | null>(null);
  const gestureTriggeredRef = useRef<boolean>(false);

  const toggleEnabled = () => {
    const next = !isEnabled;
    setInternalEnabled(next);
    onToggleEnabled?.(next);
    HapticEngine.selectionClick();
  };

  const clearActiveKey = useCallback(() => {
    if (activeKeyRef.current) {
      onSendKey(activeKeyRef.current, 'keyup');
      activeKeyRef.current = null;
    }
  }, [onSendKey]);

  // Pointer Down handler
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isEnabled) return;
    // Don't intercept if clicking directly on a button or interactive child element
    const target = e.target as HTMLElement;
    if (target.closest('button, select, input, a, [role="button"]')) {
      return;
    }

    isPointerDownRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
    gestureTriggeredRef.current = false;

    // Show initial touch/click point
    setGestureFeedback({
      active: true,
      direction: null,
      x: e.clientX,
      y: e.clientY,
      deltaX: 0,
      deltaY: 0
    });
  };

  // Pointer Move handler for drag gesture detection (> 20px threshold)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isEnabled || !isPointerDownRef.current) return;

    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    const distance = Math.hypot(dx, dy);

    // Gestures triggered beyond 20px threshold
    if (distance >= 20) {
      const isHorizontal = Math.abs(dx) > Math.abs(dy);
      let detectedKey = '';
      let direction: 'up' | 'down' | 'left' | 'right' = 'up';

      if (isHorizontal) {
        if (dx > 0) {
          detectedKey = 'ArrowRight';
          direction = 'right';
        } else {
          detectedKey = 'ArrowLeft';
          direction = 'left';
        }
      } else {
        if (dy > 0) {
          detectedKey = 'ArrowDown';
          direction = 'down';
        } else {
          detectedKey = 'ArrowUp';
          direction = 'up';
        }
      }

      setGestureFeedback({
        active: true,
        direction,
        x: e.clientX,
        y: e.clientY,
        deltaX: dx,
        deltaY: dy
      });

      if (activeKeyRef.current !== detectedKey) {
        clearActiveKey();
        onSendKey(detectedKey, 'keydown');
        activeKeyRef.current = detectedKey;
        gestureTriggeredRef.current = true;
        HapticEngine.lightTick();
      }
    } else {
      setGestureFeedback(prev => ({
        ...prev,
        x: e.clientX,
        y: e.clientY,
        deltaX: dx,
        deltaY: dy
      }));
    }
  };

  // Pointer Up / Cancel handler
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isEnabled || !isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    const distance = Math.hypot(dx, dy);
    const duration = performance.now() - startPosRef.current.time;

    // Release any held direction key
    clearActiveKey();

    // If it was a quick click without exceeding 20px drag threshold, handle as Action Click
    if (distance < 20 && duration < 600 && !gestureTriggeredRef.current) {
      if (e.button === 0) {
        // Left click -> Action A / Space
        onSendKey('Space', 'keydown');
        setTimeout(() => onSendKey('Space', 'keyup'), 100);
        setGestureFeedback({
          active: true,
          direction: 'click',
          x: e.clientX,
          y: e.clientY,
          deltaX: 0,
          deltaY: 0
        });
      } else if (e.button === 2) {
        // Right click -> Action B / Escape
        onSendKey('Escape', 'keydown');
        setTimeout(() => onSendKey('Escape', 'keyup'), 100);
        setGestureFeedback({
          active: true,
          direction: 'rightclick',
          x: e.clientX,
          y: e.clientY,
          deltaX: 0,
          deltaY: 0
        });
      }
    }

    setTimeout(() => {
      setGestureFeedback(prev => ({ ...prev, active: false, direction: null }));
    }, 180);
  };

  // Context menu interception for Right-click gesture
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEnabled) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, select, input, a, [role="button"]')) {
      return;
    }
    e.preventDefault();
    onSendKey('Escape', 'keydown');
    setTimeout(() => onSendKey('Escape', 'keyup'), 100);
    setGestureFeedback({
      active: true,
      direction: 'rightclick',
      x: e.clientX,
      y: e.clientY,
      deltaX: 0,
      deltaY: 0
    });
    setTimeout(() => {
      setGestureFeedback(prev => ({ ...prev, active: false, direction: null }));
    }, 200);
  };

  // Wheel listener: Scroll Up -> ArrowUp, Scroll Down -> ArrowDown
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!isEnabled) return;
    if (Math.abs(e.deltaY) < 15) return;

    if (e.deltaY < 0) {
      // Scroll Up -> ArrowUp / Jump
      onSendKey('ArrowUp', 'keydown');
      setTimeout(() => onSendKey('ArrowUp', 'keyup'), 90);
      setGestureFeedback(prev => ({ ...prev, active: true, direction: 'up' }));
    } else {
      // Scroll Down -> ArrowDown / Roll / Crouch
      onSendKey('ArrowDown', 'keydown');
      setTimeout(() => onSendKey('ArrowDown', 'keyup'), 90);
      setGestureFeedback(prev => ({ ...prev, active: true, direction: 'down' }));
    }

    setTimeout(() => {
      setGestureFeedback(prev => ({ ...prev, active: false, direction: null }));
    }, 200);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearActiveKey();
    };
  }, [clearActiveKey]);

  return (
    <div
      ref={overlayRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={handleContextMenu}
      onWheel={handleWheel}
      className={`relative w-full h-full ${className}`}
    >
      {/* Floating HUD Indicator for Mouse Controls */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 pointer-events-auto select-none">
        <button
          onClick={toggleEnabled}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all shadow-md cursor-pointer border ${
            isEnabled
              ? 'bg-indigo-600/90 hover:bg-indigo-600 text-white border-indigo-400/50'
              : 'bg-slate-900/80 hover:bg-slate-900 text-slate-400 border-slate-700'
          }`}
          title="Toggle Mouse Controller & Gesture Bridge"
        >
          <Mouse className={`w-3.5 h-3.5 ${isEnabled ? 'text-cyan-300 animate-pulse' : 'text-slate-500'}`} />
          <span>Mouse Controls: {isEnabled ? 'Active' : 'Off'}</span>
        </button>

        <button
          onClick={() => setShowTooltip(prev => !prev)}
          className="p-1 rounded-full bg-slate-900/70 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-700 backdrop-blur-md cursor-pointer"
          title="Mouse Controls Info"
        >
          <Info className="w-3 h-3" />
        </button>

        {/* Informative Tooltip */}
        {showTooltip && (
          <div className="absolute top-8 left-0 w-72 p-3 bg-slate-900/95 border border-indigo-500/40 rounded-xl text-xs text-slate-200 shadow-2xl backdrop-blur-md z-40 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-1.5 text-indigo-400 font-bold mb-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Universal Mouse & Gesture Bridge</span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-300">
              <li className="flex items-center gap-1.5">
                <span className="text-cyan-400 font-bold">Drag & Swipe:</span> Steer / Turn / Jump / Slide
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-cyan-400 font-bold">Left Click:</span> Jump / Action (Space)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-cyan-400 font-bold">Right Click:</span> Back / Pause (Escape)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-cyan-400 font-bold">Mouse Wheel:</span> Up/Down Arrow Jump & Crouch
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Visual Directional Hint & Cursor Feedback Overlay */}
      {isEnabled && gestureFeedback.active && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden flex items-center justify-center">
          {gestureFeedback.direction === 'up' && (
            <div className="flex flex-col items-center justify-center gap-1 px-4 py-2 bg-indigo-600/80 backdrop-blur-md border border-cyan-400 text-white rounded-2xl shadow-2xl animate-bounce">
              <ArrowUp className="w-8 h-8 text-cyan-300 stroke-[3]" />
              <span className="text-xs font-black tracking-wider uppercase">JUMP / UP</span>
            </div>
          )}
          {gestureFeedback.direction === 'down' && (
            <div className="flex flex-col items-center justify-center gap-1 px-4 py-2 bg-indigo-600/80 backdrop-blur-md border border-cyan-400 text-white rounded-2xl shadow-2xl animate-bounce">
              <ArrowDown className="w-8 h-8 text-cyan-300 stroke-[3]" />
              <span className="text-xs font-black tracking-wider uppercase">SLIDE / DOWN</span>
            </div>
          )}
          {gestureFeedback.direction === 'left' && (
            <div className="flex flex-col items-center justify-center gap-1 px-4 py-2 bg-indigo-600/80 backdrop-blur-md border border-cyan-400 text-white rounded-2xl shadow-2xl animate-bounce">
              <ArrowLeft className="w-8 h-8 text-cyan-300 stroke-[3]" />
              <span className="text-xs font-black tracking-wider uppercase">LEFT</span>
            </div>
          )}
          {gestureFeedback.direction === 'right' && (
            <div className="flex flex-col items-center justify-center gap-1 px-4 py-2 bg-indigo-600/80 backdrop-blur-md border border-cyan-400 text-white rounded-2xl shadow-2xl animate-bounce">
              <ArrowRight className="w-8 h-8 text-cyan-300 stroke-[3]" />
              <span className="text-xs font-black tracking-wider uppercase">RIGHT</span>
            </div>
          )}
          {gestureFeedback.direction === 'click' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/80 backdrop-blur-md border border-emerald-400 text-white rounded-xl shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span className="text-xs font-bold uppercase">ACTION / TAP</span>
            </div>
          )}
          {gestureFeedback.direction === 'rightclick' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-600/80 backdrop-blur-md border border-rose-400 text-white rounded-xl shadow-lg">
              <span className="text-xs font-bold uppercase">BACK / ESC</span>
            </div>
          )}
        </div>
      )}

      {/* Embedded Game Canvas / Frame Content */}
      {children}
    </div>
  );
};
