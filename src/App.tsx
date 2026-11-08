import React, { useState } from 'react';
import { PhoneRadarApp } from './components/PhoneRadarApp';
import { Smartphone, Monitor, QrCode, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';

export default function App() {
  const [copied, setCopied] = useState(false);
  const [deviceFrame, setDeviceFrame] = useState(false);

  const copyAppUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Banner when opened on desktop/tablet for easy transfer to physical phone */}
      <div className="hidden sm:flex bg-slate-900 border-b border-slate-800 px-4 py-2 text-xs items-center justify-between text-slate-300">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span>
            <strong className="text-white">Radar Wi-Fi Mobil</strong>: Această aplicație este proiectată exclusiv pentru telefonul mobil (iOS Safari &amp; Android Chrome).
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDeviceFrame(!deviceFrame)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-[11px] flex items-center gap-1.5 transition-all"
          >
            <Monitor className="w-3.5 h-3.5 text-cyan-400" />
            {deviceFrame ? 'Format Simplu' : 'Format Ramă Telefon'}
          </button>

          <button
            onClick={copyAppUrl}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono text-[11px] flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copiat!' : 'Copiază Linkul pe Telefon'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className={`flex-1 w-full flex justify-center items-start ${deviceFrame ? 'py-8' : 'py-0'}`}>
        {deviceFrame ? (
          /* Phone Mockup Frame for Desktop Testing */
          <div className="relative border-[8px] border-slate-800 rounded-[48px] shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden w-full max-w-[420px] bg-slate-950 min-h-[780px]">
            {/* Camera Dynamic Island / Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-50 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800 mr-2" />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/80 animate-pulse" />
            </div>

            <PhoneRadarApp />
          </div>
        ) : (
          /* Native 100% Mobile View */
          <div className="w-full flex justify-center">
            <PhoneRadarApp />
          </div>
        )}
      </main>
    </div>
  );
}
