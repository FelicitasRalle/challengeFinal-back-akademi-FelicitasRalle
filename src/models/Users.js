const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentProfileSchema = new mongoose.Schema({
  enrolledCourses: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }
  ],
  grades: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Grade' }
  ]
}, { _id: false });

const professorProfileSchema = new mongoose.Schema({
  createdCourses: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }
  ],
  department: { type: String }
}, { _id: false });

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'El nombre es obligatorio']
  },
  lastName: {
    type: String,
    required: [true, 'El apellido es obligatorio']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Formato de email inválido'
    ]
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  role: {
    type: String,
    enum: ['student', 'professor', 'superadmin'],
    default: 'student'
  },

  studentProfile: {
    type: studentProfileSchema,
    default: () => ({})
  },
  professorProfile: {
    type: professorProfileSchema,
    default: () => ({})
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
