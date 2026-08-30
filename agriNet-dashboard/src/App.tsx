import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { VoiceMicButton } from './components/VoiceMicButton';
import { Welcome } from './pages/Welcome';
import { Register } from './pages/Register';
import { OnboardingLayout } from './pages/onboarding/OnboardingLayout';
import { OnboardingStart } from './pages/onboarding/OnboardingStart';
import { FarmIdentity } from './pages/onboarding/FarmIdentity';
import { CropSelection } from './pages/onboarding/CropSelection';
import { CropDetails } from './pages/onboarding/CropDetails';
import { SoilDetails } from './pages/onboarding/SoilDetails';
import { Irrigation } from './pages/onboarding/Irrigation';
import { FarmingPractice } from './pages/onboarding/FarmingPractice';
import { FarmReady } from './pages/onboarding/FarmReady';
import { Dashboard } from './pages/Dashboard';

export function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Header ONLY for Dashboard */}
      {isDashboard && <Navbar />}

      <main className="flex-1 flex flex-col">
        <Routes>
          {/* 1. First Screen: Welcome */}
          <Route path="/" element={<Welcome />} />
          <Route path="/welcome" element={<Navigate to="/" replace />} />

          {/* 2. Registration: User Details */}
          <Route path="/register" element={<Register />} />

          {/* 3. Onboarding Wizard */}
          <Route path="/onboarding" element={<OnboardingLayout />}>
            <Route index element={<Navigate to="/onboarding/start" replace />} />
            {/* Intro: Tell us about your farm */}
            <Route path="start" element={<OnboardingStart />} />
            {/* Step 1: Farm identity (Location, Size, Interactive Map) */}
            <Route path="farm-identity" element={<FarmIdentity />} />
            {/* Step 2: What are you growing? */}
            <Route path="crop-selection" element={<CropSelection />} />
            {/* Step 3: Crop details (Variety, Planting date, Stage) */}
            <Route path="crop-details" element={<CropDetails />} />
            {/* Step 4: Soil details (Type, pH, Soil test) */}
            <Route path="soil" element={<SoilDetails />} />
            {/* Step 5: Irrigation */}
            <Route path="irrigation" element={<Irrigation />} />
            {/* Step 6: Farming practice */}
            <Route path="practice" element={<FarmingPractice />} />
            {/* Step 7: Your Farm Is Ready 🌱 */}
            <Route path="ready" element={<FarmReady />} />
          </Route>

          {/* 4. Localized Intelligence Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Catch all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer ONLY for Dashboard */}
      {isDashboard && (
        <footer className="py-4 border-t border-slate-200 bg-white/70 backdrop-blur-xs text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>AgriNet © 2026 · Smarter decisions for healthier farms.</span>
            <span className="text-emerald-700 font-medium">
              Weather Radar · Sentinel Satellite NDVI · Soil Telemetry
            </span>
          </div>
        </footer>
      )}

      {/* Global Lightweight Voice Assistant Floating Button */}
      <VoiceMicButton />
    </div>
  );
}


export default App;
