import React, { useState, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { WelcomePageReducer, initialWelcomePageState } from '../pages/welcome/reducer';
import { signIn } from '../pages/welcome/api';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { fillSampleData, setUser } = useFarm();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, dispatch] = useReducer(WelcomePageReducer, initialWelcomePageState);

  if (!isOpen) return null;

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (state.error) {
      dispatch({ type: 'CLEAR_ERROR' });
    }
    if (field === 'email') {
      setEmail(value);
    } else {
      setPassword(value);
    }
  };

  const handleClose = () => {
    dispatch({ type: 'CLEAR_ERROR' });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      dispatch({
        type: 'SIGN_IN_REQUEST_FAILED',
        error: { code: 400, message: 'Please enter both email and password' },
      });
      return;
    }

    dispatch({ type: 'SIGN_IN_REQUEST' });

    const result = await signIn({
      email: email.trim(),
      password,
    });

    if (result.error) {
      dispatch({ type: 'SIGN_IN_REQUEST_FAILED', error: result.error });
      return;
    }

    if (result.data) {
      dispatch({ type: 'SIGN_IN_REQUEST_SUCCESS', login: result.data });

      // Persist token and user details to localStorage
      localStorage.setItem('access_token', result.data.access_token);
      localStorage.setItem('agrinet_user', JSON.stringify(result.data.user));

      // Update global user state in FarmContext
      setUser({
        firstName: result.data.user.first_name,
        lastName: result.data.user.last_name,
        email: result.data.user.email,
        phone: result.data.user.phone_number || '',
        preferredLanguage: (result.data.user.preferred_language as any) || 'en',
      });

      handleClose();
      navigate('/dashboard');
    }
  };

  const handleDemoSignIn = () => {
    fillSampleData();
    handleClose();
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-heading">Welcome Back, Farmer</h2>
          <p className="text-sm text-slate-500 mt-1">Sign in to access your farm intelligence dashboard</p>
        </div>

        {/* Error Alert */}
        {state.error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{state.error.message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                disabled={state.isLoading}
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm font-medium outline-none transition-all disabled:opacity-60"
                placeholder="farmer@agrinet.io"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                disabled={state.isLoading}
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm font-medium outline-none transition-all disabled:opacity-60"
                placeholder="Enter password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
              <span>Remember me</span>
            </label>
            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset instructions will be sent to your email."); }} className="text-emerald-700 font-semibold hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={state.isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer disabled:cursor-not-allowed"
          >
            {state.isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to AgriNet</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo farmer quick click */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            disabled={state.isLoading}
            onClick={handleDemoSignIn}
            className="text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 py-2 px-4 rounded-lg border border-emerald-200 w-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instant Demo: Sign in as Ravi Kumar (Ernakulam Farm)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
