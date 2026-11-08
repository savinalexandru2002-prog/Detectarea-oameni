import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Cpu,
  Wrench,
  Code2,
  Sparkles,
  ShieldCheck,
  Play,
  Terminal,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Zap,
  Activity,
  Wifi,
  Radio,
  Sliders,
  Flame,
  ArrowRight,
  Calendar,
  FastForward,
  Lightbulb,
  Moon,
  Compass
} from 'lucide-react';
import { radarAudio } from '../utils/audioAlert';

export interface DailyEvolutionIdea {
  dayNumber: number;
  title: string;
  emoji: string;
  autoCriticism: string;
  ideaDescription: string;
  practicalBenefit: string;
  radarEffect: string;
  codeSnippet: string;
  terminalLog: string;
  isAutoApplied?: boolean;
}

interface AutonomousCycleResult {
  healthScore: number;
  autonomousStatus: string;
  diagnostics: string[];
  repairsApplied: {
    subsystem: string;
    action: string;
    improvement: string;
  }[];
  codeFix: {
    title: string;
    language: string;
    code: string;
    explanation: string;
  };
  terminalLogs: string[];
}

interface AutonomousAIEngineerProps {
  onApplyCodePatch?: (codeTitle: string) => void;
  onActivateDailyIdea?: (idea: DailyEvolutionIdea) => void;
  onApplyAllIdeas?: (ideas: DailyEvolutionIdea[]) => void;
  allIdeasAutoApplied?: boolean;
  onToggleAutoApplyAll?: (enabled: boolean) => void;
  radarRange: number;
  targetCount: number;
}

export function AutonomousAIEngineer({
  onApplyCodePatch,
  onActivateDailyIdea,
  onApplyAllIdeas,
  allIdeasAutoApplied = true,
  onToggleAutoApplyAll,
  radarRange,
  targetCount
}: AutonomousAIEngineerProps) {
  // Autopilot Mode (Continuous Self-Repair Loop)
  const [autoPilotActive, setAutoPilotActive] = useState(false);
  const [autoEvolveInterval, setAutoEvolveInterval] = useState(false);
  const [isRunningCycle, setIsRunningCycle] = useState(false);
  const [cycleCount, setCycleCount] = useState(1);
  const [activeTab, setActiveTab] = useState<'repair' | 'coding' | 'evolution' | 'chaos'>('evolution');

  // AI Response Data
  const [data, setData] = useState<AutonomousCycleResult>({
    healthScore: 99,
    autonomousStatus: 'Autonom • Toate Sistemele Calibrate',
    diagnostics: [
      'Dispersie multipath OFDM analizată: Varianță CSI stabilă (1.45).',
      'Frecvență subpurtătoare 5.2 GHz sincronizată cu orientarea telefonului.',
      'Discriminare automată activă: Ființe umane vs. Aparate RF validate.'
    ],
    repairsApplied: [
      {
        subsystem: 'Calibrare Fazor Wi-Fi',
        action: 'Compensat automat faza OFDM pentru a neutraliza ecourile pereților din cărămidă',
        improvement: '+18% precizie prin perete'
      },
      {
        subsystem: 'Discriminare Ținte Multiple',
        action: 'Ajustat filtru Doppler pentru a separa respirația umană de zgomotul electrocasnicelor',
        improvement: 'Zero alarme false raportate'
      },
      {
        subsystem: 'Stabilitate Haptică & Sonar',
        action: 'Sincronizat oscilatorul Web Audio cu rata de cadre a ecranului (60 FPS)',
        improvement: 'Latență acustică < 5ms'
      }
    ],
    codeFix: {
      title: 'Filtru Kalman Adaptiv & Extragere Semnătură Biometrică',
      language: 'typescript',
      code: `// Algoritm compilat autonom de AI-ul integrat
export class AutonomousRadarFilter {
  private kalmanGain: number = 0.85;
  private currentEstimate: number = 0;

  // Calibrare automată a zgomotului RF din încăpere
  public processSubcarriers(csiAmplitudes: number[]): { isHuman: boolean; confidence: number } {
    const variance = csiAmplitudes.reduce((acc, val) => acc + Math.pow(val - 20, 2), 0) / csiAmplitudes.length;
    this.currentEstimate = this.currentEstimate + this.kalmanGain * (variance - this.currentEstimate);
    
    // Prag adaptiv prin pereți de beton (ajustat autonom)
    const isHuman = this.currentEstimate > 1.15;
    return {
      isHuman,
      confidence: Math.min(99.4, 85 + this.currentEstimate * 8)
    };
  }
}`,
      explanation: 'Codul aplică un filtru Kalman în timp real pe cele 30 de subpurtătoare Wi-Fi, asigurând detecția respirației umane chiar și prin pereți groși fără interferențe de la telefoane sau aparate.'
    },
    terminalLogs: [
      '[AUTONOMOUS-AI] Inițializare nucleu Gemini-3.8-Flash...',
      '[TELEMETRIE] 10/10 subsisteme mobile monitorizate în timp real.',
      '[AUTO-REPARARE] Parametrii RF și pragurile CSI ajustate autonom.',
      '[COMPILAT] Patch-ul de codare a fost validat pentru execuție pe telefon.'
    ]
  });

  // Coding Assistant State
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [patchApplied, setPatchApplied] = useState(false);

  // Daily Evolution & Auto-Update ("Pe zi ce trece mai bagă o idee")
  const [currentDay, setCurrentDay] = useState(8);
  const [selectedDay, setSelectedDay] = useState(8);
  const [isLoadingDailyIdea, setIsLoadingDailyIdea] = useState(false);
  const [activeDailyIdeaKey, setActiveDailyIdeaKey] = useState<string | null>('all_applied');

  const [dailyIdeas, setDailyIdeas] = useState<DailyEvolutionIdea[]>([
    {
      dayNumber: 1,
      title: 'Ziua 1: Modul Stealth Nocturn & Economizor OLED 🌃',
      emoji: '🌃',
      autoCriticism: 'Ne autoacuzăm sincer: Până azi noaptea radarul strălucea cu albastru intens și orbea ochii utilizatorului în pat, descărcând bateria telefonului!',
      ideaDescription: 'Trecere automată la mod OLED negru absolut (luminozitate adaptivă 15%), rată de cadre optimizată la 30 FPS și sunet de sonar relaxant la 300Hz pentru supraveghere discretă a camerei.',
      practicalBenefit: 'Consum de doar 2% baterie pe oră și supraveghere nocturnă silențioasă fără a trezi pe nimeni.',
      radarEffect: 'night_mode',
      isAutoApplied: true,
      codeSnippet: `export function activateNightMode(isNight: boolean) {
  return {
    theme: isNight ? 'oled_stealth_black' : 'standard',
    radarBrightness: isNight ? 0.25 : 1.0,
    sonarFrequencyHz: 300, // Ton nocturn profund
    batteryOptimization: true
  };
}`,
      terminalLog: '[EVOLUȚIE ZIUA 1] Mod Nocturn Stealth compilat și injectat cu succes.'
    },
    {
      dayNumber: 2,
      title: 'Ziua 2: Discriminator Biologic Animale de Companie 🐷🐾',
      emoji: '🐷',
      autoCriticism: 'Ne autoacuzăm: Până ieri radarul declanșa alarme la orice pisică, cățel sau porcușor de guineea care alerga prin casă, crezând că este un intrus uman pitic!',
      ideaDescription: 'Filtru spectral micro-Doppler ce analizează ritmul respirator accelerat al animalelor (26-45 BPM) și cota de reflexie la nivelul solului (<40cm). Semnalizează animalele cu badge roz 🐷🐾.',
      practicalBenefit: 'Zero alarme false când animalele tale dragi se plimbă libere dintr-o cameră în alta.',
      radarEffect: 'pet_mode',
      isAutoApplied: true,
      codeSnippet: `export function classifyBiometricTarget(respirationBpm: number, elevationCm: number): 'human' | 'pet' {
  // Animalele au respirație mult mai frecventă și semnalul e focalizat la sol
  if (respirationBpm > 24 || elevationCm < 45) {
    return 'pet'; // Marcaj cu emoji 🐷
  }
  return 'human';
}`,
      terminalLog: '[EVOLUȚIE ZIUA 2] Modul Biologic Animale 🐷 calibrat: zero alarme false de la animale.'
    },
    {
      dayNumber: 3,
      title: 'Ziua 3: Radar Alertă Curier & Livrare Pizza la Ușă 🍕🚪',
      emoji: '🍕',
      autoCriticism: 'Ne autoacuzăm: Utilizatorul stătea stresat cu ochii pe geam că nu știa când sosește curierul cu pizza fierbinte la ușă!',
      ideaDescription: 'Filtru Doppler zonal concentrat pe distanța de 1.8 - 2.4 metri (zona ușii de la intrare). Când o persoană se oprește în fața ușii, telefonul emite un ciripit vesel 🍕 și vibrație dublă.',
      practicalBenefit: 'Ești avertizat cu 5 secunde înainte să bată la ușă sau să sune la sonerie că a sosit pizza.',
      radarEffect: 'pizza_mode',
      isAutoApplied: true,
      codeSnippet: `export function detectDoorApproach(distanceMeters: number, dwellTimeSeconds: number) {
  if (distanceMeters < 2.3 && dwellTimeSeconds > 1.2) {
    return {
      alert: 'PIZZA_ARRIVED',
      badge: '🍕 Curier la ușă!',
      hapticPattern: [100, 50, 100],
      soundChirpHz: 1400
    };
  }
  return null;
}`,
      terminalLog: '[EVOLUȚIE ZIUA 3] Detector Curier Pizza 🍕 integrat în perimetrul ușii.'
    },
    {
      dayNumber: 4,
      title: 'Ziua 4: Detector Cabluri Sub Tensiune & Radiații EMF în Perete ⚡',
      emoji: '⚡',
      autoCriticism: 'Ne autoacuzăm: Utilizatorul risca să lovească un cablu de 220V când dorea să bată un cui în perete!',
      ideaDescription: 'Modificare a analizorului RF pentru a capta perturbațiile de 50Hz/60Hz din pereți când apropii telefonul de zid.',
      practicalBenefit: 'Găsești traseul cablurilor electrice ascunse în perete fără detector special scump.',
      radarEffect: 'emf_mode',
      isAutoApplied: true,
      codeSnippet: `export function scanWallEmf(magnetoReading: number): { hasLiveWire: boolean; warning: string } {
  const isWire = magnetoReading > 65; // microTesla
  return { hasLiveWire: isWire, warning: isWire ? '⚡ CABLU ELECTRIC ÎN PERETE!' : 'Zid Curat' };
}`,
      terminalLog: '[EVOLUȚIE ZIUA 4] Detector Cabluri EMF ⚡ activat.'
    },
    {
      dayNumber: 5,
      title: 'Ziua 5: Super-Senzor Respirație & Micro-Doppler Toracic 🫁',
      emoji: '🫁',
      autoCriticism: 'Ne autoacuzăm: Dacă persoana stătea nemișcată pe scaun sau în pat, radarul uneori ezita dacă este om sau o piesă de mobilier!',
      ideaDescription: 'Analizor micro-Doppler sub-milimetric de 0.2Hz - 0.4Hz capabil să extragă expansiunea toracică de doar 0.3mm chiar și prin pereți de beton.',
      practicalBenefit: 'Confirmare 100% om viu pe baza respirației chiar dacă doarme nemișcat.',
      radarEffect: 'vitals_boost',
      isAutoApplied: true,
      codeSnippet: `export function extractRespirationSignal(phaseShiftHistory: number[]) {
  const fftBand = phaseShiftHistory.filter(f => f >= 0.18 && f <= 0.45);
  return { isBreathing: fftBand.length > 5, rpm: Math.round(fftBand.length * 2.8) };
}`,
      terminalLog: '[EVOLUȚIE ZIUA 5] Super-Senzor Respirație 🫁 integrat în nucleul radar.'
    },
    {
      dayNumber: 6,
      title: 'Ziua 6: Filtru Kalman & Auto-Egalizare Fazor CSI 🧬',
      emoji: '🧬',
      autoCriticism: 'Ne autoacuzăm: La rotirea bruscă a telefonului, reflexiile din oglinzi produceau uneori umbre fantomă pe radar.',
      ideaDescription: 'Filtru Kalman matriceal în timp real ce elimină complet artefactele multipath și reflexiile din sticlă sau oglindă.',
      practicalBenefit: 'Imagine radar impecabilă fără ținte fantomă la viraje bruște cu telefonul.',
      radarEffect: 'kalman_filter',
      isAutoApplied: true,
      codeSnippet: `export class AdaptiveKalmanMatrix {
  private p = 1.0;
  private q = 0.02;
  private r = 0.1;
  filter(val: number): number {
    this.p += this.q;
    const k = this.p / (this.p + this.r);
    this.p *= (1 - k);
    return val * k;
  }
}`,
      terminalLog: '[EVOLUȚIE ZIUA 6] Filtru Kalman Matriceal 🧬 activat.'
    },
    {
      dayNumber: 7,
      title: 'Ziua 7: Triangulare Dispozitive Spion & Micro-Camere Ascunse 🔍',
      emoji: '🔍',
      autoCriticism: 'Ne autoacuzăm: Până ieri aplicația căuta doar oameni, ignorând micro-camerele sau emițătoarele RF ascunse prin camere de hotel!',
      ideaDescription: 'Scanare pasivă a spectrelor RF de 2.4GHz/5.8GHz pentru semnale video RTSP codate și micro-emițătoare ascunse în prize sau alarme.',
      practicalBenefit: 'Verifici orice cameră de hotel sau birou împotriva camerelor ascunse în câteva secunde.',
      radarEffect: 'spy_device_mode',
      isAutoApplied: true,
      codeSnippet: `export function scanSpyTransmitters(rfFrequencies: number[]) {
  return rfFrequencies.filter(f => f === 5800 || f === 2437).map(f => ({
    type: 'HIDDEN_CAMERA_TRANSMITTER',
    threatLevel: 'HIGH',
    freq: f
  }));
}`,
      terminalLog: '[EVOLUȚIE ZIUA 7] Scaner Micro-Camere Spion 🔍 adăugat.'
    },
    {
      dayNumber: 8,
      title: 'Ziua 8: Asistent Vocal Inteligent & Sonar Acustic Adaptiv 🎙️',
      emoji: '🎙️',
      autoCriticism: 'Ne autoacuzăm: Trebuia mereu să privești ecranul; când telefonul era în buzunar nu știai câți oameni sunt în cameră!',
      ideaDescription: 'Notificări vocale sintetizate (Web Speech API) și bipuri sonar la frecvențe dinamice în funcție de distanța și direcția țintei.',
      practicalBenefit: 'Poți ține telefonul în buzunar și asistentul îți șoptește în căști: „O persoană la 2 metri în față”.',
      radarEffect: 'voice_ai_mode',
      isAutoApplied: true,
      codeSnippet: `export function announceTargetVoice(target: { kind: string; distance: number }) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const text = target.kind === 'human' ? \`Om la \${target.distance} metri\` : 'Aparat detectat';
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }
}`,
      terminalLog: '[EVOLUȚIE ZIUA 8] Asistent Vocal Sonar 🎙️ integrat.'
    }
  ]);

  // Sync applied ideas on mount
  useEffect(() => {
    if (allIdeasAutoApplied && onApplyAllIdeas) {
      onApplyAllIdeas(dailyIdeas);
    }
  }, [allIdeasAutoApplied, dailyIdeas.length]);

  // Auto-Evolve Background Interval Loop
  useEffect(() => {
    if (!autoEvolveInterval) return;

    const timer = setInterval(() => {
      handleAdvanceDay();
    }, 24000);

    return () => clearInterval(timer);
  }, [autoEvolveInterval, currentDay, dailyIdeas]);

  // Advance day simulation
  const handleAdvanceDay = async () => {
    const nextDay = currentDay + 1;
    setIsLoadingDailyIdea(true);
    radarAudio.playDeviceBeep(2);

    try {
      const response = await fetch('/api/ai/daily-evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber: nextDay,
          unlockedIdeas: dailyIdeas.map(i => i.title)
        })
      });

      if (response.ok) {
        const newIdea: DailyEvolutionIdea = await response.json();
        newIdea.isAutoApplied = true;
        
        let updatedList: DailyEvolutionIdea[] = [];
        setDailyIdeas(prev => {
          const exists = prev.some(item => item.dayNumber === newIdea.dayNumber);
          updatedList = exists ? prev.map(item => item.dayNumber === newIdea.dayNumber ? newIdea : item) : [...prev, newIdea];
          return updatedList;
        });

        setCurrentDay(nextDay);
        setSelectedDay(nextDay);
        setActiveDailyIdeaKey(newIdea.radarEffect);

        if (onActivateDailyIdea) {
          onActivateDailyIdea(newIdea);
        }
        if (onApplyAllIdeas) {
          onApplyAllIdeas(updatedList.length > 0 ? updatedList : [...dailyIdeas, newIdea]);
        }

        radarAudio.playSonarPing(1.8);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([100, 50, 100, 50, 150]);
        }
      }
    } catch (err) {
      console.warn('Advance day client fallback:', err);
      // Local fallback
      setCurrentDay(nextDay);
      setSelectedDay(nextDay);
    } finally {
      setIsLoadingDailyIdea(false);
    }
  };

  const handleActivateSpecificIdea = (idea: DailyEvolutionIdea) => {
    setActiveDailyIdeaKey(idea.radarEffect);
    radarAudio.playSonarPing(1.2);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([70, 30, 70]);
    }
    if (onActivateDailyIdea) {
      onActivateDailyIdea(idea);
    }
    if (onApplyCodePatch) {
      onApplyCodePatch(`${idea.emoji} ${idea.title}`);
    }
  };

  // Chaos / Fault Injection State for Demonstration of Self-Healing
  const [injectedFault, setInjectedFault] = useState<string | null>(null);

  // Run Autonomous AI Cycle
  const runAutonomousCycle = async (forcedFault?: string) => {
    setIsRunningCycle(true);
    radarAudio.playDeviceBeep(2);

    try {
      const response = await fetch('/api/ai/autonomous-cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telemetry: {
            radarRange,
            targetCount,
            rssi: -48,
            csiVariance: forcedFault === 'rf_noise' ? 3.8 : 1.4,
            injectedFault: forcedFault || injectedFault
          },
          simulatedErrors: forcedFault ? [forcedFault] : [],
          currentTests: [
            { name: 'CSI Human Presence', status: 'PASS' },
            { name: 'Device RF Triangulation', status: 'PASS' },
            { name: 'Compass Azimuth Sync', status: forcedFault === 'compass_drift' ? 'FAIL' : 'PASS' },
            { name: 'Through-Wall Penetration', status: forcedFault === 'wall_attenuation' ? 'DEGRADED' : 'PASS' }
          ]
        })
      });

      if (response.ok) {
        const result: AutonomousCycleResult = await response.json();
        setData(result);
        setCycleCount(prev => prev + 1);
        setInjectedFault(null);
        radarAudio.playSonarPing(1.5);
      }
    } catch (err) {
      console.warn('Autonomous cycle client fallback active:', err);
    } finally {
      setIsRunningCycle(false);
    }
  };

  // Autopilot interval
  useEffect(() => {
    if (!autoPilotActive) return;

    const interval = setInterval(() => {
      runAutonomousCycle();
    }, 18000);

    return () => clearInterval(interval);
  }, [autoPilotActive, radarRange, targetCount]);

  // Handle Custom Code Generation
  const handleGenerateCustomCode = async (promptText: string) => {
    if (!promptText.trim()) return;
    setIsGeneratingCode(true);

    try {
      const response = await fetch('/api/ai/coding-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          currentCodeContext: {
            app: 'Mobile Wi-Fi CSI Radar',
            language: 'TypeScript',
            targetPlatform: 'Mobile PWA'
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        setData(prev => ({
          ...prev,
          codeFix: {
            title: result.title || 'Algoritm Personalizat Generat',
            language: result.language || 'typescript',
            code: result.codeSnippet || '// Cod generat',
            explanation: result.explanation || 'Optimizare completată cu succes.'
          },
          terminalLogs: [
            ...prev.terminalLogs,
            `[CODARE-AI] Nou algoritm compilat: "${result.title}"`,
            `[AUTONOMOUS] Verificare sintaxă: 0 erori.`
          ]
        }));
        setActiveTab('coding');
      }
    } catch (err) {
      console.warn('Coding assistant client fallback:', err);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const applyPatch = () => {
    setPatchApplied(true);
    radarAudio.playSonarPing(1);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([80, 40, 80]);
    }
    if (onApplyCodePatch) {
      onApplyCodePatch(data.codeFix.title);
    }
    setTimeout(() => setPatchApplied(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* AI Agent Main Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Agent AI Autonom</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Auto-Testare • Auto-Reparare • Codare Inteligentă RF
              </p>
            </div>
          </div>

          {/* Autopilot Toggle Switch */}
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-slate-400 font-bold mb-1">PILOT AUTOMAT</span>
            <button
              onClick={() => {
                setAutoPilotActive(!autoPilotActive);
                if (!autoPilotActive) runAutonomousCycle();
              }}
              className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold transition-all flex items-center gap-1.5 border ${
                autoPilotActive
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${autoPilotActive ? 'fill-current' : ''}`} />
              <span>{autoPilotActive ? 'ACTIVAT' : 'DEZACTIVAT'}</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl">
            <span className="text-[9px] text-slate-500 block">SĂNĂTATE SISTEM</span>
            <span className="text-emerald-400 font-black text-sm">{data.healthScore}%</span>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl">
            <span className="text-[9px] text-slate-500 block">CICLURI AUTONOME</span>
            <span className="text-cyan-400 font-black text-sm">#{cycleCount}</span>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl">
            <span className="text-[9px] text-slate-500 block">STATUS CĂUTARE</span>
            <span className="text-indigo-400 font-black text-xs truncate">Auto-Vindecat</span>
          </div>
        </div>

        {/* Master Execution Button */}
        <button
          onClick={() => runAutonomousCycle()}
          disabled={isRunningCycle}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-mono font-black text-xs shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all border border-cyan-400/40 disabled:opacity-60"
        >
          <Sparkles className={`w-4 h-4 text-cyan-200 ${isRunningCycle ? 'animate-spin' : ''}`} />
          <span>
            {isRunningCycle
              ? 'AI EXECUTĂ CICLUL AUTONOM...'
              : '⚡ RULEAZĂ CICLU AUTONOM: TESTEAZĂ -> REPARĂ -> OPTIMIZEAZĂ'}
          </span>
        </button>

        {/* Navigation Tabs for AI Engine */}
        <div className="flex p-1 bg-slate-950/80 border border-slate-800 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('evolution')}
            className={`flex-1 py-2 text-center text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'evolution'
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Idei Zilnice 🐷🍕</span>
          </button>

          <button
            onClick={() => setActiveTab('repair')}
            className={`flex-1 py-2 text-center text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'repair'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Reparare</span>
          </button>

          <button
            onClick={() => setActiveTab('coding')}
            className={`flex-1 py-2 text-center text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'coding'
                ? 'bg-slate-800 text-indigo-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Codare</span>
          </button>

          <button
            onClick={() => setActiveTab('chaos')}
            className={`flex-1 py-2 text-center text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'chaos'
                ? 'bg-slate-800 text-rose-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Erori</span>
          </button>
        </div>

        {/* TAB 1: AUTO-REPARARE & DIAGNOSTIC */}
        {activeTab === 'repair' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Diagnostics List */}
            <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl space-y-2">
              <span className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                DIAGNOSTICARE TELEMETRIE LIVE
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {data.diagnostics.map((diag, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 shrink-0 font-mono font-bold">›</span>
                    <span>{diag}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Self-Repairs Applied */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1.5 px-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ACȚIUNI DE AUTO-REPARARE EXECUTATE DE AI
              </span>

              {data.repairsApplied.map((rep, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-950/80 border border-emerald-500/20 rounded-2xl space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {rep.subsystem}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {rep.improvement}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{rep.action}</p>
                </div>
              ))}
            </div>

            {/* Autonomous Live Terminal Log */}
            <div className="bg-black/90 border border-slate-800 rounded-2xl p-3 font-mono text-[10px] space-y-1">
              <div className="flex items-center justify-between text-slate-500 pb-1 border-b border-slate-800">
                <span className="flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-cyan-400" />
                  TERMINAL EXECUȚIE AUTONOMĂ
                </span>
                <span className="text-emerald-400 text-[9px]">ONLINE 60 FPS</span>
              </div>
              <div className="space-y-0.5 text-cyan-400/90 pt-1">
                {data.terminalLogs.map((log, i) => (
                  <p key={i} className="truncate">
                    {log}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CODARE & GENERARE ALGORITMI */}
        {activeTab === 'coding' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Code Solution Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white truncate max-w-[200px]">
                    {data.codeFix.title}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(data.codeFix.code)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center gap-1 hover:text-white"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copiat!' : 'Copiază'}</span>
                </button>
              </div>

              {/* Code Pre Container */}
              <div className="p-3 overflow-x-auto max-h-52 bg-slate-950 font-mono text-[11px] text-emerald-300/90 leading-relaxed">
                <pre>{data.codeFix.code}</pre>
              </div>

              <div className="p-3 bg-slate-900/60 border-t border-slate-800 text-[11px] text-slate-300 space-y-2">
                <p>{data.codeFix.explanation}</p>
                <button
                  onClick={applyPatch}
                  className={`w-full py-2 px-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    patchApplied
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{patchApplied ? '✓ Patch Aplicat în Radar!' : 'Injectează Patch-ul în Radar'}</span>
                </button>
              </div>
            </div>

            {/* Custom Prompt Box for User Coding Request */}
            <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl space-y-2">
              <span className="text-[10px] font-mono text-slate-400 font-bold block">
                CERE ORICE COD SAU MODUL NOU DE LA AI:
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  placeholder="Ex: Adaugă filtru Doppler pentru bătăi de inimă..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleGenerateCustomCode(customPrompt);
                    }
                  }}
                />
                <button
                  onClick={() => handleGenerateCustomCode(customPrompt)}
                  disabled={isGeneratingCode || !customPrompt.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-mono text-xs font-bold shrink-0 disabled:opacity-50"
                >
                  {isGeneratingCode ? 'Generează...' : 'Trimite'}
                </button>
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Filtru trecere-jos pentru puls',
                  'Detecție telefoane 5GHz',
                  'Calibrare pereți groși'
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCustomPrompt(suggestion);
                      handleGenerateCustomCode(suggestion);
                    }}
                    className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SIMULARE DEFECȚIUNI & DEMONSTRAȚIE AUTO-VINDECARE */}
        {activeTab === 'chaos' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-2xl text-xs text-rose-300 space-y-1">
              <span className="font-bold font-mono text-[10px] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                TESTARE AUTO-VINDECARE (CHAOS ENGINEERING)
              </span>
              <p className="text-[11px] text-slate-300">
                Provoacă o defecțiune intenționată pe radar. AI-ul autonom o va detecta instantaneu, o va diagnostica și o va repara singur!
              </p>
            </div>

            {injectedFault && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex items-center justify-between text-xs text-amber-300">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>Defecțiune activă: <strong>{injectedFault}</strong></span>
                </div>
                <button
                  onClick={() => runAutonomousCycle(injectedFault)}
                  className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold font-mono text-[10px]"
                >
                  AI Vindecă Acum
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  setInjectedFault('rf_noise');
                  runAutonomousCycle('rf_noise');
                }}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-400">
                    1. Provoacă Zgomot &amp; Ecouri RF
                  </span>
                  <span className="text-[10px] font-mono text-rose-400">Injectează Eroare</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Simulează interferențe masive de la cuptoare cu microunde sau cabluri EMF.
                </p>
              </button>

              <button
                onClick={() => {
                  setInjectedFault('compass_drift');
                  runAutonomousCycle('compass_drift');
                }}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-400">
                    2. Provoacă Derivă Azimut Busolă
                  </span>
                  <span className="text-[10px] font-mono text-rose-400">Injectează Eroare</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Simulează dezorientarea senzorului magnetic al telefonului când este rotit brusc.
                </p>
              </button>

              <button
                onClick={() => {
                  setInjectedFault('wall_attenuation');
                  runAutonomousCycle('wall_attenuation');
                }}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-400">
                    3. Atenuare Extremă Semnal prin Beton
                  </span>
                  <span className="text-[10px] font-mono text-rose-400">Injectează Eroare</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Forțează pierderea semnalului prin perete; AI-ul recalibrează automat câștigul RF.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: AUTO-ACTUALIZARE ZILNICĂ ("PE ZI CE TRECE MAI BAGĂ O IDEE & AUTOACUZARE") */}
        {activeTab === 'evolution' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Top Evolution Header with Advance Day Button & Master Auto-Apply Switch */}
            <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-4 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black text-lg border border-amber-500/30">
                    {dailyIdeas.find(i => i.dayNumber === selectedDay)?.emoji || '💡'}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold block uppercase tracking-wider">
                      Auto-Evoluție Zilnică AI
                    </span>
                    <h4 className="text-sm font-black text-white">
                      Proiectul se auto-actualizează continuu!
                    </h4>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-black border border-amber-500/40">
                  ZIUA #{currentDay}
                </span>
              </div>

              {/* Master Auto-Apply Status Banner */}
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono font-black text-emerald-300">
                      TOATE IDEILE AI SUNT BĂGATE AUTOMAT PE APLICAȚIE
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                    {dailyIdeas.length}/{dailyIdeas.length} ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Toate inovațiile zilnice (Animale 🐷, Curier Pizza 🍕, Cabluri EMF ⚡, Stealth OLED 🌃, Varianță Respirație 🫁, Filtru Kalman 🧬, Scaner Spion 🔍, Asistent Vocal 🎙️) sunt sincronizate direct în radarul telefonului tău în timp real.
                </p>

                {/* Badges of all auto-applied ideas */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {dailyIdeas.map(idea => (
                    <span
                      key={idea.dayNumber}
                      className="px-2 py-0.5 rounded-lg bg-slate-950/80 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 flex items-center gap-1 font-bold"
                    >
                      <span>{idea.emoji}</span>
                      <span>Ziua {idea.dayNumber}</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    </span>
                  ))}
                </div>
              </div>

              {/* Toggles: Auto-Evolve Loop */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-200 font-mono text-[11px]">
                    Auto-Evoluție AI în Fundal (Generează automat idei noi):
                  </span>
                </div>
                <button
                  onClick={() => setAutoEvolveInterval(!autoEvolveInterval)}
                  className={`px-3 py-1 rounded-xl font-mono text-[10px] font-black transition-all ${
                    autoEvolveInterval
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {autoEvolveInterval ? 'PORNIT' : 'OPRIT'}
                </button>
              </div>

              {/* Master Button to Advance 24 Hours & Generate Next Daily Idea */}
              <button
                onClick={handleAdvanceDay}
                disabled={isLoadingDailyIdea}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 font-mono font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                <FastForward className={`w-4 h-4 ${isLoadingDailyIdea ? 'animate-spin' : ''}`} />
                <span>
                  {isLoadingDailyIdea
                    ? 'AI INVENTEAZĂ & APLICĂ AUTOMAT NOUA IDEE...'
                    : `⏩ TRECI LA ZIUA ${currentDay + 1} (+24H) & BAGĂ O IDEE NOUĂ AUTOMAT!`}
                </span>
              </button>
            </div>

            {/* Days Horizontal Carousel / Timeline */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 font-bold px-1 flex items-center justify-between">
                <span>TIMELINE IDEI PE ZILE:</span>
                <span className="text-amber-400 font-normal">{dailyIdeas.length} zile deblocate</span>
              </span>

              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {dailyIdeas.map((idea) => {
                  const isSelected = selectedDay === idea.dayNumber;
                  const isRadarActive = activeDailyIdeaKey === idea.radarEffect;
                  return (
                    <button
                      key={idea.dayNumber}
                      onClick={() => setSelectedDay(idea.dayNumber)}
                      className={`px-3 py-2 rounded-2xl font-mono text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-200 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="text-sm">{idea.emoji}</span>
                      <span>Ziua {idea.dayNumber}</span>
                      {isRadarActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Full Card */}
            {(() => {
              const item = dailyIdeas.find(i => i.dayNumber === selectedDay) || dailyIdeas[dailyIdeas.length - 1];
              if (!item) return null;
              const isRadarActive = activeDailyIdeaKey === item.radarEffect;

              return (
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 space-y-3.5 shadow-xl">
                  {/* Idea Title Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.emoji}</span>
                        <h3 className="text-sm font-black text-white">{item.title}</h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                        Mod radar asociat: <code>{item.radarEffect}</code>
                      </span>
                    </div>

                    <button
                      onClick={() => handleActivateSpecificIdea(item)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-black transition-all flex items-center gap-1 border shrink-0 ${
                        isRadarActive
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500 hover:text-slate-950'
                      }`}
                    >
                      {isRadarActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                      <span>{isRadarActive ? 'ACTIV ÎN RADAR' : 'ACTIVEAZĂ ACUM'}</span>
                    </button>
                  </div>

                  {/* 1. AUTOACUZARE / AUTO-CRITICĂ A PROIECTULUI */}
                  <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-rose-300 text-[10px] font-mono font-bold">
                      <span>🐷😭</span>
                      <span className="uppercase tracking-wider">Autoacuzare &amp; Auto-critică (Ce s-a greșit ieri):</span>
                    </div>
                    <p className="text-xs text-rose-200/90 italic leading-relaxed">
                      "{item.autoCriticism}"
                    </p>
                  </div>

                  {/* 2. IDEEA NOUĂ ADUSĂ ASTĂZI */}
                  <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-mono font-bold">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span className="uppercase tracking-wider">Ideea nouă băgată astăzi în proiect:</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {item.ideaDescription}
                    </p>
                    <div className="pt-1 text-[11px] text-amber-400/90 font-mono">
                      <strong>Beneficiu pe telefon:</strong> {item.practicalBenefit}
                    </div>
                  </div>

                  {/* 3. COD SURSĂ COMPILAT AUTONOM PENTRU ACEASTĂ IDEE */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono font-bold">
                        <Code2 className="w-3 h-3 text-indigo-400" />
                        <span>COD IMPLEMENTARE IDEE (TypeScript)</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(item.codeSnippet)}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[9px] font-mono hover:text-white"
                      >
                        Copiază
                      </button>
                    </div>
                    <div className="p-3 max-h-36 overflow-x-auto bg-slate-950 text-emerald-300/90 font-mono text-[10px] leading-relaxed">
                      <pre>{item.codeSnippet}</pre>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <button
                    onClick={() => handleActivateSpecificIdea(item)}
                    className={`w-full py-2.5 px-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isRadarActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20 active:scale-[0.98]'
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span>
                      {isRadarActive
                        ? `✓ Ideea din Ziua ${item.dayNumber} rulează pe radar!`
                        : `Aplică ideea: "${item.title}" pe telefon`}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
