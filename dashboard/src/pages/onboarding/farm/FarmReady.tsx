import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Sparkles, MapPin, CloudSun, Sprout, Cpu, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFarm } from '@/context/FarmContext';
import { useSetVoiceScope } from '@/context/VoiceScopeContext';

export const FarmReady: React.FC = () => {
  const navigate = useNavigate();
  const { farm, updateFarm } = useFarm();
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  useEffect(() => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#059669', '#34d399', '#f59e0b', '#3b82f6'],
      });
    } catch {
      // ignore
    }

    // Animate checkmarks sequentially
    const t1 = setTimeout(() => setCheckedItems((prev) => [...prev, 1]), 300);
    const t2 = setTimeout(() => setCheckedItems((prev) => [...prev, 2]), 700);
    const t3 = setTimeout(() => setCheckedItems((prev) => [...prev, 3]), 1100);
    const t4 = setTimeout(() => setCheckedItems((prev) => [...prev, 4]), 1500);

    updateFarm({ isReady: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  useSetVoiceScope(
    {
      screen: 'ONBOARDING_READY',
      title: 'Farm Setup Ready',
      scopeCategory: 'ONBOARDING_FORM',
      allowedActions: ['NEXT_STEP', 'NAVIGATE'],
      availableFields: [],
      sampleCommands: {
        en: ['"Continue to dashboard"', '"Open Dashboard"'],
        hi: ['"डैशबोर्ड पर जाएं"', '"डैशबोर्ड खोलो"'],
      },
      onNextStep: () => {
        handleGoToDashboard();
      },
    },
    []
  );

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/80 text-center animate-in fade-in zoom-in-95 duration-500 max-w-lg mx-auto">
      {/* Celebration Icon */}
      <div className="relative inline-block mx-auto mb-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-600/30 animate-bounce">
          <span className="text-3xl">🌱</span>
        </div>
        <div className="absolute -top-2 -right-2 p-1.5 bg-amber-400 text-slate-900 rounded-full shadow-md animate-spin-slow">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* Headline */}
      <div className="space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
          <PartyPopper className="w-3.5 h-3.5" />
          <span>Setup Complete</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          Your Farm Is Ready 🌱
        </h1>
        <p className="text-sm text-slate-500">
          All systems are calibrated. Your personalized farm intelligence cockpit is live.
        </p>
      </div>

      {/* Checklist Card */}
      <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200/90 text-left space-y-4 mb-8">
        {/* Item 1: Location */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${checkedItems.includes(1)
                ? 'bg-emerald-600 text-white scale-110'
                : 'bg-slate-200 text-slate-400 scale-90'
              }`}
          >
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-bold text-slate-900 block">
              ✓ Location connected
            </span>
            <span className="text-xs text-slate-500">
              {farm.location.name || 'Ernakulam'}, {farm.location.state || 'Kerala'} · {farm.size || '2.0'} {farm.sizeUnit || 'hectares'}
            </span>
          </div>
        </div>

        {/* Item 2: Weather */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${checkedItems.includes(2)
                ? 'bg-emerald-600 text-white scale-110'
                : 'bg-slate-200 text-slate-400 scale-90'
              }`}
          >
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-bold text-slate-900 block">
              ✓ Weather intelligence enabled
            </span>
            <span className="text-xs text-slate-500">
              Hyper-local radar sync · Rainfall alerts active
            </span>
          </div>
        </div>

        {/* Item 3: Crop profile */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${checkedItems.includes(3)
                ? 'bg-emerald-600 text-white scale-110'
                : 'bg-slate-200 text-slate-400 scale-90'
              }`}
          >
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-bold text-slate-900 block">
              ✓ Crop profile created
            </span>
            <span className="text-xs text-slate-500">
              {farm.crop.cropName || 'Rice'} ({farm.crop.variety || 'Jyothi'}) · {farm.crop.growthStage || 'Tillering & Vegetative'}
            </span>
          </div>
        </div>

        {/* Item 4: Advisory */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${checkedItems.includes(4)
                ? 'bg-emerald-600 text-white scale-110'
                : 'bg-slate-200 text-slate-400 scale-90'
              }`}
          >
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-bold text-slate-900 block">
              ✓ Advisory engine ready
            </span>
            <span className="text-xs text-slate-500">
              Sentinel-2 NDVI & Soil nutrient models calibrated
            </span>
          </div>
        </div>
      </div>

      {/* Continue CTA */}
      <div>
        <button
          type="button"
          onClick={handleGoToDashboard}
          className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-lg shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all hover:scale-102 cursor-pointer group"
        >
          <span>Continue to dashboard</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
