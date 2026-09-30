import React, { useState } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DataTable from '@/shared/components/ui/DataTable';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';

/**
 * Tooltip hiển thị chi tiết thông tin khóa của chi nhánh khi hover vào Badge "Tạm khóa"
 */
function LockedStatusBadge({ branch, c }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const reason = branch.lockReason || 'Không có ghi chú lý do';
  const lockedBy = branch.lockedBy || 'Quản trị viên hệ thống';
  const lockedAt = branch.lockedAt || branch.updatedAt;

  const formattedTime = lockedAt
    ? `${new Date(lockedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${new Date(lockedAt).toLocaleDateString('vi-VN')}`
    : 'Chưa ghi nhận thời gian';

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Badge tone="bad">
        <span
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            marginRight: '6px',
          }}
        />
        <span>Tạm khóa</span>
        <span style={{ marginLeft: '4px', opacity: 0.85, display: 'inline-flex', alignItems: 'center' }}>
          <Icon name="info" size={11} color="#ef4444" />
        </span>
      </Badge>

      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            width: '270px',
            padding: '10px 12px',
            borderRadius: '8px',
            backgroundColor: c.bgCard,
            border: `1px solid ${c.border}`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            fontSize: '12px',
            color: c.fg,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            lineHeight: 1.4,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#ef4444',
              fontWeight: 700,
              borderBottom: `1px solid ${c.border}`,
              paddingBottom: '4px',
            }}
          >
            <Icon name="lock" size={13} color="#ef4444" />
            <span>Thông tin khóa chi nhánh</span>
          </div>

          <div>
            <span style={{ color: c.fgSubtle, fontSize: '11px', display: 'block' }}>Lý do khóa:</span>
            <span style={{ fontWeight: 500, color: c.fg }}>{reason}</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 1fr',
              gap: '6px',
              marginTop: '2px',
              borderTop: `1px solid ${c.border}`,
              paddingTop: '6px',
              fontSize: '11px',
            }}
          >
            <div>
              <span style={{ color: c.fgSubtle, display: 'block' }}>Người khóa:</span>
              <span style={{ fontWeight: 600, color: c.accent }}>{lockedBy}</span>
            </div>
            <div>
              <span style={{ color: c.fgSubtle, display: 'block' }}>Thời gian:</span>
              <span style={{ fontWeight: 600, color: c.fg }}>{formattedTime}</span>
            </div>
          </div>

          {/* Mũi tên tooltip */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `6px solid ${c.border}`,
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * ==============================================================================
 * COMPONENT: BranchTable.jsx
 * Danh sách chi nhánh & phân trang
 * ==============================================================================
 */
export default function BranchTable({
  branches = [],
  loading = false,
  isActionInProgress = false,
  onEdit,
  onLock,
  onUnlock,
  onToggleLock,
  onDelete,
}) {
  const { c } = useAdminTheme();

  // Kiểm tra quyền branch.lock của người dùng hiện tại
  const hasLockPermission = (() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return true;
      const user = JSON.parse(raw);
      const role = (user.role || user.Role || '').toUpperCase();
      if (
        role === 'OPERATIONS_ADMIN' ||
        role === 'ADMIN' ||
        role.includes('ADMIN') ||
        role === 'SUPER_ADMIN'
      ) {
        return true;
      }
      if (Array.isArray(user.permissions)) {
        return user.permissions.includes('branch.lock');
      }
      return true;
    } catch {
      return true;
    }
  })();

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
      width: '130px',
      render: (row) => {
        const isActive = (row.status || '').toUpperCase() === 'ACTIVE';
        if (isActive) {
          return (
            <Badge tone="good">
              <span
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  marginRight: '6px',
                }}
              />
              Hoạt động
            </Badge>
          );
        }

        // Dòng chi nhánh Tạm khóa: tooltip hiển thị lý do, người khóa, thời gian khóa
        return <LockedStatusBadge branch={row} c={c} />;
      },
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      width: '200px',
      render: (row) => {
        const isActive = (row.status || '').toUpperCase() === 'ACTIVE';
        const lockDisabled = isActionInProgress || (isActive && !hasLockPermission);

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
              disabled={isActionInProgress}
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
              disabled={lockDisabled}
              onClick={() => {
                if (isActive) {
                  if (onLock) onLock(row);
                  else if (onToggleLock) onToggleLock(row);
                } else {
                  if (onUnlock) onUnlock(row);
                  else if (onToggleLock) onToggleLock(row);
                }
              }}
              style={{
                color: isActive ? (hasLockPermission ? '#f59e0b' : c.fgFaint) : '#10b981',
                opacity: lockDisabled ? 0.6 : 1,
                cursor: lockDisabled ? 'not-allowed' : 'pointer',
              }}
              title={
                isActive
                  ? hasLockPermission
                    ? 'Khóa chi nhánh'
                    : 'Bạn không có quyền khóa chi nhánh (branch.lock)'
                  : 'Mở khóa chi nhánh'
              }
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
              disabled={isActionInProgress}
              onClick={() => onDelete && onDelete(row)}
              style={{
                color: '#ef4444',
                opacity: isActionInProgress ? 0.6 : 1,
                cursor: isActionInProgress ? 'not-allowed' : 'pointer',
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
      pageSize={10}
      pageSizeOptions={[5, 10, 20, 50]}
      emptyMessage="Chưa có chi nhánh nào được cấu hình trong hệ thống."
    />
  );
}