import { useState } from 'react';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import { Field, TextInput } from '@/shared/components/ui/FormField';
import Select from '@/shared/components/ui/Select';
import { useAdminTheme } from '@/shared/context/ThemeContext';

export default function CreateStoreManagerModal({ isOpen, onClose, onSubmit, stores = [], loading = false }) {
  const { c } = useAdminTheme();

  const [formData, setFormData] = useState({
    employeeCode: '',
    fullName: '',
    email: '',
    phone: '',
    homeBranchId: stores.length > 0 ? String(stores[0].storeId || stores[0].id) : '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.employeeCode.trim()) {
      setError('Vui lòng nhập mã nhân viên (ví dụ: MGR003)');
      return;
    }
    if (!formData.fullName.trim()) {
      setError('Vui lòng nhập họ và tên Cửa hàng trưởng');
      return;
    }
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email liên hệ');
      return;
    }
    if (!formData.homeBranchId) {
      setError('Vui lòng chọn cơ sở / chi nhánh phụ trách');
      return;
    }

    onSubmit(formData);
  };

  const storeOptions = stores.map((s) => ({
    value: String(s.storeId || s.id),
    label: `${s.storeCode || s.branchCode} - ${s.storeName || s.name}`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CẤP TÀI KHOẢN CỬA HÀNG TRƯỞNG"
      sub="Cấp quyền quản trị chi nhánh và tài khoản đăng nhập cho Store Manager (UC 1.4)"
      width={600}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy bỏ
          </Button>
          <Button variant="primary" icon="check" onClick={handleSubmit} loading={loading}>
            Cấp tài khoản
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 6,
              background: c.tones.badDim,
              border: `1px solid ${c.tones.bad}`,
              color: c.tones.bad,
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Mã nhân viên" hint="Ví dụ: MGR003">
            <TextInput
              placeholder="Nhập mã nhân viên..."
              value={formData.employeeCode}
              onChange={(e) => handleChange('employeeCode', e.target.value)}
              disabled={loading}
            />
          </Field>

          <Field label="Họ và tên" hint="Bắt buộc">
            <TextInput
              placeholder="Nhập họ và tên..."
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              disabled={loading}
            />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Địa chỉ Email" hint="Dùng để đăng nhập">
            <TextInput
              type="email"
              placeholder="manager@rwfm.vn"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={loading}
            />
          </Field>

          <Field label="Số điện thoại">
            <TextInput
              placeholder="090xxxxxxx"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={loading}
            />
          </Field>
        </div>

        <Field label="Chi nhánh phụ trách (Home Branch)" hint="Bắt buộc phân quyền">
          <Select
            width="100%"
            value={formData.homeBranchId}
            onChange={(val) => handleChange('homeBranchId', val)}
            options={storeOptions.length > 0 ? storeOptions : [{ value: '', label: '-- Đang tải chi nhánh --' }]}
            disabled={loading}
          />
        </Field>

        <Field label="Mật khẩu khởi tạo" hint="Mặc định: Password@123 nếu để trống">
          <TextInput
            type="password"
            placeholder="Để trống để áp dụng Password@123"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            disabled={loading}
          />
        </Field>

        <div
          style={{
            padding: '10px 14px',
            background: c.bgElev,
            borderRadius: 6,
            border: `1px solid ${c.border}`,
            fontSize: 12,
            color: c.fgSubtle,
            lineHeight: 1.5,
          }}
        >
          💡 <strong>Phân quyền tự động:</strong> Tài khoản được cấp sẽ mang vai trò <code>STORE_MANAGER</code> với quyền quản lý lịch ca, duyệt đổi ca, phân bổ nhân sự và giám sát điểm danh Kiosk tại chi nhánh được chỉ định.
        </div>
      </form>
    </Modal>
  );
}
