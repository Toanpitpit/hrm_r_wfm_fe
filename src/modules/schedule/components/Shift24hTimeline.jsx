import React, { useState } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Panel from '@/shared/components/ui/Panel';
import Badge from '@/shared/components/ui/Badge';
import Icon from '@/shared/components/ui/Icon';
import { getShiftTypeColor, SHIFT_TYPE_COLORS } from '../constants/shift.constants';

/**
 * ==============================================================================
 * COMPONENT: Shift24hTimeline.jsx
 * Sơ đồ trực quan hóa phân bổ các ca làm việc 24 giờ
 * ==============================================================================
 * - Nhận danh sách ShiftTemplateDto và vẽ chính xác theo startTime / endTime
 * - Tách ca qua đêm thành 2 đoạn (startTime -> 24:00 và 00:00 -> endTime)
 * - Màu sắc định danh lấy từ SHIFT_TYPE_COLORS tập trung
 * - Chú giải số ca đang hiển thị và nhãn nguồn ("Ca chung" / "Ca riêng")
 */
export default function Shift24hTimeline({
  shifts = [],
  sourceLabel = 'Ca chung',
  title = 'Sơ Đồ Phân Bổ Ca Trực 24 Giờ',
  subtitle = 'Dòng thời gian hoạt động liên tục trong 24 giờ',
  emptyMessage = 'Chưa có khung ca nào đang áp dụng trong bộ ca này.',
}) {
  const { c, isDark } = useAdminTheme();
  const [hoveredShiftId, setHoveredShiftId] = useState(null);

  const activeShifts = (shifts || []).filter((s) => s.isActive);
  const hours = Array.from({ length: 25 }, (_, i) => i); // 0 đến 24

  // Lọc tên ca sạch nếu vô tình có ngoặc giờ
  const getCleanShiftName = (rawName) => {
    if (!rawName) return '';
    return rawName.replace(/\s*\(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\)/gi, '').trim();
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

    // Ca thông thường trong ngày
    if (!isNightCross) {
      const left = (startMin / totalMin) * 100;
      const width = ((endMin - startMin) / totalMin) * 100;
      return [
        {
          key: 'single',
          left: `${left.toFixed(2)}%`,
          width: `${width.toFixed(2)}%`,
          displayTime: `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`,
          tag: '',
          isOvernightPart: false,
        },
      ];
    }

    // Ca qua đêm: Chia thành 2 đoạn không tràn thước đo
    // Đoạn 1: từ startTime đến 24:00
    const left1 = (startMin / totalMin) * 100;
    const width1 = ((totalMin - startMin) / totalMin) * 100;

    // Đoạn 2: từ 00:00 đến endTime
    const left2 = 0;
    const width2 = (endMin / totalMin) * 100;

    return [
      {
        key: 'part2-morning',
        left: `${left2.toFixed(2)}%`,
        width: `${width2.toFixed(2)}%`,
        displayTime: `00:00 - ${endTime.slice(0, 5)}`,
        tag: 'Hôm sau',
        isOvernightPart: true,
      },
      {
        key: 'part1-night',
        left: `${left1.toFixed(2)}%`,
        width: `${width1.toFixed(2)}%`,
        displayTime: `${startTime.slice(0, 5)} - 24:00`,
        tag: 'Đêm nay',
        isOvernightPart: true,
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
          marginBottom: '16px',
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
            <div
              style={{
                fontWeight: 700,
                fontSize: '14.5px',
                color: c.fg,
                letterSpacing: '-0.2px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{title}</span>
              {sourceLabel && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: sourceLabel.includes('riêng') || sourceLabel.includes('CUSTOM')
                      ? 'rgba(168, 85, 247, 0.15)'
                      : `${c.accent}18`,
                    color: sourceLabel.includes('riêng') || sourceLabel.includes('CUSTOM')
                      ? '#c084fc'
                      : c.accent,
                    border: `1px solid ${
                      sourceLabel.includes('riêng') || sourceLabel.includes('CUSTOM')
                        ? 'rgba(168, 85, 247, 0.3)'
                        : `${c.accent}30`
                    }`,
                  }}
                >
                  Nguồn: {sourceLabel}
                </span>
              )}
            </div>
            <div style={{ fontSize: '11.5px', color: c.fgSubtle, marginTop: '2px' }}>
              {subtitle}
            </div>
          </div>
        </div>

        {/* Chú thích nhóm ca & Badge tổng */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              fontSize: '12px',
              color: c.fgSubtle,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: SHIFT_TYPE_COLORS.Morning.primary,
                }}
              />
              {SHIFT_TYPE_COLORS.Morning.label}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: SHIFT_TYPE_COLORS.Afternoon.primary,
                }}
              />
              {SHIFT_TYPE_COLORS.Afternoon.label}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: SHIFT_TYPE_COLORS.Night.primary,
                }}
              />
              {SHIFT_TYPE_COLORS.Night.label} (Qua đêm)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: SHIFT_TYPE_COLORS.Other.primary,
                }}
              />
              {SHIFT_TYPE_COLORS.Other.label}
            </span>
          </div>

          <Badge tone="accent">
            <span>{activeShifts.length} Khung Ca Đang Bật</span>
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
          overflow: 'hidden',
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
                  borderLeft:
                    h === 12
                      ? `1px dashed ${c.accent}35`
                      : '1px dashed rgba(255,255,255,0.06)',
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
        {activeShifts.length === 0 ? (
          <div
            style={{
              padding: '24px 12px',
              textAlign: 'center',
              color: c.fgSubtle,
              fontSize: '13px',
              fontStyle: 'italic',
            }}
          >
            {emptyMessage}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              minHeight: '60px',
            }}
          >
            {activeShifts.map((shift, idx) => {
              const shiftKey = shift.id || shift.shiftId || idx;
              const cleanName = getCleanShiftName(shift.name || shift.shiftName);
              const color = getShiftTypeColor(shift.shiftType, shift.isOvernight);
              const segments = getShiftSegments(shift);
              const isHovered = hoveredShiftId === shiftKey;

              return (
                <div
                  key={shiftKey}
                  onMouseEnter={() => setHoveredShiftId(shiftKey)}
                  onMouseLeave={() => setHoveredShiftId(null)}
                  style={{
                    position: 'relative',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: isHovered
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(255,255,255,0.015)',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  {/* Đường nối biểu thị cùng 1 ca qua đêm */}
                  {segments.length > 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: segments[0].width,
                        right: `calc(100% - ${segments[1].left})`,
                        height: '1px',
                        borderTop: `1px dashed ${color}45`,
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  {/* Các khối ca */}
                  {segments.map((seg) => {
                    const isNarrow = parseFloat(seg.width) < 14;

                    const titleColor = isDark ? '#ffffff' : color;
                    const badgeBg = isDark ? 'rgba(0,0,0,0.5)' : `${color}20`;

                    return (
                      <div
                        key={seg.key}
                        style={{
                          position: 'absolute',
                          left: seg.left,
                          width: seg.width,
                          height: '100%',
                          background: isDark
                            ? `linear-gradient(135deg, ${color}26, ${color}14)`
                            : `linear-gradient(135deg, ${color}22, ${color}10)`,
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
                          boxShadow: isHovered
                            ? `0 4px 14px ${color}35`
                            : `0 2px 6px ${color}15`,
                          transform: isHovered ? 'translateY(-1px)' : 'none',
                          transition: 'all 0.18s ease',
                          cursor: 'pointer',
                        }}
                        title={`${cleanName} (${shift.startTime?.slice(0, 5)} - ${shift.endTime?.slice(0, 5)}) • ${shift.paidHours || 7.5}h công ${seg.tag ? `[${seg.tag}]` : ''}`}
                      >
                        {/* Tên ca & Chấm màu */}
                        {!isNarrow && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              minWidth: 0,
                              overflow: 'hidden',
                            }}
                          >
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
                              {seg.tag && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 500,
                                    color: color,
                                    marginLeft: '4px',
                                    opacity: 0.85,
                                  }}
                                >
                                  ({seg.tag})
                                </span>
                              )}
                            </span>
                          </div>
                        )}

                        {/* Khung giờ hiển thị */}
                        <span
                          style={{
                            fontSize: isNarrow ? '10px' : '11px',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: color,
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
        )}
      </div>

      {/* 3. Dải tóm tắt thông số các ca ở chân sơ đồ */}
      {activeShifts.length > 0 && (
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
            const shiftKey = shift.id || shift.shiftId || i;
            const cleanName = getCleanShiftName(shift.name || shift.shiftName);
            const color = getShiftTypeColor(shift.shiftType, shift.isOvernight);

            return (
              <div
                key={shiftKey}
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
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: color,
                    }}
                  />
                  <span style={{ fontWeight: 600, color: c.fg }}>{cleanName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      color: c.fgSubtle,
                      fontSize: '11.5px',
                    }}
                  >
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
                    {shift.paidHours ?? 7.5}h công
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
