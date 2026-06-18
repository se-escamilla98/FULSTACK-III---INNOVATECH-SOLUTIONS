import React, { useEffect, useState } from 'react';
import bffClient from '../api/bffClient';

interface Team {
  id: string;
  name: string;
  description: string;
  area: string;
  leaderId: string;
  members: string[];
  status: string;
}

const statusStyle = (status: string): React.CSSProperties => {
  const map: Record<string, React.CSSProperties> = {
    ACTIVE:   { background: '#dcfce7', color: '#15803d' },
    INACTIVE: { background: '#e2e8f0', color: '#475569' },
  };
  return { ...map[status] || map.ACTIVE, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 };
};

export default function TeamsView({ role }: { role: string }) {
  const [teams, setTeams]       = useState<Team[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', area: '', leaderId: '', membersStr: '',
  });

  // Solo admin puede crear, editar y eliminar equipos
  const canEdit = role === 'admin';

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bffClient.get('/teams');
      setTeams(res.data);
    } catch {
      setError('No se pudieron cargar los equipos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const members = form.membersStr
      .split(',')
      .map(m => m.trim())
      .filter(Boolean);
    try {
      await bffClient.post('/teams', {
        name: form.name,
        description: form.description,
        area: form.area,
        leaderId: form.leaderId,
        members,
      });
      setShowModal(false);
      setForm({ name: '', description: '', area: '', leaderId: '', membersStr: '' });
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear el equipo');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (team: Team) => {
    const newStatus = team.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await bffClient.patch(`/teams/${team.id}/status`, { status: newStatus });
      setTeams(prev => prev.map(t => t.id === team.id ? { ...t, status: newStatus } : t));
    } catch {
      setError('No se pudo cambiar el estado del equipo.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar el equipo "${name}"?`)) return;
    try {
      await bffClient.delete(`/teams/${id}`);
      setTeams(prev => prev.filter(t => t.id !== id));
    } catch {
      setError('No se pudo eliminar el equipo.');
    }
  };

  return (
    <div>
      <div style={s.toolbar}>
        <h2 style={s.viewTitle}>Equipos <span style={s.badge}>{teams.length}</span></h2>
        {canEdit && (
          <button style={s.btnPrimary} onClick={() => setShowModal(true)}>+ Nuevo Equipo</button>
        )}
      </div>

      {error && <div style={s.alertError}>{error} <button style={s.closeBtn} onClick={() => setError(null)}>✕</button></div>}
      {loading && <p style={s.loadingText}>Cargando equipos...</p>}

      {!loading && teams.length === 0 && (
        <div style={s.empty}>
          {canEdit ? 'No hay equipos aún. ¡Crea el primero!' : 'No hay equipos aún.'}
        </div>
      )}

      <div style={s.grid}>
        {teams.map(team => (
          <div key={team.id} style={{ ...s.card, borderTop: `4px solid ${team.status === 'ACTIVE' ? '#16a34a' : '#9ca3af'}` }}>
            <div style={s.cardHeader}>
              <span style={statusStyle(team.status)}>{team.status}</span>
              {canEdit && (
                <button style={s.btnDelete} onClick={() => handleDelete(team.id, team.name)}>✕</button>
              )}
            </div>
            <h3 style={s.cardTitle}>{team.name}</h3>
            <p style={s.cardDesc}>{team.description}</p>
            <div style={s.cardMeta}>
              <span style={s.metaItem}>Área: <strong>{team.area}</strong></span>
              <span style={s.metaItem}>Líder: <strong>{team.leaderId}</strong></span>
            </div>
            {team.members?.length > 0 && (
              <div style={s.members}>
                {team.members.map((m, i) => (
                  <span key={i} style={s.memberTag}>{m}</span>
                ))}
              </div>
            )}
            <div style={s.cardFooter}>
              {canEdit ? (
                <button
                  style={team.status === 'ACTIVE' ? s.btnWarning : s.btnSuccess}
                  onClick={() => handleStatusToggle(team)}
                >
                  {team.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                </button>
              ) : (
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Estado: <strong>{team.status}</strong></span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Nuevo Equipo</h3>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <label style={s.label}>Nombre *</label>
              <input style={s.input} required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nombre del equipo" />

              <label style={s.label}>Descripción *</label>
              <textarea style={{ ...s.input, height: '70px', resize: 'vertical' }} required
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descripción del equipo" />

              <div style={s.row}>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Área *</label>
                  <select style={s.input} required value={form.area}
                    onChange={e => setForm(f => ({ ...f, area: e.target.value }))}>
                    <option value="">Seleccionar...</option>
                    {['Backend', 'Frontend', 'DevOps', 'QA', 'Diseño', 'Full Stack'].map(a =>
                      <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>ID del Líder *</label>
                  <input style={s.input} required value={form.leaderId}
                    onChange={e => setForm(f => ({ ...f, leaderId: e.target.value }))}
                    placeholder="ej: lider-001" />
                </div>
              </div>

              <label style={s.label}>Miembros</label>
              <input style={s.input} value={form.membersStr}
                onChange={e => setForm(f => ({ ...f, membersStr: e.target.value }))}
                placeholder="dev-001, dev-002, dev-003 (separados por coma)" />
              <p style={s.hint}>Ingresa los IDs separados por coma.</p>

              <div style={s.modalActions}>
                <button type="button" style={s.btnSecondary} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" style={s.btnPrimary} disabled={saving}>
                  {saving ? 'Guardando...' : 'Crear Equipo'}
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
  toolbar:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  viewTitle:    { margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' },
  badge:        { background: '#e5e7eb', color: '#374151', fontSize: '13px', padding: '2px 8px', borderRadius: '12px' },
  btnPrimary:   { padding: '9px 18px', border: 'none', borderRadius: '6px', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' },
  btnSecondary: { padding: '9px 18px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '14px' },
  btnDelete:    { border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '16px', padding: '0 4px' },
  btnWarning:   { padding: '7px 14px', border: '1px solid #f59e0b', borderRadius: '6px', background: '#fffbeb', color: '#b45309', cursor: 'pointer', fontSize: '13px', fontWeight: 600 },
  btnSuccess:   { padding: '7px 14px', border: '1px solid #86efac', borderRadius: '6px', background: '#f0fdf4', color: '#15803d', cursor: 'pointer', fontSize: '13px', fontWeight: 600 },
  alertError:   { background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' },
  closeBtn:     { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: 'inherit' },
  loadingText:  { color: '#6b7280', textAlign: 'center', padding: '40px 0' },
  empty:        { color: '#9ca3af', textAlign: 'center', padding: '60px 0', fontSize: '15px' },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card:         { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '10px' },
  cardHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle:    { margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' },
  cardDesc:     { margin: 0, color: '#6b7280', fontSize: '14px' },
  cardMeta:     { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  metaItem:     { fontSize: '13px', color: '#6b7280' },
  members:      { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  memberTag:    { background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 },
  cardFooter:   { borderTop: '1px solid #f3f4f6', paddingTop: '12px', marginTop: '4px' },
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:        { background: '#fff', borderRadius: '12px', padding: '28px', width: '500px', maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  modalTitle:   { margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' },
  modalActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' },
  label:        { display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px', color: '#374151' },
  input:        { width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px', outline: 'none' } as React.CSSProperties,
  row:          { display: 'flex', gap: '16px' },
  hint:         { margin: '-10px 0 14px 0', fontSize: '12px', color: '#9ca3af' },
};
