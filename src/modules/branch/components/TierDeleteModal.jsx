import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';

/**
 * ==============================================================================
 * COMPONENT: TierDeleteModal.jsx
 * Modal xác nhận Xóa Tier
 * ==============================================================================
 */
export default function TierDeleteModal({
  isOpen = false,
  onClose,
  onConfirm,
  tier = null,
  isLoading = false,
}) {
  const { c } = useAdminTheme();

  if (!isOpen || !tier) return null;

  const branchCount = Number(tier.branch_count ?? tier.branchCount ?? 0);
  const canDelete = branchCount === 0;
  const displayName = tier.tier_name || tier.tierName || 'Phân cấp';

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Xác Nhận Xóa Phân Cấp"
      width="460px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            backgroundColor: canDelete ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: `1px solid ${canDelete ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
            borderRadius: '8px',
            padding: '12px 14px',
            color: canDelete ? '#f87171' : '#fbbf24',
          }}
        >
          <div style={{ marginTop: '2px' }}>
            <Icon
              name="alert"
              size={18}
              color={canDelete ? '#ef4444' : '#f59e0b'}
            />
          </div>
          <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
            {canDelete ? (
              <>
                Bạn có chắc chắn muốn xóa phân cấp <strong style={{ color: '#ffffff' }}>{displayName}</strong> khỏi hệ thống?
                Thao tác này sẽ gỡ bỏ tiêu chuẩn phân cấp này vĩnh viễn.
              </>
            ) : (
              <>
                Không thể xóa phân cấp <strong style={{ color: '#ffffff' }}>{displayName}</strong> vì hiện đang có{' '}
                <strong style={{ color: '#ffffff' }}>{branchCount} chi nhánh</strong> đang áp dụng phân cấp này.
                Vui lòng đổi phân cấp cho các chi nhánh liên quan trước khi xóa.
              </>
            )}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '8px',
          }}
        >
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy Bỏ
          </Button>
          <Button
            variant="primary"
            onClick={() => onConfirm(tier.id || tier.tier_id)}
            disabled={!canDelete}
            loading={isLoading}
            style={{
              backgroundColor: canDelete ? '#dc2626' : undefined,
              borderColor: canDelete ? '#dc2626' : undefined,
            }}
          >
            Xác Nhận Xóa
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export { TierDeleteModal };
