import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import { Field as FormField } from '@/shared/components/ui/FormField';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import BranchMapPicker from './BranchMapPicker';
import tierService from '../services/tier.service';

/**
 * ==============================================================================
 * COMPONENT: BranchFormModal.jsx
 * UC 1.2: Modal Thêm / Chỉnh sửa Chi nhánh
 * ==============================================================================
 * Form validate đầy đủ:
 * - Code (Mã chi nhánh: CH01, CH02...)
 * - Name (Tên chi nhánh)
 * - Address (Địa chỉ chi nhánh)
 * - Tọa độ Point [Latitude, Longitude] & Bán kính Geofence Radius
 * - Mini Leaflet Map Picker chọn vị trí trực quan
 */
export default function BranchFormModal({
  open = false,
  initialData = null,
  tiers: propTiers = null,
  onClose,
  onSubmit,
}) {
  const { c } = useAdminTheme();

  const [dbTiers, setDbTiers] = useState(Array.isArray(propTiers) ? propTiers : []);
  const [formData, setFormData] = useState({
    branchCode: '',
    name: '',
    address: '',
    tierId: null,
    branchTier: 2,
    staffCount: 0,
    latitude: 21.033333,
    longitude: 105.795000,
    radiusMeters: 100,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (Array.isArray(propTiers) && propTiers.length > 0) {
      setDbTiers(propTiers);
      return;
    }
    let isMounted = true;
    tierService.getAllTiers()
      .then((tiers) => {
        if (isMounted && Array.isArray(tiers) && tiers.length > 0) {
          setDbTiers(tiers);
        }
      })
      .catch((err) => console.warn('[BranchFormModal] Load tiers from DB error:', err));
    return () => { isMounted = false; };
  }, [open, propTiers]);

  useEffect(() => {
    if (initialData) {
      const tierVal = Number(initialData.branchTier ?? initialData.tier ?? 2);
      const tierIdVal = Number(initialData.tierId || initialData.tier?.id || initialData.tierObj?.id || 0) || null;
      setFormData({
        branchCode: initialData.branchCode || initialData.code || '',
        name: initialData.name || initialData.storeName || '',
        address: initialData.address || '',
        tierId: tierIdVal,
        branchTier: [1, 2, 3].includes(tierVal) ? tierVal : 2,
        staffCount: Number(initialData.staffCount ?? 0),
        latitude: Number(initialData.latitude || initialData.lat || (initialData.location?.coordinates ? initialData.location.coordinates[1] : 21.033333)),
        longitude: Number(initialData.longitude || initialData.lng || (initialData.location?.coordinates ? initialData.location.coordinates[0] : 105.795000)),
        radiusMeters: Number(initialData.geofenceRadiusMeters ?? initialData.radiusMeters ?? initialData.radius ?? 100),
      });
    } else {
      setFormData({
        branchCode: '',
        name: '',
        address: '',
        tierId: dbTiers.length > 0 ? dbTiers[0].id : null,
        branchTier: 2,
        staffCount: 0,
        latitude: 21.028511,
        longitude: 105.854167,
        radiusMeters: 100,
      });
    }
    setErrors({});
    setServerError('');
  }, [initialData, open, dbTiers]);

  const validate = () => {
    const errs = {};
    const code = (formData.branchCode || '').trim();
    const name = (formData.name || '').trim();
    const address = (formData.address || '').trim();
    const lat = Number(formData.latitude);
    const lng = Number(formData.longitude);

    if (!code) {
      errs.branchCode = 'Vui lòng nhập mã chi nhánh (VD: CH03, HCM02).';
    } else if (code.length < 2) {
      errs.branchCode = 'Mã chi nhánh tối thiểu 2 ký tự.';
    }

    if (!name) {
      errs.name = 'Vui lòng nhập tên chi nhánh.';
    } else if (name.length < 3) {
      errs.name = 'Tên chi nhánh tối thiểu 3 ký tự.';
    }

    if (!address) {
      errs.address = 'Vui lòng nhập địa chỉ chi nhánh.';
    }

    if (isNaN(lat) || lat < -90 || lat > 90) {
      errs.latitude = 'Vĩ độ không hợp lệ (-90 đến 90).';
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      errs.longitude = 'Kinh độ không hợp lệ (-180 đến 180).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setServerError('');
    if (!validate()) return;

    try {
      setSubmitting(true);
      const rawRadius = parseInt(formData.radiusMeters, 10);
      const validRadius = isNaN(rawRadius) || rawRadius < 20 ? 100 : Math.min(rawRadius, 1000);
      const selectedTier = dbTiers.find((t) => Number(t.id || t.tier_id) === Number(formData.tierId));
      const tierVal = selectedTier?.tierName && selectedTier.tierName.match(/\d+/)
        ? Number(selectedTier.tierName.match(/\d+/)[0])
        : (Number(formData.branchTier) || 2);
      const safeTier = [1, 2, 3].includes(tierVal) ? tierVal : 2;

      const submitPayload = {
        ...formData,
        tierId: formData.tierId ? Number(formData.tierId) : undefined,
        branchTier: safeTier,
        tier: safeTier,
        radiusMeters: validRadius,
        geofenceRadiusMeters: validRadius,
      };
      const res = await onSubmit(submitPayload);
      if (res?.success === false) {
        setServerError(res.error || 'Có lỗi xảy ra khi lưu chi nhánh.');
      } else {
        onClose();
      }
    } catch (err) {
      setServerError(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setSubmitting(false);
    }
  };


  const isEditing = Boolean(initialData);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Chỉnh Sửa Chi Nhánh & Tọa Độ Bản Đồ' : 'Thêm Chi Nhánh & Ghim Tọa Độ Mới'}
      width="640px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Thông báo lỗi từ Server nếu có */}
          {serverError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#ef444415',
                border: '1px solid #ef444450',
                color: '#ef4444',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              <Icon name="alert-triangle" size={16} />
              <span>{serverError}</span>
            </div>
          )}


          {/* 1. Mã Chi Nhánh & Cấp Chi Nhánh */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px' }}>
            <FormField
              label="Mã Chi Nhánh"
              required
              error={errors.branchCode}
            >
              <input
                type="text"
                value={formData.branchCode}
                disabled={isEditing}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/\s+/g, '');
                  setFormData((prev) => ({ ...prev, branchCode: val }));
                  if (errors.branchCode) setErrors((prev) => ({ ...prev, branchCode: null }));
                  if (serverError) setServerError('');
                }}
                placeholder="VD: CH03"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.branchCode ? '#ef4444' : c.border}`,
                  backgroundColor: isEditing ? `${c.bgSubtle}` : c.bgCard,
                  color: c.fg,
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}
              />
            </FormField>

            <FormField
              label="Phân Cấp Chi Nhánh (Tier)"
              required

            >
              <select
                value={
                  formData.tierId ||
                  dbTiers.find((t) => {
                    const match = (t.tierName || t.tier_name || '').match(/\d+/);
                    return match && Number(match[0]) === Number(formData.branchTier);
                  })?.id ||
                  formData.branchTier ||
                  2
                }
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const selected = dbTiers.find((t) => Number(t.id || t.tier_id) === val);
                  const tierNum = selected?.tierName && selected.tierName.match(/\d+/)
                    ? Number(selected.tierName.match(/\d+/)[0])
                    : (val <= 3 ? val : 2);
                  setFormData((prev) => ({
                    ...prev,
                    tierId: val,
                    branchTier: [1, 2, 3].includes(tierNum) ? tierNum : (val <= 3 ? val : 2),
                  }));
                  if (serverError) setServerError('');
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${c.border}`,
                  backgroundColor: c.bgCard,
                  color: c.fg,
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {dbTiers.length > 0 ? (
                  dbTiers.map((t) => {
                    const id = t.id || t.tier_id;
                    const name = t.tierName || t.tier_name || `Tier ${id}`;
                    const min = t.minStaffCount ?? t.min_staff_count ?? 0;
                    const max = t.maxStaffCount ?? t.max_staff_count;
                    const countDesc = max ? `Tối đa ${max} nhân sự` : `Từ ${min} nhân sự`;
                    return (
                      <option key={id} value={id} style={{ backgroundColor: c.bgCard, color: c.fg }}>
                        {name} ({countDesc})
                      </option>
                    );
                  })
                ) : (
                  <>
                    <option value={1} style={{ backgroundColor: c.bgCard, color: c.fg }}>Tier 1 - Đại siêu thị (Tối đa 30 nhân sự)</option>
                    <option value={2} style={{ backgroundColor: c.bgCard, color: c.fg }}>Tier 2 - Tiêu chuẩn (Tối đa 15 nhân sự)</option>
                    <option value={3} style={{ backgroundColor: c.bgCard, color: c.fg }}>Tier 3 - Cửa hàng tiện lợi mini (Tối đa 8 nhân sự)</option>
                  </>
                )}
              </select>
            </FormField>
          </div>



          {/* 2. Tên Chi Nhánh */}
          <FormField
            label="Tên Chi Nhánh"
            required
            error={errors.name}

          >
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev) => ({ ...prev, name: val }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                if (serverError) setServerError('');
              }}
              placeholder="VD: Siêu thị Tiện lợi Cầu Giấy"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.name ? '#ef4444' : c.border}`,
                backgroundColor: c.bgCard,
                color: c.fg,
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </FormField>

          {/* 3. Địa Chỉ */}
          <FormField
            label="Địa Chỉ Chi Nhánh"
            required
            error={errors.address}
          >
            <input
              type="text"
              value={formData.address}
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev) => ({ ...prev, address: val }));
                if (errors.address) setErrors((prev) => ({ ...prev, address: null }));
                if (serverError) setServerError('');
              }}
              placeholder="VD: 123 Cầu Giấy, Hà Nội"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.address ? '#ef4444' : c.border}`,
                backgroundColor: c.bgCard,
                color: c.fg,
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </FormField>

          {/* 3. Tọa độ Point (Latitude, Longitude) & Bán kính Geofence */}
          <div
            style={{
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: `${c.bgElev}`,
              border: `1px solid ${c.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <FormField
                label="Vĩ Độ (Latitude)"
                required
                error={errors.latitude}
              >
                <input
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setFormData((prev) => ({ ...prev, latitude: val }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${c.border}`,
                    backgroundColor: c.bgCard,
                    color: c.fg,
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                />
              </FormField>

              <FormField
                label="Kinh Độ (Longitude)"
                required
                error={errors.longitude}
              >
                <input
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setFormData((prev) => ({ ...prev, longitude: val }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${c.border}`,
                    backgroundColor: c.bgCard,
                    color: c.fg,
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                />
              </FormField>

              <FormField
                label="Bán Kính Geofence (m)"
              >
                <input type="number" min="20" max="1000" step="10" placeholder="Bán kính GPS (20 - 1000m)"
                  placeholder="100m (20 - 1000m)"
                  value={formData.radiusMeters}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const val = raw === '' ? '' : parseInt(raw, 10);
                    setFormData((prev) => ({ ...prev, radiusMeters: val }));
                  }}
                  onBlur={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (isNaN(val) || val < 20) {
                      setFormData((prev) => ({ ...prev, radiusMeters: 20 }));
                    } else if (val > 1000) {
                      setFormData((prev) => ({ ...prev, radiusMeters: 1000 }));
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${c.border}`,
                    backgroundColor: c.bgCard,
                    color: c.fg,
                    fontSize: '13px',
                  }}
                />
              </FormField>
            </div>

            {/* Mini Leaflet Map Picker */}
            <BranchMapPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              radiusMeters={formData.radiusMeters}
              onChange={({ latitude, longitude }) => {
                setFormData((prev) => ({ ...prev, latitude, longitude }));
                if (errors.latitude || errors.longitude) {
                  setErrors((prev) => ({ ...prev, latitude: null, longitude: null }));
                }
              }}
            />
          </div>

          {/* Footer nút bấm */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '10px',
            }}
          >
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy Bỏ
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={submitting}
            >
              {isEditing ? 'Lưu Thay Đổi' : 'Tạo Chi Nhánh'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
