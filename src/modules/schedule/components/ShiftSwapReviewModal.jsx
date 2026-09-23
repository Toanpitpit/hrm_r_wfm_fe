import { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { useToast } from '@/components/ui/toast/ToastProvider';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';
import Icon from '@/shared/components/ui/Icon';
import { formatShiftTemplateName } from '../hooks/useWeeklySchedule';
import { getStoreSwapRequests, reviewSwapRequest } from '../services/schedule.service';

export default function ShiftSwapReviewModal({
  isOpen,
  onClose,
  storeId = null,
  onReviewed,
}) {
  const { c } = useAdminTheme();
  const toast = useToast();
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();
  const effectiveStoreId = storeId || storedUser?.storeId || storedUser?.homeBranchId || storedUser?.branchId || 1;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [filterTab, setFilterTab] = useState('PENDING'); // 'PENDING', 'APPROVED', 'REJECTED', 'ALL'

  const fetchStoreRequests = () => {
    if (!effectiveStoreId) return;
    setLoading(true);
    getStoreSwapRequests(effectiveStoreId)
      .then((res) => {
        if (res?.success && res.data) {
          setRequests(res.data);
        } else {
          setRequests([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching store swap requests:', err);
        toast.error('Không thể tải danh sách đơn đổi/chuyển ca của chi nhánh.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchStoreRequests();
    }
  }, [isOpen, effectiveStoreId]);

  const handleReview = async (swapRequestId, isApproved) => {
    try {
      setActionLoadingId(swapRequestId);

      const res = await reviewSwapRequest({
        swapRequestId,
        isApproved,
      });

      if (res?.success) {
        toast.success(
          isApproved
            ? 'Đã phê duyệt đơn và cập nhật lịch làm việc thành công!'
            : 'Đã từ chối đơn yêu cầu đổi/chuyển ca.'
        );
        // Refresh requests list
        fetchStoreRequests();
        // Notify parent to refresh weekly roster matrix
        if (onReviewed) onReviewed();
      } else {
        toast.error(res?.message || 'Không thể xử lý yêu cầu duyệt đơn.');
      }
    } catch (err) {
      console.error('Error reviewing swap request:', err);
      const msg = err.response?.data?.message || err.message || 'Lỗi khi xử lý duyệt đơn.';
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isOpen) return null;

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  const filteredRequests = requests.filter((r) => {
    if (filterTab === 'ALL') return true;
    return r.status === filterTab;
  });

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <Badge tone="ok" dot>Đã Duyệt</Badge>;
      case 'REJECTED':
        return <Badge tone="bad" dot>Đã Từ Chối</Badge>;
      case 'PENDING':
      default:
        return <Badge tone="warn" dot>Chờ Duyệt</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xét Duyệt Đơn Đổi / Chuyển Ca Trực (Quản Lý Cửa Hàng)"
      sub="Sau khi Phê duyệt, hệ thống sẽ tự động cập nhật ngay nhân sự mới vào bảng lịch phân công tuần."
      width={800}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Button variant="ghost" kind="ghost" size="sm" onClick={fetchStoreRequests} disabled={loading}>
            <Icon name="pulse" size={14} /> Làm Mới Danh Sách
          </Button>
          <Button variant="primary" kind="primary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Tab lọc trạng thái */}
        <div style={{ display: 'flex', gap: 8, borderBottom: `1px solid ${c.borderSub}`, paddingBottom: 10 }}>
          <button
            type="button"
            onClick={() => setFilterTab('PENDING')}
            style={{
              background: filterTab === 'PENDING' ? c.accent : c.bgCard,
              color: filterTab === 'PENDING' ? c.ink : c.fgSubtle,
              border: `1px solid ${filterTab === 'PENDING' ? c.accent : c.border}`,
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>Chờ Duyệt</span>
            {pendingCount > 0 && (
              <span
                style={{
                  background: filterTab === 'PENDING' ? c.ink : c.tones.bad,
                  color: filterTab === 'PENDING' ? c.accent : c.fg,
                  fontSize: 10,
                  padding: '1px 6px',
                  borderRadius: 10,
                  fontWeight: 800,
                }}
              >
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('APPROVED')}
            style={{
              background: filterTab === 'APPROVED' ? c.accent : c.bgCard,
              color: filterTab === 'APPROVED' ? c.ink : c.fgSubtle,
              border: `1px solid ${filterTab === 'APPROVED' ? c.accent : c.border}`,
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Đã Phê Duyệt
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('REJECTED')}
            style={{
              background: filterTab === 'REJECTED' ? c.accent : c.bgCard,
              color: filterTab === 'REJECTED' ? c.ink : c.fgSubtle,
              border: `1px solid ${filterTab === 'REJECTED' ? c.accent : c.border}`,
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Đã Từ Chối
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('ALL')}
            style={{
              background: filterTab === 'ALL' ? c.accent : c.bgCard,
              color: filterTab === 'ALL' ? c.ink : c.fgSubtle,
              border: `1px solid ${filterTab === 'ALL' ? c.accent : c.border}`,
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Tất Cả ({requests.length})
          </button>
        </div>

        {/* Danh sách đơn */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '55vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '36px 0', textAlign: 'center', color: c.fgSubtle, fontSize: 13 }}>
              Đang tải danh sách đơn xét duyệt...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: c.fgFaint, fontStyle: 'italic', fontSize: 13 }}>
              Không có đơn nào trong mục này.
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isLeave = req.requestType === 'LEAVE';
              const isPending = req.status === 'PENDING';
              const isItemBusy = actionLoadingId === req.swapRequestId;

              return (
                <div
                  key={req.swapRequestId}
                  style={{
                    background: c.bgElev,
                    border: `1px solid ${c.border}`,
                    borderRadius: 8,
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {/* Tiêu đề card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon name={isLeave ? 'calendar' : 'swap'} size={16} color={c.accent} />
                      <span style={{ fontWeight: 750, fontSize: 14, color: c.fg }}>
                        {isLeave ? 'Đơn Xin Nghỉ Ca (Có Việc Bận)' : 'Đơn Đổi Ca Cho Nhau (2 Chiều)'}
                      </span>
                      <span style={{ fontSize: 11, color: c.fgFaint }}>
                        #{req.swapRequestId} · {new Date(req.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div>{renderStatusBadge(req.status)}</div>
                  </div>

                  {/* Chi tiết người gửi và người nhận */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 14,
                      background: c.bgCard,
                      padding: '12px 14px',
                      borderRadius: 6,
                      border: `1px solid ${c.borderSub}`,
                      fontSize: 12.5,
                    }}
                  >
                    {/* Người gửi */}
                    <div>
                      <div style={{ color: c.fgFaint, fontSize: 11, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
                        Nhân Viên Làm Đơn:
                      </div>
                      <div style={{ fontWeight: 750, fontSize: 13, color: c.fg }}>
                        {req.requesterName} <span style={{ fontSize: 11, color: c.accent }}>({req.requesterRoleName || 'Nhân viên'})</span>
                      </div>
                      <div style={{ color: c.accent, marginTop: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="calendar" size={13} color={c.accent} />
                        <span>{req.requesterWorkDate} · {formatShiftTemplateName(req.requesterShiftName)} ({req.requesterTimeRange})</span>
                      </div>
                    </div>

                    {/* Người nhận */}
                    <div>
                      <div style={{ color: c.fgFaint, fontSize: 11, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
                        {isLeave ? 'Nhân Sự Thay Thế:' : 'Đổi Với Ca Của Đồng Nghiệp:'}
                      </div>
                      {isLeave ? (
                        <div style={{ color: c.fgSubtle, marginTop: 4, fontSize: 12.5, fontStyle: 'italic' }}>
                          Chưa có (Duyệt đơn sẽ hủy ca, Quản lý tự xếp người khác)
                        </div>
                      ) : (
                        <>
                          <div style={{ fontWeight: 750, fontSize: 13, color: c.fg }}>
                            {req.targetName} <span style={{ fontSize: 11, color: c.accent }}>({req.targetRoleName || 'Nhân viên'})</span>
                          </div>
                          <div style={{ color: c.accent, marginTop: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Icon name="calendar" size={13} color={c.accent} />
                            <span>{req.targetWorkDate} · {formatShiftTemplateName(req.targetShiftName)} ({req.targetTimeRange})</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Lý do */}
                  {req.reason && (
                    <div style={{ fontSize: 12.5, color: c.fgSubtle, background: `${c.bgCard}80`, padding: '8px 12px', borderRadius: 6 }}>
                      <strong>Lý do từ nhân viên:</strong> {req.reason}
                    </div>
                  )}

                  {/* Footer card: Thao tác duyệt hoặc thông tin người duyệt */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: `1px dashed ${c.borderSub}` }}>
                    <div style={{ fontSize: 11, color: c.fgFaint }}>
                      {req.reviewedByName && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Icon name="edit" size={12} color={c.fgFaint} />
                          <span>Đã duyệt bởi <strong>{req.reviewedByName}</strong> lúc {new Date(req.reviewedAt).toLocaleString('vi-VN')}</span>
                        </span>
                      )}
                    </div>

                    {isPending && (
                      <div style={{ display: 'flex', gap: 10 }}>
                        <Button
                          variant="ghost"
                          kind="ghost"
                          size="sm"
                          disabled={isItemBusy}
                          onClick={() => handleReview(req.swapRequestId, false)}
                          style={{ color: c.tones.bad, borderColor: c.tones.bad }}
                        >
                          {isItemBusy ? 'Đang Xử Lý...' : '❌ Từ Chối'}
                        </Button>

                        <Button
                          variant="primary"
                          kind="primary"
                          size="sm"
                          disabled={isItemBusy}
                          onClick={() => handleReview(req.swapRequestId, true)}
                        >
                          {isItemBusy ? 'Đang Phê Duyệt...' : '✅ Phê Duyệt Ngay'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
