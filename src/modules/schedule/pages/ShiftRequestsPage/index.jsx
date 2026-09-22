import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { useToast } from '@/components/ui/toast/ToastProvider';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatCard from '@/shared/components/ui/StatCard';
import Panel from '@/shared/components/ui/Panel';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import Badge from '@/shared/components/ui/Badge';
import FormField from '@/shared/components/ui/FormField';
import SearchInput from '@/shared/components/ui/SearchInput';
import Pagination from '@/shared/components/ui/Pagination';
import {
  getMySwapRequests,
  getStoreSwapRequests,
  createSwapRequest,
  reviewSwapRequest,
  getColleaguesForSwap,
  getColleagueShifts,
  getEmployeeShifts
} from '../../services/schedule.service';

export default function ShiftRequestsPage() {
  const { c, fonts } = useAdminTheme();
  const toast = useToast();
  const navigate = useNavigate();

  // Read stored user profile from localStorage
  const storedUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const userRole = (storedUser?.role || storedUser?.Role || '').toUpperCase();
  const roleName = (storedUser?.roleName || '').toLowerCase();
  const employeeId = storedUser?.employeeId || storedUser?.EmployeeId || storedUser?.id || storedUser?.Id;
  const branchId = storedUser?.branchId || storedUser?.homeBranchId || 1;

  const isStoreManager = [
    'STORE_MANAGER',
    'OPERATIONS_ADMIN',
    'BUSINESS_OWNER'
  ].includes(userRole) || (roleName.includes('quản lý') && !roleName.includes('trưởng ca'));

  const isShiftLeader = userRole === 'SHIFT_LEADER' || userRole === 'LEADER' || roleName.includes('trưởng ca');

  const canCreateRequest = !isStoreManager;
  const canReview = isStoreManager;

  let portalTitle = 'EMPLOYEE PORTAL';
  let roleSubtitle = storedUser?.roleName || 'Nhân sự Chi nhánh';

  if (isStoreManager) {
    portalTitle = 'STORE MANAGER CONSOLE';
  } else if (isShiftLeader) {
    portalTitle = 'SHIFT LEADER PORTAL';
  } else if (userRole === 'CASHIER' || roleName.includes('thu ngân')) {
    portalTitle = 'CASHIER PORTAL';
  } else if (userRole === 'SALES_STAFF' || roleName.includes('bán hàng')) {
    portalTitle = 'SALES PORTAL';
  } else if (userRole === 'SECURITY_GUARD' || userRole === 'SECURITY' || roleName.includes('bảo vệ')) {
    portalTitle = 'SECURITY PORTAL';
  }

  const handleSidebarNavigate = (id) => {
    if (id === 'my-calendar') navigate('/employee/my-calendar');
    else if (id === 'shift-requests') navigate('/employee/shift-requests');
    else if (id === 'attendance-otp') navigate('/employee/attendance-otp');
    else if (id === 'employee-attendance') navigate('/employee/attendance-history');
    else if (id === 'live-roster') navigate('/store-manager/live-roster');
    else if (id === 'store-schedules') navigate('/store-manager/schedules');
    else if (id === 'employees') navigate('/employees');
    else if (id === 'kiosk-codes') navigate('/store-manager/kiosk-codes');
    else if (id === 'dispatches') navigate('/store-manager/dispatches');
  };

  const [activeTab, setActiveTab] = useState(isStoreManager ? 'REVIEW' : 'CREATE');
  const [requestType, setRequestType] = useState('LEAVE'); // 'LEAVE', 'SWAP'

  // Form states
  const [myUpcomingShifts, setMyUpcomingShifts] = useState([]);
  const [selectedMyAssignmentId, setSelectedMyAssignmentId] = useState('');
  const [colleagues, setColleagues] = useState([]);
  const [selectedColleagueId, setSelectedColleagueId] = useState('');
  const [colleagueShifts, setColleagueShifts] = useState([]);
  const [selectedTargetAssignmentId, setSelectedTargetAssignmentId] = useState('');
  const [reason, setReason] = useState('');

  // UI & Loading states
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [loadingColleagues, setLoadingColleagues] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // My requests state & pagination
  const [myRequests, setMyRequests] = useState([]);
  const [loadingMyRequests, setLoadingMyRequests] = useState(false);
  const [myPage, setMyPage] = useState(1);
  const [myPageSize, setMyPageSize] = useState(10);

  // Store requests state & pagination (For Manager / Leader)
  const [storeRequests, setStoreRequests] = useState([]);
  const [loadingStoreRequests, setLoadingStoreRequests] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('ALL'); // 'ALL', 'PENDING', 'APPROVED', 'REJECTED'
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewPageSize, setReviewPageSize] = useState(10);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // 1. Fetch upcoming shifts of current user
  const fetchMyUpcomingShifts = () => {
    if (!employeeId) return;
    setLoadingShifts(true);
    const todayStr = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 14);
    const endDateStr = nextWeek.toISOString().split('T')[0];

    getEmployeeShifts(employeeId, todayStr, endDateStr)
      .then((res) => {
        const list = res?.data || res;
        if (Array.isArray(list)) {
          setMyUpcomingShifts(list);
        } else {
          setMyUpcomingShifts([]);
        }
      })
      .catch(() => setMyUpcomingShifts([]))
      .finally(() => setLoadingShifts(false));
  };

  // 2. Fetch colleagues
  const fetchColleagues = () => {
    setLoadingColleagues(true);
    getColleaguesForSwap(branchId)
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setColleagues(res.data);
        } else {
          setColleagues([]);
        }
      })
      .catch(() => setColleagues([]))
      .finally(() => setLoadingColleagues(false));
  };

  // 3. Fetch colleague shifts when colleague changes (SWAP mode)
  useEffect(() => {
    if (requestType === 'SWAP' && selectedColleagueId) {
      getColleagueShifts(selectedColleagueId)
        .then((res) => {
          if (res?.success && Array.isArray(res.data)) {
            setColleagueShifts(res.data);
          } else {
            setColleagueShifts([]);
          }
        })
        .catch(() => setColleagueShifts([]));
    } else {
      setColleagueShifts([]);
      setSelectedTargetAssignmentId('');
    }
  }, [requestType, selectedColleagueId]);

  // Initial loads
  useEffect(() => {
    if (canCreateRequest) {
      fetchMyUpcomingShifts();
      fetchColleagues();
      fetchMyRequestsList();
    }
    if (canReview) {
      fetchStoreRequestsList();
    }
  }, [employeeId, branchId, canCreateRequest, canReview]);

  // 4. Fetch My Requests
  const fetchMyRequestsList = () => {
    setLoadingMyRequests(true);
    getMySwapRequests()
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setMyRequests(res.data);
        } else {
          setMyRequests([]);
        }
      })
      .catch(() => setMyRequests([]))
      .finally(() => setLoadingMyRequests(false));
  };

  // 5. Fetch Store Requests
  const fetchStoreRequestsList = () => {
    setLoadingStoreRequests(true);
    getStoreSwapRequests(branchId)
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setStoreRequests(res.data);
        } else {
          setStoreRequests([]);
        }
      })
      .catch(() => setStoreRequests([]))
      .finally(() => setLoadingStoreRequests(false));
  };

  // Submit Request
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMyAssignmentId) {
      toast.error('Vui lòng chọn ca trực của bạn cần điều chỉnh.');
      return;
    }

    if (requestType === 'LEAVE' && !reason.trim()) {
      toast.error('Vui lòng nhập lý do xin nghỉ ca trực để Cửa hàng trưởng xem xét.');
      return;
    }

    if (requestType === 'SWAP') {
      if (!selectedColleagueId) {
        toast.error('Vui lòng chọn đồng nghiệp tiếp nhận đổi ca.');
        return;
      }
      if (!selectedTargetAssignmentId) {
        toast.error('Vui lòng chọn ca trực tương ứng của đồng nghiệp để tráo đổi.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        requestType,
        assignmentId: parseInt(selectedMyAssignmentId, 10),
        targetEmployeeId: selectedColleagueId ? parseInt(selectedColleagueId, 10) : null,
        targetAssignmentId: selectedTargetAssignmentId ? parseInt(selectedTargetAssignmentId, 10) : null,
        reason: reason.trim(),
      };

      const res = await createSwapRequest(payload);
      if (res?.success) {
        toast.success(res.message || 'Đã gửi đơn yêu cầu thành công!');
        setReason('');
        setSelectedMyAssignmentId('');
        setSelectedColleagueId('');
        setSelectedTargetAssignmentId('');
        fetchMyRequestsList();
        fetchMyUpcomingShifts();
      } else {
        toast.error(res?.message || 'Không thể tạo đơn xin điều chỉnh lịch ca.');
      }
    } catch (err) {
      const errText = err?.response?.data?.message || 'Đã có lỗi xảy ra khi tạo đơn.';
      toast.error(errText);
    } finally {
      setSubmitting(false);
    }
  };

  // Review action (Manager/Leader)
  const handleReviewAction = async (swapRequestId, isApproved) => {
    try {
      setActionLoadingId(swapRequestId);
      const res = await reviewSwapRequest({ swapRequestId, isApproved });
      if (res?.success) {
        toast.success(res.message || 'Đã cập nhật đơn thành công!');
        fetchStoreRequestsList();
        fetchMyRequestsList();
      } else {
        toast.error(res?.message || 'Thao tác không thành công.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Lỗi khi duyệt đơn.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <Badge tone="active" dot>Đã Phê Duyệt</Badge>;
      case 'REJECTED':
        return <Badge tone="bad" dot>Đã Từ Chối</Badge>;
      case 'PENDING':
      default:
        return <Badge tone="warn" dot>Chờ Xét Duyệt</Badge>;
    }
  };

  const getRequestTypeBadge = (type) => {
    switch (type) {
      case 'LEAVE':
        return <Badge tone="warn">Xin Nghỉ Ca</Badge>;
      case 'SWAP':
        return <Badge tone="active">Đổi Ca Trực</Badge>;
      case 'TRANSFER':
      default:
        return <Badge tone="info">Chuyển Ca</Badge>;
    }
  };

  const pendingCount = Array.isArray(storeRequests) ? storeRequests.filter((r) => r.status === 'PENDING').length : 0;
  const approvedCount = Array.isArray(storeRequests) ? storeRequests.filter((r) => r.status === 'APPROVED').length : 0;
  const rejectedCount = Array.isArray(storeRequests) ? storeRequests.filter((r) => r.status === 'REJECTED').length : 0;

  // Filter store requests
  const filteredStoreRequests = useMemo(() => {
    if (!Array.isArray(storeRequests)) return [];
    return storeRequests.filter((req) => {
      // Filter status
      if (reviewFilter !== 'ALL' && req.status !== reviewFilter) return false;
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = req.requesterName?.toLowerCase().includes(q);
        const matchRole = req.requesterRoleName?.toLowerCase().includes(q);
        const matchShift = req.requesterShiftName?.toLowerCase().includes(q);
        const matchTarget = req.targetName?.toLowerCase().includes(q);
        const matchReason = req.reason?.toLowerCase().includes(q);
        return matchName || matchRole || matchShift || matchTarget || matchReason;
      }
      return true;
    });
  }, [storeRequests, reviewFilter, searchTerm]);

  const pagedStoreRequests = useMemo(() => {
    return filteredStoreRequests.slice((reviewPage - 1) * reviewPageSize, reviewPage * reviewPageSize);
  }, [filteredStoreRequests, reviewPage, reviewPageSize]);

  const thStyle = {
    padding: '12px 16px',
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: c.fgSubtle,
    borderBottom: `1px solid ${c.border}`,
    textAlign: 'left',
  };

  const tdStyle = {
    padding: '14px 16px',
    fontSize: 13,
    color: c.fg,
    borderBottom: `1px solid ${c.borderSub}`,
    verticalAlign: 'middle',
  };

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="shift-requests"
          activePath="/employee/shift-requests"
          onNavigate={handleSidebarNavigate}
          consoleLabel={portalTitle}
          defaultDisplayName={storedUser?.fullName || 'Nhân viên Chi nhánh'}
          roleLabel={roleSubtitle}
          avatarLetter={storedUser?.fullName ? storedUser.fullName.charAt(0).toUpperCase() : 'E'}
          brandName="RWFM Enterprise"
        />
      }
      topbar={
        <DashboardTopbar
          breadcrumbs={
            isStoreManager
              ? [
                  { label: 'Store Manager', href: '/store-manager/schedules' },
                  { label: 'Quản Lý Nhân Sự & Kiosk', href: '/employees' },
                  { label: 'Duyệt Đơn Đổi Ca' },
                ]
              : [
                  { label: 'Cá Nhân', href: '/employee/my-calendar' },
                  { label: 'Tiện Ích', href: '/employee/shift-requests' },
                  { label: 'Đơn Đổi & Xin Nghỉ' },
                ]
          }
        />
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <PageHeader
          index={isStoreManager ? "Store Manager · Phê Duyệt Đơn" : "Employee Portal · Điều Chỉnh Lịch"}
          title={isStoreManager ? 'Phê Duyệt Đơn Xin Nghỉ & Đổi Ca Chi Nhánh' : 'Quản Lý Đơn Xin Đổi & Điều Chỉnh Lịch Ca'}
          desc={
            isStoreManager
              ? 'Xem xét lý do và phê duyệt các đơn xin nghỉ ca, đổi ca làm việc của Trưởng ca và nhân viên chi nhánh.'
              : 'Tạo đơn xin nghỉ ca khi có việc bận đột xuất hoặc tráo đổi ca trực với đồng nghiệp trong chi nhánh.'
          }
        />

        {/* Manager Summary Stat Cards */}
        {isStoreManager && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <StatCard
              title="ĐƠN CẦN BẠN XÉT DUYỆT"
              value={pendingCount}
              subtext="Đơn xin nghỉ & đổi ca chờ duyệt"
              icon="clock"
              tone={pendingCount > 0 ? 'warn' : 'neutral'}
            />
            <StatCard
              title="ĐƠN ĐÃ PHÊ DUYỆT"
              value={approvedCount}
              subtext="Đã đồng ý & tự động cập nhật lịch"
              icon="check"
              tone="ok"
            />
            <StatCard
              title="ĐƠN ĐÃ TỪ CHỐI"
              value={rejectedCount}
              subtext="Đã từ chối đơn không hợp lệ"
              icon="close"
              tone={rejectedCount > 0 ? 'bad' : 'neutral'}
            />
            <StatCard
              title="TỔNG SỐ ĐƠN TIẾP NHẬN"
              value={Array.isArray(storeRequests) ? storeRequests.length : 0}
              subtext="Tổng số đơn toàn chi nhánh"
              icon="calendar"
              tone="info"
            />
          </div>
        )}

        {/* Tab Header Controls (Only for Staff who have multiple tabs) */}
        {canCreateRequest && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              borderBottom: `1px solid ${c.borderSub}`,
              paddingBottom: 8,
            }}
          >
            <button
              onClick={() => setActiveTab('CREATE')}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                border: `1px solid ${activeTab === 'CREATE' ? c.accent : c.borderSub}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: activeTab === 'CREATE' ? c.accent : c.bgCard,
                color: activeTab === 'CREATE' ? '#000' : c.fgMuted,
              }}
            >
              <Icon name="document" size={16} color={activeTab === 'CREATE' ? '#000' : c.fgMuted} />
              <span>Tạo Đơn Điều Chỉnh Ca</span>
            </button>

            <button
              onClick={() => setActiveTab('MY_REQUESTS')}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                border: `1px solid ${activeTab === 'MY_REQUESTS' ? c.accent : c.borderSub}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: activeTab === 'MY_REQUESTS' ? c.accent : c.bgCard,
                color: activeTab === 'MY_REQUESTS' ? '#000' : c.fgMuted,
              }}
            >
              <Icon name="pulse" size={16} color={activeTab === 'MY_REQUESTS' ? '#000' : c.fgMuted} />
              <span>Lịch Sử Đơn Của Tôi ({Array.isArray(myRequests) ? myRequests.length : 0})</span>
            </button>
          </div>
        )}

        {/* TAB 1: FORM TẠO ĐƠN (STAFF) */}
        {activeTab === 'CREATE' && canCreateRequest && (
          <Panel title="Khởi Tạo Yêu Cầu Điều Chỉnh Lịch Ca">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 10 }}>
              {/* Mode Selector */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: c.fg, marginBottom: 10 }}>
                  Hình thức yêu cầu (*):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                  <button
                    type="button"
                    onClick={() => setRequestType('LEAVE')}
                    style={{
                      padding: 16,
                      borderRadius: 8,
                      border: `1.5px solid ${requestType === 'LEAVE' ? c.accent : c.border}`,
                      backgroundColor: requestType === 'LEAVE' ? 'rgba(16, 185, 129, 0.08)' : c.bgCard,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <Icon name="calendar" size={18} color={requestType === 'LEAVE' ? c.accent : c.fgMuted} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: requestType === 'LEAVE' ? c.accent : c.fg }}>
                        1. Xin Nghỉ Ca Đột Xuất
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: c.fgSubtle, lineHeight: 1.4 }}>
                      Xin nghỉ ca làm việc đã được phân công do có việc bận hoặc lý do cá nhân.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestType('SWAP')}
                    style={{
                      padding: 16,
                      borderRadius: 8,
                      border: `1.5px solid ${requestType === 'SWAP' ? c.accent : c.border}`,
                      backgroundColor: requestType === 'SWAP' ? 'rgba(16, 185, 129, 0.08)' : c.bgCard,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <Icon name="swap" size={18} color={requestType === 'SWAP' ? c.accent : c.fgMuted} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: requestType === 'SWAP' ? c.accent : c.fg }}>
                        2. Đổi Ca Cho Đồng Nghiệp
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: c.fgSubtle, lineHeight: 1.4 }}>
                      Tráo đổi ca trực tương đương giữa bạn và đồng nghiệp cùng chi nhánh.
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 1: Select My Assignment */}
              <FormField label="Chọn ca trực của bạn cần điều chỉnh (*)">
                <select
                  value={selectedMyAssignmentId}
                  onChange={(e) => setSelectedMyAssignmentId(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: c.bgRaised,
                    border: `1px solid ${c.border}`,
                    borderRadius: 4,
                    padding: '10px 14px',
                    color: c.fg,
                    fontSize: 13,
                    fontFamily: fonts?.body || 'inherit',
                    outline: 'none',
                  }}
                >
                  <option value="" style={{ backgroundColor: c.bgElev, color: c.fgMuted }}>
                    {loadingShifts ? 'Đang tải ca trực của bạn...' : '-- Chọn ca trực của bạn --'}
                  </option>
                  {Array.isArray(myUpcomingShifts) &&
                    myUpcomingShifts.map((sh) => (
                      <option key={sh.assignmentId} value={sh.assignmentId} style={{ backgroundColor: c.bgElev, color: c.fg }}>
                        {sh.workDate} ({sh.shiftName}: {sh.startTime} - {sh.endTime})
                      </option>
                    ))}
                </select>
              </FormField>

              {/* Step 2 (SWAP only): Select Colleague and their shift */}
              {requestType === 'SWAP' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                  <FormField label="Chọn đồng nghiệp cùng chi nhánh (*)">
                    <select
                      value={selectedColleagueId}
                      onChange={(e) => setSelectedColleagueId(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: c.bgRaised,
                        border: `1px solid ${c.border}`,
                        borderRadius: 4,
                        padding: '10px 14px',
                        color: c.fg,
                        fontSize: 13,
                        fontFamily: fonts?.body || 'inherit',
                        outline: 'none',
                      }}
                    >
                      <option value="" style={{ backgroundColor: c.bgElev, color: c.fgMuted }}>
                        {loadingColleagues ? 'Đang tải đồng nghiệp...' : '-- Chọn đồng nghiệp đổi ca --'}
                      </option>
                      {Array.isArray(colleagues) &&
                        colleagues.map((col) => (
                          <option key={col.employeeId} value={col.employeeId} style={{ backgroundColor: c.bgElev, color: c.fg }}>
                            {col.fullName} ({col.roleName})
                          </option>
                        ))}
                    </select>
                  </FormField>

                  <FormField label="Chọn ca trực của đồng nghiệp để đổi (*)">
                    <select
                      value={selectedTargetAssignmentId}
                      onChange={(e) => setSelectedTargetAssignmentId(e.target.value)}
                      disabled={!selectedColleagueId || colleagueShifts.length === 0}
                      style={{
                        width: '100%',
                        backgroundColor: !selectedColleagueId ? c.bgCard : c.bgRaised,
                        border: `1px solid ${c.border}`,
                        borderRadius: 4,
                        padding: '10px 14px',
                        color: c.fg,
                        fontSize: 13,
                        fontFamily: fonts?.body || 'inherit',
                        outline: 'none',
                        opacity: !selectedColleagueId ? 0.6 : 1,
                      }}
                    >
                      <option value="" style={{ backgroundColor: c.bgElev, color: c.fgMuted }}>
                        {!selectedColleagueId
                          ? '-- Vui lòng chọn đồng nghiệp trước --'
                          : colleagueShifts.length === 0
                          ? 'Đồng nghiệp không có ca trực khả dụng'
                          : '-- Chọn ca trực của đồng nghiệp --'}
                      </option>
                      {Array.isArray(colleagueShifts) &&
                        colleagueShifts.map((cs) => (
                          <option key={cs.assignmentId} value={cs.assignmentId} style={{ backgroundColor: c.bgElev, color: c.fg }}>
                            {cs.workDate} ({cs.shiftName}: {cs.timeRange})
                          </option>
                        ))}
                    </select>
                  </FormField>
                </div>
              )}

              {/* Step 3: Reason */}
              <FormField label={requestType === 'LEAVE' ? 'Lý do xin nghỉ ca (*)' : 'Lý do xin điều chỉnh'}>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nhập lý do chi tiết gửi Cửa hàng trưởng xem xét phê duyệt..."
                  style={{
                    width: '100%',
                    backgroundColor: c.bgRaised,
                    border: `1px solid ${c.border}`,
                    borderRadius: 4,
                    padding: '12px 16px',
                    color: c.fg,
                    fontSize: 13,
                    fontFamily: fonts?.body || 'inherit',
                    outline: 'none',
                  }}
                />
              </FormField>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                <Button type="submit" variant="primary" loading={submitting}>
                  Gửi Đơn Yêu Cầu
                </Button>
              </div>
            </form>
          </Panel>
        )}

        {/* TAB 2: LỊCH SỬ ĐƠN CỦA TÔI (STAFF) */}
        {activeTab === 'MY_REQUESTS' && canCreateRequest && (
          <Panel title="Danh Sách Đơn Xin Đổi & Điều Chỉnh Lịch Cá Nhân">
            {loadingMyRequests ? (
              <div style={{ padding: 40, textAlign: 'center', color: c.fgSubtle, fontSize: 13 }}>
                Đang tải danh sách đơn...
              </div>
            ) : !Array.isArray(myRequests) || myRequests.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: c.fgSubtle, fontSize: 13 }}>
                Bạn chưa gửi đơn xin điều chỉnh lịch ca nào.
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 10 }}>
                  {myRequests.slice((myPage - 1) * myPageSize, myPage * myPageSize).map((req) => (
                    <div
                      key={req.swapRequestId}
                      style={{
                        padding: '18px 20px',
                        borderRadius: 8,
                        backgroundColor: c.bgCard,
                        border: `1px solid ${c.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 16,
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {getRequestTypeBadge(req.requestType)}
                          {getStatusBadge(req.status)}
                          <span style={{ fontSize: 12, color: c.fgSubtle }}>
                            Khởi tạo: {new Date(req.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>

                        <div style={{ fontSize: 14, fontWeight: 700, color: c.fg }}>
                          Ca trực của bạn:{' '}
                          <span style={{ color: c.accent }}>
                            {req.requesterWorkDate} ({req.requesterShiftName}: {req.requesterTimeRange})
                          </span>
                        </div>

                        {req.targetName && (
                          <div style={{ fontSize: 13, color: c.fgMuted }}>
                            Đối tác tiếp nhận: <strong style={{ color: c.fg }}>{req.targetName}</strong>
                            {req.targetWorkDate && (
                              <span style={{ marginLeft: 6, color: c.fgSubtle }}>
                                (Ca đổi: {req.targetWorkDate} {req.targetShiftName} {req.targetTimeRange})
                              </span>
                            )}
                          </div>
                        )}

                        {req.reason && (
                          <div style={{ fontSize: 12, color: c.fgSubtle, fontStyle: 'italic' }}>
                            "Lý do: {req.reason}"
                          </div>
                        )}
                      </div>

                      {req.reviewedByName && (
                        <div
                          style={{
                            fontSize: 12,
                            color: c.fgSubtle,
                            textAlign: 'right',
                            paddingLeft: 16,
                            borderLeft: `1px solid ${c.borderSub}`,
                          }}
                        >
                          <div>
                            Người duyệt: <strong style={{ color: c.fg }}>{req.reviewedByName}</strong>
                          </div>
                          <div>{req.reviewedAt ? new Date(req.reviewedAt).toLocaleString('vi-VN') : ''}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {myRequests.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Pagination
                      page={myPage}
                      pageSize={myPageSize}
                      totalItems={myRequests.length}
                      onPageChange={setMyPage}
                      onPageSizeChange={(sz) => {
                        setMyPageSize(sz);
                        setMyPage(1);
                      }}
                      pageSizeOptions={[5, 10, 20]}
                    />
                  </div>
                )}
              </div>
            )}
          </Panel>
        )}

        {/* TAB 3: PHÊ DUYỆT ĐƠN CHI NHÁNH (STORE MANAGER) */}
        {activeTab === 'REVIEW' && canReview && (
          <Panel title="Danh Sách Đơn Xin Nghỉ & Đổi Ca Chi Nhánh">
            {/* Filter bar & Search */}
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
              {/* Tab Pills */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { key: 'ALL', label: 'Tất Cả', count: Array.isArray(storeRequests) ? storeRequests.length : 0 },
                  { key: 'PENDING', label: 'Chờ Xét Duyệt', count: pendingCount },
                  { key: 'APPROVED', label: 'Đã Phê Duyệt', count: approvedCount },
                  { key: 'REJECTED', label: 'Đã Từ Chối', count: rejectedCount },
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setReviewFilter(key);
                      setReviewPage(1);
                    }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 600,
                      border: `1px solid ${reviewFilter === key ? c.accent : c.borderSub}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      backgroundColor: reviewFilter === key ? c.accent : c.bgRaised,
                      color: reviewFilter === key ? '#000' : c.fgMuted,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>{label}</span>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 10,
                        fontSize: 10.5,
                        fontWeight: 700,
                        backgroundColor: reviewFilter === key ? 'rgba(0,0,0,0.2)' : c.bgCard,
                        color: reviewFilter === key ? '#000' : c.fgSubtle,
                      }}
                    >
                      {count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div style={{ width: 280 }}>
                <SearchInput
                  value={searchTerm}
                  onChange={(val) => {
                    setSearchTerm(val);
                    setReviewPage(1);
                  }}
                  placeholder="Tìm nhân viên, ca làm, lý do..."
                />
              </div>
            </div>

            {/* Table or Empty State */}
            {loadingStoreRequests ? (
              <div style={{ padding: 48, textAlign: 'center', color: c.fgSubtle, fontSize: 13 }}>
                Đang tải danh sách đơn chi nhánh...
              </div>
            ) : filteredStoreRequests.length === 0 ? (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  color: c.fgSubtle,
                  backgroundColor: c.bgRaised,
                  borderRadius: 8,
                  border: `1px dashed ${c.border}`,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  Không tìm thấy đơn xin nghỉ ca / đổi ca nào phù hợp với bộ lọc.
                </div>
              </div>
            ) : (
              <div>
                <div style={{ overflowX: 'auto', borderRadius: 8, border: `1px solid ${c.border}` }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: fonts.body }}>
                    <thead>
                      <tr style={{ backgroundColor: c.bgElev, borderBottom: `1px solid ${c.border}` }}>
                        <th style={thStyle}>Mã Đơn</th>
                        <th style={thStyle}>Nhân Sự Làm Đơn</th>
                        <th style={thStyle}>Hình Thức</th>
                        <th style={thStyle}>Ca Trực Cần Điều Chỉnh</th>
                        <th style={thStyle}>Đồng Nghiệp Tiếp Nhận</th>
                        <th style={thStyle}>Lý Do</th>
                        <th style={thStyle}>Trạng Thái</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedStoreRequests.map((req) => (
                        <tr
                          key={req.swapRequestId}
                          style={{
                            borderBottom: `1px solid ${c.borderSub}`,
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = c.bgRaised)}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={tdStyle}>
                            <span style={{ fontWeight: 700, color: c.accent, fontSize: 12 }}>
                              #SR-{String(req.swapRequestId).padStart(4, '0')}
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <div style={{ fontWeight: 600, color: c.fg }}>{req.requesterName}</div>
                            <div style={{ fontSize: 11.5, color: c.fgSubtle }}>{req.requesterRoleName || 'Nhân viên'}</div>
                          </td>
                          <td style={tdStyle}>{getRequestTypeBadge(req.requestType)}</td>
                          <td style={tdStyle}>
                            <div style={{ fontWeight: 600, color: c.fg }}>
                              {req.requesterShiftName}
                            </div>
                            <div style={{ fontSize: 11.5, color: c.fgSubtle }}>
                              📅 {req.requesterWorkDate} ({req.requesterTimeRange})
                            </div>
                          </td>
                          <td style={tdStyle}>
                            {req.targetName && req.targetName !== 'Không có (Xin nghỉ ca)' ? (
                              <div>
                                <div style={{ fontWeight: 600, color: c.fg }}>{req.targetName}</div>
                                {req.targetWorkDate && (
                                  <div style={{ fontSize: 11.5, color: c.fgSubtle }}>
                                    Ca đổi: {req.targetWorkDate} {req.targetShiftName}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: 12, color: c.fgSubtle }}>— (Xin nghỉ)</span>
                            )}
                          </td>
                          <td style={tdStyle}>
                            <div
                              style={{
                                fontSize: 12,
                                color: c.fgMuted,
                                maxWidth: 200,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title={req.reason}
                            >
                              {req.reason || '—'}
                            </div>
                          </td>
                          <td style={tdStyle}>{getStatusBadge(req.status)}</td>
                          <td style={{ ...tdStyle, textAlign: 'right' }}>
                            {req.status === 'PENDING' ? (
                              <div style={{ display: 'inline-flex', gap: 6 }}>
                                <Button
                                  variant="success"
                                  size="sm"
                                  loading={actionLoadingId === req.swapRequestId}
                                  onClick={() => handleReviewAction(req.swapRequestId, true)}
                                >
                                  Duyệt
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  loading={actionLoadingId === req.swapRequestId}
                                  onClick={() => handleReviewAction(req.swapRequestId, false)}
                                >
                                  Từ Chối
                                </Button>
                              </div>
                            ) : (
                              <div style={{ fontSize: 11.5, color: c.fgSubtle }}>
                                {req.reviewedByName && <div>Bởi: {req.reviewedByName}</div>}
                                {req.reviewedAt && <div>{new Date(req.reviewedAt).toLocaleDateString('vi-VN')}</div>}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: 16 }}>
                  <Pagination
                    page={reviewPage}
                    pageSize={reviewPageSize}
                    totalItems={filteredStoreRequests.length}
                    onPageChange={setReviewPage}
                    onPageSizeChange={(sz) => {
                      setReviewPageSize(sz);
                      setReviewPage(1);
                    }}
                    pageSizeOptions={[5, 10, 20]}
                  />
                </div>
              </div>
            )}
          </Panel>
        )}
      </div>
    </DashboardShell>
  );
}
