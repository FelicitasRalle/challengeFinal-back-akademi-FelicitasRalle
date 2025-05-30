const Grade = require('../models/Grade');
const Course = require('../models/Course');

//POST/grades
exports.createGrade = async (req, res, next)=>{
    try{
        const { studentId, courseId, value } = req.body;

        //verdfico el curso y q el profesor sea el propietario
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({ message: 'No se encontro el curso' });
        }
        if(course.professor.toString() !== req.user._id.toString()){
            return res.status(403).json({ message: 'No esta autorizado para calificar este curso' });
        }

        const grade = await Grade.create({ student: studentId, course: courseId, value });
        res.status(201).json(grade);
    }catch (err){
        if(err.code === 11000){
            return res.status(400).json({ message: 'Ya existe una calificacion para este alumno en este curso'});
        }
        next(err);
    }
};

//PUT/grades/:id
exports.updateGrade = async (req, res, next)=>{
    try{
        const grade = await Grade.findById(req.params.id);
        if(!grade){
            return res.status(404).json({ message: 'No se encontro la calificacion' });
        }

        //verifico q el profesor sea el encargado del curso correspondiente
        const course = await Course.findById(grade.course);
        if(course.professor.toString() !== req.user._id.toString()){
            return res.status(403).json({ message: 'No esta autorizado para editar esta calificacion' });
        }

        grade.value = req.body.value;
        await grade.save();
        res.json(grade);
    }catch(err){
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