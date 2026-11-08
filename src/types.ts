export type ActiveTab = 'radar' | 'spatial-vision' | 'csi' | 'vitals' | 'spatial' | 'bat' | 'phone' | 'serial' | 'audit' | 'github' | 'ai';

export interface DetectedPerson {
  id: string;
  x: number; // coordinates on radar map in meters
  y: number;
  distance: number; // in meters from router
  angle: number; // in degrees
  activity: string;
  confidence: number; // 0 - 100%
  signalStrength: number; // RSSI in dBm e.g. -65
}

export interface CsiSubcarrierFrame {
  timestamp: number;
  subcarriers: number[]; // e.g. 64 OFDM subcarrier amplitudes
  phase: number[];
  noiseFloor: number;
}

export interface VitalSigns {
  breathingRate: number; // breaths per minute
  heartRate: number; // beats per minute
  movementIndex: number; // 0-100
  status: string;
}

export interface AirAnalysisResult {
  summary: string;
  occupancyCount: number;
  environmentType: string;
  securityAlert: boolean;
  recommendations: string[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  type: 'alert' | 'motion' | 'calibration' | 'system';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  source: string;
}
