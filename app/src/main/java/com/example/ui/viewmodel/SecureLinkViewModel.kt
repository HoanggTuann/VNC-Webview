package com.example.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlin.random.Random

enum class ScreenTab(val title: String) {
    SESSIONS("Máy Ảo"),
    VIEWER("Màn Hình"),
    ADMIN("Quản Trị"),
    SYNC("Đồng Bộ"),
    SECURITY("Bảo Mật")
}

class SecureLinkViewModel : ViewModel() {

    private val _connections = MutableStateFlow(MockData.initialConnections)
    val connections: StateFlow<List<VMConnection>> = _connections.asStateFlow()

    private val _activeVM = MutableStateFlow<VMConnection?>(null)
    val activeVM: StateFlow<VMConnection?> = _activeVM.asStateFlow()

    private val _activeTab = MutableStateFlow(ScreenTab.SESSIONS)
    val activeTab: StateFlow<ScreenTab> = _activeTab.asStateFlow()

    private val _pendingMfaVM = MutableStateFlow<VMConnection?>(null)
    val pendingMfaVM: StateFlow<VMConnection?> = _pendingMfaVM.asStateFlow()

    private val _editingVM = MutableStateFlow<VMConnection?>(null)
    val editingVM: StateFlow<VMConnection?> = _editingVM.asStateFlow()

    private val _isModalOpen = MutableStateFlow(false)
    val isModalOpen: StateFlow<Boolean> = _isModalOpen.asStateFlow()

    private val _policy = MutableStateFlow(SecurityPolicy())
    val policy: StateFlow<SecurityPolicy> = _policy.asStateFlow()

    private val _logs = MutableStateFlow(MockData.initialLogs)
    val logs: StateFlow<List<AuditLog>> = _logs.asStateFlow()

    private val _stats = MutableStateFlow(AdminStats())
    val stats: StateFlow<AdminStats> = _stats.asStateFlow()

    private val _backupState = MutableStateFlow(
        CloudBackupState(syncedDevices = MockData.initialSyncedDevices)
    )
    val backupState: StateFlow<CloudBackupState> = _backupState.asStateFlow()

    private val _mfaState = MutableStateFlow(MFAState())
    val mfaState: StateFlow<MFAState> = _mfaState.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _toastMessage = MutableStateFlow<String?>(null)
    val toastMessage: StateFlow<String?> = _toastMessage.asStateFlow()

    init {
        // Start TOTP rolling code timer (RFC 6238 simulator)
        viewModelScope.launch {
            while (true) {
                delay(1000)
                _mfaState.value = _mfaState.value.let { current ->
                    if (current.secondsRemaining <= 1) {
                        val newCodeNum = Random.nextInt(100000, 999999).toString()
                        val formatted = "${newCodeNum.substring(0, 3)} ${newCodeNum.substring(3)}"
                        current.copy(secondsRemaining = 30, currentCode = formatted)
                    } else {
                        current.copy(secondsRemaining = current.secondsRemaining - 1)
                    }
                }
            }
        }
    }

    fun setTab(tab: ScreenTab) {
        _activeTab.value = tab
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun initiateConnect(vm: VMConnection) {
        if (_policy.value.enforceMfaForAll || vm.mfaRequired) {
            _pendingMfaVM.value = vm
        } else {
            launchSession(vm)
        }
    }

    fun confirmMfaAndConnect() {
        val vm = _pendingMfaVM.value ?: return
        _pendingMfaVM.value = null
        launchSession(vm)
    }

    fun cancelMfa() {
        _pendingMfaVM.value = null
    }

    private fun launchSession(vm: VMConnection) {
        _activeVM.value = vm
        _activeTab.value = ScreenTab.VIEWER

        _connections.value = _connections.value.map {
            if (it.id == vm.id) it.copy(status = "live", lastConnected = "Đang hoạt động") else it
        }

        val newLog = AuditLog(
            id = "log-${System.currentTimeMillis()}",
            timestamp = "Vừa xong",
            event = "Khởi tạo phiên ${vm.protocol}",
            severity = "success",
            user = vm.username,
            ipAddress = vm.host,
            details = "Mở phiên máy ảo ${vm.name} qua Chromium WebSocket mã hóa E2EE",
            e2eeValidated = true
        )
        _logs.value = listOf(newLog) + _logs.value
        showToast("Đã mở phiên kết nối an toàn đến ${vm.name}")
    }

    fun disconnectSession() {
        val current = _activeVM.value ?: return
        _activeVM.value = null
        _activeTab.value = ScreenTab.SESSIONS

        _connections.value = _connections.value.map {
            if (it.id == current.id) it.copy(status = "idle", lastConnected = "Vừa xong") else it
        }

        val newLog = AuditLog(
            id = "log-${System.currentTimeMillis()}",
            timestamp = "Vừa xong",
            event = "Đóng phiên an toàn",
            severity = "info",
            user = current.username,
            ipAddress = current.host,
            details = "Đã ngắt kết nối E2EE với máy ảo ${current.name}",
            e2eeValidated = true
        )
        _logs.value = listOf(newLog) + _logs.value
        showToast("Đã ngắt kết nối phiên máy ảo")
    }

    fun openNewVmModal() {
        _editingVM.value = null
        _isModalOpen.value = true
    }

    fun openEditVmModal(vm: VMConnection) {
        _editingVM.value = vm
        _isModalOpen.value = true
    }

    fun closeModal() {
        _editingVM.value = null
        _isModalOpen.value = false
    }

    fun saveVm(vm: VMConnection) {
        val existing = _connections.value.any { it.id == vm.id }
        if (existing) {
            _connections.value = _connections.value.map { if (it.id == vm.id) vm else it }
        } else {
            _connections.value = listOf(vm) + _connections.value
        }
        closeModal()
        showToast("Đã lưu cấu hình máy ảo ${vm.name}")
    }

    fun deleteVm(id: String) {
        val target = _connections.value.find { it.id == id } ?: return
        _connections.value = _connections.value.filter { it.id != id }
        if (_activeVM.value?.id == id) {
            _activeVM.value = null
        }
        showToast("Đã xóa máy ảo ${target.name}")
    }

    fun triggerCloudSync() {
        viewModelScope.launch {
            _backupState.value = _backupState.value.copy(isSyncing = true)
            delay(1500)
            _backupState.value = _backupState.value.copy(
                isSyncing = false,
                lastBackupTime = "Vừa xong",
                backupRevisions = _backupState.value.backupRevisions + 1
            )
            val newLog = AuditLog(
                id = "log-${System.currentTimeMillis()}",
                timestamp = "Vừa xong",
                event = "Đồng bộ đám mây",
                severity = "info",
                user = "admin_secops",
                ipAddress = "127.0.0.1",
                details = "Sao lưu thành công ${_connections.value.size} máy ảo lên kho lưu an toàn",
                e2eeValidated = true
            )
            _logs.value = listOf(newLog) + _logs.value
            showToast("Đồng bộ đám mây thành công! Tất cả thiết bị đã được cập nhật.")
        }
    }

    fun updatePolicy(newPolicy: SecurityPolicy) {
        _policy.value = newPolicy
        showToast("Đã cập nhật chính sách bảo mật Zero-Trust")
    }

    fun toggleBiometric() {
        _mfaState.value = _mfaState.value.copy(
            biometricUnlocked = !_mfaState.value.biometricUnlocked
        )
    }

    private fun showToast(msg: String) {
        _toastMessage.value = msg
        viewModelScope.launch {
            delay(3500)
            if (_toastMessage.value == msg) {
                _toastMessage.value = null
            }
        }
    }
}
