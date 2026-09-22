// DataTable — Bảng dữ liệu chuẩn đồng nhất hệ thống kèm Phân trang (Pagination)
import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '../../context/ThemeContext';
import Pagination from './Pagination';

export default function DataTable({
  columns = [],
  rows,
  data,
  density = 'regular',
  emptyText,
  emptyMessage,
  loading = false,
  pagination = true,
  page: controlledPage,
  pageSize: controlledPageSize = 10,
  totalItems: controlledTotalItems,
  onPageChange: controlledOnPageChange,
  onPageSizeChange: controlledOnPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  stickyHeader = false,
  maxHeight,
}) {
  const { c, fonts } = useAdminTheme();
  const py = density === 'compact' ? 10 : density === 'comfy' ? 18 : 14;
  const tableRows = rows || data || [];
  const messageEmpty = emptyMessage || emptyText || 'Không có dữ liệu phù hợp.';

  // Client-side pagination state
  const isControlled = controlledPage !== undefined && controlledOnPageChange !== undefined;
  const [clientPage, setClientPage] = useState(1);
  const [clientPageSize, setClientPageSize] = useState(controlledPageSize || 10);

  // Reset to first page when data changes
  useEffect(() => {
    if (!isControlled) {
      setClientPage(1);
    }
  }, [tableRows.length, isControlled]);

  const activePage = isControlled ? controlledPage : clientPage;
  const activePageSize = isControlled ? controlledPageSize : clientPageSize;
  const totalCount = isControlled ? (controlledTotalItems ?? tableRows.length) : tableRows.length;

  // Slicing for client-side pagination
  const displayRows = pagination && !isControlled
    ? tableRows.slice((activePage - 1) * activePageSize, activePage * activePageSize)
    : tableRows;

  const handlePageChange = (newPage) => {
    if (isControlled) {
      controlledOnPageChange(newPage);
    } else {
      setClientPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    if (isControlled && controlledOnPageSizeChange) {
      controlledOnPageSizeChange(newSize);
    } else {
      setClientPageSize(newSize);
      setClientPage(1);
    }
  };

  return (
    <div
      style={{
        overflowX: 'auto',
        overflowY: maxHeight ? 'auto' : undefined,
        maxHeight: maxHeight || undefined,
        borderRadius: 14,
        border: `1px solid ${c.border}`,
        background: c.bgCard,
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: fonts?.body || 'inherit' }}>
        <thead>
          <tr style={{ background: c.bgElev }}>
            {columns.map((col, i) => (
              <th
                key={i}
                style={{
                  textAlign: col.align || 'left',
                  padding: '13px 18px',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  color: c.fgSubtle,
                  borderBottom: `1px solid ${c.border}`,
                  whiteSpace: 'nowrap',
                  width: col.w || col.width,
                  position: stickyHeader ? 'sticky' : undefined,
                  top: stickyHeader ? 0 : undefined,
                  zIndex: 10,
                  backgroundColor: c.bgElev || c.bgCard,
                }}
              >
                {col.label || col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length || 1} style={{ padding: '48px 24px', textAlign: 'center', color: c.fgSubtle }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 18,
                      height: 18,
                      border: `2px solid ${c.border}`,
                      borderTopColor: c.accent,
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>Đang tải dữ liệu...</span>
                </div>
              </td>
            </tr>
          ) : (
            displayRows.map((row, ri) => (
              <TableRow key={ri} columns={columns} row={row} py={py} isLast={ri === displayRows.length - 1} />
            ))
          )}
        </tbody>
      </table>

      {!loading && tableRows.length === 0 && (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: c.fgSubtle, fontSize: 13.5 }}>
          {messageEmpty}
        </div>
      )}

      {!loading && pagination && tableRows.length > 0 && (
        <Pagination
          page={activePage}
          pageSize={activePageSize}
          totalItems={totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}

function TableRow({ columns, row, py, isLast }) {
  const { c } = useAdminTheme();
  const [hover, setHover] = useState(false);

  return (
    <tr
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? c.bgHover : 'transparent',
        transition: 'background .15s ease',
      }}
    >
      {columns.map((col, ci) => {
        const val = col.key ? row[col.key] : undefined;
        const content = col.render ? col.render(row, val) : val;

        return (
          <td
            key={ci}
            style={{
              textAlign: col.align || 'left',
              padding: `${py}px 18px`,
              fontSize: 13.5,
              color: c.fg,
              borderBottom: isLast ? 'none' : `1px solid ${c.borderSub}`,
              whiteSpace: col.wrap ? 'normal' : 'nowrap',
            }}
          >
            {content}
          </td>
        );
      })}
    </tr>
  );
}
