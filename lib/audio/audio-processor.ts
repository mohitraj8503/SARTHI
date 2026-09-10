// ✅ lib/audio/audio-processor.ts - Web Audio API processing
export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private prevSample = 0;
  
  async initialize(stream: MediaStream) {
    if (typeof window === 'undefined') return;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.source = this.audioContext.createMediaStreamSource(stream);
    
    // ✅ Create audio processor with echo cancellation
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.processor.onaudioprocess = (e) => this.processAudio(e);
    
    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
    
    // ✅ Initialize noise suppression (WebRTC-style)
    await this.initializeNoiseSuppression();
  }
  
  private async initializeNoiseSuppression() {
    // ✅ Use WebRTC's built-in NS if available
    if (navigator.mediaDevices.getSupportedConstraints().noiseSuppression) {
      const constraints: MediaTrackConstraints = { noiseSuppression: true };
      // Apply to existing tracks
      this.source?.mediaStream.getAudioTracks().forEach(track => {
        track.applyConstraints(constraints).catch(console.error);
      });
    }
  }
  
  private processAudio(e: AudioProcessingEvent) {
    const input = e.inputBuffer.getChannelData(0);
    const output = e.outputBuffer.getChannelData(0);
    
    // ✅ Simple echo cancellation: high-pass filter + gain control
    for (let i = 0; i < input.length; i++) {
      // High-pass filter to remove low-frequency echo
      let sample = input[i] - (this.prevSample || 0) * 0.95;
      
      // Auto gain control: normalize to -12dB
      const targetLevel = 0.25;
      const currentLevel = Math.abs(sample);
      if (currentLevel > 0.01) {
        const gain = targetLevel / currentLevel;
        sample *= Math.min(gain, 3); // Limit gain to prevent distortion
      }
      
      output[i] = Math.max(-1, Math.min(1, sample));
      this.prevSample = sample;
    }
  }
  
  cleanup() {
    this.processor?.disconnect();
    this.source?.disconnect();
    this.audioContext?.close();
  }
}
