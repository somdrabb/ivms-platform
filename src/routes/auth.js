// src/routes/auth.js
import express from 'express';
import { User } from '../models/user.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken } from '../utils/token.js';
import { requireAuth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
const AUTH_SECRET = process.env.AUTH_SECRET || 'change-me';

function sanitizeUser(userDoc) {
  if (!userDoc) return null;
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete user.passwordHash;
  delete user.passwordSalt;
  return user;
}

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, roles = ['clerk'] } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    const { hash, salt } = hashPassword(password);
    let assignedRoles = Array.isArray(roles) && roles.length ? roles : ['clerk'];
    const userCount = await User.countDocuments();
    if (!userCount && !assignedRoles.includes('admin')) {
      assignedRoles.push('admin');
    } else if (userCount && (!req.user || !req.user.roles?.includes('admin'))) {
      return res.status(403).json({ error: 'Only admins can create new users.' });
    }
    const doc = await User.create({
      email: normalizedEmail,
      name,
      passwordHash: hash,
      passwordSalt: salt,
      roles: [...new Set(assignedRoles)],
      isActive: true
    });
    res.status(201).json(sanitizeUser(doc));
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail, isActive: true });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const valid = verifyPassword(password, user.passwordSalt, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    user.lastLoginAt = new Date();
    await user.save();
    const token = generateToken(
      { sub: user.id, roles: user.roles || [] },
      { secret: AUTH_SECRET, expiresIn: '8h' }
    );
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.get('/', requireAuth, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash -passwordSalt').lean();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.patch('/:userId/roles', requireAuth, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const roles = Array.isArray(req.body?.roles) ? req.body.roles : [];
    if (!roles.length) {
      return res.status(400).json({ error: 'roles[] is required' });
    }
    const doc = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { roles } },
      { new: true }
    ).select('-passwordHash -passwordSalt');
    if (!doc) return res.status(404).json({ error: 'User not found' });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

export default router;
