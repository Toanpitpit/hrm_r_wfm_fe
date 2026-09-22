import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
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
}) {
  const { c, fonts } = useAdminTheme();
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
    importRequestId: '',
    expansionReason: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Quản lý Quota và Đơn mở rộng của Chi nhánh đang chọn
  const [branchQuota, setBranchQuota] = useState(null);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [loadingQuota, setLoadingQuota] = useState(false);

  // Tính toán trạng thái đạt trần định biên chuẩn
  const isStandardQuotaReached = Boolean(
    branchQuota &&
    (branchQuota.isStandardQuotaReached ?? branchQuota.isQuotaReached ?? (branchQuota.currentHeadcount >= branchQuota.standardQuota))
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
        importRequestId: initialData.importRequestId ? String(initialData.importRequestId) : '',
        expansionReason: initialData.expansionReason || '',
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
        importRequestId: '',
        expansionReason: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen, isStoreManager, currentStoreBranchId]);

  // Tải thông tin định biên khi chọn chi nhánh (khi tạo mới)
  useEffect(() => {
    const targetBranchId = formData.branchId || formData.homeBranchId;
    if (!targetBranchId || isEdit || !isOpen) return;

    let mounted = true;
    const fetchQuota = async () => {
      setLoadingQuota(true);
      try {
        const foundBranch = branches.find((b) => String(b.id || b.storeId) === String(targetBranchId));
        const tier = foundBranch?.branchTier || foundBranch?.tier || 2;
        const [quotaRes, reqsRes] = await Promise.all([
          headcountService.getBranchHeadcountStatus(targetBranchId, tier),
          headcountService.getAvailableRequests(targetBranchId),
        ]);
        if (mounted) {
          if (quotaRes.success) setBranchQuota(quotaRes.data);
          if (reqsRes.success) {
            setAvailableRequests(reqsRes.data);
            // Tự động chọn đơn đầu tiên nếu có và chưa chọn
            if (reqsRes.data.length > 0) {
              setFormData((prev) => ({
                ...prev,
                importRequestId: prev.importRequestId || String(reqsRes.data[0].id),
                expansionReason: prev.expansionReason || reqsRes.data[0].reason || '',
              }));
            }
          }
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

    // Kiểm tra Quota nếu chi nhánh đã đạt trần định biên chuẩn
    if (!isEdit && isStandardQuotaReached) {
      if (!formData.importRequestId) {
        errs.importRequestId = 'Chi nhánh đã đạt trần định biên. Bắt buộc phải chọn Đơn Mở Rộng Định Biên đã duyệt.';
      }
      if (!formData.expansionReason?.trim()) {
        errs.expansionReason = 'Vui lòng nhập lý do bổ sung nhân sự vượt định biên chuẩn.';
      }
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
      if (field === 'importRequestId') {
        const foundReq = availableRequests.find((r) => String(r.id) === String(val));
        if (foundReq && !prev.expansionReason) {
          updated.expansionReason = foundReq.reason;
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
      ? 'Khai Báo Nhân Sự Chi Nhánh (Tự Động Gửi Welcome Email)'
      : 'Khai Báo Hồ Sơ Nhân Sự Chuỗi Bán Lẻ (RBAC)';

  const sub = isEdit
    ? 'Chỉnh sửa thông tin liên hệ, chi nhánh công tác và hình thức hợp đồng lao động.'
    : 'Hệ thống tự động băm mật khẩu bảo mật và kích hoạt gửi Welcome Email có thông tin tài khoản & link đăng nhập.';

  const isBlockedByQuota = !isEdit && isStandardQuotaReached && availableRequests.length === 0;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={title}
      sub={sub}
      width={680}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          {isBlockedByQuota ? (
            <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>
              * Chi nhánh đã đầy định biên và không có đơn mở rộng khả dụng.
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
              disabled={submitting || isBlockedByQuota}
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

        {/* Thông tin Định Biên Chi Nhánh & Đơn Mở Rộng (Khi Tạo Mới) */}
        {!isEdit && branchQuota && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: isStandardQuotaReached
                ? 'rgba(245, 158, 11, 0.08)'
                : 'rgba(34, 197, 94, 0.08)',
              border: `1px solid ${isStandardQuotaReached
                  ? 'rgba(245, 158, 11, 0.3)'
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
                  name={isStandardQuotaReached ? 'warning' : 'check'}
                  size={16}
                  color={isStandardQuotaReached ? '#f59e0b' : '#22c55e'}
                />
                <span style={{ color: isStandardQuotaReached ? '#fde047' : '#86efac' }}>
                  Định biên Chi nhánh: {branchQuota.currentHeadcount} / {branchQuota.standardQuota} nhân sự (Tier {branchQuota.branchTier})
                </span>
              </div>
              <span style={{ fontSize: '11.5px', color: c.fgSubtle }}>
                {branchQuota.inactiveCount > 0 ? `Đã nghỉ: ${branchQuota.inactiveCount} (Đã dôi dư vị trí)` : ''}
              </span>
            </div>

            {/* Chi nhánh còn định biên chuẩn */}
            {!isStandardQuotaReached ? (
              <p style={{ margin: 0, fontSize: '12px', color: c.fgSubtle }}>
                Định biên chuẩn còn trống{' '}
                <strong style={{ color: '#22c55e' }}>
                  {branchQuota.standardQuota - branchQuota.currentHeadcount} vị trí
                </strong>
                . Bạn có thể khai báo trực tiếp bù đắp định biên mà không cần gắn đơn ngoại lệ.
              </p>
            ) : (
              /* Chi nhánh đã đầy định biên */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#fde047' }}>
                  <strong>Lưu ý:</strong> Chi nhánh đã đạt tối đa định biên chuẩn. Khai báo nhân viên này sẽ được tính vào{' '}
                  <strong>Định biên mở rộng</strong> và bắt buộc phải gắn mã Đơn Đề Xuất đã được duyệt.
                </p>

                {availableRequests.length === 0 ? (
                  <div
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#fca5a5',
                    }}
                  >
                    Chi nhánh này chưa có Đơn Mở Rộng Định Biên nào khả dụng. Vui lòng thẩm định đơn đề xuất trước khi tiếp tục khai báo.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Field label="Chọn Đơn Mở Rộng Định Biên Đã Duyệt *" required error={errors.importRequestId}>
                      <select
                        value={formData.importRequestId}
                        onChange={(e) => handleChange('importRequestId', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          background: c.bgRaised,
                          border: `1px solid ${errors.importRequestId ? '#ef4444' : c.border}`,
                          borderRadius: '6px',
                          color: c.fg,
                          fontSize: '12.5px',
                          outline: 'none',
                        }}
                      >
                        <option value="">-- Chọn đơn mở rộng khả dụng --</option>
                        {availableRequests.map((req) => (
                          <option key={req.id} value={String(req.id)}>
                            Đơn #{req.id} - Còn {req.additionalQuantity} slot ({req.reason?.slice(0, 30)}...)
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Lý Do Bổ Sung Vượt Quota *" required error={errors.expansionReason}>
                      <TextInput
                        value={formData.expansionReason}
                        onChange={(e) => handleChange('expansionReason', e.target.value)}
                        placeholder="VD: Mở rộng quầy ca tối"
                      />
                    </Field>
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
