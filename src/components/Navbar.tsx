import React from 'react';
import { ActiveTab } from '../types';
import { Radio, Activity, HeartPulse, Github, BrainCircuit, Wifi, Terminal, Smartphone, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'radar', label: 'Radar Wi-Fi', icon: <Radio className="w-4 h-4" /> },
    { id: 'spatial-vision', label: 'CSI Spatial Studio', icon: <Radio className="w-4 h-4 text-emerald-400" /> },
    { id: 'csi', label: 'Spectru CSI', icon: <Wifi className="w-4 h-4" /> },
    { id: 'vitals', label: 'Semne Vitale', icon: <HeartPulse className="w-4 h-4" /> },
    { id: 'spatial', label: 'Densitate Spațială', icon: <Activity className="w-4 h-4" /> },
    { id: 'bat', label: 'Turn & Echolocație', icon: <Radio className="w-4 h-4 text-cyan-400" /> },
    { id: 'phone', label: 'Direct pe Telefon', icon: <Smartphone className="w-4 h-4 text-emerald-400" /> },
    { id: 'serial', label: 'Consolă ESP32', icon: <Terminal className="w-4 h-4" /> },
    { id: 'audit', label: 'Jurnal de Securitate', icon: <ShieldAlert className="w-4 h-4 text-amber-400" /> },
    { id: 'github', label: 'GitHub & Hardware', icon: <Github className="w-4 h-4" /> },
    { id: 'ai', label: 'Inteligență RF AI', icon: <BrainCircuit className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-500 p-[2px] shadow-lg shadow-cyan-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
              Detector de Oameni prin Wi-Fi & Radar CSI
            </h1>
            <p className="text-[11px] text-cyan-400/80 font-mono">Tehnologie RF 2.4GHz / 5GHz & Detecție prin Pereți</p>
          </div>
        </div>

        <nav className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
