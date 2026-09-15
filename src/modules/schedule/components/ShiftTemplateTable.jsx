import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DataTable from '@/shared/components/ui/DataTable';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import { formatShiftTemplateName } from '../hooks/useWeeklySchedule';

/**
 * ==============================================================================
 * COMPONENT: ShiftTemplateTable.jsx
 * UC 1.3: Bảng danh sách Khung ca Mẫu toàn hệ thống
 * ==============================================================================
 * Bảng hiển thị:
 * - Mã ca (VD: SHIFT_MORNING, CA_SANG)
 * - Tên ca (Ca sáng, Ca chiều...)
 * - Giờ bắt đầu, Giờ kết thúc
 * - Thời gian nghỉ (phút) & Số giờ công thực tế
 * - Ca qua đêm (Tag Yes / No)
 * - Trạng thái (Đang áp dụng / Tạm dừng)
 * - Thao tác (Sửa, Bật/Tắt, Xóa)
 */
export default function ShiftTemplateTable({
  shifts = [],
  loading = false,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  const { c } = useAdminTheme();

  const columns = [
    {
      key: 'shiftCode',
      label: 'MÃ KHUNG CA',
      width: '130px',
      render: (row) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '13px',
            color: c.accent,
            backgroundColor: `${c.accent}15`,
            padding: '4px 8px',
            borderRadius: '6px',
            letterSpacing: '0.5px',
          }}
        >
          {row.shiftCode || row.templateCode}
        </span>
      ),
    },
    {
      key: 'shiftName',
      label: 'TÊN KHUNG CA & MÔ TẢ',
      render: (row) => (
        <div>
          <div
            style={{
              fontWeight: 600,
              fontSize: '14px',
              color: c.fg,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{formatShiftTemplateName(row.shiftName || row.name)}</span>
            {row.isSystemDefault && (
              <Badge tone="neutral">
                <span style={{ fontSize: '10px' }}>MẶC ĐỊNH CHUỖI</span>
              </Badge>
            )}
          </div>
          {row.description && (
            <div
              style={{
                fontSize: '12px',
                color: c.fgSubtle,
                marginTop: '2px',
              }}
            >
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'time',
      label: 'KHUNG GIỜ',
      width: '140px',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Icon
            name="calendar"
            size={13}
          />
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '13px',
              fontWeight: 600,
              color: c.fg,
            }}
          >
            {row.startTime?.slice(0, 5)} - {row.endTime?.slice(0, 5)}
          </span>
        </div>
      ),
    },
    {
      key: 'breakMinutes',
      label: 'NGHỈ / CÔNG',
      width: '130px',
      render: (row) => (
        <div style={{ fontSize: '12px', color: c.fgSubtle }}>
          <div>Nghỉ: <strong>{row.breakMinutes ?? 0}p</strong></div>
          <div style={{ color: c.accent, fontWeight: 600 }}>
            {row.workHours || 0}h chuẩn
          </div>
        </div>
      ),
    },
    {
      key: 'isOvernight',
      label: 'QUA ĐÊM',
      width: '100px',
      render: (row) => {
        const isOvernight = Boolean(row.isOvernight);
        return (
          <Badge tone={isOvernight ? 'accent' : 'neutral'}>
            <span style={{ fontWeight: 600 }}>
              {isOvernight ? 'Yes (Đêm)' : 'No'}
            </span>
          </Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'TRẠNG THÁI',
      width: '130px',
      render: (row) => {
        const isActive = Boolean(row.isActive);
        return (
          <Badge tone={isActive ? 'good' : 'neutral'}>
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isActive ? '#10b981' : '#6b7280',
                marginRight: '5px',
              }}
            />
            {isActive ? 'Áp dụng' : 'Tạm dừng'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      width: '210px',
      render: (row) => {
        const isActive = Boolean(row.isActive);
        const isSystem = Boolean(row.isSystemDefault);

        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {/* Nút Sửa */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit && onEdit(row)}
              title="Chỉnh sửa khung ca"
            >
              <Icon
                name="edit"
                size={13}
              />
              <span>Sửa</span>
            </Button>

            {/* Nút Bật/Tắt */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus && onToggleStatus(row)}
              style={{
                color: isActive ? '#f59e0b' : '#10b981',
              }}
              title={isActive ? 'Tạm dừng áp dụng ca' : 'Kích hoạt lại ca'}
            >
              <Icon
                name={isActive ? 'lock' : 'check'}
                size={13}
              />
              <span>{isActive ? 'Tắt' : 'Bật'}</span>
            </Button>

            {/* Nút Xóa (chỉ xóa ca tùy chỉnh, bảo vệ 3 ca hệ thống) */}
            {!isSystem && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete && onDelete(row)}
                style={{ color: '#ef4444' }}
                title="Xóa khung ca này"
              >
                <Icon
                  name="trash"
                  size={13}
                />
                <span>Xóa</span>
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={shifts}
      loading={loading}
      emptyMessage="Chưa có khung ca mẫu nào được thiết lập."
    />
  );
}
