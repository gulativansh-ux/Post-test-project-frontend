import { useEffect, useState } from "react";
import { getNotifications, markNotificationRead } from "../api/notifications";
import { useNotifications } from "../context/NotificationContext";
import { connectNotificationSocket } from "../utility/socket";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [readingId, setReadingId] = useState(null);
  const { notifyJobUpdated } = useNotifications();

  const unreadCount = notifications.length;

  useEffect(() => {
    let cancelled = false;
    let closeSocket;

    async function initialize() {
      try {
        const data = await getNotifications();

        if (cancelled) return;

        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      }

      if (cancelled) return;

      closeSocket = connectNotificationSocket((notification) => {
        if (notification.id == null) return;

        setNotifications((current) => {
          const exists = current.some((item) => item.id === notification.id);

          if (exists || notification.is_read) {
            return current;
          }

          return [notification, ...current];
        });

        notifyJobUpdated(notification);
      });
    }

    initialize();

    return () => {
      cancelled = true;
      closeSocket?.();
    };
  }, []);

  async function handleMarkAsRead(notificationId) {
    if (readingId === notificationId) return;

    setError("");
    setReadingId(notificationId);

    try {
      await markNotificationRead(notificationId);

      setNotifications((current) =>
        current.filter((item) => item.id !== notificationId),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setReadingId(null);
    }
  }

  return (
    <div className="notification-container">
      <button
        type="button"
        className="notification-bell"
        aria-label={`Notifications: ${unreadCount} unread`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>

        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <section
            className="notification-dropdown"
            aria-label="Unread notifications"
          >
            <div className="notification-heading">
              <strong>Notifications</strong>
              <span>{unreadCount} unread</span>
            </div>

            {error && (
              <p className="notification-error" role="alert">
                {error}
              </p>
            )}

            {notifications.length === 0 ? (
              <p className="notification-empty">You're all caught up.</p>
            ) : (
              <div className="notification-list">
                {notifications.map((notification) => (
                  <div key={notification.id} className="notification-item">
                    <span className="notification-dot" />

                    <div className="notification-item-content">
                      <strong>{notification.title}</strong>
                      <span>{notification.message}</span>

                      {notification.job_id != null && (
                        <small>Job #{notification.job_id}</small>
                      )}

                      <button
                        type="button"
                        className="notification-read-button"
                        disabled={readingId === notification.id}
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        {readingId === notification.id
                          ? "Marking as read..."
                          : "Mark as read"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
