import React, { useReducer, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CloudSun,
  Satellite,
  Sprout,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  TrendingUp,
  Bot,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Compass,
  FileText,
  Sliders,
  RefreshCw,
  User,
  Database,
  Mail,
  Phone,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { useSetVoiceScope } from '../../context/VoiceScopeContext';
import { AgronomistModal } from '../../components/AgronomistModal';
import { DashboardReducer, initialDashboardState } from './reducer';

export const Dashboard: React.FC = () => {
  const [state, dispatch] = useReducer(DashboardReducer, initialDashboardState);

  const { farm, user, weather, satelliteData, advisories, refreshAdvisories } = useFarm();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [fertilizerArea, setFertilizerArea] = useState<number>(farm.size || 2.0);
  const [showFertilizerModal, setShowFertilizerModal] = useState(false);

  // Sync state from LocalStorage on mount
  useEffect(() => {
    // 1. Sync User data from LocalStorage
    try {
      const savedAuthUser = localStorage.getItem('agrinet_user');
      const savedContextUser = localStorage.getItem('agrinet_user_data_v1');
      if (savedAuthUser) {
        const parsed = JSON.parse(savedAuthUser);
        dispatch({ type: 'SET_USER_DATA', payload: parsed });
      } else if (savedContextUser) {
        const parsed = JSON.parse(savedContextUser);
        dispatch({ type: 'SET_USER_DATA', payload: parsed });
      }
    } catch (e) {
      console.error('Error reading user from localStorage:', e);
    }

    // 2. Sync Farm data from LocalStorage
    try {
      const savedFarm = localStorage.getItem('agrinet_farm_data_v1');
      if (savedFarm) {
        const parsed = JSON.parse(savedFarm);
        dispatch({ type: 'SET_MY_FARM_DATA', payload: parsed });
      }
    } catch (e) {
      console.error('Error reading farm from localStorage:', e);
    }

    // 3. Sync Alerts/Advisories
    if (advisories && advisories.length > 0) {
      dispatch({ type: 'SET_ALERT_DATA', payload: advisories });
    }
  }, [advisories]);

  // Derive active values (state from local storage takes precedence, fallback to context)
  const activeFarm = state.farm || farm;
  const activeAdvisories = state.advisories || advisories;

  const userEntity = state.user as any;
  const displayName = userEntity?.first_name
    ? `${userEntity.first_name} ${userEntity.last_name || ''}`.trim()
    : userEntity?.firstName
      ? `${userEntity.firstName} ${userEntity.lastName || ''}`.trim()
      : user.firstName
        ? `${user.firstName} ${user.lastName}`
        : 'Farmer';

  const userEmail = userEntity?.email || user.email || 'farmer@agrinet.io';
  const userPhone = userEntity?.phone_number || userEntity?.phone || user.phone || '+91 98765 43210';
  const userRole = userEntity?.role || 'farmer';

  const toggleTaskDone = (id: string) => {
    setCompletedTasks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  useSetVoiceScope(
    {
      screen: 'DASHBOARD',
      title: 'Dashboard Cockpit',
      scopeCategory: 'DASHBOARD',
      allowedActions: ['NAVIGATE', 'CUSTOM', 'FILL_FORM'],
      availableFields: [
        { name: 'fertilizerArea', description: 'Fertilizer calculator area (hectares)', type: 'number' },
      ],
      sampleCommands: {
        en: ['"Ask AI Agronomist"', '"NPK Calculator"', '"Refresh Advisories"', '"Go to Farm Setup"'],
        hi: ['"एआई कृषि विशेषज्ञ से पूछें"', '"खाद कैलकुलेटर"', '"सलाह रिफ्रेश करें"'],
      },
      onCustomAction: (action) => {
        const a = action.toLowerCase();
        if (a.includes('agronomist') || a.includes('ask') || a.includes('bot') || a.includes('ai')) {
          setIsAiModalOpen(true);
        } else if (a.includes('calc') || a.includes('npk') || a.includes('fertilizer')) {
          setShowFertilizerModal(true);
        } else if (a.includes('refresh') || a.includes('advisory') || a.includes('reload')) {
          refreshAdvisories();
        }
      },
      onFieldFill: (field, value) => {
        if (field.toLowerCase().includes('fertilizer') || field.toLowerCase().includes('area')) {
          const num = typeof value === 'number' ? value : parseFloat(String(value));
          if (!isNaN(num) && num > 0) {
            setFertilizerArea(num);
            setShowFertilizerModal(true);
            return true;
          }
        }
        return false;
      },
    },
    [fertilizerArea]
  );

  const calculatedUrea = Math.round((activeFarm.size || fertilizerArea) * 35);
  const calculatedDAP = Math.round((activeFarm.size || fertilizerArea) * 25);
  const calculatedMOP = Math.round((activeFarm.size || fertilizerArea) * 18);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/80 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Authenticated User Profile Summary Card (from LocalStorage) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-emerald-600/20 uppercase shrink-0">
            {displayName.charAt(0) || 'F'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{displayName}</h2>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                {userRole}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                <Database className="w-3 h-3 text-emerald-600" />
                <span>Local Storage Connected</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {userEmail}
              </span>
              {userPhone && (
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {userPhone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            Farm: <span className="font-bold text-slate-900">{activeFarm.farmName || `${activeFarm.location.name} Farm`}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
            Crop: <span className="font-bold">{activeFarm.crop.cropName || 'Rice'}</span> ({activeFarm.crop.variety || 'Active'})
          </div>
        </div>
      </div>

      {/* 2. Farm Overview Banner */}
      <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-emerald-200/80 shadow-md relative overflow-hidden bg-gradient-to-b from-emerald-50/40 via-white to-slate-50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Farm Identity Summary */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Farm Telemetry
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Last updated: Just now via Sentinel-2A & IMD Radar
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading">
              {activeFarm.farmName || (activeFarm.location.name ? `${activeFarm.location.name} Intelligence Cockpit` : 'Ernakulam Farm Intelligence')}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-600">
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <MapPin className="w-4 h-4 text-emerald-600" />
                {activeFarm.location.name || 'Ernakulam'}, {activeFarm.location.state || 'Kerala'} ({typeof activeFarm.location.latitude === 'number' ? activeFarm.location.latitude.toFixed(3) : '10.016'}°N, {typeof activeFarm.location.longitude === 'number' ? activeFarm.location.longitude.toFixed(3) : '76.342'}°E)
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-slate-800">
                📏 {activeFarm.size || '2.0'} {activeFarm.sizeUnit || 'hectares'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-emerald-700">
                🌾 {activeFarm.crop.cropName || 'Rice'} ({activeFarm.crop.variety || 'Jyothi'})
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-medium text-slate-700">
                🌱 {activeFarm.soil.soilType || 'Clayey'} (pH {activeFarm.soil.ph || '6.5'})
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex-1 sm:flex-initial py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Agronomist</span>
            </button>

            <Link
              to="/onboarding/start"
              className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-4 h-4 text-slate-500" />
              <span>Adjust Parameters</span>
            </Link>
          </div>
        </div>

        {/* Growth Stage Progress Bar */}
        <div className="mt-6 pt-5 border-t border-emerald-100/80">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-emerald-900 font-bold flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-600" />
              Current Stage: {activeFarm.crop.growthStage || 'Tillering & Vegetative'}
            </span>
            <span className="text-slate-600">
              Day {activeFarm.crop.daysSincePlanting || 12} of ~110 days cycle · Sown {activeFarm.crop.plantingDate || '10 Aug 2026'}
            </span>
          </div>

          <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden flex shadow-inner">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${activeFarm.crop.growthStageProgress || 35}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-medium text-slate-500 mt-2 px-1">
            <span>1. Seedling (Day 0-20)</span>
            <span className="font-bold text-emerald-700">▶ 2. Tillering (Active)</span>
            <span>3. Panicle Flowering (Day 55)</span>
            <span>4. Ripening (Day 85)</span>
            <span>5. Harvest (Day 110)</span>
          </div>
        </div>
      </div>

      {/* Grid: Weather & Satellite NDVI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Localized Weather Intelligence Widget (5 Cols) */}
        <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-md border border-slate-200/80 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-heading">
                    Weather Intelligence
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Hyper-local IMD Radar · {activeFarm.location.name || 'Ernakulam'}
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {weather.rainProbability}% Rain Risk
              </span>
            </div>

            {/* Current Metrics */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/60 to-emerald-50/60 border border-amber-200/60 flex items-center justify-between">
              <div>
                <span className="text-4xl font-extrabold text-slate-900 font-heading">
                  {weather.temp}°C
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Feels like {weather.feelsLike}°C · {weather.condition}
                </p>
              </div>
              <span className="text-4xl">{weather.icon}</span>
            </div>

            {/* Weather Telemetry Matrix */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">
                  Humidity
                </span>
                <span className="text-base font-bold text-slate-800">
                  {weather.humidity}%
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">
                  Wind Speed
                </span>
                <span className="text-base font-bold text-slate-800">
                  {weather.windSpeedKmH} km/h
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">
                  Soil Moisture
                </span>
                <span className="text-base font-bold text-emerald-700">
                  78% Optimal
                </span>
              </div>
            </div>

            {/* Hourly Rain Forecast Strip */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-semibold text-slate-600 block">
                Hourly Precipitation Radar:
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {weather.hourly.map((h, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center gap-1 text-center shrink-0 min-w-[62px]"
                  >
                    <span className="text-[11px] font-semibold text-slate-600">{h.time}</span>
                    <span className="text-lg">{h.icon}</span>
                    <span className="text-[11px] font-bold text-slate-900">{h.temp}°</span>
                    <span className="text-[10px] text-blue-600 font-semibold">{h.pop}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Forecast Summary Alert */}
            <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
              <Droplets className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-snug">{weather.forecastSummary}</p>
            </div>
          </div>
        </div>

        {/* 2. Satellite NDVI & Vegetation Telemetry (7 Cols) */}
        <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-md border border-slate-200/80 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Satellite className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-heading">
                    Satellite Vegetation Health (NDVI)
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {satelliteData.satelliteLastPass}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{satelliteData.ndviTrend}</span>
              </div>
            </div>

            {/* Simulated Satellite Multispectral Field Map */}
            <div className="relative h-48 rounded-2xl overflow-hidden border border-emerald-300 bg-emerald-950 p-4 flex flex-col justify-between text-white shadow-inner">
              {/* Abstract NDVI gradient background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900 via-teal-800 to-emerald-700 opacity-90" />
              <div className="absolute inset-0 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

              {/* Satellite HUD Overlay Header */}
              <div className="relative z-10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-mono uppercase tracking-widest text-[11px] text-emerald-300">
                    SENTINEL-2 NDVI FIELD MAPPING
                  </span>
                </div>
                <span className="font-mono text-[11px] bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                  Res: 10m/pixel
                </span>
              </div>

              {/* Center Field Plots Simulation */}
              <div className="relative z-10 grid grid-cols-3 gap-3 my-auto">
                {satelliteData.heatmapZones.map((zone) => (
                  <div
                    key={zone.id}
                    className={`p-2.5 rounded-xl border backdrop-blur-md text-center transition-all ${zone.health === 'Optimal'
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-white'
                      : 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                      }`}
                  >
                    <span className="text-[10px] block opacity-80">{zone.name}</span>
                    <span className="text-base font-bold font-mono block">
                      {zone.ndvi.toFixed(2)}
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-wider">
                      {zone.health}
                    </span>
                  </div>
                ))}
              </div>

              {/* Map Footer Stats */}
              <div className="relative z-10 flex items-center justify-between text-[11px] text-emerald-200">
                <span>Canopy Density: <b>{satelliteData.canopyDensity}</b></span>
                <span>Water Stress: <b>{satelliteData.waterStressLevel}</b></span>
              </div>
            </div>

            {/* Satellite Telemetry Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                  Health Score
                </span>
                <span className="text-xl font-extrabold text-emerald-900 font-heading">
                  {satelliteData.overallHealthScore}/100
                </span>
                <span className="text-[10px] text-emerald-600 block">Vigorous</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-600 uppercase block">
                  Avg NDVI Index
                </span>
                <span className="text-xl font-extrabold text-slate-900 font-heading">
                  {satelliteData.vegetationIndex}
                </span>
                <span className="text-[10px] text-slate-500 block">Chlorophyll Dense</span>
              </div>

              <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 text-center">
                <span className="text-[11px] font-bold text-teal-800 uppercase block">
                  Water Index (NDWI)
                </span>
                <span className="text-xl font-extrabold text-teal-900 font-heading">
                  0.68
                </span>
                <span className="text-[10px] text-teal-600 block">Sufficient Moisture</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Actionable Farm Advisory Feed (The Core Decision Engine) */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                Localized Actionable Advisories
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              "We turn farm data into actionable decisions." Generated specifically for your {activeFarm.crop.cropName || 'Rice'} field.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFertilizerModal(true)}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>NPK Dosage Calculator</span>
            </button>
            <button
              onClick={refreshAdvisories}
              className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Refresh advisory engine"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Advisory List Cards */}
        <div className="space-y-4">
          {activeAdvisories.map((adv) => {
            const isDone = completedTasks.includes(adv.id);
            return (
              <div
                key={adv.id}
                className={`p-5 rounded-2xl border transition-all ${isDone
                  ? 'bg-slate-50/60 border-slate-200 opacity-60'
                  : adv.priority === 'high'
                    ? 'bg-amber-50/50 border-amber-300/80 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
                  }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1 bg-white rounded-xl shadow-xs shrink-0">
                      {adv.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${adv.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                            }`}
                        >
                          {adv.priority.toUpperCase()} PRIORITY
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          • {adv.timeframe}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">
                        {adv.title}
                      </h4>
                    </div>
                  </div>

                  {/* Task complete button */}
                  <button
                    type="button"
                    onClick={() => toggleTaskDone(adv.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${isDone
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isDone ? 'Action Completed' : 'Mark as Done'}</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 mb-3 pl-0 sm:pl-10">
                  {adv.description}
                </p>

                {/* Recommended Action Pill */}
                <div className="sm:ml-10 p-3 bg-white rounded-xl border border-slate-200/90 flex items-start gap-2 text-xs">
                  <span className="font-bold text-emerald-800 uppercase tracking-wider shrink-0 bg-emerald-50 px-2 py-0.5 rounded">
                    Action Step:
                  </span>
                  <span className="text-slate-800 font-medium">{adv.actionableStep}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fertilizer Dosage Modal */}
      {showFertilizerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Sprout className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 font-heading">
                  NPK Dosage Calculator
                </h3>
              </div>
              <button
                onClick={() => setShowFertilizerModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Calculated for <b>{activeFarm.crop.cropName || 'Rice'}</b> ({activeFarm.crop.variety || 'Jyothi'}) on <b>{activeFarm.soil.soilType || 'Clayey'}</b> soil.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Farm Area (hectares)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                value={fertilizerArea}
                onChange={(e) => setFertilizerArea(parseFloat(e.target.value) || 1)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800">Urea (Nitrogen 46%)</span>
                <span className="font-bold text-emerald-900 text-sm">{calculatedUrea} kg</span>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800">DAP (Phosphorus 46%)</span>
                <span className="font-bold text-teal-900 text-sm">{calculatedDAP} kg</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800">MOP (Potassium 60%)</span>
                <span className="font-bold text-amber-900 text-sm">{calculatedMOP} kg</span>
              </div>
            </div>

            <button
              onClick={() => setShowFertilizerModal(false)}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700"
            >
              Apply to Field Plan
            </button>
          </div>
        </div>
      )}

      {/* AI Agronomist Chat Modal */}
      <AgronomistModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
    </div>
  );
};
