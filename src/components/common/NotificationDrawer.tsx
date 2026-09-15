import React from 'react';
import { X, CheckCheck, Bell, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useSchoolPick } from '../../context/SchoolPickContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    currentUser,
  } = useSchoolPick();

  if (!isOpen) return null;

  // Filter notifications relevant to current user
  const userNotifications = notifications.filter(
    n => !n.recipientRole || n.recipientRole === currentUser?.role
  );

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  return (
    <div
      id="notification-drawer-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="notification-drawer-panel"
        className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header (Section 17) */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">Trung tâm thông báo</h3>
              <p className="text-[11px] text-slate-500 font-medium">Cập nhật đón con thời gian thực</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {unreadCount > 0 && (
              <button
                id="btn-mark-all-read"
                onClick={markAllNotificationsRead}
                title="Đánh dấu tất cả đã đọc"
                className="px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-100 rounded-xl font-bold flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Đã đọc hết</span>
              </button>
            )}
            <button
              id="btn-close-notifications"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List Grouped under "Hôm nay" (Section 17) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              HÔM NAY • THỨ HAI 14/09
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {userNotifications.length} thông báo
            </span>
          </div>

          {userNotifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center">
              <Bell className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm font-bold text-slate-700">Chưa có thông báo nào</p>
              <p className="text-xs text-slate-400 mt-1">
                Các cập nhật đón học sinh từ giáo viên và phụ huynh sẽ xuất hiện tại đây
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {userNotifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    notif.isRead
                      ? 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70'
                      : 'bg-blue-50/60 border-blue-200 shadow-xs hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 shrink-0">
                      {notif.type === 'ALERT' && (
                        <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      )}
                      {notif.type === 'SUCCESS' && (
                        <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                      {notif.type === 'INFO' && (
                        <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Info className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-black ${notif.isRead ? 'text-slate-800' : 'text-blue-950'}`}>
                          {notif.title}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">{notif.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                      {notif.studentName && (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-bold">
                          👦 Học sinh: {notif.studentName}
                        </span>
                      )}
                    </div>

                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5 ring-2 ring-blue-200"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium">Hệ thống thông báo tức thời SchoolPick</p>
        </div>
      </div>
    </div>
  );
};
