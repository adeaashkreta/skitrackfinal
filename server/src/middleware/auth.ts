import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../env";
import { HttpError } from "./error";

export type Role = "user" | "resort_manager" | "super_admin";

export interface AuthedUser {
  _id: string;
  role: Role;
  email: string;
  name: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw new HttpError(401, "Missing bearer token");
  const token = header.slice("Bearer ".length);
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthedUser & { iat: number; exp: number };
    req.user = { _id: decoded._id, role: decoded.role, email: decoded.email, name: decoded.name };
    next();
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new HttpError(401, "Not authenticated");
    if (!roles.includes(req.user.role)) throw new HttpError(403, "Forbidden");
    next();
  };
}

export function signToken(user: AuthedUser): string {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
}
