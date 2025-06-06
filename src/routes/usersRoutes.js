const express = require("express");
const { body } = require('express-validator');
const {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect); //todas van a necesitar un tokeb
router.post(
  "/",
  restrictTo("superadmin"),
  [
    body("firstName").notEmpty().withMessage("firstName es obligatorio"),
    body("lastName").notEmpty().withMessage("lastName es obligatorio"),
    body("email").isEmail().withMessage("email inválido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("password mínimo 6 caracteres"),
    body("role")
      .notEmpty()
      .withMessage("role es obligatorio")
      .isIn(["professor", "superadmin", "student"])
      .withMessage("role inválido"),
  ],
  createUser
);

router.get("/", restrictTo("superadmin"), getAllUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", restrictTo("superadmin"), deleteUser);

module.exports = router;
