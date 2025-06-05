const Grade = require("../models/Grade");
const Course = require("../models/Course");

// POST /grades - Cargar o actualizar nota
exports.createOrUpdateGrade = async (req, res, next) => {
  try {
    const { studentId, courseId, value, trimester } = req.body;

    if (![1, 2, 3].includes(trimester)) {
      return res
        .status(400)
        .json({ message: "Trimestre inválido. Debe ser 1, 2 o 3" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "No se encontró el curso" });
    }

    if (course.professor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "No está autorizado para calificar este curso" });
    }

    const grade = await Grade.findOneAndUpdate(
      { student: studentId, course: courseId, trimester },
      { value },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(grade);
  } catch (err) {
    next(err);
  }
};

// PUT /grades/:id - Editar nota existente
exports.updateGrade = async (req, res, next) => {
  try {
    const { value } = req.body;
    const grade = await Grade.findById(req.params.id).populate("course");

    if (!grade) {
      return res.status(404).json({ message: "Nota no encontrada" });
    }

    if (grade.course.professor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "No autorizado para editar esta nota" });
    }

    grade.value = value;
    await grade.save();

    res.status(200).json(grade);
  } catch (err) {
    next(err);
  }
};

// GET /grades/student/:id - Ver notas del alumno
exports.getGradesByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

    if (req.user.role === "student" && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    let filter = { student: studentId };
    if (req.user.role === "professor") {
      const myCourses = await Course.find({ professor: req.user._id }).select(
        "_id"
      );
      filter.course = { $in: myCourses.map((c) => c._id) };
    }

    const skip = (page - 1) * limit;
    const [total, grades] = await Promise.all([
      Grade.countDocuments(filter),
      Grade.find(filter)
        .populate("course", "title category level")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
    ]);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      limit: Number(limit),
      grades,
    });
  } catch (err) {
    next(err);
  }
};

exports.getGradesByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    // Verificar que el profesor actual sea el dueño del curso
    if (course.professor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado para ver calificaciones de este curso' });
    }

    const grades = await Grade.find({ course: courseId })
      .populate('student', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(grades);
  } catch (err) {
    next(err);
  }
};