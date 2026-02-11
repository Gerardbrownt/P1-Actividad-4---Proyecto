const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, description, price, stock, min_stock, category_id, supplier_id } = req.body;
  try {
    const query = 'INSERT INTO products (name, description, price, stock, min_stock, category_id, supplier_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
    const values = [name, description, price, stock, min_stock, category_id, supplier_id];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/movements', async (req, res) => {
  const { product_id, type, quantity, reason } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO movements (product_id, type, quantity, reason, date) VALUES ($1, $2, $3, $4, NOW())',
      [product_id, type, quantity, reason]
    );
    let updateQuery = type === 'IN' 
      ? 'UPDATE products SET stock = stock + $1 WHERE id = $2' 
      : 'UPDATE products SET stock = stock - $1 WHERE id = $2';
    await client.query(updateQuery, [quantity, product_id]);
    await client.query('COMMIT');
    res.status(201).json({ message: 'Movement registered' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.get('/api/reports/proxy/:endpoint', async (req, res) => {
  const { endpoint } = req.params;
  const reportServiceUrl = process.env.REPORT_SERVICE_URL || 'http://localhost:8081';
  try {
    const response = await axios.get(`${reportServiceUrl}/${endpoint}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Error connecting to Report Service' });
  }
});

app.use(express.static(path.join(__dirname, 'client/dist')));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});