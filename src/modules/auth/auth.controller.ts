import { Request, Response } from "express";
import * as AuthService from "./auth.service";
import logger from "../../lib/logger";

export const AuthController = {
  async register(req: Request, res: Response) {
    const { name, email, password, role } = req.body;
    const user = await AuthService.register(name, email, password, role);
    return res.status(201).json(user);
  },
  async login(req: Request, res: Response) {
    logger.info("Login request in controller");
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    return res.json(result);
  },
};
