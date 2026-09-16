import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAdminTheme } from '../../../../context/AdminThemeContext';

/**
 * Tạo SVG Icon cho Marker Leaflet theo trạng thái và số lượng Kiosk
 */
function createBranchIcon(branch, isSelected = false) {
  const isActive = branch.status === 'ACTIVE';
  const totalKiosks = branch.totalKiosks || branch.kioskCount || (branch.kiosks ? branch.kiosks.length : 0);
  const activeKiosks = branch.activeKiosks || 0;

  const pinColor = isActive ? '#10b981' : '#f59e0b';
  const pulseRing = isSelected
    ? `<div style="position: absolute; width: 44px; height: 44px; top: -7px; left: -7px; border-radius: 50%; background: ${pinColor}; opacity: 0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
    : '';

  const html = `
    <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      ${pulseRing}
      <div style="
        position: relative;
        z-index: 2;
        width: 32px;
        height: 32px;
        background: #18181b;
        border: 2px solid ${pinColor};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.45);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: ${pinColor};
          font-weight: 700;
          font-size: 11px;
          line-height: 1;
        ">
          ${branch.code || branch.branchCode || 'CN'}
        </div>
      </div>
      ${
        totalKiosks > 0
          ? `<div style="
              position: absolute;
              top: -6px;
              right: -8px;
              z-index: 3;
              background: #0ea5e9;
              color: #ffffff;
              font-size: 10px;
              font-weight: 700;
              padding: 1px 5px;
              border-radius: 10px;
              border: 1px solid #18181b;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">${activeKiosks}/${totalKiosks}</div>`
          : ''
      }
    </div>
  `;

  return L.divIcon({
    className: 'custom-branch-marker',
    html: html,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

/**
 * Component Bản đồ Leaflet tương tác hiển thị Chi nhánh & Bán kính Geofence
 */
export default function BranchLeafletMap({
  branches = [],
  selectedBranch = null,
  onSelectBranch,
  onEdit,
  onManageKiosk,
  height = '480px',
}) {
  const { c } = useAdminTheme();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const circlesGroupRef = useRef(null);

  // 1. Khởi tạo Leaflet Map Instance (Chỉ 1 lần)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Tọa độ trung tâm mặc định (Việt Nam)
      const defaultCenter = [16.0471, 108.2068];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 6,
        zoomControl: true,
      });

      // Layer Bản đồ OpenStreetMap chất lượng cao
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | R-WFM Spatial',
        maxZoom: 19,
      }).addTo(map);

      // Tạo layer groups cho markers và circles
      const circlesGroup = L.layerGroup().addTo(map);
      const markersGroup = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      circlesGroupRef.current = circlesGroup;
      markersGroupRef.current = markersGroup;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Render Markers và Geofence Circles khi danh sách branches thay đổi
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    const circlesGroup = circlesGroupRef.current;

    if (!map || !markersGroup || !circlesGroup) return;

    markersGroup.clearLayers();
    circlesGroup.clearLayers();

    const validBranches = branches.filter((b) => {
      const lat = b.latitude ?? b.Location?.Y;
      const lng = b.longitude ?? b.Location?.X;
      return lat !== undefined && lat !== null && lng !== undefined && lng !== null && !isNaN(lat) && !isNaN(lng);
    });

    if (validBranches.length === 0) return;

    const bounds = L.latLngBounds([]);

    validBranches.forEach((branch) => {
      const lat = Number(branch.latitude ?? branch.Location?.Y);
      const lng = Number(branch.longitude ?? branch.Location?.X);
      const radius = Number(branch.geofenceRadiusMeters || 200);
      const isSelected = selectedBranch && (selectedBranch.id === branch.id || selectedBranch.storeId === branch.storeId);
      const isActive = branch.status === 'ACTIVE';

      const latLng = [lat, lng];
      bounds.extend(latLng);

      // A. Vẽ vòng tròn Geofence (Bán kính điểm danh hợp lệ)
      const circle = L.circle(latLng, {
        radius: radius,
        color: isActive ? '#10b981' : '#f59e0b',
        fillColor: isActive ? '#10b981' : '#f59e0b',
        fillOpacity: isSelected ? 0.25 : 0.12,
        weight: isSelected ? 2 : 1.5,
        dashArray: isSelected ? undefined : '4, 4',
      });

      circle.bindTooltip(`Bán kính điểm danh Geofence: ${radius}m`, {
        permanent: false,
        direction: 'top',
        className: 'geofence-tooltip',
      });

      circlesGroup.addLayer(circle);

      // B. Tạo Marker
      const icon = createBranchIcon(branch, isSelected);
      const marker = L.marker(latLng, { icon: icon });

      // C. Xây dựng Popup Card tùy biến cao cấp
      const totalKiosks = branch.totalKiosks || branch.kioskCount || (branch.kiosks ? branch.kiosks.length : 0);
      const activeKiosks = branch.activeKiosks || 0;

      const popupContent = document.createElement('div');
      popupContent.style.cssText = `
        padding: 4px;
        font-family: inherit;
        min-width: 220px;
        color: #f4f4f5;
      `;
      popupContent.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #27272a; padding-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 700; background: #27272a; color: #a1a1aa; padding: 2px 6px; border-radius: 4px; font-family: monospace;">
            ${branch.code || branch.branchCode || 'CN'}
          </span>
          <span style="font-size: 11px; font-weight: 600; color: ${isActive ? '#10b981' : '#f59e0b'};">
            ● ${isActive ? 'Đang hoạt động' : 'Tạm khóa'}
          </span>
        </div>
        <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">
          ${branch.name || branch.storeName}
        </div>
        <div style="font-size: 12px; color: #a1a1aa; margin-bottom: 8px; display: flex; align-items: flex-start; gap: 4px;">
          <span>📍</span>
          <span>${branch.address}</span>
        </div>
        <div style="background: #18181b; padding: 6px 8px; border-radius: 6px; margin-bottom: 10px; font-size: 11px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
          <div>
            <span style="color: #71717a;">Kiosk quầy:</span>
            <strong style="color: #38bdf8; margin-left: 4px;">${activeKiosks}/${totalKiosks} Online</strong>
          </div>
          <div>
            <span style="color: #71717a;">Geofence:</span>
            <strong style="color: #34d399; margin-left: 4px;">${radius}m</strong>
          </div>
          <div style="grid-column: 1 / -1; color: #71717a; font-family: monospace; font-size: 10px;">
            [${lat.toFixed(4)}, ${lng.toFixed(4)}]
          </div>
        </div>
        <div style="display: flex; gap: 6px;">
          <button id="btn-edit-${branch.id || branch.storeId}" style="flex: 1; padding: 5px 8px; background: #27272a; border: 1px solid #3f3f46; color: #fafafa; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
            ✏️ Sửa
          </button>
          <button id="btn-kiosk-${branch.id || branch.storeId}" style="flex: 1; padding: 5px 8px; background: #0284c7; border: none; color: #ffffff; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
            🖥️ Kiosk
          </button>
        </div>
      `;

      // Gán sự kiện click cho các nút trong Popup
      marker.bindPopup(popupContent, {
        className: 'custom-leaflet-popup',
        maxWidth: 280,
      });

      marker.on('popupopen', () => {
        const storeId = branch.id || branch.storeId;
        const btnEdit = document.getElementById(`btn-edit-${storeId}`);
        const btnKiosk = document.getElementById(`btn-kiosk-${storeId}`);

        if (btnEdit && onEdit) {
          btnEdit.onclick = () => {
            marker.closePopup();
            onEdit(branch);
          };
        }
        if (btnKiosk && onManageKiosk) {
          btnKiosk.onclick = () => {
            marker.closePopup();
            onManageKiosk(branch);
          };
        }
      });

      marker.on('click', () => {
        if (onSelectBranch) onSelectBranch(branch);
      });

      markersGroup.addLayer(marker);
    });

    // Tự động căn chỉnh bản đồ vừa khít toàn bộ các chi nhánh
    if (validBranches.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 14,
      });
    }
  }, [branches, selectedBranch]);

  // 3. Zoom tới chi nhánh được chọn từ bên ngoài (khi click từ bảng)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedBranch) return;

    const lat = Number(selectedBranch.latitude ?? selectedBranch.Location?.Y);
    const lng = Number(selectedBranch.longitude ?? selectedBranch.Location?.X);

    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      map.flyTo([lat, lng], 15, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedBranch]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: height,
        borderRadius: '12px',
        overflow: 'hidden',
        border: `1px solid ${c.border}`,
        backgroundColor: '#09090b',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      {/* CSS overrides cho Leaflet Dark theme */}
      <style>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
          background: #09090b;
        }
        .leaflet-tile-pane {
          filter: brightness(0.85) invert(1) contrast(1.15) hue-rotate(200deg) saturate(0.65);
        }
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          background: #18181b !important;
          border: 1px solid #3f3f46 !important;
          border-radius: 10px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important;
          padding: 8px !important;
        }
        .custom-leaflet-popup .leaflet-popup-tip {
          background: #18181b !important;
          border: 1px solid #3f3f46 !important;
        }
        .geofence-tooltip {
          background: #18181b !important;
          border: 1px solid #27272a !important;
          color: #34d399 !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          border-radius: 4px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>

      {/* Container bản đồ */}
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Legend / Chú thích bản đồ */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 1000,
          backgroundColor: 'rgba(24, 24, 27, 0.92)',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${c.border}`,
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          color: c.fg,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '11px', color: c.fgMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Chú thích bản đồ
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
          <span>Chi nhánh Hoạt động</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
          <span>Chi nhánh Tạm khóa</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px dashed #10b981', display: 'inline-block' }}></span>
          <span>Vùng Geofence Điểm Danh</span>
        </div>
      </div>
    </div>
  );
}