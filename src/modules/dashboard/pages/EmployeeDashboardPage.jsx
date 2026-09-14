import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';
import PageHeader from '@/shared/components/ui/PageHeader';
import scheduleService from '@/modules/schedule/services/schedule.service';
import { getMondayOfWeek, addWeeks, formatVNDate, DAY_NAMES_VN } from '@/modules/schedule/hooks/useWeeklySchedule';
import Icon from '@/shared/components/ui/Icon';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';
import { CheckInMobileWidget } from '@/modules/attendance/components/CheckInMobileWidget';

export default function EmployeeDashboardPage() {
  const { c, fonts } = useAdminTheme();
  const navigate = useNavigate();

  const [weekStartDate, setWeekStartDate] = useState(getMondayOfWeek());
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  const storedUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const userRole = (storedUser?.role || storedUser?.Role || '').toUpperCase();
  const isSecurity = userRole === 'SECURITY' || (storedUser?.roleName || '').toLowerCase().includes('bảo vệ');

  const fetchMyShifts = useCallback(async () => {
    setLoading(true);
    try {
      // Tính 7 ngày của tuần
      const parts = weekStartDate.split('-').map(Number);
      const startD = new Date(parts[0], parts[1] - 1, parts[2]);
      const endD = new Date(startD);
      endD.setDate(startD.getDate() + 6);
      const endStr = `${endD.getFullYear()}-${String(endD.getMonth() + 1).padStart(2, '0')}-${String(endD.getDate()).padStart(2, '0')}`;

      const fullRes = await scheduleService.getMyShifts(weekStartDate, endStr);
      if (fullRes.success && fullRes.data) {
        setShifts(fullRes.data);
      } else {
        setShifts([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải lịch làm việc:', err);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, [weekStartDate]);

  useEffect(() => {
    fetchMyShifts();
  }, [fetchMyShifts]);

  // Sidebar Menu dành riêng cho Security / Employee
  const navItems = isSecurity
    ? [
        { id: 'employee-schedule', label: 'Lịch Trực Ca Tuần', icon: 'calendar', path: '/employee/schedule' },
        { type: 'group', label: 'Tiện Ích Ca Trực' },
        { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', onClick: () => alert('Tính năng Lịch sử điểm danh đang được phát triển.') },
        { id: 'employee-incidents', label: 'Báo Cáo Sự Cố & Ca Trực', icon: 'lock', onClick: () => alert('Tính năng Báo cáo ca trực đang được phát triển.') },
      ]
    : [
        { id: 'employee-schedule', label: 'Lịch Làm Việc Ca Tuần', icon: 'calendar', path: '/employee/schedule' },
        { type: 'group', label: 'Tiện Ích Nhân Viên' },
        { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', onClick: () => alert('Tính năng Lịch sử điểm danh đang được phát triển.') },
      ];

  const handleSidebarNavigate = (id) => {
    if (id === 'employee-schedule') {
      navigate('/employee/schedule');
    }
  };

  // Tạo 7 ngày trong tuần
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const parts = weekStartDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2] + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayShifts = shifts.filter((s) => s.workDate === dateStr);
    return {
      dateStr,
      dayName: DAY_NAMES_VN[i],
      dateVn: formatVNDate(dateStr),
      shifts: dayShifts,
    };
  });

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="employee-schedule"
          onNavigate={handleSidebarNavigate}
          navItems={navItems}
          consoleLabel={isSecurity ? 'SECURITY PORTAL' : 'EMPLOYEE PORTAL'}
          defaultDisplayName={storedUser?.fullName || (isSecurity ? 'Nhân viên Bảo vệ' : 'Nhân viên Cửa hàng')}
          roleLabel={storedUser?.roleName || (isSecurity ? 'Bảo vệ Chi nhánh' : 'Nhân viên Chi nhánh')}
          avatarLetter={storedUser?.fullName ? storedUser.fullName.charAt(0).toUpperCase() : 'S'}
        />
      }
      topbar={
        <DashboardTopbar
          breadcrumbs={[
            { label: isSecurity ? 'Security Portal' : 'Employee Portal', href: '/employee/schedule' },
            { label: 'Lịch Phân Công Ca Tuần' },
          ]}
        />
      }
    >
      <div style={{ padding: '24px 20px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Page Header */}
        <PageHeader
          index={isSecurity ? 'Security Portal · Lịch Trực' : 'Employee Portal · Lịch Làm Việc'}
          title={isSecurity ? 'LỊCH TRỰC CA TUẦN (BẢO VỆ)' : 'LỊCH LÀM VIỆC CA TUẦN'}
          desc={`Theo dõi lịch phân công ca làm việc chốt chính thức 7 ngày trong tuần của ${storedUser?.fullName || 'Nhân sự'} tại ${storedUser?.storeName || 'Cửa hàng'}.`}
        />

        {/* Banner Thông Báo Đã Công Bố Lịch */}
        <div
          style={{
            background: `linear-gradient(135deg, ${c.tones.okDim}, ${c.bgCard})`,
            border: `1px solid ${c.tones.ok}`,
            borderRadius: 12,
            padding: '20px 24px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            marginTop: 20,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: c.tones.ok,
              color: '#000',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name="check" size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: c.tones.ok, textTransform: 'uppercase' }}>
                Thông Báo: Lịch Làm Việc Tuần Đã Được Công Bố!
              </span>
              <Badge tone="ok">CONFIRMED</Badge>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: c.fgMuted, lineHeight: 1.5 }}>
              Quản lý cửa hàng đã hoàn tất việc lập định mức và <strong>Công Bố Lịch Tuần (UC 2.3)</strong>.
              Lịch trực cá nhân của bạn dưới đây đã được chốt chính thức. Vui lòng có mặt đúng giờ quy định.
            </p>
          </div>
        </div>

        {/* Lấy mã OTP Điểm danh tại quầy */}
        <CheckInMobileWidget />

        {/* Thống kê nhanh ca tuần */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 11, color: c.fgSubtle, textTransform: 'uppercase', fontWeight: 700 }}>
              TỔNG CA ĐÃ NHẬN TUẦN NÀY
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: c.fg, marginTop: 6, fontFamily: fonts.display }}>
              {shifts.length} Ca
            </div>
            <div style={{ fontSize: 11.5, color: c.tones.ok, marginTop: 4 }}>
              ✓ Đầy đủ chỉ tiêu công việc
            </div>
          </div>

          <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 11, color: c.fgSubtle, textTransform: 'uppercase', fontWeight: 700 }}>
              TỔNG GIỜ LÀM VIỆC DỰ KIẾN
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: c.accent, marginTop: 6, fontFamily: fonts.display }}>
              {shifts.length * 8} Giờ
            </div>
            <div style={{ fontSize: 11.5, color: c.fgFaint, marginTop: 4 }}>
              Trung bình 8 giờ / ca trực
            </div>
          </div>

          <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 11, color: c.fgSubtle, textTransform: 'uppercase', fontWeight: 700 }}>
              TRẠNG THÁI PHÊ DUYỆT
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: c.tones.ok, marginTop: 10 }}>
              ĐÃ XÁC NHẬN
            </div>
            <div style={{ fontSize: 11.5, color: c.fgFaint, marginTop: 4 }}>
              Không có xung đột lịch
            </div>
          </div>
        </div>

        {/* Thanh Điều Hướng Tuần */}
        <div
          style={{
            background: c.bgCard,
            border: `1px solid ${c.border}`,
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button variant="ghost" size="sm" onClick={() => setWeekStartDate((prev) => addWeeks(prev, -1))}>
              ◀ Tuần Trước
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setWeekStartDate(getMondayOfWeek())}>
              Tuần Hiện Tại
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setWeekStartDate((prev) => addWeeks(prev, 1))}>
              Tuần Sau ▶
            </Button>
          </div>

          <div style={{ fontWeight: 800, fontSize: 15, color: c.fg }}>
            Tuần: {formatVNDate(weekStartDate)} - {formatVNDate(weekDays[6].dateStr)} / {weekStartDate.split('-')[0]}
          </div>
        </div>

        {/* Bảng Danh Sách 7 Ngày Lịch Tuần */}
        <h3 style={{ fontSize: 16, fontWeight: 800, color: c.fg, marginBottom: 14 }}>
          📅 Chi Tiết Lịch Phân Công 7 Ngày
        </h3>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: c.fgSubtle }}>
            Đang tải dữ liệu ca trực...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {weekDays.map((day) => {
              const hasShift = day.shifts.length > 0;
              return (
                <div
                  key={day.dateStr}
                  style={{
                    background: hasShift ? c.bgCard : c.bgElev,
                    border: `1px solid ${hasShift ? c.accent : c.border}`,
                    borderRadius: 10,
                    padding: 16,
                    position: 'relative',
                    boxShadow: hasShift ? `0 4px 16px ${c.accentDim}20` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: 15, color: c.fg }}>{day.dayName}</span>
                      <span style={{ marginLeft: 8, fontSize: 12, color: c.fgFaint }}>({day.dateVn})</span>
                    </div>
                    {hasShift ? (
                      <Badge tone="ok">CONFIRMED</Badge>
                    ) : (
                      <Badge tone="neutral">NGHỈ</Badge>
                    )}
                  </div>

                  {hasShift ? (
                    day.shifts.map((s, idx) => {
                      const isNight = s.shiftName?.includes('Đêm') || s.templateCode?.includes('DEM');
                      const isMorning = s.shiftName?.includes('Sáng') || s.templateCode?.includes('SANG');
                      const badgeColor = isNight ? '#a855f7' : isMorning ? '#38bdf8' : '#f59e0b';

                      return (
                        <div
                          key={idx}
                          style={{
                            background: `${badgeColor}15`,
                            border: `1px solid ${badgeColor}`,
                            borderRadius: 8,
                            padding: '12px 14px',
                            marginTop: 8,
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: 13.5, color: badgeColor, marginBottom: 4 }}>
                            {s.shiftName}
                          </div>
                          <div style={{ fontSize: 12, color: c.fg, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon name="pulse" size={13} color={badgeColor} />
                            <span><strong>Khung giờ:</strong> {s.startTime?.substring(0, 5)} - {s.endTime?.substring(0, 5)}</span>
                          </div>
                          <div style={{ fontSize: 11.5, color: c.fgMuted, marginTop: 4 }}>
                            📍 {s.storeName || 'Cửa hàng Tiện lợi Cầu Giấy'}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: c.fgFaint, fontSize: 12 }}>
                      (Không có ca trực — Ngày nghỉ)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
