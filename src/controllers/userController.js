const User = require("../models/User");
const Course = require("../models/Course");

// POST/users
//creo un usuario con rol 'professor' o 'superadmin' (solo superadmin)
exports.createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    //valido el rol
    if (!["professor", "superadmin", "student"].includes(role)) {
      return res.status(400).json({ message: "Rol inválido" });
    }
    //crear usuario
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });
    //remover contraseña del output
    const result = user.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (err) {
    //email duplicado
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email ya registrado" });
    }
    next(err);
  }
};

//GET/users (solo el superadmin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const {
      email,
      role,
      firstName,
      lastName,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;
    const filter = {};
    if (email) filter.email = email;
    if (role) filter.role = role;
    if (firstName) filter.firstName = new RegExp(firstName, "i");
    if (lastName) filter.lastName = new RegExp(lastName, "i");

    const skip = (page - 1) * limit;
    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("-password")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
    ]);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      limit: Number(limit),
      users,
    });
  } catch (err) {
    next(err);
  }
};

//GET/users:id (superadmin o el mismo usuario)
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Usuario inexistente" });
    }
    if (req.user.role !== "superadmin" && req.user.id !== user.id) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    res.json(user);
  } catch (error) {
    next(err);
  }
};

//PUT/users:id (editar su perfil, superadmin o el propio usuario)
exports.updateUser = async (req, res, next) => {
  try {
    //pruebo primero con nom y ap
    const { firstName, lastName, email, role } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuario no existe" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

//DELETE/users:id (solo superadmin)
exports.deleteUser = async (req, res, next) => {
  try {
    //busco primero un usuario sin eliminarlo
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no existe" });
    }

    //si es profesor, verifico si tiene cursos asociados
    if (user.role === "professor") {
      const count = await Course.countDocuments({ professor: user._id });
      if (count > 0) {
        return res
          .status(409)
          .json({
            message: "No se puede eliminar un profesor con cursos asignados",
          });
      }
    }

    //eliminar si paso la validacion
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    next(err);
  }
};
