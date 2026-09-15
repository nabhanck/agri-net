import React, { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, ArrowLeft, Check, Sparkles, Sprout, Loader2, Droplets, Clock } from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useSetVoiceScope } from '@/context/VoiceScopeContext';
import type { CropEntity } from '@/types/farm';
import { CropIcon } from '@/utils/helpers';
import { initialOnBoardingState, OnBoardingReducer } from '../reducer';
import { getCrops } from '../api';
import { toast } from '@/components/ui/toast';

export const CropSelection: React.FC = () => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(OnBoardingReducer, initialOnBoardingState);
  const { farm, updateCrop } = useFarm();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCropId, setSelectedCropId] = useState<string>(farm.crop.cropId || 'rice');

  // Sync with context if updated via voice assistant
  useEffect(() => {
    if (farm.crop?.cropId) {
      setSelectedCropId(farm.crop.cropId);
    }
  }, [farm.crop?.cropId]);

  const getCropsList = async () => {
    dispatch({ type: 'GET_CROPS_LIST_REQUEST' });
    try {
      const response = await getCrops();
      if (response?.data) {
        dispatch({ type: 'GET_CROPS_LIST_REQUEST_SUCCESS', data: response.data });
      } else if (response?.error) {
        dispatch({ type: 'GET_CROPS_LIST_REQUEST_FAILED', error: response.error });
        toast.add({
          title: 'Failed to fetch crops',
          description: response.error.message,
          type: 'error',
        });
      }
    } catch (error: any) {
      const err = { code: 500, message: error?.message || 'Error getting crops list' };
      dispatch({ type: 'GET_CROPS_LIST_REQUEST_FAILED', error: err });
      console.error('Error getting crops list', error?.message);
      toast.add({
        title: 'Failed to fetch crops',
        description: err.message,
        type: 'error',
      });
    }
  };

  useEffect(() => {
    getCropsList();
  }, []);

  const cropsList: CropEntity[] = state.crops || [];

  // Filter crops based on search
  const filteredCrops = cropsList.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.slug && c.slug.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.scientific_name && c.scientific_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.family && c.family.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectCrop = (crop: CropEntity) => {
    const cropIdentifier = crop.slug || String(crop.id);
    setSelectedCropId(cropIdentifier);
    const defaultVariety = (crop.varieties && crop.varieties[0]) || 'Standard';
    updateCrop({
      cropId: cropIdentifier,
      cropName: crop.name,
      variety: defaultVariety,
      growthStage: 'Vegetative',
    });
  };

  const handleContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const activeCrop =
      cropsList.find(
        (c) =>
          c.slug === selectedCropId ||
          String(c.id) === selectedCropId ||
          c.name.toLowerCase() === selectedCropId.toLowerCase()
      ) || cropsList[0];

    if (activeCrop) {
      updateCrop({
        cropId: activeCrop.slug || String(activeCrop.id),
        cropName: activeCrop.name,
        variety: farm.crop.variety || (activeCrop.varieties && activeCrop.varieties[0]) || 'Standard',
      });
    }
    navigate('/onboarding/crop-details');
  };

  useSetVoiceScope(
    {
      screen: 'ONBOARDING_CROP_SELECTION',
      title: 'Crop Selection',
      scopeCategory: 'ONBOARDING_FORM',
      allowedActions: ['FILL_FORM', 'NEXT_STEP', 'PREV_STEP'],
      availableFields: [
        {
          name: 'crop',
          description: `Crop to plant (${cropsList.map((c) => c.name).join(', ')})`,
          type: 'select',
          options: cropsList.map((c) => c.name),
          example: 'Rice',
        },
      ],
      sampleCommands: {
        en: ['"My crop is Rice"', '"Select Cotton crop"', '"Next / Continue"'],
        hi: ['"मेरी फसल चावल है"', '"कपास फसल चुनो"', '"आगे बढ़ो"'],
      },
      onFieldFill: (_field, value) => {
        const cropStr = String(value).toLowerCase();
        const matched = cropsList.find(
          (c) =>
            c.name.toLowerCase() === cropStr ||
            (c.slug && c.slug.toLowerCase() === cropStr) ||
            (c.scientific_name && c.scientific_name.toLowerCase().includes(cropStr))
        );
        if (matched) {
          handleSelectCrop(matched);
          return true;
        }
        return false;
      },
      onNextStep: () => {
        handleContinue();
      },
      onPrevStep: () => {
        navigate('/onboarding/farm-identity');
      },
    },
    [selectedCropId, cropsList]
  );

  const currentSelectedCrop = cropsList.find(
    (c) =>
      c.slug === selectedCropId ||
      String(c.id) === selectedCropId ||
      c.name.toLowerCase() === selectedCropId.toLowerCase()
  );

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 animate-in fade-in duration-300">
      {/* Back Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate('/onboarding/farm-identity')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Location</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
          Farm setup — Step 2 of 6
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-1">
          What are you growing?
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Select your primary crop to receive localized agronomic schedules and pest advisories.
        </p>
      </div>

      <form onSubmit={handleContinue} className="space-y-6">
        {/* Search crops */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Search crops
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm font-medium outline-none transition-all shadow-xs"
              placeholder="Search crop (e.g. Rice, Corn, Potato, Wheat, Cotton)..."
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Popular Crops Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Popular crops
            </label>
            <span className="text-xs text-slate-400">
              {filteredCrops.length} crops available
            </span>
          </div>

          {state.isLoading && (!state.crops || state.crops.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
              <span className="text-sm font-medium">Loading crops catalog...</span>
            </div>
          ) : filteredCrops.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
              <Sprout className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm font-semibold text-slate-600">No crops found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                No matching crops found for "{searchQuery}".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredCrops.map((crop) => {
                const isSelected =
                  crop.slug === selectedCropId ||
                  String(crop.id) === selectedCropId ||
                  crop.name.toLowerCase() === selectedCropId.toLowerCase();
                return (
                  <button
                    key={crop.id || crop.slug}
                    type="button"
                    onClick={() => handleSelectCrop(crop)}
                    className={`relative p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-600/10'
                        : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    {/* Selected check badge */}
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    {/* Crop Icon */}
                    <span className="text-3xl group-hover:scale-115 transition-transform duration-200">
                      {CropIcon(crop.slug)}
                    </span>

                    {/* Crop Name */}
                    <div>
                      <span className="block font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                        {crop.name}
                      </span>
                      {crop.scientific_name && (
                        <span className="block text-[11px] text-slate-400 font-medium truncate max-w-[120px]">
                          {crop.scientific_name}
                        </span>
                      )}
                    </div>

                    {/* Water requirement pill */}
                    {crop.water_requirement && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                        <Droplets className="w-3.5 h-3.5 text-blue-500" /> {crop.water_requirement}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Crop Summary Callout */}
        {currentSelectedCrop && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{CropIcon(currentSelectedCrop.slug)}</span>
              <div>
                <span className="text-xs text-slate-500">Selected Crop</span>
                <p className="text-sm font-bold text-slate-900">
                  {currentSelectedCrop.name}
                  {currentSelectedCrop.varieties && currentSelectedCrop.varieties.length > 0 && (
                    <span> · {currentSelectedCrop.varieties.length} popular varieties</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {currentSelectedCrop.maturity_days && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{currentSelectedCrop.maturity_days} days maturity</span>
                </span>
              )}
              {currentSelectedCrop.optimal_ph_range && currentSelectedCrop.optimal_ph_range.length >= 2 && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                  Optimal pH: {currentSelectedCrop.optimal_ph_range[0]} - {currentSelectedCrop.optimal_ph_range[1]}
                </span>
              )}
            </div>
          </div>
        )}

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
