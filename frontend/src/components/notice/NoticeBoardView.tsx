import React, { useState, useCallback } from 'react';
import { Notice } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Megaphone, Pin, Plus, Search, Trash2, Edit2, AlertCircle, Clock, User as UserIcon, Check } from 'lucide-react';
import { useDataSync } from '../../hooks/useDataSync';

export const NoticeBoardView: React.FC = () => {
  const { user, showToast } = useAuth();
  const isManager = user?.role === 'MANAGER';

  const [notices, setNotices] = useState<Notice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'LOW' | 'NORMAL' | 'URGENT'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'URGENT'>('NORMAL');
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadNotices = useCallback(async () => {
    try {
      const data = await api.request<Notice[]>('/notices');
      setNotices(data || []);
    } catch (e) {}
  }, []);

  useDataSync(loadNotices, 5000);

  const handleOpenCreateModal = () => {
    setEditingNoticeId(null);
    setTitle('');
    setContent('');
    setPriority('NORMAL');
    setIsPinned(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (notice: Notice) => {
    setEditingNoticeId(notice.id);
    setTitle(notice.title);
    setContent(notice.content);
    setPriority(notice.priority);
    setIsPinned(notice.isPinned);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNoticeId(null);
    setTitle('');
    setContent('');
    setPriority('NORMAL');
    setIsPinned(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Please enter notice title and content', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingNoticeId) {
        await api.request(`/notices/${editingNoticeId}`, {
          method: 'PATCH',
          body: JSON.stringify({ title, content, priority, isPinned })
        });
        showToast('Notice updated successfully!');
      } else {
        await api.request('/notices', {
          method: 'POST',
          body: JSON.stringify({ title, content, priority, isPinned })
        });
        showToast('New notice published cleanly!');
      }
      handleCloseModal();
      loadNotices();
    } catch (err: any) {
      showToast(err.message || 'Failed to save notice', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, noticeTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete notice "${noticeTitle}"?`)) return;
    try {
      await api.request(`/notices/${id}`, { method: 'DELETE' });
      showToast('Notice deleted successfully');
      loadNotices();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete notice', 'error');
    }
  };

  const handleTogglePin = async (notice: Notice) => {
    try {
      await api.request(`/notices/${notice.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isPinned: !notice.isPinned })
      });
      showToast(notice.isPinned ? 'Notice unpinned' : 'Notice pinned to top');
      loadNotices();
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle pin', 'error');
    }
  };

  // Filter Notices
  const filteredNotices = notices.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          n.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || n.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 lg:pb-0">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-gray-200 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm border border-indigo-100">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-xl">Notice Board</h2>
            <p className="text-xs text-gray-500 mt-0.5">Official company announcements & staff notices</p>
          </div>
        </div>

        {isManager && (
          <Button icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreateModal}>
            Post Notice
          </Button>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-card border border-gray-200 shadow-soft">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-btn text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Search notices..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-500 shrink-0 font-medium">Priority:</span>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as any)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-btn text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Notice List */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <div className="bg-white p-12 rounded-card border border-gray-200 shadow-soft text-center space-y-3">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-800 text-base">No Notices Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchTerm || priorityFilter !== 'ALL'
                ? 'No notices match your current search filters.'
                : isManager
                ? 'Click "Post Notice" above to publish your first announcement to the team.'
                : 'There are no active notices published by your manager at this time.'}
            </p>
          </div>
        ) : (
          filteredNotices.map(notice => (
            <div
              key={notice.id}
              className={`bg-white rounded-card border transition-all shadow-soft p-5 space-y-3 ${
                notice.isPinned
                  ? 'border-indigo-300 ring-2 ring-indigo-500/10 bg-gradient-to-r from-indigo-50/30 via-white to-white'
                  : 'border-gray-200'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {notice.isPinned && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-soft">
                        <Pin className="w-3 h-3 fill-white" />
                        PINNED
                      </span>
                    )}

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        notice.priority === 'URGENT'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : notice.priority === 'LOW'
                          ? 'bg-gray-100 text-gray-600 border-gray-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {notice.priority === 'URGENT' && <AlertCircle className="w-3 h-3" />}
                      {notice.priority}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug break-words">
                    {notice.title}
                  </h3>
                </div>

                {/* Manager Quick Controls */}
                {isManager && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleTogglePin(notice)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        notice.isPinned ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-50'
                      }`}
                      title={notice.isPinned ? 'Unpin notice' : 'Pin notice to top'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(notice)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit notice"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(notice.id, notice.title)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Card Body Message */}
              <div className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border-t border-b border-gray-100 py-3 break-words overflow-hidden">
                {notice.content}
              </div>

              {/* Card Footer Author & Time */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-gray-500 pt-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                    {notice.author?.firstName?.[0] || 'M'}
                  </div>
                  <span className="font-medium text-gray-700 truncate">
                    {notice.author?.firstName} {notice.author?.lastName} ({notice.author?.role || 'Manager'})
                  </span>
                </div>

                <div className="flex items-center gap-1 text-gray-400 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(notice.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post / Edit Notice Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingNoticeId ? 'Edit Notice' : 'Post New Notice'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Notice Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-btn text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Notice Content / Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-btn text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-btn text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Urgent</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span>Pin to Top of Notice Board</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingNoticeId ? 'Save Changes' : 'Publish Notice'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
