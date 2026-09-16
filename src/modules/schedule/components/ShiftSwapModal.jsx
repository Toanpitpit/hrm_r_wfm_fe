import { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import FormField from '@/shared/components/ui/FormField';
import Icon from '@/shared/components/ui/Icon';
import { formatShiftTemplateName } from '../hooks/useWeeklySchedule';
import { getColleaguesForSwap, getColleagueShifts, createSwapRequest } from '../services/schedule.service';

export default function ShiftSwapModal({
  isOpen,
  onClose,
  shift,
  onSuccess,
}) {
  const { c } = useAdminTheme();

  const [requestType, setRequestType] = useState('TRANSFER'); // 'TRANSFER' or 'SWAP'
  const [colleagues, setColleagues] = useState([]);
  const [selectedColleagueId, setSelectedColleagueId] = useState('');
  const [colleagueShifts, setColleagueShifts] = useState([]);
  const [selectedTargetAssignmentId, setSelectedTargetAssignmentId] = useState('');
  const [reason, setReason] = useState('');

  const [loadingColleagues, setLoadingColleagues] = useState(false);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load colleagues when modal opens
  useEffect(() => {
    if (isOpen && shift) {
      setError(null);
      setSelectedColleagueId('');
      setSelectedTargetAssignmentId('');
      setReason('');
      setColleagueShifts([]);

      const branchId = shift.branchId || 1;
      setLoadingColleagues(true);
      getColleaguesForSwap(branchId)
        .then((res) => {
          if (res?.success && res.data) {
            setColleagues(res.data);
          } else {
            setColleagues([]);
          }
        })
        .catch((err) => {
          console.error('Error fetching colleagues:', err);
          setError('Không thể tải danh sách đồng nghiệp cùng chi nhánh.');
        })
        .finally(() => setLoadingColleagues(false));
    }
  }, [isOpen, shift]);

  // Load shifts of selected colleague when in SWAP mode
  useEffect(() => {
    if (requestType === 'SWAP' && selectedColleagueId) {
      setLoadingShifts(true);
      setSelectedTargetAssignmentId('');
      getColleagueShifts(selectedColleagueId)
        .then((res) => {
          if (res?.success && res.data) {
            setColleagueShifts(res.data);
          } else {
            setColleagueShifts([]);
          }
        })
        .catch((err) => {
          console.error('Error fetching colleague shifts:', err);
          setColleagueShifts([]);
        })
        .finally(() => setLoadingShifts(false));
    } else {
      setColleagueShifts([]);
      setSelectedTargetAssignmentId('');
    }
  }, [requestType, selectedColleagueId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedColleagueId) {
      setError('Vui lòng chọn đồng nghiệp nhận hoặc đổi ca.');
      return;
    }

    if (requestType === 'SWAP' && !selectedTargetAssignmentId) {
      setError('Vui lòng chọn ca làm việc của đồng nghiệp muốn đổi.');
      return;
    }

    if (!reason.trim()) {
      setError('Vui lòng nhập lý do xin đổi / chuyển ca.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        requestType,
        assignmentId: shift.assignmentId,
        targetEmployeeId: parseInt(selectedColleagueId, 10),
        targetAssignmentId: requestType === 'SWAP' ? parseInt(selectedTargetAssignmentId, 10) : null,
        reason: reason.trim(),
      };

      const res = await createSwapRequest(payload);
      if (res?.success) {
        if (onSuccess) onSuccess(res.message || 'Gửi đơn thành công, chờ Quản lý phê duyệt.');
        onClose();
      } else {
        setError(res?.message || 'Không thể gửi đơn đổi/chuyển ca.');
      }
    } catch (err) {
      console.error('Error submitting swap request:', err);
      const msg = err.response?.data?.message || err.message || 'Lỗi khi gửi đơn xin đổi/chuyển ca.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !shift) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đơn Xin Chuyển / Đổi Ca Trực"
      sub="Yêu cầu cần được Quản lý cửa hàng phê duyệt trước khi cập nhật vào lịch làm việc chính thức."
      width={560}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
          <Button variant="ghost" kind="ghost" onClick={onClose} disabled={submitting}>
            Hủy Bỏ
          </Button>
          <Button variant="primary" kind="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Đang Gửi Đơn...' : 'Gửi Đơn Lên Quản Lý'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Thông tin ca hiện tại của bạn */}
        <div
          style={{
            background: c.bgElev,
            border: `1px solid ${c.border}`,
            borderRadius: 8,
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: c.accent, textTransform: 'uppercase' }}>
            Ca Làm Việc Của Bạn Cần Đổi / Chuyển
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 750, color: c.fg }}>
              {formatShiftTemplateName(shift.shiftName)}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: c.accent, fontFamily: 'monospace' }}>
              {shift.startTime?.substring(0, 5)} - {shift.endTime?.substring(0, 5)}
            </span>
          </div>
          <div style={{ fontSize: 12, color: c.fgSubtle, display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="calendar" size={13} color={c.fgSubtle} />
              Ngày: <strong>{shift.date} ({shift.dayOfWeek || ''})</strong>
            </span>
            {shift.branchName && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="pin" size={13} color={c.fgSubtle} />
                Chi nhánh: <strong>{shift.branchName}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Lựa chọn hình thức: Chuyển ca hay Đổi ca */}
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: c.fg, marginBottom: 8, display: 'block' }}>
            Hình Thức Yêu Cầu
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div
              onClick={() => setRequestType('TRANSFER')}
              style={{
                cursor: 'pointer',
                border: `2px solid ${requestType === 'TRANSFER' ? c.accent : c.border}`,
                background: requestType === 'TRANSFER' ? `${c.accent}15` : c.bgCard,
                borderRadius: 8,
                padding: '10px 14px',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontWeight: 750, fontSize: 13, color: requestType === 'TRANSFER' ? c.accent : c.fg, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="arrowRight" size={15} color={requestType === 'TRANSFER' ? c.accent : c.fg} />
                <span>Chuyển Ca (Nhờ làm thay)</span>
              </div>
              <div style={{ fontSize: 11, color: c.fgSubtle, marginTop: 4 }}>
                Bạn bận không đi làm được, nhờ đồng nghiệp đi làm thay bạn.
              </div>
            </div>

            <div
              onClick={() => setRequestType('SWAP')}
              style={{
                cursor: 'pointer',
                border: `2px solid ${requestType === 'SWAP' ? c.accent : c.border}`,
                background: requestType === 'SWAP' ? `${c.accent}15` : c.bgCard,
                borderRadius: 8,
                padding: '10px 14px',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontWeight: 750, fontSize: 13, color: requestType === 'SWAP' ? c.accent : c.fg, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="swap" size={15} color={requestType === 'SWAP' ? c.accent : c.fg} />
                <span>Đổi Ca Trực (Tráo đổi)</span>
              </div>
              <div style={{ fontSize: 11, color: c.fgSubtle, marginTop: 4 }}>
                Bạn và đồng nghiệp tráo đổi 2 ca trực khác nhau trong tuần.
              </div>
            </div>
          </div>
        </div>

        {/* Chọn đồng nghiệp */}
        <FormField label="Chọn Đồng Nghiệp Cùng Chi Nhánh" required>
          {loadingColleagues ? (
            <div style={{ fontSize: 12, color: c.fgSubtle, padding: '8px 0' }}>Đang tải danh sách đồng nghiệp...</div>
          ) : (
            <select
              value={selectedColleagueId}
              onChange={(e) => setSelectedColleagueId(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 6,
                border: `1px solid ${c.border}`,
                background: c.bgCard,
                color: c.fg,
                fontSize: 13,
                outline: 'none',
              }}
            >
              <option value="">-- Chọn nhân viên nhận hoặc đổi ca --</option>
              {colleagues.map((colleague) => (
                <option key={colleague.employeeId} value={colleague.employeeId}>
                  {colleague.fullName} ({colleague.roleName || 'Nhân viên'}) - {colleague.phoneNumber || 'Không có SĐT'}
                </option>
              ))}
            </select>
          )}
        </FormField>

        {/* Nếu là SWAP: Chọn ca của đồng nghiệp muốn đổi */}
        {requestType === 'SWAP' && selectedColleagueId && (
          <FormField label="Chọn Ca Làm Việc Của Đồng Nghiệp Để Đổi Lại" required>
            {loadingShifts ? (
              <div style={{ fontSize: 12, color: c.fgSubtle, padding: '8px 0' }}>Đang tải lịch của đồng nghiệp...</div>
            ) : colleagueShifts.length === 0 ? (
              <div style={{ fontSize: 12, color: c.tones?.bad || '#ef4444', padding: '6px 0' }}>
                Đồng nghiệp này hiện không có ca làm việc nào sắp tới để đổi. Vui lòng chọn hình thức "Chuyển Ca" hoặc chọn đồng nghiệp khác.
              </div>
            ) : (
              <select
                value={selectedTargetAssignmentId}
                onChange={(e) => setSelectedTargetAssignmentId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: `1px solid ${c.border}`,
                  background: c.bgCard,
                  color: c.fg,
                  fontSize: 13,
                  outline: 'none',
                }}
              >
                <option value="">-- Chọn ca của đồng nghiệp --</option>
                {colleagueShifts.map((cs) => (
                  <option key={cs.assignmentId} value={cs.assignmentId}>
                    {cs.workDate}: {formatShiftTemplateName(cs.shiftName)} ({cs.timeRange})
                  </option>
                ))}
              </select>
            )}
          </FormField>
        )}

        {/* Lý do xin chuyển / đổi ca */}
        <FormField label="Lý Do Xin Chuyển / Đổi Ca" required>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do chi tiết (VD: Bận việc gia đình, trùng lịch thi, ốm đột xuất...)"
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 6,
              border: `1px solid ${c.border}`,
              background: c.bgCard,
              color: c.fg,
              fontSize: 13,
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </FormField>

        {/* Thông báo lỗi nếu có */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 6,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              fontSize: 12.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon name="alertTriangle" size={15} color="#fca5a5" />
            <span>{error}</span>
          </div>
        )}
      </form>
    </Modal>
  );
}
