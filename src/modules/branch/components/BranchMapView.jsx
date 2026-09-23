import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import SearchInput from '@/shared/components/ui/SearchInput';

/**
 * ==============================================================================
 * COMPONENT: BranchMapView.jsx
 * Bản đồ tương tác Leaflet GIS đa lớp chuyên nghiệp cho Quản trị Chi Nhánh & Kiosk
 * ==============================================================================
 */

// Định nghĩa các lớp bản đồ Tile Layer hoàn toàn miễn phí & không yêu cầu API Key
const TILE_LAYERS = {
  dark: {
    name: 'Bản Đồ Tối',
    icon: 'screen',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Street Map',
    maxZoom: 19,
    filterClass: 'leaflet-dark-mode-tiles',
  },
  streets: {
    name: 'Đường Phố',
    icon: 'map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Street Map',
    maxZoom: 19,
    filterClass: '',
  },
  satellite: {
    name: 'Vệ Tinh',
    icon: 'globe',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Imagery',
    maxZoom: 18,
    filterClass: '',
  },
};

export default function BranchMapView({
  branches = [],
  onEdit,
  onToggleLock,
}) {
  const { c, theme, fonts } = useAdminTheme();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersGroupRef = useRef(null);
  const circlesGroupRef = useRef(null);
  const markersMapRef = useRef({});

  const [activeMapType, setActiveMapType] = useState('dark');
  const [showGeofence, setShowGeofence] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [mapSearch, setMapSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL'); // 'ALL' | 1 | 2 | 3
  const [userLocation, setUserLocation] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);

  // Lọc chi nhánh cho danh sách bên cạnh
  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchSearch =
        !mapSearch.trim() ||
        (b.name || '').toLowerCase().includes(mapSearch.toLowerCase()) ||
        (b.branchCode || b.code || '').toLowerCase().includes(mapSearch.toLowerCase()) ||
        (b.address || '').toLowerCase().includes(mapSearch.toLowerCase());

      const tier = Number(b.branchTier ?? b.tier ?? 2);
      const matchTier = tierFilter === 'ALL' || tier === Number(tierFilter);

      return matchSearch && matchTier;
    });
  }, [branches, mapSearch, tierFilter]);

  // Tạo Custom Marker Pin theo cấp chi nhánh (Tier 1/2/3)
  const createMarkerIcon = (branch, isSelected = false) => {
    const isActive = (branch.status || '').toUpperCase() === 'ACTIVE';
    const tier = Number(branch.branchTier ?? branch.tier ?? 2);

    let pinColor = '#3b82f6'; // Tier 2 default (Blue)
    let tierLabel = 'C2';
    if (!isActive) {
      pinColor = '#ef4444';
    } else if (tier === 1) {
      pinColor = '#f59e0b'; // Tier 1 Gold
      tierLabel = 'C1';
    } else if (tier === 3) {
      pinColor = '#10b981'; // Tier 3 Emerald
      tierLabel = 'C3';
    }

    const scale = isSelected ? 'transform: scale(1.18); z-index: 999;' : '';
    const glow = isSelected
      ? `filter: drop-shadow(0 0 10px ${pinColor});`
      : 'filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));';

    return L.divIcon({
      className: 'custom-branch-pin-icon',
      html: `
        <div style="
          position: relative;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.2s ease;
          ${scale}
          ${glow}
        ">
          <!-- Tag Mã & Cấp CN -->
          <div style="
            padding: 2px 6px;
            background: #0f172a;
            color: #ffffff;
            border: 1.5px solid ${pinColor};
            border-radius: 4px;
            font-size: 10px;
            font-weight: 800;
            font-family: monospace;
            margin-bottom: 2px;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            gap: 3px;
          ">
            <span>${branch.branchCode || 'CH'}</span>
            <span style="color: ${pinColor}; font-size: 9px;">• ${tierLabel}</span>
          </div>

          <!-- Pin SVG Tear Drop -->
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
              width: 28px;
              height: 28px;
              border-radius: 50% 50% 50% 0;
              background: ${pinColor};
              transform: rotate(-45deg);
              border: 2px solid #ffffff;
              box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            "></div>
            <!-- Center Dot or Icon -->
            <div style="
              position: absolute;
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: #ffffff;
              top: 7px;
              box-shadow: inset 0 1px 2px rgba(0,0,0,0.3);
            "></div>
          </div>
        </div>
      `,
      iconSize: [60, 60],
      iconAnchor: [30, 54],
      popupAnchor: [0, -54],
    });
  };

  // Khởi tạo bản đồ 1 lần duy nhất
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [16.047079, 108.20623], // Trung tâm VN
        zoom: 6,
        zoomControl: false, // Tự tạo zoom control custom vị trí đẹp hơn
        attributionControl: false,
      });

      // Lớp Tile
      const initialLayerDef = TILE_LAYERS[activeMapType] || TILE_LAYERS.dark;
      const tileLayer = L.tileLayer(initialLayerDef.url, {
        maxZoom: initialLayerDef.maxZoom,
        subdomains: initialLayerDef.subdomains || 'abc',
        className: initialLayerDef.filterClass || '',
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      // Group cho Markers và Geofence Circles
      const circlesGroup = L.layerGroup().addTo(map);
      const markersGroup = L.layerGroup().addTo(map);
      circlesGroupRef.current = circlesGroup;
      markersGroupRef.current = markersGroup;

      mapInstanceRef.current = map;
    }

    // Fix kích thước khi render xong
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      // Cleanup nếu unmount
    };
  }, []);

  // Thay đổi Lớp Bản Đồ Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const layerDef = TILE_LAYERS[activeMapType] || TILE_LAYERS.dark;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(layerDef.url, {
      maxZoom: layerDef.maxZoom,
      subdomains: layerDef.subdomains || 'abc',
      className: layerDef.filterClass || '',
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [activeMapType]);

  // Vẽ Markers và Geofence Circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    const circlesGroup = circlesGroupRef.current;
    if (!map || !markersGroup || !circlesGroup) return;

    markersGroup.clearLayers();
    circlesGroup.clearLayers();
    markersMapRef.current = {};

    const bounds = [];

    branches.forEach((b) => {
      const lat = Number(b.latitude) || 21.028511;
      const lng = Number(b.longitude) || 105.854167;
      const radius = Number(b.geofenceRadiusMeters ?? b.radiusMeters) || 100;
      const isActive = (b.status || '').toUpperCase() === 'ACTIVE';
      const tier = Number(b.branchTier ?? b.tier ?? 2);
      const isSelected = selectedBranchId === b.storeId;

      bounds.push([lat, lng]);

      let tierColor = '#3b82f6';
      let tierName = 'Cấp 2 - Tiêu Chuẩn';
      if (tier === 1) {
        tierColor = '#f59e0b';
        tierName = 'Cấp 1 - Flagship';
      } else if (tier === 3) {
        tierColor = '#10b981';
        tierName = 'Cấp 3 - Mini';
      }

      // 1. Circle Geofence
      if (showGeofence) {
        const circle = L.circle([lat, lng], {
          radius,
          color: isActive ? tierColor : '#ef4444',
          fillColor: isActive ? tierColor : '#ef4444',
          fillOpacity: isSelected ? 0.25 : 0.12,
          weight: isSelected ? 2.5 : 1.5,
          dashArray: isSelected ? undefined : '5, 5',
        });
        circlesGroup.addLayer(circle);
      }

      // 2. Marker Pin
      const marker = L.marker([lat, lng], {
        icon: createMarkerIcon(b, isSelected),
        zIndexOffset: isSelected ? 1000 : 0,
      });

      // 3. Popup Dark Theme Sang Trọng
      const popupHtml = `
        <div style="
          min-width: 250px;
          padding: 10px 4px 6px;
          font-family: inherit;
          color: #f1f5f9;
        ">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="
              font-family: monospace;
              font-weight: 800;
              font-size: 12px;
              color: ${tierColor};
              background: rgba(15, 23, 42, 0.9);
              border: 1px solid ${tierColor}60;
              padding: 2px 7px;
              border-radius: 4px;
            ">${b.branchCode || 'CH'}</span>

            <span style="
              font-size: 11px;
              font-weight: 700;
              padding: 2px 8px;
              border-radius: 4px;
              background: ${isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
              color: ${isActive ? '#10b981' : '#ef4444'};
            ">${isActive ? '● Đang hoạt động' : '● Tạm khóa'}</span>
          </div>

          <div style="font-weight: 700; font-size: 14.5px; margin-bottom: 4px; color: #ffffff;">
            ${b.name}
          </div>

          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 10px; line-height: 1.4;">
            📍 ${b.address || 'Chưa cập nhật địa chỉ'}
          </div>

          <div style="
            background: #1e293b;
            border: 1px solid #334155;
            padding: 8px 10px;
            border-radius: 8px;
            font-size: 12px;
            color: #cbd5e1;
            margin-bottom: 8px;
            display: flex;
            flex-direction: column;
            gap: 4px;
          ">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #94a3b8;">Phân cấp:</span>
              <strong style="color: ${tierColor};">${tierName}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #94a3b8;">Tọa độ GPS:</span>
              <span style="font-family: monospace;">${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #94a3b8;">Bán kính Geofence:</span>
              <strong style="color: #38bdf8;">${radius}m</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #94a3b8;">Kiosk điểm danh:</span>
              <strong style="color: ${b.activeKiosks > 0 ? '#10b981' : '#94a3b8'};">
                ${b.activeKiosks || 0} / ${b.kioskCount || b.totalKiosks || 0} online
              </strong>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 320,
        className: 'rwfm-custom-leaflet-popup',
      });

      marker.on('click', () => {
        setSelectedBranchId(b.storeId);
      });

      markersGroup.addLayer(marker);
      markersMapRef.current[b.storeId] = marker;
    });

    // Fit bounds ban đầu nếu chưa chọn chi nhánh
    if (!selectedBranchId && bounds.length > 0) {
      if (bounds.length === 1) {
        map.setView(bounds[0], 15);
      } else {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [branches, showGeofence, selectedBranchId]);

  // Click vào chi nhánh trên side list -> Bay đến chi nhánh đó
  const handleSelectBranch = (b) => {
    setSelectedBranchId(b.storeId);
    const map = mapInstanceRef.current;
    if (map) {
      const lat = Number(b.latitude) || 21.028511;
      const lng = Number(b.longitude) || 105.854167;
      map.flyTo([lat, lng], 16, { duration: 1.2 });

      const marker = markersMapRef.current[b.storeId];
      if (marker) {
        setTimeout(() => {
          marker.openPopup();
        }, 1250);
      }
    }
  };

  // Zoom Fit Toàn Bộ Chi Nhánh Toàn Quốc
  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map || branches.length === 0) return;
    const bounds = branches.map((b) => [Number(b.latitude) || 21.028511, Number(b.longitude) || 105.854167]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  };

  // Quick Jump to Hanoi Area
  const handleJumpHanoi = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([21.028511, 105.854167], 13, { duration: 1 });
    }
  };

  // Quick Jump to HCMC Area
  const handleJumpHCMC = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([10.823099, 106.629664], 13, { duration: 1 });
    }
  };

  // Định vị vị trí hiện tại của người dùng (GPS)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingUser(false);
        const { latitude: uLat, longitude: uLng } = pos.coords;
        setUserLocation({ lat: uLat, lng: uLng });
        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([uLat, uLng], 15, { duration: 1.2 });

          // Vẽ marker vị trí của tôi
          L.circleMarker([uLat, uLng], {
            radius: 8,
            fillColor: '#38bdf8',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9,
          })
            .addTo(map)
            .bindPopup('<strong>📍 Vị trí hiện tại của bạn</strong>')
            .openPopup();
        }
      },
      (err) => {
        setLocatingUser(false);
        console.warn('Geolocation failed:', err.message);
        alert('Không thể xác định vị trí hiện tại: ' + err.message);
      },
      { timeout: 8000 }
    );
  };

  const selectedBranch = branches.find((b) => b.storeId === selectedBranchId) || branches[0];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 380px',
        gap: '16px',
        height: '660px',
        background: c.bgCard,
        border: `1px solid ${c.border}`,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        position: 'relative',
      }}
    >
      {/* 1. KHU VỰC BẢN ĐỒ LEAFLET */}
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
        {/* Map Container */}
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '100%',
            zIndex: 1,
            backgroundColor: '#0f172a',
          }}
        />

        {/* Floating Top Control Bar: Layer Switcher & Quick Navigation */}
        <div
          style={{
            position: 'absolute',
            top: '14px',
            left: '14px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            maxWidth: 'calc(100% - 28px)',
          }}
        >
          {/* Tile Layer Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(10px)',
              border: `1px solid rgba(255, 255, 255, 0.12)`,
              borderRadius: '10px',
              padding: '3px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            {Object.entries(TILE_LAYERS).map(([key, def]) => {
              const isActive = activeMapType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveMapType(key)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 10px',
                    borderRadius: '7px',
                    border: 'none',
                    backgroundColor: isActive ? c.accent : 'transparent',
                    color: isActive ? '#000' : '#e2e8f0',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon name={def.icon} size={13} color={isActive ? '#000' : '#e2e8f0'} />
                  <span>{def.name}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Region Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(10px)',
              border: `1px solid rgba(255, 255, 255, 0.12)`,
              borderRadius: '10px',
              padding: '3px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            <button
              type="button"
              onClick={handleFitAll}
              title="Xem toàn cảnh hệ thống"
              style={{
                padding: '6px 10px',
                borderRadius: '7px',
                border: 'none',
                background: 'transparent',
                color: '#e2e8f0',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🌐 Toàn Cảnh
            </button>
            <button
              type="button"
              onClick={handleJumpHanoi}
              style={{
                padding: '6px 10px',
                borderRadius: '7px',
                border: 'none',
                background: 'transparent',
                color: '#e2e8f0',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🏛️ Hà Nội
            </button>
            <button
              type="button"
              onClick={handleJumpHCMC}
              style={{
                padding: '6px 10px',
                borderRadius: '7px',
                border: 'none',
                background: 'transparent',
                color: '#e2e8f0',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🏙️ TP.HCM
            </button>
          </div>
        </div>

        {/* Floating Right Control Panel: Zoom & Geofence Toggle & My Location */}
        <div
          style={{
            position: 'absolute',
            bottom: '18px',
            left: '14px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Zoom in / out */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(10px)',
              border: `1px solid rgba(255, 255, 255, 0.15)`,
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
            }}
          >
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomIn()}
              title="Phóng to"
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: 700,
                cursor: 'pointer',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              +
            </button>
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomOut()}
              title="Thu nhỏ"
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              −
            </button>
          </div>

          {/* Locate Me */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locatingUser}
            title="Định vị vị trí GPS của bạn"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(10px)',
              border: `1px solid rgba(255, 255, 255, 0.15)`,
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
            }}
          >
            <Icon name="pin" size={18} color="#38bdf8" />
          </button>

          {/* Toggle Geofence Circle */}
          <button
            type="button"
            onClick={() => setShowGeofence(!showGeofence)}
            title={showGeofence ? 'Ẩn vùng Geofence' : 'Hiện vùng Geofence'}
            style={{
              padding: '6px 10px',
              borderRadius: '10px',
              backgroundColor: showGeofence ? `${c.accent}25` : 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${showGeofence ? c.accent : 'rgba(255, 255, 255, 0.15)'}`,
              color: showGeofence ? c.accent : '#94a3b8',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
            }}
          >
            <Icon name="pulse" size={13} color={showGeofence ? c.accent : '#94a3b8'} />
            <span>{showGeofence ? 'Geofence: BẬT' : 'Geofence: TẮT'}</span>
          </button>
        </div>

        {/* Legend Panel at Bottom Right */}
        <div
          style={{
            position: 'absolute',
            bottom: '14px',
            right: '14px',
            zIndex: 10,
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(10px)',
            border: `1px solid rgba(255, 255, 255, 0.12)`,
            borderRadius: '10px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '11px',
            color: '#cbd5e1',
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <span>Cấp 1 (Flagship)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
            <span>Cấp 2 (Tiêu chuẩn)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>Cấp 3 (Mini)</span>
          </div>
        </div>
      </div>

      {/* 2. SIDE PANEL: TÌM KIẾM & DANH SÁCH CHI NHÁNH TƯƠNG TÁC */}
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
        {/* Header & Bộ lọc Side Panel */}
        <div
          style={{
            padding: '14px 16px',
            borderBottom: `1px solid ${c.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: c.bgElev,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 800, fontSize: '13.5px', color: c.fg, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="store" size={16} color={c.accent} />
              <span>DANH SÁCH CHI NHÁNH</span>
            </div>
            <Badge tone="accent">{filteredBranches.length} Cơ sở</Badge>
          </div>

          {/* Quick Search on Map */}
          <SearchInput
            value={mapSearch}
            onChange={setMapSearch}
            placeholder="Tìm theo tên, mã CN, địa chỉ..."
          />

          {/* Quick Tier Filters */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setTierFilter('ALL')}
              style={{
                flex: 1,
                padding: '4px 6px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                border: `1px solid ${tierFilter === 'ALL' ? c.accent : c.border}`,
                backgroundColor: tierFilter === 'ALL' ? `${c.accent}20` : 'transparent',
                color: tierFilter === 'ALL' ? c.accent : c.fgSubtle,
                cursor: 'pointer',
              }}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setTierFilter(1)}
              style={{
                flex: 1,
                padding: '4px 6px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                border: `1px solid ${tierFilter === 1 ? '#f59e0b' : c.border}`,
                backgroundColor: tierFilter === 1 ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: tierFilter === 1 ? '#f59e0b' : c.fgSubtle,
                cursor: 'pointer',
              }}
            >
              Cấp 1
            </button>
            <button
              type="button"
              onClick={() => setTierFilter(2)}
              style={{
                flex: 1,
                padding: '4px 6px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                border: `1px solid ${tierFilter === 2 ? '#3b82f6' : c.border}`,
                backgroundColor: tierFilter === 2 ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: tierFilter === 2 ? '#3b82f6' : c.fgSubtle,
                cursor: 'pointer',
              }}
            >
              Cấp 2
            </button>
            <button
              type="button"
              onClick={() => setTierFilter(3)}
              style={{
                flex: 1,
                padding: '4px 6px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                border: `1px solid ${tierFilter === 3 ? '#10b981' : c.border}`,
                backgroundColor: tierFilter === 3 ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: tierFilter === 3 ? '#10b981' : c.fgSubtle,
                cursor: 'pointer',
              }}
            >
              Cấp 3
            </button>
          </div>
        </div>

        {/* Danh sách cuộn các chi nhánh */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
          {filteredBranches.length === 0 ? (
            <div style={{ padding: '30px 16px', textAlign: 'center', color: c.fgSubtle, fontSize: '13px' }}>
              Không tìm thấy chi nhánh nào phù hợp với bộ lọc.
            </div>
          ) : (
            filteredBranches.map((b) => {
              const isSelected = selectedBranchId === b.storeId;
              const isActive = (b.status || '').toUpperCase() === 'ACTIVE';
              const tier = Number(b.branchTier ?? b.tier ?? 2);
              const totalKiosks = b.kioskCount ?? b.totalKiosks ?? (b.kiosks?.length || 0);
              const activeKiosks = b.activeKiosks ?? 0;
              const radius = Number(b.geofenceRadiusMeters ?? b.radiusMeters) || 100;

              let tierColor = '#3b82f6';
              let tierBg = 'rgba(59, 130, 246, 0.15)';
              let tierBorder = 'rgba(59, 130, 246, 0.35)';
              let tierText = 'Cấp 2';
              if (tier === 1) {
                tierColor = '#f59e0b';
                tierBg = 'rgba(234, 179, 8, 0.15)';
                tierBorder = 'rgba(234, 179, 8, 0.4)';
                tierText = 'Cấp 1';
              } else if (tier === 3) {
                tierColor = '#10b981';
                tierBg = 'rgba(16, 185, 129, 0.15)';
                tierBorder = 'rgba(16, 185, 129, 0.35)';
                tierText = 'Cấp 3';
              }

              return (
                <div
                  key={b.storeId}
                  onClick={() => handleSelectBranch(b)}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: isSelected ? `${c.accent}15` : c.bgCard,
                    border: `1.5px solid ${isSelected ? c.accent : c.border}`,
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: isSelected ? `0 4px 16px ${c.accent}20` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          fontSize: '12px',
                          color: c.accent,
                          backgroundColor: `${c.accent}15`,
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {b.branchCode || b.code || `CH0${b.storeId}`}
                      </span>

                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: tierBg,
                          border: `1px solid ${tierBorder}`,
                          color: tierColor,
                        }}
                      >
                        {tierText}
                      </span>
                    </div>

                    <Badge tone={isActive ? 'good' : 'bad'}>
                      {isActive ? 'Hoạt động' : 'Tạm khóa'}
                    </Badge>
                  </div>

                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: c.fg, marginBottom: '4px' }}>
                    {b.name || b.storeName}
                  </div>

                  <div
                    style={{
                      fontSize: '11.5px',
                      color: c.fgSubtle,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginBottom: '8px',
                    }}
                  >
                    📍 {b.address || 'Chưa cập nhật địa chỉ'}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: c.fgFaint,
                      paddingTop: '6px',
                      borderTop: `1px solid ${c.border}`,
                    }}
                  >
                    <span>🎯 Geofence: <strong style={{ color: c.fg }}>{radius}m</strong></span>
                    <span style={{ color: activeKiosks > 0 ? '#10b981' : c.fgSubtle, fontWeight: 600 }}>
                      🖥️ Kiosk: {activeKiosks}/{totalKiosks}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Thao tác nhanh cho chi nhánh đang chọn */}
        {selectedBranch && (
          <div
            style={{
              padding: '14px 16px',
              borderTop: `1px solid ${c.border}`,
              background: c.bgElev,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '11.5px', color: c.fgSubtle, fontWeight: 600 }}>
                CHI NHÁNH: <strong style={{ color: c.fg }}>{selectedBranch.name}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onEdit && onEdit(selectedBranch)}
                style={{ justifyContent: 'center' }}
              >
                <Icon name="edit" size={13} />
                <span>Chỉnh Sửa</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => onToggleLock && onToggleLock(selectedBranch)}
                style={{ justifyContent: 'center' }}
              >
                <Icon name={(selectedBranch.status || '').toUpperCase() === 'ACTIVE' ? 'lock' : 'unlock'} size={13} />
                <span>{(selectedBranch.status || '').toUpperCase() === 'ACTIVE' ? 'Khóa CN' : 'Mở Khóa'}</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Global Style Override for Leaflet Dark Popup & Controls */}
      <style>{`
        .leaflet-dark-mode-tiles {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7) !important;
        }
        .leaflet-popup-content-wrapper {
          background: #0f172a !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6) !important;
        }
        .leaflet-popup-tip {
          background: #0f172a !important;
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
        }
        .leaflet-popup-content {
          margin: 10px 12px !important;
          line-height: 1.4 !important;
        }
        .custom-branch-pin-icon {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
