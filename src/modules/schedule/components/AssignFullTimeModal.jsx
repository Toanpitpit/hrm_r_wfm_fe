import { useState } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { useToast } from '@/components/ui/toast/ToastProvider';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import FormField from '@/shared/components/ui/FormField';
import Select from '@/shared/components/ui/Select';
import Icon from '@/shared/components/ui/Icon';
import { DAY_NAMES_VN } from '../hooks/useWeeklySchedule';

export default function AssignFullTimeModal({
  isOpen,
  onClose,
  employees = [],
  templates = [],
  onAssignBatch,
  actionLoading = false,
}) {
  const { c, fonts } = useAdminTheme();
  const toast = useToast();

  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    templates.length > 0 ? (templates[0].shiftId || templates[0].id) : ''
  );
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5, 6]); // Mặc định Thứ 2 -> Thứ 7

  const toggleUserId = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === employees.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(employees.map((e) => e.userId));
    }
  };

  const toggleDay = (dayNum) => {
    setSelectedDays((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum].sort()
    );
  };

  const [formError, setFormError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (selectedUserIds.length === 0) {
      const msg = 'Vui lòng chọn ít nhất 1 nhân viên.';
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (!selectedTemplateId) {
      const msg = 'Vui lòng chọn khung ca.';
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (selectedDays.length === 0) {
      const msg = 'Vui lòng chọn ít nhất 1 ngày trong tuần.';
      setFormError(msg);
      toast.error(msg);
      return;
    }

    onAssignBatch({
      userIds: selectedUserIds,
      shiftTemplateId: selectedTemplateId,
      daysOfWeek: selectedDays,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gán Nhanh Nhân Sự Full-Time Vào Ca Tuần (UC 2.1)"
    >
      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: `${c.accentDim}20`,
            border: `1px solid ${c.accent}`,
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 12.5,
            color: c.fg,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Icon name="info" size={18} style={{ color: c.accent, flexShrink: 0 }} />
          <span>
            Tính năng phân bổ lịch cố định hàng tuần cho nhân viên Full-time. Hệ thống sẽ <strong>tự động chặn gán trùng</strong> nếu nhân viên đã có lịch trực khác trong ngày.
          </span>
        </div>

        {formError && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: `${c.tones.bad}15`,
              border: `1px solid ${c.tones.bad}`,
              color: c.tones.bad,
              fontSize: 12.5,
              fontWeight: 600,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon name="alertTriangle" size={16} style={{ color: c.tones.bad, flexShrink: 0 }} />
            <span>{formError}</span>
          </div>
        )}

        {/* Chọn khung ca */}
        <div style={{ marginBottom: 16 }}>
          <FormField label="1. Chọn Khung Ca Làm Việc:">
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                background: c.bgElev,
                border: `1px solid ${c.border}`,
                color: c.fg,
                fontSize: 13,
                fontWeight: 600,
              }}
              required
            >
              {templates.map((t) => (
                <option key={t.shiftId || t.id} value={t.shiftId || t.id}>
                  {t.shiftName || t.name} ({t.startTime?.substring(0, 5)} - {t.endTime?.substring(0, 5)})
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Chọn các ngày áp dụng */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: c.fg, marginBottom: 8 }}>
            2. Chọn Các Ngày Trong Tuần:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DAY_NAMES_VN.map((dayName, index) => {
              const dayNum = index + 1; // 1: T2, ..., 7: CN
              const isChecked = selectedDays.includes(dayNum);
              return (
                <button
                  type="button"
                  key={dayNum}
                  onClick={() => toggleDay(dayNum)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: `1px solid ${isChecked ? c.accent : c.border}`,
                    background: isChecked ? c.accent : c.bgElev,
                    color: isChecked ? c.ink : c.fg,
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {dayName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chọn danh sách nhân viên */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: c.fg }}>
              3. Chọn Danh Sách Nhân Sự ({selectedUserIds.length}/{employees.length} đã chọn):
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              style={{ background: 'transparent', border: 'none', color: c.accent, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              {selectedUserIds.length === employees.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>

          <div
            style={{
              maxHeight: 180,
              overflowY: 'auto',
              border: `1px solid ${c.border}`,
              borderRadius: 8,
              background: c.bgElev,
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {employees.map((emp) => {
              const isChecked = selectedUserIds.includes(emp.userId);
              return (
                <label
                  key={emp.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: isChecked ? `${c.accentDim}30` : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleUserId(emp.userId)}
                    />
                    <span style={{ fontWeight: 700, fontSize: 13, color: c.fg }}>
                      {emp.fullName}
                    </span>
                    <span style={{ fontSize: 11, color: c.fgFaint, fontFamily: 'monospace' }}>
                      ({emp.employeeCode})
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 10.5,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: c.track,
                      color: c.fgSubtle,
                    }}
                  >
                    {emp.roleName || emp.roleCode}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <Button variant="ghost" onClick={onClose} type="button" disabled={actionLoading}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={actionLoading}>
            {actionLoading ? 'Đang phân bổ...' : `Gán Cho ${selectedUserIds.length} Nhân Viên`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
