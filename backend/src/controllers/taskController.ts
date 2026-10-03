import { Response } from "express";
import mongoose from "mongoose";
import { Task, TaskPriority } from "../models/Task";
import { AuthRequest } from "../middleware/authMiddleware";

const validPriorities: TaskPriority[] = [
  "low",
  "medium",
  "high",
];

export const createTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const {
      title,
      description,
      scheduledAt,
      deadline,
      priority,
      category,
    } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      res.status(400).json({
        success: false,
        message: "Task title is required",
      });
      return;
    }

    if (
      priority !== undefined &&
      !validPriorities.includes(priority)
    ) {
      res.status(400).json({
        success: false,
        message: "Priority must be low, medium, or high",
      });
      return;
    }

    const task = await Task.create({
      userId: req.userId,
      title: title.trim(),
      description,
      scheduledAt,
      deadline,
      priority: priority || "medium",
      category,
      completed: false,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: {
        task,
      },
    });
  } catch (error) {
    console.error("Create task error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
};

export const getTasks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const tasks = await Task.find({
      userId: req.userId,
    }).sort({
      completed: 1,
      deadline: 1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: {
        tasks,
        count: tasks.length,
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};

export const getTaskById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
      return;
    }

    const task = await Task.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    console.error("Get task error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch task",
    });
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
      return;
    }

    const {
      title,
      description,
      scheduledAt,
      deadline,
      priority,
      category,
      completed,
    } = req.body;

    if (
      title !== undefined &&
      (typeof title !== "string" || !title.trim())
    ) {
      res.status(400).json({
        success: false,
        message: "Task title cannot be empty",
      });
      return;
    }

    if (
      priority !== undefined &&
      !validPriorities.includes(priority)
    ) {
      res.status(400).json({
        success: false,
        message: "Priority must be low, medium, or high",
      });
      return;
    }

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) {
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (scheduledAt !== undefined) {
      updateData.scheduledAt = scheduledAt;
    }

    if (deadline !== undefined) {
      updateData.deadline = deadline;
    }

    if (priority !== undefined) {
      updateData.priority = priority;
    }

    if (category !== undefined) {
      updateData.category = category;
    }

    if (completed !== undefined) {
      updateData.completed = completed;
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: id,
        userId: req.userId,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: {
        task,
      },
    });
  } catch (error) {
    console.error("Update task error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
};

export const toggleTaskComplete = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
      return;
    }

    const task = await Task.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
      return;
    }

    task.completed = !task.completed;
    await task.save();

    res.status(200).json({
      success: true,
      message: task.completed
        ? "Task completed"
        : "Task marked incomplete",
      data: {
        task,
      },
    });
  } catch (error) {
    console.error("Toggle task error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update task status",
    });
  }
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
      return;
    }

    const task = await Task.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete task",
    });
  }
};