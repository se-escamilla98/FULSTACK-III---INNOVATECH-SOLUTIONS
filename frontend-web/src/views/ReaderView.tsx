import React, { useEffect, useState } from 'react';
import bffClient from '../api/bffClient';

interface Project { id: string; name: string; description: string; status: string; area: string; teamId?: string; }
interface Task { id: string; name: string; description: string; status: string; area: string; assignedTo: string; projectId: string; logs?: TaskLog[]; }
interface TaskLog { id: string; authorName: string; comment: string; createdAt: string; }
interface Member { id: string; employeeId: string; name: string; role: string; }
interface Team { id: string; name: string; area: string; status: string; leaderId: string; members: Member[]; }
interface Employee { id: string; rut: string; firstName: string; secondName?: string; lastName: string; motherLastName?: string; position: string; hireDate: string; }

type Section = 'resumen' | 'proyectos' | 'tareas' | 'equipos' | 'trabajadores';

const STATUS_COLORS: Record<string, React.CSSProperties> = {
  ACTIVE:      { background: '#dcfce7', color: '#15803d' },
  INACTIVE:    { background: '#e2e8f0', color: '#475569' },
  COMPLETED:   { background: '#dbeafe', color: '#1e40af' },
  PENDING:     { background: '#fef9c3', color: '#854d0e' },
  IN_PROGRESS: { background: '#dbeafe', color: '#1e40af' },
  BLOCKED:     { background: '#fee2e2', color: '#b91c1c' },
  PLANNED:     { background: '#e2e8f0', color: '#475569' },
  ON_HOLD:     { background: '#fef3c7', color: '#b45309' },
  CANCELLED:   { background: '#fee2e2', color: '#b91c1c' },
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo', INACTIVE: 'Inactivo', COMPLETED: 'Completado',
  PENDING: 'Pendiente', IN_PROGRESS: 'En Progreso', BLOCKED: 'Bloqueada',
  PLANNED: 'Planificado', ON_HOLD: 'En Espera', CANCELLED: 'Cancelado',
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_COLORS[status] || { background: '#f3f4f6', color: '#374151' };
  return (
    <span style={{ ...style, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default function ReaderView() {
  const [projects,  setProjects]  = useState<Project[]>([]);
  const [tasks,     setTasks]     = useState<Task[]>([]);
  const [teams,     setTeams]     = useState<Team[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [section,   setSection]   = useState<Section>('resumen');

  // Bitácora
  const [logTaskId, setLogTaskId] = useState<string | null>(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true); setError(null);
    try {
      const [pRes, tmRes, eRes] = await Promise.all([
        bffClient.get('/projects'),
        bffClient.get('/teams'),
        bffClient.get('/employees'),
      ]);

      const projectList = Array.isArray(pRes.data) ? pRes.data : [];
      setProjects(projectList);
      setTeams(Array.isArray(tmRes.data) ? tmRes.data : []);
      setEmployees(Array.isArray(eRes.data) ? eRes.data : []);

      // Cargar tareas de todos los proyectos con sus logs
      const taskArrays = await Promise.all(
        projectList.map((p: Project) =>
          bffClient.get(`/projects/${p.id}/tasks`)
            .then(async r => {
              const projectTasks = Array.isArray(r.data) ? r.data : [];
              // Cargar logs de cada tarea
              const tasksWithLogs = await Promise.all(
                projectTasks.map(async (t: Task) => {
                  try {
                    const logRes = await bffClient.get(`/tasks/${t.id}/logs`);
                    return { ...t, logs: Array.isArray(logRes.data) ? logRes.data : [] };
                  } catch { return { ...t, logs: [] }; }
                })
              );
              return tasksWithLogs;
            })
            .catch(() => [])
        )
      );
      setTasks(taskArrays.flat());
    } catch { setError('No se pudieron cargar los datos.'); }
    finally { setLoading(false); }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const empFullName = (e: Employee) =>
    [e.firstName, e.secondName, e.lastName, e.motherLastName].filter(Boolean).join(' ');

  const getEmployeeArea = (empId: string): string => {
    const team = teams.find(t => t.members?.some(m => m.employeeId === empId));
    return team ? team.area : '—';
  };

  const getEmployeeTeam = (empId: string): string => {
    const team = teams.find(t => t.members?.some(m => m.employeeId === empId));
    return team ? team.name : '—';
  };

  const getProjectName = (projectId: string): string => {
    const p = projects.find(p => p.id === projectId);
    return p ? p.name : projectId;
  };

  // ── Estadísticas ───────────────────────────────────────────────────────────
  const stats = {
    projects: {
      total:    projects.length,
      active:   projects.filter(p => p.status === 'ACTIVE' || p.status === 'IN_PROGRESS').length,
      completed:projects.filter(p => p.status === 'COMPLETED').length,
    },
    tasks: {
      total:      tasks.length,
      pending:    tasks.filter(t => t.status === 'PENDING').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed:  tasks.filter(t => t.status === 'COMPLETED').length,
      blocked:    tasks.filter(t => t.status === 'BLOCKED').length,
      withLogs:   tasks.filter(t => t.logs && t.logs.length > 0).length,
    },
    teams: {
      total:   teams.length,
      active:  teams.filter(t => t.status === 'ACTIVE').length,
      members: teams.reduce((acc, t) => acc + (t.members?.length || 0), 0),
    },
  };

  const NAV: { key: Section; label: string }[] = [
    { key: 'resumen',      label: '📊 Resumen'      },
    { key: 'proyectos',    label: '📁 Proyectos'     },
    { key: 'tareas',       label: '✅ Tareas'        },
    { key: 'equipos',      label: '🏢 Equipos'       },
    { key: 'trabajadores', label: '👥 Trabajadores'  },
  ];

  const logTask = tasks.find(t => t.id === logTaskId);

  if (loading) return <p style={s.loadingText}>Cargando reportes...</p>;
  if (error)   return <div style={s.alertError}>{error}</div>;

  return (
    <div>
      <div style={s.toolbar}>
        <div>
          <h2 style={s.viewTitle}>Módulo de Reportes</h2>
          <p style={s.subtitle}>Vista de solo lectura · actualizado al cargar</p>
        </div>
        <button style={s.btnRefresh} onClick={loadAll}>↻ Actualizar</button>
      </div>

      <div style={s.internalNav}>
        {NAV.map(({ key, label }) => (
          <button key={key} style={{ ...s.navBtn, ...(section === key ? s.navBtnActive : {}) }}
            onClick={() => { setSection(key); setLogTaskId(null); }}>
            {label}
          </button>
        ))}
      </div>

      {/* ══════════ RESUMEN ══════════ */}
      {section === 'resumen' && (
        <div>
          <h3 style={s.sectionTitle}>📁 Proyectos</h3>
          <div style={s.statsRow}>
            {[
              { label: 'Total',      value: stats.projects.total,     color: '#111827' },
              { label: 'Activos',    value: stats.projects.active,    color: '#15803d' },
              { label: 'Completados',value: stats.projects.completed, color: '#1e40af' },
            ].map(st => (
              <div key={st.label} style={s.statCard}>
                <span style={{ ...s.statValue, color: st.color }}>{st.value}</span>
                <span style={s.statLabel}>{st.label}</span>
              </div>
            ))}
          </div>

          <h3 style={s.sectionTitle}>✅ Tareas</h3>
          <div style={s.statsRow}>
            {[
              { label: 'Total',        value: stats.tasks.total,      color: '#111827' },
              { label: 'Pendientes',   value: stats.tasks.pending,    color: '#854d0e' },
              { label: 'En Progreso',  value: stats.tasks.inProgress, color: '#1e40af' },
              { label: 'Completadas',  value: stats.tasks.completed,  color: '#15803d' },
              { label: 'Bloqueadas',   value: stats.tasks.blocked,    color: '#b91c1c' },
              { label: 'Con Bitácora', value: stats.tasks.withLogs,   color: '#7c3aed' },
            ].map(st => (
              <div key={st.label} style={s.statCard}>
                <span style={{ ...s.statValue, color: st.color }}>{st.value}</span>
                <span style={s.statLabel}>{st.label}</span>
              </div>
            ))}
          </div>

          <h3 style={s.sectionTitle}>🏢 Equipos</h3>
          <div style={s.statsRow}>
            {[
              { label: 'Total',    value: stats.teams.total,   color: '#111827' },
              { label: 'Activos',  value: stats.teams.active,  color: '#15803d' },
              { label: 'Miembros', value: stats.teams.members, color: '#7c3aed' },
            ].map(st => (
              <div key={st.label} style={s.statCard}>
                <span style={{ ...s.statValue, color: st.color }}>{st.value}</span>
                <span style={s.statLabel}>{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════ PROYECTOS ══════════ */}
      {section === 'proyectos' && (
        <div>
          <h3 style={s.sectionTitle}>Proyectos ({projects.length})</h3>
          {projects.length === 0
            ? <p style={s.noData}>No hay proyectos registrados.</p>
            : (
              <div style={s.tableWrapper}>
                <table style={s.table}>
                  <thead>
                    <tr>{['Nombre', 'Descripción', 'Área', 'Estado'].map(h =>
                      <th key={h} style={s.th}>{h}</th>)}
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

      {/* ══════════ TAREAS POR PROYECTO ══════════ */}
      {section === 'tareas' && (
        <div>
          <h3 style={s.sectionTitle}>Tareas por Proyecto ({tasks.length} total)</h3>
          {projects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            if (projectTasks.length === 0) return null;
            return (
              <div key={project.id} style={s.projectBlock}>
                <div style={s.projectBlockHeader}>
                  <span style={s.projectBlockName}>{project.name}</span>
                  <StatusBadge status={project.status} />
                  <span style={s.projectTaskCount}>{projectTasks.length} tarea{projectTasks.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={s.tableWrapper}>
                  <table style={s.table}>
                    <thead>
                      <tr>{['Nombre', 'Área', 'Estado', 'Bitácora'].map(h =>
                        <th key={h} style={s.th}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {projectTasks.map((t, i) => (
                        <tr key={t.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                          <td style={{ ...s.td, fontWeight: 600 }}>{t.name}</td>
                          <td style={s.td}>{t.area}</td>
                          <td style={s.td}><StatusBadge status={t.status} /></td>
                          <td style={s.td}>
                            {t.logs && t.logs.length > 0 ? (
                              <button style={s.btnLog} onClick={() => setLogTaskId(t.id)}>
                                📋 Ver bitácora ({t.logs.length})
                              </button>
                            ) : (
                              <span style={{ fontSize: '12px', color: '#d1d5db' }}>Sin entradas</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
          {tasks.length === 0 && <p style={s.noData}>No hay tareas registradas.</p>}
        </div>
      )}

      {/* ══════════ EQUIPOS ══════════ */}
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
                {team.members && team.members.length > 0 ? (
                  <div style={s.tableWrapper}>
                    <table style={s.table}>
                      <thead>
                        <tr>{['Integrante', 'Rol en Equipo'].map(h =>
                          <th key={h} style={s.th}>{h}</th>)}
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
                ) : <p style={s.noData}>Sin integrantes.</p>}
              </div>
            ))
          }
        </div>
      )}

      {/* ══════════ TRABAJADORES ══════════ */}
      {section === 'trabajadores' && (
        <div>
          <h3 style={s.sectionTitle}>Trabajadores ({employees.length})</h3>
          {employees.length === 0
            ? <p style={s.noData}>No hay trabajadores registrados.</p>
            : (
              <div style={s.tableWrapper}>
                <table style={s.table}>
                  <thead>
                    <tr>{['Nombre Completo', 'RUT', 'Cargo', 'Área', 'Equipo', 'Fecha Ingreso', 'ID Trabajador'].map(h =>
                      <th key={h} style={s.th}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, i) => (
                      <tr key={emp.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                        <td style={{ ...s.td, fontWeight: 600 }}>{empFullName(emp)}</td>
                        <td style={s.td}>{emp.rut}</td>
                        <td style={s.td}>{emp.position}</td>
                        <td style={s.td}>{getEmployeeArea(emp.id)}</td>
                        <td style={s.td}>{getEmployeeTeam(emp.id)}</td>
                        <td style={s.td}>{new Date(emp.hireDate).toLocaleDateString('es-CL')}</td>
                        <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '11px', color: '#9ca3af' }}>{emp.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      )}

      {/* ══════════ MODAL BITÁCORA ══════════ */}
      {logTaskId && logTask && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <div>
                <h3 style={s.modalTitle}>📋 Bitácora</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                  {logTask.name} · {getProjectName(logTask.projectId)}
                </p>
              </div>
              <button style={s.closeBtn} onClick={() => setLogTaskId(null)}>✕</button>
            </div>

            <div style={s.logList}>
              {(!logTask.logs || logTask.logs.length === 0) && (
                <p style={{ color: '#9ca3af', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>
                  Sin entradas en la bitácora.
                </p>
              )}
              {(logTask.logs || []).map(log => (
                <div key={log.id} style={s.logEntry}>
                  <div style={s.logHeader}>
                    <span style={s.logAuthor}>{log.authorName}</span>
                    <span style={s.logDate}>{new Date(log.createdAt).toLocaleString('es-CL')}</span>
                  </div>
                  <p style={s.logComment}>{log.comment}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button style={s.btnSecondary} onClick={() => setLogTaskId(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  toolbar:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' },
  viewTitle:      { margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827' },
  subtitle:       { margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' },
  btnRefresh:     { padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '13px' },
  btnSecondary:   { padding: '9px 18px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '14px' },
  btnLog:         { padding: '4px 10px', border: '1px solid #7c3aed', borderRadius: '5px', background: '#f5f3ff', color: '#7c3aed', cursor: 'pointer', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' },
  alertError:     { background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', fontSize: '14px' },
  loadingText:    { color: '#6b7280', textAlign: 'center', padding: '60px 0' },
  internalNav:    { display: 'flex', gap: '4px', background: '#fff', borderRadius: '8px', padding: '6px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexWrap: 'wrap' },
  navBtn:         { padding: '8px 16px', border: 'none', background: 'transparent', color: '#6b7280', fontWeight: 600, fontSize: '13px', cursor: 'pointer', borderRadius: '6px' },
  navBtnActive:   { background: '#eff6ff', color: '#2563eb' },
  sectionTitle:   { margin: '0 0 12px 0', fontSize: '15px', fontWeight: 700, color: '#374151' },
  statsRow:       { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
  statCard:       { background: '#fff', borderRadius: '8px', padding: '16px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '90px' },
  statValue:      { fontSize: '28px', fontWeight: 800, lineHeight: 1 },
  statLabel:      { fontSize: '11px', color: '#9ca3af', marginTop: '6px', fontWeight: 600 },
  tableWrapper:   { overflowX: 'auto', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table:          { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th:             { background: '#f3f4f6', padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' },
  td:             { padding: '10px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827', verticalAlign: 'middle' },
  noData:         { color: '#9ca3af', fontSize: '13px', fontStyle: 'italic', padding: '12px 0' },
  projectBlock:   { background: '#fff', borderRadius: '10px', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '20px' },
  projectBlockHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' },
  projectBlockName: { fontSize: '15px', fontWeight: 700, color: '#111827' },
  projectTaskCount: { fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' },
  teamBlock:      { background: '#fff', borderRadius: '10px', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  teamHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  teamName:       { fontSize: '15px', fontWeight: 700, color: '#111827', marginRight: '10px' },
  teamArea:       { fontSize: '12px', background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 },
  overlay:        { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:          { background: '#fff', borderRadius: '12px', padding: '28px', width: '520px', maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  modalTitle:     { margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' },
  closeBtn:       { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: 'inherit' },
  logList:        { maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  logEntry:       { background: '#f9fafb', borderRadius: '8px', padding: '12px', border: '1px solid #e5e7eb' },
  logHeader:      { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  logAuthor:      { fontSize: '13px', fontWeight: 700, color: '#111827' },
  logDate:        { fontSize: '11px', color: '#9ca3af' },
  logComment:     { margin: 0, fontSize: '13px', color: '#374151', lineHeight: 1.5 },
};