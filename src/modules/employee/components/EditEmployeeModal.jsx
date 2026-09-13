import { useState, useEffect } from 'react';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import { Field, TextInput } from '@/shared/components/ui/FormField';
import Select from '@/shared/components/ui/Select';
import { useAdminTheme } from '@/shared/context/ThemeContext';

export default function EditEmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  employee = null,
  stores = [],
  roles = [],
  loading = false,
}) {
  const { c } = useAdminTheme();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    roleId: '5',
    employmentType: 'FULL_TIME',
    homeBranchId: '',
    status: 'ACTIVE',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (employee) {
      setFormData({
        fullName: employee.fullName || '',
        phone: employee.phone || '',
        roleId: String(employee.roleId || 5),
        employmentType: employee.employmentType || 'FULL_TIME',
        homeBranchId: employee.homeBranchId ? String(employee.homeBranchId) : '',
        status: employee.status || 'ACTIVE',
      });
      setError('');
    }
  }, [employee]);

  if (!employee) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError('Họ và tên không được để trống');
      return;
    }
    onSubmit(employee.id, formData);
  };

  const storeOptions = [
    { value: '', label: '-- Không thuộc chi nhánh nào (Văn phòng) --' },
    ...stores.map((s) => ({
      value: String(s.storeId || s.id),
      label: `${s.storeCode || s.branchCode} - ${s.storeName || s.name}`,
    })),
  ];

  const roleOptions = roles.map((r) => ({
    value: String(r.id),
    label: `${r.roleName} (${r.roleCode})`,
  }));

  const employmentTypeOptions = [
    { value: 'FULL_TIME', label: 'Toàn thời gian (Full-time)' },
    { value: 'PART_TIME', label: 'Bán thời gian (Part-time)' },
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Đang hoạt động (ACTIVE)' },
    { value: 'INACTIVE', label: 'Tạm khóa / Nghỉ việc (INACTIVE)' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CẬP NHẬT HỒ SƠ NHÂN SỰ"
      sub={`Chỉnh sửa thông tin hồ sơ cho nhân sự ${employee.fullName} (${employee.employeeCode})`}
      width={640}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy bỏ
          </Button>
          <Button variant="primary" icon="check" onClick={handleSubmit} loading={loading}>
            Lưu thay đổi
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

        <div
          style={{
            padding: '10px 14px',
            background: c.bgElev,
            borderRadius: 6,
            border: `1px solid ${c.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12.5,
          }}
        >
          <span><strong>Mã nhân viên:</strong> {employee.employeeCode}</span>
          <span><strong>Email:</strong> {employee.email}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Họ và tên nhân sự" hint="Bắt buộc">
            <TextInput
              placeholder="Nhập họ và tên..."
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              disabled={loading}
            />
          </Field>

          <Field label="Số điện thoại liên lạc">
            <TextInput
              placeholder="090xxxxxxx"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={loading}
            />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Chức danh / Vị trí">
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

          <Field label="Loại hợp đồng lao động">
            <Select
              width="100%"
              value={formData.employmentType}
              onChange={(val) => handleChange('employmentType', val)}
              options={employmentTypeOptions}
              disabled={loading}
            />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Chi nhánh gốc (Home Branch)">
            <Select
              width="100%"
              value={formData.homeBranchId}
              onChange={(val) => handleChange('homeBranchId', val)}
              options={storeOptions}
              disabled={loading}
            />
          </Field>

          <Field label="Trạng thái hồ sơ">
            <Select
              width="100%"
              value={formData.status}
              onChange={(val) => handleChange('status', val)}
              options={statusOptions}
              disabled={loading}
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
