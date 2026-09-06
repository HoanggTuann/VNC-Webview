package com.example.ui.dialogs

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.OSType
import com.example.data.ProtocolType
import com.example.data.VMConnection

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConnectionDialog(
    vm: VMConnection?,
    onDismiss: () -> Unit,
    onSave: (VMConnection) -> Unit
) {
    var name by remember { mutableStateOf(vm?.name ?: "") }
    var host by remember { mutableStateOf(vm?.host ?: "192.168.1.") }
    var portText by remember { mutableStateOf(vm?.port?.toString() ?: "3389") }
    var protocol by remember { mutableStateOf(vm?.protocol ?: ProtocolType.RDP) }
    var osType by remember { mutableStateOf(vm?.osType ?: OSType.WINDOWS) }
    var username by remember { mutableStateOf(vm?.username ?: "Administrator") }
    var mfaRequired by remember { mutableStateOf(vm?.mfaRequired ?: true) }
    var description by remember { mutableStateOf(vm?.description ?: "") }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = if (vm == null) "Thêm Kết Nối Máy Ảo Mới" else "Chỉnh Sửa Máy Ảo",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Giao thức RDP / VNC trên nhân Chromium với mã hóa E2EE",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Protocol selector RDP / VNC
                Text("Giao thức kết nối:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = protocol == ProtocolType.RDP,
                        onClick = {
                            protocol = ProtocolType.RDP
                            portText = "3389"
                            osType = OSType.WINDOWS
                        },
                        label = { Text("RDP Remote Desktop") },
                        modifier = Modifier.weight(1f)
                    )
                    FilterChip(
                        selected = protocol == ProtocolType.VNC,
                        onClick = {
                            protocol = ProtocolType.VNC
                            portText = "5900"
                            osType = OSType.UBUNTU
                        },
                        label = { Text("VNC / RFB") },
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Tên máy ảo") },
                    placeholder = { Text("Ví dụ: Windows Server 2022...") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = host,
                        onValueChange = { host = it },
                        label = { Text("IP / Hostname") },
                        singleLine = true,
                        modifier = Modifier.weight(2f)
                    )
                    OutlinedTextField(
                        value = portText,
                        onValueChange = { portText = it },
                        label = { Text("Port") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = username,
                    onValueChange = { username = it },
                    label = { Text("Tên đăng nhập") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Mô tả máy ảo") },
                    maxLines = 2,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(12.dp))

                // MFA Requirement Switch
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Yêu cầu xác thực MFA 2FA", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Text("Bắt buộc nhập mã OTP trước khi mở màn hình", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Switch(checked = mfaRequired, onCheckedChange = { mfaRequired = it })
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Hủy")
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            if (name.isNotBlank() && host.isNotBlank()) {
                                val newVm = VMConnection(
                                    id = vm?.id ?: "vm-${System.currentTimeMillis()}",
                                    name = name.trim(),
                                    host = host.trim(),
                                    port = portText.toIntOrNull() ?: 3389,
                                    protocol = protocol,
                                    rdpVersion = if (protocol == ProtocolType.RDP) "RDP 10.11 (Win11/Server 2022)" else null,
                                    vncVersion = if (protocol == ProtocolType.VNC) "RFB 3.8 (TLS 1.3 / VeNCrypt)" else null,
                                    engineProfile = "Chromium 128 (Hardware Accelerated + WebGL)",
                                    status = vm?.status ?: "idle",
                                    latencyMs = vm?.latencyMs ?: 12,
                                    encryptionSuite = "AES-256-GCM • TLS 1.3",
                                    e2eeFingerprint = vm?.e2eeFingerprint ?: "SHA256:8F:2B:A1:C9:44:E2:70:D1",
                                    mfaRequired = mfaRequired,
                                    osType = osType,
                                    username = username.trim().ifEmpty { "admin" },
                                    description = description.trim().ifEmpty { "Máy ảo điều khiển từ xa" },
                                    lastConnected = vm?.lastConnected ?: "Mới tạo"
                                )
                                onSave(newVm)
                            }
                        }
                    ) {
                        Text(if (vm == null) "Tạo Máy Ảo" else "Lưu Thay Đổi")
                    }
                }
            }
        }
    }
}
