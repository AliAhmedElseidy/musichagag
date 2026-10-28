import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check, Mic2, Music, Sparkles, Volume2, Crown } from 'lucide-react';
import { OFFICIAL_SECTIONS, OFFICIAL_LYRICS_TEXT } from '../data/mahraganLyrics';

interface SynchronizedLyricsProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeekToSection?: (startTime: number) => void;
}

export const SynchronizedLyrics: React.FC<SynchronizedLyricsProps> = ({
  currentTime,
  duration,
  isPlaying,
  onSeekToSection,
}) => {
  const [copied, setCopied] = useState(false);
  const activeSectionRef = useRef<HTMLDivElement | null>(null);

  // Determine active section based on current playback time
  const activeSection = OFFICIAL_SECTIONS.find(
    (sec) => currentTime >= sec.startTime && currentTime < sec.endTime
  ) || (currentTime >= 50 ? OFFICIAL_SECTIONS[OFFICIAL_SECTIONS.length - 1] : OFFICIAL_SECTIONS[0]);

  // Copy lyrics to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(OFFICIAL_LYRICS_TEXT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  // Scroll active section smoothly into view when section changes
  useEffect(() => {
    if (isPlaying && activeSectionRef.current) {
      activeSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeSection?.id, isPlaying]);

  return (
    <div className="relative w-full rounded-2xl bg-[#0c0919]/90 border border-yellow-500/30 p-4 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col h-[520px]">
      {/* Header with Title and Copy Button */}
      <div className="flex items-center justify-between pb-3 border-b border-yellow-500/20 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/40 flex items-center justify-center text-yellow-400">
            <Mic2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-amber-200">
              كلمات مهرجان حجاج مرسي حجاج
            </h3>
            <p className="text-[11px] text-zinc-400">
              متزامنة ومضبوطة على التوزيع الموسيقي لايف
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">تم النسخ</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-yellow-400" />
              <span>نسخ الكلمات</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Bar of Lyrics */}
      <div className="flex items-center gap-1 mb-3">
        {OFFICIAL_SECTIONS.map((sec) => {
          const isActive = activeSection?.id === sec.id;
          const isPassed = currentTime >= sec.endTime;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onSeekToSection && onSeekToSection(sec.startTime)}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-yellow-400 shadow-[0_0_10px_#facc15]'
                  : isPassed
                  ? 'bg-pink-500/70'
                  : 'bg-zinc-800'
              }`}
              title={`${sec.tagArabic} (${sec.startTime}s)`}
            />
          );
        })}
      </div>

      {/* Scrollable Synchronized Lyrics Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pl-1 scrollbar-thin scrollbar-thumb-pink-600/50 scrollbar-track-transparent">
        {OFFICIAL_SECTIONS.map((sec) => {
          const isActive = activeSection?.id === sec.id;
          const isChorus = sec.id === 'chorus';

          return (
            <div
              key={sec.id}
              ref={isActive ? activeSectionRef : null}
              onClick={() => onSeekToSection && onSeekToSection(sec.startTime)}
              className={`cursor-pointer rounded-xl p-4 transition-all duration-300 border ${
                isActive
                  ? isChorus
                    ? 'bg-gradient-to-r from-yellow-500/20 via-pink-600/20 to-purple-600/20 border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.3)] scale-[1.02]'
                    : 'bg-pink-950/30 border-pink-500/80 shadow-[0_0_20px_rgba(236,72,153,0.25)] scale-[1.01]'
                  : 'bg-black/30 border-white/5 opacity-65 hover:opacity-90 hover:bg-black/50'
              }`}
            >
              {/* Section Header Tag */}
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                  {isChorus && <Crown className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                  <span
                    className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-yellow-400 text-black font-black'
                        : 'bg-white/10 text-zinc-300'
                    }`}
                  >
                    {sec.tag}
                  </span>
                  <span className="text-xs font-bold text-zinc-300">
                    {sec.tagArabic}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                  {isActive && isPlaying && (
                    <span className="inline-flex items-center gap-1 text-yellow-400 font-bold animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      يُغنى الآن
                    </span>
                  )}
                  <span>{sec.startTime}ث</span>
                </div>
              </div>

              {/* Lyrics Lines */}
              <div className="space-y-2">
                {sec.lines.map((line, idx) => {
                  const isHaggagLine = line.includes('حَجّاج') || line.includes('حجاج');
                  return (
                    <p
                      key={idx}
                      className={`text-base sm:text-lg leading-relaxed transition-colors ${
                        isActive
                          ? isHaggagLine
                            ? 'font-black text-yellow-300 drop-shadow-[0_2px_8px_rgba(250,204,21,0.6)]'
                            : 'font-bold text-white'
                          : 'text-zinc-400 font-medium'
                      }`}
                    >
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
