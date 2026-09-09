import React, { useState, useCallback } from 'react';
import { TimeOffRequest, ShiftSwapRequest } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { StatusChip } from '../ui/StatusChip';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Inbox, Calendar, ArrowLeftRight, Check, X, Plus } from 'lucide-react';
import { useDataSync } from '../../hooks/useDataSync';

export const RequestsView: React.FC = () => {
  const { user, showToast } = useAuth();
  const isManager = user?.role === 'MANAGER';

  const [activeSubTab, setActiveSubTab] = useState<'timeoff' | 'swaps'>('timeoff');
  const [timeOffList, setTimeOffList] = useState<TimeOffRequest[]>([]);
  const [swapsList, setSwapsList] = useState<ShiftSwapRequest[]>([]);

  // Create Time Off Modal
  const [isCreateTimeOffOpen, setIsCreateTimeOffOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Deny Reason Modal
  const [denyingTimeOffId, setDenyingTimeOffId] = useState<string | null>(null);
  const [managerNote, setManagerNote] = useState('');

  const loadRequests = useCallback(async () => {
    try {
      const [to, sw] = await Promise.all([
        api.request<TimeOffRequest[]>('/time-off'),
        api.request<ShiftSwapRequest[]>('/swaps')
      ]);
      setTimeOffList(to || []);
      setSwapsList(sw || []);
    } catch (e) {}
  }, []);

  useDataSync(loadRequests, 5000);

  const handleCreateTimeOff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.request('/time-off', {
        method: 'POST',
        body: JSON.stringify({ startDate, endDate, reason })
      });
      showToast('Time off request submitted!');
      setIsCreateTimeOffOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      loadRequests();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit time off request', 'error');
    }
  };

  const handleApproveTimeOff = async (id: string) => {
    try {
      await api.request(`/time-off/${id}/approve`, { method: 'PATCH' });
      showToast('Time off request approved');
      loadRequests();
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    }
  };

  const handleDenyTimeOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!denyingTimeOffId) return;
    try {
      await api.request(`/time-off/${denyingTimeOffId}/deny`, {
        method: 'PATCH',
        body: JSON.stringify({ managerNote })
      });
      showToast('Time off request denied');
      setDenyingTimeOffId(null);
      setManagerNote('');
      loadRequests();
    } catch (err: any) {
      showToast(err.message || 'Denial failed', 'error');
    }
  };

  const handleClaimSwap = async (swapId: string) => {
    try {
      await api.request(`/swaps/${swapId}/claim`, { method: 'POST' });
      showToast('Shift swap offer claimed! Pending manager approval.');
      loadRequests();
    } catch (err: any) {
      showToast(err.message || 'Failed to claim swap offer', 'error');
    }
  };

  const handleApproveSwap = async (swapId: string) => {
    try {
      await api.request(`/swaps/${swapId}/approve`, { method: 'PATCH' });
      showToast('Shift swap approved! Shift assignment updated atomically.');
      loadRequests();
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    }
  };

  const handleDenySwap = async (swapId: string) => {
    try {
      await api.request(`/swaps/${swapId}/deny`, { method: 'PATCH' });
      showToast('Shift swap denied.');
      loadRequests();
    } catch (err: any) {
      showToast(err.message || 'Denial failed', 'error');
    }
  };

  const handleCancelSwap = async (swapId: string) => {
    try {
      await api.request(`/swaps/${swapId}/cancel`, { method: 'PATCH' });
      showToast('Shift swap offer cancelled.');
      loadRequests();
    } catch (err: any) {
      showToast(err.message || 'Cancel failed', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 lg:pb-0">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-card border border-gray-200 shadow-soft">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">Requests Center</h2>
          <p className="text-xs text-gray-500">Manage time off and shift swap proposals</p>
        </div>

        <div className="flex items-center gap-2">
          {!isManager && (
            <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateTimeOffOpen(true)}>
              Request Time Off
            </Button>
          )}
        </div>
      </div>

      {/* Subtabs */}
      <div className="flex border-b border-gray-200 bg-white px-2 sm:px-4 rounded-t-card overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('timeoff')}
          className={`py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors shrink-0 ${
            activeSubTab === 'timeoff' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Time Off Requests</span>
          <span className="bg-gray-100 text-gray-600 text-[11px] sm:text-xs px-2 py-0.5 rounded-full font-bold">{timeOffList.length}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('swaps')}
          className={`py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors shrink-0 ${
            activeSubTab === 'swaps' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Shift Swaps</span>
          <span className="bg-gray-100 text-gray-600 text-[11px] sm:text-xs px-2 py-0.5 rounded-full font-bold">{swapsList.length}</span>
        </button>
      </div>

      {/* Time Off Tab Content */}
      {activeSubTab === 'timeoff' && (
        <div className="space-y-3">
          {timeOffList.length === 0 ? (
            <div className="bg-white p-8 rounded-card border border-gray-200 text-center text-xs text-gray-400">
              No time off requests found.
            </div>
          ) : (
            timeOffList.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-card border border-gray-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">
                      {item.user ? `${item.user.firstName} ${item.user.lastName}` : 'My Request'}
                    </span>
                    <StatusChip status={item.status} />
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold">Range:</span> {item.startDate} to {item.endDate}
                  </div>
                  {item.reason && <div className="text-xs text-gray-500 italic">"{item.reason}"</div>}
                  {item.managerNote && (
                    <div className="text-xs text-rose-600 font-medium">Manager Note: {item.managerNote}</div>
                  )}
                </div>

                {isManager && item.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="success" icon={<Check className="w-4 h-4" />} onClick={() => handleApproveTimeOff(item.id)}>
                      Approve
                    </Button>
                    <Button size="sm" variant="danger" icon={<X className="w-4 h-4" />} onClick={() => setDenyingTimeOffId(item.id)}>
                      Deny
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Shift Swaps Tab Content */}
      {activeSubTab === 'swaps' && (
        <div className="space-y-3">
          {swapsList.length === 0 ? (
            <div className="bg-white p-8 rounded-card border border-gray-200 text-center text-xs text-gray-400">
              No shift swap requests found.
            </div>
          ) : (
            swapsList.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-card border border-gray-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">{item.originalShift?.title || 'Shift Swap'}</span>
                    <StatusChip status={item.status} />
                  </div>
                  <div className="text-xs text-gray-600">
                    Offered by <span className="font-semibold text-gray-800">{item.requestedByUser?.firstName} {item.requestedByUser?.lastName}</span>
                    {item.claimedByUser && (
                      <span> → Claimed by <span className="font-semibold text-indigo-600">{item.claimedByUser.firstName} {item.claimedByUser.lastName}</span></span>
                    )}
                  </div>
                </div>

                {/* Employee Accept/Claim Button */}
                {!isManager && item.status === 'OPEN' && item.requestedByUserId !== user?.id && (
                  <Button size="sm" variant="secondary" icon={<Check className="w-4 h-4" />} onClick={() => handleClaimSwap(item.id)}>
                    Accept Shift Swap
                  </Button>
                )}

                {/* Swap Owner Cancel Button */}
                {item.requestedByUserId === user?.id && (item.status === 'OPEN' || item.status === 'CLAIMED') && (
                  <Button size="sm" variant="ghost" icon={<X className="w-4 h-4 text-rose-500" />} onClick={() => handleCancelSwap(item.id)}>
                    Cancel Swap
                  </Button>
                )}

                {/* Manager Approve / Deny Buttons for Claimed Swaps */}
                {isManager && item.status === 'CLAIMED' && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="success" icon={<Check className="w-4 h-4" />} onClick={() => handleApproveSwap(item.id)}>
                      Approve Swap
                    </Button>
                    <Button size="sm" variant="danger" icon={<X className="w-4 h-4" />} onClick={() => handleDenySwap(item.id)}>
                      Deny
                    </Button>
                  </div>
                )}

                {/* Manager Status / Deny for Open Swaps */}
                {isManager && item.status === 'OPEN' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-medium">
                      Awaiting Co-worker Acceptance
                    </span>
                    <Button size="sm" variant="danger" icon={<X className="w-4 h-4" />} onClick={() => handleDenySwap(item.id)}>
                      Deny
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Time Off Modal */}
      <Modal isOpen={isCreateTimeOffOpen} onClose={() => setIsCreateTimeOffOpen(false)} title="Request Time Off">
        <form onSubmit={handleCreateTimeOff} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
            <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-btn text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
            <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-btn text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Reason (Optional)</label>
            <textarea rows={2} value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 border rounded-btn text-sm" placeholder="e.g. Family vacation" />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="ghost" onClick={() => setIsCreateTimeOffOpen(false)}>Cancel</Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </Modal>

      {/* Deny Time Off Reason Modal */}
      <Modal isOpen={!!denyingTimeOffId} onClose={() => setDenyingTimeOffId(null)} title="Deny Time Off Request">
        <form onSubmit={handleDenyTimeOff} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Denial (Shown to Employee)</label>
            <textarea rows={3} value={managerNote} onChange={e => setManagerNote(e.target.value)} className="w-full px-3 py-2 border rounded-btn text-sm" placeholder="e.g. High customer volume expected on this day" />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="ghost" onClick={() => setDenyingTimeOffId(null)}>Cancel</Button>
            <Button type="submit" variant="danger">Confirm Denial</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
