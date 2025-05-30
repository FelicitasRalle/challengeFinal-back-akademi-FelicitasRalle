const Course = require("../models/Course");

//GET/courses (solo alumno)
exports.getCourses = async (req, res, next) => {
  try {
    const {
      category,
      level,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;
    const [total, courses] = await Promise.all([
      Course.countDocuments(filter),
      Course.find(filter)
        .populate("professor", "firstName lastName")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
    ]);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      limit: Number(limit),
      courses,
    });
  } catch (err) {
    next(err);
  }
};

//GET/courses/:id (cualquier usuario autenticado)
exports.getCoursesById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "professor",
      "firstName lastName"
    );
    if (!course) {
      return res.status(404).json({ message: "No se encontro el curso" });
    }
    res.json(course);
  } catch (err) {
    next(err);
  }
};

//POST/courses (solo profesor y superadmin)
exports.createCourse = async (req, res, next) => {
  try {
    const data = { ...req.body, professor: req.user._id };
    const course = await Course.create(data);
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

//PUT/courses:id (solo profesor propietario y superadmin)
exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "No se encontro el curso" });
    }
    if (course.professor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "No autorizado para editar este curso" });
    }
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updatedCourse);
  } catch (err) {
    next(err);
  }
};

//DELETE/courses/:id (solo el profesor y el superadmin)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "No se encontro el curso" });
    }
    if (course.professor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "No autorizado para eliminar este curso" });
    }
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Curso eliminado" });
  } catch (err) {
    next(err);
  }
};

//GET/courses/professor/:professorId
exports.getCoursesByProfessor = async (req, res, next) => {
  try {
    const { professorId } = req.params;
    //el profesor solo puede ver sus cursos
    if (
      req.user.rolo !== "professor" ||
      req.user._id.toString() !== professorId
    ) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    const courses = await Course.find({ professor: professorId });
    res.josn(courses);
  } catch (err) {
    next(err);
  }
};
