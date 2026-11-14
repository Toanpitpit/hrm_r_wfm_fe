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
      label: 'CẤP CHI NHÁNH',
      width: '180px',
      render: (row) => {
        return (
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '160px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: c.bgElev,
                border: `1px solid ${c.border}`,
                color: c.fg,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={row.description || undefined}
            >
              {row.tierName || row.tier_name}
            </span>
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
      width: '260px',
      render: (row) => {
        const count = Number(row.branchCount ?? row.branch_count ?? 0);
        const branchesList = row.appliedBranches || [];

        return (
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <Badge tone={count > 0 ? 'good' : 'neutral'} dot={count > 0}>
              <span style={{ fontWeight: 700 }}>{count}</span> Chi nhánh
            </Badge>

            {branchesList.length > 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                {branchesList.slice(0, 4).map((b) => {
                  const code = b.branchCode || b.code || `CH0${b.storeId || b.id}`;
                  const name = b.name || b.storeName || '';
                  return (
                    <span
                      key={b.id || b.storeId}
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: c.bgRaised,
                        border: `1px solid ${c.border}`,
                        color: c.fg,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        cursor: name ? 'help' : 'default',
                      }}
                      title={name ? `${code}: ${name}` : code}
                    >
                      {code}
                    </span>
                  );
                })}

                {branchesList.length > 4 && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: c.fgSubtle,
                      backgroundColor: c.bgRaised,
                      border: `1px solid ${c.border}`,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      cursor: 'help',
                    }}
                    title={branchesList.slice(4).map((b) => `${b.branchCode || b.code || b.id}: ${b.name || b.storeName || ''}`).join('\n')}
                  >
                    +{branchesList.length - 4}
                  </span>
                )}
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
    <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <DataTable
        columns={columns}
        data={tiers}
        loading={isLoading}
        emptyMessage="Chưa có phân cấp nào. Hãy bấm 'Thêm Phân Cấp Mới' để tạo phân cấp đầu tiên."
      />
    </div>
  );
}

export { TierTable };
