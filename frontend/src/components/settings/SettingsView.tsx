import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Settings, Globe, Bell, Shield, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, business, showToast } = useAuth();
  const isManager = user?.role === 'MANAGER';

  const [timezone, setTimezone] = useState(business?.timezone || 'America/New_York');
  const [reminderLeadTime, setReminderLeadTime] = useState(business?.reminderLeadTimeMinutes || 120);
  const [smsEnabled, setSmsEnabled] = useState(user?.notificationPrefs?.smsEnabled ?? true);
  const [emailEnabled, setEmailEnabled] = useState(user?.notificationPrefs?.emailEnabled ?? true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Settings saved successfully!');
  };

  const ianaTimezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Kolkata',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-card border border-gray-200 shadow-soft">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg">System & Profile Settings</h2>
          <p className="text-xs text-gray-500">Configure business timezone, notifications, and preferences</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Business Timezone Settings (Manager) */}
        {isManager && (
          <div className="bg-white p-6 rounded-card border border-gray-200 shadow-soft space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              Business Timezone & Reminders
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Canonical Business IANA Timezone (Drives all shift date math)
              </label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full px-3 py-2 border rounded-btn text-sm focus:ring-2 focus:ring-indigo-500"
              >
                {ianaTimezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Shift Reminder Lead Time (Minutes ahead of shift start)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={reminderLeadTime}
                onChange={e => setReminderLeadTime(parseInt(e.target.value, 10) || 120)}
                className="w-full px-3 py-2 border rounded-btn text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">Default: 120 minutes (2 hours before shift starts)</p>
            </div>
          </div>
        )}

        {/* User Notification Preferences */}
        <div className="bg-white p-6 rounded-card border border-gray-200 shadow-soft space-y-4">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            Personal Notification Preferences
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-card cursor-pointer">
              <div>
                <div className="font-semibold text-xs text-gray-800">SMS Reminders & Notifications</div>
                <div className="text-[11px] text-gray-500">Receive shift reminders and swap updates via text message</div>
              </div>
              <input
                type="checkbox"
                checked={smsEnabled}
                onChange={e => setSmsEnabled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-card cursor-pointer">
              <div>
                <div className="font-semibold text-xs text-gray-800">Email Notifications</div>
                <div className="text-[11px] text-gray-500">Receive shift schedules and request approvals via email</div>
              </div>
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={e => setEmailEnabled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="w-full sm:w-auto" icon={<Save className="w-4 h-4" />}>
            Save Preferences
          </Button>
        </div>

      </form>
    </div>
  );
};
