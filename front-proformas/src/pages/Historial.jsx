// src/pages/Historial.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Importamos las herramientas secretas para generar PDF en segundo plano
import { pdf } from '@react-pdf/renderer';
import PlantillaProformaPDF from '../components/PlantillaProformaPDF';

export default function Historial() {
  const navigate = useNavigate();
  const [proformas, setProformas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tabActiva, setTabActiva] = useState("Todas");
  
  // Estado para saber qué botón debe mostrar la ruedita de carga
  const [descargandoId, setDescargandoId] = useState(null);

  useEffect(() => {
    cargarProformas();
  }, []);

  const cargarProformas = async () => {
    try {
      setCargando(true);
      const response = await fetch('/api/proformas', {
        method: 'GET',
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Error al obtener proformas');

      const data = await response.json();
      setProformas(data); 
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setCargando(false);
    }
  };

  const formatFechaDMY = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString('es-EC'); 
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta proforma de forma permanente?")) return;
    try {
      const res = await fetch(`/api/proformas/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        cargarProformas(); 
      }
    } catch (e) { 
      console.error(e); 
    }
  };

  // --- MAGIA: DESCARGA DIRECTA EN 1 CLICK ---
  const handleDescargaDirecta = async (id) => {
    try {
      // 1. Mostramos el spinner en el botón
      setDescargandoId(id);

      // 2. Traemos los datos frescos de la BD
      const res = await fetch(`/api/proforma/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error("No se pudo cargar la proforma");
      const data = await res.json();

      // 3. Formateamos los datos para la plantilla
      const formData = {
        id: data.id, client: data.client || "", attention: data.attention || "",
        date: data.date || "", address: data.address || "", phone: data.phone || "",
        email: data.email || "", validity: data.validity || "", delivery: data.delivery || "",
        payment: data.payment || "", warranty: data.warranty || ""
      };
      const products = data.products ? data.products.map(p => ({
        id: p.id, quantity: p.quantity, description: p.description,
        unitPrice: p.unitPrice, total: p.total
      })) : [];
      const totales = { subtotal: data.subtotal || 0, iva: data.iva || 0, total: data.total || 0 };

      // 4. Generamos el PDF en memoria (sin mostrarlo en pantalla)
      const blob = await pdf(
        <PlantillaProformaPDF datos={formData} productos={products} totales={totales} />
      ).toBlob();

      // 5. Creamos un link invisible y forzamos la descarga
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Proforma-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // 6. Limpiamos la memoria
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error(error);
      alert("Error al intentar descargar el PDF.");
    } finally {
      // 7. Quitamos el spinner
      setDescargandoId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
      <header className="content-header" style={{ backgroundColor: 'var(--white)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Historial de Proformas</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gestiona y visualiza todas tus ofertas.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/iemi')}>
          <i className="fas fa-plus"></i> Nueva Proforma
        </button>
      </header>

      {/* --- PESTAÑAS DINÁMICAS --- */}
      <div className="tabs-container">
        {["Todas", "Enviadas", "Pendientes"].map((tab) => (
          <button 
            key={tab}
            className={`tab-btn ${tabActiva === tab ? 'active' : ''}`}
            onClick={() => setTabActiva(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- TABLA DE DATOS --- */}
      <div className="table-container">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Nº</th>
                <th>ID Proforma</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Acciones</th>
              </tr>
            </thead>
            
            <tbody>
              {cargando ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Cargando datos...</td></tr>
              ) : proformas.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No hay registros disponibles.</td></tr>
              ) : (
                proformas.map((p, index) => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>{index + 1}</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{p.id}</td>
                    <td>{p.client}</td>
                    <td>{formatFechaDMY(p.date)}</td>
                    <td style={{ fontWeight: 'bold' }}>${p.total}</td>
                    <td>
                      
                      {/* --- DISEÑO PREMIUM DE ACCIONES AGRUPADAS --- */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center' }}>
                        
                        {/* GRUPO 1: Documento (Visualizar / Descargar) */}
                        <div style={{ display: 'flex', backgroundColor: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '8px', overflow: 'hidden' }}>
                          <button 
                            title="Visualizar PDF" 
                            style={{ background: 'transparent', border: 'none', padding: '8px 12px', color: '#8b5cf6', cursor: 'pointer', transition: '0.2s' }} 
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => window.open(`/ver-pdf/${p.id}`, '_blank')}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          
                          <div style={{ width: '1px', backgroundColor: 'rgba(139, 92, 246, 0.2)' }}></div>
                          
                          <button 
                            title="Descargar PDF" 
                            style={{ background: 'transparent', border: 'none', padding: '8px 12px', color: '#8b5cf6', cursor: descargandoId === p.id ? 'wait' : 'pointer', transition: '0.2s' }} 
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => handleDescargaDirecta(p.id)}
                            disabled={descargandoId === p.id}
                          >
                            {/* Cambia el ícono por un spinner si está descargando */}
                            {descargandoId === p.id ? (
                              <i className="fas fa-circle-notch fa-spin"></i>
                            ) : (
                              <i className="fas fa-download"></i>
                            )}
                          </button>
                        </div>

                        {/* GRUPO 2: Gestión (Editar / Duplicar) */}
                        <div style={{ display: 'flex', backgroundColor: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <button 
                            title="Editar Datos" 
                            style={{ background: 'transparent', border: 'none', padding: '8px 12px', color: '#3b82f6', cursor: 'pointer', transition: '0.2s' }} 
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => navigate(`/iemi?editId=${p.id}`)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          
                          <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }}></div>
                          
                          <button 
                            title="Duplicar Proforma" 
                            style={{ background: 'transparent', border: 'none', padding: '8px 12px', color: '#10b981', cursor: 'pointer', transition: '0.2s' }} 
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => navigate(`/iemi?duplicateId=${p.id}`)}
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        </div>

                        {/* GRUPO 3: Peligro (Eliminar) */}
                        <button 
                          title="Eliminar" 
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid transparent', padding: '8px 12px', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }} 
                          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                          onClick={() => handleDelete(p.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>

                      </div>

                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}