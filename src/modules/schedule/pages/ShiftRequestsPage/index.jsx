import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { useToast } from '@/components/ui/toast/ToastProvider';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';
import PageHeader from '@/shared/components/ui/PageHeader';
import Panel from '@/shared/components/ui/Panel';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import Badge from '@/shared/components/ui/Badge';
import FormField from '@/shared/components/ui/FormField';
import { getNavItemsForRole } from '@/shared/constants/navigation.config';
import {
  getMySwapRequests,
  getStoreSwapRequests,
  createSwapRequest,
  reviewSwapRequest,
  getColleaguesForSwap,
  getColleagueShifts,
  getEmployeeShifts
} from '../../services/schedule.service';
import axiosInstance from '@/config/axios.config';

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

  // Quản lý cửa hàng KHÔNG có chức năng tạo đơn chuyển ca, CHỈ có quyền DUYỆT đơn.
  // Trưởng ca (Shift Leader) và Nhân viên trong ca chỉ có quyền TẠO ĐƠN và XEM ĐƠN CỦA MÌNH, KHÔNG có quyền duyệt đơn.
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

  const navItems = getNavItemsForRole(userRole);

  const handleSidebarNavigate = (id) => {
    if (id === 'my-calendar') navigate('/employee/my-calendar');
    else if (id === 'shift-requests') navigate('/employee/shift-requests');
    else if (id === 'attendance-otp') navigate('/employee/attendance-otp');
    else if (id === 'employee-attendance') navigate('/employee/attendance-history');
    else if (id === 'live-roster') navigate('/store-manager/live-roster');
    else if (id === 'store-schedules') navigate('/store-manager/schedules');
    else if (id === 'employees') navigate('/employees');
    else if (id === 'kiosk-codes') navigate('/store-manager/kiosk-codes');
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

  // My requests state
  const [myRequests, setMyRequests] = useState([]);
  const [loadingMyRequests, setLoadingMyRequests] = useState(false);

  // Store requests state (For Manager / Leader)
  const [storeRequests, setStoreRequests] = useState([]);
  const [loadingStoreRequests, setLoadingStoreRequests] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('PENDING'); // 'PENDING', 'APPROVED', 'REJECTED'
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
        return <Badge tone="approved">Đã Phê Duyệt</Badge>;
      case 'REJECTED':
        return <Badge tone="rejected">Đã Từ Chối</Badge>;
      case 'PENDING':
      default:
        return <Badge tone="pending">Chờ Phê Duyệt</Badge>;
    }
  };

  const getRequestTypeBadge = (type) => {
    switch (type) {
      case 'LEAVE':
        return <Badge tone="warn">Xin Nghỉ Ca</Badge>;
      case 'SWAP':
        return <Badge tone="active">Đổi Ca Cho Nhau</Badge>;
      case 'TRANSFER':
      default:
        return <Badge tone="info">Đổi / Chuyển Ca</Badge>;
    }
  };

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="shift-requests"
          activePath="/employee/shift-requests"
          onNavigate={handleSidebarNavigate}
          navItems={navItems}
          consoleLabel={portalTitle}
          defaultDisplayName={storedUser?.fullName || 'Nhân viên Chi nhánh'}
          roleLabel={roleSubtitle}
          avatarLetter={storedUser?.fullName ? storedUser.fullName.charAt(0).toUpperCase() : 'E'}
        />
      }
      topbar={
        <DashboardTopbar
          breadcrumbs={[
            { label: portalTitle, href: '/employee/my-calendar' },
            { label: 'Đơn Xin Đổi & Điều Chỉnh Lịch' },
          ]}
        />
      }
    >
      <div
        style={{
          padding: '24px 28px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          fontFamily: fonts?.body || 'inherit',
          color: c.fg,
        }}
      >
        <PageHeader
          index={`${portalTitle} · ${isStoreManager ? 'PHÊ DUYỆT ĐƠN' : 'ĐIỀU CHỈNH LỊCH'}`}
          title={isStoreManager ? 'Phê Duyệt Đơn Xin Nghỉ & Đổi Ca Chi Nhánh' : 'Quản Lý Đơn Xin Đổi & Điều Chỉnh Lịch Ca'}
          desc={
            isStoreManager
              ? 'Xem xét lý do và phê duyệt các đơn xin nghỉ ca, đổi ca làm việc của Trưởng ca và nhân viên chi nhánh.'
              : 'Tạo đơn xin nghỉ ca khi có việc bận đột xuất hoặc tráo đổi ca trực với đồng nghiệp trong chi nhánh.'
          }
        />

        {/* Tab Header Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: `1px solid ${c.borderSub}`,
            paddingBottom: 4,
          }}
        >
          {canCreateRequest && (
            <>
              <button
                onClick={() => setActiveTab('CREATE')}
                style={{
                  padding: '10px 16px',
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: `1px solid ${activeTab === 'CREATE' ? c.accent : c.borderSub}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === 'CREATE' ? c.accent : c.bgCard,
                  color: activeTab === 'CREATE' ? c.ink : c.fgMuted,
                }}
              >
                <Icon name="document" size={16} color={activeTab === 'CREATE' ? c.ink : c.fgMuted} />
                <span>Tạo Đơn Điều Chỉnh Ca</span>
              </button>

              <button
                onClick={() => setActiveTab('MY_REQUESTS')}
                style={{
                  padding: '10px 16px',
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: `1px solid ${activeTab === 'MY_REQUESTS' ? c.accent : c.borderSub}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === 'MY_REQUESTS' ? c.accent : c.bgCard,
                  color: activeTab === 'MY_REQUESTS' ? c.ink : c.fgMuted,
                }}
              >
                <Icon name="pulse" size={16} color={activeTab === 'MY_REQUESTS' ? c.ink : c.fgMuted} />
                <span>Lịch Sử Đơn Của Tôi ({Array.isArray(myRequests) ? myRequests.length : 0})</span>
              </button>
            </>
          )}

          {canReview && (
            <button
              onClick={() => setActiveTab('REVIEW')}
              style={{
                padding: '10px 16px',
                borderRadius: 4,
                fontSize: 13,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                border: `1px solid ${activeTab === 'REVIEW' ? c.accent : c.borderSub}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: activeTab === 'REVIEW' ? c.accent : c.bgCard,
                color: activeTab === 'REVIEW' ? c.ink : c.fgMuted,
              }}
            >
              <Icon name="users" size={16} color={activeTab === 'REVIEW' ? c.ink : c.fgMuted} />
              <span>Phê Duyệt Đơn Chi Nhánh ({Array.isArray(storeRequests) ? storeRequests.filter((r) => r.status === 'PENDING').length : 0} Chờ)</span>
            </button>
          )}
        </div>

        {/* TAB 1: FORM TẠO ĐƠN */}
        {activeTab === 'CREATE' && (
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
                      padding: '16px 18px',
                      borderRadius: 6,
                      textAlign: 'left',
                      border: requestType === 'LEAVE' ? `2px solid ${c.accent}` : `1px solid ${c.border}`,
                      backgroundColor: requestType === 'LEAVE' ? c.accentDim : c.bgCard,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 800, color: requestType === 'LEAVE' ? c.accent : c.fg, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon name="calendar" size={16} color={requestType === 'LEAVE' ? c.accent : c.fg} />
                      <span>1. Xin Nghỉ Ca (Có Việc Bận)</span>
                    </div>
                    <div style={{ fontSize: 12, color: c.fgSubtle, lineHeight: 1.5 }}>
                      Bạn có việc bận không thể đi làm ca này. Cửa hàng trưởng sẽ xem xét lý do, nếu duyệt sẽ hủy ca của bạn và tự xếp nhân sự khác thay thế.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestType('SWAP')}
                    style={{
                      padding: '16px 18px',
                      borderRadius: 6,
                      textAlign: 'left',
                      border: requestType === 'SWAP' ? `2px solid ${c.accent}` : `1px solid ${c.border}`,
                      backgroundColor: requestType === 'SWAP' ? c.accentDim : c.bgCard,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 800, color: requestType === 'SWAP' ? c.accent : c.fg, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon name="swap" size={16} color={requestType === 'SWAP' ? c.accent : c.fg} />
                      <span>2. Đổi Ca Cho Nhau (2 Chiều)</span>
                    </div>
                    <div style={{ fontSize: 12, color: c.fgSubtle, lineHeight: 1.5 }}>
                      Hai người đồng ý đổi ca cho nhau (bạn làm ca của đồng nghiệp và đồng nghiệp làm ca của bạn). Quản lý duyệt sẽ tự động hoán đổi lịch 2 người.
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 1: Select My Shift */}
              <FormField label="Ca trực tương lai của bạn cần xin điều chỉnh (*)">
                <select
                  value={selectedMyAssignmentId}
                  onChange={(e) => setSelectedMyAssignmentId(e.target.value)}
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
                  disabled={loadingShifts}
                >
                  <option value="" style={{ backgroundColor: c.bgElev, color: c.fg }}>-- Chọn ca trực tương lai của bạn --</option>
                  {Array.isArray(myUpcomingShifts) &&
                    myUpcomingShifts.map((s) => (
                      <option key={s.assignmentId} value={s.assignmentId} style={{ backgroundColor: c.bgElev, color: c.fg }}>
                        {s.workDate} ({s.shiftName}: {s.startTime} - {s.endTime}) - {s.storeName}
                      </option>
                    ))}
                </select>
              </FormField>

              {/* Step 2: Information or Target Colleague Selection */}
              {requestType === 'LEAVE' ? (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 6,
                    backgroundColor: `${c.accentDim}30`,
                    border: `1px solid ${c.accent}`,
                    color: c.fg,
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Icon name="info" size={18} color={c.accent} style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Quy trình xin nghỉ:</strong> Sau khi gửi đơn, Cửa hàng trưởng sẽ xem xét lý do bạn cung cấp. Khi được duyệt, ca làm việc này sẽ được gỡ khỏi lịch của bạn để Cửa hàng trưởng chủ động phân công nhân sự khác thay thế.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  <FormField label="Đồng nghiệp đồng ý đổi ca (* - Chỉ cùng vị trí/vai trò)">
                    <select
                      value={selectedColleagueId}
                      onChange={(e) => setSelectedColleagueId(e.target.value)}
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
                      disabled={loadingColleagues}
                    >
                      <option value="" style={{ backgroundColor: c.bgElev, color: c.fg }}>
                        {loadingColleagues
                          ? 'Đang tải danh sách đồng nghiệp...'
                          : Array.isArray(colleagues) && colleagues.length === 0
                          ? '-- Không tìm thấy đồng nghiệp cùng vai trò --'
                          : '-- Chọn đồng nghiệp cùng vai trò/vị trí --'}
                      </option>
                      {Array.isArray(colleagues) &&
                        colleagues.map((col) => (
                          <option key={col.employeeId} value={col.employeeId} style={{ backgroundColor: c.bgElev, color: c.fg }}>
                            {col.fullName} ({col.roleName}) - Mã: NV{col.employeeId}
                          </option>
                        ))}
                    </select>
                  </FormField>

                  <FormField label="Ca trực của đồng nghiệp bạn nhận làm bù (*)">
                    <select
                      value={selectedTargetAssignmentId}
                      onChange={(e) => setSelectedTargetAssignmentId(e.target.value)}
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
                      disabled={!selectedColleagueId || !Array.isArray(colleagueShifts) || colleagueShifts.length === 0}
                    >
                      <option value="" style={{ backgroundColor: c.bgElev, color: c.fg }}>
                        {!selectedColleagueId
                          ? '-- Chọn đồng nghiệp trước --'
                          : !Array.isArray(colleagueShifts) || colleagueShifts.length === 0
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

        {/* TAB 2: LỊCH SỬ ĐƠN CỦA TÔI */}
        {activeTab === 'MY_REQUESTS' && (
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 10 }}>
                {myRequests.map((req) => (
                  <div
                    key={req.swapRequestId}
                    style={{
                      padding: '18px 20px',
                      borderRadius: 4,
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
            )}
          </Panel>
        )}

        {/* TAB 3: PHÊ DUYỆT ĐƠN CHI NHÁNH */}
        {activeTab === 'REVIEW' && canReview && (
          <Panel title="Phê Duyệt Đơn Đổi & Điều Chỉnh Lịch Chi Nhánh">
            {/* Filter controls */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, paddingTop: 6 }}>
              {['PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setReviewFilter(st)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 700,
                    border: `1px solid ${reviewFilter === st ? c.accent : c.borderSub}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: reviewFilter === st ? c.accent : c.bgCard,
                    color: reviewFilter === st ? c.ink : c.fgSubtle,
                  }}
                >
                  {st === 'PENDING' ? 'Chờ Phê Duyệt' : st === 'APPROVED' ? 'Đã Phê Duyệt' : 'Đã Từ Chối'}
                </button>
              ))}
            </div>

            {loadingStoreRequests ? (
              <div style={{ padding: 40, textAlign: 'center', color: c.fgSubtle, fontSize: 13 }}>
                Đang tải danh sách đơn chi nhánh...
              </div>
            ) : (
              (() => {
                const filtered = Array.isArray(storeRequests) ? storeRequests.filter((r) => r.status === reviewFilter) : [];
                if (filtered.length === 0) {
                  return (
                    <div style={{ padding: 40, textAlign: 'center', color: c.fgSubtle, fontSize: 13 }}>
                      Không có đơn nào trong mục này.
                    </div>
                  );
                }
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {filtered.map((req) => (
                      <div
                        key={req.swapRequestId}
                        style={{
                          padding: '18px 20px',
                          borderRadius: 4,
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
                              Người làm đơn: <strong style={{ color: c.fg }}>{req.requesterName}</strong> ({req.requesterRoleName})
                            </span>
                          </div>

                          <div style={{ fontSize: 14, fontWeight: 700, color: c.fg }}>
                            Ca xin điều chỉnh:{' '}
                            <span style={{ color: c.accent }}>
                              {req.requesterWorkDate} ({req.requesterShiftName}: {req.requesterTimeRange})
                            </span>
                          </div>

                          {req.targetName && (
                            <div style={{ fontSize: 13, color: c.fgMuted }}>
                              Đồng nghiệp liên quan: <strong style={{ color: c.fg }}>{req.targetName}</strong>
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

                        {req.status === 'PENDING' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Button
                              variant="success"
                              size="sm"
                              loading={actionLoadingId === req.swapRequestId}
                              onClick={() => handleReviewAction(req.swapRequestId, true)}
                            >
                              Phê Duyệt & Tự Đổi Lịch
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
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </Panel>
        )}
      </div>
    </DashboardShell>
  );
}
