import React, { useState } from 'react';
import { SchoolPickProvider, useSchoolPick } from './context/SchoolPickContext';
import { Header } from './components/common/Header';
import { LoginPage } from './components/auth/LoginPage';
import { LandingPage } from './components/home/LandingPage';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SplitScreenDemo } from './components/demo/SplitScreenDemo';
import { AppSidebar } from './components/layout/AppSidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { ConfirmModal } from './components/common/ConfirmModal';
import { SchoolMapModal } from './components/common/SchoolMapModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { UserRole } from './types';
import { Car } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, splitViewMode, unauthScreen } = useSchoolPick();
  const [teacherTab, setTeacherTab] = useState<'overview' | 'queue' | 'students' | 'history'>('overview');
  const [mapOpen, setMapOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const isTeacherOrAdmin =
    currentUser &&
    !splitViewMode &&
    (currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.ADMIN);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Global Application Header */}
      <Header />

      {/* Main View Router */}
      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar for Teacher & Admin (Section 3) */}
        {isTeacherOrAdmin && (
          <AppSidebar
            activeTab={teacherTab}
            onTabChange={tab => setTeacherTab(tab as any)}
            onOpenNotifications={() => setNotifOpen(true)}
            onOpenMap={() => setMapOpen(true)}
          />
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {!currentUser ? (
            unauthScreen === 'home' ? (
              <LandingPage />
            ) : (
              <LoginPage />
            )
          ) : splitViewMode ? (
            <SplitScreenDemo />
          ) : currentUser.role === UserRole.PARENT ? (
            <div className="py-6">
              <ParentDashboard />
            </div>
          ) : currentUser.role === UserRole.TEACHER ? (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
              <TeacherDashboard
                activeTab={teacherTab}
                onTabChange={setTeacherTab}
              />
            </div>
          ) : (
            <AdminDashboard
              activeTab={teacherTab}
              onTabChange={setTeacherTab}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 font-bold text-slate-700">
            <Car className="w-4 h-4 text-blue-600" />
            <span>SchoolPick – Hệ thống đón học sinh thông minh</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-500 text-[11px]">
            <span>Hotline: 1900 6868</span>
            <span>•</span>
            <span>Bảo mật dữ liệu học sinh & phụ huynh</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">Demo trực tuyến V2</span>
          </div>
        </div>
      </footer>

      {/* Global Toast Notifications & Confirmation Dialogs */}
      <ToastContainer />
      <ConfirmModal />
      {currentUser && (
        <>
          <SchoolMapModal isOpen={mapOpen} onClose={() => setMapOpen(false)} />
          <NotificationDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <SchoolPickProvider>
      <AppContent />
    </SchoolPickProvider>
  );
}
