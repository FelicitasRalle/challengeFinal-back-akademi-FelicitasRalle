const express = require('express');
const {
  createOrUpdateGrade,
  updateGrade,
  getGradesByStudent,
  getGradesByCourse,
  getAllGrades,
  deleteGrade
} = require('../controllers/gradeController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

//permitir que cualquier usuario autenticado (incluido 'student') acceda a sus notas
router.get('/student/:studentId', getGradesByStudent);

//rutas solo para profesor o superadmin
router.use(restrictTo('professor', 'superadmin'));
router.get('/course/:courseId', getGradesByCourse);
router.get('/', restrictTo('superadmin'), getAllGrades);
router.post('/', createOrUpdateGrade);
router.put('/:id', updateGrade);
router.delete('/:id', deleteGrade);

module.exports = router;




