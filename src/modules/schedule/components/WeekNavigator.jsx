import { useAdminTheme } from '@/shared/context/ThemeContext';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';
import Icon from '@/shared/components/ui/Icon';
import { formatVNDate, addWeeks } from '../hooks/useWeeklySchedule';

export default function WeekNavigator({
  weekStartDate,
  weekStatus = 'DRAFT',
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  onOpenQuotaModal,
  onOpenFullTimeModal,
  onOpenAutoScheduleModal,
  onOpenPublishModal,
  actionLoading = false,
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
            <Badge variant="success">✓ ĐÃ CÔNG BỐ</Badge>
          ) : isPartial ? (
            <Badge variant="info">⚡ CÔNG BỐ MỘT PHẦN</Badge>
          ) : (
            <Badge variant="warning">📝 BẢN NHÁP (DRAFT)</Badge>
          )}
        </div>
      </div>

      {/* Nút hành động */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {/* Nút UC 2.1: Thiết lập định mức */}
        <Button
          variant="secondary"
          onClick={onOpenQuotaModal}
          disabled={actionLoading}
        >
          <Icon name="sliders" size={15} style={{ marginRight: 6 }} />
          Định Mức Tuần
        </Button>

        {/* Nút UC 2.1: Tự động xếp ca bằng Google OR-Tools */}
        <Button
          variant="secondary"
          onClick={onOpenAutoScheduleModal}
          disabled={actionLoading}
          style={{ borderColor: c.accent, color: c.accent }}
        >
          <Icon name="zap" size={15} style={{ marginRight: 6 }} />
          ⚡ Tự Động Xếp Ca (OR-Tools)
        </Button>

        {/* Nút UC 2.1: Gán nhanh Full-time */}
        <Button
          variant="secondary"
          onClick={onOpenFullTimeModal}
          disabled={actionLoading}
        >
          <Icon name="users" size={15} style={{ marginRight: 6 }} />
          Gán Full-Time
        </Button>

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
    </div>
  );
}

