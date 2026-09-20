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
 * Bản đồ Leaflet Tương Tác Siêu Nâng Cao (Leaflet Interactive Map)
 * - Đổi nguồn Tile Layer linh hoạt (Bản đồ đường phố / Nền tối / Vệ tinh)
 * - Search & Filter chi nhánh trực tiếp trên bản đồ
 * - Hiệu ứng Marker hover pulse & Sync tương tác hai chiều
 * - Định vị GPS hiện tại, Auto Fit-bounds & Phóng to chuyên nghiệp
 * ==============================================================================
 */

// Định nghĩa 3 Nguồn Map Tile Layer
const TILE_SERVERS = {
  streets: {
    name: 'Bản đồ Đường Phố',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: 'abc',
  },
  dark: {
    name: 'Nền Tối Horizon',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Dark Gray',
    subdomains: 'abc',
  },
  satellite: {
    name: 'Ảnh Vệ Tinh (Satellite)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Imagery',
    subdomains: 'abc',
  },
};

export default function BranchMapView({
  branches = [],
  onEdit,
  onManageKiosk,
  onToggleLock,
}) {
  const { c, theme } = useAdminTheme();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef({});

  // States tương tác (Mặc định nền sáng 'streets')
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [hoveredBranchId, setHoveredBranchId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTileMode, setCurrentTileMode] = useState('streets');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [locating, setLocating] = useState(false);

  // Tạo Icon Marker Tương Tác Cực Sắc Nét
  const createInteractiveMarker = (branch, isSelected, isHovered) => {
    const isActive = (branch.status || '').toUpperCase() === 'ACTIVE';
    const mainColor = isActive ? c.accent || '#2563EB' : '#ef4444';
    const totalKiosks = branch.kioskCount ?? branch.totalKiosks ?? (branch.kiosks?.length || 0);

    const scale = isSelected || isHovered ? 'scale(1.18)' : 'scale(1)';
    const shadow = isSelected || isHovered
      ? '0 8px 24px rgba(0,0,0,0.45)'
      : '0 4px 12px rgba(0,0,0,0.3)';

    return L.divIcon({
      className: 'leaflet-interactive-node',
      html: `
        <div style="
          position: relative;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: ${scale};
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        ">
          <!-- Tag Tên & Mã Chi Nhánh -->
          <div style="
            padding: 3px 8px;
            background: ${isSelected ? mainColor : '#1e293b'};
            color: #ffffff;
            border: 1px solid ${mainColor};
            border-radius: 6px;
            font-size: 10.5px;
            font-weight: 800;
            font-family: monospace;
            margin-bottom: 4px;
            white-space: nowrap;
            box-shadow: ${shadow};
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span style="
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: ${isActive ? '#10b981' : '#ef4444'};
              display: inline-block;
            "></span>
            ${branch.branchCode || 'CH'} · ${totalKiosks} Kiosk
          </div>

          <!-- Pin Mũi Tên Tương Tác -->
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
              background: linear-gradient(135deg, ${mainColor}, #0284c7);
              transform: rotate(-45deg);
              box-shadow: ${shadow};
              border: 2px solid #ffffff;
            "></div>
            <div style="
              position: absolute;
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: #ffffff;
              top: 6px;
              box-shadow: inset 0 1px 2px rgba(0,0,0,0.3);
            "></div>
          </div>
        </div>
      `,
      iconSize: [60, 60],
      iconAnchor: [30, 56],
      popupAnchor: [0, -56],
    });
  };

  // Khởi tạo bản đồ Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter = [16.047079, 108.20623]; // Việt Nam center

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 6,
        zoomControl: false, // Dùng custom zoom control bên dưới
        attributionControl: false,
      });

      // Add Zoom Control góc dưới bên phải
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Thêm tile layer ban đầu
      const mode = TILE_SERVERS[currentTileMode] || TILE_SERVERS.streets;
      tileLayerRef.current = L.tileLayer(mode.url, {
        maxZoom: 19,
        subdomains: mode.subdomains,
        attribution: mode.attribution,
      }).addTo(map);

      mapInstanceRef.current = map;
    }
  }, []);

  // Cập nhật Tile Layer khi đổi Mode (Streets / Dark / Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const config = TILE_SERVERS[currentTileMode] || TILE_SERVERS.streets;
    tileLayerRef.current = L.tileLayer(config.url, {
      maxZoom: 19,
      subdomains: config.subdomains,
      attribution: config.attribution,
    }).addTo(map);
  }, [currentTileMode]);

  // Đồng bộ Markers & Geofences với dữ liệu Chi Nhánh
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Xóa markers cũ
    Object.values(markersRef.current).forEach(({ marker, circle }) => {
      if (marker) map.removeLayer(marker);
      if (circle) map.removeLayer(circle);
    });
    markersRef.current = {};

    const bounds = [];

    // Lọc theo search term
    const filteredBranches = branches.filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        (b.name || '').toLowerCase().includes(q) ||
        (b.branchCode || '').toLowerCase().includes(q) ||
        (b.address || '').toLowerCase().includes(q)
      );
    });

    filteredBranches.forEach((b) => {
      const lat = Number(b.latitude) || 21.028511;
      const lng = Number(b.longitude) || 105.854167;
      const radius = Number(b.radiusMeters) || 100;
      const isActive = (b.status || '').toUpperCase() === 'ACTIVE';

      bounds.push([lat, lng]);

      // Circle Geofence GPS
      const circle = L.circle([lat, lng], {
        radius,
        color: isActive ? c.accent : '#ef4444',
        fillColor: isActive ? c.accent : '#ef4444',
        fillOpacity: hoveredBranchId === b.storeId || selectedBranchId === b.storeId ? 0.28 : 0.12,
        weight: hoveredBranchId === b.storeId || selectedBranchId === b.storeId ? 2.5 : 1.5,
        dashArray: '4, 4',
      }).addTo(map);

      // Interactive Marker
      const isSel = selectedBranchId === b.storeId;
      const isHov = hoveredBranchId === b.storeId;
      const marker = L.marker([lat, lng], {
        icon: createInteractiveMarker(b, isSel, isHov),
        zIndexOffset: isSel ? 1000 : 0,
      }).addTo(map);

      const totalKiosks = b.kioskCount ?? b.totalKiosks ?? (b.kiosks?.length || 0);
      const activeKiosks = b.activeKiosks ?? (b.kiosks?.filter((k) => k.status === 'ACTIVE' || k.isOnline).length || 0);

      const popupContent = `
        <div style="min-width: 250px; padding: 4px; font-family: sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="
              font-family: monospace;
              font-weight: 800;
              font-size: 12px;
              color: #2563eb;
              background: #eff6ff;
              padding: 2px 8px;
              border-radius: 4px;
              border: 1px solid #bfdbfe;
            ">${b.branchCode || 'CH'}</span>
            <span style="font-size: 11px; font-weight: 700; color: ${isActive ? '#10b981' : '#ef4444'};">
              ${isActive ? '● Đang hoạt động' : '● Tạm khóa'}
            </span>
          </div>

          <div style="font-weight: 700; font-size: 14.5px; color: #0f172a; margin-bottom: 4px;">
            ${b.name}
          </div>

          <div style="font-size: 12px; color: #475569; margin-bottom: 10px; line-height: 1.4;">
            📍 ${b.address || 'Chưa cập nhật địa chỉ'}
          </div>

          <div style="
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 8px 10px;
            border-radius: 8px;
            font-size: 11.5px;
            color: #334155;
            margin-bottom: 10px;
          ">
            <div>📍 <strong>Tọa độ GPS Point:</strong> ${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
            <div style="margin-top: 3px;">🎯 <strong>Bán kính Geofence:</strong> ${radius}m</div>
            <div style="margin-top: 3px;">🖥️ <strong>Trạm Kiosk:</strong> ${activeKiosks}/${totalKiosks} Online</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 320 });

      marker.on('click', () => {
        setSelectedBranchId(b.storeId);
      });

      marker.on('mouseover', () => {
        setHoveredBranchId(b.storeId);
      });

      marker.on('mouseout', () => {
        setHoveredBranchId(null);
      });

      markersRef.current[b.storeId] = { marker, circle, branch: b };
    });

    // Auto fit bounds nếu có danh sách chi nhánh
    if (bounds.length > 0 && !selectedBranchId) {
      if (bounds.length === 1) {
        map.setView(bounds[0], 15);
      } else {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
      }
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [branches, searchQuery, selectedBranchId, hoveredBranchId, c]);

  // Click chọn Chi Nhánh trên side list -> Bay tới vị trí (FlyTo)
  const handleSelectBranch = (b) => {
    setSelectedBranchId(b.storeId);
    const map = mapInstanceRef.current;
    if (map) {
      const lat = Number(b.latitude) || 21.028511;
      const lng = Number(b.longitude) || 105.854167;
      map.flyTo([lat, lng], 16.5, { duration: 1.2 });

      const node = markersRef.current[b.storeId];
      if (node && node.marker) {
        node.marker.openPopup();
      }
    }
  };

  // Reset về góc nhìn toàn bộ chi nhánh (Fit All Bounds)
  const handleFitAllBounds = () => {
    const map = mapInstanceRef.current;
    if (!map || branches.length === 0) return;

    const bounds = branches.map((b) => [
      Number(b.latitude) || 21.028511,
      Number(b.longitude) || 105.854167,
    ]);

    setSelectedBranchId(null);
    if (bounds.length === 1) {
      map.flyTo(bounds[0], 15);
    } else {
      map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  };

  // Định vị GPS vị trí người dùng
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const map = mapInstanceRef.current;
        if (map) {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          map.flyTo([lat, lng], 16, { duration: 1.5 });
        }
      },
      (err) => {
        setLocating(false);
        console.warn('Geolocation error:', err);
        alert('Không thể xác định vị trí GPS hiện tại.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const selectedBranch = branches.find((b) => b.storeId === selectedBranchId) || branches[0];
  const filteredBranches = branches.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (b.name || '').toLowerCase().includes(q) ||
      (b.branchCode || '').toLowerCase().includes(q) ||
      (b.address || '').toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 350px',
        gap: '16px',
        height: '650px',
        background: c.bgCard,
        border: `1px solid ${c.border}`,
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
      }}
    >
      {/* 1. KHU VỰC BẢN ĐỒ TƯƠNG TÁC (INTERACTIVE LEAFLET MAP) */}
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Map Container */}
        <div
          ref={mapContainerRef}
          style={{ width: '100%', height: '100%', zIndex: 1 }}
        />

        {/* Floating Bar Phía Trên Bản Đồ: Tìm kiếm Live & Layer Switcher */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            right: 14,
            zIndex: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            pointerEvents: 'none',
          }}
        >
          {/* Ô Tìm Kiếm Nhanh Trực Tiếp Trên Bản Đồ */}
          <div
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: `${c.bgRaised}f2`,
              backdropFilter: 'blur(12px)',
              border: `1px solid ${c.border}`,
              borderRadius: '10px',
              padding: '6px 12px',
              boxShadow: '0 4px 18px rgba(0,0,0,0.2)',
              width: '320px',
            }}
          >
            <Icon name="search" size={16} color={c.accent} />
            <input
              type="text"
              placeholder="Tìm theo tên chi nhánh, mã CH..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                color: c.fg,
                fontSize: '13px',
                width: '100%',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: c.fgSubtle,
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                <Icon name="x" size={14} />
              </button>
            )}
          </div>

          {/* Nhóm Nút Công Cụ Điều Khiển Bản Đồ */}
          <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Nút Recenter / Fit All */}
            <button
              type="button"
              onClick={handleFitAllBounds}
              title="Góc nhìn toàn bộ Chi nhánh"
              style={{
                padding: '8px 12px',
                background: `${c.bgRaised}f2`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${c.border}`,
                borderRadius: '9px',
                color: c.fg,
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                transition: 'all 0.15s',
              }}
            >
              <Icon name="grid" size={14} color={c.accent} />
              <span>Xem Tất Cả</span>
            </button>

            {/* Nút Vị Trí Hiện Tại (GPS) */}
            <button
              type="button"
              onClick={handleLocateMe}
              title="Định vị GPS vị trí hiện tại của tôi"
              style={{
                padding: '8px 12px',
                background: `${c.bgRaised}f2`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${c.border}`,
                borderRadius: '9px',
                color: c.fg,
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
              }}
            >
              <Icon name="pin" size={14} color="#10b981" />
              <span>{locating ? 'Đang định vị...' : 'Vị trí của tôi'}</span>
            </button>

            {/* Menu Đổi Layer Bản Đồ (Streets / Dark / Satellite) */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowLayerMenu(!showLayerMenu)}
                title="Đổi nguồn kiểu bản đồ"
                style={{
                  padding: '8px 12px',
                  background: currentTileMode === 'satellite' ? '#2563eb' : `${c.bgRaised}f2`,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${c.border}`,
                  borderRadius: '9px',
                  color: currentTileMode === 'satellite' ? '#ffffff' : c.fg,
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                }}
              >
                <Icon name="screen" size={14} color={currentTileMode === 'satellite' ? '#ffffff' : c.accent} />
                <span>{TILE_SERVERS[currentTileMode]?.name || 'Kiểu Map'}</span>
                <Icon name="chevron-down" size={12} />
              </button>

              {/* Dropdown Chọn Layer */}
              {showLayerMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 6,
                    width: 180,
                    background: c.bgRaised,
                    border: `1px solid ${c.border}`,
                    borderRadius: '10px',
                    padding: '6px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    zIndex: 500,
                  }}
                >
                  {Object.entries(TILE_SERVERS).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setCurrentTileMode(key);
                        setShowLayerMenu(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: '7px',
                        border: 'none',
                        background: currentTileMode === key ? c.bgHover : 'transparent',
                        color: currentTileMode === key ? c.accent : c.fg,
                        fontSize: '12.5px',
                        fontWeight: currentTileMode === key ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{config.name}</span>
                      {currentTileMode === key && <Icon name="check" size={13} color={c.accent} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Stat Info Bar ở đáy bản đồ */}
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: 14,
            zIndex: 400,
            background: `${c.bgRaised}ea`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${c.border}`,
            borderRadius: '8px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: c.fg }}>
              {filteredBranches.length} / {branches.length} Chi Nhánh
            </span>
          </div>
          <div style={{ width: 1, height: 12, background: c.border }} />
          <div style={{ fontSize: '11px', color: c.fgSubtle }}>
            Geofence GPS Radius Live
          </div>
        </div>
      </div>

      {/* 2. SIDE PANEL: DANH SÁCH CHI NHÁNH TƯƠNG TÁC HAI CHIỀU */}
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
        {/* Header Side Panel */}
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
            <span>DANH MỤC CHI NHÁNH</span>
          </div>
          <Badge tone="accent">{filteredBranches.length} Vị trí</Badge>
        </div>

        {/* Danh Sách Chi Nhánh */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
          {filteredBranches.map((b) => {
            const isSelected = selectedBranchId === b.storeId;
            const isHovered = hoveredBranchId === b.storeId;
            const isActive = (b.status || '').toUpperCase() === 'ACTIVE';
            const total = b.kioskCount ?? b.totalKiosks ?? (b.kiosks?.length || 0);
            const active = b.activeKiosks ?? 0;

            return (
              <div
                key={b.storeId}
                onClick={() => handleSelectBranch(b)}
                onMouseEnter={() => setHoveredBranchId(b.storeId)}
                onMouseLeave={() => setHoveredBranchId(null)}
                style={{
                  padding: '11px 13px',
                  borderRadius: '10px',
                  background: isSelected
                    ? `linear-gradient(135deg, ${c.accentDim}, ${c.bgHover})`
                    : isHovered
                    ? c.bgHover
                    : c.bgCard,
                  border: `1px solid ${isSelected ? c.accent : isHovered ? c.border : c.border}`,
                  marginBottom: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 4px 14px rgba(37,99,235,0.2)' : 'none',
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

                <div style={{ fontSize: '13.5px', fontWeight: 700, color: c.fg, marginBottom: '3px' }}>
                  {b.name}
                </div>

                <div style={{ fontSize: '11.5px', color: c.fgSubtle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '6px' }}>
                  📍 {b.address}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: c.fgFaint }}>
                  <span>GPS: {b.latitude?.toFixed(3)}, {b.longitude?.toFixed(3)}</span>
                  <span style={{ color: active > 0 ? '#10b981' : c.fgSubtle, fontWeight: 600 }}>
                    Kiosk: {active}/{total} Online
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Thao Tác Chi Nhánh Được Chọn */}
        {selectedBranch && (
          <div
            style={{
              padding: '14px',
              borderTop: `1px solid ${c.border}`,
              background: c.bgElev,
            }}
          >
            <div style={{ fontSize: '11.5px', color: c.fgSubtle, marginBottom: '8px', fontWeight: 700 }}>
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
