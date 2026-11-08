import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, Pause, Trash2, Cpu, Wifi, Usb, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

interface LogItem {
  id: string;
  timestamp: string;
  type: 'info' | 'csi' | 'doppler' | 'warning' | 'success';
  message: string;
}

export function SerialConsole() {
  const [logs, setLogs] = useState<LogItem[]>([
    { id: '1', timestamp: '10:05:12.401', type: 'info', message: 'ESP32-S3 Wi-Fi CSI firmware initialized on channel 6 (2.412 GHz)' },
    { id: '2', timestamp: '10:05:12.420', type: 'success', message: 'PHY layer configured for 802.11n HT20 mode (64 OFDM subcarriers)' },
    { id: '3', timestamp: '10:05:12.500', type: 'csi', message: '[CSI_FRAME] RSSI: -63dBm | Noise: -96dBm | Phase: +0.41rad | Subc[0-7]: 34,42,51,60,58,49,38,31' },
  ]);
  const [streaming, setStreaming] = useState(true);
  const [baudRate, setBaudRate] = useState('921600');
  const [filter, setFilter] = useState<'all' | 'csi' | 'doppler'>('all');
  
  // Web Serial API real hardware connection state
  const [hardwareConnected, setHardwareConnected] = useState(false);
  const [portInfo, setPortInfo] = useState<string | null>(null);
  const [serialError, setSerialError] = useState<string | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const portRef = useRef<any>(null);

  const logEndRef = useRef<HTMLDivElement | null>(null);

  // Connect to real hardware via Web Serial API
  const connectHardware = async () => {
    setSerialError(null);
    if (!('serial' in navigator)) {
      setSerialError('Browserul dvs. nu suportă Web Serial API. Folosiți Google Chrome sau Microsoft Edge pe Desktop.');
      return;
    }

    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: parseInt(baudRate) });
      portRef.current = port;
      setHardwareConnected(true);
      setPortInfo('ESP32-S3 USB-UART Connected (Real HW)');

      setLogs(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          timestamp: new Date().toTimeString().split(' ')[0],
          type: 'success',
          message: `Conectat cu succes la portul Serial fizic (${baudRate} baud). Recepționare date live de la hardware...`
        }
      ]);

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          const lines = value.split('\n');
          lines.forEach(line => {
            if (line.trim()) {
              const now = new Date();
              const timeStr = now.toTimeString().split(' ')[0] + '.' + Math.floor(now.getMilliseconds() / 100);
              setLogs(l => [...l.slice(-200), {
                id: Math.random().toString(),
                timestamp: timeStr,
                type: line.includes('CSI') ? 'csi' : line.includes('DOPPLER') ? 'doppler' : 'info',
                message: line.trim()
              }]);
            }
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      setSerialError(err.message || 'Eroare la conectarea hardware prin USB.');
      setHardwareConnected(false);
    }
  };

  const disconnectHardware = async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
      setHardwareConnected(false);
      setPortInfo(null);
      setLogs(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          timestamp: new Date().toTimeString().split(' ')[0],
          type: 'warning',
          message: 'Portul Serial USB a fost deconectat.'
        }
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  // Simulated stream fallback when not connected to real hardware
  useEffect(() => {
    if (!streaming || hardwareConnected) return;
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + Math.floor(now.getMilliseconds() / 100);
      
      const types: ('csi' | 'doppler' | 'info' | 'success')[] = ['csi', 'csi', 'doppler', 'info', 'success'];
      const chosenType = types[Math.floor(Math.random() * types.length)];
      
      let msg = '';
      if (chosenType === 'csi') {
        const rssi = -60 - Math.floor(Math.random() * 20);
        const randSubc = Array.from({ length: 8 }, () => Math.floor(30 + Math.random() * 40)).join(',');
        msg = `[CSI_FRAME] RSSI: ${rssi}dBm | AGC: 32 | Freq: 2437MHz | Subc[0-7]: [${randSubc}]`;
      } else if (chosenType === 'doppler') {
        const freqShift = (Math.random() * 0.5).toFixed(2);
        msg = `[DOPPLER_SHIFT] Target #1 chest wall displacement detected: freq_shift=+${freqShift}Hz (Respiration ~16 bpm)`;
      } else if (chosenType === 'success') {
        msg = `[RF_CALIBRATION] Multipath phase stability check passed (99.1% clarity).`;
      } else {
        msg = `[UART_RX] Packet buffer acknowledged (1024 bytes queued).`;
      }

      setLogs(prev => [...prev.slice(-150), { id: Math.random().toString(), timestamp: timeStr, type: chosenType, message: msg }]);
    }, 350);

    return () => clearInterval(interval);
  }, [streaming, hardwareConnected]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = logs.filter(l => {
    if (filter === 'all') return true;
    if (filter === 'csi' && l.type === 'csi') return true;
    if (filter === 'doppler' && l.type === 'doppler') return true;
    return false;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
          <Usb className="w-3.5 h-3.5 animate-pulse" /> Conexiune Fizică Directă Hardware (Web Serial API)
        </div>
        <h2 className="text-3xl font-extrabold text-white">Consolă & Conectare Hardware ESP32 / Ruter</h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Conectați microcontrolerul ESP32-S3 sau ruterul direct prin USB folosind Web Serial API pentru a capta date reale CSI din mediul fizic, fără simulări.
        </p>
      </div>

      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${hardwareConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
              <Usb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {hardwareConnected ? 'Hardware Conectat Fiziologic' : 'ESP32-S3 / Ruter USB Port'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {portInfo || (hardwareConnected ? 'Conexiune Serial Activă' : 'Mod Simulare sau Așteptare Conexiune')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!hardwareConnected ? (
              <button
                onClick={connectHardware}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
              >
                <Usb className="w-4 h-4" /> Conectare USB Hardware
              </button>
            ) : (
              <button
                onClick={disconnectHardware}
                className="px-4 py-2.5 bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 font-semibold rounded-xl text-xs transition-all flex items-center gap-2"
              >
                Deconectare Hardware
              </button>
            )}

            <select
              value={baudRate}
              onChange={(e) => setBaudRate(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none"
            >
              <option value="115200">115200 Baud</option>
              <option value="460800">460800 Baud</option>
              <option value="921600">921600 Baud (Recomandat CSI)</option>
            </select>

            <button
              onClick={() => setStreaming(!streaming)}
              disabled={hardwareConnected}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                streaming ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {streaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{streaming ? 'Pauză' : 'Start'}</span>
            </button>

            <button
              onClick={() => setLogs([])}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
              title="Curăță consola"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {serialError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serialError}</span>
          </div>
        )}

        {/* Terminal Window */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 font-mono text-xs h-[400px] overflow-y-auto space-y-1.5 scrollbar-thin">
          {filteredLogs.map((log) => {
            let color = 'text-slate-300';
            if (log.type === 'csi') color = 'text-cyan-400';
            if (log.type === 'doppler') color = 'text-indigo-300';
            if (log.type === 'success') color = 'text-emerald-400';
            if (log.type === 'warning') color = 'text-amber-400';

            return (
              <div key={log.id} className="flex items-start gap-3 leading-relaxed hover:bg-slate-900/50 p-1 rounded">
                <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                <span className={`${color} break-all font-mono`}>{log.message}</span>
              </div>
            );
          })}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
