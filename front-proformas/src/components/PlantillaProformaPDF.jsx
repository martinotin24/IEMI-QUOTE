// src/components/PlantillaProformaPDF.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';

// --- ESTILOS PROFESIONALES DINÁMICOS ---
const styles = StyleSheet.create({
  page: { 
    padding: 40, 
    fontFamily: 'Helvetica', 
    fontSize: 9,
    color: '#000'
  },
  
  // Cabecera Principal
  logoText: { 
    fontSize: 26, 
    fontFamily: 'Helvetica-Bold', 
    marginBottom: 6 
  },
  companySub: { 
    fontSize: 8, 
    marginBottom: 3 
  },
  proformaTitle: { 
    fontSize: 10, 
    fontFamily: 'Helvetica-Bold', 
    textAlign: 'center', 
    marginTop: 15,
    marginBottom: 15, 
    letterSpacing: 1 
  },

  // Cuadrícula de Información del Cliente
  clientGrid: { 
    flexDirection: 'row', 
    marginBottom: 10 
  },
  colLeft: { width: '55%' },
  colRight: { width: '45%' },
  rowInfo: { 
    flexDirection: 'row', 
    marginBottom: 4,
    alignItems: 'flex-start'
  },
  label: { width: 50, fontFamily: 'Helvetica-Bold' },
  colon: { width: 15, textAlign: 'center' },
  value: { flex: 1 },
  valueBold: { flex: 1, fontFamily: 'Helvetica-Bold' },
  linkEmail: { color: 'blue', textDecoration: 'underline' },

  intro: { 
    textAlign: 'center', 
    marginBottom: 15, 
    marginTop: 5,
    fontSize: 9 
  },
  
  // --- ESTRUCTURA DE TABLA FLUIDA ---
  table: {
    borderWidth: 1.5,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 22,
    alignItems: 'stretch',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontFamily: 'Helvetica-Bold',
    minHeight: 20,
    borderBottomWidth: 1.5,
    borderColor: '#000',
  },
  
  // Celdas
  cellItem: { width: '8%', borderRightWidth: 1.5, borderColor: '#000', padding: 5, textAlign: 'center' },
  cellCant: { width: '7%', borderRightWidth: 1.5, borderColor: '#000', padding: 5, textAlign: 'center' },
  cellDesc: { width: '57%', borderRightWidth: 1.5, borderColor: '#000', padding: 5, textAlign: 'left' },
  cellPrice: { width: '14%', borderRightWidth: 1.5, borderColor: '#000', padding: 5, textAlign: 'right' },
  cellTotal: { width: '14%', padding: 5, textAlign: 'right' },

  // --- CIERRE Y FIRMAS AJUSTADOS ---
  bottomSection: {
    marginTop: 15, // Antes era 35. Lo reducimos para que quede justo debajo de la tabla
    paddingLeft: 5,
  },
  signatureText: {
    marginBottom: 3,
  },
  footerAddress: { 
    marginTop: 15, // Antes era 25. Lo acercamos más a la firma
    textAlign: 'center',
    fontSize: 8,
    color: '#000'
  }
});

const PlantillaProformaPDF = ({ datos, productos, totales }) => {
  // Mantenemos las 12 filas para el diseño formal
  const filasDeseadas = 12;
  const filasVaciasCount = Math.max(0, filasDeseadas - productos.length);
  const filasVacias = Array.from({ length: filasVaciasCount });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* --- ENCABEZADO --- */}
        <Text style={styles.logoText}>IEMI</Text>
        <Text style={styles.companySub}>SERVICIOS, PROVISIÓN DE INSUMOS DE INGENIERÍA ELÉCTRICA, MECÁNICA E INDUSTRIAL</Text>
        <Text style={styles.companySub}>Ruc: 0401399936001</Text>
        
        <Text style={styles.proformaTitle}>P R O F O R M A  Nº: {datos?.id || "A-000-000"}</Text>

        {/* --- DATOS DEL CLIENTE --- */}
        <View style={styles.clientGrid} wrap={false}>
          <View style={styles.colLeft}>
            <View style={styles.rowInfo}>
              <Text style={styles.label}>Cliente.</Text><Text style={styles.colon}>:</Text><Text style={styles.valueBold}>{datos?.client || ""}</Text>
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.label}>Atención</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>{datos?.attention || ""}</Text>
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.label}>Fecha</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>{datos?.date || ""}</Text>
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.label}>Dirección</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>{datos?.address || ""}</Text>
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.label}>Teléfono</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>{datos?.phone || ""}</Text>
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.label}>E-mail</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>{datos?.email || ""}</Text>
            </View>
          </View>
          
          <View style={styles.colRight}>
            <View style={styles.rowInfo}>
              <Text style={styles.label}>Validez</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>{datos?.validity || ""}</Text>
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.label}>Entrega</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>{datos?.delivery || ""}</Text>
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.label}>Pago</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>{datos?.payment || ""}</Text>
            </View>
            <View style={[styles.rowInfo, { marginTop: 12 }]}>
              <Text style={styles.label}>Garantia</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>{datos?.warranty || ""}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.intro}>En atención a su solicitud, es grato poner a su consideración nuestra oferta.</Text>

        {/* --- CUERPO DE LA TABLA --- */}
        <View style={styles.table}>
          
          <View style={[styles.tableRow, styles.tableHeader]} wrap={false}>
            <Text style={styles.cellItem}>ITEM</Text>
            <Text style={styles.cellCant}>CANT</Text>
            <Text style={[styles.cellDesc, { textAlign: 'center', fontFamily: 'Helvetica-Bold', letterSpacing: 2 }]}>D E S C R I P C I Ó N</Text>
            <Text style={[styles.cellPrice, { textAlign: 'center' }]}>V. UNITARIO</Text>
            <Text style={[styles.cellTotal, { textAlign: 'center', fontFamily: 'Helvetica-Bold' }]}>V. TOTAL</Text>
          </View>

          {/* Filas de productos reales */}
          {productos.map((prod, index) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <Text style={styles.cellItem}>{index + 1}</Text>
              <Text style={styles.cellCant}>{prod.quantity || "0"}</Text>
              <Text style={styles.cellDesc}>{prod.description || ""}</Text>
              <Text style={styles.cellPrice}>{Number(prod.unitPrice || 0).toFixed(2)}</Text>
              <Text style={styles.cellTotal}>{Number(prod.total || 0).toFixed(2)}</Text>
            </View>
          ))}

          {/* Filas vacías de relleno */}
          {filasVacias.map((_, index) => (
            <View key={`empty-${index}`} style={styles.tableRow} wrap={false}>
              <Text style={styles.cellItem}></Text>
              <Text style={styles.cellCant}></Text>
              <Text style={styles.cellDesc}></Text>
              <Text style={styles.cellPrice}></Text>
              <Text style={styles.cellTotal}></Text>
            </View>
          ))}

          {/* Bloque de Totales */}
          <View wrap={false}>
            <View style={styles.tableRow}>
              <Text style={styles.cellItem}></Text>
              <Text style={styles.cellCant}></Text>
              <Text style={styles.cellDesc}></Text>
              <Text style={[styles.cellPrice, { fontFamily: 'Helvetica-Bold' }]}>Subtotal</Text>
              <Text style={styles.cellTotal}>{totales?.subtotal || "0.00"}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={styles.cellItem}></Text>
              <Text style={styles.cellCant}></Text>
              <Text style={styles.cellDesc}></Text>
              <Text style={[styles.cellPrice, { fontFamily: 'Helvetica-Bold' }]}>15% IVA</Text>
              <Text style={styles.cellTotal}>{totales?.iva || "0.00"}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={styles.cellItem}></Text>
              <Text style={styles.cellCant}></Text>
              <Text style={styles.cellDesc}></Text>
              <Text style={[styles.cellPrice, { fontFamily: 'Helvetica-Bold' }]}>TOTAL</Text>
              <Text style={styles.cellTotal}>{totales?.total || "0.00"}</Text>
            </View>
          </View>

        </View>

        {/* --- CIERRE: Firma y Dirección --- */}
        {/* Usamos wrap={false} para que "Atentamente" y el nombre nunca se separen */}
        <View wrap={false} style={styles.bottomSection}>
          <Text style={[styles.signatureText, { marginBottom: 15 }]}>Atentamente,</Text>
          <Text style={styles.signatureText}>Ing. Ivan Muñoz Ponce</Text>
          <Text style={styles.signatureText}>0962949360</Text>
          <Link style={styles.linkEmail} src="mailto:iemiecuador@gmail.com">iemiecuador@gmail.com</Link>
          
          <Text style={styles.footerAddress}>
            Av Machala S/N y Bolivar Guerrero {"\n"} Quito - Ecuador
          </Text>
        </View>

      </Page>
    </Document>
  );
};

export default PlantillaProformaPDF;