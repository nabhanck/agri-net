import React, { useState, useEffect } from 'react';
import {
  Mic,
  Square,
  Languages,
  Sparkles,
  Volume2,
  HelpCircle,
  X,
  Compass,
  CheckCircle2,
  AlertCircle,
  Tag,
  Bot
} from 'lucide-react';
import { useVoiceAssistant, type UseVoiceAssistantOptions } from '../hooks/useVoiceAssistant';
import { ConversationalInterviewModal } from './ConversationalInterviewModal';

export interface VoiceMicButtonProps extends UseVoiceAssistantOptions {
  className?: string;
}

export const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
  formState,
  updateFormField,
  defaultLanguage = 'en-IN',
  className = '',
}) => {
  const {
    isRecording,
    recordingDuration,
    isProcessing,
    transcript,
    lastFeedback,
    errorMessage,
    currentLanguage,
    setCurrentLanguage,
    toggleRecording,
    stopFeedbackSpeech,
    isAudioSupported,
    scopeConfig,
  } = useVoiceAssistant({
    formState,
    updateFormField,
    defaultLanguage,
  });

  const [showHelp, setShowHelp] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [dismissedFeedback, setDismissedFeedback] = useState<string>('');

  const isHindi = currentLanguage.toLowerCase().startsWith('hi');

  // Show feedback toast when new feedback exists and hasn't been dismissed
  const showFeedbackToast = Boolean(lastFeedback && lastFeedback !== dismissedFeedback);

  // Auto dismiss feedback toast after 6s
  useEffect(() => {
    if (lastFeedback) {
      const timer = setTimeout(() => {
        setDismissedFeedback(lastFeedback);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [lastFeedback]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleDismissFeedback = () => {
    setDismissedFeedback(lastFeedback);
    stopFeedbackSpeech();
  };

  // Determine current scope display name
  const scopeTitle = scopeConfig.title || scopeConfig.screen;

  // Active sample commands based on active screen and language
  const sampleCommands = isHindi
    ? scopeConfig.sampleCommands?.hi || [
        '"डैशबोर्ड खोलो"',
        '"मेरी फसल चावल है"',
        '"खेत 5 एकड़"',
      ]
    : scopeConfig.sampleCommands?.en || [
        '"Open Dashboard"',
        '"My crop is Rice"',
        '"Farm size 5 acres"',
      ];

  return (
    <>
      <div
        className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none ${className}`}
        aria-label="AgriNet Voice Assistant"
      >
        {/* 1. Spoken Feedback Toast */}
        {showFeedbackToast && lastFeedback && (
          <div className="max-w-xs sm:max-w-sm p-3.5 rounded-2xl bg-emerald-900/95 text-white shadow-2xl backdrop-blur-md border border-emerald-500/40 flex items-start gap-2.5 animate-in slide-in-from-bottom-3 fade-in duration-300">
            <div className="p-1.5 rounded-xl bg-emerald-800 text-emerald-300 shrink-0 mt-0.5 animate-pulse">
              <Volume2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  AgriNet Assistant ({isHindi ? 'हिन्दी' : 'English'})
                </span>
                <button
                  type="button"
                  onClick={handleDismissFeedback}
                  title="Dismiss & Stop Speech"
                  className="text-emerald-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs font-medium text-emerald-50 mt-1 leading-relaxed">
                {lastFeedback}
              </p>
            </div>
          </div>
        )}

        {/* 2. Real-time Recording & AI Processing Status Card */}
        {(isRecording || isProcessing || transcript) && (
          <div className="max-w-xs sm:max-w-sm w-full p-4 rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-200/90 animate-in slide-in-from-bottom-2 duration-200">
            {/* Header Status */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isProcessing ? 'bg-amber-400' : 'bg-rose-400'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      isProcessing ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  />
                </span>
                <span className="text-xs font-bold tracking-wide uppercase text-slate-700">
                  {isProcessing
                    ? isHindi
                      ? 'Gemini AI विश्लेषण कर रहा है...'
                      : 'Gemini AI is analyzing...'
                    : isRecording
                    ? isHindi
                      ? `रिकॉर्डिंग चालू है (${formatTime(recordingDuration)})`
                      : `Listening (${formatTime(recordingDuration)})...`
                    : isHindi
                    ? 'पहचाना गया आदेश'
                    : 'Command Processed'}
                </span>
              </div>

              {/* Scope Badge */}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 flex items-center gap-1">
                <Tag className="w-2.5 h-2.5 text-emerald-600" />
                {scopeTitle}
              </span>
            </div>

            {/* Audio Wave Equalizer Animation when recording */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1 my-3 py-1">
                <span className="w-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.4s] h-3" />
                <span className="w-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.2s] h-6" />
                <span className="w-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.5s] h-9" />
                <span className="w-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.1s] h-5" />
                <span className="w-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s] h-8" />
                <span className="w-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.6s] h-4" />
                <span className="w-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.2s] h-3" />
              </div>
            )}

            {/* Transcript / Action Display */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium min-h-[44px] flex items-center justify-center text-center">
              {transcript ? (
                <span className="italic text-slate-800 font-semibold">“{transcript}”</span>
              ) : isProcessing ? (
                <span className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isHindi ? 'ऑडियो का विश्लेषण हो रहा है...' : 'Processing voice audio...'}
                </span>
              ) : isRecording ? (
                <span className="text-slate-500">
                  {isHindi
                    ? `बोलिए (${sampleCommands[0] || 'आदेश दें'})... पूर्ण होने पर लाल बटन दबाएं`
                    : `Speak now (${sampleCommands[0] || 'give command'})... Click red button when done`}
                </span>
              ) : null}
            </div>
          </div>
        )}

        {/* 3. Sample Commands Help Card */}
        {showHelp && (
          <div className="max-w-xs sm:max-w-sm w-full p-4 rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-200/90 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    {isHindi ? 'वॉइस असिस्टेंट गाइड' : 'Voice Assistant Guide'}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    {scopeTitle}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Quick Launch Interview Mode inside Guide */}
              <button
                type="button"
                onClick={() => {
                  setShowHelp(false);
                  setIsInterviewModalOpen(true);
                }}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
              >
                <Bot className="w-4 h-4 text-emerald-200" />
                <span>{isHindi ? '🎙️ वॉइस इंटरव्यू मोड शुरू करें' : '🎙️ Start Turn-by-Turn Interview'}</span>
              </button>

              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block mb-1.5 flex items-center gap-1">
                  <Compass className="w-3 h-3" />
                  {isHindi ? 'इस स्क्रीन पर कमांड्स' : 'Commands on this screen'}
                </span>
                <ul className="space-y-1.5 text-slate-600 pl-1 font-medium">
                  {sampleCommands.map((cmd, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{cmd}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-1.5 text-slate-400 pt-1 text-[11px]">
                    <span>💡 {isHindi ? '"आगे बढ़ो" / "पीछे जाओ" भी समर्थित है' : '"Next / Continue" and "Back" are supported'}</span>
                  </li>
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {isHindi
                    ? 'Gemini 3.6 Flash मल्टीमॉडल समझ'
                    : 'Powered by Gemini 3.6 Flash Audio'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Controls Bar & Main Floating Action Trigger */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-lg p-1.5 rounded-full shadow-xl border border-slate-200/80">
          {/* Conversational Interview Mode Trigger Pill */}
          <button
            type="button"
            onClick={() => setIsInterviewModalOpen(true)}
            title={isHindi ? 'इंटरव्यू मोड खोलें' : 'Open Interview Mode'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all cursor-pointer shadow-xs"
          >
            <Bot className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isHindi ? 'इंटरव्यू' : 'Interview'}</span>
          </button>

          {/* Help Button */}
          <button
            type="button"
            onClick={() => setShowHelp((prev) => !prev)}
            title={isHindi ? 'कमांड गाइड' : 'Voice Commands Guide'}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Language Switcher Pill */}
          <button
            type="button"
            onClick={() => {
              stopFeedbackSpeech();
              setCurrentLanguage((prev) => (prev.startsWith('hi') ? 'en-IN' : 'hi-IN'));
            }}
            title={isHindi ? 'अंग्रेजी में बदलें (Switch to English)' : 'हिन्दी में बदलें (Switch to Hindi)'}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 transition-all cursor-pointer border border-slate-200/80"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isHindi ? 'हिन्दी' : 'ENG'}</span>
          </button>

          {/* Floating Mic / Record Button */}
          {!isAudioSupported ? (
            <div
              title="Audio recording is not supported by your browser."
              className="w-12 h-12 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center cursor-not-allowed"
            >
              <Mic className="w-5 h-5 opacity-40" />
            </div>
          ) : (
            <button
              type="button"
              onClick={toggleRecording}
              title={
                isRecording
                  ? isHindi
                    ? 'रिकॉर्डिंग रोकें'
                    : 'Stop Recording'
                  : isHindi
                  ? 'आवाज से आदेश दें'
                  : 'Record Voice Command'
              }
              className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 text-white shadow-rose-600/50 scale-105 ring-4 ring-rose-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-600/30 hover:scale-105'
              }`}
            >
              {/* Listening Ripple Aura */}
              {isRecording && (
                <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-40" />
              )}

              {isProcessing ? (
                <Sparkles className="w-5 h-5 animate-spin text-amber-200" />
              ) : isRecording ? (
                <Square className="w-4 h-4 fill-white text-white" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Error Message Toast if any */}
        {errorMessage && (
          <div className="max-w-xs p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Conversational Voice Interview Modal */}
      <ConversationalInterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        initialLanguage={currentLanguage}
      />
    </>
  );
};

export default VoiceMicButton;
