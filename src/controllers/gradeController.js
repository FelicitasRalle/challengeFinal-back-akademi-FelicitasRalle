const Grade = require('../models/Grade');
const Course = require('../models/Course');

//POST/grades
exports.createGrade = async (req, res, next) => {
  try {
    const { studentId, courseId, value, trimester } = req.body;

    if (![1, 2, 3].includes(trimester)) {
      return res.status(400).json({ message: 'Trimestre inválido. Debe ser 1, 2 o 3' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'No se encontró el curso' });
    }

    if (course.professor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No está autorizado para calificar este curso' });
    }

    const grade = await Grade.create({ student: studentId, course: courseId, value, trimester });
    res.status(201).json(grade);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Ya existe una calificación para este alumno, curso y trimestre' });
    }
    next(err);
  }
};


//PUT/grades/:id
exports.createGrade = async (req, res, next) => {
  try {
    const { studentId, courseId, value, trimester } = req.body;

    if (![1, 2, 3].includes(trimester)) {
      return res.status(400).json({ message: 'Trimestre inválido. Debe ser 1, 2 o 3' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'No se encontró el curso' });
    }

    if (course.professor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No está autorizado para calificar este curso' });
    }

    const grade = await Grade.create({ student: studentId, course: courseId, value, trimester });
    res.status(201).json(grade);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Ya existe una calificación para este alumno, curso y trimestre' });
    }
    next(err);
  }
};


exports.getGradesByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    //verifico el acceso
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    //filtro
    let filter = { student: studentId };
    if (req.user.role === 'professor') {
      //el profesor solo ve notas de sus cursos
      const myCourses = await Course.find({ professor: req.user._id }).select('_id');
      const courseIds = myCourses.map(c => c._id);
      filter.course = { $in: courseIds };
    }

    const skip = (page - 1) * limit;
    const [ total, grades ] = await Promise.all([
      Grade.countDocuments(filter),
      Grade.find(filter)
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
      grades
    });
  } catch (err) {
    next(err);
  }
};