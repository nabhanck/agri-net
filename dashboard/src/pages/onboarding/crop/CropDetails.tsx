import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Sprout, ArrowRight, ArrowLeft, Check, Sparkles, Clock, ChevronDown, Loader2 } from 'lucide-react';
import { useFarm } from '../../../context/FarmContext';
import { useSetVoiceScope } from '../../../context/VoiceScopeContext';
import { POPULAR_CROPS } from '../../../data/agriculturalData';
import { getCropGrowthStages } from './api';
import type { GrowthStageEntity } from '@/types/farm';
import { CropIcon } from '@/utils/helpers';

export const CropDetails: React.FC = () => {
  const navigate = useNavigate();
  const { farm, updateCrop } = useFarm();

  const activeCropInfo =
    POPULAR_CROPS.find(
      (c) => c.id === farm.crop.cropId || c.name.toLowerCase() === (farm.crop.cropName || '').toLowerCase()
    ) || POPULAR_CROPS[0];

  const [growthStages, setGrowthStages] = useState<GrowthStageEntity[]>([]);
  const [isLoadingStages, setIsLoadingStages] = useState<boolean>(false);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(farm.crop.growthStageId || null);

  const [selectedVariety, setSelectedVariety] = useState<string>(farm.crop.variety || 'Jyothi');
  const [customVariety, setCustomVariety] = useState<string>(farm.crop.customVariety || '');
  const [plantingDate, setPlantingDate] = useState<string>(farm.crop.plantingDate || '2026-08-10');
  const [growthStage, setGrowthStage] = useState<string>(
    farm.crop.growthStage || 'Tillering & Vegetative'
  );

  // Sync with context if updated via voice assistant
  useEffect(() => {
    if (farm.crop?.variety) {
      setSelectedVariety(farm.crop.variety);
    }
  }, [farm.crop?.variety]);

  // Calculate days since planting
  const calculateDays = (dateStr: string) => {
    try {
      const pDate = new Date(dateStr);
      const today = new Date('2026-08-22'); // current system reference time
      const diffTime = Math.abs(today.getTime() - pDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return isNaN(diffDays) ? 12 : diffDays;
    } catch {
      return 12;
    }
  };

  const daysSincePlanting = calculateDays(plantingDate);

  // Fetch growth stages from backend based on selected crop ID
  useEffect(() => {
    const fetchStages = async () => {
      let cropIdNum = Number(farm.crop.cropId);
      if (isNaN(cropIdNum) || cropIdNum <= 0) {
        // Fallback to crop id 1 (Rice) if cropId is non-numeric
        cropIdNum = 1;
      }

      setIsLoadingStages(true);
      try {
        const res = await getCropGrowthStages(cropIdNum);
        if (res?.data && res.data.length > 0) {
          // Sort growth stages in ascending order by stage_order
          const sorted = [...res.data].sort((a, b) => (a.stage_order ?? 0) - (b.stage_order ?? 0));
          setGrowthStages(sorted);

          // Find matching stage if already set in context
          const currentStage = sorted.find(
            (s) => s.id === farm.crop.growthStageId || s.stage_name === farm.crop.growthStage
          );

          if (currentStage) {
            setGrowthStage(currentStage.stage_name || '');
            setSelectedStageId(currentStage.id);
          } else {
            // Auto-calculate suggested stage based on planting days
            let cumulative = 0;
            let autoStage = sorted[0];
            for (const st of sorted) {
              cumulative += st.duration_days ?? 0;
              if (daysSincePlanting <= cumulative) {
                autoStage = st;
                break;
              }
              autoStage = st;
            }
            if (autoStage) {
              setGrowthStage(autoStage.stage_name || '');
              setSelectedStageId(autoStage.id);
            }
          }
        } else {
          // Fallback to activeCropInfo stages if API returns empty
          const fallbackStages: GrowthStageEntity[] = activeCropInfo.growthStages.map((st, idx) => ({
            id: idx + 1,
            crop_id: cropIdNum,
            stage_name: st.stage,
            stage_order: idx + 1,
            duration_days: st.durationDays,
            description: st.description,
          }));
          setGrowthStages(fallbackStages);
        }
      } catch (error) {
        console.error('Error fetching crop growth stages:', error);
      } finally {
        setIsLoadingStages(false);
      }
    };

    fetchStages();
  }, [farm.crop.cropId, farm.crop.cropName]);

  // Suggest stage based on days whenever plantingDate or growthStages changes
  useEffect(() => {
    if (growthStages.length > 0) {
      let cumulative = 0;
      let matched = growthStages[0];
      for (const st of growthStages) {
        cumulative += st.duration_days ?? 0;
        if (daysSincePlanting <= cumulative) {
          matched = st;
          break;
        }
        matched = st;
      }
      if (matched && (!selectedStageId || !growthStages.some((s) => s.id === selectedStageId))) {
        setGrowthStage(matched.stage_name || '');
        setSelectedStageId(matched.id);
      }
    }
  }, [plantingDate, growthStages]);

  const handleVarietyPick = (v: string) => {
    setSelectedVariety(v);
  };

  const handleStageSelect = (stageItem: GrowthStageEntity) => {
    setGrowthStage(stageItem.stage_name || '');
    setSelectedStageId(stageItem.id);
  };

  const handleContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateCrop({
      variety: selectedVariety === 'Other' && customVariety ? customVariety : selectedVariety,
      customVariety: customVariety,
      plantingDate: plantingDate,
      growthStage: growthStage,
      growthStageId: selectedStageId ?? undefined,
      daysSincePlanting: daysSincePlanting,
      growthStageProgress: 35,
    });
    navigate('/onboarding/soil');
  };

  const displayCropName = farm.crop.cropName || activeCropInfo.name || 'Rice';
  const cropSlug = farm.crop.cropId && isNaN(Number(farm.crop.cropId)) ? farm.crop.cropId : displayCropName.toLowerCase();

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
          setPlantingDate(String(value));
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
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
            When did you plant this crop?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div className="relative">
              <input
                type="date"
                required
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm font-semibold outline-none transition-all shadow-xs"
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
                  {daysSincePlanting} days in field
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
                const isCurrent =
                  (selectedStageId && stageItem.id === selectedStageId) ||
                  growthStage === stageItem.stage_name;
                return (
                  <div
                    key={stageItem.id ?? index}
                    onClick={() => handleStageSelect(stageItem)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${isCurrent
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCurrent
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

                    {isCurrent && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-xs">
                        Active Stage
                      </span>
                    )}
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
