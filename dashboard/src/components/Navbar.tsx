import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, Globe, MapPin, Sparkles, RefreshCw, LayoutDashboard } from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import type { Language } from '../types';

export const Navbar: React.FC = () => {
  const { farm, language, setLanguage, user, fillSampleData } = useFarm();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-heading">
              Agri<span className="text-emerald-600">Net</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Farm Intelligence
            </span>
          </div>
        </Link>

        {/* Center Farm Location Badge (when available/in dashboard) */}
        {farm.location.name && (
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
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative flex items-center">
            <Globe className="w-4 h-4 text-slate-500 absolute left-2.5 pointer-events-none" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium pl-8 pr-7 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors"
              aria-label="Select Language"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native} ({l.label})
                </option>
              ))}
            </select>
            <span className="absolute right-2 text-slate-400 pointer-events-none text-xs">▼</span>
          </div>

          {/* Quick Demo Pre-fill */}
          <button
            onClick={() => fillSampleData()}
            title="Load Ernakulam Farm Sample Data"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Load Demo Farm</span>
          </button>

          {/* Link to dashboard or restart */}
          {farm.isReady && !isDashboard && (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/30 transition-all hover:scale-102"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Go to Dashboard</span>
            </Link>
          )}

          {isDashboard && (
            <Link
              to="/onboarding/start"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Farm Setup</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
