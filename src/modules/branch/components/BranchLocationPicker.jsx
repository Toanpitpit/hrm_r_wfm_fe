import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAdminTheme } from '../../../../context/AdminThemeContext';
import Icon from '../../../../components/ui/Icon';

/**
 * Custom Pin Icon cho Location Picker
 */
function createPickerIcon() {
  const html = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: grab;">
      <div style="
        width: 28px;
        height: 28px;
        background: #0284c7;
        border: 2px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="transform: rotate(45deg); color: #ffffff; font-size: 12px;">📍</div>
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'picker-marker-icon',
    html: html,
    iconSize: [32, 32],
    iconAnchor: [16, 28],
  });
}

/**
 * Component Chọn tọa độ Địa lý & Cấu hình Geofence trên Bản đồ Mini
 */
export default function BranchLocationPicker({
  latitude,
  longitude,
  geofenceRadius = 200,
  onChange,
}) {
  const { c } = useAdminTheme();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  const curLat = Number(latitude) || 21.0333;
  const curLng = Number(longitude) || 105.7833;
  const curRadius = Number(geofenceRadius) || 200;

  // 1. Khởi tạo Mini Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [curLat, curLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Marker có thể kéo thả
      const marker = L.marker([curLat, curLng], {
        icon: createPickerIcon(),
        draggable: true,
      }).addTo(map);

      // Vòng tròn Geofence
      const circle = L.circle([curLat, curLng], {
        radius: curRadius,
        color: '#0284c7',
        fillColor: '#38bdf8',
        fillOpacity: 0.2,
        weight: 2,
        dashArray: '4, 4',
      }).addTo(map);

      // Lắng nghe sự kiện kéo thả marker
      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        circle.setLatLng([lat, lng]);
        if (onChange) {
          onChange({
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6)),
            geofenceRadius: curRadius,
          });
        }
      });

      // Lắng nghe sự kiện click trên bản đồ
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        circle.setLatLng([lat, lng]);
        if (onChange) {
          onChange({
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6)),
            geofenceRadius: curRadius,
          });
        }
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Đồng bộ vị trí & bán kính khi props thay đổi
  useEffect(() => {
    const map = mapInstanceRef.current;
    const marker = markerRef.current;
    const circle = circleRef.current;

    if (!map || !marker || !circle) return;

    const latLng = [curLat, curLng];
    marker.setLatLng(latLng);
    circle.setLatLng(latLng);
    circle.setRadius(curRadius);
  }, [curLat, curLng, curRadius]);

  // Hàm chọn nhanh địa điểm
  const handleQuickLocate = (lat, lng) => {
    const map = mapInstanceRef.current;
    if (map) {
      map.setView([lat, lng], 14, { animate: true });
    }
    if (onChange) {
      onChange({
        latitude: lat,
        longitude: lng,
        geofenceRadius: curRadius,
      });
    }
  };

  // Hàm lấy vị trí GPS thiết bị
  const handleGetGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          handleQuickLocate(lat, lng);
        },
        (err) => {
          alert('Không thể truy cập định vị GPS: ' + err.message);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert('Trình duyệt không hỗ trợ Geolocation API.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Thanh công cụ định vị nhanh */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: c.fgMuted }}>Vị trí mẫu:</span>
          <button
            type="button"
            onClick={() => handleQuickLocate(21.0333, 105.7833)}
            style={{
              padding: '3px 8px',
              fontSize: '11px',
              background: '#27272a',
              color: '#f4f4f5',
              border: '1px solid #3f3f46',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Hà Nội
          </button>
          <button
            type="button"
            onClick={() => handleQuickLocate(10.8456, 106.7925)}
            style={{
              padding: '3px 8px',
              fontSize: '11px',
              background: '#27272a',
              color: '#f4f4f5',
              border: '1px solid #3f3f46',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            TP.HCM
          </button>
          <button
            type="button"
            onClick={() => handleQuickLocate(16.0544, 108.2022)}
            style={{
              padding: '3px 8px',
              fontSize: '11px',
              background: '#27272a',
              color: '#f4f4f5',
              border: '1px solid #3f3f46',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Đà Nẵng
          </button>
        </div>

        <button
          type="button"
          onClick={handleGetGPS}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 600,
            background: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <Icon name="pin" size={12} />
          <span>Lấy vị trí GPS của tôi</span>
        </button>
      </div>

      {/* Bản đồ mini Leaflet */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '240px',
          borderRadius: '8px',
          overflow: 'hidden',
          border: `1px solid ${c.border}`,
          backgroundColor: '#09090b',
        }}
      >
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Inputs Tọa độ & Thanh trượt Bán kính Geofence */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1.2fr',
          gap: '10px',
          alignItems: 'center',
          background: `${c.bgSubtle}40`,
          padding: '10px',
          borderRadius: '8px',
          border: `1px solid ${c.border}`,
        }}
      >
        <div>
          <label style={{ fontSize: '11px', color: c.fgSubtle, display: 'block', marginBottom: '2px' }}>
            Vĩ độ (Latitude)
          </label>
          <input
            type="number"
            step="0.000001"
            value={curLat}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && onChange) {
                onChange({ latitude: val, longitude: curLng, geofenceRadius: curRadius });
              }
            }}
            style={{
              width: '100%',
              padding: '6px 8px',
              fontSize: '12px',
              fontFamily: 'monospace',
              borderRadius: '4px',
              border: `1px solid ${c.border}`,
              backgroundColor: c.bgCard,
              color: c.fg,
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: c.fgSubtle, display: 'block', marginBottom: '2px' }}>
            Kinh độ (Longitude)
          </label>
          <input
            type="number"
            step="0.000001"
            value={curLng}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && onChange) {
                onChange({ latitude: curLat, longitude: val, geofenceRadius: curRadius });
              }
            }}
            style={{
              width: '100%',
              padding: '6px 8px',
              fontSize: '12px',
              fontFamily: 'monospace',
              borderRadius: '4px',
              border: `1px solid ${c.border}`,
              backgroundColor: c.bgCard,
              color: c.fg,
            }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <label style={{ fontSize: '11px', color: c.fgSubtle }}>Bán kính Geofence</label>
            <strong style={{ fontSize: '11px', color: '#38bdf8' }}>{curRadius} mét</strong>
          </div>
          <input
            type="range"
            min="50"
            max="500"
            step="25"
            value={curRadius}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (onChange) {
                onChange({ latitude: curLat, longitude: curLng, geofenceRadius: val });
              }
            }}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  );
}