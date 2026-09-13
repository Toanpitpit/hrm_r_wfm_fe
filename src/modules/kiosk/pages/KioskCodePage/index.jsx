import { useState } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';

// Shared UI components
import PageHeader from '@/shared/components/ui/PageHeader';
import StatCard from '@/shared/components/ui/StatCard';
import Panel from '@/shared/components/ui/Panel';
import DataTable from '@/shared/components/ui/DataTable';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';
import SearchInput from '@/shared/components/ui/SearchInput';
import Select from '@/shared/components/ui/Select';
import Icon from '@/shared/components/ui/Icon';
import { IconButton } from '@/shared/components/ui';


// Hook & Subcomponents
import { useKioskManager } from '../../hooks/useKioskManager';
import CreateCodeModal from '../../components/CreateCodeModal';
import CodeDisplayModal from '../../components/CodeDisplayModal';

import styles from './KioskCodePage.module.css';

export default function KioskCodePage() {
  const { c } = useAdminTheme();
  const [copiedToken, setCopiedToken] = useState(null);

  // Hook quản lý dữ liệu Kiosk
  const {
    kiosks,
    loading,
    generating,
    stats,
    activeCodes,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isCodeDisplayModalOpen,
    setIsCodeDisplayModalOpen,
    latestCodeData,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    fetchKiosks,
    handleCreateCode,
    handleDeactivateKiosk,
  } = useKioskManager(1);

  const handleConfirmDeactivate = (row) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy ghép nối và dừng hoạt động trạm Kiosk "${row.kioskName}" (${row.kioskCode}) không?\n\nTrạm Kiosk trên máy chấm công sẽ bị ngắt kết nối và phải nhập mã kích hoạt OTP mới.`)) {
      handleDeactivateKiosk(row.kioskId);
    }
  };

  // Thao tác sao chép Token hoặc Mã OTP
  const handleCopyText = (text, id) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedToken(id);
      setTimeout(() => setCopiedToken(null), 2000);
    }
  };

  // Các items điều hướng cho Store Manager Sidebar
  const navItems = [
    { id: 'dashboard', label: 'Tổng quan cửa hàng', icon: 'home' },
    { type: 'group', label: 'Quản lý Kiosk & Ca' },
    { id: 'kiosk-codes', label: 'Mã Kích Hoạt Kiosk', icon: 'lock', badge: stats.activeCodeCount > 0 ? String(stats.activeCodeCount) : null },
    { id: 'kiosk-list', label: 'Danh Sách Trạm Kiosk', icon: 'screen' },
    { id: 'attendance', label: 'Điểm Danh Chi Nhánh', icon: 'pulse' },
    { type: 'group', label: 'Nhân sự & Phân ca' },
    { id: 'shifts', label: 'Quản lý Lịch Ca', icon: 'calendar' },
    { id: 'employees', label: 'Nhân sự Cửa hàng', icon: 'users' },
  ];

  // Khai báo cột cho bảng danh sách Kiosk
  const columns = [
    {
      key: 'kioskCode',
      label: 'MÃ KIOSK',
      w: '140px',
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: c.accent }}>
          {row.kioskCode || 'N/A'}
        </span>
      ),
    },
    {
      key: 'kioskName',
      label: 'TÊN TRẠM KIOSK',
      render: (row) => <strong style={{ color: c.fg }}>{row.kioskName}</strong>,
    },
    {
      key: 'status',
      label: 'TRẠNG THÁI',
      w: '130px',
      render: (row) => {
        const isOnline = row.status === 'ACTIVE' || row.status === 'Active';
        return (
          <Badge tone={isOnline ? 'ok' : 'bad'}>
            <Icon name={isOnline ? 'check' : 'x'} size={12} />
            {isOnline ? 'Đang hoạt động' : 'Tắt kết nối'}
          </Badge>
        );
      },
    },
    {
      key: 'deviceToken',
      label: 'TOKEN BẢO MẬT',
      render: (row) => {
        const tokenStr = typeof row.deviceToken === 'string' ? row.deviceToken : '';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 4,
                background: c.bgElev,
                border: `1px solid ${c.border}`,
                color: c.fgSubtle,
                maxWidth: 180,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {tokenStr ? `${tokenStr.substring(0, 14)}...` : 'N/A'}
            </span>
            <IconButton
              name={copiedToken === row.kioskId ? 'check' : 'copy'}
              onClick={() => handleCopyText(tokenStr, row.kioskId)}
            />
          </div>
        );
      },
    },
    {
      key: 'activatedAt',
      label: 'NGÀY KÍCH HOẠT',
      w: '160px',
      render: (row) => {
        if (!row.activatedAt) return 'N/A';
        const date = new Date(row.activatedAt);
        return (
          <span style={{ fontSize: 12, color: c.fgSubtle }}>
            {date.toLocaleDateString('vi-VN')} {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      w: '120px',
      render: (row) => {
        const isOnline = row.status === 'ACTIVE' || row.status === 'Active';
        return (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <IconButton name="refresh" onClick={() => fetchKiosks()} title="Làm mới" />
            {isOnline ? (
              <IconButton
                name="trash"
                onClick={() => handleConfirmDeactivate(row)}
                title="Hủy ghép nối / Dừng hoạt động trạm Kiosk"
                style={{ color: '#ef4444' }}
              />
            ) : (
              <span style={{ fontSize: 11, color: c.fgSubtle, fontStyle: 'italic' }}>Đã ngắt</span>
            )}
          </div>
        );
      },
    },
  ];



  const storedUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="kiosk-codes"
          navItems={navItems}
          consoleLabel="Store Manager Console"
          defaultDisplayName={storedUser?.fullName || 'Cửa Hàng Trưởng'}
          roleLabel={storedUser?.storeName ? `Quản lý ${storedUser.storeName}` : 'Quản lý Chi Nhánh CH01'}
          avatarLetter={storedUser?.fullName?.charAt(0) || 'S'}
          brandName="RWFM KIOSK"
        />
      }

      topbar={
        <DashboardTopbar
          breadcrumbs={[
            { label: 'Store Manager', href: '#' },
            { label: 'Quản Lý Kiosk', href: '#' },
            { label: 'Mã Kích Hoạt' },
          ]}
        />
      }
    >
      <div className={styles.container}>
        {/* Page Header */}
        <PageHeader
          index="Store Manager · Quản lý thiết bị"
          title="MÃ KÍCH HOẠT KIOSK"
          desc="Tạo mã OTP xác thực 6 ký tự để kích hoạt trạm Kiosk điểm danh mới tại quầy cửa hàng và theo dõi trạng thái thiết bị."
          actions={
            <>
              <Button kind="ghost" variant="ghost" icon="refresh" onClick={fetchKiosks} loading={loading}>
                Làm mới
              </Button>
              <Button kind="primary" variant="primary" icon="plus" onClick={() => setIsCreateModalOpen(true)}>
                Tạo Mã Kích Hoạt Mới
              </Button>
            </>
          }
        />

        {/* 4 Stat Cards */}
        <div className={styles.statsGrid}>
          <StatCard
            label="TỔNG KIOSK ĐÃ KÍCH HOẠT"
            title="TỔNG KIOSK ĐÃ KÍCH HOẠT"
            value={stats.totalKiosks}
            subtext={`${stats.totalActive} máy đang hoạt động`}
            icon="screen"
            tone="ok"
          />
          <StatCard
            label="MÃ OTP HIỆU LỰC"
            title="MÃ OTP HIỆU LỰC"
            value={stats.activeCodeCount}
            subtext="Mã kích hoạt có hạn 15 phút"
            icon="lock"
            tone="warn"
          />
          <StatCard
            label="KẾT NỐI REALTIME"
            title="KẾT NỐI REALTIME"
            value={`${stats.totalActive}/${stats.totalKiosks}`}
            subtext="Trạm điểm danh Online"
            icon="pulse"
            tone="info"
          />
          <StatCard
            label="CHI NHÁNH CỬA HÀNG"
            title="CHI NHÁNH CỬA HÀNG"
            value={stats.storeCode}
            subtext="Chi nhánh Cầu Giấy (CH01)"
            icon="building"
            tone="neutral"
          />
        </div>


        {/* Panel Mã OTP Đang Khả Dụng Trong Session */}
        {activeCodes.length > 0 && (
          <Panel
            title="MÃ KÍCH HOẠT VỪA TẠO TRONG PHIÊN"
            subtitle="Các mã OTP chưa hết hạn có thể dùng để kích hoạt Kiosk ngay"
          >
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {activeCodes.map((item) => (
                <div
                  key={item.activationCodeId || item.code}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: c.bgElev,
                    border: `1px solid ${c.accent}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: c.fgSubtle }}>{item.kioskName}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: c.accent }}>
                      {item.code}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    icon="copy"
                    onClick={() => handleCopyText(item.code, item.code)}
                  >
                    {copiedToken === item.code ? 'Đã chép' : 'Sao chép'}
                  </Button>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {/* Panel Danh sách trạm Kiosk */}
        <Panel
          title="DANH SÁCH TRẠM KIOSK ĐÃ ĐĂNG KÝ"
          sub="Danh sách các thiết bị điểm danh đã được kích hoạt thuộc chi nhánh"
          action={
            <div className={styles.filterGroup}>
              <SearchInput
                value={searchTerm}
                onChange={(val) => setSearchTerm(typeof val === 'string' ? val : val?.target?.value || '')}
                placeholder="Tìm tên Kiosk, mã Kiosk, token..."
              />
              <Select
                value={statusFilter}
                onChange={(val) => setStatusFilter(typeof val === 'string' ? val : val?.target?.value || 'ALL')}
                options={[
                  { value: 'ALL', label: 'Tất cả trạng thái' },
                  { value: 'ACTIVE', label: 'Đang hoạt động' },
                  { value: 'INACTIVE', label: 'Đã ngắt kết nối' },
                ]}
              />
            </div>
          }
        >
          <DataTable
            columns={columns}
            rows={kiosks}
            data={kiosks}
            loading={loading}
            keyField="kioskId"
            emptyText="Chưa có trạm Kiosk nào được kích hoạt. Hãy tạo mã kích hoạt mới để kết nối máy Kiosk."
          />

        </Panel>
      </div>

      {/* Popup Form Tạo Mã */}
      <CreateCodeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCode}
        loading={generating}
      />

      {/* Popup Hiển Thị Mã OTP Sau Khi Tạo */}
      <CodeDisplayModal
        isOpen={isCodeDisplayModalOpen}
        onClose={() => setIsCodeDisplayModalOpen(false)}
        codeData={latestCodeData}
      />
    </DashboardShell>
  );
}
