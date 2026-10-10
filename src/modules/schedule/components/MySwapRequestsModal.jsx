import { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { useToast } from '@/components/ui/toast/ToastProvider';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';
import Icon from '@/shared/components/ui/Icon';
import { formatShiftTemplateName } from '../hooks/useWeeklySchedule';
import { getMySwapRequests, respondToSwapRequest, cancelSwapRequest } from '../services/schedule.service';

export default function MySwapRequestsModal({ isOpen, onClose }) {
  const { c, fonts } = useAdminTheme();
  const toast = useToast();
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();
  const currentUserId = storedUser?.userId || storedUser?.id || storedUser?.employeeId;
  console.log(storedUser);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('SENT'); // 'SENT' or 'RECEIVED'

  const filteredRequests = requests.filter((req) => {
    if (activeTab === 'SENT') {
      return String(req.requesterEmployeeId) === String(currentUserId);
    } else {
      return String(req.targetEmployeeId) === String(currentUserId);
    }
  });

  const receivedPendingCount = requests.filter(
    (r) => String(r.targetEmployeeId) === String(currentUserId) && r.status === 'PENDING_PEER'
  ).length;

  const fetchMyRequests = () => {
    setLoading(true);
    getMySwapRequests()
      .then((res) => {
        if (res?.success && res.data) {
          setRequests(res.data);
        } else {
          setRequests([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching my swap requests:', err);
        toast.error('Không thể tải lịch sử đơn xin đổi/chuyển ca.');
      })
      .finally(() => setLoading(false));
  };

  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchMyRequests();
    }
  }, [isOpen]);

  const handlePeerReview = async (swapId, isAccepted) => {
    try {
      setActionLoadingId(swapId);
      const res = await respondToSwapRequest(swapId, isAccepted);
      if (res?.success) {
        toast.success(isAccepted ? 'Đã xác nhận đồng ý đổi/nhận ca!' : 'Đã từ chối đơn.');
        fetchMyRequests();
      } else {
        toast.error(res?.message || 'Lỗi khi xử lý đơn.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đã xảy ra lỗi.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (swapId) => {
    if (!toast.confirm('Bạn có chắc chắn muốn hủy đơn này không?')) return;
    try {
      setActionLoadingId(swapId);
      const res = await cancelSwapRequest(swapId);
      if (res?.success) {
        toast.success('Đã hủy đơn thành công!');
        fetchMyRequests();
      } else {
        toast.error(res?.message || 'Lỗi khi hủy đơn.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đã xảy ra lỗi.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isOpen) return null;

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <Badge tone="ok" dot>Đã Phê Duyệt</Badge>;
      case 'REJECTED':
        return <Badge tone="bad" dot>Từ Chối</Badge>;
      case 'PENDING_PEER':
        return <Badge tone="warn">Chờ Đồng Nghiệp Duyệt</Badge>;
      case 'CANCELLED':
        return <Badge tone="neutral">Đã Hủy</Badge>;
      case 'EXPIRED':
        return <Badge tone="bad" dot>Đã Hết Hạn</Badge>;
      case 'PENDING':
      default:
        return <Badge tone="warn" dot>Chờ Quản Lý Duyệt</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lịch Sử Đơn Đổi / Chuyển Ca Của Tôi"
      sub="Theo dõi tiến độ xét duyệt các đơn xin đổi ca và nhờ người làm thay."
      width={720}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Button variant="ghost" kind="ghost" size="sm" onClick={fetchMyRequests} disabled={loading}>
            <Icon name="pulse" size={14} /> Làm Mới
          </Button>
          <Button variant="primary" kind="primary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', gap: 8, borderBottom: `1px solid ${c.borderSub}`, paddingBottom: 10 }}>
        <button
          type="button"
          onClick={() => setActiveTab('SENT')}
          style={{
            background: activeTab === 'SENT' ? c.accent : c.bgCard,
            color: activeTab === 'SENT' ? c.ink : c.fgSubtle,
            border: `1px solid ${activeTab === 'SENT' ? c.accent : c.border}`,
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Đơn Tôi Đã Gửi
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('RECEIVED')}
          style={{
            background: activeTab === 'RECEIVED' ? c.accent : c.bgCard,
            color: activeTab === 'RECEIVED' ? c.ink : c.fgSubtle,
            border: `1px solid ${activeTab === 'RECEIVED' ? c.accent : c.border}`,
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
          <span>Đơn Cần Tôi Duyệt</span>
          {receivedPendingCount > 0 && (
            <span
              style={{
                background: activeTab === 'RECEIVED' ? c.ink : c.tones.bad,
                color: activeTab === 'RECEIVED' ? c.accent : c.fg,
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 10,
                fontWeight: 800,
              }}
            >
              {receivedPendingCount}
            </span>
          )}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '60vh', overflowY: 'auto' }}>

        {loading ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: c.fgSubtle, fontSize: 13 }}>
            Đang tải danh sách đơn của bạn...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: c.fgFaint, fontStyle: 'italic', fontSize: 13 }}>
            {activeTab === 'SENT' ? 'Bạn chưa gửi đơn xin đổi / chuyển ca nào.' : 'Không có đơn nào chờ bạn duyệt.'}
            <div style={{ marginTop: 12, fontSize: 11, color: c.tones.bad, border: `1px dashed ${c.border}`, padding: 8, borderRadius: 4, textAlign: 'left' }}>
              <strong>DEBUG INFO (Vui lòng copy dòng này gửi lại để tôi fix nhé):</strong><br />
              - currentUserId: {currentUserId} (from storedUser)<br />
              - requests: {requests.map(r => `[ID=${r.swapRequestId}: req=${r.requesterEmployeeId}, tgt=${r.targetEmployeeId}, status=${r.status}]`).join(' | ')}
            </div>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isLeave = req.requestType === 'LEAVE';
            const isMyRequest = String(req.requesterEmployeeId) === String(currentUserId);
            const requiresPeerReview = String(req.targetEmployeeId) === String(currentUserId) && req.status === 'PENDING_PEER';

            return (
              <div
                key={req.swapRequestId}
                style={{
                  background: c.bgElev,
                  border: `1px solid ${c.borderSub}`,
                  borderRadius: 8,
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name={isLeave ? 'calendar' : 'swap'} size={15} color={c.accent} />
                    <span style={{ fontWeight: 750, fontSize: 13, color: c.fg }}>
                      {isLeave ? 'Xin Nghỉ Ca (Có Việc Bận)' : 'Đổi Ca Cho Nhau (2 Chiều)'}
                    </span>
                    <span style={{ fontSize: 11, color: c.fgFaint }}>
                      #{req.swapRequestId} · {new Date(req.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div>{renderStatusBadge(req.status)}</div>
                </div>

                <div style={{ fontSize: 11, color: c.tones.bad, background: 'rgba(255,0,0,0.1)', padding: 4, borderRadius: 4 }}>
                  DEBUG: currentUserId={currentUserId} | req.reqId={req.requesterEmployeeId} | req.tgtId={req.targetEmployeeId} | isMyRequest={isMyRequest ? 'true' : 'false'} | requiresPeerReview={requiresPeerReview ? 'true' : 'false'}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    background: c.bgCard,
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: `1px solid ${c.borderSub}`,
                    fontSize: 12,
                  }}
                >
                  <div>
                    <div style={{ color: c.fgFaint, fontSize: 11, marginBottom: 2 }}>Người Gửi Đơn:</div>
                    <div style={{ fontWeight: 700, color: c.fg }}>
                      {req.requesterName} ({req.requesterRoleName || 'Nhân viên'})
                    </div>
                    <div style={{ color: c.accent, marginTop: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="calendar" size={12} color={c.accent} />
                      <span>{req.requesterWorkDate} · {formatShiftTemplateName(req.requesterShiftName)} ({req.requesterTimeRange})</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ color: c.fgFaint, fontSize: 11, marginBottom: 2 }}>
                      {isLeave ? 'Nhân Sự Tiếp Nhận:' : 'Đổi Với Ca Của:'}
                    </div>
                    {isLeave ? (
                      <div style={{ color: c.fgSubtle, marginTop: 4, fontStyle: 'italic', fontSize: 12 }}>
                        Chưa có (Chờ Cửa hàng trưởng xem xét & xếp lại ca)
                      </div>
                    ) : (
                      <>
                        <div style={{ fontWeight: 700, color: c.fg }}>
                          {req.targetName} ({req.targetRoleName || 'Nhân viên'})
                        </div>
                        <div style={{ color: c.accent, marginTop: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Icon name="calendar" size={12} color={c.accent} />
                          <span>{req.targetWorkDate} · {formatShiftTemplateName(req.targetShiftName)} ({req.targetTimeRange})</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {req.reason && (
                  <div style={{ fontSize: 12, color: c.fgSubtle }}>
                    <strong>Lý do:</strong> {req.reason}
                  </div>
                )}

                {req.reviewedByName && (
                  <div style={{ fontSize: 11, color: c.fgFaint, borderTop: `1px dashed ${c.borderSub}`, paddingTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="edit" size={12} color={c.fgFaint} />
                    <span>Người duyệt: <strong>{req.reviewedByName}</strong> lúc {new Date(req.reviewedAt).toLocaleString('vi-VN')}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                  {requiresPeerReview && (
                    <>
                      <Button
                        variant="ghost"
                        kind="ghost"
                        size="sm"
                        disabled={actionLoadingId === req.swapRequestId}
                        onClick={() => handlePeerReview(req.swapRequestId, false)}
                        style={{ color: c.tones.bad, borderColor: c.tones.bad }}
                      >
                        {actionLoadingId === req.swapRequestId ? '...' : '❌ Từ Chối'}
                      </Button>
                      <Button
                        variant="primary"
                        kind="primary"
                        size="sm"
                        disabled={actionLoadingId === req.swapRequestId}
                        onClick={() => handlePeerReview(req.swapRequestId, true)}
                      >
                        {actionLoadingId === req.swapRequestId ? 'Đang Xử Lý...' : '✅ Đồng Ý'}
                      </Button>
                    </>
                  )}
                  {isMyRequest && (req.status === 'PENDING' || req.status === 'PENDING_PEER') && (
                    <Button
                      variant="ghost"
                      kind="ghost"
                      size="sm"
                      disabled={actionLoadingId === req.swapRequestId}
                      onClick={() => handleCancel(req.swapRequestId)}
                      style={{ color: c.fgSubtle, border: `1px solid ${c.border}` }}
                    >
                      {actionLoadingId === req.swapRequestId ? '...' : 'Hủy Đơn'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}
