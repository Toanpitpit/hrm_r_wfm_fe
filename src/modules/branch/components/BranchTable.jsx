import React, { useState, useMemo, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DataTable from '@/shared/components/ui/DataTable';
import Pagination from '@/shared/components/ui/Pagination';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';

/**
 * ==============================================================================
 * COMPONENT: BranchTable.jsx
 * UC 1.2: Danh sách chi nhánh, phân trang & thanh cuộn dọc
 * ==============================================================================
 * Bảng hiển thị:
 * - Mã, Cấp, Tên, Địa chỉ, Tọa độ GPS & Bán kính Geofence
 * - Trạng thái (Badge Active / Inactive / Locked)
 * - Cột thao tác: Sửa, Khóa/Mở, Xóa
 * - Thanh cuộn dọc cố định tiêu đề (sticky header) & phân trang thông minh
 */
export default function BranchTable({
  branches = [],
  loading = false,
  onEdit,
  onToggleLock,
  onDelete,
}) {
  const { c } = useAdminTheme();

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalItems = branches.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // Tự động quay về trang 1 nếu số trang giảm (khi người dùng tìm kiếm hoặc lọc)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Cắt mảng chi nhánh theo trang hiện tại
  const paginatedBranches = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return branches.slice(start, start + pageSize);
  }, [branches, currentPage, pageSize]);

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
      key: 'branchTier',
      label: 'CẤP CN',
      width: '110px',
      render: (row) => {
        const tier = Number(row.branchTier ?? row.tier ?? 2);
        let label = 'Cấp 2';
        let bg = 'rgba(59, 130, 246, 0.15)';
        let border = 'rgba(59, 130, 246, 0.35)';
        let color = '#60a5fa';
        let fontWeight = 600;

        if (tier === 1) {
          label = 'Cấp 1';
          bg = 'rgba(234, 179, 8, 0.15)';
          border = 'rgba(234, 179, 8, 0.4)';
          color = '#eab308';
          fontWeight = 700;
        } else if (tier === 3) {
          label = 'Cấp 3';
          bg = 'rgba(156, 163, 175, 0.15)';
          border = 'rgba(156, 163, 175, 0.35)';
          color = '#9ca3af';
          fontWeight = 500;
        }

        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: fontWeight,
              backgroundColor: bg,
              border: `1px solid ${border}`,
              color: color,
              letterSpacing: '0.3px',
              lineHeight: 1.2,
            }}
          >
            {label}
          </span>
        );
      },
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
      key: 'coordinates',
      label: 'TỌA ĐỘ POINT (GPS)',
      width: '180px',
      render: (row) => {
        const lat = row.latitude ?? (row.location?.coordinates ? row.location.coordinates[1] : null);
        const lng = row.longitude ?? (row.location?.coordinates ? row.location.coordinates[0] : null);
        const radius = row.geofenceRadiusMeters ?? row.radiusMeters ?? 100;

        return (
          <div style={{ fontSize: '12px', color: c.fgSubtle, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: c.fg, fontFamily: 'monospace', fontWeight: 600 }}>
              <Icon name="map" size={12} color={c.accent} />
              <span>{lat ? `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}` : 'Chưa có tọa độ'}</span>
            </div>
            <div style={{ fontSize: '11px', color: c.fgFaint }}>
              Bán kính: <strong style={{ color: c.accent }}>{radius}m</strong> Geofence
            </div>
          </div>
        );
      },
    },

    {
      key: 'status',
      label: 'TRẠNG THÁI',
      width: '120px',
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
      key: 'actions',
      label: 'THAO TÁC',
      width: '200px',
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '10px',
        border: `1px solid ${c.border}`,
        overflow: 'hidden',
        backgroundColor: c.bgCard,
      }}
    >
      {/* Vùng bảng dữ liệu với thanh cuộn dọc và tiêu đề cố định */}
      <DataTable
        columns={columns}
        data={paginatedBranches}
        loading={loading}
        maxHeight="440px"
        stickyHeader={true}
        emptyMessage="Chưa có chi nhánh nào được cấu hình trong hệ thống."
      />

      {/* Thanh phân trang ở chân bảng */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        pageSizeOptions={[5, 10, 20, 50]}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        itemLabel="chi nhánh"
      />
    </div>
  );
}