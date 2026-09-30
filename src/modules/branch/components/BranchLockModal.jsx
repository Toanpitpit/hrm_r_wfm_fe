import React, { useState, useEffect, useRef } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import LockBlockersList from './LockBlockersList';
import LockConfigForm from './LockConfigForm';
import { useBranchLockCheck } from '../hooks/useBranchLockCheck';
import { useLockBranch } from '../hooks/useLockBranch';

/**
 * COMPONENT: BranchLockModal.jsx
 * Luồng Khóa Chi Nhánh (Modal nhiều bước):
 * - Bước 1: Kiểm tra điều kiện (GET /api/branches/{id}/lock-check)
 * - Bước 2: Cấu hình khóa (Lý do, Xử lý nhân sự, Ca tương lai, Khớp mã chi nhánh)
 * - Bước 3: Gửi yêu cầu khóa (POST /api/branches/{id}/lock)
 */
export default function BranchLockModal({
  open = false,
  branch = null,
  activeBranches = [],
  onClose,
  onSuccess,
}) {
  const { c, fonts } = useAdminTheme();

  // Quản lý bước hiện tại: 1 = Kiểm tra điều kiện, 2 = Cấu hình khóa
  const [step, setStep] = useState(1);

  // Form data cho Bước 2
  const [formData, setFormData] = useState({
    reason: '',
    confirmBranchCode: '',
    staffHandlingMode: 'HOLD',
    transferToBranchId: null,
    futureShiftHandling: 'CANCEL',
  });
  const [formErrors, setFormErrors] = useState({});
  const [serverMessage, setServerMessage] = useState(null);

  // Hooks nghiệp vụ
  const {
    loading: checking,
    data: checkData,
    checkLock,
    setData: setCheckData,
  } = useBranchLockCheck();

  const {
    loading: locking,
    lock,
    error: lockError,
    setError: setLockError,
  } = useLockBranch();

  // Focus trap ref
  const modalContainerRef = useRef(null);

  // Khởi tạo hoặc reset trạng thái khi mở modal
  useEffect(() => {
    if (open && branch) {
      setStep(1);
      setFormData({
        reason: '',
        confirmBranchCode: '',
        staffHandlingMode: 'HOLD',
        transferToBranchId: null,
        futureShiftHandling: 'CANCEL',
      });
      setFormErrors({});
      setServerMessage(null);
      setLockError(null);

      // Gọi API kiểm tra điều kiện ngay khi mở modal
      checkLock(branch.storeId || branch.id);
    }
  }, [open, branch, checkLock, setLockError]);

  // Focus trap: giữ tiêu điểm phím Tab bên trong modal
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Tab' && modalContainerRef.current) {
        const focusableElements = modalContainerRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, step]);

  if (!branch) return null;

  const branchCode = branch.branchCode || branch.code || '';
  const canLock = checkData?.canLock === true;
  const blockers = checkData?.blockers || [];
  const affectedEmployeeCount = checkData?.affectedEmployeeCount ?? 0;

  // Cập nhật giá trị trong Form Bước 2
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
    if (serverMessage) setServerMessage(null);
  };

  const needsTarget =
    formData.staffHandlingMode === 'TRANSFER' ||
    formData.staffHandlingMode === 'TransferTemporarily' ||
    (formData.futureShiftHandling || '').toUpperCase() === 'TRANSFER';

  // Xác thực Form Bước 2
  const validateForm = () => {
    const errs = {};
    const reasonTrimmed = (formData.reason || '').trim();

    if (!reasonTrimmed) {
      errs.reason = 'Vui lòng nhập lý do khóa chi nhánh.';
    } else if (reasonTrimmed.length < 10) {
      errs.reason = 'Lý do khóa phải có tối thiểu 10 ký tự.';
    } else if (reasonTrimmed.length > 500) {
      errs.reason = 'Lý do khóa không được vượt quá 500 ký tự.';
    }

    if (needsTarget && !formData.transferToBranchId) {
      errs.transferToBranchId = 'Vui lòng chọn chi nhánh đích để điều chuyển.';
    }

    if (formData.confirmBranchCode !== branchCode) {
      errs.confirmBranchCode = `Vui lòng nhập chính xác mã "${branchCode}".`;
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Xử lý gửi API khóa chi nhánh (Bước 3)
  const handleSubmitLock = async () => {
    if (!validateForm()) return;

    setServerMessage(null);
    setLockError(null);

    const staffMode =
      formData.staffHandlingMode === 'TRANSFER' || formData.staffHandlingMode === 'TransferTemporarily'
        ? 'TransferTemporarily'
        : 'KeepAndBlock';

    const futureShiftMode =
      (formData.futureShiftHandling || '').toUpperCase() === 'TRANSFER'
        ? 'Transfer'
        : (formData.futureShiftHandling || '').toUpperCase() === 'SUSPEND'
        ? 'Suspend'
        : 'Cancel';

    const res = await lock(branch.storeId || branch.id, {
      reason: formData.reason.trim(),
      confirmBranchCode: formData.confirmBranchCode,
      staffHandlingMode: staffMode,
      transferToBranchId: needsTarget && formData.transferToBranchId ? Number(formData.transferToBranchId) : null,
      futureShiftHandling: futureShiftMode,
    });

    if (res.success) {
      // Thành công: đóng modal và thông báo
      onSuccess && onSuccess(branch, formData.reason.trim());
      onClose();
    } else if (res.status === 409) {
      // Lỗi 409 Conflict: quay lại bước 1 và cập nhật danh sách blockers mới
      setStep(1);
      setCheckData({
        canLock: false,
        blockers: res.blockers || [
          {
            code: 'CONFLICT_STATE',
            message: res.message || 'Trạng thái chi nhánh đã thay đổi trên hệ thống',
            count: 1,
            items: [],
          },
        ],
        affectedEmployeeCount,
      });
      setServerMessage({
        type: 'warning',
        text: 'Đã phát sinh điều kiện chặn mới (409 Conflict). Vui lòng kiểm tra lại trước khi khóa.',
      });
    } else {
      // Lỗi 400 hoặc 403: hiển thị thông báo lỗi ngay trong modal
      setServerMessage({
        type: 'error',
        text: res.message || 'Đã có lỗi xảy ra khi thực hiện khóa chi nhánh.',
      });
    }
  };

  // Kiểm tra điều kiện bật nút "Xác nhận khóa"
  const isConfirmDisabled =
    formData.confirmBranchCode !== branchCode ||
    (formData.reason || '').trim().length < 10 ||
    (formData.reason || '').trim().length > 500 ||
    (needsTarget && !formData.transferToBranchId) ||
    locking;

  return (
    <Modal
      open={open}
      onClose={() => !locking && onClose()}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="lock" size={16} color="#ef4444" />
          </div>
          <div>
            <span>Khóa Chi Nhánh: </span>
            <span style={{ color: c.accent }}>{branch.name}</span>
          </div>
        </div>
      }
      sub={`Mã CN: ${branchCode} · Thao tác yêu cầu kiểm tra điều kiện hệ thống`}
      width={step === 1 ? '560px' : '620px'}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ fontSize: '12px', color: c.fgSubtle, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: step === 1 ? c.accent : 'rgba(16, 185, 129, 0.2)',
                color: step === 1 ? '#ffffff' : '#10b981',
                fontSize: '11px',
                fontWeight: 700,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              1
            </span>
            <span style={{ fontWeight: step === 1 ? 600 : 400, color: step === 1 ? c.fg : c.fgSubtle }}>
              Kiểm tra
            </span>
            <span>→</span>
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: step === 2 ? c.accent : `${c.border}`,
                color: step === 2 ? '#ffffff' : c.fgFaint,
                fontSize: '11px',
                fontWeight: 700,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              2
            </span>
            <span style={{ fontWeight: step === 2 ? 600 : 400, color: step === 2 ? c.fg : c.fgSubtle }}>
              Cấu hình khóa
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {step === 2 && (
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={locking}
              >
                Quay Lại
              </Button>
            )}

            <Button
              variant="outline"
              onClick={onClose}
              disabled={locking}
            >
              Hủy Bỏ
            </Button>

            {step === 1 ? (
              <Button
                variant="primary"
                disabled={!canLock || checking}
                onClick={() => setStep(2)}
                style={{
                  backgroundColor: canLock ? '#dc2626' : undefined,
                  borderColor: canLock ? '#dc2626' : undefined,
                }}
              >
                <span>Tiếp Tục Cấu Hình</span>
                <Icon name="arrow-right" size={14} />
              </Button>
            ) : (
              <Button
                variant="primary"
                loading={locking}
                disabled={isConfirmDisabled}
                onClick={handleSubmitLock}
                style={{
                  backgroundColor: isConfirmDisabled ? undefined : '#dc2626',
                  borderColor: isConfirmDisabled ? undefined : '#dc2626',
                }}
              >
                <Icon name="lock" size={14} />
                <span>Xác Nhận Khóa</span>
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div ref={modalContainerRef} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Banner thông báo lỗi server (400, 403, 409) */}
        {serverMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor:
                serverMessage.type === 'warning'
                  ? 'rgba(245, 158, 11, 0.12)'
                  : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${
                serverMessage.type === 'warning'
                  ? 'rgba(245, 158, 11, 0.4)'
                  : 'rgba(239, 68, 68, 0.4)'
              }`,
              color: serverMessage.type === 'warning' ? '#f59e0b' : '#ef4444',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <Icon
              name="alert-triangle"
              size={16}
              color={serverMessage.type === 'warning' ? '#f59e0b' : '#ef4444'}
            />
            <span>{serverMessage.text}</span>
          </div>
        )}

        {/* ==================== BƯỚC 1: KIỂM TRA ĐIỀU KIỆN ==================== */}
        {step === 1 && (
          <>
            {checking ? (
              /* Loading Skeleton */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px 0' }}>
                <div
                  style={{
                    height: '52px',
                    borderRadius: '8px',
                    backgroundColor: c.track,
                    animation: 'lx-pulse 1.4s infinite ease-in-out',
                  }}
                />
                <div
                  style={{
                    height: '70px',
                    borderRadius: '8px',
                    backgroundColor: c.track,
                    animation: 'lx-pulse 1.4s infinite ease-in-out',
                  }}
                />
                <div
                  style={{
                    height: '40px',
                    width: '60%',
                    borderRadius: '8px',
                    backgroundColor: c.track,
                    animation: 'lx-pulse 1.4s infinite ease-in-out',
                  }}
                />
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: '12.5px',
                    color: c.fgSubtle,
                    marginTop: '8px',
                  }}
                >
                  Đang kiểm tra ca làm việc, phiên đăng nhập Kiosk và kiểm kê tài sản...
                </div>
              </div>
            ) : canLock ? (
              /* Đủ điều kiện khóa (canLock = true) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#10b981',
                  }}
                >
                  <div style={{ marginTop: '2px', flexShrink: 0 }}>
                    <Icon name="check-circle" size={20} color="#10b981" />
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    <strong style={{ display: 'block', color: '#10b981', fontSize: '14px' }}>
                      Chi nhánh đủ điều kiện để thực hiện khóa
                    </strong>
                    <span style={{ color: c.fg, marginTop: '4px', display: 'block' }}>
                      Không có ca làm việc nào đang chạy và không có kiểm kê dở dang.
                    </span>
                  </div>
                </div>

                {/* Thông báo nhân viên bị ảnh hưởng */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    backgroundColor: c.bgElev,
                    border: `1px solid ${c.border}`,
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: `${c.accent}18`,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="users" size={18} color={c.accent} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', color: c.fgSubtle }}>
                      Nhân sự chi nhánh bị tác động
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: c.fg, marginTop: '2px' }}>
                      Có <span style={{ color: c.accent }}>{affectedEmployeeCount}</span> nhân viên bị ảnh hưởng khi chi nhánh tạm dừng.
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12.5px', color: c.fgSubtle, lineHeight: '1.5', padding: '0 4px' }}>
                  Nhấn <strong>"Tiếp Tục Cấu Hình"</strong> để thiết lập phương án luân chuyển nhân sự và xử lý các ca đã phân lịch trong tương lai.
                </div>
              </div>
            ) : (
              /* Có Blockers (canLock = false) */
              <LockBlockersList
                blockers={blockers}
                onRecheck={() => checkLock(branch.storeId || branch.id)}
                rechecking={checking}
              />
            )}
          </>
        )}

        {/* ==================== BƯỚC 2: CẤU HÌNH KHÓA ==================== */}
        {step === 2 && (
          <LockConfigForm
            branch={branch}
            activeBranches={activeBranches}
            formData={formData}
            onChange={handleFormChange}
            errors={formErrors}
          />
        )}
      </div>
    </Modal>
  );
}
