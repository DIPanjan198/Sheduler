import React, { useState, useCallback } from 'react';
import { Shift } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ShiftDetailModal } from './ShiftDetailModal';
import { Calendar, Clock, RefreshCw, ArrowLeftRight, Sparkles } from 'lucide-react';
import { useDataSync } from '../../hooks/useDataSync';

export const EmployeeSchedule: React.FC = () => {
  const { user, showToast } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const loadShifts = useCallback(async () => {
    try {
      const data = await api.request<Shift[]>('/shifts');
      setShifts(data || []);
    } catch (err: any) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useDataSync(loadShifts, 5000);

  const getCountdownChip = (startAtIso: string) => {
    const now = new Date().getTime();
    const start = new Date(startAtIso).getTime();
    const diffMs = start - now;

    if (diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return (
        <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          Starts in {hours > 0 ? `${hours}h ` : ''}{mins}m
        </span>
      );
    }
    return null;
  };

  // Group shifts by day
  const groupedShifts = shifts.reduce((acc, shift) => {
    const dayKey = new Date(shift.startAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(shift);
    return acc;
  }, {} as Record<string, Shift[]>);

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-12 lg:pb-0">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-card border border-gray-200 shadow-soft">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">My Shift Schedule</h2>
          <p className="text-xs text-gray-500">Upcoming assigned work shifts</p>
        </div>
        <button
          onClick={loadShifts}
          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
          title="Refresh Schedule"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Shifts Agenda List */}
      {Object.keys(groupedShifts).length === 0 ? (
        <div className="bg-white p-8 rounded-card border border-gray-200 text-center space-y-3 shadow-soft">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gray-800 text-base">No Upcoming Shifts Scheduled</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You currently have no assigned shifts. Enjoy your time off or check back later!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedShifts).map(([dayLabel, dayShifts]) => (
            <div key={dayLabel} className="space-y-2">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
                {dayLabel}
              </div>

              {dayShifts.map(shift => {
                const startDate = new Date(shift.startAt);
                const endDate = new Date(shift.endAt);
                const countdown = getCountdownChip(shift.startAt);

                return (
                  <div
                    key={shift.id}
                    className="bg-white p-4 rounded-card border border-gray-200 shadow-soft hover:shadow-lifted transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-base break-words">{shift.title}</span>
                        {countdown}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>
                            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className="text-gray-400">({shift.breakMinutes}m break)</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedShift(shift)}
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2.5 sm:py-2 rounded-btn transition-colors active-press w-full sm:w-auto shrink-0"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>Request Swap</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Shift Detail / Swap Modal */}
      <ShiftDetailModal
        shift={selectedShift}
        isOpen={!!selectedShift}
        onClose={() => setSelectedShift(null)}
        onShiftUpdated={loadShifts}
        users={[]}
      />

    </div>
  );
};
