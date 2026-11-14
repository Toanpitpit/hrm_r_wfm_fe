import React, { useState, useEffect, useMemo } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import tierService, { TIER_DEFINITIONS } from '../services/tier.service';

export default function ChangeTierModal({
  isOpen,
  open,
  branch,
  tiers = null,
  tierDefinitions = null,
  onClose,
  onSubmit,
  onConfirm,
  loading = false,
}) {
  const { c, fonts } = useAdminTheme();

  const isModalOpen = isOpen ?? open ?? false;
  const [dbTiers, setDbTiers] = useState([]);
  const [selectedTier, setSelectedTier] = useState(null);
  const [note, setNote] = useState('');
  const [validationError, setValidationError] = useState('');

  const currentStaffCount = Number(branch?.currentStaffCount ?? 0);

  // Lấy dữ liệu Tier trực tiếp từ database nếu chưa có từ props
  useEffect(() => {
    let isMounted = true;
    tierService.getAllTiers()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setDbTiers(data);
        }
      })
      .catch((err) => console.warn('[ChangeTierModal] Load tiers from DB error:', err));
    return () => { isMounted = false; };
  }, [isModalOpen]);

  // Chuẩn hóa danh sách Tier lấy từ Database
  const activeTiers = useMemo(() => {
    const rawList = (Array.isArray(tiers) && tiers.length > 0)
      ? tiers
      : (dbTiers.length > 0 ? dbTiers : (Array.isArray(tierDefinitions) && tierDefinitions.length > 0 ? tierDefinitions : TIER_DEFINITIONS));

    // Sắp xếp theo minStaffCount hoặc id
    const sorted = [...rawList].sort((a, b) => {
      const aMin = Number(a.minStaffCount ?? a.min_staff_count ?? a.minStaff ?? 0);
      const bMin = Number(b.minStaffCount ?? b.min_staff_count ?? b.minStaff ?? 0);
      return aMin - bMin;
    });

    return sorted.map((t, idx) => {
      const id = t.id ?? t.tier_id ?? t.tier ?? idx + 1;
      const rawName = t.tierName || t.tier_name || t.shortName || `Tier ${id}`;
      const min = Number(t.minStaffCount ?? t.min_staff_count ?? t.minStaff ?? 0);
      const max = t.maxStaffCount !== null && t.maxStaffCount !== undefined
        ? Number(t.maxStaffCount)
        : (t.max_staff_count !== null && t.max_staff_count !== undefined
            ? Number(t.max_staff_count)
            : (t.maxStaff ? Number(t.maxStaff) : null));
      const quota = Number(t.standardQuota || max || (min > 0 ? min + 5 : 15));

      // Màu sắc nhận diện
      let color = t.color;
      if (!color) {
        const lower = rawName.toLowerCase();
        if (lower.includes('1') || lower.includes('flagship')) color = '#f59e0b';
        else if (lower.includes('2') || lower.includes('tiêu chuẩn') || lower.includes('standard')) color = '#3b82f6';
        else if (lower.includes('3') || lower.includes('mini') || lower.includes('nhỏ')) color = '#10b981';
        else if (lower.includes('4')) color = '#a855f7';
        else color = ['#f59e0b', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#06b6d4'][idx % 6];
      }

      return {
        id,
        rawObj: t,
        name: rawName,
        shortName: rawName,
        minStaff: min,
        maxStaff: max,
        standardQuota: quota,
        color,
        description: t.description || '',
      };
    });
  }, [tiers, dbTiers, tierDefinitions]);

  useEffect(() => {
    if (branch && activeTiers.length > 0) {
      const bTierId = Number(branch.tierId || 0);
      const bTierVal = Number(branch.branchTier ?? branch.tier ?? 2);

      const found =
        activeTiers.find((t) => Number(t.id) === bTierId) ||
        activeTiers.find((t) => {
          const match = t.name.match(/\d+/);
          return match && Number(match[0]) === bTierVal;
        }) ||
        activeTiers.find((t) => Number(t.id) === bTierVal) ||
        activeTiers[0];

      setSelectedTier(found ? found.id : activeTiers[0].id);
      setNote('');
      setValidationError('');
    }
  }, [branch, isModalOpen, activeTiers]);

  if (!isModalOpen || !branch) return null;

  const targetTierDef = activeTiers.find((t) => t.id === selectedTier) || activeTiers[0];

  const handleSelectTier = (tierId) => {
    setSelectedTier(tierId);
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitHandler = onSubmit || onConfirm;
    if (typeof submitHandler === 'function') {
      try {
        const matchedTier = targetTierDef;
        const targetTierId = Number(matchedTier?.rawObj?.id || matchedTier?.id || selectedTier || 0);

        // Trích xuất số phân cấp nếu có (1, 2, 3...)
        let tierNum = matchedTier?.name && matchedTier.name.match(/\d+/)
          ? Number(matchedTier.name.match(/\d+/)[0])
          : (Number(matchedTier?.id) <= 3 ? Number(matchedTier?.id) : 2);

        await submitHandler(
          branch.storeId || branch.id,
          {
            tierId: targetTierId,
            id: targetTierId,
            branchTier: tierNum,
            tier: tierNum,
            tierName: matchedTier?.name,
            quota: matchedTier?.standardQuota,
            note: note,
          },
          matchedTier?.standardQuota,
          note
        );
      } catch (err) {
        setValidationError(err.message || 'Lỗi khi cập nhật phân cấp');
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          backgroundColor: c.bgCard,
          border: `1px solid ${c.border}`,
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: `1px solid ${c.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: c.bgElev,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: `${c.accent}20`,
                border: `1px solid ${c.accent}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: c.accent,
              }}
            >
              <Icon name="layers" size={20} />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '17px',
                  fontWeight: 700,
                  color: c.fg,
                  fontFamily: fonts?.heading || 'inherit',
                }}
              >
                Cập Nhật Phân Cấp Chi Nhánh
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: c.fgSubtle }}>
                Thiết lập phân cấp chi nhánh theo tiêu chuẩn quy mô hệ thống
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: c.fgSubtle,
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Branch Info Banner */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '10px',
              backgroundColor: c.bgRaised,
              border: `1px solid ${c.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '13px',
                    color: c.accent,
                    backgroundColor: `${c.accent}15`,
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {branch.branchCode || branch.code || `CH0${branch.storeId || branch.id}`}
                </span>
                <span style={{ fontWeight: 700, fontSize: '15px', color: c.fg }}>
                  {branch.name || branch.storeName}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: c.fgSubtle, marginTop: '4px' }}>
                {branch.address || 'Chưa cập nhật địa chỉ'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: c.fgSubtle, textTransform: 'uppercase' }}>Quân số thực tế</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                {currentStaffCount} nhân sự
              </div>
            </div>
          </div>

          {/* 1. Tier Selection Cards (Lấy động từ Database) */}
          <div>
            <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: c.fg, marginBottom: '8px' }}>
              1. Chọn Phân Cấp Chi Nhánh (Tier):
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: activeTiers.length > 3 ? 'repeat(auto-fit, minmax(150px, 1fr))' : `repeat(${Math.max(1, activeTiers.length)}, 1fr)`,
                gap: '12px',
              }}
            >
              {activeTiers.map((td) => {
                const isSelected = selectedTier === td.id;
                return (
                  <div
                    key={td.id}
                    onClick={() => handleSelectTier(td.id)}
                    style={{
                      border: `2px solid ${isSelected ? td.color : c.border}`,
                      borderRadius: '12px',
                      padding: '14px',
                      backgroundColor: isSelected ? `${td.color}15` : c.bgRaised,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                  >
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: td.color,
                          color: '#000',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon name="check" size={12} color="#000" />
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: td.color,
                          flexShrink: 0,
                        }}
                      />
                      <strong style={{ fontSize: '14px', color: td.color }}>
                        {td.shortName}
                      </strong>
                    </div>

                    <div style={{ fontSize: '12px', color: c.fgSubtle, marginBottom: '4px' }}>
                      Định biên: <strong style={{ color: c.fg }}>{td.standardQuota} nv</strong>
                    </div>
                    <div style={{ fontSize: '11.5px', color: c.fgFaint }}>
                      Khoảng: {td.minStaff} - {td.maxStaff ? `${td.maxStaff} nv` : '+ nv'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Audit Note */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: c.fg, marginBottom: '6px' }}>
              2. Lý Do / Ghi Chú Điều Chỉnh (Audit Trail):
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Điều chỉnh tăng 3 nhân sự thu ngân phục vụ mở rộng ca tối quý 4..."
              rows={2}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${c.border}`,
                backgroundColor: c.bgRaised,
                color: c.fg,
                fontSize: '13px',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {validationError && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#ef4444',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Icon name="alert-triangle" size={16} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Modal Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '12px',
              borderTop: `1px solid ${c.border}`,
            }}
          >
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit" loading={loading} disabled={loading}>
              <Icon name="check" size={15} />
              <span>Xác nhận Cập nhật ({targetTierDef.shortName})</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
