// Military-themed SVG icons — C.H.D.I expanded icon set

export const ICON_LIST = [
  // Música
  'music-note', 'music-staff', 'trumpet', 'drum', 'bugle',
  // Militares
  'military-star', 'soldier-march', 'shield', 'salute', 'medal',
  'sword', 'rifle', 'helmet', 'epaulette', 'rank-chevron',
  // Simbologia
  'flag', 'eagle', 'crown', 'laurel', 'anchor',
  'torch', 'compass', 'target', 'binoculars', 'map-pin',
  // Vídeo / Instrução
  'video', 'play-circle', 'book-open', 'graduation', 'clipboard',
];

export const ICON_COLORS = ['green', 'gold', 'olive', 'dark-green', 'red', 'blue'];

export function Icon({ name, size = 28, color = '#C9A227', ...props }) {
  const s = { width: size, height: size, fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', ...props };
  switch (name) {
    case 'music-note':   return <svg viewBox="0 0 24 24" {...s}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
    case 'music-staff':  return <svg viewBox="0 0 24 24" {...s}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="3" y1="18" x2="21" y2="18"/><path d="M14 6v8l-3-1V5l3 1z"/><circle cx="11" cy="17" r="2"/></svg>;
    case 'trumpet':      return <svg viewBox="0 0 24 24" {...s}><path d="M3 10h2l2-4h3l1 4h2c1.5 0 2.5.8 3 2l2 2c.5.5.5 1.5 0 2l-1 1c-.5.5-1.5.5-2 0l-1-1-6-2-3-4Z"/><circle cx="19" cy="17" r="2"/><path d="M5 10v4"/></svg>;
    case 'drum':         return <svg viewBox="0 0 24 24" {...s}><ellipse cx="12" cy="8" rx="9" ry="4"/><path d="M3 8v8c0 2 4 4 9 4s9-2 9-4V8"/><line x1="9" y1="4" x2="6" y2="18"/><line x1="15" y1="4" x2="18" y2="18"/></svg>;
    case 'bugle':        return <svg viewBox="0 0 24 24" {...s}><path d="M3 15l4-8h2l6 8"/><path d="M9 7h3l5 6 3-3"/><circle cx="17" cy="16" r="2"/></svg>;
    case 'military-star':return <svg viewBox="0 0 24 24" {...s}><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>;
    case 'soldier-march':return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="4" r="2"/><path d="M9 9h6l1 5h-2l1 6H9l1-6H8l1-5Z"/><path d="M8 14l-2 4M16 14l2 4"/></svg>;
    case 'shield':       return <svg viewBox="0 0 24 24" {...s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M9 12l2 2 4-4"/></svg>;
    case 'salute':       return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="4" r="2"/><path d="M9 9l3 1 3-1"/><path d="M12 10v6"/><path d="M9 16l-2 4M15 16l2 4"/><path d="M12 7l4-2"/></svg>;
    case 'medal':        return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="15" r="6"/><path d="M9 3h6l-2 6H11L9 3Z"/><line x1="12" y1="9" x2="12" y2="12"/><path d="M10 15l2 2 2-2"/></svg>;
    case 'sword':        return <svg viewBox="0 0 24 24" {...s}><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M2 15l7-7"/><path d="M19 21l2-2"/></svg>;
    case 'rifle':        return <svg viewBox="0 0 24 24" {...s}><path d="M3 12h14l2-4h2"/><path d="M17 12v6"/><path d="M7 12V9h4v3"/><circle cx="5" cy="12" r="1" fill={color}/></svg>;
    case 'helmet':       return <svg viewBox="0 0 24 24" {...s}><path d="M5 11a7 7 0 0 1 14 0v2H5v-2z"/><path d="M3 13h18v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2z"/><path d="M9 17v2M15 17v2"/></svg>;
    case 'epaulette':    return <svg viewBox="0 0 24 24" {...s}><rect x="4" y="10" width="16" height="4" rx="2"/><path d="M7 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"/><line x1="8" y1="14" x2="8" y2="18"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="16" y1="14" x2="16" y2="18"/></svg>;
    case 'rank-chevron': return <svg viewBox="0 0 24 24" {...s}><polyline points="4,8 12,14 20,8"/><polyline points="4,13 12,19 20,13"/></svg>;
    case 'flag':         return <svg viewBox="0 0 24 24" {...s}><line x1="4" y1="3" x2="4" y2="21"/><path d="M4 3h16l-3 7 3 7H4"/></svg>;
    case 'eagle':        return <svg viewBox="0 0 24 24" {...s}><path d="M12 3C8 5 3 8 3 13c0 3 2 5 5 6"/><path d="M12 3c4 2 9 5 9 10 0 3-2 5-5 6"/><path d="M8 19c1 1 2.5 2 4 2s3-1 4-2"/><path d="M12 3v16"/><path d="M6 10l6 2 6-2"/></svg>;
    case 'crown':        return <svg viewBox="0 0 24 24" {...s}><path d="M2 19h20M2 19l3-10 4.5 5L12 5l2.5 9L19 9l3 10"/></svg>;
    case 'laurel':       return <svg viewBox="0 0 24 24" {...s}><path d="M4 8c0 0 2-4 6-4s6 4 6 4"/><path d="M20 8c0 0-2-4-6-4"/><path d="M4 16c0 0 2 4 6 4s6-4 6-4"/><path d="M20 16c0 0-2 4-6 4"/><line x1="12" y1="4" x2="12" y2="20"/></svg>;
    case 'anchor':       return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>;
    case 'torch':        return <svg viewBox="0 0 24 24" {...s}><path d="M8 16l-2 6h12l-2-6"/><rect x="9" y="12" width="6" height="4"/><path d="M10 12V9c0-2 1-4 2-5 1 1 2 3 2 5v3"/></svg>;
    case 'compass':      return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/></svg>;
    case 'target':       return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>;
    case 'binoculars':   return <svg viewBox="0 0 24 24" {...s}><circle cx="7" cy="15" r="4"/><circle cx="17" cy="15" r="4"/><path d="M11 15h2M7 9V6h4v3M17 9V6h-4v3"/></svg>;
    case 'map-pin':      return <svg viewBox="0 0 24 24" {...s}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
    case 'video':        return <svg viewBox="0 0 24 24" {...s}><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 8l-6 4 6 4V8z"/></svg>;
    case 'play-circle':  return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16" fill={color} stroke="none"/></svg>;
    case 'book-open':    return <svg viewBox="0 0 24 24" {...s}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
    case 'graduation':   return <svg viewBox="0 0 24 24" {...s}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
    case 'clipboard':    return <svg viewBox="0 0 24 24" {...s}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>;
    default: return <svg viewBox="0 0 24 24" {...s}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
  }
}

// ─── Mapa de ícones para o app Android (mesmo nome → drawable correspondente) ─
// O app usa drawables com prefixo ic_. Este mapa é usado pelo CategoryAdapter para
// selecionar programaticamente o drawable correto baseado no campo icon do banco.
export const ANDROID_ICON_MAP = {
  'music-note':    'ic_music_note',
  'music-staff':   'ic_music_note',
  'trumpet':       'ic_trumpet',
  'drum':          'ic_drum',
  'bugle':         'ic_bugle',
  'military-star': 'ic_military_star',
  'soldier-march': 'ic_soldier_march',
  'shield':        'ic_shield',
  'salute':        'ic_salute',
  'medal':         'ic_medal',
  'sword':         'ic_sword',
  'rifle':         'ic_rifle',
  'helmet':        'ic_helmet',
  'epaulette':     'ic_epaulette',
  'rank-chevron':  'ic_rank_chevron',
  'flag':          'ic_flag',
  'eagle':         'ic_eagle',
  'crown':         'ic_crown',
  'laurel':        'ic_laurel',
  'anchor':        'ic_anchor',
  'torch':         'ic_torch',
  'compass':       'ic_compass',
  'target':        'ic_target',
  'binoculars':    'ic_binoculars',
  'map-pin':       'ic_map_pin',
  'video':         'ic_video',
  'play-circle':   'ic_play',
  'book-open':     'ic_book_open',
  'graduation':    'ic_graduation',
  'clipboard':     'ic_clipboard',
};

export function IconPreview({ iconName, colorKey = 'green', size = 32 }) {
  const bgMap    = { green: 'icon-bg-green', gold: 'icon-bg-gold', olive: 'icon-bg-olive', 'dark-green': 'icon-bg-dark-green' };
  const colorMap = { green: '#86c645', gold: '#C9A227', olive: '#aab830', 'dark-green': '#4A8020', red: '#e05252', blue: '#5285e0' };
  return (
    <div style={{ width: 56, height: 56, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
         className={bgMap[colorKey] || 'icon-bg-green'}>
      <Icon name={iconName} size={size} color={colorMap[colorKey] || '#86c645'} />
    </div>
  );
}
