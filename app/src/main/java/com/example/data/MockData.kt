package com.example.data

object MockData {
    val initialConnections = listOf(
        VMConnection(
            id = "vm-1",
            name = "Production Windows Server 2022",
            host = "10.240.12.88",
            port = 3389,
            protocol = ProtocolType.RDP,
            rdpVersion = "RDP 10.11 (Win11/Server 2022)",
            engineProfile = "Chromium 128 (Hardware Accelerated + WebGL)",
            status = "idle",
            latencyMs = 14,
            encryptionSuite = "AES-256-GCM • TLS 1.3",
            e2eeFingerprint = "SHA256:8F:2B:A1:C9:44:E2:70:D1",
            mfaRequired = true,
            osType = OSType.WINDOWS,
            username = "admin_secops",
            description = "Máy chủ điều phối chính cơ sở dữ liệu và AD nội bộ",
            lastConnected = "Hôm qua 18:42"
        ),
        VMConnection(
            id = "vm-2",
            name = "Ubuntu Workstation 24.04 LTS",
            host = "192.168.1.145",
            port = 5900,
            protocol = ProtocolType.VNC,
            vncVersion = "RFB 3.8 (TLS 1.3 / VeNCrypt)",
            engineProfile = "Chromium 128 (Hardware Accelerated + WebGL)",
            status = "live",
            latencyMs = 8,
            encryptionSuite = "ChaCha20-Poly1305 • TLS 1.3",
            e2eeFingerprint = "SHA256:3C:99:FF:2A:11:80:BC:4E",
            mfaRequired = true,
            osType = OSType.UBUNTU,
            username = "devops-engineer",
            description = "Môi trường biên dịch Docker và triển khai Kubernetes cluster",
            lastConnected = "Đang kết nối"
        ),
        VMConnection(
            id = "vm-3",
            name = "Kali Linux SecOps Lab",
            host = "172.16.4.22",
            port = 3389,
            protocol = ProtocolType.RDP,
            rdpVersion = "RDP 10.4 (xrdp TLS)",
            engineProfile = "Chromium 114 (Standard WebSocket Offscreen)",
            status = "idle",
            latencyMs = 21,
            encryptionSuite = "AES-256-GCM • TLS 1.3",
            e2eeFingerprint = "SHA256:77:E1:90:54:AC:D8:32:09",
            mfaRequired = true,
            osType = OSType.KALI,
            username = "kali-redteam",
            description = "Phòng thí nghiệm kiểm thử thâm nhập và quét lỗ hổng",
            lastConnected = "2 ngày trước"
        ),
        VMConnection(
            id = "vm-4",
            name = "Debian MicroVM Database Replica",
            host = "10.0.8.15",
            port = 5900,
            protocol = ProtocolType.VNC,
            vncVersion = "TightVNC 2.8 (Lossless Compression)",
            engineProfile = "Chromium Legacy (Low Bandwidth Compat)",
            status = "idle",
            latencyMs = 29,
            encryptionSuite = "AES-128-GCM • TLS 1.2",
            e2eeFingerprint = "SHA256:12:44:88:99:AA:BC:DE:F0",
            mfaRequired = false,
            osType = OSType.DEBIAN,
            username = "postgres-dba",
            description = "Bản sao lưu trữ và phục hồi thảm họa PostgreSQL 16",
            lastConnected = "3 ngày trước"
        )
    )

    val initialLogs = listOf(
        AuditLog(
            id = "log-1",
            timestamp = "10:52:14",
            event = "Xác thực MFA thành công",
            severity = "success",
            user = "admin@corp.internal",
            ipAddress = "192.168.1.102",
            details = "Đã nhập mã TOTP RFC 6238 hợp lệ mở phiên máy ảo RDP #vm-1",
            e2eeValidated = true
        ),
        AuditLog(
            id = "log-2",
            timestamp = "10:48:30",
            event = "Mở kênh mã hóa E2EE X25519",
            severity = "info",
            user = "devops-engineer",
            ipAddress = "192.168.1.145",
            details = "Thành công đàm phán phiên bảo mật TLS 1.3 qua Chromium WebSocket",
            e2eeValidated = true
        ),
        AuditLog(
            id = "log-3",
            timestamp = "10:30:15",
            event = "Đồng bộ đám mây đa thiết bị",
            severity = "info",
            user = "system_daemon",
            ipAddress = "127.0.0.1",
            details = "Hoàn tất sao lưu cấu hình mã hóa Zero-Knowledge 1.84 MB lên kho lưu",
            e2eeValidated = true
        ),
        AuditLog(
            id = "log-4",
            timestamp = "09:15:02",
            event = "Phát hiện thử nghiệm đăng nhập bất thường",
            severity = "warning",
            user = "guest_audit",
            ipAddress = "185.220.101.5",
            details = "Chặn kết nối do không cung cấp mã MFA TOTP hợp lệ",
            e2eeValidated = false
        )
    )

    val initialSyncedDevices = listOf(
        SyncedDevice(
            id = "dev-1",
            name = "Android Mobile Workstation",
            platform = "Android 15 (ARM64)",
            lastSeen = "Đang trực tuyến",
            isCurrent = true
        ),
        SyncedDevice(
            id = "dev-2",
            name = "ThinkPad T14s Gen 4",
            platform = "Linux Debian / Chromium 128",
            lastSeen = "2 giờ trước",
            isCurrent = false
        ),
        SyncedDevice(
            id = "dev-3",
            name = "iPad Pro M2 Secure Vault",
            platform = "iPadOS 18.1 Safari",
            lastSeen = "Hôm qua",
            isCurrent = false
        )
    )
}
