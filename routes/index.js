const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controller/authController");
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controller/taskController");
const authenticate = require("../Middleware/Authenticate");

// User routes
router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);

// Task routes
router.post("/tasks", authenticate, createTask);
router.get("/tasks", authenticate, getTasks);
router.put("/tasks/:id", authenticate, updateTask);
router.delete("/tasks/:id", authenticate, deleteTask);

module.exports = router;
