import { useState } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Icon from '@/shared/components/ui/Icon';
import Badge from '@/shared/components/ui/Badge';
import ConfirmModal from '@/shared/components/ui/ConfirmModal';
import { DAY_NAMES_VN, formatVNDate } from '../hooks/useWeeklySchedule';

// Cấu hình hiển thị chuẩn cho 4 ca 6 tiếng bao phủ 24/7 của chuỗi cửa hàng tiện lợi
const STANDARD_SHIFTS_CONFIG = [
  {
    code: 'CA_01',
    id: 1,
    name: 'Ca 1 - Sáng',
    time: '06:00 - 12:00',
    duration: '6 tiếng',
    icon: 'clock',
    color: '#0284c7', // Sky Blue
    bg: 'rgba(2, 132, 199, 0.08)',
    border: 'rgba(2, 132, 199, 0.35)',
  },
  {
    code: 'CA_02',
    id: 2,
    name: 'Ca 2 - Chiều',
    time: '12:00 - 18:00',
    duration: '6 tiếng',
    icon: 'clock',
    color: '#d97706', // Amber / Orange
    bg: 'rgba(217, 119, 6, 0.08)',
    border: 'rgba(217, 119, 6, 0.35)',
  },
  {
    code: 'CA_03',
    id: 3,
    name: 'Ca 3 - Tối',
    time: '18:00 - 00:00',
    duration: '6 tiếng',
    icon: 'clock',
    color: '#7c3aed', // Purple / Violet
    bg: 'rgba(124, 58, 237, 0.08)',
    border: 'rgba(124, 58, 237, 0.35)',
  },
  {
    code: 'CA_04',
    id: 4,
    name: 'Ca 4 - Đêm',
    time: '00:00 - 06:00',
    duration: '6 tiếng',
    icon: 'clock',
    color: '#2563eb', // Indigo / Dark Blue
    bg: 'rgba(37, 99, 235, 0.08)',
    border: 'rgba(37, 99, 235, 0.35)',
  },
];

export default function WeeklyRosterMatrix({
  days = [],
  schedules = [],
  templates = [],
  employees = [],
  allEmployees = [],
  loading = false,
  onCellClick,
  onDeleteAssignment,
  onEditScheduleQuota,
  isPublished = false,
}) {
  const { c, fonts } = useAdminTheme();
  // Tab chế độ xem: 'BY_SHIFT' (mặc định - Lưới 4 Ca) hoặc 'BY_EMPLOYEE' (Theo nhân sự)
  const [viewMode, setViewMode] = useState('BY_SHIFT');
  const [confirmDeleteState, setConfirmDeleteState] = useState(null);

  const requestDelete = (assignmentId, message) => {
    setConfirmDeleteState({ assignmentId, message });
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: c.fgFaint }}>
        <div
          style={{
            display: 'inline-block',
            width: 32,
            height: 32,
            border: `3px solid ${c.border}`,
            borderTopColor: c.accent,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <div style={{ marginTop: 12, fontSize: 13 }}>Đang tải ma trận sắp xếp lịch ca tuần...</div>
      </div>
    );
  }

  // Kết hợp danh sách 4 ca chuẩn từ cấu hình hoặc templates từ backend
  const displayShifts = STANDARD_SHIFTS_CONFIG.map((cfg) => {
    const matchedTmpl = templates.find(
      (t) =>
        (t.templateCode && t.templateCode.toUpperCase() === cfg.code) ||
        (t.id && Number(t.id) === cfg.id) ||
        (t.shiftId && Number(t.shiftId) === cfg.id)
    );
    return {
      ...cfg,
      id: matchedTmpl ? matchedTmpl.id || matchedTmpl.shiftId : cfg.id,
      name: matchedTmpl ? matchedTmpl.name : cfg.name,
      startTime: matchedTmpl ? matchedTmpl.startTime : cfg.time.split(' - ')[0],
      endTime: matchedTmpl ? matchedTmpl.endTime : cfg.time.split(' - ')[1],
    };
  });

  return (
    <div
      style={{
        background: c.bgCard,
        border: `1px solid ${c.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      }}
    >
      {/* Thanh công cụ chuyển đổi chế độ xem (View Mode Bar) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderBottom: `1px solid ${c.borderSub}`,
          background: c.bgElev,
        }}
      >
        {/* Tiêu đề & chú thích */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: c.accent, display: 'flex' }}>
            <Icon name="grid" size={20} />
          </span>
          <span style={{ fontWeight: 800, fontSize: 14.5, color: c.fg, fontFamily: fonts.display }}>
            Bảng Sắp Xếp Lịch Làm Việc Tuần
          </span>
          <span style={{ fontSize: 12, color: c.fgFaint }}>
            (Chuỗi Cửa Hàng Tiện Lợi 24/7 • 4 Ca × 6 Tiếng)
          </span>
        </div>

        {/* Nút chuyển chế độ xem */}
        <div
          style={{
            display: 'flex',
            background: c.track || 'rgba(0,0,0,0.06)',
            padding: 3,
            borderRadius: 8,
            gap: 4,
          }}
        >
          <button
            onClick={() => setViewMode('BY_SHIFT')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              background: viewMode === 'BY_SHIFT' ? c.bgCard : 'transparent',
              color: viewMode === 'BY_SHIFT' ? c.accent : c.fgFaint,
              fontWeight: viewMode === 'BY_SHIFT' ? 750 : 500,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: viewMode === 'BY_SHIFT' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🏢</span>
            <span>4 Hàng Ca Chuẩn (Khuyên Dùng)</span>
          </button>

          <button
            onClick={() => setViewMode('BY_EMPLOYEE')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              background: viewMode === 'BY_EMPLOYEE' ? c.bgCard : 'transparent',
              color: viewMode === 'BY_EMPLOYEE' ? c.accent : c.fgFaint,
              fontWeight: viewMode === 'BY_EMPLOYEE' ? 750 : 500,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: viewMode === 'BY_EMPLOYEE' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Icon name="users" size={14} />
            <span>Xem Theo Nhân Sự ({employees.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CHẾ ĐỘ 1: BẢNG 4 HÀNG NGANG TƯƠNG ỨNG 4 CA TRỰC CHUẨN X 7 CỘT NGÀY */}
      {/* ========================================================================= */}
      {viewMode === 'BY_SHIFT' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1200 }}>
            <thead>
              <tr style={{ background: c.bgRaised, borderBottom: `2px solid ${c.border}` }}>
                {/* Cột tiêu đề Ca làm việc */}
                <th
                  style={{
                    padding: '14px 16px',
                    width: 220,
                    minWidth: 220,
                    textAlign: 'left',
                    color: c.fg,
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    position: 'sticky',
                    left: 0,
                    background: c.bgRaised,
                    zIndex: 2,
                    borderRight: `2px solid ${c.border}`,
                  }}
                >
                  Ca Trực (4 Ca Chuẩn)
                </th>

                {/* 7 cột cho 7 ngày trong tuần */}
                {days.map((dateStr, idx) => (
                  <th
                    key={dateStr}
                    style={{
                      padding: '12px 10px',
                      textAlign: 'center',
                      borderLeft: `1px solid ${c.borderSub}`,
                      color: c.fg,
                      minWidth: 165,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{DAY_NAMES_VN[idx]}</div>
                    <div style={{ fontSize: 11.5, color: c.accent, marginTop: 2, fontWeight: 600 }}>
                      {formatVNDate(dateStr)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {displayShifts.map((shift, sIdx) => (
                <tr
                  key={shift.code}
                  style={{
                    borderBottom: sIdx < displayShifts.length - 1 ? `2px solid ${c.border}` : 'none',
                    background: sIdx % 2 === 0 ? 'transparent' : `${c.bgElev}30`,
                  }}
                >
                  {/* Cột thông tin Ca trực (Cố định bên trái) */}
                  <td
                    style={{
                      padding: '16px 14px',
                      verticalAlign: 'top',
                      borderRight: `2px solid ${c.border}`,
                      position: 'sticky',
                      left: 0,
                      background: c.bgCard,
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        background: shift.bg,
                        border: `1px solid ${shift.border}`,
                        borderRadius: 8,
                        padding: '10px 12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Icon name="clock" size={16} color={shift.color} />
                        <span style={{ fontWeight: 800, fontSize: 13.5, color: shift.color }}>
                          {shift.name}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: `${shift.color}20`,
                          color: shift.color,
                          fontWeight: 700,
                          fontSize: 11,
                          fontFamily: 'monospace',
                          marginBottom: 6,
                        }}
                      >
                        {shift.time}
                      </div>

                      <div style={{ fontSize: 11, color: c.fgFaint }}>
                        Thời lượng: <strong>{shift.duration}</strong>
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          paddingTop: 8,
                          borderTop: `1px dashed ${shift.border}`,
                          fontSize: 10.5,
                          color: c.fgSubtle,
                          lineHeight: 1.4,
                        }}
                      >
                        <div>• Trưởng ca (≥1)</div>
                        <div>• Thu ngân (≥1)</div>
                        <div>• Bán hàng (≥1)</div>
                        <div>• Bảo vệ (≥1)</div>
                      </div>
                    </div>
                  </td>

                  {/* 7 ô giao điểm Ca x Ngày */}
                  {days.map((dateStr) => {
                    const schedule = schedules.find(
                      (s) =>
                        s.workDate === dateStr &&
                        ((s.shiftTemplateId && Number(s.shiftTemplateId) === Number(shift.id)) ||
                          (s.shiftTemplateName && s.shiftTemplateName.includes(shift.name.split(' - ')[0])))
                    );

                    // Danh sách nhân viên trong ca
                    const assignedEmployees = schedule?.assignedEmployees || [];
                    const leaders = assignedEmployees.filter(
                      (e) => e.roleCode === 'SHIFT_LEADER' || e.roleCode === 'LEADER'
                    );
                    const cashiers = assignedEmployees.filter((e) => e.roleCode === 'CASHIER');
                    const sales = assignedEmployees.filter(
                      (e) => e.roleCode === 'SALES' || e.roleCode === 'SALES_STAFF'
                    );
                    const security = assignedEmployees.filter(
                      (e) => e.roleCode === 'SECURITY' || e.roleCode === 'SECURITY_GUARD'
                    );

                    // Quota
                    const reqLeader = 1;
                    const reqCashier = schedule ? schedule.requiredCashier : 1;
                    const reqSales = schedule ? schedule.requiredSales : 1;
                    const reqSecurity = schedule ? schedule.requiredSecurity : 1;

                    const isLeaderOk = leaders.length >= reqLeader;
                    const isCashierOk = cashiers.length >= reqCashier;
                    const isSalesOk = sales.length >= reqSales;
                    const isSecurityOk = security.length >= reqSecurity;

                    const isAllFilled = isLeaderOk && isCashierOk && isSalesOk && isSecurityOk;
                    const totalAssigned = assignedEmployees.length;
                    const totalRequired = reqLeader + reqCashier + reqSales + reqSecurity;

                    return (
                      <td
                        key={dateStr}
                        style={{
                          padding: '10px 8px',
                          borderLeft: `1px solid ${c.borderSub}`,
                          verticalAlign: 'top',
                          minHeight: 220,
                        }}
                      >
                        {!schedule ? (
                          // Nếu ca này chưa được sinh trong database
                          <div
                            style={{
                              height: '100%',
                              minHeight: 180,
                              background: `${c.bgElev}50`,
                              border: `1px dashed ${c.borderSub}`,
                              borderRadius: 8,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 12,
                              textAlign: 'center',
                            }}
                          >
                            <span style={{ fontSize: 11, color: c.fgFaint, marginBottom: 8 }}>
                              Chưa có khung ca
                            </span>
                            <button
                              onClick={() =>
                                onEditScheduleQuota &&
                                onEditScheduleQuota({
                                  shiftTemplateId: shift.id,
                                  shiftTemplateName: shift.name,
                                  workDate: dateStr,
                                  requiredCashier: 1,
                                  requiredSales: 1,
                                  requiredSecurity: 1,
                                })
                              }
                              style={{
                                padding: '4px 10px',
                                borderRadius: 6,
                                background: c.bgElev,
                                border: `1px solid ${c.border}`,
                                color: c.accent,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              + Khởi tạo ca
                            </button>
                          </div>
                        ) : (
                          // Thẻ ca làm việc với 4 vị trí trực quan
                          <div
                            style={{
                              background: isAllFilled ? `${c.tones.good}08` : `${c.tones.bad}06`,
                              border: `1px solid ${isAllFilled ? `${c.tones.good}40` : `${c.tones.bad}40`}`,
                              borderRadius: 8,
                              padding: '8px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 8,
                            }}
                          >
                            {/* Tiêu đề ô: Trạng thái Đủ / Thiếu & Nút chỉnh định mức */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingBottom: 6,
                                borderBottom: `1px solid ${c.borderSub}`,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: 800,
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  background: isAllFilled ? `${c.tones.good}20` : `${c.tones.bad}20`,
                                  color: isAllFilled ? c.tones.good : c.tones.bad,
                                }}
                              >
                                {isAllFilled
                                  ? `ĐỦ (${totalAssigned}/${totalRequired})`
                                  : `THIẾU (${totalAssigned}/${totalRequired})`}
                              </span>

                              <button
                                onClick={() => onEditScheduleQuota && onEditScheduleQuota(schedule)}
                                title="Điều chỉnh định mức ca này"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: c.fgFaint,
                                  cursor: 'pointer',
                                  padding: '2px',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <Icon name="edit" size={13} />
                              </button>
                            </div>

                            {/* 4 Khối Vị Trí Nghiệp Vụ Bắt Buộc */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {/* 1. TRƯỞNG CA (SHIFT LEADER) */}
                              <RoleSlotSection
                                iconName="shield"
                                title="Trưởng ca"
                                currentCount={leaders.length}
                                requiredCount={reqLeader}
                                employees={leaders}
                                isOk={isLeaderOk}
                                onAddClick={() =>
                                  onCellClick &&
                                  onCellClick({
                                    mode: 'ASSIGN_ROLE_TO_SHIFT',
                                    schedule,
                                    shiftTemplate: shift,
                                    workDate: dateStr,
                                    targetRole: 'SHIFT_LEADER',
                                    targetRoleLabel: 'Trưởng Ca Trực (Shift Leader)',
                                    allEmployees,
                                  })
                                }
                                onDeleteClick={requestDelete}
                                c={c}
                              />

                              {/* 2. THU NGÂN (CASHIER) */}
                              <RoleSlotSection
                                iconName="pulse"
                                title="Thu ngân"
                                currentCount={cashiers.length}
                                requiredCount={reqCashier}
                                employees={cashiers}
                                isOk={isCashierOk}
                                onAddClick={() =>
                                  onCellClick &&
                                  onCellClick({
                                    mode: 'ASSIGN_ROLE_TO_SHIFT',
                                    schedule,
                                    shiftTemplate: shift,
                                    workDate: dateStr,
                                    targetRole: 'CASHIER',
                                    targetRoleLabel: 'Thu Ngân (Cashier)',
                                    allEmployees,
                                  })
                                }
                                onDeleteClick={requestDelete}
                                c={c}
                              />

                              {/* 3. NHÂN VIÊN BÁN HÀNG (SALES STAFF) */}
                              <RoleSlotSection
                                iconName="users"
                                title="Bán hàng"
                                currentCount={sales.length}
                                requiredCount={reqSales}
                                employees={sales}
                                isOk={isSalesOk}
                                onAddClick={() =>
                                  onCellClick &&
                                  onCellClick({
                                    mode: 'ASSIGN_ROLE_TO_SHIFT',
                                    schedule,
                                    shiftTemplate: shift,
                                    workDate: dateStr,
                                    targetRole: 'SALES_STAFF',
                                    targetRoleLabel: 'Nhân Viên Bán Hàng (Sales Staff)',
                                    allEmployees,
                                  })
                                }
                                onDeleteClick={requestDelete}
                                c={c}
                              />

                              {/* 4. BẢO VỆ (SECURITY GUARD) */}
                              <RoleSlotSection
                                iconName="lock"
                                title="Bảo vệ"
                                currentCount={security.length}
                                requiredCount={reqSecurity}
                                employees={security}
                                isOk={isSecurityOk}
                                onAddClick={() =>
                                  onCellClick &&
                                  onCellClick({
                                    mode: 'ASSIGN_ROLE_TO_SHIFT',
                                    schedule,
                                    shiftTemplate: shift,
                                    workDate: dateStr,
                                    targetRole: 'SECURITY_GUARD',
                                    targetRoleLabel: 'Bảo Vệ (Security Guard)',
                                    allEmployees,
                                  })
                                }
                                onDeleteClick={requestDelete}
                                c={c}
                              />
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHẾ ĐỘ 2: BẢNG ROSTER THEO TỪNG NHÂN SỰ CHI NHÁNH */}
      {/* ========================================================================= */}
      {viewMode === 'BY_EMPLOYEE' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 950 }}>
            <thead>
              <tr style={{ background: c.bgRaised, borderBottom: `2px solid ${c.border}` }}>
                <th
                  style={{
                    padding: '14px 16px',
                    width: 240,
                    color: c.fg,
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Nhân Sự Chi Nhánh
                </th>

                {days.map((dateStr, idx) => (
                  <th
                    key={dateStr}
                    style={{
                      padding: '12px 10px',
                      textAlign: 'center',
                      borderLeft: `1px solid ${c.borderSub}`,
                      color: c.fg,
                    }}
                  >
                    <div style={{ fontSize: 12.5, fontWeight: 800 }}>{DAY_NAMES_VN[idx]}</div>
                    <div style={{ fontSize: 11, color: c.accent, marginTop: 2 }}>
                      {formatVNDate(dateStr)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{ padding: '40px 0', textAlign: 'center', color: c.fgFaint }}
                  >
                    Không có nhân sự phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                employees.map((emp, empIdx) => {
                  const assignedShiftsMap = new Map();
                  (emp.assignedShifts || []).forEach((cell) => {
                    assignedShiftsMap.set(cell.date, cell);
                  });

                  const totalShiftsInWeek = emp.assignedShifts ? emp.assignedShifts.length : 0;

                  return (
                    <tr
                      key={emp.userId}
                      style={{
                        borderBottom: `1px solid ${c.borderSub}`,
                        background: empIdx % 2 === 0 ? 'transparent' : `${c.bgElev}50`,
                      }}
                    >
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: c.accentDim,
                              color: c.accent,
                              display: 'grid',
                              placeItems: 'center',
                              fontWeight: 800,
                              fontSize: 14,
                              flexShrink: 0,
                              border: `1px solid ${c.accent}`,
                            }}
                          >
                            {emp.fullName ? emp.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 750,
                                fontSize: 13,
                                color: c.fg,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {emp.fullName}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                              <span style={{ fontSize: 11, color: c.fgFaint, fontFamily: 'monospace' }}>
                                {emp.employeeCode}
                              </span>
                              <span
                                style={{
                                  fontSize: 10,
                                  padding: '1px 6px',
                                  borderRadius: 4,
                                  background: c.track,
                                  color: c.fgSubtle,
                                  fontWeight: 600,
                                }}
                              >
                                {emp.roleName || emp.roleCode}
                              </span>
                              <span style={{ fontSize: 10, color: c.accent, fontWeight: 700 }}>
                                ({totalShiftsInWeek} ca)
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {days.map((dateStr) => {
                        const assignment = assignedShiftsMap.get(dateStr);

                        return (
                          <td
                            key={dateStr}
                            style={{
                              padding: '8px',
                              borderLeft: `1px solid ${c.borderSub}`,
                              verticalAlign: 'middle',
                              textAlign: 'center',
                              height: 60,
                            }}
                          >
                            {assignment ? (
                              <div
                                style={{
                                  background: `${c.accentDim}30`,
                                  border: `1px solid ${c.accent}`,
                                  color: c.accent,
                                  borderRadius: 6,
                                  padding: '6px 8px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 2,
                                  position: 'relative',
                                  fontSize: 11,
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                }}
                                onClick={() =>
                                  onCellClick &&
                                  onCellClick({
                                    mode: 'BY_EMPLOYEE',
                                    user: emp,
                                    date: dateStr,
                                    currentAssignment: assignment,
                                  })
                                }
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                  }}
                                >
                                  <span style={{ fontWeight: 800 }}>{assignment.shiftName}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      requestDelete(
                                        assignment.assignmentId,
                                        `Bạn có chắc muốn hủy ca '${assignment.shiftName}' ngày ${formatVNDate(
                                          dateStr
                                        )} của NV ${emp.fullName}?`
                                      );
                                    }}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: c.tones.bad,
                                      cursor: 'pointer',
                                      padding: 0,
                                      fontSize: 14,
                                      fontWeight: 800,
                                      lineHeight: 1,
                                    }}
                                    title="Hủy ca trực"
                                  >
                                    ×
                                  </button>
                                </div>
                                <div style={{ fontSize: 9.5, opacity: 0.85 }}>
                                  {assignment.startTime ? assignment.startTime.substring(0, 5) : ''} -{' '}
                                  {assignment.endTime ? assignment.endTime.substring(0, 5) : ''}
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  onCellClick &&
                                  onCellClick({
                                    mode: 'BY_EMPLOYEE',
                                    user: emp,
                                    date: dateStr,
                                    currentAssignment: null,
                                  })
                                }
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  minHeight: 38,
                                  background: 'transparent',
                                  border: `1px dashed ${c.borderSub}`,
                                  borderRadius: 6,
                                  color: c.fgFaint,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease',
                                }}
                                title={`Gán ca cho ${emp.fullName} ngày ${formatVNDate(dateStr)}`}
                              >
                                <span style={{ fontSize: 16, fontWeight: 700 }}>+</span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal xác nhận hủy ca */}
      <ConfirmModal
        isOpen={Boolean(confirmDeleteState)}
        onClose={() => setConfirmDeleteState(null)}
        onConfirm={() => {
          if (confirmDeleteState?.assignmentId) {
            onDeleteAssignment && onDeleteAssignment(confirmDeleteState.assignmentId);
          }
          setConfirmDeleteState(null);
        }}
        title="Xác Nhận Hủy Phân Công Ca"
        message={confirmDeleteState?.message}
        confirmText="Hủy Phân Công Ca"
        cancelText="Giữ Lại"
        confirmVariant="danger"
      />
    </div>
  );
}

/**
 * Component con hiển thị 1 khối vị trí nghiệp vụ (Trưởng ca / Thu ngân / Bán hàng / Bảo vệ)
 */
function RoleSlotSection({
  iconName,
  title,
  currentCount,
  requiredCount,
  employees = [],
  isOk,
  onAddClick,
  onDeleteClick,
  c,
}) {
  return (
    <div
      style={{
        background: c.bgCard,
        border: `1px solid ${isOk ? c.borderSub : `${c.tones.bad}40`}`,
        borderRadius: 6,
        padding: '5px 7px',
      }}
    >
      {/* Tiêu đề vị trí + Số lượng */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 10.5,
          fontWeight: 700,
          marginBottom: 4,
          color: isOk ? c.fgSubtle : c.tones.bad,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name={iconName || 'dot'} size={12} color={isOk ? c.fgSubtle : c.tones.bad} />
          <span>{title}</span>
        </span>
        <span style={{ fontFamily: 'monospace' }}>
          {currentCount}/{requiredCount}
        </span>
      </div>

      {/* Danh sách chip nhân viên đã gán */}
      {employees.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 4 }}>
          {employees.map((emp) => (
            <div
              key={emp.assignmentId || emp.userId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: c.bgElev,
                border: `1px solid ${c.border}`,
                borderRadius: 4,
                padding: '2px 5px',
                fontSize: 10.5,
              }}
            >
              <div
                style={{
                  fontWeight: 650,
                  color: c.fg,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 110,
                }}
                title={`${emp.fullName} (${emp.employeeCode})`}
              >
                {emp.fullName}
              </div>

              {/* Nút hủy phân công ca của nhân viên */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick &&
                    onDeleteClick(
                      emp.assignmentId,
                      `Bạn có chắc chắn muốn hủy phân công của nhân viên '${emp.fullName}' khỏi ca này?`
                    );
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: c.tones.bad,
                  cursor: 'pointer',
                  padding: 0,
                  marginLeft: 4,
                  fontSize: 13,
                  fontWeight: 800,
                  lineHeight: 1,
                }}
                title="Gỡ khỏi ca trực"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Nút gán slot còn thiếu */}
      {!isOk && (
        <button
          onClick={onAddClick}
          style={{
            width: '100%',
            padding: '3px 0',
            background: 'transparent',
            border: `1px dashed ${c.tones.bad}80`,
            borderRadius: 4,
            color: c.tones.bad,
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${c.tones.bad}15`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <span>+</span>
          <span>Gán {title}</span>
        </button>
      )}
    </div>
  );
}
