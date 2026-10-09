/**
 * Arcadex Mobile Haptic Vibration & Tactile Feedback Engine
 * Provides native controller rumble and tactile sensations
 */

export class HapticEngine {
  private static isSupported = typeof window !== 'undefined' && 'navigator' in window && !!navigator.vibrate;
  private static enabled = true;

  static setEnabled(val: boolean) {
    this.enabled = val;
  }

  static isEnabled(): boolean {
    return this.enabled && this.isSupported;
  }

  /**
   * Light tactile click (UI buttons, keypad presses)
   */
  static lightTick() {
    if (!this.enabled || !this.isSupported) return;
    try {
      navigator.vibrate(15);
    } catch {}
  }

  /**
   * Medium bounce impulse (Rubber ball bouncer, jump, ring collect)
   */
  static bounceImpulse() {
    if (!this.enabled || !this.isSupported) return;
    try {
      navigator.vibrate([25, 10, 25]);
    } catch {}
  }

  /**
   * Heavy crash rumble (Spike pop, crash, game over)
   */
  static heavyCrash() {
    if (!this.enabled || !this.isSupported) return;
    try {
      navigator.vibrate([100, 30, 150]);
    } catch {}
  }

  static heavyRumble() {
    this.heavyCrash();
  }

  /**
   * Checkpoint & Level Clear Fanfare Rhythm
   */
  static victoryFanfare() {
    if (!this.enabled || !this.isSupported) return;
    try {
      navigator.vibrate([40, 20, 60, 20, 100]);
    } catch {}
  }

  /**
   * Custom vibration pattern
   */
  static customPattern(pattern: number | number[]) {
    if (!this.enabled || !this.isSupported) return;
    try {
      navigator.vibrate(pattern);
    } catch {}
  }
}
