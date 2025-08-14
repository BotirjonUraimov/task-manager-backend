import { Request, Response } from "express";
import { TasksService } from "./tasks.service";
import logger from "../../lib/logger";

export const TasksController = {
  async list(req: Request, res: Response) {
    logger.info("Listing tasks in controller");
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const sortBy = req.query.sortBy ? String(req.query.sortBy) : "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";
    const tasks = await TasksService.list(
      {
        id: req.user!.sub,
        role: req.user!.role,
      },
      { page, limit, sortBy, sortOrder }
    );
    return res.json(tasks);
  },

  async get(req: Request, res: Response) {
    console.log("Controller get - params:", req.params, "user:", req.user);
    const task = await TasksService.get(req.params.id, {
      id: req.user!.sub,
      role: req.user!.role,
    });
    console.log("Controller get - result:", task);
    if (!task) return res.status(404).json({ error: "Task not found" });
    return res.json(task);
  },

  async create(req: Request, res: Response) {
    logger.info("Creating task in controller");
    if (!req.body || typeof req.body !== "object") {
      logger.error("Invalid JSON body");
      return res.status(400).json({ error: "Invalid JSON body" });
    }
    const task = await TasksService.create(req.body, {
      id: req.user!.sub,
      role: req.user!.role,
    });
    return res.status(201).json(task);
  },

  async update(req: Request, res: Response) {
    logger.info("Updating task in controller");
    const updated = await TasksService.update(req.params.id, req.body, {
      id: req.user!.sub,
      role: req.user!.role,
    });
    if (!updated) return res.status(404).json({ error: "Task not found" });
    return res.json(updated);
  },

  async remove(req: Request, res: Response) {
    const ok = await TasksService.remove(req.params.id, {
      id: req.user!.sub,
      role: req.user!.role,
    });
    if (!ok) return res.status(404).json({ error: "Task not found" });
    return res.status(204).send();
  },
};
