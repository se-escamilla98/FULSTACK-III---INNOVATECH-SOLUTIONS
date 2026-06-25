import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProjectsView  from './views/ProjectsView';
import TasksView     from './views/TasksView';
import TeamsView     from './views/TeamsView';
import DeveloperView from './views/DeveloperView';
import ReaderView    from './views/ReaderView';
import { BFF_BASE }  from './api/bffClient';
import bffClient     from './api/bffClient';

type Role = 'admin' | 'developer' | 'reader';
type Tab  = 'projects' | 'tasks' | 'teams' | 'developer' | 'reports';

const formatRut = (value: string): string => {
  const clean = value.replace(/[^0-9kK]/g, '').toLowerCase();
  if (clean.length < 2) return clean;
  const dv  = clean.slice(-1);
  const num = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${num}-${dv}`;
};

const TABS_BY_ROLE: Record<Role, { key: Tab; label: string }[]> = {
  admin:     [
    { key: 'projects', label: '📁 Proyectos' },
    { key: 'tasks',    label: '✅ Tareas'    },
    { key: 'teams',    label: '🏢 Equipos'   },
  ],
  developer: [{ key: 'developer', label: '💻 Mi Trabajo' }],
  reader:    [{ key: 'reports',   label: '📊 Reportes'  }],
};

const DEFAULT_TAB: Record<Role, Tab> = {
  admin:     'projects',
  developer: 'developer',
  reader:    'reports',
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [displayName, setDisplayName]         = useState('');
  const [role, setRole]                       = useState<Role>('reader');
  const [employeeId, setEmployeeId]           = useState<string>('');
  const [username, setUsername]               = useState('');
  const [password, setPassword]               = useState('');
  const [error, setError]                     = useState<string | null>(null);
  const [loading, setLoading]                 = useState(false);
  const [activeTab, setActiveTab]             = useState<Tab>('projects');
  const [checkingToken, setCheckingToken]     = useState(true);

  useEffect(() => {
    const token           = localStorage.getItem('innovatech_token');
    const savedName       = localStorage.getItem('innovatech_display');
    const savedRole       = localStorage.getItem('innovatech_role') as Role | null;
    const savedEmployeeId = localStorage.getItem('innovatech_employeeId') || '';

    if (!token) {
      setCheckingToken(false);
      return;
    }

    bffClient.get('/projects')
      .then(() => {
        setIsAuthenticated(true);
        setDisplayName(savedName || '');
        setRole(savedRole || 'reader');
        setEmployeeId(savedEmployeeId);
        setActiveTab(DEFAULT_TAB[savedRole || 'reader']);
      })
      .catch(() => {
        const currentToken = localStorage.getItem('innovatech_token');
        if (currentToken) {
          setIsAuthenticated(true);
          setDisplayName(savedName || '');
          setRole(savedRole || 'reader');
          setEmployeeId(savedEmployeeId);
          setActiveTab(DEFAULT_TAB[savedRole || 'reader']);
        }
      })
      .finally(() => setCheckingToken(false));
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await axios.post(`${BFF_BASE}/auth/login`, { username, password });
      const userRole = response.data.role as Role;
      const empId    = response.data.employeeId || '';
      localStorage.setItem('innovatech_token',      response.data.token);
      localStorage.setItem('innovatech_display',    response.data.displayName);
      localStorage.setItem('innovatech_role',       userRole);
      localStorage.setItem('innovatech_employeeId', empId);
      setDisplayName(response.data.displayName);
      setRole(userRole);
      setEmployeeId(empId);
      setActiveTab(DEFAULT_TAB[userRole]);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al autenticar contra el BFF');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('innovatech_token');
    localStorage.removeItem('innovatech_display');
    localStorage.removeItem('innovatech_role');
    localStorage.removeItem('innovatech_employeeId');
    setIsAuthenticated(false);
    setDisplayName('');
    setRole('reader');
    setEmployeeId('');
    setUsername('');
    setPassword('');
  };

  const roleBadge = () => {
    if (role === 'admin')     return { label: 'Admin',     bg: '#2563eb' };
    if (role === 'developer') return { label: 'Developer', bg: '#059669' };
    return                           { label: 'Lector',    bg: '#6b7280' };
  };

  if (checkingToken) {
    return (
      <div style={s.loginWrapper}>
        <div style={{ color: '#6b7280', fontSize: '14px' }}>Verificando sesión...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={s.loginWrapper}>
        <form onSubmit={handleLogin} style={s.loginForm}>
          <div style={s.loginLogo}>IS</div>
          <h2 style={s.loginTitle}>Innovatech Solutions</h2>
          <p style={s.loginSub}>Panel de Control · FullStack III DuocUC</p>
          {error && <div style={s.alertError}>{error}</div>}
          <label style={s.label}>Usuario</label>
          <input
            type="text"
            value={username}
            onChange={e => {
              const val = e.target.value;
              const isRut = /^[\d.kK-]+$/.test(val.replace(/[^0-9kK.-]/g, ''));
              setUsername(isRut && val.replace(/[^0-9kK]/g, '').length > 2 ? formatRut(val) : val);
            }}
            style={s.input}
            placeholder="admin / lector / RUT del developer"
            autoComplete="username"
            required
          />
          <label style={s.label}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={s.input}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <button type="submit" disabled={loading} style={s.btnPrimary}>
            {loading ? 'Validando...' : 'Iniciar Sesión'}
          </button>
          <div style={s.loginHint}>
            <strong>Usuarios del sistema:</strong><br />
            admin / admin123 &nbsp;·&nbsp; lector / lector123<br />
            <strong>Developers:</strong> ingresar con RUT y clave asignada
          </div>
        </form>
      </div>
    );
  }

  const badge = roleBadge();
  const tabs  = TABS_BY_ROLE[role] || TABS_BY_ROLE.reader;

  return (
    <div style={s.appWrapper}>
      <header style={s.header}>
        <div>
          <h1 style={s.headerTitle}>Innovatech Solutions</h1>
          <p style={s.headerSub}>Panel de Control · FullStack III DuocUC</p>
        </div>
        <div style={s.headerRight}>
          {displayName && (
            <span style={s.headerUser}>
              Hola, {displayName}
              <span style={{
                marginLeft: '8px',
                background: badge.bg,
                color: '#fff',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 700,
              }}>
                {badge.label}
              </span>
            </span>
          )}
          <button onClick={handleLogout} style={s.btnLogout}>Cerrar Sesión</button>
        </div>
      </header>

      {tabs.length > 1 && (
        <nav style={s.nav}>
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{ ...s.navBtn, ...(activeTab === key ? s.navBtnActive : {}) }}
            >
              {label}
            </button>
          ))}
        </nav>
      )}

      <main style={s.main}>
        {activeTab === 'projects'  && <ProjectsView role={role} />}
        {activeTab === 'tasks'     && <TasksView    role={role} />}
        {activeTab === 'teams'     && <TeamsView    role={role} />}
        {activeTab === 'developer' && <DeveloperView displayName={displayName} employeeId={employeeId} />}
        {activeTab === 'reports'   && <ReaderView />}
      </main>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  loginWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif' },
  loginForm:    { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', width: '360px', textAlign: 'center' },
  loginLogo:    { width: '56px', height: '56px', borderRadius: '12px', background: '#2563eb', color: '#fff', fontSize: '22px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' },
  loginTitle:   { margin: '0 0 4px 0', fontSize: '22px', color: '#111827' },
  loginSub:     { margin: '0 0 24px 0', fontSize: '13px', color: '#6b7280' },
  alertError:   { background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', textAlign: 'left' },
  label:        { display: 'block', textAlign: 'left', fontWeight: 600, fontSize: '13px', marginBottom: '6px', color: '#374151' },
  input:        { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', marginBottom: '16px', outline: 'none' } as React.CSSProperties,
  btnPrimary:   { width: '100%', padding: '11px', border: 'none', borderRadius: '6px', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: '15px', cursor: 'pointer' },
  loginHint:    { marginTop: '20px', padding: '12px', background: '#f8fafc', borderRadius: '6px', fontSize: '12px', color: '#6b7280', lineHeight: '1.6', textAlign: 'center' },
  appWrapper:   { minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e3a5f', color: '#fff', padding: '16px 32px' },
  headerTitle:  { margin: 0, fontSize: '20px', fontWeight: 700 },
  headerSub:    { margin: '2px 0 0 0', fontSize: '12px', color: '#93c5fd' },
  headerRight:  { display: 'flex', alignItems: 'center', gap: '14px' },
  headerUser:   { color: '#bfdbfe', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center' },
  btnLogout:    { padding: '8px 16px', border: '1px solid #ef4444', borderRadius: '6px', background: 'transparent', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '13px' },
  nav:          { display: 'flex', gap: '4px', background: '#fff', padding: '0 32px', borderBottom: '1px solid #e5e7eb' },
  navBtn:       { padding: '14px 20px', border: 'none', background: 'transparent', color: '#6b7280', fontWeight: 600, fontSize: '14px', cursor: 'pointer', borderBottom: '3px solid transparent' },
  navBtnActive: { color: '#2563eb', borderBottom: '3px solid #2563eb' },
  main:         { padding: '32px' },
};

export default App;