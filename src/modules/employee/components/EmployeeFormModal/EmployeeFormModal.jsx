import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { useToast } from '@/components/ui/toast/ToastProvider';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import { Field, TextInput } from '@/shared/components/ui/FormField';
import { CONTRACT_TYPES, STORE_ROLES } from '../../services/employee.service';
import headcountService from '../../services/headcount.service';

export default function EmployeeFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null, // null => Create mode, object => Edit mode
  roles = [],
  branches = [],
  canManageSystem = false, // True for Admin & Business Owner
  isStoreManager = false,
  currentStoreBranchId = null,
  currentStoreBranchName = '',
  onBranchTierUpgraded,
}) {
  const { c, fonts } = useAdminTheme();
  const toast = useToast();
  const isEdit = Boolean(initialData && initialData.id);

  const [formData, setFormData] = useState({
    employeeCode: '',
    fullName: '',
    email: '',
    phone: '',
    roleId: '',
    roleCode: '',
    roleName: '',
    homeBranchId: '',
    branchId: '',
    branchName: '',
    contractType: 'FULL_TIME',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Quản lý Effective Quota của Chi nhánh đang chọn
  const [branchQuota, setBranchQuota] = useState(null);
  const [loadingQuota, setLoadingQuota] = useState(false);
  const [upgradingTier, setUpgradingTier] = useState(false);

  // Tính toán trạng thái đạt trần định biên hiệu dụng
  const isQuotaReached = Boolean(
    branchQuota &&
    (branchQuota.isQuotaReached ?? branchQuota.isStandardQuotaReached ?? false)
  );

  // Phân quyền chọn Vai trò:
  // Store Manager chỉ được tạo 4 vai trò vận hành (không được tạo Admin hoặc Store Manager khác)
  // Admin & Business Owner được tạo cả 5 vai trò cửa hàng
  const availableRoles = (roles.length > 0 ? roles : STORE_ROLES).filter((r) => {
    if (isStoreManager) {
      return !['OPERATIONS_ADMIN', 'STORE_MANAGER', 'BUSINESS_OWNER'].includes(r.roleCode);
    }
    return true;
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        employeeCode: initialData.employeeCode || '',
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        roleId: initialData.roleId ? String(initialData.roleId) : '',
        roleCode: initialData.roleCode || '',
        roleName: initialData.roleName || '',
        homeBranchId: initialData.homeBranchId || initialData.branchId ? String(initialData.homeBranchId || initialData.branchId) : '',
        branchId: initialData.homeBranchId || initialData.branchId ? String(initialData.homeBranchId || initialData.branchId) : '',
        branchName: initialData.branchName || currentStoreBranchName || '',
        contractType: initialData.contractType || 'FULL_TIME',
        password: '',
      });
    } else {
      const defaultBranchId = isStoreManager && currentStoreBranchId
        ? String(currentStoreBranchId)
        : branches[0]?.id || branches[0]?.storeId
          ? String(branches[0].id || branches[0].storeId)
          : '1';

      const defaultBranch = branches.find(
        (b) => String(b.id || b.storeId) === String(defaultBranchId)
      );

      const defaultRole = availableRoles[0] || STORE_ROLES[1]; // Shift Leader or Cashier

      setFormData({
        employeeCode: `NV-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: '',
        email: '',
        phone: '',
        roleId: defaultRole?.id ? String(defaultRole.id) : '5',
        roleCode: defaultRole?.roleCode || 'CASHIER',
        roleName: defaultRole?.roleName || 'Nhân Viên Thu Ngân',
        homeBranchId: defaultBranchId,
        branchId: defaultBranchId,
        branchName: defaultBranch?.name || currentStoreBranchName || 'Chi nhánh Cửa Hàng',
        contractType: 'FULL_TIME',
        password: `Rwfm@${Math.floor(100000 + Math.random() * 900000)}`,
      });
    }
    setErrors({});
  }, [initialData, isOpen, isStoreManager, currentStoreBranchId]);

  // Tải Effective Quota khi chọn chi nhánh (khi tạo mới)
  useEffect(() => {
    const targetBranchId = formData.branchId || formData.homeBranchId;
    if (!targetBranchId || isEdit || !isOpen) return;

    let mounted = true;
    const fetchQuota = async () => {
      setLoadingQuota(true);
      try {
        const foundBranch = branches.find((b) => String(b.id || b.storeId) === String(targetBranchId));
        const tier = foundBranch?.branchTier || foundBranch?.tier || 2;
        const quotaRes = await headcountService.getBranchHeadcountStatus(targetBranchId, tier);
        if (mounted && quotaRes.success) {
          setBranchQuota(quotaRes.data);
        }
      } catch (err) {
        console.warn('Lỗi khi tải quota chi nhánh:', err);
      } finally {
        if (mounted) setLoadingQuota(false);
      }
    };

    fetchQuota();
    return () => {
      mounted = false;
    };
  }, [formData.branchId, formData.homeBranchId, branches, isEdit, isOpen]);

  const handleUpgradeTier = async () => {
    const targetBranchId = formData.branchId || formData.homeBranchId;
    if (!targetBranchId) return;

    setUpgradingTier(true);
    try {
      const res = await headcountService.upgradeBranchTier(targetBranchId);
      if (res.success) {
        toast.success(res.message || 'Nâng cấp phân cấp chi nhánh thành công!');
        const nextTier = branchQuota?.nextTier || (branchQuota?.branchTier === 3 ? 2 : 1);
        const quotaRes = await headcountService.getBranchHeadcountStatus(targetBranchId, nextTier);
        if (quotaRes.success) {
          setBranchQuota(quotaRes.data);
        }
        if (onBranchTierUpgraded) {
          onBranchTierUpgraded(targetBranchId);
        }
      } else {
        toast.error(res.message || 'Không thể nâng Tier chi nhánh');
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi nâng cấp Tier chi nhánh');
    } finally {
      setUpgradingTier(false);
    }
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'Rwfm@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pass }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Họ và tên không được để trống.';
    }
    if (!formData.employeeCode.trim()) {
      errs.employeeCode = 'Mã nhân viên không được để trống.';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Số điện thoại không được để trống.';
    } else if (!/^[0-9+]{9,12}$/.test(formData.phone.trim())) {
      errs.phone = 'Số điện thoại không hợp lệ (9 - 12 chữ số).';
    }

    if (!formData.email.trim()) {
      errs.email = 'Vui lòng nhập email để hệ thống gửi Welcome Email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Định dạng email không hợp lệ.';
    }

    if (!isEdit && !formData.password) {
      errs.password = 'Vui lòng cung cấp mật khẩu khởi tạo cho nhân sự.';
    }

    if (!formData.roleId) {
      errs.roleId = 'Vui lòng chọn vai trò làm việc.';
    }

    if (!formData.homeBranchId && !formData.branchId) {
      errs.branchId = 'Bắt buộc phải chọn chi nhánh công tác hợp lệ.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, val) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: val };
      if (field === 'roleId') {
        const found = availableRoles.find((r) => String(r.id) === String(val) || r.roleCode === val);
        if (found) {
          updated.roleCode = found.roleCode;
          updated.roleName = found.roleName;
        }
      }
      if (field === 'branchId' || field === 'homeBranchId') {
        updated.homeBranchId = val;
        updated.branchId = val;
        const foundB = branches.find((b) => String(b.id || b.storeId) === String(val));
        if (foundB) {
          updated.branchName = foundB.name;
        }
      }
      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData, isEdit);
      onClose();
    } catch (err) {
      console.error('Submit employee error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const title = isEdit
    ? `Cập Nhật Hồ Sơ Nhân Sự: ${initialData?.fullName || ''}`
    : isStoreManager
      ? 'Khai Báo Nhân Sự Chi Nhánh'
      : 'Khai Báo Hồ Sơ Nhân Sự Chuỗi Bán Lẻ ';

  const sub = isEdit
    ? 'Chỉnh sửa thông tin liên hệ, chi nhánh công tác và hình thức hợp đồng lao động.'
    : 'Hệ thống tự động băm mật khẩu bảo mật và kích hoạt gửi Welcome Email có thông tin tài khoản & link đăng nhập.';

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={title}
      sub={sub}
      width={680}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          {!isEdit && isQuotaReached ? (
            <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="warning" size={14} color="#ef4444" />
              {branchQuota?.canUpgradeTier
                ? `Đã đầy định biên (${branchQuota?.currentHeadcount}/${branchQuota?.standardQuota}). Vui lòng nâng Tier ở trên để tuyển thêm.`
                : `Chi nhánh đã đạt kịch trần tối đa Tier 1 (30/30). Không thể tuyển thêm.`}
            </span>
          ) : (
            <div />
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="ghost" onClick={onClose} disabled={submitting}>
              Hủy Bỏ
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting || (!isEdit && isQuotaReached)}
              title={(!isEdit && isQuotaReached) ? 'Vui lòng nâng Tier chi nhánh trước khi thêm nhân viên' : ''}
            >
              {submitting ? 'Đang xử lý...' : isEdit ? 'Lưu Thay Đổi' : 'Xác Nhận Khai Báo'}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Banner Welcome Email */}
        {!isEdit && (
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12.5px',
              color: '#86efac',
            }}
          >
            <Icon name="check" size={16} color="#22c55e" />
            <span>
              <strong>Tự Động Gửi Welcome Email:</strong> Sau khi khai báo, Backend sẽ tự động gửi thư chào mừng HTML chuyên nghiệp tới Email nhân sự kèm Mã NV, Mật khẩu khởi tạo và đường link đăng nhập.
            </span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Mã nhân viên */}
          <Field label="Mã Định Danh Nhân Viên" required error={errors.employeeCode}>
            <TextInput
              value={formData.employeeCode}
              onChange={(e) => handleChange('employeeCode', e.target.value.toUpperCase())}
              placeholder="VD: NV-001 hoặc SM-001"
              disabled={isEdit}
            />
          </Field>

          {/* Họ và tên */}
          <Field label="Họ và Tên Đầy Đủ" required error={errors.fullName}>
            <TextInput
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="VD: Nguyễn Văn An"
            />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Email */}
          <Field label="Email Nhận Welcome Email" required error={errors.email}>
            <TextInput
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="VD: an.nguyen@rwfm.vn"
            />
          </Field>

          {/* Số điện thoại */}
          <Field label="Số Điện Thoại Liên Hệ" required error={errors.phone}>
            <TextInput
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="VD: 0912345678"
            />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Vai trò (Role) */}
          <Field label="Vai Trò Cửa Hàng (Role)" required error={errors.roleId}>
            <select
              value={formData.roleId}
              onChange={(e) => handleChange('roleId', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: c.bgRaised,
                border: `1px solid ${errors.roleId ? '#ef4444' : c.border}`,
                borderRadius: '6px',
                color: c.fg,
                fontSize: '13.5px',
                outline: 'none',
              }}
            >
              <option value="">-- Chọn vai trò --</option>
              {availableRoles
                // Lọc bỏ các vai trò Chủ doanh nghiệp và Admin trước khi render
                .filter((r) => !['BUSINESS_OWNER', 'OPERATIONS_ADMIN', 'ADMIN'].includes(r.roleCode))
                .map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    {r.roleName} ({r.roleCode})
                  </option>
                ))}
            </select>
          </Field>

          {/* Chi nhánh công tác */}
          <Field
            label="Chi Nhánh Công Tác (Bắt buộc)"
            required
            hint={isStoreManager ? 'Cố định chi nhánh của bạn' : ''}
            error={errors.branchId}
          >
            <select
              value={formData.branchId || formData.homeBranchId}
              onChange={(e) => handleChange('branchId', e.target.value)}
              disabled={isStoreManager}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: isStoreManager ? c.track : c.bgRaised,
                border: `1px solid ${errors.branchId ? '#ef4444' : c.border}`,
                borderRadius: '6px',
                color: isStoreManager ? c.fgSubtle : c.fg,
                fontSize: '13.5px',
                outline: 'none',
                cursor: isStoreManager ? 'not-allowed' : 'pointer',
              }}
            >
              {branches.map((b) => (
                <option key={b.id || b.storeId} value={String(b.id || b.storeId)}>
                  {b.name || `Chi nhánh #${b.id || b.storeId}`}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Banner Định Biên Chuẩn Theo Phân Cấp Tier (Khi Tạo Mới) */}
        {!isEdit && branchQuota && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '8px',
              background: isQuotaReached
                ? 'rgba(239, 68, 68, 0.08)'
                : 'rgba(34, 197, 94, 0.08)',
              border: `1px solid ${isQuotaReached
                  ? 'rgba(239, 68, 68, 0.35)'
                  : 'rgba(34, 197, 94, 0.3)'
                }`,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                <Icon
                  name={isQuotaReached ? 'warning' : 'check'}
                  size={16}
                  color={isQuotaReached ? '#ef4444' : '#22c55e'}
                />
                <span style={{ color: isQuotaReached ? '#fca5a5' : '#86efac' }}>
                  Định biên Phân Cấp Tier {branchQuota.branchTier}: {branchQuota.currentHeadcount} / {branchQuota.standardQuota} nhân sự
                  {loadingQuota && ' (đang tải...)'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: branchQuota.branchTier === 1 ? '#eab308' : branchQuota.branchTier === 2 ? '#3b82f6' : '#9ca3af',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}
                >
                  Tier {branchQuota.branchTier} (Chuẩn {branchQuota.standardQuota})
                </span>
                {branchQuota.inactiveCount > 0 && (
                  <span style={{ fontSize: '11.5px', color: c.fgSubtle }}>
                    Đã nghỉ: {branchQuota.inactiveCount}
                  </span>
                )}
              </div>
            </div>

            {/* Thông tin slot hoặc Cơ chế Nâng Tier khi kịch biên */}
            {!isQuotaReached ? (
              <p style={{ margin: 0, fontSize: '12.5px', color: c.fgSubtle }}>
                Còn trống{' '}
                <strong style={{ color: '#22c55e' }}>
                  {branchQuota.availableQuotaSlots ?? Math.max(0, branchQuota.standardQuota - branchQuota.currentHeadcount)} vị trí
                </strong>
                . Bạn có thể khai báo nhân viên trực tiếp.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#fca5a5', lineHeight: '1.45' }}>
                  <strong>Chi nhánh đã đạt trần kịch biên:</strong> Quân số hiện tại là {branchQuota.currentHeadcount}/{branchQuota.standardQuota} nhân sự của Tier {branchQuota.branchTier}.
                  {branchQuota.canUpgradeTier ? (
                    <> Để tuyển thêm nhân sự, Quản trị viên cần thực hiện <strong>nâng phân cấp chi nhánh lên Tier {branchQuota.nextTier}</strong> (mở rộng định biên lên {branchQuota.nextTierQuota} nhân sự).</>
                  ) : (
                    <> Chi nhánh đã ở mức tối đa toàn chuỗi (<strong>Tier 1: 30/30 nhân sự kịch trần</strong>). Không thể nâng cấp thêm hoặc tuyển thêm nhân sự.</>
                  )}
                </p>

                {branchQuota.canUpgradeTier && canManageSystem && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '2px' }}>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleUpgradeTier}
                      disabled={upgradingTier}
                      style={{
                        background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '12px',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(217, 119, 6, 0.35)',
                      }}
                    >
                      <Icon name="trending-up" size={14} color="#ffffff" />
                      <span>{upgradingTier ? 'Đang nâng cấp...' : `Nâng lên Tier ${branchQuota.nextTier} (${branchQuota.nextTierQuota} nhân sự)`}</span>
                    </Button>
                    <span style={{ fontSize: '11.5px', color: c.fgSubtle }}>
                      Bấm để nâng cấp ngay mà không cần rời khỏi trang
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Hình thức hợp đồng */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Hình Thức Hợp Đồng Lao Động" required>
            <select
              value={formData.contractType}
              onChange={(e) => handleChange('contractType', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: c.bgRaised,
                border: `1px solid ${c.border}`,
                borderRadius: '6px',
                color: c.fg,
                fontSize: '13.5px',
                outline: 'none',
              }}
            >
              {CONTRACT_TYPES.map((ct) => (
                <option key={ct.value} value={ct.value}>
                  {ct.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Mật khẩu khởi tạo (Chỉ khi tạo mới) */}
        {!isEdit && (
          <div
            style={{
              padding: '14px 16px',
              background: 'rgba(242, 202, 80, 0.05)',
              border: `1px solid rgba(242, 202, 80, 0.25)`,
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#f2ca50' }}>
                Mật Khẩu Đăng Nhập Khởi Tạo *
              </span>
              <button
                type="button"
                onClick={handleGeneratePassword}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: c.accent,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Icon name="refresh" size={13} />
                <span>Sinh mật khẩu ngẫu nhiên</span>
              </button>
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Nhập mật khẩu hoặc dùng mật khẩu tự sinh"
                style={{
                  width: '100%',
                  padding: '9px 40px 9px 12px',
                  background: c.bgCard,
                  border: `1px solid ${errors.password ? '#ef4444' : c.border}`,
                  borderRadius: '6px',
                  color: c.fg,
                  fontSize: '13.5px',
                  fontFamily: fonts.mono,
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'transparent',
                  border: 'none',
                  color: c.fgSubtle,
                  cursor: 'pointer',
                }}
              >
                <Icon name="eye" size={16} />
              </button>
            </div>
            {errors.password && (
              <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.password}</span>
            )}
            <span style={{ fontSize: '11.5px', color: c.fgSubtle }}>
              Mật khẩu này sẽ được tự động băm BCrypt an toàn trên Backend và gửi vào nội dung Welcome Email.
            </span>
          </div>
        )}
      </form>
    </Modal>
  );
}
