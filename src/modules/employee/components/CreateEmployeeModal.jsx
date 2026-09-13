import { useState } from 'react';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import { Field, TextInput } from '@/shared/components/ui/FormField';
import Select from '@/shared/components/ui/Select';
import { useAdminTheme } from '@/shared/context/ThemeContext';

export default function CreateEmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  stores = [],
  roles = [],
  loading = false,
  defaultBranchId = null,
}) {
  const { c } = useAdminTheme();

  const [formData, setFormData] = useState({
    employeeCode: '',
    fullName: '',
    email: '',
    phone: '',
    roleId: roles.length > 0 ? String(roles[0].id) : '5', // Default 5: CASHIER
    employmentType: 'FULL_TIME',
    homeBranchId: defaultBranchId ? String(defaultBranchId) : (stores.length > 0 ? String(stores[0].storeId || stores[0].id) : ''),
    password: '',
    pinCode: '',
  });

  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.employeeCode.trim()) {
      setError('Vui lòng nhập mã định danh nhân viên');
      return;
    }
    if (!formData.fullName.trim()) {
      setError('Vui lòng nhập họ và tên nhân viên');
      return;
    }
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    if (!formData.roleId) {
      setError('Vui lòng chỉ định chức danh');
      return;
    }
    if (!formData.homeBranchId) {
      setError('Vui lòng gán chi nhánh gốc (Home Branch)');
      return;
    }

    onSubmit(formData);
  };

  const storeOptions = stores.map((s) => ({
    value: String(s.storeId || s.id),
    label: `${s.storeCode || s.branchCode} - ${s.storeName || s.name}`,
  }));

  const roleOptions = roles.map((r) => ({
    value: String(r.id),
    label: `${r.roleName} (${r.roleCode})`,
  }));

  const employmentTypeOptions = [
    { value: 'FULL_TIME', label: 'Toàn thời gian (Full-time)' },
    { value: 'PART_TIME', label: 'Bán thời gian (Part-time)' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="THÊM MỚI HỒ SƠ & HỢP ĐỒNG NHÂN SỰ"
      sub="Khai báo nhân sự mới, phân loại Full-time / Part-time, gán chức danh & chi nhánh gốc"
      width={680}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy bỏ
          </Button>
          <Button variant="primary" icon="check" onClick={handleSubmit} loading={loading}>
            Lưu hồ sơ nhân sự
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

        {/* Mã NV & Họ tên */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Mã nhân viên" hint="VD: CSH002, SAL002, SEC002">
            <TextInput
              placeholder="Nhập mã nhân viên..."
              value={formData.employeeCode}
              onChange={(e) => handleChange('employeeCode', e.target.value)}
              disabled={loading}
            />
          </Field>

          <Field label="Họ và tên nhân sự" hint="Bắt buộc">
            <TextInput
              placeholder="Nhập họ và tên..."
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              disabled={loading}
            />
          </Field>
        </div>

        {/* Email & SĐT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Email nhân sự" hint="Tài khoản hệ thống">
            <TextInput
              type="email"
              placeholder="staff@rwfm.vn"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={loading}
            />
          </Field>

          <Field label="Số điện thoại" hint="Liên lạc nội bộ">
            <TextInput
              placeholder="090xxxxxxx"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={loading}
            />
          </Field>
        </div>

        {/* Chức danh & Loại hợp đồng */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Chức danh / Vị trí" hint="Phân quyền ca">
            <Select
              width="100%"
              value={formData.roleId}
              onChange={(val) => handleChange('roleId', val)}
              options={roleOptions.length > 0 ? roleOptions : [
                { value: '5', label: 'Thu Ngân (CASHIER)' },
                { value: '6', label: 'Nhân Viên Bán Hàng (SALES_STAFF)' },
                { value: '7', label: 'Nhân Viên Bảo Vệ (SECURITY_GUARD)' },
                { value: '4', label: 'Trưởng Ca Trực (SHIFT_LEADER)' },
                { value: '3', label: 'Quản Lý Cửa Hàng (STORE_MANAGER)' },
              ]}
              disabled={loading}
            />
          </Field>

          <Field label="Loại hợp đồng lao động" hint="Full-time / Part-time">
            <Select
              width="100%"
              value={formData.employmentType}
              onChange={(val) => handleChange('employmentType', val)}
              options={employmentTypeOptions}
              disabled={loading}
            />
          </Field>
        </div>

        {/* Chi nhánh gốc */}
        <Field label="Chi nhánh gốc (Home Branch)" hint="Địa điểm làm việc chính của nhân sự">
          <Select
            width="100%"
            value={formData.homeBranchId}
            onChange={(val) => handleChange('homeBranchId', val)}
            options={storeOptions.length > 0 ? storeOptions : [{ value: '', label: '-- Đang tải danh sách cơ sở --' }]}
            disabled={loading || Boolean(defaultBranchId)}
          />
        </Field>

        {/* Mật khẩu & Mã PIN Kiosk */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Mật khẩu Web ban đầu" hint="Mặc định: Password@123">
            <TextInput
              type="password"
              placeholder="Để trống để lấy mặc định"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              disabled={loading}
            />
          </Field>

          <Field label="Mã PIN Kiosk ban đầu" hint="4 chữ số (để trống để cấp sau)">
            <TextInput
              placeholder="Ví dụ: 1234"
              maxLength={6}
              value={formData.pinCode}
              onChange={(e) => handleChange('pinCode', e.target.value)}
              disabled={loading}
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
