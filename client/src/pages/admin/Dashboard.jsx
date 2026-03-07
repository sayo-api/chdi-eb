import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

function StatCard({ label, value, color, icon }) {
  return (
    <div className="card" style={{ borderColor: `rgba(${color},0.25)`, flex: '1 1 160px', minWidth: 140 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white-dim)' }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `rgba(${color},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: `rgb(${color})`, letterSpacing: '0.05em' }}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ categories: 0, songs: 0 });
  const [recentSongs, setRecentSongs] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/songs/all')]).then(([cats, songs]) => {
      setStats({ categories: cats.data.categories.length, songs: songs.data.songs.length });
      setRecentSongs(songs.data.songs.slice(0, 5));
    }).catch(() => {});
  }, []);

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '0.1em', color: 'var(--white)', marginBottom: 6 }}>DASHBOARD</h2>
      <p style={{ color: 'var(--white-dim)', fontSize: 14, marginBottom: 28 }}>Visão geral do sistema C.H.D.I</p>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatCard label="Categorias" value={stats.categories} color="201,162,39"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="2" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>}
        />
        <StatCard label="Músicas" value={stats.songs} color="134,198,69"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#86c645" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
        <Link to="/admin/categorias" className="btn btn-ghost">+ Nova Categoria</Link>
        <Link to="/admin/musicas" className="btn btn-gold">+ Adicionar Música</Link>
      </div>

      {recentSongs.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 3, height: 14, background: 'var(--gold)', borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)' }}>MÚSICAS RECENTES</span>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Título</th><th>Categoria</th><th>Reproduções</th></tr></thead>
                <tbody>
                  {recentSongs.map(song => (
                    <tr key={song._id}>
                      <td style={{ fontWeight: 600 }}>{song.title}</td>
                      <td style={{ color: 'var(--white-dim)' }}>{song.category?.name || '—'}</td>
                      <td style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{song.playCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
