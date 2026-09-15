import React, { useState, useEffect } from 'react';
import {
  Car,
  Bike,
  User as UserIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  Filter,
  Check,
  ChevronRight,
  Bell,
  Volume2,
  VolumeX,
  Users,
  ClipboardList,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSchoolPick } from '../../context/SchoolPickContext';
import { PickupStatus, TransportationType, PickupZoneId, PickupRequest } from '../../types';
import { UrgentTeacherAlertModal } from './UrgentTeacherAlertModal';
import { SchoolMapModal } from '../common/SchoolMapModal';
import { NotificationDrawer } from '../common/NotificationDrawer';
import { CampusPickupMap } from '../map/CampusPickupMap';

interface TeacherDashboardProps {
  embeddedInSplit?: boolean;
  activeTab?: 'overview' | 'queue' | 'students' | 'history' | 'map';
  onTabChange?: (tab: 'overview' | 'queue' | 'students' | 'history' | 'map') => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  embeddedInSplit = false,
  activeTab: externalTab,
  onTabChange: externalOnTabChange,
}) => {
  const {
    currentUser,
    requests,
    activeRequests,
    historyRequests,
    students,
    zones,
    updateRequestStatus,
    simulateIncomingParent,
    requestConfirmation,
  } = useSchoolPick();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('Thứ Hai, 14/09/2026');
  const [internalTab, setInternalTab] = useState<'overview' | 'queue' | 'students' | 'history'>('overview');
  const activeTab = externalTab ?? internalTab;
  const setActiveTab = (tab: 'overview' | 'queue' | 'students' | 'history') => {
    if (externalOnTabChange) {
      externalOnTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [mapOpen, setMapOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Real-time Clock
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('vi-VN', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      );
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const assignedClass = currentUser?.assignedClassName || '7A1';
  const teacherName = currentUser?.name || 'Cô Lan';

  // Requests for this class
  const classRequests = requests.filter(r => r.className === assignedClass);
  const classActiveRequests = classRequests.filter(
    r => r.status !== PickupStatus.PICKED_UP && r.status !== PickupStatus.CANCELLED
  );
  const classHistoryRequests = classRequests.filter(
    r => r.status === PickupStatus.PICKED_UP || r.status === PickupStatus.CANCELLED
  );

  // New requests that just arrived (Section 6 Spotlight)
  const newRequests = classActiveRequests.filter(r => r.status === PickupStatus.REQUESTED);
  const latestNewRequest = newRequests.length > 0 ? newRequests[0] : null;

  // 4 Stats (Section 5)
  const countWaiting = classActiveRequests.filter(r => r.status === PickupStatus.REQUESTED).length;
  const countPreparing = classActiveRequests.filter(r => r.status === PickupStatus.PREPARING).length;
  const countReady = classActiveRequests.filter(r => r.status === PickupStatus.READY).length;
  const countPickedUp = classHistoryRequests.filter(r => r.status === PickupStatus.PICKED_UP).length;

  const classStudents = students.filter(s => s.className === assignedClass);

  // Action flow with Section 18 Confirmation Modal
  const handleTransitionStatus = (req: PickupRequest) => {
    if (req.status === PickupStatus.REQUESTED) {
      updateRequestStatus(req.id, PickupStatus.PREPARING);
    } else if (req.status === PickupStatus.PREPARING) {
      updateRequestStatus(req.id, PickupStatus.READY);
    } else if (req.status === PickupStatus.READY) {
      // Prompt confirm modal before finalizing picked up
      requestConfirmation({
        title: 'Xác nhận học sinh đã được đón',
        message: `Xác nhận học sinh ${req.studentName} (Lớp ${req.className}) đã được phụ huynh đón an toàn?`,
        confirmLabel: 'Xác nhận đã đón',
        cancelLabel: 'Hủy bỏ',
        onConfirm: () => {
          updateRequestStatus(req.id, PickupStatus.PICKED_UP);
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.65 },
            });
          } catch {}
        },
      });
    }
  };

  const getTransportIcon = (type: TransportationType) => {
    switch (type) {
      case TransportationType.CAR:
        return <Car className="w-4 h-4 text-blue-600" />;
      case TransportationType.MOTORBIKE:
        return <Bike className="w-4 h-4 text-emerald-600" />;
      case TransportationType.WALK:
        return <UserIcon className="w-4 h-4 text-amber-600" />;
    }
  };

  const getTransportText = (type: TransportationType) => {
    switch (type) {
      case TransportationType.CAR:
        return '🚗 Ô tô';
      case TransportationType.MOTORBIKE:
        return '🏍️ Xe máy';
      case TransportationType.WALK:
        return '🚶 Đi bộ';
    }
  };

  // Section 9: Status Badges with color + icon + text
  const renderStatusBadge = (status: PickupStatus) => {
    switch (status) {
      case PickupStatus.REQUESTED:
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-1 animate-ping"></span>
            <span>🟡 ĐÃ GỬI YÊU CẦU</span>
          </span>
        );
      case PickupStatus.PREPARING:
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-black">
            <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" />
            <span>🔵 ĐANG CHUẨN BỊ</span>
          </span>
        );
      case PickupStatus.READY:
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            <span>🟢 SẴN SÀNG</span>
          </span>
        );
      case PickupStatus.PICKED_UP:
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-black">
            <Check className="w-3.5 h-3.5 mr-1 text-slate-600" />
            <span>✓ ĐÃ ĐÓN</span>
          </span>
        );
      case PickupStatus.CANCELLED:
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-black">
            <AlertCircle className="w-3.5 h-3.5 mr-1 text-red-600" />
            <span>🔴 ĐÃ HỦY</span>
          </span>
        );
    }
  };

  // Filtered queue items
  const filteredQueue = classActiveRequests.filter(req => {
    const matchesSearch =
      req.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.licensePlate && req.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full space-y-6 pb-12">
      {/* SECTION 5: HEADER GREETING & REALTIME CLOCK */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Chào {teacherName} 👋
          </h1>
          <p className="text-sm font-bold text-slate-500 mt-1">
            Lớp {assignedClass} • {currentDate}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Real-time Clock */}
          <div className="px-4 py-2 rounded-2xl bg-slate-900 text-white font-mono text-sm sm:text-base font-black tracking-wider flex items-center space-x-2 shadow-inner">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{currentTime || '16:21:00'}</span>
          </div>

          {/* Quick simulator trigger */}
          <button
            id="btn-teacher-simulate-parent"
            onClick={simulateIncomingParent}
            className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-sm flex items-center space-x-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>🧪 Giả lập phụ huynh đến</span>
          </button>
        </div>
      </div>

      {/* SECTION 5: 4 THỐNG KÊ (STAT CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 🟡 08 Đang chờ */}
        <div
          onClick={() => {
            setActiveTab('queue');
            setStatusFilter(PickupStatus.REQUESTED);
          }}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Đang chờ
            </span>
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">
              {countWaiting < 10 ? `0${countWaiting}` : countWaiting}
            </span>
            <span className="text-xs font-bold text-amber-600">🟡 yêu cầu mới</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Chờ giáo viên chuẩn bị</p>
        </div>

        {/* 🔵 02 Đang chuẩn bị */}
        <div
          onClick={() => {
            setActiveTab('queue');
            setStatusFilter(PickupStatus.PREPARING);
          }}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Đang chuẩn bị
            </span>
            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">
              {countPreparing < 10 ? `0${countPreparing}` : countPreparing}
            </span>
            <span className="text-xs font-bold text-blue-600">🔵 học sinh</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Đang dọn đồ di chuyển</p>
        </div>

        {/* 🟢 01 Sẵn sàng */}
        <div
          onClick={() => {
            setActiveTab('queue');
            setStatusFilter(PickupStatus.READY);
          }}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Sẵn sàng
            </span>
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">
              {countReady < 10 ? `0${countReady}` : countReady}
            </span>
            <span className="text-xs font-bold text-emerald-600">🟢 tại điểm đón</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Học sinh đã có mặt</p>
        </div>

        {/* ✓ 24 Đã đón */}
        <div
          onClick={() => setActiveTab('history')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Đã đón
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">
              {countPickedUp < 10 ? `0${countPickedUp}` : countPickedUp}
            </span>
            <span className="text-xs font-bold text-slate-600">✓ hoàn thành</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Đã về với gia đình</p>
        </div>
      </div>

      {/* SECTION 6 & 7: KHU VỰC "YÊU CẦU ĐÓN MỚI" (SPOTLIGHT CARD) */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black text-slate-900">Yêu cầu đón mới</h2>
          </div>
          {newRequests.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
              {newRequests.length} yêu cầu cần chuẩn bị
            </span>
          )}
        </div>

        {!latestNewRequest ? (
          /* Empty state when no new requests (Section 6 & 21) */
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="text-base font-extrabold text-slate-800">Không có yêu cầu mới</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tất cả học sinh hiện đã được xử lý. Yêu cầu mới của phụ huynh sẽ xuất hiện ngay tại đây.
            </p>
          </div>
        ) : (
          /* Large featured card (Section 6 & 7) */
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/50 to-white border-2 border-amber-400 shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-black tracking-wide uppercase">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>🔔 YÊU CẦU MỚI</span>
                </div>

                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      👦 {latestNewRequest.studentName}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-900 font-extrabold text-xs">
                      Lớp {latestNewRequest.className}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2 text-xs font-bold text-slate-700">
                    <span className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {getTransportIcon(latestNewRequest.transportationType)}
                      <span>{getTransportText(latestNewRequest.transportationType)}</span>
                      {latestNewRequest.licensePlate && (
                        <span className="font-mono text-slate-900 ml-1">
                          ({latestNewRequest.licensePlate})
                        </span>
                      )}
                    </span>

                    <span className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        Khu vực:{' '}
                        <b className="text-blue-700">
                          {latestNewRequest.pickupZoneId === PickupZoneId.ZONE_B ? 'Khu B' : 'Khu A'}
                        </b>
                      </span>
                    </span>

                    <span className="flex items-center space-x-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Đã yêu cầu lúc {latestNewRequest.createdAt}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Large CTA button (Section 6) */}
              <button
                id="btn-spotlight-prepare"
                onClick={() => handleTransitionStatus(latestNewRequest)}
                className="w-full lg:w-auto px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <span>CHUẨN BỊ HỌC SINH</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 10 & 11: TÌNH TRẠNG KHU VỰC ĐÓN & BẢN ĐỒ MINH HỌA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bảng tình trạng khu vực đón (Section 10) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <Car className="w-4 h-4 text-blue-600" />
              <span>Tình trạng khu vực đón</span>
            </h2>
            <span className="text-xs font-bold text-slate-500">Cập nhật trực tiếp</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {zones.map(zone => {
              const isZoneB = zone.id === PickupZoneId.ZONE_B;
              const isCrowded = isZoneB || zone.currentVehicles >= 12;

              return (
                <div
                  key={zone.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCrowded
                      ? 'bg-amber-50/50 border-amber-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-sm">{zone.name}</span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isCrowded ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    ></span>
                  </div>
                  <div className="mt-2 text-base font-black text-slate-800">
                    {isCrowded ? '🟡' : '🟢'} {zone.currentVehicles} xe
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{zone.grades}</p>
                </div>
              );
            })}
          </div>

          {/* Section 10 Warning for Zone B */}
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <p className="font-extrabold">⚠️ Khu B đang đông (15 xe đang chờ)</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Đề xuất giáo viên lớp 7A1: <b>Ưu tiên xử lý các yêu cầu tại Khu B</b> để giải tỏa cổng sau.
              </p>
            </div>
          </div>
        </div>

        {/* Bản đồ khu vực đón minh họa hiện đại (Section 8 & 9) */}
        <div className="lg:col-span-5 flex flex-col">
          <CampusPickupMap
            highlightZoneId={PickupZoneId.ZONE_B}
            compact={true}
            showLegend={true}
            showInstructions={false}
            interactive={true}
            className="h-full"
          />
        </div>
      </div>

      {/* SECTION 8 & 9: HÀNG CHỜ GIÁO VIÊN & TABS (QUEUE LIST) */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-2xl text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hàng chờ xử lý ({classActiveRequests.length})
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lịch sử đón ({classHistoryRequests.length})
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Danh sách lớp ({classStudents.length})
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm tên học sinh, biển số..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {activeTab === 'overview' && (
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">Tất cả</option>
                <option value={PickupStatus.REQUESTED}>Chờ chuẩn bị</option>
                <option value={PickupStatus.PREPARING}>Đang chuẩn bị</option>
                <option value={PickupStatus.READY}>Sẵn sàng</option>
              </select>
            )}
          </div>
        </div>

        {/* TAB 1: QUEUE LIST (Section 8) */}
        {activeTab === 'overview' && (
          <div className="pt-6 space-y-3">
            {filteredQueue.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <div className="text-3xl mb-2">🎉</div>
                <h3 className="text-base font-bold text-slate-700">Không có học sinh đang chờ</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tất cả yêu cầu đón đã được xử lý xong.
                </p>
              </div>
            ) : (
              filteredQueue.map(req => {
                const isRequested = req.status === PickupStatus.REQUESTED;
                const isPreparing = req.status === PickupStatus.PREPARING;
                const isReady = req.status === PickupStatus.READY;

                return (
                  <div
                    key={req.id}
                    id={`teacher-queue-row-${req.id}`}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                  >
                    {/* Left: Prominent #24 Number & Largest Student Name (Section 8) */}
                    <div className="flex items-center space-x-4">
                      {/* #24 Prominent Queue Number */}
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">STT</span>
                        <span className="text-xl font-black leading-none">#{req.queueNumber}</span>
                      </div>

                      <div>
                        {/* Student Name: Largest Information */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                            {req.studentName}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-900 text-xs font-black">
                            {req.className}
                          </span>
                        </div>

                        {/* Details: Vehicle, Zone, Time */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                          <span className="flex items-center space-x-1 font-bold text-slate-700">
                            {getTransportIcon(req.transportationType)}
                            <span>{getTransportText(req.transportationType)}</span>
                            {req.licensePlate && (
                              <span className="font-mono text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded ml-1">
                                {req.licensePlate}
                              </span>
                            )}
                          </span>

                          <span className="flex items-center space-x-1 text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            <span>
                              Khu vực:{' '}
                              <b>{req.pickupZoneId === PickupZoneId.ZONE_B ? 'Khu B' : 'Khu A'}</b>
                            </span>
                          </span>

                          <span className="flex items-center space-x-1 text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Báo lúc: {req.createdAt}</span>
                          </span>

                          <span>Phụ huynh: {req.parentName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Section 9 Status Badge & Action Button */}
                    <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      {/* Status Badge (Section 9) */}
                      <div>{renderStatusBadge(req.status)}</div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleTransitionStatus(req)}
                        className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                          isRequested
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : isPreparing
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-900 hover:bg-black text-white'
                        }`}
                      >
                        {isRequested && (
                          <>
                            <span>CHUẨN BỊ HỌC SINH</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                        {isPreparing && (
                          <>
                            <Check className="w-4 h-4" />
                            <span>ĐÁNH DẤU SẴN SÀNG</span>
                          </>
                        )}
                        {isReady && (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>XÁC NHẬN ĐÃ ĐÓN</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: LỊCH SỬ ĐÓN (Section 22 Desktop Table & Mobile Cards) */}
        {activeTab === 'history' && (
          <div className="pt-6">
            {classHistoryRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                Chưa có lịch sử học sinh đã đón hôm nay.
              </div>
            ) : (
              <>
                {/* Desktop Table (Section 22) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                        <th className="py-3 px-3">Học sinh</th>
                        <th className="py-3 px-3">Lớp</th>
                        <th className="py-3 px-3">Khu vực</th>
                        <th className="py-3 px-3">Phương tiện</th>
                        <th className="py-3 px-3">Trạng thái</th>
                        <th className="py-3 px-3">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {classHistoryRequests.map(hist => (
                        <tr key={hist.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {hist.studentName}
                          </td>
                          <td className="py-3 px-3 font-bold">{hist.className}</td>
                          <td className="py-3 px-3">
                            {hist.pickupZoneId === PickupZoneId.ZONE_B ? 'Khu B' : 'Khu A'}
                          </td>
                          <td className="py-3 px-3">
                            {getTransportText(hist.transportationType)}
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                              ✓ Đã đón
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500 font-mono">
                            {hist.pickedUpAt || hist.createdAt}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards without horizontal overflow (Section 22) */}
                <div className="block md:hidden space-y-3">
                  {classHistoryRequests.map(hist => (
                    <div
                      key={hist.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {hist.studentName}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          ✓ Đã đón
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 space-y-1">
                        <p>Lớp: {hist.className} • Khu vực: {hist.pickupZoneId === PickupZoneId.ZONE_B ? 'Khu B' : 'Khu A'}</p>
                        <p>Phương tiện: {getTransportText(hist.transportationType)}</p>
                        <p className="text-[11px] text-slate-400">Thời gian: {hist.pickedUpAt || hist.createdAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 3: DANH SÁCH LỚP */}
        {activeTab === 'students' && (
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classStudents.map(student => {
              const activeReq = classActiveRequests.find(r => r.studentId === student.id);
              return (
                <div
                  key={student.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{student.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Phụ huynh: {student.parentName}</p>
                    <p className="text-[11px] text-slate-400">SĐT: {student.parentPhone}</p>
                  </div>
                  <div>
                    {activeReq ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                        Đang đón (#{activeReq.queueNumber})
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 text-[11px] font-medium">
                        Trong lớp
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 4: BẢN ĐỒ KHU VỰC ĐÓN TOÀN MÀN HÌNH */}
        {activeTab === 'map' && (
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Bản đồ phân luồng giao thông & khu vực đón
                </h3>
                <p className="text-xs text-slate-500">
                  Theo dõi trực quan vị trí xe và mật độ phương tiện giờ tan học
                </p>
              </div>
            </div>
            <CampusPickupMap
              highlightZoneId={PickupZoneId.ZONE_B}
              compact={false}
              showLegend={true}
              showInstructions={true}
              interactive={true}
            />
          </div>
        )}
      </div>
      <UrgentTeacherAlertModal />
      <SchoolMapModal isOpen={mapOpen} onClose={() => setMapOpen(false)} />
      <NotificationDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
};
