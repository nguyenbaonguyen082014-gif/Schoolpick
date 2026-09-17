import React, { useState } from 'react';
import {
  Car,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  Check,
  ChevronRight,
  ShieldCheck,
  Home,
  Bell,
  User as UserIcon,
  Sparkles,
  Phone,
  ArrowRight,
  HelpCircle,
  XCircle,
  Compass,
  LogOut,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSchoolPick } from '../../context/SchoolPickContext';
import { PickupStatus, Student, TransportationType, PickupZoneId } from '../../types';
import { ParentPickupModal } from './ParentPickupModal';
import { CampusPickupMap } from '../map/CampusPickupMap';
import { SchoolMapModal } from '../common/SchoolMapModal';
import { NotificationDrawer } from '../common/NotificationDrawer';

export const ParentDashboard: React.FC = () => {
  const {
    currentUser,
    students,
    activeRequests,
    historyRequests,
    updateRequestStatus,
    cancelRequest,
    requestConfirmation,
    logout,
  } = useSchoolPick();

  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [selectedStudentForPickup, setSelectedStudentForPickup] = useState<Student | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'home' | 'pickup' | 'notifications' | 'account'>('home');
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  // Find parent's children (Default to Nguyễn Minh Bảo - 7A1)
  const myStudents = students.filter(
    s => s.parentId === currentUser?.id || currentUser?.childrenIds?.includes(s.id)
  );
  const displayStudents = myStudents.length > 0 ? myStudents : students.slice(0, 2);
  const primaryChild = displayStudents[0];

  // Target pickup zone for this parent's child (Khối 7 -> Zone B)
  const targetZoneId = primaryChild?.pickupZoneId || PickupZoneId.ZONE_B;

  // Active requests created by this parent
  const myActiveRequest = activeRequests.find(
    r => r.parentId === currentUser?.id || displayStudents.some(s => s.id === r.studentId)
  );

  // Position in queue (Section 13)
  const queueIndex = myActiveRequest
    ? activeRequests.findIndex(r => r.id === myActiveRequest.id)
    : -1;
  const positionNumber = queueIndex >= 0 ? queueIndex + 1 : 1;
  const aheadCount = positionNumber > 1 ? positionNumber - 1 : 0;

  const handleOpenPickup = (student?: Student) => {
    setSelectedStudentForPickup(student || primaryChild);
    setPickupModalOpen(true);
  };

  // Section 18: Confirmation dialog on picked up
  const handleConfirmPickedUp = (requestId: string, studentName: string) => {
    requestConfirmation({
      title: 'Xác nhận đón con',
      message: `Xác nhận bạn đã gặp và đón học sinh ${studentName} thành công?`,
      confirmLabel: 'Xác nhận đã đón',
      cancelLabel: 'Hủy',
      onConfirm: () => {
        updateRequestStatus(requestId, PickupStatus.PICKED_UP);
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}
      },
    });
  };

  const isReady = myActiveRequest?.status === PickupStatus.READY;
  const isPreparing = myActiveRequest?.status === PickupStatus.PREPARING;
  const isRequested = myActiveRequest?.status === PickupStatus.REQUESTED;

  return (
    <div className="pb-28 lg:pb-12 max-w-4xl mx-auto px-3 sm:px-6 pt-2 space-y-6">
      {/* SECTION 2: HEADER CHÀO HỎI */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3.5">
            {currentUser?.avatarUrl && (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-100 shadow-xs shrink-0 mt-1"
              />
            )}
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Cổng đón học sinh đang mở</span>
                {currentUser?.isGoogleAuth && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Google
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Xin chào, {currentUser?.name || 'Nguyễn Văn An'} 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                Trường THCS Ban Mai • Hệ thống SchoolPick hỗ trợ đón con thông minh, giảm ùn tắc.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>🟢 Đang kết nối</span>
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 15: MÀN HÌNH "CON BẠN ĐÃ SẴN SÀNG" (KHI TRẠNG THÁI READY) */}
      {isReady && myActiveRequest && (
        <div
          id="parent-student-ready-banner"
          className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-xl shadow-emerald-500/20 border-2 border-emerald-400 animate-in zoom-in-95 duration-300"
        >
          <div className="flex items-center space-x-2 text-emerald-100 text-xs font-black uppercase tracking-wider mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <span>🟢 THÔNG BÁO TỪ GIÁO VIÊN</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
            CON BẠN ĐÃ SẴN SÀNG
          </h2>
          <p className="text-xl sm:text-2xl font-black text-emerald-100 mb-4">
            👦 {myActiveRequest.studentName} (Lớp {myActiveRequest.className})
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-slate-900">
            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-xs flex items-center space-x-3">
              <MapPin className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  ĐIỂM HẸN ĐÓN
                </span>
                <span className="text-base font-black text-slate-900">
                  Vui lòng di chuyển đến{' '}
                  <b className="text-emerald-700">
                    {myActiveRequest.pickupZoneId === PickupZoneId.ZONE_B ? 'Khu B' : 'Khu A'}
                  </b>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-xs flex items-center space-x-3">
              <span className="text-2xl font-black text-slate-900">🎫</span>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  SỐ THỨ TỰ ĐÓN
                </span>
                <span className="text-xl font-black font-mono text-emerald-700">
                  Số đón: #{myActiveRequest.queueNumber}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6 p-3.5 rounded-xl bg-black/15 text-xs text-emerald-50 leading-relaxed font-medium">
            💡 <b>Lưu ý:</b> Vui lòng chuẩn bị thông tin đón học sinh khi đến khu vực và hạ kính xe để giáo viên nhận diện.
          </div>

          <button
            id="btn-parent-ready-confirm"
            onClick={() => handleConfirmPickedUp(myActiveRequest.id, myActiveRequest.studentName)}
            className="w-full py-4 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 font-black text-base sm:text-lg shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>XÁC NHẬN ĐÃ ĐÓN ĐƯỢC CON</span>
          </button>
        </div>
      )}

      {/* SECTION 13: THẺ "BẠN ĐANG Ở ĐÂU TRONG HÀNG CHỜ?" */}
      {myActiveRequest && !isReady && (
        <div
          id="parent-queue-position-card"
          className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border-2 border-blue-600/30 relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-blue-50 -z-0"></div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 flex items-center space-x-1.5">
                <Car className="w-4 h-4" />
                <span>🚗 VỊ TRÍ CỦA BẠN TRONG HÀNG CHỜ</span>
              </span>

              <div className="flex items-baseline space-x-3 mt-2">
                <span className="text-4xl sm:text-5xl font-black text-blue-700 font-mono">
                  #{myActiveRequest.queueNumber || positionNumber}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-700">
                  {aheadCount > 0 ? (
                    <span>Còn <b>{aheadCount} gia đình</b> phía trước</span>
                  ) : (
                    <span className="text-emerald-600 font-black">Lượt của bạn tiếp theo!</span>
                  )}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-1 font-semibold">
                📍 Điểm hẹn:{' '}
                <b className="text-slate-800">
                  {myActiveRequest.pickupZoneId === PickupZoneId.ZONE_B ? 'Khu B (Khối 7)' : 'Khu A'}
                </b>{' '}
                • Trạng thái:{' '}
                <span className="text-amber-600 font-black">
                  {isPreparing ? '🔵 ĐANG CHUẨN BỊ' : '🟡 ĐANG XỬ LÝ'}
                </span>
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>Giáo viên đang xử lý</span>
              </span>

              <button
                onClick={() => cancelRequest(myActiveRequest.id)}
                className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
              >
                Hủy yêu cầu đón
              </button>
            </div>
          </div>

          {/* SECTION 12: TIMELINE TRỰC QUAN 5 BƯỚC */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">
              TIẾN TRÌNH THỜI GIAN THỰC:
            </h4>

            <div className="space-y-4 pl-1">
              {/* Step 1: ✓ Yêu cầu đã gửi */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-black text-slate-900">✓ Yêu cầu đã gửi</p>
                  <p className="text-[11px] text-slate-500">Lúc {myActiveRequest.createdAt}</p>
                </div>
              </div>

              <div className="w-0.5 h-3.5 bg-emerald-300 ml-3 -my-2"></div>

              {/* Step 2: ✓ Giáo viên đã nhận */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-black text-slate-900">✓ Giáo viên đã nhận</p>
                  <p className="text-[11px] text-slate-500">
                    Giáo viên lớp {myActiveRequest.className} đã nhận tín hiệu đón
                  </p>
                </div>
              </div>

              <div
                className={`w-0.5 h-3.5 ml-3 -my-2 ${
                  isPreparing ? 'bg-blue-300' : 'bg-slate-200'
                }`}
              ></div>

              {/* Step 3: 🟡 Đang chuẩn bị */}
              <div className="flex items-start space-x-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isPreparing
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isPreparing ? <Clock className="w-3.5 h-3.5" /> : <span className="text-xs">○</span>}
                </div>
                <div>
                  <p
                    className={`text-xs sm:text-sm font-black ${
                      isPreparing ? 'text-blue-700' : 'text-slate-400'
                    }`}
                  >
                    {isPreparing ? '🔵 Đang chuẩn bị' : '○ Đang chuẩn bị'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isPreparing
                      ? 'Học sinh đang thu xếp cặp sách và di chuyển'
                      : 'Chờ giáo viên chuẩn bị học sinh'}
                  </p>
                </div>
              </div>

              <div className="w-0.5 h-3.5 ml-3 -my-2 bg-slate-200"></div>

              {/* Step 4: ○ Học sinh sẵn sàng */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                  <span className="text-xs">○</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-black text-slate-400">○ Học sinh sẵn sàng</p>
                  <p className="text-[11px] text-slate-400">Học sinh có mặt tại điểm đón</p>
                </div>
              </div>

              <div className="w-0.5 h-3.5 ml-3 -my-2 bg-slate-200"></div>

              {/* Step 5: ○ Đã đón */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                  <span className="text-xs">○</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-black text-slate-400">○ Đã đón</p>
                  <p className="text-[11px] text-slate-400">Kết thúc phiên đón</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: THẺ HỌC SINH LỚN "HÔM NAY BẠN MUỐN ĐÓN AI?" (KHI CHƯA GỬI YÊU CẦU) */}
      {!myActiveRequest && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">
                THÔNG TIN ĐÓN CON HÔM NAY
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Hôm nay bạn muốn đón ai?
              </h2>
            </div>

            <span className="text-xs text-slate-400 font-semibold">
              {displayStudents.length} học sinh
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayStudents.map(student => (
              <div
                key={student.id}
                className="bg-white rounded-3xl p-6 shadow-xs border-2 border-slate-200 hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-black">
                      Lớp {student.className}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Khối {student.grade}</span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900">👦 {student.name}</h3>

                  <div className="space-y-1.5 pt-1 text-xs font-semibold text-slate-600">
                    <p className="flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>
                        Khu đón:{' '}
                        <b className="text-blue-700 font-bold">
                          {student.pickupZoneId === PickupZoneId.ZONE_B ? 'Khu đón B' : 'Khu đón A'}
                        </b>
                      </span>
                    </p>

                    <p className="flex items-center space-x-1.5 text-slate-500">
                      <Car className="w-4 h-4 text-slate-400" />
                      <span>🚗 Chưa đăng ký đón</span>
                    </p>
                  </div>
                </div>

                {/* SECTION 2: NÚT "TÔI ĐANG ĐẾN" LÀ CTA LỚN NHẤT TRÊN MÀN HÌNH */}
                <button
                  id={`btn-parent-im-coming-${student.id}`}
                  onClick={() => handleOpenPickup(student)}
                  className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base sm:text-lg shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2 transition-transform active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  <Car className="w-5 h-5" />
                  <span>🚗 TÔI ĐANG ĐẾN</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3, 5, 6, 7, 14, 20: BẢN ĐỒ KHU VỰC ĐÓN TƯƠNG TÁC (FULL WIDTH MOBILE) */}
      <div id="parent-map-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">
              SƠ ĐỒ PHÂN LUỒNG MỘT CHIỀU
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Bản đồ khu vực đón học sinh
            </h3>
          </div>

          <span className="text-xs font-bold text-blue-600 flex items-center space-x-1">
            <Compass className="w-4 h-4" />
            <span>Khu vực đón: <b>Khu B</b></span>
          </span>
        </div>

        {/* Embedded Interactive SVG Campus Map */}
        <CampusPickupMap
          highlightZoneId={targetZoneId}
          compact={false}
          showLegend={true}
          showInstructions={true}
          interactive={true}
        />
      </div>

      {/* LỊCH SỬ ĐÓN GẦN ĐÂY */}
      {historyRequests.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
          <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Lịch sử đón con</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {historyRequests.slice(0, 3).map(hist => (
              <div key={hist.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">
                    {hist.studentName} • Lớp {hist.className}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Hoàn thành lúc {hist.pickedUpAt || hist.createdAt} • Phương tiện:{' '}
                    {hist.transportationType === TransportationType.CAR ? '🚗 Ô tô' : '🏍️ Xe máy'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                  ✓ Đã đón
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 16: BOTTOM NAVIGATION MOBILE */}
      <nav
        id="parent-bottom-nav"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2 flex items-center justify-around lg:hidden shadow-lg"
      >
        {/* 🏠 Trang chủ */}
        <button
          onClick={() => {
            setActiveBottomTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center space-y-1 p-1 text-xs font-bold transition-colors cursor-pointer ${
            activeBottomTab === 'home' ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Trang chủ</span>
        </button>

        {/* 🚗 Đón con (Prominent Center Tab) */}
        <button
          id="btn-bottom-nav-pickup"
          onClick={() => handleOpenPickup()}
          className="flex flex-col items-center space-y-1 p-1 text-xs font-bold text-blue-600 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center -mt-4 shadow-lg shadow-blue-500/30">
            <Car className="w-5 h-5" />
          </div>
          <span className="font-black">Đón con</span>
        </button>

        {/* 🔔 Thông báo */}
        <button
          onClick={() => setNotifOpen(true)}
          className="flex flex-col items-center space-y-1 p-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span>Thông báo</span>
        </button>

        {/* 👤 Tài khoản */}
        <button
          onClick={() => setAccountModalOpen(true)}
          className="flex flex-col items-center space-y-1 p-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <UserIcon className="w-5 h-5" />
          <span>Tài khoản</span>
        </button>
      </nav>

      {/* Account Info Modal */}
      {accountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-3">Tài khoản phụ huynh</h3>
            <div className="space-y-2 text-xs">
              <p className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px]">HỌ TÊN</span>
                <b className="text-slate-800">{currentUser?.name || 'Nguyễn Văn An'}</b>
              </p>
              <p className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px]">SỐ ĐIỆN THOẠI</span>
                <b className="text-slate-800">{currentUser?.phone || '0988 123 456'}</b>
              </p>
              <p className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px]">CON ĐANG THEO HỌC</span>
                <b className="text-blue-700">{displayStudents.map(s => s.name).join(', ')}</b>
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <button
                id="btn-parent-modal-logout"
                onClick={() => {
                  setAccountModalOpen(false);
                  logout();
                }}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
              <button
                onClick={() => setAccountModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ParentPickupModal
        isOpen={pickupModalOpen}
        onClose={() => setPickupModalOpen(false)}
        preSelectedStudent={selectedStudentForPickup}
      />
      <SchoolMapModal isOpen={mapModalOpen} onClose={() => setMapModalOpen(false)} />
      <NotificationDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
};
