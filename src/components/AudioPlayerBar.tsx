import React from 'react';
import { Play, Pause, Volume2, VolumeX, Download, RotateCcw, Disc3, Sparkles } from 'lucide-react';
import { GeneratedTrack } from '../types/mahragan';

interface AudioPlayerBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  currentTrack: GeneratedTrack | null;
  onDownload: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  currentTrack,
  onDownload,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0919]/95 border-t border-pink-500/30 backdrop-blur-xl px-4 py-2.5 sm:px-6 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      {/* Top micro progress seeker */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-black/60 cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickPos = (e.clientX - rect.left) / rect.width;
          onSeek(clickPos * duration);
        }}
      >
        <div
          className="h-full bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 relative transition-all duration-100"
          style={{ width: `${percent}%` }}
        >
          <div className="absolute right-0 -top-1 w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Track Info with Spinning Vinyl */}
        <div className="flex items-center gap-3 min-w-0 max-w-[45%] sm:max-w-sm">
          <div className="relative w-10 h-10 rounded-full bg-black flex-shrink-0 flex items-center justify-center border border-pink-500/50 shadow-md">
            <Disc3
              className={`w-6 h-6 text-yellow-400 ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '4s' }}
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-black text-white truncate">
              {currentTrack?.title || 'مهرجان حجاج مرسي حجاج - ملوك السيطرة'}
            </h4>
            <p className="text-[10px] text-pink-400 flex items-center gap-1 truncate font-medium">
              <Sparkles className="w-3 h-3 inline text-yellow-400" />
              <span>إلكترو شعبي • دربوكة ومزمار بلدي</span>
            </p>
          </div>
        </div>

        {/* Center Controls & Time */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onTogglePlay}
            className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:scale-105 transition-transform shadow-lg shadow-yellow-400/40"
            title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current mr-0.5" />
            )}
          </button>

          <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-zinc-400">
            <span className="text-yellow-400 font-bold">{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Download Actions */}
        <div className="flex items-center gap-3">
          {/* Volume Control */}
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => onVolumeChange(volume > 0 ? 0 : 0.85)}
              className="text-zinc-400 hover:text-white"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-cyan-400 h-1.5 bg-black/60 rounded-lg cursor-pointer"
            />
          </div>

          {/* Quick Download Button */}
          <button
            type="button"
            onClick={onDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 text-xs font-bold text-yellow-300 transition-colors"
            title="تحميل المهرجان بصيغة WAV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تحميل WAV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
