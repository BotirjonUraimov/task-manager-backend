import { Request, Response } from "express";
import { TasksService } from "./tasks.service";

export const TasksController = {
  async list(_req: Request, res: Response) {
    const tasks = await TasksService.list();
    return res.json(tasks);
  },
  async get(req: Request, res: Response) {
    const task = await TasksService.get(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    return res.json(task);
  },
  async create(req: Request, res: Response) {
    const task = await TasksService.create(req.body);
    return res.status(201).json(task);
  },
};
