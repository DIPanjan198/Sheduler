import React, { useState } from 'react';
import { Calendar, Clock, Inbox, Users, Megaphone, Settings, BarChart3, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MobileTabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const managerPrimaryNav = [
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
    { id: 'notices', label: 'Notices', icon: <Megaphone className="w-5 h-5" /> },
    { id: 'requests', label: 'Requests', icon: <Inbox className="w-5 h-5" /> },
    { id: 'timeclock', label: 'Clock', icon: <Clock className="w-5 h-5" /> },
    { id: 'team', label: 'Team', icon: <Users className="w-5 h-5" /> },
  ];

  const employeeNav = [
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-5 h-5" /> },
    { id: 'notices', label: 'Notices', icon: <Megaphone className="w-5 h-5" /> },
    { id: 'timeclock', label: 'Clock', icon: <Clock className="w-5 h-5" /> },
    { id: 'requests', label: 'Requests', icon: <Inbox className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const isSecondaryActive = ['reports', 'settings'].includes(activeTab);

  return (
    <>
      {/* Manager Secondary Tools Popover Sheet */}
      {isManager && showMoreMenu && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs lg:hidden" 
            onClick={() => setShowMoreMenu(false)} 
          />
          <div className="fixed bottom-16 left-3 right-3 max-w-sm mx-auto bg-white/95 backdrop-blur-xl rounded-card shadow-lifted border border-gray-200/90 p-3.5 z-50 animate-fadeIn lg:hidden">
            <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider px-1 pb-2 border-b border-gray-100 mb-2 flex items-center justify-between">
              <span>Manager Tools</span>
              <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Manager View
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowMoreMenu(false);
                }}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                  activeTab === 'settings'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs'
                    : 'bg-gray-50/80 border-gray-100 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-bold">Business Settings</div>
                  <div className="text-[10px] text-gray-400 font-medium">Config & Prefs</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('reports');
                  setShowMoreMenu(false);
                }}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                  activeTab === 'reports'
                    ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-xs'
                    : 'bg-gray-50/80 border-gray-100 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600 shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-bold">Reports & Export</div>
                  <div className="text-[10px] text-gray-400 font-medium">CSV & Audit</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Mobile Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/80 z-40 px-1.5 py-1 shadow-lifted pb-safe">
        <div className="flex items-center justify-between max-w-md mx-auto">
          
          {/* Primary Nav Items */}
          {(isManager ? managerPrimaryNav : employeeNav).map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setShowMoreMenu(false);
                }}
                className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl transition-all duration-200 active-press select-none flex-1 min-w-0 ${
                  isActive ? 'text-indigo-600 font-extrabold' : 'text-gray-400 hover:text-gray-600 font-medium'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-200 relative ${
                  isActive
                    ? isManager
                      ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105'
                      : 'bg-gradient-to-tr from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20 scale-105'
                    : 'bg-transparent text-gray-400'
                }`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight truncate max-w-[56px] ${
                  isActive ? 'text-indigo-900 font-extrabold' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Manager "More" Tab Button for Settings & Reports */}
          {isManager && (
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl transition-all duration-200 active-press select-none flex-1 min-w-0 ${
                isSecondaryActive || showMoreMenu ? 'text-purple-600 font-extrabold' : 'text-gray-400 hover:text-gray-600 font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 relative ${
                isSecondaryActive || showMoreMenu
                  ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 scale-105'
                  : 'bg-transparent text-gray-400'
              }`}>
                <MoreHorizontal className="w-5 h-5" />
                {isSecondaryActive && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-white animate-ping"></span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight truncate max-w-[56px] ${
                isSecondaryActive || showMoreMenu ? 'text-purple-900 font-extrabold' : 'text-gray-500'
              }`}>
                More
              </span>
            </button>
          )}

        </div>
      </nav>
    </>
  );
};
