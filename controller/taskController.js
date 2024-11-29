const Task = require("../Models/TaskModel");

const createTask = async (req, res) => {
  try {
    const { title, description, deadline, priority } = req.body;
    const userId = req.user.userId; // Extracted from authenticated token

    if (!title || !priority) {
      return res
        .status(400)
        .json({ message: "Title and priority are required." });
    }

    const newTask = new Task({
      title,
      description,
      deadline,
      priority,
      userId,
    });
    await newTask.save();

    res
      .status(201)
      .json({ task: newTask, message: "Task created successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error });
  }
};

const getTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { priority, dueBefore, search } = req.query;

    let query = { userId };

    if (priority) query.priority = priority;
    if (dueBefore) query.deadline = { $lte: new Date(dueBefore) };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const tasks = await Task.find(query).sort({ deadline: 1 });
    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, priority } = req.body;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { title, description, deadline, priority },
      { new: true }
    );

    if (!updatedTask) {
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized." });
    }

    res
      .status(200)
      .json({ task: updatedTask, message: "Task updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });

    if (!deletedTask) {
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized." });
    }

    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
