package com.example.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.OSType
import com.example.data.VMConnection

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VMViewerScreen(
    vm: VMConnection?,
    onDisconnect: () -> Unit,
    onNavigateToSessions: () -> Unit
) {
    if (vm == null) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(32.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.surfaceVariant),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Outlined.DesktopAccessDisabled,
                        contentDescription = null,
                        modifier = Modifier.size(40.dp),
                        tint = MaterialTheme.colorScheme.outline
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Chưa có phiên máy ảo nào đang mở",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Vui lòng chọn một máy ảo từ danh sách kết nối để mở màn hình từ xa.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(20.dp))
                Button(
                    onClick = onNavigateToSessions,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Dns, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Danh Sách Máy Ảo")
                }
            }
        }
        return
    }

    var cursorPosition by remember { mutableStateOf(Offset(350f, 250f)) }
    var showTaskManager by remember { mutableStateOf(false) }
    var showTerminal by remember { mutableStateOf(false) }
    var showClipboardSync by remember { mutableStateOf(false) }
    var clipboardContent by remember { mutableStateOf("https://securelink.corp.internal/token=auth88") }
    var activeMacroNotice by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(activeMacroNotice) {
        if (activeMacroNotice != null) {
            kotlinx.coroutines.delay(2000)
            activeMacroNotice = null
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
    ) {
        // Top Remote Session Bar
        Surface(
            color = Color(0xFF1E293B),
            shadowElevation = 4.dp
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // E2EE & VM info
                Icon(
                    Icons.Default.Lock,
                    contentDescription = "Mã hóa E2EE",
                    tint = Color(0xFF4ADE80),
                    modifier = Modifier.size(18.dp)
                )

                Spacer(modifier = Modifier.width(8.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = vm.name,
                        color = Color.White,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "${vm.protocol.label} • ${vm.latencyMs}ms • 60 FPS WebGL",
                            color = Color(0xFF94A3B8),
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                // Disconnect Button
                FilledTonalButton(
                    onClick = onDisconnect,
                    colors = ButtonDefaults.filledTonalButtonColors(
                        containerColor = Color(0xFFDC2626),
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                    modifier = Modifier.testTag("btn_disconnect_vm")
                ) {
                    Icon(
                        Icons.Default.PowerSettingsNew,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Ngắt Kết Nối", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // Active Macro Notice Banner
        if (activeMacroNotice != null) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF6750A4))
                    .padding(vertical = 4.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Đã gửi phím tắt: $activeMacroNotice",
                    color = Color.White,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        // Virtual Screen Canvas (Simulated Remote OS Display)
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .background(Color(0xFF0F172A))
                .pointerInput(Unit) {
                    detectDragGestures { change, dragAmount ->
                        change.consume()
                        cursorPosition += dragAmount
                    }
                }
        ) {
            // Simulated Desktop Background
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                // Desktop Icons Grid
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(24.dp)
                ) {
                    DesktopIconItem(
                        icon = Icons.Default.Computer,
                        label = if (vm.osType == OSType.WINDOWS) "This PC" else "Computer",
                        tint = Color(0xFF60A5FA)
                    )
                    DesktopIconItem(
                        icon = Icons.Default.Terminal,
                        label = if (vm.osType == OSType.WINDOWS) "PowerShell" else "Terminal",
                        tint = Color(0xFFFBBF24),
                        onClick = { showTerminal = true }
                    )
                    DesktopIconItem(
                        icon = Icons.Default.FolderShared,
                        label = "E2EE Share",
                        tint = Color(0xFF34D399)
                    )
                    DesktopIconItem(
                        icon = Icons.Default.Speed,
                        label = "Task Mgr",
                        tint = Color(0xFFF472B6),
                        onClick = { showTaskManager = true }
                    )
                }

                Spacer(modifier = Modifier.weight(1f))

                // Simulated Windows / Ubuntu Taskbar
                Surface(
                    color = Color(0xFF1E293B).copy(alpha = 0.9f),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            color = Color(0xFF3B82F6),
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.size(28.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    Icons.Default.Window,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Icon(
                            Icons.Default.Terminal,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )

                        Spacer(modifier = Modifier.width(10.dp))

                        Icon(
                            Icons.Default.Folder,
                            contentDescription = null,
                            tint = Color(0xFFFBBF24),
                            modifier = Modifier.size(20.dp)
                        )

                        Spacer(modifier = Modifier.weight(1f))

                        // Clock & System Tray
                        Text(
                            text = "10:56 AM\n06/09/2026",
                            color = Color(0xFF94A3B8),
                            fontSize = 9.sp,
                            fontFamily = FontFamily.Monospace,
                            lineHeight = 11.sp
                        )
                    }
                }
            }

            // Virtual Mouse Pointer on Canvas
            Canvas(modifier = Modifier.fillMaxSize()) {
                val x = cursorPosition.x.coerceIn(20f, size.width - 20f)
                val y = cursorPosition.y.coerceIn(20f, size.height - 20f)

                // Mouse arrow
                drawCircle(
                    color = Color.White,
                    radius = 8f,
                    center = Offset(x, y)
                )
                drawCircle(
                    color = Color(0xFF2563EB),
                    radius = 5f,
                    center = Offset(x, y)
                )
            }
        }

        // Bottom Macro & Controls Bar
        Surface(
            color = Color(0xFF1E293B),
            shadowElevation = 8.dp
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                MacroButton(
                    label = "Ctrl+Alt+Del",
                    onClick = { activeMacroNotice = "Ctrl+Alt+Delete (SAS)" }
                )
                MacroButton(
                    label = "Win Key",
                    onClick = { activeMacroNotice = "Windows Start" }
                )
                MacroButton(
                    label = "Alt+Tab",
                    onClick = { activeMacroNotice = "Alt+Tab Window Switch" }
                )
                MacroButton(
                    label = "Terminal",
                    onClick = { showTerminal = true }
                )
                MacroButton(
                    label = "Task Mgr",
                    onClick = { showTaskManager = true }
                )
                MacroButton(
                    label = "Clipboard",
                    onClick = { showClipboardSync = true }
                )
            }
        }
    }

    // Task Manager Dialog
    if (showTaskManager) {
        AlertDialog(
            onDismissRequest = { showTaskManager = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Speed, contentDescription = null, tint = Color(0xFF6750A4))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Trình Quản Lý Tác Vụ (${vm.name})", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    TelemetryBar(label = "CPU Usage", value = "18% • 8 vCPU (AMD EPYC 7763)", progress = 0.18f, color = Color(0xFF2563EB))
                    TelemetryBar(label = "RAM Memory", value = "3.2 GB / 16.0 GB (20%)", progress = 0.20f, color = Color(0xFF10B981))
                    TelemetryBar(label = "Độ trễ Chromium", value = "${vm.latencyMs} ms • 0.0% RTT Packet Loss", progress = 0.12f, color = Color(0xFF8B5CF6))
                    TelemetryBar(label = "WebGL Render", value = "60.0 FPS • Tăng tốc GPU", progress = 0.95f, color = Color(0xFFF59E0B))
                }
            },
            confirmButton = {
                TextButton(onClick = { showTaskManager = false }) {
                    Text("Đóng")
                }
            }
        )
    }

    // Terminal Dialog
    if (showTerminal) {
        AlertDialog(
            onDismissRequest = { showTerminal = false },
            title = {
                Text("Dòng Lệnh An Toàn (${vm.username}@${vm.host})", fontSize = 15.sp, fontWeight = FontWeight.Bold)
            },
            text = {
                Surface(
                    color = Color(0xFF0F172A),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = "Microsoft Windows [Version 10.0.20348.2405]\n(c) Microsoft Corporation. All rights reserved.\n",
                            color = Color(0xFF94A3B8),
                            fontFamily = FontFamily.Monospace,
                            fontSize = 10.sp
                        )
                        Text(
                            text = "PS C:\\Users\\${vm.username}> netstat -an | findstr 3389\n  TCP    0.0.0.0:3389    0.0.0.0:0    LISTENING\n  TCP    10.240.12.88:3389  CLIENT:51280  ESTABLISHED (TLS 1.3)",
                            color = Color(0xFF4ADE80),
                            fontFamily = FontFamily.Monospace,
                            fontSize = 10.sp
                        )
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showTerminal = false }) {
                    Text("Đóng Terminal")
                }
            }
        )
    }

    // Clipboard Sync Dialog
    if (showClipboardSync) {
        AlertDialog(
            onDismissRequest = { showClipboardSync = false },
            title = {
                Text("Đồng Bộ Clipboard Hai Chiều", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            },
            text = {
                Column {
                    Text("Nội dung chia sẻ an toàn qua kênh DLP:", fontSize = 12.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = clipboardContent,
                        onValueChange = { clipboardContent = it },
                        modifier = Modifier.fillMaxWidth(),
                        textStyle = LocalTextStyle.current.copy(fontFamily = FontFamily.Monospace, fontSize = 12.sp)
                    )
                }
            },
            confirmButton = {
                Button(onClick = {
                    showClipboardSync = false
                    activeMacroNotice = "Đã dán Clipboard vào VM"
                }) {
                    Text("Gửi Vào Máy Ảo")
                }
            },
            dismissButton = {
                TextButton(onClick = { showClipboardSync = false }) {
                    Text("Hủy")
                }
            }
        )
    }
}

@Composable
fun DesktopIconItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    tint: Color,
    onClick: () -> Unit = {}
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(Color.White.copy(alpha = 0.08f))
            .padding(8.dp)
            .clickable { onClick() }
    ) {
        Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(32.dp))
        Spacer(modifier = Modifier.height(4.dp))
        Text(text = label, color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Medium)
    }
}

@Composable
fun MacroButton(label: String, onClick: () -> Unit) {
    Surface(
        color = Color(0xFF334155),
        shape = RoundedCornerShape(6.dp),
        modifier = Modifier.clickable { onClick() }
    ) {
        Text(
            text = label,
            color = Color.White,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
        )
    }
}

@Composable
fun TelemetryBar(label: String, value: String, progress: Float, color: Color) {
    Column {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(text = label, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
            Text(text = value, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Spacer(modifier = Modifier.height(3.dp))
        LinearProgressIndicator(
            progress = { progress },
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(RoundedCornerShape(3.dp)),
            color = color,
            trackColor = MaterialTheme.colorScheme.surfaceVariant
        )
    }
}
