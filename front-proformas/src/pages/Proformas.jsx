// src/pages/Proformas.jsx
import React, { useState, useEffect, memo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PlantillaProformaPDF from '../components/PlantillaProformaPDF';

// --- EL ESCUDO MÁGICO (React.memo) ---
const BotonDescargaPDF = memo(({ pdfData, isViewMode }) => {
  return (
    <PDFDownloadLink 
      document={<PlantillaProformaPDF datos={pdfData.formData} productos={pdfData.products} totales={pdfData.totals} />} 
      fileName={`Proforma-${pdfData.formData.id}.pdf`}
      style={{ textDecoration: 'none' }}
    >
      {({ loading }) => (
        <button 
          className="btn-primary" 
          disabled={loading} 
          style={{ backgroundColor: isViewMode ? 'var(--accent)' : 'var(--text-main)', width: isViewMode ? '100%' : 'auto' }}
        >
          <i className="fas fa-file-pdf" style={{ color: isViewMode ? 'white' : '#ef4444', marginRight: '8px' }}></i> 
          {loading ? 'Generando PDF...' : 'Descargar PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
});
// --------------------------------------

export default function Proformas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const editId = searchParams.get("editId");
  const viewId = searchParams.get("viewId");
  const duplicateId = searchParams.get("duplicateId");

  const isViewMode = Boolean(viewId);
  const isDuplicateMode = Boolean(duplicateId);
  const activeId = editId || viewId || duplicateId;

  const [formData, setFormData] = useState({
    id: "Cargando...",
    client: "", attention: "", date: "",
    address: "", phone: "", email: "",
    validity: "", delivery: "", payment: "", warranty: ""
  });

  const [products, setProducts] = useState([
    { id: Date.now(), quantity: 1, description: "", unitPrice: 0, total: 0 }
  ]);

  const [totals, setTotals] = useState({ subtotal: 0, iva: 0, total: 0 });
  const [aplicarIva, setAplicarIva] = useState(true);

  const [pdfData, setPdfData] = useState({ formData, products, totals });
  const [listaClientes, setListaClientes] = useState([]);
  
  // Controles para el cliente nuevo y el buscador personalizado
  const [guardarNuevoCliente, setGuardarNuevoCliente] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Filtramos la lista en tiempo real según lo que escribes
  const clientesFiltrados = listaClientes.filter(c => 
    c.cliente?.toLowerCase().includes(formData.client.toLowerCase())
  );

  // Determinamos si el cliente escrito NO existe en la BD
  const esClienteNuevo = formData.client.trim() !== "" && !listaClientes.some(
    c => c.cliente?.toLowerCase() === formData.client.trim().toLowerCase()
  );

  useEffect(() => {
    if (!esClienteNuevo) setGuardarNuevoCliente(false);
  }, [esClienteNuevo]);

  useEffect(() => {
    fetch('/api/clientes', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setListaClientes(data))
      .catch(err => console.log("API de clientes no disponible aún", err));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPdfData({ formData, products, totals });
    }, 600); 
    return () => clearTimeout(timer);
  }, [formData, products, totals]);

  useEffect(() => {
    if (activeId) {
      fetch(`/api/proforma/${activeId}`, { credentials: 'include' })
        .then(res => {
          if (!res.ok) throw new Error("Proforma no encontrada");
          return res.json();
        })
        .then(data => {
          setFormData({
            id: isDuplicateMode ? "Cargando..." : data.id, 
            client: data.client || "", 
            attention: data.attention || "", 
            date: isDuplicateMode ? new Date().toISOString().split('T')[0] : (data.date || ""),
            address: data.address || "", 
            phone: data.phone || "", 
            email: data.email || "",
            validity: data.validity || "", 
            delivery: data.delivery || "", 
            payment: data.payment || "", 
            warranty: data.warranty || ""
          });
          
          if (data.products && data.products.length > 0) {
            const loadedProducts = data.products.map(p => ({
              id: p.id || Date.now() + Math.random(),
              quantity: p.quantity,
              description: p.description,
              unitPrice: p.unitPrice,
              total: p.total
            }));
            setProducts(loadedProducts);
          }

          if (isDuplicateMode) {
            fetch('/api/next-proforma-id', { credentials: 'include' })
              .then(res => res.json())
              .then(newIdData => setFormData(prev => ({ ...prev, id: newIdData.nextId })));
          }
        })
        .catch(err => console.error("Error al cargar proforma:", err));
    } else {
      fetch('/api/next-proforma-id', { credentials: 'include' })
        .then(res => res.json())
        .then(data => setFormData(prev => ({ ...prev, id: data.nextId })))
        .catch(err => console.error("Error al obtener ID:", err));
    }
  }, [activeId, isDuplicateMode]);

  useEffect(() => {
    const subtotal = products.reduce((sum, p) => sum + Number(p.total), 0);
    const ivaCalculado = aplicarIva ? (subtotal * 0.15) : 0;
    
    setTotals({
      subtotal: subtotal.toFixed(2),
      iva: ivaCalculado.toFixed(2),
      total: (subtotal + ivaCalculado).toFixed(2)
    });
  }, [products, aplicarIva]);

  // Manejador de inputs estándar
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- NUEVA FUNCIÓN: Al hacer clic en un cliente de la lista flotante ---
  const seleccionarCliente = (clienteEncontrado) => {
    setFormData(prev => ({
      ...prev,
      client: clienteEncontrado.cliente,
      attention: clienteEncontrado.atencion || prev.attention,
      address: clienteEncontrado.direccion || prev.address,
      phone: clienteEncontrado.telefono || prev.phone,
      email: clienteEncontrado.email || prev.email,
    }));
    setMostrarSugerencias(false);
    setGuardarNuevoCliente(false);
  };
  // ----------------------------------------------------------------------

  const handleProductChange = (id, field, value) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const updatedProduct = { ...p, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
            updatedProduct.total = (Number(updatedProduct.quantity) * Number(updatedProduct.unitPrice)).toFixed(2);
        }
        return updatedProduct;
      }
      return p;
    }));
  };

  const addProductRow = () => {
    setProducts([...products, { id: Date.now(), quantity: 1, description: "", unitPrice: 0, total: 0 }]);
  };

  const removeProductRow = (id) => {
    if (products.length > 1) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const guardarProforma = async () => {
    if (guardarNuevoCliente && formData.client.trim() !== "") {
      try {
        await fetch('/api/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            cliente: formData.client,
            atencion: formData.attention,
            direccion: formData.address,
            telefono: formData.phone,
            email: formData.email
          })
        });
      } catch (err) {
        console.error("Error guardando cliente:", err);
      }
    }

    const proformaFinal = { 
      ...formData, 
      products: products, 
      subtotal: totals.subtotal,
      iva: totals.iva,
      total: totals.total
    };
    
    try {
      const response = await fetch('/api/proformas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(proformaFinal)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(`Proforma guardada con éxito.`);
        navigate('/proformas'); 
      } else {
        alert("Error al guardar proforma: " + (result.message || "Error desconocido"));
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor backend.");
    }
  };

  const getTitulo = () => {
    if (isViewMode) return "Visualizando Proforma";
    if (isDuplicateMode) return "Duplicando Proforma";
    if (editId) return "Editando Proforma";
    return "Generador de Proformas";
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {isViewMode && (
        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', padding: '15px', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
          <i className="fas fa-info-circle"></i> 
          Estás en modo visualización. Los campos están bloqueados. Para hacer cambios, regresa al historial y elige "Editar".
        </div>
      )}

      <div className="content-header" style={{ backgroundColor: 'var(--white)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => navigate('/proformas')} className="btn-icon" style={{ backgroundColor: 'var(--bg-main)', padding: '10px 15px' }}>
              <i className="fas fa-arrow-left"></i>
            </button>
            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{getTitulo()}</h1>
        </div>
        <div style={{ padding: '8px 16px', backgroundColor: 'rgba(37, 99, 235, 0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--accent)' }}>
          <span style={{ fontWeight: 'bold' }}>Nº: {formData.id}</span>
        </div>
      </div>

      <section className="form-section">
        <h2><i className="fas fa-user-tie"></i> Datos del Cliente</h2>
        <div className="form-grid">
          
          {/* --- BUSCADOR PERSONALIZADO --- */}
          <div className="input-group" style={{ position: 'relative' }}>
              <label>Cliente</label>
              <input 
                type="text" 
                name="client" 
                value={formData.client} 
                onChange={handleInputChange} 
                autoComplete="off" 
                disabled={isViewMode} 
                onFocus={() => setMostrarSugerencias(true)}
                // Usamos onBlur con un pequeño retraso para permitir hacer clic en la lista antes de que desaparezca
                onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
                placeholder="Escribe para buscar..."
              />
              
              {/* Menú flotante (estilo premium) */}
              {mostrarSugerencias && clientesFiltrados.length > 0 && !isViewMode && (
                <ul style={{ 
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                  backgroundColor: 'var(--white)', border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-lg)',
                  zIndex: 100, listStyle: 'none', padding: 0, maxHeight: '200px', overflowY: 'auto' 
                }}>
                  {clientesFiltrados.map((cliente, index) => (
                    <li 
                      key={index} 
                      onClick={() => seleccionarCliente(cliente)}
                      style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid var(--bg-main)', transition: 'background 0.2s', fontSize: '0.95rem' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--white)'}
                    >
                      <i className="fas fa-building" style={{ color: 'var(--text-muted)', marginRight: '8px' }}></i>
                      {cliente.cliente}
                    </li>
                  ))}
                </ul>
              )}
              
              {/* Checkbox para guardar cliente nuevo */}
              {!isViewMode && esClienteNuevo && (
                <div style={{ 
                  marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', 
                  backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '10px 12px', 
                  borderRadius: 'var(--radius-sm)', color: '#059669', fontSize: '0.9rem', fontWeight: '600',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  <input 
                    type="checkbox" 
                    id="guardar-cliente-check" 
                    checked={guardarNuevoCliente} 
                    onChange={(e) => setGuardarNuevoCliente(e.target.checked)} 
                    style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer', margin: 0 }}
                  />
                  <label htmlFor="guardar-cliente-check" style={{ cursor: 'pointer', margin: 0, color: 'inherit', fontWeight: 'bold' }}>
                    <i className="fas fa-save" style={{ marginRight: '5px' }}></i> Guardar en agenda
                  </label>
                </div>
              )}
          </div>
          {/* ------------------------------- */}

          <div className="input-group">
              <label>Atención</label>
              <input type="text" name="attention" value={formData.attention} onChange={handleInputChange} disabled={isViewMode} />
          </div>
          <div className="input-group">
              <label>Fecha</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} disabled={isViewMode} />
          </div>
          <div className="input-group">
              <label>Dirección</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} disabled={isViewMode} />
          </div>
          <div className="input-group">
              <label>Teléfono</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} disabled={isViewMode} />
          </div>
          <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={isViewMode} />
          </div>
        </div>
      </section>

      <section className="form-section">
        <h2><i className="fas fa-clipboard-list"></i> Detalles de la Oferta</h2>
        <div className="form-grid">
          <div className="input-group">
              <label>Validez de Oferta</label>
              <input type="text" name="validity" value={formData.validity} onChange={handleInputChange} placeholder="Ej. 15 días" disabled={isViewMode} />
          </div>
          <div className="input-group">
              <label>Tiempo de Entrega</label>
              <input type="text" name="delivery" value={formData.delivery} onChange={handleInputChange} placeholder="Ej. Inmediato" disabled={isViewMode} />
          </div>
          <div className="input-group">
              <label>Método de Pago</label>
              <input type="text" name="payment" value={formData.payment} onChange={handleInputChange} placeholder="Ej. Transferencia" disabled={isViewMode} />
          </div>
          <div className="input-group">
              <label>Garantía</label>
              <input type="text" name="warranty" value={formData.warranty} onChange={handleInputChange} placeholder="Ej. 1 año" disabled={isViewMode} />
          </div>
        </div>
      </section>

      <section className="form-section">
        <h2><i className="fas fa-box-open"></i> Productos y Servicios</h2>
        <div className="table-scroll">
          <table className="data-table" style={{ minWidth: '800px' }}>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Nº</th>
                <th style={{ width: '100px' }}>Cant.</th>
                <th>Descripción</th>
                <th style={{ width: '150px' }}>V. Unitario</th>
                <th style={{ width: '150px' }}>Total</th>
                {!isViewMode && <th style={{ width: '60px' }}></th>}
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id}>
                  <td style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>{index + 1}</td>
                  <td>
                    <input type="number" min="1" value={product.quantity} onChange={(e) => handleProductChange(product.id, 'quantity', e.target.value)} disabled={isViewMode} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
                  </td>
                  <td>
                    <textarea value={product.description} onChange={(e) => handleProductChange(product.id, 'description', e.target.value)} disabled={isViewMode} placeholder="Descripción..." style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', resize: 'vertical', minHeight: '40px' }}></textarea>
                  </td>
                  <td>
                    <input type="number" step="0.01" value={product.unitPrice} onChange={(e) => handleProductChange(product.id, 'unitPrice', e.target.value)} disabled={isViewMode} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
                  </td>
                  <td style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1.1rem' }}>
                    ${product.total}
                  </td>
                  {!isViewMode && (
                    <td>
                      <button onClick={() => removeProductRow(product.id)} className="btn-icon delete">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isViewMode && (
          <button onClick={addProductRow} className="btn-primary" style={{ marginTop: '1rem', backgroundColor: 'var(--text-muted)' }}>
            <i className="fas fa-plus"></i> Añadir Línea
          </button>
        )}
      </section>

      <section className="form-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
        
        <div style={{ display: 'flex', gap: '15px', flexDirection: 'column', flex: '1', minWidth: '250px' }}>
          
          {!isViewMode && (
            <button 
                onClick={() => setAplicarIva(!aplicarIva)} 
                style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', cursor: 'pointer', border: 'none', fontWeight: 'bold', backgroundColor: aplicarIva ? '#ef4444' : '#3b82f6', color: 'white', width: 'fit-content' }}
            >
                {aplicarIva ? "Eliminar 15% IVA" : "Aplicar 15% IVA"}
            </button>
          )}
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: isViewMode ? '0' : '1rem' }}>
              
              <BotonDescargaPDF pdfData={pdfData} isViewMode={isViewMode} />

              {!isViewMode && (
                <button onClick={guardarProforma} className="btn-primary">
                  <i className="fas fa-save" style={{ marginRight: '8px' }}></i> Guardar Proforma
                </button>
              )}
          </div>
        </div>

        <div style={{ minWidth: '250px', flex: '1', backgroundColor: 'var(--bg-main)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>Subtotal:</span>
            <span style={{ fontWeight: 'bold' }}>${totals.subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>IVA (15%):</span>
            <span style={{ fontWeight: 'bold' }}>${totals.iva}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>TOTAL:</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>${totals.total}</span>
          </div>
        </div>

      </section>

    </div>
  );
}