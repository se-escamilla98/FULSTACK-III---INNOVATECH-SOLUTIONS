import React, { useEffect, useState } from 'react';
import bffClient from '../api/bffClient';

interface Project {
  id: string; name: string; description: string;
  status: string; area: string; teamId?: string;
}
interface Member { id: string; employeeId: string; name: string; role: string; }
interface Team   { id: string; name: string; members: Member[]; }
interface Task {
  id: string; name: string; description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  area: string; assignedTo: string; projectId: string; teamId: string;
  logs?: TaskLog[];
}
interface TaskLog {
  id: string; authorName: string; comment: string; createdAt: string;
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
  ACTIVE:      { background: '#dcfce7', color: '#15803d' },
  INACTIVE:    { background: '#e2e8f0', color: '#475569' },
  COMPLETED:   { background: '#dbeafe', color: '#1e40af' },
  PLANNED:     { background: '#fef9c3', color: '#854d0e' },
  IN_PROGRESS: { background: '#dbeafe', color: '#1e40af' },
  ON_HOLD:     { background: '#fef3c7', color: '#b45309' },
  CANCELLED:   { background: '#fee2e2', color: '#b91c1c' },
};

export default function DeveloperView({
  displayName,
  employeeId,
}: {
  displayName: string;
  employeeId:  string;
}) {
  const [allProjects, setAllProjects]         = useState<Project[]>([]);
  const [myTeamIds, setMyTeamIds]             = useState<string[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks]                     = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks]       = useState(false);
  const [showModal, setShowModal]             = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [taskForm, setTaskForm] = useState({ name: '', description: '', area: '' });
  const [editingId, setEditingId]             = useState<string | null>(null);
  const [editingStatus, setEditingStatus]     = useState<TaskStatus>('PENDING');
  const [error, setError]                     = useState<string | null>(null);
  const [success, setSuccess]                 = useState<string | null>(null);

  // Bitácora
  const [logTaskId, setLogTaskId]   = useState<string | null>(null);
  const [logComment, setLogComment] = useState('');
  const [logSaving, setLogSaving]   = useState(false);

  useEffect(() => { loadData(); }, [employeeId]);
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(t); }
  }, [success]);
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(null), 5000); return () => clearTimeout(t); }
  }, [error]);

  const loadData = async () => {
    setLoadingProjects(true);
    try {
      const [pRes, tRes] = await Promise.all([
        bffClient.get('/projects'),
        bffClient.get('/teams'),
      ]);
      const projects = Array.isArray(pRes.data) ? pRes.data : [];
      const teams    = Array.isArray(tRes.data) ? tRes.data : [];
      const teamIds  = teams
        .filter((t: Team) => t.members?.some((m: Member) => m.employeeId === employeeId))
        .map((t: Team) => t.id);
      setMyTeamIds(teamIds);
      setAllProjects(projects);
    } catch { setError('No se pudieron cargar los datos.'); }
    finally { setLoadingProjects(false); }
  };

  const myProjects = employeeId
    ? allProjects.filter(p => p.teamId && myTeamIds.includes(p.teamId))
    : [];

  const loadTasks = async (projectId: string) => {
    setLoadingTasks(true); setTasks([]);
    try {
      const res = await bffClient.get(`/projects/${projectId}/tasks`);
      const taskList = Array.isArray(res.data) ? res.data : [];
      // Cargar logs de cada tarea
      const tasksWithLogs = await Promise.all(
        taskList.map(async (t: Task) => {
          try {
            const logRes = await bffClient.get(`/tasks/${t.id}/logs`);
            return { ...t, logs: Array.isArray(logRes.data) ? logRes.data : [] };
          } catch { return { ...t, logs: [] }; }
        })
      );
      setTasks(tasksWithLogs);
    } catch { setError('No se pudieron cargar las tareas.'); }
    finally { setLoadingTasks(false); }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    loadTasks(project.id);
    setShowModal(false);
    setEditingId(null);
    setLogTaskId(null);
  };

  const handleBack = () => {
    setSelectedProject(null);
    setTasks([]);
    setShowModal(false);
    setEditingId(null);
    setLogTaskId(null);
  };

  const isMyTask = (task: Task): boolean => {
    if (!employeeId) return false;
    return task.assignedTo === employeeId;
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !employeeId) return;
    setSaving(true);
    try {
      const res = await bffClient.post('/tasks', {
        ...taskForm,
        projectId:  selectedProject.id,
        teamId:     selectedProject.teamId || '',
        status:     'PENDING',
        assignedTo: employeeId,
      });
      setTasks(prev => [...prev, { ...res.data, logs: [] }]);
      setSuccess('Tarea creada y asignada a ti correctamente.');
      setShowModal(false);
      setTaskForm({ name: '', description: '', area: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear la tarea.');
    } finally { setSaving(false); }
  };

  const handleUpdateStatus = async (taskId: string) => {
    try {
      await bffClient.patch(`/tasks/${taskId}`, { status: editingStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: editingStatus } : t));
      setSuccess('Estado actualizado.');
      setEditingId(null);
    } catch { setError('No se pudo actualizar el estado.'); }
  };

  // ── Bitácora ──────────────────────────────────────────────────────────────
  const openLog = async (taskId: string) => {
    setLogTaskId(taskId); setLogComment('');
    try {
      const res = await bffClient.get(`/tasks/${taskId}/logs`);
      setTasks(prev => prev.map(t => t.id === taskId
        ? { ...t, logs: Array.isArray(res.data) ? res.data : [] } : t));
    } catch { setError('No se pudo cargar la bitácora.'); }
  };

  const handleAddLog = async () => {
    if (!logComment.trim() || !logTaskId) return;
    setLogSaving(true);
    try {
      await bffClient.post(`/tasks/${logTaskId}/logs`, {
        employeeId: employeeId,
        authorName: displayName,
        comment:    logComment.trim(),
      });
      setLogComment('');
      const res = await bffClient.get(`/tasks/${logTaskId}/logs`);
      setTasks(prev => prev.map(t => t.id === logTaskId
        ? { ...t, logs: Array.isArray(res.data) ? res.data : [] } : t));
      setSuccess('Entrada agregada a la bitácora.');
    } catch { setError('No se pudo agregar la entrada.'); }
    finally { setLogSaving(false); }
  };

  const handleDeleteLog = async (taskId: string, logId: string) => {
    if (!window.confirm('¿Eliminar esta entrada de la bitácora?')) return;
    try {
      await bffClient.delete(`/tasks/${taskId}/logs/${logId}`);
      setTasks(prev => prev.map(t => t.id === taskId
        ? { ...t, logs: (t.logs || []).filter(l => l.id !== logId) } : t));
    } catch { setError('No se pudo eliminar la entrada.'); }
  };

  const tasksByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status);
  const logTask = tasks.find(t => t.id === logTaskId);

  const stats = {
    total:      tasks.length,
    mine:       tasks.filter(t => isMyTask(t)).length,
    pending:    tasksByStatus('PENDING').length,
    inProgress: tasksByStatus('IN_PROGRESS').length,
    completed:  tasksByStatus('COMPLETED').length,
    blocked:    tasksByStatus('BLOCKED').length,
  };

  // ═══ RENDER: Lista de proyectos ═══
  if (!selectedProject) {
    return (
      <div>
        <div style={s.toolbar}>
          <div>
            <h2 style={s.viewTitle}>Mis Proyectos</h2>
            <p style={s.subtitle}>
              Hola, <strong>{displayName}</strong>
              {!employeeId && (
                <span style={{ color: '#dc2626', marginLeft: '8px', fontSize: '12px' }}>
                  ⚠️ Sin empleado vinculado — contacta al admin
                </span>
              )}
            </p>
            {employeeId && (
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#d1d5db', fontFamily: 'monospace' }}>
                ID empleado: {employeeId}
              </p>
            )}
          </div>
        </div>

        {error   && <div style={s.alertError}>{error}<button style={s.alertClose} onClick={() => setError(null)}>✕</button></div>}
        {success && <div style={s.alertSuccess}>{success}</div>}
        {loadingProjects && <p style={s.loadingText}>Cargando proyectos...</p>}

        {!loadingProjects && employeeId && myProjects.length === 0 && (
          <div style={s.empty}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📁</div>
            <div>No tienes proyectos asignados aún.</div>
            <div style={{ fontSize: '12px', color: '#d1d5db', marginTop: '8px' }}>
              El admin debe asignarte a un equipo y el equipo a un proyecto.
            </div>
          </div>
        )}

        {!loadingProjects && !employeeId && (
          <div style={s.empty}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
            <div>Tu cuenta no está vinculada a un empleado.</div>
          </div>
        )}

        <div style={s.projectGrid}>
          {myProjects.map(project => (
            <div key={project.id} style={s.projectCard} onClick={() => handleSelectProject(project)}>
              <div style={s.projectCardHeader}>
                <span style={{ ...s.statusBadge, ...(PROJECT_STATUS_COLORS[project.status] || PROJECT_STATUS_COLORS.PLANNED) }}>
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

  // ═══ RENDER: Tareas del proyecto ═══
  return (
    <div>
      <div style={s.toolbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={s.btnBack} onClick={handleBack}>← Volver</button>
          <div>
            <h2 style={s.viewTitle}>{selectedProject.name}</h2>
            <p style={s.subtitle}>{selectedProject.description}</p>
          </div>
        </div>
        {employeeId && (
          <button style={s.btnPrimary} onClick={() => setShowModal(true)}>+ Nueva Tarea</button>
        )}
      </div>

      {error   && <div style={s.alertError}>{error}<button style={s.alertClose} onClick={() => setError(null)}>✕</button></div>}
      {success && <div style={s.alertSuccess}>{success}</div>}

      <div style={s.statsRow}>
        {[
          { label: 'Total',       value: stats.total,      color: '#6b7280' },
          { label: 'Mis tareas',  value: stats.mine,       color: '#059669' },
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

      {loadingTasks && <p style={s.loadingText}>Cargando tareas...</p>}
      {!loadingTasks && tasks.length === 0 && (
        <div style={s.empty}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📝</div>
          <div>No hay tareas aún.{employeeId && ' Crea la primera con "+ Nueva Tarea".'}</div>
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
                {tasksByStatus(status).length === 0 && <p style={s.noTasks}>Sin tareas</p>}
                {tasksByStatus(status).map(task => (
                  <div key={task.id} style={{
                    ...s.taskCard,
                    borderLeft: isMyTask(task) ? '3px solid #059669' : '3px solid #e5e7eb',
                  }}>
                    <div style={s.taskName}>{task.name}</div>
                    {task.description && <div style={s.taskDesc}>{task.description}</div>}
                    <div style={s.taskMeta}>
                      <span style={s.taskMetaItem}>📂 {task.area}</span>
                      {isMyTask(task) && (
                        <span style={{ ...s.taskMetaItem, color: '#059669', fontWeight: 600 }}>✓ Mi tarea</span>
                      )}
                    </div>

                    {/* Bitácora — todos pueden ver, solo el dueño puede agregar/eliminar */}
                    <button style={s.btnLog} onClick={() => openLog(task.id)}>
                      📋 Bitácora {task.logs && task.logs.length > 0 && `(${task.logs.length})`}
                    </button>

                    {/* Cambiar estado — solo el dueño */}
                    {isMyTask(task) ? (
                      editingId === task.id ? (
                        <div style={s.editRow}>
                          <select style={s.selectSmall} value={editingStatus}
                            onChange={e => setEditingStatus(e.target.value as TaskStatus)}>
                            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map(st => (
                              <option key={st} value={st}>{STATUS_LABELS[st]}</option>
                            ))}
                          </select>
                          <button style={s.btnConfirm} onClick={() => handleUpdateStatus(task.id)}>✓</button>
                          <button style={s.btnCancel} onClick={() => setEditingId(null)}>✕</button>
                        </div>
                      ) : (
                        <button style={s.btnChangeStatus}
                          onClick={() => { setEditingId(task.id); setEditingStatus(task.status); }}>
                          Cambiar estado
                        </button>
                      )
                    ) : (
                      <span style={s.readOnly}>Solo lectura</span>
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
            <p style={{ ...s.modalSubtitle, color: '#059669' }}>
              Se asignará automáticamente a tu cuenta ({displayName})
            </p>
            <form onSubmit={handleCreateTask}>
              <label style={s.label}>Nombre de la tarea *</label>
              <input style={s.input} required placeholder="Ej: Implementar endpoint de login"
                value={taskForm.name} onChange={e => setTaskForm(f => ({ ...f, name: e.target.value }))} />
              <label style={s.label}>Descripción</label>
              <textarea style={{ ...s.input, height: '70px', resize: 'vertical' }}
                placeholder="Describe brevemente la tarea..."
                value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} />
              <label style={s.label}>Área *</label>
              <select style={s.input} required value={taskForm.area}
                onChange={e => setTaskForm(f => ({ ...f, area: e.target.value }))}>
                <option value="">Seleccionar...</option>
                {['Backend', 'Frontend', 'DevOps', 'QA', 'Diseño', 'Full Stack', 'Base de Datos'].map(a =>
                  <option key={a} value={a}>{a}</option>)}
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

      {/* ═══ MODAL BITÁCORA ═══ */}
      {logTaskId && logTask && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, width: '560px' }}>
            <div style={s.modalHeader}>
              <div>
                <h3 style={s.modalTitle}>📋 Bitácora</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                  {logTask.name}
                  {isMyTask(logTask)
                    ? <span style={{ color: '#059669', marginLeft: '8px', fontWeight: 600 }}>✓ Tu tarea</span>
                    : <span style={{ color: '#9ca3af', marginLeft: '8px' }}>· Solo lectura de estado</span>
                  }
                </p>
              </div>
              <button style={s.alertClose} onClick={() => setLogTaskId(null)}>✕</button>
            </div>

            <div style={s.logList}>
              {(!logTask.logs || logTask.logs.length === 0) && (
                <p style={{ color: '#9ca3af', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>
                  Sin entradas aún.
                </p>
              )}
              {(logTask.logs || []).map(log => (
                <div key={log.id} style={s.logEntry}>
                  <div style={s.logHeader}>
                    <span style={s.logAuthor}>{log.authorName}</span>
                    <span style={s.logDate}>{new Date(log.createdAt).toLocaleString('es-CL')}</span>
                    {/* Solo puede eliminar entradas en sus propias tareas */}
                    {isMyTask(logTask) && (
                      <button style={s.btnRemoveLog}
                        onClick={() => handleDeleteLog(logTaskId, log.id)}>✕</button>
                    )}
                  </div>
                  <p style={s.logComment}>{log.comment}</p>
                </div>
              ))}
            </div>

            {/* Solo puede agregar entradas en sus propias tareas */}
            {isMyTask(logTask) ? (
              <div style={s.logForm}>
                <textarea style={{ ...s.input, height: '70px', resize: 'vertical', marginBottom: '8px' }}
                  placeholder="Escribe una entrada en la bitácora..."
                  value={logComment}
                  onChange={e => setLogComment(e.target.value)} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button style={s.btnSecondary} onClick={() => setLogTaskId(null)}>Cerrar</button>
                  <button style={s.btnPrimary} onClick={handleAddLog}
                    disabled={logSaving || !logComment.trim()}>
                    {logSaving ? 'Guardando...' : '+ Agregar entrada'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button style={s.btnSecondary} onClick={() => setLogTaskId(null)}>Cerrar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  toolbar:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  viewTitle:      { margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827' },
  subtitle:       { margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' },
  btnPrimary:     { padding: '9px 18px', border: 'none', borderRadius: '6px', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap' },
  btnSecondary:   { padding: '9px 18px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '14px' },
  btnBack:        { padding: '7px 14px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', color: '#374151', cursor: 'pointer', fontSize: '13px', fontWeight: 600 },
  btnChangeStatus:{ border: '1px solid #059669', background: '#f0fdf4', color: '#059669', padding: '4px 10px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer', marginTop: '6px', width: '100%', fontWeight: 600 },
  btnLog:         { border: '1px solid #d1d5db', background: '#f9fafb', color: '#374151', padding: '4px 10px', borderRadius: '5px', fontSize: '11px', cursor: 'pointer', marginTop: '6px', width: '100%' },
  btnConfirm:     { border: 'none', background: '#2563eb', color: '#fff', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer' },
  btnCancel:      { border: '1px solid #d1d5db', background: '#fff', color: '#6b7280', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer' },
  btnRemoveLog:   { border: 'none', background: 'transparent', color: '#d1d5db', cursor: 'pointer', fontSize: '13px', padding: '0 4px', marginLeft: 'auto' },
  alertError:     { background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' },
  alertSuccess:   { background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  alertClose:     { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: 'inherit' },
  loadingText:    { color: '#6b7280', textAlign: 'center', padding: '40px 0' },
  empty:          { color: '#9ca3af', textAlign: 'center', padding: '60px 0', fontSize: '15px' },
  projectGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
  projectCard:    { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', cursor: 'pointer', border: '2px solid transparent' },
  projectCardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  statusBadge:    { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 },
  areaBadge:      { background: '#f3f4f6', color: '#374151', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 },
  projectName:    { margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700, color: '#111827' },
  projectDesc:    { margin: '0 0 12px 0', fontSize: '13px', color: '#6b7280', lineHeight: 1.5 },
  projectFooter:  { borderTop: '1px solid #f3f4f6', paddingTop: '10px' },
  enterHint:      { fontSize: '13px', color: '#2563eb', fontWeight: 600 },
  statsRow:       { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  statCard:       { background: '#fff', borderRadius: '8px', padding: '12px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' },
  statValue:      { fontSize: '22px', fontWeight: 800 },
  statLabel:      { fontSize: '11px', color: '#9ca3af', marginTop: '2px' },
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
  readOnly:       { fontSize: '11px', color: '#d1d5db', fontStyle: 'italic', display: 'block', marginTop: '6px', textAlign: 'center' },
  overlay:        { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:          { background: '#fff', borderRadius: '12px', padding: '28px', width: '520px', maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' },
  modalTitle:     { margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' },
  modalSubtitle:  { margin: '0 0 10px 0', fontSize: '13px', color: '#6b7280' },
  modalActions:   { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' },
  label:          { display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px', color: '#374151' },
  input:          { width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px', outline: 'none' } as React.CSSProperties,
  logList:        { maxHeight: '300px', overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  logEntry:       { background: '#f9fafb', borderRadius: '8px', padding: '12px', border: '1px solid #e5e7eb' },
  logHeader:      { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  logAuthor:      { fontSize: '13px', fontWeight: 700, color: '#111827' },
  logDate:        { fontSize: '11px', color: '#9ca3af' },
  logComment:     { margin: 0, fontSize: '13px', color: '#374151', lineHeight: 1.5 },
  logForm:        { borderTop: '1px solid #f3f4f6', paddingTop: '16px' },
};