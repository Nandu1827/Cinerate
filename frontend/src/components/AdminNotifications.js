import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AdminNotifications.css';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not signed in.');
        setNotifications([]);
        return;
      }

      const response = await axios.get('http://localhost:15400/api/notifications/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        setNotifications(response.data);
        setError('');
      } else {
        setError('Invalid notifications data received.');
        setNotifications([]);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You must be an admin to view notifications.');
      } else {
        setError('Could not load notifications. Please try again.');
      }
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkRead = async (notification) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.put(
        `http://localhost:15400/api/notifications/admin/notifications/${notification._id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
      );
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e, notification) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm('Delete this notification permanently?')) return;

    const id = notification._id ?? notification.id;
    if (!id) {
      setDeleteError('Invalid notification.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      setDeleteError('');
      setDeletingId(id);
      await axios.delete(
        `http://localhost:15400/api/notifications/admin/notifications/${encodeURIComponent(String(id))}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications((prev) => prev.filter((n) => (n._id ?? n.id) !== id));
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' ? 'Cannot reach the server. Is the backend running on port 15400?' : null) ||
        'Could not delete notification.';
      setDeleteError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="notifications-page">
      <header className="cine-page-header">
        <h1 className="cine-page-title">Notifications</h1>
        <p className="cine-page-subtitle">Contact form messages and alerts for admins.</p>
      </header>

      {loading && <p className="notifications-loading">Loading…</p>}
      {!loading && error && <div className="error-message">{error}</div>}
      {deleteError && (
        <div className="error-message notifications-delete-error" role="alert">
          {deleteError}
          <button
            type="button"
            className="notifications-delete-error-dismiss"
            onClick={() => setDeleteError('')}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="notifications-list-card">
          {notifications.length === 0 ? (
            <p className="notifications-empty">No notifications yet.</p>
          ) : (
            <ul className="notifications-list">
              {notifications.map((n) => (
                <li
                  key={n._id}
                  className={`notification-list-item${!n.isRead ? ' notification-list-item--unread' : ''}`}
                >
                  <button
                    type="button"
                    className="notification-row-main"
                    onClick={() => !n.isRead && handleMarkRead(n)}
                    disabled={n.isRead}
                    aria-label={n.isRead ? 'Notification (read)' : 'Mark as read'}
                  >
                    <div className="notification-row-inner">
                      <div className="notification-row-title-row">
                        <strong>{n.name}</strong>
                        {!n.isRead && <span className="notification-row-badge">New</span>}
                      </div>
                      <span className="notification-row-email">{n.email}</span>
                      <p className="notification-row-msg">{n.message}</p>
                      <time className="notification-row-time">
                        {new Date(n.createdAt).toLocaleString()}
                      </time>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="notification-delete-btn"
                    onClick={(e) => handleDelete(e, n)}
                    disabled={deletingId === n._id}
                    title="Delete notification"
                    aria-label="Delete notification"
                  >
                    <i className="fas fa-trash-alt" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
