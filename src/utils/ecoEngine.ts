/**
 * Arcadex Eco-Friendly Performance & Battery Optimization Engine
 * Pauses background loops, manages battery saving mode, and reduces CPU/GPU footprint
 */

export class EcoEngine {
  private static isEcoModeEnabled: boolean = false;
  private static listeners: Array<(eco: boolean) => void> = [];

  public static isEco(): boolean {
    return this.isEcoModeEnabled;
  }

  public static setEco(enabled: boolean) {
    this.isEcoModeEnabled = enabled;
    try {
      localStorage.setItem('arcadex_eco_mode', enabled ? 'true' : 'false');
    } catch {
      // Ignore storage errors
    }
    this.notify();
  }

  public static toggleEco(): boolean {
    this.setEco(!this.isEcoModeEnabled);
    return this.isEcoModeEnabled;
  }

  public static init() {
    try {
      const saved = localStorage.getItem('arcadex_eco_mode');
      if (saved === 'true') {
        this.isEcoModeEnabled = true;
      }
    } catch {
      // Ignore
    }

    // Auto-detect Low Battery mode if Battery API is available
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      try {
        (navigator as any).getBattery().then((battery: any) => {
          if (battery.level <= 0.20 && !battery.charging) {
            this.setEco(true);
          }
          battery.addEventListener('levelchange', () => {
            if (battery.level <= 0.20 && !battery.charging) {
              this.setEco(true);
            }
          });
        }).catch(() => {});
      } catch {
        // Battery API not supported or blocked
      }
    }
  }

  public static subscribe(callback: (eco: boolean) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private static notify() {
    this.listeners.forEach(cb => {
      try {
        cb(this.isEcoModeEnabled);
      } catch {
        // Ignore callback error
      }
    });
  }
}

// Auto init on import
if (typeof window !== 'undefined') {
  EcoEngine.init();
}
