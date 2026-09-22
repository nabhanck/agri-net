import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, FarmProfile, WeatherData, SatelliteNDVIData, FarmAdvisory, Language } from '../types';
import type { FarmEntity } from '../types/farm';
import { getMockWeatherForLocation, getMockSatelliteTelemetry, generateFarmAdvisories } from '../data/agriculturalData';

interface FarmContextType {
  user: UserProfile;
  setUser: (user: Partial<UserProfile>) => void;
  farm: FarmProfile;
  updateFarm: (updates: Partial<FarmProfile>) => void;
  updateLocation: (location: Partial<FarmProfile['location']>) => void;
  updateCrop: (crop: Partial<FarmProfile['crop']>) => void;
  updateSoil: (soil: Partial<FarmProfile['soil']>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  weather: WeatherData;
  satelliteData: SatelliteNDVIData;
  advisories: FarmAdvisory[];
  refreshAdvisories: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  resetAll: () => void;
  fillSampleData: () => void;
  selectedFarmId: number | null;
  setSelectedFarmId: (id: number | null) => void;
  farmsList: FarmEntity[];
  setFarmsList: (farms: FarmEntity[]) => void;
  selectedFarmDetails: FarmEntity | null;
  setSelectedFarmDetails: (farm: FarmEntity | null) => void;
}

const DEFAULT_USER: UserProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  preferredLanguage: 'en',
};

const DEFAULT_FARM: FarmProfile = {
  farmName: 'Ravi Greenfields Farm',
  location: {
    name: 'Ernakulam',
    district: 'Ernakulam',
    state: 'Kerala',
    country: 'India',
    latitude: 10.0159,
    longitude: 76.3419,
  },
  size: 2.0,
  sizeUnit: 'hectares',
  crop: {
    cropId: '',
    cropName: 'Rice',
    variety: 'Jyothi',
    plantingDate: '2026-08-10',
    growthStage: 'Tillering & Vegetative',
    growthStageProgress: 35,
    daysSincePlanting: 0,
  },
  soil: {
    soilType: 'Clayey',
    ph: 6.5,
    hasSoilTestResults: true,
    nitrogen: 'Optimal',
    phosphorus: 'Medium',
    potassium: 'Optimal',
    organicCarbon: 1.2,
  },
  irrigation: 'Rainfed',
  practice: 'Conventional',
  createdAt: new Date().toISOString(),
  isReady: false,
};

const FarmContext = createContext<FarmContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_USER = 'agrinet_user_data_v1';
const LOCAL_STORAGE_KEY_FARM = 'agrinet_farm_data_v1';
const LOCAL_STORAGE_KEY_SELECTED_FARM_ID = 'agrinet_selected_farm_id';

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [farm, setFarmState] = useState<FarmProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_FARM);
      return saved ? JSON.parse(saved) : DEFAULT_FARM;
    } catch {
      return DEFAULT_FARM;
    }
  });

  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SELECTED_FARM_ID);
      return saved ? Number(saved) : null;
    } catch {
      return null;
    }
  });

  const [farmsList, setFarmsList] = useState<FarmEntity[]>([]);
  const [selectedFarmDetails, setSelectedFarmDetails] = useState<FarmEntity | null>(null);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [language, setLanguage] = useState<Language>(user.preferredLanguage || 'en');

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_FARM, JSON.stringify(farm));
  }, [farm]);

  useEffect(() => {
    if (selectedFarmId !== null) {
      localStorage.setItem(LOCAL_STORAGE_KEY_SELECTED_FARM_ID, String(selectedFarmId));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_SELECTED_FARM_ID);
    }
  }, [selectedFarmId]);

  const setUser = (updates: Partial<UserProfile>) => {
    setUserState((prev) => ({ ...prev, ...updates }));
    if (updates.preferredLanguage) {
      setLanguage(updates.preferredLanguage);
    }
  };

  const updateFarm = (updates: Partial<FarmProfile>) => {
    setFarmState((prev) => ({ ...prev, ...updates }));
  };

  const updateLocation = (locUpdates: Partial<FarmProfile['location']>) => {
    setFarmState((prev) => ({
      ...prev,
      location: { ...prev.location, ...locUpdates },
    }));
  };

  const updateCrop = (cropUpdates: Partial<FarmProfile['crop']>) => {
    setFarmState((prev) => ({
      ...prev,
      crop: { ...prev.crop, ...cropUpdates },
    }));
  };

  const updateSoil = (soilUpdates: Partial<FarmProfile['soil']>) => {
    setFarmState((prev) => ({
      ...prev,
      soil: { ...prev.soil, ...soilUpdates },
    }));
  };

  const resetAll = () => {
    setUserState(DEFAULT_USER);
    setFarmState(DEFAULT_FARM);
    setSelectedFarmId(null);
    setFarmsList([]);
    setSelectedFarmDetails(null);
    setCurrentStep(1);
    localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
    localStorage.removeItem(LOCAL_STORAGE_KEY_FARM);
    localStorage.removeItem(LOCAL_STORAGE_KEY_SELECTED_FARM_ID);
  };

  const fillSampleData = () => {
    setUserState(DEFAULT_USER);
    setFarmState({ ...DEFAULT_FARM, isReady: true });
  };

  const weather = getMockWeatherForLocation(farm.location.name, farm.location.state);
  const satelliteData = getMockSatelliteTelemetry(farm.crop.cropName, farm.size);
  const [advisories, setAdvisories] = useState<FarmAdvisory[]>(() => generateFarmAdvisories(farm));

  const refreshAdvisories = () => {
    setAdvisories(generateFarmAdvisories(farm));
  };

  useEffect(() => {
    setAdvisories(generateFarmAdvisories(farm));
  }, [farm.location, farm.crop, farm.soil, farm.irrigation, farm.practice]);

  return (
    <FarmContext.Provider
      value={{
        user,
        setUser,
        farm,
        updateFarm,
        updateLocation,
        updateCrop,
        updateSoil,
        currentStep,
        setCurrentStep,
        weather,
        satelliteData,
        advisories,
        refreshAdvisories,
        language,
        setLanguage,
        resetAll,
        fillSampleData,
        selectedFarmId,
        setSelectedFarmId,
        farmsList,
        setFarmsList,
        selectedFarmDetails,
        setSelectedFarmDetails,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
