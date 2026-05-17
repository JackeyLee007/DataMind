import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "datamind-secret-key";

export interface JWTPayload {
  userId: string;
  tenantId?: string | null;
  tenantRole?: string | null;
  role: string;
}

export interface AuthRequest extends Request {
  userId?: string;
  tenantId?: string | null;
  tenantRole?: string | null;
  role?: string;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "未提供认证令牌" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: "令牌无效或已过期" });
  }

  req.userId = decoded.userId;
  req.tenantId = decoded.tenantId;
  req.tenantRole = decoded.tenantRole;
  req.role = decoded.role;
  next();
}
