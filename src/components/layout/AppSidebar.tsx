import React, { useState } from 'react';
import {
  Car,
  Home,
  Clock,
  Users,
  ClipboardList,
  Bell,
  Settings,
  Sparkles,
  MapPin,
  GraduationCap,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Map as MapIcon,
  LogOut,
} from 'lucide-react';
import { useSchoolPick } from '../../context/SchoolPickContext';
import { UserRole } from '../../types';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenNotifications: () => void;
  onOpenMap: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenNotifications,
  onOpenMap,
}) => {
  const {
    currentUser,
    activeRequests,
    unreadNotificationCount,
    simulateIncomingParent,
    logout,
  } = useSchoolPick();

  const [collapsed, setCollapsed] = useState(false);

  const isTeacher = currentUser?.role === UserRole.TEACHER;
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const classQueueCount = activeRequests.filter(
    r => (isTeacher ? r.className === (currentUser?.assignedClassName || '7A1') : true)
  ).length;

  return (
    <aside
      id="desktop-app-sidebar"
      className={`hidden lg:flex flex-col bg-white border-r border-slate-200 min-h-[calc(100vh-4.5rem)] select-none shrink-0 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Top: Logo & Collapse Toggle (Section 16) */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-base tracking-tight">
                School<span className="text-blue-600">Pick</span>
              </span>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Smart Pickup
              </span>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors mx-auto cursor-pointer"
          title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Menu (Section 16) */}
      <div className="flex-1 px-3 py-4 space-y-4">
        <div>
          {!collapsed && (
            <span className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
              MENU ĐIỀU HÀNH
            </span>
          )}

          <nav className="mt-2 space-y-1">
            {/* 🏠 Tổng quan */}
            <button
              id="sidebar-nav-overview"
              onClick={() => onTabChange('overview')}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2' : 'justify-between px-3'
              } py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title="🏠 Tổng quan"
            >
              <div className="flex items-center space-x-3">
                <Home className={`w-4 h-4 ${activeTab === 'overview' ? 'text-blue-600' : 'text-slate-400'}`} />
                {!collapsed && <span>Tổng quan</span>}
              </div>
            </button>

            {/* 🚗 Hàng chờ */}
            <button
              id="sidebar-nav-queue"
              onClick={() => onTabChange('queue')}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2 relative' : 'justify-between px-3'
              } py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title="🚗 Hàng chờ đón"
            >
              <div className="flex items-center space-x-3">
                <Car className={`w-4 h-4 ${activeTab === 'queue' ? 'text-blue-600' : 'text-slate-400'}`} />
                {!collapsed && <span>Hàng chờ</span>}
              </div>
              {classQueueCount > 0 && (
                <span
                  className={`${
                    collapsed ? 'absolute top-1 right-1' : ''
                  } px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black`}
                >
                  {classQueueCount}
                </span>
              )}
            </button>

            {/* 🗺️ Bản đồ khu vực (Section 16) */}
            <button
              id="sidebar-nav-map"
              onClick={() => onTabChange('map')}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2' : 'justify-between px-3'
              } py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title="🗺️ Bản đồ khu vực"
            >
              <div className="flex items-center space-x-3">
                <MapIcon className={`w-4 h-4 ${activeTab === 'map' ? 'text-blue-600' : 'text-slate-400'}`} />
                {!collapsed && <span>Bản đồ khu vực</span>}
              </div>
            </button>

            {/* 👨‍🎓 Học sinh */}
            <button
              id="sidebar-nav-students"
              onClick={() => onTabChange('students')}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2' : 'justify-between px-3'
              } py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title="👨‍🎓 Học sinh"
            >
              <div className="flex items-center space-x-3">
                <Users className={`w-4 h-4 ${activeTab === 'students' ? 'text-blue-600' : 'text-slate-400'}`} />
                {!collapsed && <span>Học sinh</span>}
              </div>
            </button>

            {/* 📋 Lịch sử */}
            <button
              id="sidebar-nav-history"
              onClick={() => onTabChange('history')}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2' : 'justify-between px-3'
              } py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title="📋 Lịch sử"
            >
              <div className="flex items-center space-x-3">
                <ClipboardList className={`w-4 h-4 ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-400'}`} />
                {!collapsed && <span>Lịch sử</span>}
              </div>
            </button>

            {/* 🔔 Thông báo */}
            <button
              id="sidebar-nav-notif"
              onClick={onOpenNotifications}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2 relative' : 'justify-between px-3'
              } py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer`}
              title="🔔 Thông báo"
            >
              <div className="flex items-center space-x-3">
                <Bell className="w-4 h-4 text-slate-400" />
                {!collapsed && <span>Thông báo</span>}
              </div>
              {unreadNotificationCount > 0 && (
                <span
                  className={`${
                    collapsed ? 'absolute top-1 right-1' : ''
                  } px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black`}
                >
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* ⚙️ Cài đặt */}
            <button
              id="sidebar-nav-settings"
              onClick={() => {
                const btn = document.getElementById('btn-user-avatar-menu');
                btn?.click();
              }}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2' : 'justify-between px-3'
              } py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer`}
              title="⚙️ Cài đặt"
            >
              <div className="flex items-center space-x-3">
                <Settings className="w-4 h-4 text-slate-400" />
                {!collapsed && <span>Cài đặt</span>}
              </div>
            </button>
          </nav>
        </div>

        {/* Real-time Simulator (Quick Demo CTA) */}
        {!collapsed && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
            <div className="flex items-center space-x-2 text-blue-900 text-xs font-black mb-1">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Thử nghiệm đón con</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-snug mb-3 font-medium">
              Tạo phụ huynh giả lập gửi yêu cầu để kiểm tra luồng tức thời.
            </p>
            <button
              onClick={simulateIncomingParent}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>🚗 Báo phụ huynh đến</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer User Info & Logout */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <div className={`flex items-center ${collapsed ? 'flex-col space-y-2' : 'space-x-2'}`}>
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
            {isTeacher ? '7A' : 'AD'}
          </div>
          {!collapsed ? (
            <div className="min-w-0 flex-1 flex items-center justify-between">
              <div className="min-w-0 pr-1">
                <p className="text-xs font-black text-slate-900 truncate">
                  {currentUser?.name || 'Cô Hoàng Lan'}
                </p>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Trực tuyến</span>
                </p>
              </div>
              <button
                id="btn-sidebar-logout"
                onClick={logout}
                title="Đăng xuất khỏi hệ thống"
                className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              title="Đăng xuất khỏi hệ thống"
              className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
