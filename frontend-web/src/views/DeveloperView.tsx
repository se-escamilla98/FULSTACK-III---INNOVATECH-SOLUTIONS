import React, { useEffect, useState } from 'react';
import bffClient from '../api/bffClient';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  area: string;
  teamId: string;
}

interface Task {
  id: string;
  name: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  area: string;
  assignedTo: string;
  projectId: string;
  teamId: string;
}

type TaskStatus = Task['status'];

const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING:     '⏳ Pendiente',
  IN_PROGRESS: '🔄 En Progreso',
  COMPLETED:   '✅ Completada',
  BLOCKED:     '🚫 Bloqueada',
};

const STATUS_COLORS: Record<TaskStatus, React.CSSProperties> = {
  PENDING:     { background: '#fef9c3', color: '#854d0e' },
  IN_PROGRESS: { background: '#dbeafe', color: '#1e40af' },
  COMPLETED:   { background: '#dcfce7', color: '#15803d' },
  BLOCKED:     { background: '#fee2e2', color: '#b91c1c' },
};

const PROJECT_STATUS_COLORS: Record<string, React.CSSProperties> = {
  ACTIVE:    { background: '#dcfce7', color: '#15803d' },
  INACTIVE:  { background: '#e2e8f0', color: '#475569' },
  COMPLETED: { background: '#dbeafe', color: '#1e40af' },
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function DeveloperView({ displayName }: { displayName: string }) {

  // ── Proyectos ─────────────────────────────────────────────────────────────
  const [projects, setProjects]           = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // ── Tareas ────────────────────────────────────────────────────────────────
  const [tasks, setTasks]         = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // ── Modal nueva tarea ─────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [taskForm, setTaskForm]   = useState({
    name: '', description: '', area: '', assignedTo: '',
  });

  // ── Editar estado de tarea ────────────────────────────────────────────────
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<TaskStatus>('PENDING');

  // ── Error/éxito ───────────────────────────────────────────────────────────
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ─── Carga inicial de proyectos ─────────────────────────────────────────
  useEffect(() => {
    loadProjects();
  }, []);

  // ─── Auto-ocultar mensajes ──────────────────────────────────────────────
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(t); }
  }, [success]);
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(null), 5000); return () => clearTimeout(t); }
  }, [error]);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await bffClient.get('/projects');
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch { setError('No se pudieron cargar los proyectos.'); }
    finally { setLoadingProjects(false); }
  };

  const loadTasks = async (projectId: string) => {
    setLoadingTasks(true); setTasks([]);
    try {
      const res = await bffClient.get(`/projects/${projectId}/tasks`);
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch { setError('No se pudieron cargar las tareas.'); }
    finally { setLoadingTasks(false); }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    loadTasks(project.id);
    setShowModal(false);
    setEditingId(null);
  };

  const handleBack = () => {
    setSelectedProject(null);
    setTasks([]);
    setShowModal(false);
    setEditingId(null);
  };

  // ─── Crear tarea ─────────────────────────────────────────────────────────
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setSaving(true);
    try {
      await bffClient.post('/tasks', {
        ...taskForm,
        projectId: selectedProject.id,
        teamId:    selectedProject.teamId,
        status:    'PENDING',
      });
      setSuccess('Tarea creada correctamente.');
      setShowModal(false);
      setTaskForm({ name: '', description: '', area: '', assignedTo: '' });
      await loadTasks(selectedProject.id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear la tarea.');
    } finally { setSaving(false); }
  };

  // ─── Cambiar estado de tarea ─────────────────────────────────────────────
  const handleUpdateStatus = async (taskId: string) => {
    try {
      await bffClient.patch(`/tasks/${taskId}`, { status: editingStatus });
      setSuccess('Estado actualizado.');
      setEditingId(null);
      if (selectedProject) await loadTasks(selectedProject.id);
    } catch { setError('No se pudo actualizar el estado.'); }
  };

  // ─── Agrupación de tareas por estado ────────────────────────────────────
  const tasksByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status);

  // ─── Estadísticas rápidas ────────────────────────────────────────────────
  const stats = {
    total:      tasks.length,
    pending:    tasksByStatus('PENDING').length,
    inProgress: tasksByStatus('IN_PROGRESS').length,
    completed:  tasksByStatus('COMPLETED').length,
    blocked:    tasksByStatus('BLOCKED').length,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: Lista de proyectos
  // ═══════════════════════════════════════════════════════════════════════════
  if (!selectedProject) {
    return (
      <div>
        <div style={s.toolbar}>
          <div>
            <h2 style={s.viewTitle}>Mis Proyectos</h2>
            <p style={s.subtitle}>Hola, <strong>{displayName}</strong> — selecciona un proyecto para gestionar sus tareas</p>
          </div>
        </div>

        {error   && <div style={s.alertError}>{error}<button style={s.alertClose} onClick={() => setError(null)}>✕</button></div>}
        {success && <div style={s.alertSuccess}>{success}</div>}

        {loadingProjects && <p style={s.loadingText}>Cargando proyectos...</p>}

        {!loadingProjects && projects.length === 0 && (
          <div style={s.empty}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📁</div>
            <div>No hay proyectos disponibles aún.</div>
          </div>
        )}

        <div style={s.projectGrid}>
          {projects.map(project => (
            <div key={project.id} style={s.projectCard} onClick={() => handleSelectProject(project)}>
              <div style={s.projectCardHeader}>
                <span style={{ ...s.statusBadge, ...PROJECT_STATUS_COLORS[project.status] || PROJECT_STATUS_COLORS.ACTIVE }}>
                  {project.status}
                </span>
                <span style={s.areaBadge}>{project.area}</span>
              </div>
              <h3 style={s.projectName}>{project.name}</h3>
              <p style={s.projectDesc}>{project.description}</p>
              <div style={s.projectFooter}>
                <span style={s.enterHint}>Ver tareas →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: Tareas del proyecto seleccionado
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div>
      {/* ── Header ── */}
      <div style={s.toolbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={s.btnBack} onClick={handleBack}>← Volver</button>
          <div>
            <h2 style={s.viewTitle}>{selectedProject.name}</h2>
            <p style={s.subtitle}>{selectedProject.description}</p>
          </div>
        </div>
        <button style={s.btnPrimary} onClick={() => setShowModal(true)}>+ Nueva Tarea</button>
      </div>

      {error   && <div style={s.alertError}>{error}<button style={s.alertClose} onClick={() => setError(null)}>✕</button></div>}
      {success && <div style={s.alertSuccess}>{success}</div>}

      {/* ── Estadísticas ── */}
      <div style={s.statsRow}>
        {[
          { label: 'Total',       value: stats.total,      color: '#6b7280' },
          { label: 'Pendientes',  value: stats.pending,    color: '#854d0e' },
          { label: 'En Progreso', value: stats.inProgress, color: '#1e40af' },
          { label: 'Completadas', value: stats.completed,  color: '#15803d' },
          { label: 'Bloqueadas',  value: stats.blocked,    color: '#b91c1c' },
        ].map(stat => (
          <div key={stat.label} style={s.statCard}>
            <span style={{ ...s.statValue, color: stat.color }}>{stat.value}</span>
            <span style={s.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── Tablero kanban por estado ── */}
      {loadingTasks && <p style={s.loadingText}>Cargando tareas...</p>}

      {!loadingTasks && tasks.length === 0 && (
        <div style={s.empty}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📝</div>
          <div>No hay tareas aún. Crea la primera con "+ Nueva Tarea".</div>
        </div>
      )}

      {!loadingTasks && tasks.length > 0 && (
        <div style={s.kanban}>
          {(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'] as TaskStatus[]).map(status => (
            <div key={status} style={s.kanbanCol}>
              <div style={{ ...s.kanbanHeader, ...STATUS_COLORS[status] }}>
                {STATUS_LABELS[status]} <span style={s.kanbanCount}>{tasksByStatus(status).length}</span>
              </div>
              <div style={s.kanbanBody}>
                {tasksByStatus(status).length === 0 && (
                  <p style={s.noTasks}>Sin tareas</p>
                )}
                {tasksByStatus(status).map(task => (
                  <div key={task.id} style={s.taskCard}>
                    <div style={s.taskName}>{task.name}</div>
                    {task.description && <div style={s.taskDesc}>{task.description}</div>}
                    <div style={s.taskMeta}>
                      <span style={s.taskMetaItem}>📂 {task.area}</span>
                      <span style={s.taskMetaItem}>👤 {task.assignedTo}</span>
                    </div>

                    {/* Cambiar estado */}
                    {editingId === task.id ? (
                      <div style={s.editRow}>
                        <select style={s.selectSmall} value={editingStatus}
                          onChange={e => setEditingStatus(e.target.value as TaskStatus)}>
                          {(Object.keys(STATUS_LABELS) as TaskStatus[]).map(st => (
                            <option key={st} value={st}>{STATUS_LABELS[st]}</option>
                          ))}
                        </select>
                        <button style={s.btnConfirm} onClick={() => handleUpdateStatus(task.id)}>✓</button>
                        <button style={s.btnCancel}  onClick={() => setEditingId(null)}>✕</button>
                      </div>
                    ) : (
                      <button style={s.btnChangeStatus} onClick={() => { setEditingId(task.id); setEditingStatus(task.status); }}>
                        Cambiar estado
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ MODAL NUEVA TAREA ═══ */}
      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Nueva Tarea</h3>
              <button style={s.alertClose} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <p style={s.modalSubtitle}>Proyecto: <strong>{selectedProject.name}</strong></p>

            <form onSubmit={handleCreateTask}>
              <label style={s.label}>Nombre de la tarea *</label>
              <input style={s.input} required placeholder="Ej: Implementar autenticación JWT"
                value={taskForm.name} onChange={e => setTaskForm(f => ({ ...f, name: e.target.value }))} />

              <label style={s.label}>Descripción</label>
              <textarea style={{ ...s.input, height: '70px', resize: 'vertical' }}
                placeholder="Describe brevemente la tarea..."
                value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} />

              <div style={s.formRow}>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Área *</label>
                  <select style={s.input} required value={taskForm.area}
                    onChange={e => setTaskForm(f => ({ ...f, area: e.target.value }))}>
                    <option value="">Seleccionar...</option>
                    {['Backend', 'Frontend', 'DevOps', 'QA', 'Diseño', 'Full Stack', 'Base de Datos'].map(a =>
                      <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Asignado a *</label>
                  <input style={s.input} required placeholder="Nombre del responsable"
                    value={taskForm.assignedTo} onChange={e => setTaskForm(f => ({ ...f, assignedTo: e.target.value }))} />
                </div>
              </div>

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

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  toolbar:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  viewTitle:      { margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827' },
  subtitle:       { margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' },
  btnPrimary:     { padding: '9px 18px', border: 'none', borderRadius: '6px', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap' },
  btnSecondary:   { padding: '9px 18px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '14px' },
  btnBack:        { padding: '7px 14px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', color: '#374151', cursor: 'pointer', fontSize: '13px', fontWeight: 600 },
  btnChangeStatus:{ border: '1px solid #d1d5db', background: '#f9fafb', color: '#374151', padding: '4px 10px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer', marginTop: '8px', width: '100%' },
  btnConfirm:     { border: 'none', background: '#2563eb', color: '#fff', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer' },
  btnCancel:      { border: '1px solid #d1d5db', background: '#fff', color: '#6b7280', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer' },
  alertError:     { background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' },
  alertSuccess:   { background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  alertClose:     { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: 'inherit' },
  loadingText:    { color: '#6b7280', textAlign: 'center', padding: '40px 0' },
  empty:          { color: '#9ca3af', textAlign: 'center', padding: '60px 0', fontSize: '15px' },
  // Proyectos
  projectGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
  projectCard:    { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', cursor: 'pointer', transition: 'box-shadow .15s', border: '2px solid transparent' },
  projectCardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  statusBadge:    { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 },
  areaBadge:      { background: '#f3f4f6', color: '#374151', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 },
  projectName:    { margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700, color: '#111827' },
  projectDesc:    { margin: '0 0 12px 0', fontSize: '13px', color: '#6b7280', lineHeight: 1.5 },
  projectFooter:  { borderTop: '1px solid #f3f4f6', paddingTop: '10px' },
  enterHint:      { fontSize: '13px', color: '#2563eb', fontWeight: 600 },
  // Stats
  statsRow:       { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  statCard:       { background: '#fff', borderRadius: '8px', padding: '12px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' },
  statValue:      { fontSize: '22px', fontWeight: 800 },
  statLabel:      { fontSize: '11px', color: '#9ca3af', marginTop: '2px' },
  // Kanban
  kanban:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', alignItems: 'start' },
  kanbanCol:      { background: '#f9fafb', borderRadius: '10px', overflow: 'hidden' },
  kanbanHeader:   { padding: '10px 14px', fontWeight: 700, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  kanbanCount:    { background: 'rgba(0,0,0,0.1)', borderRadius: '10px', padding: '1px 7px', fontSize: '12px' },
  kanbanBody:     { padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '60px' },
  taskCard:       { background: '#fff', borderRadius: '8px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  taskName:       { fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '4px' },
  taskDesc:       { fontSize: '12px', color: '#6b7280', marginBottom: '6px', lineHeight: 1.4 },
  taskMeta:       { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' },
  taskMetaItem:   { fontSize: '11px', color: '#9ca3af' },
  editRow:        { display: 'flex', gap: '6px', marginTop: '8px', alignItems: 'center' },
  selectSmall:    { flex: 1, padding: '4px 8px', borderRadius: '5px', border: '1px solid #d1d5db', fontSize: '12px' },
  noTasks:        { fontSize: '12px', color: '#d1d5db', fontStyle: 'italic', textAlign: 'center', padding: '8px 0' },
  // Modal
  overlay:        { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:          { background: '#fff', borderRadius: '12px', padding: '28px', width: '520px', maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  modalTitle:     { margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' },
  modalSubtitle:  { margin: '0 0 18px 0', fontSize: '13px', color: '#6b7280' },
  modalActions:   { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' },
  label:          { display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px', color: '#374151' },
  input:          { width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px', outline: 'none' } as React.CSSProperties,
  formRow:        { display: 'flex', gap: '16px' },
};
