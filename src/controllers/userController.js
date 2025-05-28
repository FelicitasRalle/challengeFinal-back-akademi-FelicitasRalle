const User = require('../models/Users');

//GET/users (solo el superadmin)

exports.getAllUsers = async (req, res, next)=>{
    try{
        const users = await User.find().select('-password');
        res.json(users);
    }catch(error){
        next(err);
    }
};


//GET/users:id (superadmin o el mismo usuario)
exports.getUser = async (req, res, next) =>{
    try{
        const user = await User.findById(req.params.id).select('-password');
        if(!user){
            return res.status(404).json({ message: 'Usuario inexistente' });
        }
        if(req.user.role !== 'superadmin' && req.user.id !== user.id){
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        res.json(user);
    }catch(error){
        next(err);
    }
};

//PUT/users:id (editar su perfil, superadmin o el propio usuario)
exports.updateUser = async (req, res, next) => {
  try {
    //pruebo primero con nom y ap
    const { firstName, lastName } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no existe' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

//DELETE/users:id (solo superadmin)
exports.deleteUser = async (req, res, next)=>{
    try{
        const user = await User.findByIdAndDelete(req.params.id);
        if(!user){
            return res.status(404).json({ message: 'El usuario no existe' });
        }
        res.json({ message: 'El usuario se ha eliminado correctamente' });
    }catch(err){
        next(err);
    }
};