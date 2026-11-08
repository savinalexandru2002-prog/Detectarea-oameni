import React, { useState, useEffect } from 'react';
import { VitalSigns } from '../types';
import { HeartPulse, Activity, Wind, Zap } from 'lucide-react';

export function VitalsMonitor() {
  const [vitals, setVitals] = useState<VitalSigns>({
    breathingRate: 16,
    heartRate: 72,
    movementIndex: 12,
    status: 'Staționar / Repaus'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setVitals(prev => ({
        ...prev,
        breathingRate: 15 + Math.floor(Math.random() * 3),
        heartRate: 70 + Math.floor(Math.random() * 6),
        movementIndex: 8 + Math.floor(Math.random() * 10)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          <HeartPulse className="w-3.5 h-3.5" /> Semne Vitale & Respirație RF
        </div>
        <h2 className="text-3xl font-extrabold text-white">Monitorizarea Respirației prin Wi-Fi (Sub-Milimetru)</h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Măsurarea micro-deplasărilor cutiei toracice și a frecvenței cardiace folosind efectul Doppler din semnalele Wi-Fi care traversează încăperea.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
            <Wind className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Rată Respirație</span>
            <div className="text-4xl font-black text-white mt-1">{vitals.breathingRate} <span className="text-sm text-cyan-400 font-normal">resp/min</span></div>
          </div>
          <p className="text-xs text-slate-400">Frecvență normală de repaus</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <HeartPulse className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Puls Cardiac Estimat</span>
            <div className="text-4xl font-black text-white mt-1">{vitals.heartRate} <span className="text-sm text-rose-400 font-normal">bătăi/min</span></div>
          </div>
          <p className="text-xs text-slate-400">Extras prin micro-variații de fază</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Indice de Mișcare</span>
            <div className="text-4xl font-black text-white mt-1">{vitals.movementIndex}%</div>
          </div>
          <p className="text-xs text-emerald-400 font-medium">{vitals.status}</p>
        </div>
      </div>
    </div>
  );
}

