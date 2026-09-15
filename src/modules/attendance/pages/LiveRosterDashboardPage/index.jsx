import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';
import PageHeader from '@/shared/components/ui/PageHeader';
import Panel from '@/shared/components/ui/Panel';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import DataTable from '@/shared/components/ui/DataTable';
import { getNavItemsForRole } from '@/shared/constants/navigation.config';
import { useLiveRoster } from '../../hooks/useLiveRoster';

export const LiveRosterDashboardPage = ({ storeId = 1 }) => {
  const { c, fonts } = useAdminTheme();
  const navigate = useNavigate();

  const storedUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const userRole = (storedUser?.role || storedUser?.Role || 'SHIFT_LEADER').toUpperCase();
  const roleName = storedUser?.roleName || 'Trưởng Ca Trực';
  const navItems = getNavItemsForRole(userRole);

  const handleSidebarNavigate = (id) => {
    if (id === 'employee-schedule') navigate('/employee/schedule');
    else if (id === 'my-calendar') navigate('/employee/my-calendar');
    else if (id === 'employee-attendance') navigate('/employee/attendance-history');
    else if (id === 'attendance-otp') navigate('/employee/attendance-otp');
    else if (id === 'live-roster') navigate('/store-manager/live-roster');
  };

  const {
    roster,
    loading,
    errorMsg,
    selectedPhoto,
    setSelectedPhoto,
    flagModal,
    setFlagModal,
    fraudReason,
    setFraudReason,
    actionLoading,
    fetchRoster,
    handleFlagFraudSubmit,
    handleResolveFraud,
  } = useLiveRoster(storeId);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return <Badge tone="ok" dot>ĐÃ CÓ MẶT</Badge>;
      case 'COMPLETED':
        return <Badge tone="info" dot>ĐÃ HOÀN THÀNH CA</Badge>;
      case 'FRAUD_FLAGGED':
        return <Badge tone="bad" dot>GẮN CỜ VI PHẠM</Badge>;
      default:
        return <Badge tone="neutral" dot>CHƯA CÓ MẶT</Badge>;
    }
  };

  const columns = [
    {
      key: 'fullName',
      label: 'Nhân Viên',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: c.fg, fontSize: 13.5 }}>{row.fullName}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: c.fgSubtle }}>{row.employeeCode}</div>
        </div>
      ),
    },
    {
      key: 'positionName',
      label: 'Chức Vụ',
      render: (row) => <span style={{ color: c.fgMuted }}>{row.positionName}</span>,
    },
    {
      key: 'shiftName',
      label: 'Ca Trực',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: c.accent }}>{row.shiftName}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: c.fgSubtle }}>
            {row.startTime} - {row.endTime}
          </div>
        </div>
      ),
    },
    {
      key: 'checkInTime',
      label: 'Giờ Check-in / Check-out',
      render: (row) => (
        <div>
          {row.checkInTime ? (
            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: c.tones.ok, fontSize: 12 }}>
              In: {new Date(row.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          ) : (
            <div style={{ fontStyle: 'italic', color: c.fgFaint, fontSize: 12 }}>Chưa vào ca</div>
          )}
          {row.checkOutTime && (
            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: c.tones.info, fontSize: 12, marginTop: 2 }}>
              Out: {new Date(row.checkOutTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'photos',
      label: 'Ảnh Chụp S3 (Kiosk)',
      render: (row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          {row.checkInPhotoPresignedUrl ? (
            <Button
              kind="ghost"
              variant="ghost"
              size="sm"
              icon="eye"
              onClick={() =>
                setSelectedPhoto({
                  url: row.checkInPhotoPresignedUrl,
                  title: 'Ảnh chụp Kiosk lúc Check-in',
                  name: row.fullName,
                })
              }
            >
              In
            </Button>
          ) : (
            <span style={{ fontSize: 11, color: c.fgFaint, fontStyle: 'italic' }}>Không có ảnh</span>
          )}

          {row.checkOutPhotoPresignedUrl && (
            <Button
              kind="ghost"
              variant="ghost"
              size="sm"
              icon="eye"
              onClick={() =>
                setSelectedPhoto({
                  url: row.checkOutPhotoPresignedUrl,
                  title: 'Ảnh chụp Kiosk lúc Check-out',
                  name: row.fullName,
                })
              }
            >
              Out
            </Button>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Trạng Thái',
      render: (row) => renderStatusBadge(row.status),
    },
    {
      key: 'actions',
      label: 'Thao Tác Giám Sát',
      align: 'right',
      render: (row) => (
        <div>
          {row.attendanceId && !row.isFraudFlagged && (
            <Button
              kind="danger"
              variant="danger"
              size="sm"
              icon="close"
              onClick={() => setFlagModal({ attendanceId: row.attendanceId, name: row.fullName })}
            >
              Gắn Cờ Vi Phạm
            </Button>
          )}

          {row.isFraudFlagged && (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <Button
                kind="primary"
                variant="primary"
                size="sm"
                onClick={() => handleResolveFraud(row.attendanceId, true)}
                loading={actionLoading}
              >
                Khôi Phục Công
              </Button>
              <Button
                kind="ghost"
                variant="ghost"
                size="sm"
                onClick={() => handleResolveFraud(row.attendanceId, false)}
                loading={actionLoading}
              >
                Bác Bỏ
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="live-roster"
          onNavigate={handleSidebarNavigate}
          navItems={navItems}
          consoleLabel="SHIFT LEADER CONSOLE"
          defaultDisplayName={storedUser?.fullName || 'Trưởng ca'}
          roleLabel={roleName}
          avatarLetter={storedUser?.fullName ? storedUser.fullName.charAt(0).toUpperCase() : 'S'}
        />
      }
      topbar={
        <DashboardTopbar
          breadcrumbs={[
            { label: 'SHIFT LEADER PORTAL', href: '/employee/schedule' },
            { label: 'Bảng Trực Ca Live' },
          ]}
        />
      }
    >
      <div style={{ padding: '24px 28px', width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <PageHeader
          index="SHIFT LEADER PORTAL · GIÁM SÁT LIVE"
          title="Bảng Quân Số Trực Tiếp (Live Roster)"
          desc="Theo dõi nhân sự thực tế có mặt theo thời gian thực và đối soát ảnh chụp Kiosk S3 tại quầy"
          actions={
            <Button
              kind="ghost"
              variant="ghost"
              icon="refresh"
              onClick={fetchRoster}
              loading={loading}
            >
              Làm Mới (15s)
            </Button>
          }
        />

        {errorMsg && (
          <div
            style={{
              padding: 16,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            {errorMsg}
          </div>
        )}

        <Panel
          title="BẢNG THEO DÕI QUÂN SỐ CỬA HÀNG THỜI GIAN THỰC"
          sub="Danh sách nhân sự phân công ca trực hôm nay và nhật ký check-in từ trạm Kiosk"
          pad={16}
        >
          <DataTable
            columns={columns}
            rows={roster}
            data={roster}
            loading={loading}
            keyField="assignmentId"
            emptyText="Không có phân công ca trực nào cho cửa hàng hôm nay."
          />
        </Panel>

        {/* Modal Xem Ảnh S3 Presigned */}
        {selectedPhoto && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(4px)',
              display: 'grid',
              placeItems: 'center',
              padding: 16,
            }}
          >
            <div
              style={{
                backgroundColor: c.bgCard,
                border: `1px solid ${c.border}`,
                borderRadius: 12,
                padding: 24,
                maxWidth: 480,
                width: '100%',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'none',
                  border: 'none',
                  color: c.fgSubtle,
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: c.fg, marginBottom: 4 }}>
                {selectedPhoto.title}
              </h3>
              <p style={{ fontSize: 12, color: c.fgSubtle, marginBottom: 16 }}>
                Nhân viên: <strong>{selectedPhoto.name}</strong> (Link ảnh tạm thời S3)
              </p>

              <div
                style={{
                  borderRadius: 8,
                  overflow: 'hidden',
                  backgroundColor: '#000',
                  border: `1px solid ${c.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  maxHeight: 360,
                }}
              >
                <img src={selectedPhoto.url} alt="Kiosk Portrait" style={{ width: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        )}

        {/* Modal Gắn Cờ Gian Lận */}
        {flagModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(4px)',
              display: 'grid',
              placeItems: 'center',
              padding: 16,
            }}
          >
            <form
              onSubmit={handleFlagFraudSubmit}
              style={{
                backgroundColor: c.bgCard,
                border: `1px solid ${c.border}`,
                borderRadius: 12,
                padding: 24,
                maxWidth: 440,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 800, color: c.tones.bad, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <Icon name="close" size={20} color={c.tones.bad} />
                <span>GẮN CỜ NGHI NGỜ GIAN LẬN / VẮNG MẶT</span>
              </h3>
              <p style={{ fontSize: 12.5, color: c.fgSubtle, margin: 0 }}>
                Nhân viên: <strong style={{ color: c.fg }}>{flagModal.name}</strong>
              </p>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: c.fgSubtle, textTransform: 'uppercase', marginBottom: 6 }}>
                  Lý do gắn cờ vi phạm:
                </label>
                <textarea
                  required
                  rows="3"
                  value={fraudReason}
                  onChange={(e) => setFraudReason(e.target.value)}
                  placeholder="VD: Đã check-in trên hệ thống nhưng thực tế vắng mặt tại quầy..."
                  style={{
                    width: '100%',
                    padding: 10,
                    backgroundColor: c.bgElev,
                    border: `1px solid ${c.border}`,
                    borderRadius: 6,
                    color: c.fg,
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8 }}>
                <Button
                  kind="ghost"
                  variant="ghost"
                  type="button"
                  onClick={() => setFlagModal(null)}
                >
                  HỦY
                </Button>
                <Button
                  kind="danger"
                  variant="danger"
                  type="submit"
                  loading={actionLoading}
                >
                  XÁC NHẬN GẮN CỜ
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardShell>
  );
};

export default LiveRosterDashboardPage;
