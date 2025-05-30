const express = require("express");
const {
  getEnrollmentsByStudent,
  createEnrollment,
  deleteEnrollment,
  getEnrollmentsByCourse,
} = require('../controllers/enrollmentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

//proteccion a todas las rutas
router.use(protect);


router.get(
  "/student/:studentId",
  restrictTo("student"),
  getEnrollmentsByStudent
);
router.delete("/:id", restrictTo("student"), deleteEnrollment);
router.get(
  "/course/:courseId",
  restrictTo("professor"),
  getEnrollmentsByCourse
);

module.exports = router;
