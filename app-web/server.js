const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true }));
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.get('/api/productos', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*, c.nombre as categoria_nombre, pr.nombre as proveedor_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/productos', async (req, res) => {
  const { nombre, descripcion, precio, stock, stock_minimo, categoria_id, proveedor_id } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, stock_minimo, categoria_id, proveedor_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [nombre, descripcion, precio, stock, stock_minimo, categoria_id, proveedor_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock, stock_minimo, categoria_id, proveedor_id } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, stock = $4, stock_minimo = $5, categoria_id = $6, proveedor_id = $7 WHERE id = $8 RETURNING *',
      [nombre, descripcion, precio, stock, stock_minimo, categoria_id, proveedor_id, id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/productos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM productos WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/categorias', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categorias ORDER BY id DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/categorias', async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const { rows } = await pool.query('INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *', [nombre, descripcion]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/categorias/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  try {
    const { rows } = await pool.query('UPDATE categorias SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *', [nombre, descripcion, id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/categorias/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM categorias WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/proveedores', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM proveedores ORDER BY id DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/proveedores', async (req, res) => {
  const { nombre, contacto, telefono, email, direccion } = req.body;
  try {
    const { rows } = await pool.query('INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES ($1, $2, $3, $4, $5) RETURNING *', [nombre, contacto, telefono, email, direccion]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/proveedores/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, contacto, telefono, email, direccion } = req.body;
  try {
    const { rows } = await pool.query('UPDATE proveedores SET nombre = $1, contacto = $2, telefono = $3, email = $4, direccion = $5 WHERE id = $6 RETURNING *', [nombre, contacto, telefono, email, direccion, id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/proveedores/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM proveedores WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/movimientos', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT m.*, p.nombre as producto_nombre, pr.nombre as proveedor_nombre
      FROM movimientos m
      LEFT JOIN productos p ON m.producto_id = p.id
      LEFT JOIN proveedores pr ON m.proveedor_id = pr.id
      ORDER BY m.fecha DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/movimientos', async (req, res) => {
  const { producto_id, tipo, cantidad, proveedor_id, motivo, observacion } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'INSERT INTO movimientos (producto_id, tipo, cantidad, proveedor_id, motivo, observacion, fecha) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [producto_id, tipo, cantidad, tipo === 'entrada' ? proveedor_id : null, tipo === 'salida' ? motivo : null, observacion]
    );
    const updateQuery = tipo === 'entrada' ? 'UPDATE productos SET stock = stock + $1 WHERE id = $2' : 'UPDATE productos SET stock = stock - $1 WHERE id = $2';
    await client.query(updateQuery, [cantidad, producto_id]);
    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.get('/api/reportes/:endpoint', async (req, res) => {
  try {
    const reportServiceUrl = process.env.REPORT_SERVICE_URL;
    const response = await axios.get(`${reportServiceUrl}/reportes/${req.params.endpoint}`, { params: req.query });
    res.json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.use(express.static(path.join(__dirname, 'client/dist')));
app.get(/^\/(?!api).*/, (req, res) => { res.sendFile(path.join(__dirname, 'client/dist', 'index.html')); });

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => { console.log(`PORT ${PORT}`); });