import { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
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

  const user = cellData?.user;
  const workDate = cellData?.date;
  const currentAssignment = cellData?.currentAssignment;

  const [selectedShiftId, setSelectedShiftId] = useState('');

  useEffect(() => {
    if (currentAssignment) {
      setSelectedShiftId(currentAssignment.shiftTemplateId || '');
    } else if (templates.length > 0) {
      setSelectedShiftId(templates[0].shiftId || templates[0].id);
    }
  }, [currentAssignment, templates]);

  if (!user || !workDate) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedShiftId) return;

    onAssignSingle(user.userId, selectedShiftId, workDate);
  };

  const handleDelete = () => {
    if (!currentAssignment) return;
    if (window.confirm(`Bạn có chắc chắn muốn hủy ca '${currentAssignment.shiftName}' ngày ${formatVNDate(workDate)} của ${user.fullName}?`)) {
      onDeleteAssignment(currentAssignment.assignmentId);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentAssignment ? 'Điều Chỉnh / Hủy Phân Công Ca' : 'Phân Công Ca Làm Việc'}
    >
      <form onSubmit={handleSubmit}>
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
            <Button variant="danger" type="button" onClick={handleDelete} disabled={actionLoading}>
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
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="radio"
                        name="shiftSelect"
                        value={tId}
                        checked={isSelected}
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
          <Button variant="primary" type="submit" disabled={actionLoading}>
            {actionLoading ? 'Đang lưu...' : currentAssignment ? 'Cập Nhật Ca' : 'Xác Nhận Gán Ca'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
