import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import { Field as FormField } from '@/shared/components/ui/FormField';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';
import Icon from '@/shared/components/ui/Icon';
import Select from '@/shared/components/ui/Select';
import {
  calculatePaidHours,
  calculateNightHours,
  checkIsOvernight,
  findOverlappingShift,
  isShiftsOverlapping,
} from '../services/shiftTemplate.service';

/**
 * Tự động xác định loại ca theo giờ bắt đầu và tính chất qua đêm
 */
const getAutoShiftType = (startTime, isOvernight) => {
  if (isOvernight) return 'Night';
  if (!startTime) return 'Morning';
  const [sh] = startTime.split(':').map(Number);
  if (sh >= 21 || sh < 5) return 'Night';
  if (sh >= 12) return 'Afternoon';
  return 'Morning';
};

/**
 * ==============================================================================
 * COMPONENT: ShiftTemplateFormModal.jsx
 * Modal Thêm / Chỉnh sửa Khung ca mẫu (Chung toàn chuỗi hoặc Riêng chi nhánh)
 * Hỗ trợ tạo đơn lẻ và tạo hàng loạt nhiều ca cùng một lúc.
 * ==============================================================================
 */
export default function ShiftTemplateFormModal({
  open = false,
  initialData = null,
  defaultScope = 'GLOBAL',
  defaultBranchId = null,
  branches = [],
  allGlobalShifts = [],
  customShifts = [],
  existingShifts = null,
  onClose,
  onSubmit,
  onDelete,
}) {
  const { c } = useAdminTheme();

  const isEditing = Boolean(initialData);

  // Chế độ tạo: 'SINGLE' (Tạo 1 ca) hoặc 'BATCH' (Tạo nhiều ca cùng lúc)
  const [creationMode, setCreationMode] = useState('SINGLE');

  // Dữ liệu cho chế độ tạo 1 ca
  const [formData, setFormData] = useState({
    scope: 'GLOBAL',
    branchId: '',
    templateCode: '',
    name: '',
    shiftType: 'Morning',
    startTime: '06:00',
    endTime: '14:00',
    breakDuration: 30,
    isActive: true,
    description: '',
  });

  // Dữ liệu cho chế độ tạo nhiều ca (Hàng loạt)
  const [batchShifts, setBatchShifts] = useState([
    {
      id: 'batch_1',
      name: 'Ca Sáng',
      startTime: '06:00',
      endTime: '14:00',
      breakDuration: 30,
      isActive: true,
    },
    {
      id: 'batch_2',
      name: 'Ca Chiều',
      startTime: '14:00',
      endTime: '22:00',
      breakDuration: 30,
      isActive: true,
    },
  ]);

  const [clientErrors, setClientErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Nạp dữ liệu khi mở Modal
  useEffect(() => {
    if (open) {
      setServerError('');
      setClientErrors({});
      setCreationMode('SINGLE');

      if (initialData) {
        setFormData({
          scope: initialData.scope || 'GLOBAL',
          branchId: initialData.branchId ? String(initialData.branchId) : '',
          templateCode: initialData.templateCode || initialData.shiftCode || '',
          name: initialData.name || initialData.shiftName || '',
          shiftType: initialData.shiftType || 'Morning',
          startTime: initialData.startTime?.slice(0, 5) || '06:00',
          endTime: initialData.endTime?.slice(0, 5) || '14:00',
          breakDuration: initialData.breakDuration ?? initialData.breakMinutes ?? 30,
          isActive: initialData.isActive !== undefined ? Boolean(initialData.isActive) : true,
          description: initialData.description || '',
        });
      } else {
        const initScope = defaultScope || 'GLOBAL';
        const initBranchId =
          defaultBranchId
            ? String(defaultBranchId)
            : branches.length > 0
            ? String(branches[0].id ?? branches[0].storeId ?? '')
            : '';

        setFormData({
          scope: initScope,
          branchId: initScope === 'BRANCH' ? initBranchId : '',
          templateCode: '',
          name: '',
          shiftType: 'Morning',
          startTime: '06:00',
          endTime: '14:00',
          breakDuration: 30,
          isActive: true,
          description: '',
        });

        // Khởi tạo sẵn 2 ca mẫu cho chế độ tạo hàng loạt
        setBatchShifts([
          {
            id: 'batch_' + Date.now() + '_1',
            name: 'Ca Sáng',
            startTime: '06:00',
            endTime: '14:00',
            breakDuration: 30,
            isActive: true,
          },
          {
            id: 'batch_' + Date.now() + '_2',
            name: 'Ca Chiều',
            startTime: '14:00',
            endTime: '22:00',
            breakDuration: 30,
            isActive: true,
          },
        ]);
      }
    }
  }, [open, initialData, defaultScope, defaultBranchId, branches]);

  // Tính toán thời gian Live Preview cho Single mode
  const previewIsOvernight = checkIsOvernight(formData.startTime, formData.endTime);
  const previewPaidHours = calculatePaidHours(
    formData.startTime,
    formData.endTime,
    formData.breakDuration
  );
  const previewNightHours = calculateNightHours(formData.startTime, formData.endTime);

  // Lấy danh sách các ca hiện hữu tương ứng theo phạm vi để đối soát chống đè ca & trùng giờ
  const targetShifts = React.useMemo(() => {
    if (formData.scope === 'GLOBAL') {
      if (Array.isArray(allGlobalShifts) && allGlobalShifts.length > 0) {
        return allGlobalShifts;
      }
      if (Array.isArray(existingShifts) && existingShifts.length > 0) {
        return existingShifts.filter(
          (s) => (s.scope || (s.branchId ? 'BRANCH' : 'GLOBAL')) === 'GLOBAL'
        );
      }
      return [];
    } else {
      const branchIdStr = String(formData.branchId || '');
      const listFromCustom = (customShifts || []).filter(
        (s) => !branchIdStr || String(s.branchId) === branchIdStr
      );
      if (listFromCustom.length > 0) return listFromCustom;
      if (Array.isArray(existingShifts) && existingShifts.length > 0) {
        return existingShifts.filter(
          (s) =>
            (s.scope || (s.branchId ? 'BRANCH' : 'GLOBAL')) === 'BRANCH' &&
            (!branchIdStr || String(s.branchId) === branchIdStr)
        );
      }
      return [];
    }
  }, [formData.scope, formData.branchId, allGlobalShifts, customShifts, existingShifts]);

  // Kiểm tra Realtime xem ca hiện tại trong Single mode có bị trùng giờ hoặc đè lên ca nào không
  const overlappingShift = React.useMemo(() => {
    if (creationMode !== 'SINGLE') return null;
    if (!formData.startTime || !formData.endTime || formData.startTime === formData.endTime) {
      return null;
    }
    const currentId =
      initialData?.id ??
      initialData?.shiftId ??
      initialData?.templateId ??
      initialData?.shiftTemplateId;

    return findOverlappingShift(formData, targetShifts, currentId);
  }, [creationMode, formData, targetShifts, initialData]);

  // Kiểm tra xem chi nhánh đang chọn có bị khóa hay không
  const selectedBranchObj = React.useMemo(() => {
    if (formData.scope !== 'BRANCH' || !formData.branchId) return null;
    return branches.find((b) => String(b.id ?? b.storeId) === String(formData.branchId)) || null;
  }, [formData.scope, formData.branchId, branches]);

  const isSelectedBranchLocked = Boolean(
    selectedBranchObj && (selectedBranchObj.isLocked || selectedBranchObj.status === 'LOCKED')
  );

  // Xung đột trong chế độ BATCH (Tạo nhiều ca)
  const batchConflicts = React.useMemo(() => {
    if (creationMode !== 'BATCH') return {};
    const conflicts = {};

    batchShifts.forEach((shift, idx) => {
      // 1. Kiểm tra với các ca khác trong danh sách batch
      for (let j = 0; j < batchShifts.length; j++) {
        if (idx !== j) {
          const other = batchShifts[j];
          if (shift.startTime && shift.endTime && other.startTime && other.endTime) {
            if (isShiftsOverlapping(shift, other)) {
              conflicts[shift.id] = `Trùng/đè giờ với ca "${other.name || `#${j + 1}`}" (${other.startTime} - ${other.endTime})`;
              break;
            }
          }
        }
      }

      // 2. Kiểm tra với các ca đã có sẵn trong cơ sở dữ liệu
      if (!conflicts[shift.id] && shift.startTime && shift.endTime) {
        const dbConflict = findOverlappingShift(shift, targetShifts);
        if (dbConflict) {
          conflicts[shift.id] = dbConflict.conflictMessage || `Trùng/đè lên ca đã có "${dbConflict.name}" (${dbConflict.startTime?.slice(0, 5)} - ${dbConflict.endTime?.slice(0, 5)})`;
        }
      }
    });

    return conflicts;
  }, [creationMode, batchShifts, targetShifts]);

  const hasAnyBatchConflict = Object.keys(batchConflicts).length > 0;

  // Xử lý thay đổi giờ trong Single mode
  const handleTimeChange = (field, value) => {
    const next = { ...formData, [field]: value };
    const start = field === 'startTime' ? value : formData.startTime;
    const end = field === 'endTime' ? value : formData.endTime;

    if (start && end) {
      const isNight = checkIsOvernight(start, end);
      next.shiftType = getAutoShiftType(start, isNight);
    }

    setFormData(next);
    if (clientErrors[field] || clientErrors.time) {
      setClientErrors((prev) => ({ ...prev, [field]: null, time: null }));
    }
  };

  // Client Validation cho Single mode
  const validateSingle = () => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = 'Vui lòng nhập tên khung ca làm việc.';
    }

    if (formData.scope === 'BRANCH') {
      if (!formData.branchId) {
        errors.branchId = 'Vui lòng chọn chi nhánh áp dụng khung ca riêng.';
      } else if (isSelectedBranchLocked) {
        errors.branchId = 'Chi nhánh đang bị tạm khóa. Vui lòng mở khóa chi nhánh trước khi tạo ca riêng.';
      }
    }

    if (!formData.startTime) {
      errors.startTime = 'Vui lòng chọn giờ bắt đầu.';
    }

    if (!formData.endTime) {
      errors.endTime = 'Vui lòng chọn giờ kết thúc.';
    }

    if (formData.startTime && formData.endTime) {
      if (formData.startTime === formData.endTime) {
        errors.time = 'Giờ kết thúc không được trùng với giờ bắt đầu (ca phải >= 1 giờ).';
      } else {
        const currentId =
          initialData?.id ??
          initialData?.shiftId ??
          initialData?.templateId ??
          initialData?.shiftTemplateId;
        const conflict = findOverlappingShift(formData, targetShifts, currentId);
        if (conflict) {
          errors.time =
            conflict.conflictMessage ||
            `Khung giờ (${formData.startTime} - ${formData.endTime}) bị trùng giờ hoặc đè lên ca "${conflict.name}" (${conflict.startTime?.slice(0, 5)} - ${conflict.endTime?.slice(0, 5)}).`;
        }
      }
    }

    const [startH, startM] = (formData.startTime || '00:00').split(':').map(Number);
    const [endH, endM] = (formData.endTime || '00:00').split(':').map(Number);
    let durationMin = endH * 60 + endM - (startH * 60 + startM);
    if (durationMin <= 0) durationMin += 24 * 60;

    const breakMin = Number(formData.breakDuration || 0);
    if (breakMin < 0) {
      errors.breakDuration = 'Thời gian nghỉ không được nhỏ hơn 0 phút.';
    } else if (breakMin >= durationMin) {
      errors.breakDuration = `Thời gian nghỉ (${breakMin}p) phải nhỏ hơn tổng thời lượng ca (${durationMin}p).`;
    }

    if (previewPaidHours <= 0) {
      errors.paidHours = 'Số giờ công sau khi trừ thời gian nghỉ phải lớn hơn 0.';
    } else if (previewPaidHours > 16) {
      errors.paidHours = 'Thời lượng ca làm việc không được vượt quá 16 giờ.';
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit cho chế độ Single
  const handleSubmitSingle = async (e, keepOpenAndAddNext = false) => {
    if (e && e.preventDefault) e.preventDefault();
    setServerError('');

    if (!validateSingle()) return;

    const autoShiftType =
      formData.shiftType || getAutoShiftType(formData.startTime, previewIsOvernight);

    const submissionData = {
      ...formData,
      shiftType: autoShiftType,
      templateCode:
        formData.templateCode?.trim() ||
        (formData.scope === 'BRANCH'
          ? `CR_${formData.branchId || '01'}_${formData.startTime?.replace(':', '') || Date.now().toString().slice(-4)}`
          : `CA_${formData.startTime?.replace(':', '') || Date.now().toString().slice(-4)}`),
    };

    try {
      setSubmitting(true);
      const res = await onSubmit(submissionData);
      if (res?.success === false) {
        setServerError(res.error || 'Có lỗi xảy ra khi lưu khung ca.');
      } else {
        if (keepOpenAndAddNext) {
          // Tính giờ tiếp theo tự động
          const nextStart = formData.endTime || '14:00';
          const [h, m] = nextStart.split(':').map(Number);
          const endH = (h + 8) % 24;
          const nextEnd = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          setFormData((prev) => ({
            ...prev,
            name: '',
            templateCode: '',
            startTime: nextStart,
            endTime: nextEnd,
            description: '',
          }));
          setServerError('');
          setClientErrors({});
        } else {
          onClose();
        }
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message || err.message || 'Không thể lưu khung ca'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Submit cho chế độ Batch (Tạo nhiều ca cùng lúc)
  const handleSubmitBatch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setServerError('');

    if (isSelectedBranchLocked) {
      setServerError('Chi nhánh đang bị tạm khóa. Vui lòng mở khóa chi nhánh trước khi tạo ca riêng.');
      return;
    }

    if (formData.scope === 'BRANCH' && !formData.branchId) {
      setServerError('Vui lòng chọn chi nhánh áp dụng khung ca riêng.');
      return;
    }

    if (batchShifts.length === 0) {
      setServerError('Danh sách ca đang trống. Vui lòng thêm ít nhất 1 ca.');
      return;
    }

    // Validate từng ca
    for (let i = 0; i < batchShifts.length; i++) {
      const s = batchShifts[i];
      if (!s.name?.trim()) {
        setServerError(`Ca #${i + 1} chưa có tên ca.`);
        return;
      }
      if (!s.startTime || !s.endTime) {
        setServerError(`Ca #${i + 1} (${s.name}) chưa chọn đủ giờ bắt đầu và kết thúc.`);
        return;
      }
      if (s.startTime === s.endTime) {
        setServerError(`Ca #${i + 1} (${s.name}) có giờ bắt đầu trùng giờ kết thúc.`);
        return;
      }
      if (batchConflicts[s.id]) {
        setServerError(`Ca #${i + 1} (${s.name}) bị xung đột: ${batchConflicts[s.id]}`);
        return;
      }
    }

    // Đóng gói mảng payload
    const payloadList = batchShifts.map((s, idx) => {
      const isNight = checkIsOvernight(s.startTime, s.endTime);
      const autoType = getAutoShiftType(s.startTime, isNight);
      const code =
        formData.scope === 'BRANCH'
          ? `CR_${formData.branchId || '01'}_${s.startTime.replace(':', '')}_${idx + 1}`
          : `CA_${s.startTime.replace(':', '')}_${idx + 1}`;

      return {
        scope: formData.scope,
        branchId: formData.scope === 'BRANCH' ? Number(formData.branchId) : null,
        name: s.name.trim(),
        templateCode: code,
        startTime: s.startTime,
        endTime: s.endTime,
        breakDuration: Number(s.breakDuration || 0),
        breakDurationMinutes: Number(s.breakDuration || 0),
        shiftType: autoType,
        isOvernight: isNight,
        isActive: s.isActive !== undefined ? Boolean(s.isActive) : true,
        description: s.description || '',
      };
    });

    try {
      setSubmitting(true);
      const res = await onSubmit(payloadList);
      if (res?.success === false) {
        setServerError(res.error || 'Có lỗi xảy ra khi tạo các khung ca.');
      } else {
        onClose();
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message || err.message || 'Không thể tạo các khung ca'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Thêm 1 ca mới vào danh sách Batch
  const handleAddBatchShift = () => {
    const lastShift = batchShifts[batchShifts.length - 1];
    let nextStart = '06:00';
    let nextEnd = '14:00';
    let defaultName = 'Ca Mới';

    if (lastShift && lastShift.endTime) {
      nextStart = lastShift.endTime;
      const [h, m] = nextStart.split(':').map(Number);
      const endH = (h + 8) % 24;
      nextEnd = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const isNight = checkIsOvernight(nextStart, nextEnd);
      const autoType = getAutoShiftType(nextStart, isNight);
      if (autoType === 'Night') defaultName = 'Ca Đêm';
      else if (autoType === 'Afternoon') defaultName = 'Ca Chiều';
      else defaultName = 'Ca Sáng';
    }

    setBatchShifts((prev) => [
      ...prev,
      {
        id: 'batch_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        name: defaultName,
        startTime: nextStart,
        endTime: nextEnd,
        breakDuration: 30,
        isActive: true,
      },
    ]);
  };

  // Xóa 1 ca khỏi danh sách Batch
  const handleRemoveBatchShift = (id) => {
    if (batchShifts.length <= 1) return;
    setBatchShifts((prev) => prev.filter((s) => s.id !== id));
  };

  // Chỉnh sửa thuộc tính của 1 ca trong Batch
  const handleBatchShiftChange = (id, field, value) => {
    setBatchShifts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const branchOptions = branches.map((b) => {
    const bId = b.id ?? b.storeId;
    const isLocked = Boolean(b.isLocked || b.status === 'LOCKED');
    return {
      value: String(bId),
      label: `${b.name} (${b.shiftMode === 'CUSTOM' ? 'Dùng ca riêng' : 'Dùng ca chung'})${isLocked ? ' 🔒 [Đang khóa]' : ''}`,
    };
  });

  const modalTitle = isEditing
    ? formData.scope === 'BRANCH'
      ? 'Chỉnh Sửa Ca Riêng Chi Nhánh'
      : 'Chỉnh Sửa Khung Ca Chung'
    : creationMode === 'BATCH'
    ? formData.scope === 'BRANCH'
      ? 'Thêm Nhiều Ca Riêng Cho Chi Nhánh'
      : 'Thêm Nhiều Khung Ca Chung Toàn Chuỗi'
    : formData.scope === 'BRANCH'
    ? 'Thêm Ca Riêng Chi Nhánh'
    : 'Tạo Khung Ca Chung Toàn Chuỗi';

  const modalWidth = creationMode === 'BATCH' && !isEditing ? '820px' : '560px';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      width={modalWidth}
    >
      <form onSubmit={creationMode === 'BATCH' ? handleSubmitBatch : handleSubmitSingle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Thông báo lỗi từ server nếu có */}
          {serverError && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#f87171',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Icon name="alert" size={16} color="#f87171" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Cảnh báo chi nhánh đang bị tạm khóa */}
          {isSelectedBranchLocked && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#f87171',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Icon name="lock" size={16} color="#f87171" />
              <div>
                <strong>Chi nhánh đang bị tạm khóa:</strong> Bạn không thể tạo hoặc chỉnh sửa khung ca riêng cho chi nhánh này khi chưa được mở khóa hoạt động.
              </div>
            </div>
          )}

          {/* CHUYỂN ĐỔI CHẾ ĐỘ: TẠO 1 CA VS TẠO NHIỀU CA (Chỉ khi tạo mới) */}
          {!isEditing && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '10px',
                borderBottom: `1px solid ${c.border}`,
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  backgroundColor: c.bgElev,
                  padding: '3px',
                  borderRadius: '8px',
                  border: `1px solid ${c.border}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => setCreationMode('SINGLE')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: creationMode === 'SINGLE' ? (c.primary || '#0D9488') : 'transparent',
                    color: creationMode === 'SINGLE' ? '#ffffff' : c.fgSubtle,
                    transition: 'all 0.15s ease',
                  }}
                >
                  Tạo 1 Ca Đơn Lẻ
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMode('BATCH')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: creationMode === 'BATCH' ? (c.primary || '#0D9488') : 'transparent',
                    color: creationMode === 'BATCH' ? '#ffffff' : c.fgSubtle,
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Icon name="copy" size={13} />
                  <span>Tạo Nhiều Ca Cùng Lúc</span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      backgroundColor:
                        creationMode === 'BATCH'
                          ? 'rgba(255, 255, 255, 0.25)'
                          : 'rgba(13, 148, 136, 0.18)',
                      color: creationMode === 'BATCH' ? '#ffffff' : (c.primaryLight || '#2DD4BF'),
                    }}
                  >
                    Tiện lợi
                  </span>
                </button>
              </div>

              {creationMode === 'BATCH' && (
                <div style={{ fontSize: '12px', color: c.fgSubtle }}>
                  Đang thiết lập: <strong style={{ color: c.fg }}>{batchShifts.length}</strong> khung ca
                </div>
              )}
            </div>
          )}

          {/* 1. Phạm vi & Chi nhánh (Dùng chung cho cả 2 chế độ) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: formData.scope === 'BRANCH' ? '1fr 1.3fr' : '1fr',
              gap: '12px',
            }}
          >
            <FormField
              label="Phạm Vi Áp Dụng"
              required
              hint={isEditing ? 'Không thể đổi phạm vi sau khi tạo' : 'Áp dụng toàn chuỗi hoặc một chi nhánh cụ thể'}
            >
              <div
                style={{
                  display: 'flex',
                  borderRadius: '8px',
                  backgroundColor: c.bgElev,
                  padding: '3px',
                  border: `1px solid ${c.border}`,
                }}
              >
                <button
                  type="button"
                  disabled={isEditing}
                  onClick={() => setFormData({ ...formData, scope: 'GLOBAL', branchId: '' })}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isEditing ? 'not-allowed' : 'pointer',
                    backgroundColor: formData.scope === 'GLOBAL' ? (c.primary || '#0D9488') : 'transparent',
                    color: formData.scope === 'GLOBAL' ? '#ffffff' : c.fgSubtle,
                    border: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Chung toàn chuỗi
                </button>
                <button
                  type="button"
                  disabled={isEditing}
                  onClick={() => {
                    const fallbackBranch =
                      formData.branchId ||
                      (defaultBranchId
                        ? String(defaultBranchId)
                        : branches.length > 0
                        ? String(branches[0].id ?? branches[0].storeId ?? '')
                        : '');
                    setFormData({ ...formData, scope: 'BRANCH', branchId: fallbackBranch });
                  }}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isEditing ? 'not-allowed' : 'pointer',
                    backgroundColor: formData.scope === 'BRANCH' ? (c.primary || '#0D9488') : 'transparent',
                    color: formData.scope === 'BRANCH' ? '#ffffff' : c.fgSubtle,
                    border: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Riêng chi nhánh
                </button>
              </div>
            </FormField>

            {formData.scope === 'BRANCH' && (
              <FormField
                label="Chi Nhánh Áp Dụng"
                required
                error={clientErrors.branchId}
                hint={isEditing ? 'Cố định chi nhánh đã chọn' : 'Chi nhánh sở hữu bộ ca riêng này'}
              >
                <Select
                  value={String(formData.branchId || '')}
                  onChange={(val) => setFormData({ ...formData, branchId: val })}
                  options={branchOptions}
                  disabled={isEditing}
                />
              </FormField>
            )}
          </div>

          {/* ============================================================================== */}
          {/* GIAO DIỆN CHẾ ĐỘ BATCH: TẠO NHIỀU CA CÙNG LÚC                                  */}
          {/* ============================================================================== */}
          {creationMode === 'BATCH' && !isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Danh sách các ca trong đợt tạo */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {batchShifts.map((shift, idx) => {
                  const isNight = checkIsOvernight(shift.startTime, shift.endTime);
                  const paidH = calculatePaidHours(
                    shift.startTime,
                    shift.endTime,
                    shift.breakDuration
                  );
                  const autoType = getAutoShiftType(shift.startTime, isNight);
                  const conflictMsg = batchConflicts[shift.id];

                  return (
                    <div
                      key={shift.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        backgroundColor: c.bgCard,
                        border: `1px solid ${conflictMsg ? '#ef4444' : c.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(13, 148, 136, 0.15)',
                              color: c.primaryLight || '#2DD4BF',
                              fontSize: '12px',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {idx + 1}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: c.fg }}>
                            Khung Ca #{idx + 1}
                          </span>
                          <Badge
                            variant={
                              autoType === 'Night'
                                ? 'purple'
                                : autoType === 'Afternoon'
                                ? 'warning'
                                : 'info'
                            }
                            size="sm"
                          >
                            {autoType === 'Night'
                              ? 'Ca Đêm'
                              : autoType === 'Afternoon'
                              ? 'Ca Chiều'
                              : 'Ca Sáng'}
                          </Badge>
                          <span style={{ fontSize: '12px', color: c.fgSubtle }}>
                            {paidH}h công chuẩn {isNight ? '• 🌙 Qua đêm' : ''}
                          </span>
                        </div>

                        {batchShifts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBatchShift(shift.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                            }}
                            title="Xóa ca này khỏi danh sách"
                          >
                            <Icon name="trash" size={13} color="#ef4444" />
                            <span>Xóa</span>
                          </button>
                        )}
                      </div>

                      {/* Các trường nhập liệu */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1.4fr 1fr 1fr 0.8fr',
                          gap: '10px',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <input
                            type="text"
                            value={shift.name}
                            onChange={(e) =>
                              handleBatchShiftChange(shift.id, 'name', e.target.value)
                            }
                            placeholder={`VD: Ca ${idx === 0 ? 'Sáng' : idx === 1 ? 'Chiều' : 'Đêm'}`}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              border: `1px solid ${c.border}`,
                              backgroundColor: c.bgElev,
                              color: c.fg,
                              fontSize: '13px',
                              outline: 'none',
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: c.fgSubtle, whiteSpace: 'nowrap' }}>
                            Từ:
                          </span>
                          <input
                            type="time"
                            value={shift.startTime}
                            onChange={(e) =>
                              handleBatchShiftChange(shift.id, 'startTime', e.target.value)
                            }
                            style={{
                              width: '100%',
                              padding: '7px 8px',
                              borderRadius: '6px',
                              border: `1px solid ${c.border}`,
                              backgroundColor: c.bgElev,
                              color: c.fg,
                              fontSize: '13px',
                              outline: 'none',
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: c.fgSubtle, whiteSpace: 'nowrap' }}>
                            Đến:
                          </span>
                          <input
                            type="time"
                            value={shift.endTime}
                            onChange={(e) =>
                              handleBatchShiftChange(shift.id, 'endTime', e.target.value)
                            }
                            style={{
                              width: '100%',
                              padding: '7px 8px',
                              borderRadius: '6px',
                              border: `1px solid ${c.border}`,
                              backgroundColor: c.bgElev,
                              color: c.fg,
                              fontSize: '13px',
                              outline: 'none',
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            value={shift.breakDuration}
                            min="0"
                            max="240"
                            step="15"
                            onChange={(e) =>
                              handleBatchShiftChange(shift.id, 'breakDuration', e.target.value)
                            }
                            style={{
                              width: '100%',
                              padding: '7px 8px',
                              borderRadius: '6px',
                              border: `1px solid ${c.border}`,
                              backgroundColor: c.bgElev,
                              color: c.fg,
                              fontSize: '13px',
                              outline: 'none',
                            }}
                          />
                          <span style={{ fontSize: '11px', color: c.fgSubtle, whiteSpace: 'nowrap' }}>
                            p nghỉ
                          </span>
                        </div>
                      </div>

                      {/* Cảnh báo lỗi xung đột riêng của ca này */}
                      {conflictMsg && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#f87171',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '2px',
                          }}
                        >
                          <Icon name="alert" size={13} color="#f87171" />
                          <span>{conflictMsg}</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Nút thêm ca khác vào danh sách */}
                <button
                  type="button"
                  onClick={handleAddBatchShift}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: `1px dashed ${c.border}`,
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    color: c.accent,
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon name="plus" size={15} />
                  <span>+ Thêm Khung Ca Tiếp Theo Vào Danh Sách</span>
                </button>
              </div>
            </div>
          ) : (
            /* ============================================================================== */
            /* GIAO DIỆN CHẾ ĐỘ SINGLE: TẠO HOẶC SỬA 1 CA ĐƠN LẺ                              */
            /* ============================================================================== */
            <>
              {/* 2. Tên ca */}
              <FormField
                label="Tên Khung Ca"
                required
                error={clientErrors.name}
                hint="Tên hiển thị khi xếp lịch (VD: Ca Sáng Tiêu Chuẩn, Ca Tối Sân Bay...)"
              >
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={
                    formData.scope === 'BRANCH'
                      ? 'VD: Ca Sáng Phú Mỹ Hưng (07:00 - 15:00)'
                      : 'VD: Ca Sáng Tiêu Chuẩn (06:00 - 14:00)'
                  }
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${clientErrors.name ? '#ef4444' : c.border}`,
                    backgroundColor: c.bgCard,
                    color: c.fg,
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </FormField>

              {/* 3. Giờ bắt đầu & Giờ kết thúc */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <FormField
                  label="Giờ Bắt Đầu"
                  required
                  error={clientErrors.startTime}
                >
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleTimeChange('startTime', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${clientErrors.startTime ? '#ef4444' : c.border}`,
                      backgroundColor: c.bgCard,
                      color: c.fg,
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </FormField>

                <FormField
                  label="Giờ Kết Thúc"
                  required
                  error={clientErrors.endTime}
                >
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleTimeChange('endTime', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${clientErrors.endTime ? '#ef4444' : c.border}`,
                      backgroundColor: c.bgCard,
                      color: c.fg,
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </FormField>
              </div>

              {/* Thông báo lỗi thời gian chung */}
              {clientErrors.time && (
                <div
                  style={{
                    color: '#ef4444',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Icon name="alert" size={14} color="#ef4444" />
                  <span>{clientErrors.time}</span>
                </div>
              )}

              {/* 4. Thời gian nghỉ & Kích hoạt */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr',
                  gap: '12px',
                  alignItems: 'center',
                }}
              >
                <FormField
                  label="Thời Gian Nghỉ (Phút)"
                  error={clientErrors.breakDuration}
                  hint="Nghỉ giữa ca được trừ khỏi giờ công"
                >
                  <input
                    type="number"
                    min="0"
                    max="240"
                    step="15"
                    value={formData.breakDuration}
                    onChange={(e) => setFormData({ ...formData, breakDuration: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${clientErrors.breakDuration ? '#ef4444' : c.border}`,
                      backgroundColor: c.bgCard,
                      color: c.fg,
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </FormField>

                <div style={{ paddingTop: '16px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: c.fg,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span>Kích hoạt áp dụng khung ca</span>
                  </label>
                </div>
              </div>

              {/* 5. Khung Live Preview */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: c.bgElev,
                  border: `1px solid ${c.border}`,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '10px',
                  fontSize: '12px',
                }}
              >
                <div>
                  <div style={{ color: c.fgSubtle, marginBottom: '2px' }}>Ca qua đêm:</div>
                  <Badge variant={previewIsOvernight ? 'purple' : 'neutral'} size="sm">
                    {previewIsOvernight ? 'Qua đêm (Hôm sau)' : 'Không'}
                  </Badge>
                </div>
                <div>
                  <div style={{ color: c.fgSubtle, marginBottom: '2px' }}>Số giờ công chuẩn:</div>
                  <div style={{ fontWeight: 700, color: '#10b981', fontSize: '13px' }}>
                    {previewPaidHours} giờ
                  </div>
                </div>
                <div>
                  <div style={{ color: c.fgSubtle, marginBottom: '2px' }}>Giờ đêm (22h - 06h):</div>
                  <div style={{ fontWeight: 600, color: previewNightHours > 0 ? '#c084fc' : c.fg }}>
                    {previewNightHours} giờ
                  </div>
                </div>
              </div>

              {/* 6. Mã khung ca (Tùy chọn) */}
              <FormField
                label="Mã Khung Ca (Tùy chọn)"
                hint="Hệ thống tự động sinh mã nếu để trống"
              >
                <input
                  type="text"
                  value={formData.templateCode}
                  onChange={(e) => setFormData({ ...formData, templateCode: e.target.value })}
                  placeholder={formData.scope === 'BRANCH' ? 'VD: CR_Q1_S1' : 'VD: CA_SANG_01'}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${c.border}`,
                    backgroundColor: c.bgCard,
                    color: c.fg,
                    fontSize: '13px',
                    outline: 'none',
                    textTransform: 'uppercase',
                  }}
                />
              </FormField>

              {/* 7. Mô tả */}
              <FormField
                label="Ghi Chú / Mô Tả"
                hint="Ghi chú thêm về yêu cầu công việc hoặc phân công nhân sự"
              >
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="VD: Ca phục vụ chính tại cửa hàng..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${c.border}`,
                    backgroundColor: c.bgCard,
                    color: c.fg,
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </FormField>
            </>
          )}

          {/* Footer nút bấm */}
          <div
            style={{
              display: 'flex',
              justifyContent: isEditing && onDelete ? 'space-between' : 'flex-end',
              alignItems: 'center',
              gap: '10px',
              marginTop: '6px',
              flexWrap: 'wrap',
            }}
          >
            {isEditing && onDelete && (
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(initialData);
                }}
                disabled={submitting}
                style={{
                  color: '#ef4444',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                title="Xóa khung ca này"
              >
                <Icon name="trash" size={14} color="#ef4444" />
                <span>Xóa Khung Ca</span>
              </Button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                disabled={submitting}
              >
                Hủy Bỏ
              </Button>

              {/* Nút Tạo ở chế độ BATCH */}
              {creationMode === 'BATCH' && !isEditing ? (
                <Button
                  variant="primary"
                  onClick={handleSubmitBatch}
                  loading={submitting}
                  disabled={submitting || hasAnyBatchConflict || isSelectedBranchLocked}
                  title={
                    isSelectedBranchLocked
                      ? 'Chi nhánh đang bị tạm khóa. Vui lòng mở khóa chi nhánh trước.'
                      : hasAnyBatchConflict
                      ? 'Có ca bị trùng hoặc đè giờ. Vui lòng chỉnh sửa lại khung giờ.'
                      : undefined
                  }
                  style={
                    hasAnyBatchConflict || isSelectedBranchLocked
                      ? { opacity: 0.5, cursor: 'not-allowed' }
                      : undefined
                  }
                >
                  <Icon name="check" size={14} />
                  <span>Tạo Tất Cả Ca ({batchShifts.length} ca)</span>
                </Button>
              ) : (
                /* Nút Tạo ở chế độ SINGLE */
                <>
                  {!isEditing && (
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={(e) => handleSubmitSingle(e, true)}
                      loading={submitting}
                      disabled={submitting || Boolean(overlappingShift) || isSelectedBranchLocked}
                      style={{
                        backgroundColor: 'rgba(13, 148, 136, 0.12)',
                        color: c.primaryLight || '#2DD4BF',
                        borderColor: 'rgba(13, 148, 136, 0.3)',
                      }}
                      title="Lưu ca này và tiếp tục nhập ca tiếp theo mà không đóng form"
                    >
                      <Icon name="plus" size={14} />
                      <span>Tạo & Thêm Ca Khác</span>
                    </Button>
                  )}

                  <Button
                    variant="primary"
                    onClick={(e) => handleSubmitSingle(e, false)}
                    loading={submitting}
                    disabled={submitting || Boolean(overlappingShift) || isSelectedBranchLocked}
                    title={
                      isSelectedBranchLocked
                        ? 'Chi nhánh đang bị tạm khóa. Vui lòng mở khóa chi nhánh trước khi thao tác.'
                        : overlappingShift
                        ? overlappingShift.conflictMessage
                        : undefined
                    }
                    style={
                      overlappingShift || isSelectedBranchLocked
                        ? { opacity: 0.5, cursor: 'not-allowed' }
                        : undefined
                    }
                  >
                    {isEditing ? 'Lưu Thay Đổi' : 'Tạo Khung Ca'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
