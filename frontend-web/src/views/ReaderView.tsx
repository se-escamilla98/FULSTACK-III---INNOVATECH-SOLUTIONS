import React, { useEffect, useState } from 'react';
import bffClient from '../api/bffClient';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  area: string;
}

interface Task {
  id: string;
  name: string;
  description: string;
  status: string;
  area: string;
  assignedTo: string;
  projectId: string;
}

interface Member {
  id: string;
  name: string;
  role: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  area: string;
  status: string;
  leaderId: string;
  members: Member[];
}

type Section = 'resumen' | 'proyectos' | 'tareas' | 'equipos';

const STATUS_COLORS: Record<string, React.CSSProperties> = {
  ACTIVE:      { background: '#dcfce7', color: '#15803d' },
  INACTIVE:    { background: '#e2e8f0', color: '#475569' },
  COMPLETED:   { background: '#dbeafe', color: '#1e40af' },
  PENDING:     { background: '#fef9c3', color: '#854d0e' },
  IN_PROGRESS: { background: '#dbeafe', color: '#1e40af' },
  BLOCKED:     { background: '#fee2e2', color: '#b91c1c' },
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE:      'Activo',
  INACTIVE:    'Inactivo',
  COMPLETED:   'Completado',
  PENDING:     'Pendiente',
  IN_PROGRESS: 'En Progreso',
  BLOCKED:     'Bloqueado',
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_COLORS[status] || { background: '#f3f4f6', color: '#374151' };
  return (
    <span style={{ ...style, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ReaderView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks,    setTasks]    = useState<Task[]>([]);
  const [teams,    setTeams]    = useState<Team[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [section,  setSection]  = useState<Section>('resumen');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true); setError(null);
    try {
      const [pRes, tRes, tmRes] = await Promise.all([
        bffClient.get('/projects'),
        bffClient.get('/projects').then(async res => {
          // Carga tareas de todos los proyectos en paralelo
          const all = Array.isArray(res.data) ? res.data : [];
          const taskArrays = await Promise.all(
            all.map((p: Project) =>
              bffClient.get(`/projects/${p.id}/tasks`)
                .then(r => Array.isArray(r.data) ? r.data : [])
                .catch(() => [])
            )
          );
          return taskArrays.flat();
        }),
        bffClient.get('/teams'),
      ]);
      setProjects(Array.isArray(pRes.data) ? pRes.data : []);
      setTasks(tRes);
      setTeams(Array.isArray(tmRes.data) ? tmRes.data : []);
    } catch { setError('No se pudieron cargar los datos.'); }
    finally { setLoading(false); }
  };

  // ── Estadísticas derivadas ─────────────────────────────────────────────────
  const stats = {
    projects: {
      total:    projects.length,
      active:   projects.filter(p => p.status === 'ACTIVE').length,
      inactive: projects.filter(p => p.status === 'INACTIVE').length,
      completed:projects.filter(p => p.status === 'COMPLETED').length,
    },
    tasks: {
      total:      tasks.length,
      pending:    tasks.filter(t => t.status === 'PENDING').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed:  tasks.filter(t => t.status === 'COMPLETED').length,
      blocked:    tasks.filter(t => t.status === 'BLOCKED').length,
    },
    teams: {
      total:    teams.length,
      active:   teams.filter(t => t.status === 'ACTIVE').length,
      inactive: teams.filter(t => t.status === 'INACTIVE').length,
      members:  teams.reduce((acc, t) => acc + (t.members?.length || 0), 0),
    },
  };

  const NAV: { key: Section; label: string }[] = [
    { key: 'resumen',   label: '📊 Resumen'   },
    { key: 'proyectos', label: '📁 Proyectos'  },
    { key: 'tareas',    label: '✅ Tareas'     },
    { key: 'equipos',   label: '🏢 Equipos'    },
  ];

  if (loading) return <p style={s.loadingText}>Cargando reportes...</p>;
  if (error)   return <div style={s.alertError}>{error}</div>;

  return (
    <div>
      {/* ── Header ── */}
      <div style={s.toolbar}>
        <div>
          <h2 style={s.viewTitle}>Módulo de Reportes</h2>
          <p style={s.subtitle}>Vista de solo lectura · actualizado al cargar</p>
        </div>
        <button style={s.btnRefresh} onClick={loadAll}>↻ Actualizar</button>
      </div>

      {/* ── Nav interno ── */}
      <div style={s.internalNav}>
        {NAV.map(({ key, label }) => (
          <button key={key} style={{ ...s.navBtn, ...(section === key ? s.navBtnActive : {}) }}
            onClick={() => setSection(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════ RESUMEN ══════════════ */}
      {section === 'resumen' && (
        <div>
          {/* Proyectos */}
          <h3 style={s.sectionTitle}>📁 Proyectos</h3>
          <div style={s.statsRow}>
            {[
              { label: 'Total',      value: stats.projects.total,     color: '#111827' },
              { label: 'Activos',    value: stats.projects.active,    color: '#15803d' },
              { label: 'Inactivos',  value: stats.projects.inactive,  color: '#475569' },
              { label: 'Completados',value: stats.projects.completed, color: '#1e40af' },
            ].map(st => (
              <div key={st.label} style={s.statCard}>
                <span style={{ ...s.statValue, color: st.color }}>{st.value}</span>
                <span style={s.statLabel}>{st.label}</span>
              </div>
            ))}
          </div>

          {/* Tareas */}
          <h3 style={s.sectionTitle}>✅ Tareas</h3>
          <div style={s.statsRow}>
            {[
              { label: 'Total',       value: stats.tasks.total,      color: '#111827' },
              { label: 'Pendientes',  value: stats.tasks.pending,    color: '#854d0e' },
              { label: 'En Progreso', value: stats.tasks.inProgress, color: '#1e40af' },
              { label: 'Completadas', value: stats.tasks.completed,  color: '#15803d' },
              { label: 'Bloqueadas',  value: stats.tasks.blocked,    color: '#b91c1c' },
            ].map(st => (
              <div key={st.label} style={s.statCard}>
                <span style={{ ...s.statValue, color: st.color }}>{st.value}</span>
                <span style={s.statLabel}>{st.label}</span>
              </div>
            ))}
          </div>

          {/* Equipos */}
          <h3 style={s.sectionTitle}>🏢 Equipos</h3>
          <div style={s.statsRow}>
            {[
              { label: 'Total',     value: stats.teams.total,    color: '#111827' },
              { label: 'Activos',   value: stats.teams.active,   color: '#15803d' },
              { label: 'Inactivos', value: stats.teams.inactive, color: '#475569' },
              { label: 'Miembros',  value: stats.teams.members,  color: '#7c3aed' },
            ].map(st => (
              <div key={st.label} style={s.statCard}>
                <span style={{ ...s.statValue, color: st.color }}>{st.value}</span>
                <span style={s.statLabel}>{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ PROYECTOS ══════════════ */}
      {section === 'proyectos' && (
        <div>
          <h3 style={s.sectionTitle}>Proyectos ({projects.length})</h3>
          {projects.length === 0
            ? <p style={s.noData}>No hay proyectos registrados.</p>
            : (
              <div style={s.tableWrapper}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['Nombre', 'Descripción', 'Área', 'Estado'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p, i) => (
                      <tr key={p.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                        <td style={{ ...s.td, fontWeight: 600 }}>{p.name}</td>
                        <td style={{ ...s.td, color: '#6b7280' }}>{p.description || '—'}</td>
                        <td style={s.td}>{p.area}</td>
                        <td style={s.td}><StatusBadge status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      )}

      {/* ══════════════ TAREAS ══════════════ */}
      {section === 'tareas' && (
        <div>
          <h3 style={s.sectionTitle}>Tareas ({tasks.length})</h3>
          {tasks.length === 0
            ? <p style={s.noData}>No hay tareas registradas.</p>
            : (
              <div style={s.tableWrapper}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['Nombre', 'Descripción', 'Área', 'Asignado a', 'Estado'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((t, i) => (
                      <tr key={t.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                        <td style={{ ...s.td, fontWeight: 600 }}>{t.name}</td>
                        <td style={{ ...s.td, color: '#6b7280' }}>{t.description || '—'}</td>
                        <td style={s.td}>{t.area}</td>
                        <td style={s.td}>{t.assignedTo}</td>
                        <td style={s.td}><StatusBadge status={t.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      )}

      {/* ══════════════ EQUIPOS ══════════════ */}
      {section === 'equipos' && (
        <div>
          <h3 style={s.sectionTitle}>Equipos ({teams.length})</h3>
          {teams.length === 0
            ? <p style={s.noData}>No hay equipos registrados.</p>
            : teams.map((team, i) => (
              <div key={team.id} style={{ ...s.teamBlock, marginTop: i === 0 ? 0 : '20px' }}>
                <div style={s.teamHeader}>
                  <div>
                    <span style={s.teamName}>{team.name}</span>
                    <span style={s.teamArea}>{team.area}</span>
                  </div>
                  <StatusBadge status={team.status} />
                </div>
                {team.description && <p style={s.teamDesc}>{team.description}</p>}
                {team.members && team.members.length > 0 ? (
                  <div style={s.tableWrapper}>
                    <table style={s.table}>
                      <thead>
                        <tr>
                          {['Integrante', 'Rol en Equipo'].map(h => (
                            <th key={h} style={s.th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {team.members.map((m, j) => (
                          <tr key={m.id} style={{ background: j % 2 === 0 ? '#fff' : '#f9fafb' }}>
                            <td style={{ ...s.td, fontWeight: 600 }}>{m.name}</td>
                            <td style={s.td}>{m.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={s.noData}>Sin integrantes.</p>
                )}
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  toolbar:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' },
  viewTitle:    { margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827' },
  subtitle:     { margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' },
  btnRefresh:   { padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '13px' },
  alertError:   { background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', fontSize: '14px' },
  loadingText:  { color: '#6b7280', textAlign: 'center', padding: '60px 0' },
  internalNav:  { display: 'flex', gap: '4px', background: '#fff', borderRadius: '8px', padding: '6px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexWrap: 'wrap' },
  navBtn:       { padding: '8px 16px', border: 'none', background: 'transparent', color: '#6b7280', fontWeight: 600, fontSize: '13px', cursor: 'pointer', borderRadius: '6px' },
  navBtnActive: { background: '#eff6ff', color: '#2563eb' },
  sectionTitle: { margin: '0 0 12px 0', fontSize: '15px', fontWeight: 700, color: '#374151' },
  statsRow:     { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
  statCard:     { background: '#fff', borderRadius: '8px', padding: '16px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '90px' },
  statValue:    { fontSize: '28px', fontWeight: 800, lineHeight: 1 },
  statLabel:    { fontSize: '11px', color: '#9ca3af', marginTop: '6px', fontWeight: 600 },
  tableWrapper: { overflowX: 'auto', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table:        { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th:           { background: '#f3f4f6', padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' },
  td:           { padding: '10px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827', verticalAlign: 'middle' },
  noData:       { color: '#9ca3af', fontSize: '13px', fontStyle: 'italic', padding: '12px 0' },
  teamBlock:    { background: '#fff', borderRadius: '10px', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  teamHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  teamName:     { fontSize: '15px', fontWeight: 700, color: '#111827', marginRight: '10px' },
  teamArea:     { fontSize: '12px', background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 },
  teamDesc:     { margin: '0 0 12px 0', fontSize: '13px', color: '#6b7280' },
};
