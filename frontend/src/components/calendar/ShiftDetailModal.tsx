import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Shift, User } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, User as UserIcon, Trash2, ArrowLeftRight } from 'lucide-react';

interface ShiftDetailModalProps {
  shift: Shift | null;
  isOpen: boolean;
  onClose: () => void;
  onShiftUpdated: () => void;
  users: User[];
}

export const ShiftDetailModal: React.FC<ShiftDetailModalProps> = ({
  shift,
  isOpen,
  onClose,
  onShiftUpdated,
  users
}) => {
  const { user, showToast } = useAuth();
  const isManager = user?.role === 'MANAGER';
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  if (!shift) return null;

  const startDate = new Date(shift.startAt);
  const endDate = new Date(shift.endAt);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to cancel and delete this shift? Any pending shift swap will be auto-cancelled.')) {
      return;
    }
    setIsDeleting(true);
    try {
      await api.request(`/shifts/${shift.id}`, { method: 'DELETE' });
      showToast('Shift cancelled & deleted cleanly');
      onShiftUpdated();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete shift', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProposeSwap = async () => {
    setIsSwapping(true);
    try {
      await api.request('/swaps', {
        method: 'POST',
        body: JSON.stringify({ shiftId: shift.id })
      });
      showToast('Shift swap offer submitted successfully!');
      onShiftUpdated();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to propose swap', 'error');
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Shift Details">
      <div className="space-y-4">
        <div className="p-4 bg-indigo-50/60 rounded-card border border-indigo-100">
          <div className="font-bold text-gray-900 text-lg">{shift.title}</div>
          <div className="flex items-center gap-2 text-xs text-indigo-700 font-medium mt-1">
            <Clock className="w-4 h-4" />
            <span>
              {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({shift.breakMinutes}m break)
            </span>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-medium">Date:</span>
            <span>{startDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-gray-400" />
            <span className="font-medium">Assigned To:</span>
            <span>
              {shift.assignedUser ? `${shift.assignedUser.firstName} ${shift.assignedUser.lastName}` : (
                <span className="text-amber-600 font-semibold italic">Unassigned (Open Shift)</span>
              )}
            </span>
          </div>

          {shift.notes && (
            <div className="p-3 bg-gray-50 rounded-card text-xs text-gray-600 border border-gray-100">
              <span className="font-semibold block text-gray-700 mb-0.5">Manager Notes:</span>
              {shift.notes}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {isManager ? (
            <Button variant="danger" size="sm" icon={<Trash2 className="w-4 h-4" />} onClick={handleDelete} isLoading={isDeleting}>
              Cancel Shift
            </Button>
          ) : (
            shift.assignedUserId === user?.id && (
              <Button variant="secondary" size="sm" icon={<ArrowLeftRight className="w-4 h-4" />} onClick={handleProposeSwap} isLoading={isSwapping}>
                Request Swap
              </Button>
            )
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};
