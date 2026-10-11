import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DataTable from '@/shared/components/ui/DataTable';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import Badge from '@/shared/components/ui/Badge';

/**
 * ==============================================================================
 * COMPONENT: TierTable.jsx
 * Bảng hiển thị và quản lý danh mục Tier Master
 * ==============================================================================
 */
export default function TierTable({
  tiers = [],
  onEdit,
  onDelete,
  isLoading = false,
}) {
  const { c } = useAdminTheme();

  const getTierColor = (tierName) => {
    const s = (tierName || '').toLowerCase();
    if (s.includes('1') || s.includes('flagship')) return '#f59e0b';
    if (s.includes('2') || s.includes('tiêu chuẩn') || s.includes('standard')) return '#3b82f6';
    if (s.includes('3') || s.includes('mini') || s.includes('compact')) return '#10b981';
    return '#8b5cf6';
  };

  const columns = [
    {
      key: 'id',
      label: '#ID',
      width: '65px',
      render: (row, idx) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: c.fgSubtle, fontWeight: 700 }}>
          #{row.id || row.tier_id || idx + 1}
        </span>
      ),
    },
    {
      key: 'tierName',
      label: 'TÊN PHÂN CẤP (TIER)',
      render: (row) => {
        const color = getTierColor(row.tierName || row.tier_name);
        return (
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 9px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  backgroundColor: `${color}15`,
                  border: `1px solid ${color}35`,
                  color: color,
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: color,
                  }}
                />
                {row.tierName || row.tier_name}
              </span>
            </div>
            {row.description && (
              <div
                style={{
                  fontSize: '12px',
                  color: c.fgSubtle,
                  marginTop: '4px',
                  lineHeight: '1.4',
                }}
              >
                {row.description}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'quota',
      label: 'ĐỊNH BIÊN (MIN - MAX)',
      width: '180px',
      render: (row) => {
        const min = Number(row.minStaffCount ?? row.min_staff_count ?? 0);
        const max =
          row.maxStaffCount !== null && row.maxStaffCount !== undefined
            ? Number(row.maxStaffCount)
            : row.max_staff_count !== null && row.max_staff_count !== undefined
            ? Number(row.max_staff_count)
            : null;

        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                fontWeight: 700,
                color: c.accent,
                backgroundColor: c.bgRaised,
                padding: '3px 8px',
                borderRadius: '6px',
                border: `1px solid ${c.border}`,
              }}
            >
              {min} {max !== null ? `- ${max}` : '+'} nv
            </span>
          </div>
        );
      },
    },

    {
      key: 'branchCount',
      label: 'CHI NHÁNH ÁP DỤNG',
      width: '240px',
      render: (row) => {
        const count = Number(row.branchCount ?? row.branch_count ?? 0);
        const branchesList = row.appliedBranches || [];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Badge tone={count > 0 ? 'good' : 'neutral'}>
                <span style={{ fontWeight: 700 }}>{count}</span> chi nhánh
              </Badge>
              {count === 0 && (
                <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                  (Có thể xóa)
                </span>
              )}
            </div>

            {branchesList.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {branchesList.map((b) => {
                  const code = b.branchCode || b.code || `CH0${b.storeId || b.id}`;
                  return (
                    <span
                      key={b.id || b.storeId}
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: c.bgRaised,
                        border: `1px solid ${c.border}`,
                        color: c.fgSubtle,
                        padding: '1px 5px',
                        borderRadius: '4px',
                      }}
                      title={b.name || b.storeName}
                    >
                      {code}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      width: '120px',
      render: (row) => {
        const count = Number(row.branchCount ?? row.branch_count ?? 0);
        const canDelete = count === 0;

        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button
              variant="outline"
              size="sm"
              disabled={!canDelete}
              onClick={() => {
                if (canDelete && onDelete) {
                  onDelete(row);
                }
              }}
              style={{
                color: canDelete ? '#ef4444' : '#64748b',
                borderColor: canDelete ? 'rgba(239, 68, 68, 0.35)' : 'rgba(100, 116, 139, 0.25)',
                backgroundColor: canDelete ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                cursor: canDelete ? 'pointer' : 'not-allowed',
                opacity: canDelete ? 1 : 0.45,
                fontWeight: 600,
              }}
              title={
                canDelete
                  ? 'Xóa phân cấp này'
                  : `Phân cấp này đang được sử dụng cho ${count} chi nhánh. Vui lòng chuyển chi nhánh sang tier khác trước khi xóa!`
              }
            >
              <Icon name="trash" size={13} color={canDelete ? '#ef4444' : '#64748b'} />
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
      data={tiers}
      loading={isLoading}
      emptyMessage="Chưa có phân cấp nào. Hãy bấm 'Thêm Phân Cấp Mới' để tạo phân cấp đầu tiên."
    />
  );
}

export { TierTable };
