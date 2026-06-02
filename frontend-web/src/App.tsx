import React, { useEffect, useState } from 'react';
import axios from 'axios';
import bffClient from './api/bffClient';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('admin-key-innovatech'); // Llave por defecto de tu backend
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Verificar si ya existe una sesión guardada previamente al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem('innovatech_token');
    if (token) setIsAuthenticated(true);
  }, []);

  // Efecto que carga los proyectos en cuanto se cuenta con la autorización
  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated]);

  // CORREGIDO: Añadido el tipado explícito del evento del formulario de React
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Petición directa al endpoint público del BFF
      const response = await axios.post('http://localhost:3000/auth/login', {
        apiKey,
        role: 'admin' // requerido por tu firma de body
      });
      
      const { token } = response.data;
      localStorage.setItem('innovatech_token', token);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al intentar autenticar contra el BFF');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await bffClient.get('/projects');
      setProjects(response.data);
    } catch (err: any) {
      setError('Error al obtener la lista de proyectos.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('innovatech_token');
    setIsAuthenticated(false);
    setProjects([]);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5' }}>
        <form onSubmit={handleLogin} style={{ background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '350px' }}>
          <h2 style={{ textAlign: 'center', color: '#1a1a1a', marginBottom: '20px' }}>Innovatech Login</h2>
          {error && <div style={{ color: 'red', marginBottom: '15px', fontSize: '0.9em' }}>{error}</div>}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Ingresa tu API Key:</label>
            <input 
              type="text" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', border: 'none', backgroundColor: '#007bff', color: '#fff', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Validando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #dee2e6', paddingBottom: '15px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#212529' }}>Innovatech Solutions</h1>
          <p style={{ margin: '5px 0 0 0', color: '#6c757d' }}>Panel de Control Escalamiento FullStack III (Duoc UC)</p>
        </div>
        <button onClick={handleLogout} style={{ padding: '10px 15px', border: '1px solid #dc3545', backgroundColor: 'transparent', color: '#dc3545', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Cerrar Sesión
        </button>
      </header>

      {loading && <h3>Cargando información...</h3>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {projects.map((project) => (
          <div key={project.id} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '5px solid #007bff' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#343a40' }}>{project.name}</h3>
            <p style={{ color: '#495057', fontSize: '0.92em', minHeight: '40px' }}>{project.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <span style={{ fontSize: '0.82em', padding: '5px 10px', borderRadius: '20px', fontWeight: 'bold', backgroundColor: project.status === 'COMPLETED' ? '#d4edda' : '#fff3cd', color: project.status === 'COMPLETED' ? '#155724' : '#856404' }}>
                {project.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;