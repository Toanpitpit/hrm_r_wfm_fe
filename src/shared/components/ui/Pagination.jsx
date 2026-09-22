import React from 'react';
import { useAdminTheme } from '../../context/ThemeContext';
import Icon from './Icon';

<<<<<<< Updated upstream
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
=======
export default function Pagination({
  page = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  showSizeChanger = true,
  showTotal = true,
  style = {},
}) {
  const { c, fonts } = useAdminTheme();

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  if (totalItems <= 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const delta = 2; // Number of pages around current page
    const pages = [];
    const left = currentPage - delta;
    const right = currentPage + delta + 1;
    const range = [];
    const rangeWithDots = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        range.push(i);
      }
    }

    let l = null;
    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const handlePageClick = (p) => {
    if (typeof p === 'number' && p !== currentPage && onPageChange) {
      onPageChange(p);
>>>>>>> Stashed changes
    }
  };

  return (
    <div
      style={{
        display: 'flex',
<<<<<<< Updated upstream
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
=======
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '14px 18px',
        borderTop: `1px solid ${c.borderSub || c.border}`,
        fontFamily: fonts?.body || 'inherit',
        fontSize: '13px',
        color: c.fgSubtle,
        ...style,
      }}
    >
      {/* Left side: Showing X-Y of Z */}
      {showTotal ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>Hiển thị</span>
          <strong style={{ color: c.fg, fontWeight: 700 }}>{startItem}</strong>
          <span>-</span>
          <strong style={{ color: c.fg, fontWeight: 700 }}>{endItem}</strong>
          <span>trên tổng</span>
          <strong style={{ color: c.accent, fontWeight: 700 }}>{totalItems}</strong>
          <span>mục</span>
        </div>
      ) : (
        <div />
      )}

      {/* Right side: Page size selector and page navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {showSizeChanger && pageSizeOptions && pageSizeOptions.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                if (onPageSizeChange) onPageSizeChange(newSize);
                if (onPageChange) onPageChange(1);
              }}
              style={{
                backgroundColor: c.bgRaised || c.bgCard,
                color: c.fg,
                border: `1px solid ${c.border}`,
                borderRadius: '8px',
                padding: '5px 8px',
                fontSize: '12.5px',
                fontFamily: fonts?.body || 'inherit',
>>>>>>> Stashed changes
                cursor: 'pointer',
                outline: 'none',
              }}
            >
<<<<<<< Updated upstream
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
=======
              {pageSizeOptions.map((sz) => (
                <option key={sz} value={sz} style={{ backgroundColor: c.bgElev, color: c.fg }}>
                  {sz} / trang
>>>>>>> Stashed changes
                </option>
              ))}
            </select>
          </div>
        )}
<<<<<<< Updated upstream
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
=======

        {/* Page buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Previous button */}
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => handlePageClick(currentPage - 1)}
            aria-label="Trang trước"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: `1px solid ${c.border}`,
              backgroundColor: c.bgRaised || c.bgCard,
              color: currentPage <= 1 ? c.fgFaint || '#666' : c.fg,
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage <= 1 ? 0.45 : 1,
              transition: 'all 0.15s ease',
            }}
          >
            <Icon name="chevron-left" size={14} />
          </button>

          {/* Page list */}
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`dots-${idx}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '30px',
                    height: '32px',
                    color: c.fgSubtle,
                    fontSize: '12px',
                  }}
                >
                  •••
                </span>
              );
            }

            const isActive = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => handlePageClick(p)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '32px',
                  height: '32px',
                  padding: '0 6px',
                  borderRadius: '8px',
                  border: isActive ? `1px solid ${c.accent}` : `1px solid transparent`,
                  backgroundColor: isActive ? c.accent : 'transparent',
                  color: isActive ? (c.ink || '#07090B') : c.fgMuted || c.fg,
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 2px 8px rgba(16,185,129,0.30)' : 'none',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = c.bgHover;
                    e.currentTarget.style.color = c.fg;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = c.fgMuted || c.fg;
                  }
                }}
              >
                {p}
              </button>
            );
          })}

          {/* Next button */}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageClick(currentPage + 1)}
            aria-label="Trang tiếp"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: `1px solid ${c.border}`,
              backgroundColor: c.bgRaised || c.bgCard,
              color: currentPage >= totalPages ? c.fgFaint || '#666' : c.fg,
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage >= totalPages ? 0.45 : 1,
              transition: 'all 0.15s ease',
            }}
          >
            <Icon name="chevron-right" size={14} />
          </button>
        </div>
>>>>>>> Stashed changes
      </div>
    </div>
  );
}
