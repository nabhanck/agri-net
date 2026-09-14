import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Globe, ArrowRight, ArrowLeft, Shield, Loader2 } from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { useSetVoiceScope } from '../context/VoiceScopeContext';
import { signUp } from './welcome/api';
import { toast } from '../components/ui/toast';
import type { Language } from '../types';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useFarm();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    password: user.password || '',
    preferredLanguage: (user.preferredLanguage || 'en') as Language,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const languageOptions = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    if (!validate()) {
      toast.add({
        title: 'Validation Error',
        description: 'Please correct the highlighted errors before submitting.',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone_number: formData.phone.trim(),
        preferredLanguage: formData.preferredLanguage,
        role: 'farmer',
      });

      if (result.error) {
        toast.add({
          title: 'Sign Up Failed',
          description: result.error.message,
          type: 'error',
        });
        return;
      }

      if (result.data) {
        toast.add({
          title: 'Account Created',
          description: result.data.message || 'Welcome to AgriNet! Setting up your onboarding...',
          type: 'success',
        });

        // Persist token and user details to localStorage
        if (result.data.access_token) {
          localStorage.setItem('access_token', result.data.access_token);
        }
        if (result.data.user) {
          localStorage.setItem('agrinet_user', JSON.stringify(result.data.user));
        }

        // Update global user state in FarmContext
        setUser({
          firstName: result.data.user?.first_name || formData.firstName,
          lastName: result.data.user?.last_name || formData.lastName,
          email: result.data.user?.email || formData.email,
          phone: result.data.user?.phone_number || formData.phone,
          password: formData.password,
          preferredLanguage: (result.data.user?.preferred_language as Language) || formData.preferredLanguage,
        });

        navigate('/onboarding/start');
      }
    } catch (error: any) {
      toast.add({
        title: 'Sign Up Error',
        description: error?.message || 'An unexpected error occurred during signup.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Register scoped voice assistant for Registration Form
  useSetVoiceScope(
    {
      screen: 'REGISTER',
      title: 'Registration Form',
      scopeCategory: 'REGISTER_FORM',
      allowedActions: ['FILL_FORM', 'NEXT_STEP', 'SUBMIT', 'PREV_STEP'],
      availableFields: [
        { name: 'firstName', description: 'Farmer first name', type: 'string', example: 'Ravi' },
        { name: 'lastName', description: 'Farmer last name / surname', type: 'string', example: 'Kumar' },
        { name: 'email', description: 'Email address', type: 'string', example: 'ravi@example.com' },
        { name: 'phone', description: 'Mobile / phone number', type: 'string', example: '+91 9876543210' },
        { name: 'preferredLanguage', description: 'Language (English, Hindi, Malayalam, Tamil, Telugu, Kannada, Marathi)', type: 'select' },
      ],
      sampleCommands: {
        en: ['"My name is Anita Rao"', '"Phone 9876543210"', '"Continue / Next"'],
        hi: ['"मेरा नाम अनीता राव है"', '"फ़ोन नंबर 9876543210"', '"आगे बढ़ो"'],
      },
      onFieldFill: (field, value) => {
        const k = field.toLowerCase();
        if (k.includes('first')) {
          setFormData((prev) => ({ ...prev, firstName: String(value) }));
        } else if (k.includes('last')) {
          setFormData((prev) => ({ ...prev, lastName: String(value) }));
        } else if (k.includes('email')) {
          setFormData((prev) => ({ ...prev, email: String(value) }));
        } else if (k.includes('phone')) {
          setFormData((prev) => ({ ...prev, phone: String(value) }));
        } else if (k.includes('lang')) {
          const val = String(value).toLowerCase();
          let langCode: Language = 'en';
          if (val.includes('hi')) langCode = 'hi';
          else if (val.includes('ml') || val.includes('mal')) langCode = 'ml';
          else if (val.includes('ta') || val.includes('tam')) langCode = 'ta';
          else if (val.includes('te') || val.includes('tel')) langCode = 'te';
          else if (val.includes('kn') || val.includes('kan')) langCode = 'kn';
          else if (val.includes('mr') || val.includes('mar')) langCode = 'mr';
          setFormData((prev) => ({ ...prev, preferredLanguage: langCode }));
        }
        return true;
      },
      onNextStep: () => {
        handleSubmit();
      },
      onSubmit: () => {
        handleSubmit();
      },
      onPrevStep: () => {
        navigate('/');
      },
    },
    [formData]
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 bg-gradient-to-b from-emerald-50/50 via-slate-50 to-slate-100">
      <div className="w-full max-w-lg">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to welcome</span>
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
          {/* Header */}
          <div className="mb-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Step 0 of 6 · Farmer Profile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
              Create your account
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Join thousands of farmers making data-driven decisions every season.
            </p>
          </div>

          {/* Form */}
          <form autoComplete="off" onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  First name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm font-medium outline-none transition-all"
                    placeholder="Ravi"
                  />
                </div>
                {errors.firstName && <p className="text-xs text-rose-500 mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Last name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm font-medium outline-none transition-all"
                    placeholder="Kumar"
                  />
                </div>
                {errors.lastName && <p className="text-xs text-rose-500 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  name="register_email"
                  autoComplete='off'
                  disabled={isLoading}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm font-medium outline-none transition-all disabled:opacity-60"
                  placeholder="ravi@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  name='register_phone'
                  autoComplete='off'
                  required
                  disabled={isLoading}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm font-medium outline-none transition-all disabled:opacity-60"
                  placeholder="+91 98765 43210"
                />
              </div>
              {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="register_password"
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm font-medium outline-none transition-all disabled:opacity-60"
                  placeholder="•••••••••"
                />
              </div>
              {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
            </div>

            {/* Preferred Language Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Preferred language
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  disabled={isLoading}
                  value={formData.preferredLanguage}
                  onChange={(e) =>
                    setFormData({ ...formData, preferredLanguage: e.target.value as Language })
                  }
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm font-medium outline-none transition-all appearance-none cursor-pointer disabled:opacity-60"
                >
                  {languageOptions.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label} ({opt.native})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-70 text-white font-bold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
