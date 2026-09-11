import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Users, Building } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

interface LoginPageProps {
  onNavigateRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateRegister }) => {
  const { login } = useAuth();
  const [portalMode, setPortalMode] = useState<'manager' | 'employee'>('manager');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-animated-mesh relative overflow-hidden">
      
      {/* Background Ambient Glow Orbs - animated */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none animate-orb-1" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none animate-orb-2" />
      <div className="absolute -bottom-16 left-1/3 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none animate-orb-3" />

      {/* Main Glass Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl p-6 sm:p-9 rounded-2xl border border-gray-200/80 shadow-lifted space-y-6 relative z-10">

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Logo size="xl" className="mx-auto" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Shift Scheduler</h1>
            <p className="text-xs text-gray-500 mt-1 font-medium">Enterprise Staff Scheduling & Time Clock</p>
          </div>
        </div>

        {/* Segmented Switcher: Manager vs Employee */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setPortalMode('manager');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              portalMode === 'manager'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Manager Portal</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPortalMode('employee');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              portalMode === 'employee'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Employee Portal</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50/90 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              {portalMode === 'manager' ? 'Manager Email' : 'Employee Email'}
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder={portalMode === 'manager' ? 'manager@company.com' : 'employee@company.com'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 p-1.5 rounded-lg transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 text-sm font-extrabold" isLoading={isLoading}>
            <span>{portalMode === 'manager' ? 'Sign In as Manager' : 'Sign In as Employee'}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="pt-3 border-t border-gray-100 space-y-3">
          {portalMode === 'manager' ? (
            <div className="text-center">
              <p className="text-xs text-gray-600 font-medium">
                Want to register a new business?{' '}
                <button
                  type="button"
                  onClick={onNavigateRegister}
                  className="font-extrabold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                >
                  Register Business & Manager
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 bg-amber-50/80 border border-amber-200/70 rounded-xl px-3.5 py-3">
                <Users className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-amber-900">
                    Employee Account Activation
                  </p>
                  <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                    Employees are added by their manager. Please check your email for your invitation link to activate your account.
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 font-medium">
                  Are you an employer or manager?{' '}
                  <button
                    type="button"
                    onClick={onNavigateRegister}
                    className="font-extrabold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                  >
                    Register Business
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
