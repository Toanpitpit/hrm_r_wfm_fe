import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';

/**
 * Bảng ma trận điều động theo cặp chi nhánh (Source Store -> Target Store)
 * và tổng số giờ công chi viện hỗ trợ tính lương.
 */
export default function DispatchNetworkMatrix({
  matrix = [],
  loading = false,
  emptyText = 'Chưa ghi nhận lượt điều động nào giữa các cặp chi nhánh.',
}) {
  const { c, fonts } = useAdminTheme();

  if (loading) {
    return (
      <div style={{ padding: '36px 0', textAlign: 'center', color: c.fgFaint }}>
        <div style={{ fontSize: 13 }}>Đang tổng hợp ma trận điều chuyển mạng lưới...</div>
      </div>
    );
  }

  if (!matrix || matrix.length === 0) {
    return (
      <div
        style={{
          padding: '36px 20px',
          textAlign: 'center',
          color: c.fgFaint,
          background: c.bgRaised,
          borderRadius: 8,
          border: `1px dashed ${c.border}`,
          fontSize: 13.5,
        }}
      >
        {emptyText}
      </div>
    );
  }

  const maxCount = Math.max(...matrix.map((p) => p.dispatchCount || 1));

  return (
    <div style={{ overflowX: 'auto', borderRadius: 8, border: `1px solid ${c.border}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: fonts.body }}>
        <thead>
          <tr style={{ background: c.bgElev, borderBottom: `1px solid ${c.border}` }}>
            <th style={thStyle(c, 'left')}>STT</th>
            <th style={thStyle(c, 'left')}>Cơ Sở Xuất Quân (Chi Viện)</th>
            <th style={{ ...thStyle(c, 'center'), width: 50 }}></th>
            <th style={thStyle(c, 'left')}>Cơ Sở Nhận Quân (Tiếp Nhận)</th>
            <th style={thStyle(c, 'center')}>Số Lượt Điều Động</th>
            <th style={thStyle(c, 'right')}>Tổng Giờ Công Chi Viện</th>
            <th style={thStyle(c, 'left')}>Tỷ Trọng Mạng Lưới</th>
          </tr>
        </thead>
        <tbody>
          {matrix.map((item, idx) => {
            const ratio = maxCount > 0 ? (item.dispatchCount / maxCount) * 100 : 0;

            return (
              <tr
                key={`${item.fromStoreId}-${item.toStoreId}`}
                style={{
                  borderBottom: `1px solid ${c.borderSub}`,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = c.bgElev)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* STT */}
                <td style={{ ...tdStyle(c), color: c.fgFaint, fontWeight: 700, width: 40 }}>
                  {idx + 1}
                </td>

                {/* Chi nhánh xuất quân */}
                <td style={tdStyle(c)}>
                  <div style={{ fontWeight: 600, color: c.fg, fontSize: 13.5 }}>
                    {item.fromStoreName}
                  </div>
                  <div style={{ fontSize: 11, color: c.fgFaint, marginTop: 2 }}>
                    Mã cơ sở: #{item.fromStoreId}
                  </div>
                </td>

                {/* Icon mũi tên */}
                <td style={{ ...tdStyle(c), textAlign: 'center', color: c.accent, fontSize: 16 }}>
                  &rarr;
                </td>

                {/* Chi nhánh nhận quân */}
                <td style={tdStyle(c)}>
                  <div style={{ fontWeight: 600, color: c.fg, fontSize: 13.5 }}>
                    {item.toStoreName}
                  </div>
                  <div style={{ fontSize: 11, color: c.fgFaint, marginTop: 2 }}>
                    Mã cơ sở: #{item.toStoreId}
                  </div>
                </td>

                {/* Số lượt điều động */}
                <td style={{ ...tdStyle(c), textAlign: 'center' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: 12,
                      background: 'rgba(242, 202, 80, 0.12)',
                      color: c.accent,
                      fontWeight: 700,
                      fontSize: 13.5,
                    }}
                  >
                    {item.dispatchCount} lượt
                  </span>
                </td>

                {/* Tổng giờ công */}
                <td style={{ ...tdStyle(c), textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#34d399', fontSize: 14 }}>
                    {(item.totalHours || 0).toLocaleString('vi-VN')} giờ
                  </div>
                  <div style={{ fontSize: 11, color: c.fgFaint, marginTop: 2 }}>
                    Quy chuẩn 8h/ngày
                  </div>
                </td>

                {/* Thanh tỷ trọng */}
                <td style={{ ...tdStyle(c), width: 160 }}>
                  <div
                    style={{
                      width: '100%',
                      height: 7,
                      background: c.bgRaised,
                      borderRadius: 4,
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.max(ratio, 8)}%`,
                        background: `linear-gradient(90deg, ${c.accent}, #f59e0b)`,
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function thStyle(c, align = 'left') {
  return {
    textAlign: align,
    padding: '12px 14px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: c.fgFaint,
    whiteSpace: 'nowrap',
  };
}

function tdStyle(c) {
  return {
    padding: '12px 14px',
    verticalAlign: 'middle',
    fontSize: 13,
    color: c.fg,
  };
}
