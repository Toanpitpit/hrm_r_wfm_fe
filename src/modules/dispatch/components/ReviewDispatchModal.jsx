import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { Modal, Button, Select } from '@/shared/components/ui';
import dispatchService from '../services/dispatch.service';

/**
 * Modal: Xét duyệt và chỉ định nhân sự điều động
 * Dành cho Cửa hàng trưởng của cơ sở hỗ trợ (Source Branch) phê duyệt hoặc từ chối phiếu yêu cầu.
 */
export default function ReviewDispatchModal({
  open,
  onClose,
  dispatchItem,
  onSuccess,
  currentStoreId,
}) {
  const { c, fonts } = useAdminTheme();

  const [assignedEmployeeId, setAssignedEmployeeId] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Tải danh sách nhân sự của chi nhánh mình để cho phép chọn/đổi người chỉ định
  useEffect(() => {
    if (open && dispatchItem) {
      setApprovalNotes('');
      setErrorMessage('');
      setAssignedEmployeeId(String(dispatchItem.employeeId || dispatchItem.userId || ''));

      const loadEmployees = async () => {
        setLoadingEmployees(true);
        try {
          const storeIdToQuery = dispatchItem.fromStoreId || currentStoreId;
          const list = await dispatchService.getEmployeesByBranch(storeIdToQuery);
          setEmployees(list);
        } catch (err) {
          console.error('Lỗi khi tải danh sách nhân sự xét duyệt:', err);
        } finally {
          setLoadingEmployees(false);
        }
      };
      loadEmployees();
    }
  }, [open, dispatchItem, currentStoreId]);

  if (!dispatchItem) return null;

  const handleAction = async (isApproved) => {
    setErrorMessage('');
    setSubmitting(true);

    try {
      const payload = {
        dispatchId: dispatchItem.dispatchId || dispatchItem.id,
        isApproved,
        assignedEmployeeId: isApproved && assignedEmployeeId ? Number(assignedEmployeeId) : null,
        approvalNotes: approvalNotes.trim() || undefined,
      };

      const result = await dispatchService.reviewDispatchRequest(payload);
      if (result.success) {
        if (onSuccess) onSuccess(isApproved);
        onClose();
      } else {
        setErrorMessage(result.message || 'Không thể xử lý yêu cầu điều động.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra trong quá trình phê duyệt.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const employeeOptions = [
    { value: '', label: loadingEmployees ? 'Đang tải nhân sự...' : '-- Chọn nhân sự thay thế nếu cần --' },
    ...employees.map((emp) => ({
      value: String(emp.id || emp.userId),
      label: `${emp.fullName} - ${emp.employeeCode || ''} (${emp.roleName || 'Nhân viên'})`,
    })),
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Xét Duyệt Yêu Cầu Điều Động Nhân Sự"
      sub={`Cơ sở đề nghị hỗ trợ: ${dispatchItem.toStoreName || 'Chi nhánh đối tác'}`}
      width={600}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Button
            kind="danger"
            onClick={() => handleAction(false)}
            disabled={submitting}
          >
            {submitting ? 'Đang Xử Lý...' : 'Từ Chối Yêu Cầu'}
          </Button>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button kind="ghost" onClick={onClose} disabled={submitting}>
              Đóng
            </Button>
            <Button
              kind="primary"
              onClick={() => handleAction(true)}
              disabled={submitting || loadingEmployees}
            >
              {submitting ? 'Đang Phê Duyệt...' : 'Phê Duyệt Điều Động'}
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#f87171',
              padding: '12px 14px',
              borderRadius: 6,
              fontSize: 13,
              lineHeight: 1.45,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 3 }}>Thông báo từ hệ thống:</div>
            {errorMessage}
          </div>
        )}

        {/* Thẻ tóm tắt thông tin điều động */}
        <div
          style={{
            background: c.bgElev,
            border: `1px solid ${c.borderSub}`,
            borderRadius: 8,
            padding: 14,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            fontSize: 13,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: c.fgFaint, textTransform: 'uppercase', fontWeight: 700 }}>
              Cơ sở gửi đề nghị
            </div>
            <div style={{ fontWeight: 600, color: c.fg, marginTop: 2 }}>
              {dispatchItem.toStoreName}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: c.fgFaint, textTransform: 'uppercase', fontWeight: 700 }}>
              Thời gian điều động
            </div>
            <div style={{ fontWeight: 600, color: c.accent, marginTop: 2 }}>
              {dispatchItem.startDate} &rarr; {dispatchItem.endDate}
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 11, color: c.fgFaint, textTransform: 'uppercase', fontWeight: 700 }}>
              Lý do / Công việc cần hỗ trợ
            </div>
            <div style={{ color: c.fgMuted, marginTop: 2, fontStyle: dispatchItem.reason ? 'normal' : 'italic' }}>
              {dispatchItem.reason || 'Không có ghi chú cụ thể'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: c.fgFaint, textTransform: 'uppercase', fontWeight: 700 }}>
              Người lập phiếu
            </div>
            <div style={{ color: c.fg, marginTop: 2 }}>
              {dispatchItem.requestedByName || 'Cửa hàng trưởng đối tác'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: c.fgFaint, textTransform: 'uppercase', fontWeight: 700 }}>
              Nhân sự đề xuất ban đầu
            </div>
            <div style={{ color: c.fg, marginTop: 2, fontWeight: 500 }}>
              {dispatchItem.employeeName} ({dispatchItem.positionName || 'Nhân viên'})
            </div>
          </div>
        </div>

        {/* Chỉ định hoặc thay đổi nhân sự cử đi chi viện */}
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: c.fgSubtle, marginBottom: 6 }}>
            Nhân sự chỉ định cử đi chi viện
          </label>
          <Select
            value={assignedEmployeeId}
            onChange={(val) => setAssignedEmployeeId(val)}
            options={employeeOptions}
            width="100%"
            disabled={loadingEmployees || submitting}
          />
          <p style={{ fontSize: 12, color: c.fgFaint, marginTop: 4 }}>
            Bạn có thể giữ nguyên nhân sự đối tác đã đề xuất hoặc chỉ định một nhân sự khác thuộc cơ sở mình.
          </p>
        </div>

        {/* Ghi chú phản hồi / lý do duyệt hoặc từ chối */}
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: c.fgSubtle, marginBottom: 6 }}>
            Ý kiến phản hồi / Ghi chú phê duyệt
          </label>
          <textarea
            rows={3}
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            placeholder="Nhập ghi chú phê duyệt hoặc lý do từ chối nếu không thể bố trí nhân sự..."
            disabled={submitting}
            style={{
              width: '100%',
              background: c.bgRaised,
              border: `1px solid ${c.border}`,
              borderRadius: 6,
              color: c.fg,
              fontSize: 13,
              fontFamily: fonts.body,
              padding: '10px 12px',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>
      </div>
    </Modal>
  );
}
