import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ONBOARDING_STEPS, type OnboardingSlotStep } from '../config/onboardingSteps';
import { extractConversationalSlotWithGemini } from '../config/gemini';
import { speakFeedback, stopSpeaking } from '../utils/speechSynthesis';
import {
  startAudioRecording,
  stopAudioRecording,
  cancelAudioRecording,
  isAudioRecordingSupported,
} from '../utils/audioRecorder';
import { useFarm } from '../context/FarmContext';
import { POPULAR_CROPS } from '../data/agriculturalData';
import type { SoilType, IrrigationType } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  time: string;
  fieldKey?: string;
  value?: any;
}

export function useConversationalAssistant(initialLanguage: string = 'hi-IN') {
  const navigate = useNavigate();
  const { user, setUser, farm, updateFarm, updateCrop, updateSoil, updateLocation } = useFarm();

  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [language, setLanguage] = useState<string>(initialLanguage);
  const [transcript, setTranscript] = useState<string>('');
  const [lastFeedback, setLastFeedback] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Initialize slot values from existing context
  const [slotValues, setSlotValues] = useState<Record<string, any>>({
    fullName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
    phone: user.phone || '',
    location: farm.location?.name ? `${farm.location.name}, ${farm.location.state || ''}` : '',
    crop: farm.crop?.cropName || '',
    acreage: farm.size || '',
    soil: farm.soil?.soilType || '',
    irrigation: farm.irrigation || '',
  });

  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);

  const timerRef = useRef<number | null>(null);
  const isHindi = language.toLowerCase().startsWith('hi');
  const currentSlot: OnboardingSlotStep | undefined = ONBOARDING_STEPS[currentStepIndex];

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();
      cancelAudioRecording();
      stopSpeaking();
    };
  }, []);

  /**
   * Sync a slot update directly into FarmContext and user telemetry
   */
  const applySlotUpdateToContext = useCallback(
    (key: string, value: any) => {
      if (value === null || value === undefined || value === '') return;

      setSlotValues((prev) => ({ ...prev, [key]: value }));

      if (key === 'fullName') {
        const parts = String(value).trim().split(/\s+/);
        const first = parts[0] || 'Farmer';
        const last = parts.slice(1).join(' ') || '';
        setUser({ firstName: first, lastName: last });
      } else if (key === 'phone') {
        setUser({ phone: String(value) });
      } else if (key === 'location') {
        updateLocation({
          name: String(value).split(',')[0].trim(),
          state: String(value).split(',')[1]?.trim() || 'India',
        });
      } else if (key === 'crop') {
        const cropStr = String(value).trim();
        const matched = POPULAR_CROPS.find(
          (c) =>
            c.name.toLowerCase() === cropStr.toLowerCase() ||
            c.id.toLowerCase() === cropStr.toLowerCase() ||
            (c.localName && c.localName.toLowerCase().includes(cropStr.toLowerCase()))
        );
        if (matched) {
          updateCrop({
            cropId: matched.id,
            cropName: matched.name,
            variety: matched.popularVarieties[0] || 'Standard',
          });
        } else {
          updateCrop({
            cropId: cropStr.toLowerCase().replace(/\s+/g, '-'),
            cropName: cropStr,
            variety: 'Standard',
          });
        }
      } else if (key === 'acreage') {
        const num = typeof value === 'number' ? value : parseFloat(String(value));
        if (!isNaN(num) && num > 0) {
          updateFarm({ size: num, sizeUnit: 'acres' });
        }
      } else if (key === 'soil') {
        const sStr = String(value).toLowerCase();
        let targetSoil: SoilType = 'Clayey';
        if (sStr.includes('loam')) targetSoil = 'Loamy';
        else if (sStr.includes('sand')) targetSoil = 'Sandy';
        else if (sStr.includes('alluvial')) targetSoil = 'Alluvial';
        else if (sStr.includes('black') || sStr.includes('regur')) targetSoil = 'Black / Regur';
        else if (sStr.includes('red')) targetSoil = 'Red Soil';
        else if (sStr.includes('laterite')) targetSoil = 'Laterite';
        updateSoil({ soilType: targetSoil });
      } else if (key === 'irrigation') {
        const irrStr = String(value).toLowerCase();
        let targetIrr: IrrigationType = 'Rainfed';
        if (irrStr.includes('drip')) targetIrr = 'Drip';
        else if (irrStr.includes('sprinkler')) targetIrr = 'Sprinkler';
        else if (irrStr.includes('canal')) targetIrr = 'Canal';
        else if (irrStr.includes('bore')) targetIrr = 'Borewell';
        updateFarm({ irrigation: targetIrr });
      }
    },
    [setUser, updateCrop, updateFarm, updateLocation, updateSoil]
  );

  /**
   * Speaks the question for the specified step
   */
  const askStepQuestion = useCallback(
    async (stepIndex: number, customIntro?: string) => {
      const step = ONBOARDING_STEPS[stepIndex];
      if (!step) return;

      const questionText = isHindi ? step.question.hi : step.question.en;
      const fullText = customIntro ? `${customIntro} ${questionText}` : questionText;

      const msg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: fullText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fieldKey: step.key,
      };

      setConversationHistory((prev) => [...prev, msg]);
      setIsSpeaking(true);

      await speakFeedback(fullText, language);
      setIsSpeaking(false);
    },
    [isHindi, language]
  );

  /**
   * Find next unfilled slot step index starting after current
   */
  const getNextUnfilledIndex = useCallback(
    (values: Record<string, any>, startIndex: number) => {
      for (let i = startIndex + 1; i < ONBOARDING_STEPS.length; i++) {
        const key = ONBOARDING_STEPS[i].key;
        if (!values[key] || values[key] === '') {
          return i;
        }
      }
      // Check from 0 to startIndex in case any prior slot was skipped
      for (let i = 0; i <= startIndex; i++) {
        const key = ONBOARDING_STEPS[i].key;
        if (!values[key] || values[key] === '') {
          return i;
        }
      }
      return -1; // All slots filled!
    },
    []
  );

  /**
   * Starts the voice interview
   */
  const startInterview = useCallback(
    async (startIndex = 0) => {
      setIsActive(true);
      setIsCompleted(false);
      setCurrentStepIndex(startIndex);
      stopSpeaking();

      const intro = isHindi
        ? 'नमस्ते! मैं आपका एग्रीनेट वॉइस सहायक हूँ। आइए आपके खेत का सेटअप पूरा करते हैं।'
        : 'Hello! I am your AgriNet Voice Assistant. Let us set up your farm together.';

      await askStepQuestion(startIndex, intro);
    },
    [askStepQuestion, isHindi]
  );

  /**
   * Stops the voice interview
   */
  const stopInterview = useCallback(() => {
    setIsActive(false);
    setIsListening(false);
    setIsProcessing(false);
    setIsSpeaking(false);
    clearTimer();
    cancelAudioRecording();
    stopSpeaking();
  }, []);

  /**
   * Start recording user's response
   */
  const startListening = useCallback(async () => {
    try {
      stopSpeaking();
      setIsListening(true);
      setTranscript('');
      setRecordingDuration(0);
      await startAudioRecording();

      const start = Date.now();
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - start) / 1000));
      }, 500);
    } catch (err) {
      console.error('Failed to start recording answer:', err);
      setIsListening(false);
      clearTimer();
    }
  }, []);

  /**
   * Stop recording, process answer with Gemini, confirm and advance
   */
  const stopListeningAndProcess = useCallback(async () => {
    clearTimer();
    setIsListening(false);
    setIsProcessing(true);

    try {
      const audioResult = await stopAudioRecording();

      if (audioResult.durationMs < 400 || !currentSlot) {
        setIsProcessing(false);
        return;
      }

      const result = await extractConversationalSlotWithGemini(
        audioResult.base64Data,
        audioResult.mimeType,
        currentSlot,
        ONBOARDING_STEPS,
        slotValues,
        language
      );

      if (result.transcript) {
        setTranscript(result.transcript);
        setConversationHistory((prev) => [
          ...prev,
          {
            id: `usr-${Date.now()}`,
            sender: 'user',
            text: result.transcript,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            fieldKey: currentSlot.key,
            value: result.extractedValue,
          },
        ]);
      }

      // Update the current slot
      const updatedValues = { ...slotValues };
      if (result.extractedValue !== null && result.extractedValue !== undefined) {
        updatedValues[currentSlot.key] = result.extractedValue;
        applySlotUpdateToContext(currentSlot.key, result.extractedValue);
      }

      // Update any additional slots mentioned in the same turn
      if (result.additionalSlots && Object.keys(result.additionalSlots).length > 0) {
        Object.entries(result.additionalSlots).forEach(([k, v]) => {
          if (v !== null && v !== undefined) {
            updatedValues[k] = v;
            applySlotUpdateToContext(k, v);
          }
        });
      }

      setLastFeedback(result.spokenConfirmation);

      // Find the next step to ask
      const nextIndex = getNextUnfilledIndex(updatedValues, currentStepIndex);

      if (nextIndex === -1) {
        // All slots filled!
        setIsCompleted(true);
        updateFarm({ isReady: true });

        const completionMsg = isHindi
          ? `${result.spokenConfirmation} बधाई हो! आपके खेत का पूरा विवरण सफलतापूर्वक दर्ज कर लिया गया है। आपका फार्म तैयार है!`
          : `${result.spokenConfirmation} Congratulations! All details have been captured successfully. Your farm is ready!`;

        setConversationHistory((prev) => [
          ...prev,
          {
            id: `done-${Date.now()}`,
            sender: 'assistant',
            text: completionMsg,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        setIsSpeaking(true);
        await speakFeedback(completionMsg, language);
        setIsSpeaking(false);
      } else {
        // Move to next question
        setCurrentStepIndex(nextIndex);
        await askStepQuestion(nextIndex, result.spokenConfirmation);
      }
    } catch (err) {
      console.error('Error processing conversational slot answer:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [
    applySlotUpdateToContext,
    askStepQuestion,
    currentSlot,
    currentStepIndex,
    getNextUnfilledIndex,
    isHindi,
    language,
    slotValues,
    updateFarm,
  ]);

  /**
   * Skip current question
   */
  const skipStep = useCallback(async () => {
    const nextIndex = (currentStepIndex + 1) % ONBOARDING_STEPS.length;
    setCurrentStepIndex(nextIndex);
    const skipMsg = isHindi ? 'ठीक है, इसे बाद में भर सकते हैं।' : 'Okay, skipping this step for now.';
    await askStepQuestion(nextIndex, skipMsg);
  }, [askStepQuestion, currentStepIndex, isHindi]);

  /**
   * Previous question
   */
  const prevStep = useCallback(async () => {
    const prevIndex = Math.max(0, currentStepIndex - 1);
    setCurrentStepIndex(prevIndex);
    await askStepQuestion(prevIndex);
  }, [askStepQuestion, currentStepIndex]);

  /**
   * Repeat current question
   */
  const repeatQuestion = useCallback(async () => {
    if (currentSlot) {
      await askStepQuestion(currentStepIndex);
    }
  }, [askStepQuestion, currentSlot, currentStepIndex]);

  /**
   * Manual input change
   */
  const setManualValue = useCallback(
    (key: string, value: any) => {
      applySlotUpdateToContext(key, value);
    },
    [applySlotUpdateToContext]
  );

  /**
   * Toggle between Hindi and English
   */
  const toggleLanguage = useCallback(() => {
    const newLang = language.startsWith('hi') ? 'en-IN' : 'hi-IN';
    setLanguage(newLang);
  }, [language]);

  return {
    isActive,
    currentStepIndex,
    currentSlot,
    allSteps: ONBOARDING_STEPS,
    isSpeaking,
    isListening,
    isProcessing,
    recordingDuration,
    transcript,
    lastFeedback,
    conversationHistory,
    slotValues,
    language,
    isCompleted,
    isAudioSupported: isAudioRecordingSupported(),
    startInterview,
    stopInterview,
    startListening,
    stopListeningAndProcess,
    skipStep,
    prevStep,
    repeatQuestion,
    setManualValue,
    toggleLanguage,
    setLanguage,
  };
}
