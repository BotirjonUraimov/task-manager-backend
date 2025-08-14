import { Router } from "express";
import { UsersController } from "./users.controller";
import { authenticate, authorize } from "../../middlewares/auth";

const router = Router();

router.get("/", authenticate, authorize(["admin"]), UsersController.list);
router.get("/:id", authenticate, authorize(["admin"]), UsersController.getById);
router.post("/", authenticate, authorize(["admin"]), UsersController.create);
router.put("/:id", authenticate, authorize(["admin"]), UsersController.update);
router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  UsersController.delete
);

export default router;
