import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Navigation, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { useSetVoiceScope } from '../../context/VoiceScopeContext';
import { MapPicker } from '../../components/MapPicker';
import type { FarmSizeUnit } from '../../types';

// Preset locations for quick searching/autocomplete
const LOCATION_SUGGESTIONS = [
  { name: 'Ernakulam', district: 'Ernakulam', state: 'Kerala', country: 'India', lat: 10.0159, lng: 76.3419 },
  { name: 'Thrissur', district: 'Thrissur', state: 'Kerala', country: 'India', lat: 10.5276, lng: 76.2144 },
  { name: 'Mandya', district: 'Mandya', state: 'Karnataka', country: 'India', lat: 12.5218, lng: 76.8951 },
  { name: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', country: 'India', lat: 30.9010, lng: 75.8573 },
  { name: 'Nashik', district: 'Nashik', state: 'Maharashtra', country: 'India', lat: 19.9975, lng: 73.7898 },
  { name: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh', country: 'India', lat: 16.3067, lng: 80.4365 },
  { name: 'Thanjavur', district: 'Thanjavur', state: 'Tamil Nadu', country: 'India', lat: 10.7870, lng: 79.1378 },
];

export const FarmIdentity: React.FC = () => {
  const navigate = useNavigate();
  const { farm, updateFarm, updateLocation } = useFarm();

  const [searchQuery, setSearchQuery] = useState(
    farm.location.name ? `${farm.location.name}, ${farm.location.state}` : 'Ernakulam, Kerala'
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [sizeInput, setSizeInput] = useState<string>(farm.size?.toString() || '2.0');
  const [sizeUnit, setSizeUnit] = useState<FarmSizeUnit>(farm.sizeUnit || 'hectares');

  // Sync with context if updated via voice assistant
  React.useEffect(() => {
    if (farm.size !== undefined) {
      setSizeInput(farm.size.toString());
    }
    if (farm.sizeUnit) {
      setSizeUnit(farm.sizeUnit);
    }
  }, [farm.size, farm.sizeUnit]);

  React.useEffect(() => {
    if (farm.location?.name) {
      setSearchQuery(`${farm.location.name}, ${farm.location.state}`);
    }
  }, [farm.location.name, farm.location.state]);

  // Filter suggestions
  const filteredSuggestions = LOCATION_SUGGESTIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLocation = (loc: typeof LOCATION_SUGGESTIONS[0]) => {
    setSearchQuery(`${loc.name}, ${loc.state}`);
    setShowSuggestions(false);
    updateLocation({
      name: loc.name,
      district: loc.district,
      state: loc.state,
      country: loc.country,
      latitude: loc.lat,
      longitude: loc.lng,
    });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        updateLocation({
          name: 'Current Farm GPS',
          district: 'Local District',
          state: 'Kerala',
          country: 'India',
          latitude: Number(latitude.toFixed(4)),
          longitude: Number(longitude.toFixed(4)),
        });
        setSearchQuery(`GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      },
      (error) => {
        setIsLocating(false);
        // Fallback gracefully to default Ernakulam
        updateLocation({
          name: 'Ernakulam',
          district: 'Ernakulam',
          state: 'Kerala',
          country: 'India',
          latitude: 10.0159,
          longitude: 76.3419,
        });
        setSearchQuery('Ernakulam, Kerala');
      }
    );
  };

  const handleCoordinatesChange = (lat: number, lng: number) => {
    updateLocation({
      latitude: Number(lat.toFixed(4)),
      longitude: Number(lng.toFixed(4)),
    });
  };

  const handleContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsedSize = parseFloat(sizeInput) || 2.0;
    updateFarm({
      size: parsedSize,
      sizeUnit: sizeUnit,
    });
    navigate('/onboarding/crop-selection');
  };

  useSetVoiceScope(
    {
      screen: 'ONBOARDING_FARM_IDENTITY',
      title: 'Farm Location & Size',
      scopeCategory: 'ONBOARDING_FORM',
      allowedActions: ['FILL_FORM', 'NEXT_STEP', 'PREV_STEP'],
      availableFields: [
        { name: 'location', description: 'Farm location or city (e.g. Ernakulam, Thrissur, Mandya, Ludhiana, Nashik, Guntur, Thanjavur)', type: 'string' },
        { name: 'size', description: 'Farm size / acreage (e.g. 5, 2.5)', type: 'number' },
        { name: 'sizeUnit', description: 'Unit (hectares, acres, cents, bighas)', type: 'select' },
      ],
      sampleCommands: {
        en: ['"Location Thrissur"', '"Farm 5 acres"', '"Next / Continue"'],
        hi: ['"स्थान त्रिशूर"', '"खेत 5 एकड़"', '"आगे बढ़ो"'],
      },
      onFieldFill: (field, value) => {
        const k = field.toLowerCase();
        if (k.includes('size') || k.includes('acre') || k.includes('hectare')) {
          const num = typeof value === 'number' ? value : parseFloat(String(value));
          if (!isNaN(num) && num > 0) {
            setSizeInput(num.toString());
            const unit: FarmSizeUnit = String(value).toLowerCase().includes('hectare') ? 'hectares' : 'acres';
            setSizeUnit(unit);
            updateFarm({ size: num, sizeUnit: unit });
          }
          return true;
        }
        return false;
      },
      onNextStep: () => {
        handleContinue();
      },
      onPrevStep: () => {
        navigate('/onboarding/start');
      },
    },
    [sizeInput, sizeUnit]
  );

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 animate-in fade-in duration-300">
      {/* Back Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate('/onboarding/start')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
          Farm setup — Step 1: Farm identity
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-1">
          Farm location
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Where is your farm located? Accurate coordinates power satellite imagery and hyper-local rain radar.
        </p>
      </div>

      <form onSubmit={handleContinue} className="space-y-6">
        {/* Search for your location */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Where is your farm?
          </label>
          <div className="relative">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                className="w-full pl-4 pr-11 py-3 rounded-2xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm font-medium outline-none transition-all shadow-xs"
                placeholder="Search for your location (e.g. Ernakulam, Kerala)"
              />
              <div className="absolute right-3 text-emerald-600">
                <Search className="w-5 h-5" />
              </div>
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 max-h-56 overflow-y-auto">
                {filteredSuggestions.map((loc) => (
                  <button
                    key={`${loc.name}-${loc.state}`}
                    type="button"
                    onClick={() => handleSelectLocation(loc)}
                    className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 flex items-center justify-between text-sm transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800">{loc.name}</span>
                        <span className="text-xs text-slate-500 ml-1.5">
                          {loc.district}, {loc.state}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* OR Divider */}
        <div className="relative flex items-center justify-center my-1">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-xs font-bold text-slate-400 uppercase tracking-widest absolute">
            OR
          </span>
        </div>

        {/* Use My Location Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-semibold text-sm transition-all hover:scale-102 cursor-pointer border border-slate-200/80 shadow-xs"
          >
            <Navigation
              className={`w-4 h-4 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`}
            />
            <span>{isLocating ? 'Detecting farm GPS...' : '📍 Use my location'}</span>
          </button>
        </div>

        <div className="border-t border-slate-200 pt-5 space-y-4">
          {/* Selected Location Card & Size Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Selected Location Display */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                  Selected Farm Location
                </span>
                <p className="text-lg font-bold text-slate-900 font-heading">
                  {farm.location.name || 'Ernakulam'}
                </p>
                <p className="text-xs text-slate-600">
                  {farm.location.state || 'Kerala'}, {farm.location.country || 'India'}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg w-fit">
                <span>📍 {farm.location.latitude.toFixed(4)}, {farm.location.longitude.toFixed(4)}</span>
              </div>
            </div>

            {/* Farm Size */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                How large is your farm?
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  className="w-24 px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-base font-bold outline-none text-center"
                  placeholder="2.0"
                />
                <div className="relative flex-1">
                  <select
                    value={sizeUnit}
                    onChange={(e) => setSizeUnit(e.target.value as FarmSizeUnit)}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm font-semibold outline-none cursor-pointer"
                  >
                    <option value="hectares">hectares ▼</option>
                    <option value="acres">acres ▼</option>
                    <option value="cents">cents ▼</option>
                    <option value="bighas">bighas ▼</option>
                  </select>
                  <div className="absolute right-3 top-3 text-slate-400 pointer-events-none text-xs">
                    ▼
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 mt-2">
                1 hectare ≈ 2.47 acres
              </span>
            </div>
          </div>

          {/* Map Preview */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Farm Location Map</span>
              </label>
              <div className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                Lat: <span className="font-semibold text-slate-900">{farm.location.latitude.toFixed(4)}</span> · Long: <span className="font-semibold text-slate-900">{farm.location.longitude.toFixed(4)}</span>
              </div>
            </div>

            {/* Interactive Leaflet Map Component */}
            <MapPicker
              latitude={farm.location.latitude}
              longitude={farm.location.longitude}
              locationName={farm.location.name}
              onCoordinatesChange={handleCoordinatesChange}
            />

            {/* ASCII / Graphic Legend as requested */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">Latitude:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-emerald-700">
                  {farm.location.latitude.toFixed(4)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">Longitude:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-emerald-700">
                  {farm.location.longitude.toFixed(4)}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 italic">
                Interactive Pin · Drag to tune field bounds
              </div>
            </div>
          </div>
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
