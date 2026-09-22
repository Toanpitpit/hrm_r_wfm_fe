import React, { useState } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Panel from '@/shared/components/ui/Panel';
import Badge from '@/shared/components/ui/Badge';
import Icon from '@/shared/components/ui/Icon';

/**
 * ==============================================================================
 * COMPONENT: Shift24hTimeline.jsx
 * UC 1.3: Trực quan hóa sơ đồ phân bổ các ca làm việc 24 giờ (Timeline Visualizer)
 * ==============================================================================
 * - Thiết kế tinh giản, sang trọng, tương thích hoàn hảo chế độ Dark Theme.
 * - Loại bỏ thanh cuộn ngang xấu xí bằng cơ chế chia ca qua đêm (overnight split).
 * - Loại bỏ lặp chữ thời gian trong tên ca.
 * - Lưới thước đo 24h sắc nét (00:00 -> 24:00).
 */
export default function Shift24hTimeline({ shifts = [] }) {
  const { c, fonts, isDark } = useAdminTheme();
  const [hoveredShiftId, setHoveredShiftId] = useState(null);

  const activeShifts = (shifts || []).filter((s) => s.isActive);
  const hours = Array.from({ length: 25 }, (_, i) => i); // 0 đến 24

  // Lọc tên ca sạch (loại bỏ chuỗi giờ trong ngoặc như "(06:00 - 14:00)" nếu bị lặp)
  const getCleanShiftName = (rawName) => {
    if (!rawName) return '';
    return rawName.replace(/\s*\(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\)/gi, '').trim();
  };

  // Màu sắc nhận diện từng nhóm ca
  const getShiftColor = (shift) => {
    if (shift.colorCode && shift.colorCode !== '#2563eb') return shift.colorCode;
    const code = (shift.shiftCode || '').toUpperCase();
    const name = (shift.shiftName || '').toLowerCase();
    if (shift.isOvernight || code.includes('DEM') || name.includes('đêm')) return '#a855f7'; // Tím neon ca đêm
    if (code.includes('CHIEU') || name.includes('chiều')) return '#f59e0b'; // Vàng cam ca chiều
    return '#38bdf8'; // Xanh dương tươi ca sáng
  };

  // Tính toán tọa độ hiển thị trong phạm vi 0h - 24h
  const getShiftSegments = (shift) => {
    const { startTime, endTime, isOvernight } = shift;
    if (!startTime || !endTime) return [];

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    const totalMin = 24 * 60; // 1440 phút

    const isNightCross = isOvernight || endMin <= startMin;

    // Ca thông thường trong ngày (06:00 - 14:00, 14:00 - 22:00)
    if (!isNightCross) {
      const left = (startMin / totalMin) * 100;
      const width = ((endMin - startMin) / totalMin) * 100;
      return [
        {
          key: 'single',
          left: `${left.toFixed(2)}%`,
          width: `${width.toFixed(2)}%`,
          displayTime: `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`,
          isPrimary: true,
        },
      ];
    }

    // Ca đêm qua ngày (22:00 - 06:00): Chia thành 2 đoạn không bao giờ tràn 100%
    // Đoạn 1: từ startTime đến 24:00 (VD: 22:00 -> 24:00)
    const left1 = (startMin / totalMin) * 100;
    const width1 = ((totalMin - startMin) / totalMin) * 100;

    // Đoạn 2: từ 00:00 đến endTime (VD: 00:00 -> 06:00)
    const left2 = 0;
    const width2 = (endMin / totalMin) * 100;

    return [
      {
        key: 'morning-seg',
        left: `${left2.toFixed(2)}%`,
        width: `${width2.toFixed(2)}%`,
        displayTime: `00:00 - ${endTime.slice(0, 5)}`,
        tag: '+1 ngày',
        isPrimary: width2 >= 18,
      },
      {
        key: 'night-seg',
        left: `${left1.toFixed(2)}%`,
        width: `${width1.toFixed(2)}%`,
        displayTime: `${startTime.slice(0, 5)} → 24:00`,
        tag: 'qua đêm',
        isPrimary: width1 >= 18,
      },
    ];
  };

  return (
    <Panel style={{ marginBottom: '20px', padding: '18px 20px' }}>
      {/* 1. Tiêu đề và Thống kê trực quan */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: `${c.accent}15`,
              border: `1px solid ${c.accent}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: c.accent,
            }}
          >
            <Icon name="clock" size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14.5px', color: c.fg, letterSpacing: '-0.2px' }}>
              Sơ Đồ Phân Bổ Ca Trực 24 Giờ
            </div>
            <div style={{ fontSize: '11.5px', color: c.fgSubtle, marginTop: '2px' }}>
              Dòng thời gian hoạt động liên tục toàn chuỗi trong 24 giờ
            </div>
          </div>
        </div>

        {/* Chú thích nhóm ca & Badge tổng */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: c.fgSubtle }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#38bdf8' }} />
              Ca Sáng
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              Ca Chiều
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#a855f7' }} />
              Ca Đêm (Qua ngày)
            </span>
          </div>

          <Badge tone="accent">
            <span>{activeShifts.length} Khung Ca Chuẩn</span>
          </Badge>
        </div>
      </div>

      {/* 2. Bảng trực quan hóa 24h Timeline */}
      <div
        style={{
          position: 'relative',
          padding: '16px 14px 16px',
          borderRadius: '10px',
          backgroundColor: c.bgElev,
          border: `1px solid ${c.border}`,
          overflow: 'hidden', // Triệt tiêu hoàn toàn thanh scrollbar ngang
        }}
      >
        {/* Lưới đường kẻ dọc hỗ trợ gióng giờ (mỗi 3 tiếng một vạch) */}
        <div
          style={{
            position: 'absolute',
            top: '42px',
            bottom: '12px',
            left: '14px',
            right: '14px',
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {hours
            .filter((h) => h % 3 === 0)
            .map((h) => (
              <div
                key={h}
                style={{
                  width: '1px',
                  height: '100%',
                  borderLeft: h === 12 ? `1px dashed ${c.accent}35` : '1px dashed rgba(255,255,255,0.06)',
                }}
              />
            ))}
        </div>

        {/* Thước đo mốc giờ (00:00 -> 24:00) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${c.border}`,
            paddingBottom: '8px',
            marginBottom: '14px',
            fontSize: '11px',
            fontFamily: 'monospace',
            color: c.fgSubtle,
            userSelect: 'none',
          }}
        >
          {hours
            .filter((h) => h % 3 === 0)
            .map((h) => (
              <div
                key={h}
                style={{
                  fontWeight: h === 12 ? 700 : 500,
                  color: h === 12 ? c.accent : c.fgSubtle,
                }}
              >
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
        </div>

        {/* Danh sách các thanh ca trực */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            minHeight: '60px',
          }}
        >
          {activeShifts.map((shift, idx) => {
            const cleanName = getCleanShiftName(shift.shiftName);
            const color = getShiftColor(shift);
            const segments = getShiftSegments(shift);
            const isHovered = hoveredShiftId === (shift.shiftId || idx);

            return (
              <div
                key={shift.shiftId || idx}
                onMouseEnter={() => setHoveredShiftId(shift.shiftId || idx)}
                onMouseLeave={() => setHoveredShiftId(null)}
                style={{
                  position: 'relative',
                  height: '38px',
                  borderRadius: '8px',
                  backgroundColor: isHovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.015)',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {/* Nếu là ca đêm có 2 đoạn, vẽ đường nối mờ giữa 2 đoạn */}
                {segments.length > 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: segments[0].width,
                      right: `calc(100% - ${segments[1].left})`,
                      height: '1px',
                      borderTop: `1px dashed ${color}40`,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Các khối ca */}
                {segments.map((seg) => {
                  const isNarrow = parseFloat(seg.width) < 12;

                  // Màu chữ tên ca theo độ tương phản
                  const titleColor = isDark
                    ? '#ffffff'
                    : color === '#38bdf8'
                    ? '#0369a1'
                    : color === '#f59e0b'
                    ? '#b45309'
                    : '#6d28d9';

                  // Màu chữ khung giờ
                  const badgeColor = isDark
                    ? color
                    : color === '#38bdf8'
                    ? '#0284c7'
                    : color === '#f59e0b'
                    ? '#b45309'
                    : '#7c3aed';

                  const badgeBg = isDark ? 'rgba(0,0,0,0.45)' : `${color}20`;

                  return (
                    <div
                      key={seg.key}
                      style={{
                        position: 'absolute',
                        left: seg.left,
                        width: seg.width,
                        height: '100%',
                        background: isDark
                          ? `linear-gradient(135deg, ${color}28, ${color}16)`
                          : `linear-gradient(135deg, ${color}24, ${color}12)`,
                        border: `1.5px solid ${isHovered ? color : `${color}60`}`,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isNarrow ? 'center' : 'space-between',
                        padding: isNarrow ? '0 4px' : '0 10px',
                        color: c.fg,
                        fontSize: '12px',
                        fontWeight: 600,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        boxShadow: isHovered ? `0 4px 14px ${color}35` : `0 2px 6px ${color}15`,
                        transform: isHovered ? 'translateY(-1px)' : 'none',
                        transition: 'all 0.18s ease',
                        cursor: 'pointer',
                      }}
                      title={`${cleanName} (${shift.startTime?.slice(0, 5)} - ${shift.endTime?.slice(0, 5)}) • ${shift.workHours || 7.5}h làm việc`}
                    >
                      {/* Tên ca & Điểm chấm màu */}
                      {!isNarrow && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              backgroundColor: color,
                              flexShrink: 0,
                              boxShadow: `0 0 6px ${color}`,
                            }}
                          />
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: 700,
                              fontSize: '12px',
                              color: titleColor,
                            }}
                          >
                            {cleanName}
                          </span>
                        </div>
                      )}

                      {/* Khung giờ hiển thị tinh gọn */}
                      <span
                        style={{
                          fontSize: isNarrow ? '10px' : '11px',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: badgeColor,
                          backgroundColor: badgeBg,
                          padding: isNarrow ? '2px 4px' : '2px 6px',
                          borderRadius: '4px',
                          border: `1px solid ${color}40`,
                          marginLeft: isNarrow ? '0' : '6px',
                          flexShrink: 0,
                        }}
                      >
                        {seg.displayTime}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Dải tóm tắt thông số các ca ở chân sơ đồ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginTop: '14px',
          paddingTop: '12px',
          borderTop: `1px solid ${c.border}`,
        }}
      >
        {activeShifts.map((shift, i) => {
          const cleanName = getCleanShiftName(shift.shiftName);
          const color = getShiftColor(shift);

          return (
            <div
              key={shift.shiftId || i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: c.bgElev,
                border: `1px solid ${c.border}`,
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color }} />
                <span style={{ fontWeight: 600, color: c.fg }}>{cleanName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontFamily: 'monospace', color: c.fgSubtle, fontSize: '11.5px' }}>
                  {shift.startTime?.slice(0, 5)} - {shift.endTime?.slice(0, 5)}
                </span>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 600,
                    color,
                    backgroundColor: `${color}18`,
                    padding: '1px 5px',
                    borderRadius: '4px',
                  }}
                >
                  {shift.workHours || 7.5}h
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

