import React, { useState } from 'react';
import { Github, ExternalLink, Terminal, Cpu, ShieldCheck, Code, Copy, Check } from 'lucide-react';

export function GithubGuide() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const repos = [
    {
      name: 'espressif/esp-csi',
      desc: 'Biblioteca oficială Espressif pentru extragerea CSI Wi-Fi pe microcontrolerele ESP32, ESP32-S și ESP32-C.',
      url: 'https://github.com/espressif/esp-csi'
    },
    {
      name: 'StevenMHernandez/ESP32-CSI-Tool',
      desc: 'Set de unelte pentru capturarea și transmiterea informațiilor despre starea canalului în vederea recunoașterii prezenței umane.',
      url: 'https://github.com/StevenMHernandez/ESP32-CSI-Tool'
    },
    {
      name: 'euaziel/WiFi-CSI-Human-Pose-Detection',
      desc: 'Estimarea poziției umane și urmărire spațială folosind semnale de la routere Wi-Fi comerciale.',
      url: 'https://github.com/euaziel/WiFi-CSI-Human-Pose-Detection'
    },
    {
      name: 'Akshit0203/wifi-csi-human-radar',
      desc: 'Sistem de detecție și urmărire a prezenței umane prin Wi-Fi CSI folosind ESP32-S3 cu vizualizare în timp real.',
      url: 'https://github.com/Akshit0203/wifi-csi-human-radar'
    }
  ];

  const cppSnippets = [
    {
      title: '1. Scapy Python Wi-Fi Packet Sniffer (Detectare Dispozitive & Prezență)',
      code: `from scapy.all import *

# Funcția care procesează pachetele Wi-Fi
def packet_handler(packet):
    if packet.haslayer(Dot11):
        mac_address = packet.addr2
        print(f"Dispozitiv detectat: {mac_address}")

# Pornește captura de pachete
def start_sniffing(interface):
    print("Capturarea pachetelor... Ctrl+C pentru a opri.")
    sniff(iface=interface, prn=packet_handler)

# Specifică interfața rețelei (de exemplu 'wlan0')
if __name__ == "__main__":
    start_sniffing("wlan0")`
    },
    {
      title: '2. ESP32-S3 WiFi CSI Callback Initialization (C++)',
      code: `#include "esp_wifi.h"
#include "esp_event.h"

static void wifi_csi_cb(void *ctx, wifi_csi_info_t *info) {
    if (!info || !info->buf) return;
    
    // Extragere amplitudine și fază pentru cele 64 subpurtătoare OFDM
    printf("CSI_DATA RSSI=%d, len=%d\\n", info->rx_ctrl.rssi, info->len);
    for (int i = 0; i < 16; i++) {
        int8_t real = info->buf[i * 2];
        int8_t imag = info->buf[i * 2 + 1];
        // Calcul magnitudine
        int mag = sqrt(real * real + imag * imag);
        printf("%d,", mag);
    }
    printf("\\n");
}

void init_wifi_csi() {
    wifi_csi_config_t csi_config = {
        .enable = true,
        .acquire_csi_legacy = true,
        .acquire_csi_ht20 = true,
        .acquire_csi_vht = false,
        .ampdu_rx = true,
    };
    ESP_ERROR_CHECK(esp_wifi_set_csi_config(&csi_config));
    ESP_ERROR_CHECK(esp_wifi_set_csi_cb(wifi_csi_cb, NULL));
    ESP_ERROR_CHECK(esp_wifi_set_csi_enable(true));
}`
    }
  ];

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
          <Github className="w-3.5 h-3.5" /> Proiecte Open Source & Cod Sursă Scapy / ESP32
        </div>
        <h2 className="text-3xl font-extrabold text-white">Cod Sursă Scapy Python & Repozitoare GitHub</h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Codul Python cu Scapy pentru monitorizarea pachetelor Wi-Fi și codul C++ pentru ESP32 preluate din depozitele open-source GitHub.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {repos.map((repo, idx) => (
          <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4 flex flex-col justify-between shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-bold">
                  <Github className="w-4 h-4" /> {repo.name}
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{repo.desc}</p>
            </div>
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all border border-slate-700/80"
            >
              <span>Vezi Repozitoriul GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>

      {/* Code Snippets Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Code className="w-5 h-5 text-cyan-400" /> Exemple de Cod Sursă (Python Scapy & C++)
        </h3>

        {cppSnippets.map((snippet, sIdx) => (
          <div key={sIdx} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 font-mono">{snippet.title}</span>
              <button
                onClick={() => copyToClipboard(snippet.code, sIdx)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all border border-slate-700"
              >
                {copiedIndex === sIdx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === sIdx ? 'Copiat!' : 'Copiază Codul'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
              <code>{snippet.code}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
