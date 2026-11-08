import React, { useState, useEffect, useRef } from 'react';
import { Usb, Wifi, Terminal, CheckCircle2, AlertCircle, Play, Pause, Trash2, Cpu, Link, Unlink, RefreshCw, Info } from 'lucide-react';

interface Esp32HardwareBridgeProps {
  onDataReceived: (data: any) => void;
  onStatusChange: (status: string) => void;
}

export function Esp32HardwareBridge({ onDataReceived, onStatusChange }: Esp32HardwareBridgeProps) {
  const [connectionType, setConnectionType] = useState<'serial' | 'websocket'>('serial');
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<{ id: string; time: string; type: 'info' | 'data' | 'error'; msg: string }[]>([]);
  const [wsUrl, setWsUrl] = useState('ws://192.168.4.1:81'); // Typical ESP32 AP address
  const [baudRate, setBaudRate] = useState('115200');
  const [error, setError] = useState<string | null>(null);

  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  const addLog = (type: 'info' | 'data' | 'error', msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + Math.floor(Math.random() * 999);
    setLogs(prev => [...prev.slice(-49), { id: Math.random().toString(), time, type, msg }]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const connectSerial = async () => {
    setError(null);
    if (!('serial' in navigator)) {
      setError('Web Serial API nu este suportat. Folosiți Chrome/Edge.');
      return;
    }

    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: parseInt(baudRate) });
      portRef.current = port;
      setIsConnected(true);
      onStatusChange('SERIAL_CONNECTED');
      addLog('info', `Conectat la Port Serial (${baudRate} baud)`);

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          const lines = value.split('\n');
          lines.forEach((line: string) => {
            if (line.trim()) {
              addLog('data', line.trim());
              try {
                // Try parsing as JSON or CSV
                const data = line.startsWith('{') ? JSON.parse(line) : { raw: line };
                onDataReceived(data);
              } catch (e) {
                onDataReceived({ raw: line });
              }
            }
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Eroare la conectare Serial');
      setIsConnected(false);
      onStatusChange('DISCONNECTED');
    }
  };

  const connectWebSocket = () => {
    setError(null);
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        onStatusChange('WS_CONNECTED');
        addLog('info', `Conectat la WebSocket: ${wsUrl}`);
      };

      ws.onmessage = (event) => {
        addLog('data', event.data);
        try {
          const data = typeof event.data === 'string' && event.data.startsWith('{') 
            ? JSON.parse(event.data) 
            : { raw: event.data };
          onDataReceived(data);
        } catch (e) {
          onDataReceived({ raw: event.data });
        }
      };

      ws.onerror = () => {
        setError(`Eroare conexiune la ${wsUrl}`);
        setIsConnected(false);
        onStatusChange('DISCONNECTED');
      };

      ws.onclose = () => {
        setIsConnected(false);
        onStatusChange('DISCONNECTED');
        addLog('info', 'Conexiune WebSocket închisă');
      };
    } catch (err: any) {
      setError(err.message || 'Eroare WebSocket');
    }
  };

  const disconnect = async () => {
    if (connectionType === 'serial') {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
    } else {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    }
    setIsConnected(false);
    onStatusChange('DISCONNECTED');
    addLog('info', 'Deconectat');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Bridge Hardware ESP32</h2>
            <p className="text-xs text-slate-400 font-mono">
              {isConnected ? 'Sincronizare activă cu microcontroler' : 'Așteptare conexiune hardware...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setConnectionType('serial')}
            className={`p-2 rounded-xl transition-all ${connectionType === 'serial' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-500'}`}
          >
            <Usb className="w-5 h-5" />
          </button>
          <button
            onClick={() => setConnectionType('websocket')}
            className={`p-2 rounded-xl transition-all ${connectionType === 'websocket' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'text-slate-500'}`}
          >
            <Wifi className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {connectionType === 'serial' ? (
          <div className="flex gap-2">
            <select
              value={baudRate}
              onChange={(e) => setBaudRate(e.target.value)}
              disabled={isConnected}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 transition-all"
            >
              <option value="9600">9600 Baud</option>
              <option value="115200">115200 Baud</option>
              <option value="921600">921600 Baud (CSI)</option>
            </select>
            <button
              onClick={isConnected ? disconnect : connectSerial}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isConnected 
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {isConnected ? <Unlink className="w-4 h-4" /> : <Link className="w-4 h-4" />}
              {isConnected ? 'Deconectare Serial' : 'Conectare Serial'}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              placeholder="ws://192.168.4.1:81"
              disabled={isConnected}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-all font-mono"
            />
            <button
              onClick={isConnected ? disconnect : connectWebSocket}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isConnected 
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30' 
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/40 hover:bg-blue-500/30'
              }`}
            >
              {isConnected ? <Unlink className="w-4 h-4" /> : <Link className="w-4 h-4" />}
              {isConnected ? 'Stop' : 'Connect'}
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Terminal */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 h-48 overflow-hidden flex flex-col shadow-inner">
          <div className="flex items-center justify-between mb-2 text-[10px] font-mono text-slate-500 border-b border-slate-900 pb-2">
            <span className="flex items-center gap-1.5"><Terminal className="w-3 h-3" /> CONSOLĂ HARDWARE</span>
            <button onClick={() => setLogs([])} className="hover:text-slate-300 transition-colors">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[10px] scrollbar-thin">
            {logs.length === 0 && (
              <p className="text-slate-700 italic py-2 text-center">Niciun pachet recepționat...</p>
            )}
            {logs.map(log => (
              <div key={log.id} className="flex gap-2 leading-relaxed">
                <span className="text-slate-600 shrink-0">[{log.time}]</span>
                <span className={`break-all ${log.type === 'data' ? 'text-cyan-400' : log.type === 'error' ? 'text-red-400' : 'text-slate-400'}`}>
                  {log.msg}
                </span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
        <h3 className="text-xs font-bold text-blue-300 mb-2 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" /> Instrucțiuni ESP32
        </h3>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Asigurați-vă că ESP32 rulează firmware-ul de detecție CSI și trimite datele prin Serial (<span className="text-white">Serial.println</span>) sau WebSocket în format JSON.
        </p>
      </div>
    </div>
  );
}

// Simple shake animation for errors
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }
  .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
`;
document.head.appendChild(style);
