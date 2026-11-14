import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Icon from '@/shared/components/ui/Icon';

export default function HeadcountQuotaCard({
  allBranchesQuota = [],
  selectedBranchId = '',
  onSelectBranch,
  isStoreManager = false,
  canManageSystem = false,
  onUpgradeTier,
}) {
  const { c } = useAdminTheme();

  if (isStoreManager || !allBranchesQuota || allBranchesQuota.length === 0) {
    return null;
  }

  const tierColors = {
    1: '#eab308',
    2: '#3b82f6',
    3: '#9ca3af',
  };

  const getStatusBadge = (statusObj) => {
    const tier = Number(statusObj.branchTier || 2);
    const standardQuota = Number(
      statusObj.effectiveQuota ||
      statusObj.staffCount ||
      statusObj.targetStaffCount ||
      statusObj.standardQuota ||
      (tier === 1 ? 30 : tier === 3 ? 8 : 15)
    );
    const cHeadcount = Number(statusObj.officialHeadcount ?? statusObj.currentHeadcount ?? 0);
    const dispatchedIn = Number(statusObj.dispatchedInCount || 0);
    const isReached = Boolean(statusObj.isQuotaReached ?? (cHeadcount >= standardQuota));
    const remaining = Math.max(0, standardQuota - cHeadcount);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
        {!isReached ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 600,
              background: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#22c55e',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
            Còn {remaining} slot
          </span>
        ) : (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              background: 'rgba(239, 68, 68, 0.16)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#ef4444',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
            Đạt trần ({cHeadcount}/{standardQuota})
          </span>
        )}

        {dispatchedIn > 0 && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 7px',
              borderRadius: '9999px',
              fontSize: '10.5px',
              fontWeight: 600,
              background: 'rgba(59, 130, 246, 0.14)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              color: '#60a5fa',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            title="Nhân sự từ chi nhánh khác chuyển sang hỗ trợ tạm thời (tách riêng, không tính vào định biên cơ hữu)"
          >
            +{dispatchedIn} điều động hỗ trợ
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${c.bgRaised} 0%, rgba(26, 22, 16, 0.95) 100%)`,
        border: `1px solid ${c.border}`,
        borderRadius: '12px',
        padding: '20px 22px',
        marginBottom: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="store" size={16} color={c.accent} />
            <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: c.fg, letterSpacing: '0.5px' }}>
              Tổng Quan Định Biên {allBranchesQuota.length} Chi Nhánh Hệ Thống
            </span>
            <span style={{ fontSize: '12px', color: c.fgSubtle }}>(Bấm vào chi nhánh để lọc danh sách)</span>
          </div>

          {onSelectBranch && (
            <button
              type="button"
              onClick={() => onSelectBranch('')}
              style={{
                background: !selectedBranchId ? c.accent : 'transparent',
                color: !selectedBranchId ? '#000000' : c.fgSubtle,
                border: `1px solid ${!selectedBranchId ? c.accent : c.border}`,
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Xem Toàn Bộ Chuỗi
            </button>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px',
          }}
        >
          {allBranchesQuota.map((b) => {
            const bTier = b.branchTier || 2;
            const bStandardQuota = Number(
              b.effectiveQuota ||
              b.staffCount ||
              b.targetStaffCount ||
              b.standardQuota ||
              (bTier === 1 ? 30 : bTier === 3 ? 8 : 15)
            );
            const bActive = Number(b.officialHeadcount ?? b.currentHeadcount ?? 0);
            const bDispatchedIn = Number(b.dispatchedInCount || 0);
            const bDispatchedOut = Number(b.dispatchedOutCount || 0);
            const bTotalWorking = Number(b.actualWorkingCount ?? (bActive - bDispatchedOut + bDispatchedIn));
            const bPercent = Math.min(100, Math.round((bActive / bStandardQuota) * 100));
            const bAvailable = b.availableQuotaSlots ?? Math.max(0, bStandardQuota - bActive);
            const isCardSelected = String(selectedBranchId) === String(b.branchId);
            const isFull = bActive >= bStandardQuota;

            return (
              <div
                key={b.branchId}
                onClick={() => onSelectBranch && onSelectBranch(String(b.branchId))}
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: isCardSelected ? 'rgba(212, 175, 55, 0.08)' : c.bgCard,
                  border: `1.5px solid ${isCardSelected ? c.accent : c.border}`,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '136px',
                  gap: '12px',
                  transition: 'all 0.2s ease',
                  boxShadow: isCardSelected ? '0 0 12px rgba(212, 175, 55, 0.2)' : 'none',
                }}
              >
                {/* Header card: Tên chi nhánh + Tier + Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 700,
                        color: c.fg,
                        lineHeight: '1.35',
                        minHeight: '37px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                      }}
                      title={b.branchName}
                    >
                      {b.branchName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: tierColors[bTier] || '#3b82f6',
                        }}
                      >
                        Tier {bTier} · Định biên {bStandardQuota} người
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(b)}
                </div>

                {/* Tiến độ mini (ghim sát đáy card để cân bằng hàng ngang) */}
                <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ color: c.fgMuted }}>
                        Cơ hữu: <strong style={{ color: c.fg }}>{bActive}</strong>/{bStandardQuota} ({bPercent}%)
                      </span>
                      {bDispatchedIn > 0 && (
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: 'rgba(59, 130, 246, 0.12)',
                            color: '#60a5fa',
                            fontWeight: 600,
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                            whiteSpace: 'nowrap',
                          }}
                          title={`Có ${bDispatchedIn} nhân sự điều động từ chi nhánh khác hỗ trợ (Tổng đang làm việc: ${bTotalWorking})`}
                        >
                          +{bDispatchedIn} hỗ trợ (Tổng: {bTotalWorking})
                        </span>
                      )}
                      {bDispatchedOut > 0 && (
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: 'rgba(234, 179, 8, 0.12)',
                            color: '#fbbf24',
                            fontWeight: 600,
                            border: '1px solid rgba(234, 179, 8, 0.25)',
                            whiteSpace: 'nowrap',
                          }}
                          title={`Có ${bDispatchedOut} nhân sự cơ hữu đang đi hỗ trợ chi nhánh khác`}
                        >
                          -{bDispatchedOut} đang điều động tạm thời
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span style={{ color: bAvailable > 0 ? '#38bdf8' : '#ef4444', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {bAvailable > 0 ? `Còn ${bAvailable} slot` : 'Đủ định biên'}
                      </span>
                      {isFull && bTier > 1 && canManageSystem && onUpgradeTier && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpgradeTier(b.branchId);
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                            border: 'none',
                            color: '#ffffff',
                            borderRadius: '4px',
                            padding: '2px 7px',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                            whiteSpace: 'nowrap',
                          }}
                          title={`Nâng lên Tier ${bTier === 3 ? 2 : 1} để mở rộng thêm định biên`}
                        >
                          Nâng Tier {bTier === 3 ? '2 (15)' : '1 (30)'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      height: '5px',
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${bPercent}%`,
                        background:
                          bPercent >= 100
                            ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
                            : bPercent >= 80
                              ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                              : 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                        borderRadius: '9999px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
