package com.example.data

enum class ProtocolType(val label: String) {
    RDP("RDP"),
    VNC("VNC")
}

enum class OSType(val displayName: String) {
    WINDOWS("Microsoft Windows"),
    UBUNTU("Ubuntu Linux"),
    DEBIAN("Debian MicroVM"),
    KALI("Kali Linux SecOps"),
    MACOS("macOS Remote")
}

data class VMConnection(
    val id: String,
    val name: String,
    val host: String,
    val port: Int,
    val protocol: ProtocolType,
    val rdpVersion: String? = null,
    val vncVersion: String? = null,
    val engineProfile: String = "Chromium 128 (Hardware Accelerated)",
    val status: String = "idle", // "idle" | "live" | "connecting" | "offline"
    val latencyMs: Int = 12,
    val encryptionSuite: String = "AES-256-GCM • TLS 1.3",
    val e2eeFingerprint: String = "SHA256:8F:2B:A1:C9:44:E2:70:D1",
    val mfaRequired: Boolean = true,
    val osType: OSType = OSType.WINDOWS,
    val username: String = "Administrator",
    val description: String = "Máy ảo điều khiển từ xa",
    val lastConnected: String = "Mới tạo"
)

data class AuditLog(
    val id: String,
    val timestamp: String,
    val event: String,
    val severity: String, // "info" | "warning" | "success" | "critical"
    val user: String,
    val ipAddress: String,
    val details: String,
    val e2eeValidated: Boolean = true
)

data class SecurityPolicy(
    val enforceMfaForAll: Boolean = true,
    val enforceTls13: Boolean = true,
    val dlpClipboardIsolation: Boolean = true,
    val sessionTimeoutMins: Int = 45,
    val auditSessionRecording: Boolean = true,
    val idleTimeoutMins: Int = 15
)

data class SyncedDevice(
    val id: String,
    val name: String,
    val platform: String,
    val lastSeen: String,
    val isCurrent: Boolean = false
)

data class CloudBackupState(
    val lastBackupTime: String = "10 phút trước",
    val isSyncing: Boolean = false,
    val backupVaultSize: String = "1.84 MB",
    val backupRevisions: Int = 14,
    val syncedDevices: List<SyncedDevice> = emptyList(),
    val provider: String = "Encrypted Cloud Vault (Zero-Knowledge)"
)

data class AdminStats(
    val totalUsers: Int = 24,
    val activeSessions: Int = 4,
    val zeroTrustScore: Int = 98,
    val cloudSyncStatus: String = "Đã đồng bộ toàn vẹn"
)

data class MFAState(
    val enabled: Boolean = true,
    val currentCode: String = "842 190",
    val secondsRemaining: Int = 24,
    val backupCodes: List<String> = listOf("9012-4412", "7731-8902", "1249-0038"),
    val biometricUnlocked: Boolean = true
)
