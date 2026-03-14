/**
 * RankBadge — Patentes do Exército Brasileiro com insignias SVG
 * Todas as patentes oficiais com seus símbolos visuais corretos.
 */

export const RANKS = [
  // ── Praças ──────────────────────────────────────────────
  { key: 'Recruta',          group: 'Praças',              abbr: 'Rec',  color: '#9AA5B8', dark: false },
  { key: 'Soldado',          group: 'Praças',              abbr: 'Sd',   color: '#7EB87A', dark: false },
  { key: 'Cabo',             group: 'Praças',              abbr: 'Cb',   color: '#6EBF48', dark: false },
  { key: '3º Sargento',      group: 'Praças',              abbr: '3ºSgt',color: '#C9A227', dark: false },
  { key: '2º Sargento',      group: 'Praças',              abbr: '2ºSgt',color: '#C9A227', dark: false },
  { key: '1º Sargento',      group: 'Praças',              abbr: '1ºSgt',color: '#C9A227', dark: false },
  { key: 'Subtenente',       group: 'Praças',              abbr: 'ST',   color: '#E8C040', dark: false },
  // ── Oficiais Subalternos ─────────────────────────────────
  { key: 'Aspirante',        group: 'Oficiais Subalternos',abbr: 'Asp',  color: '#C8AA20', dark: false },
  { key: '2º Tenente',       group: 'Oficiais Subalternos',abbr: '2ºTen',color: '#C9A227', dark: false },
  { key: '1º Tenente',       group: 'Oficiais Subalternos',abbr: '1ºTen',color: '#C9A227', dark: false },
  // ── Oficiais Intermediários ──────────────────────────────
  { key: 'Capitão',          group: 'Oficiais Intermediários',abbr: 'Cap',color: '#D4A820', dark: false },
  // ── Oficiais Superiores ──────────────────────────────────
  { key: 'Major',            group: 'Oficiais Superiores', abbr: 'Maj',  color: '#D4A820', dark: false },
  { key: 'Tenente-Coronel',  group: 'Oficiais Superiores', abbr: 'TC',   color: '#D4A820', dark: false },
  { key: 'Coronel',          group: 'Oficiais Superiores', abbr: 'Cel',  color: '#D4A820', dark: false },
  // ── Generais ─────────────────────────────────────────────
  { key: 'General de Brigada', group: 'Generais',          abbr: 'GB',   color: '#1C1C1C', dark: true },
  { key: 'General de Divisão', group: 'Generais',          abbr: 'GD',   color: '#1C1C1C', dark: true },
  { key: 'General de Exército',group: 'Generais',          abbr: 'GEx',  color: '#1C1C1C', dark: true },
  { key: 'Marechal',           group: 'Generais',          abbr: 'Mar',  color: '#8B0000', dark: true },
  // ── Cargo Máximo ─────────────────────────────────────────
  { key: 'Comandante',         group: 'Cargo Máximo',      abbr: 'Cmdt', color: '#1C1C1C', dark: true },
];

export const RANK_MAP = Object.fromEntries(RANKS.map(r => [r.key, r]));

// Rank groups for display
export const RANK_GROUPS = ['Praças', 'Oficiais Subalternos', 'Oficiais Intermediários', 'Oficiais Superiores', 'Generais', 'Cargo Máximo'];

// ── SVG Insignia ─────────────────────────────────────────────────────────────
// Each function returns an SVG element

function Star({ cx, cy, r = 5, fill = '#C9A227', stroke = 'none' }) {
  // 5-pointed star path
  const pts = [];
  for (let i = 0; i < 5; i++) {
    const outerAngle = (i * 72 - 90) * Math.PI / 180;
    const innerAngle = ((i * 72 + 36) - 90) * Math.PI / 180;
    pts.push(`${cx + r * Math.cos(outerAngle)},${cy + r * Math.sin(outerAngle)}`);
    pts.push(`${cx + r * 0.4 * Math.cos(innerAngle)},${cy + r * 0.4 * Math.sin(innerAngle)}`);
  }
  return <polygon points={pts.join(' ')} fill={fill} stroke={stroke} strokeWidth="0.5" />;
}

function Chevron({ y, fill = '#C9A227' }) {
  return <path d={`M 4 ${y+6} L 16 ${y} L 28 ${y+6}`} fill="none" stroke={fill} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />;
}

function DiamondShape({ cx, cy, size = 5, fill = '#C9A227' }) {
  return <polygon points={`${cx},${cy-size} ${cx+size*0.7},${cy} ${cx},${cy+size} ${cx-size*0.7},${cy}`} fill={fill} />;
}

function Sword({ x, y, fill = '#C9A227' }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="-1" y="-9" width="2" height="14" rx="1" fill={fill} />
      <polygon points="0,-12 -1.5,-9 1.5,-9" fill={fill} />
      <rect x="-4" y="3" width="8" height="1.5" rx="0.7" fill={fill} />
      <rect x="-0.8" y="5" width="1.6" height="3" rx="0.7" fill={fill} />
    </g>
  );
}

function Leaf({ cx, cy, angle = 0, fill = '#C9A227' }) {
  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle})`}>
      <ellipse rx="3.5" ry="6" fill={fill} />
      <line x1="0" y1="-5" x2="0" y2="5" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />
    </g>
  );
}

function Baton({ cx, cy, fill = '#1C1C1C' }) {
  // Marechal baton shape
  return (
    <g>
      <rect x={cx-2} y={cy-9} width="4" height="14" rx="2" fill={fill} />
      <ellipse cx={cx} cy={cy-9} rx="3.5" ry="2" fill={fill} />
      <ellipse cx={cx} cy={cy+5} rx="3.5" ry="2" fill={fill} />
    </g>
  );
}

// ── Per-rank insignia renderers (32x32 canvas) ─────────────────────────────
const INSIGNIA = {
  'Recruta': () => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="7" fill="none" stroke="#9AA5B8" strokeWidth="1.5" strokeDasharray="3 2" />
    </svg>
  ),
  'Soldado': () => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="5" fill="#7EB87A" />
    </svg>
  ),
  'Cabo': () => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <Chevron y={14} fill="#6EBF48" />
    </svg>
  ),
  '3º Sargento': () => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <Chevron y={6}  fill="#C9A227" />
      <Chevron y={12} fill="#C9A227" />
      <Chevron y={18} fill="#C9A227" />
    </svg>
  ),
  '2º Sargento': () => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <Chevron y={4}  fill="#C9A227" />
      <Chevron y={10} fill="#C9A227" />
      <Chevron y={16} fill="#C9A227" />
      <Star cx={16} cy={28} r={4} fill="#C9A227" />
    </svg>
  ),
  '1º Sargento': () => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <Chevron y={3}  fill="#C9A227" />
      <Chevron y={9}  fill="#C9A227" />
      <Chevron y={15} fill="#C9A227" />
      <Star cx={11} cy={27} r={4} fill="#C9A227" />
      <Star cx={21} cy={27} r={4} fill="#C9A227" />
    </svg>
  ),
  'Subtenente': () => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <Chevron y={2}  fill="#E8C040" />
      <Chevron y={8}  fill="#E8C040" />
      <Chevron y={14} fill="#E8C040" />
      <Star cx={8}  cy={27} r={3.5} fill="#E8C040" />
      <Star cx={16} cy={27} r={3.5} fill="#E8C040" />
      <Star cx={24} cy={27} r={3.5} fill="#E8C040" />
    </svg>
  ),
  'Aspirante': () => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <DiamondShape cx={16} cy={16} size={8} fill="#C8AA20" />
    </svg>
  ),
  '2º Tenente': () => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <rect x="4" y="13" width="24" height="3" rx="1.5" fill="#C9A227" />
      <Star cx={16} cy={9} r={5} fill="#C9A227" />
    </svg>
  ),
  '1º Tenente': () => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <rect x="4" y="13" width="24" height="3" rx="1.5" fill="#C9A227" />
      <Star cx={10} cy={9} r={5} fill="#C9A227" />
      <Star cx={22} cy={9} r={5} fill="#C9A227" />
    </svg>
  ),
  'Capitão': () => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <rect x="4" y="14" width="24" height="3" rx="1.5" fill="#D4A820" />
      <Star cx={7}  cy={9} r={4.5} fill="#D4A820" />
      <Star cx={16} cy={9} r={4.5} fill="#D4A820" />
      <Star cx={25} cy={9} r={4.5} fill="#D4A820" />
    </svg>
  ),
  'Major': () => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <rect x="4" y="13" width="24" height="3" rx="1.5" fill="#D4A820" />
      <rect x="4" y="19" width="24" height="3" rx="1.5" fill="#D4A820" />
      <Sword x={16} y={16} fill="#D4A820" />
    </svg>
  ),
  'Tenente-Coronel': () => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <rect x="4" y="11" width="24" height="3" rx="1.5" fill="#D4A820" />
      <rect x="4" y="17" width="24" height="3" rx="1.5" fill="#D4A820" />
      <Leaf cx={10} cy={5} angle={-15} fill="#D4A820" />
      <Leaf cx={22} cy={5} angle={15}  fill="#D4A820" />
    </svg>
  ),
  'Coronel': () => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <rect x="4" y="12" width="24" height="2.5" rx="1.2" fill="#D4A820" />
      <rect x="4" y="17" width="24" height="2.5" rx="1.2" fill="#D4A820" />
      <Leaf cx={8}  cy={6} angle={-20} fill="#D4A820" />
      <Leaf cx={16} cy={4} angle={0}   fill="#D4A820" />
      <Leaf cx={24} cy={6} angle={20}  fill="#D4A820" />
    </svg>
  ),
  'General de Brigada': () => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <Star cx={16} cy={16} r={9} fill="#1C1C1C" stroke="#555" />
    </svg>
  ),
  'General de Divisão': () => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <Star cx={8}  cy={16} r={7} fill="#1C1C1C" stroke="#555" />
      <Star cx={24} cy={16} r={7} fill="#1C1C1C" stroke="#555" />
    </svg>
  ),
  'General de Exército': () => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <Star cx={5}  cy={19} r={6} fill="#1C1C1C" stroke="#555" />
      <Star cx={16} cy={13} r={6} fill="#1C1C1C" stroke="#555" />
      <Star cx={27} cy={19} r={6} fill="#1C1C1C" stroke="#555" />
    </svg>
  ),
  'Marechal': () => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      {[3,8,13,18,23].map((x,i) => <Star key={i} cx={x+3} cy={16} r={4.5} fill="#8B0000" stroke="#FF000044" />)}
    </svg>
  ),
  'Comandante': () => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <Star cx={5}  cy={20} r={6} fill="#1C1C1C" stroke="#444" />
      <Star cx={16} cy={13} r={6} fill="#1C1C1C" stroke="#444" />
      <Star cx={27} cy={20} r={6} fill="#1C1C1C" stroke="#444" />
      {/* Espada cruzada acima */}
      <path d="M12,5 L20,5 M16,2 L16,8" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

// ── Main RankBadge component ─────────────────────────────────────────────────
export default function RankBadge({ rank, size = 'md', showLabel = true, inline = false }) {
  const info = RANK_MAP[rank];
  if (!info) return null;

  const IconComponent = INSIGNIA[rank] || (() => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="8" fill={info.color} />
    </svg>
  ));

  const sizes = {
    xs:  { iconSize: 16, fontSize: 9,  padding: '2px 6px',  gap: 4  },
    sm:  { iconSize: 20, fontSize: 10, padding: '3px 8px',  gap: 5  },
    md:  { iconSize: 26, fontSize: 12, padding: '4px 10px', gap: 7  },
    lg:  { iconSize: 36, fontSize: 14, padding: '6px 14px', gap: 10 },
    xl:  { iconSize: 48, fontSize: 17, padding: '8px 18px', gap: 12 },
  };
  const s = sizes[size] || sizes.md;

  const isGeneral = ['General de Brigada','General de Divisão','General de Exército','Marechal','Comandante'].includes(rank);
  const badgeBg = isGeneral
    ? 'rgba(28,28,28,0.15)'
    : info.color === '#1C1C1C' ? 'rgba(28,28,28,0.1)' : `${info.color}18`;
  const badgeBorder = isGeneral ? 'rgba(100,100,100,0.35)' : `${info.color}45`;

  if (inline) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: s.gap,
        padding: s.padding, borderRadius: 8,
        background: badgeBg, border: `1px solid ${badgeBorder}`,
        whiteSpace: 'nowrap',
      }}>
        <span style={{ width: s.iconSize, height: s.iconSize, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 32 32" width={s.iconSize} height={s.iconSize}>
            {/* Render inner content of INSIGNIA */}
            <InsigniaInner rank={rank} />
          </svg>
        </span>
        {showLabel && (
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: s.fontSize, color: isGeneral ? '#E8E8E8' : info.color, letterSpacing: '0.05em' }}>
            {rank}
          </span>
        )}
      </span>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    }}>
      <div style={{
        width: s.iconSize + 16, height: s.iconSize + 16,
        borderRadius: 10, background: badgeBg, border: `1.5px solid ${badgeBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 2px 10px ${badgeBorder}`,
      }}>
        <svg viewBox="0 0 32 32" width={s.iconSize} height={s.iconSize}>
          <InsigniaInner rank={rank} />
        </svg>
      </div>
      {showLabel && (
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: s.fontSize, color: isGeneral ? '#E8E8E8' : info.color, letterSpacing: '0.06em', textAlign: 'center', lineHeight: 1.2 }}>
          {rank}
        </span>
      )}
    </div>
  );
}

// ── Insignia inner SVG content (used inline in other SVGs) ───────────────────
export function InsigniaInner({ rank }) {
  const g = INSIGNIA[rank];
  if (!g) return null;
  // Extract children from the SVG element returned
  const element = g();
  return <>{element.props.children}</>;
}

// ── Compact rank chip for lists/tables ───────────────────────────────────────
export function RankChip({ rank, size = 'sm' }) {
  const info = RANK_MAP[rank];
  if (!info) return <span style={{ fontSize: 11, color: 'var(--white-faint)' }}>{rank || '—'}</span>;
  const isGeneral = ['General de Brigada','General de Divisão','General de Exército','Marechal','Comandante'].includes(rank);
  const iconSize = size === 'xs' ? 14 : size === 'sm' ? 18 : 24;
  const fontSize = size === 'xs' ? 9 : size === 'sm' ? 11 : 13;
  const badgeBg = isGeneral ? 'rgba(50,50,50,0.3)' : `${info.color}18`;
  const badgeBorder = isGeneral ? 'rgba(100,100,100,0.3)' : `${info.color}40`;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 6,
      background: badgeBg, border: `1px solid ${badgeBorder}`,
      whiteSpace: 'nowrap',
    }}>
      <svg viewBox="0 0 32 32" width={iconSize} height={iconSize}>
        <InsigniaInner rank={rank} />
      </svg>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize, color: isGeneral ? '#D0D0D0' : info.color, letterSpacing: '0.04em' }}>
        {rank}
      </span>
    </span>
  );
}

// ── Rank selector grid for admin forms ───────────────────────────────────────
export function RankSelector({ value, onChange }) {
  const groups = RANK_GROUPS;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {groups.map(group => {
        const groupRanks = RANKS.filter(r => r.group === group);
        if (!groupRanks.length) return null;
        return (
          <div key={group}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--white-faint)', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 2 }}>
              // {group}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {groupRanks.map(r => {
                const isSelected = value === r.key;
                const isGeneral = ['General de Brigada','General de Divisão','General de Exército','Marechal','Comandante'].includes(r.key);
                return (
                  <button key={r.key} type="button" onClick={() => onChange(r.key)}
                    title={r.key}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '6px 11px', borderRadius: 8, cursor: 'pointer',
                      border: `1.5px solid ${isSelected ? (isGeneral ? '#888' : r.color) : 'var(--border)'}`,
                      background: isSelected ? (isGeneral ? 'rgba(80,80,80,0.25)' : `${r.color}1A`) : 'transparent',
                      color: isSelected ? (isGeneral ? '#D0D0D0' : r.color) : 'var(--white-dim)',
                      transition: 'all 0.15s',
                      boxShadow: isSelected ? `0 0 0 2px ${isGeneral ? '#55555555' : r.color + '33'}` : 'none',
                    }}>
                    <svg viewBox="0 0 32 32" width="18" height="18">
                      <InsigniaInner rank={r.key} />
                    </svg>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                      {r.key}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
