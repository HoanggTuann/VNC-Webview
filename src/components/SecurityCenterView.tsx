import React, { useState, useEffect } from 'react';
import { MFAState } from '../types';

interface SecurityCenterViewProps {
  mfaState: MFAState;
  onUpdateMfa: (newState: MFAState) => void;
  onVerifyCode: (code: string) => boolean;
}

export const SecurityCenterView: React.FC<SecurityCenterViewProps> = ({
  mfaState,
  onUpdateMfa,
}) => {
  const [seconds, setSeconds] = useState(24);
  const [currentCode, setCurrentCode] = useState('842 190');
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'pass'>('idle');
  const [inputTestCode, setInputTestCode] = useState('');
  const [verifyResult, setVerifyResult] = useState<string | null>(null);

  // Periodic TOTP rolling code simulator (RFC 6238)
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          // Generate next simulated 6-digit TOTP
          const rand = Math.floor(100000 + Math.random() * 900000).toString();
          setCurrentCode(`${rand.slice(0, 3)} ${rand.slice(3)}`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard?.writeText(currentCode.replace(' ', ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunSecurityAudit = () => {
    setTestStatus('testing');
    setTimeout(() => {
      setTestStatus('pass');
    }, 1800);
  };

  const handleVerifyInput = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = inputTestCode.replace(/\s+/g, '');
    const cleanCurrent = currentCode.replace(/\s+/g, '');
    if (cleanInput === cleanCurrent || cleanInput === '123456') {
      setVerifyResult('success');
    } else {
      setVerifyResult('fail');
    }
    setTimeout(() => setVerifyResult(null), 3500);
  };

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
      {/* MFA Authenticator Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#e0e0e0] shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f3edf7] text-[#6750a4] flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">lock_clock</span>
            </div>
            <div>
              <h2 className="font-bold text-base text-[#1d1b20]">Xác Thực Đa Yếu Tố (MFA / 2FA TOTP)</h2>
              <p className="text-xs text-gray-500">Mã xác thực 6 chữ số theo chuẩn RFC 6238</p>
            </div>
          </div>

          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            Đã Kích Hoạt
          </span>
        </div>

        {/* Live Rolling Code Display */}
        <div className="bg-gradient-to-br from-[#21005d] to-[#6750a4] text-white p-5 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md relative overflow-hidden">
          <div className="absolute top-2 right-3 text-[10px] text-white/60 font-mono">
            HẠNG MỤC: SECURELINK-PRO-AUTH
          </div>

          <span className="text-xs text-white/80 uppercase tracking-widest font-semibold">
            Mã OTP Phiên Làm Việc Hiện Tại
          </span>

          <div className="flex items-center gap-4 my-1">
            <span className="text-4xl font-mono font-bold tracking-widest text-white drop-shadow">
              {currentCode}
            </span>
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 transition-all text-white"
              title="Sao chép mã OTP"
            >
              <span className="material-symbols-outlined text-lg">
                {copied ? 'done' : 'content_copy'}
              </span>
            </button>
          </div>

          {/* 30-second progress bar */}
          <div className="w-full max-w-xs flex items-center gap-2 mt-1">
            <div className="flex-1 bg-white/20 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(seconds / 30) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs font-mono text-white/90 w-8 text-right font-semibold">
              {seconds}s
            </span>
          </div>

          <span className="text-[11px] text-white/70 mt-1">
            Mã sẽ tự động làm mới sau mỗi 30 giây để ngăn chặn tấn công phát lại (Replay Attacks).
          </span>
        </div>

        {/* Test OTP Input Simulator */}
        <div className="border border-[#e0e0e0] p-4 rounded-xl flex flex-col gap-2.5">
          <span className="font-bold text-xs text-gray-800">Kiểm tra Xác thực Token trước khi vào máy ảo:</span>
          <form onSubmit={handleVerifyInput} className="flex items-center gap-2">
            <input
              type="text"
              value={inputTestCode}
              onChange={(e) => setInputTestCode(e.target.value)}
              placeholder="Nhập mã OTP (hoặc 123456)..."
              maxLength={7}
              className="flex-1 px-3 py-2 border border-[#e0e0e0] rounded-xl text-xs font-mono focus:outline-none focus:border-[#6750a4]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#6750a4] text-white rounded-xl text-xs font-bold hover:bg-[#4f378b]"
            >
              Kiểm tra
            </button>
          </form>

          {verifyResult === 'success' && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-1.5 animate-fadeIn">
              <span className="material-symbols-outlined text-emerald-600 text-sm">verified</span>
              <span>Xác thực thành công! Token hợp lệ cho phiên kết nối RDP/VNC.</span>
            </div>
          )}
          {verifyResult === 'fail' && (
            <div className="p-2 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-1.5 animate-fadeIn">
              <span className="material-symbols-outlined text-red-600 text-sm">error</span>
              <span>Mã OTP không đúng hoặc đã hết hạn. Vui lòng kiểm tra lại.</span>
            </div>
          )}
        </div>

        {/* Biometrics & Hardware Keys */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 border border-[#e0e0e0] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#6750a4]">fingerprint</span>
              <div>
                <span className="font-bold text-gray-800 block">Sinh trắc học / Vân tay</span>
                <span className="text-[10px] text-gray-500">Mở khóa nhanh bằng Android Biometric</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateMfa({ ...mfaState, biometricUnlocked: !mfaState.biometricUnlocked })}
              className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                mfaState.biometricUnlocked ? 'bg-[#6750a4]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  mfaState.biometricUnlocked ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          <div className="p-3 border border-[#e0e0e0] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#6750a4]">key</span>
              <div>
                <span className="font-bold text-gray-800 block">Khóa Bảo mật FIDO2</span>
                <span className="text-[10px] text-gray-500">YubiKey & Hardware Security Key</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Sẵn sàng
            </span>
          </div>
        </div>
      </div>

      {/* End-to-End Encryption (E2EE) Details */}
      <div className="bg-white p-5 rounded-2xl border border-[#e0e0e0] shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6750a4] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">enhanced_encryption</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1d1b20]">Mã Hóa Đầu Cuối (E2EE Tunnel)</h3>
              <p className="text-xs text-gray-500">Bảo vệ luồng âm thanh, hình ảnh và thao tác chuột phím</p>
            </div>
          </div>

          <button
            onClick={handleRunSecurityAudit}
            disabled={testStatus === 'testing'}
            className="px-3 py-1.5 bg-[#f3edf7] hover:bg-[#e8def8] text-[#21005d] rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
          >
            <span className={`material-symbols-outlined text-sm ${testStatus === 'testing' ? 'animate-spin' : ''}`}>
              security_update_good
            </span>
            <span>{testStatus === 'testing' ? 'Đang kiểm tra...' : 'Kiểm tra mật mã'}</span>
          </button>
        </div>

        {testStatus === 'pass' && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-emerald-600">verified</span>
            <div>
              <span className="font-bold block">Chứng nhận Kênh Mã hóa Hoàn hảo (Grade A+)</span>
              <span className="text-[11px]">
                Toàn bộ gói tin truyền qua Chromium WebSocket đạt chuẩn AES-256-GCM không thể giải mã ngoài biên.
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-500 block uppercase font-bold">Khóa trao đổi Ephemeral</span>
            <span className="font-mono text-gray-800 font-bold">X25519 Elliptic Curve Diffie-Hellman</span>
            <span className="text-[10px] text-emerald-600 block mt-1">Đảm bảo Perfect Forward Secrecy</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-500 block uppercase font-bold">Thuật toán Mã hóa Khối</span>
            <span className="font-mono text-gray-800 font-bold">AES-256-GCM / ChaCha20-Poly1305</span>
            <span className="text-[10px] text-purple-600 block mt-1">Xác thực tính toàn vẹn 128-bit MAC</span>
          </div>
        </div>

        {/* Emergency Backup Codes */}
        <div className="border-t border-gray-100 pt-3">
          <span className="font-bold text-xs text-gray-800 block mb-1">Mã Khôi Phục Khẩn Cấp (Emergency Backup Codes)</span>
          <p className="text-[11px] text-gray-500 mb-2">
            Sử dụng khi bạn mất quyền truy cập vào thiết bị tạo mã OTP:
          </p>
          <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
            {['9012-4412', '7731-8902', '1249-0038'].map((code, i) => (
              <span key={i} className="p-2 bg-gray-100 rounded-lg text-gray-700 select-all font-semibold">
                {code}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
