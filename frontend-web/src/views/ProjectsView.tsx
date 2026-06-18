import React, { useEffect, useState } from 'react';
import bffClient from '../api/bffClient';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

const PROJECT_STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'];

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  // Solo admin puede crear, editar y eliminar proyectos
  const canEdit = role === 'admin';

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bffClient.get('/projects');
      setProjects(res.data);
    } catch {
      setError('No se pudieron cargar los proyectos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await bffClient.post('/projects', form);
      setShowModal(false);
      setForm({ name: '', description: '' });
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
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo cambiar el estado');
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
      <div style={s.toolbar}>
        <h2 style={s.viewTitle}>Proyectos <span style={s.badge}>{projects.length}</span></h2>
        {canEdit && (
          <button style={s.btnPrimary} onClick={() => setShowModal(true)}>+ Nuevo Proyecto</button>
        )}
      </div>

      {error && <div style={s.alertError}>{error} <button style={s.closeBtn} onClick={() => setError(null)}>✕</button></div>}
      {loading && <p style={s.loadingText}>Cargando proyectos...</p>}

      {!loading && projects.length === 0 && (
        <div style={s.empty}>
          {canEdit ? 'No hay proyectos aún. ¡Crea el primero!' : 'No hay proyectos aún.'}
        </div>
      )}

      <div style={s.grid}>
        {projects.map(p => (
          <div key={p.id} style={s.card}>
            <div style={s.cardHeader}>
              <span style={statusStyle(p.status)}>{p.status}</span>
              {canEdit && (
                <button style={s.btnDelete} onClick={() => handleDelete(p.id, p.name)}>✕</button>
              )}
            </div>
            <h3 style={s.cardTitle}>{p.name}</h3>
            <p style={s.cardDesc}>{p.description}</p>
            <div style={s.cardFooter}>
              {canEdit ? (
                <select
                  value={p.status}
                  onChange={e => handleStatusChange(p.id, e.target.value)}
                  style={s.select}
                >
                  {PROJECT_STATUSES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              ) : (
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Estado: <strong>{p.status}</strong></span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Nuevo Proyecto</h3>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <label style={s.label}>Nombre *</label>
              <input
                style={s.input} required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nombre del proyecto"
              />
              <label style={s.label}>Descripción *</label>
              <textarea
                style={{ ...s.input, height: '80px', resize: 'vertical' }} required
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descripción del proyecto"
              />
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
  toolbar:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  viewTitle:   { margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' },
  badge:       { background: '#e5e7eb', color: '#374151', fontSize: '13px', padding: '2px 8px', borderRadius: '12px' },
  btnPrimary:  { padding: '9px 18px', border: 'none', borderRadius: '6px', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' },
  btnSecondary:{ padding: '9px 18px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '14px' },
  btnDelete:   { border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '16px', padding: '0 4px' },
  alertError:  { background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' },
  closeBtn:    { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: 'inherit' },
  loadingText: { color: '#6b7280', textAlign: 'center', padding: '40px 0' },
  empty:       { color: '#9ca3af', textAlign: 'center', padding: '60px 0', fontSize: '15px' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card:        { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '10px' },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle:   { margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' },
  cardDesc:    { margin: 0, color: '#6b7280', fontSize: '14px', flexGrow: 1 },
  cardFooter:  { borderTop: '1px solid #f3f4f6', paddingTop: '12px', marginTop: '4px' },
  select:      { width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', cursor: 'pointer' },
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:       { background: '#fff', borderRadius: '12px', padding: '28px', width: '440px', maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  modalTitle:  { margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' },
  modalActions:{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' },
  label:       { display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px', color: '#374151' },
  input:       { width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px', outline: 'none' } as React.CSSProperties,
};
