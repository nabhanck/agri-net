import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Sprout, ArrowRight, ArrowLeft, Check, Sparkles, Clock, ChevronDown, Loader2 } from 'lucide-react';
import { useFarm } from '../../../context/FarmContext';
import { useSetVoiceScope } from '../../../context/VoiceScopeContext';
import { POPULAR_CROPS } from '../../../data/agriculturalData';
import { getCropGrowthStages } from './api';
import type { GrowthStageEntity } from '@/types/farm';
import { CropIcon } from '@/utils/helpers';

const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Calculate calendar days since planting
const calculateDays = (dateStr: string): number => {
  if (!dateStr) return 0;
  try {
    const pDate = new Date(dateStr);
    if (isNaN(pDate.getTime())) return 0;

    const now = new Date();
    // Use UTC midnight timestamps to accurately calculate whole calendar days
    const utcPlanting = Date.UTC(pDate.getUTCFullYear(), pDate.getUTCMonth(), pDate.getUTCDate());
    const utcToday = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = utcToday - utcPlanting;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? 0 : diffDays;
  } catch {
    return 0;
  }
};

const getAutoStageForDays = (
  stages: GrowthStageEntity[],
  days: number
): GrowthStageEntity | null => {
  if (!stages || stages.length === 0) return null;
  const sorted = [...stages].sort((a, b) => (a.stage_order ?? 0) - (b.stage_order ?? 0));
  if (days <= 0) return sorted[0];

  let cumulative = 0;
  for (const st of sorted) {
    const duration = Math.max(0, Number(st.duration_days) || 0);
    cumulative += duration;
    if (days <= cumulative) {
      return st;
    }
  }
  return sorted[sorted.length - 1];
};

export const CropDetails: React.FC = () => {
  const navigate = useNavigate();
  const { farm, updateCrop } = useFarm();
  const todayStr = getTodayDateString();

  const activeCropInfo =
    POPULAR_CROPS.find(
      (c) => c.id === farm.crop.cropId || c.name.toLowerCase() === (farm.crop.cropName || '').toLowerCase()
    ) || POPULAR_CROPS[0];

  const [growthStages, setGrowthStages] = useState<GrowthStageEntity[]>([]);
  const [isLoadingStages, setIsLoadingStages] = useState<boolean>(false);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(farm.crop.growthStageId || null);

  const [selectedVariety, setSelectedVariety] = useState<string>(farm.crop.variety || 'Jyothi');
  const [customVariety, setCustomVariety] = useState<string>(farm.crop.customVariety || '');

  // Clamp initial date so future dates are never loaded
  const [plantingDate, setPlantingDate] = useState<string>(() => {
    if (farm.crop.plantingDate && farm.crop.plantingDate <= todayStr) {
      return farm.crop.plantingDate;
    }
    // Default to 15 days ago or today if no valid past date
    const d = new Date();
    d.setDate(d.getDate() - 15);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const defaultPast = `${y}-${m}-${day}`;
    return defaultPast <= todayStr ? defaultPast : todayStr;
  });

  const [growthStage, setGrowthStage] = useState<string>(farm.crop.growthStage || '');

  // Sync with context if updated via voice assistant
  useEffect(() => {
    if (farm.crop?.variety) {
      setSelectedVariety(farm.crop.variety);
    }
  }, [farm.crop?.variety]);

  const daysSincePlanting = calculateDays(plantingDate);

  // Fetch growth stages from backend based on selected crop ID
  useEffect(() => {
    let isCancelled = false;

    const fetchStages = async () => {
      let cropIdNum = Number(farm.crop.cropId);
      if (isNaN(cropIdNum) || cropIdNum <= 0) {
        // Fallback to crop id 1 (Rice) if cropId is non-numeric
        cropIdNum = 1;
      }

      setIsLoadingStages(true);
      try {
        const res = await getCropGrowthStages(cropIdNum);
        if (isCancelled) return;

        let stages: GrowthStageEntity[] = [];
        if (res?.data && res.data.length > 0) {
          stages = [...res.data].sort((a, b) => (a.stage_order ?? 0) - (b.stage_order ?? 0));
        } else {
          stages = activeCropInfo.growthStages.map((st, idx) => ({
            id: idx + 1,
            crop_id: cropIdNum,
            stage_name: st.stage,
            stage_order: idx + 1,
            duration_days: st.durationDays,
            description: st.description,
          }));
        }

        setGrowthStages(stages);

        // Auto-calculate suggested stage based on planting days
        const auto = getAutoStageForDays(stages, daysSincePlanting);
        if (auto) {
          setGrowthStage(auto.stage_name || '');
          setSelectedStageId(auto.id);
        }
      } catch (error) {
        if (isCancelled) return;
        console.error('Error fetching crop growth stages:', error);
        const fallbackStages: GrowthStageEntity[] = activeCropInfo.growthStages.map((st, idx) => ({
          id: idx + 1,
          crop_id: cropIdNum,
          stage_name: st.stage,
          stage_order: idx + 1,
          duration_days: st.durationDays,
          description: st.description,
        }));
        setGrowthStages(fallbackStages);
        const auto = getAutoStageForDays(fallbackStages, daysSincePlanting);
        if (auto) {
          setGrowthStage(auto.stage_name || '');
          setSelectedStageId(auto.id);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingStages(false);
        }
      }
    };

    fetchStages();

    return () => {
      isCancelled = true;
    };
  }, [farm.crop.cropId, farm.crop.cropName]);

  // Recalculate auto growth stage whenever planting date or growth stages change
  useEffect(() => {
    if (growthStages.length > 0 && plantingDate) {
      const auto = getAutoStageForDays(growthStages, daysSincePlanting);
      if (auto) {
        setGrowthStage(auto.stage_name || '');
        setSelectedStageId(auto.id);
      }
    }
  }, [plantingDate, daysSincePlanting, growthStages]);

  const handlePlantingDateChange = (dateVal: string) => {
    // Prevent future date selection
    if (dateVal && dateVal > todayStr) {
      dateVal = todayStr;
    }
    setPlantingDate(dateVal);
  };

  const handleVarietyPick = (v: string) => {
    setSelectedVariety(v);
  };

  const handleStageSelect = (stageItem: GrowthStageEntity) => {
    setGrowthStage(stageItem.stage_name || '');
    setSelectedStageId(stageItem.id);
  };

  const handleContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const totalCycleDays = growthStages.reduce((sum, s) => sum + (s.duration_days || 0), 0) || 120;
    const progress = Math.min(100, Math.max(5, Math.round((daysSincePlanting / totalCycleDays) * 100)));

    updateCrop({
      variety: selectedVariety === 'Other' && customVariety ? customVariety : selectedVariety,
      customVariety: customVariety,
      plantingDate: plantingDate,
      growthStage: growthStage,
      growthStageId: selectedStageId ?? undefined,
      daysSincePlanting: daysSincePlanting,
      growthStageProgress: progress,
    });
    navigate('/onboarding/soil');
  };

  const displayCropName = farm.crop.cropName || activeCropInfo.name || 'Rice';
  const cropSlug = farm.crop.cropId && isNaN(Number(farm.crop.cropId)) ? farm.crop.cropId : displayCropName.toLowerCase();
  const autoCalculatedStage = getAutoStageForDays(growthStages, daysSincePlanting);

  useSetVoiceScope(
    {
      screen: 'ONBOARDING_CROP_DETAILS',
      title: 'Crop Details',
      scopeCategory: 'ONBOARDING_FORM',
      allowedActions: ['FILL_FORM', 'NEXT_STEP', 'PREV_STEP'],
      availableFields: [
        {
          name: 'variety',
          description: `Variety of ${displayCropName} (${activeCropInfo.popularVarieties.join(', ')})`,
          type: 'select',
          options: activeCropInfo.popularVarieties,
          example: activeCropInfo.popularVarieties[0] || 'Jyothi',
        },
        { name: 'plantingDate', description: 'Date of sowing or transplantation (YYYY-MM-DD)', type: 'string', example: '2026-08-10' },
        {
          name: 'growthStage',
          description: 'Crop growth stage',
          type: 'select',
          options: growthStages.map((s) => s.stage_name || ''),
        },
      ],
      sampleCommands: {
        en: [`"Variety ${activeCropInfo.popularVarieties[0] || 'Jyothi'}"`, '"Stage Tillering"', '"Next / Continue"'],
        hi: [`"किस्म ${activeCropInfo.popularVarieties[0] || 'Jyothi'}"`, '"स्टेज टिलरिंग"', '"आगे बढ़ो"'],
      },
      onFieldFill: (field, value) => {
        const k = field.toLowerCase();
        if (k.includes('variety')) {
          const vStr = String(value).trim();
          setSelectedVariety(vStr);
          return true;
        } else if (k.includes('date')) {
          const vStr = String(value).trim();
          handlePlantingDateChange(vStr);
          return true;
        } else if (k.includes('stage')) {
          const stStr = String(value).toLowerCase();
          const matched = growthStages.find((s) => (s.stage_name || '').toLowerCase().includes(stStr));
          if (matched) {
            handleStageSelect(matched);
            return true;
          }
        }
        return false;
      },
      onNextStep: () => {
        handleContinue();
      },
      onPrevStep: () => {
        navigate('/onboarding/crop-selection');
      },
    },
    [selectedVariety, customVariety, plantingDate, growthStage, daysSincePlanting, activeCropInfo, growthStages]
  );

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 animate-in fade-in duration-300">
      {/* Back Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate('/onboarding/crop-selection')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Crop Selection</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
          Farm setup — Step 3 of 6
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-1 flex items-center gap-2">
          <span>{CropIcon(cropSlug)}</span>
          <span>{displayCropName} details</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Specify variety, sowing date, and development stage for precise advisory schedules.
        </p>
      </div>

      <form onSubmit={handleContinue} className="space-y-6">
        {/* Variety Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              {displayCropName} variety
            </label>
            <span className="text-xs text-emerald-700 font-semibold">
              Selected: {selectedVariety}
            </span>
          </div>

          {/* Select Dropdown */}
          <div className="relative">
            <select
              value={selectedVariety}
              onChange={(e) => setSelectedVariety(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-3 rounded-2xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm font-semibold outline-none transition-all cursor-pointer shadow-xs"
            >
              {activeCropInfo.popularVarieties.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-3 text-slate-400 pointer-events-none text-xs" />
          </div>

          {/* Popular Quick Select Pills */}
          <div className="pt-1">
            <span className="text-xs font-semibold text-slate-500 block mb-2">
              Popular for this region:
            </span>
            <div className="flex flex-wrap gap-2">
              {activeCropInfo.popularVarieties.map((v) => {
                const isActive = selectedVariety === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleVarietyPick(v)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                  >
                    <span>• {v}</span>
                    {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom variety input if "Other" is chosen */}
          {selectedVariety === 'Other' && (
            <div className="pt-2">
              <input
                type="text"
                value={customVariety}
                onChange={(e) => setCustomVariety(e.target.value)}
                placeholder="Enter custom variety name..."
                className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/30 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>
          )}
        </div>

        {/* Planting Date */}
        <div className="border-t border-slate-200 pt-5 space-y-3">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Planting date
          </label>
          <p className="text-xs text-slate-500 -mt-1">
            When did you plant this crop? (Future dates are disabled)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div className="relative">
              <input
                type="date"
                required
                max={todayStr}
                value={plantingDate}
                onChange={(e) => handlePlantingDateChange(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm font-semibold outline-none transition-all shadow-xs cursor-pointer"
              />
              <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>

            {/* Days since planting display badge */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider block">
                  Crop Age
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {daysSincePlanting === 0
                    ? 'Planted today (Day 0)'
                    : daysSincePlanting === 1
                    ? '1 day in field'
                    : `${daysSincePlanting} days in field`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Stage Selector */}
        <div className="border-t border-slate-200 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Growth stage
            </label>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Auto-calculated from sowing date
            </span>
          </div>

          {/* Growth Stages Timeline Selector */}
          {isLoadingStages ? (
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-xs font-semibold">Loading growth stages for {displayCropName}...</span>
            </div>
          ) : growthStages.length === 0 ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
              <Sprout className="w-6 h-6 mx-auto mb-1 text-slate-400" />
              No growth stages found for this crop.
            </div>
          ) : (
            <div className="space-y-2">
              {growthStages.map((stageItem, index) => {
                const isSelected =
                  (selectedStageId && stageItem.id === selectedStageId) ||
                  growthStage === stageItem.stage_name;
                const isAuto = autoCalculatedStage && (autoCalculatedStage.id === stageItem.id || autoCalculatedStage.stage_name === stageItem.stage_name);

                return (
                  <div
                    key={stageItem.id ?? index}
                    onClick={() => handleStageSelect(stageItem)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                          }`}
                      >
                        {stageItem.stage_order ?? index + 1}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">
                          {stageItem.stage_name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {stageItem.description || 'Development phase'}
                          {stageItem.duration_days ? ` (~${stageItem.duration_days} days)` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        isAuto ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-xs flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Auto Stage
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-700 text-white text-[11px] font-bold shadow-xs flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            Selected
                          </span>
                        )
                      ) : isAuto ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                          Suggested
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
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
