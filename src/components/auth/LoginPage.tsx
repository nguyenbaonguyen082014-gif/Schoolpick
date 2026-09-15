import React, { useState } from 'react';
import {
  Car,
  Users,
  GraduationCap,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useSchoolPick } from '../../context/SchoolPickContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login } = useSchoolPick();

  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PARENT);
  const [email, setEmail] = useState('parent@schoolpick.demo');
  const [password, setPassword] = useState('demo123');
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
    if (role === UserRole.PARENT) {
      setEmail('parent@schoolpick.demo');
      setPassword('demo123');
    } else if (role === UserRole.TEACHER) {
      setEmail('teacher@schoolpick.demo');
      setPassword('demo123');
    } else {
      setEmail('admin@schoolpick.demo');
      setPassword('demo123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Vui lòng nhập địa chỉ email.');
      return;
    }
    const success = login(email, selectedRole);
    if (!success) {
      setErrorMessage('Email hoặc mật khẩu chưa chính xác.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand Value Prop & Features */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Hệ thống quản lý đón học sinh thông minh</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              School<span className="text-blue-600">Pick</span>
            </h1>
            <p className="mt-2 text-base sm:text-lg font-bold text-slate-700">
              Đón con thông minh – Giảm ùn tắc – An toàn hơn
            </p>
            <p className="mt-3 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Giải pháp kết nối tức thời giữa phụ huynh và giáo viên chủ nhiệm. Thông báo đón con theo thời gian thực, điều phối phân làn khu vực thông minh và hạn chế ùn tắc cổng trường.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Thao tác 10 giây cho phụ huynh</p>
                <p className="text-[11px] text-slate-500">Báo đang đến chỉ với 1 chạm, theo dõi tiến độ chuẩn bị của con.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Màn hình điều phối lớp học</p>
                <p className="text-[11px] text-slate-500">Giáo viên nhận chuông thông báo tức thì, gọi đúng học sinh ra đúng làn.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Box */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-900">Chọn vai trò đăng nhập</h2>
            <p className="text-xs text-slate-500 mt-1">Chọn đối tượng phù hợp để trải nghiệm hệ thống</p>
          </div>

          {/* Two Large Role Cards (Plus Admin tab) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {/* Parent Card */}
            <button
              type="button"
              id="role-select-parent"
              onClick={() => handleRoleSelect(UserRole.PARENT)}
              className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                selectedRole === UserRole.PARENT
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                {selectedRole === UserRole.PARENT && (
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                )}
              </div>
              <h3 className="text-sm font-black text-slate-900">👨‍👩‍👧 Phụ huynh</h3>
              <p className="text-xs text-slate-500 mt-1">Quản lý việc đón con</p>
            </button>

            {/* Teacher Card */}
            <button
              type="button"
              id="role-select-teacher"
              onClick={() => handleRoleSelect(UserRole.TEACHER)}
              className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                selectedRole === UserRole.TEACHER
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                {selectedRole === UserRole.TEACHER && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                )}
              </div>
              <h3 className="text-sm font-black text-slate-900">👩‍🏫 Giáo viên</h3>
              <p className="text-xs text-slate-500 mt-1">Quản lý việc đón học sinh</p>
            </button>
          </div>

          {/* Quick Admin Option */}
          <div className="flex items-center justify-between px-3 py-2 mb-6 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span>Dành cho Ban Giám Hiệu / Quản trị viên:</span>
            </span>
            <button
              type="button"
              id="role-select-admin"
              onClick={() => handleRoleSelect(UserRole.ADMIN)}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedRole === UserRole.ADMIN
                  ? 'bg-slate-800 text-white'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              Đăng nhập Quản trị
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-login-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="name@schoolpick.demo"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-login-password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                <input
                  id="checkbox-remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="font-medium">Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                id="btn-forgot-password"
                onClick={() => setForgotModalOpen(true)}
                className="font-semibold text-blue-600 hover:text-blue-800"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Primary Login Button */}
            <button
              id="btn-submit-login"
              type="submit"
              className={`w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-md transition-all active:scale-[0.99] cursor-pointer ${
                selectedRole === UserRole.PARENT
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                  : selectedRole === UserRole.TEACHER
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                  : 'bg-slate-800 hover:bg-slate-900 shadow-slate-700/25'
              }`}
            >
              <span>
                {selectedRole === UserRole.PARENT
                  ? 'Đăng nhập với tư cách Phụ huynh'
                  : selectedRole === UserRole.TEACHER
                  ? 'Đăng nhập với tư cách Giáo viên'
                  : 'Đăng nhập Quản trị viên'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Hint Banner */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Chế độ Demo kích hoạt: Sử dụng mật khẩu <b>demo123</b></span>
            </div>
            <button
              type="button"
              onClick={() => login(email, selectedRole)}
              className="font-bold text-blue-600 hover:underline"
            >
              Đăng nhập nhanh ⚡
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-2">Khôi phục mật khẩu</h3>
            {forgotSent ? (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-600">
                  Liên kết đặt lại mật khẩu đã được gửi đến email <b>{email}</b>. Vui lòng kiểm tra hộp thư!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModalOpen(false);
                    setForgotSent(false);
                  }}
                  className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Nhập email tài khoản phụ huynh hoặc giáo viên của bạn để nhận hướng dẫn khôi phục mật khẩu.
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  placeholder="email@example.com"
                />
                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotSent(true)}
                    className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                  >
                    Gửi yêu cầu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
