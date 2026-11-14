import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import ProgressBar from '@/shared/components/ui/ProgressBar';
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

  // States chọn tháng & năm
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // Chế độ xem: 'EMPLOYEES' (Mặc định: Danh sách nhân viên) hoặc 'SHIFTS' (Nhật ký từng ca)
  const [viewMode, setViewMode] = useState('EMPLOYEES');

  // Bộ lọc & Tìm kiếm
  const [searchKeyword, setSearchKeyword] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL');

  // Dữ liệu từ API
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [branchName, setBranchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Cache dữ liệu tháng trong RAM để chuyển tháng SIÊU MƯỢT, 0ms, không giật màn hình
  const attendanceCache = useRef({});
  const isInitialMount = useRef(true);

  // Lưu ID nhân viên được chọn thay vì object rời để đồng bộ phản ứng khi đổi tháng
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Month options (Tháng 1 -> 12)
  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` })),
    []
  );

  // Year options
  const yearOptions = useMemo(
    () => [2024, 2025, 2026, 2027].map((y) => ({ value: y, label: `Năm ${y}` })),
    []
  );

  // Số ngày tối đa trong tháng đang chọn
  const totalDaysInSelectedMonth = useMemo(() => {
    return new Date(year, month, 0).getDate();
  }, [year, month]);

  // Tải trước dữ liệu các tháng lân cận ngầm (silent prefetch)
  const prefetchAdjacentMonths = async (currentM, currentY) => {
    const prevM = currentM === 1 ? 12 : currentM - 1;
    const prevY = currentM === 1 ? currentY - 1 : currentY;
    const nextM = currentM === 12 ? 1 : currentM + 1;
    const nextY = currentM === 12 ? currentY + 1 : currentY;

    [ [prevM, prevY], [nextM, nextY] ].forEach(async ([m, y]) => {
      const k = `${m}_${y}`;
      if (!attendanceCache.current[k]) {
        try {
          const res = await axiosInstance.get(`/v1/store-manager/attendance/monthly?month=${m}&year=${y}`);
          if (res.data?.success && res.data?.data) {
            attendanceCache.current[k] = res.data.data;
          }
        } catch {
          // prefetch ngầm, không báo lỗi
        }
      }
    });
  };

  // Gọi API tải dữ liệu điểm danh tháng (Tối ưu Cache, không reload gây giật bảng)
  const fetchMonthlyAttendance = async (targetMonth = month, targetYear = year) => {
    const cacheKey = `${targetMonth}_${targetYear}`;

    // 1. Nếu đã có trong RAM Cache: Lập tức cập nhật ngay trong 0ms, KHÔNG loading, KHÔNG giật màn hình!
    if (attendanceCache.current[cacheKey]) {
      const cached = attendanceCache.current[cacheKey];
      setRecords(cached.records || []);
      setSummary(cached.summary || null);
      setBranchName(cached.branchName || '');
      setLoading(false);
      return;
    }

    // 2. Chỉ hiển thị loading skeleton khi mở trang lần đầu tiên và chưa có dữ liệu
    if (isInitialMount.current || records.length === 0) {
      setLoading(true);
    }
    setErrorMsg('');

    try {
      const res = await axiosInstance.get(
        `/v1/store-manager/attendance/monthly?month=${targetMonth}&year=${targetYear}`
      );
      if (res.data?.success && res.data?.data) {
        attendanceCache.current[cacheKey] = res.data.data;
        setRecords(res.data.data.records || []);
        setSummary(res.data.data.summary || null);
        setBranchName(res.data.data.branchName || '');

        // Tự động tải trước tháng trước & tháng sau vào cache ngầm
        prefetchAdjacentMonths(targetMonth, targetYear);
      } else {
        setErrorMsg(res.data?.message || 'Không thể tải dữ liệu điểm danh.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Lỗi kết nối khi tải bảng điểm danh.');
    } finally {
      setLoading(false);
      isInitialMount.current = false;
    }
  };

  useEffect(() => {
    fetchMonthlyAttendance(month, year);
  }, [month, year]);

  // Xuất file Excel
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
    } catch {
      alert('Xuất file Excel thất bại. Vui lòng thử lại sau.');
    } finally {
      setExporting(false);
    }
  };

  // ==================== TỔNG HỢP DANH SÁCH NHÂN VIÊN ====================
  const employeesData = useMemo(() => {
    const map = new Map();

    records.forEach((r) => {
      const empId = r.employeeId;
      if (!map.has(empId)) {
        map.set(empId, {
          employeeId: empId,
          employeeCode: r.employeeCode,
          fullName: r.fullName,
          roleName: r.shiftName ? `${r.shiftName} (Gán ca)` : 'Nhân sự',
          records: [],
          recordsByDate: {},
        });
      }

      const emp = map.get(empId);
      emp.records.push(r);

      if (!emp.recordsByDate[r.shiftDate]) {
        emp.recordsByDate[r.shiftDate] = [];
      }
      emp.recordsByDate[r.shiftDate].push(r);
    });

    return Array.from(map.values()).map((emp) => {
      const workedDaysSet = new Set();
      const absentDaysSet = new Set();
      let totalHours = 0;
      let onTimeShifts = 0;
      let lateShifts = 0;
      let earlyLeaveShifts = 0;
      let absentShifts = 0;

      emp.records.forEach((r) => {
        totalHours += r.actualWorkHours || 0;
        if (r.checkInStatus === 'ON_TIME') onTimeShifts++;
        if (r.checkInStatus === 'LATE') lateShifts++;
        if (r.checkOutStatus === 'EARLY_LEAVE') earlyLeaveShifts++;
        if (r.overallStatus === 'ABSENT') absentShifts++;

        const isAttended =
          !!r.checkInTime ||
          ['ON_TIME', 'LATE', 'EARLY', 'VIOLATION', 'PRESENT', 'IN_PROGRESS', 'COMPLETED'].includes(
            r.overallStatus
          );

        if (isAttended) {
          workedDaysSet.add(r.shiftDate);
        } else if (r.overallStatus === 'ABSENT') {
          absentDaysSet.add(r.shiftDate);
        }
      });

      const workingDays = workedDaysSet.size;
      const offDays = Math.max(0, totalDaysInSelectedMonth - workingDays);
      const workPercentage = ((workingDays / totalDaysInSelectedMonth) * 100).toFixed(1);
      const offPercentage = ((offDays / totalDaysInSelectedMonth) * 100).toFixed(1);

      return {
        ...emp,
        workingDays,
        offDays,
        totalDaysInMonth: totalDaysInSelectedMonth,
        workPercentage: Number(workPercentage),
        offPercentage: Number(offPercentage),
        totalWorkHours: Math.round(totalHours * 10) / 10,
        onTimeShifts,
        lateShifts,
        earlyLeaveShifts,
        absentShifts,
        totalShifts: emp.records.length,
      };
    });
  }, [records, totalDaysInSelectedMonth]);

  // Nhân viên đang chọn mở modal (Tự động cập nhật số liệu khi tháng thay đổi)
  const selectedEmployee = useMemo(() => {
    if (!selectedEmployeeId) return null;
    return employeesData.find((e) => e.employeeId === selectedEmployeeId) || null;
  }, [employeesData, selectedEmployeeId]);

  // Bộ lọc nhân viên theo thanh tìm kiếm và tỷ lệ đi làm
  const filteredEmployees = useMemo(() => {
    return employeesData.filter((emp) => {
      const matchKeyword =
        !searchKeyword ||
        emp.fullName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        emp.employeeCode?.toLowerCase().includes(searchKeyword.toLowerCase());

      let matchRate = true;
      if (attendanceFilter === 'HIGH') {
        matchRate = emp.workPercentage >= 90;
      } else if (attendanceFilter === 'MEDIUM') {
        matchRate = emp.workPercentage >= 70 && emp.workPercentage < 90;
      } else if (attendanceFilter === 'LOW') {
        matchRate = emp.workPercentage < 70;
      } else if (attendanceFilter === 'HAS_ABSENT') {
        matchRate = emp.absentShifts > 0;
      }

      return matchKeyword && matchRate;
    });
  }, [employeesData, searchKeyword, attendanceFilter]);

  // Danh sách ca lọc theo từ khóa (cho chế độ xem từng ca)
  const filteredShiftRecords = useMemo(() => {
    return records.filter((r) => {
      return (
        !searchKeyword ||
        r.fullName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        r.employeeCode?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        r.shiftName?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    });
  }, [records, searchKeyword]);

  // Badge trạng thái cho từng ca
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

  // ==================== CỘT BẢNG NHÂN VIÊN ====================
  const employeeColumns = [
    {
      title: 'Nhân Viên',
      key: 'fullName',
      render: (item) => {
        const avatarLetter = (item.fullName || 'N').trim().charAt(0).toUpperCase();
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14.5,
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)',
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
      title: 'Đi Làm Trong Tháng',
      key: 'workingRatio',
      render: (item) => (
        <div style={{ minWidth: 170 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 13.5, color: '#10B981', fontFamily: fonts?.mono || 'monospace' }}>
              {item.workPercentage}%
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: c.fg, fontFamily: fonts?.mono || 'monospace' }}>
              ({item.workingDays}/{item.totalDaysInMonth} ngày)
            </span>
          </div>
          <ProgressBar value={item.workPercentage} color="#10B981" h={6} />
          <div style={{ fontSize: 11, color: c.fgSubtle, marginTop: 4 }}>
            {item.totalWorkHours}h làm việc thực tế
          </div>
        </div>
      ),
    },
    {
      title: 'Nghỉ Làm Trong Tháng',
      key: 'offRatio',
      render: (item) => (
        <div style={{ minWidth: 170 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 13.5, color: '#EF4444', fontFamily: fonts?.mono || 'monospace' }}>
              {item.offPercentage}%
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: c.fg, fontFamily: fonts?.mono || 'monospace' }}>
              ({item.offDays}/{item.totalDaysInMonth} ngày)
            </span>
          </div>
          <ProgressBar value={item.offPercentage} color="#EF4444" h={6} />
          <div style={{ fontSize: 11, color: c.fgSubtle, marginTop: 4 }}>
            {item.offDays} ngày nghỉ{item.absentShifts > 0 ? ` • ${item.absentShifts} ca vắng` : ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Tổng Hợp Ca Làm',
      key: 'shiftStats',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: c.fg, fontSize: 13 }}>
            {item.totalShifts} ca được xếp
          </div>
          <div style={{ fontSize: 11.5, color: c.fgSubtle, marginTop: 2 }}>
            <span style={{ color: '#10B981', fontWeight: 600 }}>{item.onTimeShifts} đúng giờ</span>
            {item.lateShifts > 0 && <span style={{ color: '#EF4444', marginLeft: 6 }}>• {item.lateShifts} muộn</span>}
            {item.earlyLeaveShifts > 0 && <span style={{ color: '#F59E0B', marginLeft: 6 }}>• {item.earlyLeaveShifts} sớm</span>}
          </div>
        </div>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (item) => (
        <Button
          kind="primary"
          size="sm"
          onClick={() => setSelectedEmployeeId(item.employeeId)}
          icon="calendar"
        >
          Chi Tiết
        </Button>
      ),
    },
  ];

  // Cột bảng nhật ký từng ca
  const shiftColumns = [
    {
      title: 'Nhân Viên',
      key: 'fullName',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: c.fg }}>{item.fullName}</div>
          <div style={{ fontSize: 11.5, color: c.fgSubtle, fontFamily: fonts?.mono || 'monospace' }}>
            {item.employeeCode}
          </div>
        </div>
      ),
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
      render: (item) => (
        <div>
          <div style={{ fontFamily: fonts?.mono || 'monospace', fontWeight: 600, color: c.fg }}>
            {item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </div>
          {item.lateMinutes > 0 && (
            <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 500 }}>
              Muộn {item.lateMinutes}p
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Giờ Check-out',
      key: 'checkOutTime',
      render: (item) => (
        <div>
          <div style={{ fontFamily: fonts?.mono || 'monospace', fontWeight: 600, color: c.fg }}>
            {item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </div>
          {item.earlyLeaveMinutes > 0 && (
            <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 500 }}>
              Về sớm {item.earlyLeaveMinutes}p
            </span>
          )}
        </div>
      ),
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
          onClick={() => {
            setSelectedEmployeeId(item.employeeId);
            setSelectedRecord(item);
          }}
          icon="eye"
        >
          Chi Tiết
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
        {/* Header trang chuẩn hệ thống */}
        <PageHeader
          index="Store Manager · Bảng Chấm Công & Điểm Danh"
          title="Bảng Chấm Công Tháng Của Quản Lý"
          desc={`Theo dõi tỷ lệ chuyên cần, ngày đi làm, ngày nghỉ và hình ảnh đối soát tại ${branchName || 'Chi nhánh'}`}
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

        {/* 4 Thẻ StatCard Thống Kê Tổng Quan */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 16,
          }}
        >
          <StatCard
            label="TỔNG SỐ NHÂN VIÊN"
            value={employeesData.length}
            subtitle={`Tổng số ca trong tháng: ${records.length}`}
            icon="users"
            tone="neutral"
          />
          <StatCard
            label="ĐI LÀM TRUNG BÌNH"
            value={
              employeesData.length > 0
                ? `${Math.round(
                    employeesData.reduce((acc, curr) => acc + curr.workPercentage, 0) /
                      employeesData.length
                  )}%`
                : '0%'
            }
            subtitle={`Chu kỳ: Tháng ${month}/${year}`}
            icon="checkCircle"
            tone="good"
          />
          <StatCard
            label="ĐÚNG GIỜ"
            value={summary ? summary.onTimeCount : 0}
            subtitle={`Tỷ lệ: ${
              summary && summary.totalShifts > 0
                ? Math.round((summary.onTimeCount / summary.totalShifts) * 100)
                : 0
            }%`}
            icon="clock"
            tone="good"
          />
          <StatCard
            label="ĐI MUỘN / VỀ SỚM"
            value={summary ? summary.lateCount + summary.earlyLeaveCount : 0}
            subtitle={`Muộn: ${summary ? summary.lateCount : 0} | Sớm: ${summary ? summary.earlyLeaveCount : 0}`}
            icon="alertTriangle"
            tone="warn"
          />
        </div>

        {/* Thanh công cụ tìm kiếm, lọc và chuyển đổi tab xem */}
        <Panel style={{ padding: '14px 20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14,
            }}
          >
            {/* Tabs chuyển đổi chế độ xem */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: c.bgElev, padding: 4, borderRadius: 10, border: `1px solid ${c.border}` }}>
              <Button
                kind={viewMode === 'EMPLOYEES' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('EMPLOYEES')}
                icon="users"
              >
                Tổng Hợp Theo Nhân Viên ({employeesData.length})
              </Button>
              <Button
                kind={viewMode === 'SHIFTS' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('SHIFTS')}
                icon="table"
              >
                Nhật Ký Từng Ca ({records.length})
              </Button>
            </div>

            {/* Tìm kiếm & Lọc */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <SearchInput
                placeholder="Tìm nhân viên theo tên hoặc mã NV..."
                value={searchKeyword}
                onChange={setSearchKeyword}
                width={280}
              />

              {viewMode === 'EMPLOYEES' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {[
                    { id: 'ALL', label: 'Tất cả' },
                    { id: 'HIGH', label: '≥ 90% Đi làm' },
                    { id: 'MEDIUM', label: '70% - 89%' },
                    { id: 'LOW', label: '< 70%' },
                  ].map((tab) => (
                    <Button
                      key={tab.id}
                      kind={attendanceFilter === tab.id ? 'primary' : 'soft'}
                      size="sm"
                      onClick={() => setAttendanceFilter(tab.id)}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Panel>

        {/* Bảng Dữ Liệu Chấm Công Tháng */}
        <Panel
          title={
            viewMode === 'EMPLOYEES'
              ? `Danh Sách Chuyên Cần Nhân Viên Trong Tháng ${month}/${year}`
              : `Nhật Ký Điểm Danh Chi Tiết Từng Ca Trong Tháng ${month}/${year}`
          }
        >
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
          ) : viewMode === 'EMPLOYEES' ? (
            <DataTable
              columns={employeeColumns}
              data={filteredEmployees}
              loading={loading}
              emptyMessage="Không có nhân viên nào trong danh sách chấm công tháng này."
            />
          ) : (
            <DataTable
              columns={shiftColumns}
              data={filteredShiftRecords}
              loading={loading}
              emptyMessage="Không có dữ liệu điểm danh nào trong tháng này."
            />
          )}
        </Panel>

        {/* Modal Bảng Tháng (Tích Xanh / Tích Đỏ) & Chi Tiết Check-in / Check-out + Ảnh */}
        {(selectedEmployee || selectedRecord) && (
          <AttendanceDetailModal
            employee={selectedEmployee}
            record={selectedRecord}
            month={month}
            year={year}
            branchName={branchName}
            onClose={() => {
              setSelectedEmployeeId(null);
              setSelectedRecord(null);
            }}
            onMonthChange={(newM, newY) => {
              setMonth(newM);
              setYear(newY);
            }}
          />
        )}
      </div>
    </DashboardShell>
  );
};

export default MonthlyAttendancePage;
