import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CloudSun, Satellite, Sprout, ArrowRight, ShieldCheck, Sparkles, Activity, Layers, Droplets } from 'lucide-react';
import { SignInModal } from '../components/SignInModal';
import { useSetVoiceScope } from '../context/VoiceScopeContext';

export const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  useSetVoiceScope(
    {
      screen: 'WELCOME',
      title: 'Welcome Screen',
      scopeCategory: 'WELCOME',
      allowedActions: ['NAVIGATE', 'NEXT_STEP', 'CUSTOM'],
      availableFields: [],
      sampleCommands: {
        en: ['"Get Started"', '"Register as Farmer"', '"Sign In"'],
        hi: ['"शुरू करें"', '"रजिस्टर करें"', '"साइन इन"'],
      },
      onNextStep: () => {
        navigate('/register');
      },
      onCustomAction: (action) => {
        if (action.toLowerCase().includes('signin') || action.toLowerCase().includes('sign_in') || action.toLowerCase().includes('login')) {
          setIsSignInOpen(true);
        }
      },
    },
    []
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-b from-emerald-100/40 via-emerald-50/20 to-slate-50">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="w-full max-w-2xl mx-auto text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
        {/* Brand Icon & Name */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-100/70 border border-emerald-200/80 shadow-xs mb-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-emerald-900 tracking-wide uppercase">
            AgriNet Platform
          </span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 font-heading leading-tight">
            Agri<span className="text-emerald-600">Net</span>
          </h1>

          <p className="text-xl sm:text-2xl font-bold text-emerald-800 font-heading">
            Smarter decisions for healthier farms.
          </p>

          <p className="text-base sm:text-lg text-slate-600 max-w-lg mx-auto leading-relaxed">
            Get localized agricultural intelligence using weather, soil and satellite data.
          </p>
        </div>

        {/* Feature Badges Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto py-2">
          {/* Weather */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-emerald-400 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CloudSun className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
              🌦 Weather
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Hyper-local radar</span>
          </div>

          {/* Satellite */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-emerald-400 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Satellite className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
              🛰 Satellite
            </span>
            <span className="text-[11px] text-slate-500 font-medium">NDVI crop health</span>
          </div>

          {/* Soil */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-emerald-400 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
              🌱 Soil
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Moisture & pH</span>
          </div>
        </div>

        {/* Highlight Banner / Core Value Proposition */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 sm:p-5 rounded-2xl shadow-xl shadow-emerald-950/20 max-w-xl mx-auto flex items-center justify-center gap-3 border border-emerald-700/50">
          <Sparkles className="w-5 h-5 text-emerald-300 shrink-0 animate-pulse" />
          <p className="text-sm sm:text-base font-semibold tracking-wide">
            "We turn farm data into actionable decisions."
          </p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="space-y-4 pt-2 max-w-md mx-auto">
          <Link
            to="/register"
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-lg shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all hover:scale-102 cursor-pointer group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Secondary Sign In link */}
          <div className="pt-2">
            <p className="text-sm text-slate-600">
              Already a farmer?{' '}
              <button
                type="button"
                onClick={() => setIsSignInOpen(true)}
                className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* Trust & Localized Intelligence highlights */}
        <div className="pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-2 text-center text-xs text-slate-500 max-w-lg mx-auto">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Free for Farmers</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Real-time Alerts</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Droplets className="w-4 h-4 text-emerald-600" />
            <span>Smart Irrigation</span>
          </div>
        </div>
      </div>

      {/* Sign In Modal */}
      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </div>
  );
};
