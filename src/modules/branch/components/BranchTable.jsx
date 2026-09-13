import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DataTable from '@/shared/components/ui/DataTable';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';

/**
 * ==============================================================================
 * COMPONENT: BranchTable.jsx
 * UC 1.2: Danh sách chi nhánh & Cột thao tác
 * ==============================================================================
 * Bảng hiển thị:
 * - Mã, Tên, Địa chỉ, Số điện thoại
 * - Trạng thái (Badge Active / Inactive / Locked)
 * - Số lượng Kiosk đang hoạt động (ví dụ: 2/3 Online)
 * - Cột thao tác: Sửa, Khóa/Mở, Quản lý Kiosk, Xóa
 */
export default function BranchTable({
  branches = [],
  loading = false,
  onEdit,
  onManageKiosk,
  onToggleLock,
  onDelete,
}) {
  const { c } = useAdminTheme();

  const columns = [
    {
      key: 'branchCode',
      label: 'MÃ CN',
      width: '110px',
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
          {row.branchCode || row.code || row.storeCode || `CH0${row.storeId || row.id}`}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'TÊN CHI NHÁNH & ĐỊA CHỈ',
      render: (row) => (
        <div>
          <div
            style={{
              fontWeight: 600,
              fontSize: '14px',
              color: c.fg,
              marginBottom: '2px',
            }}
          >
            {row.name || row.storeName || row.branchName}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: c.fgSubtle,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Icon
              name="pin"
              size={12}
            />
            <span>{row.address || 'Chưa cập nhật địa chỉ'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'SỐ ĐIỆN THOẠI',
      width: '130px',
      render: (row) => (
        <span style={{ fontSize: '13px', color: c.fgSubtle }}>
          {row.phone || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'TRẠNG THÁI',
      width: '130px',
      render: (row) => {
        const isActive = (row.status || '').toUpperCase() === 'ACTIVE';
        return (
          <Badge tone={isActive ? 'good' : 'bad'}>
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isActive ? '#10b981' : '#ef4444',
                marginRight: '6px',
              }}
            />
            {isActive ? 'Hoạt động' : 'Tạm khóa'}
          </Badge>
        );
      },
    },
    {
      key: 'kiosks',
      label: 'KIOSK QUẦY',
      width: '130px',
      render: (row) => {
        const total = row.kioskCount ?? row.totalKiosks ?? (row.kiosks ? row.kiosks.length : 0);
        const active = row.activeKiosks ?? (row.kiosks ? row.kiosks.filter(k => k.status === 'ACTIVE' || k.isOnline).length : 0);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Badge tone={total > 0 ? (active > 0 ? 'accent' : 'neutral') : 'neutral'}>
              <Icon
                name="screen"
                size={12}
              />
              <span style={{ marginLeft: '4px', fontWeight: 600 }}>
                {active}/{total} Online
              </span>
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      width: '270px',
      render: (row) => {
        const isActive = (row.status || '').toUpperCase() === 'ACTIVE';
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              justifyContent: 'flex-start',
            }}
          >
            {/* Nút Quản lý Kiosk */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageKiosk && onManageKiosk(row)}
              title="Quản lý cấu hình Kiosk chi nhánh"
            >
              <Icon
                name="screen"
                size={13}
              />
              <span>Kiosk</span>
            </Button>

            {/* Nút Sửa */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit && onEdit(row)}
              title="Chỉnh sửa thông tin chi nhánh"
            >
              <Icon
                name="edit"
                size={13}
              />
              <span>Sửa</span>
            </Button>

            {/* Nút Khóa / Mở khóa */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleLock && onToggleLock(row)}
              style={{
                color: isActive ? '#f59e0b' : '#10b981',
              }}
              title={isActive ? 'Khóa chi nhánh' : 'Mở khóa chi nhánh'}
            >
              <Icon
                name={isActive ? 'lock' : 'unlock'}
                size={13}
              />
              <span>{isActive ? 'Khóa' : 'Mở'}</span>
            </Button>

            {/* Nút Xóa Chi Nhánh */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete && onDelete(row)}
              style={{
                color: '#ef4444',
              }}
              title="Xóa chi nhánh khỏi hệ thống"
            >
              <Icon
                name="trash"
                size={13}
              />
              <span>Xóa</span>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={branches}
      loading={loading}
      emptyMessage="Chưa có chi nhánh nào được cấu hình trong hệ thống."
    />
  );
}