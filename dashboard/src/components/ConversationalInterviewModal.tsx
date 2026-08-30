import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  Square,
  Sparkles,
  Volume2,
  X,
  Languages,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  SkipForward,
  ArrowLeft,
  Bot,
  User,
  PartyPopper,
  Sprout,
  Compass,
  Layers,
  Droplets
} from 'lucide-react';
import { useConversationalAssistant } from '../hooks/useConversationalAssistant';

interface ConversationalInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLanguage?: string;
}

export const ConversationalInterviewModal: React.FC<ConversationalInterviewModalProps> = ({
  isOpen,
  onClose,
  initialLanguage = 'hi-IN',
}) => {
  const navigate = useNavigate();
  const {
    isActive,
    currentStepIndex,
    currentSlot,
    allSteps,
    isSpeaking,
    isListening,
    isProcessing,
    recordingDuration,
    transcript,
    conversationHistory,
    slotValues,
    language,
    isCompleted,
    isAudioSupported,
    startInterview,
    stopInterview,
    startListening,
    stopListeningAndProcess,
    skipStep,
    prevStep,
    repeatQuestion,
    setManualValue,
    toggleLanguage,
  } = useConversationalAssistant(initialLanguage);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isHindi = language.toLowerCase().startsWith('hi');

  // Start interview when modal opens
  useEffect(() => {
    if (isOpen && !isActive) {
      startInterview(0);
    }
  }, [isOpen, isActive, startInterview]);

  // Scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, isProcessing, isListening]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleClose = () => {
    stopInterview();
    onClose();
  };

  const handleFinishAndNavigate = () => {
    stopInterview();
    onClose();
    navigate('/onboarding/ready');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col h-[650px] max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-white shrink-0">
              <Bot className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base font-heading">
                  {isHindi ? 'एग्रीनेट वॉइस साक्षात्कार' : 'AgriNet Voice Interview'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  Turn-by-Turn AI
                </span>
              </div>
              <p className="text-xs text-emerald-200/90">
                {isHindi
                  ? 'बोलकर अपना पूरा फार्म सेटअप 2 मिनट में पूरा करें'
                  : 'Complete your full farm onboarding conversationally in 2 mins'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              title={isHindi ? 'Switch to English' : 'Switch to Hindi'}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/20"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-300" />
              <span>{isHindi ? 'हिन्दी' : 'ENG'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progress Pills Bar */}
        <div className="px-4 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          {allSteps.map((step, idx) => {
            const isDone = Boolean(slotValues[step.key]);
            const isCurrent = idx === currentStepIndex && !isCompleted;
            return (
              <div
                key={step.key}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-emerald-600 text-white shadow-xs scale-102 ring-2 ring-emerald-500/30'
                    : isDone
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-white text-slate-500 border border-slate-200'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-bold">
                    {idx + 1}
                  </span>
                )}
                <span>{isHindi ? step.label.hi : step.label.en}</span>
              </div>
            );
          })}
        </div>

        {/* Conversation Dialogue History Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50">
          {conversationHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`block text-[10px] mt-1.5 ${
                    msg.sender === 'user' ? 'text-emerald-100 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {/* Real-time Listening Waveform Visualizer */}
          {isListening && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-2xl w-fit animate-in fade-in">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <div className="flex items-center gap-1">
                <span className="w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.4s] h-3" />
                <span className="w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.2s] h-6" />
                <span className="w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.5s] h-8" />
                <span className="w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.1s] h-5" />
                <span className="w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
              </div>
              <span className="text-xs font-bold text-rose-700">
                {isHindi ? `सुन रहा हूँ (${formatTime(recordingDuration)})...` : `Listening (${formatTime(recordingDuration)})...`}
              </span>
            </div>
          )}

          {/* Processing Spinner */}
          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-3 rounded-2xl w-fit border border-amber-200 animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
              <span>
                {isHindi ? 'Gemini AI उत्तर का विश्लेषण कर रहा है...' : 'Gemini AI is extracting slot answer...'}
              </span>
            </div>
          )}

          {/* Assistant Speaking Indicator */}
          {isSpeaking && (
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl w-fit border border-emerald-200">
              <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>{isHindi ? 'सहायक बोल रहा है...' : 'Assistant is speaking prompt...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Live Visual Real-Time Form Fields Preview Card */}
        <div className="px-4 py-3 bg-white border-t border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              {isHindi ? 'लाइव फॉर्म स्थिति' : 'Live Form State'}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold">
              {Object.values(slotValues).filter(Boolean).length} of {allSteps.length} {isHindi ? 'भरे गए' : 'completed'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {allSteps.slice(0, 4).map((step) => {
              const val = slotValues[step.key];
              const isCurrent = step.key === currentSlot?.key && !isCompleted;
              return (
                <div
                  key={step.key}
                  className={`p-2 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                      : val
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-slate-50/50 border-dashed border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-500 block truncate">
                    {isHindi ? step.label.hi : step.label.en}
                  </span>
                  <span className="font-semibold text-slate-900 truncate block mt-0.5">
                    {val ? String(val) : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Push-to-Talk / Action Controls Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Helper Action Buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={repeatQuestion}
              disabled={isSpeaking || isListening || isProcessing}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>{isHindi ? 'दोहराएं' : 'Repeat'}</span>
            </button>

            <button
              type="button"
              onClick={skipStep}
              disabled={isSpeaking || isListening || isProcessing}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <SkipForward className="w-3.5 h-3.5 text-slate-500" />
              <span>{isHindi ? 'छोड़ें' : 'Skip'}</span>
            </button>
          </div>

          {/* Main Primary Push-to-Talk Recording Action */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            {isCompleted ? (
              <button
                type="button"
                onClick={handleFinishAndNavigate}
                className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102"
              >
                <PartyPopper className="w-4 h-4" />
                <span>{isHindi ? 'सेटअप पूरा करें' : 'Finish & Go to Summary'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : !isAudioSupported ? (
              <div className="text-xs text-slate-400 font-medium">
                {isHindi ? 'ऑडियो समर्थित नहीं है' : 'Audio not supported'}
              </div>
            ) : (
              <button
                type="button"
                onClick={isListening ? stopListeningAndProcess : startListening}
                disabled={isProcessing}
                className={`w-full sm:w-auto py-3.5 px-6 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/40 ring-4 ring-rose-500/30 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-600/30 hover:scale-102'
                }`}
              >
                {isListening ? (
                  <>
                    <Square className="w-4 h-4 fill-white text-white" />
                    <span>{isHindi ? 'उत्तर पूरा हुआ (रोकें)' : 'Done Speaking (Stop)'}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>
                      {isHindi ? 'उत्तर बोलने के लिए दबाएं' : 'Tap to Speak Answer'}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
