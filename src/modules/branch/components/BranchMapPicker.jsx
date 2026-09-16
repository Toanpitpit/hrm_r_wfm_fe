import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';

/**
 * ==============================================================================
 * COMPONENT: BranchMapPicker.jsx
 * Bản đồ mini chọn tọa độ địa lý (Point: Latitude, Longitude) & Bán kính Geofence
 * ==============================================================================
 */
export default function BranchMapPicker({
  latitude = 21.028511,
  longitude = 105.854167,
  radiusMeters = 100,
  onChange,
}) {
  const { c, theme } = useAdminTheme();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const [locating, setLocating] = useState(false);

  // Khởi tạo icon Marker tùy chỉnh SVG sắc nét
  const createCustomMarkerIcon = (accentColor) => {
    return L.divIcon({
      className: 'custom-leaflet-pin',
      html: `
        <div style="
          position: relative;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            position: absolute;
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            background: linear-gradient(135deg, ${accentColor}, #d97706);
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            border: 2px solid #ffffff;
          "></div>
          <div style="
            position: absolute;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #ffffff;
            top: 7px;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
          "></div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Tránh khởi tạo nhiều lần
    if (!mapInstanceRef.current) {
      const initialLat = Number(latitude) || 21.028511;
      const initialLng = Number(longitude) || 105.854167;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      // Lựa chọn tile layer phù hợp theme
      const tileUrl =
        theme === 'dark'
          ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Thêm Marker
      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
        icon: createCustomMarkerIcon(c.accent),
      }).addTo(map);

      // Thêm vòng tròn Geofence
      const circle = L.circle([initialLat, initialLng], {
        radius: Number(radiusMeters) || 100,
        color: c.accent,
        fillColor: c.accent,
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '4, 6',
      }).addTo(map);

      // Sự kiện kéo marker
      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        circle.setLatLng([lat, lng]);
        if (onChange) {
          onChange({
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6)),
          });
        }
      });

      // Sự kiện click trên bản đồ để di chuyển vị trí
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        circle.setLatLng([lat, lng]);
        if (onChange) {
          onChange({
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6)),
          });
        }
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;

      // Invalidate size sau khi render modal
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Cập nhật vị trí khi props thay đổi từ input
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && circleRef.current) {
      const lat = Number(latitude) || 21.028511;
      const lng = Number(longitude) || 105.854167;
      const radius = Number(radiusMeters) || 100;

      markerRef.current.setLatLng([lat, lng]);
      circleRef.current.setLatLng([lat, lng]);
      circleRef.current.setRadius(radius);
    }
  }, [latitude, longitude, radiusMeters]);

  // Lấy vị trí GPS người dùng
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 16);
          if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
          if (circleRef.current) circleRef.current.setLatLng([lat, lng]);
        }

        if (onChange) {
          onChange({ latitude: lat, longitude: lng });
        }
      },
      (err) => {
        setLocating(false);
        console.warn('Geolocation error:', err.message);
        alert('Không thể truy cập tọa độ GPS hiện tại. Vui lòng bấm trực tiếp trên bản đồ.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '12px', color: c.fgSubtle, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Icon name="map" size={14} color={c.accent} />
          <span>Click hoặc kéo ghim để chọn tọa độ chính xác:</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={handleGetCurrentLocation}
          loading={locating}
          style={{ fontSize: '12px', padding: '3px 8px', color: c.accent }}
        >
          <Icon name="pin" size={13} />
          <span>Vị trí hiện tại</span>
        </Button>
      </div>

      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '210px',
          borderRadius: '10px',
          overflow: 'hidden',
          border: `1px solid ${c.border}`,
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          zIndex: 1,
        }}
      />
    </div>
  );
}
