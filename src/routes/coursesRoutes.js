// src/routes/coursesRoutes.js
const express = require('express');
const {
  getCourses,
  getCoursesById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCoursesByProfessor
} = require('../controllers/courseController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

//proteccion a todas las rutas
router.use(protect);

router.get('/', restrictTo('student','superadmin'), getCourses);
router.post('/', restrictTo('professor','superadmin'), createCourse);
router.put('/:id', restrictTo('professor','superadmin'), updateCourse);
router.delete('/:id', restrictTo('professor','superadmin'), deleteCourse);
router.get('/professor/:professorId', restrictTo('professor','superadmin'), getCoursesByProfessor);

module.exports = router;
