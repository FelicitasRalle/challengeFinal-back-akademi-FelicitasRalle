const express = require('express');
const {
  createOrUpdateGrade,
  updateGrade,
  getGradesByStudent,
  getGradesByCourse,
  deleteGrade
} = require('../controllers/gradeController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('professor', 'superadmin'));

router.get('/course/:courseId', getGradesByCourse);
router.post('/', createOrUpdateGrade);
router.put('/:id', updateGrade);
router.get('/student/:studentId', getGradesByStudent);
router.delete('/:id', deleteGrade);

module.exports = router;



