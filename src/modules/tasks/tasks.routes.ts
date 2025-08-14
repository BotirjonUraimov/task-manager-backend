import { Router } from "express";
import { TasksController } from "./tasks.controller";

const router = Router();

router.get("/", TasksController.list);
router.get("/:id", TasksController.get);
router.post("/", TasksController.create);

export default router;
