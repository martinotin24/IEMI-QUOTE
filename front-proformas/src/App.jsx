// src/App.jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';

// Importamos las páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Proformas from './pages/Proformas'; // Generador de nueva proforma
import Historial from './pages/Historial'; // Tabla de historial
import Clientes from './pages/Clientes';
import VistaPDF from './pages/VistaPDF';

// --- LAYOUT MAESTRO (Sidebar Global) ---
function GlobalLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Si estamos en la pantalla de Login, no mostramos el menú
  if (location.pathname === "/" || location.pathname.startsWith("/ver-pdf")) { 
    return <>{children}</>;
  }

  // Función para cerrar sesión globalmente
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { credentials: 'include' });
    } catch (err) {
      console.error(err);
    } finally {
      navigate('/');
    }
  };

  // Pequeña función para marcar en azul la pestaña activa
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="app-container">
      {/* Fondo oscuro para móviles */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar Fijo */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-info">
            <div className="brand-logo-container">I</div>
            <h2 className="brand-name">IEMI PRO</h2>
          </div>
          <button className="close-sidebar-btn" onClick={() => setSidebarOpen(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button className={`nav-link ${isActive('/dashboard')}`} onClick={() => { navigate('/dashboard'); setSidebarOpen(false); }}>
            <i className="fas fa-chart-line"></i> Dashboard
          </button>
          
          <button className={`nav-link ${isActive('/iemi')}`} onClick={() => { navigate('/iemi'); setSidebarOpen(false); }}>
            <i className="fas fa-plus-circle"></i> Nueva Proforma
          </button>
          
          <button className={`nav-link ${isActive('/clientes')}`} onClick={() => { navigate('/clientes'); setSidebarOpen(false); }}>
            <i className="fas fa-users"></i> Clientes
          </button>
          
          <button className={`nav-link ${isActive('/proformas')}`} onClick={() => { navigate('/proformas'); setSidebarOpen(false); }}>
            <i className="fas fa-file-invoice"></i> Historial
          </button>
          
          <div className="logout-container">
            <button onClick={handleLogout} className="btn-logout">
              <i className="fas fa-sign-out-alt"></i> Salir del sistema
            </button>
          </div>
        </nav>
      </aside>

      {/* Área Central Dinámica */}
      <main className="main-content">
        {/* Botón de hamburguesa global (Solo visible en móviles) */}
        <div style={{ display: 'flex', marginBottom: '1rem' }}>
          <button className="menu-toggle-btn" onClick={() => setSidebarOpen(true)}>
            <i className="fas fa-bars"></i>
          </button>
        </div>
        
        {/* Aquí se inyectan Dashboard, Historial, etc. */}
        {children}
      </main>
    </div>
  );
}

// --- CONFIGURACIÓN DE RUTAS ---
function App() {
  return (
    <BrowserRouter>
      <GlobalLayout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/iemi" element={<Proformas />} />
          <Route path="/proformas" element={<Historial />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/ver-pdf/:id" element={<VistaPDF />} />
        </Routes>
      </GlobalLayout>
    </BrowserRouter>
  );
}

export default App;