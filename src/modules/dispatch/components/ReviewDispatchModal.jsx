import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { Modal, Button, Badge } from '@/shared/components/ui';
import dispatchService from '../services/dispatch.service';

/**
 * Modal: Xét duyệt và chỉ định nhân sự điều động
 * Hỗ trợ duyệt hoặc từ chối từng nhân sự riêng biệt trong phiếu điều động nhiều người.
 */
export default function ReviewDispatchModal({
  open,
  onClose,
  dispatchItem,
  onSuccess,
  currentStoreId,
}) {
  const { c, fonts } = useAdminTheme();

  const [approvalNotes, setApprovalNotes] = useState('');
  const [itemsToReview, setItemsToReview] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (open && dispatchItem) {
      setApprovalNotes('');
      setErrorMessage('');

      // Khởi tạo danh sách nhân sự cần xét duyệt
      if (dispatchItem.employees && Array.isArray(dispatchItem.employees) && dispatchItem.employees.length > 0) {
        setItemsToReview(
          dispatchItem.employees.map((emp) => ({
            employeeId: emp.employeeId,
            employeeName: emp.employeeName,
            employeeCode: emp.employeeCode,
            positionName: emp.positionName || 'Nhân viên',
            isApproved: true, // Mặc định duyệt
            note: '',
          }))
        );
      } else {
        // Fallback phiếu cũ
        setItemsToReview([
          {
            employeeId: dispatchItem.employeeId || dispatchItem.userId,
            employeeName: dispatchItem.employeeName,
            employeeCode: dispatchItem.employeeCode,
            positionName: dispatchItem.positionName || 'Nhân viên',
            isApproved: true,
            note: '',
          },
        ]);
      }
    }
  }, [open, dispatchItem]);

  if (!dispatchItem) return null;

  const toggleEmployeeApproval = (empId, approved) => {
    setItemsToReview((prev) =>
      prev.map((item) =>
        item.employeeId === empId ? { ...item, isApproved: approved } : item
      )
    );
  };

  const updateEmployeeNote = (empId, note) => {
    setItemsToReview((prev) =>
      prev.map((item) =>
        item.employeeId === empId ? { ...item, note } : item
      )
    );
  };

  const setAllApproval = (approved) => {
    setItemsToReview((prev) =>
      prev.map((item) => ({ ...item, isApproved: approved }))
    );
  };

  const handleAction = async () => {
    setErrorMessage('');
    setSubmitting(true);

    try {
      const payload = {
        dispatchId: dispatchItem.dispatchId || dispatchItem.id,
        employeeReviews: itemsToReview.map((item) => ({
          employeeId: item.employeeId,
          isApproved: item.isApproved,
          note: item.note ? item.note.trim() : undefined,
        })),
        approvalNotes: approvalNotes.trim() || undefined,
      };

      const result = await dispatchService.reviewDispatchRequest(payload);
      if (result.success) {
        if (onSuccess) onSuccess();
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

  const approvedCount = itemsToReview.filter((item) => item.isApproved).length;
  const rejectedCount = itemsToReview.length - approvedCount;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Xét Duyệt Yêu Cầu Điều Động Nhân Sự"
      sub={`Cơ sở đề nghị mượn: ${dispatchItem.toStoreName || 'Chi nhánh đối tác'}`}
      width={680}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ fontSize: 13, color: c.fgMuted }}>
            Sẽ duyệt <strong style={{ color: '#34d399' }}>{approvedCount}</strong> người, từ chối <strong style={{ color: '#f87171' }}>{rejectedCount}</strong> người
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button kind="ghost" onClick={onClose} disabled={submitting}>
              Đóng
            </Button>
            <Button
              kind="primary"
              onClick={handleAction}
              disabled={submitting || itemsToReview.length === 0}
            >
              {submitting ? 'Đang Lưu Kết Quả...' : 'Xác Nhận & Lưu Kết Quả Duyệt'}
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
              Tổng số nhân sự đề xuất
            </div>
            <div style={{ color: c.accent, marginTop: 2, fontWeight: 700 }}>
              {itemsToReview.length} nhân sự
            </div>
          </div>
        </div>

        {/* Danh sách nhân sự cần xét duyệt kèm nút duyệt/từ chối từng người */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: c.fgSubtle }}>
              Danh sách nhân sự & Trạng thái duyệt
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setAllApproval(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#34d399',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ✓ Duyệt tất cả
              </button>
              <span style={{ color: c.fgFaint }}>|</span>
              <button
                type="button"
                onClick={() => setAllApproval(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f87171',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ✕ Từ chối tất cả
              </button>
            </div>
          </div>

          <div
            style={{
              maxHeight: 240,
              overflowY: 'auto',
              border: `1px solid ${c.border}`,
              borderRadius: 8,
              background: c.bgRaised,
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {itemsToReview.map((item) => {
              const avatar = (item.employeeName || 'N').trim().charAt(0).toUpperCase();

              return (
                <div
                  key={item.employeeId}
                  style={{
                    background: item.isApproved ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: `1px solid ${item.isApproved ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    borderRadius: 6,
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: item.isApproved ? '#34d399' : '#f87171',
                          color: '#000',
                          fontWeight: 700,
                          fontSize: 13,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: c.fg }}>
                          {item.employeeName}
                        </div>
                        <div style={{ fontSize: 11.5, color: c.fgFaint }}>
                          {item.employeeCode} • {item.positionName}
                        </div>
                      </div>
                    </div>

                    {/* Bộ nút toggle Phê Duyệt / Từ Chối */}
                    <div style={{ display: 'inline-flex', borderRadius: 6, overflow: 'hidden', border: `1px solid ${c.border}` }}>
                      <button
                        type="button"
                        onClick={() => toggleEmployeeApproval(item.employeeId, true)}
                        style={{
                          padding: '5px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          background: item.isApproved ? '#10b981' : c.bgCard,
                          color: item.isApproved ? '#fff' : c.fgMuted,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        ✓ Duyệt
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleEmployeeApproval(item.employeeId, false)}
                        style={{
                          padding: '5px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          background: !item.isApproved ? '#ef4444' : c.bgCard,
                          color: !item.isApproved ? '#fff' : c.fgMuted,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        ✕ Từ chối
                      </button>
                    </div>
                  </div>

                  {/* Nhập lý do nếu từ chối người này */}
                  {!item.isApproved && (
                    <div style={{ marginTop: 2 }}>
                      <input
                        type="text"
                        value={item.note || ''}
                        onChange={(e) => updateEmployeeNote(item.employeeId, e.target.value)}
                        placeholder="Lý do từ chối nhân sự này (ví dụ: bận việc đột xuất, đang có lịch ca...)"
                        style={{
                          width: '100%',
                          background: c.bgRaised,
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          borderRadius: 4,
                          color: c.fg,
                          fontSize: 12,
                          fontFamily: fonts.body,
                          padding: '6px 10px',
                          outline: 'none',
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ghi chú chung của người duyệt */}
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: c.fgSubtle, marginBottom: 6 }}>
            Ý kiến phản hồi chung / Ghi chú phê duyệt
          </label>
          <textarea
            rows={2}
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            placeholder="Nhập phản hồi chung cho toàn bộ đợt điều động (tùy chọn)..."
            disabled={submitting}
            style={{
              width: '100%',
              background: c.bgRaised,
              border: `1px solid ${c.border}`,
              borderRadius: 6,
              color: c.fg,
              fontSize: 13,
              fontFamily: fonts.body,
              padding: '8px 12px',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>
      </div>
    </Modal>
  );
}
