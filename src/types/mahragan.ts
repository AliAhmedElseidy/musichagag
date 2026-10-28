export interface LyricSection {
  id: string;
  tag: string;
  tagArabic: string;
  lines: string[];
  startTime: number; // in seconds
  endTime: number;   // in seconds
}

export interface GeneratedTrack {
  id: string;
  title: string;
  singer: string;
  audioUrl: string;
  blob?: Blob;
  mimeType: string;
  bpm: number;
  model: 'lyria-3-clip-preview' | 'lyria-3-pro-preview' | 'studio-synth';
  duration: number; // in seconds
  createdAt: Date;
  lyrics: string;
}

export interface StudioSettings {
  bpm: number;
  model: 'lyria-3-clip-preview' | 'lyria-3-pro-preview';
  darbukaVolume: number;
  mizmarVolume: number;
  bassBoost: number;
  reverbAmount: number;
  singerName: string;
  customLyrics?: string;
}

export interface SoundFxPad {
  id: string;
  name: string;
  arabicName: string;
  icon: string;
  color: string;
  hotkey: string;
}
