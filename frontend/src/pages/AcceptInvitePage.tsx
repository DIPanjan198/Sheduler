import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const AcceptInvitePage: React.FC = () => {
  const getInviteToken = () => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('token')) return searchParams.get('token')!;
    if (window.location.hash.includes('token=')) {
      const hashQuery = window.location.hash.split('?')[1] || window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hashQuery);
      return hashParams.get('token') || '';
    }
    return '';
  };

  const token = getInviteToken();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(token ? '' : 'No invitation token found in URL. Please click the exact link from your invitation email.');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await api.request<any>('/auth/accept-invite', {
        method: 'POST',
        body: JSON.stringify({ inviteToken: token, password })
      });

      localStorage.setItem('accessToken', res.tokens?.accessToken);
      localStorage.setItem('currentUser', JSON.stringify(res.user));
      setSuccess(true);

      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to accept invitation. Token may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <div className="w-full max-w-md bg-white p-5 sm:p-8 rounded-card border border-gray-100 shadow-lifted space-y-5 sm:space-y-6 text-center">
        
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-soft">
          SS
        </div>

        {success ? (
          <div className="space-y-3 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h2 className="text-xl font-bold text-gray-900">Invitation Accepted!</h2>
            <p className="text-xs text-gray-500">Redirecting to your employee dashboard...</p>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Accept Invitation</h1>
              <p className="text-xs text-gray-500 mt-1">Set your password to activate your employee account</p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-card text-rose-800 text-xs font-medium text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  Choose Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-btn text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 p-1 rounded-md transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-btn text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 p-1 rounded-md transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Activate Account & Log In
              </Button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
