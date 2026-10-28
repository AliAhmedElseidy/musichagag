import React from 'react';
import { Play, Pause, Loader2, Sparkles, Zap, Flame, Disc3 } from 'lucide-react';

interface GiantPlayButtonProps {
  isPlaying: boolean;
  isGenerating: boolean;
  onTogglePlay: () => void;
  onGenerateLyria: () => void;
  bpm: number;
}

export const GiantPlayButton: React.FC<GiantPlayButtonProps> = ({
  isPlaying,
  isGenerating,
  onTogglePlay,
  bpm,
}) => {
  return (
    <div className="relative flex flex-col items-center justify-center py-6 px-4">
      {/* Background Neon Aura & Strobe Light Cones */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div
          className={`w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl transition-all duration-700 ${
            isPlaying
              ? 'bg-gradient-to-r from-pink-600/35 via-yellow-500/30 to-cyan-500/35 scale-125 animate-pulse'
              : 'bg-pink-600/15 scale-90'
          }`}
        />
      </div>

      {/* Outer Rotating Glowing Ring */}
      <div className="relative group cursor-pointer" onClick={onTogglePlay}>
        <div
          className={`absolute -inset-4 sm:-inset-6 rounded-full transition-all duration-500 opacity-80 ${
            isPlaying
              ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 blur-xl animate-spin'
              : 'bg-gradient-to-r from-pink-600 to-yellow-500 blur-md group-hover:blur-lg'
          }`}
          style={{ animationDuration: isPlaying ? '6s' : '12s' }}
        />

        {/* Second pulsating ripple when playing */}
        {isPlaying && (
          <div className="absolute -inset-8 rounded-full border-2 border-pink-500/40 animate-ping opacity-60 pointer-events-none" />
        )}

        {/* The Giant Main Button */}
        <button
          type="button"
          disabled={isGenerating}
          className={`relative z-10 flex flex-col items-center justify-center text-center rounded-full transition-all duration-300 transform active:scale-95 shadow-2xl ${
            isPlaying
              ? 'w-56 h-56 sm:w-64 sm:h-64 bg-gradient-to-b from-[#240a2b] via-[#150a22] to-[#0d0718] border-4 border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.5)]'
              : 'w-56 h-56 sm:w-64 sm:h-64 bg-gradient-to-b from-[#2b0827] via-[#1a0a22] to-[#0c0515] border-4 border-pink-500/80 shadow-[0_0_40px_rgba(236,72,153,0.4)] group-hover:border-yellow-400 group-hover:shadow-[0_0_55px_rgba(234,179,8,0.6)]'
          }`}
        >
          {/* Inner Turntable Groove Lines */}
          <div className="absolute inset-2 rounded-full border border-pink-500/20 pointer-events-none" />
          <div className="absolute inset-5 rounded-full border border-yellow-400/15 pointer-events-none" />
          <div className="absolute inset-8 rounded-full border border-cyan-400/20 pointer-events-none" />

          {/* Center Play/Pause / Loading Icon */}
          <div className="relative mb-2">
            {isGenerating ? (
              <Loader2 className="w-14 h-14 sm:w-16 sm:h-16 text-yellow-400 animate-spin" />
            ) : isPlaying ? (
              <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-yellow-400 text-black shadow-lg shadow-yellow-400/50">
                <Pause className="w-8 h-8 fill-current text-black" />
              </div>
            ) : (
              <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg shadow-yellow-400/60 group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 fill-current text-black mr-0.5" />
              </div>
            )}
          </div>

          {/* Main Giant Button Text as Requested by User */}
          <span className="font-black text-xl sm:text-2xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-yellow-300 drop-shadow-[0_2px_10px_rgba(250,204,21,0.5)]">
            {isGenerating
              ? 'جاري التوليد...'
              : isPlaying
              ? 'إيقاف المهرجان'
              : 'تشغيل مهرجان حجاج مرسي'}
          </span>

          {/* Subtext info */}
          <div className="mt-1 flex items-center gap-1.5 text-xs text-pink-300 font-bold">
            <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 animate-bounce" />
            <span>{bpm} BPM إلكترو شعبي</span>
          </div>

          <span className="text-[10px] text-zinc-400 mt-0.5">
            {isPlaying ? 'المزيكا شغالة لايف ⚡' : 'دربوكة • مزمار • بيز 808'}
          </span>
        </button>
      </div>

      {/* Helper caption below button */}
      <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400 bg-black/40 border border-white/5 px-4 py-1.5 rounded-full backdrop-blur-sm">
        <Flame className="w-4 h-4 text-orange-400" />
        <span className="font-medium">اضغط للتشغيل المباشر مع استعراض الكلمات والشاشة الإيقاعية</span>
      </div>
    </div>
  );
};
