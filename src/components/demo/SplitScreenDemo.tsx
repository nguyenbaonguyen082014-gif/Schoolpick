import React from 'react';
import { Columns2, Smartphone, Monitor, Info, Sparkles, X } from 'lucide-react';
import { useSchoolPick } from '../../context/SchoolPickContext';
import { ParentDashboard } from '../parent/ParentDashboard';
import { TeacherDashboard } from '../teacher/TeacherDashboard';

export const SplitScreenDemo: React.FC = () => {
  const { setSplitViewMode, simulateIncomingParent } = useSchoolPick();

  return (
    <div className="bg-slate-100 min-h-[calc(100vh-4rem)] p-3 sm:p-6">
      {/* Top Demo Banner */}
      <div className="max-w-7xl mx-auto mb-4 p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
            <Columns2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-black">
                MÔ PHỎNG THỜI GIAN THỰC SONG SONG (DUAL SCREEN DEMO)
              </h2>
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-extrabold uppercase">
                Real-time Sync
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Bên trái là điện thoại của Phụ huynh. Bên phải là màn hình Tablet của Giáo viên trong lớp. Bấm <b>"Tôi đang đến"</b> bên trái để thấy xuất hiện tức thì bên phải!
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={simulateIncomingParent}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Giả lập phụ huynh đến</span>
          </button>

          <button
            onClick={() => setSplitViewMode(false)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Thoát chế độ song song"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Two Panes Side by Side */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Parent Mobile Screen Simulation */}
        <div className="xl:col-span-5 bg-white rounded-3xl border-4 border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Simulated Mobile Notch / Top Status bar */}
          <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs font-bold select-none">
            <div className="flex items-center space-x-1.5">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>📱 ĐIỆN THOẠI PHỤ HUYNH</span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-slate-300">
              <span>SchoolPick Mobile</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 relative">
            <ParentDashboard />
          </div>
        </div>

        {/* Right Pane: Teacher Classroom Tablet Simulation */}
        <div className="xl:col-span-7 bg-white rounded-3xl border-4 border-emerald-400/80 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Simulated Tablet Status Bar */}
          <div className="bg-emerald-900 text-white px-4 py-2 flex items-center justify-between text-xs font-bold select-none">
            <div className="flex items-center space-x-1.5">
              <Monitor className="w-3.5 h-3.5 text-emerald-300" />
              <span>💻 MÀN HÌNH LỚP HỌC 7A1 (GIÁO VIÊN)</span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-emerald-200">
              <span>Đồng bộ tức thời</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 relative">
            <TeacherDashboard />
          </div>
        </div>
      </div>
    </div>
  );
};
