import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { Modal, Button, Select } from '@/shared/components/ui';
import dispatchService from '../services/dispatch.service';

/**
 * Modal: Tạo & Chỉnh sửa yêu cầu xin chi viện nhân sự liên chi nhánh.
 * Nghiệp vụ: Cửa hàng hiện tại (cơ sở tiếp nhận) lập phiếu đề nghị mượn
 * nhân sự từ cơ sở đối tác (cơ sở hỗ trợ chi viện).
 * Sau khi gửi, Cửa hàng trưởng của cơ sở hỗ trợ sẽ nhận được thông báo
 * để vào xét duyệt và cử/chỉ định nhân sự cụ thể.
 */
export default function CreateDispatchRequestModal({
  open,
  onClose,
  onSuccess,
  currentStoreId,
  currentStoreName,
  editItem = null,
}) {
  const { c, fonts } = useAdminTheme();

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
        setPartnerStoreId(String(editItem.fromStoreId || ''));
        setEmployeeId(String(editItem.employeeId || ''));
        setStartDate(editItem.startDate || todayStr);
        setEndDate(editItem.endDate || todayStr);
        setReason(editItem.reason || '');
      } else {
        setPartnerStoreId('');
        setEmployeeId('');
        setStartDate(todayStr);
        setEndDate(todayStr);
        setReason('');
        setEmployees([]);
      }

      // Tải danh mục các chi nhánh khác để chọn cơ sở hỗ trợ
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
  }, [open, editItem, currentStoreId, todayStr]);

  // Tải danh sách nhân sự của chi nhánh đối tác (cơ sở hỗ trợ)
  useEffect(() => {
    if (!partnerStoreId) {
      setEmployees([]);
      if (!editItem) setEmployeeId('');
      return;
    }

    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const list = await dispatchService.getEmployeesByBranch(partnerStoreId);
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
  }, [partnerStoreId, editItem]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage('');

    if (!partnerStoreId) {
      setErrorMessage('Vui lòng chọn cơ sở / chi nhánh bạn muốn xin hỗ trợ chi viện.');
      return;
    }
    if (!employeeId) {
      setErrorMessage('Vui lòng chọn nhân sự đề xuất xin mượn.');
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
      // fromStoreId = bên cho mượn (partner)
      // toStoreId = bên tiếp nhận về (cơ sở mình)
      const payload = {
        employeeId: Number(employeeId),
        fromStoreId: Number(partnerStoreId),
        toStoreId: Number(currentStoreId),
        startDate,
        endDate,
        reason: reason.trim() || 'Đề nghị xin mượn nhân sự hỗ trợ ca trực',
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
        setErrorMessage(result.message || 'Không thể lưu yêu cầu xin chi viện.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu xin chi viện.';
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
        : '-- Chọn cơ sở bạn muốn xin mượn quân --',
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
        : !partnerStoreId
        ? '-- Vui lòng chọn cơ sở hỗ trợ trước --'
        : '-- Chọn nhân sự đề xuất xin mượn --',
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
          ? 'Chỉnh Sửa Yêu Cầu Xin Chi Viện'
          : 'Tạo Yêu Cầu Xin Chi Viện Nhân Sự'
      }
      sub={
        editItem
          ? `Cập nhật thông tin phiếu xin chi viện đang chờ duyệt (#${editItem.dispatchId})`
          : `Gửi phiếu đề nghị mượn nhân sự từ chi nhánh đối tác về cơ sở "${currentStoreName}"`
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
              : 'Gửi Đề Nghị Xin Chi Viện'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

        {/* Khối hiển thị chi nhánh tiếp nhận của bạn */}
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
              Cơ sở tiếp nhận (Chi nhánh cần hỗ trợ của bạn)
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: c.accent, marginTop: 2 }}>
              {currentStoreName || 'Chi nhánh của bạn'}
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              padding: '3px 8px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              borderRadius: 4,
              fontWeight: 600,
            }}
          >
            Đơn vị xin mượn quân
          </span>
        </div>

        {/* Chọn cơ sở đối tác hỗ trợ */}
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: c.fgSubtle, marginBottom: 6 }}>
            Cơ sở hỗ trợ chi viện (Mượn nhân sự từ đâu?) <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <Select
            value={partnerStoreId}
            onChange={(val) => setPartnerStoreId(val)}
            options={partnerBranchOptions}
            width="100%"
            disabled={loadingBranches || submitting}
          />
        </div>

        {/* Chọn nhân sự đề xuất xin mượn */}
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: c.fgSubtle, marginBottom: 6 }}>
            Nhân sự đề xuất xin mượn{' '}
            {selectedPartnerBranch && (
              <span style={{ color: c.accent, textTransform: 'none', fontWeight: 500 }}>
                (Thuộc biên chế: {selectedPartnerBranch.name || selectedPartnerBranch.branchName})
              </span>
            )}{' '}
            <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <Select
            value={employeeId}
            onChange={(val) => setEmployeeId(val)}
            options={employeeOptions}
            width="100%"
            disabled={!partnerStoreId || loadingEmployees || submitting}
          />
          {partnerStoreId && employees.length === 0 && !loadingEmployees && (
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
            placeholder="Ví dụ: Cơ sở đang thiếu hụt vị trí Thu ngân/Bán hàng dịp cao điểm cuối tuần, xin hỗ trợ 1 nhân sự tăng cường..."
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
