import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  User,
  UserRole,
  Student,
  PickupZone,
  PickupZoneId,
  PickupRequest,
  PickupStatus,
  TransportationType,
  NotificationItem,
  ToastItem,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_ZONES,
  INITIAL_REQUESTS,
  INITIAL_NOTIFICATIONS,
} from '../services/mockData';
import { playBellChime, playSuccessChime } from '../services/sound';

export interface ConfirmDialogState {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface SchoolPickContextType {
  currentUser: User | null;
  users: User[];
  students: Student[];
  zones: PickupZone[];
  requests: PickupRequest[];
  notifications: NotificationItem[];
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  urgentTeacherAlert: PickupRequest | null;
  clearUrgentAlert: () => void;
  splitViewMode: boolean;
  setSplitViewMode: (val: boolean) => void;

  // Toasts
  toasts: ToastItem[];
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Confirmation Modal
  confirmDialog: ConfirmDialogState | null;
  requestConfirmation: (dialog: ConfirmDialogState) => void;
  closeConfirmation: () => void;
  
  // Actions
  login: (email: string, role?: UserRole) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  createPickupRequest: (params: {
    studentId: string;
    transportationType: TransportationType;
    licensePlate?: string;
    note?: string;
  }) => PickupRequest;
  updateRequestStatus: (requestId: string, status: PickupStatus) => void;
  cancelRequest: (requestId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  simulateIncomingParent: () => void;
  resetDemoData: () => void;

  // Computed
  activeRequests: PickupRequest[];
  historyRequests: PickupRequest[];
  unreadNotificationCount: number;
}

const SchoolPickContext = createContext<SchoolPickContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'schoolpick_current_user_v1',
  LOGGED_OUT: 'schoolpick_logged_out_v1',
  REQUESTS: 'schoolpick_requests_v1',
  NOTIFICATIONS: 'schoolpick_notifications_v1',
  SOUND_ENABLED: 'schoolpick_sound_enabled_v1',
  ZONES: 'schoolpick_zones_v1',
};

// Cross-tab broadcast channel
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('schoolpick_realtime_sync');
  }
} catch {
  // Safe fallback
}

export const SchoolPickProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State initialization with localStorage fallback
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      if (localStorage.getItem(STORAGE_KEYS.LOGGED_OUT) === 'true') {
        return null;
      }
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default to Parent for demo onboarding
    return INITIAL_USERS[0];
  });

  const [requests, setRequests] = useState<PickupRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_REQUESTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  const [zones, setZones] = useState<PickupZone[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ZONES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ZONES;
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  const [urgentTeacherAlert, setUrgentTeacherAlert] = useState<PickupRequest | null>(null);
  const [splitViewMode, setSplitViewMode] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const addToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts(prev => [...prev, { id, message, type, timestamp: Date.now() }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const requestConfirmation = useCallback((dialog: ConfirmDialogState) => {
    setConfirmDialog(dialog);
  }, []);
  const closeConfirmation = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    } catch {}
  }, [requests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(zones));
    } catch {}
  }, [zones]);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(enabled));
    } catch {}
  };

  // Recalculate zone vehicle numbers whenever active requests change
  useEffect(() => {
    const activeReqs = requests.filter(r => r.status !== PickupStatus.PICKED_UP && r.status !== PickupStatus.CANCELLED);
    setZones(prevZones =>
      prevZones.map(zone => {
        const count = activeReqs.filter(r => r.pickupZoneId === zone.id).length;
        // Base count + active requests count
        const base = zone.id === PickupZoneId.ZONE_B ? 10 : 4;
        return {
          ...zone,
          currentVehicles: base + count,
        };
      })
    );
  }, [requests]);

  // Handle cross-tab sync
  useEffect(() => {
    if (!broadcastChannel) return;

    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data || {};
      if (type === 'SYNC_REQUESTS') {
        setRequests(payload.requests);
        if (payload.newUrgentAlert) {
          setUrgentTeacherAlert(payload.newUrgentAlert);
          playBellChime(soundEnabled);
        }
      } else if (type === 'SYNC_NOTIFICATIONS') {
        setNotifications(payload.notifications);
      }
    };

    broadcastChannel.addEventListener('message', handleMessage);
    return () => {
      broadcastChannel?.removeEventListener('message', handleMessage);
    };
  }, [soundEnabled]);

  const clearUrgentAlert = useCallback(() => {
    setUrgentTeacherAlert(null);
  }, []);

  const login = (email: string, role?: UserRole): boolean => {
    try {
      localStorage.removeItem(STORAGE_KEYS.LOGGED_OUT);
    } catch {}
    const user = INITIAL_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() || (role && u.role === role)
    );
    if (user) {
      setCurrentUser(user);
      return true;
    }
    // Fallback demo user
    const fallbackUser: User = {
      id: `user-${Date.now()}`,
      name: role === UserRole.TEACHER ? 'Cô Lê Thu Hà' : role === UserRole.ADMIN ? 'Thầy Quản Trị' : 'Phụ Huynh Mẫu',
      email,
      role: role || UserRole.PARENT,
      assignedClassId: role === UserRole.TEACHER ? 'class-7a1' : undefined,
      assignedClassName: role === UserRole.TEACHER ? '7A1' : undefined,
      childrenIds: role === UserRole.PARENT ? ['student-1', 'student-2'] : undefined,
    };
    setCurrentUser(fallbackUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setSplitViewMode(false);
    setUrgentTeacherAlert(null);
    try {
      localStorage.setItem(STORAGE_KEYS.LOGGED_OUT, 'true');
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch {}
    addToast('Đã đăng xuất khỏi tài khoản an toàn', 'info');
  };

  const switchRole = (role: UserRole) => {
    try {
      localStorage.removeItem(STORAGE_KEYS.LOGGED_OUT);
    } catch {}
    const matched = INITIAL_USERS.find(u => u.role === role);
    if (matched) {
      setCurrentUser(matched);
    }
  };

  // Helper for current time format HH:mm
  const getCurrentTimeStr = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // Create a new pickup request (Parent reports "Tôi đang đến")
  const createPickupRequest = ({
    studentId,
    transportationType,
    licensePlate,
    note,
  }: {
    studentId: string;
    transportationType: TransportationType;
    licensePlate?: string;
    note?: string;
  }): PickupRequest => {
    const student = INITIAL_STUDENTS.find(s => s.id === studentId) || INITIAL_STUDENTS[0];
    const parent = currentUser || INITIAL_USERS[0];

    // Compute next queue number
    const maxQueue = requests.reduce((max, r) => Math.max(max, r.queueNumber || 0), 20);
    const nextQueue = maxQueue + 1;
    const timeStr = getCurrentTimeStr();

    const newRequest: PickupRequest = {
      id: `req-${Date.now()}`,
      queueNumber: nextQueue,
      studentId: student.id,
      studentName: student.name,
      classId: student.classId,
      className: student.className,
      parentId: parent.id,
      parentName: parent.name,
      parentPhone: parent.phone || '0912 345 678',
      pickupZoneId: student.pickupZoneId,
      transportationType,
      licensePlate,
      note,
      status: PickupStatus.REQUESTED,
      createdAt: timeStr,
    };

    const updatedRequests = [newRequest, ...requests];
    setRequests(updatedRequests);

    // Create notifications for teacher & parent
    const vehicleLabels: Record<TransportationType, string> = {
      [TransportationType.CAR]: '🚗 Ô tô',
      [TransportationType.MOTORBIKE]: '🏍️ Xe máy',
      [TransportationType.WALK]: '🚶 Đi bộ',
    };

    const teacherNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: UserRole.TEACHER,
      title: 'Có phụ huynh đang đến',
      message: `Phụ huynh của ${student.name} (${student.className}) đã báo đang đến ${
        student.pickupZoneId === PickupZoneId.ZONE_B ? 'Khu B' : 'khu vực đón'
      } (${vehicleLabels[transportationType]}).`,
      timestamp: timeStr,
      isRead: false,
      type: 'ALERT',
      studentName: student.name,
      relatedRequestId: newRequest.id,
    };

    const parentNotif: NotificationItem = {
      id: `notif-${Date.now() + 1}`,
      recipientRole: UserRole.PARENT,
      recipientId: parent.id,
      title: 'Đã gửi yêu cầu đón',
      message: `Hệ thống đã chuyển yêu cầu đón ${student.name} đến giáo viên chủ nhiệm lớp ${student.className}.`,
      timestamp: timeStr,
      isRead: false,
      type: 'SUCCESS',
      studentName: student.name,
      relatedRequestId: newRequest.id,
    };

    const updatedNotifications = [teacherNotif, parentNotif, ...notifications];
    setNotifications(updatedNotifications);

    // Play school bell alert and set prominent teacher alert
    playBellChime(soundEnabled);
    setUrgentTeacherAlert(newRequest);
    addToast(`✓ Đã gửi yêu cầu đón học sinh ${student.name}`, 'success');

    // Broadcast to other tabs
    try {
      broadcastChannel?.postMessage({
        type: 'SYNC_REQUESTS',
        payload: { requests: updatedRequests, newUrgentAlert: newRequest },
      });
      broadcastChannel?.postMessage({
        type: 'SYNC_NOTIFICATIONS',
        payload: { notifications: updatedNotifications },
      });
    } catch {}

    return newRequest;
  };

  // Update request status (Teacher actions: Preparing -> Ready -> Picked Up)
  const updateRequestStatus = (requestId: string, status: PickupStatus) => {
    const timeStr = getCurrentTimeStr();
    let updatedRequest: PickupRequest | null = null;

    const updatedRequests = requests.map(req => {
      if (req.id === requestId) {
        const u = {
          ...req,
          status,
          preparedAt: status === PickupStatus.PREPARING ? timeStr : req.preparedAt,
          readyAt: status === PickupStatus.READY ? timeStr : req.readyAt,
          pickedUpAt: status === PickupStatus.PICKED_UP ? timeStr : req.pickedUpAt,
          cancelledAt: status === PickupStatus.CANCELLED ? timeStr : req.cancelledAt,
        };
        updatedRequest = u;
        return u;
      }
      return req;
    });

    setRequests(updatedRequests);

    if (updatedRequest) {
      const u = updatedRequest as PickupRequest;
      // If picked up, play celebratory chime
      if (status === PickupStatus.PICKED_UP) {
        playSuccessChime(soundEnabled);
        addToast(`✓ Đã xác nhận đón học sinh ${u.studentName} thành công`, 'success');
      } else if (status === PickupStatus.PREPARING) {
        addToast(`🔵 Đang chuẩn bị học sinh ${u.studentName}`, 'info');
      } else if (status === PickupStatus.READY) {
        addToast(`🟢 Đã đánh dấu học sinh ${u.studentName} sẵn sàng đón!`, 'success');
      } else if (status === PickupStatus.CANCELLED) {
        addToast(`Đã hủy yêu cầu đón học sinh ${u.studentName}`, 'warning');
      }

      // Notification messages for parent
      let statusMsg = '';
      if (status === PickupStatus.PREPARING) {
        statusMsg = `Giáo viên đang chuẩn bị cho học sinh ${u.studentName} ra khu vực đón.`;
      } else if (status === PickupStatus.READY) {
        statusMsg = `Học sinh ${u.studentName} đã sẵn sàng tại ${
          u.pickupZoneId === PickupZoneId.ZONE_B ? 'Khu B' : 'khu vực đón'
        }! Vui lòng đón con.`;
      } else if (status === PickupStatus.PICKED_UP) {
        statusMsg = `Xác nhận: Đã đón học sinh ${u.studentName} thành công. Cảm ơn phụ huynh!`;
      }

      if (statusMsg) {
        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          recipientRole: UserRole.PARENT,
          recipientId: u.parentId,
          title:
            status === PickupStatus.READY
              ? '🟢 Học sinh đã sẵn sàng!'
              : status === PickupStatus.PREPARING
              ? '🟡 Giáo viên đang chuẩn bị học sinh'
              : '✓ Đón học sinh thành công',
          message: statusMsg,
          timestamp: timeStr,
          isRead: false,
          type: status === PickupStatus.READY ? 'SUCCESS' : 'INFO',
          studentName: u.studentName,
          relatedRequestId: u.id,
        };
        const nextNotifs = [newNotif, ...notifications];
        setNotifications(nextNotifs);

        try {
          broadcastChannel?.postMessage({
            type: 'SYNC_NOTIFICATIONS',
            payload: { notifications: nextNotifs },
          });
        } catch {}
      }
    }

    try {
      broadcastChannel?.postMessage({
        type: 'SYNC_REQUESTS',
        payload: { requests: updatedRequests },
      });
    } catch {}
  };

  const cancelRequest = (requestId: string) => {
    updateRequestStatus(requestId, PickupStatus.CANCELLED);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // 🧪 Quick demo trigger: "GIẢ LẬP PHỤ HUYNH ĐANG ĐẾN"
  const simulateIncomingParent = () => {
    // Pick student that does not have an active request if possible, or Nguyễn Minh Bảo
    const activeStudentIds = new Set(
      requests
        .filter(r => r.status !== PickupStatus.PICKED_UP && r.status !== PickupStatus.CANCELLED)
        .map(r => r.studentId)
    );

    const availableStudents = INITIAL_STUDENTS.filter(s => !activeStudentIds.has(s.id));
    const targetStudent =
      availableStudents.length > 0
        ? availableStudents[Math.floor(Math.random() * availableStudents.length)]
        : INITIAL_STUDENTS[0]; // Nguyen Minh Bao

    const transportOptions = [TransportationType.CAR, TransportationType.MOTORBIKE, TransportationType.WALK];
    const chosenTransport = transportOptions[Math.floor(Math.random() * transportOptions.length)];

    createPickupRequest({
      studentId: targetStudent.id,
      transportationType: chosenTransport,
      licensePlate: chosenTransport === TransportationType.CAR ? '30G-888.99' : chosenTransport === TransportationType.MOTORBIKE ? '29-B1 456.78' : undefined,
      note: 'Phụ huynh đang đợi gần làn đón số 2',
    });
  };

  const resetDemoData = () => {
    setRequests(INITIAL_REQUESTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setZones(INITIAL_ZONES);
    setUrgentTeacherAlert(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.REQUESTS);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      localStorage.removeItem(STORAGE_KEYS.ZONES);
    } catch {}
  };

  const activeRequests = requests.filter(
    r => r.status !== PickupStatus.PICKED_UP && r.status !== PickupStatus.CANCELLED
  );

  const historyRequests = requests.filter(
    r => r.status === PickupStatus.PICKED_UP || r.status === PickupStatus.CANCELLED
  );

  const unreadNotificationCount = notifications.filter(
    n => !n.isRead && (n.recipientRole === currentUser?.role || !n.recipientRole)
  ).length;

  return (
    <SchoolPickContext.Provider
      value={{
        currentUser,
        users: INITIAL_USERS,
        students: INITIAL_STUDENTS,
        zones,
        requests,
        notifications,
        soundEnabled,
        setSoundEnabled,
        urgentTeacherAlert,
        clearUrgentAlert,
        splitViewMode,
        setSplitViewMode,
        toasts,
        addToast,
        removeToast,
        confirmDialog,
        requestConfirmation,
        closeConfirmation,
        login,
        logout,
        switchRole,
        createPickupRequest,
        updateRequestStatus,
        cancelRequest,
        markNotificationRead,
        markAllNotificationsRead,
        simulateIncomingParent,
        resetDemoData,
        activeRequests,
        historyRequests,
        unreadNotificationCount,
      }}
    >
      {children}
    </SchoolPickContext.Provider>
  );
};

export const useSchoolPick = () => {
  const context = useContext(SchoolPickContext);
  if (!context) {
    throw new Error('useSchoolPick must be used within a SchoolPickProvider');
  }
  return context;
};
