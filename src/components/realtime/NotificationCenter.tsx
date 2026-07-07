import { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  clearNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  removeNotification,
} from "../../redux/notifications/notificationSlice";

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const { items, socketConnected } = useAppSelector(
    (state) => state.notifications,
  );

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items],
  );

  return (
    <div className="fixed right-4 top-16 z-50 sm:right-6 lg:top-5">
      {/* Notification Bell */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-xl shadow-lg transition hover:bg-slate-50"
        aria-label="Open notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <span
          className={[
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
            socketConnected ? "bg-green-500" : "bg-slate-400",
          ].join(" ")}
        />
      </button>

      {/* Notification Panel */}
      {open && (
        <div className="absolute right-0 mt-3 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h2 className="font-bold text-slate-900">Notifications</h2>

              <p className="text-xs text-slate-500">
                {socketConnected
                  ? "🟢 Real-time connected"
                  : "⚪ Real-time disconnected"}
              </p>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={() => dispatch(markAllNotificationsAsRead())}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications */}
          <div className="max-h-[420px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-slate-500">
                No notifications yet
              </div>
            ) : (
              items.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() =>
                    dispatch(markNotificationAsRead(notification.id))
                  }
                  className={[
                    "cursor-pointer border-b px-4 py-3 transition hover:bg-slate-50",
                    notification.read ? "bg-white" : "bg-blue-50",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">
                        {notification.title}
                      </p>

                      <p className="mt-1 break-words text-sm text-slate-600">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        dispatch(removeNotification(notification.id));
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-100 hover:text-red-600"
                      aria-label="Remove notification"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => dispatch(clearNotifications())}
              className="w-full border-t px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
