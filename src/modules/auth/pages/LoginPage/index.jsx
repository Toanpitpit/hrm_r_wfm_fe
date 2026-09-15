import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../../../components/ui/toast/ToastProvider';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
    </svg>
  );
}

// ─── Input component ─────────────────────────────────────────────────────────

function InputField({ id, name, type = 'text', value, onChange, placeholder, disabled, icon, error, rightEl }) {
  return (
    <div style={{ marginBottom: error ? 4 : 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          height: 44,
          padding: '0 13px',
          borderRadius: 10,
          border: `1.5px solid ${error ? '#EF4444' : '#E5E7EB'}`,
          background: error ? '#FEF2F2' : '#F9FAFB',
          transition: 'border-color .15s, box-shadow .15s',
          outline: 'none',
        }}
        tabIndex={-1}
        onFocus={() => {}}
        className="input-wrapper"
      >
        <span style={{ color: '#9CA3AF', flexShrink: 0, display: 'flex' }}>{icon}</span>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={name}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: 14,
            color: '#111827',
            fontFamily: 'inherit',
          }}
        />
        {rightEl}
      </div>
      {error && (
        <p style={{ marginTop: 4, fontSize: 11.5, color: '#EF4444', fontWeight: 500 }}>{error}</p>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate();
  const { handleLogin, handleGoogleLogin, isLoading } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const routeByRole = (user) => {
    const role = (user?.role || user?.roleName || '').toUpperCase();
    if (role === 'STORE_MANAGER' || role.includes('MANAGER')) {
      navigate('/store-manager/schedules');
    } else if (role === 'SHIFT_LEADER' || role.includes('LEADER')) {
      navigate('/store-manager/schedules');
    } else if (
      ['CASHIER', 'SALES_STAFF', 'SECURITY_GUARD', 'EMPLOYEE'].includes(role) ||
      role.includes('STAFF') || role.includes('GUARD') || role.includes('CASHIER')
    ) {
      navigate('/employee/schedule');
    } else if (
      role === 'OPERATIONS_ADMIN' || role === 'BUSINESS_OWNER' ||
      role.includes('ADMIN') || role.includes('OWNER')
    ) {
      navigate('/dashboard');
    } else {
      navigate('/store-manager/schedules');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) errors.username = 'Vui lòng nhập email.';
    if (!formData.password) errors.password = 'Vui lòng nhập mật khẩu.';
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.warning('Vui lòng điền đầy đủ thông tin đăng nhập.');
      return;
    }
    const result = await handleLogin(formData.username.trim(), formData.password);
    if (result.success) {
      toast.success('Đăng nhập thành công!');
      routeByRole(result.user);
    } else {
      toast.error(result.message || 'Đăng nhập thất bại, vui lòng kiểm tra lại.');
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Không nhận được thông tin xác thực từ Google.');
      return;
    }
    const result = await handleGoogleLogin(credentialResponse.credential);
    if (result.success) {
      toast.success('Đăng nhập Google thành công!');
      routeByRole(result.user);
    } else {
      toast.error(result.message || 'Đăng nhập Google thất bại.');
    }
  };

  const onGoogleError = () => {
    toast.error('Đăng nhập Google không thành công. Vui lòng thử lại!');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        fontFamily: '"Inter", "DM Sans", system-ui, -apple-system, sans-serif',
        background: '#F5F7FA',
      }}
    >
      {/* ── Left panel: branding ─────────────────────────────────── */}
      <div
        style={{
          display: 'none',
          flex: 1.15,
          background: 'linear-gradient(140deg, #0A192F 0%, #0F2A4A 45%, #173B66 100%)',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="login-left-panel"
      >
        {/* Ambient glowing orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, rgba(14, 165, 233, 0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-15%',
            right: '-10%',
            width: '550px',
            height: '550px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Delicate grid texture overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            pointerEvents: 'none',
            opacity: 0.7,
          }}
        />

        {/* Center Glass Card */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: 420,
          }}
        >
          <div
            style={{
              width: 190,
              height: 190,
              borderRadius: 36,
              background: '#ffffff',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              marginBottom: 32,
              overflow: 'hidden',
            }}
          >
            <img
              src="/logo.png"
              alt="RWFM Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>

          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: -0.6,
              margin: '0 0 12px',
              textShadow: '0 2px 12px rgba(0,0,0,0.3)',
            }}
          >
            Hệ thống RWFM
          </h1>

          <p
            style={{
              fontSize: 15,
              color: 'rgba(241, 245, 249, 0.82)',
              margin: 0,
              lineHeight: 1.6,
              letterSpacing: -0.1,
            }}
          >
            Nền tảng quản lý lực lượng lao động & ca làm việc toàn diện cho chuỗi siêu thị bán lẻ
          </p>
        </div>
      </div>

      {/* ── Right panel: login form ───────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          minHeight: '100vh',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Logo for mobile / standalone */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 68,
                height: 68,
                borderRadius: 18,
                background: '#ffffff',
                marginBottom: 16,
                padding: 8,
                boxShadow: '0 6px 20px rgba(15, 23, 42, 0.08)',
                border: '1px solid #E2E8F0',
              }}
            >
              <img src="/logo.png" alt="RWFM Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: '0 0 6px', letterSpacing: -0.5 }}>
              Đăng nhập hệ thống
            </h1>
            <p style={{ fontSize: 13.5, color: '#64748B', margin: 0 }}>
              Hệ thống RWFM · Quản trị vận hành chuỗi bán lẻ
            </p>
          </div>

          {/* Form card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #E5E7EB',
              borderRadius: 16,
              padding: '28px 28px 24px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
            }}
          >
            <form noValidate onSubmit={handleSubmit}>
              <style>{`
                .input-wrapper:focus-within {
                  border-color: #4F46E5 !important;
                  box-shadow: 0 0 0 3px rgba(79,70,229,0.12) !important;
                  background: #fff !important;
                }
                .input-wrapper input:disabled {
                  opacity: 0.6;
                  cursor: not-allowed;
                }
                @media (min-width: 768px) {
                  .login-left-panel { display: flex !important; }
                }
              `}</style>

              {/* Username */}
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="username" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                  Email
                </label>
                <InputField
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập email của bạn"
                  disabled={isLoading}
                  icon={<MailIcon />}
                  error={fieldErrors.username}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label htmlFor="password" style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
                    Mật khẩu
                  </label>
                  <Link
                    to="/forgot-password"
                    style={{ fontSize: 12.5, color: '#4F46E5', fontWeight: 500, textDecoration: 'none' }}
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <InputField
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu của bạn"
                  disabled={isLoading}
                  icon={<LockIcon />}
                  error={fieldErrors.password}
                  rightEl={
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 0 }}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  }
                />
              </div>

              {/* Remember me */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#6B7280', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#4F46E5', width: 15, height: 15, cursor: 'pointer' }}
                  />
                  Ghi nhớ đăng nhập
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 10,
                  background: isLoading ? '#818CF8' : 'linear-gradient(135deg, #4F46E5, #6366F1)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 14,
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 2px 8px rgba(79,70,229,0.35)',
                  transition: 'opacity .15s, box-shadow .15s',
                  letterSpacing: 0.1,
                }}
              >
                {isLoading ? (
                  <>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
              <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>Hoặc tiếp tục với</span>
              <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            </div>

            {/* Google Login */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={onGoogleError}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="365"
              />
            </div>

            {/* Kiosk Button */}
            <button
              type="button"
              onClick={() => navigate('/kiosk-login')}
              style={{
                width: '100%',
                height: 40,
                borderRadius: 10,
                border: '1.5px solid #E5E7EB',
                background: '#F9FAFB',
                color: '#6B7280',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background .15s, border-color .15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F0F2F7'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Đăng nhập Kiosk Cửa Hàng (Mã PIN)
            </button>
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11.5, color: '#9CA3AF' }}>
            © {new Date().getFullYear()} R-WFM Platform · Hỗ trợ nội bộ doanh nghiệp
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
