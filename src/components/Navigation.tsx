import React from 'react';

export type TabType = 'sessions' | 'viewer' | 'admin' | 'sync' | 'security';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  hasActiveSession: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  hasActiveSession,
}) => {
  const tabs = [
    { id: 'sessions' as TabType, label: 'Phiên kết nối', icon: 'grid_view' },
    { 
      id: 'viewer' as TabType, 
      label: 'Màn hình VM', 
      icon: 'desktop_windows', 
      badge: hasActiveSession ? 'Đang mở' : undefined 
    },
    { id: 'admin' as TabType, label: 'Quản trị', icon: 'admin_panel_settings' },
    { id: 'sync' as TabType, label: 'Đồng bộ mây', icon: 'cloud_sync' },
    { id: 'security' as TabType, label: 'MFA & E2EE', icon: 'lock_clock' },
  ];

  return (
    <nav className="h-20 bg-[#f3edf7] border-t border-[#eaddff] flex items-center justify-around px-2 pb-2 select-none z-30">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all py-1 px-2 relative ${
              isActive ? 'text-[#21005d]' : 'text-[#49454f] hover:text-[#1d1b20] active:opacity-60'
            }`}
          >
            <div
              className={`px-4 py-1 rounded-full flex items-center justify-center transition-all ${
                isActive ? 'bg-[#e8def8] shadow-sm scale-105' : 'bg-transparent'
              }`}
            >
              <span
                className={`material-symbols-outlined text-2xl ${
                  isActive ? 'font-semibold' : ''
                }`}
              >
                {tab.icon}
              </span>
            </div>
            <span
              className={`text-[10px] uppercase tracking-tighter ${
                isActive ? 'font-bold' : 'font-medium'
              }`}
            >
              {tab.label}
            </span>

            {tab.badge && !isActive && (
              <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
