import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/config/axios.config';
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
import StatCard from '@/shared/components/ui/StatCard';
import Select from '@/shared/components/ui/Select';
import SearchInput from '@/shared/components/ui/SearchInput';
import { getNavItemsForRole } from '@/shared/constants/navigation.config';
import AttendanceDetailModal from './AttendanceDetailModal';

export const MonthlyAttendancePage = () => {
  const { c, fonts } = useAdminTheme();
  const navigate = useNavigate();

  // User & Role Context
  const storedUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const userRole = (storedUser?.role || storedUser?.Role || 'STORE_MANAGER').toUpperCase();
  const roleName = storedUser?.roleName || 'Cửa Hàng Trưởng';
  const navItems = getNavItemsForRole(userRole);

  const handleSidebarNavigate = (id) => {
    if (id === 'my-calendar') navigate('/employee/my-calendar');
    else if (id === 'employee-attendance') navigate('/employee/attendance-history');
    else if (id === 'attendance-otp') navigate('/employee/attendance-otp');
    else if (id === 'live-roster') navigate('/store-manager/live-roster');
    else if (id === 'monthly-attendance') navigate('/store-manager/monthly-attendance');
    else if (id === 'store-schedules' || id === 'weekly-schedules') navigate('/store-manager/schedules');
    else if (id === 'shift-requests') navigate('/employee/shift-requests');
    else if (id === 'employees') navigate('/employees');
    else if (id === 'kiosk-codes') navigate('/store-manager/kiosk-codes');
    else if (id === 'dispatches') navigate('/store-manager/dispatches');
  };

  // States
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [branchName, setBranchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Selected Record for Detail Modal
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Month options for template Select component
  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` })),
    []
  );

  // Year options for template Select component
  const yearOptions = useMemo(
    () => [2024, 2025, 2026, 2027].map((y) => ({ value: y, label: `Năm ${y}` })),
    []
  );

  // Fetch monthly data
  const fetchMonthlyAttendance = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axiosInstance.get(
        `/v1/store-manager/attendance/monthly?month=${month}&year=${year}`
      );
      if (res.data?.success && res.data?.data) {
        setRecords(res.data.data.records || []);
        setSummary(res.data.data.summary || null);
        setBranchName(res.data.data.branchName || '');
      } else {
        setErrorMsg(res.data?.message || 'Không thể tải dữ liệu điểm danh.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Lỗi kết nối khi tải bảng điểm danh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyAttendance();
  }, [month, year]);

  // Export Excel
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await axiosInstance.get(
        `/v1/store-manager/attendance/export-excel?month=${month}&year=${year}`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `BangChamCong_${(branchName || 'ChiNhanh').replace(/\s+/g, '_')}_T${String(month).padStart(2, '0')}_${year}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Xuất file Excel thất bại. Vui lòng thử lại sau.');
    } finally {
      setExporting(false);
    }
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Keyword search
      const matchKeyword =
        !searchKeyword ||
        r.fullName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        r.employeeCode?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        r.shiftName?.toLowerCase().includes(searchKeyword.toLowerCase());

      // Status filter
      let matchStatus = true;
      if (statusFilter === 'ON_TIME') {
        matchStatus = r.checkInStatus === 'ON_TIME';
      } else if (statusFilter === 'LATE') {
        matchStatus = r.checkInStatus === 'LATE';
      } else if (statusFilter === 'EARLY_LEAVE') {
        matchStatus = r.checkOutStatus === 'EARLY_LEAVE';
      } else if (statusFilter === 'ABSENT') {
        matchStatus = r.overallStatus === 'ABSENT';
      }

      return matchKeyword && matchStatus;
    });
  }, [records, searchKeyword, statusFilter]);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'ON_TIME':
      case 'EARLY':
        return <Badge tone="good" dot>ĐÚNG GIỜ</Badge>;
      case 'LATE':
        return <Badge tone="warn" dot>ĐI MUỘN</Badge>;
      case 'EARLY_LEAVE':
        return <Badge tone="warn" dot>VỀ SỚM</Badge>;
      case 'VIOLATION':
        return <Badge tone="warn" dot>VI PHẠM GIỜ</Badge>;
      case 'ABSENT':
        return <Badge tone="bad" dot>VẮNG MẶT (NGHỈ)</Badge>;
      case 'PENDING':
        return <Badge tone="neutral" dot>CHƯA ĐẾN CA</Badge>;
      case 'IN_PROGRESS':
        return <Badge tone="info" dot>ĐANG LÀM VIỆC</Badge>;
      default:
        return <Badge tone="neutral" dot>{status}</Badge>;
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
                background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
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
      title: 'Ngày & Ca Làm',
      key: 'shiftInfo',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: c.fg, fontSize: 13 }}>{item.shiftName}</div>
          <div style={{ fontSize: 11.5, color: c.fgSubtle, fontFamily: fonts?.mono || 'monospace' }}>
            {item.shiftDate} ({item.scheduledStartTime} - {item.scheduledEndTime})
          </div>
        </div>
      ),
    },
    {
      title: 'Giờ Check-in',
      key: 'checkInTime',
      render: (item) => {
        if (!item.checkInTime) {
          return (
            <span style={{ fontFamily: fonts?.mono || 'monospace', color: c.fgFaint, fontSize: 13 }}>
              --:--
            </span>
          );
        }
        return (
          <div>
            <div style={{ fontFamily: fonts?.mono || 'monospace', fontWeight: 600, color: c.fg, fontSize: 13 }}>
              {new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            {item.lateMinutes > 0 && (
              <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 500 }}>
                Muộn {item.lateMinutes}p
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Giờ Check-out',
      key: 'checkOutTime',
      render: (item) => {
        if (!item.checkOutTime) {
          return (
            <span style={{ fontFamily: fonts?.mono || 'monospace', color: c.fgFaint, fontSize: 13 }}>
              --:--
            </span>
          );
        }
        return (
          <div>
            <div style={{ fontFamily: fonts?.mono || 'monospace', fontWeight: 600, color: c.fg, fontSize: 13 }}>
              {new Date(item.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            {item.earlyLeaveMinutes > 0 && (
              <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 500 }}>
                Về sớm {item.earlyLeaveMinutes}p
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Tổng Giờ',
      key: 'actualWorkHours',
      render: (item) => (
        <span style={{ fontWeight: 600, fontFamily: fonts?.mono || 'monospace', color: c.fg }}>
          {item.actualWorkHours !== null ? `${item.actualWorkHours}h` : '--'}
        </span>
      ),
    },
    {
      title: 'Trạng Thái',
      key: 'overallStatus',
      render: (item) => renderStatusBadge(item.overallStatus),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (item) => (
        <Button
          kind="soft"
          size="sm"
          onClick={() => setSelectedRecord(item)}
          icon="eye"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          activeId="monthly-attendance"
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
            { label: 'Bảng Chấm Công Tháng' },
          ]}
        />
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header trang chuẩn template Apex / RWFM */}
        <PageHeader
          index="Store Manager · Quản Lý Chấm Công"
          title="Bảng Chấm Công & Điểm Danh Tháng"
          desc={`Theo dõi, đối soát dữ liệu điểm danh và xuất báo cáo công tại ${branchName || 'Chi nhánh'}`}
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Select
                value={month}
                onChange={(v) => setMonth(Number(v))}
                options={monthOptions}
                width={130}
              />
              <Select
                value={year}
                onChange={(v) => setYear(Number(v))}
                options={yearOptions}
                width={110}
              />
              <Button
                kind="primary"
                icon="copy"
                onClick={handleExportExcel}
                loading={exporting}
                disabled={records.length === 0}
              >
                Xuất File Excel
              </Button>
            </div>
          }
        />

        {/* 4 Thẻ StatCard chuẩn Apex Dashboard */}
        {summary && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 16,
            }}
          >
            <StatCard
              label="TỔNG SỐ CA"
              value={summary.totalShifts}
              subtitle={`Tổng giờ làm: ${summary.totalWorkHours}h`}
              icon="clock"
              tone="neutral"
            />
            <StatCard
              label="ĐÚNG GIỜ"
              value={summary.onTimeCount}
              subtitle={`Tỷ lệ: ${summary.totalShifts > 0 ? Math.round((summary.onTimeCount / summary.totalShifts) * 100) : 0}%`}
              icon="checkCircle"
              tone="good"
            />
            <StatCard
              label="ĐI MUỘN / VỀ SỚM"
              value={summary.lateCount + summary.earlyLeaveCount}
              subtitle={`Muộn: ${summary.lateCount} | Về sớm: ${summary.earlyLeaveCount}`}
              icon="alertTriangle"
              tone="warn"
            />
            <StatCard
              label="VẮNG MẶT (NGHỈ)"
              value={summary.absentCount}
              subtitle="Ca không điểm danh"
              icon="x"
              tone="bad"
            />
          </div>
        )}

        {/* Thanh công cụ tìm kiếm và lọc trạng thái dùng component template */}
        <Panel style={{ padding: '14px 20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <SearchInput
              placeholder="Tìm theo tên nhân viên, mã NV hoặc ca..."
              value={searchKeyword}
              onChange={setSearchKeyword}
              width={320}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12.5, color: c.fgSubtle, fontWeight: 500 }}>Lọc trạng thái:</span>
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'ON_TIME', label: 'Đúng giờ' },
                { id: 'LATE', label: 'Đi muộn' },
                { id: 'EARLY_LEAVE', label: 'Về sớm' },
                { id: 'ABSENT', label: 'Vắng mặt' },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  kind={statusFilter === tab.id ? 'primary' : 'soft'}
                  size="sm"
                  onClick={() => setStatusFilter(tab.id)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
        </Panel>

        {/* Bảng dữ liệu điểm danh */}
        <Panel title="Danh Sách Nhật Ký Điểm Danh Tháng">
          {errorMsg ? (
            <div
              style={{
                padding: '16px 20px',
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
          ) : (
            <DataTable
              columns={columns}
              data={filteredRecords}
              loading={loading}
              emptyMessage="Không có dữ liệu điểm danh nào trong tháng này."
            />
          )}
        </Panel>

        {/* Modal Chi tiết điểm danh & Xem ảnh */}
        {selectedRecord && (
          <AttendanceDetailModal
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
          />
        )}
      </div>
    </DashboardShell>
  );
};

export default MonthlyAttendancePage;
