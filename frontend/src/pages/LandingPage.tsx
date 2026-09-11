import React, { useState } from 'react';
import { 
  Calendar, Clock, Users, ShieldCheck, CheckCircle2, ArrowRight, 
  Sparkles, MapPin, Bell, BarChart3, ChevronDown, ChevronUp, 
  Star, Menu, X, Smartphone, Zap, Award, ArrowUpRight, 
  Lock, Building2, HelpCircle, Check
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';

interface LandingPageProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateLogin,
  onNavigateRegister,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [interactiveTab, setInteractiveTab] = useState<'roster' | 'timeclock' | 'notices'>('roster');

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'Is StaffGrid really free to get started?',
      a: 'Yes! You can register your business immediately, configure custom shift schedules, invite your team members, and start tracking time without entering any payment card details.',
    },
    {
      q: 'Do employees need to download a heavy mobile app?',
      a: 'No heavy app store download is required. StaffGrid is a lightning-fast responsive Single Page App (PWA-ready) that runs beautifully on iOS Safari, Android Chrome, and any desktop browser.',
    },
    {
      q: 'How does the geofenced & PIN Time Clock work?',
      a: 'When an employee punches in, StaffGrid can optionally verify that their device is within the approved business location radius. Employees also have a unique secure PIN, eliminating buddy punching.',
    },
    {
      q: 'Can managers handle shift swaps and leave requests?',
      a: 'Absolutely. Employees can submit time-off requests or shift trade requests with a single tap. Managers receive instant notifications to approve or decline with complete calendar visibility.',
    },
    {
      q: 'Can I export payroll reports and hours worked?',
      a: 'Yes, StaffGrid tracks exact clock-in, clock-out, break times, and total weekly hours. Managers can view detailed attendance reports and export them directly for payroll processing.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden font-sans">
      
      {/* ── Background Ambient Glows ────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[35rem] h-[35rem] bg-indigo-400/15 rounded-full blur-3xl" />
        <div className="absolute top-[30%] -right-32 w-[38rem] h-[38rem] bg-violet-400/15 rounded-full blur-3xl" />
        <div className="absolute top-[70%] left-[10%] w-[32rem] h-[32rem] bg-pink-400/10 rounded-full blur-3xl" />
      </div>

      {/* ── Fixed Sticky Navigation ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/70 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <Logo size="md" withWordmark={true} />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button 
              onClick={() => scrollToSection('features')} 
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('about')} 
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              About StaffGrid
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')} 
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Reviews
            </button>
            <button 
              onClick={() => scrollToSection('faq')} 
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>


          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 shadow-xl">
            <button 
              onClick={() => scrollToSection('features')} 
              className="block w-full text-left py-2 text-base font-medium text-slate-700 hover:text-indigo-600"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('about')} 
              className="block w-full text-left py-2 text-base font-medium text-slate-700 hover:text-indigo-600"
            >
              About StaffGrid
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="block w-full text-left py-2 text-base font-medium text-slate-700 hover:text-indigo-600"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')} 
              className="block w-full text-left py-2 text-base font-medium text-slate-700 hover:text-indigo-600"
            >
              Reviews
            </button>
            <button 
              onClick={() => scrollToSection('faq')} 
              className="block w-full text-left py-2 text-base font-medium text-slate-700 hover:text-indigo-600"
            >
              FAQ
            </button>
          </div>
        )}
      </header>

      {/* ── Main Content Container ────────────────────────────────────────── */}
      <main className="relative z-10">

        {/* ── HERO SECTION ────────────────────────────────────────────────── */}
        <section className="pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/90 border border-indigo-200/70 text-indigo-700 text-xs font-semibold shadow-xs animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Modern Shift Management & Attendance Tracking</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Smarter Shift Scheduling for{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Modern Teams
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Eliminate spreadsheet chaos, avoid scheduling collisions, and empower your crew. 
              Real-time rosters, geofenced GPS time-clocking, and instant manager approvals in one seamless platform.
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={onNavigateLogin}
                className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 rounded-2xl shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all transform active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5"
              >
                <Lock className="w-5 h-5 text-indigo-200" />
                <span>Sign In to Your Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onNavigateRegister}
                className="w-full sm:w-auto px-7 py-3.5 text-base font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl shadow-sm hover:border-slate-300 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Building2 className="w-5 h-5 text-slate-500" />
                <span>Register New Business</span>
              </button>
            </div>

            {/* Trust Micro-Indicators */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500 font-bold" /> Free 60-second setup
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500 font-bold" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500 font-bold" /> Manager & Employee Portals
              </span>
            </div>
          </div>

          {/* ── Interactive Live Preview Mockup ─────────────────────────────── */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-indigo-500/20 via-slate-200/40 to-slate-200/10 border border-indigo-200/50 shadow-2xl backdrop-blur-md">
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-inner">
                
                {/* Mock Browser/App Chrome Header */}
                <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                    <span className="ml-2 text-xs font-semibold text-slate-400 hidden sm:inline">StaffGrid Workspace Preview</span>
                  </div>

                  {/* Mock Mode Tabs */}
                  <div className="flex items-center bg-slate-200/70 p-1 rounded-xl text-xs font-semibold text-slate-600">
                    <button
                      onClick={() => setInteractiveTab('roster')}
                      className={`px-3 py-1 rounded-lg transition-all ${interactiveTab === 'roster' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'}`}
                    >
                      Live Roster
                    </button>
                    <button
                      onClick={() => setInteractiveTab('timeclock')}
                      className={`px-3 py-1 rounded-lg transition-all ${interactiveTab === 'timeclock' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'}`}
                    >
                      GPS Time Clock
                    </button>
                    <button
                      onClick={() => setInteractiveTab('notices')}
                      className={`px-3 py-1 rounded-lg transition-all ${interactiveTab === 'notices' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'}`}
                    >
                      Notice Board
                    </button>
                  </div>
                </div>

                {/* Interactive Simulated Content */}
                <div className="p-4 sm:p-6 bg-slate-50/40 min-h-[280px]">
                  {interactiveTab === 'roster' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">Today's Active Shifts • Downtown Branch</h4>
                          <p className="text-xs text-slate-500">3 of 4 team members on shift</p>
                        </div>
                        <span className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          98% Coverage
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        {/* Card 1 */}
                        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-800">Sarah Jenkins</p>
                              <p className="text-[11px] text-slate-500">Lead Barista</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              CLOCKED IN
                            </span>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-500" /> 07:00 - 15:30</span>
                            <span className="font-semibold text-indigo-600">8.5 hrs</span>
                          </div>
                        </div>

                        {/* Card 2 */}
                        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-800">David Miller</p>
                              <p className="text-[11px] text-slate-500">Store Associate</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              ON BREAK
                            </span>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500" /> 11:00 - 19:00</span>
                            <span className="font-semibold text-slate-600">Break: 15m</span>
                          </div>
                        </div>

                        {/* Card 3 */}
                        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-800">Elena Rostova</p>
                              <p className="text-[11px] text-slate-500">Floor Supervisor</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              SCHEDULED
                            </span>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-500" /> 15:00 - 23:30</span>
                            <span className="font-semibold text-slate-500">Starts in 2h</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {interactiveTab === 'timeclock' && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-2">
                      <div className="space-y-2 text-left max-w-sm">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                          <MapPin className="w-3.5 h-3.5" /> Geofence Verified
                        </div>
                        <h4 className="text-base font-bold text-slate-800">One-Tap Mobile Punch In / Out</h4>
                        <p className="text-xs text-slate-600">
                          Employees simply enter their private 4-digit PIN when arriving on-site. Real-time GPS verification prevents buddy punching.
                        </p>
                      </div>

                      <div className="w-full sm:w-64 p-4 bg-white rounded-2xl border border-slate-200 shadow-md text-center space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg shadow-xs">
                          <Clock className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Current Time</p>
                          <p className="text-xl font-extrabold text-slate-800 font-mono">14:24:08</p>
                        </div>
                        <button 
                          onClick={onNavigateLogin}
                          className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          Simulate Clock In
                        </button>
                      </div>
                    </div>
                  )}

                  {interactiveTab === 'notices' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <Bell className="w-4 h-4 text-indigo-600" /> Team Broadcast Board
                        </h4>
                        <span className="text-xs text-slate-500">Live announcements</span>
                      </div>
                      <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-900">📌 Weekend Coverage Request</span>
                          <span className="text-[10px] text-indigo-600 font-medium">Just now</span>
                        </div>
                        <p className="text-xs text-indigo-700">
                          "Hey team! We need 1 additional associate for Saturday evening peak hours (18:00 - 22:00). Extra shift bonus applies!"
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Banner Bar */}
                <div className="px-4 py-3 bg-slate-100/70 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium">Ready to see your own workspace?</span>
                  <button
                    onClick={onNavigateLogin}
                    className="text-indigo-600 font-bold hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Sign In Now</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          </div>

        </section>

        {/* ── ABOUT SECTION ───────────────────────────────────────────────── */}
        <section id="about" className="py-20 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
                About StaffGrid
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Built to End the Chaos of Hourly Staff Scheduling
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                We built StaffGrid because managing shift workers shouldn't require juggling WhatsApp groups, 
                lost paper printouts, or broken spreadsheets. Whether you run a cafe, clinic, retail store, 
                or service crew, StaffGrid provides clarity, accountability, and peace of mind.
              </p>
            </div>

            {/* Core Values 3-Column Grid */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="p-7 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Total Roster Clarity</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Employees know weeks in advance when they work. Automatic double-booking prevention ensures you never accidentally assign the same staff member to conflicting shifts.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-indigo-600">
                  <CheckCircle2 className="w-4 h-4" /> 90% reduction in missed shifts
                </div>
              </div>

              <div className="p-7 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-violet-300 hover:shadow-lg transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-600/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Fair & Transparent</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Transparent hours distribution prevents burnout. Shift swap requests and time-off requests are approved or declined with full history logging.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-violet-600">
                  <CheckCircle2 className="w-4 h-4" /> Clear audit trail for managers
                </div>
              </div>

              <div className="p-7 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-pink-300 hover:shadow-lg transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-600/20">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Zero Learning Curve</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Designed for real people on the move. Fast, intuitive interfaces that your team can grasp on day one from any smartphone or tablet without formal training.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-pink-600">
                  <CheckCircle2 className="w-4 h-4" /> Works instantly in any mobile browser
                </div>
              </div>

            </div>

            {/* Impact Metrics Counters */}
            <div className="mt-16 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
                <div className="pt-4 md:pt-0">
                  <p className="text-3xl sm:text-4xl font-extrabold text-indigo-400">99.8%</p>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">On-Time Attendance</p>
                </div>
                <div className="pt-4 md:pt-0">
                  <p className="text-3xl sm:text-4xl font-extrabold text-violet-400">12+ hrs</p>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">Saved Weekly per Manager</p>
                </div>
                <div className="pt-4 md:pt-0">
                  <p className="text-3xl sm:text-4xl font-extrabold text-pink-400">0</p>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">Double-Booking Collisions</p>
                </div>
                <div className="pt-4 md:pt-0">
                  <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400">100%</p>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">Cloud & Mobile Ready</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── FEATURES SECTION ────────────────────────────────────────────── */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
              Powerful Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything Needed to Run Your Shift Operations
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Designed specifically for multi-shift businesses needing bulletproof reliability, 
              from calendar scheduling to exportable payroll summaries.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Interactive Shift Calendar</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Day, week, and month views. Copy recurring shifts, drag to reschedule, and visually spot open shifts instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Geofenced GPS Time Clock</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verify employee clock-ins are genuinely on premises. Includes break tracking and tamper-proof security pins.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Live Team Notice Board</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Broadcast vital store updates, urgent coverage needs, and announcements right to the employee home screen.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Shift Swaps & Leave Requests</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Employees can submit PTO, sick days, and shift trades. Managers approve with a single click while viewing coverage.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Role-Based Team Control</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated Manager vs Employee dashboards. Invite staff via email links and configure role permissions effortlessly.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Payroll Hours & Analytics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Export scheduled vs actual hours, track overtime alerts, and avoid payroll discrepancies with verifiable time logs.
              </p>
            </div>

          </div>
        </section>

        {/* ── HOW IT WORKS SECTION ────────────────────────────────────────── */}
        <section id="how-it-works" className="py-20 bg-slate-100/70 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
                Quick 3-Step Flow
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Up and Running in Less Than 3 Minutes
              </h2>
              <p className="text-slate-600 text-base">
                No complex enterprise installation required. Get your business live in moments.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              
              {/* Step 1 */}
              <div className="relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900">Create Business Account</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sign up with your business name, timezone, and manager credentials. Instant setup with no credit card required.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-full bg-violet-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-900">Invite Your Crew</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Add employee emails or send invite links. Staff activate their profile in seconds and see their assigned shifts.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-900">Publish & Track</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Publish schedules with one click. Employees receive real-time notifications and clock in seamlessly on shift day.
                </p>
              </div>

            </div>

            {/* Quick Portal Switcher Banner */}
            <div className="mt-14 text-center">
              <button
                onClick={onNavigateLogin}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <span>Already have an account? Sign In Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </section>

        {/* ── TESTIMONIALS / SOCIAL PROOF ─────────────────────────────────── */}
        <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
              Loved by Managers & Staff
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">What Small Businesses Say</h2>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "We operate two cafes with 24 baristas. Before StaffGrid, weekly scheduling took me 6 hours on Sundays. Now it takes 25 minutes flat."
              </p>
              <div>
                <p className="text-xs font-bold text-slate-900">Liam Vance</p>
                <p className="text-[11px] text-slate-500">General Manager, Daily Brew Co.</p>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "The GPS timeclock and PIN punch feature completely eliminated buddy punching in our boutique. Staff love being able to check shifts on their phones."
              </p>
              <div>
                <p className="text-xs font-bold text-slate-900">Rachel Patel</p>
                <p className="text-[11px] text-slate-500">Operations Lead, Urban Retail</p>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "Shift swap approvals used to get buried in text messages. Having one official notice board and leave request tab has made our clinic run like clockwork."
              </p>
              <div>
                <p className="text-xs font-bold text-slate-900">Dr. Samuel Wright</p>
                <p className="text-[11px] text-slate-500">Practice Director, Horizon Dental</p>
              </div>
            </div>

          </div>
        </section>

        {/* ── FAQ SECTION ─────────────────────────────────────────────────── */}
        <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
                Got Questions?
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
            </div>

            <div className="mt-12 space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div 
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-colors"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-800 hover:text-indigo-600 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-5 h-5 text-indigo-600 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ── BOTTOM CTA BANNER ───────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-700 rounded-3xl p-8 sm:p-14 text-white text-center shadow-2xl relative overflow-hidden">
            
            {/* Background decorative circles */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-violet-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Ready to Simplify Your Workforce Scheduling?
              </h2>
              <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
                Join thousands of managers and team members who rely on StaffGrid every day. 
                Sign in to your dashboard or register your business in moments.
              </p>
              
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <button
                  onClick={onNavigateLogin}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white text-indigo-700 hover:bg-slate-50 font-bold text-sm rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                >
                  Sign In to Portal
                </button>
                <button
                  onClick={onNavigateRegister}
                  className="w-full sm:w-auto px-8 py-3.5 bg-indigo-900/60 hover:bg-indigo-900/80 border border-white/20 text-white font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Create Business Account
                </button>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200/90 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          
          <div className="flex items-center gap-3">
            <Logo size="sm" withWordmark={true} />
            <span className="hidden sm:inline text-slate-300">|</span>
            <span>Intelligent Workforce Scheduling Platform</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <button onClick={() => scrollToSection('about')} className="hover:text-indigo-600 transition-colors">About</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-indigo-600 transition-colors">Features</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-indigo-600 transition-colors">FAQ</button>
            <button onClick={onNavigateLogin} className="text-indigo-600 font-bold hover:underline">Sign In</button>
          </div>

          <div>
            &copy; {new Date().getFullYear()} StaffGrid Inc. All rights reserved.
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
