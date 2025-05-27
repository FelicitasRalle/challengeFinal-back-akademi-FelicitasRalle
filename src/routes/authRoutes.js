const express = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');
const router = express.Router();

// registro es solo para alumnos
router.post(
  '/register',
  [
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
  ],
  register
);

//login para el resto de los roles
router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty()
  ],
  login
);

module.exports = router;

