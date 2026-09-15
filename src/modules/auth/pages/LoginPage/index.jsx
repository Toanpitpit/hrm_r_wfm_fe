import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../../../components/ui/toast/ToastProvider';

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

function EyeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
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

export default function LoginPage() {
  const navigate = useNavigate();
  const { handleLogin, isLoading } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) {
      errors.username = 'Vui lòng nhập tên đăng nhập.';
    }
    if (!formData.password) {
      errors.password = 'Vui lòng nhập mật khẩu.';
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
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
      const role = (result.user?.role || result.user?.roleName || '').toUpperCase();
      const roleName = (result.user?.roleName || '').toUpperCase();
      
      const isStaff = [
        'SHIFT_LEADER',
        'CASHIER',
        'SALES_STAFF',
        'SECURITY_GUARD',
        'SECURITY',
        'EMPLOYEE',
        'STAFF'
      ].includes(role) ||
      role.includes('LEADER') ||
      role.includes('CASHIER') ||
      role.includes('SALES') ||
      role.includes('STAFF') ||
      role.includes('EMPLOYEE') ||
      role.includes('SECURITY') ||
      roleName.includes('TRƯỞNG CA') ||
      roleName.includes('THU NGÂN') ||
      roleName.includes('BÁN HÀNG') ||
      roleName.includes('BẢO VỆ') ||
      roleName.includes('NHÂN VIÊN');

      if (role === 'STORE_MANAGER' || role.includes('MANAGER') || roleName.includes('QUẢN LÝ')) {
        navigate('/store-manager/kiosk-codes');
      } else if (isStaff) {
        navigate('/employee/schedule');
      } else {
        navigate('/dashboard');
      }

    } else {
      toast.error(result.message || 'Đăng nhập thất bại, vui lòng kiểm tra lại.');
    }

  };

  return (
    <main className="relative min-h-screen w-screen max-w-[100vw] overflow-hidden bg-[#131313] px-4 pb-10 pt-24 text-[#e5e2e1] sm:px-6">
      {/* Background Image - Tạm dùng hình từ Unsplash, bạn có thể thay bằng file ảnh của bạn */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1606821361530-0eb537b8d655?q=80&w=2000&auto=format&fit=crop')` }}
      />
      <div className="fixed inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.7),rgba(12,10,8,0.92))]" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-136px)] w-full max-w-[480px] items-center py-8">
        <div className="w-full rounded-lg border border-[#d4af37]/20 bg-[#1a1a1a]/80 p-7 shadow-[0_28px_80px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-black uppercase leading-tight text-[#e5e2e1] tracking-wide">
              Hệ thống<br/><span className="text-[#d4af37]">R-WFM</span>
            </h1>
          </div>

          <form className="space-y-5" noValidate onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="mb-2 block text-xs font-bold uppercase text-[#f2ca50]">
                Tên đăng nhập
              </label>
              <div className={`flex h-14 items-center gap-3 rounded border bg-[#0e0e0e]/85 px-4 transition ${fieldErrors.username ? 'border-[#ffb4ab]' : 'border-[#4d4635] focus-within:border-[#f2ca50]'}`}>
                <MailIcon />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  disabled={isLoading}
                  className="min-w-0 flex-1 bg-transparent text-base text-[#e5e2e1] outline-none placeholder:text-[#77736b]"
                  placeholder="Tên đăng nhập"
                />
              </div>
              {fieldErrors.username && <p className="mt-2 text-sm font-semibold text-[#ffb4ab]">{fieldErrors.username}</p>}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label htmlFor="password" className="text-xs font-bold uppercase text-[#f2ca50]">Mật khẩu</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#99907c] transition hover:text-[#f2ca50]">Quên mật khẩu?</Link>
              </div>
              <div className={`flex h-14 items-center gap-3 rounded border bg-[#0e0e0e]/85 px-4 transition ${fieldErrors.password ? 'border-[#ffb4ab]' : 'border-[#4d4635] focus-within:border-[#f2ca50]'}`}>
                <LockIcon />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="min-w-0 flex-1 bg-transparent text-base text-[#e5e2e1] outline-none placeholder:text-[#77736b]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="text-[#99907c] transition hover:text-[#f2ca50] focus:outline-none"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <EyeIcon />
                </button>
              </div>
              {fieldErrors.password && <p className="mt-2 text-sm font-semibold text-[#ffb4ab]">{fieldErrors.password}</p>}
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-sm text-[#d0c5af]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-5 w-5 rounded-sm border border-[#4d4635] bg-[#0e0e0e] text-[#f2ca50] focus:ring-[#f2ca50]/30"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-14 w-full items-center justify-center gap-3 rounded bg-[#f2ca50] text-xl font-black uppercase text-[#241a00] shadow-[0_12px_30px_rgba(0,0,0,0.4)] transition hover:bg-[#ffe088] disabled:cursor-not-allowed disabled:opacity-65"
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
              {!isLoading && <ArrowRightIcon />}
            </button>
          </form>

          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#4d4635]/60" /></div>
            <div className="relative flex justify-center"><span className="bg-[#1a1a1a] px-4 text-xs uppercase text-[#99907c]">Hoặc</span></div>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/kiosk-login')}
              className="group flex h-14 w-full items-center justify-center gap-3 rounded border border-[#4d4635] bg-[#0e0e0e] text-sm font-bold uppercase text-[#d0c5af] transition hover:border-[#f2ca50] hover:text-[#f2ca50]"
            >
              <svg className="w-5 h-5 text-[#99907c] group-hover:text-[#f2ca50] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Đăng nhập Kiosk (Dành cho cửa hàng)
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
