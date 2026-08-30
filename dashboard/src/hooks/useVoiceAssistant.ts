import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  startAudioRecording,
  stopAudioRecording,
  cancelAudioRecording,
  isAudioRecordingSupported,
} from '../utils/audioRecorder';
import { parseVoiceAudioWithGemini, type VoiceAudioIntentResult, type VoiceScreenContext } from '../config/gemini';
import { speakFeedback, stopSpeaking } from '../utils/speechSynthesis';
import { useFarm } from '../context/FarmContext';
import { useVoiceScope } from '../context/VoiceScopeContext';
import { POPULAR_CROPS } from '../data/agriculturalData';
import type { SoilType, IrrigationType, FarmingPractice } from '../types';

export interface UseVoiceAssistantOptions {
  formState?: Record<string, any>;
  updateFormField?: (field: string, value: any) => void;
  defaultLanguage?: string;
}

const KNOWN_LOCATIONS: Record<string, { name: string; district: string; state: string; country: string; lat: number; lng: number }> = {
  ernakulam: { name: 'Ernakulam', district: 'Ernakulam', state: 'Kerala', country: 'India', lat: 10.0159, lng: 76.3419 },
  thrissur: { name: 'Thrissur', district: 'Thrissur', state: 'Kerala', country: 'India', lat: 10.5276, lng: 76.2144 },
  mandya: { name: 'Mandya', district: 'Mandya', state: 'Karnataka', country: 'India', lat: 12.5218, lng: 76.8951 },
  ludhiana: { name: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', country: 'India', lat: 30.9010, lng: 75.8573 },
  nashik: { name: 'Nashik', district: 'Nashik', state: 'Maharashtra', country: 'India', lat: 19.9975, lng: 73.7898 },
  guntur: { name: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh', country: 'India', lat: 16.3067, lng: 80.4365 },
  thanjavur: { name: 'Thanjavur', district: 'Thanjavur', state: 'Tamil Nadu', country: 'India', lat: 10.7870, lng: 79.1378 },
  bangalore: { name: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946 },
  bengaluru: { name: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946 },
  pune: { name: 'Pune', district: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lng: 73.8567 },
  coimbatore: { name: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', country: 'India', lat: 11.0168, lng: 76.9558 },
  hyderabad: { name: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.3850, lng: 78.4867 },
};

export function useVoiceAssistant({
  formState: _formState,
  updateFormField,
  defaultLanguage = 'en-IN',
}: UseVoiceAssistantOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, updateFarm, updateCrop, updateSoil, updateLocation } = useFarm();
  const { scopeConfig, currentScope } = useVoiceScope();

  const [currentLanguage, setCurrentLanguage] = useState<string>(defaultLanguage);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [lastFeedback, setLastFeedback] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const timerRef = useRef<number | null>(null);
  const isAudioSupported = isAudioRecordingSupported();

  // Clear timer helper
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      cancelAudioRecording();
      stopSpeaking();
    };
  }, []);

  /**
   * Dispatches parsed Gemini action to active VoiceScope, React state and router
   */
  const executeIntent = useCallback(
    async (result: VoiceAudioIntentResult) => {
      const { action, target, value, spokenFeedback, transcript: transcribedText } = result;

      if (transcribedText) {
        setTranscript(transcribedText);
      }

      // 1. REJECT action: explain to user why action cannot be taken
      if (action === 'REJECT') {
        // Do not navigate or fill form
      }
      // 2. WIZARD / STEP ACTIONS
      else if (action === 'NEXT_STEP' || action === 'SUBMIT') {
        if (scopeConfig.onNextStep) {
          scopeConfig.onNextStep();
        } else if (scopeConfig.onSubmit) {
          scopeConfig.onSubmit();
        }
      } else if (action === 'PREV_STEP') {
        if (scopeConfig.onPrevStep) {
          scopeConfig.onPrevStep();
        }
      } else if (action === 'CUSTOM') {
        if (scopeConfig.onCustomAction) {
          scopeConfig.onCustomAction(target || 'CUSTOM', target, value);
        }
      }
      // 3. GLOBAL NAVIGATION (only if allowed in active scope)
      else if (action === 'NAVIGATE' && target) {
        const isAllowed = scopeConfig.allowedActions.includes('NAVIGATE');
        if (isAllowed) {
          navigate(target);
        }
      }
      // 4. FORM FILLING
      else if (action === 'FILL_FORM' && target) {
        // First check if active scope handles this field locally
        let handledLocally = false;
        if (scopeConfig.onFieldFill) {
          const res = scopeConfig.onFieldFill(target, value);
          if (res === true) handledLocally = true;
        }

        const fieldKey = target.toLowerCase();

        // User Profile fields (Register page)
        if (fieldKey === 'firstname' || fieldKey === 'first_name') {
          setUser({ firstName: String(value) });
          if (updateFormField) updateFormField('firstName', String(value));
        } else if (fieldKey === 'lastname' || fieldKey === 'last_name') {
          setUser({ lastName: String(value) });
          if (updateFormField) updateFormField('lastName', String(value));
        } else if (fieldKey === 'email') {
          setUser({ email: String(value) });
          if (updateFormField) updateFormField('email', String(value));
        } else if (fieldKey === 'phone' || fieldKey === 'phonenumber') {
          setUser({ phone: String(value) });
          if (updateFormField) updateFormField('phone', String(value));
        } else if (fieldKey === 'preferredlanguage' || fieldKey === 'language') {
          setUser({ preferredLanguage: String(value) as any });
          if (updateFormField) updateFormField('preferredLanguage', String(value));
        }
        // Farm Setup fields
        else if (fieldKey.includes('crop') && value && !handledLocally) {
          const cropStr = String(value).trim();
          const matchedCrop = POPULAR_CROPS.find(
            (c) =>
              c.name.toLowerCase() === cropStr.toLowerCase() ||
              c.id.toLowerCase() === cropStr.toLowerCase() ||
              (c.localName && c.localName.toLowerCase().includes(cropStr.toLowerCase()))
          ) || {
            id: cropStr.toLowerCase().replace(/\s+/g, '-'),
            name: cropStr,
            popularVarieties: ['Standard'],
            growthStages: [{ stage: 'Vegetative', durationDays: 30, description: 'Growth' }],
          };

          updateCrop({
            cropId: matchedCrop.id,
            cropName: matchedCrop.name,
            variety: matchedCrop.popularVarieties[0] || 'Standard',
          });

          if (updateFormField) {
            updateFormField('crop', matchedCrop.name);
            updateFormField('cropId', matchedCrop.id);
          }
        } else if (fieldKey.includes('variety') && value && !handledLocally) {
          const varietyStr = String(value).trim();
          updateCrop({ variety: varietyStr });
          if (updateFormField) updateFormField('variety', varietyStr);
        } else if ((fieldKey.includes('size') || fieldKey.includes('acre') || fieldKey.includes('hectare')) && !handledLocally) {
          const num = typeof value === 'number' ? value : parseFloat(String(value));
          if (!isNaN(num) && num > 0) {
            const unit = String(value).toLowerCase().includes('hectare') ? 'hectares' : 'acres';
            updateFarm({ size: num, sizeUnit: unit });
            if (updateFormField) {
              updateFormField('size', num);
              updateFormField('acreage', num);
            }
          }
        } else if (fieldKey.includes('soil') && value && !handledLocally) {
          const soilStr = String(value).toLowerCase();
          let targetSoil: SoilType = 'Clayey';
          if (soilStr.includes('loam')) targetSoil = 'Loamy';
          else if (soilStr.includes('sand')) targetSoil = 'Sandy';
          else if (soilStr.includes('alluvial')) targetSoil = 'Alluvial';
          else if (soilStr.includes('black') || soilStr.includes('regur')) targetSoil = 'Black / Regur';
          else if (soilStr.includes('red')) targetSoil = 'Red Soil';
          else if (soilStr.includes('laterite')) targetSoil = 'Laterite';

          updateSoil({ soilType: targetSoil });
          if (updateFormField) updateFormField('soilType', targetSoil);
        } else if (fieldKey.includes('ph') && value && !handledLocally) {
          const num = typeof value === 'number' ? value : parseFloat(String(value));
          if (!isNaN(num) && num >= 3 && num <= 11) {
            updateSoil({ ph: num });
            if (updateFormField) updateFormField('ph', num);
          }
        } else if (fieldKey.includes('irrigation') && value && !handledLocally) {
          const irrStr = String(value).toLowerCase();
          let targetIrr: IrrigationType = 'Rainfed';
          if (irrStr.includes('drip')) targetIrr = 'Drip';
          else if (irrStr.includes('sprinkler')) targetIrr = 'Sprinkler';
          else if (irrStr.includes('canal')) targetIrr = 'Canal';
          else if (irrStr.includes('bore')) targetIrr = 'Borewell';

          updateFarm({ irrigation: targetIrr });
          if (updateFormField) updateFormField('irrigation', targetIrr);
        } else if (fieldKey.includes('practice') && value && !handledLocally) {
          const pracStr = String(value).toLowerCase();
          let targetPrac: FarmingPractice = 'Conventional';
          if (pracStr.includes('organic')) targetPrac = 'Organic';
          else if (pracStr.includes('regen')) targetPrac = 'Regenerative';
          else if (pracStr.includes('mixed') || pracStr.includes('integrated')) targetPrac = 'Mixed / Integrated';

          updateFarm({ practice: targetPrac });
          if (updateFormField) updateFormField('practice', targetPrac);
        } else if (fieldKey.includes('location') && value && !handledLocally) {
          const locQuery = String(value).trim().toLowerCase();
          const foundLoc = Object.keys(KNOWN_LOCATIONS).find((k) => locQuery.includes(k));
          if (foundLoc) {
            const loc = KNOWN_LOCATIONS[foundLoc];
            updateLocation({
              name: loc.name,
              district: loc.district,
              state: loc.state,
              country: loc.country,
              latitude: loc.lat,
              longitude: loc.lng,
            });
            if (updateFormField) updateFormField('location', `${loc.name}, ${loc.state}`);
          } else {
            const rawName = String(value).trim();
            updateLocation({
              name: rawName,
              state: 'India',
            });
            if (updateFormField) updateFormField('location', rawName);
          }
        }
      }

      if (spokenFeedback) {
        setLastFeedback(spokenFeedback);
        await speakFeedback(spokenFeedback, currentLanguage);
      }
    },
    [navigate, scopeConfig, updateCrop, updateFarm, updateSoil, updateLocation, setUser, updateFormField, currentLanguage]
  );

  /**
   * Start native audio recording
   */
  const startRecording = useCallback(async () => {
    try {
      setErrorMessage('');
      setTranscript('');
      setRecordingDuration(0);
      stopSpeaking();
      await startAudioRecording();
      setIsRecording(true);

      const start = Date.now();
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - start) / 1000));
      }, 500);
    } catch (err: any) {
      console.error('Failed to start recording:', err);
      const isHindi = currentLanguage.toLowerCase().startsWith('hi');
      setErrorMessage(
        isHindi
          ? 'माइक्रोफ़ोन एक्सेस की अनुमति दें।'
          : 'Please allow microphone access in your browser.'
      );
      setIsRecording(false);
      clearTimer();
    }
  }, [currentLanguage]);

  /**
   * Stop recording and send audio directly to Gemini with active screen context
   */
  const stopRecording = useCallback(async () => {
    clearTimer();
    setIsRecording(false);
    setIsProcessing(true);

    try {
      const audioResult = await stopAudioRecording();

      if (audioResult.durationMs < 400) {
        setIsProcessing(false);
        return;
      }

      const screenContext: VoiceScreenContext = {
        screen: scopeConfig.screen || currentScope || 'GLOBAL',
        scopeCategory: scopeConfig.scopeCategory || 'GLOBAL',
        allowedActions: scopeConfig.allowedActions || ['NAVIGATE', 'FILL_FORM'],
        availableFields: scopeConfig.availableFields || [],
        currentRoute: location.pathname,
        customInstructions: scopeConfig.customInstructions,
      };

      const intentResult = await parseVoiceAudioWithGemini(
        audioResult.base64Data,
        audioResult.mimeType,
        screenContext,
        currentLanguage
      );

      await executeIntent(intentResult);
    } catch (err: any) {
      console.error('Failed to stop recording or process audio with Gemini:', err);
      const isHindi = currentLanguage.toLowerCase().startsWith('hi');
      setErrorMessage(
        isHindi
          ? 'ऑडियो संसाधित करने में समस्या हुई।'
          : 'Failed to process voice command. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [location.pathname, scopeConfig, currentScope, currentLanguage, executeIntent]);

  /**
   * Toggle recording on click
   */
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const stopFeedbackSpeech = useCallback(() => {
    stopSpeaking();
  }, []);

  return {
    isRecording,
    recordingDuration,
    isProcessing,
    transcript,
    lastFeedback,
    errorMessage,
    currentLanguage,
    setCurrentLanguage,
    startRecording,
    stopRecording,
    toggleRecording,
    stopFeedbackSpeech,
    isAudioSupported,
    currentScope,
    scopeConfig,
  };
}
