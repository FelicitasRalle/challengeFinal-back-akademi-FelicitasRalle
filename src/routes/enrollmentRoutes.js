const express = require('express');
const{
    getEnrollmentByStudent,
    createEnrollment,
    deleteEnrollment,
    getEnrollmentByCourse
} = require('../controllers/enrollmentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

//proteccion a todas las rutas
router.get('/student/:studentId', restrictTo('student'), getEnrollmentByStudent);
router.post('/', restrictTo('student'), createEnrollment);
router.delete('/:id', restrictTo('student'), deleteEnrollment);
router.get('/course/:courseId', restrictTo('professor'), getEnrollmentByCourse);

module.exports = router;