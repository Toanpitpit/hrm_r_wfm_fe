import { useState, useEffect, useMemo } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import ConfirmModal from '@/shared/components/ui/ConfirmModal';
import Button from '@/shared/components/ui/Button';
import FormField from '@/shared/components/ui/FormField';
import Icon from '@/shared/components/ui/Icon';
import { formatVNDate, formatShiftTemplateName } from '../hooks/useWeeklySchedule';

export default function AssignShiftCellModal({
  isOpen,
  onClose,
  cellData,
  templates = [],
  onAssignSingle,
  onDeleteAssignment,
  actionLoading = false,
}) {
  const { c } = useAdminTheme();

  const isRoleMode = cellData?.mode === 'ASSIGN_ROLE_TO_SHIFT';

  // Lọc danh sách mẫu ca chuẩn ĐANG HOẠT ĐỘNG
  const activeTemplates = useMemo(() => {
    return (templates || []).filter((t) => t.isActive !== false && t.status !== 'INACTIVE');
  }, [templates]);

  // --- State cho Mode 1: ASSIGN_ROLE_TO_SHIFT ---
  const schedule = cellData?.schedule;
  const shiftTemplate = cellData?.shiftTemplate;
  const workDate = cellData?.workDate || cellData?.date;
  const targetRole = cellData?.targetRole;
  const targetRoleLabel = cellData?.targetRoleLabel || 'Nhân sự';
  const allEmployees = cellData?.allEmployees || [];

  const [selectedUserId, setSelectedUserId] = useState('');
  const [showAllStoreRoles, setShowAllStoreRoles] = useState(false);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');

  // --- State cho Mode 2: BY_EMPLOYEE (Legacy) ---
  const user = cellData?.user;
  const currentAssignment = cellData?.currentAssignment;
  const [selectedShiftId, setSelectedShiftId] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (isRoleMode) {
      setSelectedUserId('');
      setShowAllStoreRoles(false);
      setRoleSearchTerm('');
    } else {
      if (currentAssignment) {
        setSelectedShiftId(currentAssignment.shiftTemplateId || '');
      } else if (activeTemplates.length > 0) {
        setSelectedShiftId(activeTemplates[0].shiftId || activeTemplates[0].id);
      }
    }
  }, [isRoleMode, cellData, currentAssignment, activeTemplates]);

  // Lọc danh sách nhân sự phù hợp cho Mode 1
  const eligibleEmployees = useMemo(() => {
    if (!isRoleMode || !allEmployees) return [];

    let list = allEmployees;

    // Nếu không tick "Hiện tất cả", chỉ lọc đúng vai trò cần gán
    if (!showAllStoreRoles && targetRole) {
      list = list.filter((emp) => {
        const rCode = (emp.roleCode || '').toUpperCase();
        if (targetRole === 'SHIFT_LEADER') return rCode === 'SHIFT_LEADER' || rCode === 'LEADER';
        if (targetRole === 'CASHIER') return rCode === 'CASHIER';
        if (targetRole === 'SALES_STAFF') return rCode === 'SALES' || rCode === 'SALES_STAFF';
        if (targetRole === 'SECURITY_GUARD') return rCode === 'SECURITY' || rCode === 'SECURITY_GUARD';
        return true;
      });
    }

    if (roleSearchTerm.trim()) {
      const term = roleSearchTerm.toLowerCase();
      list = list.filter(
        (emp) =>
          emp.fullName?.toLowerCase().includes(term) ||
          emp.employeeCode?.toLowerCase().includes(term)
      );
    }

    return list;
  }, [isRoleMode, allEmployees, targetRole, showAllStoreRoles, roleSearchTerm]);

  if (!isOpen || !cellData) return null;

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const isPastOrToday = Boolean(workDate && workDate <= todayStr);

  /**
   * Kiểm tra khoảng cách nghỉ giữa 2 ca của 2 ngày liên tiếp có đạt tối thiểu 12 giờ không.
   * targetDateStr: YYYY-MM-DD
   * targetShift: { startTime, endTime, isOvernight }
   * existingShifts: danh sách ca đã có [{ date, startTime, endTime, isOvernight, shiftName }]
   */
  const checkRest12hViolation = (targetDateStr, targetShift, existingShifts) => {
    if (!targetDateStr || !targetShift || !targetShift.startTime || !targetShift.endTime || !existingShifts || existingShifts.length === 0) {
      return { violated: false, message: '' };
    }

    const parseMinutes = (tStr) => {
      const [h, m] = String(tStr || '00:00').split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const targetDate = new Date(targetDateStr);
    const prevDateObj = new Date(targetDate);
    prevDateObj.setDate(prevDateObj.getDate() - 1);
    const prevDateStr = `${prevDateObj.getFullYear()}-${pad(prevDateObj.getMonth() + 1)}-${pad(prevDateObj.getDate())}`;

    const nextDateObj = new Date(targetDate);
    nextDateObj.setDate(nextDateObj.getDate() + 1);
    const nextDateStr = `${nextDateObj.getFullYear()}-${pad(nextDateObj.getMonth() + 1)}-${pad(nextDateObj.getDate())}`;

    const newStartMin = parseMinutes(targetShift.startTime);
    let newEndMin = parseMinutes(targetShift.endTime);
    if (Boolean(targetShift.isOvernight) || newEndMin <= newStartMin) {
      newEndMin += 24 * 60;
    }

    for (const ex of existingShifts) {
      const exDate = String(ex.date || '').substring(0, 10);
      const exStartMin = parseMinutes(ex.startTime);
      let exEndMin = parseMinutes(ex.endTime);
      if (Boolean(ex.isOvernight) || exEndMin <= exStartMin) {
        exEndMin += 24 * 60;
      }

      // Trường hợp 1: ex là ca của ngày hôm trước (prevDateStr) -> khoảng cách từ exEnd đến newStart
      if (exDate === prevDateStr) {
        const gapHours = (24 * 60 + newStartMin - exEndMin) / 60.0;
        if (gapHours < 12.0) {
          return {
            violated: true,
            message: `Vi phạm nghỉ 12h: Sau ca '${ex.shiftName}' ngày hôm trước (${formatVNDate(prevDateStr)}) chỉ nghỉ ${gapHours.toFixed(1)}h trước ca này (< 12h)`,
          };
        }
      }

      // Trường hợp 2: ex là ca của ngày hôm sau (nextDateStr) -> khoảng cách từ newEnd đến exStart
      if (exDate === nextDateStr) {
        const gapHours = (24 * 60 + exStartMin - newEndMin) / 60.0;
        if (gapHours < 12.0) {
          return {
            violated: true,
            message: `Vi phạm nghỉ 12h: Ca này kết thúc chỉ nghỉ ${gapHours.toFixed(1)}h trước ca '${ex.shiftName}' ngày hôm sau (${formatVNDate(nextDateStr)}) (< 12h)`,
          };
        }
      }
    }

    return { violated: false, message: '' };
  };

  // Submit cho Mode 1 (Gán nhân viên vào ca theo vị trí)
  const handleRoleSubmit = (e) => {
    e.preventDefault();
    if (isPastOrToday) return;
    if (!selectedUserId || !shiftTemplate || !workDate) return;

    const shiftId = shiftTemplate.id || shiftTemplate.shiftId;
    onAssignSingle(selectedUserId, shiftId, workDate);
  };

  // Helper kiểm tra ngày điều chuyển cho Mode 2
  const targetDateStrMode2 = String(workDate || '').substring(0, 10);
  const uDispStart = String(user?.dispatchStartDate || '').substring(0, 10);
  const uDispEnd = String(user?.dispatchEndDate || '').substring(0, 10);
  const uDispAwayStart = String(user?.dispatchAwayStartDate || '').substring(0, 10);
  const uDispAwayEnd = String(user?.dispatchAwayEndDate || '').substring(0, 10);

  const isUserNotYetDispatched = Boolean(user?.isDispatched && uDispStart && targetDateStrMode2 < uDispStart);
  const isUserDispatchExpired = Boolean(user?.isDispatched && uDispEnd && targetDateStrMode2 > uDispEnd);
  const isUserDispatchedAway = Boolean(user?.isDispatchedAway && uDispAwayStart && uDispAwayEnd && targetDateStrMode2 >= uDispAwayStart && targetDateStrMode2 <= uDispAwayEnd);
  const isMode2Blocked = isPastOrToday || isUserNotYetDispatched || isUserDispatchExpired || isUserDispatchedAway;

  // Submit cho Mode 2 (Gán ca cho nhân viên cụ thể)
  const handleEmployeeSubmit = (e) => {
    e.preventDefault();
    if (isMode2Blocked) return;
    if (!selectedShiftId || !user || !workDate) return;

    onAssignSingle(user.userId, selectedShiftId, workDate);
  };

  const handleDelete = () => {
    if (!currentAssignment || isPastOrToday) return;
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (!currentAssignment) return;
    onDeleteAssignment(currentAssignment.assignmentId);
    setShowConfirmDelete(false);
  };

  // =========================================================================
  // GIAO DIỆN MODE 1: GÁN NHÂN VIÊN VÀO VỊ TRÍ CA TRỰC (ASSIGN_ROLE_TO_SHIFT)
  // =========================================================================
  if (isRoleMode) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Gán Nhân Sự Cho Vị Trí: ${targetRoleLabel}`}
      >
        <form onSubmit={handleRoleSubmit}>
          {isPastOrToday && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 6,
                background: c.tones.badDim,
                border: `1px solid ${c.tones.bad}`,
                color: c.tones.bad,
                fontSize: 12.5,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 14,
              }}
            >
              <Icon name="alertTriangle" size={16} color={c.tones.bad} />
              <span>Ngày {formatVNDate(workDate)} là ngày hôm nay hoặc ngày đã qua. Hệ thống khóa, không thể phân công ca trực.</span>
            </div>
          )}

          {/* Thông tin ca trực & ngày */}
          <div
            style={{
              background: c.bgElev,
              border: `1px solid ${c.border}`,
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 14,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: c.fg }}>
                {shiftTemplate?.name || 'Ca trực'}
              </div>
              <div style={{ fontSize: 12, color: c.fgFaint }}>
                Khung giờ: {shiftTemplate?.startTime?.substring(0, 5)} - {shiftTemplate?.endTime?.substring(0, 5)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: c.accent }}>
                Ngày {formatVNDate(workDate)}
              </div>
              <div style={{ fontSize: 11, color: c.fgFaint }}>{workDate}</div>
            </div>
          </div>

          {/* Vị trí chỉ định */}
          <div
            style={{
              marginBottom: 14,
              padding: '8px 12px',
              borderRadius: 6,
              background: `${c.accentDim}25`,
              border: `1px solid ${c.accent}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: c.accent }}>
              Vị trí cần bổ sung: {targetRoleLabel}
            </span>
            <label
              style={{
                fontSize: 11,
                color: c.fgSubtle,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={showAllStoreRoles}
                onChange={(e) => setShowAllStoreRoles(e.target.checked)}
              />
              Hiện tất cả nhân viên khác
            </label>
          </div>

          {/* Ô tìm nhanh nhân viên */}
          <div style={{ marginBottom: 10 }}>
            <input
              type="text"
              placeholder="Tìm nhân viên theo tên hoặc mã NV..."
              value={roleSearchTerm}
              onChange={(e) => setRoleSearchTerm(e.target.value)}
              disabled={isPastOrToday}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                background: c.bgElev,
                border: `1px solid ${c.border}`,
                color: c.fg,
                fontSize: 12,
              }}
            />
          </div>

          {/* Danh sách nhân viên để chọn */}
          <div style={{ marginBottom: 18 }}>
            <FormField label={`Chọn Nhân Viên (${eligibleEmployees.length} khả dụng):`}>
              <div
                style={{
                  maxHeight: 240,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  paddingRight: 4,
                }}
              >
                {eligibleEmployees.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: c.fgFaint, fontSize: 12 }}>
                    Không có nhân sự nào phù hợp vị trí này. Hãy bật &quot;Hiện tất cả nhân viên khác&quot; để gán kiêm nhiệm.
                  </div>
                ) : (
                  eligibleEmployees.map((emp) => {
                    const isSelected = String(selectedUserId) === String(emp.userId);
                    // Kiểm tra xem nhân viên đã có ca làm nào trong ngày này chưa
                    const assignedShiftOnDate = (emp.assignedShifts || []).find(
                      (s) => s.date === workDate
                    );
                    const isConflict = Boolean(assignedShiftOnDate);

                    // Kiểm tra điều chuyển nhân sự
                    const targetDateStr = String(workDate || '').substring(0, 10);
                    const dStart = String(emp.dispatchStartDate || '').substring(0, 10);
                    const dEnd = String(emp.dispatchEndDate || '').substring(0, 10);
                    const dAwayStart = String(emp.dispatchAwayStartDate || '').substring(0, 10);
                    const dAwayEnd = String(emp.dispatchAwayEndDate || '').substring(0, 10);

                    const isNotYetDispatched = Boolean(emp.isDispatched && dStart && targetDateStr < dStart);
                    const isDispatchExpired = Boolean(emp.isDispatched && dEnd && targetDateStr > dEnd);
                    const isDispatchedValid = Boolean(emp.isDispatched && (!dStart || targetDateStr >= dStart) && (!dEnd || targetDateStr <= dEnd));
                    const isDispatchedAwayOnDate = Boolean(emp.isDispatchedAway && dAwayStart && dAwayEnd &&
                      targetDateStr >= dAwayStart && targetDateStr <= dAwayEnd);

                    const restViolation = checkRest12hViolation(
                      workDate,
                      shiftTemplate,
                      emp.assignedShifts || []
                    );

                    const isDisabled = isConflict || isPastOrToday || isNotYetDispatched || isDispatchExpired || isDispatchedAwayOnDate || restViolation.violated;

                    return (
                      <label
                        key={emp.userId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: 8,
                          background: isSelected
                            ? `${c.accentDim}30`
                            : isDisabled
                            ? `${c.bgElev}40`
                            : c.bgElev,
                          border: `1px solid ${isSelected ? c.accent : isDisabled ? c.borderSub : c.border}`,
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          opacity: isDisabled ? 0.65 : 1,
                          transition: 'all 0.15s ease',
                        }}
                        title={restViolation.violated ? restViolation.message : undefined}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input
                            type="radio"
                            name="userSelect"
                            value={emp.userId}
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={() => setSelectedUserId(emp.userId)}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 750, color: isSelected ? c.accent : c.fg, fontSize: 13 }}>
                              <span>{emp.fullName}</span>
                              {isDispatchedValid && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    padding: '1px 6px',
                                    borderRadius: 4,
                                    background: 'rgba(2, 132, 199, 0.15)',
                                    color: '#0284c7',
                                    fontWeight: 700,
                                  }}
                                  title={`Điều chuyển từ ${emp.originBranchName || 'cơ sở gốc'} (${formatVNDate(emp.dispatchStartDate)} - ${formatVNDate(emp.dispatchEndDate)})`}
                                >
                                  ĐIỀU CHUYỂN
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: c.fgFaint }}>
                              {emp.employeeCode} • {emp.roleName || emp.roleCode}
                              {emp.originBranchName && ` • Từ ${emp.originBranchName}`}
                            </div>
                          </div>
                        </div>

                        {/* Trạng thái ngày của nhân viên */}
                        <div>
                          {isNotYetDispatched ? (
                            <span
                              style={{
                                fontSize: 10,
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: 'rgba(217, 119, 6, 0.15)',
                                color: '#d97706',
                                fontWeight: 700,
                              }}
                            >
                              Chỉ xếp từ {formatVNDate(emp.dispatchStartDate)}
                            </span>
                          ) : isDispatchExpired ? (
                            <span
                              style={{
                                fontSize: 10,
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: `${c.tones.bad}20`,
                                color: c.tones.bad,
                                fontWeight: 700,
                              }}
                            >
                              Hết hạn ĐC ({formatVNDate(emp.dispatchEndDate)})
                            </span>
                          ) : isDispatchedAwayOnDate ? (
                            <span
                              style={{
                                fontSize: 10,
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: `${c.tones.bad}20`,
                                color: c.tones.bad,
                                fontWeight: 700,
                              }}
                            >
                              Đã điều chuyển sang {emp.destinationBranchName || 'CS khác'}
                            </span>
                          ) : isConflict ? (
                            <span
                              style={{
                                fontSize: 10,
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: `${c.tones.bad}20`,
                                color: c.tones.bad,
                                fontWeight: 700,
                              }}
                            >
                              Đã có ca: {assignedShiftOnDate.shiftName}
                            </span>
                          ) : restViolation.violated ? (
                            <span
                              style={{
                                fontSize: 10,
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: `${c.tones.bad}20`,
                                color: c.tones.bad,
                                fontWeight: 700,
                              }}
                              title={restViolation.message}
                            >
                              Nghỉ &lt; 12h
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: 10,
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: `${c.tones.good}20`,
                                color: c.tones.good,
                                fontWeight: 700,
                              }}
                            >
                              Trống lịch
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </FormField>
          </div>

          {/* Nút hành động */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button variant="ghost" onClick={onClose} type="button" disabled={actionLoading}>
              Hủy
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={actionLoading || !selectedUserId || isPastOrToday}
            >
              {actionLoading ? 'Đang phân bổ...' : 'Xác Nhận Phân Bổ'}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  // =========================================================================
  // GIAO DIỆN MODE 2: GÁN / ĐỔI CA CHO NHÂN VIÊN CỤ THỂ (BY_EMPLOYEE)
  // =========================================================================
  if (!user || !workDate) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentAssignment ? 'Điều Chỉnh / Hủy Phân Công Ca' : 'Phân Công Ca Làm Việc'}
    >
      <form onSubmit={handleEmployeeSubmit}>
        {isPastOrToday && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 6,
              background: c.tones.badDim,
              border: `1px solid ${c.tones.bad}`,
              color: c.tones.bad,
              fontSize: 12.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 14,
            }}
          >
            <Icon name="alertTriangle" size={16} color={c.tones.bad} />
            <span>Ngày {formatVNDate(workDate)} là ngày hôm nay hoặc ngày đã qua. Hệ thống khóa không cho phép chỉnh sửa hoặc hủy ca.</span>
          </div>
        )}

        {isUserNotYetDispatched && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 6,
              background: 'rgba(217, 119, 6, 0.15)',
              border: '1px solid #d97706',
              color: '#d97706',
              fontSize: 12.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 14,
            }}
          >
            <Icon name="alertTriangle" size={16} color="#d97706" />
            <span>Nhân sự '{user.fullName}' được điều chuyển từ ngày {formatVNDate(user.dispatchStartDate)} đến {formatVNDate(user.dispatchEndDate)}. Chỉ có thể xếp ca từ ngày {formatVNDate(user.dispatchStartDate)} trở đi!</span>
          </div>
        )}

        {isUserDispatchExpired && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 6,
              background: `${c.tones.bad}15`,
              border: `1px solid ${c.tones.bad}`,
              color: c.tones.bad,
              fontSize: 12.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 14,
            }}
          >
            <Icon name="alertTriangle" size={16} color={c.tones.bad} />
            <span>Lệnh điều chuyển của nhân sự '{user.fullName}' tại chi nhánh này đã kết thúc vào ngày {formatVNDate(user.dispatchEndDate)}. Không thể xếp ca vào ngày {formatVNDate(workDate)} do đã quá hạn điều chuyển!</span>
          </div>
        )}

        {isUserDispatchedAway && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 6,
              background: `${c.tones.bad}15`,
              border: `1px solid ${c.tones.bad}`,
              color: c.tones.bad,
              fontSize: 12.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 14,
            }}
          >
            <Icon name="alertTriangle" size={16} color={c.tones.bad} />
            <span>Nhân sự '{user.fullName}' đang được điều chuyển sang '{user.destinationBranchName || 'cơ sở khác'}' từ ngày {formatVNDate(user.dispatchAwayStartDate)} đến {formatVNDate(user.dispatchAwayEndDate)}. Không thể xếp ca tại cơ sở gốc trong thời gian này!</span>
          </div>
        )}

        {/* Thông tin nhân viên & ngày */}
        <div
          style={{
            background: c.bgElev,
            border: `1px solid ${c.border}`,
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: c.fg }}>{user.fullName}</div>
            <div style={{ fontSize: 12, color: c.fgFaint }}>
              Mã NV: {user.employeeCode} • Vị trí: {user.roleName || user.roleCode}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: c.accent }}>
              Ngày {formatVNDate(workDate)}
            </div>
            <div style={{ fontSize: 11, color: c.fgFaint }}>{workDate}</div>
          </div>
        </div>

        {/* Trạng thái ca hiện tại (nếu có) */}
        {currentAssignment && (
          <div
            style={{
              background: `${c.tones.good}15`,
              border: `1px solid ${c.tones.good}`,
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: c.fgFaint }}>Ca hiện tại đang gán:</div>
              <div style={{ fontWeight: 800, color: c.tones.good, fontSize: 13 }}>
                {currentAssignment.shiftName} ({currentAssignment.startTime?.substring(0, 5)} - {currentAssignment.endTime?.substring(0, 5)})
              </div>
            </div>
            <Button variant="danger" type="button" onClick={handleDelete} disabled={actionLoading || isPastOrToday}>
              Hủy Ca Này
            </Button>
          </div>
        )}

        {/* Lựa chọn ca muốn gán / đổi */}
        <div style={{ marginBottom: 20 }}>
          <FormField label="Chọn Ca Làm Việc Mới:">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeTemplates.map((t) => {
                const tId = t.shiftId || t.id;
                const isSelected = String(selectedShiftId) === String(tId);

                // Kiểm tra nghỉ 12h với các ca khác của nhân viên này
                const otherShifts = (user?.assignedShifts || []).filter(
                  (s) => s.date !== workDate || (currentAssignment && s.assignmentId !== currentAssignment.assignmentId)
                );
                const restViolation = checkRest12hViolation(workDate, t, otherShifts);

                const isShiftDisabled = isMode2Blocked || restViolation.violated;

                return (
                  <label
                    key={tId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: isSelected ? `${c.accentDim}30` : isShiftDisabled ? `${c.bgElev}40` : c.bgElev,
                      border: `1px solid ${isSelected ? c.accent : isShiftDisabled ? c.borderSub : c.border}`,
                      cursor: isShiftDisabled ? 'not-allowed' : 'pointer',
                      opacity: isShiftDisabled ? 0.65 : 1,
                      transition: 'all 0.15s ease',
                    }}
                    title={restViolation.violated ? restViolation.message : undefined}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="radio"
                        name="shiftSelect"
                        value={tId}
                        checked={isSelected}
                        disabled={isShiftDisabled}
                        onChange={() => setSelectedShiftId(tId)}
                      />
                      <span style={{ fontWeight: 750, color: isSelected ? c.accent : c.fg, fontSize: 13 }}>
                        {formatShiftTemplateName(t.shiftName || t.name)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {restViolation.violated && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: `${c.tones.bad}20`,
                            color: c.tones.bad,
                            fontWeight: 700,
                          }}
                        >
                          Nghỉ &lt; 12h
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: c.fgFaint }}>
                        {t.startTime?.substring(0, 5)} - {t.endTime?.substring(0, 5)}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </FormField>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="ghost" onClick={onClose} type="button" disabled={actionLoading}>
            Đóng
          </Button>
          <Button variant="primary" type="submit" disabled={actionLoading || isMode2Blocked || !selectedShiftId}>
            {actionLoading ? 'Đang lưu...' : currentAssignment ? 'Cập Nhật Ca' : 'Xác Nhận Gán Ca'}
          </Button>
        </div>
      </form>

      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Xác Nhận Hủy Ca Trực"
        message={`Bạn có chắc chắn muốn hủy ca '${currentAssignment?.shiftName}' ngày ${formatVNDate(workDate)} của ${user?.fullName}?`}
        confirmText="Hủy Phân Công Ca"
        cancelText="Giữ Lại"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </Modal>
  );
}
