import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../../../components/ui/toast/ToastProvider';
import styles from './LoginPage.module.css';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

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

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

// ─── Input component ─────────────────────────────────────────────────────────

function InputField({ id, name, type = 'text', value, onChange, placeholder, disabled, icon, error, rightEl }) {
  return (
    <div>
      <div className={`${styles.inputWrapper} ${error ? styles.inputWrapperError : ''}`}>
        <span className={styles.inputIcon}>{icon}</span>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={name}
          className={styles.inputField}
        />
        {rightEl}
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
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
      navigate('/employee/my-calendar');
    } else if (
      ['CASHIER', 'SALES_STAFF', 'SECURITY_GUARD', 'EMPLOYEE'].includes(role) ||
      role.includes('STAFF') || role.includes('GUARD') || role.includes('CASHIER')
    ) {
      navigate('/employee/my-calendar');
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

  const redirectUserByRole = (user) => {
    const role = (user?.role || user?.roleName || '').toUpperCase();
    const roleName = (user?.roleName || '').toUpperCase();

    const isStaff = [
      'SHIFT_LEADER', 'CASHIER', 'SALES_STAFF', 'SECURITY_GUARD', 'SECURITY', 'EMPLOYEE', 'STAFF'
    ].includes(role) ||
      role.includes('LEADER') || role.includes('CASHIER') || role.includes('SALES') ||
      role.includes('STAFF') || role.includes('EMPLOYEE') || role.includes('SECURITY') ||
      roleName.includes('TRƯỞNG CA') || roleName.includes('THU NGÂN') ||
      roleName.includes('BÁN HÀNG') || roleName.includes('BẢO VỆ') || roleName.includes('NHÂN VIÊN');

    if (role === 'STORE_MANAGER' || role.includes('MANAGER') || roleName.includes('QUẢN LÝ')) {
      navigate('/store-manager/kiosk-codes');
    } else if (isStaff) {
      navigate('/employee/my-calendar');
    } else {
      navigate('/dashboard');
    }
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
      redirectUserByRole(result.user);
    } else {
      toast.error(result.message || 'Đăng nhập thất bại, vui lòng kiểm tra lại.');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const token = tokenResponse?.access_token || tokenResponse?.credential;
        if (!token) {
          toast.error('Không nhận được mã xác thực Google.');
          return;
        }
        const result = await handleGoogleLogin(token);
        if (result?.success) {
          toast.success('Đăng nhập Google thành công!');
          redirectUserByRole(result.user);
        } else {
          toast.error(result?.message || 'Đăng nhập Google thất bại.');
        }
      } catch (err) {
        toast.error('Lỗi khi xác thực tài khoản Google.');
      }
    },
    onError: () => {
      toast.error('Đăng nhập Google không thành công. Vui lòng thử lại!');
    }
  });

  return (
    <div className={styles.pageContainer}>
      {/* ── Cột trái: Chỉ có Logo và RWFM Enterprise căn chính giữa ─────────── */}
      <div className={styles.heroPanel}>
        <div className={styles.heroCenteredBrand}>
          <div className={styles.heroLogoBadge}>
            <img src="/logo.png" alt="RWFM Logo" />
          </div>
          <div className={styles.heroBrandName}>WorkPilot System</div>
        </div>
      </div>

      {/* ── Cột phải: Form Đăng nhập ───────────────────────────────────────── */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          {/* Mobile logo & Title */}
          <div className={styles.mobileBrand}>
            <div className={styles.mobileLogoBadge}>
              <img src="/logo.png" alt="RWFM Logo" />
            </div>
            <h2 className={styles.formTitle}>Đăng nhập hệ thống</h2>
          </div>

          {/* Form Card */}
          <div className={styles.loginCard}>
            <form noValidate onSubmit={handleSubmit}>
              {/* Email */}
              <div className={styles.formGroup}>
                <label htmlFor="username" className={styles.inputLabel}>
                  Email
                </label>
                <InputField
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  disabled={isLoading}
                  icon={<MailIcon />}
                  error={fieldErrors.username}
                />
              </div>

              {/* Password */}
              <div className={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label htmlFor="password" className={styles.inputLabel} style={{ marginBottom: 0 }}>
                    Mật khẩu
                  </label>
                  <Link to="/forgot-password" className={styles.forgotLink}>
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
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: 0 }}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  }
                />
              </div>

              {/* Remember me */}
              <div className={styles.formOptions}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={styles.checkboxInput}
                  />
                  Ghi nhớ phiên đăng nhập
                </label>
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={isLoading} className={styles.submitBtn}>
                {isLoading ? (
                  <>
                    <span className={styles.spinner} />
                    Đang xác thực...
                  </>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <ArrowRightIcon />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>Hoặc tiếp tục với</span>
              <div className={styles.dividerLine} />
            </div>

            {/* Google Login button */}
            <div className={styles.googleBtnWrapper}>
              <button
                type="button"
                onClick={() => googleLogin()}
                className={styles.googleFullBtn}
                title="Đăng nhập bằng tài khoản Google"
                aria-label="Đăng nhập bằng tài khoản Google"
              >
                <GoogleIcon />
                <span>Đăng nhập bằng Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
