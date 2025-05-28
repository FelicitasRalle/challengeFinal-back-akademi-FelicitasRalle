const express = require('express');
const{
    getAllUsers,
    getUser,
    updateUser,
    deleteUser
}= require('../controllers/userController');
const { protect, restrictTo }=require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); //todas van a necesitar un tokeb
router.get('/', restrictTo('superadmin'), getAllUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', restrictTo('superadmin'), deleteUser);

module.exports = router;