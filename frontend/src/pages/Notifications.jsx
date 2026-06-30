import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  notificationStart, 
  notificationFailure, 
  fetchNotificationsSuccess,
  markNotificationAsReadSuccess,
  markAllNotificationsAsReadSuccess
} from '../redux/slices/notificationSlice.js';
import api from '../services/api.js';
import { Bell, Check, CheckCheck, Loader2, AlertCircle } from 'lucide-react';

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, loading, error } = useSelector((state) => state.notification);

  const loadNotifications = async () => {
    dispatch(notificationStart());
    try {
      const response = await api.get('/notifications');
      dispatch(fetchNotificationsSuccess(response.data.notifications));
    } catch (err) {
      dispatch(notificationFailure(err.response?.data?.message || 'Failed to fetch notifications'));
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [dispatch]);

  const handleMarkAsRead = async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      if (response.data.success) {
        dispatch(markNotificationAsReadSuccess(response.data.notification));
      }
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    dispatch(notificationStart());
    try {
      const response = await api.put('/notifications/read-all');
      if (response.data.success) {
        dispatch(markAllNotificationsAsReadSuccess());
      }
    } catch (err) {
      dispatch(notificationFailure(err.response?.data?.message || 'Failed to update notifications'));
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-dark-900 dark:text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-brand-500" />
            <span>Notifications</span>
          </h1>
          <p className="text-sm text-dark-500">Stay updated on account applications, transaction credits, and alerts.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={loading}
            className="px-4 py-2 bg-dark-200 hover:bg-dark-300 dark:bg-dark-800 dark:hover:bg-dark-700 text-dark-700 dark:text-dark-200 rounded-xl font-semibold text-xs transition flex items-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main notifications log card */}
      <div className="glass-card divide-y divide-dark-200/50 dark:divide-dark-800/50 p-0 overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="py-12 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-dark-400 text-sm italic">
            You have no notifications at this time.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
              className={`p-5 flex gap-4 transition duration-150 cursor-pointer ${
                notif.isRead 
                  ? 'hover:bg-dark-100/10 dark:hover:bg-dark-900/10' 
                  : 'bg-brand-500/5 hover:bg-brand-500/10 border-l-2 border-brand-500'
              }`}
            >
              {/* Icon Container */}
              <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center border ${
                notif.isRead
                  ? 'bg-dark-100/50 dark:bg-dark-800/40 border-dark-200/50 dark:border-dark-800/50 text-dark-500'
                  : 'bg-brand-100/70 dark:bg-brand-900/20 border-brand-500/20 text-brand-500 dark:text-brand-400'
              }`}>
                <Bell className="w-4 h-4" />
              </div>

              {/* Text contents */}
              <div className="flex-1 space-y-1 overflow-hidden">
                <div className="flex justify-between items-start gap-4">
                  <h4 className={`text-sm truncate ${notif.isRead ? 'font-semibold text-dark-700 dark:text-dark-300' : 'font-extrabold text-dark-900 dark:text-white'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-dark-400 whitespace-nowrap pt-0.5">
                    {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-dark-500 dark:text-dark-400 leading-relaxed">
                  {notif.message}
                </p>
              </div>

              {/* Actions helper for unread */}
              {!notif.isRead && (
                <div className="flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notif._id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-brand-500/15 text-brand-500 transition"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
