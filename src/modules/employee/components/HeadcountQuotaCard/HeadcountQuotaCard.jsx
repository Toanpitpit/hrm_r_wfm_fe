import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Icon from '@/shared/components/ui/Icon';

export default function HeadcountQuotaCard({
  allBranchesQuota = [],
  selectedBranchId = '',
  onSelectBranch,
  isStoreManager = false,
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
    const sQuota = statusObj.standardQuota || 15;
    const cHeadcount = statusObj.currentHeadcount || 0;
    const addQuota = statusObj.additionalApprovedQuota || 0;
    const reached = Boolean(statusObj.isStandardQuotaReached ?? statusObj.isQuotaReached ?? (cHeadcount >= sQuota));

    if (!reached && cHeadcount < sQuota) {
      const remaining = sQuota - cHeadcount;
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 9px',
            borderRadius: '9999px',
            fontSize: '11.5px',
            fontWeight: 600,
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#22c55e',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
          Còn trống {remaining} vị trí
        </span>
      );
    }
    if (addQuota > 0) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 9px',
            borderRadius: '9999px',
            fontSize: '11.5px',
            fontWeight: 600,
            background: 'rgba(168, 85, 247, 0.12)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            color: '#c084fc',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c084fc' }} />
          Định biên mở rộng (+{addQuota})
        </span>
      );
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 9px',
          borderRadius: '9999px',
          fontSize: '11.5px',
          fontWeight: 600,
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
        Đạt trần định biên ({cHeadcount}/{sQuota})
      </span>
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
              Tổng Quan Định Biên 3 Chi Nhánh Hệ Thống
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
            const bQuota = b.standardQuota || (bTier === 1 ? 30 : 15);
            const bActive = b.currentHeadcount || 0;
            const bPercent = Math.min(100, Math.round((bActive / bQuota) * 100));
            const isCardSelected = String(selectedBranchId) === String(b.branchId);

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
                  gap: '10px',
                  transition: 'all 0.2s ease',
                  boxShadow: isCardSelected ? '0 0 12px rgba(212, 175, 55, 0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: c.fg }}>
                      {b.branchName}
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: tierColors[bTier] || '#3b82f6',
                        display: 'inline-block',
                        marginTop: '2px',
                      }}
                    >
                      Tier {bTier} • Quota {bQuota} người
                    </span>
                  </div>
                  {getStatusBadge(b)}
                </div>

                {/* Tiến độ mini */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                    <span style={{ color: c.fgMuted }}>
                      Hiện tại: <strong>{bActive}</strong>/{bQuota} ({bPercent}%)
                    </span>
                    <span style={{ color: b.totalAvailableSlots > 0 ? '#38bdf8' : '#ef4444', fontWeight: 600 }}>
                      {b.totalAvailableSlots > 0 ? `Còn ${b.totalAvailableSlots} slot` : 'Đầy định biên'}
                    </span>
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
                            ? '#ef4444'
                            : bPercent >= 80
                            ? '#f59e0b'
                            : '#22c55e',
                        borderRadius: '9999px',
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
