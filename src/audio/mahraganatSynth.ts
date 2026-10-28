// Web Audio API Electro-Shaabi (Mahraganat) Sound Engine & DJ Sampler

class MahraganatEngine {
  private ctx: AudioContext | null = null;
  public analyser: AnalyserNode | null = null;
  private isPlaying: boolean = false;
  private tempo: number = 125;
  private masterGain: GainNode | null = null;
  private loopTimer: number | null = null;
  private currentStep: number = 0;
  private stepInterval: number = 0;
  private onTimeUpdateCallback?: (currentTime: number, duration: number) => void;
  private playbackStartTime: number = 0;
  private totalDuration: number = 50; // default 50 seconds track

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public connectMediaElement(audioEl: HTMLAudioElement) {
    this.init();
    if (!this.ctx || !this.analyser) return;
    try {
      // Prevent connecting multiple times to the same element
      if (!(audioEl as any).__connectedToAnalyser) {
        const source = this.ctx.createMediaElementSource(audioEl);
        source.connect(this.analyser);
        (audioEl as any).__connectedToAnalyser = true;
      }
    } catch (e) {
      console.warn('Media element already connected or error:', e);
    }
  }

  public setTempo(bpm: number) {
    this.tempo = bpm;
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public getContext(): AudioContext | null {
    this.init();
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    this.init();
    return this.analyser;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // --- Sound Generation: Darbuka Dum (Deep bass slap) ---
  public playDum(time?: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = time ?? this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);

    gain.gain.setValueAtTime(1.0, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // --- Sound Generation: Darbuka Tak (Crisp metallic rimshot) ---
  public playTak(time?: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = time ?? this.ctx.currentTime;

    // High snap oscillator
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);

    oscGain.gain.setValueAtTime(0.8, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    // Noise burst for the ceramic / aluminum skin resonance
    const bufferSize = this.ctx.sampleRate * 0.06;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2500, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.1);
    noise.start(t);
    noise.stop(t + 0.08);
  }

  // --- Sound Generation: Deep 808 Sub-Bass Slide ---
  public playSubBass(freq: number, duration: number = 0.4, time?: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = time ?? this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.5, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.06);

    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  // --- Sound Generation: Authentic Egyptian Mizmar (مزمار بلدي) ---
  // Sharp double-reed nasal sound using tuned pulse / saw waves with vibrato and microtonal bends
  public playMizmarNote(freq: number, duration: number = 0.25, time?: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = time ?? this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    // Characteristic Egyptian Shaabi portamento and micro-vibrato
    osc1.frequency.setValueAtTime(freq * 0.95, t);
    osc1.frequency.exponentialRampToValueAtTime(freq, t + 0.04);
    osc2.frequency.setValueAtTime(freq * 1.01, t);
    osc2.frequency.exponentialRampToValueAtTime(freq * 1.004, t + 0.04);

    // Nasal bandpass filter typical of Egyptian Mizmar / Zurna
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(4.5, t);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.4, t + duration * 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + duration);
    osc2.stop(t + duration);
  }

  // --- Sound FX: Classic DJ Airhorn (بووو بووو بووو) ---
  public playAirhorn() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const notes = [
      { start: 0.0, dur: 0.14 },
      { start: 0.16, dur: 0.14 },
      { start: 0.32, dur: 0.32 },
    ];

    notes.forEach((note) => {
      const t = this.ctx!.currentTime + note.start;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      // Classic dancehall/mahraganat airhorn fundamental + slight downward pitch drop
      osc.frequency.setValueAtTime(370, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + note.dur);

      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + note.dur);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t);
      osc.stop(t + note.dur);
    });
  }

  // --- Sound FX: Egyptian Zaghrouta (زغروطة شعبية) ---
  public playZaghrouta() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t0 = this.ctx.currentTime;
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // High pitch vibrato at 14Hz
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(14, t0);

    lfoGain.gain.setValueAtTime(160, t0);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1600, t0);
    osc.frequency.linearRampToValueAtTime(2100, t0 + 1.2);

    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.01, t0);
    gain.gain.linearRampToValueAtTime(0.4, t0 + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, t0 + 1.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    lfo.start(t0);
    osc.start(t0);
    lfo.stop(t0 + 1.6);
    osc.stop(t0 + 1.6);
  }

  // --- Sound FX: Egyptian DJ Laser Sweep ---
  public playLaserSweep() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(3200, t0);
    osc.frequency.exponentialRampToValueAtTime(150, t0 + 0.35);

    gain.gain.setValueAtTime(0.6, t0);
    gain.gain.exponentialRampToValueAtTime(0.01, t0 + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t0);
    osc.stop(t0 + 0.36);
  }

  // --- Sound FX: DJ Shoutout "حجاج مرسي حجاج!" ---
  public playVocalChant(text: string = 'حجاج مرسي حجاج') {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.15;
      utterance.pitch = 1.05;
      utterance.lang = 'ar-EG';

      // Pick an Arabic voice if available
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find((v) => v.lang.includes('ar'));
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  }

  // --- Playback of Entire Egyptian Mahraganat Arrangement ---
  // Egyptian Maqam Rast / Bayati Melody Riff: D4 (293), Eb4 (half-flat ~304), F4 (349), G4 (392), A4 (440), Bb4 (466)
  private mizmarMelody = [
    392, 440, 466, 440, 392, 349, 310, 293,
    392, 392, 440, 466, 523, 466, 440, 392,
    587, 523, 466, 440, 392, 349, 310, 293,
    293, 310, 349, 392, 440, 349, 310, 293,
  ];

  public startMahraganLoop(onTimeUpdate?: (currentTime: number, duration: number) => void) {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.onTimeUpdateCallback = onTimeUpdate;
    this.playbackStartTime = Date.now();
    this.currentStep = 0;

    // 16th note step duration based on BPM (125 BPM default)
    // 60 / BPM / 4 = seconds per 16th note
    const stepDuration = 60 / this.tempo / 4;
    this.stepInterval = stepDuration * 1000;

    // Intro shoutout
    this.playAirhorn();
    setTimeout(() => {
      this.playVocalChant('اصحى للكلام! حجاج مرسي حجاج.. السيطرة والهيبة كلها!');
    }, 400);

    const scheduleBeat = () => {
      if (!this.isPlaying || !this.ctx) return;

      const step16 = this.currentStep % 16;
      const bar = Math.floor(this.currentStep / 16);
      const currentTimeSec = (Date.now() - this.playbackStartTime) / 1000;

      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(currentTimeSec, this.totalDuration);
      }

      // Check track completion
      if (currentTimeSec >= this.totalDuration) {
        this.stop();
        return;
      }

      // Egyptian Mahraganat Darbuka Rhythm (Maqsum / Shaabi 16-step):
      // Step 0: DUM (Heavy)
      // Step 3: Sub-bass 808
      // Step 4: TAK
      // Step 7: TAK
      // Step 8: DUM
      // Step 10: TAK
      // Step 12: TAK
      // Step 14: TAK (syncopated roll)
      // Step 15: TAK
      if (step16 === 0 || step16 === 8) {
        this.playDum();
        this.playSubBass(55, 0.35); // Deep G1 sub-bass
      }
      if (step16 === 4 || step16 === 7 || step16 === 10 || step16 === 12 || step16 === 14 || step16 === 15) {
        this.playTak();
      }

      // Snare roll buildup every 4 bars
      if (bar % 4 === 3 && step16 >= 8) {
        this.playTak();
      }

      // Egyptian Mizmar Melodic Riff (Starts after 8 seconds intro)
      if (currentTimeSec >= 6 && step16 % 2 === 0) {
        const noteIndex = Math.floor((this.currentStep / 2) % this.mizmarMelody.length);
        const freq = this.mizmarMelody[noteIndex];
        this.playMizmarNote(freq, stepDuration * 1.8);
      }

      // Vocal triggers at key section boundaries
      if (step16 === 0 && bar === 4) {
        this.playVocalChant('على المبدأ ثابتين.. حجاج مرسي لما يخش كله يقف انتباه!');
      } else if (step16 === 0 && bar === 9) {
        this.playAirhorn();
        this.playVocalChant('حجاج مرسي حجاج! ملك السيطرة وعالي المزاج!');
      } else if (step16 === 0 && bar === 15) {
        this.playZaghrouta();
        this.playVocalChant('أسد المجال.. حجاج مرسي حجاج!');
      }

      this.currentStep++;
      this.loopTimer = window.setTimeout(scheduleBeat, this.stepInterval);
    };

    scheduleBeat();
  }

  public stop() {
    this.isPlaying = false;
    if (this.loopTimer !== null) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(0, this.totalDuration);
    }
  }

  // --- Export Procedural Track to WAV Blob for instant download ---
  public async renderMahraganToWav(durationSec: number = 40): Promise<Blob> {
    const sampleRate = 44100;
    const length = sampleRate * durationSec;
    const offlineCtx = new OfflineAudioContext(2, length, sampleRate);

    const stepDuration = 60 / this.tempo / 4;
    const totalSteps = Math.floor(durationSec / stepDuration);

    for (let s = 0; s < totalSteps; s++) {
      const t = s * stepDuration;
      const step16 = s % 16;

      // Dum
      if (step16 === 0 || step16 === 8) {
        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);
        gain.gain.setValueAtTime(0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc.connect(gain);
        gain.connect(offlineCtx.destination);
        osc.start(t);
        osc.stop(t + 0.3);

        // 808
        const osc808 = offlineCtx.createOscillator();
        const gain808 = offlineCtx.createGain();
        osc808.type = 'sine';
        osc808.frequency.setValueAtTime(55, t);
        gain808.gain.setValueAtTime(0.7, t);
        gain808.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
        osc808.connect(gain808);
        gain808.connect(offlineCtx.destination);
        osc808.start(t);
        osc808.stop(t + 0.36);
      }

      // Tak
      if (step16 === 4 || step16 === 7 || step16 === 10 || step16 === 12 || step16 === 14 || step16 === 15) {
        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.connect(gain);
        gain.connect(offlineCtx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
      }

      // Mizmar
      if (t >= 5 && s % 2 === 0) {
        const noteIndex = Math.floor((s / 2) % this.mizmarMelody.length);
        const freq = this.mizmarMelody[noteIndex];
        const osc = offlineCtx.createOscillator();
        const filter = offlineCtx.createBiquadFilter();
        const gain = offlineCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, t);
        filter.Q.setValueAtTime(4.0, t);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 1.6);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(offlineCtx.destination);

        osc.start(t);
        osc.stop(t + stepDuration * 1.8);
      }
    }

    const renderedBuffer = await offlineCtx.startRendering();
    return this.bufferToWavBlob(renderedBuffer);
  }

  // Convert AudioBuffer to standard 16-bit PCM WAV Blob
  private bufferToWavBlob(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    let result: Float32Array;
    if (numChannels === 2) {
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);
      result = new Float32Array(left.length + right.length);
      for (let i = 0; i < left.length; i++) {
        result[i * 2] = left[i];
        result[i * 2 + 1] = right[i];
      }
    } else {
      result = buffer.getChannelData(0);
    }

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = result.length * bytesPerSample;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;

    const arrayBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(arrayBuffer);

    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, totalSize - 8, true);
    this.writeString(view, 8, 'WAVE');

    // "fmt " sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);

    // "data" sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write 16-bit PCM samples
    let offset = 44;
    for (let i = 0; i < result.length; i++) {
      let s = Math.max(-1, Math.min(1, result[i]));
      s = s < 0 ? s * 0x8000 : s * 0x7FFF;
      view.setInt16(offset, s, true);
      offset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

export const mahraganatSynth = new MahraganatEngine();
