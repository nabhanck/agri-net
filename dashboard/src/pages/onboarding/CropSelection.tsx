import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, ArrowLeft, Check, Sparkles, Sprout } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { useSetVoiceScope } from '../../context/VoiceScopeContext';
import { POPULAR_CROPS } from '../../data/agriculturalData';
import type { CropInfo } from '../../types';

export const CropSelection: React.FC = () => {
  const navigate = useNavigate();
  const { farm, updateCrop } = useFarm();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCropId, setSelectedCropId] = useState<string>(farm.crop.cropId || 'rice');

  // Sync with context if updated via voice assistant
  React.useEffect(() => {
    if (farm.crop?.cropId) {
      setSelectedCropId(farm.crop.cropId);
    }
  }, [farm.crop?.cropId]);

  // Filter crops based on search
  const filteredCrops = POPULAR_CROPS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.localName && c.localName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectCrop = (crop: CropInfo) => {
    setSelectedCropId(crop.id);
    const defaultVariety = crop.popularVarieties[0] || 'Standard';
    updateCrop({
      cropId: crop.id,
      cropName: crop.name,
      variety: defaultVariety,
      growthStage: crop.growthStages[1]?.stage || crop.growthStages[0]?.stage || 'Vegetative',
    });
  };

  const handleContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const activeCrop = POPULAR_CROPS.find((c) => c.id === selectedCropId) || POPULAR_CROPS[0];
    updateCrop({
      cropId: activeCrop.id,
      cropName: activeCrop.name,
      variety: farm.crop.variety || activeCrop.popularVarieties[0],
    });
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
          description: 'Crop to plant (Rice, Wheat, Corn, Cotton, Potato, Tomato, Coffee, Banana, Chili, Tea)',
          type: 'select',
          options: ['Rice', 'Wheat', 'Corn', 'Cotton', 'Potato', 'Tomato', 'Coffee', 'Banana', 'Chili', 'Tea'],
          example: 'Rice',
        },
      ],
      sampleCommands: {
        en: ['"My crop is Rice"', '"Select Cotton crop"', '"Next / Continue"'],
        hi: ['"मेरी फसल चावल है"', '"कपास फसल चुनो"', '"आगे बढ़ो"'],
      },
      onFieldFill: (_field, value) => {
        const cropStr = String(value).toLowerCase();
        const matched = POPULAR_CROPS.find(
          (c) =>
            c.name.toLowerCase() === cropStr ||
            c.id.toLowerCase() === cropStr ||
            (c.localName && c.localName.toLowerCase().includes(cropStr))
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
    [selectedCropId]
  );

  const currentSelectedCrop = POPULAR_CROPS.find((c) => c.id === selectedCropId);

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
              placeholder="🔍 Search crop (e.g. Rice, Corn, Potato, Wheat, Cotton)..."
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

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredCrops.map((crop) => {
              const isSelected = crop.id === selectedCropId;
              return (
                <button
                  key={crop.id}
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
                    {crop.icon}
                  </span>

                  {/* Crop Name */}
                  <div>
                    <span className="block font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                      {crop.name}
                    </span>
                    {crop.localName && (
                      <span className="block text-[11px] text-slate-400 font-medium truncate max-w-[120px]">
                        {crop.localName}
                      </span>
                    )}
                  </div>

                  {/* Water requirement pill */}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                    💧 {crop.waterRequirement}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Crop Summary Callout */}
        {currentSelectedCrop && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentSelectedCrop.icon}</span>
              <div>
                <span className="text-xs text-slate-500">Selected Crop</span>
                <p className="text-sm font-bold text-slate-900">
                  {currentSelectedCrop.name} · {currentSelectedCrop.popularVarieties.length} popular varieties
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
              Optimal pH: {currentSelectedCrop.optimalPhRange[0]} - {currentSelectedCrop.optimalPhRange[1]}
            </span>
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
