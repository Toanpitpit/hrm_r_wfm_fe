import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { Modal, Button, Select } from '@/shared/components/ui';
import dispatchService from '../services/dispatch.service';

/**
 * Modal: Tạo & Chỉnh sửa yêu cầu xin chi viện nhân sự liên chi nhánh.
 * Hỗ trợ điều động nhiều nhân sự cùng lúc (Multi-Employee Dispatch).
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
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
      setSearchTerm('');

      if (editItem) {
        setPartnerStoreId(String(editItem.fromStoreId || ''));
        // Nạp danh sách nhân sự từ editItem.employees hoặc fallback employeeId
        if (editItem.employees && Array.isArray(editItem.employees) && editItem.employees.length > 0) {
          setSelectedEmployeeIds(editItem.employees.map((e) => String(e.employeeId || e.id)));
        } else if (editItem.employeeId) {
          setSelectedEmployeeIds([String(editItem.employeeId)]);
        } else {
          setSelectedEmployeeIds([]);
        }
        setStartDate(editItem.startDate || todayStr);
        setEndDate(editItem.endDate || todayStr);
        setReason(editItem.reason || '');
      } else {
        setPartnerStoreId('');
        setSelectedEmployeeIds([]);
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
      if (!editItem) setSelectedEmployeeIds([]);
      return;
    }

    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const list = await dispatchService.getEmployeesByBranch(partnerStoreId);
        setEmployees(list);
      } catch (err) {
        console.error('Lỗi khi tải danh sách nhân sự:', err);
      } finally {
        setLoadingEmployees(false);
      }
    };
    loadEmployees();
  }, [partnerStoreId]);

  const toggleEmployee = (empIdStr) => {
    setSelectedEmployeeIds((prev) => {
      if (prev.includes(empIdStr)) {
        return prev.filter((id) => id !== empIdStr);
      } else {
        return [...prev, empIdStr];
      }
    });
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredEmployees.map((e) => String(e.id || e.userId));
    const merged = Array.from(new Set([...selectedEmployeeIds, ...allFilteredIds]));
    setSelectedEmployeeIds(merged);
  };

  const handleDeselectAll = () => {
    setSelectedEmployeeIds([]);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage('');

    if (!partnerStoreId) {
      setErrorMessage('Vui lòng chọn cơ sở / chi nhánh bạn muốn xin hỗ trợ chi viện.');
      return;
    }
    if (selectedEmployeeIds.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một nhân sự đề xuất xin mượn.');
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
    if (!reason || !reason.trim()) {
      setErrorMessage('Vui lòng nhập lý do / công việc cần tăng cường điều động nhân sự.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        employeeIds: selectedEmployeeIds.map(Number),
        fromStoreId: Number(partnerStoreId),
        toStoreId: Number(currentStoreId),
        startDate,
        endDate,
        reason: reason.trim(),
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

  const selectedPartnerBranch = branches.find((b) => String(b.id || b.branchId) === String(partnerStoreId));

  const filteredEmployees = employees.filter((emp) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const name = String(emp.fullName || '').toLowerCase();
    const code = String(emp.employeeCode || '').toLowerCase();
    const role = String(emp.positionName || emp.roleName || '').toLowerCase();
    return name.includes(term) || code.includes(term) || role.includes(term);
  });

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
      width={720}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ fontSize: 13, color: c.fgMuted }}>
            {selectedEmployeeIds.length > 0 ? (
              <span>
                Đã chọn <strong style={{ color: c.accent }}>{selectedEmployeeIds.length}</strong> nhân sự
              </span>
            ) : (
              <span>Chưa chọn nhân sự nào</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button kind="ghost" onClick={onClose} disabled={submitting}>
              Hủy Bỏ
            </Button>
            <Button kind="primary" onClick={handleSubmit} disabled={submitting || loadingBranches || selectedEmployeeIds.length === 0 || !reason.trim()}>
              {submitting
                ? 'Đang Lưu...'
                : editItem
                ? 'Lưu Thay Đổi'
                : `Gửi Đề Nghị (${selectedEmployeeIds.length} nhân sự)`}
            </Button>
          </div>
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

        {/* Khối hiển thị chi nhánh tiếp nhận */}
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
              Cơ sở tiếp nhận (Chi nhánh của bạn)
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

        {/* Chọn nhiều nhân sự đề xuất xin mượn (Multi-select) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: c.fgSubtle }}>
              Danh sách nhân sự đề xuất xin mượn{' '}
              {selectedPartnerBranch && (
                <span style={{ color: c.accent, textTransform: 'none', fontWeight: 500 }}>
                  (Cơ sở: {selectedPartnerBranch.name || selectedPartnerBranch.branchName})
                </span>
              )}{' '}
              <span style={{ color: '#ef4444' }}>*</span>
            </label>

            {partnerStoreId && employees.length > 0 && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: c.accent,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Chọn tất cả
                </button>
                <span style={{ color: c.fgFaint }}>|</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: c.fgMuted,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Bỏ chọn
                </button>
              </div>
            )}
          </div>

          {!partnerStoreId ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                background: c.bgRaised,
                borderRadius: 8,
                border: `1px dashed ${c.border}`,
                color: c.fgFaint,
                fontSize: 13,
              }}
            >
              Vui lòng chọn cơ sở hỗ trợ chi viện ở trên để xem danh sách nhân sự khả dụng.
            </div>
          ) : loadingEmployees ? (
            <div style={{ padding: '24px', textAlign: 'center', color: c.fgFaint, fontSize: 13 }}>
              Đang tải danh sách nhân sự của chi nhánh đối tác...
            </div>
          ) : employees.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                background: c.bgRaised,
                borderRadius: 8,
                border: `1px dashed ${c.border}`,
                color: c.fgFaint,
                fontSize: 13,
              }}
            >
              Cơ sở hỗ trợ này hiện không có nhân sự trực thuộc khả dụng.
            </div>
          ) : (
            <div>
              {/* Ô tìm kiếm nhanh nhân viên */}
              {employees.length > 4 && (
                <div style={{ marginBottom: 8 }}>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo tên, mã NV, vị trí..."
                    style={{
                      width: '100%',
                      background: c.bgRaised,
                      border: `1px solid ${c.border}`,
                      borderRadius: 6,
                      color: c.fg,
                      fontSize: 12.5,
                      fontFamily: fonts.body,
                      padding: '7px 10px',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              {/* Danh sách thẻ nhân sự có Checkbox */}
              <div
                style={{
                  maxHeight: 210,
                  overflowY: 'auto',
                  border: `1px solid ${c.border}`,
                  borderRadius: 8,
                  background: c.bgRaised,
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                {filteredEmployees.map((emp) => {
                  const empIdStr = String(emp.id || emp.userId);
                  const isChecked = selectedEmployeeIds.includes(empIdStr);
                  const avatar = (emp.fullName || 'N').trim().charAt(0).toUpperCase();

                  return (
                    <div
                      key={empIdStr}
                      onClick={() => toggleEmployee(empIdStr)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        background: isChecked ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                        border: isChecked ? `1px solid ${c.accent}` : `1px solid transparent`,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isChecked) e.currentTarget.style.background = c.bgElev;
                      }}
                      onMouseLeave={(e) => {
                        if (!isChecked) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Đã xử lý ở thẻ cha onClick
                          style={{ cursor: 'pointer', accentColor: c.accent }}
                        />
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: isChecked ? c.accent : c.bgCard,
                            color: isChecked ? '#000' : c.fg,
                            fontWeight: 700,
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {avatar}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: c.fg }}>
                            {emp.fullName}
                          </div>
                          <div style={{ fontSize: 11, color: c.fgFaint }}>
                            {emp.employeeCode} • {emp.positionName || emp.roleName || 'Nhân viên'}
                          </div>
                        </div>
                      </div>

                      {isChecked && (
                        <span
                          style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            background: 'rgba(212, 175, 55, 0.2)',
                            color: c.accent,
                            borderRadius: 4,
                            fontWeight: 600,
                          }}
                        >
                          Đã chọn
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Tags các nhân sự đã chọn */}
              {selectedEmployeeIds.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedEmployeeIds.map((idStr) => {
                    const empObj = employees.find((e) => String(e.id || e.userId) === idStr);
                    const name = empObj ? empObj.fullName : `NV #${idStr}`;
                    return (
                      <span
                        key={idStr}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 11.5,
                          background: c.bgElev,
                          border: `1px solid ${c.border}`,
                          color: c.fg,
                          padding: '3px 8px',
                          borderRadius: 4,
                        }}
                      >
                        {name}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEmployee(idStr);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: c.fgFaint,
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: 12,
                            lineHeight: 1,
                          }}
                          title="Bỏ chọn nhân sự này"
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
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
            Lý do / Công việc cần tăng cường <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ví dụ: Cơ sở đang thiếu hụt nhân sự dịp cao điểm cuối tuần, xin hỗ trợ tăng cường..."
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
