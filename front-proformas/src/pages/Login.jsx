// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Crucial para mantener la sesión
      });

      if (response.ok) {
        navigate('/dashboard'); 
      } else {
        alert("Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  return (
    // Usamos variables directas de tu index.css para centrar la pantalla
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      padding: '20px'
    }}>
      
      {/* Usamos tu clase .form-section que ya tiene fondo blanco, sombras y bordes redondeados */}
      <div className="form-section" style={{ width: '100%', maxWidth: '400px', margin: '0' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary)', fontSize: '2.5rem', fontWeight: '800', margin: 0 }}>IEMI</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '600' }}>SISTEMA DE PROFORMAS</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          
          {/* Usamos tu clase .input-group para aprovechar los bordes, padding y el focus azul */}
          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label>Correo electrónico</label>
            <input 
              type="email" 
              placeholder="admin@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          {/* Usamos tu clase .btn-primary para el botón azul con efecto hover */}
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Iniciar Sesión
          </button>
          
        </form>
      </div>
    </div>
  );
}