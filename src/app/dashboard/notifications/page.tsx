'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../hooks/store';
import { showToast } from '../../../features/ui/uiSlice';

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data);
        setUnreadCount(json.unread);
        setTotal(json.pagination.total);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
      const json = await res.json();
      if (json.success) {
        fetchNotifications();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('All notifications marked as read'));
        fetchNotifications();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('Notification deleted'));
        fetchNotifications();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all notifications?')) return;
    try {
      const res = await fetch('/api/notifications', { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('All notifications cleared'));
        fetchNotifications();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Notifications</h1>
          <p className="text-xs text-text-muted mt-1">Manage system alerts and review status updates regarding your submissions.</p>
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-2 self-start">
            <button onClick={handleMarkAllRead} className="px-3.5 py-2 border border-border-custom bg-cardBg hover:bg-border-light text-text-secondary text-xs font-bold rounded-lg transition-all cursor-pointer">
              Mark all read
            </button>
            <button onClick={handleClearAll} className="px-3.5 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-all cursor-pointer border-0">
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="bg-cardBg border border-border-custom rounded-xl shadow-card divide-y divide-border-custom">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <i className="fas fa-bell-slash text-4xl mb-3 text-primary/30"></i>
            <p className="text-sm font-semibold">No notifications</p>
            <p className="text-xs mt-1">You will receive alerts here when moderator reviews are finalized.</p>
          </div>
        ) : (
          notifications.map((n) => {
            let icon = 'fa-info-circle text-blue-500';
            if (n.type === 'approval') icon = 'fa-check-circle text-green-500';
            if (n.type === 'rejection') icon = 'fa-times-circle text-red-500';
            if (n.type === 'needs_revision') icon = 'fa-exclamation-triangle text-yellow-500';
            if (n.type === 'security') icon = 'fa-shield-alt text-purple-500';

            return (
              <div key={n._id} className={`p-5 flex items-start justify-between gap-4 transition-all ${!n.read ? 'bg-primary/5' : ''}`}>
                <div className="flex gap-4">
                  <div className="text-2xl mt-0.5">
                    <i className={`fas ${icon}`}></i>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                      <span>{n.title}</span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-primary inline-block" title="Unread"></span>
                      )}
                    </h3>
                    <p className="text-xs text-text-secondary">{n.message}</p>
                    <p className="text-[10px] text-text-muted">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-1.5 self-center">
                  {!n.read && (
                    <button onClick={() => handleMarkAsRead(n._id)} className="p-1.5 text-primary hover:bg-primary/10 rounded bg-transparent border-0 cursor-pointer text-xs font-bold" title="Mark Read">
                      <i className="fas fa-check"></i>
                    </button>
                  )}
                  <button onClick={() => handleDelete(n._id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded bg-transparent border-0 cursor-pointer text-xs font-bold" title="Delete">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
