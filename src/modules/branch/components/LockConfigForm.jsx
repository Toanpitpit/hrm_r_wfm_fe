import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { Field as FormField } from '@/shared/components/ui/FormField';
import Select from '@/shared/components/ui/Select';
import Icon from '@/shared/components/ui/Icon';

/**
 * COMPONENT: LockConfigForm.jsx
 * Bước 2 trong luồng Khóa chi nhánh:
 * - Textarea "Lý do khóa" (10-500 ký tự, có đếm ký tự)
 * - Radio "Xử lý nhân sự" (HOLD | TRANSFER) + Select chi nhánh đích nếu chọn TRANSFER
 * - Select "Ca đã xếp trong tương lai" (CANCEL | TRANSFER | SUSPEND)
 * - Input "Gõ mã chi nhánh <CODE> để xác nhận"
 */
export default function LockConfigForm({
  branch,
  activeBranches = [],
  formData,
  onChange,
  errors = {},
}) {
  const { c, fonts } = useAdminTheme();

  const branchCode = branch?.branchCode || branch?.code || '';
  const reasonLength = (formData.reason || '').length;

  // Lọc danh sách chi nhánh điều chuyển: chỉ lấy chi nhánh ĐANG HOẠT ĐỘNG và LOẠI BỎ chi nhánh hiện tại
  const transferOptions = activeBranches
    .filter(
      (b) =>
        String(b.storeId) !== String(branch?.storeId) &&
        (b.status || '').toUpperCase() === 'ACTIVE'
    )
    .map((b) => ({
      value: b.storeId,
      label: `${b.name} (${b.branchCode})`,
    }));

  const needsTransferBranch =
    formData.staffHandlingMode === 'TRANSFER' ||
    formData.staffHandlingMode === 'TransferTemporarily' ||
    (formData.futureShiftHandling || '').toUpperCase() === 'TRANSFER';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Lý do khóa chi nhánh */}
      <FormField
        label="Lý do khóa chi nhánh"
        required
        error={errors.reason}
        hint={
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 600,
              color:
                reasonLength > 500
                  ? '#ef4444'
                  : reasonLength >= 10
                  ? c.accent
                  : c.fgFaint,
            }}
          >
            {reasonLength}/500 ký tự {reasonLength < 10 && '(tối thiểu 10)'}
          </span>
        }
      >
        <textarea
          rows={3}
          value={formData.reason || ''}
          onChange={(e) => onChange('reason', e.target.value)}
          placeholder="Nhập lý do chi tiết (VD: Sửa chữa nâng cấp mặt bằng, bảo trì hệ thống hạ tầng hoặc tạm dừng kinh doanh theo kế hoạch...)"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: `1.5px solid ${errors.reason ? '#ef4444' : c.border}`,
            backgroundColor: c.bgCard,
            color: c.fg,
            fontSize: '13px',
            fontFamily: fonts.body,
            outline: 'none',
            resize: 'vertical',
            lineHeight: '1.5',
            boxSizing: 'border-box',
            transition: 'border-color .15s ease',
          }}
        />
      </FormField>

      {/* 2. Phương án Xử lý nhân sự */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: c.fg }}>
            Xử lý nhân sự <span style={{ color: '#ef4444' }}>*</span>
          </span>
          <span style={{ fontSize: '11.5px', color: c.fgFaint }}>
            Quy tắc tác động tới tài khoản nhân viên
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Option 1: Giữ nguyên tại chi nhánh */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: formData.staffHandlingMode === 'HOLD' ? `${c.accent}12` : c.bgElev,
              border: `1.5px solid ${formData.staffHandlingMode === 'HOLD' ? c.accent : c.border}`,
              cursor: 'pointer',
              transition: 'all .15s ease',
            }}
          >
            <input
              type="radio"
              name="staffHandlingMode"
              value="HOLD"
              checked={formData.staffHandlingMode === 'HOLD'}
              onChange={() => onChange('staffHandlingMode', 'HOLD')}
              style={{ marginTop: '3px', accentColor: c.accent, cursor: 'pointer' }}
            />
            <div style={{ fontSize: '12.5px', lineHeight: '1.4' }}>
              <strong style={{ color: c.fg, display: 'block' }}>
                Giữ nguyên tại chi nhánh, chặn chấm công và đăng nhập
              </strong>
              <span style={{ color: c.fgSubtle, fontSize: '12px' }}>
                Nhân sự vẫn thuộc chi nhánh này nhưng bị tạm ngắt quyền check-in và truy cập trạm Kiosk.
              </span>
            </div>
          </label>

          {/* Option 2: Điều chuyển tạm sang chi nhánh khác */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: formData.staffHandlingMode === 'TRANSFER' ? `${c.accent}12` : c.bgElev,
              border: `1.5px solid ${formData.staffHandlingMode === 'TRANSFER' ? c.accent : c.border}`,
              cursor: 'pointer',
              transition: 'all .15s ease',
            }}
          >
            <input
              type="radio"
              name="staffHandlingMode"
              value="TRANSFER"
              checked={formData.staffHandlingMode === 'TRANSFER'}
              onChange={() => onChange('staffHandlingMode', 'TRANSFER')}
              style={{ marginTop: '3px', accentColor: c.accent, cursor: 'pointer' }}
            />
            <div style={{ fontSize: '12.5px', lineHeight: '1.4', flex: 1 }}>
              <strong style={{ color: c.fg, display: 'block' }}>
                Điều chuyển tạm sang chi nhánh khác
              </strong>
              <span style={{ color: c.fgSubtle, fontSize: '12px' }}>
                Phân bổ toàn bộ nhân sự sang một chi nhánh đang hoạt động trong mạng lưới để tiếp tục ca làm.
              </span>
            </div>
          </label>
        </div>

        {/* Dropdown chọn chi nhánh đích nếu chọn TRANSFER nhân sự hoặc ca tương lai */}
        {needsTransferBranch && (
          <div
            style={{
              marginTop: '4px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: c.bgRaised,
              border: `1.5px solid ${errors.transferToBranchId ? '#ef4444' : c.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: c.fg }}>
              Chọn chi nhánh nhận điều chuyển nhân sự / ca tương lai <span style={{ color: '#ef4444' }}>*</span>
            </div>
            {transferOptions.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#f59e0b' }}>
                Hiện không có chi nhánh nào khác đang ở trạng thái Hoạt động.
              </div>
            ) : (
              <Select
                value={formData.transferToBranchId || ''}
                onChange={(val) => onChange('transferToBranchId', val ? Number(val) : null)}
                options={[{ value: '', label: '-- Chọn chi nhánh tiếp nhận --' }, ...transferOptions]}
                width="100%"
              />
            )}
            {errors.transferToBranchId && (
              <span style={{ fontSize: '12px', color: '#ef4444' }}>
                {errors.transferToBranchId}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Ca đã xếp trong tương lai */}
      <FormField
        label="Ca đã xếp trong tương lai"
        required
        hint="Chính sách xử lý lịch làm việc đã lập"
      >
        <Select
          value={formData.futureShiftHandling || 'CANCEL'}
          onChange={(val) => onChange('futureShiftHandling', val)}
          options={[
            { value: 'CANCEL', label: 'Hủy toàn bộ các ca làm việc trong tương lai' },
            { value: 'TRANSFER', label: 'Chuyển sang chi nhánh khác cùng lịch trình' },
            { value: 'SUSPEND', label: 'Giữ ở trạng thái treo (Pending review)' },
          ]}
          width="100%"
        />
      </FormField>

      {/* 4. Xác nhận mã chi nhánh */}
      <div
        style={{
          padding: '12px 14px',
          borderRadius: '10px',
          backgroundColor: c.bgElev,
          border: `1px solid ${c.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: c.fg }}>
            Xác nhận mã chi nhánh <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: 700,
              color: c.accent,
              backgroundColor: `${c.accent}18`,
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            {branchCode}
          </span>
        </div>

        <div style={{ fontSize: '12px', color: c.fgSubtle }}>
          Gõ chính xác mã chi nhánh <strong>{branchCode}</strong> để mở khóa nút xác nhận:
        </div>

        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={formData.confirmBranchCode || ''}
            onChange={(e) => onChange('confirmBranchCode', e.target.value.toUpperCase().trim())}
            placeholder={`Gõ "${branchCode}" để xác nhận`}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: `1.5px solid ${
                formData.confirmBranchCode === branchCode
                  ? '#10b981'
                  : formData.confirmBranchCode
                  ? '#f59e0b'
                  : c.border
              }`,
              backgroundColor: c.bgCard,
              color: c.fg,
              fontSize: '13px',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '0.8px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {formData.confirmBranchCode === branchCode && (
            <div
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <Icon name="check" size={14} color="#10b981" />
              <span>Khớp mã</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
