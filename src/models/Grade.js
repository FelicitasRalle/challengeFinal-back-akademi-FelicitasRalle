const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El alumno es obligatorio']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'El curso es obligatorio']
  },
  value: {
    type: Number,
    required: [true, 'La nota es obligatoria'],
    min: [0, 'La nota no puede ser menor que 0'],
    max: [10, 'La nota no puede ser mayor que 10']
  }
}, {
  timestamps: true
});

//un solo registro por alumno-curso
gradeSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Grade', gradeSchema);
