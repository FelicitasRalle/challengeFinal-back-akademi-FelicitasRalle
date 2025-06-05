const express = require('express');
const {
  createOrUpdateGrade,
  updateGrade,
  getGradesByStudent
} = require('../controllers/gradesController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('professor', 'superadmin'));

router.get('/course/:courseId', getGradesByCourse);
router.post('/', createOrUpdateGrade);
router.put('/:id', updateGrade);
router.get('/student/:studentId', getGradesByStudent);

module.exports = router;



