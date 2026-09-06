import React, { useState } from 'react';
import { AdminStats, SecurityPolicy, AuditLog } from '../types';

interface AdminConsoleViewProps {
  stats: AdminStats;
  policy: SecurityPolicy;
  onUpdatePolicy: (newPolicy: SecurityPolicy) => void;
  logs: AuditLog[];
  onClearLogs?: () => void;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({
  stats,
  policy,
  onUpdatePolicy,
  logs,
}) => {
  const [logFilter, setLogFilter] = useState<'ALL' | 'warning' | 'security' | 'success'>('ALL');
  const [logSearch, setLogSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'logs' | 'versions'>('overview');

  const handleToggle = (key: keyof SecurityPolicy) => {
    onUpdatePolicy({
      ...policy,
      [key]: !policy[key],
    });
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.event.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.user.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase());
    const matchesFilter = logFilter === 'ALL' || log.severity === logFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
      {/* Sub-tabs for Admin */}
      <div className="flex items-center gap-2 border-b border-[#e0e0e0] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'overview'
              ? 'bg-[#6750a4] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="material-symbols-outlined text-sm">dashboard</span>
          Tổng quan & Chỉ số
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'policies'
              ? 'bg-[#6750a4] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="material-symbols-outlined text-sm">policy</span>
          Chính sách Bảo mật
        </button>
        <button
          onClick={() => setActiveTab('versions')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'versions'
              ? 'bg-[#6750a4] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="material-symbols-outlined text-sm">layers</span>
          Đa Phiên Bản RDP/VNC
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'logs'
              ? 'bg-[#6750a4] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="material-symbols-outlined text-sm">history</span>
          Nhật ký Kiểm toán ({logs.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="flex flex-col gap-4">
          {/* Top 4 Metric Cards from Design HTML */}
          <div>
            <h2 className="text-xs font-bold text-gray-500 mb-2 px-1 uppercase tracking-widest">
              Bảng Điều Khiển Quản Trị Tập Trung
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-[#e0e0e0] flex flex-col gap-1 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#f3edf7] flex items-center justify-center text-[#6750a4] mb-1">
                  <span className="material-symbols-outlined text-xl">group</span>
                </div>
                <span className="text-2xl font-bold text-[#1d1b20]">{stats.totalUsers}</span>
                <span className="text-xs text-gray-500">Người dùng hệ thống</span>
                <span className="text-[10px] text-green-600 font-semibold mt-1">✓ 100% RBAC Kích hoạt</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#e0e0e0] flex flex-col gap-1 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#d3e3fd] flex items-center justify-center text-[#001d35] mb-1">
                  <span className="material-symbols-outlined text-xl">cloud_sync</span>
                </div>
                <span className="text-2xl font-bold text-[#1d1b20]">Đồng bộ</span>
                <span className="text-xs text-gray-500">Mây: 2 phút trước</span>
                <span className="text-[10px] text-blue-600 font-semibold mt-1">✓ 3 Thiết bị đã liên kết</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#e0e0e0] flex flex-col gap-1 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-1">
                  <span className="material-symbols-outlined text-xl">verified_user</span>
                </div>
                <span className="text-2xl font-bold text-[#1d1b20]">{stats.complianceScore}%</span>
                <span className="text-xs text-gray-500">Điểm tuân thủ Zero-Trust</span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1">Mức bảo mật: Tối ưu</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#e0e0e0] flex flex-col gap-1 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 mb-1">
                  <span className="material-symbols-outlined text-xl">stream</span>
                </div>
                <span className="text-2xl font-bold text-[#1d1b20]">{stats.activeConnections}</span>
                <span className="text-xs text-gray-500">Phiên E2EE Trực tiếp</span>
                <span className="text-[10px] text-purple-600 font-semibold mt-1">Băng thông: {stats.e2eeBandwidthMbps} Mb/s</span>
              </div>
            </div>
          </div>

          {/* Quick Security Posture Banner */}
          <div className="bg-gradient-to-r from-[#21005d] to-[#6750a4] text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">enhanced_encryption</span>
              </div>
              <div>
                <h3 className="font-bold text-sm">Chế độ Bảo vệ Tối đa (High-Security Posture)</h3>
                <p className="text-xs text-white/80">
                  Mã hóa đầu cuối E2EE bắt buộc và xác thực TOTP/Biometric được thực thi trên toàn bộ hạ tầng máy ảo.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('policies')}
              className="px-3.5 py-1.5 bg-white text-[#21005d] rounded-full text-xs font-bold hover:bg-white/90 shrink-0"
            >
              Cấu hình
            </button>
          </div>

          {/* User Directory Summary */}
          <div className="bg-white p-4 rounded-2xl border border-[#e0e0e0] shadow-sm">
            <h3 className="font-bold text-sm text-[#1d1b20] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#6750a4]">manage_accounts</span>
              Phân quyền Người dùng & Vai trò (RBAC)
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#6750a4] text-white font-bold flex items-center justify-center text-[10px]">
                    AD
                  </div>
                  <div>
                    <span className="font-bold text-gray-800">admin@corp.internal</span>
                    <span className="text-[10px] text-gray-400 block">Thiết bị: Android Workstation / Web Client</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#eaddff] text-[#21005d] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Super Admin
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                    SO
                  </div>
                  <div>
                    <span className="font-bold text-gray-800">secops-lead@internal.io</span>
                    <span className="text-[10px] text-gray-400 block">Thiết bị: SecOps ThinkPad X1</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    SecOps Auditor
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                    DO
                  </div>
                  <div>
                    <span className="font-bold text-gray-800">devops-cluster-bot</span>
                    <span className="text-[10px] text-gray-400 block">Thiết bị: API Automation Key</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    DevOps Node
                  </span>
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Policies Tab */}
      {activeTab === 'policies' && (
        <div className="bg-white p-5 rounded-2xl border border-[#e0e0e0] shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-base text-[#1d1b20]">Chính sách Bảo mật Trung tâm</h3>
            <p className="text-xs text-gray-500">
              Kiểm soát quy định truy cập máy ảo từ xa, bảo vệ rò rỉ dữ liệu và bắt buộc mã hóa
            </p>
          </div>

          <div className="space-y-3 divide-y divide-gray-100">
            {/* Policy 1: Require MFA */}
            <div className="pt-3 flex items-center justify-between">
              <div className="max-w-md">
                <span className="font-bold text-xs text-gray-800 block">
                  Bắt buộc Xác thực Đa yếu tố (MFA / 2FA)
                </span>
                <span className="text-[11px] text-gray-500">
                  Yêu cầu mã số TOTP 6 chữ số hoặc sinh trắc học trước khi mở bất kỳ phiên RDP hoặc VNC nào.
                </span>
              </div>
              <button
                onClick={() => handleToggle('enforceMfaForAll')}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  policy.enforceMfaForAll ? 'bg-[#6750a4]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    policy.enforceMfaForAll ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Policy 2: Enforce E2EE */}
            <div className="pt-3 flex items-center justify-between">
              <div className="max-w-md">
                <span className="font-bold text-xs text-gray-800 block">
                  Bắt buộc Mã hóa Đầu Cuối (E2EE TLS 1.3 / AES-256-GCM)
                </span>
                <span className="text-[11px] text-gray-500">
                  Từ chối các kết nối không có mã hóa hoặc sử dụng chứng chỉ không đáng tin cậy.
                </span>
              </div>
              <button
                onClick={() => handleToggle('enforceTls13E2ee')}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  policy.enforceTls13E2ee ? 'bg-[#6750a4]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    policy.enforceTls13E2ee ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Policy 3: Block Clipboard Export */}
            <div className="pt-3 flex items-center justify-between">
              <div className="max-w-md">
                <span className="font-bold text-xs text-gray-800 block">
                  Chặn Sao chép Clipboard ra ngoài (DLP Sandbox)
                </span>
                <span className="text-[11px] text-gray-500">
                  Ngăn chặn trích xuất dữ liệu nội bộ từ máy ảo về bảng nhớ tạm máy cá nhân.
                </span>
              </div>
              <button
                onClick={() => handleToggle('blockClipboardExport')}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  policy.blockClipboardExport ? 'bg-[#6750a4]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    policy.blockClipboardExport ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Policy 4: Recording */}
            <div className="pt-3 flex items-center justify-between">
              <div className="max-w-md">
                <span className="font-bold text-xs text-gray-800 block">
                  Kiểm toán & Ghi hình Phiên làm việc (Session Audit)
                </span>
                <span className="text-[11px] text-gray-500">
                  Ghi lại nhật ký phím, kết nối và lưu trữ bằng chứng phục vụ tuân thủ ISO/SOC2.
                </span>
              </div>
              <button
                onClick={() => handleToggle('sessionRecordingAudit')}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  policy.sessionRecordingAudit ? 'bg-[#6750a4]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    policy.sessionRecordingAudit ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-version Matrix Tab */}
      {activeTab === 'versions' && (
        <div className="bg-white p-5 rounded-2xl border border-[#e0e0e0] shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-base text-[#1d1b20]">Hỗ trợ Đa Phiên Bản Giao thức (Multi-Version)</h3>
            <p className="text-xs text-gray-500">
              Cấu hình khả năng tương thích ngược và tối ưu hóa hiệu năng cho từng phiên bản máy ảo RDP & VNC
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* RDP Versions */}
            <div className="border border-[#e0e0e0] rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#6750a4]">desktop_windows</span>
                <h4 className="font-bold text-xs text-gray-800">Phiên bản Giao thức RDP</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-green-900 block">RDP 10.11 / 10.4 (Mặc định)</span>
                    <span className="text-[10px] text-green-700">Windows 11 / Server 2022 • H.264 AVC / RemoteFX</span>
                  </div>
                  <span className="text-[10px] font-bold bg-green-600 text-white px-2 py-0.5 rounded">Tối ưu nhất</span>
                </div>

                <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-gray-800 block">RDP 8.1 (Tương thích)</span>
                    <span className="text-[10px] text-gray-500">Windows Server 2012 R2 • Dynamic Graphics</span>
                  </div>
                  <span className="text-[10px] font-medium bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Hỗ trợ</span>
                </div>

                <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-gray-800 block">RDP 7.0 (Legacy)</span>
                    <span className="text-[10px] text-gray-500">Windows 7 / Server 2008 R2 (Chế độ tương thích cũ)</span>
                  </div>
                  <span className="text-[10px] font-medium bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Legacy</span>
                </div>
              </div>
            </div>

            {/* VNC Versions */}
            <div className="border border-[#e0e0e0] rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#6750a4]">terminal</span>
                <h4 className="font-bold text-xs text-gray-800">Phiên bản Giao thức VNC (RFB)</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-green-900 block">RFB 3.8 + TLS 1.3 (VeNCrypt)</span>
                    <span className="text-[10px] text-green-700">Mã hóa E2EE đường truyền, noVNC WebSockets</span>
                  </div>
                  <span className="text-[10px] font-bold bg-green-600 text-white px-2 py-0.5 rounded">Khuyên dùng</span>
                </div>

                <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-gray-800 block">TightVNC 2.8 (Nén Không Mất Dữ Liệu)</span>
                    <span className="text-[10px] text-gray-500">Nén đồ họa băng thông thấp, tối ưu di động</span>
                  </div>
                  <span className="text-[10px] font-medium bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Hỗ trợ</span>
                </div>

                <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-gray-800 block">RFB 3.7 / UltraVNC Enterprise</span>
                    <span className="text-[10px] text-gray-500">Máy ảo Linux cũ, Proxmox và KVM noVNC console</span>
                  </div>
                  <span className="text-[10px] font-medium bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Tương thích</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white p-5 rounded-2xl border border-[#e0e0e0] shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-base text-[#1d1b20]">Nhật ký Kiểm toán An ninh (Audit Trail)</h3>
              <p className="text-xs text-gray-500">Lưu lại mọi thao tác kết nối, thay đổi cấu hình và xác thực MFA</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Tìm kiếm sự kiện, IP..."
                className="px-3 py-1.5 border border-[#e0e0e0] rounded-xl text-xs focus:outline-none focus:border-[#6750a4]"
              />
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value as any)}
                className="px-2.5 py-1.5 border border-[#e0e0e0] rounded-xl text-xs bg-white focus:outline-none"
              >
                <option value="ALL">Tất cả mức độ</option>
                <option value="success">Thành công</option>
                <option value="warning">Cảnh báo</option>
                <option value="security">An ninh</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/70 flex items-start justify-between gap-2 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      log.severity === 'success'
                        ? 'bg-green-100 text-green-700'
                        : log.severity === 'warning'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {log.severity === 'success'
                        ? 'verified'
                        : log.severity === 'warning'
                        ? 'warning'
                        : 'info'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{log.event}</span>
                      <span className="text-[10px] text-gray-400 font-mono">({log.ipAddress})</span>
                    </div>
                    <p className="text-gray-600 text-[11px] mt-0.5">{log.details}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      Người thực hiện: {log.user}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-gray-400">{log.timestamp}</span>
                  {log.e2eeValidated && (
                    <span className="text-[9px] text-purple-700 font-semibold block mt-0.5 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                      E2EE Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
