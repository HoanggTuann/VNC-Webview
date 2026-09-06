import React, { useState } from 'react';
import { VMConnection, ProtocolType, RdpVersion, VncVersion, ChromiumEngineProfile, OSType } from '../types';

interface ConnectionModalProps {
  vm: VMConnection | null; // If null, create mode
  isOpen: boolean;
  onClose: () => void;
  onSave: (vm: VMConnection) => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  vm,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(vm?.name || '');
  const [host, setHost] = useState(vm?.host || '192.168.1.');
  const [port, setPort] = useState(vm?.port || 3389);
  const [protocol, setProtocol] = useState<ProtocolType>(vm?.protocol || 'RDP');
  const [rdpVersion, setRdpVersion] = useState<RdpVersion>(
    vm?.rdpVersion || 'RDP 10.11 (Win11/Server 2022)'
  );
  const [vncVersion, setVncVersion] = useState<VncVersion>(
    vm?.vncVersion || 'RFB 3.8 (TLS 1.3 / VeNCrypt)'
  );
  const [engineProfile, setEngineProfile] = useState<ChromiumEngineProfile>(
    vm?.engineProfile || 'Chromium 128 (Hardware Accelerated + WebGL)'
  );
  const [osType, setOsType] = useState<OSType>(vm?.osType || 'windows');
  const [username, setUsername] = useState(vm?.username || 'Administrator');
  const [password, setPassword] = useState('');
  const [mfaRequired, setMfaRequired] = useState(vm?.mfaRequired ?? true);
  const [description, setDescription] = useState(vm?.description || '');
  const [gatewayUrl, setGatewayUrl] = useState(vm?.gatewayUrl || '');

  // Update default port and OS type when protocol changes
  const handleProtocolChange = (newProto: ProtocolType) => {
    setProtocol(newProto);
    if (newProto === 'RDP') {
      setPort(3389);
      if (osType !== 'windows') setOsType('windows');
    } else {
      setPort(5900);
      if (osType === 'windows') setOsType('ubuntu');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !host.trim()) return;

    const newVm: VMConnection = {
      id: vm?.id || `vm-${Date.now()}`,
      name: name.trim(),
      host: host.trim(),
      port: Number(port),
      protocol,
      rdpVersion: protocol === 'RDP' ? rdpVersion : undefined,
      vncVersion: protocol === 'VNC' ? vncVersion : undefined,
      engineProfile,
      status: vm?.status || 'idle',
      latencyMs: vm?.latencyMs || Math.floor(10 + Math.random() * 20),
      encryptionSuite: 'AES-256-GCM • TLS 1.3',
      e2eeFingerprint: vm?.e2eeFingerprint || `SHA256:${Array.from({ length: 8 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(':')}`,
      mfaRequired,
      osType,
      username: username.trim(),
      description: description.trim() || 'Máy ảo điều khiển từ xa trên nhân Chromium',
      lastConnected: vm?.lastConnected || 'Mới tạo',
      gatewayUrl: gatewayUrl.trim() || undefined,
    };

    onSave(newVm);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl text-[#1d1b20] my-8">
        <div className="flex items-center justify-between pb-3 border-b border-[#e0e0e0]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#f3edf7] text-[#6750a4] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">
                {vm ? 'edit' : 'add_to_queue'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base">
                {vm ? 'Chỉnh Sửa Máy Ảo' : 'Tạo Kết Nối Máy Ảo Mới'}
              </h3>
              <p className="text-xs text-gray-500">
                Hỗ trợ giao thức RDP / VNC, mã hóa E2EE và xác thực MFA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-3.5 text-xs">
          {/* Protocol Switcher */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">Giao thức Kết nối Máy ảo:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleProtocolChange('RDP')}
                className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                  protocol === 'RDP'
                    ? 'bg-[#6750a4] text-white border-[#6750a4] shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className="material-symbols-outlined text-lg">desktop_windows</span>
                <span>RDP (Remote Desktop)</span>
              </button>

              <button
                type="button"
                onClick={() => handleProtocolChange('VNC')}
                className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                  protocol === 'VNC'
                    ? 'bg-[#6750a4] text-white border-[#6750a4] shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className="material-symbols-outlined text-lg">terminal</span>
                <span>VNC (Virtual Network Computing)</span>
              </button>
            </div>
          </div>

          {/* VM Name & OS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Tên máy ảo:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Windows Server 2022..."
                className="w-full px-3 py-2 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#6750a4]"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Hệ điều hành khách (OS):</label>
              <select
                value={osType}
                onChange={(e) => setOsType(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#6750a4] bg-white"
              >
                <option value="windows">Microsoft Windows</option>
                <option value="ubuntu">Ubuntu Linux</option>
                <option value="debian">Debian MicroVM</option>
                <option value="kali">Kali Linux SecOps</option>
                <option value="macos">macOS Apple Remote</option>
              </select>
            </div>
          </div>

          {/* Host & Port */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-gray-700 font-bold mb-1">Địa chỉ IP / Hostname máy chủ:</label>
              <input
                type="text"
                required
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="192.168.1.100 hoặc vm.domain.internal"
                className="w-full px-3 py-2 border border-[#e0e0e0] rounded-xl font-mono focus:outline-none focus:border-[#6750a4]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Cổng (Port):</label>
              <input
                type="number"
                required
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#e0e0e0] rounded-xl font-mono focus:outline-none focus:border-[#6750a4]"
              />
            </div>
          </div>

          {/* Multi-version selection */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">
              Hỗ trợ Phiên bản Giao thức ({protocol}):
            </label>
            {protocol === 'RDP' ? (
              <select
                value={rdpVersion}
                onChange={(e) => setRdpVersion(e.target.value as RdpVersion)}
                className="w-full px-3 py-2 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#6750a4] bg-white"
              >
                <option value="RDP 10.11 (Win11/Server 2022)">RDP 10.11 (Win11/Server 2022 - Tối ưu nhất)</option>
                <option value="RDP 10.4 (Win10/Server 2019)">RDP 10.4 (Win10/Server 2019)</option>
                <option value="RDP 8.1 (Server 2012 R2)">RDP 8.1 (Server 2012 R2 - RemoteFX)</option>
                <option value="RDP 7.0 (Legacy RemoteFX)">RDP 7.0 (Legacy Windows 7)</option>
              </select>
            ) : (
              <select
                value={vncVersion}
                onChange={(e) => setVncVersion(e.target.value as VncVersion)}
                className="w-full px-3 py-2 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#6750a4] bg-white"
              >
                <option value="RFB 3.8 (TLS 1.3 / VeNCrypt)">RFB 3.8 (TLS 1.3 / VeNCrypt - Khuyên dùng)</option>
                <option value="TightVNC 2.8 (Lossless Compression)">TightVNC 2.8 (Nén lossless cho di động)</option>
                <option value="RFB 3.7 (Standard noVNC)">RFB 3.7 (Standard noVNC WebSocket)</option>
                <option value="UltraVNC Enterprise (Dual Auth)">UltraVNC Enterprise (Dual Auth)</option>
              </select>
            )}
          </div>

          {/* Chromium Engine Profile */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">Nhân Chromium & Trình kết xuất (Engine Profile):</label>
            <select
              value={engineProfile}
              onChange={(e) => setEngineProfile(e.target.value as ChromiumEngineProfile)}
              className="w-full px-3 py-2 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#6750a4] bg-white"
            >
              <option value="Chromium 128 (Hardware Accelerated + WebGL)">
                Chromium 128 (Tăng tốc phần cứng GPU + WebGL 2.0 - 60 FPS)
              </option>
              <option value="Chromium 114 (Standard WebSocket Offscreen)">
                Chromium 114 (Standard WebSocket Offscreen Canvas)
              </option>
              <option value="Chromium Legacy (Low Bandwidth Compat)">
                Chromium Legacy (Băng thông thấp / Tương thích máy yếu)
              </option>
            </select>
          </div>

          {/* Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Tên đăng nhập:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Administrator hoặc root"
                className="w-full px-3 py-2 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#6750a4]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Mật khẩu (Mã hóa trước khi lưu):</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#6750a4]"
              />
            </div>
          </div>

          {/* Security & MFA toggle */}
          <div className="p-3 bg-[#fdf8f6] rounded-xl border border-[#e0e0e0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#6750a4]">lock_clock</span>
              <div>
                <span className="font-bold text-gray-800 block">Bắt buộc Xác thực MFA 2FA</span>
                <span className="text-[10px] text-gray-500">Yêu cầu mã TOTP trước khi vào màn hình máy ảo</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMfaRequired(!mfaRequired)}
              className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                mfaRequired ? 'bg-[#6750a4]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  mfaRequired ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#e0e0e0] text-gray-700 font-semibold hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-[#6750a4] hover:bg-[#4f378b] text-white px-6 py-2 rounded-full font-bold shadow-md transition-all active:scale-98"
            >
              {vm ? 'Lưu Thay Đổi' : 'Tạo Kết Nối Máy Ảo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
