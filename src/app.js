require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();
app.use(express.json());

//conexion a mongo
connectDB();

//rutas
app.use('/auth', require('./routes/auth'));

//error
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`servidor corriendo en http://localhost:${PORT}`)
);