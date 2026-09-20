import React from 'react';
import { useAdminTheme } from '../../context/ThemeContext';
import Icon from './Icon';

/**
 * ==============================================================================
 * COMPONENT: Pagination.jsx
 * Thanh điều hướng phân trang dùng chung cho toàn hệ thống
 * ==============================================================================
 */
export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  onPageChange,
  onPageSizeChange,
  itemLabel = 'bản ghi',
}) {
  const { c, fonts } = useAdminTheme();

  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const fromIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toIndex = Math.min(currentPage * pageSize, totalItems);

  // Tạo danh sách số trang thông minh kèm dấu '...'
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pages = getPageNumbers();

  const handlePageClick = (p) => {
    if (typeof p === 'number' && p >= 1 && p <= totalPages && p !== currentPage) {
      onPageChange && onPageChange(p);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px 16px',
        borderTop: `1px solid ${c.border}`,
        fontFamily: fonts.body,
        fontSize: '12.5px',
        color: c.fgSubtle,
        backgroundColor: c.bgCard,
      }}
    >
      {/* 1. Thông tin bản ghi & Chọn số dòng mỗi trang */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          Hiển thị{' '}
          <strong style={{ color: c.fg, fontWeight: 600 }}>{fromIndex}</strong>
          {' - '}
          <strong style={{ color: c.fg, fontWeight: 600 }}>{toIndex}</strong>
          {' '}trên tổng số{' '}
          <strong style={{ color: c.accent, fontWeight: 700 }}>{totalItems}</strong>
          {' '}{itemLabel}
        </div>

        {pageSizeOptions && pageSizeOptions.length > 0 && onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Số dòng/trang:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: `1px solid ${c.border}`,
                backgroundColor: c.bgElev,
                color: c.fg,
                fontSize: '12px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Điều hướng nút bấm chuyển trang */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Nút Về trang đầu */}
        <button
          type="button"
          onClick={() => handlePageClick(1)}
          disabled={currentPage <= 1}
          style={{
            minWidth: '28px',
            height: '28px',
            padding: '0 4px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            border: `1px solid ${c.border}`,
            backgroundColor: c.bgElev,
            color: currentPage <= 1 ? c.fgFaint : c.fg,
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage <= 1 ? 0.45 : 1,
            transition: 'all 0.15s ease',
          }}
          title="Trang đầu"
        >
          <Icon name="chevrons-left" size={14} />
        </button>

        {/* Nút Trang trước */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{
            minWidth: '28px',
            height: '28px',
            padding: '0 4px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            border: `1px solid ${c.border}`,
            backgroundColor: c.bgElev,
            color: currentPage <= 1 ? c.fgFaint : c.fg,
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage <= 1 ? 0.45 : 1,
            transition: 'all 0.15s ease',
          }}
          title="Trang trước"
        >
          <Icon name="chevron-left" size={14} />
        </button>

        {/* Danh sách các số trang */}
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  minWidth: '24px',
                  textAlign: 'center',
                  color: c.fgFaint,
                  fontSize: '13px',
                  userSelect: 'none',
                }}
              >
                ...
              </span>
            );
          }

          const isActive = p === currentPage;

          return (
            <button
              key={p}
              type="button"
              onClick={() => handlePageClick(p)}
              style={{
                minWidth: '28px',
                height: '28px',
                padding: '0 6px',
                borderRadius: '6px',
                border: `1px solid ${isActive ? c.accent : c.border}`,
                backgroundColor: isActive ? c.accent : c.bgElev,
                color: isActive ? '#000000' : c.fg,
                fontWeight: isActive ? 700 : 500,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? `0 2px 8px ${c.accent}40` : 'none',
              }}
            >
              {p}
            </button>
          );
        })}

        {/* Nút Trang sau */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={{
            minWidth: '28px',
            height: '28px',
            padding: '0 4px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            border: `1px solid ${c.border}`,
            backgroundColor: c.bgElev,
            color: currentPage >= totalPages ? c.fgFaint : c.fg,
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage >= totalPages ? 0.45 : 1,
            transition: 'all 0.15s ease',
          }}
          title="Trang sau"
        >
          <Icon name="chevron-right" size={14} />
        </button>

        {/* Nút Về trang cuối */}
        <button
          type="button"
          onClick={() => handlePageClick(totalPages)}
          disabled={currentPage >= totalPages}
          style={{
            minWidth: '28px',
            height: '28px',
            padding: '0 4px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            border: `1px solid ${c.border}`,
            backgroundColor: c.bgElev,
            color: currentPage >= totalPages ? c.fgFaint : c.fg,
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage >= totalPages ? 0.45 : 1,
            transition: 'all 0.15s ease',
          }}
          title="Trang cuối"
        >
          <Icon name="chevrons-right" size={14} />
        </button>
      </div>
    </div>
  );
}
