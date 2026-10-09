/**
 * Arcadex 30-Second Rolling Instant Replay Video Recorder
 * Uses canvas capture stream and MediaRecorder API for 60fps MP4/WebM clip exports
 */

export class ReplayRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;
  private stream: MediaStream | null = null;

  /**
   * Start recording from a canvas element
   */
  start(canvas: HTMLCanvasElement): boolean {
    if (!canvas || typeof MediaRecorder === 'undefined') return false;

    try {
      this.recordedChunks = [];
      this.stream = canvas.captureStream(60); // 60 FPS
      
      const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4'
      ];
      
      const selectedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: selectedType,
        videoBitsPerSecond: 3500000 // 3.5 Mbps high quality
      });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
          // Keep last 30 seconds (~30 chunks if 1 chunk/sec)
          if (this.recordedChunks.length > 30) {
            this.recordedChunks.shift();
          }
        }
      };

      this.mediaRecorder.start(1000); // chunk every 1 second
      this.isRecording = true;
      return true;
    } catch (err) {
      console.warn('ReplayRecorder could not start:', err);
      return false;
    }
  }

  /**
   * Stop recording and get the video blob
   */
  async stopAndGetClip(): Promise<Blob | null> {
    if (!this.mediaRecorder || !this.isRecording) return null;

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'video/webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        this.isRecording = false;
        resolve(blob);
      };

      try {
        this.mediaRecorder?.stop();
        if (this.stream) {
          this.stream.getTracks().forEach(t => t.stop());
        }
      } catch {
        resolve(null);
      }
    });
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
}
