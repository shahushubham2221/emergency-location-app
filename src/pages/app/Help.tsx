import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  {
    q: 'What happens when I press SOS?',
    a: 'A 5-second countdown starts. You can cancel it. If you don\'t, an emergency session begins, your live location is tracked, and SMS alerts are prepared for your trusted contacts.'
  },
  {
    q: 'What happens without internet?',
    a: 'SOS Guardian saves your last known location on your device. When your connection returns, it automatically syncs with the emergency server.'
  },
  {
    q: 'How is my location used?',
    a: 'Your location is ONLY tracked during an active SOS session to help emergency services and your contacts find you.'
  },
  {
    q: 'How do I stop SOS?',
    a: 'Press the large "STOP SOS" button on the active emergency screen and confirm you want to end the session.'
  },
  {
    q: 'What if GPS doesn\'t work?',
    a: 'The app will use the last known location saved on your device and will display a warning that location accuracy is low.'
  },
  {
    q: 'Are SMS alerts automatic?',
    a: 'Because of browser security, we open your phone\'s SMS composer with a pre-filled emergency message. You must tap "Send" to actually send the SMS.'
  },
];

export default function Help() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      <Header title="Help & FAQ" showBack />
      
      <main className="px-4 py-6 pb-24 max-w-lg mx-auto space-y-4">
        <div className="bg-blue-600 rounded-2xl p-6 text-white text-center mb-6">
          <HelpCircle size={48} className="mx-auto mb-4 opacity-90" />
          <h2 className="text-xl font-bold mb-2">How can we help?</h2>
          <p className="text-blue-100 text-sm">Find answers to common questions about using SOS Guardian safely.</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                <ChevronDown 
                  size={18} 
                  className={`text-gray-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-5 pb-4 text-sm text-gray-600"
                  >
                    <div className="pt-2 border-t border-gray-50">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
