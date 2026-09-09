import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { User } from '../../types';
import { api } from '../../services/api';
import { AlertCircle, Clock, Calendar as CalendarIcon, User as UserIcon } from 'lucide-react';

interface CreateShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShiftCreated: () => void;
  users: User[];
  defaultDate?: string;
}

export const CreateShiftModal: React.FC<CreateShiftModalProps> = ({
  isOpen,
  onClose,
  onShiftCreated,
  users,
  defaultDate
}) => {
  const [title, setTitle] = useState('');
  const [assignedUserId, setAssignedUserId] = useState<string>('');
  const [date, setDate] = useState<string>(defaultDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [breakMinutes, setBreakMinutes] = useState(30);
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  useEffect(() => {
    if (defaultDate) setDate(defaultDate);
  }, [defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setWarningMsg(null);
    setIsSubmitting(true);

    try {
      const startIso = new Date(`${date}T${startTime}:00`).toISOString();
      const endIso = new Date(`${date}T${endTime}:00`).toISOString();

      const res = await api.request<any>('/shifts', {
        method: 'POST',
        body: JSON.stringify({
          title,
          assignedUserId: assignedUserId || null,
          startAt: startIso,
          endAt: endIso,
          breakMinutes,
          notes
        })
      });

      if (res.timeOffWarningMessage) {
        setWarningMsg(res.timeOffWarningMessage);
      }

      onShiftCreated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Shift">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Error / Conflict Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-card flex items-start gap-2 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Warning Alert (e.g. Time Off) */}
        {warningMsg && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-card flex items-start gap-2 text-amber-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{warningMsg}</span>
          </div>
        )}

        {/* Shift Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Shift Title / Role</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-btn text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g. Barista Morning, Cashier, Kitchen Staff"
          />
        </div>

        {/* Employee Assignee Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <UserIcon className="w-3.5 h-3.5 text-gray-400" />
            Assign Employee (Optional)
          </label>
          <select
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-btn text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">-- Leave Unassigned (Open Shift) --</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName} ({u.role})
              </option>
            ))}
          </select>
        </div>

        {/* Date Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
            Shift Date
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-btn text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Start / End Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              Start Time
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-btn text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              End Time
            </label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-btn text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Break Minutes */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Unpaid Break (Minutes)</label>
          <input
            type="number"
            min="0"
            step="5"
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-btn text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Instructions</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-btn text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Special instructions for the shift..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Create Shift</Button>
        </div>

      </form>
    </Modal>
  );
};
