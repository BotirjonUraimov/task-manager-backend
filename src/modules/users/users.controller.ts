import { Request, Response } from "express";
import { UsersService } from "./users.service";

export const UsersController = {
  async list(_req: Request, res: Response) {
    const users = await UsersService.list();
    return res.json(users);
  },
  async get(req: Request, res: Response) {
    const user = await UsersService.get(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  },
  async create(req: Request, res: Response) {
    const user = await UsersService.create(req.body);
    return res.status(201).json(user);
  },
};
