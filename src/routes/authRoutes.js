const express = require('express');
const { body } = require('express-validator');
const{
  register,
  login,
  forgotPassword,
  resetPassword
}= require('../controllers/authController');

const router = express.Router();

// POST /auth/register
// registra un alumno (role: 'student')
router.post(
  '/register',
  [
    body('firstName').notEmpty().withMessage('firstName es obligatorio'),
    body('lastName').notEmpty().withMessage('lastName es obligatorio'),
    body('email').isEmail().withMessage('email inválido'),
    body('password').isLength({ min: 6 }).withMessage('password min 6 caracteres')
  ],
  register
);

// POST /auth/login
// autentica usuario y devuelve jwt
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('email inválido'),
    body('password').notEmpty().withMessage('password es obligatorio')
  ],
  login
);

/ POST /auth/forgot-password
router.post(
  '/forgot-password',
  [ body('email').isEmail().withMessage('email inválido') ],
  forgotPassword
);

// POST /auth/reset-password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('token es obligatorio'),
    body('password').isLength({ min: 6 }).withMessage('password min 6 caracteres')
  ],
  resetPassword
);

module.exports = router;


