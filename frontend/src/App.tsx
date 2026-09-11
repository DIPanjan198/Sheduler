import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/navigation/Navbar';
import { Sidebar } from './components/navigation/Sidebar';
import { MobileTabBar } from './components/navigation/MobileTabBar';
import { Toast } from './components/ui/Toast';
import { AnimatedBackground } from './components/ui/AnimatedBackground';

import { ManagerCalendar } from './components/calendar/ManagerCalendar';
import { EmployeeSchedule } from './components/calendar/EmployeeSchedule';
import { TimeClockView } from './components/timeclock/TimeClockView';
import { RequestsView } from './components/requests/RequestsView';
import { TeamView } from './components/team/TeamView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { NoticeBoardView } from './components/notice/NoticeBoardView';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AcceptInvitePage } from './pages/AcceptInvitePage';
import { Logo } from './components/ui/Logo';

const MainContent: React.FC = () => {
  const { user, toast, clearToast, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const isManager = user?.role === 'MANAGER';

  // Active tab state initialized from localStorage if present
  const [activeTab, setActiveTabState] = useState<string>(() => {
    const saved = localStorage.getItem('shift_scheduler_active_tab');
    if (saved) return saved;
    return 'calendar';
  });

  const handleSelectTab = (tab: string) => {
    setActiveTabState(tab);
    localStorage.setItem('shift_scheduler_active_tab', tab);
  };

  // Sync activeTab when user loads to ensure Managers always land on Manager Calendar
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem('shift_scheduler_active_tab');
      if (user.role === 'MANAGER') {
        if (!saved || saved === 'schedule') {
          handleSelectTab('calendar');
        }
      } else {
        if (!saved || saved === 'calendar') {
          handleSelectTab('schedule');
        }
      }
    }
  }, [user?.role, user?.id]);

  // Direct route check for accept invitation link
  if (window.location.pathname.startsWith('/accept-invite') || window.location.hash.includes('accept-invite')) {
    return <AcceptInvitePage />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
        <div className="text-center space-y-4 relative z-10">
          <Logo size="xl" className="animate-bounce mx-auto" />
          <p className="text-xs text-slate-500 font-semibold tracking-widest uppercase">Loading Shift Scheduler...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authView === 'register') {
      return <RegisterPage onNavigateLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onNavigateRegister={() => setAuthView('register')} />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar':
        return isManager ? <ManagerCalendar /> : <EmployeeSchedule />;
      case 'schedule':
        return isManager ? <ManagerCalendar /> : <EmployeeSchedule />;
      case 'notices':
        return <NoticeBoardView />;
      case 'timeclock':
        return <TimeClockView />;
      case 'requests':
        return <RequestsView />;
      case 'team':
        return <TeamView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return isManager ? <ManagerCalendar /> : <EmployeeSchedule />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">

      {/* ✨ Animated Background - persists behind all content */}
      <AnimatedBackground />

      {/* Toast Feedback */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      )}

      {/* Top Navbar Header */}
      <Navbar setActiveTab={handleSelectTab} />

      {/* Main Shell: Sidebar + Content Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        <Sidebar activeTab={activeTab} setActiveTab={handleSelectTab} />
        
        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-36 lg:pb-8 max-w-full overflow-x-hidden">
          {renderTabContent()}
        </main>
      </div>

      {/* Mobile Tab Bar Header */}
      <MobileTabBar activeTab={activeTab} setActiveTab={handleSelectTab} />

    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
