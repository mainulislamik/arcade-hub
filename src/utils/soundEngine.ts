// Procedural Web Audio API Sound Synthesizer (0 External Audio Downloads)

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public playBeep(frequency: number = 440, type: OscillatorType = 'square', duration: number = 0.1, gainValue: number = 0.1) {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // AudioContext fallback
    }
  }

  // Common Sound FX
  public playClick() {
    this.playBeep(800, 'sine', 0.04, 0.08);
  }

  public click() {
    this.playClick();
  }

  public playJump() {
    this.playBeep(420, 'sine', 0.08, 0.1);
  }

  public jump() {
    this.playJump();
  }

  public playMove() {
    this.playBeep(320, 'triangle', 0.05, 0.06);
  }

  public move() {
    this.playMove();
  }

  public playShoot() {
    this.playBeep(900, 'sawtooth', 0.06, 0.1);
  }

  public shoot() {
    this.playShoot();
  }

  public playCoin() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, t); // B5
      osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.35);
    } catch {}
  }

  public coin() {
    this.playCoin();
  }

  public playEat() {
    this.playBeep(450, 'square', 0.06, 0.08);
  }

  public playPowerup() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.25);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.3);
    } catch {}
  }

  public playPowerUp() {
    this.playPowerup();
  }

  public powerUp() {
    this.playPowerup();
  }

  public powerup() {
    this.playPowerup();
  }

  public playHit() {
    this.playBeep(120, 'sawtooth', 0.12, 0.15);
  }

  public hit() {
    this.playHit();
  }

  public playPop() {
    this.playBeep(650, 'sine', 0.05, 0.1);
  }

  public pop() {
    this.playPop();
  }

  public playClear() {
    this.playBeep(880, 'triangle', 0.15, 0.12);
  }

  public clear() {
    this.playClear();
  }

  public playFall() {
    this.playBeep(220, 'sawtooth', 0.25, 0.12);
  }

  public fall() {
    this.playFall();
  }

  public playLaser() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.15);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.15);
    } catch {}
  }

  public laser() {
    this.playLaser();
  }

  public playExplosion() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.3);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.35);
    } catch {}
  }

  public explosion() {
    this.playExplosion();
  }

  public playGameOver() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const notes = [440, 392, 349, 293];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playBeep(freq, 'sawtooth', 0.2, 0.12);
        }, idx * 160);
      });
    } catch {}
  }

  public gameOver() {
    this.playGameOver();
  }

  public playVictory() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playBeep(freq, 'triangle', 0.18, 0.15);
        }, idx * 120);
      });
    } catch {}
  }

  public victory() {
    this.playVictory();
  }

  public playLevelUp() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playBeep(freq, 'sine', 0.15, 0.14);
        }, idx * 80);
      });
    } catch {}
  }

  // Web Audio AI Synth Voice Announcer (Zero Bandwidth / Pure Web Speech)
  public announceVoice(text: string) {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.15;
      utterance.rate = 1.25;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    } catch {}
  }

  public announceCombo(comboCount: number) {
    this.playPowerup();
    if (comboCount >= 10) {
      this.announceVoice('GODLIKE COMBO!');
    } else if (comboCount >= 5) {
      this.announceVoice('UNSTOPPABLE!');
    } else if (comboCount >= 3) {
      this.announceVoice('MEGA COMBO!');
    }
  }

  public announceHighScore() {
    this.playVictory();
    this.announceVoice('NEW HIGH SCORE!');
  }
}

export const sounds = new SoundEngine();
