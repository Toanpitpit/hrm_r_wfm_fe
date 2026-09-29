import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { Modal, Button, Badge } from '@/shared/components/ui';
import dispatchService from '../services/dispatch.service';
import authService from '@/modules/auth/services/auth.service';

/**
 * ==============================================================================
 * MODAL: Chi Tiết & Xét Duyệt Lệnh Điều Động Nhân Sự
 * ==============================================================================
 * Cho phép xem chi tiết toàn bộ thông tin phiếu điều động liên chi nhánh.
 * Tích hợp trực tiếp chức năng PHÊ DUYỆT và TỪ CHỐI ngay trong form đối với các phiếu
 * đang chờ xét duyệt (PENDING) khi người dùng thuộc chi nhánh hỗ trợ hoặc là Quản trị viên.
 * ==============================================================================
 */
export default function DispatchDetailModal({
  open,
  onClose,
  dispatchItem,
  currentStoreId,
  onSuccess,
}) {
  const { c, fonts } = useAdminTheme();

  const [approvalNotes, setApprovalNotes] = useState('');
  const [itemsToReview, setItemsToReview] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  let currentUser = null;
  try {
    currentUser = authService.getUser ? authService.getUser() : null;
    if (!currentUser) {
      const raw = localStorage.getItem('user');
      if (raw) currentUser = JSON.parse(raw);
    }
  } catch {
    currentUser = null;
  }

  const isOpsAdmin =
    currentUser?.role === 'OPS_ADMIN' ||
    String(currentUser?.roleName || '').toUpperCase().includes('ADMIN');

  const isSourceBranch =
    Boolean(currentStoreId) &&
    Number(dispatchItem?.fromStoreId) === Number(currentStoreId);
  const isTargetBranch =
    Boolean(currentStoreId) &&
    Number(dispatchItem?.toStoreId) === Number(currentStoreId);

  const isPending = dispatchItem?.status === 'PENDING';
  const canReview = isPending && (isSourceBranch || isOpsAdmin);

  // Khởi tạo dữ liệu khi mở modal
  useEffect(() => {
    if (open && dispatchItem) {
      setApprovalNotes('');
      setErrorMessage('');

      if (dispatchItem.employees && Array.isArray(dispatchItem.employees) && dispatchItem.employees.length > 0) {
        setItemsToReview(
          dispatchItem.employees.map((emp) => ({
            employeeId: emp.employeeId,
            employeeName: emp.employeeName,
            employeeCode: emp.employeeCode,
            positionName: emp.positionName || 'Nhân viên',
            status: emp.status || dispatchItem.status,
            isApproved: true, // Mặc định là duyệt nếu chưa xử lý
            note: emp.note || '',
          }))
        );
      } else {
        // Fallback cho dữ liệu phiếu đơn 1 nhân sự
        setItemsToReview([
          {
            employeeId: dispatchItem.employeeId || dispatchItem.userId,
            employeeName: dispatchItem.employeeName,
            employeeCode: dispatchItem.employeeCode,
            positionName: dispatchItem.positionName || 'Nhân viên',
            status: dispatchItem.status,
            isApproved: true,
            note: '',
          },
        ]);
      }
    }
  }, [open, dispatchItem]);

  if (!dispatchItem) return null;

  const formatDate = (dStr) => {
    if (!dStr) return '--';
    const parts = dStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dStr;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <Badge tone="active" dot>Đã phê duyệt</Badge>;
      case 'PARTIAL':
        return <Badge tone="info" dot>Duyệt một phần</Badge>;
      case 'REJECTED':
        return <Badge tone="bad" dot>Đã từ chối</Badge>;
      case 'PENDING':
      default:
        return <Badge tone="warn" dot>Chờ xét duyệt</Badge>;
    }
  };

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

  // Xử lý gửi xét duyệt: Phê duyệt (theo danh sách đã tick) hoặc Từ chối toàn bộ
  const handleReviewAction = async (isRejectAll = false) => {
    setErrorMessage('');
    setSubmitting(true);

    try {
      let payload;
      if (isRejectAll) {
        // Từ chối toàn bộ phiếu
        payload = {
          dispatchId: dispatchItem.dispatchId || dispatchItem.id,
          employeeReviews: itemsToReview.map((item) => ({
            employeeId: item.employeeId,
            isApproved: false,
            note: item.note ? item.note.trim() : (approvalNotes.trim() || 'Không chấp thuận chi viện'),
          })),
          isApproved: false,
          approvalNotes: approvalNotes.trim() || 'Từ chối toàn bộ phiếu điều động',
        };
      } else {
        // Phê duyệt theo cấu hình duyệt từng người
        payload = {
          dispatchId: dispatchItem.dispatchId || dispatchItem.id,
          employeeReviews: itemsToReview.map((item) => ({
            employeeId: item.employeeId,
            isApproved: item.isApproved,
            note: item.note ? item.note.trim() : undefined,
          })),
          approvalNotes: approvalNotes.trim() || undefined,
        };
      }

      const result = await dispatchService.reviewDispatchRequest(payload);
      if (result.success) {
        if (onSuccess) onSuccess(!isRejectAll && itemsToReview.some((i) => i.isApproved));
        onClose();
      } else {
        setErrorMessage(result.message || 'Không thể xử lý yêu cầu điều động.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra trong quá trình xử lý phê duyệt.';
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
      title={`Chi Tiết Lệnh Điều Động #${dispatchItem.dispatchId || dispatchItem.id}`}
      sub={
        canReview
          ? `Xét duyệt và chỉ định nhân sự cử đi từ "${dispatchItem.fromStoreName}"`
          : 'Thông tin chi tiết phiếu điều động nhân sự chuỗi'
      }
      width={720}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            {canReview ? (
              <span style={{ fontSize: 13, color: c.fgMuted }}>
                Sẽ duyệt <strong style={{ color: '#34d399' }}>{approvedCount}</strong>, từ chối <strong style={{ color: '#f87171' }}>{rejectedCount}</strong> nhân sự
              </span>
            ) : (
              <span style={{ fontSize: 12, color: c.fgFaint }}>
                Trạng thái hiện tại: {getStatusBadge(dispatchItem.status)}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button kind="ghost" onClick={onClose} disabled={submitting}>
              Đóng
            </Button>

            {canReview && (
              <>
                <Button
                  kind="danger"
                  onClick={() => handleReviewAction(true)}
                  disabled={submitting}
                >
                  {submitting ? 'Đang Xử Lý...' : '✕ Từ Chối'}
                </Button>
                <Button
                  kind="primary"
                  onClick={() => handleReviewAction(false)}
                  disabled={submitting || itemsToReview.length === 0}
                >
                  {submitting ? 'Đang Xử Lý...' : '✓ Phê Duyệt'}
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Banner báo lỗi nếu có */}
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

        {/* Khối tóm tắt thông tin điều động */}
        <div
          style={{
            background: c.bgElev,
            border: `1px solid ${c.borderSub}`,
            borderRadius: 8,
            padding: '14px 16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px 16px',
            fontSize: 13,
          }}
        >
          {/* Trạng thái & Mã phiếu */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: `1px solid ${c.borderSub}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, color: c.accent, fontSize: 15 }}>
                Phiếu #{dispatchItem.dispatchId || dispatchItem.id}
              </span>
              {getStatusBadge(dispatchItem.status)}
            </div>
            <div style={{ fontSize: 12, color: c.fgFaint }}>
              Thời hạn: <strong style={{ color: c.fg }}>{formatDate(dispatchItem.startDate)} &rarr; {formatDate(dispatchItem.endDate)}</strong>
            </div>
          </div>

          {/* Tuyến hỗ trợ */}
          <div>
            <div style={{ fontSize: 11, color: c.fgFaint, textTransform: 'uppercase', fontWeight: 700 }}>
              Cơ sở hỗ trợ (Đơn vị cử đi)
            </div>
            <div style={{ fontWeight: 600, color: c.fg, marginTop: 3 }}>
              {dispatchItem.fromStoreName}
              {isSourceBranch && (
                <span style={{ marginLeft: 6, fontSize: 10.5, color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '1px 6px', borderRadius: 3 }}>
                  Cơ sở của bạn
                </span>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: c.fgFaint, textTransform: 'uppercase', fontWeight: 700 }}>
              Cơ sở tiếp nhận (Đơn vị xin mượn)
            </div>
            <div style={{ fontWeight: 600, color: c.fg, marginTop: 3 }}>
              {dispatchItem.toStoreName}
              {isTargetBranch && (
                <span style={{ marginLeft: 6, fontSize: 10.5, color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '1px 6px', borderRadius: 3 }}>
                  Cơ sở của bạn
                </span>
              )}
            </div>
          </div>

          {/* Người lập & Người duyệt */}
          <div>
            <div style={{ fontSize: 11, color: c.fgFaint, textTransform: 'uppercase', fontWeight: 700 }}>
              Người gửi đề nghị
            </div>
            <div style={{ color: c.fg, marginTop: 3, fontWeight: 500 }}>
              {dispatchItem.requestedByName || '--'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: c.fgFaint, textTransform: 'uppercase', fontWeight: 700 }}>
              Người phê duyệt
            </div>
            <div style={{ color: c.fg, marginTop: 3, fontWeight: 500 }}>
              {dispatchItem.approvedByName || (isPending ? 'Đang chờ xét duyệt' : '--')}
            </div>
          </div>

          {/* Lý do điều động */}
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 11, color: c.fgFaint, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
              Lý do / Công việc cần tăng cường <span style={{ color: '#ef4444' }}>*</span>
            </div>
            <div
              style={{
                color: c.fg,
                background: c.bgRaised,
                border: `1px solid ${c.border}`,
                padding: '10px 12px',
                borderRadius: 6,
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {dispatchItem.reason || 'Không có lý do ghi chú.'}
            </div>
          </div>

          {/* Ghi chú duyệt phiếu nếu đã duyệt/từ chối */}
          {dispatchItem.approvedByName && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 11, color: c.fgFaint, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
                Phản hồi / Ghi chú từ người duyệt
              </div>
              <div
                style={{
                  color: c.fgMuted,
                  background: c.bgRaised,
                  border: `1px solid ${c.borderSub}`,
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: 12.5,
                  fontStyle: 'italic',
                }}
              >
                {dispatchItem.approvalNotes || dispatchItem.note || 'Không có ghi chú xét duyệt bổ sung.'}
              </div>
            </div>
          )}
        </div>

        {/* Khối danh sách nhân sự điều động */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: c.fgSubtle }}>
              Danh sách nhân sự điều động ({itemsToReview.length} người)
            </label>
          </div>

          <div
            style={{
              maxHeight: 250,
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

              // Nếu có quyền xét duyệt: hiển thị bộ nút toggle duyệt / từ chối
              if (canReview) {
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

                      {/* Nút toggle Phê Duyệt / Từ Chối cho từng người */}
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

                    {!item.isApproved && (
                      <div style={{ marginTop: 2 }}>
                        <input
                          type="text"
                          value={item.note || ''}
                          onChange={(e) => updateEmployeeNote(item.employeeId, e.target.value)}
                          placeholder="Lý do từ chối nhân sự này (tùy chọn)..."
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
              }

              // Nếu ở chế độ xem thông thường (chỉ xem, không duyệt)
              return (
                <div
                  key={item.employeeId}
                  style={{
                    background: c.bgCard,
                    border: `1px solid ${c.borderSub}`,
                    borderRadius: 6,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: c.bgElev,
                        color: c.accent,
                        fontWeight: 700,
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: c.fg }}>
                        {item.employeeName}
                      </div>
                      <div style={{ fontSize: 11, color: c.fgFaint }}>
                        {item.employeeCode} • {item.positionName}
                      </div>
                    </div>
                  </div>

                  <div>
                    {item.status ? (
                      getStatusBadge(item.status)
                    ) : (
                      <Badge tone="neutral">Nhân viên</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ô nhập ghi chú xét duyệt chung (khi canReview) */}
        {canReview && (
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: c.fgSubtle, marginBottom: 6 }}>
              Ý kiến phản hồi / Ghi chú xét duyệt (tùy chọn)
            </label>
            <textarea
              rows={2}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Nhập ý kiến phản hồi hoặc hướng dẫn cho chi nhánh xin mượn quân..."
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
        )}
      </div>
    </Modal>
  );
}
