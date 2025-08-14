import { Router } from "express";
import { TasksController } from "./tasks.controller";
import { authenticate, authorize } from "../../middlewares/auth";

/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: List tasks
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Page size (default 10, max 100)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by (default createdAt)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (default desc)
 *     responses:
 *       200:
 *         description: A list of tasks
 *   post:
 *     summary: Create task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, dueDate, priority, status]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *               assignedTo:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 * /tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, dueDate, priority, status]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Task not found
 */

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(["admin", "user"]),
  TasksController.list
);
router.put(
  "/:id",
  authenticate,
  authorize(["admin", "user"]),
  TasksController.update
);
router.get(
  "/:id",
  authenticate,
  authorize(["admin", "user"]),
  TasksController.get
);

router.delete(
  "/:id",
  authenticate,
  authorize(["admin", "user"]),
  TasksController.remove
);
router.post(
  "/",
  authenticate,
  authorize(["admin", "user"]),
  TasksController.create
);

export default router;
