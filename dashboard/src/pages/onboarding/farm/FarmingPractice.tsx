import React, { useState, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, ArrowLeft, Check, Sparkles, Loader2 } from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import type { FarmingPractice as FarmingPracticeType } from '@/types';
import type { CreateFarmDto } from '@/types/farm';
import { useSetVoiceScope } from '@/context/VoiceScopeContext';
import { FARMING_PRACTICES } from '@/data/agriculturalData';
import { toast } from '@/components/ui/toast';
import { OnBoardingReducer, initialOnBoardingState } from '../reducer';
import { createFarm, getCrops } from '../api';

export const FarmingPractice: React.FC = () => {
  const navigate = useNavigate();
  const { farm, updateFarm } = useFarm();
  const [state, dispatch] = useReducer(OnBoardingReducer, initialOnBoardingState);

  const [selectedPractice, setSelectedPractice] = useState<FarmingPracticeType>(
    farm.practice || 'Conventional'
  );

  // Sync with context if updated via voice assistant
  useEffect(() => {
    if (farm.practice) {
      setSelectedPractice(farm.practice);
    }
  }, [farm.practice]);

  const handleContinue = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (state.isLoading) return;

    // 1. Resolve logged in user ID from localStorage or fallback
    let userId = 1;
    try {
      const storedUser = localStorage.getItem('agrinet_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.id) {
          userId = Number(parsed.id);
        }
      }
    } catch {
      userId = 1;
    }

    // 2. Resolve crop IDs from catalog / backend
    let cropIds: number[] = [1];
    try {
      const cropsRes = await getCrops();
      if (cropsRes.data && Array.isArray(cropsRes.data) && cropsRes.data.length > 0) {
        const currentCropSlug = (farm.crop?.cropId || 'rice').toLowerCase();
        const currentCropName = (farm.crop?.cropName || 'rice').toLowerCase();
        const matched = cropsRes.data.find(
          (c) =>
            c.slug?.toLowerCase() === currentCropSlug ||
            c.name?.toLowerCase() === currentCropName
        );
        if (matched?.id) {
          cropIds = [matched.id];
        } else if (cropsRes.data[0]?.id) {
          cropIds = [cropsRes.data[0].id];
        }
      }
    } catch {
      cropIds = [1];
    }

    // 3. Assemble payload from Location, Crops, Variety and Stage, Soil, Irrigation and Practices
    const primaryCropId = cropIds[0] || 1;
    const payload: CreateFarmDto = {
      user_id: userId,
      name: farm.farmName || `${farm.location.name || 'My'} Farm`,
      latitude: farm.location.latitude ?? 10.0159,
      longitude: farm.location.longitude ?? 76.3419,
      area: farm.size ? Number(farm.size) : 2.0,
      soil_type: farm.soil.soilType || 'Clayey',
      soilPh: farm.soil.ph ? Number(farm.soil.ph) : 6.5,
      irrigation_type: farm.irrigation || 'Rainfed',
      farming_practice: selectedPractice || farm.practice || 'Conventional',
      crop_Ids: cropIds,
      crops: [
        {
          crop_id: primaryCropId,
          variety: farm.crop?.variety || undefined,
          planting_date: farm.crop?.plantingDate || undefined,
        },
      ],
    };

    dispatch({ type: 'CREATE_FARM_REQUEST' });

    const result = await createFarm(payload);

    if (result.error) {
      dispatch({ type: 'CREATE_FARM_REQUEST_FAILED', error: result.error });
      toast.add({
        title: 'Farm Setup Failed',
        description: result.error.message,
        type: 'error',
      });
      return;
    }

    if (result.data) {
      dispatch({ type: 'CREATE_FARM_REQUEST_SUCCESS', payload: result.data });
      updateFarm({
        practice: selectedPractice,
        isReady: true,
      });
      navigate('/onboarding/ready');
    }
  };

  useSetVoiceScope(
    {
      screen: 'ONBOARDING_PRACTICE',
      title: 'Farming Practice',
      scopeCategory: 'ONBOARDING_FORM',
      allowedActions: ['FILL_FORM', 'NEXT_STEP', 'PREV_STEP', 'SUBMIT'],
      availableFields: [
        {
          name: 'practice',
          description: 'Farming practice philosophy (Conventional, Organic, Regenerative, Mixed)',
          type: 'select',
          options: ['Conventional', 'Organic', 'Regenerative', 'Mixed'],
          example: 'Organic',
        },
      ],
      sampleCommands: {
        en: ['"Organic farming"', '"Conventional"', '"Complete Setup / Submit"'],
        hi: ['"जैविक खेती"', '"पारंपरिक खेती"', '"सेटअप पूरा करें"'],
      },
      onFieldFill: (_field, value) => {
        const pStr = String(value).toLowerCase();
        let targetPrac: FarmingPracticeType = 'Conventional';
        if (pStr.includes('organic')) targetPrac = 'Organic';
        else if (pStr.includes('regen')) targetPrac = 'Regenerative';
        else if (pStr.includes('mixed') || pStr.includes('integrated')) targetPrac = 'Mixed / Integrated';
        setSelectedPractice(targetPrac);
        updateFarm({ practice: targetPrac });
        return true;
      },
      onNextStep: () => {
        handleContinue();
      },
      onSubmit: () => {
        handleContinue();
      },
      onPrevStep: () => {
        navigate('/onboarding/irrigation');
      },
    },
    [selectedPractice]
  );

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 animate-in fade-in duration-300">
      {/* Back Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate('/onboarding/irrigation')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Irrigation</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
          Farm setup — Step 6 of 6
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-1">
          How do you currently farm?
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          We tailor fertilizer formulations, organic biologicals, and pest controls to your farming philosophy.
        </p>
      </div>

      <form onSubmit={handleContinue} className="space-y-4">
        {/* Practice Options List */}
        <div className="space-y-3">
          {FARMING_PRACTICES.map((p) => {
            const isSelected = selectedPractice === p.practice;
            return (
              <label
                key={p.practice}
                onClick={() => setSelectedPractice(p.practice)}
                className={`relative p-4 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${isSelected
                  ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Radio Circle */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                      }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  {/* Icon */}
                  <span className="text-2xl shrink-0">{p.icon}</span>

                  {/* Title & Description */}
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {p.title}
                    </span>
                    <span className="text-xs text-slate-500 leading-snug">
                      {p.description}
                    </span>
                  </div>
                </div>

                {/* Badge */}
                <div className="shrink-0 text-right">
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                    {p.badge}
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
            disabled={state.isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400 text-white font-bold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer disabled:cursor-not-allowed"
          >
            {state.isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Farm...</span>
              </>
            ) : (
              <>
                <span>Complete Setup</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
