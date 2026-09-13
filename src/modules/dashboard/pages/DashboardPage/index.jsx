import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';
import PageHeader from '@/shared/components/ui/PageHeader';
import Panel from '@/shared/components/ui/Panel';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';

export default function DashboardPage() {
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan Dashboard', icon: 'dashboard' },
    { type: 'group', label: 'VẬN HÀNH & HỆ THỐNG' },
    { id: 'branches', label: 'Danh mục Chi nhánh & Kiosk', icon: 'pin' },
    { id: 'shift-master', label: 'Khung Ca Mẫu (Shift Master)', icon: 'clock' },
  ];

  const handleNavigate = (id) => {
    if (id === 'dashboard') navigate('/dashboard');
    if (id === 'branches') navigate('/branches');
    if (id === 'shift-master') navigate('/shifts/templates');
  };

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="dashboard"
          onNavigate={handleNavigate}
          navItems={navItems}
          consoleLabel="OPERATIONS CONSOLE"
          brandName="RWFM OPS"
          roleLabel="Operations Admin"
        />
      }
      topbar={
        <DashboardTopbar
          page="dashboard"
          pageTitles={{ dashboard: 'Tổng Quan Hệ Thống Vận Hành' }}
          consoleLabel="Operations Admin"
          roleLabel="Quản trị vận hành"
          fallbackTitle="Tổng Quan"
        />
      }
    >
      <PageHeader
        title="Bảng Điều Khiển Quản Trị Vận Hành (Operations Console)"
        subtitle="Hệ thống quản lý chuỗi bán lẻ RWFM - Phân hệ Chi nhánh, Khung ca mẫu & Quầy Kiosk."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        <Panel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon
                name="pin"
                size={20}
              />
              <span style={{ fontWeight: 700, fontSize: '16px' }}>
                UC 1.2: Danh Mục Chi Nhánh & Kiosk
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.5' }}>
              Quản lý danh sách chi nhánh cửa hàng, cấu hình an ninh mạng IP
              Whitelist và cấp phát mã trạm Kiosk điểm danh tại quầy.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/branches')}
            >
              Truy Cập Quản Lý Chi Nhánh
            </Button>
          </div>
        </Panel>

        <Panel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon
                name="calendar"
                size={20}
              />
              <span style={{ fontWeight: 700, fontSize: '16px' }}>
                UC 1.3: Bộ Khung Ca Mẫu (Shift Master)
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.5' }}>
              Chuẩn hóa các khung ca làm việc toàn chuỗi (Ca sáng, Ca chiều, Ca
              đêm) và ngăn chặn việc tạo ca sai lệch từ phía Store Manager.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/shifts/templates')}
            >
              Truy Cập Khung Ca Mẫu
            </Button>
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
