import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, SlidersHorizontal, BookOpen, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface FloatingBottomNavProps {
  className?: string;
}

export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    {
      id: 'homepage',
      label: t('navigation.homepage') || 'Homepage',
      to: '/dashboard',
      icon: Home,
      isActive: location.pathname.startsWith('/dashboard'),
    },
    {
      id: 'rules',
      label: t('navigation.rules') || 'Rules',
      to: '/rules',
      icon: SlidersHorizontal,
      isActive: location.pathname.startsWith('/rules'),
      // badge: t('navigation.rules_badge') || 'ICAR/TNAU',
    },
    {
      id: 'publications',
      label: t('navigation.publications') || 'Publications',
      to: '/publications',
      icon: BookOpen,
      isActive: location.pathname.startsWith('/publications'),
      badge: t('navigation.new') || 'New',
    },
  ];

  return (
    <div
      className={`fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-45 pointer-events-none ${className}`}
      aria-label="Bottom Floating Navigation"
    >
      <nav className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-full bg-slate-950/90 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/40 ring-1 ring-white/10 transition-all">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <NavLink
              key={item.id}
              to={item.to}
              className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 select-none group ${active
                ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
            >
              <Icon
                className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 ${active ? 'scale-110 text-white' : 'text-slate-400 group-hover:text-emerald-300'
                  }`}
              />
              <span className="tracking-tight">{item.label}</span>

              {/* Optional Subtle Badge */}
              {item.badge && !active && (
                <span className="hidden md:inline-flex items-center text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                  {item.badge}
                </span>
              )}

              {/* Active Indicator Glow Pip */}
              {/* {active && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
              )} */}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
