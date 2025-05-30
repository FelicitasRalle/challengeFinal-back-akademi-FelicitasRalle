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

router.get('/', restrictTo('student'), getCourses);
router.get('/:id', getCoursesById);
router.post('/', restrictTo('professor'), createCourse);
router.put('/:id', restrictTo('professor'), updateCourse);
router.delete('/:id', restrictTo('professor'), deleteCourse);
router.get('/professor/:professorId', restrictTo('professor'), getCoursesByProfessor);

module.exports = router;
