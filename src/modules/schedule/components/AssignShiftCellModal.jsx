import { useState, useEffect, useMemo } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import ConfirmModal from '@/shared/components/ui/ConfirmModal';
import Button from '@/shared/components/ui/Button';
import FormField from '@/shared/components/ui/FormField';
import Icon from '@/shared/components/ui/Icon';
import { formatVNDate } from '../hooks/useWeeklySchedule';

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
      } else if (templates.length > 0) {
        setSelectedShiftId(templates[0].shiftId || templates[0].id);
      }
    }
  }, [isRoleMode, cellData, currentAssignment, templates]);

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

  const todayStr = new Date().toISOString().split('T')[0];
  const isPastDate = Boolean(workDate && workDate < todayStr);

  // Submit cho Mode 1 (Gán nhân viên vào ca theo vị trí)
  const handleRoleSubmit = (e) => {
    e.preventDefault();
    if (isPastDate) return;
    if (!selectedUserId || !shiftTemplate || !workDate) return;

    const shiftId = shiftTemplate.id || shiftTemplate.shiftId;
    onAssignSingle(selectedUserId, shiftId, workDate);
  };

  // Submit cho Mode 2 (Gán ca cho nhân viên cụ thể)
  const handleEmployeeSubmit = (e) => {
    e.preventDefault();
    if (isPastDate) return;
    if (!selectedShiftId || !user || !workDate) return;

    onAssignSingle(user.userId, selectedShiftId, workDate);
  };

  const handleDelete = () => {
    if (!currentAssignment || isPastDate) return;
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
          {isPastDate && (
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
              <span>Ca làm việc thuộc ngày quá khứ ({formatVNDate(workDate)}). Hệ thống khóa phân công lịch ca đã qua.</span>
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
              disabled={isPastDate}
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
                            : isConflict
                            ? `${c.bgElev}40`
                            : c.bgElev,
                          border: `1px solid ${isSelected ? c.accent : isConflict ? c.borderSub : c.border}`,
                          cursor: isConflict || isPastDate ? 'not-allowed' : 'pointer',
                          opacity: isConflict || isPastDate ? 0.65 : 1,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input
                            type="radio"
                            name="userSelect"
                            value={emp.userId}
                            checked={isSelected}
                            disabled={isConflict || isPastDate}
                            onChange={() => setSelectedUserId(emp.userId)}
                          />
                          <div>
                            <div style={{ fontWeight: 750, color: isSelected ? c.accent : c.fg, fontSize: 13 }}>
                              {emp.fullName}
                            </div>
                            <div style={{ fontSize: 11, color: c.fgFaint }}>
                              {emp.employeeCode} • {emp.roleName || emp.roleCode}
                            </div>
                          </div>
                        </div>

                        {/* Trạng thái ngày của nhân viên */}
                        <div>
                          {isConflict ? (
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
              disabled={actionLoading || !selectedUserId || isPastDate}
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
        {isPastDate && (
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
            <span>Ca làm việc này thuộc ngày trong quá khứ ({formatVNDate(workDate)}). Hệ thống khóa không cho phép chỉnh sửa hoặc hủy ca đã trôi qua.</span>
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
            <Button variant="danger" type="button" onClick={handleDelete} disabled={actionLoading || isPastDate}>
              Hủy Ca Này
            </Button>
          </div>
        )}

        {/* Lựa chọn ca muốn gán / đổi */}
        <div style={{ marginBottom: 20 }}>
          <FormField label="Chọn Ca Làm Việc Mới:">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {templates.map((t) => {
                const tId = t.shiftId || t.id;
                const isSelected = String(selectedShiftId) === String(tId);

                return (
                  <label
                    key={tId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: isSelected ? `${c.accentDim}30` : c.bgElev,
                      border: `1px solid ${isSelected ? c.accent : c.border}`,
                      cursor: isPastDate ? 'not-allowed' : 'pointer',
                      opacity: isPastDate ? 0.65 : 1,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="radio"
                        name="shiftSelect"
                        value={tId}
                        checked={isSelected}
                        disabled={isPastDate}
                        onChange={() => setSelectedShiftId(tId)}
                      />
                      <span style={{ fontWeight: 750, color: isSelected ? c.accent : c.fg, fontSize: 13 }}>
                        {t.shiftName || t.name}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: c.fgFaint }}>
                      {t.startTime?.substring(0, 5)} - {t.endTime?.substring(0, 5)}
                    </span>
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
          <Button variant="primary" type="submit" disabled={actionLoading || isPastDate}>
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
