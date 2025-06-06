const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN = '1h';

// Helper: format API response
function apiSuccess(data, meta = {}) {
  return { success: true, data, meta: { timestamp: new Date().toISOString(), ...meta } };
}
function apiError(code, message, details = {}) {
  return {
    success: false,
    error: { code, message, details },
    meta: { timestamp: new Date().toISOString(), requestId: Math.random().toString(36).slice(2) }
  };
}

// Register endpoint
router.post('/register', async (req, res) => {
  const { username, password, householdId = null, role = 'user' } = req.body;
  if (!username || !password) {
    return res.status(400).json(apiError('VALIDATION_ERROR', 'Missing required fields', { username }));
  }
  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res.status(409).json(apiError('USER_EXISTS', 'User already exists'));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, householdId, role }
    });
    res.status(201).json(apiSuccess({ id: user.id, username, householdId, role }));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to register user', { error: err.message }));
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json(apiError('INVALID_CREDENTIALS', 'Invalid username or password'));
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json(apiError('INVALID_CREDENTIALS', 'Invalid username or password'));
    }
    const token = jwt.sign({ id: user.id, username: user.username, householdId: user.householdId, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json(apiSuccess({ token }));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to login', { error: err.message }));
  }
});

// Refresh endpoint (stateless pattern)
router.post('/refresh', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json(apiError('MISSING_TOKEN', 'No token provided'));
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json(apiError('INVALID_TOKEN', 'Invalid or expired token'));
    const newToken = jwt.sign({ id: decoded.id, username: decoded.username, householdId: decoded.householdId, role: decoded.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json(apiSuccess({ token: newToken }));
  });
});

// Logout endpoint (stateless)
router.post('/logout', (req, res) => {
  // In stateless JWT, logout is handled client-side (token deletion)
  res.json(apiSuccess({ message: 'Logged out' }));
});

// Auth middleware
function authenticate(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json(apiError('NO_TOKEN', 'Missing or invalid Authorization header'));
  }
  const token = auth.replace('Bearer ', '');
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json(apiError('INVALID_TOKEN', 'Invalid or expired token'));
    req.user = decoded;
    req.householdId = decoded.householdId;
    next();
  });
}

// User profile endpoint
router.get('/users/profile', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json(apiError('NOT_FOUND', 'User not found'));
    res.json(apiSuccess({ id: user.id, username: user.username, householdId: user.householdId, role: user.role }));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to fetch profile', { error: err.message }));
  }
});

module.exports = { authRouter: router, authenticate };
