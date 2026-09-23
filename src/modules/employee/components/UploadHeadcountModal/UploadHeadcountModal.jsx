import React, { useState, useRef, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import { Field, TextInput } from '@/shared/components/ui/FormField';
import { getFileIconName } from '@/shared/services/file.service';

export default function UploadHeadcountModal({
  isOpen,
  onClose,
  onSubmit,
  branchId,
  branchName,
  isStoreManager = false,
  branches = [],
}) {
  const { c, fonts } = useAdminTheme();
  const fileInputRef = useRef(null);

  const [selectedBranchId, setSelectedBranchId] = useState(String(branchId || 1));
  const [requestedQuantity, setRequestedQuantity] = useState('2');
  const [reason, setReason] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (branchId) setSelectedBranchId(String(branchId));
      setErrors({});
    }
  }, [isOpen, branchId]);

  // Download template mẫu — gọi API backend (ClosedXML) nếu có, fallback CSV local
  const handleDownloadTemplate = async () => {
    try {
      // Tải template từ backend (ClosedXML, 2 sheet)
      const { default: axiosInstance } = await import('@/config/axios.config');
      const res = await axiosInstance.get('v1/headcount-requests/template', {
        responseType: 'blob',
        timeout: 15000,
      });
      if (res.status === 200 && res.data) {
        const blob = new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Mau_De_Xuat_Mo_Rong_Dinh_Bien.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        return;
      }
    } catch {
      // Fallback CSV local
    }

    const csvContent =
      'STT,Mã Vị Trí,Chức Danh Đề Xuất,Số Lượng,Hình Thức Hợp Đồng,Ca Làm Việc Dự Kiến,Lý Do Chi Tiết\n' +
      '1,TN-01,Nhân Viên Thu Ngân,2,PART_TIME,Ca Tối (18:00 - 22:30),Tăng cường giờ cao điểm mua sắm\n' +
      '2,BH-01,Nhân Viên Bán Hàng,1,FULL_TIME,Xoay ca,Mở rộng quầy đồ uống tươi\n';

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Mau_De_Xuat_Mo_Rong_Dinh_Bien_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validExtensions = ['.xlsx', '.xls', '.csv', '.pdf'];
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes(ext)) {
        setErrors((prev) => ({
          ...prev,
          file: `Chỉ chấp nhận: ${validExtensions.join(', ')}. File của bạn có đuôi "${ext}".`,
        }));
        setSelectedFile(null);
        return;
      }
      const maxSizeMB = 20;
      if (file.size > maxSizeMB * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          file: `Dung lượng file vượt quá ${maxSizeMB}MB. File của bạn: ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
        }));
        setSelectedFile(null);
        return;
      }
      if (file.size === 0) {
        setErrors((prev) => ({ ...prev, file: 'File rỗng, vui lòng chọn file hợp lệ.' }));
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setErrors((prev) => ({ ...prev, file: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!selectedBranchId) {
      errs.branchId = 'Vui lòng chọn chi nhánh công tác.';
    }
    const qty = parseInt(requestedQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      errs.requestedQuantity = 'Số lượng đề xuất phải là số nguyên dương lớn hơn 0.';
    }
    if (!reason.trim()) {
      errs.reason = 'Vui lòng nhập lý do đề xuất mở rộng định biên.';
    }
    if (!selectedFile) {
      errs.file = 'Vui lòng đính kèm file Excel (.xlsx) hoặc tài liệu PDF đề xuất.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const currentBranch = branches.find((b) => String(b.id || b.storeId) === String(selectedBranchId));
      await onSubmit({
        branchId: selectedBranchId,
        branchName: currentBranch?.name || branchName,
        requestedQuantity: parseInt(requestedQuantity, 10),
        reason: reason.trim(),
        file: selectedFile,
      });
      // Reset form
      setReason('');
      setSelectedFile(null);
      setRequestedQuantity('2');
      setErrors({});
      onClose();
    } catch (err) {
      console.error('Submit headcount request error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Đề Xuất Mở Rộng Định Biên Chi Nhánh"
      sub="Upload file Excel (.xlsx) danh sách nhân sự đề xuất kèm giải trình để Operations Admin thẩm định và phê duyệt."
      width={600}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            style={{
              background: 'transparent',
              border: 'none',
              color: c.accent,
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Icon name="download" size={15} />
            <span>Tải file Excel mẫu (.xlsx / .csv)</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="ghost" onClick={onClose} disabled={submitting}>
              Hủy Bỏ
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi Đơn Đề Xuất'}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Banner lưu ý nghiệp vụ */}
        <div
          style={{
            padding: '12px 14px',
            background: 'rgba(13, 148, 136, 0.06)',
            border: '1px solid rgba(13, 148, 136, 0.20)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '12.5px',
            color: c.fgMuted,
          }}
        >
          <Icon name="info" size={16} color={c.accent} style={{ marginTop: '2px', flexShrink: 0 }} />
          <span>
            <strong style={{ color: c.accent }}>Quy định Định biên (Headcount Quota):</strong> Cửa hàng trưởng không thể tự tạo nhân viên khi chi nhánh đã đạt trần. Đơn đề xuất này sẽ được Operations Admin thẩm định và cấp hạn mức bổ sung linh hoạt (<strong>thời hạn 30 ngày</strong>).
          </span>
        </div>

        {/* Chi nhánh áp dụng */}
        <Field label="Chi Nhánh Đề Xuất" required error={errors.branchId}>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            disabled={isStoreManager}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: isStoreManager ? c.track : c.bgRaised,
              border: `1px solid ${c.border}`,
              borderRadius: '6px',
              color: isStoreManager ? c.fgSubtle : c.fg,
              fontSize: '13.5px',
              outline: 'none',
              cursor: isStoreManager ? 'not-allowed' : 'pointer',
            }}
          >
            {branches.length > 0 ? (
              branches.map((b) => (
                <option key={b.id || b.storeId} value={String(b.id || b.storeId)}>
                  {b.name || `Chi nhánh #${b.id || b.storeId}`}
                </option>
              ))
            ) : (
              <option value={String(branchId || 1)}>{branchName || 'Chi nhánh hiện tại'}</option>
            )}
          </select>
        </Field>

        {/* Số lượng đề xuất */}
        <Field label="Số Lượng Nhân Sự Cần Mở Rộng" required error={errors.requestedQuantity}>
          <TextInput
            type="number"
            min="1"
            max="50"
            value={requestedQuantity}
            onChange={(e) => setRequestedQuantity(e.target.value)}
            placeholder="VD: 3"
          />
        </Field>

        {/* Lý do đề xuất */}
        <Field label="Lý Do Mở Rộng Định Biên" required error={errors.reason}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Giải trình nhu cầu thực tế: Mở rộng quầy kệ mới, tăng lưu lượng khách hàng ca tối, chuẩn bị mùa khuyến mãi..."
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: c.bgRaised,
              border: `1px solid ${errors.reason ? '#ef4444' : c.border}`,
              borderRadius: '6px',
              color: c.fg,
              fontSize: '13px',
              fontFamily: fonts.body,
              resize: 'vertical',
              outline: 'none',
            }}
          />
        </Field>

        {/* Khu vực Upload File */}
        <Field label="Đính Kèm File (.xlsx / .xls / .csv / .pdf)" required error={errors.file}>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) {
                const syntheticEvent = { target: { files: e.dataTransfer.files } };
                handleFileChange(syntheticEvent);
              }
            }}
            style={{
              border: `2px dashed ${errors.file ? '#EF4444' : selectedFile ? '#0D9488' : c.border}`,
              borderRadius: '8px',
              padding: '24px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: selectedFile ? 'rgba(13, 148, 136, 0.04)' : c.bgCard,
              transition: 'all 0.2s ease',
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv,.pdf"
              style={{ display: 'none' }}
            />
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: selectedFile ? 'rgba(13, 148, 136, 0.12)' : 'rgba(13, 148, 136, 0.06)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: selectedFile ? '#0D9488' : c.accent,
                marginBottom: '8px',
              }}
            >
              <Icon name={selectedFile ? getFileIconName(selectedFile.name) : 'upload'} size={20} />
            </div>
            {selectedFile ? (
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0D9488' }}>
                  {selectedFile.name}
                </div>
                <div style={{ fontSize: '12px', color: c.fgSubtle, marginTop: '2px' }}>
                  {(selectedFile.size / 1024).toFixed(1)} KB • Bấm để chọn file khác
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 500, color: c.fg }}>
                  Kéo thả file vào đây hoặc{' '}
                  <span style={{ color: c.accent, textDecoration: 'underline' }}>chọn từ máy tính</span>
                </div>
                <div style={{ fontSize: '11.5px', color: c.fgSubtle, marginTop: '4px' }}>
                  Hỗ trợ: .xlsx, .xls, .csv (Excel/CSV) và .pdf • Dung lượng tối đa 20MB
                </div>
              </div>
            )}
          </div>
        </Field>
      </form>
    </Modal>
  );
}
