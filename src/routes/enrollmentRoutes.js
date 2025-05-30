const express = require('express');
const { body } = require('express-validator');
const {
  getEnrollmentsByStudent,
  createEnrollment,
  deleteEnrollment,
  getEnrollmentsByCourse
} = require('../controllers/enrollmentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

//POST /enrollments
router.post(
  '/',
  restrictTo('student'),
  body('courseId')
    .notEmpty().withMessage('courseId es obligatorio')
    .isMongoId().withMessage('courseId debe ser un ID válido'),
  createEnrollment
);

//GET /enrollments/student/:studentId
router.get(
  '/student/:studentId',
  restrictTo('student'),
  getEnrollmentsByStudent
);

//DELETE /enrollments/:id
router.delete(
  '/:id',
  restrictTo('student'),
  deleteEnrollment
);

// GET /enrollments/course/:courseId
router.get(
  '/course/:courseId',
  restrictTo('professor'),
  getEnrollmentsByCourse
);

module.exports = router;
