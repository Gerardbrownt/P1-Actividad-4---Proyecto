const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const reportesRouter = require('./routes/reportes');

const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'reportes', puerto: PORT });
});

app.use('/reportes', reportesRouter);

app.listen(PORT, () => {
  console.log(`Servicio de reportes corriendo en puerto ${PORT}`);
});