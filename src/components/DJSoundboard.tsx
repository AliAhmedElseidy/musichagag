import React, { useState } from 'react';
import { Volume2, Zap, Flame, Radio, BellRing, Sparkles, Disc } from 'lucide-react';
import { mahraganatSynth } from '../audio/mahraganatSynth';

interface SoundPad {
  id: string;
  key: string;
  title: string;
  category: string;
  color: string;
  textColor: string;
  action: () => void;
}

export const DJSoundboard: React.FC = () => {
  const [activePad, setActivePad] = useState<string | null>(null);

  const triggerPad = (id: string, action: () => void) => {
    setActivePad(id);
    action();
    setTimeout(() => {
      setActivePad((prev) => (prev === id ? null : prev));
    }, 200);
  };

  const pads: SoundPad[] = [
    {
      id: 'dum',
      key: '1',
      title: 'دم دربوكة',
      category: 'إيقاع بيز',
      color: 'from-amber-500 to-yellow-600',
      textColor: 'text-yellow-300',
      action: () => {
        mahraganatSynth.playDum();
        mahraganatSynth.playSubBass(55, 0.4);
      },
    },
    {
      id: 'tak',
      key: '2',
      title: 'تك صاجات',
      category: 'إيقاع حاد',
      color: 'from-cyan-500 to-blue-600',
      textColor: 'text-cyan-300',
      action: () => {
        mahraganatSynth.playTak();
      },
    },
    {
      id: 'airhorn',
      key: '3',
      title: 'سارينة دي جي',
      category: 'Airhorn بووو',
      color: 'from-pink-500 to-rose-600',
      textColor: 'text-pink-300',
      action: () => {
        mahraganatSynth.playAirhorn();
      },
    },
    {
      id: 'mizmar',
      key: '4',
      title: 'صولو مزمار',
      category: 'مقام بياتي',
      color: 'from-yellow-400 to-orange-500',
      textColor: 'text-amber-300',
      action: () => {
        mahraganatSynth.playMizmarNote(466, 0.4);
        setTimeout(() => mahraganatSynth.playMizmarNote(392, 0.5), 180);
      },
    },
    {
      id: 'zaghrouta',
      key: '5',
      title: 'زغروطة فرح',
      category: 'أجواء شعبية',
      color: 'from-purple-500 to-pink-600',
      textColor: 'text-purple-300',
      action: () => {
        mahraganatSynth.playZaghrouta();
      },
    },
    {
      id: 'laser',
      key: '6',
      title: 'ليزر شعبي',
      category: 'Laser FX',
      color: 'from-emerald-400 to-teal-600',
      textColor: 'text-emerald-300',
      action: () => {
        mahraganatSynth.playLaserSweep();
      },
    },
    {
      id: 'vocal_haggag',
      key: '7',
      title: 'حَجّاج مَرْسِي',
      category: 'نداء الفرح 👑',
      color: 'from-yellow-500 via-pink-600 to-purple-600',
      textColor: 'text-yellow-200',
      action: () => {
        mahraganatSynth.playAirhorn();
        mahraganatSynth.playVocalChant('حجاج مرسي حجاج.. كبير المجال والسيطرة كلها!');
      },
    },
    {
      id: 'roll',
      key: '8',
      title: 'تقسيمة طبلة',
      category: 'Darbuka Roll',
      color: 'from-red-500 to-orange-600',
      textColor: 'text-orange-300',
      action: () => {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => mahraganatSynth.playTak(), i * 65);
        }
        setTimeout(() => {
          mahraganatSynth.playDum();
          mahraganatSynth.playSubBass(50, 0.4);
        }, 340);
      },
    },
  ];

  return (
    <div className="w-full rounded-2xl bg-[#0c0919]/90 border border-pink-500/30 p-4 sm:p-5 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
          <h3 className="text-sm font-bold text-zinc-200">
            لوحة مؤثرات وتوزيع الدي جي (DJ Launchpad FX)
          </h3>
        </div>
        <span className="text-[10px] text-zinc-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
          اضغط للمشاركة بالعزف الحي
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {pads.map((pad) => {
          const isActive = activePad === pad.id;
          return (
            <button
              key={pad.id}
              type="button"
              onClick={() => triggerPad(pad.id, pad.action)}
              className={`relative overflow-hidden rounded-xl p-3 text-right transition-all duration-150 transform active:scale-95 border ${
                isActive
                  ? 'border-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.6)] scale-[0.98]'
                  : 'border-white/10 hover:border-white/20 bg-black/40 hover:bg-black/60'
              }`}
            >
              {/* Active glow backdrop */}
              <div
                className={`absolute inset-0 bg-gradient-to-tr ${pad.color} transition-opacity ${
                  isActive ? 'opacity-35' : 'opacity-10 hover:opacity-15'
                }`}
              />

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-zinc-400 border border-white/5">
                    {pad.key}
                  </span>
                  <span className="text-[10px] text-zinc-400">{pad.category}</span>
                </div>

                <div className="mt-2">
                  <span className={`block font-black text-sm sm:text-base ${pad.textColor}`}>
                    {pad.title}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
