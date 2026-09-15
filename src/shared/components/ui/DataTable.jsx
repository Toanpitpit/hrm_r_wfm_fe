// DataTable — bảng dữ liệu dùng chung.
// columns: [{ label | title, key?, render?(row, val), align?, w | width?, wrap? }]
// rows / data: mảng object dữ liệu.
// density: 'compact' | 'regular' | 'comfy' (điều chỉnh padding dọc).

import { useState } from 'react';
import { useAdminTheme } from '../../context/ThemeContext';

export default function DataTable({ columns = [], rows, data, density = 'regular', emptyText }) {
  const { c, fonts } = useAdminTheme();
  const py = density === 'compact' ? 10 : density === 'comfy' ? 18 : 14;
  const tableRows = rows || data || [];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: fonts.body }}>
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
                }}
              >
                {col.label || col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, ri) => (
            <TableRow key={ri} columns={columns} row={row} py={py} />
          ))}
        </tbody>
      </table>
      {tableRows.length === 0 && (
        <div style={{ padding: 48, textAlign: 'center', color: c.fgFaint, fontSize: 13.5, fontWeight: 500 }}>
          {emptyText || 'Không có dữ liệu phù hợp.'}
        </div>
      )}
    </div>
  );
}

function TableRow({ columns, row, py }) {
  const { c } = useAdminTheme();
  const [hover, setHover] = useState(false);

  return (
    <tr
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? c.bgHover : 'transparent',
        transition: 'background .14s ease',
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
              color: c.fgMuted,
              borderBottom: `1px solid ${c.borderSub}`,
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
