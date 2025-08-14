import { Router } from "express";
import usersRouter from "../modules/users/users.routes";
import tasksRouter from "../modules/tasks/tasks.routes";
import authRouter from "../modules/auth/auth.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/tasks", tasksRouter);

export default router;
