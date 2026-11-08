import React, { useState } from 'react';
import { AuditEvent } from '../types';
import { ShieldAlert, FileText, Download, Trash2, Filter, Search, Clock, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export function AuditLogView() {
  const [events, setEvents] = useState<AuditEvent[]>([
    { id: '1', timestamp: '11:05:12', type: 'alert', severity: 'critical', message: 'Prag de densitate spațială depășit (78% > 70%). Mișcare în zona principală.', source: 'Radar CSI 2.4GHz' },
    { id: '2', timestamp: '11:02:40', type: 'motion', severity: 'warning', message: 'Varianță de fază OFDM sesizată în sectorul Nordic (Distanță: 3.2m).', source: 'Senzor RF Multipath' },
    { id: '3', timestamp: '10:58:15', type: 'calibration', severity: 'info', message: 'Calibrare automată a zgomotului de fond (Noise Floor: -96dBm).', source: 'ESP32-S3 UART' },
    { id: '4', timestamp: '10:50:00', type: 'system', severity: 'info', message: 'Pornire sistem de monitorizare Wi-Fi CSI și analiză prin unde radio.', source: 'Sistem Core' },
  ]);

  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const addSimulatedEvent = () => {
    const types: ('alert' | 'motion' | 'calibration' | 'system')[] = ['alert', 'motion', 'calibration'];
    const severities: ('info' | 'warning' | 'critical')[] = ['info', 'warning', 'critical'];
    const t = types[Math.floor(Math.random() * types.length)];
    const s = severities[Math.floor(Math.random() * severities.length)];
    
    const newEvent: AuditEvent = {
      id: Math.random().toString(),
      timestamp: new Date().toTimeString().split(' ')[0],
      type: t,
      severity: s,
      message: t === 'alert' ? 'Detectată prezență umană neautorizată în raza de 5 metri.' : t === 'motion' ? 'Schimbare micro-Doppler în respirație detectată.' : 'Calibrare subpurtătoare OFDM finalizată.',
      source: 'Radar Wi-Fi CSI Live'
    };

    setEvents(prev => [newEvent, ...prev]);
  };

  const clearEvents = () => setEvents([]);

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `wifi_csi_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredEvents = events.filter(e => {
    if (filterType !== 'all' && e.type !== filterType) return false;
    if (searchTerm && !e.message.toLowerCase().includes(searchTerm.toLowerCase()) && !e.source.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
          <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> Jurnal de Securitate & Istoric Evenimente RF
        </div>
        <h2 className="text-3xl font-extrabold text-white">Jurnal de Securitate Wi-Fi CSI (Audit Log)</h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Istoricul complet al alertelor de prezență, modificărilor de fază RF și evenimentelor înregistrate de sistemul radar.
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Caută în jurnal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">Toate Tipurile</option>
              <option value="alert">Alerte</option>
              <option value="motion">Mișcare</option>
              <option value="calibration">Calibrări</option>
              <option value="system">Sistem</option>
            </select>

            <button
              onClick={addSimulatedEvent}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20"
            >
              Simulează Eveniment
            </button>

            <button
              onClick={exportJSON}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export JSON
            </button>

            <button
              onClick={clearEvents}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
              title="Șterge jurnalul"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Events Table / Timeline */}
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs font-mono">
              Niciun eveniment găsit în jurnal.
            </div>
          ) : (
            filteredEvents.map((ev) => {
              let sevColor = 'bg-slate-500/20 text-slate-300 border-slate-500/40';
              let Icon = Info;
              if (ev.severity === 'critical') {
                sevColor = 'bg-red-500/20 text-red-300 border-red-500/40';
                Icon = AlertTriangle;
              } else if (ev.severity === 'warning') {
                sevColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                Icon = ShieldAlert;
              }

              return (
                <div key={ev.id} className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-all">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl border ${sevColor} mt-0.5 sm:mt-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{ev.message}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${sevColor}`}>
                          {ev.severity}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                        <span>Sursă: <strong className="text-slate-300">{ev.source}</strong></span>
                        <span>•</span>
                        <span>Tip: <strong className="text-slate-300 uppercase">{ev.type}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono self-end sm:self-center shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{ev.timestamp}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
