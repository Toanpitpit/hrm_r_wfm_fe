import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';
import PageHeader from '@/shared/components/ui/PageHeader';
import scheduleService from '@/modules/schedule/services/schedule.service';
import { getMondayOfWeek, addWeeks, formatVNDate, DAY_NAMES_VN } from '@/modules/schedule/hooks/useWeeklySchedule';
import { getNavItemsForRole } from '@/shared/constants/navigation.config';
import Icon from '@/shared/components/ui/Icon';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';

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
  const roleName = (storedUser?.roleName || '').toLowerCase();

  const isShiftLeader = userRole === 'SHIFT_LEADER' || roleName.includes('trưởng ca');
  const isCashier = userRole === 'CASHIER' || roleName.includes('thu ngân');
  const isSales = userRole === 'SALES_STAFF' || roleName.includes('bán hàng');
  const isSecurity = userRole === 'SECURITY_GUARD' || userRole === 'SECURITY' || roleName.includes('bảo vệ');

  let portalTitle = 'EMPLOYEE PORTAL';
  let roleTitle = 'LỊCH LÀM VIỆC CA TUẦN';
  let roleSubtitle = storedUser?.roleName || 'Nhân sự Chi nhánh';

  if (isShiftLeader) {
    portalTitle = 'SHIFT LEADER PORTAL';
    roleTitle = 'LỊCH PHÂN CÔNG & TRỰC CA (TRƯỞNG CA)';
    if (!storedUser?.roleName) roleSubtitle = 'Trưởng Ca Trực';
  } else if (isCashier) {
    portalTitle = 'CASHIER PORTAL';
    roleTitle = 'LỊCH LÀM VIỆC CA TUẦN (THU NGÂN)';
    if (!storedUser?.roleName) roleSubtitle = 'Thu Ngân Chi nhánh';
  } else if (isSales) {
    portalTitle = 'SALES PORTAL';
    roleTitle = 'LỊCH LÀM VIỆC CA TUẦN (BÁN HÀNG)';
    if (!storedUser?.roleName) roleSubtitle = 'Nhân Viên Bán Hàng';
  } else if (isSecurity) {
    portalTitle = 'SECURITY PORTAL';
    roleTitle = 'LỊCH TRỰC CA TUẦN (BẢO VỆ)';
    if (!storedUser?.roleName) roleSubtitle = 'Bảo Vệ Chi nhánh';
  }

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

  // Dynamic Sidebar Menu Items based on role
  const navItems = getNavItemsForRole(userRole);

  const handleSidebarNavigate = (id) => {
    if (id === 'employee-schedule') {
      navigate('/employee/schedule');
    } else if (id === 'live-roster') {
      navigate('/store-manager/live-roster');
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
          consoleLabel={portalTitle}
          defaultDisplayName={storedUser?.fullName || 'Nhân viên Chi nhánh'}
          roleLabel={roleSubtitle}
          avatarLetter={storedUser?.fullName ? storedUser.fullName.charAt(0).toUpperCase() : 'E'}
        />
      }
      topbar={
        <DashboardTopbar
          breadcrumbs={[
            { label: portalTitle, href: '/employee/schedule' },
            { label: 'Lịch Phân Công Ca Tuần' },
          ]}
        />
      }
    >
      <div style={{ padding: '24px 20px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Page Header */}
        <PageHeader
          index={`${portalTitle} · Lịch Phân Công`}
          title={roleTitle}
          desc={`Theo dõi lịch phân công ca làm việc chốt chính thức 7 ngày trong tuần của ${storedUser?.fullName || 'Nhân sự'} tại ${storedUser?.storeName || 'Cửa hàng'}.`}
        />

        {/* Banner Thông Báo Đã Công Bố Lịch */}
        <div
          style={{
            background: c.bgCard,
            border: `1.5px solid rgba(16, 185, 129, 0.4)`,
            borderRadius: 16,
            padding: '20px 24px',
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
              borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10B981',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name="check" size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: c.fg }}>
                Lịch Làm Việc Tuần Đã Được Công Bố
              </span>
              <Badge tone="ok">CONFIRMED</Badge>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: c.fgSubtle, lineHeight: 1.5 }}>
              Quản lý cửa hàng đã hoàn tất phê duyệt và công bố lịch tuần. Lịch trực cá nhân của bạn dưới đây đã được chốt chính thức.
            </p>
          </div>
        </div>

        {/* 3 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <StatCard
            label="TỔNG CA NHẬN TUẦN NÀY"
            title="TỔNG CA NHẬN TUẦN NÀY"
            value={`${shifts.length} Ca`}
            subtext="✓ Đầy đủ chỉ tiêu phân công"
            icon="calendar"
            tone="ok"
          />
          <StatCard
            label="TỔNG GIỜ LÀM DỰ KIẾN"
            title="TỔNG GIỜ LÀM DỰ KIẾN"
            value={`${shifts.length * 8} Giờ`}
            subtext="Trung bình 8 giờ / ca trực"
            icon="clock"
            tone="info"
          />
          <StatCard
            label="TRẠNG THÁI LỊCH TUẦN"
            title="TRẠNG THÁI LỊCH TUẦN"
            value="ĐÃ XÁC NHẬN"
            subtext="Không có xung đột ca"
            icon="check"
            tone="ok"
          />
        </div>

        {/* Thanh Điều Hướng Tuần */}
        <div
          style={{
            background: c.bgCard,
            border: `1px solid ${c.border}`,
            borderRadius: 14,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button kind="ghost" variant="ghost" size="sm" onClick={() => setWeekStartDate((prev) => addWeeks(prev, -1))}>
              ◀ Tuần Trước
            </Button>
            <Button kind="ghost" variant="ghost" size="sm" onClick={() => setWeekStartDate(getMondayOfWeek())}>
              Tuần Hiện Tại
            </Button>
            <Button kind="ghost" variant="ghost" size="sm" onClick={() => setWeekStartDate((prev) => addWeeks(prev, 1))}>
              Tuần Sau ▶
            </Button>
          </div>

          <div style={{ fontWeight: 700, fontSize: 15, color: c.fg, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="calendar" size={17} color="#2563EB" />
            <span>Tuần: {formatVNDate(weekStartDate)} – {formatVNDate(weekDays[6].dateStr)}</span>
          </div>
        </div>

        {/* Bảng Danh Sách 7 Ngày Lịch Tuần */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: c.fg, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📅 Chi Tiết Lịch Phân Công 7 Ngày</span>
          </h3>

          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: c.fgSubtle, background: c.bgCard, borderRadius: 16, border: `1px solid ${c.border}` }}>
              Đang tải dữ liệu ca trực...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {weekDays.map((day) => {
                const hasShift = day.shifts.length > 0;
                return (
                  <div
                    key={day.dateStr}
                    style={{
                      background: hasShift ? c.bgCard : c.bgElev,
                      border: `1.5px solid ${hasShift ? '#2563EB' : c.border}`,
                      borderRadius: 16,
                      padding: 18,
                      position: 'relative',
                      boxShadow: hasShift ? '0 4px 16px rgba(37, 99, 235, 0.12)' : 'none',
                      transition: 'all .16s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: 15, color: c.fg }}>{day.dayName}</span>
                        <span style={{ marginLeft: 8, fontSize: 12, color: c.fgSubtle }}>({day.dateVn})</span>
                      </div>
                      {hasShift ? (
                        <Badge tone="ok">CÓ CA TRỰC</Badge>
                      ) : (
                        <Badge tone="neutral">NGHỈ</Badge>
                      )}
                    </div>

                    {hasShift ? (
                      day.shifts.map((s, idx) => {
                        const isNight = s.shiftName?.includes('Đêm') || s.templateCode?.includes('DEM');
                        const isMorning = s.shiftName?.includes('Sáng') || s.templateCode?.includes('SANG');
                        const badgeColor = isNight ? '#A855F7' : isMorning ? '#0284C7' : '#F59E0B';

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
