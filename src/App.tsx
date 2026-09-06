import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { SessionsView } from './components/SessionsView';
import { VMViewer } from './components/VMViewer';
import { AdminConsoleView } from './components/AdminConsoleView';
import { CloudSyncView } from './components/CloudSyncView';
import { SecurityCenterView } from './components/SecurityCenterView';
import { ConnectionModal } from './components/ConnectionModal';
import { MFAChallengeModal } from './components/MFAChallengeModal';
import {
  VMConnection,
  AuditLog,
  SecurityPolicy,
  CloudBackupState,
  AdminStats,
  MFAState,
} from './types';
import {
  INITIAL_CONNECTIONS,
  INITIAL_LOGS,
  INITIAL_POLICY,
  INITIAL_BACKUP,
  INITIAL_STATS,
} from './mockData';

export const App: React.FC = () => {
  // State from localStorage or initial
  const [connections, setConnections] = useState<VMConnection[]>(() => {
    const saved = localStorage.getItem('securelink_connections');
    return saved ? JSON.parse(saved) : INITIAL_CONNECTIONS;
  });

  const [activeTab, setActiveTab] = useState<TabType>('sessions');
  const [activeVM, setActiveVM] = useState<VMConnection | null>(null);
  const [editingVM, setEditingVM] = useState<VMConnection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMfaChallengeOpen, setIsMfaChallengeOpen] = useState(false);
  const [pendingConnectVM, setPendingConnectVM] = useState<VMConnection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [policy, setPolicy] = useState<SecurityPolicy>(() => {
    const saved = localStorage.getItem('securelink_policy');
    return saved ? JSON.parse(saved) : INITIAL_POLICY;
  });

  const [backupState, setBackupState] = useState<CloudBackupState>(() => {
    const saved = localStorage.getItem('securelink_backup');
    return saved ? JSON.parse(saved) : INITIAL_BACKUP;
  });

  const [logs, setLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('securelink_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [stats, setStats] = useState<AdminStats>(INITIAL_STATS);

  const [mfaState, setMfaState] = useState<MFAState>({
    enabled: true,
    secret: 'JBSWY3DPEHPK3PXP',
    currentCode: '842 190',
    secondsRemaining: 24,
    backupCodes: ['9012-4412', '7731-8902', '1249-0038'],
    biometricUnlocked: true,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('securelink_connections', JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    localStorage.setItem('securelink_policy', JSON.stringify(policy));
  }, [policy]);

  useEffect(() => {
    localStorage.setItem('securelink_backup', JSON.stringify(backupState));
  }, [backupState]);

  useEffect(() => {
    localStorage.setItem('securelink_logs', JSON.stringify(logs));
  }, [logs]);

  // Handle Connect initiation
  const handleInitiateConnect = (vm: VMConnection) => {
    if (policy.enforceMfaForAll || vm.mfaRequired) {
      setPendingConnectVM(vm);
      setIsMfaChallengeOpen(true);
    } else {
      launchSession(vm);
    }
  };

  const launchSession = (vm: VMConnection) => {
    setActiveVM(vm);
    setActiveTab('viewer');
    setIsMfaChallengeOpen(false);
    setPendingConnectVM(null);

    // Add audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Vừa xong',
      event: `Khởi tạo phiên kết nối ${vm.protocol}`,
      severity: 'success',
      user: 'admin@corp.internal',
      ipAddress: '192.168.1.102',
      details: `Mở phiên ${vm.name} qua nhân Chromium (${vm.engineProfile.split(' ')[0]}) mã hóa E2EE`,
      e2eeValidated: true,
    };
    setLogs((prev) => [newLog, ...prev]);

    // Update connection status
    setConnections((prev) =>
      prev.map((c) => (c.id === vm.id ? { ...c, status: 'live', lastConnected: 'Đang hoạt động' } : c))
    );

    showToast(`Đã mở phiên kết nối an toàn đến ${vm.name}`);
  };

  const handleDisconnect = () => {
    if (activeVM) {
      const vmId = activeVM.id;
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: 'Vừa xong',
        event: 'Ngắt kết nối phiên an toàn',
        severity: 'info',
        user: 'admin@corp.internal',
        ipAddress: '192.168.1.102',
        details: `Đã đóng kênh mã hóa E2EE đến ${activeVM.name}`,
        e2eeValidated: true,
      };
      setLogs((prev) => [newLog, ...prev]);
      setActiveVM(null);
      setActiveTab('sessions');
      setConnections((prev) =>
        prev.map((c) => (c.id === vmId ? { ...c, status: 'idle', lastConnected: 'Vừa xong' } : c))
      );
      showToast('Đã đóng phiên kết nối máy ảo.');
    }
  };

  const handleSaveVM = (vm: VMConnection) => {
    setConnections((prev) => {
      const exists = prev.some((c) => c.id === vm.id);
      if (exists) {
        return prev.map((c) => (c.id === vm.id ? vm : c));
      } else {
        return [vm, ...prev];
      }
    });

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Vừa xong',
      event: editingVM ? 'Cập nhật cấu hình máy ảo' : 'Tạo mới máy ảo RDP/VNC',
      severity: 'info',
      user: 'admin@corp.internal',
      ipAddress: '192.168.1.102',
      details: `Máy ảo: ${vm.name} (${vm.protocol} - ${vm.rdpVersion || vm.vncVersion})`,
      e2eeValidated: true,
    };
    setLogs((prev) => [newLog, ...prev]);
    showToast(`Đã lưu cấu hình máy ảo ${vm.name}`);
  };

  const handleDeleteVM = (id: string) => {
    const target = connections.find((c) => c.id === id);
    if (!target) return;

    if (confirm(`Bạn có chắc chắn muốn xóa máy ảo "${target.name}" khỏi danh sách?`)) {
      setConnections((prev) => prev.filter((c) => c.id !== id));
      if (activeVM?.id === id) {
        setActiveVM(null);
      }
      showToast(`Đã xóa máy ảo ${target.name}`);
    }
  };

  const handleTriggerCloudSync = () => {
    setBackupState((prev) => ({ ...prev, isSyncing: true }));
    setTimeout(() => {
      setBackupState((prev) => ({
        ...prev,
        isSyncing: false,
        lastBackupTime: 'Vừa xong',
        backupRevisions: prev.backupRevisions + 1,
      }));
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: 'Vừa xong',
        event: 'Đồng bộ sao lưu đám mây',
        severity: 'info',
        user: 'admin@corp.internal',
        ipAddress: '192.168.1.102',
        details: `Toàn bộ ${connections.length} máy ảo và chứng chỉ E2EE đã đồng bộ lên mây an toàn.`,
        e2eeValidated: true,
      };
      setLogs((prev) => [newLog, ...prev]);
      showToast('Đồng bộ đám mây thành công! Tất cả thiết bị đã được cập nhật.');
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#fdf8f6] text-[#1d1b20] font-sans overflow-hidden">
      {/* Header with Search and Security Status banner */}
      <Header
        onOpenMfa={() => setActiveTab('security')}
        onSearchClick={() => setIsSearchOpen(!isSearchOpen)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchOpen={isSearchOpen}
      />

      {/* Main Tab Views */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'sessions' && (
          <SessionsView
            connections={connections}
            onConnect={handleInitiateConnect}
            onEdit={(vm) => {
              setEditingVM(vm);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteVM}
            onNewSession={() => {
              setEditingVM(null);
              setIsModalOpen(true);
            }}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'viewer' && (
          <VMViewer
            vm={activeVM}
            onDisconnect={handleDisconnect}
            onSwitchSession={() => setActiveTab('sessions')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminConsoleView
            stats={stats}
            policy={policy}
            onUpdatePolicy={setPolicy}
            logs={logs}
          />
        )}

        {activeTab === 'sync' && (
          <CloudSyncView
            backupState={backupState}
            connections={connections}
            onTriggerSync={handleTriggerCloudSync}
            onImportBackup={() => {}}
          />
        )}

        {activeTab === 'security' && (
          <SecurityCenterView
            mfaState={mfaState}
            onUpdateMfa={setMfaState}
            onVerifyCode={() => true}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        hasActiveSession={activeVM !== null}
      />

      {/* Connection Create/Edit Modal */}
      <ConnectionModal
        vm={editingVM}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVM(null);
        }}
        onSave={handleSaveVM}
      />

      {/* MFA Challenge Dialog */}
      <MFAChallengeModal
        vm={pendingConnectVM}
        isOpen={isMfaChallengeOpen}
        onSuccess={() => {
          if (pendingConnectVM) launchSession(pendingConnectVM);
        }}
        onCancel={() => {
          setIsMfaChallengeOpen(false);
          setPendingConnectVM(null);
        }}
        currentMfaCode={mfaState.currentCode}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#1d1b20] text-white px-4 py-2 rounded-full text-xs font-medium shadow-xl flex items-center gap-2 z-50 animate-bounce">
          <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
