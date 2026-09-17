import React, { useState, useRef, useEffect } from 'react';
import {
  Car,
  Bell,
  Volume2,
  VolumeX,
  MapPin,
  LogOut,
  RotateCcw,
  Sparkles,
  Columns2,
  ShieldCheck,
  GraduationCap,
  Users,
  Settings,
  User as UserIcon,
  ChevronDown,
  CheckCircle2,
  Lock,
  LogIn,
  UserPlus,
  Home,
  Edit3,
  Check,
} from 'lucide-react';
import { useSchoolPick } from '../../context/SchoolPickContext';
import { UserRole } from '../../types';
import { SchoolMapModal } from './SchoolMapModal';
import { NotificationDrawer } from './NotificationDrawer';

interface HeaderProps {
  pageTitle?: string;
  onNavigateTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ pageTitle, onNavigateTab }) => {
  const {
    currentUser,
    switchRole,
    logout,
    soundEnabled,
    setSoundEnabled,
    unreadNotificationCount,
    resetDemoData,
    splitViewMode,
    setSplitViewMode,
    authMode,
    setAuthMode,
    unauthScreen,
    openAuth,
    goToHome,
    addToast,
    updateUserName,
  } = useSchoolPick();

  const [mapOpen, setMapOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute page title if not explicitly passed
  const displayTitle =
    pageTitle ||
    (splitViewMode
      ? 'Mô phỏng màn hình kép song song'
      : currentUser?.role === UserRole.TEACHER
      ? 'Hàng chờ đón học sinh • Lớp 7A1'
      : currentUser?.role === UserRole.PARENT
      ? 'Cổng thông tin phụ huynh'
      : currentUser?.role === UserRole.ADMIN
      ? 'Điều phối giao thông toàn trường'
      : 'Đăng nhập hệ thống');

  return (
    <>
      <header
        id="schoolpick-main-header"
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Left: Brand Logo & Dynamic Page Title (Section 4) */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div
                onClick={() => {
                  setSplitViewMode(false);
                  if (!currentUser) {
                    goToHome();
                  }
                }}
                className="flex items-center space-x-2.5 cursor-pointer group"
                title={!currentUser ? 'Về trang chủ SchoolPick' : 'SchoolPick'}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <Car className="w-5 h-5" />
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xl font-black tracking-tight text-slate-900">
                      School<span className="text-blue-600">Pick</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Page Title (Section 4) */}
              <div className="pl-3 border-l border-slate-200 hidden md:block">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block leading-none mb-0.5">
                  {currentUser ? 'Phân hệ trực tuyến' : 'Hệ thống SchoolPick'}
                </span>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-800 leading-tight">
                  {currentUser ? displayTitle : unauthScreen === 'home' ? 'Trang chủ giới thiệu' : 'Cổng đăng nhập & đăng ký'}
                </h2>
              </div>
            </div>

            {/* Center Quick Switchers (Desktop Role Navigation) - Hidden when logged out */}
            {currentUser && (
              <div className="hidden lg:flex items-center space-x-1 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
                <button
                  id="btn-switch-parent"
                  onClick={() => {
                    setSplitViewMode(false);
                    switchRole(UserRole.PARENT);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    !splitViewMode && currentUser?.role === UserRole.PARENT
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>👨‍👩‍👧 Phụ huynh</span>
                </button>
                <button
                  id="btn-switch-teacher"
                  onClick={() => {
                    setSplitViewMode(false);
                    switchRole(UserRole.TEACHER);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    !splitViewMode && currentUser?.role === UserRole.TEACHER
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>👩‍🏫 Giáo viên (7A1)</span>
                </button>
                <button
                  id="btn-switch-admin"
                  onClick={() => {
                    setSplitViewMode(false);
                    switchRole(UserRole.ADMIN);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    !splitViewMode && currentUser?.role === UserRole.ADMIN
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>🏛️ Nhà trường</span>
                </button>
              </div>
            )}

            {/* Right Action Icons & Controls */}
            {currentUser ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
              {/* User Role & Realtime Connection Status (Section 17) */}
              <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>🟢 Đang kết nối</span>
              </div>

              {/* Split Screen Mode Toggle */}
              <button
                id="btn-toggle-split-view"
                onClick={() => setSplitViewMode(!splitViewMode)}
                title="Mô phỏng song song hai màn hình Phụ huynh & Giáo viên"
                className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  splitViewMode
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>Màn hình kép</span>
              </button>

              {/* School Map Trigger */}
              <button
                id="btn-open-school-map"
                onClick={() => setMapOpen(true)}
                title="Xem sơ đồ phân luồng khu vực đón"
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Sơ đồ</span>
              </button>

              {/* Sound Toggle */}
              <button
                id="btn-toggle-sound"
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  addToast(
                    soundEnabled ? 'Đã tắt âm thanh chuông báo' : 'Đã bật âm thanh chuông báo',
                    'info'
                  );
                }}
                title={soundEnabled ? 'Tắt chuông báo' : 'Bật chuông báo'}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  soundEnabled
                    ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                    : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Notification Drawer Trigger (Section 4) */}
              <button
                id="btn-open-notifications"
                onClick={() => setNotifOpen(true)}
                className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                title="Thông báo"
                aria-label="Thông báo"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span
                    id="badge-unread-count"
                    className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-red-500 rounded-full ring-2 ring-white animate-pulse"
                  >
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* User Account with Dropdown Menu (Section 4) */}
              <div className="relative pl-1" ref={dropdownRef}>
                  <button
                    id="btn-user-avatar-menu"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Tài khoản người dùng"
                  >
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-xl object-cover border border-slate-200 shadow-xs"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        {currentUser.name.charAt(0)}
                      </div>
                    )}
                    <div className="hidden md:block text-left">
                      <p className="text-xs font-bold text-slate-800 leading-tight">
                        {currentUser.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {currentUser.role === UserRole.PARENT
                          ? 'Phụ huynh'
                          : currentUser.role === UserRole.TEACHER
                          ? `GV Lớp ${currentUser.assignedClassName || '7A1'}`
                          : 'Quản trị viên'}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {/* Dropdown Menu (Section 4) */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                            {currentUser.role === UserRole.PARENT
                              ? '👨‍👩‍👧 Phụ huynh'
                              : currentUser.role === UserRole.TEACHER
                              ? `👩‍🏫 Lớp ${currentUser.assignedClassName || '7A1'}`
                              : '🏛️ Ban giám hiệu'}
                          </span>
                          {currentUser.isGoogleAuth && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              <span className="text-[9px]">G</span>
                              <span>Google Auth</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setNameInput(currentUser.name);
                            setIsEditingName(false);
                            setProfileModalOpen(true);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>Hồ sơ cá nhân</span>
                        </button>

                        <button
                          id="btn-header-edit-display-name"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setNameInput(currentUser.name);
                            setIsEditingName(true);
                            setProfileModalOpen(true);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-blue-700 hover:bg-blue-50 flex items-center space-x-2 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Đổi tên bản thân</span>
                        </button>

                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setSettingsModalOpen(true);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5 text-slate-400" />
                          <span>Cài đặt hệ thống</span>
                        </button>
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            resetDemoData();
                            addToast('Đã khôi phục dữ liệu demo ban đầu', 'info');
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                          <span>Khôi phục dữ liệu mẫu</span>
                        </button>

                        <button
                          id="btn-header-dropdown-logout"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-500" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                {/* Home Button (Trang chủ) */}
                <button
                  id="btn-header-home"
                  type="button"
                  onClick={goToHome}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    unauthScreen === 'home'
                      ? 'bg-slate-100 text-blue-700 font-extrabold border border-slate-200'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100 border border-transparent'
                  }`}
                  title="Về màn hình chính"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Trang chủ</span>
                </button>

                {/* Login Button (Nút Đăng nhập) */}
                <button
                  id="btn-header-login"
                  type="button"
                  onClick={() => {
                    openAuth('login');
                    setTimeout(() => {
                      const el = document.getElementById('auth-card-top') || document.getElementById('input-login-email');
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      const inputEl = document.getElementById('input-login-email') as HTMLInputElement;
                      inputEl?.focus();
                    }, 80);
                  }}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    unauthScreen === 'auth' && authMode === 'login'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-extrabold ring-1 ring-blue-500/20'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng nhập</span>
                </button>

                {/* Sign Up Button (Nút Đăng ký) */}
                <button
                  id="btn-header-signup"
                  type="button"
                  onClick={() => {
                    openAuth('signup');
                    setTimeout(() => {
                      const el = document.getElementById('auth-card-top') || document.getElementById('input-signup-name');
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      const inputEl = document.getElementById('input-signup-name') as HTMLInputElement;
                      inputEl?.focus();
                    }, 80);
                  }}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-extrabold shadow-sm transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5 ${
                    unauthScreen === 'auth' && authMode === 'signup'
                      ? 'bg-blue-700 text-white ring-2 ring-blue-500/30 shadow-blue-500/30'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Đăng ký</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Role Switcher strip - Hidden when logged out */}
          {currentUser && (
            <div className="flex lg:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-bold overflow-x-auto">
              <button
                onClick={() => {
                  setSplitViewMode(false);
                  switchRole(UserRole.PARENT);
                }}
                className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  !splitViewMode && currentUser?.role === UserRole.PARENT
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600'
                }`}
              >
                👨‍👩‍👧 Phụ huynh
              </button>
              <button
                onClick={() => {
                  setSplitViewMode(false);
                  switchRole(UserRole.TEACHER);
                }}
                className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  !splitViewMode && currentUser?.role === UserRole.TEACHER
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600'
                }`}
              >
                👩‍🏫 Giáo viên 7A1
              </button>
              <button
                onClick={() => {
                  setSplitViewMode(false);
                  switchRole(UserRole.ADMIN);
                }}
                className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  !splitViewMode && currentUser?.role === UserRole.ADMIN
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600'
                }`}
              >
                🏛️ Quản trị
              </button>
              <button
                onClick={() => setSplitViewMode(!splitViewMode)}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap text-[11px] ${
                  splitViewMode ? 'bg-indigo-600 text-white font-bold' : 'text-indigo-600 bg-indigo-50'
                }`}
              >
                📱 Màn hình kép
              </button>
            </div>
          )}
        </div>
      </header>

      {/* User Profile Modal */}
      {profileModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900">Hồ sơ người dùng</h3>
              {!isEditingName && (
                <button
                  id="btn-trigger-edit-name-inline"
                  onClick={() => {
                    setNameInput(currentUser.name);
                    setIsEditingName(true);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer hover:underline"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Đổi tên</span>
                </button>
              )}
            </div>

            <div className="space-y-3 text-xs">
              {/* Name box with self-naming edit capability */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 font-semibold block text-[10px]">HỌ VÀ TÊN CỦA BẠN</span>
                  <span className="text-[10px] text-blue-600 font-medium">Tự đặt theo ý muốn</span>
                </div>
                {isEditingName ? (
                  <div className="space-y-2 mt-1">
                    <input
                      id="input-edit-current-user-name"
                      type="text"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      placeholder="Nhập họ và tên của bạn"
                      className="w-full px-3 py-2 bg-white border border-blue-400 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        id="btn-save-custom-user-name"
                        onClick={() => {
                          const trimmed = nameInput.trim();
                          if (!trimmed) {
                            addToast('Họ và tên không được để trống.', 'warning');
                            return;
                          }
                          updateUserName(trimmed);
                          setIsEditingName(false);
                          addToast(`Đã đổi tên thành công: ${trimmed}`, 'success');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Lưu tên mới</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNameInput(currentUser.name);
                          setIsEditingName(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs cursor-pointer transition-all"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{currentUser.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNameInput(currentUser.name);
                        setIsEditingName(true);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded-md cursor-pointer transition-colors"
                      title="Chỉnh sửa họ tên"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[10px]">EMAIL</span>
                <span className="font-bold text-slate-800">{currentUser.email}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[10px]">VAI TRÒ TRONG HỆ THỐNG</span>
                <span className="font-bold text-blue-700">
                  {currentUser.role === UserRole.TEACHER
                    ? `Giáo viên chủ nhiệm lớp ${currentUser.assignedClassName || '7A1'}`
                    : currentUser.role === UserRole.PARENT
                    ? 'Phụ huynh học sinh'
                    : 'Quản trị viên nhà trường'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[10px]">SỐ ĐIỆN THOẠI</span>
                <span className="font-bold text-slate-800">{currentUser.phone || '0988 765 432'}</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setProfileModalOpen(false);
                  setIsEditingName(false);
                }}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Cài đặt hệ thống</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-bold text-slate-800">Âm thanh chuông báo</p>
                  <p className="text-[11px] text-slate-500">Phát âm thanh khi phụ huynh báo đến</p>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={e => setSoundEnabled(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-bold text-slate-800">Đồng bộ đa tab (Broadcast)</p>
                  <p className="text-[11px] text-slate-500">Đang hoạt động trên trình duyệt</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Lưu cài đặt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Drawers - Only render when authenticated */}
      {currentUser && (
        <>
          <SchoolMapModal isOpen={mapOpen} onClose={() => setMapOpen(false)} />
          <NotificationDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
        </>
      )}
    </>
  );
};
