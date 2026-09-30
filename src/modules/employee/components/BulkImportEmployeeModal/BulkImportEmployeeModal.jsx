import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import { Field } from '@/shared/components/ui/FormField';
import employeeService from '@/modules/employee/services/employee.service';

/**
 * BulkImportEmployeeModal — Modal Import Nhân Sự Hàng Loạt
 *
 * Phân quyền: Chỉ OPERATIONS_ADMIN và ADMIN mới có thể thấy và sử dụng chức năng này.
 * Backend vẫn là nơi thực hiện authorization thực tế.
 *
 * Luồng 4 bước:
 * 1. Tải file mẫu Excel (ClosedXML 2 sheet từ Backend)
 * 2. Chọn file dữ liệu (drag & drop) — .xlsx, .xls, .csv
 * 3. Tùy chọn: Định biên mở rộng (importRequestId + expansionReason)
 * 4. Kết quả: Tổng kết + danh sách lỗi chi tiết (Partial Success support)
 *
 * Không tự động đóng modal khi còn lỗi để người dùng xem và sửa.
 */
export default function BulkImportEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
  branches = [],
  availableImportRequests = [], // Danh sách đơn mở rộng định biên còn hiệu lực
  currentBranchId = null,
}) {
  const { c, fonts } = useAdminTheme();
  const fileInputRef = useRef(null);

  // State
  const [employeeCount, setEmployeeCount] = useState(5);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importRequestId, setImportRequestId] = useState('');
  const [expansionReason, setExpansionReason] = useState('');
  const [fileError, setFileError] = useState('');

  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Kết quả import
  const [importResult, setImportResult] = useState(null); // BulkImportResultDto
  const [importMessage, setImportMessage] = useState('');
  const [importStatus, setImportStatus] = useState('idle'); // 'idle' | 'success' | 'partial' | 'error'

  // Reset khi modal mở
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setFileError('');
      setImportResult(null);
      setImportMessage('');
      setImportStatus('idle');
      setImportRequestId('');
      setExpansionReason('');
    }
  }, [isOpen]);

  // ─── Tải file mẫu ─────────────────────────────────────────────────────────

  const handleDownloadTemplate = async () => {
    if (isDownloadingTemplate) return;
    setIsDownloadingTemplate(true);
    try {
      const count = Math.max(1, Math.min(Number(employeeCount) || 5, 500));
      const result = await employeeService.downloadImportTemplate(count);
      if (!result.success) {
        alert(result.message || 'Không thể tải file mẫu. Vui lòng thử lại.');
      }
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  // ─── Chọn & Validate File ─────────────────────────────────────────────────

  const handleFileValidation = useCallback((file) => {
    const allowedExts = ['.xlsx', '.xls', '.csv'];
    const ext = ('.' + file.name.split('.').pop()).toLowerCase();
    if (!allowedExts.includes(ext)) {
      setFileError(`Định dạng không hỗ trợ. Chọn: ${allowedExts.join(', ')}.`);
      setSelectedFile(null);
      return false;
    }
    const maxSizeMB = 20;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setFileError(`Dung lượng vượt ${maxSizeMB}MB. File của bạn: ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
      setSelectedFile(null);
      return false;
    }
    if (file.size === 0) {
      setFileError('File rỗng. Vui lòng chọn file hợp lệ.');
      setSelectedFile(null);
      return false;
    }
    setFileError('');
    setSelectedFile(file);
    // Reset kết quả cũ khi chọn file mới
    setImportResult(null);
    setImportStatus('idle');
    return true;
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileValidation(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileValidation(file);
  };

  // ─── Import ───────────────────────────────────────────────────────────────

  const handleImport = async () => {
    if (isImporting) return; // Chặn double click
    if (!selectedFile) {
      setFileError('Vui lòng chọn file Excel/CSV trước khi import.');
      return;
    }

    setIsImporting(true);
    setImportResult(null);
    setImportMessage('');
    setImportStatus('idle');

    try {
      const result = await employeeService.importEmployees({
        file: selectedFile,
        defaultBranchId: currentBranchId ? String(currentBranchId) : null,
        importRequestId: importRequestId || null,
        expansionReason: expansionReason.trim() || null,
      });

      setImportMessage(result.message || '');

      if (result.data) {
        setImportResult(result.data);
        const { successCount, failureCount } = result.data;

        if (!result.success && failureCount > 0 && successCount === 0) {
          // Thất bại toàn bộ
          setImportStatus('error');
        } else if (result.isPartialSuccess) {
          // Thành công một phần
          setImportStatus('partial');
          onSuccess?.(); // Làm mới danh sách nhân sự
        } else if (result.success) {
          // Thành công hoàn toàn
          setImportStatus('success');
          onSuccess?.();
        }
      } else {
        setImportStatus('error');
      }
    } finally {
      setIsImporting(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const getFileExtIcon = (fileName) => {
    const ext = ('.' + (fileName || '').split('.').pop()).toLowerCase();
    if (['.xlsx', '.xls'].includes(ext)) return 'file-spreadsheet';
    if (ext === '.csv') return 'file-text';
    return 'file';
  };

  const statusConfig = {
    success: { color: '#0D9488', bg: 'rgba(13, 148, 136, 0.08)', border: 'rgba(13, 148, 136, 0.25)', icon: 'check' },
    partial: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.25)', icon: 'warning' },
    error: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.25)', icon: 'x' },
    idle: { color: c.fgSubtle, bg: 'transparent', border: 'transparent', icon: 'info' },
  };

  const currentStatus = statusConfig[importStatus] || statusConfig.idle;
  const hasResult = importResult !== null;

  // ─── Render ───────────────────────────────────────────────────────────────

  const labelStyle = { color: c.fgSubtle, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, marginBottom: '6px', display: 'block' };
  const sectionHeaderStyle = {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '13px', fontWeight: 700, color: c.fg, marginBottom: '12px',
  };
  const stepNumStyle = (active) => ({
    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
    background: active ? c.accent : c.border,
    color: active ? '#fff' : c.fgSubtle,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: 700,
  });

  return (
    <Modal
      open={isOpen}
      onClose={isImporting ? undefined : onClose}
      title="Import Nhân Sự Hàng Loạt"
      sub="Tải file mẫu Excel chuẩn từ hệ thống, điền thông tin nhân sự và import hàng loạt."
      width={680}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%', gap: '10px' }}>
          <Button variant="ghost" onClick={onClose} disabled={isImporting}>
            {importStatus !== 'idle' ? 'Đóng' : 'Hủy Bỏ'}
          </Button>
          {importStatus !== 'success' && (
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={isImporting || !selectedFile}
              id="bulk-import-submit-btn"
            >
              {isImporting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
                  Đang Import...
                </span>
              ) : importStatus === 'partial' ? 'Import Lại (File Đã Sửa)' : 'Bắt Đầu Import'}
            </Button>
          )}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── BƯỚC 1: Chọn số lượng & Tải file mẫu ── */}
        <div style={{ padding: '16px 18px', background: 'rgba(13, 148, 136, 0.05)', borderRadius: '8px', border: `1px solid rgba(13, 148, 136, 0.15)` }}>
          <div style={sectionHeaderStyle}>
            <span style={stepNumStyle(true)}>1</span>
            <span>Sinh File Mẫu Excel Tự Động</span>
          </div>
          <p style={{ fontSize: '12.5px', color: c.fgMuted, lineHeight: '1.6', margin: '0 0 12px 30px' }}>
            Hệ thống sẽ <strong>tự động sinh mã nhân viên (NVxxxx)</strong> liên tiếp và kiểm tra không trùng lặp trong CSDL, đồng thời cập nhật danh sách chi nhánh hoạt động mới nhất vào file.
          </p>

          <div style={{ marginLeft: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: c.fg, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Số nhân sự cần khai báo:</span>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={employeeCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setEmployeeCount(isNaN(val) ? '' : Math.max(1, Math.min(val, 500)));
                  }}
                  disabled={isDownloadingTemplate || isImporting}
                  style={{
                    width: '80px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${c.border}`,
                    background: c.bgElev,
                    color: c.fg,
                    fontSize: '13px',
                    fontWeight: 700,
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
              </label>

              {/* Gợi ý số lượng nhanh */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {[5, 10, 20, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setEmployeeCount(preset)}
                    disabled={isDownloadingTemplate || isImporting}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11.5px',
                      borderRadius: '4px',
                      border: employeeCount === preset ? `1px solid ${c.accent}` : `1px solid ${c.border}`,
                      background: employeeCount === preset ? `${c.accent}20` : 'transparent',
                      color: employeeCount === preset ? c.accent : c.fgSubtle,
                      cursor: 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.15s',
                    }}
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                disabled={isDownloadingTemplate || isImporting || !employeeCount}
                style={{
                  padding: '9px 18px',
                  background: 'rgba(13, 148, 136, 0.12)',
                  border: `1px solid rgba(13, 148, 136, 0.35)`,
                  borderRadius: '6px',
                  color: c.accent,
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: isDownloadingTemplate ? 'default' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <Icon name="download" size={16} color={c.accent} />
                {isDownloadingTemplate
                  ? 'Đang sinh file Excel...'
                  : `Tạo & Tải File Mẫu (${employeeCount || 0} Nhân Sự)`}
              </button>
            </div>
          </div>
        </div>

        {/* ── BƯỚC 2: Chọn file dữ liệu ── */}
        <div>
          <div style={sectionHeaderStyle}>
            <span style={stepNumStyle(true)}>2</span>
            <span>Chọn File Dữ Liệu Import</span>
          </div>
          <Field error={fileError}>
            <div
              onClick={() => !isImporting && fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={isImporting ? undefined : handleDrop}
              style={{
                border: `2px dashed ${fileError ? '#EF4444' : selectedFile ? '#0D9488' : c.border}`,
                borderRadius: '8px',
                padding: '20px 16px',
                textAlign: 'center',
                cursor: isImporting ? 'default' : 'pointer',
                background: selectedFile ? 'rgba(13, 148, 136, 0.04)' : c.bgCard,
                transition: 'all 0.2s ease',
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                disabled={isImporting}
              />
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: selectedFile ? 'rgba(13, 148, 136, 0.12)' : 'rgba(13, 148, 136, 0.06)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: selectedFile ? '#0D9488' : c.accent, marginBottom: '8px',
              }}>
                <Icon name={selectedFile ? getFileExtIcon(selectedFile.name) : 'import'} size={18} />
              </div>
              {selectedFile ? (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0D9488' }}>{selectedFile.name}</div>
                  <div style={{ fontSize: '11.5px', color: c.fgSubtle, marginTop: '2px' }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB • Bấm để chọn file khác
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: c.fg }}>
                    Kéo thả file vào đây hoặc{' '}
                    <span style={{ color: c.accent, textDecoration: 'underline' }}>chọn từ máy tính</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: c.fgSubtle, marginTop: '3px' }}>
                    Hỗ trợ: .xlsx, .xls, .csv • Dung lượng tối đa 20MB
                  </div>
                </div>
              )}
            </div>
          </Field>
        </div>

        {/* ── BƯỚC 4: Kết quả Import ── */}
        {importStatus !== 'idle' && (
          <div style={{
            padding: '16px',
            background: currentStatus.bg,
            border: `1px solid ${currentStatus.border}`,
            borderRadius: '8px',
          }}>
            <div style={sectionHeaderStyle}>
              <span style={stepNumStyle(true)}>4</span>
              <span>Kết Quả Import</span>
            </div>

            {/* Tổng kết số liệu (nếu có DTO trả về) */}
            {importResult && (
              <div style={{ display: 'flex', gap: '16px', marginLeft: '30px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', minWidth: '70px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: c.fg }}>{importResult.totalRows ?? 0}</div>
                  <div style={{ fontSize: '11px', color: c.fgSubtle }}>Tổng dòng</div>
                </div>
                <div style={{ textAlign: 'center', minWidth: '70px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#0D9488' }}>{importResult.successCount ?? 0}</div>
                  <div style={{ fontSize: '11px', color: c.fgSubtle }}>Thành công</div>
                </div>
                <div style={{ textAlign: 'center', minWidth: '70px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: (importResult.failureCount ?? 0) > 0 ? '#EF4444' : c.fgSubtle }}>
                    {importResult.failureCount ?? 0}
                  </div>
                  <div style={{ fontSize: '11px', color: c.fgSubtle }}>Thất bại</div>
                </div>
              </div>
            )}

            {/* Thông báo tổng kết */}
            <div style={{
              marginLeft: '30px', marginBottom: importResult?.errors?.length > 0 ? '12px' : 0,
              padding: '10px 12px',
              background: `${currentStatus.color}12`,
              border: `1px solid ${currentStatus.border}`,
              borderRadius: '6px',
              fontSize: '13px', fontWeight: 600,
              color: currentStatus.color,
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <Icon name={currentStatus.icon} size={15} color={currentStatus.color} />
              <span>{importMessage || 'Có lỗi xảy ra trong quá trình import.'}</span>
            </div>

            {/* Danh sách lỗi chi tiết */}
            {importResult?.errors?.length > 0 && (
              <div style={{ marginLeft: '30px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#EF4444', marginBottom: '8px' }}>
                  Chi tiết lỗi ({importResult.errors.length} dòng vi phạm):
                </div>
                <div
                  className="import-error-scrollbar"
                  style={{
                    maxHeight: '140px',
                    overflowY: 'scroll',
                    border: `1px solid rgba(239, 68, 68, 0.35)`,
                    borderRadius: '6px',
                    background: c.bgRaised,
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 2, background: c.bgElev }}>
                      <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: c.fgMuted, fontWeight: 600, whiteSpace: 'nowrap', position: 'sticky', top: 0, background: c.bgElev, borderBottom: `1px solid ${c.border}` }}>Dòng</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: c.fgMuted, fontWeight: 600, position: 'sticky', top: 0, background: c.bgElev, borderBottom: `1px solid ${c.border}` }}>Mã NV / Email</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: c.fgMuted, fontWeight: 600, position: 'sticky', top: 0, background: c.bgElev, borderBottom: `1px solid ${c.border}` }}>Lý Do Lỗi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.errors.map((errRow, idx) => {
                        const rowNum = errRow.rowNumber ?? errRow.RowNumber ?? errRow.rowIndex ?? errRow.RowIndex ?? (idx + 2);
                        const code = errRow.employeeCode ?? errRow.EmployeeCode ?? errRow.rowData?.employeeCode ?? errRow.RowData?.EmployeeCode ?? '—';
                        const name = errRow.fullName ?? errRow.FullName ?? errRow.rowData?.fullName ?? errRow.RowData?.FullName ?? '';
                        const email = errRow.email ?? errRow.Email ?? errRow.rowData?.email ?? errRow.RowData?.Email ?? '';
                        const rawMsg = errRow.errorMessage ?? errRow.ErrorMessage ?? errRow.errorMessages ?? errRow.ErrorMessages;
                        const errMsg = Array.isArray(rawMsg) ? rawMsg.join('; ') : (rawMsg || 'Dữ liệu không hợp lệ');

                        return (
                          <tr
                            key={idx}
                            style={{ borderBottom: `1px solid ${c.borderSub}`, background: idx % 2 === 0 ? 'transparent' : c.bgElev }}
                          >
                            <td style={{ padding: '7px 10px', fontWeight: 600, color: '#EF4444', whiteSpace: 'nowrap' }}>
                              Dòng {rowNum}
                            </td>
                            <td style={{ padding: '7px 10px', color: c.fgMuted }}>
                              <span style={{ fontWeight: 600, color: c.fg }}>{code}</span>
                              {name && (
                                <span style={{ marginLeft: '4px', color: c.fgSubtle, fontSize: '11px' }}>
                                  ({name})
                                </span>
                              )}
                              {!name && email && (
                                <span style={{ marginLeft: '4px', color: c.fgSubtle, fontSize: '11px' }}>
                                  ({email})
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '7px 10px', color: '#DC2626' }}>
                              {errMsg}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {(importStatus === 'partial' || importStatus === 'error') && (
                  <p style={{ fontSize: '11.5px', color: c.fgSubtle, marginTop: '8px', lineHeight: '1.5' }}>
                    Hãy chỉnh sửa file và xóa các dòng đã import thành công, sau đó import lại file đã sửa.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
