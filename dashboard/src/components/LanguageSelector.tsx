import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Globe } from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import type { Language } from '../types';

interface LanguageSelectorProps {
  className?: string;
  showIcon?: boolean;
}

export const LANGUAGES: { code: 'en' | 'hi' | 'ml'; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  showIcon = true,
}) => {
  const { i18n, t } = useTranslation();
  const { setLanguage: setContextLanguage } = useFarm();

  // Normalize language code to 'en', 'hi', or 'ml'
  const currentLang = i18n.language?.startsWith('hi')
    ? 'hi'
    : i18n.language?.startsWith('ml')
      ? 'ml'
      : 'en';

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as 'en' | 'hi' | 'ml';
    i18n.changeLanguage(newLang);
    localStorage.setItem('agrinet_language', newLang);
    if (setContextLanguage) {
      setContextLanguage(newLang as Language);
    }
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      {showIcon && (
        <Globe className="w-4 h-4 text-slate-500 absolute left-2.5 pointer-events-none" />
      )}
      <select
        value={currentLang}
        onChange={handleLanguageChange}
        className={`appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium ${showIcon ? 'pl-8 pr-7' : 'px-3'
          } py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors`}
        aria-label={t('navigation.select_language')}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.native} ({l.label})
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 text-slate-400 pointer-events-none text-xs" />
    </div>
  );
};
