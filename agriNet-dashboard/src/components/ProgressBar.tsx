import React from 'react';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

const STEPS = [
  { step: 1, name: 'Location' },
  { step: 2, name: 'Crops' },
  { step: 3, name: 'Variety & Stage' },
  { step: 4, name: 'Soil' },
  { step: 5, name: 'Irrigation' },
  { step: 6, name: 'Practices' },
];

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps = 6 }) => {
  const percentage = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <div className="w-full mb-8">
      {/* Top Header info */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
        <span className="text-emerald-700 font-bold uppercase tracking-wider">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-slate-600 font-medium">{percentage}% Completed</span>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step Dots & Labels */}
      <div className="hidden sm:flex items-center justify-between mt-3 px-1">
        {STEPS.map((s) => {
          const isDone = s.step < currentStep;
          const isCurrent = s.step === currentStep;

          return (
            <div key={s.step} className="flex flex-col items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500 ring-offset-2 font-black'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : s.step}
              </div>
              <span
                className={`text-[11px] font-medium transition-colors ${
                  isCurrent
                    ? 'text-emerald-800 font-bold'
                    : isDone
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                {s.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
