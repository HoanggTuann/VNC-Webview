export type ProtocolType = 'RDP' | 'VNC';

export type RdpVersion = 
  | 'RDP 10.11 (Win11/Server 2022)'
  | 'RDP 10.4 (Win10/Server 2019)'
  | 'RDP 8.1 (Server 2012 R2)'
  | 'RDP 7.0 (Legacy RemoteFX)';

export type VncVersion = 
  | 'RFB 3.8 (TLS 1.3 / VeNCrypt)'
  | 'RFB 3.7 (Standard noVNC)'
  | 'TightVNC 2.8 (Lossless Compression)'
  | 'UltraVNC Enterprise (Dual Auth)';

export type ChromiumEngineProfile = 
  | 'Chromium 128 (Hardware Accelerated + WebGL)'
  | 'Chromium 114 (Standard WebSocket Offscreen)'
  | 'Chromium Legacy (Low Bandwidth Compat)';

export type OSType = 'windows' | 'ubuntu' | 'macos' | 'kali' | 'debian' | 'redhat';

export interface VMConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  protocol: ProtocolType;
  rdpVersion?: RdpVersion;
  vncVersion?: VncVersion;
  engineProfile: ChromiumEngineProfile;
  status: 'live' | 'idle' | 'offline';
  latencyMs: number;
  encryptionSuite: string; // e.g. "AES-256-GCM / TLS 1.3"
  e2eeFingerprint: string;
  mfaRequired: boolean;
  osType: OSType;
  username: string;
  description: string;
  lastConnected: string;
  gatewayUrl?: string; // Optional Apache Guacamole or noVNC URL
}

export interface MFAState {
  enabled: boolean;
  secret: string;
  currentCode: string;
  secondsRemaining: number;
  backupCodes: string[];
  biometricUnlocked: boolean;
  lastVerifiedTime?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  severity: 'info' | 'success' | 'warning' | 'critical';
  user: string;
  ipAddress: string;
  details: string;
  e2eeValidated: boolean;
}

export interface SecurityPolicy {
  enforceMfaForAll: boolean;
  enforceTls13E2ee: boolean;
  blockClipboardExport: boolean;
  autoIdleTimeoutMinutes: number;
  sessionRecordingAudit: boolean;
  maxConcurrentSessions: number;
  allowGuestAccess: boolean;
}

export interface CloudBackupState {
  isSyncing: boolean;
  lastBackupTime: string;
  backupVaultSize: string;
  backupRevisions: number;
  autoSync: boolean;
  provider: 'Encrypted Cloud Storage' | 'Private Enterprise Vault' | 'Self-Hosted WebDAV';
  syncedDevices: {
    id: string;
    name: string;
    platform: string;
    lastSeen: string;
    isCurrent: boolean;
  }[];
}

export interface AdminStats {
  totalUsers: number;
  activeConnections: number;
  totalVMs: number;
  complianceScore: number;
  threatLevel: 'Low' | 'Moderate' | 'Elevated';
  e2eeBandwidthMbps: number;
}
