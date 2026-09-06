import React, { useState } from 'react';
import { VMConnection } from '../types';

interface MFAChallengeModalProps {
  vm: VMConnection | null;
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  currentMfaCode: string;
}

export const MFAChallengeModal: React.FC<MFAChallengeModalProps> = ({
  vm,
  isOpen,
  onSuccess,
  onCancel,
  currentMfaCode,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen || !vm) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(false);

    setTimeout(() => {
      setIsVerifying(false);
      const cleanInput = code.replace(/\s+/g, '');
      const cleanCurrent = currentMfaCode.replace(/\s+/g, '');

      // Accept real rolling TOTP, test code 123456, or empty for quick demo
      if (cleanInput === cleanCurrent || cleanInput === '123456' || cleanInput === '') {
        onSuccess();
      } else {
        setError(true);
      }
    }, 600);
  };

  const handleBiometric = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onSuccess();
    }, 700);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl text-[#1d1b20]">
        <div className="text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#eaddff] text-[#21005d] flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-3xl">verified_user</span>
          </div>

          <h3 className="font-bold text-base text-[#1d1b20]">Xác Thực Đa Yếu Tố (MFA)</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs">
            Phiên kết nối đến <strong className="text-gray-800">{vm.name}</strong> ({vm.protocol}) yêu cầu xác nhận danh tính Zero-Trust.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1 text-center">
              Nhập mã TOTP 6 số từ ứng dụng xác thực:
            </label>
            <input
              type="text"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={currentMfaCode}
              maxLength={7}
              className="w-full px-3 py-2.5 text-center font-mono text-xl font-bold tracking-widest border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#6750a4]"
            />
            <p className="text-[10px] text-gray-400 text-center mt-1">
              Gợi ý mã hiện tại: <span className="font-mono font-bold text-[#6750a4]">{currentMfaCode}</span> (hoặc bấm Xác nhận)
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-600 font-semibold text-center animate-shake">
              Mã xác thực không chính xác. Vui lòng thử lại!
            </p>
          )}

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-[#6750a4] hover:bg-[#4f378b] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {isVerifying ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                  <span>Đang giải mã và kiểm tra E2EE...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">lock_open</span>
                  <span>Xác nhận & Mở Màn hình VM</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBiometric}
              className="w-full bg-[#f3edf7] hover:bg-[#e8def8] text-[#21005d] py-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-base">fingerprint</span>
              <span>Xác thực bằng Vân tay / Passkey</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-gray-500 hover:text-gray-700 py-1"
            >
              Hủy kết nối
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
