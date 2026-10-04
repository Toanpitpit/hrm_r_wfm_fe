import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { useToast } from '@/components/ui/toast/ToastProvider';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import { Field, TextInput } from '@/shared/components/ui/FormField';
import employeeService, { CONTRACT_TYPES, STORE_ROLES } from '../../services/employee.service';
import headcountService from '../../services/headcount.service';

export default function EmployeeFormModal({
  isOpen,
  onClose,
  onSubmit,
  onImportSuccess,
  initialData = null, // null => Create mode, object => Edit mode
  roles = [],
  branches = [],
  canManageSystem = false, // True for Admin & Business Owner
  isBusinessOwner = false,
  isStoreManager = false,
  currentStoreBranchId = null,
  currentStoreBranchName = '',
  onBranchTierUpgraded,
  onToggleStatus,
  onResetPassword,
  onDeleteSuccess,
}) {
  const { c, fonts } = useAdminTheme();
  const toast = useToast();
  const isEdit = Boolean(initialData && initialData.id);

  // Tab chuyển đổi: 'manual' (Khai báo thủ công) | 'bulk' (Import hàng loạt Excel)
  const [activeTab, setActiveTab] = useState('manual');

  // ─── State: Form Khai Báo Đơn Lẻ ──────────────────────────────────────────
  const [formData, setFormData] = useState({
    employeeCode: '',
    fullName: '',
    email: '',
    phone: '',
    roleId: '',
    roleCode: '',
    roleName: '',
    homeBranchId: '',
    branchId: '',
    branchName: '',
    contractType: 'FULL_TIME',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Quản trị trạng thái tài khoản & Xóa tài khoản (khi Chỉnh sửa)
  const [accountStatus, setAccountStatus] = useState(initialData?.status || 'ACTIVE');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Xác định quyền Chủ Doanh Nghiệp (Business Owner)
  const storedUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();
  const currentRole = (storedUser?.role || storedUser?.Role || '').toUpperCase();
  const effectiveIsBusinessOwner = isBusinessOwner || currentRole === 'BUSINESS_OWNER' || currentRole.includes('OWNER');

  // Quản lý Effective Quota của Chi nhánh đang chọn
  const [branchQuota, setBranchQuota] = useState(null);
  const [loadingQuota, setLoadingQuota] = useState(false);
  const [upgradingTier, setUpgradingTier] = useState(false);

  // Tính toán trạng thái đạt trần định biên hiệu dụng
  const isQuotaReached = Boolean(
    branchQuota &&
    (branchQuota.isQuotaReached ?? branchQuota.isStandardQuotaReached ?? false)
  );

  // ─── State: Import Hàng Loạt ──────────────────────────────────────────────
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [importEmployeeCount, setImportEmployeeCount] = useState(5);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importMessage, setImportMessage] = useState('');
  const [importStatus, setImportStatus] = useState('idle'); // 'idle' | 'success' | 'partial' | 'error'

  // Phân quyền chọn Vai trò:
  const availableRoles = (roles.length > 0 ? roles : STORE_ROLES).filter((r) => {
    return !['OPERATIONS_ADMIN', 'STORE_MANAGER', 'BUSINESS_OWNER'].includes(r.roleCode);
  });

  // Reset form & import khi mở modal
  useEffect(() => {
    if (isOpen) {
      setActiveTab('manual');
      setSelectedFile(null);
      setFileError('');
      setImportResult(null);
      setImportMessage('');
      setImportStatus('idle');
      setAccountStatus(initialData?.status || 'ACTIVE');
      setShowDeleteConfirm(false);
      setIsDeleting(false);
      setIsTogglingStatus(false);

      if (initialData) {
        setFormData({
          employeeCode: initialData.employeeCode || '',
          fullName: initialData.fullName || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          roleId: initialData.roleId ? String(initialData.roleId) : '',
          roleCode: initialData.roleCode || '',
          roleName: initialData.roleName || '',
          homeBranchId: initialData.homeBranchId || initialData.branchId ? String(initialData.homeBranchId || initialData.branchId) : '',
          branchId: initialData.homeBranchId || initialData.branchId ? String(initialData.homeBranchId || initialData.branchId) : '',
          branchName: initialData.branchName || currentStoreBranchName || '',
          contractType: initialData.contractType || initialData.employmentType || 'FULL_TIME',
          password: '',
        });
      } else {
        const defaultBranchId = isStoreManager && currentStoreBranchId
          ? String(currentStoreBranchId)
          : '';

        const defaultBranch = isStoreManager && currentStoreBranchId
          ? branches.find((b) => String(b.id || b.storeId) === String(defaultBranchId))
          : null;

        setFormData({
          employeeCode: `NV-${Math.floor(1000 + Math.random() * 9000)}`,
          fullName: '',
          email: '',
          phone: '',
          roleId: '',
          roleCode: '',
          roleName: '',
          homeBranchId: defaultBranchId,
          branchId: defaultBranchId,
          branchName: defaultBranch?.name || currentStoreBranchName || '',
          contractType: 'FULL_TIME',
          password: `Rwfm@${Math.floor(100000 + Math.random() * 900000)}`,
        });
        setBranchQuota(null);
      }
      setErrors({});
    }
  }, [initialData, isOpen, isStoreManager, currentStoreBranchId]);

  // Tải Effective Quota khi chọn chi nhánh (khi tạo mới)
  useEffect(() => {
    const targetBranchId = formData.branchId || formData.homeBranchId;
    if (!targetBranchId || isEdit || !isOpen || activeTab !== 'manual') {
      if (!isEdit && !targetBranchId) {
        setBranchQuota(null);
      }
      return;
    }

    let mounted = true;
    const fetchQuota = async () => {
      setLoadingQuota(true);
      try {
        const foundBranch = branches.find((b) => String(b.id || b.storeId) === String(targetBranchId));
        const tier = foundBranch?.branchTier || foundBranch?.tier || 2;
        const quotaRes = await headcountService.getBranchHeadcountStatus(targetBranchId, tier);
        if (mounted && quotaRes.success) {
          setBranchQuota(quotaRes.data);
        }
      } catch (err) {
        console.warn('Lỗi khi tải quota chi nhánh:', err);
      } finally {
        if (mounted) setLoadingQuota(false);
      }
    };

    fetchQuota();
    return () => {
      mounted = false;
    };
  }, [formData.branchId, formData.homeBranchId, branches, isEdit, isOpen, activeTab]);

  // Sinh mật khẩu ngẫu nhiên
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = 'Rwfm@';
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pwd }));
  };

  // Nâng Tier Chi Nhánh Trực Tiếp
  const handleUpgradeTier = async () => {
    if (!branchQuota?.branchId) return;
    setUpgradingTier(true);
    try {
      const res = await headcountService.upgradeBranchTier(branchQuota.branchId);
      if (res.success) {
        toast?.success?.(
          `Đã nâng chi nhánh lên Tier ${res.data?.newTier || branchQuota.branchTier - 1}. Định biên mở rộng: ${res.data?.newQuota || ''} nhân sự!`
        );
        const quotaRes = await headcountService.getBranchHeadcountStatus(
          branchQuota.branchId,
          res.data?.newTier || branchQuota.branchTier - 1
        );
        if (quotaRes.success) {
          setBranchQuota(quotaRes.data);
        }
        if (onBranchTierUpgraded) {
          await onBranchTierUpgraded();
        }
      } else {
        toast?.error?.(res.message || 'Không thể nâng Tier chi nhánh.');
      }
    } catch (err) {
      toast?.error?.('Có lỗi xảy ra khi nâng Tier chi nhánh.');
    } finally {
      setUpgradingTier(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'roleId') {
        const found = availableRoles.find((r) => String(r.id) === String(value));
        next.roleCode = found?.roleCode || '';
        next.roleName = found?.roleName || '';
      }
      if (field === 'branchId') {
        const found = branches.find((b) => String(b.id || b.storeId) === String(value));
        next.homeBranchId = value;
        next.branchName = found?.name || '';
      }
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Validate form
  // Khóa / Mở khóa tài khoản ngay trong form chỉnh sửa
  const handleToggleAccountStatus = async () => {
    if (!initialData?.id) return;
    const targetStatus = accountStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setIsTogglingStatus(true);
    try {
      const res = await employeeService.toggleUserStatus(initialData.id, targetStatus);
      if (res.success) {
        setAccountStatus(targetStatus);
        toast.success(res.message || (targetStatus === 'ACTIVE' ? 'Đã mở khóa tài khoản thành công!' : 'Đã khóa tài khoản thành công!'));
        if (onToggleStatus) {
          onToggleStatus(initialData.id, targetStatus);
        }
      } else {
        toast.error(res.message || 'Không thể cập nhật trạng thái tài khoản.');
      }
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái tài khoản.');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Xóa tài khoản nhân sự (Chỉ được xóa khi tài khoản đã bị khóa)
  const handleDeleteAccount = async () => {
    if (!initialData?.id) return;
    if (accountStatus === 'ACTIVE') {
      toast.error('Tài khoản đang hoạt động. Bạn phải khóa tài khoản trước khi thực hiện xóa!');
      return;
    }
    setIsDeleting(true);
    try {
      const res = await employeeService.deleteEmployee(initialData.id);
      if (res.success) {
        toast.success(res.message || 'Đã xóa tài khoản nhân sự thành công!');
        setShowDeleteConfirm(false);
        onClose();
        if (onDeleteSuccess) {
          onDeleteSuccess(initialData.id);
        }
      } else {
        toast.error(res.message || 'Không thể xóa tài khoản nhân sự.');
      }
    } catch (err) {
      toast.error('Lỗi khi thực hiện xóa tài khoản.');
    } finally {
      setIsDeleting(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.employeeCode.trim()) newErrors.employeeCode = 'Mã nhân viên là bắt buộc';
    if (!formData.fullName.trim()) newErrors.fullName = 'Họ và tên là bắt buộc';
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại Việt Nam không hợp lệ';
    }
    if (!formData.roleId) newErrors.roleId = 'Vui lòng chọn vai trò';
    if (!formData.branchId && !formData.homeBranchId) newErrors.branchId = 'Vui lòng chọn chi nhánh';

    // Ràng buộc duy nhất 1 Cửa hàng trưởng trên mỗi chi nhánh
    if (formData.roleCode === 'STORE_MANAGER' && branchQuota?.hasActiveStoreManager && (!isEdit || initialData?.id !== branchQuota?.activeStoreManagerId)) {
      newErrors.roleId = `Chi nhánh này đã có Cửa hàng trưởng (${branchQuota.activeStoreManagerName || ''}). Mỗi chi nhánh chỉ được phép có tối đa 1 Cửa hàng trưởng.`;
    }

    if (!isEdit && (!formData.password || formData.password.length < 6)) {
      newErrors.password = 'Mật khẩu khởi tạo cần tối thiểu 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData, isEdit);
      onClose();
    } catch (err) {
      console.error('Submit employee error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Xử Lý Import Hàng Loạt ───────────────────────────────────────────────
  const handleDownloadTemplate = async () => {
    if (isDownloadingTemplate) return;
    setIsDownloadingTemplate(true);
    try {
      const count = Math.max(1, Math.min(Number(importEmployeeCount) || 5, 500));
      const result = await employeeService.downloadImportTemplate(count);
      if (!result.success) {
        toast?.error?.(result.message || 'Không thể tải file mẫu. Vui lòng thử lại.');
      }
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleFileValidation = useCallback((file) => {
    const allowedExts = ['.xlsx', '.xls', '.csv'];
    const ext = ('.' + file.name.split('.').pop()).toLowerCase();
    if (!allowedExts.includes(ext)) {
      setFileError(`Định dạng không hỗ trợ. Hãy chọn: ${allowedExts.join(', ')}.`);
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

  // ─── Tải file báo cáo lỗi chi tiết khi lỗi quá 5 dòng ───
  const handleDownloadErrorReport = async (errors, sourceFileName = 'Danh_Sach_Nhan_Su.xlsx') => {
    if (!errors || errors.length === 0) return;

    try {
      const res = await employeeService.exportImportErrors({ errors, sourceFileName });
      if (res?.success) return;
    } catch (e) {
      console.warn('Backend export failed, fallback to client CSV export', e);
    }

    // Fallback: xuất CSV nếu offline
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const cleanBaseName = sourceFileName ? sourceFileName.replace(/\.[^/.]+$/, '').replace(/[\s\W]+/g, '_') : 'Import_Nhan_Su';
    const outFileName = `Bao_Cao_Loi_${cleanBaseName}_${timestamp}.csv`;

    const headers = [
      'STT',
      'Dòng Excel',
      'Mã Nhân Viên',
      'Họ Và Tên',
      'Email',
      'Chi Tiết Lý Do Lỗi',
      'Thời Gian Ghi Nhận',
    ];

    const escapeCsv = (val) => {
      const str = String(val ?? '').trim();
      return `"${str.replace(/"/g, '""')}"`;
    };

    const formattedTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

    const rows = errors.map((errRow, idx) => {
      const rowNum = errRow.rowNumber ?? errRow.RowNumber ?? errRow.rowIndex ?? errRow.RowIndex ?? (idx + 2);
      const code = errRow.employeeCode ?? errRow.EmployeeCode ?? errRow.rowData?.employeeCode ?? errRow.RowData?.EmployeeCode ?? '—';
      const name = errRow.fullName ?? errRow.FullName ?? errRow.rowData?.fullName ?? errRow.RowData?.FullName ?? '';
      const email = errRow.email ?? errRow.Email ?? errRow.rowData?.email ?? errRow.RowData?.Email ?? '';
      const rawMsg = errRow.errorMessage ?? errRow.ErrorMessage ?? errRow.errorMessages ?? errRow.ErrorMessages;
      const errMsg = Array.isArray(rawMsg) ? rawMsg.join('; ') : (rawMsg || 'Dữ liệu không hợp lệ');

      return [
        idx + 1,
        `Dòng ${rowNum}`,
        escapeCsv(code),
        escapeCsv(name),
        escapeCsv(email),
        escapeCsv(errMsg),
        escapeCsv(formattedTime),
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = outFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 200);
  };

  const handleImport = async () => {
    if (isImporting) return;
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
        defaultBranchId: isStoreManager && currentStoreBranchId ? String(currentStoreBranchId) : null,
      });

      setImportMessage(result.message || '');

      if (result.data) {
        setImportResult(result.data);
        const { successCount, failureCount } = result.data;

        if (!result.success && failureCount > 0 && successCount === 0) {
          setImportStatus('error');
        } else if (result.isPartialSuccess) {
          setImportStatus('partial');
          onImportSuccess?.();
        } else if (result.success) {
          setImportStatus('success');
          onImportSuccess?.();
        }
      } else {
        setImportStatus('error');
      }
    } catch (err) {
      setImportStatus('error');
      setImportMessage(err?.message || 'Có lỗi xảy ra trong quá trình kết nối server import.');
    } finally {
      setIsImporting(false);
    }
  };

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

  // Tiêu đề & mô tả Modal
  const title = isEdit
    ? `Hồ Sơ Nhân Sự: ${initialData?.fullName || ''}`
    : activeTab === 'bulk'
      ? 'Import Nhân Sự Hàng Loạt (Excel/CSV)'
      : isStoreManager
        ? 'Khai Báo Nhân Sự Chi Nhánh'
        : 'Khai Báo Hồ Sơ Nhân Sự Chuỗi Bán Lẻ';

  const sub = isEdit
    ? 'Thông tin hồ sơ nhân sự ở chế độ chỉ đọc. Quản trị viên chỉ có quyền Cấp lại mật khẩu hoặc Quản trị trạng thái tài khoản.'
    : activeTab === 'bulk'
      ? 'Tải file mẫu Excel chuẩn, điền danh sách nhân sự và tải lên hệ thống để thêm hàng loạt.'
      : 'Hệ thống tự động băm mật khẩu bảo mật và kích hoạt gửi Welcome Email có thông tin tài khoản & link đăng nhập.';

  return (
    <>
      <Modal
        open={isOpen}
        onClose={isImporting ? undefined : onClose}
        title={title}
        sub={sub}
        width={activeTab === 'bulk' ? 720 : 680}
        footer={
          activeTab === 'bulk' ? (
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
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              {!isEdit && isQuotaReached ? (
                <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>

                  {branchQuota?.canUpgradeTier
                    ? `Đã đầy định biên (${branchQuota?.officialHeadcount ?? branchQuota?.currentHeadcount}/${branchQuota?.standardQuota}). Vui lòng nâng Tier ở trên để tuyển thêm.`
                    : `Chi nhánh đã đạt kịch trần tối đa Tier 1 (30/30). Không thể tuyển thêm.`}
                </span>
              ) : (
                <div />
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="ghost" onClick={onClose} disabled={submitting}>
                  {isEdit ? 'Đóng' : 'Hủy Bỏ'}
                </Button>
                {!isEdit && (
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={submitting || isQuotaReached}
                    title={isQuotaReached ? 'Vui lòng nâng Tier chi nhánh trước khi thêm nhân viên' : ''}
                  >
                    {submitting ? 'Đang xử lý...' : 'Xác Nhận Khai Báo'}
                  </Button>
                )}
              </div>
            </div>
          )
        }
      >
        {/* ─── TAB SWITCHER: Khai Báo Thủ Công vs Import Hàng Loạt (Chỉ hiện khi Tạo Mới và Có Quyền Quản Trị) ─── */}
        {!isEdit && canManageSystem && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '4px',
              borderRadius: '10px',
              border: `1px solid ${c.border}`,
              marginBottom: '18px',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'manual' ? c.accent : 'transparent',
                color: activeTab === 'manual' ? '#fff' : c.fgMuted,
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: activeTab === 'manual' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              <Icon name="plus" size={15} color={activeTab === 'manual' ? '#fff' : c.fgMuted} />
              <span>Khai Báo Thủ Công</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bulk')}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'bulk' ? c.accent : 'transparent',
                color: activeTab === 'bulk' ? '#fff' : c.fgMuted,
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: activeTab === 'bulk' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              <Icon name="table-import" size={15} color={activeTab === 'bulk' ? '#fff' : c.fgMuted} />
              <span>Import Nhân Sự Hàng Loạt (Excel/CSV)</span>
            </button>
          </div>
        )}

        {/* ─── TAB 1: FORM KHAI BÁO THỦ CÔNG ─── */}
        {activeTab === 'manual' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Banner Welcome Email */}
            {!isEdit && (
              <div
                style={{
                  padding: '12px 14px',
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '12.5px',
                  color: '#86efac',
                }}
              >
                <Icon name="check" size={16} color="#22c55e" />
                <span>
                  <strong>Tự Động Gửi Welcome Email:</strong> Sau khi khai báo, Backend sẽ tự động gửi thư chào mừng HTML chuyên nghiệp tới Email nhân sự kèm Mã NV, Mật khẩu khởi tạo và đường link đăng nhập.
                </span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Mã nhân viên */}
              <Field label="Mã Định Danh Nhân Viên" required error={errors.employeeCode}>
                <TextInput
                  value={formData.employeeCode}
                  onChange={(e) => handleChange('employeeCode', e.target.value.toUpperCase())}
                  placeholder="VD: NV-001 hoặc SM-001"
                  disabled={isEdit}
                />
              </Field>

              {/* Họ và tên */}
              <Field label="Họ và Tên Đầy Đủ" required error={errors.fullName}>
                <TextInput
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="VD: Nguyễn Văn An"
                  disabled={isEdit}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Email */}
              <Field label="Email" required error={errors.email}>
                <TextInput
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="VD: an.nguyen@rwfm.vn"
                  disabled={isEdit}
                />
              </Field>

              {/* Số điện thoại */}
              <Field label="Số Điện Thoại" required error={errors.phone}>
                <TextInput
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="VD: 0912345678"
                  disabled={isEdit}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Vai trò (Role) */}
              <Field
                label="Vai Trò Cửa Hàng"
              >
                <select
                  value={formData.roleId}
                  onChange={(e) => handleChange('roleId', e.target.value)}
                  disabled={isEdit}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: isEdit ? c.track : c.bgRaised,
                    border: `1px solid ${errors.roleId ? '#ef4444' : c.border}`,
                    borderRadius: '6px',
                    color: isEdit ? c.fgSubtle : c.fg,
                    fontSize: '13.5px',
                    outline: 'none',
                    cursor: isEdit ? 'not-allowed' : 'pointer',
                  }}
                >
                  <option value="">-- Chọn vai trò --</option>
                  {availableRoles
                    .filter((r) => !['BUSINESS_OWNER', 'OPERATIONS_ADMIN', 'ADMIN'].includes(r.roleCode))
                    .map((r) => {
                      const isStoreManagerRole = r.roleCode === 'STORE_MANAGER';
                      const isAlreadyTaken =
                        isStoreManagerRole &&
                        branchQuota?.hasActiveStoreManager &&
                        (!isEdit || initialData?.id !== branchQuota?.activeStoreManagerId);

                      return (
                        <option key={r.id} value={String(r.id)} disabled={isAlreadyTaken}>
                          {r.roleName} ({r.roleCode})
                          {isAlreadyTaken ? ` — (Đã có: ${branchQuota?.activeStoreManagerName || 'CHT'})` : ''}
                        </option>
                      );
                    })}
                </select>
              </Field>

              {/* Chi nhánh công tác */}
              <Field
                label="Chi Nhánh Công Tác (Bắt buộc)"
                required
                hint={isStoreManager ? 'Cố định chi nhánh của bạn' : ''}
                error={errors.branchId}
              >
                <select
                  value={formData.branchId || formData.homeBranchId}
                  onChange={(e) => handleChange('branchId', e.target.value)}
                  disabled={isEdit || isStoreManager}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: (isEdit || isStoreManager) ? c.track : c.bgRaised,
                    border: `1px solid ${errors.branchId ? '#ef4444' : c.border}`,
                    borderRadius: '6px',
                    color: (isEdit || isStoreManager) ? c.fgSubtle : c.fg,
                    fontSize: '13.5px',
                    outline: 'none',
                    cursor: (isEdit || isStoreManager) ? 'not-allowed' : 'pointer',
                  }}
                >
                  <option value="">-- Chọn chi nhánh --</option>
                  {branches.map((b) => (
                    <option key={b.id || b.storeId} value={String(b.id || b.storeId)}>
                      {b.name || `Chi nhánh #${b.id || b.storeId}`}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Banner Định Biên Chuẩn Theo Phân Cấp Tier (Khi Tạo Mới) */}
            {!isEdit && branchQuota && (
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '8px',
                  background: isQuotaReached
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'rgba(34, 197, 94, 0.08)',
                  border: `1px solid ${isQuotaReached
                    ? 'rgba(239, 68, 68, 0.35)'
                    : 'rgba(34, 197, 94, 0.3)'
                    }`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                    <Icon
                      name={isQuotaReached ? 'warning' : 'check'}
                      size={16}
                      color={isQuotaReached ? '#ef4444' : '#22c55e'}
                    />
                    <span style={{ color: isQuotaReached ? '#fca5a5' : '#86efac' }}>
                      Định biên Phân Cấp Tier {branchQuota.branchTier}: {branchQuota.officialHeadcount ?? branchQuota.currentHeadcount} / {branchQuota.standardQuota} nhân sự cơ hữu
                      {branchQuota.dispatchedInCount > 0 && ` (+${branchQuota.dispatchedInCount} điều động hỗ trợ)`}
                      {loadingQuota && ' (đang tải...)'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: branchQuota.branchTier === 1 ? '#eab308' : branchQuota.branchTier === 2 ? '#3b82f6' : '#9ca3af',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                      }}
                    >
                      Tier {branchQuota.branchTier} (Chuẩn {branchQuota.standardQuota})
                    </span>
                    {branchQuota.inactiveCount > 0 && (
                      <span style={{ fontSize: '11.5px', color: c.fgSubtle }}>
                        Đã nghỉ: {branchQuota.inactiveCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Thông tin slot hoặc Cơ chế Nâng Tier khi kịch biên */}
                {!isQuotaReached ? (
                  <div style={{ fontSize: '12px', color: '#86efac' }}>
                    ✓ Chi nhánh còn trống{' '}
                    <strong>{branchQuota.standardQuota - (branchQuota.officialHeadcount ?? branchQuota.currentHeadcount)}</strong> vị trí theo định biên chuẩn.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '8px',
                      borderTop: '1px dashed rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#fca5a5' }}>
                      {branchQuota.canUpgradeTier ? (
                        <span>
                          ⚠️ Đã đạt trần Tier {branchQuota.branchTier}. Bạn có thể nâng chi nhánh lên{' '}
                          <strong>Tier {branchQuota.branchTier - 1}</strong> để tuyển thêm.
                        </span>
                      ) : (
                        <span>❌ Chi nhánh đã đạt kịch trần cao nhất Tier 1 (30 nhân sự). Không thể tuyển thêm!</span>
                      )}
                    </div>

                    {branchQuota.canUpgradeTier && canManageSystem && (
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleUpgradeTier}
                        disabled={upgradingTier}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          background: '#eab308',
                          color: '#000',
                          fontWeight: 700,
                        }}
                      >
                        {upgradingTier ? 'Đang Nâng Tier...' : `⚡ Nâng Lên Tier ${branchQuota.branchTier - 1}`}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Loại hình hợp đồng lao động */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <Field label="Hình Thức Hợp Đồng Lao Động" required>
                <select
                  value={formData.contractType}
                  onChange={(e) => handleChange('contractType', e.target.value)}
                  disabled={isEdit}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: isEdit ? c.track : c.bgRaised,
                    border: `1px solid ${c.border}`,
                    borderRadius: '6px',
                    color: isEdit ? c.fgSubtle : c.fg,
                    fontSize: '13.5px',
                    outline: 'none',
                    cursor: isEdit ? 'not-allowed' : 'pointer',
                  }}
                >
                  {CONTRACT_TYPES.map((ct) => (
                    <option key={ct.value} value={ct.value}>
                      {ct.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* ─── VÙNG QUẢN TRỊ TÀI KHOẢN (DÀNH CHO ADMIN / OWNER KHI CHỈNH SỬA) ─── */}
            {isEdit && canManageSystem && (
              <div
                style={{
                  marginTop: '4px',
                  padding: '16px',
                  borderRadius: '8px',
                  background: c.bgCard,
                  border: `1px solid ${accountStatus === 'INACTIVE' ? 'rgba(239, 68, 68, 0.4)' : c.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: c.fg }}>
                    Quản Trị Trạng Thái & Bảo Mật Tài Khoản
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: c.fgSubtle }}>Trạng thái:</span>
                    {accountStatus === 'INACTIVE' ? (
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: 'rgba(239, 68, 68, 0.12)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                        }}
                      >
                        Đã Khóa
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: 'rgba(34, 197, 94, 0.12)',
                          color: '#22c55e',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                        }}
                      >
                        Đang Hoạt Động
                      </span>
                    )}
                  </div>
                </div>

                {/* Các nút hành động: Khóa/Mở, Reset mật khẩu, Xóa tài khoản */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                    paddingTop: '6px',
                    borderTop: `1px solid ${c.border}`,
                  }}
                >
                  {/* Nút Khóa / Mở Khóa: Kích hoạt modal xác nhận có lý do & kiểm tra dịch vụ */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      onClose();
                      onToggleStatus?.(initialData);
                    }}
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 600,
                      border: `1px solid ${accountStatus === 'INACTIVE' ? '#22c55e' : '#f59e0b'}`,
                      color: accountStatus === 'INACTIVE' ? '#22c55e' : '#f59e0b',
                      background: accountStatus === 'INACTIVE' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                    }}
                  >
                    <span>
                      {accountStatus === 'INACTIVE' ? 'Mở Khóa Tài Khoản' : 'Khóa Tài Khoản'}
                    </span>
                  </Button>

                  {/* Nút Reset Mật Khẩu: Kích hoạt modal reset có lý do và gửi email */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      onClose();
                      onResetPassword?.(initialData);
                    }}
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 600,
                      border: '1px solid #f2ca50',
                      color: '#f2ca50',
                      background: 'rgba(242, 202, 80, 0.05)',
                    }}
                  >
                    <span>Reset Mật Khẩu</span>
                  </Button>

                  {/* Nút Xóa Tài Khoản: Bắt buộc đã khóa và đủ thời gian chờ 14 ngày (áp dụng tuyệt đối cho mọi tài khoản) */}
                  {(() => {
                    const lockedDate = initialData?.lockedAt ? new Date(initialData.lockedAt) : (initialData?.updatedAt ? new Date(initialData.updatedAt) : null);
                    const daysPassed = lockedDate ? Math.floor((new Date() - lockedDate) / (1000 * 60 * 60 * 24)) : 0;
                    const daysRemaining = initialData?.daysUntilDeletable ?? Math.max(0, 14 - daysPassed);
                    const isDeletable = accountStatus === 'INACTIVE' && daysRemaining === 0;

                    return (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowDeleteConfirm(true)}
                          disabled={!isDeletable}
                          style={{
                            fontSize: '12.5px',
                            fontWeight: 600,
                            border: `1px solid ${isDeletable ? '#ef4444' : c.border}`,
                            color: isDeletable ? '#ef4444' : c.fgSubtle,
                            background: isDeletable ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                            cursor: isDeletable ? 'pointer' : 'not-allowed',
                            opacity: isDeletable ? 1 : 0.5,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.2s',
                          }}
                          title={
                            accountStatus === 'ACTIVE'
                              ? 'Bạn phải khóa tài khoản trước khi thực hiện xóa'
                              : !isDeletable
                                ? `Cần chờ đủ 14 ngày kể từ khi khóa (còn ${daysRemaining} ngày nữa)`
                                : 'Xóa vĩnh viễn tài khoản khỏi hệ thống và CSDL'
                          }
                        >

                          <span>Xóa Vĩnh Viễn</span>
                        </Button>
                      </>
                    );
                  })()}
                </div>

                {/* Dòng cảnh báo điều kiện xóa & quy định lưu trữ 14 ngày */}
                <div style={{ fontSize: '11.5px', lineHeight: '1.4' }}>
                  {(() => {
                    const lockedDate = initialData?.lockedAt ? new Date(initialData.lockedAt) : (initialData?.updatedAt ? new Date(initialData.updatedAt) : null);
                    const daysPassed = lockedDate ? Math.floor((new Date() - lockedDate) / (1000 * 60 * 60 * 24)) : 0;
                    const daysRemaining = initialData?.daysUntilDeletable ?? Math.max(0, 14 - daysPassed);

                    if (accountStatus === 'ACTIVE') {
                      return (
                        <span style={{ color: '#f87171' }}>
                          <strong>Điều kiện xóa:</strong> Tài khoản đang hoạt động nên nút Xóa bị vô hiệu hóa. Bạn cần bấm <strong>"Khóa Tài Khoản"</strong> trước khi có thể xóa.
                        </span>
                      );
                    }
                    if (daysRemaining > 0) {
                      return (
                        <span style={{ color: '#f59e0b' }}>
                          <strong>Quy định lưu trữ 14 ngày:</strong> Tài khoản đã khóa được {daysPassed} ngày. Theo chính sách đối soát bảng công và tiền lương (bắt buộc áp dụng cho mọi cấp quản lý), tài khoản chỉ có thể xóa vĩnh viễn sau <strong>{daysRemaining} ngày</strong> nữa.
                        </span>
                      );
                    }
                    return (
                      <span style={{ color: '#4ade80' }}>
                        ✅ <strong>Đã đủ điều kiện:</strong> Tài khoản đã khóa đủ 14 ngày theo quy định lưu trữ. Bạn có thể thực hiện xóa vĩnh viễn tài khoản này khỏi hệ thống và CSDL.
                      </span>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Mật khẩu khởi tạo (Chỉ khi tạo mới) */}
            {!isEdit && (
              <div
                style={{
                  padding: '14px 16px',
                  background: 'rgba(242, 202, 80, 0.05)',
                  border: `1px solid rgba(242, 202, 80, 0.25)`,
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#f2ca50' }}>
                    Mật Khẩu Đăng Nhập Khởi Tạo *
                  </span>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: c.accent,
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Icon name="refresh" size={13} />
                    <span>Sinh mật khẩu ngẫu nhiên</span>
                  </button>
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Nhập mật khẩu hoặc dùng mật khẩu tự sinh"
                    style={{
                      width: '100%',
                      padding: '9px 40px 9px 12px',
                      background: c.bgCard,
                      border: `1px solid ${errors.password ? '#ef4444' : c.border}`,
                      borderRadius: '6px',
                      color: c.fg,
                      fontSize: '13.5px',
                      fontFamily: fonts.mono,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'transparent',
                      border: 'none',
                      color: c.fgSubtle,
                      cursor: 'pointer',
                    }}
                  >
                    <Icon name="eye" size={16} />
                  </button>
                </div>
                {errors.password && (
                  <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.password}</span>
                )}
                <span style={{ fontSize: '11.5px', color: c.fgSubtle }}>
                  Mật khẩu này sẽ được tự động băm BCrypt an toàn trên Backend và gửi vào nội dung Welcome Email.
                </span>
              </div>
            )}
          </form>
        )}

        {/* ─── TAB 2: IMPORT NHÂN SỰ HÀNG LOẠT (EXCEL/CSV) ─── */}
        {activeTab === 'bulk' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* BƯỚC 1: Chọn số lượng & Tải file mẫu */}
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
                      value={importEmployeeCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setImportEmployeeCount(isNaN(val) ? '' : Math.max(1, Math.min(val, 500)));
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
                        onClick={() => setImportEmployeeCount(preset)}
                        disabled={isDownloadingTemplate || isImporting}
                        style={{
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          borderRadius: '4px',
                          border: importEmployeeCount === preset ? `1px solid ${c.accent}` : `1px solid ${c.border}`,
                          background: importEmployeeCount === preset ? `${c.accent}20` : 'transparent',
                          color: importEmployeeCount === preset ? c.accent : c.fgSubtle,
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
                    disabled={isDownloadingTemplate || isImporting || !importEmployeeCount}
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
                      : `Tạo & Tải File Mẫu (${importEmployeeCount || 0} Nhân Sự)`}
                  </button>
                </div>
              </div>
            </div>

            {/* BƯỚC 2: Chọn File Dữ Liệu */}
            <div>
              <div style={sectionHeaderStyle}>
                <span style={stepNumStyle(true)}>2</span>
                <span>Chọn Hoặc Kéo Thả File Dữ Liệu</span>
              </div>
              <Field error={fileError}>
                <div
                  onClick={() => !isImporting && fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={isImporting ? undefined : handleDrop}
                  style={{
                    border: `2px dashed ${fileError ? '#EF4444' : selectedFile ? '#0D9488' : c.border}`,
                    borderRadius: '8px',
                    padding: '22px 16px',
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
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: selectedFile ? 'rgba(13, 148, 136, 0.12)' : 'rgba(13, 148, 136, 0.06)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: selectedFile ? '#0D9488' : c.accent, marginBottom: '8px',
                  }}>
                    <Icon name={selectedFile ? getFileExtIcon(selectedFile.name) : 'import'} size={20} />
                  </div>
                  {selectedFile ? (
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0D9488' }}>{selectedFile.name}</div>
                      <div style={{ fontSize: '12px', color: c.fgSubtle, marginTop: '3px' }}>
                        {(selectedFile.size / 1024).toFixed(1)} KB • Bấm để chọn file khác
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: c.fg }}>
                        Kéo thả file vào đây hoặc{' '}
                        <span style={{ color: c.accent, textDecoration: 'underline' }}>chọn từ máy tính</span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: c.fgSubtle, marginTop: '4px' }}>
                        Hỗ trợ: .xlsx, .xls, .csv • Dung lượng tối đa 20MB
                      </div>
                    </div>
                  )}
                </div>
              </Field>
            </div>

            {/* BƯỚC 3: Kết Quả & Danh Sách Lỗi */}
            {importStatus !== 'idle' && (
              <div style={{
                padding: '16px',
                background: currentStatus.bg,
                border: `1px solid ${currentStatus.border}`,
                borderRadius: '8px',
              }}>
                <div style={sectionHeaderStyle}>
                  <span style={stepNumStyle(true)}>3</span>
                  <span>Kết Quả Import</span>
                </div>

                {/* Thống kê dòng */}
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

                {/* Thông báo kết quả */}
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

                {/* Bảng lỗi chi tiết nếu có */}
                {importResult?.errors?.length > 0 && (
                  <div style={{ marginLeft: '30px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#EF4444', marginBottom: '8px' }}>
                      {importResult.errors.length > 5
                        ? `Chi tiết lỗi (Hiển thị 5 / ${importResult.errors.length} dòng vi phạm):`
                        : `Chi tiết lỗi (${importResult.errors.length} dòng vi phạm):`}
                    </div>
                    <div
                      className="import-error-scrollbar"
                      style={{
                        maxHeight: '160px',
                        overflowY: 'auto',
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
                            <th style={{ padding: '8px 10px', textAlign: 'left', color: c.fgMuted, fontWeight: 600, position: 'sticky', top: 0, background: c.bgElev, borderBottom: `1px solid ${c.border}` }}>Mã NV / Họ Tên</th>
                            <th style={{ padding: '8px 10px', textAlign: 'left', color: c.fgMuted, fontWeight: 600, position: 'sticky', top: 0, background: c.bgElev, borderBottom: `1px solid ${c.border}` }}>Chi Tiết Lý Do Lỗi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(importResult.errors.length > 5 ? importResult.errors.slice(0, 5) : importResult.errors).map((errRow, idx) => {
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

                    {/* Hiển thị một dòng tải file báo lỗi ở cuối khi lỗi > 5 dòng */}
                    {importResult.errors.length > 5 && (
                      <div style={{
                        marginTop: '10px',
                        padding: '8px 12px',
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.22)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}>
                        <span style={{ fontSize: '12px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icon name="warning" size={14} color="#DC2626" />
                          <span>Có <strong>{importResult.errors.length} dòng lỗi</strong> (đã ghi đầy đủ vào file).</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDownloadErrorReport(importResult.errors, selectedFile?.name)}
                          style={{
                            padding: '5px 12px',
                            background: '#DC2626',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap',
                            transition: 'opacity 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                        >
                          <Icon name="download" size={13} color="#FFFFFF" />
                          <span>Tải file báo lỗi ({importResult.errors.length} dòng)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ─── MODAL XÁC NHẬN XÓA TÀI KHOẢN (Chỉ khi tài khoản đã bị khóa) ─── */}
      <Modal
        open={showDeleteConfirm}
        onClose={() => !isDeleting && setShowDeleteConfirm(false)}
        title="Xác Nhận Xóa Vĩnh Viễn Tài Khoản"
        sub={`Hành động này sẽ xóa hoàn toàn tài khoản #${initialData?.id} khỏi hệ thống.`}
        width={480}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
              Hủy Bỏ
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              style={{ background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon name="trash" size={14} color="#fff" />
              <span>{isDeleting ? 'Đang Xóa...' : 'Xác Nhận Xóa'}</span>
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px', color: c.fg }}>
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#fca5a5',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <Icon name="alert-triangle" size={18} color="#ef4444" />
            <div>
              <strong>Cảnh Báo Quan Trọng:</strong> Bạn đang chuẩn bị xóa tài khoản nhân sự{' '}
              <strong style={{ color: '#fff' }}>{initialData?.fullName}</strong> (Mã NV:{' '}
              <span style={{ color: '#f2ca50', fontWeight: 600 }}>{initialData?.employeeCode || `NV-${initialData?.id}`}</span>).
              <div style={{ marginTop: '4px', fontSize: '12.5px', color: '#fca5a5' }}>
                Tài khoản sau khi xóa sẽ không thể đăng nhập hoặc phân ca nữa. Thao tác này không thể hoàn tác.
              </div>
            </div>
          </div>

          <div>Bạn có chắc chắn muốn tiếp tục thực hiện xóa tài khoản này không?</div>
        </div>
      </Modal>
    </>
  );
}
