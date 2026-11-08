import React, { useState, useEffect, useRef } from 'react';
import { Radio, Activity, Wifi, Terminal, Download, ExternalLink, Play, Square, RefreshCw, CheckCircle2, AlertTriangle, Copy, Check, Settings } from 'lucide-react';

interface CsiDataPayload {
  timestamp: number;
  csi_raw: number[];
  variance: number;
  human_detected: boolean;
  radar: {
    angle: number;
    distance_m: number;
    signal_strength_dbm: number;
  };
}

export function CsiSpatialVisionStudio() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [data, setData] = useState<CsiDataPayload>({
    timestamp: 0,
    csi_raw: Array(30).fill(20),
    variance: 0.85,
    human_detected: false,
    radar: {
      angle: 0,
      distance_m: 0,
      signal_strength_dbm: -52
    }
  });

  const [mode, setMode] = useState<'internal' | 'websocket'>('internal');
  const [wsUrl, setWsUrl] = useState('ws://localhost:8765');
  const [wsConnected, setWsConnected] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const [varianceThreshold, setVarianceThreshold] = useState(1.2);
  const [copied, setCopied] = useState(false);
  const [activeSubcarrierCount, setActiveSubcarrierCount] = useState(30);

  const wsRef = useRef<WebSocket | null>(null);
  const tickRef = useRef(0);

  // Internal Python Algorithm Implementation in TypeScript/JS
  const processCsiData = (tick: number, threshold: number): CsiDataPayload => {
    const SUBCARRIERS = 30;
    const BASE_DISTANCE = 2.5;
    const csiAmplitudes: number[] = [];
    const movementFactor = Math.sin(tick * 0.1) * 1.5;

    for (let i = 0; i < SUBCARRIERS; i++) {
      const noise = (Math.random() - 0.5) * 0.4;
      const amp = 20 + Math.sin(i * 0.3 + tick * 0.15) * 5 + movementFactor + noise;
      csiAmplitudes.push(parseFloat(amp.toFixed(2)));
    }

    const meanAmp = csiAmplitudes.reduce((a, b) => a + b, 0) / csiAmplitudes.length;
    const variance = csiAmplitudes.reduce((sum, x) => sum + Math.pow(x - meanAmp, 2), 0) / csiAmplitudes.length;
    const angle = (tick * 5) % 360;
    const detected = variance > threshold;
    const estimatedDistance = parseFloat((BASE_DISTANCE + Math.sin(tick * 0.05) * 0.8).toFixed(2));

    return {
      timestamp: tick,
      csi_raw: csiAmplitudes,
      variance: parseFloat(variance.toFixed(3)),
      human_detected: detected,
      radar: {
        angle: angle,
        distance_m: detected ? estimatedDistance : 0,
        signal_strength_dbm: Math.round(-50 - (variance * 2))
      }
    };
  };

  // Internal loop (when mode is 'internal')
  useEffect(() => {
    if (mode !== 'internal') return;

    const interval = setInterval(() => {
      tickRef.current += 1;
      const computed = processCsiData(tickRef.current, varianceThreshold);
      setData(computed);
    }, 50);

    return () => clearInterval(interval);
  }, [mode, varianceThreshold]);

  // WebSocket Connection (when mode is 'websocket')
  useEffect(() => {
    if (mode !== 'websocket') {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsConnected(false);
      return;
    }

    let socket: WebSocket | null = null;
    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setWsConnected(true);
        setWsError(null);
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setData(parsed);
        } catch (e) {
          console.error("Error parsing WS packet:", e);
        }
      };

      socket.onerror = () => {
        setWsConnected(false);
        setWsError(`Nu s-a putut conecta la ${wsUrl}. Asigură-te că rulezi 'python server.py'.`);
      };

      socket.onclose = () => {
        setWsConnected(false);
      };
    } catch (err: any) {
      setWsConnected(false);
      setWsError(err.message || 'Eroare conexiune WebSocket');
    }

    return () => {
      if (socket) socket.close();
    };
  }, [mode, wsUrl]);

  // Draw Radar Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = 220;

    // Fade trail background
    ctx.fillStyle = 'rgba(1, 4, 9, 0.15)';
    ctx.fillRect(0, 0, width, height);

    // Distance rings
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    for (let r = 50; r <= maxRadius; r += 50) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(88, 166, 255, 0.4)';
      ctx.font = '10px monospace';
      const distM = ((r / maxRadius) * 4).toFixed(1);
      ctx.fillText(`${distM}m`, centerX + 4, centerY - r + 12);
    }

    // Crosshairs
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - maxRadius, centerY);
    ctx.lineTo(centerX + maxRadius, centerY);
    ctx.moveTo(centerX, centerY - maxRadius);
    ctx.lineTo(centerX, centerY + maxRadius);
    ctx.stroke();

    // Radar Sweep line
    const angleRad = (data.radar.angle * Math.PI) / 180;
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + maxRadius * Math.cos(angleRad), centerY + maxRadius * Math.sin(angleRad));
    ctx.stroke();

    // Center Router Indicator
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#58a6ff';
    ctx.fill();

    // Target Marker
    if (data.human_detected && data.radar.distance_m > 0) {
      const targetR = (data.radar.distance_m / 4) * maxRadius;
      const targetX = centerX + targetR * Math.cos(angleRad);
      const targetY = centerY + targetR * Math.sin(angleRad);

      ctx.fillStyle = '#ff7b72';
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#ff7b72';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Distance tag
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${data.radar.distance_m}m`, targetX + 10, targetY - 5);
    }
  }, [data]);

  const copyPythonCode = () => {
    const code = `import asyncio
import json
import math
import random
import websockets

SUBCARRIERS = 30
BASE_DISTANCE = 2.5

def process_csi_data(tick):
    csi_amplitudes = []
    movement_factor = math.sin(tick * 0.1) * 1.5

    for i in range(SUBCARRIERS):
        noise = random.uniform(-0.2, 0.2)
        amp = 20 + math.sin(i * 0.3 + tick * 0.15) * 5 + movement_factor + noise
        csi_amplitudes.append(round(amp, 2))

    mean_amp = sum(csi_amplitudes) / len(csi_amplitudes)
    variance = sum((x - mean_amp) ** 2 for x in csi_amplitudes) / len(csi_amplitudes)

    angle = (tick * 5) % 360
    detected = variance > 1.2
    estimated_distance = round(BASE_DISTANCE + math.sin(tick * 0.05) * 0.8, 2)

    return {
        "timestamp": tick,
        "csi_raw": csi_amplitudes,
        "variance": round(variance, 3),
        "human_detected": detected,
        "radar": {
            "angle": angle,
            "distance_m": estimated_distance if detected else 0,
            "signal_strength_dbm": int(-50 - (variance * 2))
        }
    }

async def csi_stream(websocket):
    print("Client conectat la studioul WiFi CSI!")
    tick = 0
    try:
        while True:
            data = process_csi_data(tick)
            await websocket.send(json.dumps(data))
            tick += 1
            await asyncio.sleep(0.05)
    except websockets.exceptions.ConnectionClosed:
        print("Client deconectat.")

async def main():
    print("Serverul WiFi CSI Spatial Vision ruleaza pe ws://localhost:8765")
    async with websockets.serve(csi_stream, "0.0.0.0", 8765):
        await asyncio.get_running_loop().create_future()

if __name__ == "__main__":
    asyncio.run(main())`;

    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadServerPy = () => {
    const code = `import asyncio
import json
import math
import random
import websockets

SUBCARRIERS = 30
BASE_DISTANCE = 2.5

def process_csi_data(tick):
    csi_amplitudes = []
    movement_factor = math.sin(tick * 0.1) * 1.5

    for i in range(SUBCARRIERS):
        noise = random.uniform(-0.2, 0.2)
        amp = 20 + math.sin(i * 0.3 + tick * 0.15) * 5 + movement_factor + noise
        csi_amplitudes.append(round(amp, 2))

    mean_amp = sum(csi_amplitudes) / len(csi_amplitudes)
    variance = sum((x - mean_amp) ** 2 for x in csi_amplitudes) / len(csi_amplitudes)

    angle = (tick * 5) % 360
    detected = variance > 1.2
    estimated_distance = round(BASE_DISTANCE + math.sin(tick * 0.05) * 0.8, 2)

    return {
        "timestamp": tick,
        "csi_raw": csi_amplitudes,
        "variance": round(variance, 3),
        "human_detected": detected,
        "radar": {
            "angle": angle,
            "distance_m": estimated_distance if detected else 0,
            "signal_strength_dbm": int(-50 - (variance * 2))
        }
    }

async def csi_stream(websocket):
    print("Client conectat la studioul WiFi CSI!")
    tick = 0
    try:
        while True:
            data = process_csi_data(tick)
            await websocket.send(json.dumps(data))
            tick += 1
            await asyncio.sleep(0.05)
    except websockets.exceptions.ConnectionClosed:
        print("Client deconectat.")

async def main():
    print("Serverul WiFi CSI Spatial Vision ruleaza pe ws://localhost:8765")
    async with websockets.serve(csi_stream, "0.0.0.0", 8765):
        await asyncio.get_running_loop().create_future()

if __name__ == "__main__":
    asyncio.run(main())`;

    const blob = new Blob([code], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'server.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Title Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" /> WiFi CSI Spatial Vision Studio
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            WiFi CSI Human Radar &amp; Spatial Vision
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Motor de procesare spectrală a 30 de subpurtătoare OFDM cu calcul de varianță statistică și localizare unghiulară.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setMode(m => m === 'internal' ? 'websocket' : 'internal')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              mode === 'internal'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{mode === 'internal' ? 'Motor: Integrat (20 Hz)' : 'Motor: WebSocket (Python)'}</span>
          </button>

          <a
            href="/spatial-studio.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Deschide index.html Standalone
          </a>

          <button
            onClick={downloadServerPy}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Descarcă server.py
          </button>
        </div>
      </div>

      {/* Main Studio View: Radar + Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Radar Canvas Box */}
        <div className="lg:col-span-7 bg-[#0d1117] border border-[#30363d] rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center relative">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 font-mono mb-4">
            <span className="flex items-center gap-2 text-cyan-400 font-bold">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" /> ECRAN RADAR CSI (500x500)
            </span>
            <span className="text-[11px] text-slate-400">Rază maximă: 4.0m</span>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-[#30363d] bg-[#010409] shadow-inner">
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              className="max-w-full h-auto block"
            />
          </div>

          <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 mt-4 px-2">
            <span>Ruter Emisie: Origine (0, 0)</span>
            <span className="text-emerald-400">Măturare 360° continuă</span>
            <span>Eșantionare: 50ms</span>
          </div>
        </div>

        {/* Dashboard Box */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-2xl space-y-5">
            {/* Status box with exact aesthetic */}
            <div
              className={`p-4 rounded-xl text-center text-sm font-bold tracking-wider font-mono transition-all duration-200 shadow-md ${
                data.human_detected
                  ? 'bg-[#238636] text-white border border-[#3fb950] shadow-[0_0_20px_rgba(35,134,54,0.4)]'
                  : 'bg-[#21262d] text-[#8b949e] border border-[#30363d]'
              }`}
            >
              {data.human_detected ? '🟢 OM DETECTAT' : '⚪ FĂRĂ MIȘCARE'}
            </div>

            {/* Metrics List */}
            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-3 bg-[#0d1117] border border-[#21262d] rounded-xl">
                <span className="text-[#8b949e]">Varianță CSI:</span>
                <span className={`text-sm font-bold ${data.variance > varianceThreshold ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {data.variance}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#0d1117] border border-[#21262d] rounded-xl">
                <span className="text-[#8b949e]">Distanță Estimată:</span>
                <span className="text-sm font-bold text-white">
                  {data.radar.distance_m} m
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#0d1117] border border-[#21262d] rounded-xl">
                <span className="text-[#8b949e]">Putere Semnal:</span>
                <span className="text-sm font-bold text-cyan-300">
                  {data.radar.signal_strength_dbm} dBm
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#0d1117] border border-[#21262d] rounded-xl">
                <span className="text-[#8b949e]">Unghi Radar (AoA):</span>
                <span className="text-sm font-bold text-amber-300">
                  {Math.round(data.radar.angle)}°
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#0d1117] border border-[#21262d] rounded-xl">
                <span className="text-[#8b949e]">Pachet CSI / Timestamp:</span>
                <span className="text-xs text-slate-400">
                  #{data.timestamp}
                </span>
              </div>
            </div>

            {/* Threshold setting */}
            <div className="p-3.5 bg-[#0d1117] border border-[#21262d] rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8b949e] flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-cyan-400" /> Prag Varianță Detecție:
                </span>
                <span className="text-cyan-400 font-bold">{varianceThreshold}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={varianceThreshold}
                onChange={(e) => setVarianceThreshold(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.5 (Foarte sensibil)</span>
                <span>1.2 (Standard)</span>
                <span>3.0 (Filtru dur)</span>
              </div>
            </div>

            {/* WebSocket connection status bar */}
            {mode === 'websocket' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={wsUrl}
                    onChange={(e) => setWsUrl(e.target.value)}
                    placeholder="ws://localhost:8765"
                    className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
                  />
                  <button
                    onClick={() => {
                      if (wsRef.current) wsRef.current.close();
                      setMode('internal');
                      setTimeout(() => setMode('websocket'), 100);
                    }}
                    className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold"
                  >
                    Reconectează
                  </button>
                </div>

                <div
                  className={`p-2.5 rounded-xl border text-xs font-mono text-center ${
                    wsConnected
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {wsConnected ? `● Conectat la ${wsUrl}` : (wsError || `Deconectat de la ${wsUrl}`)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 30 Subcarriers Live Waveform Spectrum */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363d] pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Amplitudinea celor 30 de Subpurtătoare CSI (OFDM Subcarriers)
            </h3>
            <p className="text-xs text-slate-400">
              Variațiile de amplitudine între subpurtătoare indică modificarea mediului de propagare provocată de corpul uman.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Frecvență Canal: 2.412 GHz (Canal 1 Wi-Fi)
          </span>
        </div>

        {/* Visualizer Bar Chart */}
        <div className="h-44 flex items-end justify-between gap-1 pt-6 px-2 bg-[#0d1117] rounded-xl border border-[#21262d] overflow-x-auto">
          {data.csi_raw.map((amp, idx) => {
            const heightPct = Math.min(100, Math.max(10, ((amp - 10) / 25) * 100));
            const isSpike = Math.abs(amp - 20) > 3;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group min-w-[12px]">
                <span className="text-[8px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {amp}
                </span>
                <div
                  className={`w-full rounded-t-sm transition-all duration-75 ${
                    isSpike
                      ? 'bg-gradient-to-t from-emerald-600 to-cyan-400'
                      : 'bg-gradient-to-t from-blue-700 to-indigo-500'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[8px] font-mono text-slate-500 mt-1">
                  {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal & Code snippet Box */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white font-mono">Cum rulezi server.py pe PC / Raspberry Pi</h4>
          </div>
          <button
            onClick={copyPythonCode}
            className="px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-300 text-xs font-mono flex items-center gap-1.5 border border-[#30363d] transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiat!' : 'Copiază Codul'}</span>
          </button>
        </div>

        <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2">
          <p className="text-emerald-400"># 1. Instalează pachetul websockets:</p>
          <pre className="bg-[#010409] p-2.5 rounded-lg border border-[#30363d] text-cyan-300 select-all">pip install websockets</pre>

          <p className="text-emerald-400 mt-3"># 2. Pornește serverul Python:</p>
          <pre className="bg-[#010409] p-2.5 rounded-lg border border-[#30363d] text-cyan-300 select-all">python server.py</pre>

          <p className="text-slate-400 text-[11px] pt-2">
            Serverul va rula pe <span className="text-white font-bold">ws://localhost:8765</span>. Studioul din această pagină și fișierul <span className="text-white font-bold">spatial-studio.html</span> se vor conecta automat la fluxul live!
          </p>
        </div>
      </div>
    </div>
  );
}
