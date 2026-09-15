import React, { useEffect, useState } from 'react';
import { Bell, Car, Bike, User as UserIcon, Check, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { useSchoolPick } from '../../context/SchoolPickContext';
import { PickupStatus, TransportationType, PickupZoneId } from '../../types';

export const UrgentTeacherAlertModal: React.FC = () => {
  const {
    urgentTeacherAlert,
    clearUrgentAlert,
    updateRequestStatus,
    soundEnabled,
    setSoundEnabled,
  } = useSchoolPick();
  
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (urgentTeacherAlert) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [urgentTeacherAlert]);

  if (!urgentTeacherAlert || !visible) return null;

  const getTransportBadge = (type: TransportationType) => {
    switch (type) {
      case TransportationType.CAR:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">
            <Car className="w-4 h-4 text-blue-600" />
            <span>🚗 Ô tô</span>
          </span>
        );
      case TransportationType.MOTORBIKE:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold">
            <Bike className="w-4 h-4 text-emerald-600" />
            <span>🏍️ Xe máy</span>
          </span>
        );
      case TransportationType.WALK:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">
            <UserIcon className="w-4 h-4 text-amber-600" />
            <span>🚶 Đi bộ</span>
          </span>
        );
    }
  };

  const getZoneName = (zoneId: PickupZoneId) => {
    switch (zoneId) {
      case PickupZoneId.ZONE_A:
        return 'Khu A (Cổng chính)';
      case PickupZoneId.ZONE_B:
        return 'Khu B (Sân trung tâm)';
      case PickupZoneId.ZONE_C:
        return 'Khu C (Cổng phụ)';
      case PickupZoneId.ZONE_D:
        return 'Khu D (Hành lang đông)';
      default:
        return 'Khu B';
    }
  };

  const handleStartPreparing = () => {
    updateRequestStatus(urgentTeacherAlert.id, PickupStatus.PREPARING);
    clearUrgentAlert();
  };

  return (
    <div
      id="urgent-teacher-alert-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="urgent-teacher-alert-box"
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden transform scale-100 transition-transform"
      >
        {/* Urgent Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-100">
                THÔNG BÁO KHẨN ĐẾN GIÁO VIÊN
              </span>
              <h2 className="text-lg font-black tracking-tight">CÓ PHỤ HUYNH ĐANG ĐẾN!</h2>
            </div>
          </div>

          <button
            id="btn-toggle-sound-modal"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Tắt âm thanh chuông' : 'Bật âm thanh chuông'}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white text-xs flex items-center space-x-1"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-200" />}
          </button>
        </div>

        {/* Student Information - High Prominence for Classroom Tablet/Laptop */}
        <div className="p-6 text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-3">
            Số thứ tự hàng chờ: #{urgentTeacherAlert.queueNumber} • Giờ báo: {urgentTeacherAlert.createdAt}
          </div>

          {/* Huge Student Name as requested */}
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">
            {urgentTeacherAlert.studentName}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold text-sm">
              Lớp {urgentTeacherAlert.className}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-white font-bold text-sm">
              {getZoneName(urgentTeacherAlert.pickupZoneId)}
            </span>
            {getTransportBadge(urgentTeacherAlert.transportationType)}
          </div>

          {/* Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left mb-6 space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-slate-500">Phụ huynh:</span>
              <span className="font-bold text-slate-800">{urgentTeacherAlert.parentName}</span>
            </div>
            {urgentTeacherAlert.licensePlate && (
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-slate-500">Biển số xe:</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {urgentTeacherAlert.licensePlate}
                </span>
              </div>
            )}
            {urgentTeacherAlert.note && (
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-slate-500">Ghi chú:</span>
                <span className="italic text-slate-700">{urgentTeacherAlert.note}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              id="btn-teacher-start-prep"
              onClick={handleStartPreparing}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all active:scale-95 text-sm sm:text-base"
            >
              <Check className="w-5 h-5" />
              <span>CHUẨN BỊ HỌC SINH</span>
            </button>

            <button
              id="btn-teacher-dismiss-alert"
              onClick={clearUrgentAlert}
              className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base"
            >
              <span>Đã xem (Xem hàng chờ)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
