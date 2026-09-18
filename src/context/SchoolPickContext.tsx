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
  LoginResult,
  RegisterResult,
} from '../types';
import { validateRealGmail, validateRealPhoneNumber } from '../utils/validators';
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
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  unauthScreen: 'home' | 'auth';
  setUnauthScreen: (screen: 'home' | 'auth') => void;
  openAuth: (mode: 'login' | 'signup') => void;
  goToHome: () => void;
  googleStrictOnly: boolean;
  setGoogleStrictOnly: (val: boolean) => void;
  updateUserName: (newName: string) => void;
  checkUserExists: (email: string) => User | null;
  login: (email: string, role?: UserRole, password?: string) => LoginResult;
  loginWithGoogle: (googleProfile: {
    name: string;
    email: string;
    avatarUrl?: string;
    role?: UserRole;
  }) => boolean;
  registerUser: (params: {
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    studentName?: string;
    className?: string;
    password?: string;
  }) => RegisterResult;
  logout: (force?: boolean) => void;
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
      if (saved) {
        const parsed: User = JSON.parse(saved);
        if (
          parsed &&
          parsed.email &&
          !parsed.email.toLowerCase().endsWith('.demo') &&
          parsed.id !== 'parent-1' &&
          parsed.id !== 'teacher-1' &&
          parsed.id !== 'admin-1'
        ) {
          return parsed;
        }
      }
    } catch {}
    // Không dùng tài khoản ảo mặc định - chờ người dùng đăng nhập hoặc đăng ký
    return null;
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
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [unauthScreen, setUnauthScreen] = useState<'home' | 'auth'>('home');
  const [googleStrictOnly, setGoogleStrictOnlyState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('schoolpick_google_strict_only');
      if (saved !== null) {
        return saved === 'true';
      }
      return true; // Bắt buộc mặc định là true
    } catch {
      return true;
    }
  });

  const setGoogleStrictOnly = useCallback((val: boolean) => {
    setGoogleStrictOnlyState(val);
    try {
      localStorage.setItem('schoolpick_google_strict_only', String(val));
    } catch {}
  }, []);

  const openAuth = useCallback((mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setUnauthScreen('auth');
  }, []);

  const goToHome = useCallback(() => {
    setUnauthScreen('home');
  }, []);

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('schoolpick_users_v1');
      if (saved) {
        const parsed: User[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            u =>
              u &&
              u.email &&
              !u.email.toLowerCase().endsWith('.demo') &&
              u.id !== 'parent-1' &&
              u.id !== 'teacher-1' &&
              u.id !== 'admin-1'
          );
        }
      }
    } catch {}
    return [];
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('schoolpick_students_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_STUDENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('schoolpick_users_v1', JSON.stringify(users));
    } catch {}
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('schoolpick_students_v1', JSON.stringify(students));
    } catch {}
  }, [students]);

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

  const updateUserName = useCallback((newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) {
      addToast('Vui lòng nhập họ và tên hợp lệ.', 'warning');
      return;
    }
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated: User = {
        ...prev,
        name: trimmed,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(trimmed)}&backgroundColor=0284c7&textColor=ffffff`,
      };
      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setUsers(prev =>
      prev.map(u => (u.id === currentUser?.id || u.email.toLowerCase() === currentUser?.email.toLowerCase()
        ? { ...u, name: trimmed }
        : u))
    );

    if (currentUser?.role === UserRole.PARENT) {
      setStudents(prev =>
        prev.map(s => (s.parentId === currentUser?.id ? { ...s, parentName: trimmed } : s))
      );
    }

    addToast(`Đã đổi tên thành công: "${trimmed}"`, 'success');
  }, [currentUser, addToast]);

  const checkUserExists = (email: string): User | null => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return null;
    return users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  };

  const login = (email: string, role?: UserRole, password?: string): LoginResult => {
    try {
      localStorage.removeItem(STORAGE_KEYS.LOGGED_OUT);
    } catch {}

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      addToast('Vui lòng nhập email đăng nhập.', 'warning');
      return {
        success: false,
        reason: 'EMPTY_FIELDS',
        message: 'Vui lòng nhập email đăng nhập.',
      };
    }

    // Check existing registered users
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!existing) {
      return {
        success: false,
        reason: 'NOT_FOUND',
        message: 'Tài khoản không tồn tại. Bạn có muốn tạo tài khoản mới không?',
      };
    }

    // Check password if provided and user has password
    if (existing.password && password && existing.password !== password) {
      return {
        success: false,
        reason: 'WRONG_PASSWORD',
        message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại.',
      };
    }

    const activeRole = role || existing.role;
    const activeUser: User = {
      ...existing,
      role: activeRole,
    };
    setCurrentUser(activeUser);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(activeUser));
    } catch {}
    addToast(`Đăng nhập thành công! Chào mừng ${activeUser.name}.`, 'success');
    return { success: true };
  };

  const loginWithGoogle = (googleProfile: {
    name: string;
    email: string;
    avatarUrl?: string;
    role?: UserRole;
  }): boolean => {
    try {
      localStorage.removeItem(STORAGE_KEYS.LOGGED_OUT);
    } catch {}

    const targetRole = googleProfile.role || UserRole.PARENT;
    const cleanEmail = googleProfile.email.toLowerCase().trim();
    const existing = users.find(
      u => u.email.toLowerCase().trim() === cleanEmail
    );

    const effectiveAvatar =
      googleProfile.avatarUrl ||
      existing?.avatarUrl ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        googleProfile.name || googleProfile.email
      )}&backgroundColor=0284c7&textColor=ffffff`;

    let loggedInUser: User;
    if (existing) {
      loggedInUser = {
        ...existing,
        role: targetRole,
        avatarUrl: effectiveAvatar,
        isGoogleAuth: true,
      };
      setUsers(prev => prev.map(u => (u.id === existing.id ? loggedInUser : u)));
    } else {
      loggedInUser = {
        id: `google-user-${Date.now()}`,
        name: googleProfile.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: targetRole,
        avatarUrl: effectiveAvatar,
        isGoogleAuth: true,
        assignedClassId: targetRole === UserRole.TEACHER ? 'class-7a1' : undefined,
        assignedClassName: targetRole === UserRole.TEACHER ? '7A1' : undefined,
        childrenIds: targetRole === UserRole.PARENT ? ['student-1', 'student-2'] : undefined,
      };
      setUsers(prev => [loggedInUser, ...prev]);
    }

    // Save to list of known Google accounts on this device
    try {
      const raw = localStorage.getItem('schoolpick_saved_google_accounts');
      const existingList = raw ? JSON.parse(raw) : [];
      const updatedList = [
        {
          name: loggedInUser.name,
          email: loggedInUser.email,
          avatarUrl: loggedInUser.avatarUrl,
          role: loggedInUser.role,
          lastLogin: Date.now(),
        },
        ...existingList.filter((a: any) => a.email.toLowerCase() !== loggedInUser.email.toLowerCase()),
      ].slice(0, 8);
      localStorage.setItem('schoolpick_saved_google_accounts', JSON.stringify(updatedList));
    } catch {}

    setCurrentUser(loggedInUser);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(loggedInUser));
    } catch {}

    addToast(`Đăng nhập Google thành công: ${loggedInUser.email}`, 'success');
    return true;
  };

  const performLogout = () => {
    setCurrentUser(null);
    setSplitViewMode(false);
    setUrgentTeacherAlert(null);
    setUnauthScreen('home');
    setAuthMode('login');
    try {
      localStorage.setItem(STORAGE_KEYS.LOGGED_OUT, 'true');
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch {}
    addToast('Đã đăng xuất khỏi tài khoản an toàn', 'info');
  };

  const logout = (force: boolean = false) => {
    if (force) {
      performLogout();
      return;
    }
    requestConfirmation({
      title: 'Xác nhận đăng xuất',
      message: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống SchoolPick không? Mọi thông tin phiên làm việc sẽ được lưu an toàn.',
      confirmLabel: 'Đăng xuất',
      cancelLabel: 'Ở lại',
      isDestructive: true,
      onConfirm: () => {
        performLogout();
      },
    });
  };

  const registerUser = (params: {
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    studentName?: string;
    className?: string;
    password?: string;
  }): RegisterResult => {
    try {
      localStorage.removeItem(STORAGE_KEYS.LOGGED_OUT);
    } catch {}

    // 1. Verify Real Gmail Address
    const gmailValidation = validateRealGmail(params.email);
    if (!gmailValidation.isValid) {
      addToast(gmailValidation.reason || 'Địa chỉ Gmail không tồn tại hoặc không hợp lệ.', 'warning');
      return {
        success: false,
        field: 'email',
        message: gmailValidation.reason || 'Địa chỉ Gmail không tồn tại hoặc không hợp lệ. Vui lòng nhập Gmail thật của bạn.',
      };
    }

    const cleanEmail = gmailValidation.cleanEmail || params.email.trim().toLowerCase();

    // 2. Check if Gmail is already registered
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      addToast('Địa chỉ Gmail này đã được đăng ký tài khoản.', 'warning');
      return {
        success: false,
        field: 'email',
        message: 'Địa chỉ Gmail này đã được đăng ký tài khoản trên hệ thống. Vui lòng chuyển sang Đăng nhập.',
      };
    }

    // 3. Verify Real Vietnamese Phone Number
    const phoneValidation = validateRealPhoneNumber(params.phone || '');
    if (!phoneValidation.isValid) {
      addToast(phoneValidation.reason || 'Số điện thoại không tồn tại hoặc không hợp lệ.', 'warning');
      return {
        success: false,
        field: 'phone',
        message: phoneValidation.reason || 'Số điện thoại không tồn tại hoặc không hợp lệ. Vui lòng nhập số điện thoại thật của bạn.',
      };
    }

    // 4. Verify Student Name for Parents
    if (params.role === UserRole.PARENT && !params.studentName?.trim()) {
      return {
        success: false,
        field: 'studentName',
        message: 'Vui lòng nhập họ và tên của học sinh (con bạn).',
      };
    }

    const newUserId = `user-${Date.now()}`;
    const newStudentId = `student-${Date.now()}`;
    const cleanPhone = phoneValidation.formattedPhone || params.phone?.trim() || '';

    let createdChildrenIds: string[] | undefined = undefined;

    if (params.role === UserRole.PARENT) {
      createdChildrenIds = [newStudentId];
      const newStudent: Student = {
        id: newStudentId,
        name: params.studentName?.trim() || 'Học sinh mới',
        classId: `class-${(params.className || '7A1').toLowerCase().replace(/\s+/g, '')}`,
        className: params.className?.trim() || '7A1',
        grade: parseInt((params.className || '7A1').charAt(0), 10) || 7,
        pickupZoneId: PickupZoneId.ZONE_B,
        parentId: newUserId,
        parentName: params.name.trim(),
        parentPhone: cleanPhone,
      };
      setStudents(prev => [newStudent, ...prev]);
    }

    const newUser: User = {
      id: newUserId,
      name: params.name.trim(),
      email: cleanEmail,
      role: params.role,
      password: params.password?.trim() || undefined,
      phone: cleanPhone,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        params.name
      )}&backgroundColor=0284c7&textColor=ffffff`,
      assignedClassId:
        params.role === UserRole.TEACHER
          ? `class-${(params.className || '7A1').toLowerCase().replace(/\s+/g, '')}`
          : undefined,
      assignedClassName: params.role === UserRole.TEACHER ? (params.className?.trim() || '7A1') : undefined,
      childrenIds: createdChildrenIds,
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    } catch {}
    addToast(`Đăng ký thành công! Chào mừng ${newUser.name} đến với SchoolPick.`, 'success');
    return { success: true };
  };

  const switchRole = (role: UserRole) => {
    try {
      localStorage.removeItem(STORAGE_KEYS.LOGGED_OUT);
    } catch {}
    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        role,
        assignedClassId: role === UserRole.TEACHER ? (currentUser.assignedClassId || 'class-7a1') : undefined,
        assignedClassName: role === UserRole.TEACHER ? (currentUser.assignedClassName || '7A1') : undefined,
        childrenIds: role === UserRole.PARENT ? (currentUser.childrenIds || ['student-1']) : undefined,
      };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
      } catch {}
      addToast(`Đã chuyển sang vai trò: ${role === UserRole.PARENT ? 'Phụ huynh' : role === UserRole.TEACHER ? 'Giáo viên' : 'Quản trị viên'}`, 'info');
      return;
    }
    // If not logged in, prompt user to log in with their real account
    setAuthMode('login');
    setUnauthScreen('auth');
    addToast('Vui lòng đăng nhập bằng tài khoản của bạn để tiếp tục.', 'info');
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
    const parent = currentUser || {
      id: 'parent-current',
      name: 'Phụ huynh',
      email: '',
      role: UserRole.PARENT,
      phone: '0912 345 678',
    };

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
        users,
        students,
        zones,
        requests,
        notifications,
        soundEnabled,
        setSoundEnabled,
        urgentTeacherAlert,
        clearUrgentAlert,
        splitViewMode,
        setSplitViewMode,
        authMode,
        setAuthMode,
        unauthScreen,
        setUnauthScreen,
        openAuth,
        goToHome,
        googleStrictOnly,
        setGoogleStrictOnly,
        updateUserName,
        checkUserExists,
        toasts,
        addToast,
        removeToast,
        confirmDialog,
        requestConfirmation,
        closeConfirmation,
        login,
        loginWithGoogle,
        registerUser,
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
