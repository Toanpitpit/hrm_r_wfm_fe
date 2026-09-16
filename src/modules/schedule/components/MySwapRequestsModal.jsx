import { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { useToast } from '@/components/ui/toast/ToastProvider';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';
import Icon from '@/shared/components/ui/Icon';
import { formatShiftTemplateName } from '../hooks/useWeeklySchedule';
import { getMySwapRequests } from '../services/schedule.service';

export default function MySwapRequestsModal({ isOpen, onClose }) {
  const { c, fonts } = useAdminTheme();
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (isOpen) {
      fetchMyRequests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <Badge tone="ok" dot>Đã Phê Duyệt</Badge>;
      case 'REJECTED':
        return <Badge tone="bad" dot>Từ Chối</Badge>;
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '60vh', overflowY: 'auto' }}>

        {loading ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: c.fgSubtle, fontSize: 13 }}>
            Đang tải danh sách đơn của bạn...
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: c.fgFaint, fontStyle: 'italic', fontSize: 13 }}>
            Bạn chưa gửi hoặc chưa nhận đơn xin đổi / chuyển ca nào.
          </div>
        ) : (
          requests.map((req) => {
            const isLeave = req.requestType === 'LEAVE';
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
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}
