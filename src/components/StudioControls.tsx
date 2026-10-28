import React, { useState } from 'react';
import { Download, Sliders, Sparkles, RefreshCw, Music2, Check, FileAudio, Settings2 } from 'lucide-react';
import { GeneratedTrack, StudioSettings } from '../types/mahragan';
import { LyriaService } from '../services/lyriaService';

interface StudioControlsProps {
  settings: StudioSettings;
  onUpdateSettings: (newSettings: Partial<StudioSettings>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  currentTrack: GeneratedTrack | null;
  onDownload: () => void;
}

export const StudioControls: React.FC<StudioControlsProps> = ({
  settings,
  onUpdateSettings,
  onGenerate,
  isGenerating,
  currentTrack,
  onDownload,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="w-full rounded-2xl bg-[#0c0919]/90 border border-cyan-500/30 p-4 sm:p-6 backdrop-blur-md shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-base font-bold text-zinc-200">
            إعدادات استوديو التوليد (Lyria Music Settings)
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>{showAdvanced ? 'إخفاء الخيارات' : 'خيارات متقدمة'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model Switcher */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            محرك الذكاء الاصطناعي (Lyria Model)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onUpdateSettings({ model: 'lyria-3-clip-preview' })}
              className={`p-2.5 rounded-xl border text-right transition-all ${
                settings.model === 'lyria-3-clip-preview'
                  ? 'bg-gradient-to-r from-pink-600/30 to-purple-600/30 border-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                  : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <span className="block text-xs font-bold text-pink-300">Lyria 3 Clip</span>
              <span className="block text-[10px] text-zinc-400 mt-0.5">مقطع سريع حماسي (30 ثانية)</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateSettings({ model: 'lyria-3-pro-preview' })}
              className={`p-2.5 rounded-xl border text-right transition-all ${
                settings.model === 'lyria-3-pro-preview'
                  ? 'bg-gradient-to-r from-yellow-500/30 to-amber-600/30 border-yellow-400 text-white shadow-[0_0_15px_rgba(250,204,21,0.3)]'
                  : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <span className="block text-xs font-bold text-yellow-300">Lyria 3 Pro</span>
              <span className="block text-[10px] text-zinc-400 mt-0.5">تراك كامل بمقاطع متعددة</span>
            </button>
          </div>
        </div>

        {/* BPM Slider */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1.5">
            <span>سرعة الإيقاع الشعبي (Tempo)</span>
            <span className="font-mono text-cyan-400 font-bold">{settings.bpm} BPM</span>
          </div>
          <input
            type="range"
            min={118}
            max={135}
            step={1}
            value={settings.bpm}
            onChange={(e) => onUpdateSettings({ bpm: parseInt(e.target.value, 10) })}
            className="w-full accent-cyan-400 h-2 bg-black/50 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
            <span>118 (هادئ نسبي)</span>
            <span className="text-yellow-400 font-bold">125 (الإيقاع المثالي)</span>
            <span>135 (مولع نار)</span>
          </div>
        </div>
      </div>

      {/* Advanced Sound Controls */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">صاحب المهرجان والإهداء</label>
            <input
              type="text"
              value={settings.singerName}
              onChange={(e) => onUpdateSettings({ singerName: e.target.value })}
              className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
              placeholder="حجاج مرسي حجاج"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
              <span>قوة المزمار البلدي</span>
              <span className="text-yellow-400">{Math.round(settings.mizmarVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={1.0}
              step={0.1}
              value={settings.mizmarVolume}
              onChange={(e) => onUpdateSettings({ mizmarVolume: parseFloat(e.target.value) })}
              className="w-full accent-yellow-400 h-1.5 bg-black/50 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
              <span>دربوكة وبيز 808</span>
              <span className="text-pink-400">{Math.round(settings.darbukaVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={1.0}
              step={0.1}
              value={settings.darbukaVolume}
              onChange={(e) => onUpdateSettings({ darbukaVolume: parseFloat(e.target.value) })}
              className="w-full accent-pink-500 h-1.5 bg-black/50 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Action Buttons: Generate & Download */}
      <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Re-generate button */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-pink-600/30 transition-all transform active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'جاري التوليد بـ Lyria...' : 'توليد تراك جديد بالذكاء الاصطناعي'}</span>
        </button>

        {/* Big Download Button */}
        <button
          type="button"
          onClick={onDownload}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs sm:text-sm shadow-xl shadow-yellow-400/25 transition-all transform active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4 text-black stroke-[2.5]" />
          <span>تحميل المهرجان (WAV Master)</span>
          <span className="text-[10px] font-mono font-bold bg-black/15 px-1.5 py-0.5 rounded">
            HQ 16-BIT
          </span>
        </button>
      </div>
    </div>
  );
};
