import React from 'react';
import { Calendar, Clock, Inbox, Users, BarChart3, Settings, Megaphone, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';

  const managerNav = [
    { id: 'calendar', label: 'Schedule Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'notices', label: 'Notice Board', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'team', label: 'Team Roster', icon: <Users className="w-4 h-4" /> },
    { id: 'requests', label: 'Requests Inbox', icon: <Inbox className="w-4 h-4" /> },
    { id: 'timeclock', label: 'Time Clock Oversight', icon: <Clock className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports & Export', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Business Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const employeeNav = [
    { id: 'schedule', label: 'My Schedule', icon: <Calendar className="w-4 h-4" /> },
    { id: 'notices', label: 'Notice Board', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'timeclock', label: 'Digital Time Clock', icon: <Clock className="w-4 h-4" /> },
    { id: 'requests', label: 'My Requests', icon: <Inbox className="w-4 h-4" /> },
    { id: 'settings', label: 'Profile & Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const items = isManager ? managerNav : employeeNav;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white/70 backdrop-blur-md border-r border-gray-200/80 min-h-[calc(100vh-4rem)] p-4 space-y-6">
      
      {/* Role Banner / Navigation Section Header */}
      <div className="space-y-1">
        <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
          <span>{isManager ? 'Manager Dashboard' : 'Staff Portal'}</span>
          {isManager && <Shield className="w-3 h-3 text-purple-500" />}
        </div>

        <div className="space-y-1 pt-1">
          {items.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 active-press ${
                  isActive
                    ? isManager
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20'
                    : 'text-gray-600 hover:bg-gray-100/70 hover:text-gray-900 font-semibold'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'text-white' : 'text-gray-400'}`}>
                  {item.icon}
                </div>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

    </aside>
  );
};
