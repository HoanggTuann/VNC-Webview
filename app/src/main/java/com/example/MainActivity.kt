package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.dialogs.ConnectionDialog
import com.example.ui.dialogs.MFAChallengeDialog
import com.example.ui.screens.*
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.ScreenTab
import com.example.ui.viewmodel.SecureLinkViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: SecureLinkViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            MyApplicationTheme {
                val activeTab by viewModel.activeTab.collectAsStateWithLifecycle()
                val connections by viewModel.connections.collectAsStateWithLifecycle()
                val activeVM by viewModel.activeVM.collectAsStateWithLifecycle()
                val pendingMfaVM by viewModel.pendingMfaVM.collectAsStateWithLifecycle()
                val isModalOpen by viewModel.isModalOpen.collectAsStateWithLifecycle()
                val editingVM by viewModel.editingVM.collectAsStateWithLifecycle()
                val policy by viewModel.policy.collectAsStateWithLifecycle()
                val logs by viewModel.logs.collectAsStateWithLifecycle()
                val stats by viewModel.stats.collectAsStateWithLifecycle()
                val backupState by viewModel.backupState.collectAsStateWithLifecycle()
                val mfaState by viewModel.mfaState.collectAsStateWithLifecycle()
                val searchQuery by viewModel.searchQuery.collectAsStateWithLifecycle()
                val toastMessage by viewModel.toastMessage.collectAsStateWithLifecycle()

                Scaffold(
                    topBar = {
                        TopAppBar(
                            title = {
                                Column {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = "SecureLink Pro",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 18.sp
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Surface(
                                            color = Color(0xFF2E7D32),
                                            shape = CircleShape
                                        ) {
                                            Text(
                                                text = "ZERO-TRUST",
                                                color = Color.White,
                                                fontSize = 9.sp,
                                                fontWeight = FontWeight.Bold,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    }
                                    Text(
                                        text = "Chromium VM Gateway • RDP & VNC",
                                        fontSize = 11.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            },
                            actions = {
                                IconButton(onClick = { viewModel.setTab(ScreenTab.SECURITY) }) {
                                    Icon(
                                        Icons.Default.LockClock,
                                        contentDescription = "Trung tâm MFA",
                                        tint = MaterialTheme.colorScheme.primary
                                    )
                                }
                                IconButton(onClick = { viewModel.setTab(ScreenTab.SYNC) }) {
                                    Icon(
                                        Icons.Default.CloudSync,
                                        contentDescription = "Sao lưu đám mây",
                                        tint = MaterialTheme.colorScheme.primary
                                    )
                                }
                            },
                            colors = TopAppBarDefaults.topAppBarColors(
                                containerColor = MaterialTheme.colorScheme.surface
                            )
                        )
                    },
                    bottomBar = {
                        NavigationBar(
                            modifier = Modifier
                                .windowInsetsPadding(WindowInsets.navigationBars)
                                .testTag("nav_bottom_bar"),
                            containerColor = MaterialTheme.colorScheme.surface,
                            tonalElevation = 6.dp
                        ) {
                            NavigationBarItem(
                                selected = activeTab == ScreenTab.SESSIONS,
                                onClick = { viewModel.setTab(ScreenTab.SESSIONS) },
                                icon = { Icon(Icons.Default.Dns, contentDescription = null) },
                                label = { Text("Máy Ảo", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) }
                            )

                            NavigationBarItem(
                                selected = activeTab == ScreenTab.VIEWER,
                                onClick = { viewModel.setTab(ScreenTab.VIEWER) },
                                icon = {
                                    BadgedBox(
                                        badge = {
                                            if (activeVM != null) {
                                                Badge(containerColor = Color(0xFF2E7D32)) {
                                                    Text("1")
                                                }
                                            }
                                        }
                                    ) {
                                        Icon(Icons.Default.DesktopWindows, contentDescription = null)
                                    }
                                },
                                label = { Text("Màn Hình", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) }
                            )

                            NavigationBarItem(
                                selected = activeTab == ScreenTab.ADMIN,
                                onClick = { viewModel.setTab(ScreenTab.ADMIN) },
                                icon = { Icon(Icons.Default.AdminPanelSettings, contentDescription = null) },
                                label = { Text("Quản Trị", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) }
                            )

                            NavigationBarItem(
                                selected = activeTab == ScreenTab.SYNC,
                                onClick = { viewModel.setTab(ScreenTab.SYNC) },
                                icon = { Icon(Icons.Default.CloudSync, contentDescription = null) },
                                label = { Text("Đồng Bộ", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) }
                            )

                            NavigationBarItem(
                                selected = activeTab == ScreenTab.SECURITY,
                                onClick = { viewModel.setTab(ScreenTab.SECURITY) },
                                icon = { Icon(Icons.Default.Security, contentDescription = null) },
                                label = { Text("Bảo Mật", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) }
                            )
                        }
                    }
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    ) {
                        when (activeTab) {
                            ScreenTab.SESSIONS -> SessionsScreen(
                                connections = connections,
                                searchQuery = searchQuery,
                                onSearchQueryChange = { viewModel.setSearchQuery(it) },
                                onConnect = { viewModel.initiateConnect(it) },
                                onEdit = { viewModel.openEditVmModal(it) },
                                onDelete = { viewModel.deleteVm(it) },
                                onAddNew = { viewModel.openNewVmModal() }
                            )
                            ScreenTab.VIEWER -> VMViewerScreen(
                                vm = activeVM,
                                onDisconnect = { viewModel.disconnectSession() },
                                onNavigateToSessions = { viewModel.setTab(ScreenTab.SESSIONS) }
                            )
                            ScreenTab.ADMIN -> AdminConsoleScreen(
                                stats = stats,
                                policy = policy,
                                onUpdatePolicy = { viewModel.updatePolicy(it) },
                                logs = logs
                            )
                            ScreenTab.SYNC -> CloudSyncScreen(
                                backupState = backupState,
                                totalConnections = connections.size,
                                onTriggerSync = { viewModel.triggerCloudSync() }
                            )
                            ScreenTab.SECURITY -> SecurityCenterScreen(
                                mfaState = mfaState,
                                onToggleBiometric = { viewModel.toggleBiometric() }
                            )
                        }

                        // Floating Toast Message
                        AnimatedVisibility(
                            visible = toastMessage != null,
                            enter = fadeIn(),
                            exit = fadeOut(),
                            modifier = Modifier
                                .align(Alignment.BottomCenter)
                                .padding(bottom = 16.dp)
                        ) {
                            toastMessage?.let { msg ->
                                Surface(
                                    color = MaterialTheme.colorScheme.inverseSurface,
                                    shape = RoundedCornerShape(24.dp),
                                    shadowElevation = 8.dp
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            Icons.Default.CheckCircle,
                                            contentDescription = null,
                                            tint = Color(0xFF4ADE80),
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = msg,
                                            color = MaterialTheme.colorScheme.inverseOnSurface,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Medium
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // Add or Edit VM Dialog
                if (isModalOpen) {
                    ConnectionDialog(
                        vm = editingVM,
                        onDismiss = { viewModel.closeModal() },
                        onSave = { viewModel.saveVm(it) }
                    )
                }

                // MFA Zero-Trust Challenge Dialog
                if (pendingMfaVM != null) {
                    MFAChallengeDialog(
                        vm = pendingMfaVM,
                        currentCode = mfaState.currentCode,
                        onConfirm = { viewModel.confirmMfaAndConnect() },
                        onDismiss = { viewModel.cancelMfa() }
                    )
                }
            }
        }
    }
}
