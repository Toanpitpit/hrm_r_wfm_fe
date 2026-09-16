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
import DispatchNetworkMatrix from '../components/DispatchNetworkMatrix';
import DispatchListTable from '../components/DispatchListTable';

/**
 * Màn hình Giám Sát Ma Trận Điều Động Toàn Hệ Thống dành cho Quản Trị Vận Hành (Operations Admin)
 * và Chủ Doanh Nghiệp (Business Owner).
 */
export default function DispatchNetworkMetricsPage() {
  const { c, fonts } = useAdminTheme();

  // Đọc thông tin user đăng nhập
  let currentUser = null;
  try {
    const raw = localStorage.getItem('user');
    if (raw) currentUser = JSON.parse(raw);
  } catch (e) {
    console.error('Lỗi đọc user:', e);
  }

  // Filter dates
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Data states
  const [metrics, setMetrics] = useState({
    totalDispatches: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    activeTodayCount: 0,
    totalDispatchedHours: 0,
    storePairMatrix: [],
    recentDispatches: [],
  });

  const [allDispatches, setAllDispatches] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // Table filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [storeFilter, setStoreFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [detailItem, setDetailItem] = useState(null);

  // Tải danh mục chi nhánh cho dropdown lọc
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const list = await dispatchService.getActiveBranches();
        setBranches(list);
      } catch (err) {
        console.error('Lỗi khi tải chi nhánh:', err);
      }
    };
    fetchBranches();
  }, []);

  // Tải dữ liệu báo cáo ma trận
  const loadMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await dispatchService.getNetworkMetrics(params);
      if (res?.success && res.data) {
        setMetrics(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải số liệu mạng lưới điều động:', err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  // Tải toàn bộ danh sách điều động có hỗ trợ bộ lọc
  const loadAllDispatches = useCallback(async () => {
    setTableLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (storeFilter) params.storeId = Number(storeFilter);

      const res = await dispatchService.getAllDispatches(params);
      if (res?.success && Array.isArray(res.data)) {
        setAllDispatches(res.data);
      } else {
        setAllDispatches([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách toàn hệ thống:', err);
      setAllDispatches([]);
    } finally {
      setTableLoading(false);
    }
  }, [statusFilter, storeFilter]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  useEffect(() => {
    loadAllDispatches();
  }, [loadAllDispatches]);

  // Lọc tìm kiếm theo từ khóa
  const filteredDispatches = allDispatches.filter((d) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      d.employeeName?.toLowerCase().includes(q) ||
      d.employeeCode?.toLowerCase().includes(q) ||
      d.fromStoreName?.toLowerCase().includes(q) ||
      d.toStoreName?.toLowerCase().includes(q) ||
      d.reason?.toLowerCase().includes(q)
    );
  });

  const branchOptions = [
    { value: '', label: 'Tất cả chi nhánh' },
    ...branches.map((b) => ({
      value: String(b.id || b.branchId),
      label: b.name || b.branchName,
    })),
  ];

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="dispatch-network"
          activePath="/admin/dispatch-network"
          defaultDisplayName={currentUser?.fullName || 'Quản trị viên'}
          roleLabel={currentUser?.roleName || 'Quản trị vận hành'}
        />
      }
      topbar={
        <DashboardTopbar
          breadcrumbs={[
            { label: currentUser?.roleName || 'Quản Trị Vận Hành', href: '#' },
            { label: 'Giám Sát Mạng Lưới', href: '#' },
            { label: 'Ma Trận Điều Động' },
          ]}
        />
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Header */}
          <PageHeader
            index="Quản trị chuỗi · Báo cáo mạng lưới"
            title="Ma Trận & Giám Sát Điều Động Mạng Lưới"
            desc="Phân tích luồng dịch chuyển nhân sự liên chi nhánh và tổng hợp giờ công chi viện phục vụ tính chi phí vận hành"
          />

          {/* Thanh lọc thời gian */}
          <Panel style={{ padding: '14px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: c.fgFaint }}>
                  Khoảng thời gian:
                </span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={{
                    background: c.bgRaised,
                    border: `1px solid ${c.border}`,
                    borderRadius: 6,
                    color: c.fg,
                    fontSize: 13,
                    fontFamily: fonts.body,
                    padding: '7px 10px',
                    outline: 'none',
                  }}
                />
                <span style={{ color: c.fgFaint }}>&rarr;</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={{
                    background: c.bgRaised,
                    border: `1px solid ${c.border}`,
                    borderRadius: 6,
                    color: c.fg,
                    fontSize: 13,
                    fontFamily: fonts.body,
                    padding: '7px 10px',
                    outline: 'none',
                  }}
                />
                {(fromDate || toDate) && (
                  <Button
                    size="sm"
                    kind="ghost"
                    onClick={() => {
                      setFromDate('');
                      setToDate('');
                    }}
                  >
                    Xóa lọc ngày
                  </Button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  size="sm"
                  kind="soft"
                  onClick={() => {
                    const d = new Date();
                    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
                    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
                    setFromDate(firstDay);
                    setToDate(lastDay);
                  }}
                >
                  Tháng Này
                </Button>
                <Button
                  size="sm"
                  kind="soft"
                  onClick={() => {
                    const d = new Date();
                    const firstDay = new Date(d.getFullYear(), 0, 1).toISOString().split('T')[0];
                    const lastDay = new Date(d.getFullYear(), 11, 31).toISOString().split('T')[0];
                    setFromDate(firstDay);
                    setToDate(lastDay);
                  }}
                >
                  Năm Nay
                </Button>
              </div>
            </div>
          </Panel>

          {/* 4 Thẻ KPI Mạng Lưới */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <StatCard
              title="TỔNG LƯỢT ĐIỀU ĐỘNG"
              value={metrics.totalDispatches}
              subtext={`${metrics.approvedCount} đã duyệt • ${metrics.rejectedCount} từ chối`}
              icon="pulse"
              tone="neutral"
            />
            <StatCard
              title="YÊU CẦU CHỜ DUYỆT"
              value={metrics.pendingCount}
              subtext="Cần các Cửa hàng trưởng xử lý"
              icon="bell"
              tone={metrics.pendingCount > 0 ? 'warn' : 'neutral'}
            />
            <StatCard
              title="ĐANG CHI VIỆN HÔM NAY"
              value={metrics.activeTodayCount}
              subtext="Nhân sự đang làm việc tại cơ sở khác"
              icon="users"
              tone="ok"
            />
            <StatCard
              title="TỔNG GIỜ CÔNG CHI VIỆN"
              value={`${(metrics.totalDispatchedHours || 0).toLocaleString('vi-VN')}h`}
              subtext="Tương đương quy chuẩn 8 giờ / ca"
              icon="calendar"
              tone="ok"
            />
          </div>

          {/* Phần 1: Ma trận cặp chi nhánh */}
          <Panel style={{ padding: 20 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: c.fg, margin: 0 }}>
                  Ma Trận Dòng Điều Chuyển Giữa Các Cặp Chi Nhánh
                </h2>
                <p style={{ fontSize: 12.5, color: c.fgFaint, margin: '4px 0 0' }}>
                  Thống kê khối lượng mượn quân và số giờ công phát sinh giữa các cơ sở đối tác
                </p>
              </div>
              <span style={{ fontSize: 12, color: c.accent, fontWeight: 600 }}>
                {metrics.storePairMatrix?.length || 0} tuyến chi viện ghi nhận
              </span>
            </div>

            <DispatchNetworkMatrix
              matrix={metrics.storePairMatrix}
              loading={loading}
              emptyText="Chưa ghi nhận tuyến điều động nào trong khoảng thời gian đã chọn."
            />
          </Panel>

          {/* Phần 2: Toàn bộ lịch sử điều động toàn hệ thống */}
          <Panel style={{ padding: 20 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: c.fg, margin: 0 }}>
                  Lịch Sử Điều Động Nhân Sự Toàn Chuỗi
                </h2>
                <p style={{ fontSize: 12.5, color: c.fgFaint, margin: '4px 0 0' }}>
                  Danh sách chi tiết tất cả các phiếu đề nghị chi viện nhân sự toàn hệ thống
                </p>
              </div>

              {/* Bộ lọc bảng */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <Select
                  value={storeFilter}
                  onChange={(v) => setStoreFilter(v)}
                  options={branchOptions}
                  width={190}
                />

                <Select
                  value={statusFilter}
                  onChange={(v) => setStatusFilter(v)}
                  options={[
                    { value: 'ALL', label: 'Tất cả trạng thái' },
                    { value: 'PENDING', label: 'Chờ xét duyệt' },
                    { value: 'APPROVED', label: 'Đã phê duyệt' },
                    { value: 'REJECTED', label: 'Đã từ chối' },
                  ]}
                  width={160}
                />

                <SearchInput
                  value={searchTerm}
                  onChange={(v) => setSearchTerm(v)}
                  placeholder="Tìm nhân sự, mã, cơ sở..."
                  width={210}
                />
              </div>
            </div>

            <DispatchListTable
              dispatches={filteredDispatches}
              loading={tableLoading}
              onViewDetail={(item) => setDetailItem(item)}
              emptyText="Không tìm thấy lệnh điều động nào phù hợp với bộ lọc."
            />
          </Panel>

      {/* Modal Xem Chi Tiết */}
      {detailItem && (
        <Modal
          open={Boolean(detailItem)}
          onClose={() => setDetailItem(null)}
          title={`Hồ Sơ Lệnh Điều Động #${detailItem.dispatchId}`}
          sub="Chi tiết phiếu điều động nhân sự chuỗi"
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
              <span style={{ color: c.fgFaint }}>Vị trí:</span>
              <span style={{ color: c.fg }}>{detailItem.positionName || 'Nhân viên'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${c.borderSub}`, paddingBottom: 8 }}>
              <span style={{ color: c.fgFaint }}>Cơ sở xuất phát:</span>
              <span style={{ fontWeight: 600, color: c.fg }}>{detailItem.fromStoreName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${c.borderSub}`, paddingBottom: 8 }}>
              <span style={{ color: c.fgFaint }}>Cơ sở tiếp nhận:</span>
              <span style={{ fontWeight: 600, color: c.fg }}>{detailItem.toStoreName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${c.borderSub}`, paddingBottom: 8 }}>
              <span style={{ color: c.fgFaint }}>Thời gian điều động:</span>
              <span style={{ fontWeight: 600, color: '#34d399' }}>
                {detailItem.startDate} &rarr; {detailItem.endDate}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${c.borderSub}`, paddingBottom: 8 }}>
              <span style={{ color: c.fgFaint }}>Người lập đề nghị:</span>
              <span style={{ color: c.fg }}>{detailItem.requestedByName || '--'}</span>
            </div>
            {detailItem.approvedByName && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${c.borderSub}`, paddingBottom: 8 }}>
                <span style={{ color: c.fgFaint }}>Người phê duyệt:</span>
                <span style={{ color: c.fg }}>{detailItem.approvedByName}</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ color: c.fgFaint }}>Lý do / Công việc:</span>
              <span style={{ color: c.fgMuted, background: c.bgElev, padding: '8px 12px', borderRadius: 6 }}>
                {detailItem.reason || 'Không có ghi chú.'}
              </span>
            </div>
          </div>
        </Modal>
      )}
      </div>
    </DashboardShell>
  );
}
