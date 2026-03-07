// Military-themed SVG icons for C.H.D.I

export const ICON_LIST = [
  'music-note', 'military-star', 'trumpet', 'soldier-march',
  'shield', 'anchor', 'laurel', 'drum', 'bugle', 'medal',
  'flag', 'sword', 'eagle', 'crown', 'salute',
];

export function Icon({ name, size = 28, color = '#C9A227', ...props }) {
  const s = { width: size, height: size, fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', ...props };

  switch (name) {
    case 'music-note': return (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
      </svg>
    );
    case 'military-star': return (
      <svg viewBox="0 0 24 24" {...s}>
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    );
    case 'trumpet': return (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M3 10h2l2-4h3l1 4h2c1.5 0 2.5.8 3 2l2 2c.5.5.5 1.5 0 2l-1 1c-.5.5-1.5.5-2 0l-1-1-6-2-3-4Z" />
        <circle cx="19" cy="17" r="2" />
        <path d="M5 10v4" />
      </svg>
    );
    case 'soldier-march': return (
      <svg viewBox="0 0 24 24" {...s}>
        <circle cx="12" cy="4" r="2" />
        <path d="M9 9h6l1 5h-2l1 6H9l1-6H8l1-5Z" />
        <path d="M8 14l-2 4M16 14l2 4" />
      </svg>
    );
    case 'shield': return (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    );
    case 'anchor': return (
      <svg viewBox="0 0 24 24" {...s}>
        <circle cx="12" cy="5" r="3" /><line x1="12" y1="22" x2="12" y2="8" />
        <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
      </svg>
    );
    case 'laurel': return (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M4 8c0 0 2-4 6-4s6 4 6 4" />
        <path d="M20 8c0 0-2-4-6-4" />
        <path d="M4 16c0 0 2 4 6 4s6-4 6-4" />
        <path d="M20 16c0 0-2 4-6 4" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    );
    case 'drum': return (
      <svg viewBox="0 0 24 24" {...s}>
        <ellipse cx="12" cy="8" rx="9" ry="4" /><path d="M3 8v8c0 2 4 4 9 4s9-2 9-4V8" />
        <line x1="9" y1="4" x2="6" y2="18" /><line x1="15" y1="4" x2="18" y2="18" />
      </svg>
    );
    case 'bugle': return (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M3 15l4-8h2l6 8" /><path d="M9 7h3l5 6 3-3" />
        <circle cx="17" cy="16" r="2" />
      </svg>
    );
    case 'medal': return (
      <svg viewBox="0 0 24 24" {...s}>
        <circle cx="12" cy="15" r="6" />
        <path d="M9 3h6l-2 6H11L9 3Z" />
        <line x1="12" y1="9" x2="12" y2="12" />
        <path d="M10 15l2 2 2-2" />
      </svg>
    );
    case 'flag': return (
      <svg viewBox="0 0 24 24" {...s}>
        <line x1="4" y1="3" x2="4" y2="21" />
        <path d="M4 3h16l-3 7 3 7H4" />
      </svg>
    );
    case 'sword': return (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
        <path d="M13 19l6-6" /><path d="M2 15l7-7" />
        <path d="M19 21l2-2" />
      </svg>
    );
    case 'eagle': return (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M12 3C8 5 3 8 3 13c0 3 2 5 5 6" />
        <path d="M12 3c4 2 9 5 9 10 0 3-2 5-5 6" />
        <path d="M8 19c1 1 2.5 2 4 2s3-1 4-2" />
        <path d="M12 3v16" />
        <path d="M6 10l6 2 6-2" />
      </svg>
    );
    case 'crown': return (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M2 19h20M2 19l3-10 4.5 5L12 5l2.5 9L19 9l3 10" />
      </svg>
    );
    case 'salute': return (
      <svg viewBox="0 0 24 24" {...s}>
        <circle cx="12" cy="4" r="2" />
        <path d="M9 9l3 1 3-1" />
        <path d="M12 10v6" />
        <path d="M9 16l-2 4M15 16l2 4" />
        <path d="M12 7l4-2" />
      </svg>
    );
    default: return (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
      </svg>
    );
  }
}

export function IconPreview({ iconName, colorKey = 'green', size = 32 }) {
  const bgMap = { green: 'icon-bg-green', gold: 'icon-bg-gold', olive: 'icon-bg-olive', 'dark-green': 'icon-bg-dark-green' };
  const colorMap = { green: '#86c645', gold: '#C9A227', olive: '#aab830', 'dark-green': '#4A8020', red: '#e05252', blue: '#5285e0' };
  return (
    <div style={{ width: 56, height: 56, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className={bgMap[colorKey] || 'icon-bg-green'}>
      <Icon name={iconName} size={size} color={colorMap[colorKey] || '#86c645'} />
    </div>
  );
}
