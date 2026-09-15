import React, { useState } from 'react';
import {
  MapPin,
  Car,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Info,
  ChevronRight,
  ShieldCheck,
  Compass,
  Maximize2,
  X,
  ExternalLink,
  Users,
  Layers,
  Sparkles,
  ArrowRight,
  Clock,
  Eye,
} from 'lucide-react';
import { useSchoolPick } from '../../context/SchoolPickContext';
import { PickupZoneId, TransportationType, PickupZone } from '../../types';

interface CampusPickupMapProps {
  highlightZoneId?: PickupZoneId;
  onSelectZone?: (zoneId: PickupZoneId) => void;
  compact?: boolean;
  showLegend?: boolean;
  showInstructions?: boolean;
  interactive?: boolean;
  className?: string;
}

export const CampusPickupMap: React.FC<CampusPickupMapProps> = ({
  highlightZoneId,
  onSelectZone,
  compact = false,
  showLegend = true,
  showInstructions = true,
  interactive = true,
  className = '',
}) => {
  const { zones, activeRequests } = useSchoolPick();
  const [selectedZoneModal, setSelectedZoneModal] = useState<PickupZoneId | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [viewMode, setViewMode] = useState<'svg' | 'cards'>('svg');

  // Local simulated vehicle counts override for interactive demo testing
  const [demoVehiclesOverride, setDemoVehiclesOverride] = useState<Record<PickupZoneId, number>>({
    [PickupZoneId.ZONE_A]: 8,
    [PickupZoneId.ZONE_B]: 15,
    [PickupZoneId.ZONE_C]: 6,
    [PickupZoneId.ZONE_D]: 4,
  });

  // Active target zone (either from prop or locally clicked)
  const [currentSelectedZone, setCurrentSelectedZone] = useState<PickupZoneId>(
    highlightZoneId || PickupZoneId.ZONE_B
  );

  const activeZoneId = highlightZoneId || currentSelectedZone;

  const handleZoneClick = (zoneId: PickupZoneId) => {
    if (!interactive) return;
    setCurrentSelectedZone(zoneId);
    setSelectedZoneModal(zoneId);
    if (onSelectZone) {
      onSelectZone(zoneId);
    }
  };

  // Helper to get live waiting people count for a zone
  const getWaitingPeopleCount = (zoneId: PickupZoneId) => {
    const liveActiveCount = activeRequests.filter(r => r.pickupZoneId === zoneId).length;
    // Zone specific realistic base counts if live active is low
    const baseCounts: Record<PickupZoneId, number> = {
      [PickupZoneId.ZONE_A]: 5,
      [PickupZoneId.ZONE_B]: 12,
      [PickupZoneId.ZONE_C]: 4,
      [PickupZoneId.ZONE_D]: 2,
    };
    return Math.max(liveActiveCount, baseCounts[zoneId]);
  };

  // Helper to get vehicle count
  const getVehicleCount = (zoneId: PickupZoneId) => {
    return demoVehiclesOverride[zoneId] ?? 8;
  };

  // Get zone traffic state based on prompt:
  // 🟢 Thông thoáng (< 10 xe)
  // 🟡 Đông (10 - 15 xe)
  // 🔴 Đang ùn tắc (>= 16 xe)
  const getZoneStatus = (zoneId: PickupZoneId) => {
    const count = getVehicleCount(zoneId);
    if (count >= 16) {
      return {
        label: 'Đang ùn tắc',
        icon: '🔴',
        badgeClass: 'bg-red-100 text-red-800 border-red-200',
        dotColor: '#ef4444',
        statusKey: 'congested',
      };
    }
    if (count >= 10) {
      return {
        label: 'Đông',
        icon: '🟡',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        dotColor: '#f59e0b',
        statusKey: 'crowded',
      };
    }
    return {
      label: 'Thông thoáng',
      icon: '🟢',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      dotColor: '#10b981',
      statusKey: 'clear',
    };
  };

  // Zone info map
  const zoneDetails = [
    {
      id: PickupZoneId.ZONE_A,
      name: 'Khu vực A',
      shortName: 'Khu A',
      classes: '6A1, 6A2',
      spotName: 'Điểm đón A (Mái che Khối 6)',
      baseColor: '#10B981',
      darkColor: '#064e3b',
      activeBorder: '#34d399',
    },
    {
      id: PickupZoneId.ZONE_B,
      name: 'Khu vực B',
      shortName: 'Khu B',
      classes: '7A1, 7A2',
      spotName: 'Điểm đón B (Sân Đông Khối 7)',
      baseColor: '#3B82F6',
      darkColor: '#1e3a8a',
      activeBorder: '#60a5fa',
    },
    {
      id: PickupZoneId.ZONE_C,
      name: 'Khu vực C',
      shortName: 'Khu C',
      classes: '8A1, 8A2',
      spotName: 'Điểm đón C (Sân Tây Khối 8)',
      baseColor: '#F59E0B',
      darkColor: '#78350f',
      activeBorder: '#fbbf24',
    },
    {
      id: PickupZoneId.ZONE_D,
      name: 'Khu vực D',
      shortName: 'Khu D',
      classes: '9A1, 9A2',
      spotName: 'Điểm đón D (Cổng Nam Khối 9)',
      baseColor: '#EA580C',
      darkColor: '#7c2d12',
      activeBorder: '#f97316',
    },
  ];

  const selectedZoneData = zoneDetails.find(z => z.id === (selectedZoneModal || activeZoneId));
  const isSelectedZoneCongested = selectedZoneData
    ? getVehicleCount(selectedZoneData.id) >= 16
    : false;
  const isSelectedZoneCrowded = selectedZoneData
    ? getVehicleCount(selectedZoneData.id) >= 10
    : false;

  // Toggle vehicle status for demo presentation
  const cycleZoneTraffic = (zoneId: PickupZoneId) => {
    setDemoVehiclesOverride(prev => {
      const cur = prev[zoneId];
      let next = 8; // clear
      if (cur < 10) next = 14; // crowded
      else if (cur < 16) next = 18; // congested
      else next = 7; // back to clear
      return { ...prev, [zoneId]: next };
    });
  };

  return (
    <div
      id="campus-pickup-map-component"
      className={`bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col ${className}`}
    >
      {/* 1. Header Toolbar */}
      {!compact && (
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  BẢN ĐỒ KHU VỰC ĐÓN HỌC SINH
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                  Mô phỏng 1 chiều
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Mô phỏng khu vực đón trước cổng trường • 4 phân khu A, B, C, D
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {/* View switcher for maximum responsiveness on phones vs laptops */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl text-xs font-bold">
              <button
                id="btn-map-view-svg"
                onClick={() => setViewMode('svg')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'svg'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🗺️ Sơ đồ SVG
              </button>
              <button
                id="btn-map-view-cards"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📱 4 Khu vực
              </button>
            </div>

            <button
              onClick={() => setShowGuideModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Quy định</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Interactive Traffic Banner Alert */}
      {isSelectedZoneCongested ? (
        <div className="px-4 py-2.5 bg-red-600 text-white flex items-center justify-between text-xs font-bold animate-pulse">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-white" />
            <span>
              🔴 CẢNH BÁO ÙN TẮC TẠI {selectedZoneData?.name.toUpperCase()} (
              {getVehicleCount(selectedZoneData?.id || PickupZoneId.ZONE_B)} XE): Vui lòng giữ khoảng
              cách an toàn!
            </span>
          </div>
          <button
            onClick={() => cycleZoneTraffic(selectedZoneData?.id || PickupZoneId.ZONE_B)}
            className="text-[11px] underline font-extrabold hover:text-amber-200 cursor-pointer"
          >
            Giải tỏa thử nghiệm
          </button>
        </div>
      ) : isSelectedZoneCrowded ? (
        <div className="px-4 py-2 bg-amber-500 text-slate-950 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-slate-950" />
            <span>
              🟡 LƯU Ý: {selectedZoneData?.name} đang có mật độ xe cao (
              {getVehicleCount(selectedZoneData?.id || PickupZoneId.ZONE_B)} xe) - Phụ huynh di
              chuyển chậm dưới 15km/h.
            </span>
          </div>
          <button
            onClick={() => cycleZoneTraffic(selectedZoneData?.id || PickupZoneId.ZONE_B)}
            className="text-[11px] underline font-extrabold hover:text-white cursor-pointer"
          >
            Đổi mật độ demo
          </button>
        </div>
      ) : null}

      {/* 3. Main SVG Interactive Campus Map Canvas */}
      {viewMode === 'svg' ? (
        <div className="relative w-full bg-slate-950 select-none overflow-hidden group">
          <svg
            viewBox="0 0 900 620"
            className="w-full h-auto max-h-[560px] object-contain mx-auto block"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Subtle Grid Pattern for Technical Map Feel */}
              <pattern id="campusGridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.7" />
              </pattern>

              {/* Shading gradients */}
              <linearGradient id="schoolRoofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              <linearGradient id="lawnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#064e3b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#022c22" stopOpacity="0.8" />
              </linearGradient>

              {/* Glowing filter for highlighted zone trajectory */}
              <filter id="glowRoute" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* BASE CANVAS GROUND */}
            <rect width="900" height="620" fill="#0b1329" />
            <rect width="900" height="620" fill="url(#campusGridPattern)" />

            {/* Inner Campus Green Lawn */}
            <rect x="140" y="70" width="620" height="480" rx="28" fill="url(#lawnGrad)" />

            {/* ============================================================ */}
            {/* ROADWAY: ONE-WAY ROAD FOR VEHICLES (Đường dành cho phương tiện) */}
            {/* ============================================================ */}
            {/* Left Roadway Branch */}
            <path
              d="M 450 25 L 450 85 L 160 85 L 160 535 L 450 535 L 450 595"
              fill="none"
              stroke="#1e293b"
              strokeWidth="68"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Right Roadway Branch */}
            <path
              d="M 450 25 L 450 85 L 740 85 L 740 535 L 450 535 L 450 595"
              fill="none"
              stroke="#1e293b"
              strokeWidth="68"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Road Asphalt Fill */}
            <path
              d="M 450 25 L 450 85 L 160 85 L 160 535 L 450 535 L 450 595"
              fill="none"
              stroke="#334155"
              strokeWidth="56"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 450 25 L 450 85 L 740 85 L 740 535 L 450 535 L 450 595"
              fill="none"
              stroke="#334155"
              strokeWidth="56"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Road Lane Dividers (Dashed white/yellow line between car & bike lanes) */}
            <path
              d="M 450 35 L 450 85 L 160 85 L 160 535 L 450 535 L 450 585"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeDasharray="9 9"
              strokeLinejoin="round"
            />
            <path
              d="M 450 35 L 450 85 L 740 85 L 740 535 L 450 535 L 450 585"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeDasharray="9 9"
              strokeLinejoin="round"
            />

            {/* ============================================================ */}
            {/* DIRECTIONAL ARROWS (Mũi tên chỉ hướng di chuyển) */}
            {/* ============================================================ */}
            <g fill="#f8fafc" opacity="0.75">
              {/* Entry Gate Downward Arrows */}
              <path d="M 444 48 L 450 58 L 456 48 Z" />
              <path d="M 444 68 L 450 78 L 456 68 Z" />

              {/* Left Branch Arrows (Westwards to Zone A & C) */}
              <path d="M 330 80 L 316 85 L 330 90 Z" />
              <path d="M 230 80 L 216 85 L 230 90 Z" />
              <path d="M 155 180 L 160 196 L 165 180 Z" />
              <path d="M 155 360 L 160 376 L 165 360 Z" />
              <path d="M 270 530 L 286 535 L 270 540 Z" />
              <path d="M 370 530 L 386 535 L 370 540 Z" />

              {/* Right Branch Arrows (Eastwards to Zone B & D) */}
              <path d="M 570 80 L 584 85 L 570 90 Z" />
              <path d="M 670 80 L 684 85 L 670 90 Z" />
              <path d="M 735 180 L 740 196 L 745 180 Z" />
              <path d="M 735 360 L 740 376 L 745 360 Z" />
              <path d="M 630 530 L 614 535 L 630 540 Z" />
              <path d="M 530 530 L 514 535 L 530 540 Z" />

              {/* Exit Gate Arrows */}
              <path d="M 444 555 L 450 565 L 456 555 Z" />
              <path d="M 444 575 L 450 585 L 456 575 Z" />
            </g>

            {/* ============================================================ */}
            {/* HIGHLIGHTED ACTIVE VEHICLE TRAJECTORY */}
            {/* ============================================================ */}
            {activeZoneId === PickupZoneId.ZONE_B && (
              <g filter="url(#glowRoute)">
                <path
                  d="M 450 25 L 450 85 L 740 85 L 740 240 L 740 360 L 740 535 L 450 535 L 450 595"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="16 12"
                  className="animate-pulse"
                />
              </g>
            )}

            {activeZoneId === PickupZoneId.ZONE_A && (
              <g filter="url(#glowRoute)">
                <path
                  d="M 450 25 L 450 85 L 160 85 L 160 240 L 160 360 L 160 535 L 450 535 L 450 595"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="16 12"
                  className="animate-pulse"
                />
              </g>
            )}

            {activeZoneId === PickupZoneId.ZONE_C && (
              <g filter="url(#glowRoute)">
                <path
                  d="M 450 25 L 450 85 L 160 85 L 160 380 L 160 535 L 450 535 L 450 595"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="16 12"
                  className="animate-pulse"
                />
              </g>
            )}

            {activeZoneId === PickupZoneId.ZONE_D && (
              <g filter="url(#glowRoute)">
                <path
                  d="M 450 25 L 450 85 L 740 85 L 740 380 L 740 535 L 450 535 L 450 595"
                  fill="none"
                  stroke="#fb923c"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="16 12"
                  className="animate-pulse"
                />
              </g>
            )}

            {/* ============================================================ */}
            {/* CENTRAL SCHOOL BUILDING (Tòa nhà trường học) */}
            {/* ============================================================ */}
            <g transform="translate(265, 140)">
              {/* Drop Shadow */}
              <rect x="6" y="8" width="370" height="250" rx="18" fill="#000000" opacity="0.5" />
              {/* Main Building Body */}
              <rect
                x="0"
                y="0"
                width="370"
                height="250"
                rx="18"
                fill="url(#schoolRoofGrad)"
                stroke="#3b82f6"
                strokeWidth="2.5"
              />

              {/* Roof Trim */}
              <path d="M 0 25 L 185 0 L 370 25 L 370 36 L 0 36 Z" fill="#2563eb" />

              {/* School Clock / Crest */}
              <circle cx="185" cy="55" r="16" fill="#1e3a8a" stroke="#93c5fd" strokeWidth="2.5" />
              <line x1="185" y1="46" x2="185" y2="55" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="185" y1="55" x2="192" y2="55" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

              {/* School Title */}
              <text
                x="185"
                y="94"
                textAnchor="middle"
                fill="#f8fafc"
                fontSize="16"
                fontWeight="900"
                letterSpacing="1.2"
              >
                TRƯỜNG THCS BAN MAI
              </text>
              <text x="185" y="112" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700">
                KHU PHÒNG HỌC & BAN GIÁM HIỆU
              </text>

              {/* Classroom Windows Grid */}
              <g fill="#38bdf8" opacity="0.85">
                {/* Floor 2 */}
                <rect x="35" y="132" width="40" height="25" rx="5" />
                <rect x="90" y="132" width="40" height="25" rx="5" />
                <rect x="145" y="132" width="40" height="25" rx="5" />
                <rect x="200" y="132" width="40" height="25" rx="5" />
                <rect x="255" y="132" width="40" height="25" rx="5" />
                <rect x="310" y="132" width="40" height="25" rx="5" />

                {/* Floor 1 */}
                <rect x="35" y="174" width="40" height="25" rx="5" />
                <rect x="90" y="174" width="40" height="25" rx="5" />
                <rect x="145" y="174" width="40" height="25" rx="5" />
                <rect x="200" y="174" width="40" height="25" rx="5" />
                <rect x="255" y="174" width="40" height="25" rx="5" />
                <rect x="310" y="174" width="40" height="25" rx="5" />
              </g>

              {/* Central Grand Entrance */}
              <rect
                x="155"
                y="212"
                width="60"
                height="38"
                rx="6"
                fill="#0f172a"
                stroke="#60a5fa"
                strokeWidth="2"
              />
              <text x="185" y="235" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="800">
                SẢNH CHÍNH
              </text>
            </g>

            {/* ============================================================ */}
            {/* CỔNG VÀO (ENTRANCE GATE) */}
            {/* ============================================================ */}
            <g transform="translate(345, 12)">
              <rect
                x="0"
                y="0"
                width="210"
                height="40"
                rx="12"
                fill="#0284c7"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
              <text x="105" y="20" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900" letterSpacing="0.8">
                🚗 CỔNG VÀO (ĐƯỜNG 1 CHIỀU)
              </text>
              <text x="105" y="33" textAnchor="middle" fill="#bae6fd" fontSize="9" fontWeight="800">
                PHÂN LÀN Ô TÔ & XE MÁY ↓↓↓
              </text>
            </g>

            {/* ============================================================ */}
            {/* CỔNG RA (EXIT GATE) */}
            {/* ============================================================ */}
            <g transform="translate(345, 565)">
              <rect
                x="0"
                y="0"
                width="210"
                height="40"
                rx="12"
                fill="#0f766e"
                stroke="#2dd4bf"
                strokeWidth="2.5"
              />
              <text x="105" y="20" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900" letterSpacing="0.8">
                🚗 CỔNG RA (XUẤT BẾN)
              </text>
              <text x="105" y="33" textAnchor="middle" fill="#ccfbf1" fontSize="9" fontWeight="800">
                RẼ PHẢI RA ĐẠI LỘ ↓↓↓
              </text>
            </g>

            {/* ============================================================ */}
            {/* LÀN XE Ô TÔ & LÀN XE MÁY (DEDICATED VEHICLE LANES) */}
            {/* ============================================================ */}
            <g fill="#94a3b8" fontSize="10" fontWeight="800">
              {/* Left Side: Car Lane */}
              <rect x="18" y="275" width="130" height="24" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
              <text x="83" y="291" textAnchor="middle" fill="#38bdf8">
                🚗 LÀN DÀNH CHO Ô TÔ
              </text>

              {/* Right Side: Motorbike Lane */}
              <rect x="750" y="275" width="135" height="24" rx="6" fill="#1e293b" stroke="#facc15" strokeWidth="1" />
              <text x="817" y="291" textAnchor="middle" fill="#facc15">
                🏍️ LÀN DÀNH CHO XE MÁY
              </text>
            </g>

            {/* ============================================================ */}
            {/* ĐIỂM ĐÓN HỌC SINH (DESIGNATED STUDENT WAITING SHELTER MARKS) */}
            {/* ============================================================ */}
            {/* Spot A: Zone A Shelter */}
            <g transform="translate(70, 215)">
              <rect x="0" y="0" width="165" height="22" rx="6" fill="#047857" stroke="#34d399" strokeWidth="1.5" />
              <text x="82" y="15" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900">
                📍 ĐIỂM ĐÓN A (KHỐI 6)
              </text>
            </g>

            {/* Spot B: Zone B Shelter */}
            <g transform="translate(665, 215)">
              <rect x="0" y="0" width="165" height="22" rx="6" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1.5" />
              <text x="82" y="15" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900">
                📍 ĐIỂM ĐÓN B (KHỐI 7)
              </text>
            </g>

            {/* Spot C: Zone C Shelter */}
            <g transform="translate(70, 480)">
              <rect x="0" y="0" width="165" height="22" rx="6" fill="#b45309" stroke="#fde047" strokeWidth="1.5" />
              <text x="82" y="15" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900">
                📍 ĐIỂM ĐÓN C (KHỐI 8)
              </text>
            </g>

            {/* Spot D: Zone D Shelter */}
            <g transform="translate(665, 480)">
              <rect x="0" y="0" width="165" height="22" rx="6" fill="#c2410c" stroke="#fed7aa" strokeWidth="1.5" />
              <text x="82" y="15" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900">
                📍 ĐIỂM ĐÓN D (KHỐI 9)
              </text>
            </g>

            {/* ============================================================ */}
            {/* 4 PHÂN KHU ĐÓN (KHU VỰC A, B, C, D) */}
            {/* ============================================================ */}

            {/* 🟢 KHU VỰC A (Khối 6: 6A1, 6A2) */}
            <g
              id="map-zone-A-interactive"
              transform="translate(30, 95)"
              className="cursor-pointer group"
              onClick={() => handleZoneClick(PickupZoneId.ZONE_A)}
            >
              <rect
                x="0"
                y="0"
                width="205"
                height="116"
                rx="16"
                fill={activeZoneId === PickupZoneId.ZONE_A ? '#064e3b' : '#022c22'}
                stroke={activeZoneId === PickupZoneId.ZONE_A ? '#34d399' : '#10b981'}
                strokeWidth={activeZoneId === PickupZoneId.ZONE_A ? '4' : '2'}
                className="transition-all duration-300 group-hover:scale-[1.02]"
              />
              {activeZoneId === PickupZoneId.ZONE_A && (
                <circle cx="190" cy="18" r="7" fill="#34d399" className="animate-ping" />
              )}
              {/* Badge Letter */}
              <rect x="12" y="10" width="28" height="22" rx="6" fill="#10b981" />
              <text x="26" y="26" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900">
                A
              </text>
              <text x="46" y="26" fill="#ffffff" fontSize="14" fontWeight="900">
                KHU VỰC A
              </text>

              {/* Lớp phụ trách mẫu: 6A1, 6A2 */}
              <text x="14" y="50" fill="#a7f3d0" fontSize="11" fontWeight="800">
                Lớp phụ trách: 6A1, 6A2
              </text>
              <text x="14" y="68" fill="#e2e8f0" fontSize="10" fontWeight="600">
                Đang chờ: {getWaitingPeopleCount(PickupZoneId.ZONE_A)} người
              </text>

              {/* Status pill: 🟢 Thông thoáng */}
              <rect x="14" y="80" width="176" height="24" rx="8" fill="#047857" />
              <circle cx="26" cy="92" r="4" fill="#34d399" />
              <text x="36" y="96" fill="#ffffff" fontSize="10" fontWeight="800">
                {getVehicleCount(PickupZoneId.ZONE_A)} xe • {getZoneStatus(PickupZoneId.ZONE_A).icon}{' '}
                {getZoneStatus(PickupZoneId.ZONE_A).label}
              </text>
            </g>

            {/* 🟡 KHU VỰC B (Khối 7: 7A1, 7A2) */}
            <g
              id="map-zone-B-interactive"
              transform="translate(665, 95)"
              className="cursor-pointer group"
              onClick={() => handleZoneClick(PickupZoneId.ZONE_B)}
            >
              <rect
                x="0"
                y="0"
                width="205"
                height="116"
                rx="16"
                fill={activeZoneId === PickupZoneId.ZONE_B ? '#1e3a8a' : '#0f172a'}
                stroke={activeZoneId === PickupZoneId.ZONE_B ? '#60a5fa' : '#3b82f6'}
                strokeWidth={activeZoneId === PickupZoneId.ZONE_B ? '4' : '2'}
                className="transition-all duration-300 group-hover:scale-[1.02]"
              />
              {activeZoneId === PickupZoneId.ZONE_B && (
                <circle cx="190" cy="18" r="8" fill="#60a5fa" className="animate-ping" />
              )}
              {/* Badge Letter */}
              <rect x="12" y="10" width="28" height="22" rx="6" fill="#2563eb" />
              <text x="26" y="26" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900">
                B
              </text>
              <text x="46" y="26" fill="#ffffff" fontSize="14" fontWeight="900">
                KHU VỰC B
              </text>

              {/* Lớp phụ trách mẫu: 7A1, 7A2 */}
              <text x="14" y="50" fill="#93c5fd" fontSize="11" fontWeight="800">
                Lớp phụ trách: 7A1, 7A2
              </text>
              <text x="14" y="68" fill="#e2e8f0" fontSize="10" fontWeight="600">
                Đang chờ: {getWaitingPeopleCount(PickupZoneId.ZONE_B)} người
              </text>

              {/* Status pill: 🟡 Đông or 🔴 Ùn tắc */}
              <rect
                x="14"
                y="80"
                width="176"
                height="24"
                rx="8"
                fill={
                  getVehicleCount(PickupZoneId.ZONE_B) >= 16
                    ? '#991b1b'
                    : getVehicleCount(PickupZoneId.ZONE_B) >= 10
                    ? '#854d0e'
                    : '#1d4ed8'
                }
              />
              <circle
                cx="26"
                cy="92"
                r="4"
                fill={getZoneStatus(PickupZoneId.ZONE_B).dotColor}
              />
              <text x="36" y="96" fill="#ffffff" fontSize="10" fontWeight="800">
                {getVehicleCount(PickupZoneId.ZONE_B)} xe • {getZoneStatus(PickupZoneId.ZONE_B).icon}{' '}
                {getZoneStatus(PickupZoneId.ZONE_B).label}
              </text>
            </g>

            {/* 🟢 KHU VỰC C (Khối 8: 8A1, 8A2) */}
            <g
              id="map-zone-C-interactive"
              transform="translate(30, 360)"
              className="cursor-pointer group"
              onClick={() => handleZoneClick(PickupZoneId.ZONE_C)}
            >
              <rect
                x="0"
                y="0"
                width="205"
                height="116"
                rx="16"
                fill={activeZoneId === PickupZoneId.ZONE_C ? '#78350f' : '#451a03'}
                stroke={activeZoneId === PickupZoneId.ZONE_C ? '#fbbf24' : '#f59e0b'}
                strokeWidth={activeZoneId === PickupZoneId.ZONE_C ? '4' : '2'}
                className="transition-all duration-300 group-hover:scale-[1.02]"
              />
              {activeZoneId === PickupZoneId.ZONE_C && (
                <circle cx="190" cy="18" r="7" fill="#fbbf24" className="animate-ping" />
              )}
              {/* Badge Letter */}
              <rect x="12" y="10" width="28" height="22" rx="6" fill="#d97706" />
              <text x="26" y="26" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900">
                C
              </text>
              <text x="46" y="26" fill="#ffffff" fontSize="14" fontWeight="900">
                KHU VỰC C
              </text>

              {/* Lớp phụ trách mẫu: 8A1, 8A2 */}
              <text x="14" y="50" fill="#fde68a" fontSize="11" fontWeight="800">
                Lớp phụ trách: 8A1, 8A2
              </text>
              <text x="14" y="68" fill="#e2e8f0" fontSize="10" fontWeight="600">
                Đang chờ: {getWaitingPeopleCount(PickupZoneId.ZONE_C)} người
              </text>

              {/* Status pill: 🟢 Thông thoáng */}
              <rect x="14" y="80" width="176" height="24" rx="8" fill="#b45309" />
              <circle cx="26" cy="92" r="4" fill="#fde047" />
              <text x="36" y="96" fill="#ffffff" fontSize="10" fontWeight="800">
                {getVehicleCount(PickupZoneId.ZONE_C)} xe • {getZoneStatus(PickupZoneId.ZONE_C).icon}{' '}
                {getZoneStatus(PickupZoneId.ZONE_C).label}
              </text>
            </g>

            {/* 🟢 KHU VỰC D (Khối 9: 9A1, 9A2) */}
            <g
              id="map-zone-D-interactive"
              transform="translate(665, 360)"
              className="cursor-pointer group"
              onClick={() => handleZoneClick(PickupZoneId.ZONE_D)}
            >
              <rect
                x="0"
                y="0"
                width="205"
                height="116"
                rx="16"
                fill={activeZoneId === PickupZoneId.ZONE_D ? '#7c2d12' : '#431407'}
                stroke={activeZoneId === PickupZoneId.ZONE_D ? '#fb923c' : '#ea580c'}
                strokeWidth={activeZoneId === PickupZoneId.ZONE_D ? '4' : '2'}
                className="transition-all duration-300 group-hover:scale-[1.02]"
              />
              {activeZoneId === PickupZoneId.ZONE_D && (
                <circle cx="190" cy="18" r="7" fill="#fb923c" className="animate-ping" />
              )}
              {/* Badge Letter */}
              <rect x="12" y="10" width="28" height="22" rx="6" fill="#ea580c" />
              <text x="26" y="26" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900">
                D
              </text>
              <text x="46" y="26" fill="#ffffff" fontSize="14" fontWeight="900">
                KHU VỰC D
              </text>

              {/* Lớp phụ trách mẫu: 9A1, 9A2 */}
              <text x="14" y="50" fill="#fed7aa" fontSize="11" fontWeight="800">
                Lớp phụ trách: 9A1, 9A2
              </text>
              <text x="14" y="68" fill="#e2e8f0" fontSize="10" fontWeight="600">
                Đang chờ: {getWaitingPeopleCount(PickupZoneId.ZONE_D)} người
              </text>

              {/* Status pill: 🟢 Thông thoáng */}
              <rect x="14" y="80" width="176" height="24" rx="8" fill="#9a3412" />
              <circle cx="26" cy="92" r="4" fill="#fdba74" />
              <text x="36" y="96" fill="#ffffff" fontSize="10" fontWeight="800">
                {getVehicleCount(PickupZoneId.ZONE_D)} xe • {getZoneStatus(PickupZoneId.ZONE_D).icon}{' '}
                {getZoneStatus(PickupZoneId.ZONE_D).label}
              </text>
            </g>
          </svg>

          {/* Floating Hint Overlay on Map */}
          <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-700 pointer-events-none flex items-center space-x-1.5 shadow-sm">
            <Navigation className="w-3.5 h-3.5 text-sky-400" />
            <span>Nhấp vào Khu vực A, B, C, D để xem chi tiết hoặc điều phối</span>
          </div>

          {/* Floating Selected Zone Indicator */}
          {activeZoneId && (
            <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-xs text-white text-xs font-black px-3.5 py-1.5 rounded-xl border border-blue-500/50 flex items-center space-x-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              <span>
                Đang chọn:{' '}
                <span className="text-amber-400">
                  {zoneDetails.find(z => z.id === activeZoneId)?.name} (
                  {zoneDetails.find(z => z.id === activeZoneId)?.classes})
                </span>
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Mobile Card View Mode (Tối ưu cho màn hình nhỏ) */
        <div className="p-4 sm:p-6 bg-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {zoneDetails.map(zone => {
            const isSelected = activeZoneId === zone.id;
            const status = getZoneStatus(zone.id);
            const vehicles = getVehicleCount(zone.id);
            const waiting = getWaitingPeopleCount(zone.id);

            return (
              <div
                key={zone.id}
                onClick={() => handleZoneClick(zone.id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white shadow-xs hover:shadow-md ${
                  isSelected ? 'border-blue-600 ring-4 ring-blue-500/10 scale-[1.01]' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: zone.baseColor }}
                    ></span>
                    <h4 className="font-black text-slate-900 text-base">{zone.name}</h4>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-black border flex items-center space-x-1 ${status.badgeClass}`}
                  >
                    <span>{status.icon}</span>
                    <span>{status.label}</span>
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Lớp phụ trách:</span>
                    <b className="text-slate-900 font-bold">{zone.classes}</b>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Số phương tiện:</span>
                    <b className="text-blue-700 font-bold">{vehicles} xe</b>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Số người đang chờ:</span>
                    <b className="text-slate-900 font-bold">{waiting} người</b>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Điểm đón học sinh:</span>
                    <span className="text-emerald-700 font-bold">{zone.spotName}</span>
                  </div>
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    cycleZoneTraffic(zone.id);
                  }}
                  className="mt-3 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  🧪 Đổi trạng thái giao thông ({status.label})
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Map Legend (CHÚ GIẢI KÝ HIỆU BẢN ĐỒ - Section 20) */}
      {showLegend && (
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              CHÚ GIẢI KÝ HIỆU & MÀU SẮC GIAO THÔNG
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Tuân thủ luồng một chiều từ Cổng vào tới Cổng ra
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs font-bold text-slate-700">
            <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="truncate">🟢 Thông thoáng</span>
            </div>
            <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
              <span className="truncate">🟡 Đông xe</span>
            </div>
            <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
              <span className="truncate">🔴 Đang ùn tắc</span>
            </div>
            <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-sm">🚗</span>
              <span className="truncate">Làn xe Ô tô</span>
            </div>
            <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-sm">🏍️</span>
              <span className="truncate">Làn xe máy</span>
            </div>
            <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-sm">📍</span>
              <span className="truncate">Điểm đón học sinh</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Five-Step Pickup Process Instructions (Section 6) */}
      {showInstructions && (
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-3">
            QUY TRÌNH 5 BƯỚC ĐÓN HỌC SINH TẠI KHU VỰC ĐÃ CHỌN
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center mb-1.5">
                1
              </span>
              <p className="font-extrabold text-slate-900">Tiến vào Cổng chính</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Giảm tốc độ dưới 15 km/h</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center mb-1.5">
                2
              </span>
              <p className="font-extrabold text-slate-900">Đi đúng làn xe</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Ô tô làn ngoài, xe máy làn trong</p>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center mb-1.5">
                3
              </span>
              <p className="font-extrabold">Đến {selectedZoneData?.name || 'Khu B'}</p>
              <p className="text-[11px] text-blue-700 mt-0.5">
                Điểm đón Lớp {selectedZoneData?.classes || '7A1, 7A2'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center mb-1.5">
                4
              </span>
              <p className="font-extrabold text-slate-900">Dừng tại điểm đón</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Hạ kính, bật xi-nhan báo hiệu</p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center mb-1.5">
                5
              </span>
              <p className="font-extrabold">Giáo viên bàn giao</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">Đưa con lên xe an toàn & xuất bến</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* POPUP / MODAL CARD KHI CLICK TỪNG KHU VỰC (TƯƠNG TÁC POPUP) */}
      {/* ============================================================ */}
      {selectedZoneModal && selectedZoneData && (
        <div
          id="zone-detail-popup-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setSelectedZoneModal(null)}
        >
          <div
            id="zone-detail-popup-card"
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-9 h-9 rounded-2xl text-white flex items-center justify-center font-black shadow-xs"
                  style={{ backgroundColor: selectedZoneData.baseColor }}
                >
                  {selectedZoneData.shortName.replace('Khu ', '')}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">{selectedZoneData.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">Khuôn viên Trường THCS Ban Mai</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedZoneModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Details: Required metrics */}
            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-semibold">Lớp phụ trách:</span>
                <b className="text-slate-900 text-sm font-bold">{selectedZoneData.classes}</b>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-semibold">Số phương tiện hiện tại:</span>
                <b className="text-blue-700 font-mono text-sm font-bold">
                  {getVehicleCount(selectedZoneData.id)} xe
                </b>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-semibold">Số người đang chờ:</span>
                <b className="text-slate-900 font-mono text-sm font-bold">
                  {getWaitingPeopleCount(selectedZoneData.id)} người
                </b>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-semibold">Trạng thái giao thông:</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold border flex items-center space-x-1 ${
                    getZoneStatus(selectedZoneData.id).badgeClass
                  }`}
                >
                  <span>{getZoneStatus(selectedZoneData.id).icon}</span>
                  <span>{getZoneStatus(selectedZoneData.id).label}</span>
                </span>
              </div>

              <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100">
                <span className="text-blue-800 font-bold block mb-0.5">Điểm đón học sinh:</span>
                <span className="text-slate-700 font-medium">{selectedZoneData.spotName}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => cycleZoneTraffic(selectedZoneData.id)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Thử đổi trạng thái giao thông ({getZoneStatus(selectedZoneData.id).label})</span>
              </button>

              <button
                onClick={() => setSelectedZoneModal(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Đóng thẻ thông tin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-base">Quy định phân luồng an toàn</h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <p>
                <b>1. Cổng vào 1 chiều:</b> Phương tiện chỉ đi vào từ cổng chính đường Hoàng Đạo Thúy.
              </p>
              <p>
                <b>2. Phân làn tốc độ:</b> Ô tô đi làn ngoài, xe máy đi làn trong. Tốc độ tối đa 15 km/h.
              </p>
              <p>
                <b>3. Điểm đón học sinh theo khối:</b>
                <br />
                • Khối 6 (6A1, 6A2): <b>Khu A</b>
                <br />
                • Khối 7 (7A1, 7A2): <b>Khu B</b>
                <br />
                • Khối 8 (8A1, 8A2): <b>Khu C</b>
                <br />
                • Khối 9 (9A1, 9A2): <b>Khu D</b>
              </p>
              <p>
                <b>4. Dừng đỗ và bàn giao:</b> Xe chỉ dừng tối đa 90 giây tại điểm đón để nhận học sinh và tiếp tục di chuyển ra Cổng xuất bến.
              </p>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Đã hiểu quy định
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
