import { Router } from "express";
import { TasksController } from "./tasks.controller";
import { authenticate, authorize } from "../../middlewares/auth";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(["admin", "user"]),
  TasksController.list
);
router.get(
  "/assigned",
  authenticate,
  authorize(["user"]),
  TasksController.listAssigned
);

router.get(
  "/analytics",
  authenticate,
  authorize(["admin"]),
  TasksController.analytics
);

router.get(
  "/:id",
  authenticate,
  authorize(["admin", "user"]),
  TasksController.get
);

router.post(
  "/",
  authenticate,
  authorize(["admin", "user"]),
  TasksController.create
);
router.put(
  "/:id",
  authenticate,
  authorize(["admin", "user"]),
  TasksController.update
);
router.delete(
  "/:id",
  authenticate,
  authorize(["admin", "user"]),
  TasksController.remove
);

export default router;
