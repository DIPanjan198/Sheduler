import React, { useState, useEffect, useCallback } from 'react';
import { TimeClockEntry } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { StatusChip } from '../ui/StatusChip';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Play, Square, Clock, AlertTriangle, User as UserIcon, Edit3, ShieldAlert } from 'lucide-react';
import { useDataSync } from '../../hooks/useDataSync';

export const TimeClockView: React.FC = () => {
  const { user, showToast } = useAuth();
  const isManager = user?.role === 'MANAGER';

  const [entries, setEntries] = useState<TimeClockEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeClockEntry | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  // Edit Modal State (Manager)
  const [editingEntry, setEditingEntry] = useState<TimeClockEntry | null>(null);
  const [editClockIn, setEditClockIn] = useState('');
  const [editClockOut, setEditClockOut] = useState('');
  const [editReason, setEditReason] = useState('');

  const loadTimeEntries = useCallback(async () => {
    try {
      const data = await api.request<TimeClockEntry[]>('/time-clock');
      setEntries(data || []);

      // Find current user's active session
      const currentActive = data.find(e => e.userId === user?.id && !e.clockOutAt);
      setActiveEntry(currentActive || null);
    } catch (e) {}
  }, [user?.id]);

  useDataSync(loadTimeEntries, 5000);

  // Live Timer tick effect
  useEffect(() => {
    let interval: any;
    if (activeEntry && activeEntry.clockInAt) {
      const updateTimer = () => {
        const start = new Date(activeEntry.clockInAt).getTime();
        const now = new Date().getTime();
        setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeEntry]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePunchIn = async () => {
    setIsLoading(true);
    try {
      const newEntry = await api.request<TimeClockEntry>('/time-clock/punch-in', { method: 'POST' });
      setActiveEntry(newEntry);
      showToast('Clocked in successfully!', 'success');
      loadTimeEntries();
    } catch (err: any) {
      showToast(err.message || 'Failed to punch in', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setIsLoading(true);
    try {
      await api.request<TimeClockEntry>('/time-clock/punch-out', { method: 'POST' });
      setActiveEntry(null);
      showToast('Clocked out cleanly!', 'success');
      loadTimeEntries();
    } catch (err: any) {
      showToast(err.message || 'Failed to punch out', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (entry: TimeClockEntry) => {
    setEditingEntry(entry);
    setEditClockIn(entry.clockInAt ? new Date(entry.clockInAt).toISOString().slice(0, 16) : '');
    setEditClockOut(entry.clockOutAt ? new Date(entry.clockOutAt).toISOString().slice(0, 16) : '');
    setEditReason('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;
    if (!editReason.trim()) {
      showToast('Audit reason for edit is required', 'error');
      return;
    }

    try {
      await api.request(`/time-clock/${editingEntry.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          clockInAt: new Date(editClockIn).toISOString(),
          clockOutAt: editClockOut ? new Date(editClockOut).toISOString() : null,
          editReason
        })
      });
      showToast('Time entry corrected cleanly');
      setEditingEntry(null);
      loadTimeEntries();
    } catch (err: any) {
      showToast(err.message || 'Failed to edit time entry', 'error');
    }
  };

  const currentlyClockedInUsers = entries.filter(e => !e.clockOutAt);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 lg:pb-0">
      
      {/* Employee Punch Centerpiece */}
      <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-9 rounded-2xl border border-gray-200/80 shadow-soft text-center space-y-6 relative overflow-hidden">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold uppercase tracking-wider mb-2 border border-indigo-100">
            <Clock className="w-3.5 h-3.5" />
            <span>Real-Time Attendance Clock</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Digital Time Clock</h2>
          <p className="text-xs text-gray-500 font-medium">Tap the centerpiece button below to log shift punch-in or punch-out</p>
        </div>

        {/* Large Punch Button */}
        <div className="flex flex-col items-center justify-center relative z-10 py-2">
          {activeEntry ? (
            <button
              onClick={handlePunchOut}
              disabled={isLoading}
              className="w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:to-teal-800 transition-all duration-300 shadow-glow flex flex-col items-center justify-center text-white border-4 border-emerald-300/80 ring-8 ring-emerald-500/20 animate-pulse-subtle active-press cursor-pointer"
            >
              <Square className="w-9 h-9 sm:w-11 sm:h-11 mb-2 fill-current drop-shadow-md" />
              <span className="font-extrabold text-base sm:text-xl uppercase tracking-widest text-emerald-50 drop-shadow">Punch Out</span>
              <span className="font-mono text-xl sm:text-2xl font-black mt-1.5 bg-emerald-950/40 backdrop-blur-md px-4 py-1 rounded-full border border-emerald-300/30 text-white tracking-widest shadow-inner">
                {formatTimer(elapsedSeconds)}
              </span>
            </button>
          ) : (
            <button
              onClick={handlePunchIn}
              disabled={isLoading}
              className="w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lifted flex flex-col items-center justify-center text-white border-4 border-slate-700/80 hover:border-indigo-400/80 ring-8 ring-indigo-500/10 active-press cursor-pointer group"
            >
              <Play className="w-10 h-10 sm:w-12 sm:h-12 ml-1.5 mb-2 fill-current text-indigo-400 group-hover:text-white transition-colors" />
              <span className="font-extrabold text-xl sm:text-2xl uppercase tracking-widest text-slate-100 group-hover:text-white">Punch In</span>
              <span className="text-xs text-indigo-300/90 font-semibold mt-1">Ready for shift</span>
            </button>
          )}
        </div>
      </div>

      {/* Manager Oversight: Who's Clocked In Now */}
      {isManager && (
        <div className="bg-white p-5 rounded-card border border-gray-200 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live: Currently Clocked In ({currentlyClockedInUsers.length})
            </h3>
          </div>

          {currentlyClockedInUsers.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded-card text-center text-xs text-gray-400">
              No staff are currently clocked in right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {currentlyClockedInUsers.map(e => (
                <div key={e.id} className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-card flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    {e.user?.firstName?.[0]}{e.user?.lastName?.[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-xs">{e.user?.firstName} {e.user?.lastName}</div>
                    <div className="text-[11px] text-emerald-700 font-mono font-medium">
                      In since {new Date(e.clockInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Time Entries History Table */}
      <div className="bg-white rounded-card border border-gray-200 shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">Time Log History</h3>
          <span className="text-xs text-gray-500">{entries.length} Total Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Clock In</th>
                <th className="p-3">Clock Out</th>
                <th className="p-3">Status</th>
                {isManager && <th className="p-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map(e => (
                <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3 font-medium text-gray-900">
                    {e.user ? `${e.user.firstName} ${e.user.lastName}` : 'Current User'}
                  </td>
                  <td className="p-3 text-gray-600">
                    {new Date(e.clockInAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3 text-gray-600">
                    {e.clockOutAt ? new Date(e.clockOutAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : (
                      <span className="text-emerald-600 font-semibold italic">Active Now</span>
                    )}
                  </td>
                  <td className="p-3">
                    <StatusChip status={e.status} />
                    {e.editedByManager && (
                      <span className="ml-2 text-[10px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Edited
                      </span>
                    )}
                  </td>
                  {isManager && (
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleOpenEdit(e)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-btn transition-colors"
                        title="Audit / Correct Entry"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manager Audit Edit Modal */}
      <Modal isOpen={!!editingEntry} onClose={() => setEditingEntry(null)} title="Audit / Correct Time Entry">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-card text-xs text-amber-800 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Audit Preservation Active: Original clock times will be stored in historical logs.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Clock In Time</label>
            <input
              type="datetime-local"
              required
              value={editClockIn}
              onChange={(e) => setEditClockIn(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-btn text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Clock Out Time</label>
            <input
              type="datetime-local"
              value={editClockOut}
              onChange={(e) => setEditClockOut(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-btn text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Edit (Required for Audit)</label>
            <textarea
              rows={2}
              required
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-btn text-sm"
              placeholder="e.g. Employee forgot to punch out at end of shift"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setEditingEntry(null)}>Cancel</Button>
            <Button type="submit">Save Audit Edit</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
