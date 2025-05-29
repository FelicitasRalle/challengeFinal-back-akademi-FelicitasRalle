const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
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
  enrolledAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
