import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Bell, Clock, LogOut, Sparkles, Shield, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';
import { useDataSync } from '../../hooks/useDataSync';
import { Logo } from '../ui/Logo';

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
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand & Organization Info */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo Badge */}
          <button 
            onClick={() => setActiveTab && setActiveTab(isManager ? 'calendar' : 'schedule')}
            className="group flex items-center gap-2.5 focus:outline-none"
            title="Go to main dashboard"
          >
            <Logo size="md" className="transition-all duration-200 group-hover:scale-105 active-press" />
            <div className="hidden sm:block text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">Shift Scheduler</span>
              <h2 className="text-sm font-bold text-slate-800 leading-tight truncate -mt-0.5">
                {business?.name || 'Workspace'}
              </h2>
            </div>
          </button>

          {/* Vertical subtle divider */}
          <div className="hidden sm:block h-6 w-px bg-slate-200" />

          {/* Role & Timezone Pill */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile business name */}
            <span className="sm:hidden text-xs font-bold text-slate-800 truncate max-w-[120px]">
              {business?.name || 'Workspace'}
            </span>

            {/* Role Badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide shadow-xs ${
              isManager
                ? 'bg-purple-50 text-purple-700 border border-purple-200/80'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isManager ? 'bg-purple-500' : 'bg-emerald-500'}`} />
              {isManager ? 'Manager' : 'Employee'}
            </span>

            {/* Timezone (Desktop) */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100/70 border border-slate-200/60 px-2.5 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">{business?.timezone || 'America/New_York'}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions & User Info */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Notifications Button & Dropdown */}
          <div className="relative" ref={bellContainerRef}>
            <button
              onClick={() => setShowBellMenu(!showBellMenu)}
              className={`relative p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
                showBellMenu
                  ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500/20'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100/80'
              }`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>

            {/* Popover */}
            {showBellMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/10 backdrop-blur-xs" 
                  onClick={() => setShowBellMenu(false)} 
                />
                
                <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-full sm:mt-2 w-auto sm:w-88 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 z-50 overflow-hidden animate-fadeIn">
                  
                  {/* Header */}
                  <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      <span className="font-bold text-xs text-slate-800 tracking-tight">Notifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                        {notifications.length}
                      </span>
                      <button 
                        onClick={() => setShowBellMenu(false)} 
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                        <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
                        <p className="font-semibold text-slate-600">All caught up</p>
                        <p className="text-[11px] text-slate-400">Shift updates & notifications appear here.</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-3.5 hover:bg-indigo-50/40 transition-colors text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md text-[10px]">
                              {n.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{n.channel}</span>
                          </div>
                          <p className="text-slate-700 font-medium leading-snug">
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

          {/* User Profile Card */}
          <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200/80">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-indigo-500/20 ring-2 ring-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>

            <div className="hidden sm:block text-left max-w-[130px]">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                {user?.email}
              </p>
            </div>

            {/* Logout Icon Button */}
            <button
              onClick={() => {
                setShowBellMenu(false);
                logout();
              }}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition-all duration-200"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
