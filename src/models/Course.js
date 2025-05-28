const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título del curso es obligatorio']
  },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria']
  },
  category: {
    type: String,
    required: [true, 'La categoría es obligatoria']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  price: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  maxStudents: {
    type: Number,
    required: [true, 'El cupo máximo es obligatorio'],
    min: [1, 'Debe haber al menos 1 estudiante permitido']
  },
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El curso debe tener un profesor asignado']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
