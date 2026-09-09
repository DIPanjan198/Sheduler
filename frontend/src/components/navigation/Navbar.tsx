import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Bell, Clock, LogOut, Sparkles, Shield, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';
import { useDataSync } from '../../hooks/useDataSync';

interface NavbarProps {
  setActiveTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ setActiveTab }) => {
  const { user, business, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showBellMenu, setShowBellMenu] = useState(false);
  const bellContainerRef = useRef<HTMLDivElement>(null);

  const loadNotifs = useCallback(async () => {
    try {
      const notifs = await api.request<NotificationItem[]>('/notifications');
      setNotifications(notifs || []);
    } catch (e) {}
  }, []);

  useDataSync(loadNotifs, 5000);

  // Global click-outside listener to close notification popover anytime user clicks/taps anywhere on screen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (bellContainerRef.current && !bellContainerRef.current.contains(event.target as Node)) {
        setShowBellMenu(false);
      }
    };

    if (showBellMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showBellMenu]);

  const isManager = user?.role === 'MANAGER';

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-30 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo & Business Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 pr-2">
          {/* Logo Badge */}
          <div 
            onClick={() => setActiveTab && setActiveTab(isManager ? 'calendar' : 'schedule')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-extrabold flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0 text-sm sm:text-base border border-white/20 active-press cursor-pointer"
            title="Go to main dashboard"
          >
            <span className="tracking-tight">SS</span>
          </div>

          {/* Business Name & Role Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="font-bold text-gray-900 text-xs sm:text-base leading-tight truncate tracking-tight">
                {business?.name || 'Shift Scheduler'}
              </h1>

              {/* Gradient Role Badge */}
              <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-xs ${
                isManager
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white ring-1 ring-purple-400/30'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white ring-1 ring-teal-400/30'
              }`}>
                {isManager && <Shield className="w-2.5 h-2.5 fill-current" />}
                {user?.role || 'STAFF'}
              </span>
            </div>

            {/* Timezone & Live Status */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 mt-0.5 min-w-0">
              <div className="flex items-center gap-1 truncate">
                <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="truncate font-medium text-gray-600">{business?.timezone || 'America/New_York'}</span>
              </div>
              <span className="hidden sm:inline-block text-gray-300">•</span>
              <div className="hidden sm:flex items-center gap-1 text-emerald-600 font-semibold shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px]">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

          {/* Notification Bell Container with Ref for Click-Outside Detection */}
          <div className="relative" ref={bellContainerRef}>
            <button
              onClick={() => setShowBellMenu(!showBellMenu)}
              className={`p-2 sm:p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-xl transition-all duration-200 relative min-h-[40px] min-w-[40px] flex items-center justify-center border ${
                showBellMenu ? 'border-indigo-200 bg-indigo-50 text-indigo-600' : 'border-transparent hover:border-indigo-100'
              } active-press`}
              title="Notifications Log"
            >
              <Bell className="w-5 h-5 transition-transform duration-200 hover:scale-110" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-extrabold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm animate-pulse-subtle">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Log Dropdown Popover */}
            {showBellMenu && (
              <>
                {/* Full backdrop overlay */}
                <div 
                  className="fixed inset-0 z-40 bg-black/10 backdrop-blur-xs" 
                  onClick={() => setShowBellMenu(false)} 
                />
                
                <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-88 bg-white rounded-card shadow-lifted border border-gray-100 py-0 z-50 overflow-hidden animate-fadeIn">
                  
                  {/* Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-indigo-50/40 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-indigo-100 text-indigo-600 rounded-md">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-gray-800 uppercase tracking-wider">Notifications Log</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                        {notifications.length} Total
                      </span>
                      <button 
                        onClick={() => setShowBellMenu(false)} 
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Close popover"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-gray-400 space-y-1">
                        <Bell className="w-6 h-6 text-gray-300 mx-auto mb-2 opacity-50" />
                        <p className="font-medium text-gray-500">No notifications sent yet</p>
                        <p className="text-[11px] text-gray-400">Updates on shifts, swaps & time off will appear here.</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-3.5 hover:bg-indigo-50/30 transition-colors text-xs space-y-1">
                          <div className="flex items-center justify-between text-gray-400">
                            <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">
                              {n.type}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">{n.channel}</span>
                          </div>
                          <p className="text-gray-700 font-medium leading-snug break-words">
                            {n.payload.message || JSON.stringify(n.payload)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Summary Pill */}
          <div className="flex items-center gap-2 pl-2 sm:pl-2.5 border-l border-gray-200/80">
            
            {/* Avatar Circle */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-500/20 ring-2 ring-indigo-100 shrink-0 select-none">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>

            {/* Profile Info (Desktop) */}
            <div className="hidden md:block text-left min-w-0 max-w-[140px]">
              <div className="text-xs font-bold text-gray-900 truncate leading-tight">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-[10px] text-gray-500 truncate mt-0.5 font-medium">
                {user?.email}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                setShowBellMenu(false);
                logout();
              }}
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 min-h-[40px] min-w-[40px] flex items-center justify-center active-press"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>
    </header>
  );
};
