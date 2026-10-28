import React, { useEffect, useRef, useState } from 'react';
import { Activity, BarChart3, Disc, Sparkles } from 'lucide-react';
import { mahraganatSynth } from '../audio/mahraganatSynth';

interface AudioVisualizerProps {
  isPlaying: boolean;
  bpm: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying, bpm }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visualMode, setVisualMode] = useState<'bars' | 'wave' | 'circle'>('bars');
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const analyser = mahraganatSynth.getAnalyser();
      const bufferLength = analyser ? analyser.frequencyBinCount : 64;
      const dataArray = new Uint8Array(bufferLength);

      if (analyser && isPlaying) {
        if (visualMode === 'wave') {
          analyser.getByteTimeDomainData(dataArray);
        } else {
          analyser.getByteFrequencyData(dataArray);
        }
      } else {
        // Idle ambient movement when stopped
        phase += 0.04;
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.sin(phase + i * 0.2) * 20 + 25;
        }
      }

      if (visualMode === 'bars') {
        const barWidth = (width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          let barHeight = (dataArray[i] / 255) * (height - 10);
          if (isPlaying && i < 10) {
            // Boost bass frequencies visually
            barHeight = Math.min(height - 4, barHeight * 1.35);
          }

          // Egyptian DJ Neon Gradient: Yellow -> Pink -> Cyan
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#06b6d4');   // Electric Cyan
          gradient.addColorStop(0.5, '#ec4899'); // Hot Magenta
          gradient.addColorStop(1, '#facc15');   // Laser Gold

          ctx.fillStyle = gradient;
          ctx.shadowBlur = isPlaying ? 12 : 3;
          ctx.shadowColor = '#ec4899';

          // Draw rounded bar
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, Math.max(2, barWidth - 2), barHeight, [3, 3, 0, 0]);
          ctx.fill();

          // Peak dot
          if (isPlaying && barHeight > 10) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, height - barHeight - 3, Math.max(2, barWidth - 2), 2);
          }

          x += barWidth;
          if (x > width) break;
        }
      } else if (visualMode === 'wave') {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#facc15';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#facc15';
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
      } else if (visualMode === 'circle') {
        // Circular Bass Radar
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) * 0.45;

        // Base circle
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();

        const numRays = 48;
        for (let i = 0; i < numRays; i++) {
          const angle = (i / numRays) * Math.PI * 2;
          const val = dataArray[i % bufferLength] / 255;
          const rayLen = radius + val * 45;

          const x1 = centerX + Math.cos(angle) * radius;
          const y1 = centerY + Math.sin(angle) * radius;
          const x2 = centerX + Math.cos(angle) * rayLen;
          const y2 = centerY + Math.sin(angle) * rayLen;

          ctx.strokeStyle = i % 2 === 0 ? '#facc15' : '#06b6d4';
          ctx.lineWidth = 2.5;
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#facc15';

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, visualMode]);

  return (
    <div className="relative w-full rounded-2xl bg-[#0e0b1c]/90 border border-pink-500/30 p-4 sm:p-5 backdrop-blur-md shadow-xl overflow-hidden">
      {/* Visualizer Header Bar */}
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-pink-400 animate-pulse" />
          <h3 className="text-sm font-bold tracking-wide text-zinc-200">
            محلل الترددات والإيقاع (Audio Spectrum)
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-950/80 text-pink-300 border border-pink-700/50">
            {bpm} BPM
          </span>
        </div>

        {/* Display Mode Switcher */}
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-lg border border-white/10">
          <button
            type="button"
            onClick={() => setVisualMode('bars')}
            className={`p-1.5 rounded text-xs transition-colors ${
              visualMode === 'bars' ? 'bg-pink-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
            title="أعمدة الترددات"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setVisualMode('wave')}
            className={`p-1.5 rounded text-xs transition-colors ${
              visualMode === 'wave' ? 'bg-pink-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
            title="موجة صوتية"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setVisualMode('circle')}
            className={`p-1.5 rounded text-xs transition-colors ${
              visualMode === 'circle' ? 'bg-pink-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
            title="رادار دائري"
          >
            <Disc className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="relative w-full h-36 sm:h-44 bg-black/60 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
        {/* Grid lines overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1c3015_1px,transparent_1px),linear-gradient(to_bottom,#1f1c3015_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        <canvas
          ref={canvasRef}
          width={640}
          height={180}
          className="w-full h-full object-cover"
        />

        {/* Stereo Peak LED Meter Strips on the sides */}
        <div className="absolute left-3 top-3 bottom-3 flex gap-1 pointer-events-none">
          <div className="flex flex-col-reverse justify-between w-1.5 bg-black/80 rounded-full p-0.5 border border-white/10">
            <span className={`w-full h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400' : 'bg-zinc-800'}`} />
            <span className={`w-full h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400' : 'bg-zinc-800'}`} />
            <span className={`w-full h-1.5 rounded-full ${isPlaying ? 'bg-yellow-400' : 'bg-zinc-800'}`} />
            <span className={`w-full h-1.5 rounded-full ${isPlaying ? 'bg-pink-500' : 'bg-zinc-800'}`} />
            <span className={`w-full h-1.5 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-zinc-800'}`} />
          </div>
          <span className="text-[8px] font-mono text-zinc-500 self-end">L</span>
        </div>

        <div className="absolute right-3 top-3 bottom-3 flex gap-1 pointer-events-none">
          <span className="text-[8px] font-mono text-zinc-500 self-end">R</span>
          <div className="flex flex-col-reverse justify-between w-1.5 bg-black/80 rounded-full p-0.5 border border-white/10">
            <span className={`w-full h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400' : 'bg-zinc-800'}`} />
            <span className={`w-full h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400' : 'bg-zinc-800'}`} />
            <span className={`w-full h-1.5 rounded-full ${isPlaying ? 'bg-yellow-400' : 'bg-zinc-800'}`} />
            <span className={`w-full h-1.5 rounded-full ${isPlaying ? 'bg-pink-500' : 'bg-zinc-800'}`} />
            <span className={`w-full h-1.5 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-zinc-800'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
