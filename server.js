// Cargar variables de entorno
require("dotenv").config();

// Importar módulos necesarios
const express = require('express');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cors = require('cors');
const compression = require('compression');
const fs = require('fs');

const app = express();

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));
app.set('trust proxy', 1);
app.use(compression());

// CORS Actualizado para permitir tu nueva IP
app.use(cors({
  origin: true, // Permite cualquier origen temporalmente para evitar bloqueos
  credentials: true
}));

// Configuración de la DB (ACTUALIZADA PARA EVITAR CAÍDAS NOCTURNAS)
const dbConfig = {
  host: 'db-mysql-nyc1-81948-do-user-7368604-0.m.db.ondigitalocean.com',
  port: 25060,
  user: 'iemi',
  password: process.env.DB_PASSWORD,
  database: 'iemi',
  dateStrings: true,
  ssl: { ca: fs.readFileSync(__dirname + '/certs/ca-certificate.crt') },
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

const pool = mysql.createPool(dbConfig);

// Configurar almacenamiento de sesiones en MySQL
const sessionStore = new MySQLStore({
  expiration: 86400000,
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: { session_id: 'session_id', expires: 'expires', data: 'data' }
  }
}, pool);

app.use(session({
  secret: '72fd34c135dbe698ae638fe359f9aeab213fa651bb083aeeef8642b1198ae1dda09d46e7183110b935d605b8e4ef57af842ea0bc8c63a402caae9b522ad209b1',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: false,         
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 86400000
  }
}));

// -------------------- RUTA PARA ARREGLAR CONTRASEÑA --------------------
app.get('/api/fix-password', async (req, res) => {
  try {
    const email = "electro_sistema@yahoo.com";
    const passwordPlana = "ilmp4526";
    const hashNuevo = await bcrypt.hash(passwordPlana, 10);
    await pool.execute('UPDATE usuarios SET password = ? WHERE email = ?', [hashNuevo, email]);
    res.send(`<h2 style="color:green;text-align:center;">¡Contraseña actualizada a: ${passwordPlana}!</h2>`);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
}); 

// -------------------- RUTAS DE LOGIN Y DASHBOARD --------------------
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.execute('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (rows.length === 0) return res.status(401).json({ message: 'Usuario no encontrado' });

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) return res.status(401).json({ message: 'Contraseña incorrecta' });

    req.session.userId = user.id;
    req.session.save(() => res.json({ message: 'Autenticación exitosa' }));
  } catch (error) {
    console.error("🔴 ERROR AL CONECTAR/LOGIN:", error); 
    res.status(500).json({ message: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

app.get('/api/dashboard', (req, res) => {
  if (req.session.userId) {
    res.json({ message: 'Sesión activa' });
  } else {
    res.status(401).json({ message: 'No hay sesión activa' });
  }
});

app.get('/api/logout', (req, res) => {
  req.session.destroy(err => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Sesión cerrada' });
  });
});


// -------------------- RUTAS DE PROFORMAS --------------------
app.get('/api/next-proforma-id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    
    // 1. Obtener el año actual dinámicamente
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const yearCode = `0${currentYear}`;

    const [rows] = await conn.execute("SELECT id FROM proformas ORDER BY id DESC LIMIT 1");
    
    if (rows.length > 0) {
      let parts = rows[0].id.split("-");
      let dbYear = parts[1];
      
      let nextNumber;
      if (dbYear === yearCode) {
        nextNumber = parseInt(parts[2], 10) + 1;
      } else {
        nextNumber = 1; 
      }

      // Convertimos el número a texto y rellenamos con ceros (ej. 1 -> "001", 15 -> "015")
      const paddedNumber = String(nextNumber).padStart(3, '0');

      res.json({ nextId: `A-${yearCode}-${paddedNumber}` });
    } else {
      res.json({ nextId: `A-${yearCode}-001` });
    }
  } catch (error) { 
    console.error("Error generando ID:", error);
    res.status(500).json({ message: "Error" });
  } finally { 
    if (conn) conn.release(); 
  }
});

app.get('/api/proforma/:id', async (req, res) => {
  const proformaId = req.params.id;
  let conn;
  try {
    conn = await pool.getConnection();
    const [proformaRows] = await conn.execute('SELECT * FROM proformas WHERE id = ?', [proformaId]);
    if (proformaRows.length === 0) return res.status(404).json({ message: 'No encontrada' });
    const proforma = proformaRows[0];
    const [products] = await conn.execute('SELECT * FROM productos WHERE proforma_id = ?', [proformaId]);
    proforma.products = products;
    res.json(proforma);
  } catch (error) { res.status(500).json({ message: "Error" });
  } finally { if (conn) conn.release(); }
});

app.post('/api/proformas', async (req, res) => {
  const proforma = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    const fechaProforma = proforma.date ? proforma.date : new Date().toISOString().split('T')[0];
    const [rows] = await conn.execute('SELECT id FROM proformas WHERE id = ?', [proforma.id]);
    
    if (rows.length > 0) {
      const sql = `UPDATE proformas SET client=?, attention=?, date=?, address=?, phone=?, email=?, validity=?, delivery=?, payment=?, warranty=?, subtotal=?, iva=?, total=? WHERE id=?`;
      await conn.execute(sql, [proforma.client, proforma.attention, fechaProforma, proforma.address, proforma.phone, proforma.email, proforma.validity, proforma.delivery, proforma.payment, proforma.warranty, proforma.subtotal, proforma.iva, proforma.total, proforma.id]);
      await conn.execute('DELETE FROM productos WHERE proforma_id = ?', [proforma.id]);
    } else {
      const sql = `INSERT INTO proformas (id, client, attention, date, address, phone, email, validity, delivery, payment, warranty, subtotal, iva, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await conn.execute(sql, [proforma.id, proforma.client, proforma.attention, fechaProforma, proforma.address, proforma.phone, proforma.email, proforma.validity, proforma.delivery, proforma.payment, proforma.warranty, proforma.subtotal, proforma.iva, proforma.total]);
    }

    const productSql = `INSERT INTO productos (proforma_id, quantity, description, unitPrice, total) VALUES (?, ?, ?, ?, ?)`;
    for (let product of proforma.products) {
      await conn.execute(productSql, [proforma.id, product.quantity, product.description, product.unitPrice, product.total]);
    }
    res.json({ message: "Guardado correctamente" });
  } catch (error) { res.status(500).json({ message: 'Error' });
  } finally { if (conn) conn.release(); }
});

app.get('/api/proformas', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [proformas] = await conn.execute('SELECT * FROM proformas ORDER BY id DESC');
    res.json(proformas);
  } catch (error) { res.status(500).json({ message: 'Error' });
  } finally { if (conn) conn.release(); }
});

app.delete('/api/proformas/:id', async (req, res) => {
  const proformaId = req.params.id;
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.execute('DELETE FROM productos WHERE proforma_id = ?', [proformaId]);
    await conn.execute('DELETE FROM proformas WHERE id = ?', [proformaId]);
    res.json({ message: 'Eliminada' });
  } catch (error) { res.status(500).json({ message: 'Error' });
  } finally { if (conn) conn.release(); }
});

// === CLIENTES API ===
app.get("/api/clientes", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM clientes ORDER BY id DESC");
    res.json(rows);
  } catch (error) { res.status(500).json({ error: "Error" }); }
});

app.post("/api/clientes", async (req, res) => {
  try {
    const { cliente, atencion, direccion, telefono, email } = req.body;
    await pool.query("INSERT INTO clientes (cliente, atencion, direccion, telefono, email) VALUES (?, ?, ?, ?, ?)", [cliente, atencion, direccion, telefono, email]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: "Error" }); }
});

app.delete("/api/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM clientes WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: "Error" }); }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor IEMI en puerto ${PORT}`));