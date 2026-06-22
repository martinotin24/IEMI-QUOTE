// src/pages/Clientes.jsx
import React, { useState, useEffect } from 'react';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  // Estado para el formulario (Crear o Editar)
  const [formData, setFormData] = useState({
    id: null,
    cliente: '',
    atencion: '',
    direccion: '',
    telefono: '',
    email: ''
  });

  // Cargar clientes al iniciar
  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setCargando(true);
      const res = await fetch('/api/clientes', { credentials: 'include' });
      if (!res.ok) throw new Error("Error al cargar clientes");
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const abrirParaEditar = (cliente) => {
    setFormData({
      id: cliente.id,
      cliente: cliente.cliente || '',
      atencion: cliente.atencion || '',
      direccion: cliente.direccion || '',
      telefono: cliente.telefono || '',
      email: cliente.email || ''
    });
    setMostrarFormulario(true);
  };

  const limpiarFormulario = () => {
    setFormData({ id: null, cliente: '', atencion: '', direccion: '', telefono: '', email: '' });
    setMostrarFormulario(false);
  };

  const guardarCliente = async (e) => {
    e.preventDefault();
    
    // Verificamos si es CREAR (POST) o EDITAR (PUT)
    const url = formData.id ? `/api/clientes/${formData.id}` : '/api/clientes';
    const method = formData.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert(formData.id ? "Cliente actualizado" : "Cliente guardado");
        limpiarFormulario();
        cargarClientes(); // Recargamos la tabla
      } else {
        alert("Error al guardar el cliente.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor.");
    }
  };

  const eliminarCliente = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este cliente?")) return;
    try {
      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        cargarClientes();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* --- HEADER --- */}
      <header className="content-header" style={{ backgroundColor: 'var(--white)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Gestión de Clientes</h1>
          <p style={{ color: 'var(--text-muted)' }}>Administra tu base de datos de contactos para autocompletar proformas.</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => { limpiarFormulario(); setMostrarFormulario(!mostrarFormulario); }}
          style={{ backgroundColor: mostrarFormulario ? 'var(--text-muted)' : 'var(--accent)' }}
        >
          <i className={`fas ${mostrarFormulario ? 'fa-times' : 'fa-user-plus'}`}></i> 
          {mostrarFormulario ? ' Cancelar' : ' Nuevo Cliente'}
        </button>
      </header>

      {/* --- FORMULARIO DESPLEGABLE --- */}
      {mostrarFormulario && (
        <section className="form-section" style={{ borderTop: '4px solid var(--accent)' }}>
          <h2><i className="fas fa-address-card"></i> {formData.id ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}</h2>
          <form onSubmit={guardarCliente}>
            <div className="form-grid">
              <div className="input-group">
                <label>Nombre de la Empresa o Cliente *</label>
                <input type="text" name="cliente" value={formData.cliente} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label>Atención a (Contacto)</label>
                <input type="text" name="atencion" value={formData.atencion} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>Dirección</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>Teléfono</label>
                <input type="text" name="telefono" value={formData.telefono} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary">
                <i className="fas fa-save"></i> Guardar Cliente
              </button>
            </div>
          </form>
        </section>
      )}

      {/* --- TABLA DE CLIENTES --- */}
      <div className="table-container">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Cargando clientes...</td></tr>
              ) : clientes.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Aún no hay clientes registrados.</td></tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{c.cliente}</td>
                    <td>{c.atencion || '-'}</td>
                    <td>{c.telefono || '-'}</td>
                    <td>{c.email || '-'}</td>
                    <td>
                      <div className="action-buttons-cell" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn-icon edit" title="Editar" onClick={() => abrirParaEditar(c)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn-icon delete" title="Eliminar" onClick={() => eliminarCliente(c.id)}>
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