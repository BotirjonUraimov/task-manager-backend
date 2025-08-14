import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/env";

export interface AuthPayload {
  sub: string; // user id
  role: "admin" | "user";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  console.log("header:", header);
  // JWT token
  // header: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODlkODRhMDcxOTY4NTQxMmJhOTI1MWIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTUxODkzNjUsImV4cCI6MTc1NTE5Mjk2NX0.lCttOJ_xoD5rkoDcjTo7HflKLBSxhwm9TA-Vynp5ItQ
  if (!header) {
    return res
      .status(401)
      .json({ error: "Unauthorized, you are not authenticated" });
  }
  const token = header;
  try {
    const payload = jwt.verify(token, jwtSecret) as AuthPayload;
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function authorize(roles: Array<AuthPayload["role"]>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "Unauthorized, you are not authenticated" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({
        error: "Forbidden, you are not authorized to access this resource",
      });
    return next();
  };
}
