import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import { Field as FormField } from '@/shared/components/ui/FormField';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';

/**
 * ==============================================================================
 * COMPONENT: BranchFormModal.jsx
 * UC 1.2: Modal Thêm / Chỉnh sửa Chi nhánh
 * ==============================================================================
 * Form validate đầy đủ:
 * - Code (Mã chi nhánh: CH01, CH02...)
 * - Name (Tên chi nhánh)
 * - Address (Địa chỉ chi nhánh)
 * - Phone (Số điện thoại)
 * - Kiosk IP Whitelist & User Agent Pattern
 */
export default function BranchFormModal({
  open = false,
  initialData = null,
  onClose,
  onSubmit,
}) {
  const { c } = useAdminTheme();

  const [formData, setFormData] = useState({
    branchCode: '',
    name: '',
    address: '',
    phone: '',
    kioskAllowedIp: '',
    kioskAllowedBrowser: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        branchCode: initialData.branchCode || initialData.code || '',
        name: initialData.name || initialData.storeName || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        kioskAllowedIp: initialData.kioskAllowedIp || '',
        kioskAllowedBrowser: initialData.kioskAllowedBrowser || '',
      });
      setShowAdvanced(
        Boolean(initialData.kioskAllowedIp || initialData.kioskAllowedBrowser)
      );
    } else {
      setFormData({
        branchCode: '',
        name: '',
        address: '',
        phone: '',
        kioskAllowedIp: '192.168.1.0/24; 14.161.25.10',
        kioskAllowedBrowser: 'Chrome Enterprise Kiosk v120+',
      });
      setShowAdvanced(false);
    }
    setErrors({});
    setServerError('');
  }, [initialData, open]);

  const validate = () => {
    const errs = {};
    const code = (formData.branchCode || '').trim();
    const name = (formData.name || '').trim();
    const address = (formData.address || '').trim();
    const phone = (formData.phone || '').trim();

    if (!code) {
      errs.branchCode = 'Vui lòng nhập mã chi nhánh (VD: CH03, HCM02).';
    } else if (code.length < 2) {
      errs.branchCode = 'Mã chi nhánh tối thiểu 2 ký tự.';
    }

    if (!name) {
      errs.name = 'Vui lòng nhập tên chi nhánh.';
    } else if (name.length < 3) {
      errs.name = 'Tên chi nhánh tối thiểu 3 ký tự.';
    }

    if (!address) {
      errs.address = 'Vui lòng nhập địa chỉ chi nhánh.';
    }

    if (phone && !/^[0-9+\s().-]{8,15}$/.test(phone)) {
      errs.phone = 'Số điện thoại không đúng định dạng (8-15 chữ số).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setServerError('');
    if (!validate()) return;

    try {
      setSubmitting(true);
      const res = await onSubmit(formData);
      if (res?.success === false) {
        setServerError(res.error || 'Có lỗi xảy ra khi lưu chi nhánh.');
      } else {
        onClose();
      }
    } catch (err) {
      setServerError(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const randomId = Math.floor(10 + Math.random() * 90);
    setFormData({
      branchCode: `CH${randomId}`,
      name: `Cửa hàng Tiện lợi Chi nhánh Quận ${randomId}`,
      address: `Số ${randomId} Đường Nguyễn Trãi, Thanh Xuân, Hà Nội`,
      phone: '0988123456',
      kioskAllowedIp: '192.168.1.0/24; 14.161.25.10',
      kioskAllowedBrowser: 'Chrome Enterprise Kiosk v120+',
    });
    setErrors({});
    setServerError('');
  };

  const isEditing = Boolean(initialData);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Chỉnh Sửa Chi Nhánh' : 'Thêm Chi Nhánh Mới'}
      width="560px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Thông báo lỗi từ Server nếu có */}
          {serverError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#ef444415',
                border: '1px solid #ef444450',
                color: '#ef4444',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              <Icon name="alert-triangle" size={16} />
              <span>{serverError}</span>
            </div>
          )}

          {!isEditing && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '-4px' }}>
              <span style={{ fontSize: '12px', color: c.fgFaint }}>
                Nhập thông tin hoặc bấm điền mẫu thử:
              </span>
              <button
                type="button"
                onClick={handleQuickFill}
                style={{
                  background: 'none',
                  border: 'none',
                  color: c.accent,
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '4px 6px',
                }}
              >
                + Điền mẫu nhanh
              </button>
            </div>
          )}

          {/* 1. Mã Chi Nhánh */}
          <FormField
            label="Mã Chi Nhánh"
            required
            error={errors.branchCode}
            hint="Mã duy nhất toàn hệ thống (VD: CH03, CH04, HCM01)"
          >
            <input
              type="text"
              value={formData.branchCode}
              disabled={isEditing}
              onChange={(e) => {
                const val = e.target.value.toUpperCase().replace(/\s+/g, '');
                setFormData((prev) => ({ ...prev, branchCode: val }));
                if (errors.branchCode) setErrors((prev) => ({ ...prev, branchCode: null }));
                if (serverError) setServerError('');
              }}
              placeholder="Nhập mã chi nhánh (VD: CH03)"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.branchCode ? '#ef4444' : c.border}`,
                backgroundColor: isEditing ? `${c.bgSubtle}` : c.bgCard,
                color: c.fg,
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'monospace',
                fontWeight: 600,
              }}
            />
          </FormField>

          {/* 2. Tên Chi Nhánh */}
          <FormField
            label="Tên Chi Nhánh"
            required
            error={errors.name}
            hint="Tên hiển thị đầy đủ của cửa hàng/chi nhánh"
          >
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev) => ({ ...prev, name: val }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                if (serverError) setServerError('');
              }}
              placeholder="Nhập tên chi nhánh (VD: Siêu thị Tiện lợi Cầu Giấy)"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.name ? '#ef4444' : c.border}`,
                backgroundColor: c.bgCard,
                color: c.fg,
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </FormField>

          {/* 3. Địa Chỉ */}
          <FormField
            label="Địa Chỉ Chi Nhánh"
            required
            error={errors.address}
          >
            <input
              type="text"
              value={formData.address}
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev) => ({ ...prev, address: val }));
                if (errors.address) setErrors((prev) => ({ ...prev, address: null }));
                if (serverError) setServerError('');
              }}
              placeholder="Nhập địa chỉ (VD: 123 Cầu Giấy, Hà Nội)"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.address ? '#ef4444' : c.border}`,
                backgroundColor: c.bgCard,
                color: c.fg,
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </FormField>

          {/* 4. Số Điện Thoại */}
          <FormField
            label="Số Điện Thoại Liên Hệ"
            error={errors.phone}
            hint="Số điện thoại hotline hoặc bàn tại cửa hàng"
          >
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev) => ({ ...prev, phone: val }));
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                if (serverError) setServerError('');
              }}
              placeholder="Nhập số điện thoại (VD: 024 3833 2211)"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.phone ? '#ef4444' : c.border}`,
                backgroundColor: c.bgCard,
                color: c.fg,
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </FormField>

          {/* 5. Cấu hình bảo mật Kiosk (Collapsible) */}
          <div
            style={{
              marginTop: '4px',
              borderTop: `1px dashed ${c.border}`,
              paddingTop: '12px',
            }}
          >
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                background: 'none',
                border: 'none',
                color: c.accent,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: 0,
                marginBottom: showAdvanced ? '12px' : '0',
              }}
            >
              <Icon
                name={showAdvanced ? 'chevron-down' : 'chevron-right'}
                size={14}
              />
              <span>Cấu hình Bảo mật Kiosk Mạng (Tùy chọn)</span>
            </button>

            {showAdvanced && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  backgroundColor: `${c.bgSubtle}50`,
                  padding: '12px',
                  borderRadius: '8px',
                }}
              >
                <FormField
                  label="Dải IP Whitelist / Subnet cho Kiosk"
                  hint="Chỉ các máy trạm có IP nằm trong dải này mới được phép điểm danh"
                >
                  <input
                    type="text"
                    value={formData.kioskAllowedIp}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({ ...prev, kioskAllowedIp: val }));
                    }}
                    placeholder="VD: 192.168.1.0/24; 14.161.25.10"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${c.border}`,
                      backgroundColor: c.bgCard,
                      color: c.fg,
                      fontSize: '13px',
                      fontFamily: 'monospace',
                    }}
                  />
                </FormField>

                <FormField
                  label="Trình duyệt / User Agent được phép"
                  hint="Quy định trình duyệt Kiosk Lockdown Mode tại quầy"
                >
                  <input
                    type="text"
                    value={formData.kioskAllowedBrowser}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({ ...prev, kioskAllowedBrowser: val }));
                    }}
                    placeholder="VD: Chrome Enterprise Kiosk v120+"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${c.border}`,
                      backgroundColor: c.bgCard,
                      color: c.fg,
                      fontSize: '13px',
                    }}
                  />
                </FormField>
              </div>
            )}
          </div>

          {/* Footer nút bấm */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '12px',
            }}
          >
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy Bỏ
            </Button>
            <Button
              variant="primary"
              type="submit"
              onClick={handleSubmit}
              loading={submitting}
            >
              {isEditing ? 'Lưu Thay Đổi' : 'Tạo Chi Nhánh'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}