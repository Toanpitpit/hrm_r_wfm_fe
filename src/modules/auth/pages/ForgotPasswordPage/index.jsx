import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../../../components/ui/toast/ToastProvider';
import styles from '../LoginPage/LoginPage.module.css';

// ─── SVG Icons ─────────────────────────────────────────────────────────────

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 7a4 4 0 1 0-7.8 1.4L2 13.6V18h4.4l1.2-1.2h2.4v-2.4l1.2-1.2H12a4 4 0 0 0 3-6.2Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
    </svg>
  );
}

function CheckSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5m6-6-6 6 6 6" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
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
  const passwordRules = [
    { id: 'length', text: 'Ít nhất 6 ký tự', valid: newPassword.length >= 6 },
    { id: 'letter', text: 'Có chữ cái', valid: /[a-zA-Z]/.test(newPassword) },
    { id: 'number', text: 'Có chữ số', valid: /[0-9]/.test(newPassword) },
    { id: 'special', text: 'Có ký tự đặc biệt (@, #, $, ...)', valid: /[^a-zA-Z0-9\s]/.test(newPassword) },
  ];

  const unmetRules = passwordRules.filter((r) => !r.valid);
  const metRulesCount = passwordRules.filter((r) => r.valid).length;

  const strengthColor = metRulesCount <= 1 ? '#EF4444' : metRulesCount <= 3 ? '#F59E0B' : '#10B981';
  const strengthLabel = !newPassword ? '' : metRulesCount <= 1 ? 'Yếu' : metRulesCount <= 3 ? 'Trung bình' : 'Mạnh';

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

  // ─── Stepper dot style ──────────────────────────────────────────────────
  const stepDot = (active) => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    background: active ? '#10B981' : '#F1F5F9',
    color: active ? '#FFFFFF' : '#94A3B8',
    border: active ? '2px solid #10B981' : '2px solid #E2E8F0',
    flexShrink: 0,
    transition: 'all .2s ease',
    boxShadow: active ? '0 2px 8px rgba(16, 185, 129, 0.35)' : 'none',
  });

  return (
    <div className={styles.pageContainer}>
      {/* ── Cột trái: Apex Deep Obsidian & Emerald Glow Gradient ───── */}
      <div className={styles.heroPanel}>
        <div className={styles.heroCenteredBrand}>
          <div className={styles.heroLogoBadge}>
            <img src="/logo.png" alt="RWFM Enterprise Logo" />
          </div>
          <div className={styles.heroBrandName}>RWFM Enterprise</div>
        </div>
      </div>

      {/* ── Cột phải: Form Khôi Phục Mật Khẩu ───────────────────────── */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer} style={{ maxWidth: 460 }}>
          {/* Mobile Logo Brand */}
          <div className={styles.mobileBrand}>
            <div className={styles.mobileLogoBadge}>
              <img src="/logo.png" alt="RWFM Logo" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: 0 }}>
              RWFM Enterprise
            </h2>
          </div>

          {/* Form Header */}
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <h1 className={styles.formTitle} style={{ fontSize: 24 }}>
              Khôi phục mật khẩu
            </h1>
            <p style={{ fontSize: 13.5, color: '#64748B', marginTop: 6 }}>
              {step === 1 && 'Nhập email tài khoản để nhận mã xác thực OTP.'}
              {step === 2 && `Mã xác thực đã được gửi tới ${email}`}
              {step === 3 && 'Tạo mật khẩu mới bảo mật cho tài khoản của bạn.'}
              {step === 4 && 'Mật khẩu đã được cập nhật thành công.'}
            </p>
          </div>

          {/* Main Card */}
          <div className={styles.loginCard} style={{ padding: '28px 24px' }}>
            {/* Stepper Header (Steps 1-3) */}
            {step <= 3 && (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, padding: '0 8px' }}>
                {[
                  { n: 1, label: 'Email' },
                  { n: 2, label: 'Xác thực OTP' },
                  { n: 3, label: 'Mật khẩu' },
                ].map((s, i) => (
                  <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={stepDot(step >= s.n)}>{s.n}</div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: step >= s.n ? '#10B981' : '#94A3B8' }}>
                        {s.label}
                      </span>
                    </div>
                    {i < 2 && (
                      <div
                        style={{
                          flex: 1,
                          height: 2,
                          background: step > s.n ? '#10B981' : '#E2E8F0',
                          margin: '0 8px',
                          marginBottom: 18,
                          transition: 'background .2s ease',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ─── STEP 1: NHẬP EMAIL ─── */}
            {step === 1 && (
              <form noValidate onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label htmlFor="email" className={styles.inputLabel}>
                    Email cá nhân đã đăng ký
                  </label>
                  <div className={`${styles.inputWrapper} ${fieldErrors.email ? styles.inputWrapperError : ''}`}>
                    <span className={styles.inputIcon}><MailIcon /></span>
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
                      placeholder="example@company.com"
                      className={styles.inputField}
                    />
                  </div>
                  {fieldErrors.email && <p className={styles.errorText}>{fieldErrors.email}</p>}
                </div>

                <button type="submit" disabled={isLoading} className={styles.submitBtn}>
                  {isLoading ? 'Đang gửi mã...' : 'Gửi mã xác thực OTP'}
                  {!isLoading && <ArrowRightIcon />}
                </button>
              </form>
            )}

            {/* ─── STEP 2: NHẬP MÃ OTP ─── */}
            {step === 2 && (
              <form noValidate onSubmit={handleStep2Submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label htmlFor="otpCode" className={styles.inputLabel} style={{ marginBottom: 0 }}>
                      Mã OTP (6 chữ số)
                    </label>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: countdown === 0 ? '#EF4444' : countdown <= 60 ? '#F59E0B' : '#10B981',
                      }}
                    >
                      {countdown > 0 ? `Hết hạn: ${formatCountdown(countdown)}` : 'Mã hết hạn'}
                    </span>
                  </div>

                  <div className={`${styles.inputWrapper} ${fieldErrors.otp ? styles.inputWrapperError : ''}`} style={{ justifyContent: 'center' }}>
                    <span className={styles.inputIcon}><KeyIcon /></span>
                    <input
                      id="otpCode"
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '');
                        setOtpCode(v);
                        if (fieldErrors.otp) setFieldErrors({});
                      }}
                      disabled={isLoading}
                      placeholder="Nhập 6 số OTP"
                      className={styles.inputField}
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        letterSpacing: '0.35em',
                        textAlign: 'center',
                        color: '#10B981',
                      }}
                    />
                  </div>
                  {fieldErrors.otp && <p className={styles.errorText}>{fieldErrors.otp}</p>}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      color: '#64748B',
                      borderRadius: 8,
                      padding: '6px 12px',
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all .15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
                  >
                    ← Đổi email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    style={{
                      fontSize: 12.5,
                      color: '#10B981',
                      fontWeight: 600,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Gửi lại mã OTP
                  </button>
                </div>

                <button type="submit" disabled={isLoading || countdown === 0} className={styles.submitBtn}>
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
                  <label htmlFor="newPassword" className={styles.inputLabel}>
                    Mật khẩu mới
                  </label>
                  <div className={`${styles.inputWrapper} ${fieldErrors.newPassword ? styles.inputWrapperError : ''}`}>
                    <span className={styles.inputIcon}><LockIcon /></span>
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (fieldErrors.newPassword) setFieldErrors((p) => ({ ...p, newPassword: '' }));
                      }}
                      disabled={isLoading}
                      placeholder="Nhập mật khẩu mới"
                      className={styles.inputField}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', padding: 0 }}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>

                  {/* Password Strength bar */}
                  {newPassword.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                        <span style={{ color: '#94A3B8' }}>Độ mạnh:</span>
                        <span style={{ color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, height: 4 }}>
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            style={{
                              height: '100%',
                              borderRadius: 4,
                              background: metRulesCount >= i ? strengthColor : '#E2E8F0',
                              transition: 'background .2s ease',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unmet Rules */}
                  {unmetRules.length > 0 && (
                    <div style={{ marginTop: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 12px' }}>
                      <p style={{ fontSize: 11.5, fontWeight: 600, color: '#334155', marginBottom: 4 }}>Cần bổ sung:</p>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {unmetRules.map((r) => (
                          <li key={r.id} style={{ fontSize: 11.5, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
                            {r.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {fieldErrors.newPassword && <p className={styles.errorText}>{fieldErrors.newPassword}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className={styles.inputLabel}>
                    Xác nhận mật khẩu mới
                  </label>
                  <div className={`${styles.inputWrapper} ${isConfirmMismatch || fieldErrors.confirmPassword ? styles.inputWrapperError : ''}`}>
                    <span className={styles.inputIcon}><LockIcon /></span>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: '' }));
                      }}
                      disabled={isLoading}
                      placeholder="Nhập lại mật khẩu mới"
                      className={styles.inputField}
                    />
                    {isConfirmMatch && <span style={{ color: '#10B981', display: 'flex', marginRight: 4 }}><CheckSmallIcon /></span>}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', padding: 0 }}
                      aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {isConfirmMismatch && <p className={styles.errorText}>Mật khẩu xác nhận không trùng khớp.</p>}
                  {fieldErrors.confirmPassword && !isConfirmMismatch && <p className={styles.errorText}>{fieldErrors.confirmPassword}</p>}
                </div>

                <button type="submit" disabled={isLoading} className={styles.submitBtn} style={{ marginTop: 6 }}>
                  {isLoading ? 'Đang cập nhật...' : 'Xác nhận đặt lại mật khẩu'}
                  {!isLoading && <ArrowRightIcon />}
                </button>
              </form>
            )}

            {/* ─── STEP 4: THÀNH CÔNG ─── */}
            {step === 4 && (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '2px solid rgba(16, 185, 129, 0.3)',
                    marginBottom: 16,
                  }}
                >
                  <CheckCircleIcon />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
                  Khôi phục thành công!
                </h2>
                <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.6, marginBottom: 24 }}>
                  Mật khẩu tài khoản đã được cập nhật thành công. Hãy dùng mật khẩu mới để đăng nhập vào hệ thống.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className={styles.submitBtn}
                >
                  Đăng nhập ngay
                  <ArrowRightIcon />
                </button>
              </div>
            )}

            {/* Back to Login Link */}
            {step !== 4 && (
              <div style={{ marginTop: 22, textAlign: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    color: '#64748B',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'color .15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#10B981'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#64748B'; }}
                >
                  <ArrowLeftIcon />
                  Quay lại trang Đăng nhập
                </Link>
              </div>
            )}
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#94A3B8' }}>
            © {new Date().getFullYear()} RWFM Enterprise · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}