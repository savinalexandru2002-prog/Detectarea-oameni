import React, { useState, useEffect, useRef } from 'react';
import { Activity, Radio, Grid, Sliders, Flame, ShieldAlert, RefreshCw } from 'lucide-react';

export function SpatialDensityMap() {
  const [gridSize, setGridSize] = useState<number>(20); // 20x20 grid cells
  const [frequency, setFrequency] = useState<'2.4GHz' | '5GHz'>('2.4GHz');
  const [peopleCount, setPeopleCount] = useState<number>(2);
  const [noiseLevel, setNoiseLevel] = useState<number>(15);
  const [animating, setAnimating] = useState<boolean>(true);
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number; density: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Human body simulation coordinates (moving slowly across the 2D room)
  const [bodies, setBodies] = useState<Array<{ x: number; y: number; vx: number; vy: number }>>([
    { x: 5, y: 10, vx: 0.1, vy: -0.05 },
    { x: 14, y: 8, vx: -0.08, vy: 0.12 },
    { x: 10, y: 16, vx: 0.05, vy: -0.07 },
  ]);

  useEffect(() => {
    if (!animating) return;
    const interval = setInterval(() => {
      setBodies(prev => prev.slice(0, peopleCount).map(b => {
        let nx = b.x + b.vx;
        let ny = b.y + b.vy;
        let nvx = b.vx;
        let nvy = b.vy;

        if (nx < 2 || nx > gridSize - 2) nvx *= -1;
        if (ny < 2 || ny > gridSize - 2) nvy *= -1;

        return { x: nx, y: ny, vx: nvx, vy: nvy };
      }));
    }, 100);
    return () => clearInterval(interval);
  }, [animating, gridSize, peopleCount]);

  // Render 2D Grid Heatmap on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;

    ctx.clearRect(0, 0, width, height);

    // Draw background room grid
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellWidth, 0);
      ctx.lineTo(i * cellWidth, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(width, i * cellHeight);
      ctx.stroke();
    }

    // Compute RF interference density for each cell
    for (let gx = 0; gx < gridSize; gx++) {
      for (let gy = 0; gy < gridSize; gy++) {
        let interference = 0;

        // Base background Wi-Fi signal propagation (Fresnel zone attenuation)
        const rx = (gx + 0.5);
        const ry = (gy + 0.5);
        
        // Router at top-left or center
        const routerDist = Math.sqrt(Math.pow(rx - gridSize / 2, 2) + Math.pow(ry - gridSize / 2, 2));
        const baseSignal = Math.max(0, 100 - routerDist * 4);

        // Add human body scattering effect
        bodies.forEach(b => {
          const distToBody = Math.sqrt(Math.pow(rx - b.x, 2) + Math.pow(ry - b.y, 2));
          // Interference ripple peak near human body
          if (distToBody < 4.5) {
            interference += (4.5 - distToBody) * 22;
          }
        });

        // Add random noise
        const totalDensity = Math.min(100, Math.max(5, baseSignal * 0.3 + interference + (Math.random() * noiseLevel)));

        // Color mapping based on density (Thermal / RF Plasma Palette)
        let red = 6, green = 182, blue = 212; // Cyan baseline
        if (totalDensity > 75) {
          red = 239; green = 68; blue = 68; // Red high interference
        } else if (totalDensity > 50) {
          red = 245; green = 158; blue = 11; // Amber medium interference
        } else if (totalDensity > 30) {
          red = 59; green = 130; blue = 246; // Blue moderate
        }

        const alpha = Math.min(0.9, Math.max(0.2, totalDensity / 100));
        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
        ctx.fillRect(gx * cellWidth + 1, gy * cellHeight + 1, cellWidth - 2, cellHeight - 2);
      }
    }

    // Draw human body markers on top of grid
    bodies.forEach((b, idx) => {
      const px = (b.x + 0.5) * cellWidth;
      const py = (b.y + 0.5) * cellHeight;

      ctx.beginPath();
      ctx.arc(px, py, cellWidth * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, cellWidth * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText(`P${idx + 1}`, px - 6, py - cellWidth * 0.5 - 2);
    });

  }, [gridSize, frequency, bodies, noiseLevel]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellWidth = canvas.width / gridSize;
    const cellHeight = canvas.height / gridSize;

    const gx = Math.floor(x / cellWidth);
    const gy = Math.floor(y / cellHeight);

    const density = Math.floor(40 + Math.random() * 55);
    setSelectedCell({ x: gx, y: gy, density });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
          <Grid className="w-3.5 h-3.5 animate-pulse" /> Modul de Cartografiere a Densității Spațiale RF
        </div>
        <h2 className="text-3xl font-extrabold text-white">Harta 2D a Interferențelor Wi-Fi & Corpului Uman</h2>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Vizualizați în timp real cum prezența umană distorsionează undele electromagnetice de la ruter, creând zone de interferență multipath (CSI) cartografiate pe o grilă bidimensională.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6 shadow-xl">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" /> Parametri Grilă & RF
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Număr Subiecți Simulați</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setPeopleCount(num)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      peopleCount === num
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-800/80'
                    }`}
                  >
                    {num} Subiecți
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Rezoluție Grilă 2D</label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 20, 30].map((res) => (
                  <button
                    key={res}
                    onClick={() => setGridSize(res)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      gridSize === res
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-800/80'
                    }`}
                  >
                    {res}x{res} Cells
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Frecvență Ruter Wi-Fi</label>
              <div className="grid grid-cols-2 gap-2">
                {['2.4GHz', '5GHz'].map((band) => (
                  <button
                    key={band}
                    onClick={() => setFrequency(band as any)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      frequency === band
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-800/80'
                    }`}
                  >
                    {band}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Nivel Zgomot RF (Noise Floor)</span>
                <span>{noiseLevel}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <button
              onClick={() => setAnimating(!animating)}
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-90 text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${animating ? 'animate-spin' : ''}`} />
              <span>{animating ? 'Pauză Animație Mișcare' : 'Pornește Animația'}</span>
            </button>
          </div>

          {selectedCell && (
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
              <span className="text-cyan-400 font-bold block">Informații Celulă Selectată:</span>
              <div className="flex justify-between text-slate-300">
                <span>Coordonate (X, Y):</span>
                <span>({selectedCell.x}, {selectedCell.y})</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Densitate Interferență:</span>
                <span className="text-emerald-400">{selectedCell.density}%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Status Semnal:</span>
                <span className="text-amber-400">{selectedCell.density > 70 ? 'Distorsiune Ridicată' : 'Stabil'}</span>
              </div>
            </div>
          )}
        </div>

        {/* 2D Heatmap Grid Display Stage */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col items-center justify-center relative min-h-[500px] shadow-xl">
          <div className="absolute top-4 left-6 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-mono text-slate-300 uppercase tracking-wider">Hartă Termică 2D • Interferențe RF Wi-Fi</span>
          </div>

          <div className="relative w-full max-w-[460px] aspect-square flex items-center justify-center cursor-pointer mt-4">
            <canvas
              ref={canvasRef}
              width={460}
              height={460}
              onClick={handleCanvasClick}
              className="w-full h-full rounded-2xl bg-slate-950 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10"
            />
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-cyan-500" />
              <span>Semnal Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500" />
              <span>Interferență Medie</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span>Prezență / Obstacol</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
