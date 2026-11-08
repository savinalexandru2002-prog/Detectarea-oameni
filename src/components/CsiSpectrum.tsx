import React, { useState, useEffect } from 'react';
import { Wifi, Activity, BarChart3, RefreshCw } from 'lucide-react';

export function CsiSpectrum() {
  const [subcarriers, setSubcarriers] = useState<number[]>([]);
  const [packetCount, setPacketCount] = useState(1420);
  const [streaming, setStreaming] = useState(true);

  // Generate random OFDM subcarrier amplitudes (64 subcarriers like 802.11n)
  useEffect(() => {
    const generate = () => {
      const arr = Array.from({ length: 64 }, () => Math.floor(20 + Math.random() * 60));
      setSubcarriers(arr);
      setPacketCount(prev => prev + Math.floor(10 + Math.random() * 25));
    };

    generate();
    if (!streaming) return;
    const interval = setInterval(generate, 150);
    return () => clearInterval(interval);
  }, [streaming]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
          <Wifi className="w-3.5 h-3.5" /> Spectru Subpurtătoare OFDM
        </div>
        <h2 className="text-3xl font-extrabold text-white">Informații despre Starea Canalului Wi-Fi (CSI)</h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Analizați în timp real amplitudinea și faza celor 64 de subpurtătoare OFDM perturbate de prezența corpului uman în rețeaua Wi-Fi.
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Canal 802.11n 20MHz Canal 6</h3>
              <p className="text-xs text-slate-400 font-mono">Pachete Capturate: {packetCount}</p>
            </div>
          </div>

          <button
            onClick={() => setStreaming(!streaming)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              streaming
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {streaming ? '● Flux Live Activ' : '⏸ Flux Pus pe Pauză'}
          </button>
        </div>

        {/* Spectrum Bar Chart */}
        <div className="h-64 flex items-end gap-1 bg-slate-950/80 border border-slate-800 rounded-xl p-4 pt-8">
          {subcarriers.map((val, idx) => (
            <div
              key={idx}
              className="flex-1 bg-gradient-to-t from-blue-600 via-cyan-400 to-indigo-400 rounded-t transition-all duration-100"
              style={{ height: `${val}%` }}
              title={`Subpurtătoare #${idx}: ${val} dB`}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Putere RSSI</span>
            <p className="text-lg font-bold text-cyan-400">-64 dBm</p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Varianță de Fază</span>
            <p className="text-lg font-bold text-blue-400">0.42 rad</p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Stabilitate Multipath</span>
            <p className="text-lg font-bold text-emerald-400">98.2%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

