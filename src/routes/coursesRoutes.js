const express = require("express");
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCoursesByProfessor,
} = require("../controllers/courseController");

const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", restrictTo("student"), getCourses);
router.get("/:id", getCourseById);
router.post("/", restrictTo("professor"), createCourse);
router.put("/:id", restrictTo("professor"), updateCourse);
router.delete("/:id", restrictTo("professor"), deleteCourse);
router.get(
  "/professor/:professorId",
  restrictTo("professor"),
  getCoursesByProfessor
);

module.exports = router;
