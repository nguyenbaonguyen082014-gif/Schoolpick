import React, { useState } from 'react';
import {
  X,
  Car,
  Bike,
  User as UserIcon,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  MapPin,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useSchoolPick } from '../../context/SchoolPickContext';
import { Student, TransportationType, PickupZoneId } from '../../types';

interface ParentPickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedStudent?: Student | null;
}

export const ParentPickupModal: React.FC<ParentPickupModalProps> = ({
  isOpen,
  onClose,
  preSelectedStudent,
}) => {
  const { students, currentUser, createPickupRequest } = useSchoolPick();

  // Get current parent's children
  const myStudents = students.filter(
    s => s.parentId === currentUser?.id || currentUser?.childrenIds?.includes(s.id)
  );
  const availableStudents = myStudents.length > 0 ? myStudents : students.slice(0, 2);

  const [step, setStep] = useState<number>(1);
  const [selectedStudent, setSelectedStudent] = useState<Student>(
    preSelectedStudent || availableStudents[0]
  );
  const [transportationType, setTransportationType] = useState<TransportationType>(
    TransportationType.CAR
  );
  const [licensePlate, setLicensePlate] = useState('30A-928.34');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReq, setSubmittedReq] = useState<any>(null);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmitPickup = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newReq = createPickupRequest({
        studentId: selectedStudent.id,
        transportationType,
        licensePlate: transportationType !== TransportationType.WALK ? licensePlate : undefined,
        note: note.trim() || undefined,
      });
      setIsSubmitting(false);
      setSubmittedReq(newReq);
      setTimeout(() => {
        onClose();
        setSubmittedReq(null);
        setStep(1);
      }, 1500);
    }, 400);
  };

  const getZoneLabel = (zoneId: PickupZoneId) => {
    switch (zoneId) {
      case PickupZoneId.ZONE_A:
        return { name: 'KHU A', desc: 'Dành cho Khối 6 & Tiểu học (Làn số 1 - Cổng chính)' };
      case PickupZoneId.ZONE_B:
        return { name: 'KHU B', desc: 'Dành cho Khối 7 (Làn số 2 - Sân trung tâm)' };
      case PickupZoneId.ZONE_C:
        return { name: 'KHU C', desc: 'Dành cho Khối 8 (Làn số 3 - Cổng phía Tây)' };
      case PickupZoneId.ZONE_D:
        return { name: 'KHU D', desc: 'Dành cho Khối 9 (Làn số 4 - Hành lang Đông)' };
    }
  };

  const zoneInfo = getZoneLabel(selectedStudent.pickupZoneId);

  return (
    <div
      id="pickup-registration-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="pickup-registration-modal-content"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Step Indicator */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
              BƯỚC {step} / 4
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {step === 1 && 'Chọn học sinh cần đón'}
              {step === 2 && 'Chọn phương tiện di chuyển'}
              {step === 3 && 'Khu vực đón học sinh'}
              {step === 4 && 'Xác nhận & Báo đang đến'}
            </h3>
          </div>
          <button
            id="btn-close-pickup-flow"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-blue-600 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        {/* Step Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: CHỌN HỌC SINH */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-4">
                Vui lòng chọn con bạn muốn đón trong phiên tan học này:
              </p>
              {availableStudents.map(student => {
                const isSelected = selectedStudent.id === student.id;
                return (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{student.name}</h4>
                        <p className="text-xs text-slate-500">
                          Lớp: <span className="font-semibold text-blue-700">{student.className}</span> • Khu vực:{' '}
                          <span className="font-semibold text-slate-700">
                            {student.pickupZoneId === PickupZoneId.ZONE_B ? 'Khu B' : 'Khu A'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">Khối {student.grade}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 2: CHỌN PHƯƠNG TIỆN */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 mb-2">
                Chọn phương tiện bạn đang dùng để đến trường (để nhân viên và giáo viên nhận diện):
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Car */}
                <button
                  type="button"
                  id="btn-select-car"
                  onClick={() => setTransportationType(TransportationType.CAR)}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    transportationType === TransportationType.CAR
                      ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                    <Car className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">🚗 Ô tô</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">Làn xe hơi</span>
                </button>

                {/* Motorbike */}
                <button
                  type="button"
                  id="btn-select-motorbike"
                  onClick={() => setTransportationType(TransportationType.MOTORBIKE)}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    transportationType === TransportationType.MOTORBIKE
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                    <Bike className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">🏍️ Xe máy</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">Làn xe máy</span>
                </button>

                {/* Walk */}
                <button
                  type="button"
                  id="btn-select-walk"
                  onClick={() => setTransportationType(TransportationType.WALK)}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    transportationType === TransportationType.WALK
                      ? 'border-amber-600 bg-amber-50/80 shadow-md ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">🚶 Đi bộ</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">Khu vực cổng</span>
                </button>
              </div>

              {/* License Plate for vehicle */}
              {transportationType !== TransportationType.WALK && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Biển số xe (tùy chọn - giúp giáo viên nhận diện nhanh)
                  </label>
                  <input
                    type="text"
                    value={licensePlate}
                    onChange={e => setLicensePlate(e.target.value)}
                    placeholder="Ví dụ: 30A-123.45"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 3: KHU VỰC ĐÓN */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
                  TỰ ĐỘNG XÁC ĐỊNH THEO LỚP HỌC
                </span>
                <h4 className="text-xl font-black text-blue-950 mt-1">
                  Khu vực đón của bạn: <span className="text-blue-600">{zoneInfo.name}</span>
                </h4>
                <p className="text-xs text-blue-800 mt-1 font-medium">{zoneInfo.desc}</p>
              </div>

              {/* Simple Graphic Map Representation */}
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-center text-xs">
                <div className="font-bold text-slate-700 mb-2">Sơ đồ vị trí cổng và khu vực đón:</div>
                <div className="space-y-1.5 font-mono text-[11px] bg-white p-3 rounded-xl border border-slate-200 text-slate-600 leading-tight">
                  <p className="text-blue-600 font-bold">CỔNG TRƯỜNG ↓</p>
                  <p>┌───────────────────────┐</p>
                  <p>│      TRƯỜNG HỌC       │</p>
                  <p>└───────────────────────┘</p>
                  <p className="font-bold">
                    🚗 KHU A &nbsp;&nbsp;&nbsp;&nbsp;{' '}
                    <span className="text-blue-600 font-black bg-blue-100 px-1 rounded">
                      🚗 KHU B (Bạn ở đây)
                    </span>
                  </p>
                  <p className="text-slate-400">🚗 KHU C &nbsp;&nbsp;&nbsp;&nbsp; 🚗 KHU D</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start space-x-2 text-xs text-amber-800">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="font-medium">
                  <b>Thông báo:</b> Vui lòng di chuyển đến <b>{zoneInfo.name}</b> khi đến trường để đón học sinh.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: XÁC NHẬN */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-xs text-slate-500">Học sinh:</span>
                  <span className="text-sm font-black text-slate-900">{selectedStudent.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-xs text-slate-500">Lớp:</span>
                  <span className="text-sm font-bold text-blue-700">{selectedStudent.className}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-xs text-slate-500">Phương tiện:</span>
                  <span className="text-sm font-bold text-slate-900">
                    {transportationType === TransportationType.CAR && '🚗 Ô tô'}
                    {transportationType === TransportationType.MOTORBIKE && '🏍️ Xe máy'}
                    {transportationType === TransportationType.WALK && '🚶 Đi bộ'}
                    {licensePlate && transportationType !== TransportationType.WALK && ` (${licensePlate})`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Khu vực đón:</span>
                  <span className="text-sm font-black text-emerald-700">{zoneInfo.name}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú cho giáo viên (tùy chọn)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Ví dụ: Bố mặc áo đen, đang đợi gần cây bàng"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Section 13: Submission state or Huge Submit Button */}
              {submittedReq ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-center animate-in zoom-in-95 duration-200">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black uppercase mb-3">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ ĐÃ BÁO GIÁO VIÊN</span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900">{selectedStudent.name}</h4>
                  <p className="text-xs font-bold text-slate-600 mt-1">
                    📍 {zoneInfo.name} ({selectedStudent.className})
                  </p>
                  <div className="mt-3 inline-block px-4 py-1.5 rounded-xl bg-slate-900 text-white font-mono font-black text-base">
                    🎫 Số thứ tự: #{submittedReq.queueNumber}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  id="btn-submit-i-am-coming"
                  disabled={isSubmitting}
                  onClick={handleSubmitPickup}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-black text-base sm:text-lg shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang gửi thông báo...</span>
                    </div>
                  ) : (
                    <>
                      <Car className="w-6 h-6" />
                      <span className="tracking-wide uppercase">🚗 TÔI ĐANG ĐẾN</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons (Steps 1 - 3) */}
        {step < 4 && (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                id="btn-step-prev"
                onClick={handlePrevStep}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
            ) : (
              <div></div>
            )}

            <button
              type="button"
              id="btn-step-next"
              onClick={handleNextStep}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm flex items-center space-x-1 transition-colors"
            >
              <span>Tiếp tục</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
