// Charts — bộ biểu đồ SVG nhẹ, không phụ thuộc thư viện ngoài.
//  • Sparkline   — đường nhỏ trong KPI
//  • AreaChart   — đường + vùng tô, có trục, hover tooltip
//  • BarChart    — cột
//  • Donut       — vành tròn + chú thích
// Tất cả nhận màu/định dạng qua props, đọc token từ useAdminTheme.

import { useState } from 'react';
import { useAdminTheme } from '../../context/ThemeContext';

// ---- Sparkline ----
export function Sparkline({ data = [], color, w = 200, h = 40 }) {
  const { c } = useAdminTheme();
  if (!data || data.length === 0) return null;

  const stroke = color || c.accent;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => [
    (i / (data.length - 1 || 1)) * w,
    h - ((v - min) / (max - min || 1)) * (h - 4) - 2,
  ]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = line + ` L${w} ${h} L0 ${h} Z`;
  const gid = 'spark-' + stroke.replace(/\W/g, '');

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="1" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ---- AreaChart (đường mượt + vùng tô + hover tooltip) ----
export function AreaChart({ data = [], labels = [], color, h = 240 }) {
  const { c, fonts } = useAdminTheme();
  const [hoverIdx, setHoverIdx] = useState(null);

  const stroke = color || c.accent;
  const w = 780;
  const padL = 52, padR = 18, padB = 38, padT = 22;
  const cw = w - padL - padR;
  const ch = h - padB - padT;

  const rawMax = Math.max(0, ...data);
  const max = rawMax > 0 ? rawMax * 1.15 : 1;

  const x = (i) =>
    padL + (data.length > 1 ? (i / (data.length - 1)) * cw : cw / 2);
  const y = (v) => padT + ch - (v / max) * ch;

  const buildSmoothPath = (pts) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M${pts[0][0]} ${pts[0][1]}`;
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    const t = 0.5;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const c1x = p1[0] + ((p2[0] - p0[0]) * t) / 3;
      const c1y = p1[1] + ((p2[1] - p0[1]) * t) / 3;
      const c2x = p2[0] - ((p3[0] - p1[0]) * t) / 3;
      const c2y = p2[1] - ((p3[1] - p1[1]) * t) / 3;
      d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d;
  };

  const points = data.map((v, i) => [x(i), y(v)]);
  const line = buildSmoothPath(points);
  const area =
    data.length > 0
      ? `${line} L${x(data.length - 1).toFixed(1)} ${(padT + ch).toFixed(1)} L${padL.toFixed(1)} ${(padT + ch).toFixed(1)} Z`
      : '';

  const ticks = 4;
  let peakIdx = 0;
  for (let i = 1; i < data.length; i++) if (data[i] > data[peakIdx]) peakIdx = i;

  const uid = stroke.replace(/\W/g, '');
  const gFill = `area-fill-${uid}`;
  const gShine = `area-shine-${uid}`;

  const fmt = (v) =>
    Number(v).toLocaleString('vi-VN', { maximumFractionDigits: 1 });

  const handleMove = (e) => {
    if (data.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * w;
    if (relX < padL - 4 || relX > padL + cw + 4) {
      setHoverIdx(null);
      return;
    }
    const idx =
      data.length > 1
        ? Math.round(((relX - padL) / cw) * (data.length - 1))
        : 0;
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  };

  const tooltipLeftPct =
    hoverIdx !== null ? (x(hoverIdx) / w) * 100 : 0;

  return (
    <div style={{ position: 'relative' }}>
      <svg
        width="100%"
        viewBox={`0 0 ${w} ${h}`}
        style={{ display: 'block', overflow: 'visible' }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={gFill} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={stroke} stopOpacity="0.42" />
            <stop offset="0.55" stopColor={stroke} stopOpacity="0.14" />
            <stop offset="1" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={gShine} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.10" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Lưới ngang */}
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const v = (max / ticks) * i;
          const yy = y(v);
          return (
            <g key={`grid-${i}`}>
              <line
                x1={padL}
                y1={yy}
                x2={w - padR}
                y2={yy}
                stroke={c.borderSub}
                strokeWidth="1"
                strokeDasharray={i === 0 ? '0' : '3 4'}
              />
              <text
                x={padL - 10}
                y={yy + 3.5}
                textAnchor="end"
                fontSize="10.5"
                fill={c.fgFaint}
                fontFamily={fonts.body}
              >
                {fmt(v)}
              </text>
            </g>
          );
        })}

        {area && <path d={area} fill={`url(#${gFill})`} />}
        {area && <path d={area} fill={`url(#${gShine})`} />}

        {line && (
          <path
            d={line}
            fill="none"
            stroke={stroke}
            strokeWidth="7"
            opacity="0.18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {line && (
          <path
            d={line}
            fill="none"
            stroke={stroke}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {data.length > 0 && rawMax > 0 && (
          <g>
            <circle
              cx={x(peakIdx)}
              cy={y(data[peakIdx])}
              r="7"
              fill={stroke}
              opacity="0.22"
            />
            <circle
              cx={x(peakIdx)}
              cy={y(data[peakIdx])}
              r="3.4"
              fill={c.bgCard}
              stroke={stroke}
              strokeWidth="2"
            />
          </g>
        )}

        {labels.map((l, i) => (
          <text
            key={`lab-${i}`}
            x={x(i)}
            y={h - 10}
            textAnchor="middle"
            fontSize="10.5"
            fill={hoverIdx === i ? c.accent : c.fgFaint}
            fontWeight={hoverIdx === i ? 700 : 400}
            fontFamily={fonts.body}
          >
            {l}
          </text>
        ))}

        {hoverIdx !== null && data[hoverIdx] != null && (
          <g>
            <line
              x1={x(hoverIdx)}
              y1={padT}
              x2={x(hoverIdx)}
              y2={padT + ch}
              stroke={stroke}
              strokeWidth="1"
              strokeDasharray="3 4"
              opacity="0.55"
            />
            <circle
              cx={x(hoverIdx)}
              cy={y(data[hoverIdx])}
              r="9"
              fill={stroke}
              opacity="0.18"
            />
            <circle
              cx={x(hoverIdx)}
              cy={y(data[hoverIdx])}
              r="4.2"
              fill={stroke}
              stroke={c.bgCard}
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {hoverIdx !== null && data[hoverIdx] != null && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltipLeftPct}%`,
            top: 0,
            transform: 'translate(-50%, -6px)',
            padding: '7px 12px',
            background: c.bgCard,
            color: c.fg,
            border: `1px solid ${c.border}`,
            borderRadius: 6,
            boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
            fontFamily: fonts.body,
            fontSize: 12,
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <div
            style={{
              color: c.fgSubtle,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            {labels[hoverIdx]}
          </div>
          <div
            style={{
              marginTop: 2,
              color: stroke,
              fontSize: 15,
              fontWeight: 800,
            }}
          >
            {fmt(data[hoverIdx])}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- BarChart ----
export function BarChart({ data = [], color, h = 200, max: maxProp }) {
  const { c, fonts } = useAdminTheme();
  if (!data || data.length === 0) return null;

  const fill = color || c.accent;
  const w = 420, padB = 26, padT = 8, gap = 14;
  const max = maxProp || Math.max(...data.map((d) => d.v || 0)) * 1.15 || 1;
  const bw = (w - gap * (data.length - 1)) / data.length;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {data.map((d, i) => {
        const bh = ((d.v || 0) / max) * (h - padB - padT);
        const xx = i * (bw + gap);
        return (
          <g key={i}>
            <rect x={xx} y={h - padB - bh} width={bw} height={bh} rx="2" fill={fill} opacity={0.32 + 0.6 * ((d.v || 0) / max)} />
            <text x={xx + bw / 2} y={h - padB - bh - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill={c.fgMuted} fontFamily={fonts.body}>
              {d.v}
            </text>
            <text x={xx + bw / 2} y={h - 8} textAnchor="middle" fontSize="11" fill={c.fgFaint} fontFamily={fonts.body}>
              {d.d}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---- Donut ----
export function Donut({ data = [], size = 170, thickness = 26 }) {
  const { c } = useAdminTheme();
  const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1;
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const C = 2 * Math.PI * r;
  const segments = data.map((d, i) => {
    const val = d.value || 0;
    const len = (val / total) * C;
    const offset = data.slice(0, i).reduce((sum, item) => sum + ((item.value || 0) / total) * C, 0);
    return { ...d, len, offset };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
        {segments.map((d, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={d.color || c.accent}
            strokeWidth={thickness}
            strokeDasharray={`${d.len} ${C - d.len}`}
            strokeDashoffset={-d.offset}
          />
        ))}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: d.color || c.accent }} />
            <span style={{ fontSize: 12.5, color: c.fgMuted, minWidth: 96 }}>{d.label}</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: c.fg }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
