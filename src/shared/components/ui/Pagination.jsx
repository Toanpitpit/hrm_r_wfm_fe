import React from 'react';
import { useAdminTheme } from '../../context/ThemeContext';
import Icon from './Icon';

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
    }
  };

  return (
    <div
      style={{
        display: 'flex',
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
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {pageSizeOptions.map((sz) => (
                <option key={sz} value={sz} style={{ backgroundColor: c.bgElev, color: c.fg }}>
                  {sz} / trang
                </option>
              ))}
            </select>
          </div>
        )}

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
      </div>
    </div>
  );
}
