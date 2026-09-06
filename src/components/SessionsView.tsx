import React, { useState } from 'react';
import { VMConnection, ProtocolType } from '../types';

interface SessionsViewProps {
  connections: VMConnection[];
  onConnect: (vm: VMConnection) => void;
  onEdit: (vm: VMConnection) => void;
  onDelete: (id: string) => void;
  onNewSession: () => void;
  searchQuery: string;
}

export const SessionsView: React.FC<SessionsViewProps> = ({
  connections,
  onConnect,
  onEdit,
  onDelete,
  onNewSession,
  searchQuery,
}) => {
  const [filterProtocol, setFilterProtocol] = useState<'ALL' | ProtocolType>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'live' | 'idle'>('ALL');

  const filtered = connections.filter((vm) => {
    const matchesSearch =
      vm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vm.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vm.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vm.username.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProtocol = filterProtocol === 'ALL' || vm.protocol === filterProtocol;
    const matchesStatus = filterStatus === 'ALL' || vm.status === filterStatus;

    return matchesSearch && matchesProtocol && matchesStatus;
  });

  const getOsIcon = (vm: VMConnection) => {
    switch (vm.osType) {
      case 'windows':
        return 'desktop_windows';
      case 'ubuntu':
      case 'debian':
      case 'kali':
        return 'terminal';
      case 'macos':
        return 'laptop_mac';
      default:
        return 'dvr';
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto">
      {/* Filter and Quick Chips */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          <button
            onClick={() => setFilterProtocol('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              filterProtocol === 'ALL'
                ? 'bg-[#6750a4] text-white shadow-sm'
                : 'bg-white text-gray-700 border border-[#e0e0e0] hover:bg-gray-50'
            }`}
          >
            Tất cả ({connections.length})
          </button>
          <button
            onClick={() => setFilterProtocol('RDP')}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
              filterProtocol === 'RDP'
                ? 'bg-[#6750a4] text-white shadow-sm'
                : 'bg-white text-gray-700 border border-[#e0e0e0] hover:bg-gray-50'
            }`}
          >
            <span className="material-symbols-outlined text-sm">desktop_windows</span>
            RDP ({connections.filter((c) => c.protocol === 'RDP').length})
          </button>
          <button
            onClick={() => setFilterProtocol('VNC')}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
              filterProtocol === 'VNC'
                ? 'bg-[#6750a4] text-white shadow-sm'
                : 'bg-white text-gray-700 border border-[#e0e0e0] hover:bg-gray-50'
            }`}
          >
            <span className="material-symbols-outlined text-sm">terminal</span>
            VNC ({connections.filter((c) => c.protocol === 'VNC').length})
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterStatus(filterStatus === 'live' ? 'ALL' : 'live')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border ${
              filterStatus === 'live'
                ? 'bg-green-50 border-green-400 text-green-700 font-bold'
                : 'bg-white border-[#e0e0e0] text-gray-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Chỉ Live
          </button>
        </div>
      </div>

      {/* Active Connections List header */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Danh sách máy ảo & Phiên làm việc
          </h2>
          <span className="text-[11px] text-gray-400 font-medium">
            {filtered.length} máy chủ sẵn sàng
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-[#d0c9d6] p-8 flex flex-col items-center justify-center text-center gap-2">
            <span className="material-symbols-outlined text-4xl text-gray-400">
              desktop_access_disabled
            </span>
            <p className="text-sm font-semibold text-gray-700">Không tìm thấy máy ảo phù hợp</p>
            <p className="text-xs text-gray-500 max-w-xs">
              Thử thay đổi từ khóa tìm kiếm hoặc tạo phiên kết nối an toàn mới.
            </p>
            <button
              onClick={onNewSession}
              className="mt-2 text-xs font-semibold text-[#6750a4] hover:underline"
            >
              + Thêm máy ảo mới
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((vm) => (
              <div
                key={vm.id}
                className="bg-white p-4 rounded-2xl border border-[#e0e0e0] flex flex-col gap-3 shadow-sm hover:border-[#6750a4] transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    onClick={() => onConnect(vm)}
                    className="w-12 h-12 bg-[#f3edf7] rounded-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    title="Nhấn để kết nối ngay"
                  >
                    <span className="material-symbols-outlined text-[#6750a4] text-2xl">
                      {getOsIcon(vm)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onConnect(vm)}>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-base text-[#1d1b20] truncate">{vm.name}</h3>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f3edf7] text-[#6750a4]">
                        {vm.protocol}
                      </span>
                      {vm.mfaRequired && (
                        <span
                          className="material-symbols-outlined text-xs text-amber-600"
                          title="Yêu cầu xác thực MFA"
                        >
                          lock
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {vm.protocol} • {vm.host}:{vm.port} • {vm.latencyMs}ms
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          vm.status === 'live'
                            ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                            : vm.status === 'idle'
                            ? 'bg-amber-400'
                            : 'bg-gray-400'
                        }`}
                      ></span>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          vm.status === 'live'
                            ? 'text-green-600'
                            : vm.status === 'idle'
                            ? 'text-amber-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {vm.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {vm.encryptionSuite.split('•')[0].trim()}
                    </span>
                  </div>
                </div>

                {/* Technical badges: Multi-version & Security details */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-medium text-gray-700">
                      {vm.rdpVersion || vm.vncVersion}
                    </span>
                    <span className="bg-[#e8def8] text-[#21005d] px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">security</span>
                      E2EE Verified
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onConnect(vm)}
                      className="px-3 py-1 bg-[#6750a4] text-white rounded-lg font-semibold text-xs flex items-center gap-1 hover:bg-[#4f378b] active:scale-95 transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm">play_arrow</span>
                      Kết nối
                    </button>
                    <button
                      onClick={() => onEdit(vm)}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                      title="Cấu hình máy ảo"
                    >
                      <span className="material-symbols-outlined text-base">settings</span>
                    </button>
                    <button
                      onClick={() => onDelete(vm.id)}
                      className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                      title="Xóa máy ảo"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary Action Button: "New Secure Session" */}
      <div className="flex justify-center pt-2 pb-2">
        <button
          onClick={onNewSession}
          className="bg-[#6750a4] text-white px-8 py-3.5 rounded-full flex items-center gap-2.5 shadow-lg active:bg-[#4f378b] hover:shadow-xl transition-all font-semibold active:scale-98"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          <span className="text-sm">Tạo Phiên Máy Ảo Mới</span>
        </button>
      </div>
    </div>
  );
};
