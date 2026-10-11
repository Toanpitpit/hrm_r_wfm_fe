import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DataTable from '@/shared/components/ui/DataTable';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import { getShiftTypeColor, SHIFT_TYPE_COLORS } from '../constants/shift.constants';

/**
 * ==============================================================================
 * COMPONENT: ShiftTemplateTable.jsx
 * Bảng danh sách Khung Ca Mẫu (Chung toàn chuỗi hoặc Riêng chi nhánh)
 * ==============================================================================
 */
export default function ShiftTemplateTable({
  shifts = [],
  loading = false,
  isOperationsAdmin = true,
  isBranchMuted = false,
  emptyMessage = 'Chưa có khung ca mẫu nào.',
  onEdit,
  onToggleStatus,
}) {
  const { c } = useAdminTheme();

  const getShiftTypeLabel = (type) => {
    return SHIFT_TYPE_COLORS[type]?.label || type || 'Khác';
  };

  const columns = [
    {
      key: 'templateCode',
      label: 'MÃ KHUNG CA',
      width: '130px',
      render: (row) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '12.5px',
            color: c.accent,
            backgroundColor: `${c.accent}15`,
            padding: '3px 8px',
            borderRadius: '6px',
            letterSpacing: '0.4px',
          }}
        >
          {row.templateCode || row.shiftCode}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'TÊN KHUNG CA & MÔ TẢ',
      render: (row) => (
        <div>
          <div
            style={{
              fontWeight: 600,
              fontSize: '13.5px',
              color: c.fg,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
            }}
          >
            <span>{row.name || row.shiftName}</span>
            {row.scope === 'GLOBAL' && row.usedByBranchCount > 0 && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#38bdf8',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  padding: '1px 6px',
                  borderRadius: '10px',
                }}
              >
                {row.usedByBranchCount} chi nhánh áp dụng
              </span>
            )}
            {row.isOvernight && (
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 600,
                  color: '#c084fc',
                  backgroundColor: 'rgba(168, 85, 247, 0.12)',
                  padding: '1px 6px',
                  borderRadius: '10px',
                }}
              >
                Qua đêm
              </span>
            )}
          </div>
          {row.description && (
            <div
              style={{
                fontSize: '12px',
                color: c.fgSubtle,
                marginTop: '3px',
                lineHeight: '1.4',
              }}
            >
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'shiftType',
      label: 'LOẠI CA',
      width: '120px',
      render: (row) => {
        const typeColor = getShiftTypeColor(row.shiftType, row.isOvernight);
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              fontWeight: 600,
              color: typeColor,
              backgroundColor: `${typeColor}15`,
              border: `1px solid ${typeColor}30`,
              padding: '2px 8px',
              borderRadius: '6px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: typeColor,
              }}
            />
            {getShiftTypeLabel(row.shiftType)}
          </span>
        );
      },
    },
    {
      key: 'time',
      label: 'GIỜ LÀM VIỆC',
      width: '135px',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Icon name="clock" size={13} color={c.fgSubtle} />
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
      key: 'breakDuration',
      label: 'NGHỈ GIỮA CA',
      width: '110px',
      render: (row) => (
        <span style={{ fontSize: '12.5px', color: c.fgSubtle }}>
          {row.breakDuration ?? row.breakMinutes ?? 0} phút
        </span>
      ),
    },
    {
      key: 'paidHours',
      label: 'SỐ GIỜ CÔNG',
      width: '135px',
      render: (row) => {
        const paid = row.paidHours ?? row.workHours ?? 0;
        const night = row.nightHours ?? 0;
        return (
          <div>
            <div style={{ color: c.accent, fontWeight: 700, fontSize: '13px' }}>
              {paid}h công
            </div>
            {night > 0 && (
              <div style={{ fontSize: '11px', color: '#c084fc', marginTop: '1px' }}>
                {night}h đêm phụ cấp
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'TRẠNG THÁI',
      width: '125px',
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
  ];

  // Thêm cột thao tác chỉ khi là Operations Admin
  if (isOperationsAdmin) {
    columns.push({
      key: 'actions',
      label: 'THAO TÁC',
      width: '170px',
      render: (row) => {
        const isActive = Boolean(row.isActive);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit && onEdit(row)}
              title="Chỉnh sửa khung ca"
            >
              <Icon name="edit" size={13} />
              <span>Sửa</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus && onToggleStatus(row)}
              style={{
                color: isActive ? '#f59e0b' : '#10b981',
              }}
              title={isActive ? 'Ngừng áp dụng ca' : 'Kích hoạt lại ca'}
            >
              <Icon name={isActive ? 'lock' : 'check'} size={13} />
              <span>{isActive ? 'Ngừng' : 'Bật lại'}</span>
            </Button>
          </div>
        );
      },
    });
  }

  return (
    <div
      style={{
        position: 'relative',
        opacity: isBranchMuted ? 0.6 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      {isBranchMuted && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '12px',
            zIndex: 10,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#94a3b8',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#94a3b8',
            }}
          />
          <span>Chưa kích hoạt (Chi nhánh đang dùng ca chung)</span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={shifts}
        loading={loading}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}
