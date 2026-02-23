const express = require('express');
const router = express.Router();
const pool = require('../db/db');

router.get('/stock-bajo', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.nombre, p.stock, p.stock_minimo, c.nombre AS categoria
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.stock <= p.stock_minimo
      ORDER BY p.stock ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/productos-movidos', async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;
  if (!fecha_inicio || !fecha_fin)
    return res.status(400).json({ error: 'Se requieren fecha_inicio y fecha_fin' });
  try {
    const result = await pool.query(`
      SELECT p.id, p.nombre, SUM(m.cantidad) AS total_salidas
      FROM movimientos m
      JOIN productos p ON m.producto_id = p.id
      WHERE m.tipo = 'salida'
        AND m.fecha >= $1
        AND m.fecha <= $2
      GROUP BY p.id, p.nombre
      ORDER BY total_salidas DESC
      LIMIT 10
    `, [fecha_inicio, fecha_fin]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/valor-inventario', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.nombre AS categoria,
             COUNT(p.id) AS total_productos,
             SUM(p.precio * p.stock) AS valor_total
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      GROUP BY c.nombre
      ORDER BY valor_total DESC
    `);
    const total = result.rows.reduce((acc, row) => acc + parseFloat(row.valor_total), 0);
    res.json({ categorias: result.rows, valor_total_inventario: total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/movimientos-por-fecha', async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;
  if (!fecha_inicio || !fecha_fin)
    return res.status(400).json({ error: 'Se requieren fecha_inicio y fecha_fin' });
  try {
    const result = await pool.query(`
      SELECT m.id, p.nombre AS producto, m.tipo, m.cantidad, m.fecha, m.observacion
      FROM movimientos m
      JOIN productos p ON m.producto_id = p.id
      WHERE m.fecha >= $1
        AND m.fecha <= $2
      ORDER BY m.fecha DESC
    `, [fecha_inicio, fecha_fin]);
    const totales = {
      entradas: result.rows.filter(r => r.tipo === 'entrada').reduce((a, r) => a + parseInt(r.cantidad), 0),
      salidas: result.rows.filter(r => r.tipo === 'salida').reduce((a, r) => a + parseInt(r.cantidad), 0),
    };
    res.json({ movimientos: result.rows, totales });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/resumen-proveedor', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pv.id, pv.nombre AS proveedor,
             COUNT(p.id) AS total_productos,
             SUM(p.precio * p.stock) AS valor_total_inventario
      FROM proveedores pv
      LEFT JOIN productos p ON p.proveedor_id = pv.id
      GROUP BY pv.id, pv.nombre
      ORDER BY valor_total_inventario DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;