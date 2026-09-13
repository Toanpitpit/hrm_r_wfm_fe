import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import Badge from '@/shared/components/ui/Badge';
import { formatVNDate } from '../hooks/useWeeklySchedule';

export default function PublishScheduleModal({
  isOpen,
  onClose,
  weekStartDate,
  conflictReport,
  onConfirmPublish,
  actionLoading = false,
}) {
  const { c, fonts } = useAdminTheme();

  if (!conflictReport) return null;

  const { totalAssignments, understaffedShiftsCount, issues, isReadyToPublish, summaryMessage } =
    conflictReport;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rà Soát Xung Đột & Công Bố Lịch Tuần (UC 2.3)"
    >
      <div>
        {/* Banner tóm tắt trạng thái */}
        <div
          style={{
            background: isReadyToPublish ? `${c.tones.good}15` : `${c.tones.bad}15`,
            border: `1px solid ${isReadyToPublish ? c.tones.good : c.tones.bad}`,
            borderRadius: 10,
            padding: '14px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ color: isReadyToPublish ? c.tones.good : c.tones.bad }}>
            <Icon name={isReadyToPublish ? 'checkCircle' : 'alertTriangle'} size={24} />
          </span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: c.fg }}>
              {isReadyToPublish ? 'Lịch Tuần Đạt Chuẩn Công Bố!' : 'Cảnh Báo Định Mức Chưa Đạt'}
            </div>
            <div style={{ fontSize: 12.5, color: c.fgSubtle, marginTop: 2 }}>
              {summaryMessage}
            </div>
          </div>
        </div>

        {/* Các chỉ số thống kê */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
          <div style={{ background: c.bgElev, border: `1px solid ${c.border}`, borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, color: c.fgFaint, textTransform: 'uppercase', fontWeight: 700 }}>
              Tổng lượt ca đã phân bổ
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.fg, fontFamily: fonts.display, marginTop: 4 }}>
              {totalAssignments} <span style={{ fontSize: 13, fontWeight: 500, color: c.fgFaint }}>lượt</span>
            </div>
          </div>

          <div style={{ background: c.bgElev, border: `1px solid ${c.border}`, borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, color: c.fgFaint, textTransform: 'uppercase', fontWeight: 700 }}>
              Ca thiếu nhân sự
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: understaffedShiftsCount > 0 ? c.tones.bad : c.tones.good,
                fontFamily: fonts.display,
                marginTop: 4,
              }}
            >
              {understaffedShiftsCount} <span style={{ fontSize: 13, fontWeight: 500, color: c.fgFaint }}>ca</span>
            </div>
          </div>
        </div>

        {/* Danh sách các cảnh báo / ca thiếu người */}
        {issues && issues.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: c.fg, marginBottom: 8 }}>
              Chi tiết các ca chưa đạt định mức nhu cầu:
            </div>
            <div
              style={{
                maxHeight: 160,
                overflowY: 'auto',
                background: c.bgElev,
                border: `1px solid ${c.border}`,
                borderRadius: 8,
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              {issues.map((issue, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: 12,
                    color: c.tones.bad,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 6,
                  }}
                >
                  <span style={{ fontWeight: 800 }}>•</span>
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chú thích thông báo tới nhân viên */}
        <div
          style={{
            background: c.bgCard,
            border: `1px solid ${c.borderSub}`,
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 12,
            color: c.fgFaint,
            marginBottom: 20,
          }}
        >
          📢 <strong>Thông báo tự động:</strong> Sau khi công bố, lịch tuần sẽ được chốt và thông báo ca trực sẽ được gửi ngay đến ứng dụng di động của tất cả nhân viên.
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="ghost" onClick={onClose} type="button" disabled={actionLoading}>
            Quay Lại Rà Soát
          </Button>
          <Button variant="primary" onClick={onConfirmPublish} disabled={actionLoading}>
            {actionLoading ? 'Đang công bố...' : 'Xác Nhận & Công Bố Lịch Tuần'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
