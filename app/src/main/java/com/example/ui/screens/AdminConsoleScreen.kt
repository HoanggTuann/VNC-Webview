package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.AdminStats
import com.example.data.AuditLog
import com.example.data.SecurityPolicy

@Composable
fun AdminConsoleScreen(
    stats: AdminStats,
    policy: SecurityPolicy,
    onUpdatePolicy: (SecurityPolicy) -> Unit,
    logs: List<AuditLog>
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 80.dp)
    ) {
        // Metric Overview Cards
        item {
            Text(
                text = "Tổng Quan Hệ Thống Zero-Trust",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                AdminStatCard(
                    title = "Người Dùng",
                    value = "${stats.totalUsers}",
                    subtitle = "100% MFA bật",
                    icon = Icons.Default.People,
                    color = Color(0xFF6750A4),
                    modifier = Modifier.weight(1f)
                )
                AdminStatCard(
                    title = "Phiên Trực Tiếp",
                    value = "${stats.activeSessions}",
                    subtitle = "E2EE TLS 1.3",
                    icon = Icons.Default.Dns,
                    color = Color(0xFF0284C7),
                    modifier = Modifier.weight(1f)
                )
                AdminStatCard(
                    title = "Điểm Tuân Thủ",
                    value = "${stats.zeroTrustScore}%",
                    subtitle = "Hạng A+ An ninh",
                    icon = Icons.Default.VerifiedUser,
                    color = Color(0xFF16A34A),
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Security Policies Controls
        item {
            ElevatedCard(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Security,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Chính Sách Bảo Mật Toàn Hệ Thống",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    PolicyToggleItem(
                        title = "Bắt Buộc Xác Thực MFA Toàn Bộ Máy Ảo",
                        description = "Yêu cầu mã TOTP RFC 6238 trước khi mở bất kỳ phiên RDP / VNC nào",
                        checked = policy.enforceMfaForAll,
                        onCheckedChange = { onUpdatePolicy(policy.copy(enforceMfaForAll = it)) }
                    )

                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

                    PolicyToggleItem(
                        title = "Bắt Buộc TLS 1.3 Strict Tunnel",
                        description = "Từ chối các thuật toán kế thừa (Legacy SSL / TLS 1.0 / 1.1)",
                        checked = policy.enforceTls13,
                        onCheckedChange = { onUpdatePolicy(policy.copy(enforceTls13 = it)) }
                    )

                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

                    PolicyToggleItem(
                        title = "Cách Ly Clipboard DLP Hai Chiều",
                        description = "Chặn sao chép trái phép dữ liệu nhạy cảm ra ngoài máy trạm",
                        checked = policy.dlpClipboardIsolation,
                        onCheckedChange = { onUpdatePolicy(policy.copy(dlpClipboardIsolation = it)) }
                    )

                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

                    PolicyToggleItem(
                        title = "Ghi Hình Phiên & Kiểm Toán Mật Mã",
                        description = "Lưu vết hash SHA-256 các thao tác quản trị cho báo cáo ISO 27001",
                        checked = policy.auditSessionRecording,
                        onCheckedChange = { onUpdatePolicy(policy.copy(auditSessionRecording = it)) }
                    )
                }
            }
        }

        // Audit Trail Header & List
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Nhật Ký Kiểm Toán (Audit Trail)",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Surface(
                    color = MaterialTheme.colorScheme.primaryContainer,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "${logs.size} sự kiện",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
            }
        }

        items(logs, key = { it.id }) { log ->
            AuditLogCard(log = log)
        }
    }
}

@Composable
fun AdminStatCard(
    title: String,
    value: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    ElevatedCard(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(color.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(18.dp))
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = value, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
            Text(text = title, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
            Text(text = subtitle, fontSize = 9.sp, color = color, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun PolicyToggleItem(
    title: String,
    description: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(text = title, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
            Text(
                text = description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Spacer(modifier = Modifier.width(8.dp))
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}

@Composable
fun AuditLogCard(log: AuditLog) {
    val severityColor = when (log.severity) {
        "success" -> Color(0xFF16A34A)
        "warning" -> Color(0xFFD97706)
        "critical" -> Color(0xFFDC2626)
        else -> Color(0xFF2563EB)
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(severityColor)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = log.event,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    modifier = Modifier.weight(1f)
                )
                Text(
                    text = log.timestamp,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.outline
                )
            }

            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = log.details,
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${log.user} • ${log.ipAddress}",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.outline
                )
                if (log.e2eeValidated) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Verified,
                            contentDescription = null,
                            tint = Color(0xFF16A34A),
                            modifier = Modifier.size(12.dp)
                        )
                        Spacer(modifier = Modifier.width(2.dp))
                        Text(
                            text = "E2EE Xác Thực",
                            color = Color(0xFF16A34A),
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}
