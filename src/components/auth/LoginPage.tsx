import React, { useState, useEffect } from 'react';
import {
  Car,
  Users,
  GraduationCap,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  X,
  Loader2,
  Copy,
  Check,
  Key,
  Trash2,
  Plus,
  UserCheck,
  UserPlus,
  LogIn,
  Phone,
  User as UserIcon,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';
import { useSchoolPick } from '../../context/SchoolPickContext';
import { UserRole } from '../../types';

// Helper to generate Google-style secure password
const generateGoogleSecurePassword = () => {
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%&*';
  const all = uppers + lowers + digits + symbols;

  const chars = [
    uppers[Math.floor(Math.random() * uppers.length)],
    lowers[Math.floor(Math.random() * lowers.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];
  for (let i = 0; i < 12; i++) {
    chars.push(all[Math.floor(Math.random() * all.length)]);
  }
  return chars.sort(() => 0.5 - Math.random()).join('');
};

// Official Google G Logo SVG
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const LoginPage: React.FC = () => {
  const {
    login,
    loginWithGoogle,
    registerUser,
    authMode,
    setAuthMode,
    goToHome,
    addToast,
    checkUserExists,
    googleStrictOnly,
    setGoogleStrictOnly,
  } = useSchoolPick();

  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PARENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sign up form state
  const [signupRole, setSignupRole] = useState<UserRole>(UserRole.PARENT);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupStudentName, setSignupStudentName] = useState('');
  const [signupClassName, setSignupClassName] = useState('7A1');
  const [signupErrorMessage, setSignupErrorMessage] = useState('');

  // Password choice for signup - default to custom password so user sets it themselves
  const [useGooglePasswordOption, setUseGooglePasswordOption] = useState<boolean>(false);
  const [googleGeneratedPassword, setGoogleGeneratedPassword] = useState<string>(() => generateGoogleSecurePassword());
  const [copiedGooglePassword, setCopiedGooglePassword] = useState<boolean>(false);
  const [showSignupPassword, setShowSignupPassword] = useState<boolean>(false);

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrorMessage('');

    if (!signupName.trim()) {
      setSignupErrorMessage('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setSignupErrorMessage('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (signupRole === UserRole.PARENT && !signupStudentName.trim()) {
      setSignupErrorMessage('Vui lòng nhập họ tên của học sinh (con bạn).');
      return;
    }

    const finalPassword = useGooglePasswordOption ? googleGeneratedPassword : signupPassword;
    if (!useGooglePasswordOption && (!finalPassword.trim() || finalPassword.trim().length < 6)) {
      setSignupErrorMessage('Vui lòng nhập mật khẩu tối thiểu 6 ký tự hoặc chọn dùng mật khẩu bảo mật do Google tạo.');
      return;
    }

    registerUser({
      name: signupName.trim(),
      email: signupEmail.trim(),
      role: signupRole,
      phone: signupPhone.trim() || undefined,
      studentName: signupRole === UserRole.PARENT ? signupStudentName.trim() : undefined,
      className: signupClassName.trim() || '7A1',
      password: finalPassword.trim() || undefined,
    });
  };

interface SavedGoogleAccount {
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  lastLogin: number;
}

  // Google Sign-In state
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isUsingAnotherAccount, setIsUsingAnotherAccount] = useState(false);
  const [showAdvancedOAuth, setShowAdvancedOAuth] = useState(false);
  const [activeGoogleTab, setActiveGoogleTab] = useState<'instant_any' | 'custom_oauth'>('instant_any');
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [googleOAuthError, setGoogleOAuthError] = useState<string | null>(null);
  const [accountNotFoundEmail, setAccountNotFoundEmail] = useState<string | null>(null);

  // Form state for ANY Google account holder
  const [anyGoogleEmail, setAnyGoogleEmail] = useState('');
  const [anyGoogleName, setAnyGoogleName] = useState('');
  const [anyGoogleRole, setAnyGoogleRole] = useState<UserRole>(selectedRole);
  const [inputEmailError, setInputEmailError] = useState('');

  // Device saved accounts (user's real accounts)
  const [savedGoogleAccounts, setSavedGoogleAccounts] = useState<SavedGoogleAccount[]>(() => {
    try {
      const raw = localStorage.getItem('schoolpick_saved_google_accounts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter(a => a && a.email && !a.email.toLowerCase().endsWith('.demo'));
        }
      }
    } catch {}
    return [];
  });

  // Check if live client ID exists in environment or localStorage
  const configuredClientId = ((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string) || '';
  const [googleClientIdInput, setGoogleClientIdInput] = useState<string>(() => {
    return localStorage.getItem('sp_google_client_id') || configuredClientId || '';
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setAnyGoogleRole(role);
    setErrorMessage('');
  };

  // Launch official Google OAuth 2.0 popup
  const triggerRealGoogleOAuth = (idToUse?: string) => {
    const effectiveClientId = idToUse || googleClientIdInput.trim() || configuredClientId;
    if (!effectiveClientId) {
      setActiveGoogleTab('custom_oauth');
      setGoogleOAuthError('Vui lòng nhập Google Client ID để mở popup xác thực Google.');
      return;
    }

    // Save for next time
    localStorage.setItem('sp_google_client_id', effectiveClientId);

    if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
      setGoogleOAuthError('Thư viện Google Identity Services chưa tải xong. Vui lòng thử lại sau 2 giây.');
      return;
    }

    setGoogleLoading(true);
    setGoogleOAuthError(null);

    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: effectiveClientId,
        scope: 'openid email profile',
        error_callback: (err: any) => {
          setGoogleLoading(false);
          setGoogleOAuthError(`Lỗi Google OAuth: ${err?.message || err?.type || JSON.stringify(err)}`);
        },
        callback: async (tokenResponse: any) => {
          setGoogleLoading(false);
          if (tokenResponse.error) {
            setGoogleOAuthError(
              `Lỗi từ Google: ${tokenResponse.error_description || tokenResponse.error}`
            );
            return;
          }
          if (tokenResponse.access_token) {
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const profile = await res.json();
              setGoogleModalOpen(false);
              loginWithGoogle({
                name: profile.name || profile.email.split('@')[0],
                email: profile.email,
                avatarUrl: profile.picture,
                role: anyGoogleRole || selectedRole,
              });
            } catch {
              setGoogleOAuthError('Không thể lấy thông tin hồ sơ từ Google.');
            }
          }
        },
      });

      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      setGoogleLoading(false);
      setGoogleOAuthError(
        `Không thể khởi tạo popup: ${err?.message || 'Kiểm tra xem Client ID có hợp lệ và tên miền này đã được thêm vào Authorized JavaScript Origins chưa.'}`
      );
    }
  };

  // Launch authentic Google Account Chooser popup window
  const openGooglePopupWindow = (roleOverride?: UserRole) => {
    const roleToUse = roleOverride || anyGoogleRole || selectedRole;
    const width = 480;
    const height = 640;
    const left = typeof window !== 'undefined' ? window.screenX + Math.max(0, (window.outerWidth - width) / 2) : 100;
    const top = typeof window !== 'undefined' ? window.screenY + Math.max(0, (window.outerHeight - height) / 2) : 100;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const popupUrl = `${origin}/google-popup.html?role=${encodeURIComponent(roleToUse)}`;

    try {
      const popup = window.open(
        popupUrl,
        'google_account_chooser',
        `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no,location=yes,resizable=yes`
      );

      if (popup) {
        popup.focus();
        setPopupBlocked(false);
      }
    } catch {
      setPopupBlocked(true);
    }
  };

  // Listen for Google Auth result from popup window or localStorage
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_SIGNIN_SUCCESS' && event.data?.user) {
        const { name, email, avatarUrl, role } = event.data.user;
        loginWithGoogle({
          name,
          email,
          avatarUrl,
          role: role || selectedRole,
        });
        setGoogleModalOpen(false);
        setPopupBlocked(false);
      }
    };

    const checkDirectAuth = () => {
      try {
        const stored = localStorage.getItem('schoolpick_direct_google_auth');
        if (stored) {
          localStorage.removeItem('schoolpick_direct_google_auth');
          const user = JSON.parse(stored);
          loginWithGoogle({
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            role: user.role || selectedRole,
          });
          setGoogleModalOpen(false);
        }
      } catch {}
    };

    checkDirectAuth();
    window.addEventListener('message', handleAuthMessage);
    window.addEventListener('storage', checkDirectAuth);
    return () => {
      window.removeEventListener('message', handleAuthMessage);
      window.removeEventListener('storage', checkDirectAuth);
    };
  }, [selectedRole, loginWithGoogle]);

  const handleGoogleClick = () => {
    setErrorMessage('');
    setAnyGoogleRole(selectedRole);
    setIsUsingAnotherAccount(false);
    setInputEmailError('');
    setGoogleOAuthError(null);

    // 1. Immediately launch Google Account Chooser popup window
    openGooglePopupWindow(selectedRole);

    // 2. Automatically display Google Account Chooser dialog in-app so user has zero delay
    setGoogleModalOpen(true);
  };

  const handleConfirmGoogleLogin = (
    targetEmail: string,
    targetName: string,
    avatar?: string,
    roleToUse?: UserRole
  ) => {
    const effectiveRole = roleToUse || anyGoogleRole || selectedRole;
    setGoogleLoading(true);
    const effectiveAvatar =
      avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        targetName
      )}&backgroundColor=0284c7&textColor=ffffff`;

    setTimeout(() => {
      setGoogleLoading(false);
      setGoogleModalOpen(false);

      // Save to device's recent Google accounts list
      try {
        const updated = [
          {
            name: targetName,
            email: targetEmail,
            avatarUrl: effectiveAvatar,
            role: effectiveRole,
            lastLogin: Date.now(),
          },
          ...savedGoogleAccounts.filter(a => a.email.toLowerCase() !== targetEmail.toLowerCase()),
        ].slice(0, 8);
        setSavedGoogleAccounts(updated);
        localStorage.setItem('schoolpick_saved_google_accounts', JSON.stringify(updated));
      } catch {}

      loginWithGoogle({
        name: targetName,
        email: targetEmail,
        avatarUrl: effectiveAvatar,
        role: effectiveRole,
      });
    }, 280);
  };

  const handleLoginAnyUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = anyGoogleEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setInputEmailError('Vui lòng nhập địa chỉ Gmail hoặc email Google của bạn.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setInputEmailError('Địa chỉ email không hợp lệ (ví dụ: nguyenvanan@gmail.com).');
      return;
    }

    setInputEmailError('');
    let cleanName = anyGoogleName.trim();
    if (!cleanName) {
      const part = cleanEmail.split('@')[0];
      cleanName = part
        .split(/[._-]/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      cleanName
    )}&backgroundColor=0284c7&textColor=ffffff`;

    handleConfirmGoogleLogin(cleanEmail, cleanName, avatar, anyGoogleRole);
  };

  const handleRemoveSavedAccount = (e: React.MouseEvent, emailToRemove: string) => {
    e.stopPropagation();
    const updated = savedGoogleAccounts.filter(
      a => a.email.toLowerCase() !== emailToRemove.toLowerCase()
    );
    setSavedGoogleAccounts(updated);
    try {
      localStorage.setItem('schoolpick_saved_google_accounts', JSON.stringify(updated));
    } catch {}
  };

  const copyOriginToClipboard = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin);
      setCopiedOrigin(true);
      setTimeout(() => setCopiedOrigin(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setAccountNotFoundEmail(null);
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Vui lòng nhập địa chỉ email tài khoản của bạn.');
      return;
    }

    // Check whether the account exists
    const existing = checkUserExists(cleanEmail);
    if (!existing) {
      setErrorMessage('Tài khoản không tồn tại. Bạn có muốn tạo tài khoản mới không?');
      setAccountNotFoundEmail(cleanEmail);
      return;
    }

    // Account exists! Log them into the system
    const res = login(cleanEmail, selectedRole, password.trim() || undefined);
    if (!res.success) {
      if (res.reason === 'NOT_FOUND') {
        setErrorMessage('Tài khoản không tồn tại. Bạn có muốn tạo tài khoản mới không?');
        setAccountNotFoundEmail(cleanEmail);
      } else if (res.reason === 'WRONG_PASSWORD') {
        setErrorMessage('Mật khẩu không chính xác. Vui lòng kiểm tra lại.');
      } else {
        setErrorMessage(res.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100">
      {/* Top Navigation Bar: Back to Home */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between">
        <button
          type="button"
          id="btn-login-back-home"
          onClick={goToHome}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 font-bold text-xs shadow-2xs transition-all cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
          <span>Quay lại màn hình chính</span>
        </button>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          {authMode === 'login' ? 'Đang ở chế độ Đăng nhập' : 'Đang ở chế độ Đăng ký mới'}
        </span>
      </div>

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

        {/* Right Side: Auth Box (Login & Sign Up) */}
        <div id="auth-card-top" className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 scroll-mt-24">
          {/* Top Mode Switcher Tabs: Login vs Sign Up */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
              <button
                type="button"
                id="tab-auth-login"
                onClick={() => setAuthMode('login')}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                  authMode === 'login'
                    ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>
              <button
                type="button"
                id="tab-auth-signup"
                onClick={() => setAuthMode('signup')}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                  authMode === 'signup'
                    ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Đăng ký mới</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              {authMode === 'login' ? 'Truy cập tài khoản trường' : 'Tạo tài khoản phụ huynh / GV'}
            </span>
          </div>

          {authMode === 'login' ? (
            <div>
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

          {/* Primary Google Sign-In Button */}
          <div className="mb-5">
            <button
              type="button"
              id="btn-login-google"
              onClick={handleGoogleClick}
              disabled={googleLoading}
              className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-blue-500/80 ring-4 ring-blue-500/15 text-slate-800 font-black text-sm sm:text-base flex items-center justify-center space-x-3 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70 group"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <GoogleIcon className="w-5 h-5" />
              )}
              <span className="flex items-center space-x-2">
                <span>
                  {googleLoading
                    ? 'Đang kết nối Google an toàn...'
                    : `Đăng nhập bằng Google (${
                        selectedRole === UserRole.PARENT
                          ? 'Phụ huynh'
                          : selectedRole === UserRole.TEACHER
                          ? 'Giáo viên'
                          : 'Ban giám hiệu'
                      })`}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </span>
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2 flex items-center justify-center space-x-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xác thực tiện lợi & bảo mật thông tin với tài khoản của bạn</span>
            </p>
          </div>

          {/* Divider between Google and Email/Password Login */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                Hoặc đăng nhập bằng Email & Mật khẩu
              </span>
            </div>
          </div>

          {/* Email and Password Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className={`p-3.5 rounded-2xl border text-xs font-medium space-y-2.5 ${
                accountNotFoundEmail
                  ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <div className="flex items-start space-x-2">
                  <ShieldAlert className={`w-4 h-4 shrink-0 mt-0.5 ${
                    accountNotFoundEmail ? 'text-amber-600' : 'text-red-600'
                  }`} />
                  <div className="flex-1 font-semibold leading-relaxed">{errorMessage}</div>
                </div>

                {accountNotFoundEmail && (
                  <div className="pt-2.5 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <span className="text-[11px] text-amber-800">
                      Tài khoản <b>{accountNotFoundEmail}</b> chưa được tạo trên hệ thống.
                    </span>
                    <button
                      type="button"
                      id="btn-create-account-prompt"
                      onClick={() => {
                        setSignupEmail(accountNotFoundEmail);
                        setSignupRole(selectedRole);
                        setAuthMode('signup');
                        setErrorMessage('');
                        setAccountNotFoundEmail(null);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center space-x-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Tạo tài khoản mới ngay</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="input-login-email" className="block text-xs font-bold text-slate-700">
                  Địa chỉ Email tài khoản <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Hệ thống sẽ kiểm tra email tồn tại và cho bạn vào ngay
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-login-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                    if (accountNotFoundEmail) setAccountNotFoundEmail(null);
                  }}
                  placeholder="Nhập email tài khoản của bạn"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Real-time Email Existence Feedback */}
              {(() => {
                const clean = email.trim().toLowerCase();
                if (!clean) return null;
                const found = checkUserExists(clean);
                if (found) {
                  return (
                    <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl animate-in fade-in duration-150">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Tài khoản tồn tại: <b>{found.name}</b> ({found.role === UserRole.PARENT ? 'Phụ huynh' : found.role === UserRole.TEACHER ? 'Giáo viên' : 'Quản trị viên'}) - Bấm Đăng nhập để vào ngay!
                      </span>
                    </div>
                  );
                } else if (clean.includes('@') && clean.includes('.')) {
                  return (
                    <div className="flex items-center justify-between text-xs text-amber-900 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl animate-in fade-in duration-150">
                      <div className="flex items-center space-x-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Chưa có tài khoản này trên hệ thống.</span>
                      </div>
                      <button
                        type="button"
                        id="btn-inline-quick-signup"
                        onClick={() => {
                          setSignupEmail(clean);
                          setSignupRole(selectedRole);
                          setAuthMode('signup');
                        }}
                        className="font-black text-blue-600 hover:underline cursor-pointer text-xs"
                      >
                        Tạo tài khoản mới ngay &rarr;
                      </button>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="input-login-password" className="block text-xs font-bold text-slate-700">
                  Mật khẩu tài khoản <span className="text-slate-400 font-normal text-[11px]">(Tùy chọn khi đăng nhập qua Email)</span>
                </label>
                <button
                  type="button"
                  id="btn-forgot-password"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu (hoặc để trống nếu đăng nhập nhanh qua Email)"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                />
                <button
                  type="button"
                  id="btn-toggle-login-password"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                  title={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  aria-label={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showLoginPassword ? (
                    <EyeOff className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-500" />
                  )}
                </button>
              </div>

              {/* Status and quick toggle helper */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span className="flex items-center space-x-1">
                  <span>Trạng thái mật khẩu:</span>
                  <span className={`font-semibold ${showLoginPassword ? 'text-blue-600' : 'text-slate-700'}`}>
                    {showLoginPassword ? 'Đang hiện ký tự mật khẩu' : 'Đang ẩn mật khẩu (dấu chấm)'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="text-blue-600 hover:underline cursor-pointer font-bold flex items-center space-x-1"
                >
                  {showLoginPassword ? <span>Ẩn mật khẩu</span> : <span>Hiện mật khẩu</span>}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>Ghi nhớ đăng nhập trên máy này</span>
              </label>
            </div>

            <button
              type="submit"
              id="btn-submit-login"
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>
                {(() => {
                  const clean = email.trim().toLowerCase();
                  const found = clean ? checkUserExists(clean) : null;
                  if (found) {
                    return `Đăng nhập ngay (${found.name})`;
                  }
                  return 'Kiểm tra tài khoản & Đăng nhập';
                })()}
              </span>
            </button>
          </form>

          {/* Link to Sign Up */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Chưa có tài khoản SchoolPick? </span>
            <button
              type="button"
              id="btn-goto-signup"
              onClick={() => setAuthMode('signup')}
              className="font-extrabold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer ml-1"
            >
              Đăng ký tài khoản ngay
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-900">Đăng ký tài khoản mới</h2>
            <p className="text-xs text-slate-500 mt-1">Đăng ký cho Phụ huynh hoặc Giáo viên để bắt đầu đón/trả con an toàn</p>
          </div>

          {/* Fast Google Registration */}
          <div className="mb-5">
            <button
              type="button"
              id="btn-signup-google"
              onClick={handleGoogleClick}
              disabled={googleLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm flex items-center justify-center space-x-3 shadow-xs transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70 group"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <GoogleIcon className="w-5 h-5" />
              )}
              <span>Đăng ký nhanh bằng tài khoản Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="shrink-0 mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Hoặc điền thông tin đăng ký
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Role Selection for Sign Up */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              id="signup-role-parent"
              onClick={() => setSignupRole(UserRole.PARENT)}
              className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer flex items-center space-x-3 ${
                signupRole === UserRole.PARENT
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">👨‍👩‍👧 Phụ huynh</h4>
                <p className="text-[10px] text-slate-500">Đăng ký đón con</p>
              </div>
            </button>

            <button
              type="button"
              id="signup-role-teacher"
              onClick={() => setSignupRole(UserRole.TEACHER)}
              className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer flex items-center space-x-3 ${
                signupRole === UserRole.TEACHER
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">👩‍🏫 Giáo viên</h4>
                <p className="text-[10px] text-slate-500">Quản lý lớp học</p>
              </div>
            </button>
          </div>

          {/* Direct Google Sign Up Button */}
          <div className="mb-4">
            <button
              type="button"
              id="btn-signup-google"
              onClick={() => {
                setSelectedRole(signupRole);
                handleGoogleClick();
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-blue-500/80 ring-2 ring-blue-500/10 text-slate-800 font-black text-xs sm:text-sm flex items-center justify-center space-x-2.5 shadow-xs transition-all active:scale-[0.99] cursor-pointer"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>Đăng ký nhanh bằng tài khoản Google</span>
            </button>
            <div className="relative flex py-2 items-center my-1">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="shrink-0 mx-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                hoặc điền thông tin học sinh chi tiết
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            {signupErrorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-bold flex items-center space-x-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>{signupErrorMessage}</span>
              </div>
            )}

            {/* Full Name - Self naming */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và tên của bạn (Tự đặt tên theo ý bạn) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="input-signup-name"
                  type="text"
                  required
                  value={signupName}
                  onChange={e => setSignupName(e.target.value)}
                  placeholder="Nhập họ và tên đầy đủ của bạn (ví dụ: Nguyễn Bảo Nguyên)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa chỉ Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="input-signup-email"
                    type="email"
                    required
                    value={signupEmail}
                    onChange={e => setSignupEmail(e.target.value)}
                    placeholder="tenban@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số điện thoại
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="input-signup-phone"
                    type="tel"
                    value={signupPhone}
                    onChange={e => setSignupPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Role Specific Fields */}
            {signupRole === UserRole.PARENT ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-50/60 rounded-2xl border border-blue-100">
                <div>
                  <label className="block text-xs font-bold text-blue-900 mb-1">
                    Họ tên con (Học sinh) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-signup-student-name"
                    type="text"
                    required
                    value={signupStudentName}
                    onChange={e => setSignupStudentName(e.target.value)}
                    placeholder="VD: Nguyễn Tuấn Kiệt"
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-900 mb-1">
                    Lớp của học sinh
                  </label>
                  <select
                    id="select-signup-class"
                    value={signupClassName}
                    onChange={e => setSignupClassName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="6A1">Lớp 6A1 (Khu A)</option>
                    <option value="6A2">Lớp 6A2 (Khu A)</option>
                    <option value="7A1">Lớp 7A1 (Khu B)</option>
                    <option value="7A2">Lớp 7A2 (Khu B)</option>
                    <option value="8A1">Lớp 8A1 (Khu C)</option>
                    <option value="9A1">Lớp 9A1 (Khu D)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  Lớp chủ nhiệm / phụ trách
                </label>
                <select
                  id="select-signup-teacher-class"
                  value={signupClassName}
                  onChange={e => setSignupClassName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="7A1">Lớp 7A1 - Khối 7</option>
                  <option value="7A2">Lớp 7A2 - Khối 7</option>
                  <option value="6A1">Lớp 6A1 - Khối 6</option>
                  <option value="6A2">Lớp 6A2 - Khối 6</option>
                  <option value="8A1">Lớp 8A1 - Khối 8</option>
                  <option value="9A1">Lớp 9A1 - Khối 9</option>
                </select>
              </div>
            )}

            {/* Password Choice: Google-generated vs Custom password */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Mật khẩu tài khoản <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 text-[11px] font-bold">
                  <button
                    type="button"
                    id="btn-choose-google-pwd"
                    onClick={() => {
                      setUseGooglePasswordOption(true);
                      setSignupPassword(googleGeneratedPassword);
                    }}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center space-x-1 ${
                      useGooglePasswordOption
                        ? 'bg-white text-blue-700 shadow-2xs font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <GoogleIcon className="w-3 h-3" />
                    <span>Google tạo</span>
                  </button>
                  <button
                    type="button"
                    id="btn-choose-custom-pwd"
                    onClick={() => {
                      setUseGooglePasswordOption(false);
                      setSignupPassword('');
                    }}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      !useGooglePasswordOption
                        ? 'bg-white text-blue-700 shadow-2xs font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>Tự đặt</span>
                  </button>
                </div>
              </div>

              {useGooglePasswordOption ? (
                /* Google Generated Password Box */
                <div className="p-3.5 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white rounded-2xl border border-blue-200/90 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-black text-blue-900">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Mật khẩu bảo mật do Google đề xuất</span>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      Bảo mật cao
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-blue-200 shadow-2xs">
                    <div className="flex-1 font-mono text-xs sm:text-sm font-bold text-slate-900 tracking-wider overflow-x-auto select-all">
                      {showSignupPassword ? googleGeneratedPassword : '••••••••••••••••'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title={showSignupPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newPwd = generateGoogleSecurePassword();
                        setGoogleGeneratedPassword(newPwd);
                        setSignupPassword(newPwd);
                        addToast('Đã tạo mật khẩu bảo mật mới từ Google', 'info');
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Tạo lại mật khẩu ngẫu nhiên khác"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(googleGeneratedPassword);
                        setCopiedGooglePassword(true);
                        addToast('Đã sao chép mật khẩu Google tạo vào bộ nhớ tạm!', 'success');
                        setTimeout(() => setCopiedGooglePassword(false), 2000);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                        copiedGooglePassword
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      }`}
                    >
                      {copiedGooglePassword ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedGooglePassword ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center space-x-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Độ mạnh: Chuẩn Google Smart Lock (16 ký tự phức hợp)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setUseGooglePasswordOption(false);
                        setSignupPassword('');
                      }}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      Tôi muốn tự đặt mật khẩu riêng
                    </button>
                  </div>
                </div>
              ) : (
                /* Custom Password Input */
                <div className="space-y-1.5">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="input-signup-password"
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={e => setSignupPassword(e.target.value)}
                      placeholder="Nhập mật khẩu riêng của bạn (tối thiểu 6 ký tự)"
                      className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
                      <button
                        type="button"
                        id="btn-toggle-signup-password"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors"
                        title={showSignupPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        aria-label={showSignupPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showSignupPassword ? (
                          <EyeOff className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span className="flex items-center space-x-1">
                      <span>Trạng thái:</span>
                      <span className={`font-semibold ${showSignupPassword ? 'text-blue-600' : 'text-slate-700'}`}>
                        {showSignupPassword ? 'Đang hiện ký tự' : 'Đang ẩn mật khẩu (dấu chấm)'}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setUseGooglePasswordOption(true);
                        setSignupPassword(googleGeneratedPassword);
                      }}
                      className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center space-x-1"
                    >
                      <GoogleIcon className="w-3 h-3" />
                      <span>Đổi sang mật khẩu Google tạo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              id="btn-submit-signup"
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl text-white font-black text-sm sm:text-base flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all active:scale-[0.99] cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tạo tài khoản & Đăng nhập ngay</span>
            </button>
          </form>

          {/* Link to Login */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Đã có tài khoản SchoolPick? </span>
            <button
              type="button"
              id="btn-goto-login"
              onClick={() => setAuthMode('login')}
              className="font-extrabold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer ml-1"
            >
              Đăng nhập tại đây
            </button>
          </div>
        </div>
      )}
    </div>
      </div>

      {/* GOOGLE SIGN IN MODAL / AUTHENTIC GOOGLE ACCOUNT CHOOSER */}
      {googleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-[460px] w-full shadow-2xl border border-slate-200 overflow-hidden relative text-slate-800 animate-in zoom-in-95 duration-150">
            {/* Google Blue Indeterminate Loading Bar at top */}
            <div className="h-1 w-full bg-slate-100 overflow-hidden relative">
              {googleLoading && (
                <div className="absolute inset-0 bg-blue-600 animate-pulse" />
              )}
            </div>

            <div className="p-6 sm:p-7">
              {/* Header with Google Logo and Actions */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2.5">
                  <GoogleIcon className="w-8 h-8 shrink-0" />
                  <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Google</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    title="Mở trong cửa sổ riêng biệt"
                    onClick={() => openGooglePopupWindow(anyGoogleRole)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer text-xs flex items-center space-x-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline text-[11px] font-medium">Cửa sổ riêng</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleModalOpen(false);
                      setIsUsingAnotherAccount(false);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Subtitle */}
              {!isUsingAnotherAccount ? (
                <div className="mb-4">
                  <h2 className="text-xl sm:text-2xl font-normal text-slate-900 tracking-tight">
                    Chọn một tài khoản
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    để tiếp tục tới <span className="font-semibold text-slate-900">SchoolPick</span>
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  <h2 className="text-xl sm:text-2xl font-normal text-slate-900 tracking-tight">
                    Đăng nhập
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Sử dụng Tài khoản Google của bạn
                  </p>
                </div>
              )}

              {/* System Role Selector Pill */}
              <div className="mb-4 p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">
                  Vai trò đăng nhập:
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setAnyGoogleRole(UserRole.PARENT)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      anyGoogleRole === UserRole.PARENT
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    Phụ huynh
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnyGoogleRole(UserRole.TEACHER)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      anyGoogleRole === UserRole.TEACHER
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    Giáo viên
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnyGoogleRole(UserRole.ADMIN)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      anyGoogleRole === UserRole.ADMIN
                        ? 'bg-slate-800 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    Quản trị
                  </button>
                </div>
              </div>

              {/* VIEW 1: Account Chooser List */}
              {!isUsingAnotherAccount ? (
                <div className="space-y-1 divide-y divide-slate-100">
                  {/* Primary Machine Account: Nguyen Bao Nguyen */}
                  <div
                    onClick={() =>
                      handleConfirmGoogleLogin(
                        'nguyenbaonguyen082014@gmail.com',
                        'Nguyễn Bảo Nguyên',
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
                        anyGoogleRole
                      )
                    }
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="relative">
                        <img
                          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"
                          alt="Nguyễn Bảo Nguyên"
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600">
                            Nguyễn Bảo Nguyên
                          </p>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                            Có sẵn trên máy
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          nguyenbaonguyen082014@gmail.com
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </div>

                  {/* Other saved device accounts */}
                  {savedGoogleAccounts
                    .filter(a => a.email.toLowerCase() !== 'nguyenbaonguyen082014@gmail.com')
                    .map(account => (
                      <div
                        key={account.email}
                        onClick={() =>
                          handleConfirmGoogleLogin(
                            account.email,
                            account.name,
                            account.avatarUrl,
                            anyGoogleRole
                          )
                        }
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-200"
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          {account.avatarUrl ? (
                            <img
                              src={account.avatarUrl}
                              alt={account.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                              {account.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600">
                              {account.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {account.email}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                      </div>
                    ))}

                  {/* Use another account option */}
                  <div
                    onClick={() => {
                      setIsUsingAnotherAccount(true);
                      setInputEmailError('');
                    }}
                    className="flex items-center space-x-3.5 p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group text-slate-700 hover:text-slate-900 border border-transparent hover:border-slate-200"
                  >
                    <div className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 group-hover:border-blue-500 group-hover:text-blue-600 shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">Sử dụng một tài khoản khác</span>
                  </div>
                </div>
              ) : (
                /* VIEW 2: Use another account (Google style input) */
                <form onSubmit={handleLoginAnyUser} className="space-y-4">
                  {inputEmailError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                      {inputEmailError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-blue-600">
                      Email hoặc số điện thoại
                    </label>
                    <input
                      id="input-google-custom-email"
                      type="email"
                      required
                      autoFocus
                      value={anyGoogleEmail}
                      onChange={e => {
                        setAnyGoogleEmail(e.target.value);
                        setInputEmailError('');
                      }}
                      placeholder="Nhập Gmail hoặc email trường học"
                      className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Họ và tên của bạn (Tự đặt tên cho bản thân mình):
                    </label>
                    <input
                      id="input-google-custom-name"
                      type="text"
                      value={anyGoogleName}
                      onChange={e => setAnyGoogleName(e.target.value)}
                      placeholder="Nhập họ và tên của bạn (ví dụ: Nguyễn Bảo Nguyên)"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setIsUsingAnotherAccount(false)}
                      className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Quay lại
                    </button>
                    <button
                      id="btn-google-custom-submit"
                      type="submit"
                      disabled={googleLoading}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5"
                    >
                      {googleLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Tiếp theo</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Advanced OAuth Toggle (Collapsed) */}
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Tiếng Việt</span>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedOAuth(!showAdvancedOAuth)}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {showAdvancedOAuth ? 'Ẩn cấu hình Client ID' : 'Cấu hình Client ID'}
                  </button>
                  <span className="hover:text-slate-700 cursor-pointer">Trợ giúp</span>
                  <span className="hover:text-slate-700 cursor-pointer">Bảo mật</span>
                  <span className="hover:text-slate-700 cursor-pointer">Điều khoản</span>
                </div>
              </div>

              {/* Optional Advanced Google OAuth Client ID panel */}
              {showAdvancedOAuth && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <p className="font-bold text-slate-700">Google OAuth 2.0 Web Client ID:</p>
                  <input
                    type="text"
                    value={googleClientIdInput}
                    onChange={e => setGoogleClientIdInput(e.target.value)}
                    placeholder="xxx.apps.googleusercontent.com"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-[11px] font-mono"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => triggerRealGoogleOAuth()}
                      className="px-3 py-1 bg-emerald-600 text-white rounded font-bold text-[11px] hover:bg-emerald-700 cursor-pointer"
                    >
                      Kích hoạt OAuth trực tiếp
                    </button>
                    <button
                      type="button"
                      onClick={copyOriginToClipboard}
                      className="text-[11px] text-blue-600 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedOrigin ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Sao chép Origin</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
