import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../../../components/ui/toast/ToastProvider';
import styles from './ForgotPassword.module.css';

// ─── SVG Icons ─────────────────────────────────────────────────────────────

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[#99907c]">
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16v12H4V6Zm0 1 8 6 8-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[#99907c]">
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 10V8a5 5 0 0 1 10 0v2m-9 0h8m-10 0h12v10H6V10Z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[#99907c]">
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a4 4 0 1 0-7.8 1.4L2 13.6V18h4.4l1.2-1.2h2.4v-2.4l1.2-1.2H12a4 4 0 0 0 3-6.2Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckSmallIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="m5 13 4 4L19 7" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M19 12H5m6-6-6 6 6 6" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-12 w-12 text-[#4ade80]">
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

const OTP_INITIAL_SECONDS = 300;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { handleForgotPassword, handleVerifyOtp, handleResetPassword, isLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Countdown timer cho OTP
  const [countdown, setCountdown] = useState(OTP_INITIAL_SECONDS);
  const timerRef = useRef(null);

  useEffect(() => {
    if (step === 2) {
      setCountdown(OTP_INITIAL_SECONDS);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ─── STEP 1: GỬI MÃ OTP ────────────────────────────────────────────────────
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setFieldErrors({ email: 'Vui lòng nhập địa chỉ email cá nhân.' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFieldErrors({ email: 'Định dạng email không hợp lệ.' });
      return;
    }

    setFieldErrors({});
    const res = await handleForgotPassword(email.trim());
    if (res.success) {
      toast.success('Mã xác thực OTP đã được gửi đến email của bạn!');
      setStep(2);
    } else {
      toast.error(res.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
    }
  };

  // Gửi lại mã OTP
  const handleResendOtp = async () => {
    if (isLoading) return;
    const res = await handleForgotPassword(email.trim());
    if (res.success) {
      toast.success('Đã gửi lại mã xác thực OTP mới.');
      setCountdown(OTP_INITIAL_SECONDS);
      setOtpCode('');
    } else {
      toast.error(res.message || 'Lỗi khi gửi lại mã OTP.');
    }
  };

  // ─── STEP 2: XÁC THỰC OTP ──────────────────────────────────────────────────
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setFieldErrors({ otp: 'Vui lòng nhập đủ 6 chữ số mã OTP.' });
      return;
    }

    setFieldErrors({});
    const res = await handleVerifyOtp(email.trim(), otpCode.trim());
    if (res.success) {
      toast.success('Xác thực OTP thành công!');
      setStep(3);
    } else {
      toast.error(res.message || 'Mã xác thực không chính xác hoặc đã hết hạn.');
    }
  };

  // ─── STEP 3: ĐẶT MẬT KHẨU MỚI ──────────────────────────────────────────────
  // Đánh giá các tiêu chí mật khẩu
  const passwordRules = [
    { id: 'length', text: 'Ít nhất 6 ký tự', valid: newPassword.length >= 6 },
    { id: 'letter', text: 'Có chữ cái', valid: /[a-zA-Z]/.test(newPassword) },
    { id: 'number', text: 'Có chữ số', valid: /[0-9]/.test(newPassword) },
    { id: 'special', text: 'Có ký tự đặc biệt (@, #, $, ...)', valid: /[^a-zA-Z0-9\s]/.test(newPassword) },
  ];

  const unmetRules = passwordRules.filter((r) => !r.valid);
  const metRulesCount = passwordRules.filter((r) => r.valid).length;

  const getStrengthInfo = () => {
    if (!newPassword) return { label: '', barColor: '', textColor: '' };
    if (metRulesCount <= 1) {
      return { label: 'Yếu', barColor: 'bg-rose-500', textColor: 'text-rose-400' };
    }
    if (metRulesCount === 2 || metRulesCount === 3) {
      return { label: 'Trung bình', barColor: 'bg-amber-400', textColor: 'text-amber-400' };
    }
    return { label: 'Mạnh', barColor: 'bg-emerald-400', textColor: 'text-emerald-400' };
  };

  const strengthInfo = getStrengthInfo();
  const isConfirmTouched = confirmPassword.length > 0;
  const isConfirmMatch = isConfirmTouched && confirmPassword === newPassword;
  const isConfirmMismatch = isConfirmTouched && confirmPassword !== newPassword;

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới.';
    } else if (unmetRules.length > 0) {
      errors.newPassword = 'Mật khẩu chưa đáp ứng đủ các yêu cầu bảo mật.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận lại mật khẩu.';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    const res = await handleResetPassword(
      email.trim(),
      otpCode.trim(),
      newPassword,
      confirmPassword
    );

    if (res.success) {
      toast.success('Đặt lại mật khẩu thành công!');
      setStep(4);
    } else {
      toast.error(res.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <main className="relative min-h-screen w-screen max-w-[100vw] overflow-hidden bg-[#131313] px-4 pb-10 pt-20 text-[#e5e2e1] sm:px-6">
      {/* Background Image & Gradient mờ */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1606821361530-0eb537b8d655?q=80&w=2000&auto=format&fit=crop')` }}
      />
      <div className="fixed inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.7),rgba(12,10,8,0.92))]" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-136px)] w-full max-w-[500px] items-center py-8">
        {/* Áp dụng styles.forgotContainer & styles.goldCardGlow */}
        <div className={`w-full rounded-lg border border-[#d4af37]/20 bg-[#1a1a1a]/85 p-7 shadow-[0_28px_80px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:p-10 ${styles.forgotContainer} ${styles.goldCardGlow}`}>
          
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-black uppercase leading-tight text-[#e5e2e1] tracking-wide sm:text-4xl">
              Khôi phục<br /><span className="text-[#d4af37]">Mật khẩu</span>
            </h1>
            <p className="mt-2 text-sm text-[#d0c5af]">
              {step === 1 && 'Nhập email cá nhân đã đăng ký để nhận mã xác nhận OTP.'}
              {step === 2 && `Mã xác thực 6 số đã được gửi đến hòm thư ${email}.`}
              {step === 3 && 'Tạo mật khẩu mới cho tài khoản của bạn.'}
              {step === 4 && 'Mật khẩu của bạn đã được cập nhật thành công.'}
            </p>
          </div>

          {/* Stepper Progress Bar */}
          {step <= 3 && (
            <div className="mb-8 flex items-center justify-between px-2">
              <div className="flex flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${step >= 1 ? 'bg-[#f2ca50] text-[#241a00]' : 'border border-[#4d4635] text-[#99907c]'}`}>
                  1
                </div>
                <span className="mt-1 text-[11px] font-semibold text-[#d0c5af]">Email</span>
              </div>
              <div className={`h-[2px] flex-1 mx-2 transition ${step >= 2 ? 'bg-[#f2ca50]' : 'bg-[#4d4635]'}`} />
              <div className="flex flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${step >= 2 ? 'bg-[#f2ca50] text-[#241a00]' : 'border border-[#4d4635] text-[#99907c]'}`}>
                  2
                </div>
                <span className="mt-1 text-[11px] font-semibold text-[#d0c5af]">Xác thực OTP</span>
              </div>
              <div className={`h-[2px] flex-1 mx-2 transition ${step >= 3 ? 'bg-[#f2ca50]' : 'bg-[#4d4635]'}`} />
              <div className="flex flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${step >= 3 ? 'bg-[#f2ca50] text-[#241a00]' : 'border border-[#4d4635] text-[#99907c]'}`}>
                  3
                </div>
                <span className="mt-1 text-[11px] font-semibold text-[#d0c5af]">Đổi mật khẩu</span>
              </div>
            </div>
          )}

          {/* ═════════════════ STEP 1: NHẬP EMAIL ═════════════════ */}
          {step === 1 && (
            <form key="step1" className={`space-y-5 ${styles.stepTransition}`} noValidate onSubmit={handleStep1Submit}>
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase text-[#f2ca50]">
                  Email cá nhân
                </label>
                <div className={`flex h-14 items-center gap-3 rounded border bg-[#0e0e0e]/85 px-4 transition ${fieldErrors.email ? 'border-[#ffb4ab]' : 'border-[#4d4635] focus-within:border-[#f2ca50]'}`}>
                  <MailIcon />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({});
                    }}
                    autoComplete="email"
                    disabled={isLoading}
                    className="min-w-0 flex-1 bg-transparent text-base text-[#e5e2e1] outline-none placeholder:text-[#77736b]"
                    placeholder="example@company.com"
                  />
                </div>
                {fieldErrors.email && <p className="mt-2 text-sm font-semibold text-[#ffb4ab]">{fieldErrors.email}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-14 w-full items-center justify-center gap-3 rounded bg-[#f2ca50] text-lg font-black uppercase text-[#241a00] shadow-[0_12px_30px_rgba(0,0,0,0.4)] transition hover:bg-[#ffe088] disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isLoading ? 'Đang gửi mã...' : 'Gửi mã xác thực'}
                {!isLoading && <ArrowRightIcon />}
              </button>
            </form>
          )}

          {/* ═════════════════ STEP 2: NHẬP OTP ═════════════════ */}
          {step === 2 && (
            <form key="step2" className={`space-y-5 ${styles.stepTransition}`} noValidate onSubmit={handleStep2Submit}>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="otpCode" className="text-xs font-bold uppercase text-[#f2ca50]">
                    Mã OTP (6 chữ số)
                  </label>
                  {/* Nhấp nháy cảnh báo khi dưới 60s qua styles.pulseWarning */}
                  <span className={`text-xs font-semibold ${countdown === 0 ? 'text-[#ffb4ab]' : 'text-[#f2ca50]'} ${countdown > 0 && countdown <= 60 ? styles.pulseWarning : ''}`}>
                    {countdown > 0 ? `Hết hạn sau: ${formatCountdown(countdown)}` : 'Mã đã hết hạn'}
                  </span>
                </div>
                <div className={`flex h-14 items-center gap-3 rounded border bg-[#0e0e0e]/85 px-4 transition ${fieldErrors.otp ? 'border-[#ffb4ab]' : 'border-[#4d4635] focus-within:border-[#f2ca50]'}`}>
                  <KeyIcon />
                  <input
                    id="otpCode"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtpCode(val);
                      if (fieldErrors.otp) setFieldErrors({});
                    }}
                    disabled={isLoading}
                    className={`min-w-0 flex-1 bg-transparent text-center text-2xl font-bold tracking-[0.5em] text-[#f2ca50] outline-none placeholder:text-[#77736b] placeholder:tracking-normal placeholder:text-base placeholder:font-normal ${styles.otpInput}`}
                    placeholder="Nhập 6 số OTP"
                  />
                </div>
                {fieldErrors.otp && <p className="mt-2 text-sm font-semibold text-[#ffb4ab]">{fieldErrors.otp}</p>}
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-medium text-[#99907c] hover:text-[#f2ca50] transition"
                >
                  Đổi email khác
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="font-semibold text-[#f2ca50] hover:underline disabled:opacity-50"
                >
                  Gửi lại mã OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || countdown === 0}
                className="flex h-14 w-full items-center justify-center gap-3 rounded bg-[#f2ca50] text-lg font-black uppercase text-[#241a00] shadow-[0_12px_30px_rgba(0,0,0,0.4)] transition hover:bg-[#ffe088] disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isLoading ? 'Đang xác thực...' : 'Tiếp tục'}
                {!isLoading && <ArrowRightIcon />}
              </button>
            </form>
          )}

          {/* ═════════════════ STEP 3: MẬT KHẨU MỚI ═════════════════ */}
          {step === 3 && (
            <form key="step3" className={`space-y-5 ${styles.stepTransition}`} noValidate onSubmit={handleStep3Submit}>
              <div>
                <label htmlFor="newPassword" className="mb-2 block text-xs font-bold uppercase text-[#f2ca50]">
                  Mật khẩu mới
                </label>
                <div className={`flex h-14 items-center gap-3 rounded border bg-[#0e0e0e]/85 px-4 transition ${fieldErrors.newPassword ? 'border-[#ffb4ab]' : 'border-[#4d4635] focus-within:border-[#f2ca50]'}`}>
                  <LockIcon />
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (fieldErrors.newPassword) setFieldErrors((prev) => ({ ...prev, newPassword: '' }));
                    }}
                    disabled={isLoading}
                    className="min-w-0 flex-1 bg-transparent text-base text-[#e5e2e1] outline-none placeholder:text-[#77736b]"
                    placeholder="Nhập mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#99907c] hover:text-[#f2ca50] transition"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {/* Thanh kiểm tra độ mạnh yếu của mật khẩu */}
                {newPassword.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#99907c]">Độ mạnh mật khẩu:</span>
                      <span className={`font-bold ${strengthInfo.textColor}`}>
                        {strengthInfo.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                      <div className={`h-full rounded-full transition-all duration-300 ${metRulesCount >= 1 ? strengthInfo.barColor : 'bg-[#2a2620]'}`} />
                      <div className={`h-full rounded-full transition-all duration-300 ${metRulesCount >= 2 ? strengthInfo.barColor : 'bg-[#2a2620]'}`} />
                      <div className={`h-full rounded-full transition-all duration-300 ${metRulesCount >= 3 ? strengthInfo.barColor : 'bg-[#2a2620]'}`} />
                      <div className={`h-full rounded-full transition-all duration-300 ${metRulesCount >= 4 ? strengthInfo.barColor : 'bg-[#2a2620]'}`} />
                    </div>
                  </div>
                )}

                {/* Danh sách yêu cầu mật khẩu: Tiêu chí nào có rồi thì ẩn đi, chưa có thì vẫn hiện */}
                {unmetRules.length > 0 && (
                  <div className="mt-3 rounded border border-[#4d4635]/60 bg-[#14120e]/90 p-3 text-xs">
                    <p className="font-semibold text-[#d0c5af] mb-1.5">Mật khẩu cần bổ sung:</p>
                    <ul className="space-y-1 text-[#99907c]">
                      {unmetRules.map((rule) => (
                        <li key={rule.id} className="flex items-center gap-2 text-[#e5e2e1]/85">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#f2ca50]" />
                          <span>{rule.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {fieldErrors.newPassword && <p className="mt-2 text-sm font-semibold text-[#ffb4ab]">{fieldErrors.newPassword}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-xs font-bold uppercase text-[#f2ca50]">
                  Xác nhận mật khẩu mới
                </label>
                <div
                  className={`flex h-14 items-center gap-3 rounded border bg-[#0e0e0e]/85 px-4 transition ${
                    isConfirmMismatch
                      ? 'border-[#ffb4ab] focus-within:border-[#ffb4ab]'
                      : isConfirmMatch
                      ? 'border-[#4ade80] focus-within:border-[#4ade80]'
                      : fieldErrors.confirmPassword
                      ? 'border-[#ffb4ab]'
                      : 'border-[#4d4635] focus-within:border-[#f2ca50]'
                  }`}
                >
                  <LockIcon />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }}
                    disabled={isLoading}
                    className="min-w-0 flex-1 bg-transparent text-base text-[#e5e2e1] outline-none placeholder:text-[#77736b]"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  {isConfirmMatch && (
                    <span className="text-[#4ade80]" title="Mật khẩu khớp">
                      <CheckSmallIcon />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[#99907c] hover:text-[#f2ca50] transition"
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {/* Kiểm tra trực tiếp liên tục: Báo lỗi không trùng khớp ngay khi gõ sai, ẩn đi khi trùng khớp */}
                {isConfirmMismatch && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#ffb4ab]">
                    <AlertCircleIcon />
                    <span>Mật khẩu xác nhận không trùng khớp.</span>
                  </p>
                )}

                {fieldErrors.confirmPassword && !isConfirmMismatch && (
                  <p className="mt-2 text-sm font-semibold text-[#ffb4ab]">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-14 w-full items-center justify-center gap-3 rounded bg-[#f2ca50] text-lg font-black uppercase text-[#241a00] shadow-[0_12px_30px_rgba(0,0,0,0.4)] transition hover:bg-[#ffe088] disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isLoading ? 'Đang cập nhật...' : 'Xác nhận đặt lại mật khẩu'}
                {!isLoading && <ArrowRightIcon />}
              </button>
            </form>
          )}

          {/* ═════════════════ STEP 4: HOÀN TẤT ═════════════════ */}
          {step === 4 && (
            <div key="step4" className={`py-6 text-center space-y-6 ${styles.stepTransition}`}>
              <div className="flex justify-center">
                <div className="rounded-full bg-[#4ade80]/10 p-4 border border-[#4ade80]/30">
                  <CheckCircleIcon />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#e5e2e1]">Khôi phục thành công!</h2>
                <p className="mt-2 text-sm text-[#d0c5af]">
                  Mật khẩu tài khoản của bạn đã được cập nhật thành công. Hãy dùng mật khẩu mới để đăng nhập.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex h-14 w-full items-center justify-center gap-3 rounded bg-[#f2ca50] text-lg font-black uppercase text-[#241a00] shadow-[0_12px_30px_rgba(0,0,0,0.4)] transition hover:bg-[#ffe088]"
              >
                Đăng nhập ngay
                <ArrowRightIcon />
              </button>
            </div>
          )}

          {/* Nút quay lại Login */}
          {step !== 4 && (
            <div className="mt-8 text-center border-t border-[#4d4635]/60 pt-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#99907c] transition hover:text-[#f2ca50]"
              >
                <ArrowLeftIcon />
                <span>Quay lại trang Đăng nhập</span>
              </Link>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}