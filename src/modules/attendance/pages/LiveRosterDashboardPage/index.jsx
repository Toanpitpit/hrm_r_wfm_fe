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
    fetchRoster,
  } = useLiveRoster(effectiveStoreId);

  const [searchQuery, setSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState('ALL');
  const [punctualityFilter, setPunctualityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('CHECK_IN_DESC');

  const renderSessionStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return <Badge tone="good" dot>ĐANG CÓ MẶT</Badge>;
      case 'COMPLETED':
        return <Badge tone="info" dot>ĐÃ HOÀN THÀNH</Badge>;
      case 'PENDING':
        return <Badge tone="warn" dot>CHỜ XÁC THỰC</Badge>;
      default:
        return <Badge tone="neutral" dot>CHƯA CÓ MẶT</Badge>;
    }
  };

  const renderCheckInStatusBadge = (status, isLate) => {
    if (!status && !isLate) {
      return <span style={{ color: c.fgSubtle, fontSize: 12, fontStyle: 'italic' }}>Chưa vào ca</span>;
    }
    switch (status) {
      case 'ON_TIME':
        return <Badge tone="ok">Đúng Giờ</Badge>;
      case 'LATE':
        return <Badge tone="warn">Đi Muộn</Badge>;
      case 'EARLY':
        return <Badge tone="info">Đến Sớm</Badge>;
      case 'PENDING':
        return <Badge tone="pending">Chờ Ảnh</Badge>;
      default:
        return isLate ? <Badge tone="warn">Đi Muộn</Badge> : <Badge tone="ok">Đúng Giờ</Badge>;
    }
  };

  const renderCheckOutStatusBadge = (status, checkOutTime) => {
    if (!checkOutTime && !status) {
      return <span style={{ color: c.fgSubtle, fontSize: 12, fontStyle: 'italic' }}>Chưa ra ca</span>;
    }
    switch (status) {
      case 'ON_TIME':
        return <Badge tone="ok">Đúng Giờ</Badge>;
      case 'EARLY_LEAVE':
        return <Badge tone="bad">Về Sớm</Badge>;
      case 'LATE_LEAVE':
        return <Badge tone="purple">Ra Muộn</Badge>;
      case 'PENDING':
        return <Badge tone="pending">Chờ Ảnh</Badge>;
      default:
        return checkOutTime ? <Badge tone="ok">Đã Ra Ca</Badge> : <span style={{ color: c.fgSubtle, fontSize: 12, fontStyle: 'italic' }}>Chưa ra ca</span>;
    }
  };

  const filteredAndSortedRoster = React.useMemo(() => {
    let list = [...(roster || [])];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item =>
        (item.fullName || '').toLowerCase().includes(q) ||
        (item.employeeCode || '').toLowerCase().includes(q)
      );
    }

    if (sessionFilter !== 'ALL') {
      list = list.filter(item => (item.status || 'ABSENT') === sessionFilter);
    }

    if (punctualityFilter === 'LATE') {
      list = list.filter(item => item.checkInStatus === 'LATE' || item.isLate);
    } else if (punctualityFilter === 'EARLY_LEAVE') {
      list = list.filter(item => item.checkOutStatus === 'EARLY_LEAVE');
    } else if (punctualityFilter === 'ON_TIME') {
      list = list.filter(item => item.checkInStatus === 'ON_TIME' && item.checkOutStatus !== 'EARLY_LEAVE');
    }

    list.sort((a, b) => {
      if (sortBy === 'ISSUE_FIRST') {
        const aIssue = (a.checkInStatus === 'LATE' || a.checkOutStatus === 'EARLY_LEAVE' || a.isLate) ? 1 : 0;
        const bIssue = (b.checkInStatus === 'LATE' || b.checkOutStatus === 'EARLY_LEAVE' || b.isLate) ? 1 : 0;
        if (bIssue !== aIssue) return bIssue - aIssue;
        return (b.checkInTime || '').localeCompare(a.checkInTime || '');
      }
      if (sortBy === 'NAME_ASC') {
        return (a.fullName || '').localeCompare(b.fullName || '', 'vi');
      }
      if (sortBy === 'CHECK_IN_ASC') {
        if (!a.checkInTime) return 1;
        if (!b.checkInTime) return -1;
        return new Date(a.checkInTime) - new Date(b.checkInTime);
      }
      // CHECK_IN_DESC (default)
      if (!a.checkInTime) return 1;
      if (!b.checkInTime) return -1;
      return new Date(b.checkInTime) - new Date(a.checkInTime);
    });

    return list;
  }, [roster, searchQuery, sessionFilter, punctualityFilter, sortBy]);

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
      title: 'Vào Ca',
      key: 'checkInStatus',
      render: (item) => renderCheckInStatusBadge(item.checkInStatus, item.isLate),
    },
    {
      title: 'Ra Ca',
      key: 'checkOutStatus',
      render: (item) => renderCheckOutStatusBadge(item.checkOutStatus, item.checkOutTime),
    },
    {
      title: 'Trạng Thái Ca',
      key: 'status',
      render: (item) => renderSessionStatusBadge(item.status),
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
        desc="Theo dõi quân số theo thời gian thực: vòng đời ca (Có mặt / Hoàn thành) và đối soát chuyên cần vào/ra ca chính xác."
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

      {/* Toolbar: Tìm kiếm, Lọc trạng thái ca, Lọc chuyên cần và Sắp xếp */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 16,
          backgroundColor: c.bgCard,
          padding: '12px 16px',
          borderRadius: 8,
          border: `1px solid ${c.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: 1 }}>
          {/* Search box */}
          <div style={{ position: 'relative', minWidth: 220 }}>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã nhân viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px',
                fontSize: 13,
                borderRadius: 6,
                border: `1px solid ${c.border}`,
                backgroundColor: c.bgElev,
                color: c.fg,
                outline: 'none',
              }}
            />
          </div>

          {/* Session Lifecycle Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: c.fgSubtle, fontWeight: 600 }}>Phiên:</span>
            {[
              { id: 'ALL', label: 'Tất Cả' },
              { id: 'PRESENT', label: 'Có Mặt' },
              { id: 'COMPLETED', label: 'Đã Xong' },
              { id: 'ABSENT', label: 'Chưa Đến' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSessionFilter(f.id)}
                style={{
                  padding: '5px 11px',
                  borderRadius: 16,
                  border: sessionFilter === f.id ? `1px solid ${c.accent}` : `1px solid ${c.border}`,
                  backgroundColor: sessionFilter === f.id ? c.accent : c.bgElev,
                  color: sessionFilter === f.id ? '#FFF' : c.fg,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Punctuality Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: c.fgSubtle, fontWeight: 600 }}>Chuyên cần:</span>
            <select
              value={punctualityFilter}
              onChange={(e) => setPunctualityFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: 12.5,
                borderRadius: 6,
                border: `1px solid ${c.border}`,
                backgroundColor: c.bgElev,
                color: c.fg,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">Tất cả chuyên cần</option>
              <option value="LATE">Chỉ Đi Muộn</option>
              <option value="EARLY_LEAVE">Chỉ Về Sớm</option>
              <option value="ON_TIME">Chỉ Đúng Giờ</option>
            </select>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: c.fgSubtle, fontWeight: 600 }}>Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '6px 12px',
              fontSize: 12.5,
              fontWeight: 600,
              borderRadius: 6,
              border: `1px solid ${c.border}`,
              backgroundColor: c.bgElev,
              color: c.fg,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="CHECK_IN_DESC">Vào ca mới nhất</option>
            <option value="CHECK_IN_ASC">Vào ca sớm nhất</option>
            <option value="ISSUE_FIRST">⚠️ Ưu tiên Đi muộn / Về sớm</option>
            <option value="NAME_ASC">Họ tên nhân viên (A-Z)</option>
          </select>
        </div>
      </div>

      <Panel title={`Quân Số Chi Nhánh (${filteredAndSortedRoster.length} lượt phân bổ)`}>
        <DataTable
          columns={columns}
          data={filteredAndSortedRoster}
          loading={loading}
          emptyMessage="Không có nhân viên nào phù hợp với bộ lọc hiện tại."
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

    </DashboardShell>
  );
};

export default LiveRosterDashboardPage;
