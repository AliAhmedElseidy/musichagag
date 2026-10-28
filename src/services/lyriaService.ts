import { GeneratedTrack, StudioSettings } from '../types/mahragan';
import { LYRIA_DEFAULT_PROMPT, OFFICIAL_LYRICS_TEXT } from '../data/mahraganLyrics';
import { mahraganatSynth } from '../audio/mahraganatSynth';

export interface GenerationResult {
  track: GeneratedTrack;
  isFallback?: boolean;
  message?: string;
}

export class LyriaService {
  public static async checkStatus(): Promise<{ hasApiKey: boolean; status: string }> {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        return await res.json();
      }
      return { hasApiKey: false, status: 'error' };
    } catch {
      return { hasApiKey: false, status: 'offline' };
    }
  }

  public static async generateMahragan(settings: StudioSettings): Promise<GenerationResult> {
    const prompt = settings.customLyrics
      ? `Generate a high-energy Egyptian Mahraganat (Electro-Shaabi) track at ${settings.bpm} BPM featuring heavy electronic Darbuka beats, loud traditional Egyptian Mizmar melodies, deep sub-bass, and energetic male Mahraganat vocals with slight autotune singing:\n\n${settings.customLyrics}`
      : LYRIA_DEFAULT_PROMPT;

    try {
      const res = await fetch('/api/generate-mahragan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: settings.model,
          prompt,
          bpm: settings.bpm,
          singerName: settings.singerName || 'حجاج مرسي حجاج',
          lyrics: settings.customLyrics || OFFICIAL_LYRICS_TEXT,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        console.warn('[Lyria API Response Warning]', data);
        // Fallback to high-energy procedural Mahraganat synthesizer
        const fallbackBlob = await mahraganatSynth.renderMahraganToWav(45);
        const fallbackUrl = URL.createObjectURL(fallbackBlob);

        return {
          track: {
            id: `track-${Date.now()}`,
            title: `مهرجان ${settings.singerName} - استوديو شعبي (${settings.bpm} BPM)`,
            singer: settings.singerName,
            audioUrl: fallbackUrl,
            blob: fallbackBlob,
            mimeType: 'audio/wav',
            bpm: settings.bpm,
            model: 'studio-synth',
            duration: 45,
            createdAt: new Date(),
            lyrics: settings.customLyrics || OFFICIAL_LYRICS_TEXT,
          },
          isFallback: true,
          message: data.error || 'تم استخدام المحرك الصوتي الشعبي الفوري (الاستوديو الإلكتروني)',
        };
      }

      // Convert base64 audio to Blob URL
      const binary = atob(data.audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const mime = data.mimeType || 'audio/wav';
      const audioBlob = new Blob([bytes], { type: mime });
      const audioUrl = URL.createObjectURL(audioBlob);

      return {
        track: {
          id: `track-${Date.now()}`,
          title: data.trackTitle || `مهرجان حجاج مرسي حجاج - ملوك السيطرة (${settings.bpm} BPM)`,
          singer: settings.singerName,
          audioUrl,
          blob: audioBlob,
          mimeType: mime,
          bpm: data.bpm || settings.bpm,
          model: data.model || settings.model,
          duration: data.model === 'lyria-3-pro-preview' ? 120 : 32,
          createdAt: new Date(),
          lyrics: data.lyrics || OFFICIAL_LYRICS_TEXT,
        },
        isFallback: false,
      };
    } catch (err: any) {
      console.error('[Lyria Service Network Error]:', err);
      // Generate instant procedural Mahraganat track
      const fallbackBlob = await mahraganatSynth.renderMahraganToWav(45);
      const fallbackUrl = URL.createObjectURL(fallbackBlob);

      return {
        track: {
          id: `track-${Date.now()}`,
          title: `مهرجان حجاج مرسي حجاج - لايف شعبي (${settings.bpm} BPM)`,
          singer: settings.singerName,
          audioUrl: fallbackUrl,
          blob: fallbackBlob,
          mimeType: 'audio/wav',
          bpm: settings.bpm,
          model: 'studio-synth',
          duration: 45,
          createdAt: new Date(),
          lyrics: OFFICIAL_LYRICS_TEXT,
        },
        isFallback: true,
        message: 'تم تفعيل التوليد الصوتي الإيقاعي عبر استوديو المهرجانات السريع',
      };
    }
  }

  public static downloadTrack(track: GeneratedTrack) {
    if (!track.audioUrl) return;
    const a = document.createElement('a');
    a.href = track.audioUrl;
    const ext = track.mimeType.includes('mp3') ? 'mp3' : 'wav';
    const safeTitle = track.title.replace(/[\/\\?%*:|"<>]/g, '_');
    a.download = `${safeTitle}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
