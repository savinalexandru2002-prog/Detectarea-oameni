import React, { useState, useEffect, useRef } from 'react';
import { Radio, Wifi, Shield, RefreshCw, Cpu, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { DetectedPerson } from '../types';

export function BatEcholocationRadar() {
  const [calibrating, setCalibrating] = useState<boolean>(false);
  const [calibrationProgress, setCalibrationProgress] = useState<number>(100);
  const [autoCalibrated, setAutoCalibrated] = useState<boolean>(true);
  const [sonarActive, setSonarActive] = useState<boolean>(true);
  const [pulseRadius, setPulseRadius] = useState<number>(0);
  
  const [people, setPeople] = useState<DetectedPerson[]>([
    { id: '1', x: 2.5, y: 3.8, distance: 4.5, angle: 45, activity: 'Walking', confidence: 98, signalStrength: -61 },
    { id: '2', x: -3.2, y: -2.1, distance: 3.8, angle: 215, activity: 'Sitting', confidence: 95, signalStrength: -68 },
    { id: '3', x: 1.0, y: -4.5, distance: 4.6, angle: 290, activity: 'Standing', confidence: 92, signalStrength: -72 },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-calibration function
  const startAutoCalibration = () => {
    setCalibrating(true);
    setCalibrationProgress(0);
    setAutoCalibrated(false);

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setCalibrationProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setCalibrating(false);
        setAutoCalibrated(true);
        // Spawn fresh detected subjects after auto-calibration
        setPeople([
          { id: Math.random().toString(), x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 6, distance: 3.2, angle: 35, activity: 'Walking', confidence: 99, signalStrength: -59 },
          { id: Math.random().toString(), x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 6, distance: 5.1, angle: 140, activity: 'Sitting', confidence: 97, signalStrength: -66 },
        ]);
      }
    }, 300);
  };

  // Bat echolocation pulse animation & target movement
  useEffect(() => {
    if (!sonarActive) return;
    const interval = setInterval(() => {
      setPulseRadius(prev => (prev + 4) % 220);

      // Natural movement like walking around the room
      setPeople(prev => prev.map(p => {
        const dx = (Math.random() - 0.5) * 0.1;
        const dy = (Math.random() - 0.5) * 0.1;
        const newX = Math.max(-6, Math.min(6, p.x + dx));
        const newY = Math.max(-6, Math.min(6, p.y + dy));
        const dist = Math.sqrt(newX * newX + newY * newY).toFixed(1);
        return {
          ...p,
          x: parseFloat(newX.toFixed(1)),
          y: parseFloat(newY.toFixed(1)),
          distance: parseFloat(dist)
        };
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [sonarActive]);

  // Canvas drawing for Bat Echolocation & Router Tower
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY) - 30;

    ctx.clearRect(0, 0, width, height);

    // Draw ambient grid
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.lineWidth = 1;
    [0.33, 0.66, 1].forEach((ratio, idx) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * ratio, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw Bat Echolocation Sonar Waves emanating from Router (Control Tower)
    if (sonarActive) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(6, 182, 212, ${Math.max(0, 1 - pulseRadius / 220)})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw Router (Control Tower) in center
    ctx.beginPath();
    ctx.arc(centerX, centerY, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Router Tower icon symbol
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('WiFi', centerX - 12, centerY + 4);

    // Draw echo lines and detected people (echolocation bounce)
    people.forEach((p, idx) => {
      const px = centerX + (p.x / 6) * (maxRadius * 0.85);
      const py = centerY - (p.y / 6) * (maxRadius * 0.85);

      // Echolocation return echo line from Router Tower to Human Body
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.setLineDash([]);

      // Body pulse ripple
      const ripple = 12 + Math.sin(Date.now() / 150 + idx) * 4;
      ctx.beginPath();
      ctx.arc(px, py, ripple, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Human target core
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // Label background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(px + 10, py - 12, 105, 26);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.strokeRect(px + 10, py - 12, 105, 26);

      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px sans-serif';
      ctx.fillText(`👤 ${p.activity}`, px + 15, py + 2);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '9px monospace';
      ctx.fillText(`${p.distance}m • Echo OK`, px + 15, py + 12);
    });

  }, [pulseRadius, people, sonarActive]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
          <Zap className="w-3.5 h-3.5 animate-pulse" /> Echolocație prin Wi-Fi • Ruter ca Turn de Control
        </div>
        <h2 className="text-3xl font-extrabold text-white">Radar Sonar de Tip Lilieci & Autocalibrare Automatizată</h2>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Ruterul Wi-Fi acționează ca un turn de control central, emițând impulsuri radio continue (precum liliecii prin ultrasunete). Undele ricoșează din corpurile umane, permițând localizarea instantanee.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6 shadow-xl">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" /> Control Turn & Autocalibrare
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Status Autocalibrare</span>
                {autoCalibrated ? (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] rounded-full font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Calibrat 100%
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded-full font-mono">În Curs...</span>
                )}
              </div>

              {calibrating && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Progres Autocalibrare RF</span>
                    <span>{calibrationProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${calibrationProgress}%` }} />
                  </div>
                </div>
              )}

              <button
                onClick={startAutoCalibration}
                disabled={calibrating}
                className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold py-2.5 rounded-xl text-xs transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${calibrating ? 'animate-spin' : ''}`} />
                <span>Rulează Autocalibrarea Automatizată</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-800/50 border border-slate-700/60 rounded-xl">
              <div>
                <span className="text-xs font-bold text-white block">Emisie Sonar ca Liliecii</span>
                <span className="text-[10px] text-slate-400">Pulsuri radio de la ruterul turn de control</span>
              </div>
              <button
                onClick={() => setSonarActive(!sonarActive)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 ${sonarActive ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${sonarActive ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <button
              onClick={() => {
                const activities: Array<'Walking' | 'Sitting' | 'Standing' | 'Sleeping' | 'Typing'> = ['Walking', 'Sitting', 'Standing', 'Sleeping', 'Typing'];
                const randomActivity = activities[Math.floor(Math.random() * activities.length)];
                const newPerson: DetectedPerson = {
                  id: Math.random().toString(),
                  x: parseFloat(((Math.random() - 0.5) * 5).toFixed(1)),
                  y: parseFloat(((Math.random() - 0.5) * 5).toFixed(1)),
                  distance: parseFloat((Math.random() * 5).toFixed(1)),
                  angle: Math.floor(Math.random() * 360),
                  activity: randomActivity,
                  confidence: 96,
                  signalStrength: -64,
                };
                setPeople(prev => [...prev, newPerson]);
              }}
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-90 text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4" /> Adaugă Persoană Detectată (Echo)
            </button>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
            <span className="font-bold text-cyan-400 block">Modul Turn de Control:</span>
            <p className="leading-relaxed">
              Ruterul trimite pachete de test la milisecundă. Timpul de propagare (ToF) și reflexia CSI calculează distanța exactă a fiecărui subiect, exact ca sistemul de ecolocație al liliecilor.
            </p>
          </div>
        </div>

        {/* Sonar Stage Display */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col items-center justify-center relative min-h-[500px] shadow-xl">
          <div className="absolute top-4 left-6 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono text-slate-300 uppercase tracking-wider">Ruter Wi-Fi • Turn de Control Sonar Activ</span>
          </div>

          <div className="relative w-full max-w-[460px] aspect-square flex items-center justify-center mt-4">
            <canvas
              ref={canvasRef}
              width={460}
              height={460}
              className="w-full h-full rounded-full bg-slate-950 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10"
            />
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400" />
              <span>Ruter (Turn Control)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Subiect Detectat (Echo)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-cyan-500/30" />
              <span>Puls Sonar Wi-Fi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
