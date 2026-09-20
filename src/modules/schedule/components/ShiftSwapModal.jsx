import { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { useToast } from '@/components/ui/toast/ToastProvider';
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
  const toast = useToast();

  const [requestType, setRequestType] = useState('LEAVE'); // 'LEAVE' or 'SWAP'
  const [colleagues, setColleagues] = useState([]);
  const [selectedColleagueId, setSelectedColleagueId] = useState('');
  const [colleagueShifts, setColleagueShifts] = useState([]);
  const [selectedTargetAssignmentId, setSelectedTargetAssignmentId] = useState('');
  const [reason, setReason] = useState('');

  const [loadingColleagues, setLoadingColleagues] = useState(false);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load colleagues when modal opens
  useEffect(() => {
    if (isOpen && shift) {
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
          toast.error('Không thể tải danh sách đồng nghiệp cùng chi nhánh.');
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

    if (requestType === 'LEAVE') {
      if (!reason.trim()) {
        toast.error('Vui lòng nhập lý do xin nghỉ ca trực để Quản lý xem xét.');
        return;
      }
    } else if (requestType === 'SWAP') {
      if (!selectedColleagueId) {
        toast.error('Vui lòng chọn đồng nghiệp muốn đổi ca.');
        return;
      }
      if (!selectedTargetAssignmentId) {
        toast.error('Vui lòng chọn ca làm việc của đồng nghiệp muốn đổi.');
        return;
      }
    }

    try {
      setSubmitting(true);

      const payload = {
        requestType,
        assignmentId: shift.assignmentId,
        targetEmployeeId: requestType === 'SWAP' && selectedColleagueId ? parseInt(selectedColleagueId, 10) : null,
        targetAssignmentId: requestType === 'SWAP' && selectedTargetAssignmentId ? parseInt(selectedTargetAssignmentId, 10) : null,
        reason: reason.trim(),
      };

      const res = await createSwapRequest(payload);
      if (res?.success) {
        toast.success(res.message || 'Gửi đơn thành công, chờ Quản lý phê duyệt.');
        if (onSuccess) onSuccess(res.message || 'Gửi đơn thành công, chờ Quản lý phê duyệt.');
        onClose();
      } else {
        toast.error(res?.message || 'Không thể gửi đơn.');
      }
    } catch (err) {
      console.error('Error submitting swap request:', err);
      const msg = err.response?.data?.message || err.message || 'Lỗi khi gửi đơn.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !shift) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đơn Xin Nghỉ / Đổi Ca Trực"
      sub="Yêu cầu cần được Quản lý cửa hàng phê duyệt trước khi cập nhật vào lịch làm việc chính thức."
      width={560}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
          <Button variant="ghost" kind="ghost" onClick={onClose} disabled={submitting}>
            Hủy Bỏ
          </Button>
          <Button variant="primary" kind="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Đang Gửi...' : 'Gửi Đơn Cho Quản Lý'}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Thông tin ca trực hiện tại */}
        <div
          style={{
            background: `${c.accentDim}25`,
            border: `1px solid ${c.accent}`,
            borderRadius: 8,
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: 11, color: c.fgFaint, textTransform: 'uppercase', fontWeight: 700 }}>
            Ca Làm Việc Hiện Tại Của Bạn
          </div>
          <div style={{ fontWeight: 800, fontSize: 15, color: c.fg, marginTop: 2, marginBottom: 4 }}>
            {formatShiftTemplateName(shift.shiftTemplateName || shift.shiftName || 'Ca Trực')} ({shift.startTime?.substring(0, 5)} - {shift.endTime?.substring(0, 5)})
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

        {/* Lựa chọn hình thức: Xin nghỉ ca hay Đổi ca */}
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: c.fg, marginBottom: 8, display: 'block' }}>
            Hình Thức Yêu Cầu (*)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div
              onClick={() => setRequestType('LEAVE')}
              style={{
                cursor: 'pointer',
                border: `2px solid ${requestType === 'LEAVE' ? c.accent : c.border}`,
                background: requestType === 'LEAVE' ? c.accentDim : c.bgCard,
                borderRadius: 8,
                padding: '10px 14px',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontWeight: 750, fontSize: 13, color: requestType === 'LEAVE' ? c.accent : c.fg, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="calendar" size={15} color={requestType === 'LEAVE' ? c.accent : c.fg} />
                <span>1. Xin Nghỉ Ca</span>
              </div>
              <div style={{ fontSize: 11, color: c.fgSubtle, marginTop: 4, lineHeight: 1.4 }}>
                Có việc bận đột xuất. Quản lý duyệt sẽ hủy ca và tự xếp người khác thay thế.
              </div>
            </div>

            <div
              onClick={() => setRequestType('SWAP')}
              style={{
                cursor: 'pointer',
                border: `2px solid ${requestType === 'SWAP' ? c.accent : c.border}`,
                background: requestType === 'SWAP' ? c.accentDim : c.bgCard,
                borderRadius: 8,
                padding: '10px 14px',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontWeight: 750, fontSize: 13, color: requestType === 'SWAP' ? c.accent : c.fg, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="swap" size={15} color={requestType === 'SWAP' ? c.accent : c.fg} />
                <span>2. Đổi Ca Trực</span>
              </div>
              <div style={{ fontSize: 11, color: c.fgSubtle, marginTop: 4, lineHeight: 1.4 }}>
                Đã đồng ý đổi ca cho nhau. Quản lý duyệt sẽ tự động hoán đổi 2 ca.
              </div>
            </div>
          </div>
        </div>

        {/* Nội dung form theo hình thức */}
        {requestType === 'LEAVE' ? (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 6,
              background: `${c.accentDim}30`,
              border: `1px solid ${c.accent}`,
              fontSize: 12,
              color: c.fg,
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon name="info" size={16} color={c.accent} style={{ flexShrink: 0 }} />
            <span>
              Cửa hàng trưởng sẽ xem xét lý do xin nghỉ và chủ động sắp xếp nhân sự khác vào vị trí trống này.
            </span>
          </div>
        ) : (
          <>
            {/* Chọn đồng nghiệp */}
            <FormField label="Chọn Đồng Nghiệp Đổi Ca (Chỉ cùng vai trò/vị trí)" required>
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
                  <option value="">
                    {Array.isArray(colleagues) && colleagues.length === 0
                      ? '-- Không tìm thấy đồng nghiệp cùng vai trò --'
                      : '-- Chọn nhân viên cùng vai trò để đổi ca --'}
                  </option>
                  {colleagues.map((colleague) => (
                    <option key={colleague.employeeId} value={colleague.employeeId}>
                      {colleague.fullName} ({colleague.roleName}) - NV{colleague.employeeId}
                    </option>
                  ))}
                </select>
              )}
            </FormField>

            {/* Chọn ca của đồng nghiệp muốn đổi */}
            <FormField label="Chọn Ca Làm Việc Của Đồng Nghiệp Bạn Nhận Làm Bù" required>
              {loadingShifts ? (
                <div style={{ fontSize: 12, color: c.fgSubtle, padding: '8px 0' }}>Đang tải lịch của đồng nghiệp...</div>
              ) : (
                <select
                  value={selectedTargetAssignmentId}
                  onChange={(e) => setSelectedTargetAssignmentId(e.target.value)}
                  disabled={!selectedColleagueId || colleagueShifts.length === 0}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 6,
                    border: `1px solid ${c.border}`,
                    background: !selectedColleagueId || colleagueShifts.length === 0 ? c.bgElev : c.bgCard,
                    color: c.fg,
                    fontSize: 13,
                    outline: 'none',
                  }}
                >
                  <option value="">
                    {!selectedColleagueId
                      ? '-- Vui lòng chọn đồng nghiệp trước --'
                      : colleagueShifts.length === 0
                      ? '-- Đồng nghiệp không có ca trực nào sắp tới để đổi --'
                      : '-- Chọn ca của đồng nghiệp --'}
                  </option>
                  {colleagueShifts.map((cs) => (
                    <option key={cs.assignmentId} value={cs.assignmentId}>
                      {cs.workDate}: {formatShiftTemplateName(cs.shiftName)} ({cs.timeRange})
                    </option>
                  ))}
                </select>
              )}
            </FormField>
          </>
        )}

        {/* Lý do xin nghỉ / đổi ca */}
        <FormField label={requestType === 'LEAVE' ? 'Lý Do Xin Nghỉ Ca (*)' : 'Lý Do Đổi Ca (*)'} required>
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
      </div>
    </Modal>
  );
}
