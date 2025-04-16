import express from "express";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourses,
  getDetails,
  buyCourses,
} from "../controllers/course.controller.js";
import adminMiddleware from "../middleware/admin.mid.js";
import userMiddleware from "../middleware/user.mid.js";

const router = express.Router();

// Admin-only actions
router.post("/create", adminMiddleware, createCourse); 
router.put("/update/:courseId", adminMiddleware, updateCourse); 
router.delete("/delete/:courseId", adminMiddleware, deleteCourse); 

// Public routes
router.get("/", getCourses);
router.get("/details/:courseId", getDetails);

// User-only route
router.post("/buy/:courseId", userMiddleware, buyCourses);

export default router;
