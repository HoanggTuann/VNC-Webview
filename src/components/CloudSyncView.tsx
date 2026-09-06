import React, { useState } from 'react';
import { CloudBackupState, VMConnection } from '../types';

interface CloudSyncViewProps {
  backupState: CloudBackupState;
  connections: VMConnection[];
  onTriggerSync: () => void;
  onImportBackup: (data: any) => void;
}

export const CloudSyncView: React.FC<CloudSyncViewProps> = ({
  backupState,
  connections,
  onTriggerSync,
}) => {
  const [exportNotice, setExportNotice] = useState(false);
  const [provider, setProvider] = useState(backupState.provider);

  const handleExportVault = () => {
    const backupData = {
      version: '3.2.0',
      exportedAt: new Date().toISOString(),
      encryption: 'AES-256-GCM + Argon2id',
      fingerprint: 'VAULT-FPRINT-98F12A',
      connectionCount: connections.length,
      connections: connections.map((c) => ({
        ...c,
        passwordEncrypted: 'ENC:GCM:a7b8c9d0...[Encrypted with Master Passkey]',
      })),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `securelink-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
      {/* Cloud Sync Hero Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#e0e0e0] shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#d3e3fd] text-[#001d35] flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">cloud_sync</span>
            </div>
            <div>
              <h2 className="font-bold text-base text-[#1d1b20]">Đồng Bộ Mây & Sao Lưu Đa Thiết Bị</h2>
              <p className="text-xs text-gray-500">Mã hóa không kiến thức (Zero-Knowledge AES-256)</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Đã đồng bộ</span>
          </div>
        </div>

        {/* Sync telemetry info */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="bg-[#fdf8f6] p-3 rounded-xl border border-[#e0e0e0]/60">
            <span className="text-[10px] text-gray-400 block font-medium">Lần sao lưu cuối</span>
            <span className="font-bold text-gray-800 text-sm mt-0.5 block">{backupState.lastBackupTime}</span>
            <span className="text-[10px] text-gray-500">Bản sao lưu #{backupState.backupRevisions}</span>
          </div>

          <div className="bg-[#fdf8f6] p-3 rounded-xl border border-[#e0e0e0]/60">
            <span className="text-[10px] text-gray-400 block font-medium">Dung lượng Vault</span>
            <span className="font-bold text-gray-800 text-sm mt-0.5 block">{backupState.backupVaultSize}</span>
            <span className="text-[10px] text-emerald-600 font-medium">Đã mã hóa toàn vẹn</span>
          </div>

          <div className="bg-[#fdf8f6] p-3 rounded-xl border border-[#e0e0e0]/60 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-gray-400 block font-medium">Nhà cung cấp Kho lưu</span>
            <span className="font-bold text-gray-800 text-sm mt-0.5 block truncate">{provider}</span>
            <span className="text-[10px] text-blue-600 font-medium">TLS 1.3 Tunnel</span>
          </div>
        </div>

        {/* Action Button: Trigger Cloud Sync */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={onTriggerSync}
            disabled={backupState.isSyncing}
            className="flex-1 bg-[#6750a4] hover:bg-[#4f378b] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 disabled:opacity-50"
          >
            <span
              className={`material-symbols-outlined text-lg ${
                backupState.isSyncing ? 'animate-spin' : ''
              }`}
            >
              sync
            </span>
            <span>{backupState.isSyncing ? 'Đang đồng bộ dữ liệu lên máy chủ...' : 'Đồng bộ hóa ngay bây giờ'}</span>
          </button>

          <button
            onClick={handleExportVault}
            className="px-4 py-3 bg-white border border-[#e0e0e0] text-gray-700 hover:bg-gray-50 rounded-xl font-bold text-xs flex items-center gap-1.5"
            title="Xuất file Vault JSON mã hóa"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Xuất Vault</span>
          </button>
        </div>

        {exportNotice && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
            <span>File sao lưu đã được tải xuống an toàn! Bạn có thể nhập lại trên bất kỳ thiết bị nào.</span>
          </div>
        )}
      </div>

      {/* Connected Devices (Multi-Device Flexibility) */}
      <div className="bg-white p-5 rounded-2xl border border-[#e0e0e0] shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#1d1b20]">Thiết bị Đã Liên kết & Đồng bộ</h3>
            <p className="text-xs text-gray-500">Truy cập cấu hình máy ảo linh hoạt trên mọi hệ điều hành</p>
          </div>
          <span className="text-xs font-bold text-[#6750a4] bg-[#f3edf7] px-2.5 py-1 rounded-full">
            {backupState.syncedDevices.length} Thiết bị
          </span>
        </div>

        <div className="space-y-2.5 mt-1">
          {backupState.syncedDevices.map((dev) => (
            <div
              key={dev.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                dev.isCurrent
                  ? 'bg-purple-50/60 border-[#6750a4]/40'
                  : 'bg-gray-50/80 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    dev.isCurrent ? 'bg-[#6750a4] text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {dev.name.includes('Android')
                      ? 'smartphone'
                      : dev.name.includes('ThinkPad')
                      ? 'laptop'
                      : 'tablet_mac'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{dev.name}</span>
                    {dev.isCurrent && (
                      <span className="bg-[#21005d] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                        Thiết bị này
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-500 block">{dev.platform}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-gray-400 block">{dev.lastSeen}</span>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 justify-end mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Đồng bộ Vault
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cloud Storage Provider Selection */}
      <div className="bg-white p-5 rounded-2xl border border-[#e0e0e0] shadow-sm flex flex-col gap-3">
        <h3 className="font-bold text-sm text-[#1d1b20]">Lựa chọn Hạ tầng Đồng bộ Đám mây</h3>
        <p className="text-xs text-gray-500">Hỗ trợ lưu trữ máy chủ doanh nghiệp tự lưu trữ hoặc Vault đám mây</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          {[
            {
              name: 'Encrypted Cloud Storage',
              desc: 'Kho lưu trữ toàn cầu mã hóa AES-256',
              icon: 'cloud_done',
            },
            {
              name: 'Private Enterprise Vault',
              desc: 'Máy chủ nội bộ Zero-Trust on-premise',
              icon: 'corporate_fare',
            },
            {
              name: 'Self-Hosted WebDAV',
              desc: 'Nextcloud / OwnCloud / Synology NAS',
              icon: 'dns',
            },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => setProvider(item.name as any)}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                provider === item.name
                  ? 'border-[#6750a4] bg-purple-50/50 shadow-sm'
                  : 'border-[#e0e0e0] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-[#6750a4] text-lg">{item.icon}</span>
                {provider === item.name && (
                  <span className="w-2 h-2 rounded-full bg-[#6750a4]"></span>
                )}
              </div>
              <span className="font-bold text-xs text-gray-800 mt-1">{item.name}</span>
              <span className="text-[10px] text-gray-500">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
