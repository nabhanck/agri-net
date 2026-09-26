import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sprout, MapPin, LayoutDashboard, ChevronDown, User, LogOut, Phone, Mail, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFarm } from '../context/FarmContext';
import { getFarms } from '../pages/dashboard/api';
import { LanguageSelector } from './LanguageSelector';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    farm,
    user,
    selectedFarmId,
    setSelectedFarmId,
    farmsList,
    setFarmsList,
    resetAll,
  } = useFarm();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  const [isLoadingFarms, setIsLoadingFarms] = useState(false);

  // Retrieve stored user profile from localStorage as fallback
  const authUser = useMemo(() => {
    try {
      const saved = localStorage.getItem('agrinet_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [user]);

  const firstName = user?.firstName || authUser?.first_name || '';
  const lastName = user?.lastName || authUser?.last_name || '';
  const farmerName = `${firstName} ${lastName}`.trim() || 'Ravi Kumar';
  const farmerEmail = user?.email || authUser?.email || 'farmer@agrinet.io';
  const farmerPhone = user?.phone || authUser?.phone_number || '+91 98765 43210';

  const initials = useMemo(() => {
    const parts = farmerName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return farmerName.slice(0, 2).toUpperCase() || 'AG';
  }, [farmerName]);

  const handleSignOut = () => {
    resetAll();
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage on sign out:', e);
    }
    navigate('/');
  };

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

          {/* Farmer Avatar Popover */}
          <Popover>
            <PopoverTrigger
              className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs shadow-sm hover:shadow-md hover:scale-105 transition-all border-2 border-emerald-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 shrink-0"
              aria-label={t('navigation.farmer_profile', 'Farmer Profile')}
            >
              <span>{initials}</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              side="bottom"
              sideOffset={8}
              className="w-72 sm:w-80 p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-emerald-100/80 z-50 text-slate-800"
            >
              {/* Profile Card Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-600/20 shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900 text-sm truncate leading-tight">
                      {farmerName}
                    </h4>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/80">
                      <Shield className="w-2.5 h-2.5" />
                      {t('dashboard.farmer', 'Farmer')}
                    </span>
                    {farm.location?.name && (
                      <span className="text-[10px] text-slate-500 truncate">
                        • {farm.location.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Details (Email & Phone) */}
              <div className="py-3 space-y-2 text-xs">
                <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {t('navigation.email', 'Email')}
                    </p>
                    <p className="font-medium text-slate-700 truncate">{farmerEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {t('navigation.phone', 'Phone')}
                    </p>
                    <p className="font-medium text-slate-700 truncate">{farmerPhone}</p>
                  </div>
                </div>
              </div>

              {/* Sign Out Action Button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>{t('navigation.sign_out', 'Sign Out')}</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
};
