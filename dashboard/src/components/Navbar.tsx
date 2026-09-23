import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, MapPin, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFarm } from '../context/FarmContext';
import { getFarms } from '../pages/dashboard/api';
import { LanguageSelector } from './LanguageSelector';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const {
    farm,
    user,
    selectedFarmId,
    setSelectedFarmId,
    farmsList,
    setFarmsList,
  } = useFarm();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  const [isLoadingFarms, setIsLoadingFarms] = useState(false);

  useEffect(() => {
    const fetchUserFarms = async () => {
      try {
        let userId: number | null = null;

        // 1. Check saved auth user in localStorage
        const savedAuthUser = localStorage.getItem('agrinet_user');
        if (savedAuthUser) {
          const parsed = JSON.parse(savedAuthUser);
          if (parsed?.id) userId = Number(parsed.id);
        }

        // 2. Fallback to user in context
        if (!userId && (user as any)?.id) {
          userId = Number((user as any).id);
        }

        // 3. Fallback default user ID
        if (!userId) {
          userId = 1;
        }

        setIsLoadingFarms(true);
        const res = await getFarms(userId);
        if (res?.data && res.data.length > 0) {
          setFarmsList(res.data);

          // Select first farm as default if no valid selection exists
          const isValidSelection = selectedFarmId && res.data.some((f) => f.id === selectedFarmId);
          if (!isValidSelection) {
            setSelectedFarmId(res.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load farms in Navbar:', error);
      } finally {
        setIsLoadingFarms(false);
      }
    };

    fetchUserFarms();
  }, [user]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-heading">
              Agri<span className="text-emerald-600">Net</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {t('navigation.farm_intelligence')}
            </span>
          </div>
        </Link>

        {/* Center Farm Switcher Select Box */}
        {farmsList && farmsList.length > 0 ? (
          <div className="flex items-center gap-2">
            <div className="relative flex items-center bg-emerald-50/90 hover:bg-emerald-100/80 border border-emerald-200/90 rounded-2xl px-3 py-1.5 shadow-xs transition-colors">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mr-2" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800/80 leading-none">
                  {t('navigation.active_farm')}
                </span>
                <div className="relative flex items-center">
                  <select
                    value={selectedFarmId ?? farmsList[0]?.id}
                    onChange={(e) => setSelectedFarmId(Number(e.target.value))}
                    disabled={isLoadingFarms}
                    className="appearance-none bg-transparent text-xs sm:text-sm font-bold text-slate-900 pr-6 outline-none cursor-pointer focus:ring-0 leading-tight"
                    aria-label={t('navigation.select_farm')}
                  >
                    {farmsList.map((f) => {
                      const cropName = f.crops?.[0]?.crop?.name || f.crops?.[0]?.variety;
                      return (
                        <option key={f.id} value={f.id} className="text-slate-800 bg-white font-medium py-1">
                          {f.name} {cropName ? `· 🌾 ${cropName}` : ''} ({f.area || '2'} {f.area_unit || 'acres'})
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-700 absolute right-0 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        ) : farm.location.name ? (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{farm.location.name}, {farm.location.state}</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-600 font-semibold">{farm.size} {farm.sizeUnit}</span>
            {farm.crop.cropName && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-900 font-semibold">{farm.crop.cropName} ({farm.crop.variety || 'Active'})</span>
              </>
            )}
          </div>
        ) : null}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <LanguageSelector />

          {/* Link to dashboard or restart */}
          {farm.isReady && !isDashboard && (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/30 transition-all hover:scale-102"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{t('navigation.go_to_dashboard')}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
