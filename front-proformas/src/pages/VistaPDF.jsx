// src/pages/VistaPDF.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PDFViewer } from '@react-pdf/renderer';
import PlantillaProformaPDF from '../components/PlantillaProformaPDF';

export default function VistaPDF() {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/proforma/${id}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar la proforma");
        return res.json();
      })
      .then(data => {
        // Formateamos los datos exactamente como los espera la plantilla
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

        const totales = {
          subtotal: data.subtotal || 0,
          iva: data.iva || 0,
          total: data.total || 0
        };

        setDatos({ formData, products, totales });
      })
      .catch(err => {
        console.error(err);
        setError(true);
      });
  }, [id]);

  if (error) return <div style={{ padding: '2rem', textAlign: 'center' }}>Error al cargar el PDF.</div>;
  if (!datos) return <div style={{ padding: '2rem', textAlign: 'center' }}>Generando PDF...</div>;

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
        <PlantillaProformaPDF 
          datos={datos.formData} 
          productos={datos.products} 
          totales={datos.totales} 
        />
      </PDFViewer>
    </div>
  );
}