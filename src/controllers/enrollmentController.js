const Enrollment = require('../models/Enrollment');
const Course     = require('../models/Course');

//GET/enrollments/student/:studentId (solo estudiante)
exports.getEnrollmentsByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const filter = { student: studentId };
    const skip = (page - 1) * limit;
    const [ total, enrollments ] = await Promise.all([
      Enrollment.countDocuments(filter),
      Enrollment.find(filter)
        .populate('course', 'title category level')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
    ]);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      limit: Number(limit),
      enrollments
    });
  } catch (err) {
    next(err);
  }
};

//POST/enrollments (solo estudiante)
exports.createEnrollment = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { courseId } = req.body;

    // verifico el cupo y q exista el curso
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    const count = await Enrollment.countDocuments({ course: courseId });
    if (count >= course.maxStudents) {
      return res.status(400).json({ message: 'Cupo máximo alcanzado' });
    }

    //hago la inscripcion
    const enrollment = await Enrollment.create({ student: studentId, course: courseId });
    console.log("Inscripción creada:", enrollment); 
    res.status(201).json(enrollment);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Ya estás inscrito en este curso' });
    }
    next(err);
  }
};

//DELETE/enrollments/:id (solo estudiante)
exports.deleteEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({ message: 'No se encontro la inscripcion' });
    }
    if (req.user.role !== 'student' || enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No esta autorizado para cancelar esta inscripción' });
    }
    await Enrollment.findByIdAndDelete(id);
    res.json({ message: 'Se cancelo la inscripcion' });
  } catch (err) {
    next(err);
  }
};

//GET/enrollments/course/:courseId (solo profesor)
exports.getEnrollmentsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    if (req.user.role !== 'professor' || course.professor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    const enrollments = await Enrollment
      .find({ course: courseId })
      .populate('student', 'firstName lastName email');
    res.json(enrollments);
  } catch (err) {
    next(err);
  }
};
