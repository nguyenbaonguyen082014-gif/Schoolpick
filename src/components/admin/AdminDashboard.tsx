import React, { useState } from 'react';
import {
  Car,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  MapPin,
  Sparkles,
  BarChart3,
  Layers,
  ArrowUpRight,
  Search,
  Filter,
  Check,
  ClipboardList,
  AlertCircle,
  Download,
  Bell,
  Compass,
} from 'lucide-react';
import { useSchoolPick } from '../../context/SchoolPickContext';
import { PickupStatus, PickupZoneId, TransportationType, PickupRequest } from '../../types';
import { CampusPickupMap } from '../map/CampusPickupMap';
import { SchoolMapModal } from '../common/SchoolMapModal';

interface AdminDashboardProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  activeTab: externalTab,
  onTabChange: externalOnTabChange,
}) => {
  const {
    zones,
    requests,
    students,
    activeRequests,
    historyRequests,
    simulateIncomingParent,
    updateRequestStatus,
    addToast,
  } = useSchoolPick();

  const [localTab, setLocalTab] = useState<string>('overview');
  const activeTab = externalTab || localTab;
  const setActiveTab = externalOnTabChange || setLocalTab;

  const [mapOpen, setMapOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<PickupZoneId | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');

  // Statistics
  const waitingCount = activeRequests.filter(r => r.status === PickupStatus.REQUESTED).length + 18;
  const preparingCount = activeRequests.filter(r => r.status === PickupStatus.PREPARING).length + 4;
  const readyCount = activeRequests.filter(r => r.status === PickupStatus.READY).length + 3;
  const pickedUpCount = historyRequests.filter(r => r.status === PickupStatus.PICKED_UP).length + 182;

  // Vehicles distribution
  const totalVehicles = zones.reduce((sum, z) => sum + z.currentVehicles, 0);

  // Filter requests
  const filteredRequests = activeRequests.filter(req => {
    const matchesSearch =
      req.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.licensePlate && req.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGrade =
      gradeFilter === 'ALL' || req.className.startsWith(gradeFilter);
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Admin Header (Section 14) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
              TRUNG TÂM ĐIỀU HÀNH GIAO THÔNG TOÀN TRƯỜNG
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>🟢 Trực tuyến</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            TỔNG QUAN ĐÓN HỌC SINH TOÀN TRƯỜNG
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Trường THCS Ban Mai • Hệ thống giám sát luồng xe 4 phân khu A, B, C, D
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-admin-broadcast"
            onClick={() => {
              addToast('Đã phát thông báo điều phối: Vui lòng ưu tiên giải tỏa làn đón Khu B', 'info');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <Bell className="w-3.5 h-3.5 text-blue-600" />
            <span>Phát loa điều phối</span>
          </button>

          <button
            id="btn-admin-simulate"
            onClick={simulateIncomingParent}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-xs flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>🧪 Giả lập phụ huynh đến</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row (Section 18) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 👨‍🎓 Đang chờ (24) */}
        <div
          onClick={() => setActiveTab('queue')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase">
            <span>👨‍🎓 Đang chờ</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 font-mono">{waitingCount}</p>
          <p className="text-[11px] text-amber-600 font-bold mt-1">Phụ huynh đang tới cổng</p>
        </div>

        {/* 🚗 Xe đang chờ (18) */}
        <div
          onClick={() => setActiveTab('map')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase">
            <span>🚗 Xe đang chờ</span>
            <Car className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-blue-700 mt-2 font-mono">{totalVehicles}</p>
          <p className="text-[11px] text-blue-600 font-bold mt-1">Tại 4 khu vực đón xe</p>
        </div>

        {/* 🟢 Sẵn sàng (5) */}
        <div
          onClick={() => setActiveTab('queue')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase">
            <span>🟢 Sẵn sàng</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-emerald-700 mt-2 font-mono">{readyCount}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">Học sinh đã ra điểm đón</p>
        </div>

        {/* ✓ Đã đón (183) */}
        <div
          onClick={() => setActiveTab('history')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase">
            <span>✓ Đã đón</span>
            <Check className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 font-mono">{pickedUpCount}</p>
          <p className="text-[11px] text-slate-500 font-bold mt-1">Học sinh đã về an toàn</p>
        </div>
      </div>

      {/* Secondary Top Navigation Tabs for Admin */}
      <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-2xl text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🏠 Tổng quan & Bản đồ
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'queue'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🚗 Hàng chờ toàn trường ({activeRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'map'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🗺️ Sơ đồ phân làn
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          👨‍🎓 Danh sách học sinh ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📋 Nhật ký đón ({historyRequests.length})
        </button>
      </div>

      {/* VIEW TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 PICKUP ZONES STATUS CARDS (Section 9) */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                  PHÂN KHU KHUÔN VIÊN
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Mật độ phương tiện tại 4 khu vực đón xe
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Tổng: <b className="text-blue-700">{totalVehicles} phương tiện</b>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {zones.map(zone => {
                const isZoneB = zone.id === PickupZoneId.ZONE_B;
                const isCrowded = isZoneB || zone.currentVehicles >= 12;

                return (
                  <div
                    key={zone.id}
                    onClick={() => {
                      setSelectedZone(zone.id);
                      setActiveTab('map');
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md ${
                      isCrowded ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: zone.color }}
                        ></span>
                        <h3 className="font-black text-slate-900 text-sm">{zone.name}</h3>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isCrowded ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {isCrowded ? '🟡 Đang đông' : '🟢 Thông thoáng'}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-700 mt-2">{zone.grades}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{zone.description}</p>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center space-x-1 text-slate-700">
                        <Car className="w-3.5 h-3.5 text-blue-600" />
                        <span>{zone.currentVehicles} xe đang đợi</span>
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        Sức chứa: {zone.maxCapacity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* EMBEDDED INTERACTIVE SVG CAMPUS MAP */}
          <CampusPickupMap
            highlightZoneId={PickupZoneId.ZONE_B}
            compact={false}
            showLegend={true}
            showInstructions={true}
            interactive={true}
          />

          {/* PROGRESS MATRIX BY GRADE (KHỐI 6, 7, 8, 9) */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-4">
              Tiến độ giải tỏa học sinh theo từng khối lớp
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { grade: 'Khối 6', zone: 'Khu A', total: 120, picked: 88, waiting: 8, color: 'emerald' },
                { grade: 'Khối 7', zone: 'Khu B', total: 115, picked: 72, waiting: 15, color: 'amber' },
                { grade: 'Khối 8', zone: 'Khu C', total: 110, picked: 92, waiting: 6, color: 'emerald' },
                { grade: 'Khối 9', zone: 'Khu D', total: 95, picked: 84, waiting: 4, color: 'emerald' },
              ].map(g => (
                <div key={g.grade} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-slate-900 text-sm">{g.grade}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800">
                      {g.zone}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1.5">
                    <div className="flex justify-between">
                      <span>Đã đón an toàn:</span>
                      <b className="text-emerald-700">{g.picked} / {g.total}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Xe đang đợi:</span>
                      <b className={g.color === 'amber' ? 'text-amber-600' : 'text-slate-800'}>
                        {g.waiting} xe
                      </b>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 2: QUEUE (HÀNG CHỜ TOÀN TRƯỜNG) */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Hàng chờ đón học sinh toàn trường
              </h2>
              <p className="text-xs text-slate-500">
                Cập nhật tức thời theo tín hiệu "Tôi đang đến" từ phụ huynh
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {/* Grade filter */}
              <select
                value={gradeFilter}
                onChange={e => setGradeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="ALL">Tất cả khối lớp</option>
                <option value="6">Khối 6 (Khu A)</option>
                <option value="7">Khối 7 (Khu B)</option>
                <option value="8">Khối 8 (Khu C)</option>
                <option value="9">Khối 9 (Khu D)</option>
              </select>

              {/* Search input */}
              <div className="relative w-48 sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm học sinh, biển số..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Requests List */}
          <div className="divide-y divide-slate-100">
            {filteredRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <div className="text-3xl mb-2">🎉</div>
                <h3 className="text-base font-bold text-slate-700">Không có yêu cầu chờ xử lý</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tất cả phụ huynh đã hoàn thành việc đón con.
                </p>
              </div>
            ) : (
              filteredRequests.map(req => (
                <div
                  key={req.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-10 h-10 rounded-xl bg-slate-900 text-white font-mono font-black text-sm flex items-center justify-center shrink-0">
                      #{req.queueNumber}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-black text-slate-900 text-sm">{req.studentName}</h4>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-black">
                          {req.className}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {req.pickupZoneId === PickupZoneId.ZONE_B ? '📍 Khu B (Khối 7)' : '📍 Khu A'} •{' '}
                        {req.transportationType === TransportationType.CAR ? '🚗 Ô tô' : '🏍️ Xe máy'}{' '}
                        {req.licensePlate && `(${req.licensePlate})`} • Gửi lúc {req.createdAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        req.status === PickupStatus.READY
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === PickupStatus.PREPARING
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status === PickupStatus.READY
                        ? '🟢 Sẵn sàng'
                        : req.status === PickupStatus.PREPARING
                        ? '🔵 Đang chuẩn bị'
                        : '🟡 Chờ giáo viên'}
                    </span>

                    <button
                      onClick={() => updateRequestStatus(req.id, PickupStatus.PICKED_UP)}
                      className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
                    >
                      Xác nhận đã đón
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW TAB 3: DEDICATED FULL MAP */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Sơ đồ phân luồng & điều hướng phương tiện
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Kiểm soát mật độ giao thông tại các cổng Cổng vào, Khu A, Khu B, Khu C, Khu D và Cổng ra
              </p>
            </div>
          </div>
          <CampusPickupMap
            highlightZoneId={selectedZone || PickupZoneId.ZONE_B}
            compact={false}
            showLegend={true}
            showInstructions={true}
            interactive={true}
          />
        </div>
      )}

      {/* VIEW TAB 4: STUDENTS */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-slate-900">
              Danh sách học sinh toàn trường ({students.length} học sinh)
            </h2>
            <span className="text-xs text-slate-500">Đã cập nhật năm học 2026-2027</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.map(s => (
              <div key={s.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-sm">👦 {s.name}</h4>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-bold">
                    {s.className}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">Phụ huynh: {s.parentName}</p>
                <p className="text-[11px] text-slate-400">SĐT: {s.parentPhone} • 📍 {s.pickupZoneId}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW TAB 5: HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-slate-900">
              Nhật ký đón học sinh thành công
            </h2>
            <button
              onClick={() => addToast('Đã xuất báo cáo phiên đón ra tệp CSV', 'success')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất báo cáo</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {historyRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Chưa có dữ liệu lịch sử hôm nay.</p>
            ) : (
              historyRequests.map(h => (
                <div key={h.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">
                      {h.studentName} ({h.className}) • {h.pickupZoneId}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Hoàn thành: {h.pickedUpAt || h.createdAt} • Phụ huynh: {h.parentName} (
                      {h.licensePlate || 'Xe máy'})
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                    ✓ Hoàn tất
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      <SchoolMapModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        highlightZoneId={selectedZone}
      />
    </div>
  );
};
