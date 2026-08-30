import React, { useState } from 'react';
import { X, Send, Bot, User, Sparkles, Sprout, AlertCircle, HelpCircle } from 'lucide-react';
import { useFarm } from '../context/FarmContext';

interface AgronomistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgronomistModal: React.FC<AgronomistModalProps> = ({ isOpen, onClose }) => {
  const { farm, weather } = useFarm();
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Hello ${farm.location.name ? 'Farmer from ' + farm.location.name : 'Farmer'}! I am your AgriNet AI Agronomist. I have analyzed your ${farm.crop.cropName || 'Rice'} (${farm.crop.variety || 'Jyothi'}) crop at the ${farm.crop.growthStage || 'Tillering'} stage on ${farm.soil.soilType || 'Clayey'} soil. How can I assist your field today?`,
      time: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    `Best fertilizer dosage for ${farm.crop.cropName || 'Rice'} at ${farm.crop.growthStage || 'Tillering'} stage?`,
    `Will tomorrow's rain affect pesticide spraying?`,
    `How to prevent stem borer in ${farm.soil.soilType || 'Clayey'} soil?`,
    `Should I irrigate given the current 84% humidity?`,
  ];

  const handleSend = (textToSend?: string) => {
    const prompt = textToSend || inputValue;
    if (!prompt.trim()) return;

    const userMsg = { sender: 'user' as const, text: prompt, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = prompt.toLowerCase();

      if (lower.includes('fertilizer') || lower.includes('dosage') || lower.includes('urea')) {
        reply = `For your ${farm.crop.variety || 'Jyothi'} variety at ${farm.crop.growthStage || 'Tillering'} stage (Day ${farm.crop.daysSincePlanting || 12}), recommend applying Urea @ 35 kg/ha as a top-dress. Ensure a thin water film (2-3 cm) in your ${farm.soil.soilType} field before broadcasting.`;
      } else if (lower.includes('rain') || lower.includes('spray') || lower.includes('weather')) {
        reply = `With 65% rain probability forecasted for tomorrow in ${farm.location.name || 'Ernakulam'}, hold off on any foliar fungicide or insecticide sprays today. The chemical will wash off before systemic absorption.`;
      } else if (lower.includes('stem borer') || lower.includes('pest')) {
        reply = `Yellow Stem Borer moths are active during high humidity (>80%). Install 5 pheromone traps per hectare. If dead hearts exceed 5% threshold, consider Cartap Hydrochloride 4G @ 25 kg/ha or Neem oil 1500 ppm spray.`;
      } else if (lower.includes('irrigate') || lower.includes('water')) {
        reply = `Given your ${farm.irrigation} setup and current soil moisture saturation (78%), no irrigation is required for the next 72 hours. Let natural rainfall supply the crop needs.`;
      } else {
        reply = `Based on your ${farm.size} ${farm.sizeUnit} plot in ${farm.location.name} (${farm.location.state}), the crop health index (NDVI 0.74) is vigorous. Keep monitoring the vegetative tillers and maintain bund height for monsoon water conservation.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 800);
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
                <span className="font-bold text-base font-heading">AgriNet AI Agronomist</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-emerald-200">
                Trained on ICAR, TNAU, and localized crop telemetry
              </p>
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
                className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
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

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl w-fit border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              <span>Analyzing agronomic parameters...</span>
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
            placeholder="Ask about fertilizer, pest control, weather, soil..."
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
