import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ArrowLeft, Users, Building, KeyRound, CheckCircle2, X, RefreshCw } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { api } from '../services/api';

interface LoginPageProps {
  onNavigateRegister: () => void;
  onNavigateHome?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateRegister, onNavigateHome }) => {
  const { login } = useAuth();
  const [portalMode, setPortalMode] = useState<'manager' | 'employee'>('manager');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Forgot Password States ──
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown countdown timer for resending OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

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

  const handleOpenForgotModal = () => {
    setForgotEmail(email.trim());
    setForgotOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotError('');
    setForgotSuccess('');
    setForgotStep('request');
    setShowForgotModal(true);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.request<any>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      setForgotSuccess(res.message || 'Verification code sent to your email.');
      setForgotStep('verify');
      setResendCooldown(45);
      setForgotError('');
    } catch (err: any) {
      setForgotError(err.message || 'Failed to send verification code. Please check your email.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || forgotLoading) return;
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);
    try {
      const res = await api.request<any>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      setForgotSuccess(res.message || 'A new verification code has been dispatched.');
      setResendCooldown(45);
    } catch (err: any) {
      setForgotError(err.message || 'Could not resend code. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    const cleanOtp = forgotOtp.trim().replace(/\s+/g, '');
    if (!cleanOtp || cleanOtp.length !== 6) {
      setForgotError('Please enter the full 6-digit verification code.');
      return;
    }

    if (newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match. Please verify both passwords.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.request<any>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: cleanOtp,
          newPassword
        })
      });

      setForgotSuccess(res.message || 'Password updated successfully!');
      setEmail(forgotEmail.trim());
      setPassword('');

      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep('request');
        setForgotOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
        setForgotSuccess('');
      }, 1500);
    } catch (err: any) {
      setForgotError(err.message || 'Failed to reset password. Please check your verification code.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-animated-mesh relative overflow-hidden">
      
      {/* Background Ambient Glow Orbs - animated */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none animate-orb-1" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none animate-orb-2" />
      <div className="absolute -bottom-16 left-1/3 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none animate-orb-3" />

      {/* Back to Home Button */}
      {onNavigateHome && (
        <button
          type="button"
          onClick={onNavigateHome}
          className="absolute top-5 left-5 z-20 inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 bg-white/90 hover:bg-white backdrop-blur-md rounded-xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </button>
      )}

      {/* Main Glass Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl p-6 sm:p-9 rounded-2xl border border-gray-200/80 shadow-lifted space-y-6 relative z-10">

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Logo size="xl" className="mx-auto" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">StaffGrid</h1>
            <p className="text-xs text-gray-500 mt-1 font-medium">Enterprise Workforce Scheduling & Time Clock</p>
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-500" />
                Password
              </label>
              <button
                type="button"
                onClick={handleOpenForgotModal}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>
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
            <div className="flex items-start gap-2.5 bg-amber-50/80 border border-amber-200/70 rounded-xl px-3.5 py-3">
              <Users className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-900">
                  Employee Account Activation
                </p>
                <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                  Employees are added by their manager. Please check your email for your invitation link to activate your account and set your password.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full border border-gray-100 shadow-2xl space-y-5 relative">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                {forgotStep === 'request' ? 'Reset Your Password' : 'Enter Verification Code'}
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                {forgotStep === 'request'
                  ? "Enter your registered email address and we'll send you a 6-digit OTP code."
                  : `Enter the 6-digit code sent to ${forgotEmail} to create a new password.`}
              </p>
            </div>

            {/* Feedback Alerts */}
            {forgotError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* Step 1: Request OTP */}
            {forgotStep === 'request' ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    Account Email Address
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white bg-gray-50/50 transition-all"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md text-xs font-extrabold"
                    isLoading={forgotLoading}
                  >
                    Send OTP Code
                  </Button>
                </div>
              </form>
            ) : (
              /* Step 2: Enter OTP & New Password */
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">
                      6-Digit OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep('request');
                        setForgotError('');
                      }}
                      className="text-[11px] text-indigo-600 hover:underline font-semibold"
                    >
                      Change Email
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={forgotOtp}
                    onChange={e => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-center text-xl font-mono tracking-widest font-extrabold focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-500" />
                    New Password (min 6 characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 p-1 rounded-md transition-colors"
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-500" />
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 p-1 rounded-md transition-colors"
                      title={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-1 space-y-2">
                  <Button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md text-xs font-extrabold"
                    isLoading={forgotLoading}
                  >
                    Update Password
                  </Button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || forgotLoading}
                      onClick={handleResendOtp}
                      className={`text-xs font-medium inline-flex items-center gap-1 ${
                        resendCooldown > 0 || forgotLoading
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-indigo-600 hover:text-indigo-800 hover:underline'
                      }`}
                    >
                      <RefreshCw className={`w-3 h-3 ${forgotLoading ? 'animate-spin' : ''}`} />
                      <span>
                        {resendCooldown > 0
                          ? `Resend code in ${resendCooldown}s`
                          : "Didn't receive code? Resend OTP"}
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
