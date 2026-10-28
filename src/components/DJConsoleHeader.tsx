import React from 'react';
import { Sparkles, Disc, Flame, Volume2, Radio } from 'lucide-react';

interface DJConsoleHeaderProps {
  bpm: number;
  isPlaying: boolean;
  model: string;
}

export const DJConsoleHeader: React.FC<DJConsoleHeaderProps> = ({ bpm, isPlaying, model }) => {
  return (
    <header className="relative w-full border-b border-pink-500/30 bg-[#0d0b18]/90 backdrop-blur-md px-4 py-3 sm:px-6 z-20">
      {/* Top DJ Neon Strip */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 animate-pulse" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Studio Branding */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-600 via-purple-700 to-yellow-500 p-[2px] shadow-lg shadow-pink-500/20">
            <div className="w-full h-full bg-[#120f24] rounded-[10px] flex items-center justify-center">
              <Disc className={`w-7 h-7 text-yellow-400 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            </div>
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300">
                مهرجان حَجّاج مَرْسِي حَجّاج
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 font-mono font-bold">
                PRO DJ
              </span>
            </div>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <span>استوديو إلكترو-شعبي مصري</span>
              <span className="text-zinc-600">•</span>
              <span className="text-yellow-400 font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 inline" />
                مدعوم بمحرك Lyria الموسيقي
              </span>
            </p>
          </div>
        </div>

        {/* LED Dashboard Status Indicators */}
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-center md:justify-end">
          {/* BPM Digital Clock Display */}
          <div className="flex items-center gap-2 bg-black/60 border border-cyan-500/30 rounded-lg px-3 py-1.5 shadow-[inset_0_0_12px_rgba(6,182,212,0.15)]">
            <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400">TEMPO</span>
            <span className="text-lg font-black font-['Orbitron',sans-serif] text-cyan-300 tabular-nums">
              {bpm} <span className="text-xs font-normal text-cyan-500">BPM</span>
            </span>
          </div>

          {/* Model Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 bg-black/60 border border-yellow-500/30 rounded-lg px-3 py-1.5 shadow-[inset_0_0_12px_rgba(234,179,8,0.1)]">
            <Radio className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            <span className="text-xs font-mono font-medium text-yellow-300">
              {model === 'lyria-3-pro-preview' ? 'Lyria Pro (Full)' : 'Lyria 3 (Clip)'}
            </span>
          </div>

          {/* Master Live Audio Indicator */}
          <div className="flex items-center gap-2 bg-black/60 border border-pink-500/30 rounded-lg px-3 py-1.5">
            <span className="text-[10px] font-mono text-zinc-400">ON AIR</span>
            <div className="flex items-end gap-0.5 h-4 w-6">
              <span className={`w-1 rounded-sm bg-pink-500 transition-all ${isPlaying ? 'h-3 animate-pulse' : 'h-1 opacity-40'}`} />
              <span className={`w-1 rounded-sm bg-yellow-400 transition-all ${isPlaying ? 'h-4 animate-pulse' : 'h-1.5 opacity-40'}`} />
              <span className={`w-1 rounded-sm bg-cyan-400 transition-all ${isPlaying ? 'h-2.5 animate-pulse' : 'h-1 opacity-40'}`} />
              <span className={`w-1 rounded-sm bg-emerald-400 transition-all ${isPlaying ? 'h-3.5 animate-pulse' : 'h-1.5 opacity-40'}`} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
