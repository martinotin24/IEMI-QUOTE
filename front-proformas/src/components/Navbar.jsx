// src/components/Navbar.jsx
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Definimos las rutas y sus nombres amigables
  const tabs = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Proformas", path: "/proformas" },
    { name: "Clientes", path: "/clientes" }
  ];

  return (
    <nav style={{ 
      display: 'flex', 
      gap: '20px', 
      padding: '1rem 2rem', 
      backgroundColor: 'var(--white)', 
      borderBottom: '1px solid var(--border-color)',
      marginBottom: '2rem'
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: location.pathname === tab.path ? 'var(--accent)' : 'transparent',
            color: location.pathname === tab.path ? 'white' : 'var(--text-muted)',
            borderRadius: 'var(--radius-md)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: '0.3s'
          }}
        >
          {tab.name}
        </button>
      ))}
    </nav>
  );
}