import React from 'react';

interface HeaderProps {
  onOpenMfa: () => void;
  onSearchClick: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMfa,
  onSearchClick,
  searchQuery,
  setSearchQuery,
  isSearchOpen,
}) => {
  return (
    <header className="px-4 pt-3 pb-2 flex flex-col gap-2 bg-[#fdf8f6] border-b border-[#f3edf7]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#6750a4] rounded-xl flex items-center justify-center text-white shadow-sm transition-transform active:scale-95">
            <span className="material-symbols-outlined text-2xl">shield_lock</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-bold tracking-tight text-[#1d1b20]">SecureLink Pro</h1>
              <span className="text-[10px] font-semibold bg-[#eaddff] text-[#21005d] px-1.5 py-0.5 rounded-full">
                Chromium
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">Cổng kết nối RDP & VNC Đám Mây</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSearchClick}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f3edf7] active:bg-slate-200 transition-colors"
            title="Tìm kiếm kết nối máy ảo"
          >
            <span className="material-symbols-outlined text-gray-600">
              {isSearchOpen ? 'close' : 'search'}
            </span>
          </button>
          
          <button
            onClick={onOpenMfa}
            className="w-10 h-10 rounded-full bg-[#eaddff] flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-[#6750a4] transition-all"
            title="Xác thực đa yếu tố & Hồ sơ quản trị"
          >
            <span className="text-xs font-bold text-[#21005d]">AD</span>
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="relative animate-fadeIn">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm máy ảo, IP máy chủ, giao thức RDP/VNC..."
            className="w-full px-3.5 py-2 pl-9 bg-white border border-[#e0e0e0] rounded-xl text-sm focus:outline-none focus:border-[#6750a4] focus:ring-1 focus:ring-[#6750a4]"
            autoFocus
          />
          <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-gray-400 text-lg">
            search
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined text-lg">cancel</span>
            </button>
          )}
        </div>
      )}

      {/* Security Status Banner from Design HTML */}
      <div className="bg-[#d3e3fd] rounded-2xl p-3.5 flex items-center justify-between border border-[#c2d7fc] shadow-sm">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#001d35] opacity-75">
            Trạng thái bảo mật hệ thống
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-sm font-bold text-[#001d35]">E2EE & MFA Đang kích hoạt</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/70 px-2.5 py-1 rounded-full text-xs font-semibold text-[#001d35]">
            <span className="material-symbols-outlined text-[#001d35] text-base">verified_user</span>
            <span>MFA 2FA</span>
          </div>
          <div className="flex items-center gap-1 bg-white/70 px-2.5 py-1 rounded-full text-xs font-semibold text-[#001d35]">
            <span className="material-symbols-outlined text-[#001d35] text-base">encrypted</span>
            <span>AES-256</span>
          </div>
        </div>
      </div>
    </header>
  );
};
