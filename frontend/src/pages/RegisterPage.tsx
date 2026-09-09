import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Building, Globe, User as UserIcon, ArrowRight, ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react';

interface RegisterPageProps {
  onNavigateLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateLogin }) => {
  const { register } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Business Details
  const [businessName, setBusinessName] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');

  // Step 2: Manager Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setErrorMsg('Business name is required.');
      return;
    }
    if (!timezone.trim()) {
      setErrorMsg('Business timezone is required.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!businessName.trim() || !timezone.trim() || !firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setErrorMsg('All fields are required. Please fill in all details.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        businessName: businessName.trim(),
        timezone: timezone.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-animated-mesh relative overflow-hidden">
      
      {/* Background Ambient Glow Orbs - animated */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none animate-orb-1" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none animate-orb-2" />
      <div className="absolute -top-10 right-1/4 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl pointer-events-none animate-orb-3" />

      {/* Main Glass Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl p-6 sm:p-9 rounded-2xl border border-gray-200/80 shadow-lifted space-y-5 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-extrabold text-base flex items-center justify-center mx-auto shadow-md shadow-indigo-500/20 border border-white/20">
            <span className="tracking-tight">SS</span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create Business Account</h1>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              Step {step} of 2 — {step === 1 ? 'Business Info & Timezone' : 'Manager Account'}
            </p>
          </div>
        </div>

        {/* Gradient Progress Bar */}
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden p-0.5 border border-gray-200/60">
          <div className={`bg-gradient-to-r from-indigo-600 to-purple-600 h-full rounded-full transition-all duration-300 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50/90 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={step === 1 ? handleNextStep : handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-500" />
                  Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  Business Timezone <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
                >
                  <option value="America/New_York">America/New_York (Eastern)</option>
                  <option value="America/Chicago">America/Chicago (Central)</option>
                  <option value="America/Denver">America/Denver (Mountain)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (Pacific)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                </select>
              </div>

              <Button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 text-sm font-extrabold mt-2"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Next Step
              </Button>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-gray-50/50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-gray-50/50 focus:bg-white" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-gray-50/50 focus:bg-white" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Phone Number (E.164 for SMS) <span className="text-rose-500">*</span>
                </label>
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-gray-50/50 focus:bg-white" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 focus:bg-white"
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

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setStep(1)} icon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button type="submit" className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 text-sm font-extrabold" isLoading={isLoading}>
                  Create Business Account
                </Button>
              </div>
            </>
          )}
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 font-medium">
            Already registered?{' '}
            <button onClick={onNavigateLogin} className="font-extrabold text-indigo-600 hover:text-indigo-700 underline ml-1">
              Sign In
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
