import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, TestTubes, ArrowRight, ArrowLeft, Check, Sparkles, AlertCircle } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { useSetVoiceScope } from '../../context/VoiceScopeContext';
import { SOIL_PROFILES } from '../../data/agriculturalData';
import type { SoilType } from '../../types';

export const SoilDetails: React.FC = () => {
  const navigate = useNavigate();
  const { farm, updateSoil } = useFarm();

  const [soilType, setSoilType] = useState<SoilType>(farm.soil.soilType || 'Clayey');
  const [ph, setPh] = useState<number>(farm.soil.ph || 6.5);
  const [hasSoilTest, setHasSoilTest] = useState<boolean | null>(
    farm.soil.hasSoilTestResults ?? true
  );
  const [nitrogen, setNitrogen] = useState(farm.soil.nitrogen || 'Optimal');
  const [phosphorus, setPhosphorus] = useState(farm.soil.phosphorus || 'Medium');
  const [potassium, setPotassium] = useState(farm.soil.potassium || 'Optimal');

  // Sync with context if updated via voice assistant
  React.useEffect(() => {
    if (farm.soil?.soilType) {
      setSoilType(farm.soil.soilType);
    }
  }, [farm.soil?.soilType]);

  const selectedSoilProfile =
    SOIL_PROFILES.find((s) => s.type === soilType) || SOIL_PROFILES[0];

  const getPhClassification = (val: number) => {
    if (val < 5.5) return { label: 'Strongly Acidic', color: 'text-amber-600 bg-amber-50' };
    if (val < 6.5) return { label: 'Moderately Acidic', color: 'text-emerald-700 bg-emerald-50' };
    if (val <= 7.5) return { label: 'Neutral (Optimal)', color: 'text-emerald-800 bg-emerald-100' };
    if (val <= 8.5) return { label: 'Moderately Alkaline', color: 'text-blue-700 bg-blue-50' };
    return { label: 'Strongly Alkaline', color: 'text-purple-700 bg-purple-50' };
  };

  const phStatus = getPhClassification(ph);

  const handleContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSoil({
      soilType: soilType,
      ph: ph,
      hasSoilTestResults: hasSoilTest,
      nitrogen: nitrogen,
      phosphorus: phosphorus,
      potassium: potassium,
    });
    navigate('/onboarding/irrigation');
  };

  useSetVoiceScope(
    {
      screen: 'ONBOARDING_SOIL',
      title: 'Soil Details',
      scopeCategory: 'ONBOARDING_FORM',
      allowedActions: ['FILL_FORM', 'NEXT_STEP', 'PREV_STEP'],
      availableFields: [
        {
          name: 'soilType',
          description: 'Soil classification (Clayey, Loamy, Sandy, Alluvial, Red Soil, Black / Regur, Laterite)',
          type: 'select',
          options: ['Clayey', 'Loamy', 'Sandy', 'Alluvial', 'Red Soil', 'Black / Regur', 'Laterite'],
          example: 'Black / Regur',
        },
        { name: 'ph', description: 'Soil pH value (between 4.0 and 9.0)', type: 'number', example: '6.5' },
        { name: 'nitrogen', description: 'Nitrogen level (Low, Medium, Optimal, High)', type: 'select' },
        { name: 'phosphorus', description: 'Phosphorus level (Low, Medium, Optimal, High)', type: 'select' },
        { name: 'potassium', description: 'Potassium level (Low, Medium, Optimal, High)', type: 'select' },
      ],
      sampleCommands: {
        en: ['"Black soil"', '"Soil pH 6.8"', '"Next / Continue"'],
        hi: ['"काली मिट्टी"', '"पीएच 6.8"', '"आगे बढ़ो"'],
      },
      onFieldFill: (field, value) => {
        const k = field.toLowerCase();
        if (k.includes('soil')) {
          const sStr = String(value).toLowerCase();
          let targetSoil: SoilType = 'Clayey';
          if (sStr.includes('loam')) targetSoil = 'Loamy';
          else if (sStr.includes('sand')) targetSoil = 'Sandy';
          else if (sStr.includes('alluvial')) targetSoil = 'Alluvial';
          else if (sStr.includes('black') || sStr.includes('regur')) targetSoil = 'Black / Regur';
          else if (sStr.includes('red')) targetSoil = 'Red Soil';
          else if (sStr.includes('laterite')) targetSoil = 'Laterite';
          setSoilType(targetSoil);
          const prof = SOIL_PROFILES.find((p) => p.type === targetSoil);
          if (prof) setPh(prof.defaultPh);
          return true;
        } else if (k.includes('ph')) {
          const num = typeof value === 'number' ? value : parseFloat(String(value));
          if (!isNaN(num) && num >= 3 && num <= 11) {
            setPh(num);
            return true;
          }
        }
        return false;
      },
      onNextStep: () => {
        handleContinue();
      },
      onPrevStep: () => {
        navigate('/onboarding/crop-details');
      },
    },
    [soilType, ph, hasSoilTest, nitrogen, phosphorus, potassium]
  );

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 animate-in fade-in duration-300">
      {/* Back Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate('/onboarding/crop-details')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Crop Details</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
          Farm setup — Step 4 of 6
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-1">
          Tell us about your soil
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Soil texture and pH dictate fertilizer absorption, water retention, and root vitality.
        </p>
      </div>

      <form onSubmit={handleContinue} className="space-y-6">
        {/* Soil Type */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Soil type
          </label>

          {/* Soil Type Dropdown */}
          <div className="relative">
            <select
              value={soilType}
              onChange={(e) => {
                const newType = e.target.value as SoilType;
                setSoilType(newType);
                const prof = SOIL_PROFILES.find((p) => p.type === newType);
                if (prof) setPh(prof.defaultPh);
              }}
              className="w-full appearance-none pl-4 pr-10 py-3 rounded-2xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm font-semibold outline-none transition-all cursor-pointer shadow-xs"
            >
              {SOIL_PROFILES.map((p) => (
                <option key={p.type} value={p.type}>
                  {p.icon} {p.type} — {p.description.substring(0, 45)}...
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-3.5 text-slate-400 pointer-events-none text-xs">
              ▼
            </div>
          </div>

          {/* Selected Soil Profile Info Card */}
          {selectedSoilProfile && (
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3">
              <span className="text-2xl p-1 bg-white rounded-xl shadow-xs shrink-0">
                {selectedSoilProfile.icon}
              </span>
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-900">
                  {selectedSoilProfile.type} Soil Profile
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {selectedSoilProfile.description}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Retention: {selectedSoilProfile.waterRetention}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    Best for: {selectedSoilProfile.bestFor}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Soil pH */}
        <div className="border-t border-slate-200 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Soil pH
            </label>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${phStatus.color}`}>
              pH {ph.toFixed(1)} · {phStatus.label}
            </span>
          </div>

          {/* pH Range Visual Scale + Numeric Input */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="4.0"
                max="9.0"
                step="0.1"
                value={ph}
                onChange={(e) => setPh(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-gradient-to-r from-red-400 via-emerald-400 to-indigo-500 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="w-20">
                <input
                  type="number"
                  min="3.0"
                  max="11.0"
                  step="0.1"
                  value={ph}
                  onChange={(e) => setPh(parseFloat(e.target.value) || 6.5)}
                  className="w-full text-center py-2 px-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  placeholder="6.5"
                />
              </div>
            </div>

            <div className="flex justify-between text-[11px] font-medium text-slate-400 px-1">
              <span>Acidic (4.0)</span>
              <span className="font-bold text-emerald-700">Optimal (6.0 - 7.0)</span>
              <span>Alkaline (9.0)</span>
            </div>
          </div>
        </div>

        {/* Soil Test Results Toggle */}
        <div className="border-t border-slate-200 pt-5 space-y-3">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Do you know your soil test results?
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setHasSoilTest(true)}
              className={`py-3 px-4 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                hasSoilTest === true
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <span>Yes</span>
              {hasSoilTest === true && <Check className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setHasSoilTest(false)}
              className={`py-3 px-4 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                hasSoilTest === false
                  ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <span>No</span>
              {hasSoilTest === false && <Check className="w-4 h-4" />}
            </button>
          </div>

          {/* Conditional precision nutrient inputs if Yes */}
          {hasSoilTest && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 mt-3 animate-in fade-in">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <TestTubes className="w-4 h-4 text-emerald-600" />
                <span>Primary Soil Nutrients (NPK)</span>
              </span>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nitrogen (N)
                  </label>
                  <select
                    value={nitrogen}
                    onChange={(e) => setNitrogen(e.target.value as any)}
                    className="w-full text-xs font-medium py-1.5 px-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="Optimal">Optimal</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Phosphorus (P)
                  </label>
                  <select
                    value={phosphorus}
                    onChange={(e) => setPhosphorus(e.target.value as any)}
                    className="w-full text-xs font-medium py-1.5 px-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="Optimal">Optimal</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Potassium (K)
                  </label>
                  <select
                    value={potassium}
                    onChange={(e) => setPotassium(e.target.value as any)}
                    className="w-full text-xs font-medium py-1.5 px-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="Optimal">Optimal</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {hasSoilTest === false && (
            <p className="text-xs text-slate-400 italic">
              No problem! AgriNet will use regional soil surveys and Sentinel satellite moisture to estimate your field conditions.
            </p>
          )}
        </div>

        {/* Continue Button */}
        <div className="pt-2">
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
