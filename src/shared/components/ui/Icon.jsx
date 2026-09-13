// Icon — bộ icon SVG stroke tối giản dùng chung cho dashboard.
// Dùng: <Icon name="grid" size={18} color="#f5b14a" />

export default function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.7 }) {
  const p = { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };

  const paths = {
    grid: <><rect x="2.5" y="2.5" width="6" height="6" {...p} /><rect x="11.5" y="2.5" width="6" height="6" {...p} /><rect x="2.5" y="11.5" width="6" height="6" {...p} /><rect x="11.5" y="11.5" width="6" height="6" {...p} /></>,
    home: <><path d="M3 9.5L10 3l7 6.5" {...p} /><path d="M5 8.5V17h4.2v-5h1.6v5H15V8.5" {...p} /></>,
    building: <><rect x="3.5" y="2.5" width="13" height="15" {...p} /><path d="M7 6h2M11 6h2M7 9.5h2M11 9.5h2M7 13h2M11 13h2" {...p} /></>,
    users: <><circle cx="7" cy="6.5" r="2.6" {...p} /><path d="M2.5 16.5c0-2.8 2-4.5 4.5-4.5s4.5 1.7 4.5 4.5" {...p} /><path d="M13 4.5a2.4 2.4 0 010 4.5M14 12.2c1.8.4 3.2 1.8 3.2 4.3" {...p} /></>,
    film: <><rect x="2.5" y="3.5" width="15" height="13" rx="1.5" {...p} /><path d="M6.5 3.5v13M13.5 3.5v13M2.5 8h4M13.5 8h4M2.5 12h4M13.5 12h4" {...p} /></>,
    popcorn: <><path d="M5 7l1.2 10.5h7.6L15 7" {...p} /><path d="M4 7a2 2 0 012-2 2.2 2.2 0 014-.6A2.2 2.2 0 0118 6.5 2 2 0 0116 7z" {...p} /></>,
    tag: <><path d="M3 3.5h6.5L17 11l-6 6L3.5 9.5z" {...p} /><circle cx="6.7" cy="6.7" r="1.1" {...p} /></>,
    seat: <><path d="M4 8.5V5.5A1.5 1.5 0 015.5 4h9A1.5 1.5 0 0116 5.5v3" {...p} /><path d="M3 8.5h14l-.6 5H3.6zM5 13.5v3M15 13.5v3" {...p} /></>,
    chart: <><path d="M3 3v14h14" {...p} /><path d="M6.5 13l3-4 3 2.5 4-6" {...p} /></>,
    inbox: <><path d="M3 11l2.2-6.5A1.5 1.5 0 016.6 3.5h6.8a1.5 1.5 0 011.4 1L17 11v4.5A1.5 1.5 0 0115.5 17h-11A1.5 1.5 0 013 15.5z" {...p} /><path d="M3 11h4l1.2 2h3.6L13 11h4" {...p} /></>,
    layers: <><path d="M10 2.5L18 7l-8 4.5L2 7z" {...p} /><path d="M2 11l8 4.5L18 11" {...p} /></>,
    pulse: <><path d="M2 10h4l2-5 3 10 2-5h5" {...p} /></>,
    search: <><circle cx="8.5" cy="8.5" r="5.5" {...p} /><path d="M13 13l4 4" {...p} /></>,
    bell: <><path d="M5.5 8a4.5 4.5 0 019 0c0 4 1.5 5 1.5 5H4s1.5-1 1.5-5" {...p} /><path d="M8.5 16.5a1.7 1.7 0 003 0" {...p} /></>,
    plus: <><path d="M10 4v12M4 10h12" {...p} /></>,
    edit: <><path d="M13.5 3.5l3 3L7 16l-3.5.8L4.3 13z" {...p} /></>,
    trash: <><path d="M4 5.5h12M8 5.5V4h4v1.5M5.5 5.5l.8 11h7.4l.8-11" {...p} /></>,
    eye: <><path d="M1.5 10S5 4.5 10 4.5 18.5 10 18.5 10 15 15.5 10 15.5 1.5 10 1.5 10z" {...p} /><circle cx="10" cy="10" r="2.4" {...p} /></>,
    play: <path d="M7 5.2v9.6l7.5-4.8z" fill={color} stroke="none" />,
    more: <><circle cx="5" cy="10" r="1.25" fill={color} stroke="none" /><circle cx="10" cy="10" r="1.25" fill={color} stroke="none" /><circle cx="15" cy="10" r="1.25" fill={color} stroke="none" /></>,
    lock: <><rect x="4" y="8.5" width="12" height="8" rx="1.3" {...p} /><path d="M6.5 8.5V6a3.5 3.5 0 017 0v2.5" {...p} /></>,
    unlock: <><rect x="4" y="8.5" width="12" height="8" rx="1.3" {...p} /><path d="M6.5 8.5V6a3.5 3.5 0 016.9-.9" {...p} /></>,
    check: <><path d="M3.5 10.5l4 4 9-9" {...p} /></>,
    x: <><path d="M5 5l10 10M15 5L5 15" {...p} /></>,
    chevron: <><path d="M7 4l6 6-6 6" {...p} /></>,
    filter: <><path d="M3 5h14M6 10h8M8.5 15h3" {...p} /></>,
    download: <><path d="M10 3v9M6 8.5l4 4 4-4M4 16h12" {...p} /></>,
    calendar: <><rect x="3" y="4.5" width="14" height="12" rx="1.4" {...p} /><path d="M3 8h14M7 2.5v3M13 2.5v3" {...p} /></>,
    money: <><rect x="2.5" y="5" width="15" height="10" rx="1.4" {...p} /><circle cx="10" cy="10" r="2.4" {...p} /><path d="M5 7.5v5M15 7.5v5" {...p} /></>,
    ticket: <><path d="M3 6.5A1.5 1.5 0 014.5 5h11A1.5 1.5 0 0117 6.5V8a1.5 1.5 0 000 4v1.5A1.5 1.5 0 0115.5 15h-11A1.5 1.5 0 013 13.5V12a1.5 1.5 0 000-4z" {...p} /><path d="M12 5v10" {...p} strokeDasharray="1.5 2" /></>,
    logout: <><path d="M8 17H4.5A1.5 1.5 0 013 15.5v-11A1.5 1.5 0 014.5 3H8M13 13l3-3-3-3M16 10H7" {...p} /></>,
    menu: <><path d="M3 5h14M3 10h14M3 15h14" {...p} /></>,
    screen: <><rect x="2.5" y="4.5" width="15" height="8" {...p} /><path d="M5 16h10" {...p} /><path d="M10 12.5V16" {...p} /></>,
    dot: <circle cx="10" cy="10" r="2.5" fill={color} stroke="none" />,
    'map-pin': <><path d="M10 2.5a5.5 5.5 0 015.5 5.5c0 4.2-5.5 9.5-5.5 9.5S4.5 12.2 4.5 8A5.5 5.5 0 0110 2.5z" {...p} /><circle cx="10" cy="8" r="2" {...p} /></>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ display: 'block', flexShrink: 0 }}>
      {paths[name] || paths.dot}
    </svg>
  );
}
