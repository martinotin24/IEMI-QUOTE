// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  // Estado estructurado para almacenar las analíticas del negocio
  const [stats, setStats] = useState({
    totalProformas: 0,
    proformasMes: 0,
    totalClientes: 0,
    ingresosTotales: 0
  });

  // Consulta y filtrado de estadísticas
  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const res = await fetch('/api/proformas', { credentials: 'include' });
        
        if (!res.ok) {
          console.log("Servidor detectado pero sin conexión activa a la BD.");
          return;
        }
        
        const proformas = await res.json();

        const ahora = new Date();
        const mesActual = ahora.getMonth();
        const anioActual = ahora.getFullYear();
        
        const filtradoMes = proformas.filter(p => {
          const fechaProforma = new Date(p.date);
          return fechaProforma.getMonth() === mesActual && fechaProforma.getFullYear() === anioActual;
        });

        const acumuladoDinero = proformas.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
        
        const clientesUnicos = new Set(
          proformas.map(p => p.client?.trim()?.toLowerCase()).filter(Boolean)
        );

        setStats({
          totalProformas: proformas.length,
          proformasMes: filtradoMes.length,
          totalClientes: clientesUnicos.size,
          ingresosTotales: acumuladoDinero
        });

      } catch (err) {
        console.error("API offline o Base de datos vacía.", err);
      }
    };

    cargarEstadisticas();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* --- ÁREA PRINCIPAL DE CONTENIDO --- */}
      <header className="content-header" style={{ backgroundColor: 'var(--white)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>¡Hola, Martín!</h1>
          <p style={{ color: 'var(--text-muted)' }}>Resumen general y métricas de rendimiento en IEMI hoy.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/iemi')}>
          <i className="fas fa-file-signature"></i> Crear Nueva Proforma
        </button>
      </header>

      {/* METRICAS INDICADORES (GRID DINÁMICO) */}
      <div className="stats-grid">
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <i className="fas fa-folder-open"></i>
          </div>
          <div className="stat-info">
            <p>Total Proformas</p>
            <h3>{stats.totalProformas}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-info">
            <p>Este Mes</p>
            <h3>{stats.proformasMes}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <i className="fas fa-user-check"></i>
          </div>
          <div className="stat-info">
            <p>Clientes Únicos</p>
            <h3>{stats.totalClientes}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="stat-info">
            <p>Ingresos Brutos</p>
            <h3>${stats.ingresosTotales.toFixed(2)}</h3>
          </div>
        </div>

      </div>

      {/* MENÚ DE ACCIONES RÁPIDAS SECUNDARIO */}
      <section className="quick-actions-section">
        <h2>Acciones sugeridas</h2>
        <div className="actions-grid">
          
          <button className="action-card-btn" onClick={() => navigate('/clientes')}>
            <i className="fas fa-user-plus"></i>
            <span>Gestión de Clientes</span>
          </button>
          
          <button className="action-card-btn" onClick={() => navigate('/proformas')}>
            <i className="fas fa-list-alt"></i>
            <span>Ver Historial de Proformas</span>
          </button>
          
        </div>
      </section>

    </div>
  );
}