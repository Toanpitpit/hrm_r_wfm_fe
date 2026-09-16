import React, { useState, useEffect, useCallback } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatCard from '@/shared/components/ui/StatCard';
import Panel from '@/shared/components/ui/Panel';
import Button from '@/shared/components/ui/Button';
import SearchInput from '@/shared/components/ui/SearchInput';
import Select from '@/shared/components/ui/Select';
import Modal from '@/shared/components/ui/Modal';

import dispatchService from '../services/dispatch.service';
import DispatchListTable from '../components/DispatchListTable';
import CreateDispatchRequestModal from '../components/CreateDispatchRequestModal';
import ReviewDispatchModal from '../components/ReviewDispatchModal';

/**
 * Màn hình Quản Lý Điều Động Nhân Sự Liên Chi Nhánh dành cho Cửa Hàng Trưởng (Store Manager).
 */
export default function StoreDispatchPage() {
  const { c } = useAdminTheme();

  // Đọc thông tin user đăng nhập
  let currentUser = null;
  try {
    const raw = localStorage.getItem('user');
    if (raw) currentUser = JSON.parse(raw);
  } catch (e) {
    console.error('Lỗi đọc user:', e);
  }

  const currentStoreId = currentUser?.storeId || currentUser?.homeBranchId || currentUser?.branchId || 1;
  const currentStoreName = currentUser?.storeName || currentUser?.branchName || 'Chi nhánh hiện tại';

  // Data states
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'outgoing' | 'all'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Modals states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('BORROW');
  const [editItem, setEditItem] = useState(null);
  const [reviewItem, setReviewItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);

  // Lấy dữ liệu danh sách điều động của cửa hàng
  const loadDispatches = useCallback(async () => {
    if (!currentStoreId) return;
    setLoading(true);
    try {
      const res = await dispatchService.getStoreDispatches(currentStoreId);
      if (res?.success && Array.isArray(res.data)) {
        setDispatches(res.data);
      } else {
        setDispatches([]);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách điều động:', err);
      setDispatches([]);
    } finally {
      setLoading(false);
    }
  }, [currentStoreId]);

  useEffect(() => {
    loadDispatches();
  }, [loadDispatches]);

  // Thông báo toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Xử lý hủy và xóa yêu cầu điều động PENDING
  const handleDeleteDispatch = async (item) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn hủy và xóa yêu cầu điều động nhân sự "${item.employeeName}" (#${item.dispatchId}) không?\n\nThao tác này sẽ xóa hoàn toàn phiếu đề nghị đang chờ duyệt.`
    );
    if (!confirmDelete) return;

    try {
      const res = await dispatchService.deleteDispatchRequest(item.dispatchId);
      if (res?.success) {
        showToast('Đã hủy và xóa phiếu yêu cầu điều động thành công.');
        loadDispatches();
      } else {
        alert(res?.message || 'Không thể hủy phiếu điều động.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi hủy yêu cầu điều động.');
    }
  };

  // Tính toán thống kê nhanh
  const todayStr = new Date().toISOString().split('T')[0];

  const pendingIncomingCount = dispatches.filter(
    (d) => Number(d.fromStoreId) === Number(currentStoreId) && d.status === 'PENDING'
  ).length;

  const activeArrivingToday = dispatches.filter(
    (d) =>
      Number(d.toStoreId) === Number(currentStoreId) &&
      d.status === 'APPROVED' &&
      d.startDate <= todayStr &&
      todayStr <= d.endDate
  ).length;

  const activeDepartingToday = dispatches.filter(
    (d) =>
      Number(d.fromStoreId) === Number(currentStoreId) &&
      d.status === 'APPROVED' &&
      d.startDate <= todayStr &&
      todayStr <= d.endDate
  ).length;

  // Lọc danh sách theo Tab và Filter
  const filteredDispatches = dispatches.filter((d) => {
    // Lọc theo Tab
    if (activeTab === 'incoming') {
      // Chi nhánh khác đề nghị mượn người của mình
      if (Number(d.fromStoreId) !== Number(currentStoreId)) return false;
    } else if (activeTab === 'outgoing') {
      // Chi nhánh mình đề nghị mượn người từ nơi khác
      if (Number(d.toStoreId) !== Number(currentStoreId)) return false;
    }

    // Lọc theo trạng thái
    if (statusFilter !== 'ALL' && d.status !== statusFilter) {
      return false;
    }

    // Tìm kiếm theo tên nhân viên, mã nhân viên, tên chi nhánh
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = d.employeeName?.toLowerCase().includes(q);
      const matchCode = d.employeeCode?.toLowerCase().includes(q);
      const matchFrom = d.fromStoreName?.toLowerCase().includes(q);
      const matchTo = d.toStoreName?.toLowerCase().includes(q);
      return matchName || matchCode || matchFrom || matchTo;
    }

    return true;
  });

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="dispatches"
          activePath="/store-manager/dispatches"
          defaultDisplayName={currentUser?.fullName || 'Cửa Hàng Trưởng'}
          roleLabel={currentUser?.roleName || (currentUser?.storeName ? `Quản lý ${currentUser.storeName}` : 'Quản lý Cửa Hàng')}
        />
      }
      topbar={
        <DashboardTopbar
          breadcrumbs={[
            { label: 'Store Manager', href: '#' },
            { label: 'Quản Lý Nhân Sự & Ca Trực', href: '#' },
            { label: 'Điều Động Nhân Sự' },
          ]}
        />
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Toast Notification */}
          {toastMessage && (
            <div
              style={{
                position: 'fixed',
                top: 24,
                right: 32,
                zIndex: 999,
                background: '#10b981',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>✓</span> {toastMessage}
            </div>
          )}

          {/* Tiêu đề & Nút Tạo mới */}
          <PageHeader
            index="Store Manager · Quản trị nhân sự"
            title="Điều Động Nhân Sự Liên Chi Nhánh"
            desc={`Quản lý mượn quân & chi viện hỗ trợ giữa cơ sở "${currentStoreName}" và các chi nhánh đối tác`}
            actions={
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button
                  kind="primary"
                  onClick={() => {
                    setModalMode('BORROW');
                    setEditItem(null);
                    setIsCreateModalOpen(true);
                  }}
                >
                  📥 Xin Chi Viện Nhân Sự
                </Button>
                <Button
                  kind="secondary"
                  onClick={() => {
                    setModalMode('SEND');
                    setEditItem(null);
                    setIsCreateModalOpen(true);
                  }}
                >
                  📤 Cử Đi Chi Viện
                </Button>
              </div>
            }
          />

          {/* 4 Thẻ Thống Kê Nhanh */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <StatCard
              title="ĐƠN CẦN BẠN XÉT DUYỆT"
              value={pendingIncomingCount}
              subtext="Cơ sở khác đang xin mượn quân"
              icon="bell"
              tone={pendingIncomingCount > 0 ? 'warn' : 'neutral'}
            />
            <StatCard
              title="NHÂN SỰ ĐANG CHI VIỆN HÔM NAY"
              value={activeArrivingToday}
              subtext="Đang có mặt làm việc tại quầy"
              icon="users"
              tone="ok"
            />
            <StatCard
              title="NHÂN SỰ ĐANG ĐI HỖ TRỢ"
              value={activeDepartingToday}
              subtext="Nhân viên cơ sở mình đang đi chi viện"
              icon="swap"
              tone="neutral"
            />
            <StatCard
              title="TỔNG SỐ LỆNH ĐIỀU ĐỘNG"
              value={dispatches.length}
              subtext="Tổng lịch sử điều chuyển cơ sở"
              icon="calendar"
              tone="info"
            />
          </div>

          {/* Thanh chuyển đổi Tab & Tìm kiếm */}
          <Panel style={{ padding: '16px 20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                marginBottom: 16,
              }}
            >
              {/* 3 Tabs */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('incoming')}
                  style={tabButtonStyle(c, activeTab === 'incoming')}
                >
                  Yêu Cầu Nhận Được
                  {pendingIncomingCount > 0 && (
                    <span style={badgeCountStyle(c)}>{pendingIncomingCount}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('outgoing')}
                  style={tabButtonStyle(c, activeTab === 'outgoing')}
                >
                  Yêu Cầu Đã Gửi Đi
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  style={tabButtonStyle(c, activeTab === 'all')}
                >
                  Tất Cả Lệnh Điều Động
                </button>
              </div>

              {/* Bộ lọc & Tìm kiếm */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Select
                  value={statusFilter}
                  onChange={(v) => setStatusFilter(v)}
                  options={[
                    { value: 'ALL', label: 'Tất cả trạng thái' },
                    { value: 'PENDING', label: 'Chờ xét duyệt' },
                    { value: 'APPROVED', label: 'Đã phê duyệt' },
                    { value: 'REJECTED', label: 'Đã từ chối' },
                  ]}
                  width={170}
                />

                <SearchInput
                  value={searchTerm}
                  onChange={(v) => setSearchTerm(v)}
                  placeholder="Tìm nhân viên, mã, cơ sở..."
                  width={220}
                />
              </div>
            </div>

            {/* Bảng danh sách điều động */}
            <DispatchListTable
              dispatches={filteredDispatches}
              loading={loading}
              currentStoreId={currentStoreId}
              onReview={(item) => setReviewItem(item)}
              onEdit={(item) => {
                setEditItem(item);
                setIsCreateModalOpen(true);
              }}
              onDelete={handleDeleteDispatch}
              onViewDetail={(item) => setDetailItem(item)}
              emptyText={
                activeTab === 'incoming'
                  ? 'Cơ sở của bạn hiện không có yêu cầu xin mượn quân nào.'
                  : activeTab === 'outgoing'
                  ? 'Bạn chưa gửi yêu cầu xin chi viện nhân sự nào.'
                  : 'Không tìm thấy lệnh điều động phù hợp.'
              }
            />
          </Panel>

      {/* Modal Tạo & Chỉnh Sửa Yêu Cầu */}
      <CreateDispatchRequestModal
        open={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditItem(null);
        }}
        currentStoreId={currentStoreId}
        currentStoreName={currentStoreName}
        editItem={editItem}
        initialMode={modalMode}
        onSuccess={(data, isEdit) => {
          showToast(
            isEdit
              ? 'Đã chỉnh sửa và cập nhật yêu cầu điều động thành công!'
              : 'Đã tạo và gửi phiếu đề nghị điều động nhân sự thành công!'
          );
          setEditItem(null);
          loadDispatches();
        }}
      />

      {/* Modal Xét Duyệt Yêu Cầu */}
      <ReviewDispatchModal
        open={Boolean(reviewItem)}
        onClose={() => setReviewItem(null)}
        dispatchItem={reviewItem}
        currentStoreId={currentStoreId}
        onSuccess={(isApproved) => {
          showToast(
            isApproved
              ? 'Đã phê duyệt lệnh điều động nhân sự thành công!'
              : 'Đã từ chối lệnh điều động nhân sự.'
          );
          loadDispatches();
        }}
      />

      {/* Modal Xem Chi Tiết */}
      {detailItem && (
        <Modal
          open={Boolean(detailItem)}
          onClose={() => setDetailItem(null)}
          title={`Chi Tiết Lệnh Điều Động #${detailItem.dispatchId}`}
          sub="Thông tin chi tiết quyết định điều động nhân sự"
          width={520}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <Button kind="ghost" onClick={() => setDetailItem(null)}>
                Đóng
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${c.borderSub}`, paddingBottom: 8 }}>
              <span style={{ color: c.fgFaint }}>Mã nhân viên:</span>
              <span style={{ fontWeight: 600, color: c.fg }}>{detailItem.employeeCode}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${c.borderSub}`, paddingBottom: 8 }}>
              <span style={{ color: c.fgFaint }}>Họ và tên:</span>
              <span style={{ fontWeight: 600, color: c.accent }}>{detailItem.employeeName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${c.borderSub}`, paddingBottom: 8 }}>
              <span style={{ color: c.fgFaint }}>Vị trí / Chức danh:</span>
              <span style={{ color: c.fg }}>{detailItem.positionName || 'Nhân viên'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${c.borderSub}`, paddingBottom: 8 }}>
              <span style={{ color: c.fgFaint }}>Cơ sở xuất phát (Hỗ trợ):</span>
              <span style={{ fontWeight: 600, color: c.fg }}>{detailItem.fromStoreName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${c.borderSub}`, paddingBottom: 8 }}>
              <span style={{ color: c.fgFaint }}>Cơ sở đến (Tiếp nhận):</span>
              <span style={{ fontWeight: 600, color: c.fg }}>{detailItem.toStoreName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${c.borderSub}`, paddingBottom: 8 }}>
              <span style={{ color: c.fgFaint }}>Khoảng thời gian:</span>
              <span style={{ fontWeight: 600, color: '#34d399' }}>
                {detailItem.startDate} &rarr; {detailItem.endDate}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${c.borderSub}`, paddingBottom: 8 }}>
              <span style={{ color: c.fgFaint }}>Người gửi đề nghị:</span>
              <span style={{ color: c.fg }}>{detailItem.requestedByName || '--'}</span>
            </div>
            {detailItem.approvedByName && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${c.borderSub}`, paddingBottom: 8 }}>
                <span style={{ color: c.fgFaint }}>Người duyệt phiếu:</span>
                <span style={{ color: c.fg }}>{detailItem.approvedByName}</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ color: c.fgFaint }}>Lý do / Ghi chú:</span>
              <span style={{ color: c.fgMuted, background: c.bgElev, padding: '8px 12px', borderRadius: 6 }}>
                {detailItem.reason || 'Không có ghi chú thêm.'}
              </span>
            </div>
          </div>
        </Modal>
      )}
      </div>
    </DashboardShell>
  );
}

function tabButtonStyle(c, active) {
  return {
    padding: '8px 16px',
    borderRadius: 6,
    border: `1px solid ${active ? c.accent : c.border}`,
    background: active ? 'rgba(242, 202, 80, 0.12)' : 'transparent',
    color: active ? c.accent : c.fgMuted,
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.15s ease',
  };
}

function badgeCountStyle(c) {
  return {
    background: '#ef4444',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 10,
    padding: '1px 6px',
  };
}
