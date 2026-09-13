// DataTable — bảng dữ liệu dùng chung.
// columns: [{ label, key?, render?(row), align?, w?, wrap? }]
// rows:    mảng object dữ liệu.
// density: 'compact' | 'regular' | 'comfy' (điều chỉnh padding dọc).

import { useState } from 'react';
import { useAdminTheme } from '../../context/ThemeContext';

export default function DataTable({ columns, rows = [], density = 'regular' }) {
  const { c, fonts } = useAdminTheme();
  const py = density === 'compact' ? 9 : density === 'comfy' ? 17 : 13;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: fonts.body }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                style={{
                  textAlign: col.align || 'left',
                  padding: '11px 16px',
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: c.fgFaint,
                  borderBottom: `1px solid ${c.border}`,
                  whiteSpace: 'nowrap',
                  width: col.w,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <TableRow key={ri} columns={columns} row={row} py={py} />
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: c.fgFaint, fontSize: 13 }}>
          Không có dữ liệu phù hợp.
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
      style={{ background: hover ? c.bgHover : 'transparent', transition: 'background .12s' }}
    >
      {columns.map((col, ci) => (
        <td
          key={ci}
          style={{
            textAlign: col.align || 'left',
            padding: `${py}px 16px`,
            fontSize: 13,
            color: c.fgMuted,
            borderBottom: `1px solid ${c.borderSub}`,
            whiteSpace: col.wrap ? 'normal' : 'nowrap',
          }}
        >
          {col.render ? col.render(row) : row[col.key]}
        </td>
      ))}
    </tr>
  );
}
