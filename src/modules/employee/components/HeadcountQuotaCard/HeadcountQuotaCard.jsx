import React, { useMemo } from 'react';
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
  const { c, theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const tierColors = {
    1: '#eab308',
    2: '#3b82f6',
    3: '#9ca3af',
  };

  const overQuotaBranches = useMemo(() => {
    return (allBranchesQuota || []).filter((b) => {
      const active = Number(b.officialHeadcount ?? b.currentHeadcount ?? 0);
      const quota = Number(b.standardQuota || b.effectiveQuota || 0);
      return active > quota && quota > 0;
    }).map((b) => {
      const active = Number(b.officialHeadcount ?? b.currentHeadcount ?? 0);
      const quota = Number(b.standardQuota || b.effectiveQuota || 0);
      return {
        ...b,
        active,
        standardQuota: quota,
        diff: active - quota,
      };
    });
  }, [allBranchesQuota]);

  if (isStoreManager || !allBranchesQuota || allBranchesQuota.length === 0) {
    return null;
  }

  const getStatusBadge = (statusObj) => {
    const isLocked = statusObj.status === 'INACTIVE' || statusObj.status === 'LOCKED';
    if (isLocked) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
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
            Tạm Khóa
          </span>
        </div>
      );
    }

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
    const isOver = cHeadcount > standardQuota && standardQuota > 0;
    const remaining = Math.max(0, standardQuota - cHeadcount);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
        {isOver ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              background: isDark ? 'rgba(239, 68, 68, 0.22)' : '#fee2e2',
              border: '1.5px solid #ef4444',
              color: isDark ? '#fca5a5' : '#b91c1c',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: '0 1px 4px rgba(239, 68, 68, 0.2)',
            }}
            title={`Vượt định biên ${cHeadcount - standardQuota} nhân sự`}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
            ⚠️ Vượt định biên ({cHeadcount}/{standardQuota})
          </span>
        ) : !isReached ? (
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
              background: isDark ? 'rgba(239, 68, 68, 0.16)' : '#fee2e2',
              border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.4)' : '#fca5a5'}`,
              color: isDark ? '#f87171' : '#b91c1c',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isDark ? '#f87171' : '#dc2626', flexShrink: 0 }} />
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

  // Tính tổng số lượng nhân sự cơ hữu toàn chuỗi từ danh sách định biên
  const totalChainHeadcount = allBranchesQuota.reduce(
    (sum, b) => sum + Number(b.officialHeadcount ?? b.currentHeadcount ?? 0),
    0
  );

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
                background: !selectedBranchId ? 'var(--color-primary, #0D9488)' : 'transparent',
                color: !selectedBranchId ? '#ffffff' : c.fgSubtle,
                border: `1px solid ${!selectedBranchId ? 'var(--color-primary, #0D9488)' : c.border}`,
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Xem Toàn Bộ Chuỗi {!selectedBranchId && totalChainHeadcount > 0 ? `(${totalChainHeadcount})` : ''}
            </button>
          )}
        </div>

        {/* Cảnh báo nếu có chi nhánh vượt quá định biên phân cấp */}
        {overQuotaBranches.length > 0 && (
          <div
            style={{
              padding: '11px 16px',
              borderRadius: '10px',
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.14)' : '#fef2f2',
              border: `1.5px solid ${isDark ? '#ef4444' : '#f87171'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '14px',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name="alert-triangle" size={17} color="#ffffff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>
                CẢNH BÁO: CÓ {overQuotaBranches.length} CHI NHÁNH QUÂN SỐ VƯỢT QUÁ ĐỊNH BIÊN PHÂN CẤP!
              </div>
              <div style={{ fontSize: '12px', color: c.fg, marginTop: '2px', lineHeight: '1.4' }}>
                {overQuotaBranches.map((b, idx) => (
                  <span key={b.branchId}>
                    {idx > 0 && ' • '}
                    <strong>{b.branchName}</strong>: <span style={{ color: '#ef4444', fontWeight: 700 }}>{b.active}/{b.standardQuota}</span> (vượt {b.diff} người)
                  </span>
                ))}. Vui lòng nâng phân cấp (Tier) hoặc điều chuyển nhân sự để đảm bảo đúng định biên!
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px',
          }}
        >
          {allBranchesQuota.map((b) => {
            const bId = b.branchId || b.id || b.storeId;
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
            const isCardSelected = String(selectedBranchId) === String(bId);
            const isOverTier = bActive > bStandardQuota && bStandardQuota > 0;
            const isFull = bActive >= bStandardQuota;
            const isLocked = b.status === 'INACTIVE' || b.status === 'LOCKED';

            return (
              <div
                key={bId}
                onClick={() => onSelectBranch && onSelectBranch(isCardSelected ? '' : String(bId))}
                title={isCardSelected ? `Đang lọc theo ${b.branchName} (Bấm lại để xem toàn bộ chuỗi)` : `Bấm để xem số liệu chi tiết ${b.branchName}`}
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: isCardSelected
                    ? (isDark ? 'rgba(13, 148, 136, 0.16)' : 'rgba(13, 148, 136, 0.08)')
                    : (isOverTier
                        ? (isDark ? 'rgba(239, 68, 68, 0.10)' : '#fff5f5')
                        : (isLocked
                            ? (isDark ? 'rgba(239, 68, 68, 0.08)' : '#fef2f2')
                            : (isDark ? c.bgCard : '#ffffff'))),
                  border: `2px solid ${
                    isCardSelected
                      ? 'var(--color-primary, #0D9488)'
                      : (isOverTier
                          ? '#ef4444'
                          : (isLocked ? 'rgba(239, 68, 68, 0.35)' : (isDark ? c.border : '#e2e8f0')))
                  }`,
                  opacity: isLocked && !isCardSelected ? 0.85 : 1,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '136px',
                  gap: '12px',
                  transition: 'all 0.2s ease',
                  boxShadow: isCardSelected ? '0 0 16px rgba(13, 148, 136, 0.25)' : 'none',
                  position: 'relative',
                }}
              >
                {/* Header card: Tên chi nhánh + Tier + Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 700,
                        color: isCardSelected ? 'var(--color-primary, #0D9488)' : (isLocked ? '#f87171' : c.fg),
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
                      {isLocked && (
                        <span style={{ color: '#ef4444', fontSize: '11px', marginLeft: '6px', fontWeight: 600 }}>
                          (Tạm Khóa)
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: tierColors[bTier] || (isDark ? '#a855f7' : '#7c3aed'),
                          background: isDark
                            ? (bTier === 1 ? 'rgba(251, 191, 36, 0.14)' : bTier === 2 ? 'rgba(96, 165, 250, 0.14)' : bTier === 3 ? 'rgba(148, 163, 184, 0.14)' : 'rgba(168, 85, 247, 0.14)')
                            : (bTier === 1 ? '#fef3c7' : bTier === 2 ? '#dbeafe' : bTier === 3 ? '#f1f5f9' : '#f3e8ff'),
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {b.tierName || b.branchTierName || (bTier ? `Tier ${bTier}` : 'Chưa phân cấp')} · Định biên {bStandardQuota} người
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    {isCardSelected && (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'var(--color-primary, #0D9488)',
                          color: '#ffffff',
                          fontWeight: 700,
                          boxShadow: '0 1px 4px rgba(13, 148, 136, 0.4)',
                        }}
                      >
                        ✓ Đang lọc
                      </span>
                    )}
                    {getStatusBadge(b)}
                  </div>
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
                      {isOverTier ? (
                        <span style={{ color: '#ef4444', fontWeight: 700, whiteSpace: 'nowrap', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          ⚠️ Vượt {bActive - bStandardQuota} người
                        </span>
                      ) : (
                        <span style={{ color: bAvailable > 0 ? (isDark ? '#38bdf8' : '#0284c7') : '#dc2626', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {bAvailable > 0 ? `Còn ${bAvailable} slot` : 'Đủ định biên'}
                        </span>
                      )}
                      {(isFull || isOverTier) && !String(b.tierName || '').toLowerCase().includes('1') && bTier !== 1 && canManageSystem && onUpgradeTier && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpgradeTier(b.branchId);
                          }}
                          style={{
                            background: isOverTier
                              ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                              : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
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
                          title="Nâng cấp phân cấp để mở rộng thêm định biên"
                        >
                          Nâng Phân Cấp
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
