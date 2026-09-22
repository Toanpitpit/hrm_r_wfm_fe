import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { useToast } from '@/components/ui/toast/ToastProvider';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import FormField from '@/shared/components/ui/FormField';
import Icon from '@/shared/components/ui/Icon';
import Badge from '@/shared/components/ui/Badge';
import authService from '@/modules/auth/services/auth.service';

export default function ProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const { c, fonts } = useAdminTheme();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    employeeCode: '',
    roleName: '',
    storeName: '',
  });

  useEffect(() => {
    if (isOpen) {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw);
          setFormData({
            fullName: u.fullName || u.FullName || '',
            phone: u.phone || u.Phone || '',
            email: u.email || u.Email || '',
            employeeCode: u.employeeCode || u.EmployeeCode || 'NV-000',
            roleName: u.roleName || u.RoleName || 'Nhân sự',
            storeName: u.storeName || u.StoreName || 'Trụ sở chính',
          });
        }
      } catch (e) {
        console.error('Lỗi đọc user:', e);
      }
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error('Họ và tên không được để trống.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.updateProfile({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
      });

      if (res?.success) {
        toast.success(res.message || 'Cập nhật hồ sơ cá nhân thành công!');
        // Update user in localStorage
        try {
          const raw = localStorage.getItem('user');
          if (raw) {
            const current = JSON.parse(raw);
            const updated = {
              ...current,
              fullName: res.data?.fullName || formData.fullName.trim(),
              FullName: res.data?.fullName || formData.fullName.trim(),
              phone: res.data?.phone || formData.phone.trim(),
              Phone: res.data?.phone || formData.phone.trim(),
              email: res.data?.email || formData.email.trim(),
              Email: res.data?.email || formData.email.trim(),
            };
            localStorage.setItem('user', JSON.stringify(updated));
          }
        } catch (err) {
          console.error('Lỗi cập nhật localStorage:', err);
        }

        if (onProfileUpdated) onProfileUpdated();
        onClose();
      } else {
        toast.error(res?.message || 'Không thể cập nhật hồ sơ cá nhân.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const avatarLetters = formData.fullName
    ? formData.fullName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'NV';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thông Tin Hồ Sơ Cá Nhân"
      sub="Xem và quản lý thông tin tài khoản nhân sự trong hệ thống RWFM"
      width={520}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>
            Lưu Thay Đổi
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* User Card Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '16px 18px',
            backgroundColor: c.bgRaised,
            borderRadius: 12,
            border: `1px solid ${c.border}`,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              backgroundColor: c.accent,
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              flexShrink: 0,
            }}
          >
            {avatarLetters}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: c.fg }}>{formData.fullName || 'Chưa đặt tên'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <Badge tone="active">{formData.roleName}</Badge>
              <span style={{ fontSize: 12, color: c.fgSubtle }}>Mã: {formData.employeeCode}</span>
            </div>
          </div>
        </div>

        {/* Read-Only Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label="Mã Nhân Viên">
            <input
              type="text"
              value={formData.employeeCode}
              disabled
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 6,
                border: `1px solid ${c.border}`,
                backgroundColor: c.bgCard,
                color: c.fgSubtle,
                fontSize: 13,
                cursor: 'not-allowed',
              }}
            />
          </FormField>

          <FormField label="Chi Nhánh Làm Việc">
            <input
              type="text"
              value={formData.storeName}
              disabled
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 6,
                border: `1px solid ${c.border}`,
                backgroundColor: c.bgCard,
                color: c.fgSubtle,
                fontSize: 13,
                cursor: 'not-allowed',
              }}
            />
          </FormField>
        </div>

        {/* Editable Info */}
        <FormField label="Họ và Tên (*)">
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Nhập họ và tên đầy đủ..."
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 6,
              border: `1px solid ${c.border}`,
              backgroundColor: c.bgRaised,
              color: c.fg,
              fontSize: 13,
              outline: 'none',
            }}
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label="Số Điện Thoại">
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="09xx xxx xxx"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 6,
                border: `1px solid ${c.border}`,
                backgroundColor: c.bgRaised,
                color: c.fg,
                fontSize: 13,
                outline: 'none',
              }}
            />
          </FormField>

          <FormField label="Địa Chỉ Email">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@gmail.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 6,
                border: `1px solid ${c.border}`,
                backgroundColor: c.bgRaised,
                color: c.fg,
                fontSize: 13,
                outline: 'none',
              }}
            />
          </FormField>
        </div>
      </form>
    </Modal>
  );
}
