import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, ArrowRight, BellRing, Compass, ShieldCheck, HeartHandshake, Mic, Sparkles } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { useSetVoiceScope } from '../../context/VoiceScopeContext';
import { ConversationalInterviewModal } from '../../components/ConversationalInterviewModal';

export const OnboardingStart: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useFarm();
  const [isVoiceInterviewOpen, setIsVoiceInterviewOpen] = useState(false);

  useSetVoiceScope(
    {
      screen: 'ONBOARDING_START',
      title: 'Farm Setup: Intro',
      scopeCategory: 'ONBOARDING_FORM',
      allowedActions: ['NEXT_STEP', 'PREV_STEP', 'CUSTOM'],
      availableFields: [],
      sampleCommands: {
        en: ['"Start Voice Interview"', '"Set up my farm / Next"'],
        hi: ['"वॉइस इंटरव्यू शुरू करें"', '"फार्म सेट करें / आगे बढ़ो"'],
      },
      onNextStep: () => {
        navigate('/onboarding/farm-identity');
      },
      onPrevStep: () => {
        navigate('/register');
      },
      onCustomAction: (action) => {
        if (action.toLowerCase().includes('interview') || action.toLowerCase().includes('voice')) {
          setIsVoiceInterviewOpen(true);
        }
      },
    },
    []
  );

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/80 text-center animate-in fade-in zoom-in-95 duration-400">
      {/* Decorative Icon */}
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-600/30 animate-pulse-subtle">
        <Sprout className="w-10 h-10" />
      </div>

      {/* Greeting & Headline */}
      <div className="space-y-3 mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold border border-emerald-200">
          🌱 Welcome, {user.firstName || 'Farmer'}! Let's get started
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          Tell us about your farm
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-lg mx-auto leading-relaxed">
          We'll use this information to personalize weather alerts, crop recommendations and farm health insights.
        </p>
      </div>

      {/* Value Prop Preview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto mb-8 text-left">
        <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Weather Alerts</h4>
            <p className="text-[11px] text-slate-500">Hyperlocal rain & frost warnings</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-600 text-white shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Crop Guidance</h4>
            <p className="text-[11px] text-slate-500">Stage-specific NPK dosages</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-sky-600 text-white shrink-0">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Health Insights</h4>
            <p className="text-[11px] text-slate-500">NDVI satellite vegetation scans</p>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="max-w-md mx-auto space-y-3">
        {/* Highlighted Voice Interview Option */}
        <button
          type="button"
          onClick={() => setIsVoiceInterviewOpen(true)}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-800 hover:to-teal-900 text-white font-bold text-lg shadow-xl shadow-emerald-700/30 flex items-center justify-center gap-3 transition-all hover:scale-102 cursor-pointer group border border-emerald-400/30"
        >
          <div className="p-1 rounded-lg bg-emerald-500/30 text-amber-300">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <span>🎙️ Start Voice Guided Setup</span>
          <Sparkles className="w-4 h-4 text-amber-300 ml-auto group-hover:rotate-12 transition-transform" />
        </button>

        {/* Manual Step-by-Step Setup Option */}
        <button
          type="button"
          onClick={() => navigate('/onboarding/farm-identity')}
          className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200/80"
        >
          <span>Manual Step-by-Step Setup</span>
          <ArrowRight className="w-4 h-4 text-slate-500" />
        </button>

        <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Takes only ~2 minutes · All data kept secure & private</span>
        </p>
      </div>

      {/* Conversational Voice Interview Modal */}
      <ConversationalInterviewModal
        isOpen={isVoiceInterviewOpen}
        onClose={() => setIsVoiceInterviewOpen(false)}
      />
    </div>
  );
};
