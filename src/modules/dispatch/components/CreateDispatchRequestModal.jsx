import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { Modal, Button, Select } from '@/shared/components/ui';
import dispatchService from '../services/dispatch.service';

/**
 * Modal: Tạo & Chỉnh sửa yêu cầu điều động nhân sự liên chi nhánh.
 * Hỗ trợ 2 luồng nghiệp vụ rõ ràng:
 *  1. Xin Chi Viện: Mượn nhân sự từ chi nhánh khác về cơ sở mình (Mặc định).
 *  2. Cử Đi Chi Viện: Chủ động cử nhân sự của cơ sở mình sang hỗ trợ chi nhánh khác.
 */
export default function CreateDispatchRequestModal({
  open,
  onClose,
  onSuccess,
  currentStoreId,
  currentStoreName,
  editItem = null,
  initialMode = 'BORROW', // 'BORROW' | 'SEND'
}) {
  const { c, fonts } = useAdminTheme();

  // Mode: 'BORROW' (Xin chi viện về mình) | 'SEND' (Cử nhân sự mình đi)
  const [mode, setMode] = useState(initialMode);

  // Form states
  const [partnerStoreId, setPartnerStoreId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Data lists
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);

  // UI status
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Khi mở modal: nạp dữ liệu chỉnh sửa hoặc khởi tạo form
  useEffect(() => {
    if (open) {
      setErrorMessage('');

      if (editItem) {
        const isBorrowMode = Number(editItem.toStoreId) === Number(currentStoreId);
        setMode(isBorrowMode ? 'BORROW' : 'SEND');
        setPartnerStoreId(String(isBorrowMode ? editItem.fromStoreId : editItem.toStoreId));
        setEmployeeId(String(editItem.employeeId || ''));
        setStartDate(editItem.startDate || todayStr);
        setEndDate(editItem.endDate || todayStr);
        setReason(editItem.reason || '');
      } else {
        setMode(initialMode || 'BORROW');
        setPartnerStoreId('');
        setEmployeeId('');
        setStartDate(todayStr);
        setEndDate(todayStr);
        setReason('');
        setEmployees([]);
      }

      // Tải danh mục các chi nhánh khác
      const loadBranches = async () => {
        setLoadingBranches(true);
        try {
          const list = await dispatchService.getActiveBranches();
          const targetStoreId = Number(currentStoreId);
          const filtered = list.filter((b) => Number(b.id || b.branchId) !== targetStoreId);
          setBranches(filtered);
        } catch (err) {
          console.error('Lỗi khi tải chi nhánh:', err);
        } finally {
          setLoadingBranches(false);
        }
      };
      loadBranches();
    }
  }, [open, editItem, initialMode, currentStoreId, todayStr]);

  // Tải danh sách nhân sự tùy theo chiều điều động:
  // - BORROW: Nhân sự thuộc chi nhánh đối tác (partnerStoreId)
  // - SEND: Nhân sự thuộc chi nhánh hiện tại của mình (currentStoreId)
  useEffect(() => {
    const branchToQuery = mode === 'BORROW' ? partnerStoreId : currentStoreId;

    if (!branchToQuery) {
      setEmployees([]);
      if (!editItem) setEmployeeId('');
      return;
    }

    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const list = await dispatchService.getEmployeesByBranch(branchToQuery);
        setEmployees(list);
        if (editItem && String(editItem.employeeId)) {
          setEmployeeId(String(editItem.employeeId));
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách nhân sự:', err);
      } finally {
        setLoadingEmployees(false);
      }
    };
    loadEmployees();
  }, [mode, partnerStoreId, currentStoreId, editItem]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage('');

    if (!partnerStoreId) {
      setErrorMessage(
        mode === 'BORROW'
          ? 'Vui lòng chọn cơ sở / chi nhánh bạn muốn xin hỗ trợ chi viện.'
          : 'Vui lòng chọn cơ sở / chi nhánh bạn muốn cử nhân sự sang chi viện.'
      );
      return;
    }
    if (!employeeId) {
      setErrorMessage('Vui lòng chọn nhân sự điều động.');
      return;
    }
    if (!startDate || !endDate) {
      setErrorMessage('Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc.');
      return;
    }
    if (startDate > endDate) {
      setErrorMessage('Ngày kết thúc không được nhỏ hơn ngày bắt đầu.');
      return;
    }
    if (startDate < todayStr && !editItem) {
      setErrorMessage('Thời gian điều động không thể trong quá khứ.');
      return;
    }

    setSubmitting(true);
    try {
      // Xác định nguồn (from) và đích (to) theo Mode:
      // BORROW: from = partner (bên cho mượn), to = current (bên nhận về)
      // SEND:   from = current (bên cử đi), to = partner (bên nhận)
      const fromStoreId = mode === 'BORROW' ? Number(partnerStoreId) : Number(currentStoreId);
      const toStoreId = mode === 'BORROW' ? Number(currentStoreId) : Number(partnerStoreId);

      const payload = {
        employeeId: Number(employeeId),
        fromStoreId,
        toStoreId,
        startDate,
        endDate,
        reason: reason.trim() || (mode === 'BORROW' ? 'Đề nghị xin mượn nhân sự hỗ trợ ca trực' : 'Cử nhân sự đi chi viện cơ sở đối tác'),
      };

      let result;
      if (editItem) {
        result = await dispatchService.updateDispatchRequest(editItem.dispatchId, payload);
      } else {
        result = await dispatchService.createDispatchRequest(payload);
      }

      if (result.success) {
        if (onSuccess) onSuccess(result.data, Boolean(editItem));
        onClose();
      } else {
        setErrorMessage(result.message || 'Không thể lưu yêu cầu điều động.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu điều động.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const partnerBranchOptions = [
    {
      value: '',
      label: loadingBranches
        ? 'Đang tải danh sách cơ sở...'
        : mode === 'BORROW'
        ? '-- Chọn cơ sở bạn muốn xin mượn quân --'
        : '-- Chọn cơ sở bạn muốn cử nhân sự sang --',
    },
    ...branches.map((b) => ({
      value: String(b.id || b.branchId),
      label: `${b.name || b.branchName} (${b.code || b.branchCode || 'Chi nhánh'})`,
    })),
  ];

  const employeeOptions = [
    {
      value: '',
      label: loadingEmployees
        ? 'Đang tải danh sách nhân sự...'
        : mode === 'BORROW' && !partnerStoreId
        ? '-- Vui lòng chọn cơ sở hỗ trợ trước --'
        : '-- Chọn nhân sự điều động --',
    },
    ...employees.map((emp) => ({
      value: String(emp.id || emp.userId),
      label: `${emp.fullName} - ${emp.employeeCode || ''} (${emp.positionName || emp.roleName || 'Nhân viên'})`,
    })),
  ];

  const selectedPartnerBranch = branches.find((b) => String(b.id || b.branchId) === String(partnerStoreId));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        editItem
          ? 'Chỉnh Sửa Yêu Cầu Điều Động Nhân Sự'
          : mode === 'BORROW'
          ? 'Xin Chi Viện Nhân Sự Từ Cơ Sở Khác'
          : 'Cử Nhân Sự Đi Chi Viện Cơ Sở Khác'
      }
      sub={
        editItem
          ? `Cập nhật thông tin phiếu điều động đang chờ duyệt (#${editItem.dispatchId})`
          : mode === 'BORROW'
          ? `Gửi phiếu đề nghị mượn nhân sự từ chi nhánh đối tác về cơ sở "${currentStoreName}"`
          : `Lập lệnh cử nhân sự thuộc cơ sở "${currentStoreName}" sang hỗ trợ chi nhánh đối tác`
      }
      width={640}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
          <Button kind="ghost" onClick={onClose} disabled={submitting}>
            Hủy Bỏ
          </Button>
          <Button kind="primary" onClick={handleSubmit} disabled={submitting || loadingBranches}>
            {submitting
              ? 'Đang Lưu...'
              : editItem
              ? 'Lưu Thay Đổi'
              : mode === 'BORROW'
              ? 'Gửi Đề Nghị Xin Chi Viện'
              : 'Gửi Lệnh Cử Đi Chi Viện'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Nút chuyển đổi luồng điều động (Khi tạo mới) */}
        {!editItem && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              background: c.bgRaised,
              padding: 4,
              borderRadius: 8,
              border: `1px solid ${c.border}`,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('BORROW');
                setPartnerStoreId('');
                setEmployeeId('');
                setErrorMessage('');
              }}
              style={{
                padding: '9px 12px',
                borderRadius: 6,
                border: 'none',
                background: mode === 'BORROW' ? c.accent : 'transparent',
                color: mode === 'BORROW' ? c.ink : c.fgMuted,
                fontWeight: mode === 'BORROW' ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <span>📥</span> Xin Chi Viện (Mượn về cơ sở mình)
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('SEND');
                setPartnerStoreId('');
                setEmployeeId('');
                setErrorMessage('');
              }}
              style={{
                padding: '9px 12px',
                borderRadius: 6,
                border: 'none',
                background: mode === 'SEND' ? c.accent : 'transparent',
                color: mode === 'SEND' ? c.ink : c.fgMuted,
                fontWeight: mode === 'SEND' ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <span>📤</span> Cử Đi Chi Viện (Cử người mình đi)
            </button>
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#f87171',
              padding: '10px 14px',
              borderRadius: 6,
              fontSize: 13,
              lineHeight: 1.4,
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Khối hiển thị chi nhánh của bạn */}
        <div
          style={{
            background: c.bgElev,
            border: `1px solid ${c.borderSub}`,
            padding: '12px 14px',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: c.fgFaint, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {mode === 'BORROW' ? 'Cơ sở tiếp nhận (Chi nhánh cần hỗ trợ)' : 'Cơ sở xuất phát (Chi nhánh cử người đi)'}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: c.accent, marginTop: 2 }}>
              {currentStoreName || 'Chi nhánh của bạn'}
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              padding: '3px 8px',
              background: mode === 'BORROW' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(242, 202, 80, 0.15)',
              color: mode === 'BORROW' ? '#34d399' : c.accent,
              borderRadius: 4,
              fontWeight: 600,
            }}
          >
            {mode === 'BORROW' ? 'Đơn vị xin mượn quân' : 'Đơn vị cử quân đi'}
          </span>
        </div>

        {/* Chọn cơ sở đối tác */}
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: c.fgSubtle, marginBottom: 6 }}>
            {mode === 'BORROW' ? 'Cơ sở hỗ trợ chi viện (Mượn từ đâu?)' : 'Cơ sở tiếp nhận (Cần cử người sang đâu?)'}{' '}
            <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <Select
            value={partnerStoreId}
            onChange={(val) => setPartnerStoreId(val)}
            options={partnerBranchOptions}
            width="100%"
            disabled={loadingBranches || submitting}
          />
        </div>

        {/* Chọn nhân sự điều động */}
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: c.fgSubtle, marginBottom: 6 }}>
            {mode === 'BORROW' ? (
              <>
                Nhân sự đề xuất xin mượn{' '}
                {selectedPartnerBranch && (
                  <span style={{ color: c.accent, textTransform: 'none', fontWeight: 500 }}>
                    (Thuộc biên chế: {selectedPartnerBranch.name || selectedPartnerBranch.branchName})
                  </span>
                )}
              </>
            ) : (
              'Nhân sự thuộc cơ sở mình cử đi chi viện'
            )}{' '}
            <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <Select
            value={employeeId}
            onChange={(val) => setEmployeeId(val)}
            options={employeeOptions}
            width="100%"
            disabled={(mode === 'BORROW' && !partnerStoreId) || loadingEmployees || submitting}
          />
          {mode === 'BORROW' && partnerStoreId && employees.length === 0 && !loadingEmployees && (
            <p style={{ fontSize: 12, color: c.fgFaint, marginTop: 4 }}>
              Cơ sở hỗ trợ này hiện chưa có nhân sự trực thuộc khả dụng.
            </p>
          )}
        </div>

        {/* Khoảng thời gian điều động */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: c.fgSubtle, marginBottom: 6 }}>
              Ngày bắt đầu <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="date"
              value={startDate}
              min={editItem ? undefined : todayStr}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={submitting}
              style={{
                width: '100%',
                background: c.bgRaised,
                border: `1px solid ${c.border}`,
                borderRadius: 6,
                color: c.fg,
                fontSize: 13.5,
                fontFamily: fonts.body,
                padding: '9px 12px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: c.fgSubtle, marginBottom: 6 }}>
              Ngày kết thúc <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || todayStr}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={submitting}
              style={{
                width: '100%',
                background: c.bgRaised,
                border: `1px solid ${c.border}`,
                borderRadius: 6,
                color: c.fg,
                fontSize: 13.5,
                fontFamily: fonts.body,
                padding: '9px 12px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Lý do / Nội dung chi viện */}
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: c.fgSubtle, marginBottom: 6 }}>
            Lý do / Công việc cần tăng cường
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              mode === 'BORROW'
                ? 'Ví dụ: Cơ sở đang thiếu hụt vị trí Thu ngân dịp cuối tuần, xin hỗ trợ 1 nhân sự tăng cường...'
                : 'Ví dụ: Cử nhân sự sang hỗ trợ chi nhánh đối tác theo kế hoạch điều phối...'
            }
            disabled={submitting}
            style={{
              width: '100%',
              background: c.bgRaised,
              border: `1px solid ${c.border}`,
              borderRadius: 6,
              color: c.fg,
              fontSize: 13,
              fontFamily: fonts.body,
              padding: '10px 12px',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>
      </form>
    </Modal>
  );
}
