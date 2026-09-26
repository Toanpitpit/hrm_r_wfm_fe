import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import { TIER_DEFINITIONS, getBranchQuota } from '../services/tier.service';

export default function ChangeTierModal({
  isOpen,
  branch,
  onClose,
  onSubmit,
  loading = false,
}) {
  const { c, fonts } = useAdminTheme();

  const currentTierVal = Number(branch?.branchTier ?? branch?.tier ?? 2);
  const [selectedTier, setSelectedTier] = useState(currentTierVal);
  const [quota, setQuota] = useState(15);
  const [note, setNote] = useState('');
  const [validationError, setValidationError] = useState('');

  const currentStaffCount = Number(branch?.currentStaffCount ?? 15);

  useEffect(() => {
    if (branch) {
      const t = Number(branch.branchTier ?? branch.tier ?? 2);
      const bId = Number(branch.storeId || branch.id);
      const currentQuota = branch.customQuota || branch.targetStaffCount || getBranchQuota(bId, t);

      setSelectedTier(t);
      setQuota(currentQuota);
      setNote('');
      setValidationError('');
    }
  }, [branch, isOpen]);

  if (!isOpen || !branch) return null;

  const currentTierDef = TIER_DEFINITIONS.find((t) => t.tier === currentTierVal) || TIER_DEFINITIONS[1];
  const targetTierDef = TIER_DEFINITIONS.find((t) => t.tier === selectedTier) || TIER_DEFINITIONS[1];

  // Khi người dùng chọn sang Tier khác: tự động gợi ý standardQuota của Tier đó
  const handleSelectTier = (newTier) => {
    setSelectedTier(newTier);
    const def = TIER_DEFINITIONS.find((t) => t.tier === newTier);
    if (def) {
      setQuota(def.standardQuota);
    }
    setValidationError('');
  };

  const handleAdjustQuota = (delta) => {
    setQuota((prev) => Math.max(1, prev + delta));
    setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quota <= 0) {
      setValidationError('Chỉ tiêu định biên nhân sự phải lớn hơn 0.');
      return;
    }
    onSubmit(branch.storeId || branch.id, selectedTier, quota, note);
  };

  const availableSlots = Math.max(0, quota - currentStaffCount);
  const isOverQuota = currentStaffCount > quota;
  const isHigherThanTierMax = quota > targetTierDef.maxStaff;
  const isLowerThanTierMin = quota < targetTierDef.minStaff;

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
                Cập Nhật Phân Cấp & Định Biên Nhân Sự
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: c.fgSubtle }}>
                Thiết lập cấp chi nhánh, tăng/giảm định biên quân số và quyền lợi trạm Kiosk
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
                📍 {branch.address || 'Chưa cập nhật địa chỉ'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: c.fgSubtle, textTransform: 'uppercase' }}>Quân số thực tế</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                {currentStaffCount} nhân sự
              </div>
            </div>
          </div>

          {/* 1. Tier Selection Cards */}
          <div>
            <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: c.fg, marginBottom: '8px' }}>
              1. Chọn Phân Cấp Chi Nhánh (Tier):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {TIER_DEFINITIONS.map((td) => {
                const isSelected = selectedTier === td.tier;
                return (
                  <div
                    key={td.tier}
                    onClick={() => handleSelectTier(td.tier)}
                    style={{
                      border: `2px solid ${isSelected ? td.color : c.border}`,
                      borderRadius: '12px',
                      padding: '14px',
                      backgroundColor: isSelected ? `${td.color}12` : c.bgRaised,
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
                        }}
                      />
                      <strong style={{ fontSize: '14px', color: td.color }}>
                        {td.shortName}
                      </strong>
                    </div>

                    <div style={{ fontSize: '12px', color: c.fgSubtle, marginBottom: '4px' }}>
                      Định biên chuẩn: <strong style={{ color: c.fg }}>{td.standardQuota} nv</strong>
                    </div>
                    <div style={{ fontSize: '11.5px', color: c.fgFaint }}>
                      Khoảng: {td.minStaff} - {td.maxStaff} nv
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Custom Headcount Stepper (Tăng / Giảm nhân sự) */}
          <div
            style={{
              padding: '18px',
              borderRadius: '12px',
              border: `1px solid ${c.border}`,
              backgroundColor: c.bgRaised,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: c.fg }}>
                  2. Điều Chỉnh Chỉ Tiêu Định Biên Nhân Sự (Thêm / Bớt):
                </label>
                <div style={{ fontSize: '12px', color: c.fgSubtle, marginTop: '2px' }}>
                  Khoảng chuẩn của {targetTierDef.shortName}: <strong>{targetTierDef.minStaff} - {targetTierDef.maxStaff} nhân sự</strong>
                </div>
              </div>

              {/* Status Badge */}
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  backgroundColor: isHigherThanTierMax
                    ? 'rgba(234, 179, 8, 0.2)'
                    : isLowerThanTierMin
                    ? 'rgba(59, 130, 246, 0.2)'
                    : 'rgba(16, 185, 129, 0.2)',
                  color: isHigherThanTierMax
                    ? '#eab308'
                    : isLowerThanTierMin
                    ? '#60a5fa'
                    : '#10b981',
                }}
              >
                {isHigherThanTierMax
                  ? `Vượt trần Tier (+${quota - targetTierDef.maxStaff} nv)`
                  : isLowerThanTierMin
                  ? `Dưới sàn Tier (-${targetTierDef.minStaff - quota} nv)`
                  : 'Chuẩn quy mô Tier'}
              </span>
            </div>

            {/* Stepper Input & Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              {/* Decrease Button */}
              <button
                type="button"
                onClick={() => handleAdjustQuota(-1)}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  border: `1px solid ${c.border}`,
                  backgroundColor: c.bgElev,
                  color: c.fg,
                  fontSize: '20px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                title="Bớt 1 nhân sự"
              >
                −
              </button>

              {/* Number Box */}
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quota}
                  onChange={(e) => {
                    setQuota(Number(e.target.value) || 1);
                    setValidationError('');
                  }}
                  style={{
                    width: '100%',
                    height: '44px',
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: 800,
                    color: targetTierDef.color,
                    backgroundColor: c.bgCard,
                    border: `2px solid ${targetTierDef.color}60`,
                    borderRadius: '10px',
                    outline: 'none',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '14px',
                    fontSize: '12px',
                    color: c.fgSubtle,
                    pointerEvents: 'none',
                  }}
                >
                  nhân sự
                </span>
              </div>

              {/* Increase Button */}
              <button
                type="button"
                onClick={() => handleAdjustQuota(1)}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  border: `1px solid ${c.border}`,
                  backgroundColor: c.bgElev,
                  color: c.fg,
                  fontSize: '20px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                title="Thêm 1 nhân sự"
              >
                +
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11.5px', color: c.fgSubtle, marginRight: '4px' }}>Chỉnh nhanh:</span>
              <button
                type="button"
                onClick={() => handleAdjustQuota(-5)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${c.border}`,
                  backgroundColor: c.bgCard,
                  color: c.fgSubtle,
                  fontSize: '11.5px',
                  cursor: 'pointer',
                }}
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => handleAdjustQuota(-2)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${c.border}`,
                  backgroundColor: c.bgCard,
                  color: c.fgSubtle,
                  fontSize: '11.5px',
                  cursor: 'pointer',
                }}
              >
                -2
              </button>
              <button
                type="button"
                onClick={() => handleAdjustQuota(2)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${c.border}`,
                  backgroundColor: c.bgCard,
                  color: c.fg,
                  fontSize: '11.5px',
                  cursor: 'pointer',
                }}
              >
                +2
              </button>
              <button
                type="button"
                onClick={() => handleAdjustQuota(5)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${c.border}`,
                  backgroundColor: c.bgCard,
                  color: c.fg,
                  fontSize: '11.5px',
                  cursor: 'pointer',
                }}
              >
                +5
              </button>
              <button
                type="button"
                onClick={() => setQuota(targetTierDef.standardQuota)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: `1px solid ${targetTierDef.color}60`,
                  backgroundColor: `${targetTierDef.color}15`,
                  color: targetTierDef.color,
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginLeft: 'auto',
                }}
              >
                Đặt chuẩn {targetTierDef.standardQuota} nv
              </button>
            </div>

            {/* Comparison Summary Banner */}
            <div
              style={{
                marginTop: '14px',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: c.bgCard,
                border: `1px solid ${c.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
              }}
            >
              <div>
                Quân số hiện tại: <strong>{currentStaffCount}</strong> / Định biên mới: <strong style={{ color: targetTierDef.color }}>{quota}</strong>
              </div>
              <div style={{ color: isOverQuota ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                {isOverQuota
                  ? `⚠️ Vượt định biên ${currentStaffCount - quota} người`
                  : `✅ Còn trống ${availableSlots} slot tuyển mới`}
              </div>
            </div>
          </div>

          {/* 3. Audit Note */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: c.fg, marginBottom: '6px' }}>
              3. Lý Do / Ghi Chú Điều Chỉnh (Audit Trail):
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
              <span>Xác nhận Cập nhật ({quota} Nhân Sự)</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
