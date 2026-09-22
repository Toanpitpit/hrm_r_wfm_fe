import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { getNavItemsForRole } from '@/shared/constants/navigation.config';
import { ATTENDANCE_MESSAGES } from '@/shared/constants/message.constants';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatCard from '@/shared/components/ui/StatCard';
import Panel from '@/shared/components/ui/Panel';
import DataTable from '@/shared/components/ui/DataTable';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import { IconButton } from '@/shared/components/ui';
import { useToast } from '@/components/ui/toast/ToastProvider';
import { useCheckInMobile } from '../../hooks/useCheckInMobile';

export default function AttendanceOtpPage() {
  const { c, fonts } = useAdminTheme();
  const navigate = useNavigate();
  const toast = useToast();
  const [copiedId, setCopiedId] = useState(null);

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
  let roleSubtitle = storedUser?.roleName || 'Nhân sự Chi nhánh';

  if (isShiftLeader) {
    portalTitle = 'SHIFT LEADER PORTAL';
    if (!storedUser?.roleName) roleSubtitle = 'Trưởng Ca Trực';
  } else if (isCashier) {
    portalTitle = 'CASHIER PORTAL';
    if (!storedUser?.roleName) roleSubtitle = 'Thu Ngân Chi nhánh';
  } else if (isSales) {
    portalTitle = 'SALES PORTAL';
    if (!storedUser?.roleName) roleSubtitle = 'Nhân Viên Bán Hàng';
  } else if (isSecurity) {
    portalTitle = 'SECURITY PORTAL';
    if (!storedUser?.roleName) roleSubtitle = 'Bảo Vệ Chi nhánh';
  }

  const navItems = getNavItemsForRole(userRole);

  const {
    loading,
    otpData,
    countdown,
    errorMsg,
    activeType,
    otpHistory,
    handleRequestOtp,
  } = useCheckInMobile();

  const handleSidebarNavigate = (id) => {
    if (id === 'my-calendar') {
      navigate('/employee/my-calendar');
    } else if (id === 'attendance-otp') {
      navigate('/employee/attendance-otp');
    } else if (id === 'live-roster') {
      navigate('/store-manager/live-roster');
    }
  };

  const handleCopyOtp = (code, idKey) => {
    if (code) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code);
      }
      setCopiedId(idKey || code);
      setTimeout(() => setCopiedId(null), 2000);
      if (toast?.success) {
        toast.success(ATTENDANCE_MESSAGES.COPY_SUCCESS);
      }
    }
  };

  // DataTable columns definition for history
  const columns = [
    {
      key: 'otpCode',
      label: ATTENDANCE_MESSAGES.COL_OTP_CODE,
      w: '160px',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 800, color: c.accent }}>
            {row.otpCode}
          </span>
          <IconButton
            name={copiedId === row.id ? 'check' : 'copy'}
            onClick={() => handleCopyOtp(row.otpCode, row.id)}
            title={ATTENDANCE_MESSAGES.BTN_COPY}
          />
        </div>
      ),
    },
    {
      key: 'type',
      label: ATTENDANCE_MESSAGES.COL_TYPE,
      w: '150px',
      render: (row) => (
        <Badge tone={row.type === 'CHECK_IN' ? 'ok' : 'warn'}>
          <Icon name={row.type === 'CHECK_IN' ? 'pin' : 'clock'} size={12} />
          {row.type === 'CHECK_IN' ? ATTENDANCE_MESSAGES.CHECK_IN_LABEL : ATTENDANCE_MESSAGES.CHECK_OUT_LABEL}
        </Badge>
      ),
    },
    {
      key: 'distanceMeters',
      label: ATTENDANCE_MESSAGES.COL_DISTANCE,
      w: '150px',
      render: (row) => (
        <span style={{ fontSize: 13, color: c.fg }}>
          {row.distanceMeters}m
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: ATTENDANCE_MESSAGES.COL_CREATED_AT,
      render: (row) => {
        const d = new Date(row.createdAt);
        return (
          <span style={{ fontSize: 12, color: c.fgSubtle }}>
            {d.toLocaleDateString('vi-VN')} {d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: ATTENDANCE_MESSAGES.COL_STATUS,
      w: '140px',
      render: (row) => {
        const isActive = new Date() < new Date(row.expiresAt);
        return (
          <Badge tone={isActive ? 'ok' : 'bad'}>
            <Icon name={isActive ? 'check' : 'x'} size={12} />
            {isActive ? ATTENDANCE_MESSAGES.STATUS_ACTIVE : ATTENDANCE_MESSAGES.STATUS_EXPIRED}
          </Badge>
        );
      },
    },
  ];

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="attendance-otp"
          activePath="/employee/attendance-otp"
          onNavigate={handleSidebarNavigate}
          consoleLabel={portalTitle}
          defaultDisplayName={storedUser?.fullName || 'Nhân viên Chi nhánh'}
          roleLabel={roleSubtitle}
          avatarLetter={storedUser?.fullName ? storedUser.fullName.charAt(0).toUpperCase() : 'E'}
          brandName="RWFM Enterprise"
        />
      }
      topbar={
        <DashboardTopbar
          breadcrumbs={[
            { label: 'Cá Nhân', href: '/employee/my-calendar' },
            { label: 'Tiện Ích', href: '/employee/attendance-otp' },
            { label: 'Mã Điểm Danh Kiosk' },
          ]}
        />
      }
    >
      <div style={{ padding: '24px 28px', width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Page Header with Action Buttons */}
        <PageHeader
          index={ATTENDANCE_MESSAGES.PAGE_INDEX}
          title={ATTENDANCE_MESSAGES.PAGE_TITLE}
          desc={ATTENDANCE_MESSAGES.PAGE_DESC}
          actions={
            <>
              <Button
                variant="ghost"
                kind="ghost"
                icon="clock"
                onClick={() => handleRequestOtp('CHECK_OUT')}
                loading={loading}
              >
                {ATTENDANCE_MESSAGES.BTN_CHECKOUT}
              </Button>
              <Button
                variant="primary"
                kind="primary"
                icon="pin"
                onClick={() => handleRequestOtp('CHECK_IN')}
                loading={loading}
              >
                {ATTENDANCE_MESSAGES.BTN_CHECKIN}
              </Button>
            </>
          }
        />

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <StatCard
            label={ATTENDANCE_MESSAGES.STAT_TOTAL_OTP}
            title={ATTENDANCE_MESSAGES.STAT_TOTAL_OTP}
            value={otpHistory.length}
            subtext={ATTENDANCE_MESSAGES.STAT_TOTAL_SUB}
            icon="screen"
            tone="info"
          />
          <StatCard
            label={ATTENDANCE_MESSAGES.STAT_STATUS_LABEL}
            title={ATTENDANCE_MESSAGES.STAT_STATUS_LABEL}
            value={otpData && countdown > 0 ? `${countdown}s` : 'CHƯA CÓ'}
            subtext={otpData ? `Cách cửa hàng ${otpData.distanceMeters}m` : 'Bấm nút để tạo mã mới'}
            icon="lock"
            tone={otpData && countdown > 0 ? 'ok' : 'warn'}
          />
          <StatCard
            label={ATTENDANCE_MESSAGES.STAT_GPS_LABEL}
            title={ATTENDANCE_MESSAGES.STAT_GPS_LABEL}
            value="ĐÃ XÁC THỰC"
            subtext={ATTENDANCE_MESSAGES.STAT_GPS_SUB}
            icon="pin"
            tone="ok"
          />
          <StatCard
            label={ATTENDANCE_MESSAGES.STAT_BRANCH_LABEL}
            title={ATTENDANCE_MESSAGES.STAT_BRANCH_LABEL}
            value={storedUser?.storeName || 'Cửa hàng CH01'}
            subtext="Trạm iPad Kiosk tại quầy"
            icon="building"
            tone="neutral"
          />
        </div>



        {/* Active OTP Card Panel */}
        {otpData && countdown > 0 && !loading && (
          <Panel
            title={ATTENDANCE_MESSAGES.ACTIVE_PANEL_TITLE}
            sub={ATTENDANCE_MESSAGES.ACTIVE_PANEL_SUB}
          >
            <div
              style={{
                background: c.bgRaised,
                border: `1px solid ${c.accent}`,
                borderRadius: 16,
                padding: 24,
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, justifyContent: 'center' }}>
                <Badge tone="ok">
                  <Icon name="check" size={13} />
                  {ATTENDANCE_MESSAGES.GPS_VALID_PREFIX} {otpData.distanceMeters}{ATTENDANCE_MESSAGES.GPS_VALID_SUFFIX}
                </Badge>
                <Badge tone={activeType === 'CHECK_IN' ? 'ok' : 'warn'}>
                  {activeType === 'CHECK_IN' ? ATTENDANCE_MESSAGES.CHECK_IN_LABEL : ATTENDANCE_MESSAGES.CHECK_OUT_LABEL}
                </Badge>
              </div>

              <p style={{ fontSize: 13, color: c.fgFaint, marginBottom: 14 }}>
                {ATTENDANCE_MESSAGES.OTP_INSTRUCTION_PREFIX} ({activeType === 'CHECK_IN' ? ATTENDANCE_MESSAGES.CHECK_IN_LABEL : ATTENDANCE_MESSAGES.CHECK_OUT_LABEL}) {ATTENDANCE_MESSAGES.OTP_INSTRUCTION_SUFFIX}
              </p>

              {/* Large Monospace OTP Digits */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 42,
                    fontFamily: fonts.display,
                    fontWeight: 900,
                    letterSpacing: 12,
                    color: c.accent,
                    background: c.bgCard,
                    padding: '16px 36px',
                    borderRadius: 14,
                    border: `2px dashed ${c.accent}`,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  }}
                >
                  {otpData.otpCode}
                </div>
              </div>

              {/* Copy Button */}
              <div style={{ marginBottom: 16 }}>
                <Button
                  variant="outline"
                  kind="ghost"
                  size="sm"
                  icon={copiedId === 'active-otp' ? 'check' : 'copy'}
                  onClick={() => handleCopyOtp(otpData.otpCode, 'active-otp')}
                >
                  {copiedId === 'active-otp' ? 'Đã Sao Chép' : ATTENDANCE_MESSAGES.BTN_COPY}
                </Button>
              </div>

              {/* Progress Bar & Countdown */}
              <div style={{ maxWidth: 460, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontWeight: 700, color: c.fgFaint, marginBottom: 6 }}>
                  <span>{ATTENDANCE_MESSAGES.EXPIRATION_TEXT}</span>
                  <span style={{ color: c.accent, fontFamily: fonts.display, fontSize: 14 }}>{countdown}s</span>
                </div>
                <div style={{ width: '100%', height: 8, background: c.track, borderRadius: 10, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(countdown / 60) * 100}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${c.accent}, ${c.tones.ok})`,
                      borderRadius: 10,
                      transition: 'width 1s linear',
                    }}
                  />
                </div>
              </div>
            </div>
          </Panel>
        )}

        {/* History DataTable Panel */}
        <Panel
          title={ATTENDANCE_MESSAGES.HISTORY_PANEL_TITLE}
          sub={ATTENDANCE_MESSAGES.HISTORY_PANEL_SUB}
        >
          <DataTable
            columns={columns}
            rows={otpHistory}
            data={otpHistory}
            loading={loading}
            keyField="id"
            emptyText={ATTENDANCE_MESSAGES.NO_HISTORY}
          />
        </Panel>

        {/* 3 Step Instruction Panel */}
        <Panel
          title={ATTENDANCE_MESSAGES.GUIDE_TITLE}
          sub="Các bước đơn giản để thực hiện xác thực điểm danh tại trạm iPad cửa hàng"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div style={{ padding: 18, borderRadius: 12, background: c.bgElev, border: `1px solid ${c.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: c.accent, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="pin" size={16} />
                <span>BƯỚC 1: ĐỊNH VỊ GPS</span>
              </div>
              <p style={{ fontSize: 12.5, color: c.fgFaint, lineHeight: 1.6, margin: 0 }}>
                {ATTENDANCE_MESSAGES.GUIDE_STEP_1}
              </p>
            </div>

            <div style={{ padding: 18, borderRadius: 12, background: c.bgElev, border: `1px solid ${c.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: c.accent, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="clock" size={16} />
                <span>BƯỚC 2: YÊU CẦU MÃ OTP</span>
              </div>
              <p style={{ fontSize: 12.5, color: c.fgFaint, lineHeight: 1.6, margin: 0 }}>
                {ATTENDANCE_MESSAGES.GUIDE_STEP_2}
              </p>
            </div>

            <div style={{ padding: 18, borderRadius: 12, background: c.bgElev, border: `1px solid ${c.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: c.accent, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="screen" size={16} />
                <span>BƯỚC 3: NHẬP TẠI KIOSK</span>
              </div>
              <p style={{ fontSize: 12.5, color: c.fgFaint, lineHeight: 1.6, margin: 0 }}>
                {ATTENDANCE_MESSAGES.GUIDE_STEP_3}
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
