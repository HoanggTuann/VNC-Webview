import React, { useState, useEffect, useRef } from 'react';
import { VMConnection } from '../types';

interface VMViewerProps {
  vm: VMConnection | null;
  onDisconnect: () => void;
  onSwitchSession: () => void;
}

export const VMViewer: React.FC<VMViewerProps> = ({
  vm,
  onDisconnect,
  onSwitchSession,
}) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [scaleMode, setScaleMode] = useState<'fit' | '100%' | 'stretch'>('fit');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showE2eeDetails, setShowE2eeDetails] = useState(false);
  const [showClipboardModal, setShowClipboardModal] = useState(false);
  const [clipboardText, setClipboardText] = useState('https://internal.cluster/tokens/auth-key');
  const [activeWindow, setActiveWindow] = useState<'powershell' | 'taskmgr' | 'none'>('powershell');
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'SecureLink Pro v3.2.0 (Chromium Web Engine)',
    'E2EE Handshake completed: AES-256-GCM / Ephemeral ECDH X25519',
    'Session established with remote node.',
    vm?.protocol === 'RDP'
      ? 'Microsoft Windows [Version 10.0.20348.2227] (c) Microsoft Corp.'
      : 'Linux dev-cluster-node-04 6.5.0-generic x86_64 GNU/Linux',
    'Type "help", "status", "ping", "top", or "e2ee" for diagnostic commands.',
  ]);
  const [mousePos, setMousePos] = useState({ x: 380, y: 220 });
  const [fps, setFps] = useState(60);
  const [bandwidth, setBandwidth] = useState(14.8);
  const [remoteClock, setRemoteClock] = useState('');

  // Clock updates
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setRemoteClock(
        now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Frame rate jitter simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setFps(Math.floor(58 + Math.random() * 4));
      setBandwidth(+(14 + Math.random() * 1.5).toFixed(1));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim();
    const newLogs = [...terminalLogs, `$ ${cmd}`];

    switch (cmd.toLowerCase()) {
      case 'help':
        newLogs.push('Available commands: status, ping, top, e2ee, clear, mfa, date, ifconfig');
        break;
      case 'status':
        newLogs.push(
          `Node: ${vm?.name} | Protocol: ${vm?.protocol} | Cipher: ${vm?.encryptionSuite} | Latency: ${vm?.latencyMs}ms`
        );
        break;
      case 'ping':
        newLogs.push(`64 bytes from ${vm?.host}: icmp_seq=1 ttl=64 time=${vm?.latencyMs} ms`);
        break;
      case 'top':
        newLogs.push('PID 1 (init): CPU 0.2%, PID 412 (guacd-rdp): CPU 2.1%, PID 992 (k3s): CPU 5.4%');
        break;
      case 'e2ee':
        newLogs.push(`E2EE Fingerprint: ${vm?.e2eeFingerprint} (Verified OK)`);
        newLogs.push('Channel Status: Tamper-proof Authenticated Stream (AES-256-GCM)');
        break;
      case 'clear':
        setTerminalLogs(['Terminal cleared.']);
        setTerminalInput('');
        return;
      case 'mfa':
        newLogs.push('MFA Status: Enforced (TOTP RFC 6238 active on this session)');
        break;
      case 'date':
        newLogs.push(new Date().toString());
        break;
      default:
        newLogs.push(`Command "${cmd}" executed successfully on remote machine.`);
    }

    setTerminalLogs(newLogs);
    setTerminalInput('');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setMousePos({ x, y });
  };

  if (!vm) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-[#f3edf7] rounded-2xl flex items-center justify-center text-[#6750a4] mb-3">
          <span className="material-symbols-outlined text-4xl">desktop_windows</span>
        </div>
        <h2 className="text-lg font-bold text-[#1d1b20]">Chưa chọn máy ảo</h2>
        <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">
          Vui lòng chọn một máy ảo từ danh sách kết nối RDP / VNC để khởi chạy phiên làm việc trên nhân Chromium bảo mật.
        </p>
        <button
          onClick={onSwitchSession}
          className="bg-[#6750a4] text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-md hover:bg-[#4f378b]"
        >
          <span className="material-symbols-outlined text-base">grid_view</span>
          Chọn máy ảo kết nối
        </button>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col bg-[#1e1b24] overflow-hidden ${fullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Top Stream Status & Control Bar */}
      <div className="bg-[#2b2735] px-3 py-1.5 flex items-center justify-between border-b border-[#3c364c] text-white text-xs z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchSession}
            className="p-1 rounded hover:bg-white/10 text-gray-300 hover:text-white"
            title="Quay lại danh sách"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold text-white text-xs truncate max-w-[130px]">
              {vm.name}
            </span>
          </div>
          <span className="bg-[#6750a4] text-white text-[10px] px-1.5 py-0.2 rounded font-mono">
            {vm.protocol}
          </span>
          <button
            onClick={() => setShowE2eeDetails(true)}
            className="flex items-center gap-1 bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded text-[10px] hover:bg-emerald-800/80 transition-colors"
          >
            <span className="material-symbols-outlined text-xs">lock</span>
            <span>E2EE Active</span>
          </button>
        </div>

        {/* Telemetry stats */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-gray-300 font-mono">
          <span className="flex items-center gap-1" title="Độ trễ truyền phát">
            <span className="material-symbols-outlined text-xs text-green-400">speed</span>
            {vm.latencyMs}ms
          </span>
          <span className="flex items-center gap-1" title="Khung hình mỗi giây">
            <span className="material-symbols-outlined text-xs text-blue-400">filter_drama</span>
            {fps} FPS
          </span>
          <span className="flex items-center gap-1" title="Băng thông mã hóa">
            <span className="material-symbols-outlined text-xs text-purple-300">wifi</span>
            {bandwidth} Mb/s
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowKeyboard(!showKeyboard)}
            className={`p-1.5 rounded transition-colors ${
              showKeyboard ? 'bg-[#6750a4] text-white' : 'hover:bg-white/10 text-gray-300'
            }`}
            title="Bàn phím ảo & Phím tắt"
          >
            <span className="material-symbols-outlined text-base">keyboard</span>
          </button>
          <button
            onClick={() => setShowClipboardModal(true)}
            className="p-1.5 rounded hover:bg-white/10 text-gray-300"
            title="Đồng bộ Clipboard"
          >
            <span className="material-symbols-outlined text-base">content_paste</span>
          </button>
          <button
            onClick={() => setScaleMode(scaleMode === 'fit' ? '100%' : scaleMode === '100%' ? 'stretch' : 'fit')}
            className="p-1.5 rounded hover:bg-white/10 text-gray-300 text-[10px] font-mono uppercase px-2 bg-white/5"
            title="Tỷ lệ hiển thị màn hình"
          >
            {scaleMode}
          </button>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-1.5 rounded hover:bg-white/10 text-gray-300"
            title="Toàn màn hình"
          >
            <span className="material-symbols-outlined text-base">
              {fullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
          <button
            onClick={onDisconnect}
            className="p-1.5 rounded bg-red-600/80 hover:bg-red-600 text-white flex items-center gap-1 text-[11px] px-2"
            title="Ngắt kết nối an toàn"
          >
            <span className="material-symbols-outlined text-xs">power_settings_new</span>
            <span>Ngắt</span>
          </button>
        </div>
      </div>

      {/* Special Macro Keys Bar (Ctrl+Alt+Del, Win, Alt+Tab) */}
      {showKeyboard && (
        <div className="bg-[#24202e] px-3 py-1.5 flex items-center gap-1.5 border-b border-[#3c364c] overflow-x-auto text-xs z-10 animate-fadeIn">
          <span className="text-[10px] text-gray-400 font-semibold uppercase pr-1">Macros:</span>
          <button
            onClick={() => {
              setTerminalLogs((prev) => [...prev, '[SYSTEM] Triggered Secure Attention Sequence (Ctrl+Alt+Del)']);
            }}
            className="px-2 py-0.5 rounded bg-[#373046] hover:bg-[#6750a4] text-white text-[10px] font-mono border border-white/10 active:scale-95"
          >
            Ctrl+Alt+Del
          </button>
          <button
            onClick={() => {
              setTerminalLogs((prev) => [...prev, '[SYSTEM] Windows / Super Key event emitted']);
            }}
            className="px-2 py-0.5 rounded bg-[#373046] hover:bg-[#6750a4] text-white text-[10px] font-mono border border-white/10 active:scale-95"
          >
            ⊞ Win Key
          </button>
          <button
            onClick={() => {
              setTerminalLogs((prev) => [...prev, '[SYSTEM] Alt+Tab task switch invoked']);
            }}
            className="px-2 py-0.5 rounded bg-[#373046] hover:bg-[#6750a4] text-white text-[10px] font-mono border border-white/10 active:scale-95"
          >
            Alt + Tab
          </button>
          <button
            onClick={() => {
              setTerminalLogs((prev) => [...prev, '[SYSTEM] Escape key sent']);
            }}
            className="px-2 py-0.5 rounded bg-[#373046] hover:bg-[#6750a4] text-white text-[10px] font-mono border border-white/10 active:scale-95"
          >
            Esc
          </button>
          <button
            onClick={() => {
              setTerminalLogs((prev) => [...prev, `[CLIPBOARD] Pasted: "${clipboardText.slice(0, 20)}..."`]);
            }}
            className="px-2 py-0.5 rounded bg-[#373046] hover:bg-[#6750a4] text-white text-[10px] font-mono border border-white/10 active:scale-95"
          >
            Ctrl+V (Paste)
          </button>
        </div>
      )}

      {/* Main Interactive Remote Desktop Canvas */}
      <div
        onMouseMove={handleMouseMove}
        className="flex-1 relative flex items-center justify-center bg-[#0d0c10] overflow-hidden cursor-crosshair select-none"
      >
        {/* Virtual Desktop Background Simulation */}
        <div
          className={`relative w-full h-full max-w-[1280px] max-h-[720px] shadow-2xl flex flex-col justify-between overflow-hidden border border-[#3c364c] transition-all ${
            vm.osType === 'windows'
              ? 'bg-gradient-to-br from-[#0c2444] via-[#103b6d] to-[#041226]'
              : vm.osType === 'kali'
              ? 'bg-gradient-to-br from-[#0e1621] via-[#182533] to-[#080d14]'
              : 'bg-gradient-to-br from-[#2c001e] via-[#4d0034] to-[#77216f]'
          }`}
        >
          {/* Scanline CRT overlay subtle effect */}
          <div className="absolute inset-0 scanline-overlay opacity-30 pointer-events-none"></div>

          {/* Desktop Watermark & Security indicator */}
          <div className="absolute top-3 right-4 flex flex-col items-end opacity-40 text-white font-mono text-[10px] pointer-events-none">
            <span className="font-bold tracking-widest">{vm.name.toUpperCase()}</span>
            <span>SECURE TUNNEL • CHROMIUM 128 WebGL</span>
            <span>{vm.encryptionSuite}</span>
            <span>E2EE FP: {vm.e2eeFingerprint}</span>
          </div>

          {/* Desktop Icons */}
          <div className="p-4 grid grid-flow-col grid-rows-4 gap-4 w-fit z-10">
            <button
              onClick={() => setActiveWindow('powershell')}
              className="flex flex-col items-center gap-1 w-16 p-1 rounded hover:bg-white/10 active:bg-white/20 text-white group"
            >
              <div className="w-9 h-9 bg-black/40 border border-blue-400/40 rounded-lg flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">terminal</span>
              </div>
              <span className="text-[10px] text-center text-gray-200 font-medium leading-tight drop-shadow">
                {vm.protocol === 'RDP' ? 'PowerShell' : 'Terminal'}
              </span>
            </button>

            <button
              onClick={() => setActiveWindow('taskmgr')}
              className="flex flex-col items-center gap-1 w-16 p-1 rounded hover:bg-white/10 active:bg-white/20 text-white group"
            >
              <div className="w-9 h-9 bg-black/40 border border-emerald-400/40 rounded-lg flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">monitoring</span>
              </div>
              <span className="text-[10px] text-center text-gray-200 font-medium leading-tight drop-shadow">
                Quản lý Tác vụ
              </span>
            </button>

            <button
              onClick={() => setShowE2eeDetails(true)}
              className="flex flex-col items-center gap-1 w-16 p-1 rounded hover:bg-white/10 active:bg-white/20 text-white group"
            >
              <div className="w-9 h-9 bg-black/40 border border-purple-400/40 rounded-lg flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">shield</span>
              </div>
              <span className="text-[10px] text-center text-gray-200 font-medium leading-tight drop-shadow">
                Bảo mật E2EE
              </span>
            </button>

            <button
              onClick={() => setShowClipboardModal(true)}
              className="flex flex-col items-center gap-1 w-16 p-1 rounded hover:bg-white/10 active:bg-white/20 text-white group"
            >
              <div className="w-9 h-9 bg-black/40 border border-amber-400/40 rounded-lg flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">folder_shared</span>
              </div>
              <span className="text-[10px] text-center text-gray-200 font-medium leading-tight drop-shadow">
                Chia sẻ Dữ liệu
              </span>
            </button>
          </div>

          {/* Interactive Window 1: Interactive Terminal / PowerShell */}
          {activeWindow === 'powershell' && (
            <div className="absolute top-10 left-20 right-10 bottom-16 bg-[#0c1017]/95 border border-blue-500/30 rounded-lg shadow-2xl flex flex-col overflow-hidden z-20 backdrop-blur-md">
              {/* Window Titlebar */}
              <div className="bg-[#161f2e] px-3 py-1.5 flex items-center justify-between border-b border-blue-500/20 text-gray-200 text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-blue-400">terminal</span>
                  <span className="font-mono text-[11px] font-semibold">
                    {vm.username}@{vm.host} - {vm.protocol === 'RDP' ? 'Administrator: Windows PowerShell' : 'bash terminal (Chromium Pty)'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveWindow('none')}
                    className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600"
                    title="Thu nhỏ"
                  ></button>
                  <button
                    onClick={() => setActiveWindow('none')}
                    className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600"
                    title="Đóng"
                  ></button>
                </div>
              </div>

              {/* Terminal Body */}
              <div className="flex-1 p-3 font-mono text-[11px] text-green-400 overflow-y-auto space-y-1 select-text">
                {terminalLogs.map((line, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {line}
                  </div>
                ))}
              </div>

              {/* Terminal Prompt Input Form */}
              <form onSubmit={handleCommandSubmit} className="bg-[#121924] px-3 py-2 border-t border-blue-500/20 flex items-center gap-2">
                <span className="text-blue-400 font-mono text-xs font-bold">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="Nhập lệnh điều khiển máy ảo (help, ping, top, e2ee, mfa)..."
                  className="flex-1 bg-transparent border-none text-white font-mono text-xs focus:outline-none placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-0.5 rounded text-[11px] font-mono"
                >
                  Gửi
                </button>
              </form>
            </div>
          )}

          {/* Interactive Window 2: Task Manager & Resource Monitor */}
          {activeWindow === 'taskmgr' && (
            <div className="absolute top-14 left-24 right-14 bottom-20 bg-[#161a22]/95 border border-emerald-500/30 rounded-lg shadow-2xl flex flex-col overflow-hidden z-20 backdrop-blur-md">
              <div className="bg-[#1f242e] px-3 py-1.5 flex items-center justify-between border-b border-emerald-500/20 text-gray-200 text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-emerald-400">monitoring</span>
                  <span className="font-semibold">Quản lý hiệu năng máy ảo ({vm.name})</span>
                </div>
                <button
                  onClick={() => setActiveWindow('none')}
                  className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600"
                ></button>
              </div>
              <div className="p-4 flex flex-col gap-4 text-white text-xs overflow-y-auto">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-black/30 p-2.5 rounded border border-white/10">
                    <span className="text-gray-400 text-[10px] block">CPU Node</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">14.2%</span>
                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[14%]"></div>
                    </div>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded border border-white/10">
                    <span className="text-gray-400 text-[10px] block">RAM Sử dụng</span>
                    <span className="text-lg font-bold text-blue-400 font-mono">6.4 / 32 GB</span>
                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-blue-400 h-full w-[20%]"></div>
                    </div>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded border border-white/10">
                    <span className="text-gray-400 text-[10px] block">Chromium Renderer</span>
                    <span className="text-lg font-bold text-purple-400 font-mono">WebGL v2</span>
                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-purple-400 h-full w-[95%]"></div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-300 text-xs mb-1.5">Tiến trình đang chạy</h4>
                  <div className="border border-white/10 rounded overflow-hidden text-[11px] font-mono">
                    <div className="bg-white/5 px-2.5 py-1 text-gray-400 flex justify-between border-b border-white/10">
                      <span>Tiến trình</span>
                      <span>CPU</span>
                      <span>Mã hóa E2EE</span>
                    </div>
                    <div className="px-2.5 py-1.5 flex justify-between border-b border-white/5">
                      <span>guacd (Apache Guacamole)</span>
                      <span className="text-emerald-400">1.8%</span>
                      <span className="text-purple-300">AES-256-GCM</span>
                    </div>
                    <div className="px-2.5 py-1.5 flex justify-between border-b border-white/5">
                      <span>novnc-websocket-proxy</span>
                      <span className="text-emerald-400">0.9%</span>
                      <span className="text-purple-300">TLS 1.3 Active</span>
                    </div>
                    <div className="px-2.5 py-1.5 flex justify-between">
                      <span>totp-authenticator-daemon</span>
                      <span className="text-emerald-400">0.1%</span>
                      <span className="text-green-400">Verified (OK)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Virtual Desktop Taskbar */}
          <div className="h-10 bg-[#0f1118]/90 border-t border-white/10 px-3 flex items-center justify-between text-white text-xs z-10 backdrop-blur">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveWindow(activeWindow === 'powershell' ? 'none' : 'powershell')}
                className="w-7 h-7 rounded bg-blue-600/80 hover:bg-blue-600 flex items-center justify-center text-white"
                title="Start Menu / Apps"
              >
                <span className="material-symbols-outlined text-sm">widgets</span>
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveWindow('powershell')}
                  className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] font-mono border ${
                    activeWindow === 'powershell'
                      ? 'bg-white/20 border-white/30 text-white'
                      : 'bg-white/5 border-transparent text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs text-blue-400">terminal</span>
                  <span>Terminal</span>
                </button>
                <button
                  onClick={() => setActiveWindow('taskmgr')}
                  className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] font-mono border ${
                    activeWindow === 'taskmgr'
                      ? 'bg-white/20 border-white/30 text-white'
                      : 'bg-white/5 border-transparent text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs text-emerald-400">monitoring</span>
                  <span>Task Manager</span>
                </button>
              </div>
            </div>

            {/* Remote Clock & Tray */}
            <div className="flex items-center gap-2.5 text-gray-300 font-mono text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400" title="Mã hóa đầu cuối bật">
                <span className="material-symbols-outlined text-xs">lock</span>
              </span>
              <span className="flex items-center gap-1" title="Loa âm thanh">
                <span className="material-symbols-outlined text-xs">volume_up</span>
              </span>
              <span className="font-semibold text-white">{remoteClock}</span>
            </div>
          </div>
        </div>

        {/* Cursor tracker overlay indicator */}
        <div
          className="absolute pointer-events-none transition-all duration-75 ease-out opacity-60"
          style={{ left: mousePos.x, top: mousePos.y }}
        >
          <div className="w-2.5 h-2.5 border-2 border-white rounded-full bg-blue-500/50 shadow"></div>
        </div>
      </div>

      {/* E2EE Inspector Modal */}
      {showE2eeDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl text-[#1d1b20]">
            <div className="flex items-center justify-between pb-3 border-b border-[#e0e0e0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#e8def8] text-[#21005d] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">shield_lock</span>
                </div>
                <div>
                  <h3 className="font-bold text-base">Chứng nhận Mã hóa E2EE</h3>
                  <p className="text-xs text-gray-500">Bảo mật đa lớp cho phiên RDP/VNC</p>
                </div>
              </div>
              <button
                onClick={() => setShowE2eeDetails(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="bg-[#f3edf7] p-3 rounded-xl flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[#6750a4] uppercase">Chuẩn mã hóa dòng dữ liệu</span>
                <span className="font-mono font-bold text-sm text-[#21005d]">{vm.encryptionSuite}</span>
                <span className="text-gray-500 text-[11px]">
                  Mỗi gói tin đồ họa và thao tác phím chuột đều được đóng gói và mã hóa trước khi rời khỏi máy khách.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="border border-[#e0e0e0] p-2.5 rounded-xl">
                  <span className="text-gray-400 text-[10px] block">Khóa trao đổi</span>
                  <span className="font-bold font-mono text-gray-800">ECDH X25519</span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">✓ Perfect Forward Secrecy</span>
                </div>
                <div className="border border-[#e0e0e0] p-2.5 rounded-xl">
                  <span className="text-gray-400 text-[10px] block">Xác thực 2 yếu tố</span>
                  <span className="font-bold font-mono text-gray-800">
                    {vm.mfaRequired ? 'Bắt buộc (TOTP)' : 'Tùy chọn'}
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">✓ Đã xác thực</span>
                </div>
              </div>

              <div className="border border-[#e0e0e0] p-2.5 rounded-xl flex flex-col gap-1">
                <span className="text-gray-500 text-[10px] uppercase font-bold">Dấu vân tay bảo mật (Fingerprint)</span>
                <span className="font-mono text-xs bg-gray-100 p-2 rounded text-gray-800 break-all select-all">
                  {vm.e2eeFingerprint}
                </span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">verified</span>
                <span className="text-[11px] font-medium">
                  Kết nối được bảo vệ chống lại tấn công nghe lén Man-In-The-Middle (MITM).
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowE2eeDetails(false)}
                className="bg-[#6750a4] text-white px-5 py-2 rounded-full font-semibold text-xs hover:bg-[#4f378b]"
              >
                Đóng xác thực
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clipboard Sync Modal */}
      {showClipboardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl text-[#1d1b20]">
            <div className="flex items-center justify-between pb-3 border-b border-[#e0e0e0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#e8def8] text-[#21005d] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">content_paste</span>
                </div>
                <div>
                  <h3 className="font-bold text-base">Đồng bộ Clipboard Máy Khách - Máy Ảo</h3>
                  <p className="text-xs text-gray-500">Chia sẻ văn bản an toàn qua kênh E2EE</p>
                </div>
              </div>
              <button
                onClick={() => setShowClipboardModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <p className="text-gray-600">
                Nhập văn bản bạn muốn gửi đến bảng tạm (clipboard) của máy ảo từ thiết bị di động:
              </p>
              <textarea
                value={clipboardText}
                onChange={(e) => setClipboardText(e.target.value)}
                rows={4}
                className="w-full p-3 border border-[#e0e0e0] rounded-xl font-mono text-xs focus:outline-none focus:border-[#6750a4]"
                placeholder="Dán mã bí mật, câu lệnh hoặc URL cần truyền vào máy ảo..."
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  navigator.clipboard?.readText?.().then((text) => setClipboardText(text)).catch(() => {});
                }}
                className="text-xs font-semibold text-[#6750a4] hover:underline"
              >
                Đọc từ Clipboard máy thật
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowClipboardModal(false)}
                  className="px-4 py-2 rounded-full border border-[#e0e0e0] text-gray-700 text-xs font-semibold hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    setTerminalLogs((prev) => [...prev, `[CLIPBOARD SYNC] Synchronized: ${clipboardText.slice(0, 30)}...`]);
                    setShowClipboardModal(false);
                  }}
                  className="bg-[#6750a4] text-white px-5 py-2 rounded-full font-semibold text-xs hover:bg-[#4f378b]"
                >
                  Đẩy vào máy ảo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
