import { useState, useEffect } from 'react';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  hasGamepad: boolean;
  gamepadName: string;
  orientation: 'portrait' | 'landscape';
  width: number;
  height: number;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouch: false,
        hasGamepad: false,
        gamepadName: '',
        orientation: 'landscape',
        width: 1440,
        height: 900
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const ua = navigator.userAgent.toLowerCase();
    const isMobileUA = /android|iphone|ipod|windows phone|blackberry/i.test(ua);
    const isTabletUA = /ipad|tablet|(android(?!.*mobile))/i.test(ua);

    const isMobile = isMobileUA || (isTouch && width < 768);
    const isTablet = isTabletUA || (isTouch && width >= 768 && width <= 1024);
    const isDesktop = !isMobile && !isTablet;

    return {
      isMobile,
      isTablet,
      isDesktop,
      isTouch,
      hasGamepad: false,
      gamepadName: '',
      orientation: width >= height ? 'landscape' : 'portrait',
      width,
      height
    };
  });

  useEffect(() => {
    const updateDimensionsAndDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const ua = navigator.userAgent.toLowerCase();
      const isMobileUA = /android|iphone|ipod|windows phone|blackberry/i.test(ua);
      const isTabletUA = /ipad|tablet|(android(?!.*mobile))/i.test(ua);

      const isMobile = isMobileUA || (isTouch && width < 768);
      const isTablet = isTabletUA || (isTouch && width >= 768 && width <= 1024);
      const isDesktop = !isMobile && !isTablet;

      // Check for gamepad
      let hasGamepad = false;
      let gamepadName = '';
      if (typeof navigator.getGamepads === 'function') {
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
          if (gamepads[i]) {
            hasGamepad = true;
            gamepadName = gamepads[i]?.id || 'Gamepad Connected';
            break;
          }
        }
      }

      setDeviceInfo(prev => ({
        ...prev,
        isMobile,
        isTablet,
        isDesktop,
        isTouch,
        hasGamepad,
        gamepadName,
        orientation: width >= height ? 'landscape' : 'portrait',
        width,
        height
      }));
    };

    updateDimensionsAndDevice();

    window.addEventListener('resize', updateDimensionsAndDevice);
    window.addEventListener('orientationchange', updateDimensionsAndDevice);

    const onGamepadConnect = (e: GamepadEvent) => {
      setDeviceInfo(prev => ({
        ...prev,
        hasGamepad: true,
        gamepadName: e.gamepad.id || 'Generic Gamepad'
      }));
    };

    const onGamepadDisconnect = () => {
      let hasGamepad = false;
      let gamepadName = '';
      if (typeof navigator.getGamepads === 'function') {
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
          if (gamepads[i]) {
            hasGamepad = true;
            gamepadName = gamepads[i]?.id || 'Gamepad Connected';
            break;
          }
        }
      }
      setDeviceInfo(prev => ({
        ...prev,
        hasGamepad,
        gamepadName
      }));
    };

    window.addEventListener('gamepadconnected', onGamepadConnect);
    window.addEventListener('gamepaddisconnected', onGamepadDisconnect);

    return () => {
      window.removeEventListener('resize', updateDimensionsAndDevice);
      window.removeEventListener('orientationchange', updateDimensionsAndDevice);
      window.removeEventListener('gamepadconnected', onGamepadConnect);
      window.removeEventListener('gamepaddisconnected', onGamepadDisconnect);
    };
  }, []);

  return deviceInfo;
}
