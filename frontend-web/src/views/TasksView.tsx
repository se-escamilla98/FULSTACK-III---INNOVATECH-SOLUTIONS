import React, { useEffect, useState } from 'react';
import bffClient from '../api/bffClient';

interface Project { id: string; name: string; }
interface Team    { id: string; name: string; }
interface Task {
  id: string;
  name: string;
  description: string;
  status: string;
  area: string;
  assignedTo: string;
  teamId: string;
  projectId: string;
}

const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'];

const statusStyle = (status: string): React.CSSProperties => {
  const map: Record<string, React.CSSProperties> = {
    PENDING:     { background: '#e2e8f0', color: '#475569' },
    IN_PROGRESS: { background: '#dbeafe', color: '#1d4ed8' },
    COMPLETED:   { background: '#dcfce7', color: '#15803d' },
    BLOCKED:     { background: '#fee2e2', color: '#b91c1c' },
  };
  return { ...map[status] || map.PENDING, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 };
};

export default function TasksView({ role }: { role: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams,    setTeams]    = useState<Team[]>([]);
  const [tasks,    setTasks]    = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', area: '', assignedTo: '', teamId: '',
  });

  // Admin y Developer pueden gestionar tareas
  const canEdit = role === 'admin' || role === 'developer';

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [pRes, tRes] = await Promise.all([
          bffClient.get('/projects'),
          bffClient.get('/teams'),
        ]);
        setProjects(pRes.data);
        setTeams(tRes.data);
      } catch {
        setError('No se pudieron cargar proyectos o equipos.');
      }
    };
    loadMeta();
  }, []);

  useEffect(() => {
    if (!selectedProject) { setTasks([]); return; }
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await bffClient.get(`/projects/${selectedProject}/tasks`);
        setTasks(res.data);
      } catch {
        setError('No se pudieron cargar las tareas.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedProject]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await bffClient.post('/tasks', { ...form, projectId: selectedProject });
      setShowModal(false);
      setForm({ name: '', description: '', area: '', assignedTo: '', teamId: '' });
      const res = await bffClient.get(`/projects/${selectedProject}/tasks`);
      setTasks(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear la tarea');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await bffClient.patch(`/tasks/${id}`, { status });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo cambiar el estado');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar la tarea "${name}"?`)) return;
    try {
      await bffClient.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch {
      setError('No se pudo eliminar la tarea.');
    }
  };

  return (
    <div>
      <div style={s.toolbar}>
        <h2 style={s.viewTitle}>
          Tareas
          {tasks.length > 0 && <span style={s.badge}>{tasks.length}</span>}
        </h2>
        {canEdit && (
          <button
            style={{ ...s.btnPrimary, opacity: selectedProject ? 1 : 0.5 }}
            disabled={!selectedProject}
            onClick={() => setShowModal(true)}
          >
            + Nueva Tarea
          </button>
        )}
      </div>

      <div style={s.filterBar}>
        <label style={s.filterLabel}>Proyecto:</label>
        <select
          style={s.filterSelect}
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
        >
          <option value="">— Selecciona un proyecto —</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {error && <div style={s.alertError}>{error} <button style={s.closeBtn} onClick={() => setError(null)}>✕</button></div>}
      {loading && <p style={s.loadingText}>Cargando tareas...</p>}

      {!loading && selectedProject && tasks.length === 0 && (
        <div style={s.empty}>
          {canEdit ? 'No hay tareas para este proyecto. ¡Crea la primera!' : 'No hay tareas para este proyecto.'}
        </div>
      )}
      {!selectedProject && (
        <div style={s.empty}>Selecciona un proyecto para ver sus tareas.</div>
      )}

      <div style={s.list}>
        {tasks.map(t => (
          <div key={t.id} style={s.card}>
            <div style={s.cardLeft}>
              <div style={s.cardTop}>
                <span style={statusStyle(t.status)}>{t.status}</span>
                <span style={s.areaTag}>{t.area}</span>
              </div>
              <h3 style={s.cardTitle}>{t.name}</h3>
              <p style={s.cardDesc}>{t.description}</p>
              <p style={s.cardMeta}>Asignado a: <strong>{t.assignedTo}</strong></p>
            </div>
            <div style={s.cardRight}>
              {canEdit ? (
                <>
                  <select
                    value={t.status}
                    onChange={e => handleStatusChange(t.id, e.target.value)}
                    style={s.select}
                  >
                    {TASK_STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <button style={s.btnDeleteCard} onClick={() => handleDelete(t.id, t.name)}>Eliminar</button>
                </>
              ) : (
                <span style={statusStyle(t.status)}>{t.status}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Nueva Tarea</h3>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <label style={s.label}>Nombre *</label>
              <input style={s.input} required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nombre de la tarea" />

              <label style={s.label}>Descripción *</label>
              <textarea style={{ ...s.input, height: '70px', resize: 'vertical' }} required
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descripción de la tarea" />

              <div style={s.row}>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Área *</label>
                  <select style={s.input} required value={form.area}
                    onChange={e => setForm(f => ({ ...f, area: e.target.value }))}>
                    <option value="">Seleccionar...</option>
                    {['Backend', 'Frontend', 'DevOps', 'QA', 'Diseño', 'Base de Datos'].map(a =>
                      <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Asignado a *</label>
                  <input style={s.input} required value={form.assignedTo}
                    onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
                    placeholder="ej: dev-001" />
                </div>
              </div>

              <label style={s.label}>Equipo *</label>
              <select style={s.input} required value={form.teamId}
                onChange={e => setForm(f => ({ ...f, teamId: e.target.value }))}>
                <option value="">— Selecciona un equipo —</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>

              <div style={s.modalActions}>
                <button type="button" style={s.btnSecondary} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" style={s.btnPrimary} disabled={saving}>
                  {saving ? 'Guardando...' : 'Crear Tarea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  toolbar:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  viewTitle:    { margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' },
  badge:        { background: '#e5e7eb', color: '#374151', fontSize: '13px', padding: '2px 8px', borderRadius: '12px' },
  filterBar:    { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', background: '#fff', padding: '14px 18px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  filterLabel:  { fontWeight: 600, fontSize: '14px', color: '#374151', whiteSpace: 'nowrap' },
  filterSelect: { flex: 1, maxWidth: '360px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' },
  btnPrimary:   { padding: '9px 18px', border: 'none', borderRadius: '6px', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' },
  btnSecondary: { padding: '9px 18px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '14px' },
  btnDeleteCard:{ padding: '6px 12px', border: '1px solid #fca5a5', borderRadius: '6px', background: '#fff', color: '#dc2626', cursor: 'pointer', fontSize: '13px', fontWeight: 600 },
  alertError:   { background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' },
  closeBtn:     { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: 'inherit' },
  loadingText:  { color: '#6b7280', textAlign: 'center', padding: '40px 0' },
  empty:        { color: '#9ca3af', textAlign: 'center', padding: '60px 0', fontSize: '15px' },
  list:         { display: 'flex', flexDirection: 'column', gap: '12px' },
  card:         { background: '#fff', borderRadius: '10px', padding: '18px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' },
  cardLeft:     { flex: 1, minWidth: 0 },
  cardTop:      { display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' },
  cardTitle:    { margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#111827' },
  cardDesc:     { margin: '0 0 6px 0', color: '#6b7280', fontSize: '13px' },
  cardMeta:     { margin: 0, fontSize: '12px', color: '#9ca3af' },
  cardRight:    { display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0, alignItems: 'flex-end' },
  areaTag:      { background: '#f3f4f6', color: '#374151', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 },
  select:       { padding: '7px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', cursor: 'pointer' },
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:        { background: '#fff', borderRadius: '12px', padding: '28px', width: '520px', maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  modalTitle:   { margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' },
  modalActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' },
  label:        { display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px', color: '#374151' },
  input:        { width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px', outline: 'none' } as React.CSSProperties,
  row:          { display: 'flex', gap: '16px' },
};
