const jwt = require('jsonwebtoken');
const User = require('../models/Users');

//verificar q existe el token y lo pasa a decodificar
exports.protect = async (req, res, next) =>{
    let token;
    const authHeader = req.headers.authorization;
    if(authHeader && authHeader.startsWith('Bearer')){
        token = authHeader.split(' ')[1];
    }
    if(!token){
        return res.status(401).json({ message: 'No se autorizo, token incorrecto o faltante' });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        next();
    }catch(error){
        return res.status(401).json({ message: 'Token invalido' });
    }
};

//restringir roles
exports.restrictTo = (...roles) =>{
    return (req, res, next)=>{
        if (!roles.includes(req.user.role)){
            return res.status(403).json({ message: 'Permiso no autorizado para este rol'});
        }
        next();
    };
};