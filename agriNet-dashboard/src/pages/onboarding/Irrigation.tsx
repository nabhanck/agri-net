import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { useSetVoiceScope } from '../../context/VoiceScopeContext';
import { IRRIGATION_OPTIONS } from '../../data/agriculturalData';
import type { IrrigationType } from '../../types';

export const Irrigation: React.FC = () => {
  const navigate = useNavigate();
  const { farm, updateFarm } = useFarm();

  const [selectedIrrigation, setSelectedIrrigation] = useState<IrrigationType>(
    farm.irrigation || 'Rainfed'
  );

  // Sync with context if updated via voice assistant
  React.useEffect(() => {
    if (farm.irrigation) {
      setSelectedIrrigation(farm.irrigation);
    }
  }, [farm.irrigation]);

  const handleContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateFarm({
      irrigation: selectedIrrigation,
    });
    navigate('/onboarding/practice');
  };

  useSetVoiceScope(
    {
      screen: 'ONBOARDING_IRRIGATION',
      title: 'Irrigation Method',
      scopeCategory: 'ONBOARDING_FORM',
      allowedActions: ['FILL_FORM', 'NEXT_STEP', 'PREV_STEP'],
      availableFields: [
        {
          name: 'irrigation',
          description: 'Water source / system (Rainfed, Canal, Borewell, Drip, Sprinkler, Other)',
          type: 'select',
          options: ['Rainfed', 'Canal', 'Borewell', 'Drip', 'Sprinkler', 'Other'],
          example: 'Drip',
        },
      ],
      sampleCommands: {
        en: ['"Drip irrigation"', '"Rainfed"', '"Next / Continue"'],
        hi: ['"ड्रिप सिंचाई"', '"वर्षा आधारित"', '"आगे बढ़ो"'],
      },
      onFieldFill: (_field, value) => {
        const irrStr = String(value).toLowerCase();
        let targetIrr: IrrigationType = 'Rainfed';
        if (irrStr.includes('drip')) targetIrr = 'Drip';
        else if (irrStr.includes('sprinkler')) targetIrr = 'Sprinkler';
        else if (irrStr.includes('canal')) targetIrr = 'Canal';
        else if (irrStr.includes('bore')) targetIrr = 'Borewell';
        setSelectedIrrigation(targetIrr);
        updateFarm({ irrigation: targetIrr });
        return true;
      },
      onNextStep: () => {
        handleContinue();
      },
      onPrevStep: () => {
        navigate('/onboarding/soil');
      },
    },
    [selectedIrrigation]
  );

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 animate-in fade-in duration-300">
      {/* Back Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate('/onboarding/soil')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Soil</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
          Farm setup — Step 5 of 6
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-1">
          How is your farm irrigated?
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Your watering source helps us calculate evapotranspiration rates and soil moisture deficit warnings.
        </p>
      </div>

      <form onSubmit={handleContinue} className="space-y-4">
        {/* Irrigation Options Radio List */}
        <div className="space-y-3">
          {IRRIGATION_OPTIONS.map((opt) => {
            const isSelected = selectedIrrigation === opt.type;
            return (
              <label
                key={opt.type}
                onClick={() => setSelectedIrrigation(opt.type)}
                className={`relative p-4 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Radio Icon Circle */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  {/* Icon */}
                  <span className="text-2xl shrink-0">{opt.icon}</span>

                  {/* Title & description */}
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {opt.title}
                    </span>
                    <span className="text-xs text-slate-500 leading-snug">
                      {opt.description}
                    </span>
                  </div>
                </div>

                {/* Efficiency Badge */}
                <div className="shrink-0 text-right">
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    {opt.efficiency}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
