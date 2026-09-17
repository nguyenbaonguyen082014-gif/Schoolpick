import React from 'react';
import {
  Car,
  LogIn,
  UserPlus,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  GraduationCap,
  Bell,
  MapPin,
  ChevronRight,
  Zap,
  Smartphone,
  Radio,
} from 'lucide-react';
import { useSchoolPick } from '../../context/SchoolPickContext';
import { UserRole } from '../../types';
import pickupIllustration from '../../assets/images/school_pickup_illustration_1789536398989.jpg';

export const LandingPage: React.FC = () => {
  const { openAuth, login } = useSchoolPick();

  return (
    <div className="w-full bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-800">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-20 border-b border-slate-200/70">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Pill Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span>Giải pháp điều phối đón học sinh thông minh</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.18]">
                Đón con an toàn, đúng giờ và{' '}
                <span className="text-blue-600 underline decoration-blue-300 underline-offset-4">
                  không ùn tắc cổng trường
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                SchoolPick kết nối phụ huynh và nhà trường bằng hệ thống thông báo thời gian thực, điều phối làn đón thông minh và xác thực học sinh ra cổng nhanh chóng trong 30 giây.
              </p>

              {/* Prominent Action Buttons: Login & Sign Up */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                {/* Button Đăng nhập */}
                <button
                  type="button"
                  id="btn-hero-login"
                  onClick={() => openAuth('login')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2.5 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Button Đăng ký */}
                <button
                  type="button"
                  id="btn-hero-signup"
                  onClick={() => openAuth('signup')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm sm:text-base border-2 border-slate-200 hover:border-slate-300 flex items-center justify-center space-x-2 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>Đăng ký tài khoản</span>
                </button>
              </div>

              {/* Key Trust Metrics */}
              <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-200/80 text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">80%</div>
                  <div className="text-[11px] text-slate-500 font-semibold leading-tight">Giảm thời gian kẹt xe cổng trường</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-blue-600">30s</div>
                  <div className="text-[11px] text-slate-500 font-semibold leading-tight">Tốc độ đón học sinh mỗi lượt</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-600">100%</div>
                  <div className="text-[11px] text-slate-500 font-semibold leading-tight">Đúng người đón & an toàn tuyệt đối</div>
                </div>
              </div>
            </div>

            {/* Right: Featured Illustration of Students Being Picked Up */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* The main illustration image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 ring-1 ring-slate-900/10 group">
                  <img
                    id="img-hero-pickup-illustration"
                    src={pickupIllustration}
                    alt="Hình ảnh minh họa phụ huynh đón học sinh tại cổng trường an toàn, thông minh"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient overlay for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

                  {/* Bottom caption overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center space-x-2 text-xs font-black bg-slate-900/70 backdrop-blur-md px-3 py-1.5 rounded-xl w-fit mb-1 border border-white/20">
                      <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                      <span>ĐIỀU PHỐI ĐÓN TRẢ TRỰC TIẾP</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-white drop-shadow-md">
                      Học sinh ra đúng làn số 1 & 2 khi phụ huynh di chuyển tới cổng trường
                    </p>
                  </div>
                </div>

                {/* Floating Status Badge 1: Top Left */}
                <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200/80 flex items-center space-x-3 hidden sm:flex animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800">Bé Tuấn Kiệt (Lớp 7A1)</p>
                    <p className="text-[11px] text-emerald-600 font-bold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                      <span>Đã sẵn sàng ở Làn B</span>
                    </p>
                  </div>
                </div>

                {/* Floating Status Badge 2: Bottom Right */}
                <div className="absolute -bottom-4 -right-3 sm:-bottom-5 sm:-right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200/80 hidden sm:flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800">Xe ô tô 30G-888.99</p>
                    <p className="text-[11px] text-slate-500 font-semibold">Khoảng cách: 250m • Đến trong 1 phút</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE-STEP SMART WORKFLOW */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Quy trình vận hành
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            Đón con chỉ trong 3 bước đồng bộ thời gian thực
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Không cần chờ đợi ngoài nắng mưa, không đỗ xe chặn lối đi của trường
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              1
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 mb-2">
              <Smartphone className="w-4 h-4" />
              <span>Phụ huynh gửi thông báo</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2">
              Báo "Tôi đang đến" từ xa
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Khi cách trường khoảng 300 - 500m, phụ huynh bấm nút trên điện thoại báo loại phương tiện (Ô tô, Xe máy) và biển số xe đón con.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              2
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 mb-2">
              <Bell className="w-4 h-4" />
              <span>Lớp học nhận chuông tức thì</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2">
              Giáo viên chuẩn bị học sinh
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Màn hình lớp học và âm thanh chuông thông báo reo lên. Giáo viên xác nhận và hướng dẫn học sinh đeo cặp sách di chuyển ra làn đón đã quy định.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg mb-5 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              3
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 mb-2">
              <MapPin className="w-4 h-4" />
              <span>Đón đúng làn an toàn</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2">
              Lên xe & rời đi trong 30 giây
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Xe phụ huynh vừa trờ tới cổng thì học sinh đã đứng chờ sẵn tại làn đón. Phụ huynh đón con an toàn, xe lưu thông liên tục không gây tắc nghẽn.
            </p>
          </div>
        </div>
      </section>

      {/* 3. DUAL ROLE EXPERIENCE (PARENTS & SCHOOL) */}
      <section className="py-14 bg-slate-100/70 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* For Parents Card */}
            <div className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Dành cho Phụ huynh</h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
                  Trải nghiệm đón con văn minh, thuận tiện và an tâm với từng bước cập nhật trực tiếp trên di động.
                </p>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 mb-6">
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Chỉ 1 chạm để thông báo đang đến đón</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Xem trạng thái con: Đang chuẩn bị ➔ Đã ra làn đón</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Bản đồ phân làn đón học sinh thông minh</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                id="btn-card-login-parent"
                onClick={() => openAuth('login')}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Đăng nhập Phụ huynh</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* For Teachers & School Card */}
            <div className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Dành cho Giáo viên & Nhà trường</h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
                  Màn hình điều phối lớp học thông minh, gọi học sinh theo thứ tự xe đến, bảo đảm an ninh trật tự.
                </p>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 mb-6">
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Hàng chờ đón học sinh trực quan theo thời gian thực</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Chuông báo âm thanh tự động khi phụ huynh đến cổng</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Quản lý học sinh đã đón, học sinh còn lại trong lớp</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                id="btn-card-login-teacher"
                onClick={() => openAuth('login')}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Đăng nhập Giáo viên</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION FOOTER BANNER */}
      <section className="py-14 sm:py-18 bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Sẵn sàng trải nghiệm trường học thông minh cùng SchoolPick?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
            Đăng ký tài khoản ngay hôm nay hoặc đăng nhập để tham gia quản lý và đón học sinh an toàn, đúng giờ.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              id="btn-bottom-signup"
              onClick={() => openAuth('signup')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-blue-800 font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>Đăng ký tài khoản mới</span>
            </button>

            <button
              type="button"
              id="btn-bottom-login"
              onClick={() => openAuth('login')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-blue-600/40 hover:bg-blue-600/60 text-white border-2 border-white/30 font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập hệ thống</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
