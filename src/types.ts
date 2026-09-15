export enum UserRole {
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

export enum TransportationType {
  CAR = 'CAR', // Ô tô
  MOTORBIKE = 'MOTORBIKE', // Xe máy
  WALK = 'WALK', // Đi bộ
}

export enum PickupStatus {
  REQUESTED = 'REQUESTED', // Đã gửi yêu cầu / Chờ xử lý
  PREPARING = 'PREPARING', // Đang chuẩn bị học sinh
  READY = 'READY', // Sẵn sàng đón
  PICKED_UP = 'PICKED_UP', // Đã đón thành công
  CANCELLED = 'CANCELLED', // Đã hủy
}

export enum PickupZoneId {
  ZONE_A = 'ZONE_A', // Khối 6 - Khu A
  ZONE_B = 'ZONE_B', // Khối 7 - Khu B
  ZONE_C = 'ZONE_C', // Khối 8 - Khu C
  ZONE_D = 'ZONE_D', // Khối 9 - Khu D
}

export interface PickupZone {
  id: PickupZoneId;
  name: string;
  grades: string;
  description: string;
  color: string;
  currentVehicles: number;
  maxCapacity: number;
  assignedClasses?: string[];
  waitingPeople?: number;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  className: string;
  grade: number;
  pickupZoneId: PickupZoneId;
  avatarUrl?: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  assignedClassId?: string; // For teacher e.g. 7A1
  assignedClassName?: string;
  childrenIds?: string[]; // For parent
}

export interface PickupRequest {
  id: string;
  queueNumber: number;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  teacherId?: string;
  pickupZoneId: PickupZoneId;
  transportationType: TransportationType;
  licensePlate?: string;
  note?: string;
  status: PickupStatus;
  createdAt: string; // ISO string or HH:mm
  preparedAt?: string;
  readyAt?: string;
  pickedUpAt?: string;
  cancelledAt?: string;
}

export interface NotificationItem {
  id: string;
  recipientRole: UserRole;
  recipientId?: string; // if targeted to specific user
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  relatedRequestId?: string;
  studentName?: string;
}

export interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  timestamp?: number;
}

