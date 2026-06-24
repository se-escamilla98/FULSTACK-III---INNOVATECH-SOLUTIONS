import React, { useEffect, useState } from 'react';
import bffClient from '../api/bffClient';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  area: string;
  teamId?: string;
  createdAt: string;
}

interface Team {
  id: string;
  name: string;
  area: string;
  leaderId: string;
}

const PROJECT_STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'];
const STATUS_LABELS: Record<string, string> = {
  PLANNED:     'Planificado',
  IN_PROGRESS: 'En Progreso',
  COMPLETED:   'Completado',
  ON_HOLD:     'En Espera',
  CANCELLED:   'Cancelado',
};
const AREAS = ['Backend', 'Frontend', 'DevOps', 'QA', 'Diseño', 'Full Stack', 'General'];

const statusStyle = (status: string): React.CSSProperties => {
  const map: Record<string, React.CSSProperties> = {
    PLANNED:     { background: '#e2e8f0', color: '#475569' },
    IN_PROGRESS: { background: '#dbeafe', color: '#1d4ed8' },
    COMPLETED:   { background: '#dcfce7', color: '#15803d' },
    ON_HOLD:     { background: '#fef3c7', color: '#b45309' },
    CANCELLED:   { background: '#fee2e2', color: '#b91c1c' },
  };
  return { ...map[status] || map.PLANNED, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 };
};

export default function ProjectsView({ role }: { role: string }) {
  const [projects, setProjects]   = useState<Project[]>([]);
  const [teams, setTeams]         = useState<Team[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState<string | null>(null);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', area: 'General', teamId: '',
  });

  const canEdit = role === 'admin';

  // Auto-ocultar mensajes
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(t); }
  }, [success]);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [pRes, tRes] = await Promise.all([
        bffClient.get('/projects'),
        bffClient.get('/teams'),
      ]);
      setProjects(Array.isArray(pRes.data) ? pRes.data : []);
      setTeams(Array.isArray(tRes.data) ? tRes.data : []);
    } catch {
      setError('No se pudieron cargar los proyectos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Búsqueda por nombre o id
  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const getTeamName = (teamId?: string) => {
    if (!teamId) return '—';
    const t = teams.find(t => t.id === teamId);
    return t ? t.name : '—';
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await bffClient.post('/projects', {
        name:        form.name,
        description: form.description,
        area:        form.area,
        teamId:      form.teamId || undefined,
      });
      setShowModal(false);
      setForm({ name: '', description: '', area: 'General', teamId: '' });
      setSuccess('Proyecto creado correctamente.');
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear el proyecto');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await bffClient.patch(`/projects/${id}/status`, { status });
      setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      setSuccess('Estado actualizado.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo cambiar el estado');
    }
  };

  const handleAssignTeam = async (id: string, teamId: string) => {
    try {
      await bffClient.patch(`/projects/${id}`, { teamId: teamId || null });
      setProjects(prev => prev.map(p => p.id === id ? { ...p, teamId } : p));
      setSuccess('Equipo asignado correctamente.');
    } catch {
      setError('No se pudo asignar el equipo.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar el proyecto "${name}"?`)) return;
    try {
      await bffClient.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch {
      setError('No se pudo eliminar el proyecto.');
    }
  };

  return (
    <div>
      {/* ── Toolbar ── */}
      <div style={s.toolbar}>
        <h2 style={s.viewTitle}>
          Proyectos <span style={s.badge}>{projects.length}</span>
        </h2>
        {canEdit && (
          <button style={s.btnPrimary} onClick={() => setShowModal(true)}>+ Nuevo Proyecto</button>
        )}
      </div>

      {/* ── Búsqueda ── */}
      <div style={s.searchBar}>
        <span style={s.searchIcon}>🔍</span>
        <input
          style={s.searchInput}
          placeholder="Buscar por nombre o ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button style={s.clearBtn} onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      {error   && <div style={s.alertError}>{error}<button style={s.closeBtn} onClick={() => setError(null)}>✕</button></div>}
      {success && <div style={s.alertSuccess}>{success}</div>}
      {loading && <p style={s.loadingText}>Cargando proyectos...</p>}

      {!loading && filtered.length === 0 && (
        <div style={s.empty}>
          {search ? `No se encontraron proyectos para "${search}".` : (canEdit ? 'No hay proyectos aún. ¡Crea el primero!' : 'No hay proyectos aún.')}
        </div>
      )}

      {/* ── Grid de proyectos ── */}
      <div style={s.grid}>
        {filtered.map(p => (
          <div key={p.id} style={{ ...s.card, borderTop: `4px solid ${statusStyle(p.status).background as string}` }}>
            <div style={s.cardHeader}>
              <span style={statusStyle(p.status)}>{STATUS_LABELS[p.status] || p.status}</span>
              {canEdit && <button style={s.btnDelete} onClick={() => handleDelete(p.id, p.name)}>✕</button>}
            </div>

            <h3 style={s.cardTitle}>{p.name}</h3>
            <p style={s.cardDesc}>{p.description}</p>

            <div style={s.cardMeta}>
              <span style={s.metaItem}>📂 {p.area || 'General'}</span>
              <span style={s.metaItem}>🏢 {getTeamName(p.teamId)}</span>
            </div>

            <div style={s.cardId}>ID: <code style={s.idCode}>{p.id}</code></div>

            {canEdit && (
              <div style={s.cardFooter}>
                <div style={s.footerRow}>
                  <label style={s.footerLabel}>Estado:</label>
                  <select value={p.status} onChange={e => handleStatusChange(p.id, e.target.value)} style={s.select}>
                    {PROJECT_STATUSES.map(st => (
                      <option key={st} value={st}>{STATUS_LABELS[st]}</option>
                    ))}
                  </select>
                </div>
                <div style={s.footerRow}>
                  <label style={s.footerLabel}>Equipo:</label>
                  <select value={p.teamId || ''} onChange={e => handleAssignTeam(p.id, e.target.value)} style={s.select}>
                    <option value="">Sin equipo</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            {!canEdit && (
              <div style={s.cardFooter}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                  Estado: <strong>{STATUS_LABELS[p.status] || p.status}</strong>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Modal crear proyecto ── */}
      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Nuevo Proyecto</h3>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <label style={s.label}>Nombre *</label>
              <input style={s.input} required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nombre del proyecto" />

              <label style={s.label}>Descripción *</label>
              <textarea style={{ ...s.input, height: '80px', resize: 'vertical' }} required
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descripción del proyecto" />

              <div style={s.row}>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Área *</label>
                  <select style={s.input} value={form.area}
                    onChange={e => setForm(f => ({ ...f, area: e.target.value }))}>
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Equipo (opcional)</label>
                  <select style={s.input} value={form.teamId}
                    onChange={e => setForm(f => ({ ...f, teamId: e.target.value }))}>
                    <option value="">Sin equipo</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={s.modalActions}>
                <button type="button" style={s.btnSecondary} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" style={s.btnPrimary} disabled={saving}>
                  {saving ? 'Guardando...' : 'Crear Proyecto'}
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
  btnPrimary:   { padding: '9px 18px', border: 'none', borderRadius: '6px', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' },
  btnSecondary: { padding: '9px 18px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '14px' },
  btnDelete:    { border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '16px', padding: '0 4px' },
  alertError:   { background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' },
  alertSuccess: { background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  closeBtn:     { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: 'inherit' },
  loadingText:  { color: '#6b7280', textAlign: 'center', padding: '40px 0' },
  empty:        { color: '#9ca3af', textAlign: 'center', padding: '60px 0', fontSize: '15px' },
  searchBar:    { display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  searchIcon:   { fontSize: '16px' },
  searchInput:  { flex: 1, border: 'none', outline: 'none', fontSize: '14px', background: 'transparent' },
  clearBtn:     { border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af', fontSize: '14px' },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card:         { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '8px' },
  cardHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle:    { margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' },
  cardDesc:     { margin: 0, color: '#6b7280', fontSize: '14px', flexGrow: 1 },
  cardMeta:     { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  metaItem:     { fontSize: '13px', color: '#6b7280' },
  cardId:       { fontSize: '11px', color: '#d1d5db' },
  idCode:       { fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' },
  cardFooter:   { borderTop: '1px solid #f3f4f6', paddingTop: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '8px' },
  footerRow:    { display: 'flex', alignItems: 'center', gap: '8px' },
  footerLabel:  { fontSize: '12px', fontWeight: 600, color: '#6b7280', minWidth: '55px' },
  select:       { flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', cursor: 'pointer' },
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:        { background: '#fff', borderRadius: '12px', padding: '28px', width: '480px', maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  modalTitle:   { margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' },
  modalActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' },
  label:        { display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px', color: '#374151' },
  input:        { width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px', outline: 'none' } as React.CSSProperties,
  row:          { display: 'flex', gap: '16px' },
};