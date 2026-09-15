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
        title="Tổng Quan Vận Hành"
        desc="Hệ thống quản lý chuỗi siêu thị R-WFM — Phân hệ Chi nhánh, Khung ca mẫu & Quầy Kiosk."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        <Panel
          title="Danh Mục Chi Nhánh & Kiosk"
          sub="Cấu hình an ninh mạng IP Whitelist và cấp phát mã trạm Kiosk"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13.5px', color: '#6B7280', lineHeight: '1.6', margin: 0 }}>
              Quản lý danh sách chi nhánh cửa hàng toàn chuỗi, kiểm soát trạng thái hoạt động của các máy trạm điểm danh tại quầy thu ngân.
            </p>
            <div>
              <Button
                variant="primary"
                icon="pin"
                onClick={() => navigate('/branches')}
              >
                Truy Cập Quản Lý Chi Nhánh
              </Button>
            </div>
          </div>
        </Panel>

        <Panel
          title="Bộ Khung Ca Mẫu (Shift Master)"
          sub="Chuẩn hóa khung giờ làm việc ca sáng, chiều, tối toàn chuỗi"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13.5px', color: '#6B7280', lineHeight: '1.6', margin: 0 }}>
              Thiết lập các khung ca chuẩn mực, quy định thời gian làm việc và nghỉ giữa ca nhằm đảm bảo tính công bằng và tuân thủ quy chế lao động.
            </p>
            <div>
              <Button
                variant="primary"
                icon="calendar"
                onClick={() => navigate('/shifts/templates')}
              >
                Truy Cập Khung Ca Mẫu
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
