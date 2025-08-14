import { Request, Response } from "express";
import { UsersService } from "./users.service";
import logger from "../../lib/logger";

export const UsersController = {
  async list(_req: Request, res: Response) {
    logger.info("Listing users in controller");
    const users = await UsersService.list();
    return res.json(users);
  },
  async getById(req: Request, res: Response) {
    const user = await UsersService.getById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  },
  async create(req: Request, res: Response) {
    const user = await UsersService.create(req.body);
    return res.status(201).json(user);
  },

  async update(req: Request, res: Response) {
    const user = await UsersService.update(req.params.id, req.body);
    return res.json(user);
  },

  async delete(req: Request, res: Response) {
    const user = await UsersService.delete(req.params.id);
    return res.json(user);
  },
};
