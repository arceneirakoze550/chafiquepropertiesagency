import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, ExternalLink, Sparkles, MessageSquare, Calendar } from 'lucide-react';
import { AppNotification } from '../../types';
import { getNotifications, markNotificationAsRead, deleteNotification, clearAllNotifications } from '../../services/notificationService';
import { AdminTab } from './AdminLayout';

interface AdminNotificationsProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export const AdminNotifications: React.FC<AdminNotificationsProps> = ({ onNavigateTab }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await getNotifications();
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = async () => {
    if (confirm('Clear all notification history?')) {
      await clearAllNotifications();
      setNotifications([]);
    }
  };

  const handleAction = async (notif: AppNotification) => {
    if (!notif.read) {
      await handleMarkRead(notif.id);
    }
    if (notif.link?.includes('inquiries')) {
      onNavigateTab('inquiries');
    } else if (notif.link?.includes('reservations')) {
      onNavigateTab('reservations');
    } else if (notif.link?.includes('properties')) {
      onNavigateTab('properties');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Notification Audit Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            System alerts, incoming leads, and calendar tour events.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
          >
            Clear All Logs
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Bell className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">No Notifications</h3>
            <p className="text-xs text-slate-400">All alerts and client leads have been cleared.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                notif.read ? 'bg-white' : 'bg-indigo-50/50'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  notif.type === 'inquiry'
                    ? 'bg-amber-100 text-amber-700'
                    : notif.type === 'reservation'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {notif.type === 'inquiry' ? (
                    <MessageSquare className="w-4 h-4" />
                  ) : notif.type === 'reservation' ? (
                    <Calendar className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">{notif.title}</h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 block pt-0.5">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {notif.link && (
                  <button
                    onClick={() => handleAction(notif)}
                    className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Open
                  </button>
                )}

                {!notif.read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
