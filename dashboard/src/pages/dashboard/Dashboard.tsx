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
  Loader2,
  Map,
  Shovel,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFarm } from '../../context/FarmContext';
import { useSetVoiceScope } from '../../context/VoiceScopeContext';
import { AgronomistModal } from '../../components/AgronomistModal';
import { getFarmDetails, evaluateCropGrowth, getCropGrowthStages, getWeather, getFarmIntelligence } from './api';
import type { GrowthStageEntity } from '@/types/farm';
import { DashboardReducer, initialDashboardState } from './reducer';
import { CropIcon, formatHourlyTime, getCurrentWeatherIcon, getHourlyWeatherIcon, getRainProbability } from '@/utils/helpers';
import { processSoilMoistureData } from '@/utils/weatherSoilMoisture';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { DiseaseDiagnostic } from './DiseaseDiagnostic';


export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(DashboardReducer, initialDashboardState);

  console.log("statee", state?.weather)

  const upcomingHourlyWeather = (state?.weather?.weather?.hourly || []).filter((h) => {
    if (!h.forecast_time) return false;
    const forecastTime = new Date(h.forecast_time).getTime();
    return !isNaN(forecastTime) && forecastTime >= Date.now();
  });

  const {
    farm,
    user,
    weather,
    satelliteData,
    advisories,
    refreshAdvisories,
    selectedFarmId,
    setSelectedFarmDetails,
    updateFarm,
  } = useFarm();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [fertilizerArea, setFertilizerArea] = useState<number>(farm.size || 2.0);
  const [showFertilizerModal, setShowFertilizerModal] = useState(false);
  const [isLoadingFarmDetails, setIsLoadingFarmDetails] = useState<boolean>(false);
  const [farmDetailsError, setFarmDetailsError] = useState<string | null>(null);
  const [cropStages, setCropStages] = useState<GrowthStageEntity[]>([]);

  // 1. Sync User data and local state on mount
  useEffect(() => {
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

    try {
      const savedFarm = localStorage.getItem('agrinet_farm_data_v1');
      if (savedFarm) {
        const parsed = JSON.parse(savedFarm);
        dispatch({ type: 'SET_MY_FARM_DATA', payload: parsed });
      }
    } catch (e) {
      console.error('Error reading farm from localStorage:', e);
    }

    if (advisories && advisories.length > 0) {
      dispatch({ type: 'SET_ALERT_DATA', payload: advisories });
    }
  }, [advisories]);

  // 2. Fetch Farm Details, evaluate crop growth, and load crop growth stages whenever selectedFarmId changes
  useEffect(() => {
    if (!selectedFarmId) return;

    let isSubscribed = true;
    const loadFarmDetails = async () => {
      setIsLoadingFarmDetails(true);
      setFarmDetailsError(null);
      try {
        const res = await getFarmDetails(selectedFarmId);
        if (!isSubscribed) return;

        if (res?.data) {
          dispatch({ type: 'SET_MY_FARM_DATA', payload: res.data });
          const farmData = res.data;
          setSelectedFarmDetails(farmData);

          const activeCrop = farmData.crops?.[0];
          const cropId = Number(activeCrop?.crop_id || activeCrop?.crop?.id || 1);
          const areaNum = Number(farmData.area) || 2.0;
          setFertilizerArea(areaNum);

          // Fetch weather data for the selected farm and log response
          const farmLat = Number(farmData.latitude) || 10.0159;
          const farmLng = Number(farmData.longitude) || 76.3419;
          try {
            dispatch({ type: 'LOAD_WEATHER_DATA', loading: true });
            const weatherRes = await getWeather(farmLat, farmLng, selectedFarmId);
            console.log("Weather response for farm", selectedFarmId, ":", weatherRes);
            if (weatherRes && weatherRes?.data) {
              const processedSoil = processSoilMoistureData(weatherRes);
              dispatch({
                type: 'LOAD_WEATHER_DATA_SUCCESSFULL',
                payload: {
                  weather: weatherRes.data,
                  hourlySoilMoisture: processedSoil.timeline,
                  currentSoilMoisture: processedSoil.current,
                },
              });
            } else if (weatherRes?.error) {
              dispatch({
                type: 'LOAD_WEATHER_DATA_FAILED',
                error: weatherRes.error,
              });
            }
          } catch (weatherErr: any) {
            console.warn("Weather fetch error:", weatherErr);
            dispatch({
              type: 'LOAD_WEATHER_DATA_FAILED',
              error: weatherErr,
            });
          }

          // Fetch farm intelligence evaluation and triggered rules
          try {
            dispatch({ type: 'LOAD_FARM_INTELLIGENCE', loading: true });
            const intelRes = await getFarmIntelligence(selectedFarmId);
            console.log("Farm intelligence response for farm", selectedFarmId, ":", intelRes);
            if (intelRes?.data && isSubscribed) {
              dispatch({
                type: 'LOAD_FARM_INTELLIGENCE_SUCCESSFULL',
                payload: intelRes.data,
              });
            } else if (intelRes?.error && isSubscribed) {
              dispatch({
                type: 'LOAD_FARM_INTELLIGENCE_FAILED',
                error: intelRes.error,
              });
            }
          } catch (intelErr: any) {
            console.warn("Farm intelligence fetch error:", intelErr);
            if (isSubscribed) {
              dispatch({
                type: 'LOAD_FARM_INTELLIGENCE_FAILED',
                error: intelErr,
              });
            }
          }

          // Fetch growth stages for this selected crop
          let fetchedStages: GrowthStageEntity[] = [];
          try {
            const stagesRes = await getCropGrowthStages(cropId);
            if (stagesRes?.data && stagesRes.data.length > 0 && isSubscribed) {
              fetchedStages = [...stagesRes.data].sort((a, b) => (a.stage_order ?? 0) - (b.stage_order ?? 0));
              setCropStages(fetchedStages);
            }
          } catch (stagesErr) {
            console.warn('Crop growth stages fetch warning:', stagesErr);
          }

          const totalCycleDays =
            fetchedStages.reduce((sum, s) => sum + (s.duration_days || 0), 0) || 110;

          let evaluatedDays = 0;
          let evaluatedStageName = activeCrop?.growth_stage?.stage_name || 'Tillering & Vegetative';
          let evaluatedStageId: number | null = activeCrop?.growth_stage_id || activeCrop?.growth_stage?.id || null;
          let evaluatedProgress = 0;

          // Call evaluate/:farmCropId API from crop-growth controller
          if (activeCrop?.id) {
            try {
              const evalRes = await evaluateCropGrowth(activeCrop.id);
              console.log("evalRes", evalRes);
              if (evalRes?.data && isSubscribed) {
                const evalData = evalRes.data;
                if (typeof evalData.daysSincePlanting === 'number') {
                  evaluatedDays = evalData.daysSincePlanting;
                }
                if (evalData.newStage?.name) {
                  evaluatedStageName = evalData.newStage.name;
                }
                if (evalData.newStage?.id) {
                  evaluatedStageId = evalData.newStage.id;
                }
                evaluatedProgress = Math.min(100, Math.max(5, Math.round((evaluatedDays / totalCycleDays) * 100)));
              }
            } catch (evalError) {
              console.warn('Crop growth evaluation warning:', evalError);
            }
          }

          const updatedCropProfile = {
            cropId: String(activeCrop?.crop_id || activeCrop?.crop?.id || '1'),
            cropName: activeCrop?.crop?.name || 'Rice',
            variety: activeCrop?.variety || 'Active',
            plantingDate: activeCrop?.planting_date
              ? String(activeCrop.planting_date).split('T')[0]
              : '2026-08-10',
            growthStage: evaluatedStageName,
            growthStageId: evaluatedStageId || undefined,
            growthStageProgress: evaluatedProgress,
            daysSincePlanting: evaluatedDays,
          };

          const fullFarmState = {
            ...farmData,
            crop: updatedCropProfile,
          };

          dispatch({ type: 'SET_MY_FARM_DATA', payload: fullFarmState });

          updateFarm({
            farmName: farmData.name,
            size: areaNum,
            sizeUnit: (farmData.area_unit as any) || 'acres',
            location: {
              name: farmData.name || 'Farm',
              district: '',
              state: 'Kerala',
              country: 'India',
              latitude: Number(farmData.latitude) || 10.0159,
              longitude: Number(farmData.longitude) || 76.3419,
            },
            crop: updatedCropProfile,
            soil: {
              soilType: (farmData.soil_type as any) || 'Clayey',
              ph: Number(farmData.soilPh) || 6.5,
              hasSoilTestResults: true,
            },
            irrigation: (farmData.irrigation_type as any) || 'Rainfed',
            practice: (farmData.farming_practice as any) || 'Conventional',
          });
        } else if (res?.error) {
          setFarmDetailsError(res.error.message);
        }
      } catch (err: any) {
        if (isSubscribed) {
          setFarmDetailsError(err.message || 'Failed to fetch farm details');
        }
      } finally {
        if (isSubscribed) {
          setIsLoadingFarmDetails(false);
        }
      }
    };

    loadFarmDetails();

    return () => {
      isSubscribed = false;
    };
  }, [selectedFarmId]);

  // Derive active values (state from local storage / API takes precedence, fallback to context)
  const activeFarm = (state.farm || []) as any;
  const activeAdvisories = state.advisories || advisories;

  const farmDisplayName = activeFarm?.name || activeFarm?.farmName || '';
  const farmArea = activeFarm?.area || activeFarm?.size || fertilizerArea || 2.0;
  const farmAreaUnit = activeFarm?.area_unit || activeFarm?.sizeUnit || '';
  const farmCropName = activeFarm?.crop?.cropName || activeFarm?.crops?.[0]?.crop?.name || '';
  const farmCropVariety = activeFarm?.crop?.variety || activeFarm?.crops?.[0]?.variety || '';
  const farmGrowthStage = activeFarm?.crop?.growthStage || activeFarm?.crops?.[0]?.growth_stage?.stage_name || '';
  const farmSoilType = activeFarm?.soil?.soilType || activeFarm?.soil_type || '';
  const farmSoilPh = activeFarm?.soil?.ph || activeFarm?.soilPh || 6.5;
  const farmLat = typeof (activeFarm?.location?.latitude ?? activeFarm?.latitude) === 'number'
    ? Number(activeFarm?.location?.latitude ?? activeFarm?.latitude).toFixed(3)
    : '';
  const farmLng = typeof (activeFarm?.location?.longitude ?? activeFarm?.longitude) === 'number'
    ? Number(activeFarm?.location?.longitude ?? activeFarm?.longitude).toFixed(3)
    : '';
  const farmLocationName = activeFarm?.location?.name || activeFarm?.name || '';
  const farmLocationState = activeFarm?.location?.state || '';

  const userEntity = state.user as any;
  const displayName = userEntity?.first_name
    ? `${userEntity.first_name} ${userEntity.last_name || ''}`.trim()
    : userEntity?.firstName
      ? `${userEntity.firstName} ${userEntity.lastName || ''}`.trim()
      : user.firstName
        ? `${user.firstName} ${user.lastName}`
        : '';

  const userEmail = userEntity?.email || user.email || '';
  const userPhone = userEntity?.phone_number || userEntity?.phone || user.phone || '';
  const userRole = userEntity?.role || '';

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

  const totalCycleDays =
    cropStages.reduce((sum, s) => sum + (s.duration_days || 0), 0) || 110;

  // Active growth stage index calculation
  const activeCropStageId =
    activeFarm?.crop?.growthStageId ||
    activeFarm?.crops?.[0]?.growth_stage_id ||
    activeFarm?.crops?.[0]?.growth_stage?.id;
  const currentStageName = (farmGrowthStage || '').toLowerCase();

  let activeStageIndex = -1;
  if (cropStages.length > 0) {
    // 1. Try finding by stage_name match
    activeStageIndex = cropStages.findIndex((s) => {
      const name = (s.stage_name || '').toLowerCase();
      return (
        name === currentStageName ||
        (name.length > 0 && currentStageName.includes(name)) ||
        (currentStageName.length > 0 && name.includes(currentStageName))
      );
    });

    // 2. If not found, try by stage ID
    if (activeStageIndex === -1 && activeCropStageId) {
      activeStageIndex = cropStages.findIndex((s) => s.id === activeCropStageId);
    }

    // 3. If not found, compute by cumulative days
    if (activeStageIndex === -1) {
      let cum = 0;
      const days = Number(activeFarm?.crop?.daysSincePlanting) || 0;
      for (let i = 0; i < cropStages.length; i++) {
        cum += cropStages[i].duration_days || 0;
        if (days <= cum || i === cropStages.length - 1) {
          activeStageIndex = i;
          break;
        }
      }
    }

    if (activeStageIndex === -1) activeStageIndex = 0;
  }

  const rainProbability = getRainProbability(state?.weather?.weather?.hourly || [], 24);



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
                <span>{t('dashboard.local_storage_connected')}</span>
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
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium flex items-center gap-1.5">
            {isLoadingFarmDetails && <Loader2 className="w-3 h-3 text-emerald-600 animate-spin" />}
            <span>{t('navigation.active_farm')}: <span className="font-bold text-slate-900">{farmDisplayName}</span></span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
            {t('navigation.crops')}: <span className="font-bold">{farmCropName}</span> ({farmCropVariety})
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
                {t('dashboard.live_telemetry')}
              </span>
              {isLoadingFarmDetails ? (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> {t('dashboard.loading_farm_details')}
                </span>
              ) : (
                <span className="text-xs text-slate-500 font-medium">
                  {t('dashboard.last_updated')}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading">
              {farmDisplayName}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-600">
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <MapPin className="w-4 h-4 text-emerald-600" />
                {farmLocationName}{farmLocationState ? `, ${farmLocationState}` : ''} ({farmLat}°N, {farmLng}°E)
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <Map className='w-5 h-5 text-emerald-600' /> {farmArea} {farmAreaUnit}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-emerald-700">
                {CropIcon(farmCropName)} {farmCropName} ({farmCropVariety})
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Shovel className='w-5 h-5 text-emerald-600' /> {farmSoilType} (pH {farmSoilPh})
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3 sm:w-auto">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex-1 sm:flex-initial py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>{t('dashboard.ask_ai_agronomist')}</span>
            </button>

            <Link
              to="/onboarding/start"
              className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-4 h-4 text-slate-500" />
              <span>{t('dashboard.adjust_parameters')}</span>
            </Link>
          </div>
        </div>

        {/* Growth Stage Progress Bar */}
        <div className="mt-6 pt-5 border-t border-emerald-100/80">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-emerald-900 font-bold flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-600" />
              {t('dashboard.current_stage')}: {farmGrowthStage}
            </span>
            <span className="text-slate-600">
              {t('dashboard.stage_cycle_info', {
                day: activeFarm?.crop?.daysSincePlanting || 0,
                total: totalCycleDays,
                date: activeFarm?.crop?.plantingDate || '10 Aug 2026',
              })}
            </span>
          </div>

          <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden flex shadow-inner">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${activeFarm?.crop?.growthStageProgress || 35}%` }}
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap justify-between gap-2 text-[11px] font-medium text-slate-500 mt-2 px-1">
            {cropStages.length > 0 ? (
              cropStages.map((stage, idx) => {
                const order = stage.stage_order ?? idx + 1;
                const isActive = idx === activeStageIndex;
                let startDay = 0;
                for (let i = 0; i < idx; i++) {
                  startDay += cropStages[i].duration_days || 0;
                }
                const endDay = startDay + (stage.duration_days || 0);

                return (
                  <span
                    key={stage.id ?? idx}
                    className={
                      isActive
                        ? 'font-bold text-emerald-700 flex items-center gap-1 shrink-0'
                        : 'text-slate-500 shrink-0'
                    }
                  >
                    {isActive ? '▶ ' : ''}{order}. {stage.stage_name}{' '}
                    {isActive
                      ? `(${t('common.active')})`
                      : `(${t('common.day_number', { count: startDay })}${stage.duration_days ? `-${endDay}` : ''})`}
                  </span>
                );
              })
            ) : (
              <>
                <span>1. Seedling ({t('common.day_number', { count: '0-20' })})</span>
                <span className="font-bold text-emerald-700">▶ 2. Tillering ({t('common.active')})</span>
                <span>3. Panicle Flowering ({t('common.day_number', { count: 55 })})</span>
                <span>4. Ripening ({t('common.day_number', { count: 85 })})</span>
                <span>5. Harvest ({t('common.day_number', { count: 110 })})</span>
              </>
            )}
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
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-heading">
                    {t('weather.title')}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {t('weather.subtitle', { location: farmLocationName })}
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {t('weather.chance_of_rain', { probability: rainProbability })}
              </span>
            </div>

            {/* Current Metrics */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/60 to-emerald-50/60 border border-amber-200/60 flex items-center justify-between">
              <div>
                <span className="text-4xl font-extrabold text-slate-900 font-heading">
                  {state?.weather?.weather?.current?.temperature_2m}°C
                </span>
              </div>
              <span className="text-4xl">
                {getCurrentWeatherIcon(
                  state?.weather?.weather?.current?.observed_at,
                  state?.weather?.weather?.current?.temperature_2m ?? weather.temp,
                  state?.weather?.weather?.current?.rain,
                  state?.weather?.weather?.current?.precipitation
                )}
              </span>
            </div>

            {/* Weather Telemetry Matrix */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">
                  {t('weather.humidity')}
                </span>
                <span className="text-base font-bold text-slate-800">
                  {state?.weather?.weather?.current?.relative_humidity_2m}%
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">
                  {t('weather.wind_speed')}
                </span>
                <span className="text-base font-bold text-slate-800">
                  {state?.weather?.weather?.current?.wind_speed_10m} km/h
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">
                  {t('weather.soil_moisture')}
                </span>
                <span className="text-base font-bold text-emerald-700">
                  {state?.weather?.currentSoilMoisture?.soilMoisture0To1cm != null
                    ? `${Math.round(state.weather.currentSoilMoisture.soilMoisture0To1cm * 100)}%`
                    : '--'}
                </span>
              </div>
            </div>

            {/* Hourly Rain Forecast Strip */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-semibold text-slate-600 block">
                {t('weather.hourly_radar')}
              </span>
              {upcomingHourlyWeather.length > 0 ? (
                <Carousel
                  opts={{
                    align: 'start',
                    dragFree: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2 pb-1">
                    {upcomingHourlyWeather.map((h, i) => (
                      <CarouselItem key={h.id || i} className="pl-2 basis-auto">
                        <div className="select-none p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center gap-1 text-center shrink-0 min-w-[62px]">
                          <span className="text-[11px] font-semibold text-slate-600">
                            {formatHourlyTime(h.forecast_time)}
                          </span>
                          <span className="text-lg">
                            {getHourlyWeatherIcon(h.precipitation_probability, h.rain || h.precipitation, h.forecast_time)}
                          </span>
                          <span className="text-[11px] font-bold text-slate-900">
                            {h.temperature_2m != null ? `${Math.round(h.temperature_2m)}°` : '--'}
                          </span>
                          <span className="text-[10px] text-blue-600 font-semibold">
                            {h.precipitation_probability != null ? `${Math.round(h.precipitation_probability)}%` : '0%'}
                          </span>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              ) : (
                <div className="text-xs text-slate-400 py-3 text-center w-full">
                  {state?.loading ? t('weather.loading_radar') : t('weather.no_upcoming_radar')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Triggered Rules (7 Cols) */}
        <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-md border border-slate-200/80 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-heading">
                    {t('risk_engine.title')}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {t('risk_engine.subtitle', { farmName: state?.intelligence?.farmName || farmLocationName })}
                  </span>
                </div>
              </div>

              {state?.intelligenceLoading ? (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('risk_engine.evaluating')}
                </span>
              ) : (state?.intelligence?.results?.flatMap(r => r.triggeredRisks || [])?.length ?? 0) > 0 ? (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {(state?.intelligence?.results?.flatMap(r => r.triggeredRisks || [])?.length ?? 0) === 1
                    ? t('risk_engine.risk_triggered_one')
                    : t('risk_engine.risk_triggered_other', { count: (state?.intelligence?.results?.flatMap(r => r.triggeredRisks || [])?.length ?? 0) })}
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {t('risk_engine.optimal_parameters')}
                </span>
              )}
            </div>

            {/* Content Body */}
            {state?.intelligenceLoading ? (
              <div className="py-14 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">{t('risk_engine.evaluating_rules')}</span>
              </div>
            ) : (state?.intelligence?.results && state.intelligence.results.length > 0) ? (
              <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
                {state.intelligence.results.map((cropRes, cropIdx) => {
                  const hasRisks = Boolean(cropRes.triggeredRisks && cropRes.triggeredRisks.length > 0);
                  return (
                    <div key={cropIdx} className="space-y-3">
                      {cropRes.growthStage && (
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-200/60">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>{t('risk_engine.growth_stage_label')} <span className="font-bold text-slate-900">{cropRes.growthStage}</span></span>
                          </div>
                          {cropRes.current && (
                            <span className="text-[11px] text-slate-500 font-medium">
                              {t('risk_engine.temp_humidity', { temp: cropRes.current.temperature, humidity: cropRes.current.humidity })}
                            </span>
                          )}
                        </div>
                      )}

                      {hasRisks ? (
                        <div className="space-y-2">
                          {cropRes.triggeredRisks.map((risk, rIdx) => {
                            const level = (risk.riskLevel || '').toUpperCase();
                            const isHigh = level === 'HIGH' || level === 'CRITICAL';
                            const isMedium = level === 'MEDIUM' || level === 'MODERATE';
                            const badgeBg = isHigh
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : isMedium
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-blue-100 text-blue-800 border-blue-200';
                            const cardStyle = isHigh
                              ? 'border-rose-200 bg-rose-50/40'
                              : isMedium
                                ? 'border-amber-200 bg-amber-50/40'
                                : 'border-slate-200 bg-slate-50/60';

                            return (
                              <div
                                key={rIdx}
                                className={`p-3 rounded-2xl border ${cardStyle} flex flex-col gap-1.5 transition-all hover:shadow-xs`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${badgeBg}`}>
                                      {risk.riskLevel || 'ALERT'}
                                    </span>
                                    {risk.category && (
                                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-200/60 px-2 py-0.5 rounded-md">
                                        {risk.category}
                                      </span>
                                    )}
                                    <span className="text-xs font-mono font-bold text-slate-800">
                                      {risk.ruleCode}
                                    </span>
                                  </div>
                                  {risk.occurrences && risk.occurrences.length > 0 && (
                                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
                                      {risk.occurrences.length === 1
                                        ? t('risk_engine.alert_instances_one')
                                        : t('risk_engine.alert_instances_other', { count: risk.occurrences.length })}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-700 leading-snug font-medium">
                                  {risk.message}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/40 flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div className="text-xs text-emerald-900">
                            <span className="font-bold block">{t('risk_engine.no_risks_title')}</span>
                            <span className="text-emerald-700 text-[11px]">{t('risk_engine.no_risks_desc', { stage: cropRes.growthStage || t('dashboard.current_stage') })}</span>
                          </div>
                        </div>
                      )}

                      {/* AI Generated Advisory */}
                      {cropRes.advisory && (
                        <div className="p-3.5 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 to-purple-50/90 text-xs text-indigo-950 space-y-1.5 shadow-xs">
                          <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span>{t('risk_engine.ai_advisory_title')}</span>
                          </div>
                          <p className="text-xs leading-relaxed text-indigo-900/90 whitespace-pre-line">
                            {cropRes.advisory}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">{t('risk_engine.ready_title')}</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  {t('risk_engine.ready_desc')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Satellite NDVI & Vegetation Telemetry (7 Cols) */}
      <div className="hidden lg:col-span-7 bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-md border border-slate-200/80 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Satellite className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base font-heading">
                  {t('satellite.title')}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  {t('satellite.subtitle', { lastPass: satelliteData.satelliteLastPass })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t('satellite.ndvi_trend', { trend: satelliteData.ndviTrend })}</span>
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
                  {t('satellite.field_mapping')}
                </span>
              </div>
              <span className="font-mono text-[11px] bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                {t('satellite.res')}
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
              <span>{t('satellite.canopy_density', { density: satelliteData.canopyDensity })}</span>
              <span>{t('satellite.water_stress', { level: satelliteData.waterStressLevel })}</span>
            </div>
          </div>

          {/* Satellite Telemetry Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                {t('satellite.health_score')}
              </span>
              <span className="text-xl font-extrabold text-emerald-900 font-heading">
                {satelliteData.overallHealthScore}/100
              </span>
              <span className="text-[10px] text-emerald-600 block">{t('satellite.vigorous')}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-600 uppercase block">
                {t('satellite.avg_ndvi')}
              </span>
              <span className="text-xl font-extrabold text-slate-900 font-heading">
                {satelliteData.vegetationIndex}
              </span>
              <span className="text-[10px] text-slate-500 block">{t('satellite.chlorophyll_dense')}</span>
            </div>

            <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 text-center">
              <span className="text-[11px] font-bold text-teal-800 uppercase block">
                {t('satellite.water_index')}
              </span>
              <span className="text-xl font-extrabold text-teal-900 font-heading">
                0.68
              </span>
              <span className="text-[10px] text-teal-600 block">{t('satellite.sufficient_moisture')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. AI Crop Disease & Pest Diagnostic */}
      <DiseaseDiagnostic state={state} />

      {/* 4. Actionable Farm Advisory Feed (The Core Decision Engine) */}
      <div className="hidden bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                {t('advisories.title')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t('advisories.subtitle', { crop: farmCropName, location: farmLocationName })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFertilizerModal(true)}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('fertilizer_modal.title')}</span>
            </button>
            <button
              onClick={refreshAdvisories}
              className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title={t('advisories.refresh')}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Advisory List Cards */}
        <div className="space-y-4">
          {activeAdvisories.map((adv) => {
            const isDone = completedTasks.includes(adv.id);
            const priorityKey = (adv.priority || 'medium').toLowerCase();
            const priorityText = priorityKey === 'high'
              ? t('advisories.priorities.high')
              : priorityKey === 'low'
                ? t('advisories.priorities.low')
                : t('advisories.priorities.medium');

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
                          {priorityText}
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
                    <span>{isDone ? t('common.action_completed') : t('common.mark_as_done')}</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 mb-3 pl-0 sm:pl-10">
                  {adv.description}
                </p>

                {/* Recommended Action Pill */}
                <div className="sm:ml-10 p-3 bg-white rounded-xl border border-slate-200/90 flex items-start gap-2 text-xs">
                  <span className="font-bold text-emerald-800 uppercase tracking-wider shrink-0 bg-emerald-50 px-2 py-0.5 rounded">
                    {t('advisories.action_step')}
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
                  {t('fertilizer_modal.title')}
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
              {t('fertilizer_modal.subtitle', { crop: farmCropName, stage: farmGrowthStage || farmCropVariety })}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('fertilizer_modal.plot_area')}
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
                <span className="font-semibold text-slate-800">{t('fertilizer_modal.urea')}</span>
                <span className="font-bold text-emerald-900 text-sm">{calculatedUrea} kg</span>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800">{t('fertilizer_modal.dap')}</span>
                <span className="font-bold text-teal-900 text-sm">{calculatedDAP} kg</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800">{t('fertilizer_modal.mop')}</span>
                <span className="font-bold text-amber-900 text-sm">{calculatedMOP} kg</span>
              </div>
            </div>

            <button
              onClick={() => setShowFertilizerModal(false)}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700"
            >
              {t('fertilizer_modal.apply_button')}
            </button>
          </div>
        </div>
      )}

      {/* AI Agronomist Chat Modal */}
      <AgronomistModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} state={state} />
    </div>
  );
};
