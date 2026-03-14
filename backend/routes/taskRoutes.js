const express = require("express");
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE TASK (Admin only)
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, date, category, assignedTo } = req.body;
    console.log("Incoming assignedTo:", assignedTo);
    if (!assignedTo) {
      return res.status(400).json({ message: "Employee not selected" });
    }

    const task = await Task.create({
      title,
      description,
      date,
      category,
      assignedTo
    });

    res.json(task);

  } catch (error) {
    console.log("Task creation error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET TASKS (Employee)
router.get("/my", auth, async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.user.id });
  res.json(tasks);
});

// UPDATE STATUS
router.put("/:id", auth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json(task);
});
// ADMIN STATS
router.get("/admin-stats", auth, async (req, res) => {
  try {
    // Optional: allow only admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const total = await Task.countDocuments();
    const newTasks = await Task.countDocuments({ status: "new" });
    const completed = await Task.countDocuments({ status: "completed" });
    const failed = await Task.countDocuments({ status: "failed" });

    res.json({
      total,
      newTasks,
      completed,
      failed
    });

  } catch (error) {
    console.log("Admin stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// ADMIN - GET ALL EMPLOYEES WITH TASKS
router.get("/admin-all", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await require("../models/User").find({ role: "employee" });

    const result = [];

    for (let user of users) {
      const tasks = await Task.find({ assignedTo: user._id });

      result.push({
        _id: user._id,
        name: user.name,
        email: user.email,
        tasks
      });
    }

    res.json(result);

  } catch (err) {
    console.log("Admin All Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// COUNT SYNC
router.get("/count", auth, async (req, res) => {
  const id = req.user.id;

  const newTask = await Task.countDocuments({ assignedTo: id, status: "new" });
  const acceptedTask = await Task.countDocuments({ assignedTo: id, status: "accepted" });
  const completedTask = await Task.countDocuments({ assignedTo: id, status: "completed" });
  const failedTask = await Task.countDocuments({ assignedTo: id, status: "failed" });

  res.json({ newTask, acceptedTask, completedTask, failedTask });
});

module.exports = router;