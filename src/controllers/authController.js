const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bycrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

//genero jwt
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// POST /auth/register
// src/controllers/authController.js
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    //creo siempre como alumno
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'student'
    });
    const token = generateToken(user._id, user.role);
    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
};


// POST /auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }
    const token = generateToken(user._id, user.role);
    res.json({
  token,
  user: {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role
  }
});

  } catch (err) {
    next(err);
  }
};

//POST/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No se encontro el usuario" });
    }

    //genero un nuevo token de un solo uso
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    //creo la url de reset
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/auth/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Recuperación de contraseña",
      text: `Para restablecer tu contraseña, ingresa en:\n\n${resetUrl}\n\nEste enlace expira en 1 hora.`,
    });

    res.json({ message: "Se envio el mail de recuperación" });
  } catch (err) {
    next(err);
  }
};

//POST/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token y contraseña son obligatorios' });
    }

    //verifico el token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(400).json({ message: 'Token expirado' });
      }
      return res.status(400).json({ message: 'Token inválido' });
    }

    //buscar usuario y actualizar contraseña
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'No se encontro el usuario' });
    }

    user.password = password;       
    await user.save();

    res.json({ message: 'Se restablecio la contraseña correctamente' });
  } catch (err) {
    next(err);
  }
};