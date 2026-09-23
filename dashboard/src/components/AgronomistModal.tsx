import React, { useState } from 'react';
import { X, Send, Bot, User, Sparkles, Sprout, AlertCircle, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFarm } from '../context/FarmContext';
import type { DashboardState } from '@/pages/dashboard/state';
import { askAgronomistWithGemini } from '../config/gemini';

interface AgronomistModalProps {
  isOpen: boolean;
  onClose: () => void;
  state?: DashboardState;
}

export const AgronomistModal: React.FC<AgronomistModalProps> = ({ isOpen, onClose, state }) => {
  const { t } = useTranslation();
  const { farm, weather } = useFarm();

  const activeCropName =
    state?.farm?.crop?.cropName ||
    state?.farm?.crops?.[0]?.crop?.name

  const activeVariety =
    state?.farm?.crop?.variety ||
    state?.farm?.crops?.[0]?.variety

  const activeStage =
    state?.farm?.crop?.growthStage ||
    state?.farm?.crops?.[0]?.growth_stage?.stage_name

  const activeSoil =
    state?.farm?.soil_type ||
    state?.farm?.soil?.soilType

  const activeHumidity = state?.weather?.weather?.current?.relative_humidity_2m ?? weather.humidity;

  const farmLocationName =
    state?.farm?.name ||
    farm.location.name ||
    farm.farmName ||
    'Your Farm';

  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: t('agronomist_modal.greeting', {
        farmer: farmLocationName ? `Farmer from ${farmLocationName}` : 'Farmer',
        crop: activeCropName,
        variety: activeVariety,
        stage: activeStage,
        soil: activeSoil,
      }),
      time: t('agronomist_modal.just_now'),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    t('agronomist_modal.prompt_fertilizer', { crop: activeCropName, stage: activeStage }),
    t('agronomist_modal.prompt_stem_borer', { soil: activeSoil }),
    t('agronomist_modal.prompt_irrigate', { humidity: activeHumidity }),
  ];

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || inputValue;
    if (!prompt.trim() || isTyping) return;

    const userMsg = {
      sender: 'user' as const,
      text: prompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      const reply = await askAgronomistWithGemini(
        prompt,
        messages,
        {
          farmName: farmLocationName,
          cropName: activeCropName,
          variety: activeVariety,
          growthStage: activeStage,
          soilType: activeSoil,
          soilPh: state?.farm?.soilPh || farm.soil.ph,
          size: state?.farm?.area || farm.size,
          sizeUnit: state?.farm?.area_unit || farm.sizeUnit,
          irrigation: state?.farm?.irrigation_type || farm.irrigation,
          temperature: state?.weather?.weather?.current?.temperature_2m ?? weather.temp,
          humidity: state?.weather?.weather?.current?.relative_humidity_2m ?? weather.humidity,
          windSpeed: state?.weather?.weather?.current?.wind_speed_10m ?? weather.windSpeedKmH,
          rainProbability: weather.rainProbability,
          currentRain: state?.weather?.weather?.current?.rain,
          soilMoisture: state?.weather?.currentSoilMoisture?.soilMoisture0To1cm != null
            ? Math.round(state.weather.currentSoilMoisture.soilMoisture0To1cm * 100)
            : undefined,
          triggeredRisks: state?.intelligence?.results?.flatMap((r) => r.triggeredRisks || []),
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Sorry, could not retrieve advice from the AI Agronomist: ${err?.message || 'Please try again.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col h-[600px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-white">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base font-heading">{t('agronomist_modal.title')}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${msg.sender === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-100 text-emerald-800'
                  }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`block text-[10px] mt-1.5 ${msg.sender === 'user' ? 'text-emerald-100 text-right' : 'text-slate-400'
                    }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl w-fit border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              <span>{t('agronomist_modal.analyzing')}</span>
            </div>
          )}
        </div>

        {/* Quick Suggested Prompts */}
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex gap-2 overflow-x-auto">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              className="text-[11px] font-medium whitespace-nowrap bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 px-3 py-1.5 rounded-full transition-colors shrink-0 shadow-xs"
            >
              💡 {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('agronomist_modal.placeholder')}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
