import React, { useEffect, useState } from 'react';
import bffClient from '../api/bffClient';

interface Employee { id: string; name: string; rut: string; position: string; }
interface Member   { id: string; employeeId: string; name: string; role: string; }
interface Team     { id: string; name: string; description: string; area: string; leaderId: string; members: Member[]; status: string; }

const TEAM_ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Tech Lead', 'QA Engineer', 'DevOps Engineer', 'UI/UX Designer', 'Scrum Master'];

const statusStyle = (st: string): React.CSSProperties => {
  const m: Record<string, React.CSSProperties> = {
    ACTIVE: { background: '#dcfce7', color: '#15803d' },
    INACTIVE: { background: '#e2e8f0', color: '#475569' },
  };
  return { ...m[st] || m.ACTIVE, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 };
};

export default function TeamsView({ role }: { role: string }) {
  const isAdmin = role === 'admin';

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showEmpPanel, setShowEmpPanel] = useState(false);
  const [empForm, setEmpForm] = useState({ name: '', rut: '', position: '' });
  const [empSaving, setEmpSaving] = useState(false);

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', area: '', leaderId: '' });
  const [initMembers, setInitMembers] = useState<{ employeeId: string; name: string; role: string }[]>([]);
  const [selEmpId, setSelEmpId] = useState('');
  const [selRole, setSelRole] = useState('');

  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [addEmpId, setAddEmpId] = useState('');
  const [addRole, setAddRole] = useState('');

  const loadEmployees = async () => {
    try {
      const res = await bffClient.get('/employees');
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch { setEmployees([]); }
  };

  const loadTeams = async () => {
    setLoading(true); setError(null);
    try {
      const res = await bffClient.get('/teams');
      setTeams(Array.isArray(res.data) ? res.data : []);
    } catch { setError('No se pudieron cargar los equipos.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadEmployees(); loadTeams(); }, []);

  // ==================== EMPLEADOS ====================

  const handleCreateEmployee = async () => {
    if (!empForm.name.trim() || !empForm.rut.trim() || !empForm.position) return;
    setEmpSaving(true);
    try {
      await bffClient.post('/employees', empForm);
      setEmpForm({ name: '', rut: '', position: '' });
      await loadEmployees();
    } catch (err: any) { setError(err.response?.data?.error || 'Error al crear empleado'); }
    finally { setEmpSaving(false); }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar al empleado "${name}"?`)) return;
    try { await bffClient.delete(`/employees/${id}`); await loadEmployees(); }
    catch { setError('No se pudo eliminar el empleado.'); }
  };

  // ==================== EQUIPOS ====================

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await bffClient.post('/teams', { ...form, members: initMembers });
      setShowModal(false);
      setForm({ name: '', description: '', area: '', leaderId: '' });
      setInitMembers([]);
      await loadTeams();
    } catch (err: any) { setError(err.response?.data?.error || 'Error al crear equipo'); }
    finally { setSaving(false); }
  };

  const addInitMember = () => {
    if (!selEmpId || !selRole) return;
    const emp = employees.find(e => e.id === selEmpId);
    if (!emp) return;
    if (initMembers.some(m => m.employeeId === selEmpId)) { setError('Este empleado ya fue agregado.'); return; }
    setInitMembers([...initMembers, { employeeId: emp.id, name: emp.name, role: selRole }]);
    setSelEmpId(''); setSelRole('');
  };

  const handleAddMember = async (teamId: string) => {
    if (!addEmpId || !addRole) return;
    const emp = employees.find(e => e.id === addEmpId);
    if (!emp) return;
    try {
      await bffClient.post(`/teams/${teamId}/members`, { employeeId: emp.id, name: emp.name, role: addRole });
      setAddingTo(null); setAddEmpId(''); setAddRole('');
      await loadTeams();
    } catch (err: any) { setError(err.response?.data?.error || 'Error al agregar miembro'); }
  };

  const handleRemoveMember = async (teamId: string, memberId: string, name: string) => {
    if (!window.confirm(`¿Eliminar a "${name}" del equipo?`)) return;
    try { await bffClient.delete(`/teams/${teamId}/members/${memberId}`); await loadTeams(); }
    catch { setError('No se pudo eliminar el miembro.'); }
  };

  const handleStatusToggle = async (team: Team) => {
    const ns = team.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await bffClient.patch(`/teams/${team.id}/status`, { status: ns });
      setTeams(prev => prev.map(t => t.id === team.id ? { ...t, status: ns } : t));
    } catch { setError('No se pudo cambiar el estado.'); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar "${name}" y todos sus miembros?`)) return;
    try { await bffClient.delete(`/teams/${id}`); setTeams(prev => prev.filter(t => t.id !== id)); }
    catch { setError('No se pudo eliminar el equipo.'); }
  };

  const getLeaderName = (leaderId: string) => {
    const emp = employees.find(e => e.id === leaderId);
    return emp ? emp.name : leaderId;
  };

  const availableFor = (usedIds: string[]) => employees.filter(e => !usedIds.includes(e.id));

  return (
    <div>
      <div style={s.toolbar}>
        <h2 style={s.viewTitle}>Equipos <span style={s.badge}>{teams.length}</span></h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isAdmin && (
            <button style={s.btnSecondary} onClick={() => setShowEmpPanel(!showEmpPanel)}>
              {showEmpPanel ? 'Ocultar Empleados' : 'Gestionar Empleados'}
            </button>
          )}
          {isAdmin && (
            <button style={s.btnPrimary} onClick={() => { loadEmployees(); setShowModal(true); }}>+ Nuevo Equipo</button>
          )}
        </div>
      </div>

      {error && <div style={s.alertError}>{error} <button style={s.closeBtn} onClick={() => setError(null)}>✕</button></div>}

      {/* ==================== PANEL EMPLEADOS ==================== */}
      {showEmpPanel && isAdmin && (
        <div style={s.empPanel}>
          <h3 style={s.empTitle}>Empleados de la Organización ({employees.length})</h3>
          <div style={s.empForm}>
            <input style={s.empInput} placeholder="Nombre completo"
              value={empForm.name} onChange={e => setEmpForm(f => ({ ...f, name: e.target.value }))} />
            <input style={s.empInput} placeholder="RUT (ej: 12.345.678-9)"
              value={empForm.rut} onChange={e => setEmpForm(f => ({ ...f, rut: e.target.value }))} />
            <select style={s.empInput} value={empForm.position}
              onChange={e => setEmpForm(f => ({ ...f, position: e.target.value }))}>
              <option value="">Cargo...</option>
              {['Desarrollador', 'Diseñador', 'QA Tester', 'DevOps', 'Scrum Master', 'Product Owner', 'Analista', 'Gerente'].map(p =>
                <option key={p} value={p}>{p}</option>)}
            </select>
            <button style={s.btnPrimary} type="button" onClick={handleCreateEmployee}
              disabled={empSaving || !empForm.name.trim() || !empForm.rut.trim() || !empForm.position}>
              {empSaving ? 'Guardando...' : '+ Agregar'}
            </button>
          </div>
          {employees.length > 0 ? (
            <div style={s.empList}>
              {employees.map(emp => (
                <div key={emp.id} style={s.empRow}>
                  <div>
                    <span style={s.empName}>{emp.name}</span>
                    <span style={s.empDetail}>{emp.position} · RUT: {emp.rut}</span>
                  </div>
                  <button style={s.btnRemove} onClick={() => handleDeleteEmployee(emp.id, emp.name)}>✕</button>
                </div>
              ))}
            </div>
          ) : (
            <p style={s.noData}>No hay empleados registrados. Agrega el primero.</p>
          )}
        </div>
      )}

      {/* ==================== LISTA DE EQUIPOS ==================== */}
      {loading && <p style={s.loadingText}>Cargando equipos...</p>}
      {!loading && teams.length === 0 && <div style={s.empty}>No hay equipos aún.</div>}

      <div style={s.grid}>
        {teams.map(team => (
          <div key={team.id} style={{ ...s.card, borderTop: `4px solid ${team.status === 'ACTIVE' ? '#16a34a' : '#9ca3af'}` }}>
            <div style={s.cardHeader}>
              <span style={statusStyle(team.status)}>{team.status}</span>
              {isAdmin && <button style={s.btnDeleteSmall} onClick={() => handleDelete(team.id, team.name)}>✕</button>}
            </div>
            <h3 style={s.cardTitle}>{team.name}</h3>
            <p style={s.cardDesc}>{team.description}</p>
            <div style={s.cardMeta}>
              <span style={s.metaItem}>Área: <strong>{team.area}</strong></span>
              <span style={s.metaItem}>Líder: <strong>{getLeaderName(team.leaderId)}</strong></span>
            </div>

            <div style={s.membersSection}>
              <div style={s.membersHeader}>
                <span style={s.membersTitle}>Integrantes ({team.members?.length || 0})</span>
                {isAdmin && (
                  <button style={s.btnAddMember}
                    onClick={() => { setAddingTo(addingTo === team.id ? null : team.id); setAddEmpId(''); setAddRole(''); loadEmployees(); }}>
                    {addingTo === team.id ? 'Cancelar' : '+ Agregar'}
                  </button>
                )}
              </div>

              {addingTo === team.id && (
                <div style={s.addForm}>
                  <select style={s.inputSmall} value={addEmpId} onChange={e => setAddEmpId(e.target.value)}>
                    <option value="">Seleccionar empleado...</option>
                    {availableFor((team.members || []).map(m => m.employeeId)).map(emp =>
                      <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>)}
                  </select>
                  <select style={s.inputSmall} value={addRole} onChange={e => setAddRole(e.target.value)}>
                    <option value="">Rol en equipo...</option>
                    {TEAM_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button style={s.btnConfirm} onClick={() => handleAddMember(team.id)} disabled={!addEmpId || !addRole}>Agregar</button>
                </div>
              )}

              {team.members && team.members.length > 0 ? (
                <div style={s.membersList}>
                  {team.members.map(m => (
                    <div key={m.id} style={s.memberRow}>
                      <div style={s.memberInfo}>
                        <span style={s.memberName}>{m.name}</span>
                        <span style={s.memberRole}>{m.role}</span>
                      </div>
                      {isAdmin && <button style={s.btnRemove} onClick={() => handleRemoveMember(team.id, m.id, m.name)}>✕</button>}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={s.noData}>Sin integrantes</p>
              )}
            </div>

            <div style={s.cardFooter}>
              {isAdmin ? (
                <button style={team.status === 'ACTIVE' ? s.btnWarning : s.btnSuccess} onClick={() => handleStatusToggle(team)}>
                  {team.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                </button>
              ) : (
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Estado: <strong>{team.status}</strong></span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ==================== MODAL CREAR EQUIPO ==================== */}
      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Nuevo Equipo</h3>
              <button style={s.closeBtn} onClick={() => { setShowModal(false); setInitMembers([]); }}>✕</button>
            </div>

            {employees.length === 0 && (
              <div style={s.alertWarning}>
                Primero debes registrar empleados en "Gestionar Empleados" para poder asignar líder e integrantes.
              </div>
            )}

            <form onSubmit={handleCreate}>
              <label style={s.label}>Nombre del equipo *</label>
              <input style={s.input} required value={form.name} placeholder="Nombre del equipo"
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />

              <label style={s.label}>Descripción *</label>
              <textarea style={{ ...s.input, height: '60px', resize: 'vertical' }} required value={form.description}
                placeholder="Descripción del equipo"
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

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
                  <label style={s.label}>Líder del equipo *</label>
                  <select style={s.input} required value={form.leaderId}
                    onChange={e => setForm(f => ({ ...f, leaderId: e.target.value }))}>
                    <option value="">Seleccionar líder...</option>
                    {employees.map(emp =>
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.position})</option>)}
                  </select>
                </div>
              </div>

              <label style={s.label}>Integrantes del equipo</label>
              <div style={s.addForm}>
                <select style={s.inputSmall} value={selEmpId} onChange={e => setSelEmpId(e.target.value)}>
                  <option value="">Seleccionar empleado...</option>
                  {availableFor(initMembers.map(m => m.employeeId)).map(emp =>
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.position})</option>)}
                </select>
                <select style={s.inputSmall} value={selRole} onChange={e => setSelRole(e.target.value)}>
                  <option value="">Rol...</option>
                  {TEAM_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <button type="button" style={s.btnConfirm} onClick={addInitMember} disabled={!selEmpId || !selRole}>+</button>
              </div>
              {initMembers.length > 0 && (
                <div style={s.membersList}>
                  {initMembers.map((m, i) => (
                    <div key={i} style={s.memberRow}>
                      <div style={s.memberInfo}>
                        <span style={s.memberName}>{m.name}</span>
                        <span style={s.memberRole}>{m.role}</span>
                      </div>
                      <button type="button" style={s.btnRemove} onClick={() => setInitMembers(initMembers.filter((_, j) => j !== i))}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              <div style={s.modalActions}>
                <button type="button" style={s.btnSecondary} onClick={() => { setShowModal(false); setInitMembers([]); }}>Cancelar</button>
                <button type="submit" style={s.btnPrimary} disabled={saving || employees.length === 0}>
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
  toolbar:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
  viewTitle:      { margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' },
  badge:          { background: '#e5e7eb', color: '#374151', fontSize: '13px', padding: '2px 8px', borderRadius: '12px' },
  btnPrimary:     { padding: '9px 18px', border: 'none', borderRadius: '6px', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap' },
  btnSecondary:   { padding: '9px 18px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap' },
  btnDeleteSmall: { border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '16px', padding: '0 4px' },
  btnWarning:     { padding: '7px 14px', border: '1px solid #f59e0b', borderRadius: '6px', background: '#fffbeb', color: '#b45309', cursor: 'pointer', fontSize: '13px', fontWeight: 600, width: '100%' },
  btnSuccess:     { padding: '7px 14px', border: '1px solid #86efac', borderRadius: '6px', background: '#f0fdf4', color: '#15803d', cursor: 'pointer', fontSize: '13px', fontWeight: 600, width: '100%' },
  alertError:     { background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' },
  alertWarning:   { background: '#fef3c7', color: '#92400e', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' },
  closeBtn:       { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: 'inherit' },
  loadingText:    { color: '#6b7280', textAlign: 'center', padding: '40px 0' },
  empty:          { color: '#9ca3af', textAlign: 'center', padding: '60px 0', fontSize: '15px' },
  empPanel:       { background: '#fff', borderRadius: '10px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' },
  empTitle:       { margin: '0 0 14px 0', fontSize: '16px', fontWeight: 700, color: '#111827' },
  empForm:        { display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' },
  empInput:       { flex: 1, minWidth: '140px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', outline: 'none' },
  empList:        { display: 'flex', flexDirection: 'column', gap: '6px' },
  empRow:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' },
  empName:        { fontSize: '13px', fontWeight: 600, color: '#111827', display: 'block' },
  empDetail:      { fontSize: '11px', color: '#6b7280' },
  grid:           { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' },
  card:           { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '10px' },
  cardHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle:      { margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' },
  cardDesc:       { margin: 0, color: '#6b7280', fontSize: '14px' },
  cardMeta:       { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  metaItem:       { fontSize: '13px', color: '#6b7280' },
  cardFooter:     { borderTop: '1px solid #f3f4f6', paddingTop: '12px', marginTop: '4px' },
  membersSection: { background: '#f9fafb', borderRadius: '8px', padding: '12px', marginTop: '4px' },
  membersHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  membersTitle:   { fontSize: '13px', fontWeight: 700, color: '#374151' },
  btnAddMember:   { border: '1px solid #2563eb', background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' },
  membersList:    { display: 'flex', flexDirection: 'column', gap: '6px' },
  memberRow:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e5e7eb' },
  memberInfo:     { display: 'flex', flexDirection: 'column', gap: '2px' },
  memberName:     { fontSize: '13px', fontWeight: 600, color: '#111827' },
  memberRole:     { fontSize: '11px', color: '#6b7280' },
  btnRemove:      { border: 'none', background: 'transparent', color: '#d1d5db', cursor: 'pointer', fontSize: '14px', padding: '0 4px' },
  noData:         { margin: 0, fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' },
  addForm:        { display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' },
  btnConfirm:     { border: 'none', background: '#2563eb', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
  inputSmall:     { flex: 1, minWidth: '120px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', outline: 'none' },
  overlay:        { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:          { background: '#fff', borderRadius: '12px', padding: '28px', width: '560px', maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  modalTitle:     { margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' },
  modalActions:   { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' },
  label:          { display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px', color: '#374151' },
  input:          { width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px', outline: 'none' } as React.CSSProperties,
  row:            { display: 'flex', gap: '16px' },
};
