import React, { useState } from 'react';
import axiosInstance from '@/config/axios.config';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Icon from '@/shared/components/ui/Icon';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';

export default function AttendanceDetailModal({ record, onClose }) {
  const { c, fonts } = useAdminTheme();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [activePhotoType, setActivePhotoType] = useState('checkin');
  const [errorMsg, setErrorMsg] = useState('');

  if (!record) return null;

  const handleFetchPhoto = async (type) => {
    if (!record.attendanceLogId) {
      setErrorMsg('Ca này không có bản ghi điểm danh để tải ảnh.');
      return;
    }
    setLoadingPhoto(true);
    setActivePhotoType(type);
    setErrorMsg('');

    try {
      const res = await axiosInstance.get(
        `/v1/store-manager/attendance/photo-url/${record.attendanceLogId}?type=${type}`
      );
      if (res.data?.success && res.data?.data?.photoUrl) {
        setPhotoUrl(res.data.data.photoUrl);
      } else {
        setErrorMsg(res.data?.message || 'Không tìm thấy ảnh xác thực.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Lỗi khi yêu cầu liên kết ảnh từ máy chủ.');
    } finally {
      setLoadingPhoto(false);
    }
  };

  const renderBadge = (status) => {
    switch (status) {
      case 'ON_TIME':
      case 'EARLY':
        return <Badge tone="good" dot>ĐÚNG GIỜ</Badge>;
      case 'LATE':
        return <Badge tone="warn" dot>ĐI MUỘN</Badge>;
      case 'EARLY_LEAVE':
        return <Badge tone="warn" dot>VỀ SỚM</Badge>;
      case 'ABSENT':
        return <Badge tone="bad" dot>VẮNG MẶT (NGHỈ)</Badge>;
      case 'PENDING':
        return <Badge tone="neutral" dot>CHƯA ĐẾN CA</Badge>;
      default:
        return <Badge tone="neutral" dot>{status}</Badge>;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          backgroundColor: c.bgCard,
          borderRadius: 16,
          border: `1px solid ${c.border}`,
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
          color: c.fg,
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
          }}
        >
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: c.fg, margin: 0 }}>
              Chi Tiết Lượt Điểm Danh
            </h3>
            <div style={{ fontSize: 12, color: c.fgSubtle, marginTop: 3 }}>
              {record.fullName} • Mã NV: {record.employeeCode}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: c.fgSubtle,
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Thông tin ca */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
              background: c.bgElev,
              padding: 16,
              borderRadius: 12,
              border: `1px solid ${c.border}`,
            }}
          >
            <div>
              <span style={{ fontSize: 11, color: c.fgSubtle, textTransform: 'uppercase', fontWeight: 600 }}>
                Ca Làm Việc
              </span>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: c.fg, marginTop: 2 }}>
                {record.shiftName}
              </div>
              <div style={{ fontSize: 12, color: c.fgMuted, fontFamily: fonts?.mono || 'monospace' }}>
                {record.scheduledStartTime} - {record.scheduledEndTime}
              </div>
            </div>

            <div>
              <span style={{ fontSize: 11, color: c.fgSubtle, textTransform: 'uppercase', fontWeight: 600 }}>
                Ngày Làm Việc
              </span>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: c.fg, marginTop: 2, fontFamily: fonts?.mono || 'monospace' }}>
                {record.shiftDate}
              </div>
              <div style={{ marginTop: 2 }}>{renderBadge(record.overallStatus)}</div>
            </div>

            <div>
              <span style={{ fontSize: 11, color: c.fgSubtle, textTransform: 'uppercase', fontWeight: 600 }}>
                Check-in Thực Tế
              </span>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: c.fg, marginTop: 2, fontFamily: fonts?.mono || 'monospace' }}>
                {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </div>
              {record.lateMinutes > 0 && (
                <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 500, marginTop: 2 }}>
                  Đi muộn: {record.lateMinutes} phút
                </div>
              )}
            </div>

            <div>
              <span style={{ fontSize: 11, color: c.fgSubtle, textTransform: 'uppercase', fontWeight: 600 }}>
                Check-out Thực Tế
              </span>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: c.fg, marginTop: 2, fontFamily: fonts?.mono || 'monospace' }}>
                {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </div>
              {record.earlyLeaveMinutes > 0 && (
                <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 500, marginTop: 2 }}>
                  Về sớm: {record.earlyLeaveMinutes} phút
                </div>
              )}
            </div>
          </div>

          {/* Khu vực đối soát ảnh khuôn mặt theo yêu cầu */}
          <div
            style={{
              border: `1px solid ${c.border}`,
              borderRadius: 12,
              padding: 16,
              background: c.bgRaised,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13, color: c.fg }}>
                <Icon name="eye" size={16} color="#0D9488" />
                <span>Ảnh Đối Soát Khuôn Mặt (Kiosk Capture)</span>
              </div>
              <span style={{ fontSize: 10, background: c.track, color: c.fgSubtle, padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>
                Bảo Mật Sinh Trắc Học
              </span>
            </div>

            {/* Các nút yêu cầu xem ảnh */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <Button
                kind={activePhotoType === 'checkin' && photoUrl ? 'primary' : 'soft'}
                size="sm"
                disabled={!record.hasCheckInPhoto || loadingPhoto}
                onClick={() => handleFetchPhoto('checkin')}
                icon="eye"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {loadingPhoto && activePhotoType === 'checkin'
                  ? 'Đang lấy link S3...'
                  : record.hasCheckInPhoto
                  ? 'Xem Ảnh Check-in'
                  : 'Không Có Ảnh Check-in'}
              </Button>

              <Button
                kind={activePhotoType === 'checkout' && photoUrl ? 'primary' : 'soft'}
                size="sm"
                disabled={!record.hasCheckOutPhoto || loadingPhoto}
                onClick={() => handleFetchPhoto('checkout')}
                icon="eye"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {loadingPhoto && activePhotoType === 'checkout'
                  ? 'Đang lấy link S3...'
                  : record.hasCheckOutPhoto
                  ? 'Xem Ảnh Check-out'
                  : 'Không Có Ảnh Check-out'}
              </Button>
            </div>

            {errorMsg && (
              <div
                style={{
                  fontSize: 12,
                  color: '#EF4444',
                  background: 'rgba(239, 68, 68, 0.1)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* Khung hiển thị ảnh Lazy Load */}
            <div
              style={{
                width: '100%',
                height: 240,
                borderRadius: 8,
                background: c.bgElev,
                border: `1px dashed ${c.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {loadingPhoto ? (
                <div style={{ textAlign: 'center', color: c.fgSubtle, fontSize: 12 }}>
                  <div style={{ marginBottom: 6 }}>
                    <Icon name="refresh" size={24} color="#0D9488" />
                  </div>
                  Đang khởi tạo Presigned URL bảo mật...
                </div>
              ) : photoUrl ? (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <img
                    src={photoUrl}
                    alt="Khuôn mặt nhân viên"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      background: 'rgba(0,0,0,0.7)',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      color: '#FFF',
                    }}
                  >
                    Ảnh {activePhotoType === 'checkin' ? 'Vào ca' : 'Tan ca'} • Link hiệu lực 3 phút
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: c.fgFaint, padding: 16 }}>
                  <div style={{ marginBottom: 6 }}>
                    <Icon name="lock" size={28} color={c.fgFaint} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: c.fgMuted }}>
                    Ảnh chưa được tải để bảo vệ băng thông và bảo mật PII.
                  </div>
                  <div style={{ fontSize: 11, color: c.fgSubtle, marginTop: 2 }}>
                    Bấm một trong hai nút bên trên khi cần đối soát khuôn mặt.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: `1px solid ${c.border}`,
            display: 'flex',
            justifyContent: 'flex-end',
            background: c.bgElev,
          }}
        >
          <Button kind="ghost" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
