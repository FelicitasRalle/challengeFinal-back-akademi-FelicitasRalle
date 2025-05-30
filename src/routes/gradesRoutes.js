const express = require('express');
const { body } = require('express-validator');
const {
   createGrade,
   updateGrade,
   getGradesByStudent
} = require('../controllers/gradeController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

//todas las rutas necesitarean el token valido
router.use(protect);

router.post(
  '/',
  restrictTo('professor', 'superadmin'),
  body('studentId').notEmpty().isMongoId(),
  body('courseId' ).notEmpty().isMongoId(),
  body('value'    ).isFloat({ min:0, max:100 }),
  createGrade
);
router.put(
  '/:id',
  restrictTo('professor', 'superadmin'),
  body('value').isFloat({ min:0, max:100 }),
  updateGrade
);
router.get(
  '/student/:studentId',
  restrictTo('professor','student', 'superadmin'),
  getGradesByStudent
);

module.exports = router;