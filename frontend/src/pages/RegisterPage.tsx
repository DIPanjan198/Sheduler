import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Building, Globe, User as UserIcon, ArrowRight, ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

interface RegisterPageProps {
  onNavigateLogin: () => void;
  onNavigateHome?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateLogin, onNavigateHome }) => {
  const { register } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Business Details
  const [businessName, setBusinessName] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  // Step 2: Manager Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (!businessName.trim() || !timezone.trim() || !firstName.trim() || !lastName.trim() || !email.trim() || !phoneDigits.trim() || !password.trim()) {
      setErrorMsg('All fields are required. Please fill in all details.');
      return;
    }

    if (phoneDigits.trim().length < 7) {
      setErrorMsg('Please enter a valid mobile number (at least 7 digits).');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify both passwords.');
      return;
    }

    const fullPhone = `${countryCode}${phoneDigits.trim()}`;

    setIsLoading(true);
    try {
      await register({
        businessName: businessName.trim(),
        timezone: timezone.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: fullPhone,
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
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl p-6 sm:p-9 rounded-2xl border border-gray-200/80 shadow-lifted space-y-5 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Logo size="lg" className="mx-auto" />
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
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                  <option value="America/New_York">America/New_York (Eastern)</option>
                  <option value="America/Chicago">America/Chicago (Central)</option>
                  <option value="America/Denver">America/Denver (Mountain)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (Pacific)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="Europe/Berlin">Europe/Berlin (CET/CEST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT +8:00)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST +9:00)</option>
                  <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
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
                  <input
                    type="text"
                    required
                    autoComplete="given-name"
                    placeholder="John"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 border-gray-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="family-name"
                    placeholder="Doe"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 border-gray-200 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="manager@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 border-gray-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex rounded-xl border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 bg-gray-50/50 focus-within:bg-white overflow-hidden transition-all">
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    className="px-2.5 py-2.5 bg-slate-100/80 border-r border-gray-200 select-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+81">🇯🇵 +81</option>
                  </select>
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    maxLength={15}
                    value={phoneDigits}
                    onChange={e => setPhoneDigits(e.target.value.replace(/\D/g, '').slice(0, 15))}
                    className="flex-1 px-3.5 py-2.5 text-sm text-slate-900 bg-transparent focus:outline-none tracking-wider font-medium"
                    placeholder={countryCode === '+1' ? '212 555 0199' : countryCode === '+91' ? '98765 43210' : '12345 67890'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Password (min 6 characters) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 focus:bg-white transition-all"
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
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 p-1 rounded-md transition-colors"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
            <button type="button" onClick={onNavigateLogin} className="font-extrabold text-indigo-600 hover:text-indigo-700 underline ml-1">
              Sign In
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
