import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '@/config/axios.config';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Icon from '@/shared/components/ui/Icon';
import Badge from '@/shared/components/ui/Badge';

// Helper chuẩn hóa đường dẫn ảnh (nếu backend trả về đường dẫn tương đối /api/v1/files/view?key=...)
const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
  const origin = rawBaseURL.replace(/\/api\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function AttendanceDetailModal({
  employee,
  record,
  month = 11,
  year = 2026,
  branchName = '',
  onClose,
  onMonthChange,
}) {
  const { fonts, theme } = useAdminTheme();
  const isDark = theme === 'dark';

  // Định nghĩa bảng màu thích ứng theo Theme (Sáng ra sáng, Tối ra tối)
  const colors = useMemo(() => {
    return {
      overlay: isDark ? 'rgba(0, 0, 0, 0.82)' : 'rgba(15, 23, 42, 0.55)',
      dialogBg: isDark ? '#11181C' : '#FFFFFF',
      dialogBorder: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
      headerBg: isDark ? '#161F24' : '#F8FAFC',
      headerBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : '#EDF2F7',
      cardBg: isDark ? '#1A2329' : '#F8FAFC',
      cardBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
      innerBoxBg: isDark ? 'rgba(255, 255, 255, 0.04)' : '#FFFFFF',
      innerBoxBorder: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E2E8F0',
      photoBoxBg: isDark ? '#161B1E' : '#FFFFFF',
      photoBoxBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
      photoFrameBg: isDark ? 'rgba(0, 0, 0, 0.35)' : '#F1F5F9',
      photoFrameBorder: isDark ? 'rgba(255, 255, 255, 0.12)' : '#CBD5E1',
      textMain: isDark ? '#F8FAFC' : '#0F172A',
      textSub: isDark ? '#94A3B8' : '#64748B',
      textMuted: isDark ? '#64748B' : '#94A3B8',
      padDayText: isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.22)',
      navBtnBg: isDark ? 'rgba(255, 255, 255, 0.08)' : '#EDF2F7',
      navBtnHover: isDark ? 'rgba(255, 255, 255, 0.16)' : '#E2E8F0',
      navBtnText: isDark ? '#94A3B8' : '#475569',
      footerBg: isDark ? '#161F24' : '#F8FAFC',
      footerBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : '#EDF2F7',

      // Chỉ số thống kê
      workStatBg: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
      workStatBorder: isDark ? 'rgba(16, 185, 129, 0.30)' : 'rgba(16, 185, 129, 0.25)',
      workStatText: isDark ? '#34D399' : '#059669',
      workStatSub: isDark ? '#A7F3D0' : '#047857',

      offStatBg: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
      offStatBorder: isDark ? 'rgba(239, 68, 68, 0.30)' : 'rgba(239, 68, 68, 0.25)',
      offStatText: isDark ? '#F87171' : '#DC2626',
      offStatSub: isDark ? '#FECACA' : '#B91C1C',

      // Ngày được chọn trong lịch (Active circle)
      selectedCircleBg: isDark ? '#8DA5A5' : '#0D9488',
      selectedCircleText: isDark ? '#0F172A' : '#FFFFFF',
      selectedCircleBorder: isDark ? '#A4BCBC' : '#0F766E',

      // Ngày đi làm trong lịch (Tích xanh)
      calendarWorkBg: isDark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.12)',
      calendarWorkBorder: isDark ? '1.5px solid rgba(16, 185, 129, 0.50)' : '1.5px solid #10B981',
      calendarWorkText: isDark ? '#34D399' : '#059669',

      // Ngày nghỉ làm trong lịch (Tích đỏ)
      calendarOffBg: isDark ? 'rgba(239, 68, 68, 0.14)' : 'rgba(239, 68, 68, 0.10)',
      calendarOffBorder: isDark ? '1.5px solid rgba(239, 68, 68, 0.45)' : '1.5px solid #EF4444',
      calendarOffText: isDark ? '#F87171' : '#DC2626',
    };
  }, [isDark]);

  // Chuẩn hóa đối tượng nhân viên (hỗ trợ cả khi truyền employee object hoặc record đơn lẻ)
  const activeEmployee = useMemo(() => {
    if (employee) return employee;
    if (record) {
      const daysCount = new Date(year, month, 0).getDate();
      return {
        employeeId: record.employeeId,
        employeeCode: record.employeeCode,
        fullName: record.fullName,
        roleName: record.shiftName || 'Nhân viên',
        workingDays: record.checkInTime ? 1 : 0,
        totalDaysInMonth: daysCount,
        offDays: daysCount - (record.checkInTime ? 1 : 0),
        workPercentage: record.checkInTime
          ? ((1 / daysCount) * 100).toFixed(1)
          : '0.0',
        offPercentage: record.checkInTime
          ? (((daysCount - 1) / daysCount) * 100).toFixed(1)
          : '100.0',
        totalWorkHours: record.actualWorkHours || 0,
        records: [record],
        recordsByDate: { [record.shiftDate]: [record] },
      };
    }
    return null;
  }, [employee, record, month, year]);

  // Tháng và năm hiển thị trên bảng lịch
  const [currentMonth, setCurrentMonth] = useState(month);
  const [currentYear, setCurrentYear] = useState(year);
  const [isChangingMonth, setIsChangingMonth] = useState(false);

  useEffect(() => {
    setCurrentMonth(month);
    setCurrentYear(year);
  }, [month, year]);

  // Tính số ngày trong tháng và ngày bắt đầu của tháng
  const totalDaysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(currentYear, currentMonth - 1, 1).getDay();
  }, [currentYear, currentMonth]);

  const daysInPrevMonth = useMemo(() => {
    return new Date(currentYear, currentMonth - 1, 0).getDate();
  }, [currentYear, currentMonth]);

  // Ngày được chọn mặc định trong tháng
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    if (record?.shiftDate) return record.shiftDate;
    const now = new Date();
    const defaultDay =
      now.getFullYear() === currentYear && now.getMonth() + 1 === currentMonth
        ? now.getDate()
        : 1;
    return `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(Math.min(defaultDay, totalDaysInMonth)).padStart(2, '0')}`;
  });

  useEffect(() => {
    setSelectedDateStr(`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`);
  }, [currentMonth, currentYear]);

  const recordsByDate = useMemo(() => {
    return activeEmployee?.recordsByDate || {};
  }, [activeEmployee]);

  // Xây dựng ma trận lịch tháng
  const calendarCells = useMemo(() => {
    const cells = [];

    // Các ngày của tháng trước (Padding days)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      cells.push({
        dayNumber: daysInPrevMonth - i,
        isCurrentMonth: false,
        dateStr: null,
      });
    }

    // Các ngày của tháng hiện tại
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const shifts = recordsByDate[dateStr] || [];
      const hasShifts = shifts.length > 0;

      const isAttended = shifts.some(
        (s) =>
          !!s.checkInTime ||
          ['ON_TIME', 'LATE', 'EARLY', 'VIOLATION', 'PRESENT', 'IN_PROGRESS', 'COMPLETED'].includes(
            s.overallStatus
          )
      );

      const cellDate = new Date(`${dateStr}T23:59:59`);
      const now = new Date();
      const isFuture = cellDate > now;
      const isToday = cellDate.toDateString() === now.toDateString();

      let status = 'OFF';
      if (isAttended) {
        status = 'WORK'; // Tích xanh: Đi làm
      } else if (isFuture) {
        status = 'FUTURE'; // Chưa tới
      } else if (hasShifts) {
        status = 'ABSENT'; // Tích đỏ: Vắng mặt
      } else {
        status = 'OFF'; // Tích đỏ: Nghỉ làm
      }

      cells.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateStr,
        status,
        isToday,
        shifts,
      });
    }

    // Các ngày của tháng sau để hoàn thành hàng 7 cột
    const remainingCells = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
    for (let d = 1; d <= remainingCells; d++) {
      cells.push({
        dayNumber: d,
        isCurrentMonth: false,
        dateStr: null,
      });
    }

    return cells;
  }, [currentYear, currentMonth, totalDaysInMonth, firstDayOfWeek, daysInPrevMonth, recordsByDate]);

  const selectedDayData = useMemo(() => {
    if (!selectedDateStr) return null;
    return calendarCells.find((c) => c.dateStr === selectedDateStr) || null;
  }, [selectedDateStr, calendarCells]);

  const activeShift = useMemo(() => {
    if (!selectedDayData?.shifts || selectedDayData.shifts.length === 0) return null;
    return selectedDayData.shifts[0];
  }, [selectedDayData]);

  // Quản lý ảnh
  const [photoUrls, setPhotoUrls] = useState({ checkin: null, checkout: null });
  const [loadingPhotos, setLoadingPhotos] = useState({ checkin: false, checkout: false });
  const [, setPhotoErrors] = useState({ checkin: '', checkout: '' });
  const [zoomImage, setZoomImage] = useState(null);

  useEffect(() => {
    setPhotoUrls({ checkin: null, checkout: null });
    setPhotoErrors({ checkin: '', checkout: '' });

    if (!activeShift?.attendanceLogId) return;

    const logId = activeShift.attendanceLogId;

    if (activeShift.hasCheckInPhoto) {
      setLoadingPhotos((prev) => ({ ...prev, checkin: true }));
      axiosInstance
        .get(`/v1/store-manager/attendance/photo-url/${logId}?type=checkin`)
        .then((res) => {
          if (res.data?.success && res.data?.data?.photoUrl) {
            setPhotoUrls((prev) => ({ ...prev, checkin: res.data.data.photoUrl }));
          } else {
            setPhotoErrors((prev) => ({ ...prev, checkin: 'Không tìm thấy ảnh check-in.' }));
          }
        })
        .catch(() => {
          setPhotoErrors((prev) => ({ ...prev, checkin: 'Không thể kết nối ảnh check-in.' }));
        })
        .finally(() => {
          setLoadingPhotos((prev) => ({ ...prev, checkin: false }));
        });
    }

    if (activeShift.hasCheckOutPhoto) {
      setLoadingPhotos((prev) => ({ ...prev, checkout: true }));
      axiosInstance
        .get(`/v1/store-manager/attendance/photo-url/${logId}?type=checkout`)
        .then((res) => {
          if (res.data?.success && res.data?.data?.photoUrl) {
            setPhotoUrls((prev) => ({ ...prev, checkout: res.data.data.photoUrl }));
          } else {
            setPhotoErrors((prev) => ({ ...prev, checkout: 'Không tìm thấy ảnh check-out.' }));
          }
        })
        .catch(() => {
          setPhotoErrors((prev) => ({ ...prev, checkout: 'Không thể kết nối ảnh check-out.' }));
        })
        .finally(() => {
          setLoadingPhotos((prev) => ({ ...prev, checkout: false }));
        });
    }
  }, [activeShift]);

  const handlePrevMonth = () => {
    setIsChangingMonth(true);
    let nextM = currentMonth - 1;
    let nextY = currentYear;
    if (nextM < 1) {
      nextM = 12;
      nextY -= 1;
    }
    setCurrentMonth(nextM);
    setCurrentYear(nextY);
    if (onMonthChange) onMonthChange(nextM, nextY);
    setTimeout(() => setIsChangingMonth(false), 80);
  };

  const handleNextMonth = () => {
    setIsChangingMonth(true);
    let nextM = currentMonth + 1;
    let nextY = currentYear;
    if (nextM > 12) {
      nextM = 1;
      nextY += 1;
    }
    setCurrentMonth(nextM);
    setCurrentYear(nextY);
    if (onMonthChange) onMonthChange(nextM, nextY);
    setTimeout(() => setIsChangingMonth(false), 80);
  };

  if (!activeEmployee) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNameEn = monthNames[currentMonth - 1];

  const selectedDayOfWeekName = selectedDateStr
    ? new Date(selectedDateStr).toLocaleDateString('vi-VN', { weekday: 'long' })
    : '';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: colors.overlay,
        backdropFilter: 'blur(7px)',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1040, // Mở rộng kích thước popup để lịch và dữ liệu nằm song song đối xứng
          backgroundColor: colors.dialogBg,
          borderRadius: 20,
          border: `1px solid ${colors.dialogBorder}`,
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.75)'
            : '0 20px 45px -10px rgba(0, 0, 0, 0.15)',
          color: colors.textMain,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          transition: 'background-color .2s, border-color .2s',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ==================== MODAL HEADER ==================== */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: `1px solid ${colors.headerBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: colors.headerBg,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 17,
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.28)',
              }}
            >
              {(activeEmployee.fullName || 'N').trim().charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.textMain, margin: 0 }}>
                  {activeEmployee.fullName}
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    background: isDark ? 'rgba(20, 184, 166, 0.2)' : 'rgba(13, 148, 136, 0.12)',
                    color: isDark ? '#2DD4BF' : '#0D9488',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontWeight: 600,
                    border: `1px solid ${isDark ? 'rgba(20, 184, 166, 0.3)' : 'rgba(13, 148, 136, 0.2)'}`,
                  }}
                >
                  {activeEmployee.employeeCode}
                </span>
              </div>
              <div style={{ fontSize: 12, color: colors.textSub, marginTop: 2 }}>
                {branchName ? `${branchName} • ` : ''}
                {activeEmployee.roleName || 'Nhân sự cửa hàng'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: colors.navBtnBg,
              border: 'none',
              color: colors.navBtnText,
              cursor: 'pointer',
              padding: 8,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background .2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.navBtnHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.navBtnBg)}
            title="Đóng cửa sổ (Esc)"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* ==================== 4 THẺ CHỈ SỐ NHANH ==================== */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
            }}
          >
            <div
              style={{
                background: colors.workStatBg,
                border: `1px solid ${colors.workStatBorder}`,
                padding: '10px 14px',
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: 11, color: colors.workStatText, fontWeight: 700, textTransform: 'uppercase' }}>
                ✓ Đi Làm
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: colors.textMain, marginTop: 2 }}>
                {activeEmployee.workPercentage}%
              </div>
              <div style={{ fontSize: 11, color: colors.workStatSub }}>
                ({activeEmployee.workingDays}/{activeEmployee.totalDaysInMonth} ngày)
              </div>
            </div>

            <div
              style={{
                background: colors.offStatBg,
                border: `1px solid ${colors.offStatBorder}`,
                padding: '10px 14px',
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: 11, color: colors.offStatText, fontWeight: 700, textTransform: 'uppercase' }}>
                ✕ Nghỉ Làm
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: colors.textMain, marginTop: 2 }}>
                {activeEmployee.offPercentage}%
              </div>
              <div style={{ fontSize: 11, color: colors.offStatSub }}>
                ({activeEmployee.offDays}/{activeEmployee.totalDaysInMonth} ngày)
              </div>
            </div>

            <div
              style={{
                background: colors.innerBoxBg,
                border: `1px solid ${colors.innerBoxBorder}`,
                padding: '10px 14px',
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: 11, color: colors.textSub, fontWeight: 600, textTransform: 'uppercase' }}>
                Tổng Giờ Làm
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: colors.textMain, marginTop: 2 }}>
                {activeEmployee.totalWorkHours}h
              </div>
              <div style={{ fontSize: 11, color: colors.textMuted }}>Thực tế đối soát</div>
            </div>

            <div
              style={{
                background: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)',
                border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.25)'}`,
                padding: '10px 14px',
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: 11, color: isDark ? '#FBBF24' : '#D97706', fontWeight: 700, textTransform: 'uppercase' }}>
                Vi Phạm Giờ
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: colors.textMain, marginTop: 2 }}>
                {(activeEmployee.lateShifts || 0) + (activeEmployee.earlyLeaveShifts || 0)} ca
              </div>
              <div style={{ fontSize: 11, color: isDark ? '#FDE68A' : '#B45309' }}>
                Muộn: {activeEmployee.lateShifts || 0} • Sớm: {activeEmployee.earlyLeaveShifts || 0}
              </div>
            </div>
          </div>

          {/* ==================== BỐ CỤC SONG SONG (LỊCH BÊN TRÁI - CHI TIẾT & ẢNH BÊN PHẢI) ==================== */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(350px, 390px) 1fr',
              gap: 18,
              alignItems: 'stretch',
            }}
          >
            {/* --- CỘT TRÁI: BẢNG LỊCH THÁNG --- */}
            <div
              style={{
                backgroundColor: colors.cardBg,
                borderRadius: 16,
                border: `1px solid ${colors.cardBorder}`,
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isDark ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div>
                {/* Header Lịch Tháng & Nút Chuyển Tháng */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                    paddingBottom: 10,
                    borderBottom: `1px solid ${colors.headerBorder}`,
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 700, color: colors.textMain, letterSpacing: 0.2 }}>
                    {monthNameEn} {currentYear}
                    <span style={{ fontSize: 12, color: colors.textSub, fontWeight: 400, marginLeft: 6 }}>
                      (T{currentMonth}/{currentYear})
                    </span>
                  </div>

                  {/* Nút mũi tên ▲ ▼ */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <button
                      onClick={handlePrevMonth}
                      style={{
                        background: colors.navBtnBg,
                        border: 'none',
                        color: colors.navBtnText,
                        cursor: 'pointer',
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        transition: 'all .2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.navBtnHover;
                        e.currentTarget.style.color = colors.textMain;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = colors.navBtnBg;
                        e.currentTarget.style.color = colors.navBtnText;
                      }}
                      title="Tháng trước"
                    >
                      ▲
                    </button>
                    <button
                      onClick={handleNextMonth}
                      style={{
                        background: colors.navBtnBg,
                        border: 'none',
                        color: colors.navBtnText,
                        cursor: 'pointer',
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        transition: 'all .2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.navBtnHover;
                        e.currentTarget.style.color = colors.textMain;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = colors.navBtnBg;
                        e.currentTarget.style.color = colors.navBtnText;
                      }}
                      title="Tháng sau"
                    >
                      ▼
                    </button>
                  </div>
                </div>

                {/* Thứ trong tuần (Su Mo Tu We Th Fr Sa) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    textAlign: 'center',
                    marginBottom: 8,
                  }}
                >
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w, idx) => (
                    <div
                      key={w}
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: idx === 0 ? '#EF4444' : colors.textSub,
                        padding: '4px 0',
                        textTransform: 'uppercase',
                      }}
                    >
                      {w}
                    </div>
                  ))}
                </div>

                {/* LƯỚI NGÀY: VIỀN TRÒN 100% CỐ ĐỊNH 35x35px */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    rowGap: 7,
                    columnGap: 4,
                    opacity: isChangingMonth ? 0.35 : 1,
                    transition: 'opacity 0.08s ease',
                  }}
                >
                  {calendarCells.map((cell, idx) => {
                    if (!cell.isCurrentMonth) {
                      return (
                        <div
                          key={`pad-${idx}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 36,
                            color: colors.padDayText,
                            fontSize: 13,
                            fontFamily: fonts?.mono || 'monospace',
                          }}
                        >
                          {cell.dayNumber}
                        </div>
                      );
                    }

                    const isSelected = cell.dateStr === selectedDateStr;
                    const isWork = cell.status === 'WORK';
                    const isAbsent = cell.status === 'ABSENT';
                    const isOff = cell.status === 'OFF';

                    let cellBg = 'transparent';
                    let cellBorder = '1.5px solid transparent';
                    let textColor = colors.textMain;
                    let indicatorTag = null;

                    if (isSelected) {
                      cellBg = colors.selectedCircleBg;
                      textColor = colors.selectedCircleText;
                      cellBorder = `1.5px solid ${colors.selectedCircleBorder}`;
                    } else if (isWork) {
                      cellBg = colors.calendarWorkBg;
                      cellBorder = colors.calendarWorkBorder;
                      textColor = colors.calendarWorkText;
                    } else if (isAbsent || isOff) {
                      cellBg = colors.calendarOffBg;
                      cellBorder = colors.calendarOffBorder;
                      textColor = colors.calendarOffText;
                    } else {
                      textColor = colors.textSub;
                    }

                    if (isWork) {
                      indicatorTag = (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: 1,
                            fontSize: 8.5,
                            fontWeight: 900,
                            color: isSelected ? colors.selectedCircleText : (isDark ? '#34D399' : '#059669'),
                            lineHeight: 1,
                          }}
                        >
                          ✓
                        </span>
                      );
                    } else if (isAbsent || isOff) {
                      indicatorTag = (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: 1,
                            fontSize: 8,
                            fontWeight: 900,
                            color: isSelected ? colors.selectedCircleText : (isDark ? '#F87171' : '#DC2626'),
                            lineHeight: 1,
                          }}
                        >
                          ✕
                        </span>
                      );
                    }

                    return (
                      <div
                        key={cell.dateStr}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: 36,
                        }}
                      >
                        <button
                          onClick={() => setSelectedDateStr(cell.dateStr)}
                          style={{
                            position: 'relative',
                            width: 35,
                            height: 35,
                            minWidth: 35,
                            minHeight: 35,
                            maxWidth: 35,
                            maxHeight: 35,
                            aspectRatio: '1 / 1',
                            borderRadius: '50%',
                            background: cellBg,
                            border: cellBorder,
                            color: textColor,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12.5,
                            fontWeight: isSelected ? 800 : 600,
                            fontFamily: fonts?.mono || 'monospace',
                            padding: 0,
                            transition: 'all .15s ease',
                            boxShadow: isSelected
                              ? isDark
                                ? '0 3px 10px rgba(0, 0, 0, 0.45)'
                                : '0 3px 10px rgba(13, 148, 136, 0.35)'
                              : 'none',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.transform = 'scale(1.1)';
                              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = 'none';
                            }
                          }}
                          title={`Ngày ${cell.dayNumber}/${currentMonth}/${currentYear} - ${
                            isWork ? 'Đi làm (Tích xanh)' : isAbsent || isOff ? 'Nghỉ làm (Tích đỏ)' : 'Chưa tới'
                          }`}
                        >
                          <span style={{ marginTop: indicatorTag ? -3 : 0, lineHeight: 1 }}>{cell.dayNumber}</span>
                          {indicatorTag}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chú thích Legend */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  marginTop: 14,
                  paddingTop: 10,
                  borderTop: `1px solid ${colors.headerBorder}`,
                  fontSize: 11,
                  color: colors.textSub,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 15,
                      height: 15,
                      borderRadius: '50%',
                      background: colors.calendarWorkBg,
                      color: colors.calendarWorkText,
                      fontSize: 9.5,
                      fontWeight: 800,
                      border: `1px solid ${isDark ? '#10B981' : '#059669'}`,
                    }}
                  >
                    ✓
                  </span>
                  <span>Đi làm</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 15,
                      height: 15,
                      borderRadius: '50%',
                      background: colors.calendarOffBg,
                      color: colors.calendarOffText,
                      fontSize: 8.5,
                      fontWeight: 800,
                      border: `1px solid ${isDark ? '#EF4444' : '#DC2626'}`,
                    }}
                  >
                    ✕
                  </span>
                  <span>Nghỉ làm</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 13,
                      height: 13,
                      borderRadius: '50%',
                      background: colors.selectedCircleBg,
                      border: `1px solid ${colors.selectedCircleBorder}`,
                    }}
                  />
                  <span>Đang chọn</span>
                </div>
              </div>
            </div>

            {/* --- CỘT PHẢI: CHI TIẾT ĐIỂM DANH THEO NGÀY & ẢNH CHECK-IN / CHECK-OUT --- */}
            <div
              style={{
                backgroundColor: colors.cardBg,
                borderRadius: 16,
                border: `1px solid ${colors.cardBorder}`,
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              {/* Header ngày được chọn */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                  paddingBottom: 10,
                  borderBottom: `1px solid ${colors.headerBorder}`,
                }}
              >
                <div>
                  <span style={{ fontSize: 10.5, color: colors.textSub, textTransform: 'uppercase', fontWeight: 600 }}>
                    DỮ LIỆU ĐIỂM DANH THEO NGÀY
                  </span>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: colors.textMain, marginTop: 1 }}>
                    {selectedDayOfWeekName ? `${selectedDayOfWeekName}, ` : ''}
                    {selectedDateStr}
                  </div>
                </div>

                <div>
                  {selectedDayData?.status === 'WORK' && (
                    <Badge tone="good" dot>
                      ✓ ĐÃ ĐI LÀM (CHẤM CÔNG HỢP LỆ)
                    </Badge>
                  )}
                  {selectedDayData?.status === 'ABSENT' && (
                    <Badge tone="bad" dot>
                      ✕ NGHỈ LÀM (VẮNG MẶT CÓ LỊCH)
                    </Badge>
                  )}
                  {selectedDayData?.status === 'OFF' && (
                    <Badge tone="bad" dot>
                      ✕ NGHỈ LÀM (NGÀY NGHỈ THEO LỊCH)
                    </Badge>
                  )}
                  {selectedDayData?.status === 'FUTURE' && (
                    <Badge tone="neutral" dot>
                      CHƯA DIỄN RA
                    </Badge>
                  )}
                </div>
              </div>

              {/* Chi tiết ca & giờ Check-in / Check-out */}
              {activeShift ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 10,
                    background: colors.innerBoxBg,
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: `1px solid ${colors.innerBoxBorder}`,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 10.5, color: colors.textSub, textTransform: 'uppercase' }}>CA LÀM VIỆC</span>
                    <div style={{ fontWeight: 600, fontSize: 13, color: colors.textMain, marginTop: 2 }}>
                      {activeShift.shiftName}
                    </div>
                    <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts?.mono || 'monospace' }}>
                      {activeShift.scheduledStartTime} - {activeShift.scheduledEndTime}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: 10.5, color: colors.textSub, textTransform: 'uppercase' }}>GIỜ CHECK-IN</span>
                    <div style={{ fontWeight: 700, fontSize: 13, color: colors.textMain, marginTop: 2, fontFamily: fonts?.mono || 'monospace' }}>
                      {activeShift.checkInTime
                        ? new Date(activeShift.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '--:--'}
                    </div>
                    {activeShift.lateMinutes > 0 ? (
                      <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 600, marginTop: 1 }}>
                        Muộn {activeShift.lateMinutes}p
                      </div>
                    ) : activeShift.checkInTime ? (
                      <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginTop: 1 }}>
                        Đúng giờ
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <span style={{ fontSize: 10.5, color: colors.textSub, textTransform: 'uppercase' }}>GIỜ CHECK-OUT</span>
                    <div style={{ fontWeight: 700, fontSize: 13, color: colors.textMain, marginTop: 2, fontFamily: fonts?.mono || 'monospace' }}>
                      {activeShift.checkOutTime
                        ? new Date(activeShift.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '--:--'}
                    </div>
                    {activeShift.earlyLeaveMinutes > 0 ? (
                      <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600, marginTop: 1 }}>
                        Về sớm {activeShift.earlyLeaveMinutes}p
                      </div>
                    ) : activeShift.checkOutTime ? (
                      <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginTop: 1 }}>
                        Đúng giờ
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <span style={{ fontSize: 10.5, color: colors.textSub, textTransform: 'uppercase' }}>TỔNG GIỜ LÀM</span>
                    <div style={{ fontWeight: 800, fontSize: 14, color: isDark ? '#2DD4BF' : '#0D9488', marginTop: 2, fontFamily: fonts?.mono || 'monospace' }}>
                      {activeShift.actualWorkHours !== null && activeShift.actualWorkHours !== undefined
                        ? `${activeShift.actualWorkHours}h`
                        : '--'}
                    </div>
                    <div style={{ fontSize: 10.5, color: colors.textMuted }}>
                      Trạng thái: {activeShift.overallStatus}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.05)',
                    border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.2)'}`,
                    color: isDark ? '#F87171' : '#DC2626',
                    fontSize: 12.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Icon name="info" size={18} color={isDark ? '#F87171' : '#DC2626'} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Ngày Nghỉ Làm (Không có ca làm việc)</div>
                    <div style={{ fontSize: 11.5, color: colors.textSub, marginTop: 1 }}>
                      Nhân viên không có lịch phân ca hoặc được sắp xếp nghỉ theo quy định của cửa hàng.
                    </div>
                  </div>
                </div>
              )}

              {/* KHUNG HIỂN THỊ ẢNH NHÂN VIÊN CHECK-IN VÀ CHECK-OUT */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13, color: colors.textMain }}>
                    <Icon name="eye" size={16} color={isDark ? '#2DD4BF' : '#0D9488'} />
                    <span>Ảnh Nhận Diện Check-in & Check-out Thực Tế (Kiosk Capture)</span>
                  </div>
                  <span
                    style={{
                      fontSize: 10.5,
                      background: colors.innerBoxBg,
                      border: `1px solid ${colors.innerBoxBorder}`,
                      color: colors.textSub,
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontWeight: 500,
                    }}
                  >
                    Sinh Trắc Học PII
                  </span>
                </div>

                {/* 2 Ảnh hiển thị song song */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 12,
                  }}
                >
                  {/* --- KHUNG ẢNH CHECK-IN --- */}
                  <div
                    style={{
                      background: colors.photoBoxBg,
                      borderRadius: 12,
                      border: `1px solid ${colors.photoBoxBorder}`,
                      padding: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: '#10B981' }}>
                        ● Ảnh Check-in (Vào ca)
                      </span>
                      {activeShift?.checkInTime && (
                        <span style={{ fontSize: 11, color: colors.textSub, fontFamily: fonts?.mono || 'monospace' }}>
                          {new Date(activeShift.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        height: 190,
                        borderRadius: 8,
                        backgroundColor: colors.photoFrameBg,
                        border: `1px dashed ${colors.photoFrameBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {loadingPhotos.checkin ? (
                        <div style={{ textAlign: 'center', color: colors.textSub, fontSize: 12 }}>
                          <Icon name="refresh" size={22} color={isDark ? '#2DD4BF' : '#0D9488'} />
                          <div style={{ marginTop: 4 }}>Đang tải ảnh...</div>
                        </div>
                      ) : photoUrls.checkin ? (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                          <img
                            src={resolveImageUrl(photoUrls.checkin)}
                            alt="Ảnh Check-in"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
                            onClick={() => setZoomImage({ url: resolveImageUrl(photoUrls.checkin), title: `Ảnh Check-in - ${activeEmployee.fullName} (${selectedDateStr})` })}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              setPhotoErrors((prev) => ({ ...prev, checkin: 'Ảnh không khả dụng hoặc lưu trữ offline.' }));
                            }}
                          />
                          <button
                            onClick={() => setZoomImage({ url: resolveImageUrl(photoUrls.checkin), title: `Ảnh Check-in - ${activeEmployee.fullName} (${selectedDateStr})` })}
                            style={{
                              position: 'absolute',
                              bottom: 6,
                              right: 6,
                              background: 'rgba(0,0,0,0.7)',
                              border: 'none',
                              color: '#FFF',
                              borderRadius: 4,
                              padding: '3px 6px',
                              fontSize: 10,
                              cursor: 'pointer',
                            }}
                          >
                            Phóng to ⤢
                          </button>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: 12, color: colors.textMuted }}>
                          <Icon name="eye" size={24} color={colors.textMuted} />
                          <div style={{ fontSize: 11.5, fontWeight: 500, marginTop: 4, color: colors.textSub }}>
                            {activeShift?.hasCheckInPhoto
                              ? 'Bấm nút để yêu cầu ảnh'
                              : activeShift
                              ? 'Không có ảnh check-in'
                              : 'Ngày nghỉ - Không có ảnh'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* --- KHUNG ẢNH CHECK-OUT --- */}
                  <div
                    style={{
                      background: colors.photoBoxBg,
                      borderRadius: 12,
                      border: `1px solid ${colors.photoBoxBorder}`,
                      padding: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: '#F59E0B' }}>
                        ● Ảnh Check-out (Tan ca)
                      </span>
                      {activeShift?.checkOutTime && (
                        <span style={{ fontSize: 11, color: colors.textSub, fontFamily: fonts?.mono || 'monospace' }}>
                          {new Date(activeShift.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        height: 190,
                        borderRadius: 8,
                        backgroundColor: colors.photoFrameBg,
                        border: `1px dashed ${colors.photoFrameBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {loadingPhotos.checkout ? (
                        <div style={{ textAlign: 'center', color: colors.textSub, fontSize: 12 }}>
                          <Icon name="refresh" size={22} color={isDark ? '#2DD4BF' : '#0D9488'} />
                          <div style={{ marginTop: 4 }}>Đang tải ảnh...</div>
                        </div>
                      ) : photoUrls.checkout ? (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                          <img
                            src={resolveImageUrl(photoUrls.checkout)}
                            alt="Ảnh Check-out"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
                            onClick={() => setZoomImage({ url: resolveImageUrl(photoUrls.checkout), title: `Ảnh Check-out - ${activeEmployee.fullName} (${selectedDateStr})` })}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              setPhotoErrors((prev) => ({ ...prev, checkout: 'Ảnh không khả dụng hoặc lưu trữ offline.' }));
                            }}
                          />
                          <button
                            onClick={() => setZoomImage({ url: resolveImageUrl(photoUrls.checkout), title: `Ảnh Check-out - ${activeEmployee.fullName} (${selectedDateStr})` })}
                            style={{
                              position: 'absolute',
                              bottom: 6,
                              right: 6,
                              background: 'rgba(0,0,0,0.7)',
                              border: 'none',
                              color: '#FFF',
                              borderRadius: 4,
                              padding: '3px 6px',
                              fontSize: 10,
                              cursor: 'pointer',
                            }}
                          >
                            Phóng to ⤢
                          </button>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: 12, color: colors.textMuted }}>
                          <Icon name="eye" size={24} color={colors.textMuted} />
                          <div style={{ fontSize: 11.5, fontWeight: 500, marginTop: 4, color: colors.textSub }}>
                            {activeShift?.hasCheckOutPhoto
                              ? 'Bấm nút để yêu cầu ảnh'
                              : activeShift
                              ? 'Chưa check-out hoặc không có ảnh'
                              : 'Ngày nghỉ - Không có ảnh'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* MODAL PHÓNG TO ẢNH (LIGHTBOX) */}
      {zoomImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            backgroundColor: 'rgba(0, 0, 0, 0.90)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setZoomImage(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: 700,
              maxHeight: '90vh',
              borderRadius: 14,
              overflow: 'hidden',
              backgroundColor: colors.dialogBg,
              border: `1px solid ${colors.dialogBorder}`,
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '12px 18px',
                borderBottom: `1px solid ${colors.headerBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: colors.textMain,
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              <span>{zoomImage.title}</span>
              <button
                onClick={() => setZoomImage(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.textSub,
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            <img
              src={zoomImage.url}
              alt="Zoom"
              style={{
                width: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
