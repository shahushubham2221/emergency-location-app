import React, { useState, useRef, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Shield, Send, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GuardianAssistant() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'I can help with questions about SOS Guardian. Ask me about SOS, contacts, GPS, or offline mode.' }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInput('');

    // Rule-based dummy AI response
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let response = 'I can help with questions about SOS Guardian. Ask me about SOS, contacts, GPS, or offline mode.';
      
      if (lower.includes('sos') || lower.includes('help')) {
        response = 'Pressing the large red SOS button starts a 5-second countdown. If not cancelled, it starts tracking your location and opens an SMS to alert your contacts.';
      } else if (lower.includes('contact')) {
        response = 'You can add Trusted Contacts from the Contacts tab. They will receive SMS alerts with your location link when you activate SOS.';
      } else if (lower.includes('gps') || lower.includes('location')) {
        response = 'SOS Guardian requires GPS permission to share your location. It ONLY tracks you when SOS is active. If GPS fails, we use your last known location.';
      } else if (lower.includes('offline') || lower.includes('internet')) {
        response = 'If you lose internet during an emergency, SOS Guardian saves your location locally and syncs it the moment you reconnect.';
      } else if (lower.includes('police') || lower.includes('ambulance') || lower.includes('emergency number')) {
        response = 'In India, dial 112 for general emergencies, 100 for Police, 101 for Fire, and 108 for Ambulance. You can find nearby services in the Map tab.';
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 600);
  };

  return (
    <div className="min-h-dvh bg-[#F0F4FF] flex flex-col w-full overflow-x-hidden">
      <Header title="Guardian Assistant" showBack />
      
      <div className="bg-amber-100 text-amber-800 text-xs py-2 px-4 flex items-center justify-center gap-2">
        <AlertTriangle size={14} />
        <span className="font-medium text-center">For app guidance only. In a real emergency, call 112.</span>
      </div>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-36 max-w-lg mx-auto w-full">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
            }`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1.5 text-blue-600 font-bold text-xs">
                  <Shield size={12} /> Guardian AI
                </div>
              )}
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </main>

      <div
        className="fixed left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 p-3 z-20"
        style={{ bottom: 'calc(52px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-lg mx-auto flex gap-2">
          <button
            onClick={() => navigate('/app/sos-countdown')}
            className="shrink-0 bg-red-600 text-white rounded-xl px-4 font-bold flex items-center shadow-md active:scale-95"
          >
            SOS
          </button>
          <form onSubmit={handleSend} className="flex-1 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-gray-100 border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="bg-blue-600 text-white rounded-xl w-12 flex items-center justify-center disabled:opacity-50 transition-opacity"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
