import headcountService from '../../services/headcount.service';
import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import { Field, TextInput } from '@/shared/components/ui/FormField';

export default function ReviewHeadcountModal({
  isOpen,
  onClose,
  onSubmit,
  request, // HeadcountImportRequest entity
}) {
  const { c, fonts } = useAdminTheme();

  const [decision, setDecision] = useState('APPROVED'); // 'APPROVED' | 'REJECTED'
  const [approvedQuantity, setApprovedQuantity] = useState('1');
  const [expiresAtDays, setExpiresAtDays] = useState('30');
  const [adminNotes, setAdminNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (request) {
      setDecision('APPROVED');
      setApprovedQuantity(String(request.totalRequested || 1));
      setExpiresAtDays('30');
      setAdminNotes(request.adminNotes || '');
      setErrors({});
    }
  }, [request, isOpen]);

  if (!request) return null;

  const validate = () => {
    const errs = {};
    if (decision === 'APPROVED') {
      const qty = parseInt(approvedQuantity, 10);
      if (isNaN(qty) || qty <= 0) {
        errs.approvedQuantity = 'Số lượng phê duyệt phải lớn hơn 0.';
      } else if (qty > (request.totalRequested || 99)) {
        errs.approvedQuantity = `Số lượng duyệt không được vượt quá số lượng đề xuất (${request.totalRequested}).`;
      }

      const days = parseInt(expiresAtDays, 10);
      if (isNaN(days) || days <= 0) {
        errs.expiresAtDays = 'Thời hạn hiệu lực phải lớn hơn 0 ngày.';
      }
    } else {
      if (!adminNotes.trim()) {
        errs.adminNotes = 'Vui lòng cung cấp lý do từ chối đề xuất này.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const days = parseInt(expiresAtDays, 10) || 30;
      const expiryDate = new Date(Date.now() + days * 86400000).toISOString();

      await onSubmit(request.id, {
        isApproved: decision === 'APPROVED',
        status: decision,
        decision,
        approvedQuantity: decision === 'APPROVED' ? parseInt(approvedQuantity, 10) : 0,
        expirationDays: days,
        adminNotes: adminNotes.trim(),
        expiresAt: decision === 'APPROVED' ? expiryDate : null,
      });
      onClose();
    } catch (err) {
      console.error('Review headcount request error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const isPartial = decision === 'APPROVED' && parseInt(approvedQuantity, 10) < (request.totalRequested || 0);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Thẩm Định & Phê Duyệt Đơn Mở Rộng Định Biên"
      sub="Quyết định phê duyệt toàn bộ, phê duyệt một phần hoặc từ chối đề xuất định biên từ Cửa hàng trưởng."
      width={640}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Hủy Bỏ
          </Button>
          <Button
            variant={decision === 'APPROVED' ? 'primary' : 'danger'}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? 'Đang xử lý...'
              : decision === 'APPROVED'
              ? isPartial
                ? 'Xác Nhận Phê Duyệt Một Phần'
                : 'Xác Nhận Phê Duyệt Đơn'
              : 'Xác Nhận Từ Chối Đơn'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Card Tóm tắt Đơn đề xuất */}
        <div
          style={{
            padding: '14px 16px',
            background: c.bgRaised,
            border: `1px solid ${c.border}`,
            borderRadius: '8px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px 18px',
            fontSize: '13px',
          }}
        >
          <div>
            <span style={{ color: c.fgSubtle, display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.03em' }}>
              Chi Nhánh Yêu Cầu
            </span>
            <strong style={{ color: c.fg, fontSize: '13.5px', lineHeight: 1.4, display: 'block' }}>
              {request.branchName || `Chi nhánh #${request.branchId}`}
            </strong>
          </div>
          <div>
            <span style={{ color: c.fgSubtle, display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.03em' }}>
              Người Đề Xuất
            </span>
            <strong style={{ color: c.fg, fontSize: '13.5px', lineHeight: 1.4, display: 'block' }}>
              {request.requestedBy || 'Store Manager'}
            </strong>
          </div>
          <div>
            <span style={{ color: c.fgSubtle, display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.03em' }}>
              Số Lượng Xin Mở Rộng
            </span>
            <div style={{ display: 'flex', alignItems: 'center', minHeight: '30px' }}>
              <strong style={{ color: '#f59e0b', fontSize: '15px' }}>{request.totalRequested} nhân sự</strong>
            </div>
          </div>
          <div>
            <span style={{ color: c.fgSubtle, display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.03em' }}>
              File Đính Kèm
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', minHeight: '30px', flexWrap: 'wrap' }}>
              {/* Icon loại file */}
              <Icon name={headcountService.getFileIcon(request)} size={15} color={c.accent} />
              <span
                style={{
                  fontSize: '12px',
                  color: c.fgMuted,
                  fontWeight: 600,
                  maxWidth: '140px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={request.fileName || 'De_Xuat_Dinh_Bien.xlsx'}
              >
                {request.fileName || 'De_Xuat_Dinh_Bien.xlsx'}
              </span>
              {/* Nút Xem trực tiếp */}
              <button
                type="button"
                onClick={async () => {
                  const result = await headcountService.viewRequestFile(request);
                  if (result && !result.success && result.message) {
                    alert(result.message);
                  }
                }}
                style={{
                  background: 'rgba(13, 148, 136, 0.10)',
                  border: `1px solid rgba(13, 148, 136, 0.30)`,
                  borderRadius: '6px',
                  padding: '4px 8px',
                  color: c.accent,
                  fontWeight: 600,
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                }}
                title="Xem trực tiếp tài liệu (tab mới)"
              >
                <Icon name="eye" size={12} color={c.accent} />
                <span>Xem</span>
              </button>
              {/* Nút Tải về */}
              <button
                type="button"
                onClick={async () => {
                  const result = await headcountService.downloadRequestFile(request);
                  if (result && !result.success && result.message) {
                    alert(result.message);
                  }
                }}
                style={{
                  background: 'rgba(13, 148, 136, 0.06)',
                  border: `1px solid ${c.border}`,
                  borderRadius: '6px',
                  padding: '4px 8px',
                  color: c.fgSubtle,
                  fontWeight: 600,
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                }}
                title="Tải file về máy"
              >
                <Icon name="download" size={12} color={c.fgSubtle} />
                <span>Tải</span>
              </button>
            </div>
          </div>
          <div style={{ gridColumn: 'span 2', borderTop: `1px solid ${c.borderSub}`, paddingTop: '10px' }}>
            <span style={{ color: c.fgSubtle, display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '3px', letterSpacing: '0.03em' }}>
              Giải Trình Lý Do
            </span>
            <div style={{ color: c.fgMuted, marginTop: '2px', fontStyle: 'italic', fontSize: '12.5px', lineHeight: 1.4 }}>
              "{request.reason || 'Không có giải trình'}"
            </div>
          </div>
        </div>

        {/* Lựa chọn Quyết định: Duyệt hay Từ chối */}
        <Field label="Quyết Định Thẩm Định">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setDecision('APPROVED')}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: `2px solid ${decision === 'APPROVED' ? '#22c55e' : c.border}`,
                background: decision === 'APPROVED' ? 'rgba(34, 197, 94, 0.1)' : c.bgCard,
                color: decision === 'APPROVED' ? '#86efac' : c.fgMuted,
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon name="check" size={16} />
              <span>Phê Duyệt Đơn (Approve)</span>
            </button>

            <button
              type="button"
              onClick={() => setDecision('REJECTED')}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: `2px solid ${decision === 'REJECTED' ? '#ef4444' : c.border}`,
                background: decision === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : c.bgCard,
                color: decision === 'REJECTED' ? '#fca5a5' : c.fgMuted,
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon name="close" size={16} />
              <span>Từ Chối Đơn (Reject)</span>
            </button>
          </div>
        </Field>

        {/* Khi Phê duyệt: cho phép duyệt một phần & thời hạn */}
        {decision === 'APPROVED' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>
            <Field
              label="Số Lượng Thực Duyệt"
              required
              helper={`Tối đa: ${request.totalRequested} nhân sự`}
              error={errors.approvedQuantity}
            >
              <TextInput
                type="number"
                min="1"
                max={request.totalRequested || 50}
                value={approvedQuantity}
                onChange={(e) => {
                  setApprovedQuantity(e.target.value);
                  if (errors.approvedQuantity) setErrors((prev) => ({ ...prev, approvedQuantity: null }));
                }}
                error={Boolean(errors.approvedQuantity)}
              />
            </Field>

            <Field
              label="Thời Hạn Hiệu Lực (Ngày)"
              required
              helper="Mặc định: 30 ngày kể từ ngày duyệt"
              error={errors.expiresAtDays}
            >
              <TextInput
                type="number"
                min="1"
                max="180"
                value={expiresAtDays}
                onChange={(e) => {
                  setExpiresAtDays(e.target.value);
                  if (errors.expiresAtDays) setErrors((prev) => ({ ...prev, expiresAtDays: null }));
                }}
                error={Boolean(errors.expiresAtDays)}
              />
            </Field>
          </div>
        )}

        {isPartial && (
          <div
            style={{
              padding: '10px 12px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#fde047',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Icon name="warning" size={15} color="#f59e0b" />
            <span>
              <strong>Phê duyệt một phần (Partial Approval):</strong> Bạn đang duyệt {approvedQuantity}/{request.totalRequested} nhân sự theo đề xuất. Số lượng này sẽ được cấp vào Quota mở rộng khả dụng của chi nhánh.
            </span>
          </div>
        )}

        {/* Ghi chú phản hồi / Lý do từ chối */}
        <Field
          label={decision === 'APPROVED' ? 'Ghi Chú Phê Duyệt (Tùy chọn)' : 'Lý Do Từ Chối Đề Xuất (Bắt buộc)'}
          required={decision === 'REJECTED'}
          error={errors.adminNotes}
        >
          <textarea
            value={adminNotes}
            onChange={(e) => {
              setAdminNotes(e.target.value);
              if (errors.adminNotes) setErrors((prev) => ({ ...prev, adminNotes: null }));
            }}
            placeholder={
              decision === 'APPROVED'
                ? 'Nhập chỉ đạo hoặc phân bổ ngân sách nhân sự nếu cần...'
                : 'Nêu rõ lý do từ chối: Năng suất cửa hàng chưa đạt ngưỡng, hoặc chi nhánh còn vị trí trống chưa sử dụng...'
            }
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: c.bgRaised,
              border: `1px solid ${errors.adminNotes ? '#ef4444' : c.border}`,
              borderRadius: '6px',
              color: c.fg,
              fontSize: '13px',
              fontFamily: fonts.body,
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </Field>
      </form>
    </Modal>
  );
}
