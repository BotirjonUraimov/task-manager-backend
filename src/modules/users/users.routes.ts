import { Router } from "express";
import { UsersController } from "./users.controller";
import { authenticate, authorize } from "../../middlewares/auth";

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users
 *   post:
 *     summary: Create user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Created
 * /users/{id}:
 *   get:
 *     summary: Get user by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: A user
 *       404:
 *         description: Not found
 */

const router = Router();

router.get("/", authenticate, authorize(["admin"]), UsersController.list);
router.get("/:id", UsersController.get);
router.post("/", UsersController.create);

export default router;
