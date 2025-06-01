const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();

//middleware global
app.use(express.json());

//cors
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

//conexion a mongo
connectDB();

//rutas de auth
app.use('/auth', require('./routes/authRoutes'));

//rutas de usuario
app.use('/users', require('./routes/usersRoutes'));

//rutas de cursos
app.use('/courses', require('./routes/coursesRoutes'));

//rutas de inscripciones
app.use('/enrollments', require('./routes/enrollmentRoutes'));

//rutas de calificaciones
app.use('/grades', require('./routes/gradesRoutes'));

//middleware de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`servidor corriendo en http://localhost:${PORT}`)
);
