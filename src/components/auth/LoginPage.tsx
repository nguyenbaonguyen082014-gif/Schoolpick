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
import { validateRealEmail, validateRealPhoneNumber } from '../../utils/validators';

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
    clearAllAccounts,
    users,
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

  // Password choice for signup - Google strong password modal window (shows once automatically)
  const [useGooglePasswordOption, setUseGooglePasswordOption] = useState<boolean>(false);
  const [googlePasswordModalOpen, setGooglePasswordModalOpen] = useState<boolean>(false);
  const [hasShownGooglePasswordPrompt, setHasShownGooglePasswordPrompt] = useState<boolean>(false);
  const [googleGeneratedPassword, setGoogleGeneratedPassword] = useState<string>(() => generateGoogleSecurePassword());
  const [copiedGooglePassword, setCopiedGooglePassword] = useState<boolean>(false);
  const [showSignupPassword, setShowSignupPassword] = useState<boolean>(false);

  const closeGooglePasswordModal = () => {
    setHasShownGooglePasswordPrompt(true);
    setGooglePasswordModalOpen(false);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrorMessage('');

    if (!signupName.trim()) {
      setSignupErrorMessage('Vui lòng nhập họ và tên của bạn.');
      return;
    }

    // 1. Strict validation: Real email address (FPT, Edu.vn, Gmail, Yahoo, Outlook, etc.)
    const emailRes = validateRealEmail(signupEmail);
    if (!emailRes.isValid) {
      setSignupErrorMessage(emailRes.reason || 'Email không tồn tại.');
      return;
    }

    // Check if account already exists with this Email
    const existing = checkUserExists(emailRes.cleanEmail || signupEmail);
    if (existing) {
      setSignupErrorMessage(
        `Tài khoản Email "${emailRes.cleanEmail || signupEmail}" đã được đăng ký bởi ${existing.name}. Bạn có muốn chuyển sang Đăng nhập không?`
      );
      return;
    }

    // 2. Strict validation: Real Vietnamese mobile phone number is required
    const phoneRes = validateRealPhoneNumber(signupPhone);
    if (!phoneRes.isValid) {
      setSignupErrorMessage(
        phoneRes.reason || 'Số điện thoại không tồn tại hoặc không hợp lệ. Vui lòng nhập số điện thoại thật của bạn.'
      );
      return;
    }

    // 3. Parent must provide student name
    if (signupRole === UserRole.PARENT && !signupStudentName.trim()) {
      setSignupErrorMessage('Vui lòng nhập họ tên của học sinh (con bạn).');
      return;
    }

    const finalPassword = useGooglePasswordOption ? googleGeneratedPassword : signupPassword;
    if (!useGooglePasswordOption && (!finalPassword.trim() || finalPassword.trim().length < 6)) {
      setSignupErrorMessage('Vui lòng nhập mật khẩu tối thiểu 6 ký tự hoặc chọn dùng mật khẩu bảo mật do Google tạo.');
      return;
    }

    const regResult = registerUser({
      name: signupName.trim(),
      email: emailRes.cleanEmail || signupEmail.trim(),
      role: signupRole,
      phone: phoneRes.formattedPhone || signupPhone.trim(),
      studentName: signupRole === UserRole.PARENT ? signupStudentName.trim() : undefined,
      className: signupClassName.trim() || '7A1',
      password: finalPassword.trim() || undefined,
    });

    if (!regResult.success) {
      setSignupErrorMessage(regResult.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
      return;
    }
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
              const loginRes = loginWithGoogle({
                name: profile.name || profile.email.split('@')[0],
                email: profile.email,
                avatarUrl: profile.picture,
                role: anyGoogleRole || selectedRole,
              });
              if (!loginRes.success) {
                if (loginRes.reason === 'NOT_FOUND') {
                  setErrorMessage(`Tài khoản Google (${profile.email}) chưa được đăng ký trên hệ thống SchoolPick. Vui lòng đăng ký tài khoản trước.`);
                  setAccountNotFoundEmail(profile.email);
                  setSignupEmail(profile.email);
                  if (profile.name) setSignupName(profile.name);
                  if (anyGoogleRole || selectedRole) setSignupRole(anyGoogleRole || selectedRole);
                } else if (loginRes.reason === 'INVALID_EMAIL') {
                  setErrorMessage(loginRes.message || `Email ${profile.email} không tồn tại hoặc không hợp lệ.`);
                } else {
                  setErrorMessage(loginRes.message || 'Không thể đăng nhập Google.');
                }
              }
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
        const loginRes = loginWithGoogle({
          name,
          email,
          avatarUrl,
          role: role || selectedRole,
        });
        if (!loginRes.success) {
          if (loginRes.reason === 'NOT_FOUND') {
            setErrorMessage(`Tài khoản Google (${email}) chưa được đăng ký trên hệ thống SchoolPick. Vui lòng đăng ký tài khoản trước.`);
            setAccountNotFoundEmail(email);
            setSignupEmail(email);
            if (name) setSignupName(name);
            if (role) setSignupRole(role);
          } else if (loginRes.reason === 'INVALID_EMAIL') {
            setErrorMessage(loginRes.message || `Email ${email} không tồn tại hoặc không hợp lệ.`);
          } else {
            setErrorMessage(loginRes.message || 'Không thể đăng nhập Google.');
          }
        }
        setGoogleModalOpen(false);
        setPopupBlocked(false);
      } else if (event.data?.type === 'GOOGLE_SIGNUP_PREFILL' && event.data?.user) {
        const { name, email, role } = event.data.user;
        setAuthMode('signup');
        setSignupEmail(email);
        if (name) setSignupName(name);
        if (role) setSignupRole(role);
        setErrorMessage('');
        setAccountNotFoundEmail(null);
        setGoogleModalOpen(false);
        setPopupBlocked(false);
        addToast(`Đã nhận thông tin từ Google: ${email}. Vui lòng nhập số điện thoại để hoàn tất đăng ký!`, 'info');
      }
    };

    const checkDirectAuth = () => {
      try {
        const stored = localStorage.getItem('schoolpick_direct_google_auth');
        if (stored) {
          localStorage.removeItem('schoolpick_direct_google_auth');
          const user = JSON.parse(stored);
          const loginRes = loginWithGoogle({
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            role: user.role || selectedRole,
          });
          if (!loginRes.success) {
            if (loginRes.reason === 'NOT_FOUND') {
              setErrorMessage(`Tài khoản Google (${user.email}) chưa được đăng ký trên hệ thống SchoolPick. Vui lòng đăng ký tài khoản trước.`);
              setAccountNotFoundEmail(user.email);
              setSignupEmail(user.email);
              if (user.name) setSignupName(user.name);
              if (user.role) setSignupRole(user.role);
            } else if (loginRes.reason === 'INVALID_EMAIL') {
              setErrorMessage(loginRes.message || `Email ${user.email} không tồn tại hoặc không hợp lệ.`);
            } else {
              setErrorMessage(loginRes.message || 'Lỗi đăng nhập Google.');
            }
          }
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
    const cleanEmail = targetEmail.trim().toLowerCase();

    // 1. Kiểm tra xem mail có tồn tại / hợp lệ không
    const emailRes = validateRealEmail(cleanEmail);
    if (!emailRes.isValid) {
      const msg = emailRes.reason || 'Email không tồn tại hoặc không hợp lệ.';
      setErrorMessage(msg);
      setInputEmailError(msg);
      addToast(msg, 'error');
      return;
    }

    // 2. Kiểm tra xem mail đó đã có tài khoản trên hệ thống chưa
    const existing = checkUserExists(cleanEmail);
    if (!existing) {
      const notFoundMsg = `Tài khoản Google (${cleanEmail}) chưa được đăng ký trên hệ thống SchoolPick. Vui lòng đăng ký tài khoản trước.`;
      setErrorMessage(notFoundMsg);
      setAccountNotFoundEmail(cleanEmail);
      setSignupEmail(cleanEmail);
      if (targetName) setSignupName(targetName);
      setSignupRole(effectiveRole);
      setGoogleModalOpen(false);
      return;
    }

    // 3. Sau khi xác nhận đã có tài khoản -> Cho phép vào tài khoản của mình!
    setGoogleLoading(true);
    const effectiveAvatar =
      avatar ||
      existing.avatarUrl ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        existing.name || targetName
      )}&backgroundColor=0284c7&textColor=ffffff`;

    setTimeout(() => {
      setGoogleLoading(false);
      setGoogleModalOpen(false);

      // Save to device's recent Google accounts list
      try {
        const updated = [
          {
            name: existing.name || targetName,
            email: cleanEmail,
            avatarUrl: effectiveAvatar,
            role: effectiveRole,
            lastLogin: Date.now(),
          },
          ...savedGoogleAccounts.filter(a => a.email.toLowerCase() !== cleanEmail),
        ].slice(0, 8);
        setSavedGoogleAccounts(updated);
        localStorage.setItem('schoolpick_saved_google_accounts', JSON.stringify(updated));
      } catch {}

      const loginRes = loginWithGoogle({
        name: existing.name || targetName,
        email: cleanEmail,
        avatarUrl: effectiveAvatar,
        role: effectiveRole,
      });

      if (!loginRes.success) {
        setErrorMessage(loginRes.message || 'Không thể đăng nhập Google.');
      }
    }, 280);
  };

  const handleLoginAnyUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = anyGoogleEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setInputEmailError('Vui lòng nhập địa chỉ Gmail hoặc email Google của bạn.');
      return;
    }

    // 1. Kiểm tra xem email có tồn tại / hợp lệ hay không
    const emailRes = validateRealEmail(cleanEmail);
    if (!emailRes.isValid) {
      setInputEmailError(emailRes.reason || 'Email không tồn tại hoặc không hợp lệ.');
      return;
    }

    // 2. Xem thử email đó đã có tài khoản chưa
    const existing = checkUserExists(cleanEmail);
    if (!existing) {
      setInputEmailError(`Email "${cleanEmail}" chưa có tài khoản trên hệ thống SchoolPick. Vui lòng tạo tài khoản mới trước khi đăng nhập.`);
      setErrorMessage(`Tài khoản Google (${cleanEmail}) chưa được đăng ký trên hệ thống. Vui lòng tạo tài khoản mới trước khi đăng nhập.`);
      setAccountNotFoundEmail(cleanEmail);
      setSignupEmail(cleanEmail);
      let cleanName = anyGoogleName.trim();
      if (!cleanName) {
        const part = cleanEmail.split('@')[0];
        cleanName = part
          .split(/[._-]/)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }
      setSignupName(cleanName);
      setSignupRole(anyGoogleRole || selectedRole);
      return;
    }

    setInputEmailError('');
    let cleanName = anyGoogleName.trim() || existing.name;
    if (!cleanName) {
      const part = cleanEmail.split('@')[0];
      cleanName = part
        .split(/[._-]/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    const avatar = existing.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
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
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center py-2.5 px-3 sm:px-6 bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100">
      {/* Top Navigation Bar: Back to Home */}
      <div className="w-full max-w-4xl mb-2 flex items-center justify-between">
        <button
          type="button"
          id="btn-login-back-home"
          onClick={goToHome}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 font-bold text-xs shadow-2xs transition-all cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
          <span>Quay lại màn hình chính</span>
        </button>

        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
          {authMode === 'login' ? 'Chế độ Đăng nhập' : 'Chế độ Đăng ký mới'}
        </span>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left Side: Brand Value Prop & Features */}
        <div className="lg:col-span-5 space-y-3 text-left hidden lg:block">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>Đón học sinh thông minh</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              School<span className="text-blue-600">Pick</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-bold text-slate-700">
              Đón con thông minh – Giảm ùn tắc – An toàn hơn
            </p>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-3">
              Kết nối tức thời phụ huynh và giáo viên. Báo đến trước, phân làn đón khoa học và chuông thông báo điều phối lớp học tức thì.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs text-slate-700 font-semibold">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Thao tác 1 chạm cho phụ huynh</span>
            </div>

            <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs text-slate-700 font-semibold">
              <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Màn hình điều phối lớp học tức thì</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Box (Login & Sign Up) */}
        <div id="auth-card-top" className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-5 shadow-xl border border-slate-200 scroll-mt-24">
          {/* Top Mode Switcher Tabs: Login vs Sign Up */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
            <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
              <button
                type="button"
                id="tab-auth-login"
                onClick={() => setAuthMode('login')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                  authMode === 'login'
                    ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3 h-3" />
                <span>Đăng nhập</span>
              </button>
              <button
                type="button"
                id="tab-auth-signup"
                onClick={() => setAuthMode('signup')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                  authMode === 'signup'
                    ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3 h-3" />
                <span>Đăng ký mới</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  clearAllAccounts();
                  setSignupName('');
                  setSignupEmail('');
                  setSignupPhone('');
                  setSignupPassword('');
                  setSignupStudentName('');
                  setEmail('');
                  setPassword('');
                }}
                className="text-[11px] text-slate-500 hover:text-rose-600 font-semibold flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Xóa tất cả tài khoản hiện tại để tạo mới"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600" />
                <span>Xóa tất cả tài khoản</span>
              </button>
            </div>
          </div>

          {authMode === 'login' ? (
            <div>
              {/* Role Selection & Admin Option */}
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-xs font-black text-slate-900">Chọn vai trò của bạn:</h2>
                <button
                  type="button"
                  id="role-select-admin"
                  onClick={() => handleRoleSelect(UserRole.ADMIN)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
                    selectedRole === UserRole.ADMIN
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Quản trị viên (BGH)</span>
                </button>
              </div>

              {/* Two Compact Role Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-2.5">
                {/* Parent Card */}
                <button
                  type="button"
                  id="role-select-parent"
                  onClick={() => handleRoleSelect(UserRole.PARENT)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center space-x-2.5 ${
                    selectedRole === UserRole.PARENT
                      ? 'border-blue-600 bg-blue-50/70 font-bold ring-1 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-slate-900 leading-none">👨‍👩‍👧 Phụ huynh</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">Quản lý đón con</p>
                  </div>
                </button>

                {/* Teacher Card */}
                <button
                  type="button"
                  id="role-select-teacher"
                  onClick={() => handleRoleSelect(UserRole.TEACHER)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center space-x-2.5 ${
                    selectedRole === UserRole.TEACHER
                      ? 'border-emerald-600 bg-emerald-50/70 font-bold ring-1 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-slate-900 leading-none">👩‍🏫 Giáo viên</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">Điều phối học sinh</p>
                  </div>
                </button>
              </div>

              {/* Error & Account Not Found Banner */}
              {errorMessage && (
                <div
                  className={`mb-2.5 p-2.5 rounded-xl border text-xs font-medium space-y-1.5 animate-in fade-in slide-in-from-top-1 ${
                    accountNotFoundEmail
                      ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-2xs'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <ShieldAlert
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        accountNotFoundEmail ? 'text-amber-600' : 'text-red-600'
                      }`}
                    />
                    <div className="flex-1 text-[11px] font-semibold leading-snug">{errorMessage}</div>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('');
                        setAccountNotFoundEmail(null);
                      }}
                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {accountNotFoundEmail && (
                    <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-amber-800 truncate">
                        Chưa có tài khoản <b>{accountNotFoundEmail}</b>
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
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] shadow-xs cursor-pointer inline-flex items-center space-x-1 shrink-0"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Tạo tài khoản ngay</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Primary Google Sign-In Button */}
              <div className="mb-2.5">
                <button
                  type="button"
                  id="btn-login-google"
                  onClick={handleGoogleClick}
                  disabled={googleLoading}
                  className="w-full py-2 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-xs transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70 group"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : (
                    <GoogleIcon className="w-4 h-4" />
                  )}
                  <span className="flex items-center space-x-1.5">
                    <span>
                      {googleLoading
                        ? 'Đang kết nối Google...'
                        : `Đăng nhập Google (${
                            selectedRole === UserRole.PARENT
                              ? 'Phụ huynh'
                              : selectedRole === UserRole.TEACHER
                              ? 'Giáo viên'
                              : 'Ban giám hiệu'
                          })`}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Hoặc đăng nhập bằng Email & Mật khẩu
                  </span>
                </div>
              </div>

              {/* Email and Password Login Form */}
              <form onSubmit={handleSubmit} className="space-y-2.5">

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="input-login-email" className="block text-[11px] font-bold text-slate-700">
                      Địa chỉ Email <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
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
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    />
                  </div>

                  {/* Real-time Email Existence Feedback */}
                  {(() => {
                    const clean = email.trim().toLowerCase();
                    if (!clean) return null;
                    const found = checkUserExists(clean);
                    if (found) {
                      return (
                        <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg animate-in fade-in duration-150">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">
                            Tài khoản tồn tại: <b>{found.name}</b> ({found.role === UserRole.PARENT ? 'Phụ huynh' : found.role === UserRole.TEACHER ? 'Giáo viên' : 'Quản trị viên'})
                          </span>
                        </div>
                      );
                    } else if (clean.includes('@') && clean.includes('.')) {
                      return (
                        <div className="flex items-center justify-between text-[11px] text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg animate-in fade-in duration-150">
                          <div className="flex items-center space-x-1.5 truncate mr-2">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate">Chưa có tài khoản này trên hệ thống.</span>
                          </div>
                          <button
                            type="button"
                            id="btn-inline-quick-signup"
                            onClick={() => {
                              setSignupEmail(clean);
                              setSignupRole(selectedRole);
                              setAuthMode('signup');
                            }}
                            className="font-black text-blue-600 hover:underline cursor-pointer text-[11px] shrink-0"
                          >
                            Tạo tài khoản mới &rarr;
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="input-login-password" className="block text-[11px] font-bold text-slate-700">
                      Mật khẩu <span className="text-slate-400 font-normal text-[10px]">(hoặc để trống nếu đăng nhập qua Email)</span>
                    </label>
                    <button
                      type="button"
                      id="btn-forgot-password"
                      onClick={() => setForgotModalOpen(true)}
                      className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="input-login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu (hoặc để trống)"
                      className="w-full pl-9 pr-9 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      id="btn-toggle-login-password"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center space-x-1.5 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="text-[11px]">Ghi nhớ đăng nhập</span>
                  </label>
                </div>

                <button
                  type="submit"
                  id="btn-submit-login"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm shadow-sm transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-3.5 h-3.5" />
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
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-center text-xs text-slate-500">
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
              {/* Sign up Header */}
              <div className="mb-2">
                <div className="p-2 bg-emerald-50/90 border border-emerald-200/80 rounded-xl flex items-center space-x-2 text-[11px] text-emerald-800">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Hệ thống đã sẵn sàng. Hãy điền thông tin bên dưới để tạo tài khoản mới!</span>
                </div>
              </div>

              {/* Fast Google Registration */}
              <div className="mb-2">
                <button
                  type="button"
                  id="btn-signup-google"
                  onClick={() => {
                    setSelectedRole(signupRole);
                    handleGoogleClick();
                  }}
                  disabled={googleLoading}
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2 shadow-2xs transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70 group"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : (
                    <GoogleIcon className="w-4 h-4" />
                  )}
                  <span>Đăng ký nhanh bằng tài khoản Google</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex py-1 items-center mb-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="shrink-0 mx-2 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                  Hoặc điền thông tin đăng ký
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Role Selection for Sign Up */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  id="signup-role-parent"
                  onClick={() => setSignupRole(UserRole.PARENT)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center space-x-2 ${
                    signupRole === UserRole.PARENT
                      ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-none">👨‍👩‍👧 Phụ huynh</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Đăng ký đón con</p>
                  </div>
                </button>

                <button
                  type="button"
                  id="signup-role-teacher"
                  onClick={() => setSignupRole(UserRole.TEACHER)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center space-x-2 ${
                    signupRole === UserRole.TEACHER
                      ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-none">👩‍🏫 Giáo viên</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Quản lý lớp học</p>
                  </div>
                </button>
              </div>

              {/* Sign Up Form with 2-Column Compact Grid */}
              <form onSubmit={handleSignupSubmit} className="space-y-2">
                {signupErrorMessage && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-start space-x-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-[11px]">
                      <p className="font-bold text-rose-900">{signupErrorMessage}</p>
                      {signupErrorMessage.includes('đăng ký') && (
                        <button
                          type="button"
                          onClick={() => {
                            setEmail(signupEmail.trim().toLowerCase());
                            setSelectedRole(signupRole);
                            setAuthMode('login');
                          }}
                          className="mt-1 inline-flex items-center space-x-1 px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded text-[10px] transition-colors cursor-pointer"
                        >
                          <LogIn className="w-3 h-3" />
                          <span>Chuyển sang trang Đăng nhập ngay</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 2-Column Row 1: Full Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="input-signup-name"
                        type="text"
                        required
                        value={signupName}
                        onChange={e => {
                          setSignupName(e.target.value);
                          if (signupErrorMessage) setSignupErrorMessage('');
                        }}
                        placeholder="VD: Nguyễn Bảo Nguyên"
                        className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Real Email Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Địa chỉ Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="input-signup-email"
                        type="email"
                        required
                        value={signupEmail}
                        onChange={e => {
                          setSignupEmail(e.target.value);
                          if (signupErrorMessage) setSignupErrorMessage('');
                        }}
                        placeholder="VD: user@fpt.edu.vn, gmail..."
                        className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Real-Time Validation Feedback & Domain pills */}
                {(() => {
                  const clean = signupEmail.trim().toLowerCase();
                  if (signupEmail.trim() && !signupEmail.includes('@')) {
                    return (
                      <div className="flex flex-wrap items-center gap-1 animate-in fade-in duration-150">
                        <span className="text-[10px] text-slate-400 font-medium">Gợi ý:</span>
                        {['@fpt.edu.vn', '@gmail.com', '@edu.vn', '@yahoo.com', '@outlook.com'].map(suffix => (
                          <button
                            key={suffix}
                            type="button"
                            onClick={() => {
                              setSignupEmail(prev => prev.trim() + suffix);
                              if (signupErrorMessage) setSignupErrorMessage('');
                            }}
                            className="px-1.5 py-0.2 rounded text-[10px] font-mono transition-colors cursor-pointer border bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 border-slate-200"
                          >
                            {suffix}
                          </button>
                        ))}
                      </div>
                    );
                  }
                  if (!clean) return null;
                  const validation = validateRealEmail(clean);
                  const exists = checkUserExists(validation.cleanEmail || clean);

                  if (exists) {
                    return (
                      <div className="p-1.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] flex items-center justify-between text-amber-900 animate-in fade-in duration-150">
                        <div className="flex items-center space-x-1.5 truncate mr-2">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">Email đã có tài khoản ({exists.name})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail(validation.cleanEmail || clean);
                            setSelectedRole(exists.role);
                            setAuthMode('login');
                          }}
                          className="font-bold text-blue-600 hover:underline cursor-pointer text-[11px] shrink-0"
                        >
                          Đăng nhập &rarr;
                        </button>
                      </div>
                    );
                  }

                  if (validation.isValid) {
                    return (
                      <div className="p-1 px-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] flex items-center space-x-1 text-emerald-800 font-semibold animate-in fade-in duration-150">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">✓ Email hợp lệ: <b>{validation.cleanEmail}</b></span>
                      </div>
                    );
                  } else {
                    return (
                      <div className="p-1 px-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] flex items-center space-x-1 text-rose-800 animate-in fade-in duration-150">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="font-semibold text-rose-700">{validation.reason || 'Email không tồn tại.'}</span>
                      </div>
                    );
                  }
                })()}

                {/* 2-Column Row 2: Phone & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Phone Input */}
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[9px] text-slate-400 font-medium">10 số di động</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="input-signup-phone"
                        type="tel"
                        required
                        value={signupPhone}
                        onChange={e => {
                          setSignupPhone(e.target.value);
                          if (signupErrorMessage) setSignupErrorMessage('');
                        }}
                        placeholder="VD: 0912 345 678"
                        className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Mật khẩu <span className="text-red-500">*</span>
                      </label>
                      {useGooglePasswordOption ? (
                        <span className="text-[9px] text-blue-700 font-semibold bg-blue-50 border border-blue-200/60 px-1 py-0.2 rounded flex items-center space-x-0.5">
                          <GoogleIcon className="w-2.5 h-2.5" />
                          <span>Google</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setGooglePasswordModalOpen(true)}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 hover:underline cursor-pointer"
                        >
                          <GoogleIcon className="w-2.5 h-2.5" />
                          <span>Gợi ý Google</span>
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="input-signup-password"
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        value={signupPassword}
                        onFocus={() => {
                          if (!hasShownGooglePasswordPrompt && !signupPassword && !useGooglePasswordOption) {
                            setHasShownGooglePasswordPrompt(true);
                            setGooglePasswordModalOpen(true);
                          }
                        }}
                        onClick={() => {
                          if (!hasShownGooglePasswordPrompt && !signupPassword && !useGooglePasswordOption) {
                            setHasShownGooglePasswordPrompt(true);
                            setGooglePasswordModalOpen(true);
                          }
                        }}
                        onChange={e => {
                          setSignupPassword(e.target.value);
                          if (useGooglePasswordOption) {
                            setUseGooglePasswordOption(false);
                          }
                        }}
                        placeholder="Nhập mật khẩu..."
                        className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                      />
                      <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center">
                        <button
                          type="button"
                          id="btn-toggle-signup-password"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                          title={showSignupPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showSignupPassword ? (
                            <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google password active banner (compact) */}
                {useGooglePasswordOption && (
                  <div className="p-1 px-2 bg-blue-50 border border-blue-200 rounded-lg text-[11px] flex items-center justify-between text-blue-900 animate-in fade-in duration-150">
                    <div className="flex items-center space-x-1 truncate mr-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate font-semibold text-[10px]">Đang dùng mật khẩu bảo mật Google</span>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(signupPassword);
                          setCopiedGooglePassword(true);
                          addToast('Đã sao chép mật khẩu vào bộ nhớ tạm!', 'success');
                          setTimeout(() => setCopiedGooglePassword(false), 2000);
                        }}
                        className="text-[10px] text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
                      >
                        {copiedGooglePassword ? '✓ Đã chép' : 'Sao chép'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setGooglePasswordModalOpen(true)}
                        className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
                      >
                        Đổi
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUseGooglePasswordOption(false);
                          setSignupPassword('');
                        }}
                        className="text-[10px] text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        Tự đặt
                      </button>
                    </div>
                  </div>
                )}

                {/* Role Specific Fields */}
                {signupRole === UserRole.PARENT ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-blue-50/60 rounded-xl border border-blue-100">
                    <div>
                      <label className="block text-[11px] font-bold text-blue-900 mb-0.5">
                        Họ tên con (Học sinh) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="input-signup-student-name"
                        type="text"
                        required
                        value={signupStudentName}
                        onChange={e => setSignupStudentName(e.target.value)}
                        placeholder="VD: Nguyễn Tuấn Kiệt"
                        className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-blue-900 mb-0.5">
                        Lớp của học sinh
                      </label>
                      <select
                        id="select-signup-class"
                        value={signupClassName}
                        onChange={e => setSignupClassName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
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
                  <div className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <label className="block text-[11px] font-bold text-emerald-900 mb-0.5">
                      Lớp chủ nhiệm / phụ trách
                    </label>
                    <select
                      id="select-signup-teacher-class"
                      value={signupClassName}
                      onChange={e => setSignupClassName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
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

                {/* Submit button */}
                <button
                  id="btn-submit-signup"
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all active:scale-[0.99] cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Tạo tài khoản & Đăng nhập ngay</span>
                </button>
              </form>

              {/* Link to Login */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
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
                  {(() => {
                    const primaryEmail = 'nguyenbaonguyen082014@gmail.com';
                    const isRegistered = Boolean(checkUserExists(primaryEmail));
                    return (
                      <div
                        onClick={() =>
                          handleConfirmGoogleLogin(
                            primaryEmail,
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
                              {isRegistered ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center space-x-0.5">
                                  <Check className="w-2.5 h-2.5" />
                                  <span>Đã có tài khoản</span>
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                  Chưa đăng ký
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate">
                              {primaryEmail}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                      </div>
                    );
                  })()}

                  {/* Other saved device accounts */}
                  {savedGoogleAccounts
                    .filter(a => a.email.toLowerCase() !== 'nguyenbaonguyen082014@gmail.com')
                    .map(account => {
                      const isRegistered = Boolean(checkUserExists(account.email));
                      return (
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
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600">
                                  {account.name}
                                </p>
                                {isRegistered ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center space-x-0.5">
                                    <Check className="w-2.5 h-2.5" />
                                    <span>Đã có tài khoản</span>
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                    Chưa đăng ký
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 truncate">
                                {account.email}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                        </div>
                      );
                    })}

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

      {/* Google Strong Password Modal Window */}
      {googlePasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={closeGooglePasswordModal}
        >
          <div
            id="google-password-modal-window"
            className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-2xs shrink-0">
                  <GoogleIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    Đề xuất mật khẩu mạnh từ Google
                  </h3>
                  <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Trình quản lý mật khẩu Google</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeGooglePasswordModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                title="Đóng cửa sổ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed">
              Google tự động đề xuất một mật khẩu bảo mật cao (16 ký tự gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt) để bảo vệ an toàn cho tài khoản của bạn.
            </p>

            {/* Password Preview Box */}
            <div className="p-3.5 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-slate-50 rounded-xl border border-blue-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">
                  Mật khẩu được tạo
                </span>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Bảo mật cao
                </span>
              </div>

              <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-lg border border-blue-200/90 shadow-2xs">
                <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 tracking-wider select-all overflow-x-auto">
                  {showSignupPassword ? googleGeneratedPassword : '••••••••••••••••'}
                </span>
                <div className="flex items-center space-x-1 ml-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                    title={showSignupPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showSignupPassword ? (
                      <EyeOff className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newPwd = generateGoogleSecurePassword();
                      setGoogleGeneratedPassword(newPwd);
                      addToast('Đã tạo mật khẩu ngẫu nhiên mới!', 'info');
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                    title="Tạo lại mật khẩu khác"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(googleGeneratedPassword);
                      setCopiedGooglePassword(true);
                      addToast('Đã sao chép mật khẩu vào bộ nhớ tạm!', 'success');
                      setTimeout(() => setCopiedGooglePassword(false), 2000);
                    }}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 cursor-pointer transition-colors"
                    title="Sao chép mật khẩu"
                  >
                    {copiedGooglePassword ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-[10px] text-slate-500 pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Đạt chuẩn Google Smart Lock (16 ký tự phức hợp)</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={closeGooglePasswordModal}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
              >
                Tôi tự đặt mật khẩu
              </button>
              <button
                type="button"
                id="btn-confirm-use-google-password"
                onClick={() => {
                  setSignupPassword(googleGeneratedPassword);
                  setUseGooglePasswordOption(true);
                  closeGooglePasswordModal();
                  addToast('Đã áp dụng mật khẩu mạnh từ Google!', 'success');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm"
              >
                <GoogleIcon className="w-3.5 h-3.5" />
                <span>Sử dụng mật khẩu này</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
