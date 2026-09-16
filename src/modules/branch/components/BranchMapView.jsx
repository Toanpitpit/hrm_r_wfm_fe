import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';

/**
 * ==============================================================================
 * COMPONENT: BranchMapView.jsx
 * Bản đồ tương tác Leaflet trực quan hiển thị toàn bộ Chi nhánh & Trạm Kiosk
 * ==============================================================================
 */
export default function BranchMapView({
  branches = [],
  onEdit,
  onManageKiosk,
  onToggleLock,
}) {
  const { c, theme, fonts } = useAdminTheme();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const [selectedBranchId, setSelectedBranchId] = useState(null);

  // Tạo Custom Marker HTML
  const createMarkerIcon = (branch) => {
    const isActive = (branch.status || '').toUpperCase() === 'ACTIVE';
    const bgGrad = isActive
      ? `linear-gradient(135deg, ${c.accent}, #eab308)`
      : 'linear-gradient(135deg, #ef4444, #991b1b)';
    const totalKiosks = branch.kioskCount ?? branch.totalKiosks ?? (branch.kiosks?.length || 0);

    return L.divIcon({
      className: 'branch-marker-node',
      html: `
        <div style="
          position: relative;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
        ">
          <div style="
            padding: 2px 7px;
            background: #111827;
            color: #ffffff;
            border: 1px solid ${isActive ? c.accent : '#ef4444'};
            border-radius: 4px;
            font-size: 10px;
            font-weight: 800;
            font-family: monospace;
            margin-bottom: 4px;
            white-space: nowrap;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
          ">
            ${branch.branchCode || 'CH'} · ${totalKiosks} Kiosk
          </div>
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              width: 30px;
              height: 30px;
              border-radius: 50% 50% 50% 0;
              background: ${bgGrad};
              transform: rotate(-45deg);
              box-shadow: 0 4px 14px rgba(0,0,0,0.5);
              border: 2px solid #ffffff;
            "></div>
            <div style="
              position: absolute;
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: #ffffff;
              top: 6px;
            "></div>
          </div>
        </div>
      `,
      iconSize: [60, 60],
      iconAnchor: [30, 56],
      popupAnchor: [0, -56],
    });
  };

  // Khởi tạo và đồng bộ Bản đồ Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Trung tâm mặc định: Việt Nam
      const defaultCenter = [16.047079, 108.20623]; // Đà Nẵng (giữa VN)

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 6,
        zoomControl: true,
        attributionControl: false,
      });

      // Tile Layer CartoDB Voyager / OSM
      const tileUrl =
        theme === 'dark'
          ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Xóa markers & circles cũ
    Object.values(markersRef.current).forEach(({ marker, circle }) => {
      if (marker) map.removeLayer(marker);
      if (circle) map.removeLayer(circle);
    });
    markersRef.current = {};

    const bounds = [];

    branches.forEach((b) => {
      const lat = Number(b.latitude) || 21.028511;
      const lng = Number(b.longitude) || 105.854167;
      const radius = Number(b.radiusMeters) || 100;
      const isActive = (b.status || '').toUpperCase() === 'ACTIVE';

      bounds.push([lat, lng]);

      // Circle Geofence
      const circle = L.circle([lat, lng], {
        radius,
        color: isActive ? c.accent : '#ef4444',
        fillColor: isActive ? c.accent : '#ef4444',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 4',
      }).addTo(map);

      // Marker
      const marker = L.marker([lat, lng], {
        icon: createMarkerIcon(b),
      }).addTo(map);

      const totalKiosks = b.kioskCount ?? b.totalKiosks ?? (b.kiosks?.length || 0);
      const activeKiosks = b.activeKiosks ?? (b.kiosks?.filter((k) => k.status === 'ACTIVE' || k.isOnline).length || 0);

      const popupContent = `
        <div style="
          min-width: 240px;
          padding: 8px 4px 4px;
          font-family: inherit;
        ">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="
              font-family: monospace;
              font-weight: 800;
              font-size: 12px;
              color: ${c.accent};
              background: #1e1e24;
              padding: 2px 6px;
              border-radius: 4px;
            ">${b.branchCode || 'CH'}</span>
            <span style="
              font-size: 11px;
              font-weight: 700;
              color: ${isActive ? '#10b981' : '#ef4444'};
            ">${isActive ? '● Đang hoạt động' : '● Tạm khóa'}</span>
          </div>

          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #111827;">
            ${b.name}
          </div>

          <div style="font-size: 12px; color: #4b5563; margin-bottom: 8px; line-height: 1.4;">
            📍 ${b.address || 'Chưa có địa chỉ'}
          </div>

          <div style="
            background: #f3f4f6;
            padding: 8px;
            border-radius: 6px;
            font-size: 11.5px;
            color: #374151;
            margin-bottom: 10px;
          ">
            <div><strong>Tọa độ Point:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
            <div style="margin-top: 2px;"><strong>Bán kính GPS:</strong> ${radius}m Geofence</div>
            <div style="margin-top: 2px;"><strong>Trạm Kiosk:</strong> ${activeKiosks}/${totalKiosks} Online</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300 });

      marker.on('click', () => {
        setSelectedBranchId(b.storeId);
      });

      markersRef.current[b.storeId] = { marker, circle, branch: b };
    });

    // Fit bounds nếu có nhiều chi nhánh
    if (bounds.length > 0) {
      if (bounds.length === 1) {
        map.setView(bounds[0], 15);
      } else {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 250);
  }, [branches, theme]);

  // Click vào chi nhánh trên side list -> Bay đến chi nhánh đó
  const handleSelectBranch = (b) => {
    setSelectedBranchId(b.storeId);
    const map = mapInstanceRef.current;
    if (map) {
      const lat = Number(b.latitude) || 21.028511;
      const lng = Number(b.longitude) || 105.854167;
      map.flyTo([lat, lng], 16, { duration: 1.2 });

      const node = markersRef.current[b.storeId];
      if (node && node.marker) {
        node.marker.openPopup();
      }
    }
  };

  const selectedBranch = branches.find((b) => b.storeId === selectedBranchId) || branches[0];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 340px',
        gap: '16px',
        height: '620px',
        background: c.bgCard,
        border: `1px solid ${c.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      }}
    >
      {/* 1. Khu vực Bản đồ tương tác Leaflet */}
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div
          ref={mapContainerRef}
          style={{ width: '100%', height: '100%', zIndex: 1 }}
        />

        {/* Floating badge thông tin tổng hợp */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            zIndex: 400,
            background: `${c.bgRaised}f0`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${c.border}`,
            borderRadius: '8px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: c.fg }}>
              {branches.length} Chi Nhánh Chuỗi
            </span>
          </div>
          <div style={{ width: 1, height: 14, background: c.border }} />
          <div style={{ fontSize: '11.5px', color: c.fgSubtle }}>
            Tọa độ chuẩn GeoJSON Point & Vòng quét Geofence
          </div>
        </div>
      </div>

      {/* 2. Side Panel: Danh sách cơ sở & Chi tiết chọn nhanh */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: c.bgRaised,
          borderLeft: `1px solid ${c.border}`,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Header danh sách */}
        <div
          style={{
            padding: '14px 16px',
            borderBottom: `1px solid ${c.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '13.5px', color: c.fg, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="store" size={16} color={c.accent} />
            <span>DANH MỤC VỊ TRÍ CHI NHÁNH</span>
          </div>
          <Badge tone="accent">{branches.length} Cơ sở</Badge>
        </div>

        {/* Danh sách cuộn các chi nhánh */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
          {branches.map((b) => {
            const isSelected = selectedBranchId === b.storeId;
            const isActive = (b.status || '').toUpperCase() === 'ACTIVE';
            const total = b.kioskCount ?? b.totalKiosks ?? (b.kiosks?.length || 0);
            const active = b.activeKiosks ?? 0;

            return (
              <div
                key={b.storeId}
                onClick={() => handleSelectBranch(b)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: isSelected ? `${c.accentDim}` : c.bgCard,
                  border: `1px solid ${isSelected ? c.accent : c.border}`,
                  marginBottom: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.16s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      fontSize: '12px',
                      color: c.accent,
                    }}
                  >
                    {b.branchCode}
                  </span>
                  <Badge tone={isActive ? 'good' : 'bad'}>
                    {isActive ? 'Hoạt động' : 'Tạm khóa'}
                  </Badge>
                </div>

                <div style={{ fontSize: '13px', fontWeight: 700, color: c.fg, marginBottom: '2px' }}>
                  {b.name}
                </div>

                <div style={{ fontSize: '11.5px', color: c.fgSubtle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '6px' }}>
                  📍 {b.address}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: c.fgFaint }}>
                  <span>Point: {b.latitude?.toFixed(2)}, {b.longitude?.toFixed(2)}</span>
                  <span style={{ color: active > 0 ? '#10b981' : c.fgSubtle, fontWeight: 600 }}>
                    🖥️ {active}/{total} Kiosk
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer chi tiết chi nhánh được chọn & Nút thao tác */}
        {selectedBranch && (
          <div
            style={{
              padding: '14px',
              borderTop: `1px solid ${c.border}`,
              background: c.bgElev,
            }}
          >
            <div style={{ fontSize: '11px', color: c.fgSubtle, marginBottom: '8px', fontWeight: 600 }}>
              THAO TÁC NHANH: {selectedBranch.name}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onManageKiosk && onManageKiosk(selectedBranch)}
              >
                <Icon name="screen" size={13} />
                <span>Kiosk ({selectedBranch.kioskCount ?? 0})</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => onEdit && onEdit(selectedBranch)}
              >
                <Icon name="edit" size={13} />
                <span>Chỉnh Sửa</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
