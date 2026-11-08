import React, { useState } from 'react';
import { DetectedPerson } from '../types';
import { Wifi, Radio, UserCheck, ArrowRight, UserX, Plus, RefreshCw, AlertCircle, Compass, Zap, Activity } from 'lucide-react';

interface RouterProximityRubricProps {
  people: DetectedPerson[];
  onAddNear: () => void;
  onAddMid: () => void;
  onAddFar: () => void;
  onRemove: (id: string) => void;
  onResetDefaults: () => void;
}

export function RouterProximityRubric({
  people,
  onAddNear,
  onAddMid,
  onAddFar,
  onRemove,
  onResetDefaults,
}: RouterProximityRubricProps) {
  const [filter, setFilter] = useState<'ALL' | 'NEAR' | 'MID' | 'FAR'>('ALL');

  // Classification criteria
  // NEAR: < 3 meters (Line of Sight / Immediate proximity to router)
  // MID: 3m - 15m (Same room or adjacent room through 1 partition wall)
  // FAR: > 15m up to 100m (Through multiple concrete walls or exterior)
  const nearPeople = people.filter(p => p.distance < 3);
  const midPeople = people.filter(p => p.distance >= 3 && p.distance <= 15);
  const farPeople = people.filter(p => p.distance > 15);

  const displayedPeople = filter === 'NEAR' 
    ? nearPeople 
    : filter === 'MID' 
    ? midPeople 
    : filter === 'FAR' 
    ? farPeople 
    : people;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6 shadow-2xl">
      {/* Header of the Dedicated Rubric */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> Rubrică Separată • Clasificare Persoane după Distanța față de Ruter
          </div>
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            Proximitate Față de Ruter Wi-Fi: Persoane Aproape vs. Departe
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Ruterul Wi-Fi este originea centrală de emisie (0.0m). Persoanele sunt clasificate automat în timp real după distanța calculată din timpul de propagare al subpurtătoarelor CSI și atenuarea semnalului (dBm).
          </p>
        </div>

        {/* Quick Simulation Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onAddNear}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-all flex items-center gap-1.5 shadow-sm"
            title="Simulează o persoană în imediata apropiere a ruterului (< 3 metri)"
          >
            <Plus className="w-3.5 h-3.5" /> Persoană Aproape (&lt;3m)
          </button>
          <button
            onClick={onAddMid}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all flex items-center gap-1.5 shadow-sm"
            title="Simulează o persoană la distanță medie (3m - 15m)"
          >
            <Plus className="w-3.5 h-3.5" /> Distanță Medie (3-15m)
          </button>
          <button
            onClick={onAddFar}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition-all flex items-center gap-1.5 shadow-sm"
            title="Simulează o persoană la distanță mare de ruter (> 15 metri)"
          >
            <Plus className="w-3.5 h-3.5" /> Persoană Departe (&gt;15m)
          </button>
          <button
            onClick={onResetDefaults}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all"
            title="Resetează subiecții"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Proximity Summary Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1: Aproape de Ruter */}
        <div 
          onClick={() => setFilter(filter === 'NEAR' ? 'ALL' : 'NEAR')}
          className={`cursor-pointer rounded-2xl p-4.5 border transition-all ${
            filter === 'NEAR' 
              ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10' 
              : 'bg-slate-950/70 border-slate-800 hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
              🟢 Aproape de Ruter
            </span>
            <span className="text-2xl font-extrabold font-mono text-emerald-400">
              {nearPeople.length}
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Zonă Imediată (&lt; 3 metri)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Persoane în contact direct cu undele ruterului. Semnal foarte puternic (&gt; -55 dBm), rezoluție microscopică a respirației și mișcărilor.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-emerald-300">
            <span>ToF: &lt; 10 ns</span>
            <span>Atenuare: Minimă</span>
          </div>
        </div>

        {/* Tier 2: Distanță Medie */}
        <div 
          onClick={() => setFilter(filter === 'MID' ? 'ALL' : 'MID')}
          className={`cursor-pointer rounded-2xl p-4.5 border transition-all ${
            filter === 'MID' 
              ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10' 
              : 'bg-slate-950/70 border-slate-800 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
              🟡 Distanță Medie
            </span>
            <span className="text-2xl font-extrabold font-mono text-amber-400">
              {midPeople.length}
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Zonă Cameră / Adiacentă (3m – 15m)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Persoane în aceeași cameră sau în camera vecină. Semnal stabil (-55 dBm până la -72 dBm), penetrare prin 1 perete despărțitor.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-amber-300">
            <span>ToF: 10 - 50 ns</span>
            <span>Atenuare: -6dBm .. -14dBm</span>
          </div>
        </div>

        {/* Tier 3: Departe de Ruter */}
        <div 
          onClick={() => setFilter(filter === 'FAR' ? 'ALL' : 'FAR')}
          className={`cursor-pointer rounded-2xl p-4.5 border transition-all ${
            filter === 'FAR' 
              ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30 shadow-lg shadow-rose-500/10' 
              : 'bg-slate-950/70 border-slate-800 hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wide">
              🔴 Departe de Ruter
            </span>
            <span className="text-2xl font-extrabold font-mono text-rose-400">
              {farPeople.length}
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Zonă Îndepărtată (&gt; 15m – 100m)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Persoane la distanță mare de ruter (la celălalt capăt al clădirii, curte sau exterior). Semnal atenuat (&lt; -73 dBm), reflexii multipath complexe.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-rose-300">
            <span>ToF: 50 - 330 ns</span>
            <span>Atenuare: Înaltă (&gt; -25dBm)</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Target List */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'ALL'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Toate Persoanele ({people.length})
            </button>
            <button
              onClick={() => setFilter('NEAR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'NEAR'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🟢 Aproape ({nearPeople.length})
            </button>
            <button
              onClick={() => setFilter('MID')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'MID'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🟡 Mediu ({midPeople.length})
            </button>
            <button
              onClick={() => setFilter('FAR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'FAR'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔴 Departe ({farPeople.length})
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            {displayedPeople.length} {displayedPeople.length === 1 ? 'subiect afișat' : 'subiecți afișați'}
          </span>
        </div>

        {/* Detailed Persons Grid */}
        {displayedPeople.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl space-y-2">
            <UserX className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">Nicio persoană în această categorie de distanță.</p>
            <button
              onClick={filter === 'NEAR' ? onAddNear : filter === 'MID' ? onAddMid : filter === 'FAR' ? onAddFar : onResetDefaults}
              className="text-xs text-cyan-400 hover:underline font-semibold"
            >
              Apasă aici pentru a simula un subiect
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {displayedPeople.map((person, idx) => {
              const isNear = person.distance < 3;
              const isMid = person.distance >= 3 && person.distance <= 15;
              const isFar = person.distance > 15;
              const tofNs = (person.distance / 0.3).toFixed(1); // nanoseconds round trip in air

              return (
                <div
                  key={person.id}
                  className={`p-4 rounded-xl border transition-all relative overflow-hidden ${
                    isNear
                      ? 'bg-emerald-950/25 border-emerald-500/40 shadow-md shadow-emerald-500/5'
                      : isMid
                      ? 'bg-amber-950/20 border-amber-500/40 shadow-md shadow-amber-500/5'
                      : 'bg-rose-950/20 border-rose-500/40 shadow-md shadow-rose-500/5'
                  }`}
                >
                  {/* Top Status & Delete Button */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide border ${
                        isNear
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : isMid
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {isNear ? '🟢 APROAPE DE RUTER' : isMid ? '🟡 DISTANȚĂ MEDIE' : '🔴 DEPARTE DE RUTER'}
                    </span>

                    <button
                      onClick={() => onRemove(person.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Elimină acest subiect"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Primary Target Info */}
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" /> {person.activity}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Subiect #{person.id.slice(0, 4)} • Încredere: {person.confidence}%
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xl font-black font-mono ${
                          isNear ? 'text-emerald-400' : isMid ? 'text-amber-400' : 'text-rose-400'
                        }`}
                      >
                        {person.distance}m
                      </span>
                      <span className="text-[9px] text-slate-500 block uppercase font-mono">față de ruter</span>
                    </div>
                  </div>

                  {/* Proximity metrics grid */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[10px] font-mono">
                    <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                      <span className="text-slate-500 block">Putere Semnal</span>
                      <span className="text-white font-bold">{person.signalStrength} dBm</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                      <span className="text-slate-500 block">Timp Zbor (ToF)</span>
                      <span className="text-cyan-300 font-bold">{tofNs} ns</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                      <span className="text-slate-500 block">Poziție (X, Y)</span>
                      <span className="text-slate-300 font-bold">{person.x}, {person.y}m</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
