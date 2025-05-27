const User = require('../models/User');
const jwt = require('jsonwebtoken');

//genero jwt
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// POST /auth/register
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const user = await User.create({ firstName, lastName, email, password });
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
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    const token = generateToken(user._id, user.role);
    res.json({ token });
  } catch (err) {
    next(err);
  }
};
