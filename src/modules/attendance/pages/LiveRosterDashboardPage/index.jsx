import React, { useState } from 'react';
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

export const LiveRosterDashboardPage = ({ storeId = null }) => {
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

  const effectiveStoreId = storeId || storedUser?.storeId || storedUser?.homeBranchId || storedUser?.branchId || 1;
  const userRole = (storedUser?.role || storedUser?.Role || 'STORE_MANAGER').toUpperCase();
  const roleName = storedUser?.roleName || 'Cửa Hàng Trưởng';
  const navItems = getNavItemsForRole(userRole);

  const handleSidebarNavigate = (id) => {
    if (id === 'my-calendar') navigate('/employee/my-calendar');
    else if (id === 'employee-attendance') navigate('/employee/attendance-history');
    else if (id === 'attendance-otp') navigate('/employee/attendance-otp');
    else if (id === 'live-roster') navigate('/store-manager/live-roster');
    else if (id === 'store-schedules') navigate('/store-manager/schedules');
    else if (id === 'shift-requests') navigate('/employee/shift-requests');
    else if (id === 'employees') navigate('/employees');
    else if (id === 'kiosk-codes') navigate('/store-manager/kiosk-codes');
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
  } = useLiveRoster(effectiveStoreId);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return <Badge tone="good" dot>ĐÃ CÓ MẶT</Badge>;
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
      title: 'Nhân Viên',
      key: 'fullName',
      render: (item) => {
        const avatarLetter = (item.fullName || 'N').trim().charAt(0).toUpperCase();
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {avatarLetter}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: c.fg, fontSize: 13.5 }}>{item.fullName}</div>
              <div style={{ fontSize: 11.5, color: c.fgSubtle, fontFamily: fonts?.mono || 'monospace' }}>
                {item.employeeCode}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Chức Vụ',
      key: 'positionName',
      render: (item) => (
        <span style={{ color: c.fgMuted, fontSize: 13, fontWeight: 500 }}>
          {item.positionName || 'Nhân Viên'}
        </span>
      ),
    },
    {
      title: 'Ca Trực',
      key: 'shiftName',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: c.accent, fontSize: 13 }}>{item.shiftName}</div>
          <div style={{ fontSize: 11.5, color: c.fgSubtle, fontFamily: fonts?.mono || 'monospace', marginTop: 2 }}>
            {item.startTime} - {item.endTime}
          </div>
        </div>
      ),
    },
    {
      title: 'Giờ Check-in / Out',
      key: 'checkInTime',
      render: (item) => (
        <div>
          {item.checkInTime ? (
            <div style={{ color: '#10B981', fontWeight: 600, fontSize: 12.5, fontFamily: fonts?.mono || 'monospace' }}>
              Vào: {new Date(item.checkInTime).toLocaleTimeString('vi-VN')}
            </div>
          ) : (
            <div style={{ color: c.fgSubtle, fontStyle: 'italic', fontSize: 12 }}>Chưa vào ca</div>
          )}
          {item.checkOutTime && (
            <div style={{ color: '#3B82F6', fontWeight: 600, fontSize: 12.5, fontFamily: fonts?.mono || 'monospace', marginTop: 2 }}>
              Ra: {new Date(item.checkOutTime).toLocaleTimeString('vi-VN')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Ảnh Kiosk S3',
      render: (item) => (
        <div style={{ display: 'flex', gap: 6 }}>
          {item.checkInPhotoPresignedUrl ? (
            <Button
              size="sm"
              kind="soft"
              icon="eye"
              onClick={() =>
                setSelectedPhoto({
                  url: item.checkInPhotoPresignedUrl,
                  title: 'Ảnh Chụp Kiosk lúc Check-in',
                  name: item.fullName,
                })
              }
            >
              Check-in
            </Button>
          ) : (
            <span style={{ fontSize: 12, color: c.fgSubtle, fontStyle: 'italic' }}>Không có ảnh</span>
          )}

          {item.checkOutPhotoPresignedUrl && (
            <Button
              size="sm"
              kind="soft"
              icon="eye"
              onClick={() =>
                setSelectedPhoto({
                  url: item.checkOutPhotoPresignedUrl,
                  title: 'Ảnh Chụp Kiosk lúc Check-out',
                  name: item.fullName,
                })
              }
            >
              Check-out
            </Button>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng Thái',
      render: (item) => renderStatusBadge(item.status),
    },
    {
      title: 'Thao Tác Giám Sát',
      align: 'right',
      render: (item) => (
        <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
          {item.attendanceId && !item.isFraudFlagged && (
            <Button
              size="sm"
              kind="danger"
              icon="alert-triangle"
              onClick={() => setFlagModal({ attendanceId: item.attendanceId, name: item.fullName })}
            >
              Gắn Cờ Vi Phạm
            </Button>
          )}

          {item.isFraudFlagged && (
            <>
              <Button
                size="sm"
                kind="success"
                loading={actionLoading}
                onClick={() => handleResolveFraud(item.attendanceId, true)}
              >
                Khôi Phục
              </Button>
              <Button
                size="sm"
                kind="ghost"
                loading={actionLoading}
                onClick={() => handleResolveFraud(item.attendanceId, false)}
              >
                Bác Bỏ
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          activeId="live-roster"
          onNavigate={handleSidebarNavigate}
          brandName="RWFM Console"
          tagline="Quản Trị Nhân Sự"
          roleSubtitle={roleName}
          navGroups={navItems}
        />
      }
      topbar={
        <DashboardTopbar
          breadcrumbs={[
            { label: 'Hệ Thống' },
            { label: 'Vận Hành' },
            { label: 'Bảng Quân Số Trực Tiếp' },
          ]}
        />
      }
    >
      <PageHeader
        index="Store Manager · Bảng Quân Số Trực Tiếp"
        title="Bảng Quân Số Trực Tiếp"
        desc="Theo dõi nhân sự thực tế có mặt theo thời gian thực và đối soát ảnh chụp Kiosk S3."
        actions={
          <Button kind="primary" onClick={fetchRoster} loading={loading} icon="refresh">
            Làm Mới (15s)
          </Button>
        }
      />

      {errorMsg && (
        <div
          style={{
            marginBottom: 20,
            padding: '14px 18px',
            borderRadius: 10,
            backgroundColor: `${c.tones?.bad || '#EF4444'}15`,
            border: `1px solid ${c.tones?.bad || '#EF4444'}40`,
            color: c.tones?.bad || '#EF4444',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Icon name="alert-triangle" size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <Panel title="Danh Sách Quân Số & Trạng Thái Có Mặt Tại Cửa Hàng">
        <DataTable
          columns={columns}
          data={roster}
          loading={loading}
          emptyMessage="Không có phân công ca trực nào cho cửa hàng hôm nay."
        />
      </Panel>

      {/* S3 Presigned Photo Viewer Modal */}
      {selectedPhoto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'grid',
            placeItems: 'center',
            padding: 16,
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            style={{
              backgroundColor: c.bgCard,
              border: `1px solid ${c.border}`,
              borderRadius: 16,
              padding: 24,
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: c.fg, margin: 0 }}>
                  {selectedPhoto.title}
                </h3>
                <p style={{ fontSize: 12.5, color: c.fgSubtle, margin: '4px 0 0' }}>
                  Nhân viên: <strong style={{ color: c.accent }}>{selectedPhoto.name}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: c.fgSubtle,
                  fontSize: 18,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: '#000',
                border: `1px solid ${c.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxHeight: 380,
              }}
            >
              <img
                src={selectedPhoto.url}
                alt="Kiosk Portrait"
                style={{ width: '100%', maxHeight: 380, objectFit: 'contain' }}
              />
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
              borderRadius: 14,
              padding: 24,
              maxWidth: 460,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: c.tones?.bad || '#EF4444', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <Icon name="alert-triangle" size={20} color={c.tones?.bad || '#EF4444'} />
              <span>Gắn Cờ Vi Phạm / Vắng Mặt</span>
            </h3>
            <p style={{ fontSize: 13, color: c.fgSubtle, margin: 0 }}>
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
                  padding: 12,
                  backgroundColor: c.bgRaised,
                  border: `1px solid ${c.border}`,
                  borderRadius: 8,
                  color: c.fg,
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: fonts?.body || 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
              <Button
                kind="ghost"
                type="button"
                onClick={() => setFlagModal(null)}
              >
                Hủy Bỏ
              </Button>
              <Button
                kind="danger"
                type="submit"
                loading={actionLoading}
              >
                Xác Nhận Gắn Cờ
              </Button>
            </div>
          </form>
        </div>
      )}
    </DashboardShell>
  );
};

export default LiveRosterDashboardPage;
