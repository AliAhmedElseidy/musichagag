import React, { useState, useEffect, useRef } from 'react';
import { DJConsoleHeader } from './components/DJConsoleHeader';
import { GiantPlayButton } from './components/GiantPlayButton';
import { AudioVisualizer } from './components/AudioVisualizer';
import { SynchronizedLyrics } from './components/SynchronizedLyrics';
import { DJSoundboard } from './components/DJSoundboard';
import { StudioControls } from './components/StudioControls';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { mahraganatSynth } from './audio/mahraganatSynth';
import { LyriaService } from './services/lyriaService';
import { GeneratedTrack, StudioSettings } from './types/mahragan';
import { OFFICIAL_LYRICS_TEXT, OFFICIAL_SECTIONS } from './data/mahraganLyrics';
import { Sparkles, Crown, Disc, Download, AlertCircle, CheckCircle2, Music, Flame } from 'lucide-react';

export default function App() {
  // Studio Settings automatically configured on load as requested:
  // 125 BPM, Electro-Shaabi, Darbuka, Mizmar, 808 Sub-bass, Haggag Morsi Haggag lyrics
  const [settings, setSettings] = useState<StudioSettings>({
    bpm: 125,
    model: 'lyria-3-clip-preview',
    darbukaVolume: 0.9,
    mizmarVolume: 0.85,
    bassBoost: 0.9,
    reverbAmount: 0.4,
    singerName: 'حجاج مرسي حجاج',
    customLyrics: OFFICIAL_LYRICS_TEXT,
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(50);
  const [volume, setVolume] = useState<number>(0.85);
  const [currentTrack, setCurrentTrack] = useState<GeneratedTrack | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'info' | 'success' | 'warning' } | null>({
    text: 'تم ضبط استوديو Lyria تلقائياً لمهرجان حجاج مرسي حجاج (125 BPM)',
    type: 'success',
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Keyboard shortcut listener for DJ controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key >= '1' && e.key <= '8') {
        // Triggered via soundboard
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTrack]);

  // Handle master play/pause
  const togglePlay = async () => {
    mahraganatSynth.init();

    if (isPlaying) {
      // Stop both synth and audio element
      mahraganatSynth.stop();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);

      // If we have a generated Lyria audio file loaded in the audio element
      if (currentTrack && currentTrack.audioUrl && audioRef.current && currentTrack.model !== 'studio-synth') {
        try {
          mahraganatSynth.connectMediaElement(audioRef.current);
          audioRef.current.volume = volume;
          await audioRef.current.play();
        } catch (err) {
          console.warn('Audio element play failed, falling back to synth engine:', err);
          mahraganatSynth.setTempo(settings.bpm);
          mahraganatSynth.startMahraganLoop((cur, dur) => {
            setCurrentTime(cur);
            setDuration(dur);
          });
        }
      } else {
        // Run live procedural Mahraganat Synth Engine
        mahraganatSynth.setTempo(settings.bpm);
        mahraganatSynth.startMahraganLoop((cur, dur) => {
          setCurrentTime(cur);
          setDuration(dur);
        });
      }
    }
  };

  // Generate track via Lyria
  const handleGenerateLyria = async () => {
    setIsGenerating(true);
    setStatusMessage({
      text: `جاري توليد مهرجان حجاج مرسي عبر محرك Lyria (${settings.model === 'lyria-3-pro-preview' ? 'Lyria 3 Pro' : 'Lyria 3 Clip'})... ⚡`,
      type: 'info',
    });

    try {
      const result = await LyriaService.generateMahragan(settings);
      setCurrentTrack(result.track);
      setDuration(result.track.duration);

      if (audioRef.current) {
        audioRef.current.src = result.track.audioUrl;
        audioRef.current.load();
        mahraganatSynth.connectMediaElement(audioRef.current);
      }

      setStatusMessage({
        text: result.isFallback
          ? 'تم تشغيل النسخة الاحترافية من الاستوديو الشعبي بنجاح!'
          : 'تم توليد تراك المهرجان بنجاح عبر محرك Lyria بنقاوة عالية!',
        type: 'success',
      });

      // Auto start playback if user requested generation
      setTimeout(() => {
        if (!isPlaying) {
          togglePlay();
        }
      }, 300);
    } catch (err: any) {
      console.error('Generation error:', err);
      setStatusMessage({
        text: 'حدث خطأ أثناء التوليد، تم تفعيل الاستوديو الحي المباشر.',
        type: 'warning',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Download track (either current track or render new WAV)
  const handleDownload = async () => {
    if (currentTrack) {
      LyriaService.downloadTrack(currentTrack);
      setStatusMessage({
        text: `تم بدء تحميل تراك ${currentTrack.title} بصيغة WAV!`,
        type: 'success',
      });
    } else {
      setStatusMessage({
        text: 'جاري تصدير ماستر المهرجان بصيغة WAV 16-Bit...',
        type: 'info',
      });
      const blob = await mahraganatSynth.renderMahraganToWav(45);
      const track: GeneratedTrack = {
        id: `track-${Date.now()}`,
        title: `مهرجان حجاج مرسي حجاج - ملوك السيطرة (${settings.bpm} BPM)`,
        singer: settings.singerName,
        audioUrl: URL.createObjectURL(blob),
        blob,
        mimeType: 'audio/wav',
        bpm: settings.bpm,
        model: 'studio-synth',
        duration: 45,
        createdAt: new Date(),
        lyrics: OFFICIAL_LYRICS_TEXT,
      };
      setCurrentTrack(track);
      LyriaService.downloadTrack(track);
      setStatusMessage({
        text: 'تم تجهيز وتحميل المهرجان بنجاح!',
        type: 'success',
      });
    }
  };

  // Handle Seeking
  const handleSeek = (targetSec: number) => {
    setCurrentTime(targetSec);
    if (audioRef.current && currentTrack && currentTrack.model !== 'studio-synth') {
      audioRef.current.currentTime = targetSec;
    }
  };

  // Update volume
  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    mahraganatSynth.setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  return (
    <div className="min-h-screen bg-[#070510] text-white flex flex-col pb-24 relative selection:bg-pink-500 selection:text-white">
      {/* Background Decorative Lighting & Grids */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-950/20 via-[#070510] to-[#040309] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Hidden HTML5 Audio Element for Lyria rendered tracks */}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => {
          const cur = e.currentTarget.currentTime;
          const dur = e.currentTarget.duration || duration;
          setCurrentTime(cur);
          setDuration(dur);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      {/* Top DJ Console Bar */}
      <DJConsoleHeader
        bpm={settings.bpm}
        isPlaying={isPlaying}
        model={settings.model}
      />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Status Toast Notification */}
        {statusMessage && (
          <div
            className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border backdrop-blur-md text-xs sm:text-sm animate-fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : statusMessage.type === 'warning'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-yellow-400" />
              )}
              <span className="font-medium">{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-zinc-400 hover:text-white text-xs font-mono"
            >
              ✕
            </button>
          </div>
        )}

        {/* Hero Egyptian DJ Stage Header */}
        <section className="relative rounded-3xl bg-gradient-to-b from-[#18112c]/80 via-[#100a20]/90 to-[#0c0817] border border-pink-500/30 p-6 sm:p-8 overflow-hidden shadow-[0_0_50px_rgba(236,72,153,0.15)]">
          {/* Top Stage Spotlight Bars */}
          <div className="absolute top-0 left-1/4 w-48 h-32 bg-pink-500/20 blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-48 h-32 bg-yellow-400/20 blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center text-center">
            {/* VIP Golden Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 via-pink-500/20 to-purple-500/20 border border-yellow-400/50 mb-3 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
              <Crown className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-200">
                إهداء خاص وكبير المجال: حَجّاج مَرْسِي حَجّاج
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-400 to-cyan-300 drop-shadow-[0_4px_16px_rgba(236,72,153,0.4)]">
              مهرجان السيطرة والهيبة كلها
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-zinc-300 max-w-2xl">
              توليد وتوزيع إلكترو-شعبي مصري فائق الطاقة بسرعة 125 BPM، طبلة ودربوكة إلكترونية حامية،
              وصوت مزمار بلدي حاد مع بيز 808 عميق وأوتوتيون مهرجانات.
            </p>

            {/* Giant Play Button as requested */}
            <div className="mt-4">
              <GiantPlayButton
                isPlaying={isPlaying}
                isGenerating={isGenerating}
                onTogglePlay={togglePlay}
                onGenerateLyria={handleGenerateLyria}
                bpm={settings.bpm}
              />
            </div>
          </div>
        </section>

        {/* Studio Workspace Dual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Visualizer & Synchronized Lyrics (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Audio Visualizer */}
            <AudioVisualizer
              isPlaying={isPlaying}
              bpm={settings.bpm}
            />

            {/* Synchronized Lyrics Display */}
            <SynchronizedLyrics
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              onSeekToSection={handleSeek}
            />
          </div>

          {/* Right Column: DJ Soundboard Launchpad & Lyria Controls (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Interactive DJ Soundboard */}
            <DJSoundboard />

            {/* Lyria Studio Controls & Master Download */}
            <StudioControls
              settings={settings}
              onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
              onGenerate={handleGenerateLyria}
              isGenerating={isGenerating}
              currentTrack={currentTrack}
              onDownload={handleDownload}
            />
          </div>
        </div>
      </main>

      {/* Fixed Bottom DJ Player Bar */}
      <AudioPlayerBar
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        currentTrack={currentTrack}
        onDownload={handleDownload}
      />
    </div>
  );
}
