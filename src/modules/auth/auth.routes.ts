import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticate, authorize } from "../../middlewares/auth";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

router.get(
  "/me",
  authenticate,
  authorize(["admin", "user"]),
  AuthController.me
);

export default router;
