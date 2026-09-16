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

  // ─── Shared inline styles ──────────────────────────────────────────────
  const inputWrap = (hasError) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    height: 44,
    padding: '0 13px',
    borderRadius: 10,
    border: `1.5px solid ${hasError ? '#EF4444' : '#E5E7EB'}`,
    background: hasError ? '#FEF2F2' : '#F9FAFB',
    transition: 'border-color .15s, box-shadow .15s',
  });

  const submitBtn = (disabled) => ({
    width: '100%',
    height: 44,
    borderRadius: 10,
    background: disabled ? '#818CF8' : 'linear-gradient(135deg, #4F46E5, #6366F1)',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: 14,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: disabled ? 'none' : '0 2px 8px rgba(79,70,229,0.3)',
    transition: 'opacity .15s',
    letterSpacing: 0.1,
    fontFamily: 'inherit',
  });

  const stepDot = (active) => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    background: active ? '#4F46E5' : '#F0F2F7',
    color: active ? '#ffffff' : '#9CA3AF',
    border: active ? '2px solid #4F46E5' : '2px solid #E5E7EB',
    flexShrink: 0,
    transition: 'all .2s',
  });

  const strengthColor = metRulesCount <= 1 ? '#EF4444' : metRulesCount <= 3 ? '#F59E0B' : '#10B981';
  const strengthLabel = !newPassword ? '' : metRulesCount <= 1 ? 'Yếu' : metRulesCount <= 3 ? 'Trung bình' : 'Mạnh';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F5F7FA',
      padding: '40px 16px',
      fontFamily: '"Inter", "DM Sans", system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 14,
            background: '#ffffff',
            border: '1px solid #E5E7EB',
            padding: 6,
            marginBottom: 14, boxShadow: '0 8px 24px rgba(79,70,229,0.15)',
            overflow: 'hidden',
          }}>
            <img src="/logo.png" alt="RWFM Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px', letterSpacing: -0.4 }}>
            Khôi phục mật khẩu
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
            {step === 1 && 'Nhập email để nhận mã xác thực OTP.'}
            {step === 2 && `Kiểm tra hòm thư ${email}`}
            {step === 3 && 'Tạo mật khẩu mới bảo mật cho tài khoản.'}
            {step === 4 && 'Mật khẩu đã được cập nhật thành công.'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #E5E7EB',
          borderRadius: 16,
          padding: '28px 28px 24px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        }}>

          {/* Stepper */}
          {step <= 3 && (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              {[
                { n: 1, label: 'Email' },
                { n: 2, label: 'OTP' },
                { n: 3, label: 'Mật khẩu' },
              ].map((s, i) => (
                <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={stepDot(step >= s.n)}>{s.n}</div>
                    <span style={{ fontSize: 10.5, fontWeight: 500, color: step >= s.n ? '#4F46E5' : '#9CA3AF' }}>{s.label}</span>
                  </div>
                  {i < 2 && (
                    <div style={{ flex: 1, height: 2, background: step > s.n ? '#4F46E5' : '#E5E7EB', margin: '0 8px', marginBottom: 18, transition: 'background .2s' }} />
                  )}
                </div>
              ))}
            </div>
          )}

          <style>{`
            .fp-input:focus-within { border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.12) !important; background: #fff !important; }
            .fp-btn-secondary { background: #F9FAFB; border: 1.5px solid #E5E7EB; color: #6B7280; border-radius: 8px; padding: 6px 12px; font-size: 12.5px; font-weight: 500; cursor: pointer; transition: background .15s; }
            .fp-btn-secondary:hover { background: #F0F2F7; border-color: #D1D5DB; }
          `}</style>

          {/* ─── STEP 1: EMAIL ─── */}
          {step === 1 && (
            <form noValidate onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                  Email cá nhân đã đăng ký
                </label>
                <div className="fp-input" style={inputWrap(!!fieldErrors.email)}>
                  <MailIcon />
                  <input
                    id="email" type="email" value={email}
                    onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors({}); }}
                    autoComplete="email" disabled={isLoading}
                    placeholder="example@company.com"
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#111827', fontFamily: 'inherit' }}
                  />
                </div>
                {fieldErrors.email && <p style={{ marginTop: 4, fontSize: 11.5, color: '#EF4444', fontWeight: 500 }}>{fieldErrors.email}</p>}
              </div>
              <button type="submit" disabled={isLoading} style={submitBtn(isLoading)}>
                {isLoading ? 'Đang gửi mã...' : 'Gửi mã xác thực OTP'}
                {!isLoading && <ArrowRightIcon />}
              </button>
            </form>
          )}

          {/* ─── STEP 2: OTP ─── */}
          {step === 2 && (
            <form noValidate onSubmit={handleStep2Submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label htmlFor="otpCode" style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Mã OTP (6 chữ số)</label>
                  <span style={{ fontSize: 12, fontWeight: 600, color: countdown === 0 ? '#EF4444' : countdown <= 60 ? '#F59E0B' : '#4F46E5' }}>
                    {countdown > 0 ? `Hết hạn: ${formatCountdown(countdown)}` : 'Mã hết hạn'}
                  </span>
                </div>
                <div className="fp-input" style={{ ...inputWrap(!!fieldErrors.otp), justifyContent: 'center' }}>
                  <KeyIcon />
                  <input
                    id="otpCode" type="text" maxLength={6} value={otpCode}
                    onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setOtpCode(v); if (fieldErrors.otp) setFieldErrors({}); }}
                    disabled={isLoading}
                    placeholder="Nhập 6 số OTP"
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 22, fontWeight: 700, letterSpacing: '0.4em', textAlign: 'center', color: '#4F46E5', fontFamily: 'inherit' }}
                  />
                </div>
                {fieldErrors.otp && <p style={{ marginTop: 4, fontSize: 11.5, color: '#EF4444', fontWeight: 500 }}>{fieldErrors.otp}</p>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" onClick={() => setStep(1)} className="fp-btn-secondary">← Đổi email</button>
                <button type="button" onClick={handleResendOtp} disabled={isLoading} style={{ fontSize: 12.5, color: '#4F46E5', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Gửi lại mã OTP
                </button>
              </div>
              <button type="submit" disabled={isLoading || countdown === 0} style={submitBtn(isLoading || countdown === 0)}>
                {isLoading ? 'Đang xác thực...' : 'Xác thực và tiếp tục'}
                {!isLoading && <ArrowRightIcon />}
              </button>
            </form>
          )}

          {/* ─── STEP 3: MẬT KHẨU MỚI ─── */}
          {step === 3 && (
            <form noValidate onSubmit={handleStep3Submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* New Password */}
              <div>
                <label htmlFor="newPassword" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                  Mật khẩu mới
                </label>
                <div className="fp-input" style={inputWrap(!!fieldErrors.newPassword)}>
                  <LockIcon />
                  <input
                    id="newPassword" type={showPassword ? 'text' : 'password'} value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); if (fieldErrors.newPassword) setFieldErrors((p) => ({ ...p, newPassword: '' })); }}
                    disabled={isLoading} placeholder="Nhập mật khẩu mới"
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#111827', fontFamily: 'inherit' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {/* Strength bar */}
                {newPassword.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: '#9CA3AF' }}>Độ mạnh:</span>
                      <span style={{ color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4, height: 4 }}>
                      {[1,2,3,4].map((i) => (
                        <div key={i} style={{ height: '100%', borderRadius: 4, background: metRulesCount >= i ? strengthColor : '#E5E7EB', transition: 'background .2s' }} />
                      ))}
                    </div>
                  </div>
                )}
                {/* Unmet rules */}
                {unmetRules.length > 0 && (
                  <div style={{ marginTop: 8, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px' }}>
                    <p style={{ fontSize: 11.5, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Cần bổ sung:</p>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {unmetRules.map((r) => (
                        <li key={r.id} style={{ fontSize: 11.5, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
                          {r.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {fieldErrors.newPassword && <p style={{ marginTop: 4, fontSize: 11.5, color: '#EF4444', fontWeight: 500 }}>{fieldErrors.newPassword}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                  Xác nhận mật khẩu
                </label>
                <div className="fp-input" style={inputWrap(isConfirmMismatch || !!fieldErrors.confirmPassword)}>
                  <LockIcon />
                  <input
                    id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: '' })); }}
                    disabled={isLoading} placeholder="Nhập lại mật khẩu mới"
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#111827', fontFamily: 'inherit' }}
                  />
                  {isConfirmMatch && <span style={{ color: '#10B981', display: 'flex' }}><CheckSmallIcon /></span>}
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}>
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {isConfirmMismatch && <p style={{ marginTop: 4, fontSize: 11.5, color: '#EF4444', fontWeight: 500 }}>Mật khẩu không trùng khớp.</p>}
                {fieldErrors.confirmPassword && !isConfirmMismatch && <p style={{ marginTop: 4, fontSize: 11.5, color: '#EF4444', fontWeight: 500 }}>{fieldErrors.confirmPassword}</p>}
              </div>

              <button type="submit" disabled={isLoading} style={{ ...submitBtn(isLoading), marginTop: 4 }}>
                {isLoading ? 'Đang cập nhật...' : 'Xác nhận đặt lại mật khẩu'}
                {!isLoading && <ArrowRightIcon />}
              </button>
            </form>
          )}

          {/* ─── STEP 4: THÀNH CÔNG ─── */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)', marginBottom: 16 }}>
                <CheckCircleIcon />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Khôi phục thành công!</h2>
              <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.6, marginBottom: 24 }}>
                Mật khẩu tài khoản đã được cập nhật. Hãy dùng mật khẩu mới để đăng nhập.
              </p>
              <button type="button" onClick={() => navigate('/login')} style={submitBtn(false)}>
                Đăng nhập ngay
                <ArrowRightIcon />
              </button>
            </div>
          )}

          {/* Back to login */}
          {step !== 4 && (
            <div style={{ marginTop: 20, textAlign: 'center', borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280', fontWeight: 500, textDecoration: 'none' }}>
                <ArrowLeftIcon />
                Quay lại trang Đăng nhập
              </Link>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11.5, color: '#9CA3AF' }}>
          © {new Date().getFullYear()} R-WFM Platform · Hỗ trợ nội bộ doanh nghiệp
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}