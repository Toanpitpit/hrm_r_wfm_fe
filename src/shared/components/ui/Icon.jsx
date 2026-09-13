// Icon — bộ icon SVG stroke tối giản dùng chung cho dashboard.
// Dùng: <Icon name="grid" size={18} color="#f5b14a" />

export default function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.7 }) {
  const p = { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };

  const paths = {
    grid: <><rect x="2.5" y="2.5" width="6" height="6" {...p} /><rect x="11.5" y="2.5" width="6" height="6" {...p} /><rect x="2.5" y="11.5" width="6" height="6" {...p} /><rect x="11.5" y="11.5" width="6" height="6" {...p} /></>,
    dashboard: <><rect x="2.5" y="2.5" width="6" height="6" {...p} /><rect x="11.5" y="2.5" width="6" height="6" {...p} /><rect x="2.5" y="11.5" width="6" height="6" {...p} /><rect x="11.5" y="11.5" width="6" height="6" {...p} /></>,
    home: <><path d="M3 9.5L10 3l7 6.5" {...p} /><path d="M5 8.5V17h4.2v-5h1.6v5H15V8.5" {...p} /></>,
    building: <><rect x="3.5" y="2.5" width="13" height="15" {...p} /><path d="M7 6h2M11 6h2M7 9.5h2M11 9.5h2M7 13h2M11 13h2" {...p} /></>,
    pin: <><path d="M10 2.5a5.5 5.5 0 015.5 5.5c0 4.2-5.5 9.5-5.5 9.5S4.5 12.2 4.5 8A5.5 5.5 0 0110 2.5z" {...p} /><circle cx="10" cy="8" r="2" {...p} /></>,
    'map-pin': <><path d="M10 2.5a5.5 5.5 0 015.5 5.5c0 4.2-5.5 9.5-5.5 9.5S4.5 12.2 4.5 8A5.5 5.5 0 0110 2.5z" {...p} /><circle cx="10" cy="8" r="2" {...p} /></>,
    clock: <><circle cx="10" cy="10" r="7.5" {...p} /><path d="M10 6v4l2.5 2.5" {...p} /></>,
    calendar: <><rect x="3" y="4.5" width="14" height="12" rx="1.4" {...p} /><path d="M3 8h14M7 2.5v3M13 2.5v3" {...p} /></>,
    users: <><circle cx="7" cy="6.5" r="2.6" {...p} /><path d="M2.5 16.5c0-2.8 2-4.5 4.5-4.5s4.5 1.7 4.5 4.5" {...p} /><path d="M13 4.5a2.4 2.4 0 010 4.5M14 12.2c1.8.4 3.2 1.8 3.2 4.3" {...p} /></>,
    pulse: <><path d="M2 10h4l2-5 3 10 2-5h5" {...p} /></>,
    search: <><circle cx="8.5" cy="8.5" r="5.5" {...p} /><path d="M13 13l4 4" {...p} /></>,
    bell: <><path d="M5.5 8a4.5 4.5 0 019 0c0 4 1.5 5 1.5 5H4s1.5-1 1.5-5" {...p} /><path d="M8.5 16.5a1.7 1.7 0 003 0" {...p} /></>,
    plus: <><path d="M10 4v12M4 10h12" {...p} /></>,
    edit: <><path d="M13.5 3.5l3 3L7 16l-3.5.8L4.3 13z" {...p} /></>,
    trash: <><path d="M4 5.5h12M8 5.5V4h4v1.5M5.5 5.5l.8 11h7.4l.8-11" {...p} /></>,
    eye: <><path d="M1.5 10S5 4.5 10 4.5 18.5 10 18.5 10 15 15.5 10 15.5 1.5 10 1.5 10z" {...p} /><circle cx="10" cy="10" r="2.4" {...p} /></>,
    lock: <><rect x="4" y="8.5" width="12" height="8" rx="1.3" {...p} /><path d="M6.5 8.5V6a3.5 3.5 0 017 0v2.5" {...p} /></>,
    unlock: <><rect x="4" y="8.5" width="12" height="8" rx="1.3" {...p} /><path d="M6.5 8.5V6a3.5 3.5 0 016.9-.9" {...p} /></>,
    check: <><path d="M3.5 10.5l4 4 9-9" {...p} /></>,
    x: <><path d="M5 5l10 10M15 5L5 15" {...p} /></>,
    chevron: <><path d="M7 4l6 6-6 6" {...p} /></>,
    'chevron-right': <><path d="M7 4l6 6-6 6" {...p} /></>,
    'chevron-down': <><path d="M4 7l6 6 6-6" {...p} /></>,
    logout: <><path d="M8 17H4.5A1.5 1.5 0 013 15.5v-11A1.5 1.5 0 014.5 3H8M13 13l3-3-3-3M16 10H7" {...p} /></>,
    screen: <><rect x="2.5" y="4.5" width="15" height="8" rx="1" {...p} /><path d="M5 16h10" {...p} /><path d="M10 12.5V16" {...p} /></>,
    'alert-triangle': <><path d="M10 3.2L2.5 16.5h15L10 3.2z" {...p} /><path d="M10 8v4" {...p} /><circle cx="10" cy="14.5" r="0.8" fill={color} stroke="none" /></>,
    refresh: <><path d="M17.5 10a7.5 7.5 0 11-2.2-5.3L18 7" {...p} /><path d="M18 2.5V7h-4.5" {...p} /></>,
    dot: <circle cx="10" cy="10" r="2.5" fill={color} stroke="none" />,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ display: 'block', flexShrink: 0 }}>
      {paths[name] || paths.dot}
    </svg>
  );
}