import { useAdminTheme } from '@/shared/context/ThemeContext';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';
import Icon from '@/shared/components/ui/Icon';
import { formatVNDate, addWeeks } from '../hooks/useWeeklySchedule';

export default function WeekNavigator({
  weekStartDate,
  weekStatus = 'DRAFT',
  hasSchedules = false,
  hasAssignments = false,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  onOpenQuotaModal,
  onOpenFullTimeModal,
  onOpenAutoScheduleModal,
  onOpenPublishModal,
  onOpenDeleteWeeklyModal,
  onOpenDeleteAssignmentsModal,
  actionLoading = false,
  activeTab = 'roster',
  onSwitchTab,
}) {
  const { c, fonts } = useAdminTheme();
  const safeStartDate = weekStartDate || '2026-01-01';
  const parts = safeStartDate.split('-').map(Number);
  const endObj = parts.length >= 3 ? new Date(parts[0], parts[1] - 1, parts[2] + 6) : new Date();
  const endStr = `${endObj.getFullYear()}-${String(endObj.getMonth() + 1).padStart(2, '0')}-${String(endObj.getDate()).padStart(2, '0')}`;

  const isPublished = weekStatus === 'PUBLISHED';

  const isPartial = weekStatus === 'PARTIAL';

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '16px 20px',
        background: c.bgCard,
        border: `1px solid ${c.border}`,
        borderRadius: 12,
        marginBottom: 20,
      }}
    >
      {/* Bộ điều hướng chọn tuần */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: c.bgElev, border: `1px solid ${c.border}`, borderRadius: 8, padding: 4 }}>
          <button
            onClick={onPrevWeek}
            disabled={actionLoading}
            style={{
              background: 'transparent',
              border: 'none',
              color: c.fg,
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
            }}
            title="Tuần trước"
          >
            <Icon name="arrowLeft" size={16} />
          </button>
          <button
            onClick={onCurrentWeek}
            disabled={actionLoading}
            style={{
              background: c.track,
              border: 'none',
              color: c.accent,
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12.5,
              fontWeight: 700,
            }}
          >
            Hiện tại
          </button>
          <button
            onClick={onNextWeek}
            disabled={actionLoading}
            style={{
              background: 'transparent',
              border: 'none',
              color: c.fg,
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
            }}
            title="Tuần sau"
          >
            <Icon name="arrowRight" size={16} />
          </button>
        </div>

        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: c.fg, fontFamily: fonts.display, letterSpacing: 0.5 }}>
            Tuần: {formatVNDate(weekStartDate)} - {formatVNDate(endStr)}
          </div>
          <div style={{ fontSize: 12, color: c.fgFaint }}>
            Thứ Hai ({weekStartDate}) ➔ Chủ Nhật ({endStr})
          </div>
        </div>

        {/* Trạng thái tuần */}
        <div style={{ marginLeft: 8 }}>
          {isPublished ? (
            <Badge variant="success">ĐÃ CÔNG BỐ</Badge>
          ) : isPartial ? (
            <Badge variant="info">CÔNG BỐ MỘT PHẦN</Badge>
          ) : (
            <Badge variant="warning">CHƯA CÔNG BỐ</Badge>
          )}
        </div>
      </div>

      {/* Nút hành động theo Tab */}
      {activeTab === 'quota' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            onClick={onOpenQuotaModal}
            disabled={actionLoading}
          >
            <Icon name="sliders" size={15} style={{ marginRight: 6 }} />
            Thiết Lập Định Mức Tuần
          </Button>

          {/* Nút Xóa Định Mức (Xóa toàn bộ khung ca & định mức của tuần để trả về trạng thái Chưa sinh ca) */}
          {hasSchedules && (
            <Button
              variant="danger"
              onClick={onOpenDeleteWeeklyModal}
              disabled={actionLoading}
              style={{
                background: '#dc2626',
                border: '1px solid #b91c1c',
                color: '#ffffff',
              }}
              title="Xóa toàn bộ định mức và khung ca của tuần này để đặt lại về trạng thái chưa tạo ca ban đầu"
            >
              <Icon name="trash" size={15} style={{ marginRight: 6 }} />
              Xóa Định Mức
            </Button>
          )}

          {onSwitchTab && (
            <Button
              variant="secondary"
              onClick={() => onSwitchTab('roster')}
              disabled={actionLoading}
              style={{ borderColor: c.accent, color: c.accent }}
            >
              <Icon name="calendar" size={15} style={{ marginRight: 6 }} />
              Sang Bảng Xếp Ca ➔
            </Button>
          )}
        </div>
      )}

      {activeTab === 'roster' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Chuyển nhanh sang xem định mức */}
          {onSwitchTab && (
            <Button
              variant="secondary"
              onClick={() => onSwitchTab('quota')}
              disabled={actionLoading}
            >
              <Icon name="sliders" size={15} style={{ marginRight: 6 }} />
              Định Mức Ca
            </Button>
          )}

          {/* Tự động xếp ca */}
          <Button
            variant="secondary"
            onClick={onOpenAutoScheduleModal}
            disabled={actionLoading}
            style={{ borderColor: c.accent, color: c.accent }}
          >
            <Icon name="zap" size={15} style={{ marginRight: 6 }} />
            Tự Động Xếp Ca
          </Button>

          {/* Gán nhanh Full-time */}
          <Button
            variant="secondary"
            onClick={onOpenFullTimeModal}
            disabled={actionLoading}
          >
            <Icon name="users" size={15} style={{ marginRight: 6 }} />
            Gán Full-Time
          </Button>

          {/* Nút Xóa Lịch (Xóa toàn bộ phân công ca đã gán cho nhân viên trong tuần, giữ nguyên định mức ca) */}
          {hasAssignments && (
            <Button
              variant="danger"
              onClick={onOpenDeleteAssignmentsModal}
              disabled={actionLoading}
              style={{
                background: '#ef4444',
                border: '1px solid #dc2626',
                color: '#ffffff',
              }}
              title="Xóa toàn bộ các ca làm việc đã gán cho nhân viên trong tuần này (giữ nguyên định mức ca để xếp lại)"
            >
              <Icon name="trash" size={15} style={{ marginRight: 6 }} />
              Xóa Lịch
            </Button>
          )}

          {/* Nút UC 2.3: Kiểm tra & Công bố lịch */}
          <Button
            variant={isPublished ? 'secondary' : 'primary'}
            onClick={onOpenPublishModal}
            disabled={actionLoading}
          >
            <Icon name="send" size={15} style={{ marginRight: 6 }} />
            {isPublished ? 'Rà Soát & Công Bố Lại' : 'Công Bố Lịch Tuần'}
          </Button>
        </div>
      )}

      {activeTab === 'swaps' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {onSwitchTab && (
            <Button
              variant="secondary"
              onClick={() => onSwitchTab('roster')}
              disabled={actionLoading}
            >
              <Icon name="calendar" size={15} style={{ marginRight: 6 }} />
              Về Bảng Xếp Ca
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

