import { Router } from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  toggleTaskComplete,
  deleteTask,
} from "../controllers/taskController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

router.post("/", createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.patch("/:id/complete", toggleTaskComplete);
router.delete("/:id", deleteTask);

export default router;