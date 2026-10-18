import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { Modal, Button, Badge } from '@/shared/components/ui';
import dispatchService from '../services/dispatch.service';

/**
 * Modal: Xét duyệt và chỉ định nhân sự điều động
 * Hỗ trợ duyệt hoặc từ chối từng nhân sự riêng biệt trong phiếu điều động nhiều người.
 * Ràng buộc 2: Bảo vệ Quân số An toàn của Chi nhánh Cho Mượn (Ngưỡng 40%)
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
  const [quotaInfo, setQuotaInfo] = useState(null);
  const [loadingQuota, setLoadingQuota] = useState(false);

  const fromStoreId = dispatchItem?.fromStoreId || dispatchItem?.sourceBranchId;
  const fromBranchName = dispatchItem?.fromStoreName || dispatchItem?.sourceBranchName || 'hỗ trợ';

  // Tải thông tin định biên an toàn 40% của chi nhánh cho mượn
  useEffect(() => {
    if (!open || !dispatchItem || !fromStoreId) {
      setQuotaInfo(null);
      return;
    }

    const loadQuota = async () => {
      setLoadingQuota(true);
      try {
        const res = await dispatchService.getBranchDispatchQuota(
          fromStoreId,
          dispatchItem.startDate,
          dispatchItem.endDate,
          dispatchItem.dispatchId || dispatchItem.id
        );
        if (res?.success && res?.data) {
          setQuotaInfo(res.data);
        } else {
          setQuotaInfo(null);
        }
      } catch (err) {
        console.warn('Lỗi khi tải hạn mức an toàn của chi nhánh cho mượn:', err);
        setQuotaInfo(null);
      } finally {
        setLoadingQuota(false);
      }
    };

    loadQuota();
  }, [open, dispatchItem, fromStoreId]);

  useEffect(() => {
    if (open && dispatchItem) {
      setApprovalNotes('');
      setErrorMessage('');

      let rawEmployees = [];
      if (dispatchItem.employees && Array.isArray(dispatchItem.employees) && dispatchItem.employees.length > 0) {
        rawEmployees = dispatchItem.employees;
      } else if (dispatchItem.employeeId || dispatchItem.userId) {
        rawEmployees = [
          {
            employeeId: dispatchItem.employeeId || dispatchItem.userId,
            employeeName: dispatchItem.employeeName,
            employeeCode: dispatchItem.employeeCode,
            positionName: dispatchItem.positionName || 'Nhân viên',
          },
        ];
      }

      setItemsToReview(
        rawEmployees.map((emp) => ({
          employeeId: emp.employeeId,
          employeeName: emp.employeeName,
          employeeCode: emp.employeeCode,
          positionName: emp.positionName || 'Nhân viên',
          isApproved: true,
          note: '',
        }))
      );
    }
  }, [open, dispatchItem]);

  // Khi quotaInfo được tải về, nếu số lượng đang chọn duyệt vượt quá quota khả dụng, tự động giới hạn lại
  useEffect(() => {
    if (quotaInfo && itemsToReview.length > 0) {
      const availableQuota = quotaInfo.availableDispatchQuota;
      const currentlyApproved = itemsToReview.filter((i) => i.isApproved);
      if (currentlyApproved.length > availableQuota) {
        let approvedCount = 0;
        setItemsToReview((prev) =>
          prev.map((item) => {
            if (item.isApproved) {
              if (approvedCount < availableQuota) {
                approvedCount++;
                return item;
              } else {
                return {
                  ...item,
                  isApproved: false,
                  note: item.note || 'Vượt quá hạn ngạch an toàn 40% quân số của chi nhánh.',
                };
              }
            }
            return item;
          })
        );
        setErrorMessage(
          `Chi nhánh ${fromBranchName} chỉ còn lại ${availableQuota} nhân sự khả dụng. Việc điều động quá số lượng này sẽ làm gián đoạn vận hành của chi nhánh hỗ trợ.`
        );
      }
    }
  }, [quotaInfo]);

  if (!dispatchItem) return null;

  const availableQuota = quotaInfo ? quotaInfo.availableDispatchQuota : 999;

  const toggleEmployeeApproval = (empId, approved) => {
    setErrorMessage('');
    if (approved) {
      const currentApprovedCount = itemsToReview.filter((item) => item.isApproved && item.employeeId !== empId).length;
      if (quotaInfo && currentApprovedCount >= quotaInfo.availableDispatchQuota) {
        setErrorMessage(
          `Chi nhánh ${fromBranchName} chỉ còn lại ${quotaInfo.availableDispatchQuota} nhân sự khả dụng. Việc điều động quá số lượng này sẽ làm gián đoạn vận hành của chi nhánh hỗ trợ.`
        );
        return;
      }
    }

    setItemsToReview((prev) =>
      prev.map((item) =>
        item.employeeId === empId ? { ...item, isApproved: approved, note: approved ? '' : item.note } : item
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
    setErrorMessage('');
    if (approved && quotaInfo && itemsToReview.length > quotaInfo.availableDispatchQuota) {
      const limit = quotaInfo.availableDispatchQuota;
      let count = 0;
      setItemsToReview((prev) =>
        prev.map((item) => {
          if (count < limit) {
            count++;
            return { ...item, isApproved: true, note: '' };
          } else {
            return {
              ...item,
              isApproved: false,
              note: item.note || 'Vượt quá hạn ngạch an toàn 40% quân số của chi nhánh.',
            };
          }
        })
      );
      setErrorMessage(
        `Chi nhánh ${fromBranchName} chỉ còn lại ${limit} nhân sự khả dụng. Việc điều động quá số lượng này sẽ làm gián đoạn vận hành của chi nhánh hỗ trợ.`
      );
    } else {
      setItemsToReview((prev) =>
        prev.map((item) => ({ ...item, isApproved: approved, note: approved ? '' : item.note }))
      );
    }
  };

  const approvedCount = itemsToReview.filter((item) => item.isApproved).length;
  const rejectedCount = itemsToReview.length - approvedCount;
  const isOverQuota = quotaInfo && approvedCount > quotaInfo.availableDispatchQuota;

  const handleAction = async () => {
    setErrorMessage('');

    if (quotaInfo && approvedCount > quotaInfo.availableDispatchQuota) {
      setErrorMessage(
        `Chi nhánh ${fromBranchName} chỉ còn lại ${quotaInfo.availableDispatchQuota} nhân sự khả dụng. Việc điều động quá số lượng này sẽ làm gián đoạn vận hành của chi nhánh hỗ trợ.`
      );
      return;
    }

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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Xét Duyệt Yêu Cầu Điều Động Nhân Sự"
      sub={`Cơ sở đề nghị mượn: ${dispatchItem.toStoreName || 'Chi nhánh đối tác'}`}
      width={720}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ fontSize: 13, color: c.fgMuted }}>
            Sẽ duyệt <strong style={{ color: '#34d399' }}>{approvedCount}</strong> người, từ chối <strong style={{ color: '#f87171' }}>{rejectedCount}</strong> người
            {quotaInfo && (
              <span style={{ marginLeft: 8, fontSize: 12, color: isOverQuota ? '#f87171' : c.fgFaint }}>
                (Tối đa cho phép: <strong>{quotaInfo.availableDispatchQuota}</strong>)
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button kind="ghost" onClick={onClose} disabled={submitting}>
              Đóng
            </Button>
            <Button
              kind="primary"
              onClick={handleAction}
              disabled={submitting || itemsToReview.length === 0 || isOverQuota}
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

        {/* Thẻ định biên an toàn quân số của chi nhánh hỗ trợ (Ngưỡng 40%) */}
        {quotaInfo && (
          <div
            style={{
              background: isOverQuota ? 'rgba(239, 68, 68, 0.08)' : 'rgba(59, 130, 246, 0.08)',
              border: `1px solid ${isOverQuota ? 'rgba(239, 68, 68, 0.35)' : 'rgba(59, 130, 246, 0.25)'}`,
              borderRadius: 8,
              padding: '12px 14px',
              fontSize: 12.5,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 700, color: isOverQuota ? '#f87171' : c.accent, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🛡️ Quân số an toàn của cơ sở hỗ trợ ({quotaInfo.branchName})</span>
                <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: isOverQuota ? '#ef4444' : '#3b82f6', color: '#fff' }}>
                  Ngưỡng tối đa 40%
                </span>
              </div>
              <div style={{ fontSize: 12, color: c.fgMuted }}>
                Khả dụng duyệt: <strong style={{ color: isOverQuota ? '#f87171' : '#34d399', fontSize: 14 }}>{quotaInfo.availableDispatchQuota}</strong> / {quotaInfo.maxAllowedDispatchCount} người
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' }}>
              <div style={{ background: c.bgRaised, padding: '6px 8px', borderRadius: 6, border: `1px solid ${c.border}` }}>
                <div style={{ fontSize: 11, color: c.fgFaint }}>Tổng quân số</div>
                <div style={{ fontWeight: 700, color: c.fg, fontSize: 13, marginTop: 2 }}>{quotaInfo.totalHeadcount}</div>
              </div>
              <div style={{ background: c.bgRaised, padding: '6px 8px', borderRadius: 6, border: `1px solid ${c.border}` }}>
                <div style={{ fontSize: 11, color: c.fgFaint }}>Đang chi viện</div>
                <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: 13, marginTop: 2 }}>{quotaInfo.currentlyDispatchedCount}</div>
              </div>
              <div style={{ background: c.bgRaised, padding: '6px 8px', borderRadius: 6, border: `1px solid ${c.border}` }}>
                <div style={{ fontSize: 11, color: c.fgFaint }}>Hạn ngạch (40%)</div>
                <div style={{ fontWeight: 700, color: c.accent, fontSize: 13, marginTop: 2 }}>{quotaInfo.maxAllowedDispatchCount}</div>
              </div>
              <div style={{ background: isOverQuota ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', padding: '6px 8px', borderRadius: 6, border: `1px solid ${isOverQuota ? '#ef4444' : '#10b981'}` }}>
                <div style={{ fontSize: 11, color: isOverQuota ? '#f87171' : '#34d399' }}>Được duyệt thêm</div>
                <div style={{ fontWeight: 700, color: isOverQuota ? '#f87171' : '#34d399', fontSize: 13, marginTop: 2 }}>{quotaInfo.availableDispatchQuota}</div>
              </div>
            </div>

            {isOverQuota && (
              <div style={{ marginTop: 8, color: '#f87171', fontWeight: 600, fontSize: 12 }}>
                ⚠️ Cảnh báo: Số lượng nhân sự chọn duyệt ({approvedCount}) vượt quá hạn ngạch an toàn ({quotaInfo.availableDispatchQuota}). Vui lòng từ chối bớt nhân sự trước khi lưu.
              </div>
            )}
          </div>
        )}

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
