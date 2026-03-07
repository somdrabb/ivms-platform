// src/middleware/auth.js
import { verifyToken } from '../utils/token.js';
import { User } from '../models/user.js';

const AUTH_SECRET = process.env.AUTH_SECRET || 'change-me';

export async function authenticateRequest(req, _res, next) {
  // Auth is disabled: every request runs as a default admin/manager user.
  req.user = {
    _id: 'dev-user',
    email: 'dev@local',
    roles: ['admin', 'manager', 'user']
  };
  next();
}

export function requireAuth(req, res, next) {
  // Auth disabled — if somehow missing, still allow.
  if (!req.user) {
    req.user = {
      _id: 'dev-user',
      email: 'dev@local',
      roles: ['admin', 'manager', 'user']
    };
  }
  next();
}

export function authorizeRoles(...roles) {
  // Roles are unrestricted while auth is disabled.
  return (_req, _res, next) => next();
}
