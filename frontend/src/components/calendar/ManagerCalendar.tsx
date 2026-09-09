import React, { useState, useCallback } from 'react';
import { Shift, User } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { CreateShiftModal } from './CreateShiftModal';
import { ShiftDetailModal } from './ShiftDetailModal';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, User as UserIcon } from 'lucide-react';
import { useDataSync } from '../../hooks/useDataSync';

export const ManagerCalendar: React.FC = () => {
  const { showToast } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(d.setDate(diff));
  });

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Dragging state
  const [draggedShiftId, setDraggedShiftId] = useState<string | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ userId: string | null; dateIso: string } | null>(null);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return {
      date: d,
      iso: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString([], { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: new Date().toDateString() === d.toDateString()
    };
  });

  const loadData = useCallback(async () => {
    try {
      const [shiftList, userList] = await Promise.all([
        api.request<Shift[]>('/shifts'),
        api.request<User[]>('/users')
      ]);
      setShifts(shiftList || []);
      setUsers(userList || []);
    } catch (err: any) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useDataSync(loadData, 5000);

  const handlePrevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  // Drag & Drop Handlers with Optimistic UI & Rollback on 409 Conflict
  const handleDragStart = (e: React.DragEvent, shiftId: string) => {
    setDraggedShiftId(shiftId);
    e.dataTransfer.setData('text/plain', shiftId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, userId: string | null, dateIso: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCell({ userId, dateIso });
  };

  const handleDrop = async (e: React.DragEvent, targetUserId: string | null, targetDateIso: string) => {
    e.preventDefault();
    setDragOverCell(null);
    if (!draggedShiftId) return;

    const originalShifts = [...shifts];
    const targetShift = shifts.find(s => s.id === draggedShiftId);
    if (!targetShift) return;

    // Calculate new startAt & endAt keeping shift duration intact
    const originalStart = new Date(targetShift.startAt);
    const originalEnd = new Date(targetShift.endAt);
    const durationMs = originalEnd.getTime() - originalStart.getTime();

    const [year, month, day] = targetDateIso.split('-').map(Number);
    const newStart = new Date(originalStart);
    newStart.setFullYear(year, month - 1, day);
    const newEnd = new Date(newStart.getTime() + durationMs);

    // Optimistic UI Update
    const updatedShifts = shifts.map(s => {
      if (s.id === draggedShiftId) {
        const assigned = users.find(u => u.id === targetUserId);
        return {
          ...s,
          assignedUserId: targetUserId,
          assignedUser: assigned ? { id: assigned.id, firstName: assigned.firstName, lastName: assigned.lastName } : null,
          startAt: newStart.toISOString(),
          endAt: newEnd.toISOString()
        };
      }
      return s;
    });

    setShifts(updatedShifts);
    setDraggedShiftId(null);

    // Reconcile with Server
    try {
      await api.request(`/shifts/${draggedShiftId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          assignedUserId: targetUserId,
          startAt: newStart.toISOString(),
          endAt: newEnd.toISOString()
        })
      });
      showToast('Shift reassigned successfully!', 'success');
    } catch (err: any) {
      // Revert Optimistic Update on 409 Conflict or Error
      setShifts(originalShifts);
      showToast(err.message || 'Scheduling conflict — shift reverted', 'error');
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-card border border-gray-200 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-base sm:text-lg">Team Schedule</h2>
            <p className="text-xs text-gray-500">
              Week of {weekDays[0].date.toLocaleDateString([], { month: 'short', day: 'numeric' })} – {weekDays[6].date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-gray-100 p-1 rounded-btn">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-white rounded-md text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentWeekStart(new Date())}
              className="px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-white rounded-md transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-white rounded-md text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 text-white px-3.5 sm:px-4 py-2 rounded-btn text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 shadow-soft hover:bg-indigo-700 transition-all active-press"
          >
            <Plus className="w-4 h-4" />
            <span>Add Shift</span>
          </button>
        </div>
      </div>

      {/* Main Drag & Drop Calendar Grid */}
      <div className="bg-white rounded-card border border-gray-200 shadow-soft overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/70">
              <th className="w-48 p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50/90 backdrop-blur z-10 border-r border-gray-200">
                Employee
              </th>
              {weekDays.map(day => (
                <th key={day.iso} className={`p-3 text-center text-xs font-semibold border-r border-gray-100 last:border-0 ${day.isToday ? 'bg-indigo-50/50 text-indigo-700' : 'text-gray-600'}`}>
                  <div className="uppercase tracking-wider text-[11px] text-gray-400">{day.dayName}</div>
                  <div className={`text-base font-bold mt-0.5 ${day.isToday ? 'w-7 h-7 bg-indigo-600 text-white rounded-full mx-auto flex items-center justify-center' : ''}`}>
                    {day.dayNum}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            
            {/* Unassigned / Open Shifts Row */}
            <tr className="bg-amber-50/30">
              <td className="p-3 font-semibold text-amber-800 text-xs sticky left-0 bg-amber-50/90 backdrop-blur z-10 border-r border-gray-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Open Shifts (Unassigned)</span>
              </td>
              {weekDays.map(day => {
                const dayShifts = shifts.filter(s => s.assignedUserId === null && s.startAt.startsWith(day.iso));
                const isOver = dragOverCell?.userId === null && dragOverCell?.dateIso === day.iso;
                return (
                  <td
                    key={day.iso}
                    onDragOver={(e) => handleDragOver(e, null, day.iso)}
                    onDrop={(e) => handleDrop(e, null, day.iso)}
                    className={`p-2 border-r border-gray-100 last:border-0 align-top transition-colors min-h-[80px] ${isOver ? 'bg-indigo-100/50 ring-2 ring-indigo-400 inset-0' : ''}`}
                  >
                    <div className="space-y-1.5">
                      {dayShifts.map(shift => (
                        <div
                          key={shift.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, shift.id)}
                          onClick={() => setSelectedShift(shift)}
                          className="p-2 rounded-lg bg-white border-2 border-dashed border-amber-400 text-amber-900 cursor-grab active:cursor-grabbing hover:shadow-lifted transition-all text-xs"
                        >
                          <div className="font-semibold">{shift.title}</div>
                          <div className="text-[11px] text-amber-700 mt-0.5">
                            {new Date(shift.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Employee Rows */}
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-3 sticky left-0 bg-white z-10 border-r border-gray-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-xs">{u.firstName} {u.lastName}</div>
                      <div className="text-[10px] text-gray-400">{u.role}</div>
                    </div>
                  </div>
                </td>
                {weekDays.map(day => {
                  const dayShifts = shifts.filter(s => s.assignedUserId === u.id && s.startAt.startsWith(day.iso));
                  const isOver = dragOverCell?.userId === u.id && dragOverCell?.dateIso === day.iso;
                  return (
                    <td
                      key={day.iso}
                      onDragOver={(e) => handleDragOver(e, u.id, day.iso)}
                      onDrop={(e) => handleDrop(e, u.id, day.iso)}
                      className={`p-2 border-r border-gray-100 last:border-0 align-top transition-colors min-h-[90px] ${isOver ? 'bg-indigo-100/50 ring-2 ring-indigo-400' : ''}`}
                    >
                      <div className="space-y-1.5">
                        {dayShifts.map(shift => (
                          <div
                            key={shift.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, shift.id)}
                            onClick={() => setSelectedShift(shift)}
                            className="p-2 rounded-lg bg-indigo-600 text-white shadow-soft cursor-grab active:cursor-grabbing hover:scale-[1.02] hover:shadow-lifted transition-all text-xs"
                          >
                            <div className="font-semibold text-white">{shift.title}</div>
                            <div className="text-[11px] text-indigo-100 mt-0.5">
                              {new Date(shift.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <CreateShiftModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onShiftCreated={loadData}
        users={users}
      />

      <ShiftDetailModal
        shift={selectedShift}
        isOpen={!!selectedShift}
        onClose={() => setSelectedShift(null)}
        onShiftUpdated={loadData}
        users={users}
      />

    </div>
  );
};
