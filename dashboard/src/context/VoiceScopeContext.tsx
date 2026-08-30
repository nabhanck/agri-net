import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface VoiceFormField {
  name: string;
  description: string;
  type?: 'string' | 'number' | 'boolean' | 'select';
  options?: string[];
  example?: string;
}

export type VoiceScopeCategory =
  | 'GLOBAL'
  | 'ONBOARDING_FORM'
  | 'REGISTER_FORM'
  | 'DASHBOARD'
  | 'WELCOME'
  | string;

export interface VoiceScopeConfig {
  screen: string;
  title?: string;
  scopeCategory: VoiceScopeCategory;
  allowedActions: Array<
    'NAVIGATE' | 'FILL_FORM' | 'NEXT_STEP' | 'PREV_STEP' | 'SUBMIT' | 'REJECT' | 'CUSTOM' | string
  >;
  availableFields: VoiceFormField[];
  sampleCommands?: {
    en: string[];
    hi: string[];
  };
  onFieldFill?: (field: string, value: any) => boolean | void;
  onNextStep?: () => void;
  onPrevStep?: () => void;
  onSubmit?: () => void;
  onCustomAction?: (action: string, target?: string, value?: any) => void;
  customInstructions?: string;
}

const DEFAULT_GLOBAL_SCOPE: VoiceScopeConfig = {
  screen: 'GLOBAL',
  title: 'AgriNet Global',
  scopeCategory: 'GLOBAL',
  allowedActions: ['NAVIGATE', 'FILL_FORM'],
  availableFields: [
    { name: 'crop', description: 'Crop name (e.g. Rice, Wheat, Corn, Cotton, Potato)', type: 'select' },
    { name: 'size', description: 'Farm acreage or hectares', type: 'number' },
    { name: 'location', description: 'Farm location or city', type: 'string' },
    { name: 'soil', description: 'Soil classification (Clayey, Loamy, Sandy, Alluvial, Red Soil, Black / Regur)', type: 'select' },
    { name: 'irrigation', description: 'Irrigation type (Rainfed, Canal, Borewell, Drip, Sprinkler)', type: 'select' },
  ],
  sampleCommands: {
    en: ['"Open Dashboard"', '"My crop is Rice"', '"Farm size 5 acres"'],
    hi: ['"डैशबोर्ड खोलो"', '"मेरी फसल चावल है"', '"खेत 5 एकड़"'],
  },
};

interface VoiceScopeContextType {
  currentScope: string;
  scopeConfig: VoiceScopeConfig;
  setVoiceScope: (config: VoiceScopeConfig) => void;
  resetVoiceScope: () => void;
}

const VoiceScopeContext = createContext<VoiceScopeContextType | undefined>(undefined);

export const VoiceScopeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scopeConfig, setScopeConfigState] = useState<VoiceScopeConfig>(DEFAULT_GLOBAL_SCOPE);

  const setVoiceScope = (config: VoiceScopeConfig) => {
    setScopeConfigState(config);
  };

  const resetVoiceScope = () => {
    setScopeConfigState(DEFAULT_GLOBAL_SCOPE);
  };

  return (
    <VoiceScopeContext.Provider
      value={{
        currentScope: scopeConfig.screen,
        scopeConfig,
        setVoiceScope,
        resetVoiceScope,
      }}
    >
      {children}
    </VoiceScopeContext.Provider>
  );
};

export const useVoiceScope = (): VoiceScopeContextType => {
  const context = useContext(VoiceScopeContext);
  if (!context) {
    throw new Error('useVoiceScope must be used within a VoiceScopeProvider');
  }
  return context;
};

/**
 * Hook for pages/components to easily register their active screen voice scope on mount and restore on unmount.
 */
export function useSetVoiceScope(config: VoiceScopeConfig, deps: any[] = []) {
  const { setVoiceScope, resetVoiceScope } = useVoiceScope();
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    setVoiceScope(configRef.current);
    return () => {
      resetVoiceScope();
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
