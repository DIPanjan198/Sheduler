import React, { useState, useCallback, useRef } from 'react';
import { User } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StatusChip } from '../ui/StatusChip';
import { Users, UserPlus, DollarSign, Mail, Phone, ShieldOff, Copy, CheckCircle2, Link, Trash2 } from 'lucide-react';
import { useDataSync } from '../../hooks/useDataSync';

export const TeamView: React.FC = () => {
  const { user: currentUser, showToast } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'EMPLOYEE' | 'MANAGER'>('EMPLOYEE');
  const [hourlyRate, setHourlyRate] = useState('');

  // Created Invite Link State
  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track IDs currently being deleted so polling doesn't re-add them mid-flight
  const deletingIds = useRef<Set<string>>(new Set());

  const loadTeam = useCallback(async () => {
    try {
      const data = await api.request<User[]>('/users');
      // Filter out any users whose delete is still in-flight
      setUsers((data || []).filter(u => !deletingIds.current.has(u.id)));
    } catch (e) {}
  }, []);

  useDataSync(loadTeam, 5000);

  const handleInvite = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!firstName.trim()) {
      showToast('Please enter first name', 'error');
      return;
    }
    if (!lastName.trim()) {
      showToast('Please enter last name', 'error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      showToast('Please enter a 10-digit mobile number', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.request<any>('/auth/invite', {
        method: 'POST',
        body: JSON.stringify({ 
          firstName: firstName.trim(), 
          lastName: lastName.trim(), 
          email: email.trim().toLowerCase(), 
          phone: phone.startsWith('+91') ? phone : `+91${digitsOnly.slice(-10)}`, 
          role, 
          hourlyRate: parseFloat(hourlyRate) || 0 
        })
      });
      showToast(res.message || `Invitation dispatched to ${email}!`);
      
      const inviteUrl = res.user?.inviteUrl || `${window.location.origin}/accept-invite?token=${res.user?.inviteToken}`;
      setCreatedInviteUrl(inviteUrl);
      loadTeam();
    } catch (err: any) {
      showToast(err.message || 'Failed to invite employee', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdInviteUrl) return;
    navigator.clipboard.writeText(createdInviteUrl);
    setCopied(true);
    showToast('Invitation link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCloseModal = () => {
    setIsInviteOpen(false);
    setCreatedInviteUrl(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setHourlyRate('');
  };

  const handleDisable = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to disable ${name}'s account?`)) return;
    
    // Optimistic UI update
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'DISABLED' as const } : u));
    try {
      await api.request(`/users/${id}?permanent=false`, { method: 'DELETE' });
      showToast(`Employee ${name} account disabled`);
    } catch (err: any) {
      loadTeam();
      showToast(err.message || 'Failed to disable employee', 'error');
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY REMOVE ${name} from your business team? This action cannot be undone.`)) return;
    
    // Mark as deleting BEFORE optimistic removal so polling doesn't re-add it
    deletingIds.current.add(id);
    const previousUsers = [...users];
    setUsers(prev => prev.filter(u => u.id !== id));

    try {
      await api.request(`/users/${id}?permanent=true`, { method: 'DELETE' });
      showToast(`Employee ${name} removed permanently from team`);
      // Sync with server to confirm deletion
      await loadTeam();
    } catch (err: any) {
      // Rollback on failure
      setUsers(previousUsers);
      showToast(err.message || 'Failed to remove employee', 'error');
    } finally {
      // Always clear the deleting flag
      deletingIds.current.delete(id);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 lg:pb-0">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-card border border-gray-200 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Team Roster</h2>
            <p className="text-xs text-gray-500">Manage employee profiles and invitations</p>
          </div>
        </div>

        <Button size="sm" icon={<UserPlus className="w-4 h-4" />} onClick={() => setIsInviteOpen(true)}>
          Invite Employee
        </Button>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(u => (
          <div key={u.id} className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-soft hover:shadow-lifted transition-all duration-300 flex flex-col justify-between space-y-4 hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-base flex items-center justify-center shadow-md shadow-indigo-500/20 ring-2 ring-indigo-100 shrink-0">
                  {u.firstName?.[0]}{u.lastName?.[0]}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-gray-900 text-sm truncate tracking-tight">{u.firstName} {u.lastName}</h3>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-0.5 shadow-xs ${
                    u.role === 'MANAGER'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}>
                    {u.role}
                  </span>
                </div>
              </div>

              <StatusChip status={u.status} />
            </div>

            <div className="space-y-2 text-xs text-gray-600 border-t border-b border-gray-100 py-3.5">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate font-medium" title={u.email}>{u.email}</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="font-medium">{u.phone || 'No phone added'}</span>
              </div>
              {u.hourlyRate !== undefined && u.hourlyRate !== null && (
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50/60 px-2.5 py-1 rounded-lg border border-emerald-100/80 w-fit">
                  <span className="text-xs font-black">₹</span>
                  <span>{u.hourlyRate.toFixed(0)} / hr</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-1">
              {currentUser?.id !== u.id ? (
                <div className="flex items-center gap-1.5">
                  {u.status !== 'DISABLED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<ShieldOff className="w-3.5 h-3.5" />}
                      onClick={() => handleDisable(u.id, `${u.firstName} ${u.lastName}`)}
                      title="Disable account login"
                    >
                      Disable
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100"
                    icon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                    onClick={() => handleRemove(u.id, `${u.firstName} ${u.lastName}`)}
                    title="Remove employee permanently from business"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <span className="text-[11px] font-medium text-gray-400 italic">You (Current User)</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invite Employee Modal */}
      <Modal 
        isOpen={isInviteOpen} 
        onClose={handleCloseModal} 
        title={createdInviteUrl ? "Invitation Dispatched" : "Invite Team Member"}
        footer={
          createdInviteUrl ? (
            <div className="flex items-center gap-2 w-full">
              <Button type="button" className="flex-1" icon={<Copy className="w-4 h-4" />} onClick={handleCopyLink}>
                {copied ? 'Copied Link!' : 'Copy Invite Link'}
              </Button>
              <Button type="button" variant="ghost" onClick={handleCloseModal}>
                Done
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2 w-full">
              <Button type="button" variant="ghost" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="button" onClick={() => handleInvite()} isLoading={isSubmitting}>
                Send Invite
              </Button>
            </div>
          )
        }
      >
        {createdInviteUrl ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Real-Time Mail Dispatched!</h3>
              <p className="text-xs text-gray-500 mt-1">
                An invitation email notification has been dispatched to <strong>{email}</strong> for <strong>{firstName} {lastName}</strong>.
              </p>
            </div>

            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-card text-left space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Direct Accept Link</span>
              </div>
              <div className="p-2 bg-white border border-indigo-200 rounded-btn text-[11px] font-mono text-gray-700 break-all select-all flex items-center gap-2">
                <Link className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="flex-1 text-left">{createdInviteUrl}</span>
              </div>
            </div>
          </div>
        ) : (
          <form id="invite-team-form" onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">First Name</label>
                <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 border rounded-btn text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name</label>
                <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 border rounded-btn text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mobile Number <span className="text-gray-400 font-normal">(WhatsApp / SMS)</span>
              </label>
              <div className="relative flex rounded-xl border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all bg-white overflow-hidden">
                {/* Indian Country Prefix Badge */}
                <div className="flex items-center gap-1.5 px-3 bg-slate-50 border-r border-gray-200 select-none text-xs font-bold text-slate-700">
                  <span className="text-base leading-none">🇮🇳</span>
                  <span>+91</span>
                </div>
                {/* 10-digit Indian Mobile Input */}
                <input
                  type="tel"
                  required
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                  value={phone.startsWith('+91') ? phone.slice(3) : phone}
                  onChange={e => {
                    const digitsOnly = e.target.value.replace(/\D/g, '');
                    setPhone(digitsOnly ? `+91${digitsOnly}` : '');
                  }}
                  className="flex-1 px-3.5 py-2.5 text-sm text-slate-900 bg-transparent focus:outline-none tracking-wider font-medium"
                  placeholder="98765 43210"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Enter 10-digit Indian mobile number</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
                <select value={role} onChange={e => setRole(e.target.value as any)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Hourly Wage (₹)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-gray-400 text-sm font-bold">₹</span>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={hourlyRate} 
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        setHourlyRate(val);
                      }
                    }} 
                    className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                    placeholder="250" 
                  />
                </div>
              </div>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
