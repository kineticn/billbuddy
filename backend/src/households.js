const express = require('express');
const { authenticate } = require('./auth');

const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

// GET /api/v1/households - List households for the current user (with pagination)
router.get('/households', authenticate, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  try {
    const [households, total] = await Promise.all([
      prisma.household.findMany({
        skip: (page - 1) * limit,
        take: Number(limit),
        where: {
          members: {
            some: { id: req.user.id }
          }
        },
        include: { members: true }
      }),
      prisma.household.count({
        where: {
          members: {
            some: { id: req.user.id }
          }
        }
      })
    ]);
    res.json(apiSuccess(households, { page: Number(page), limit: Number(limit), total }));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to list households', { error: err.message }));
  }
});

// POST /api/v1/households - Create a new household
router.post('/households', authenticate, async (req, res) => {
  const { name, type = 'home', role = 'owner' } = req.body;
  if (!name) return res.status(400).json(apiError('VALIDATION_ERROR', 'Household name required'));
  try {
    const household = await prisma.household.create({
      data: {
        name,
        type,
        role,
        totalMonthlyOutflow: 0,
        upcomingJointBills: 0,
        members: { connect: { id: req.user.id } }
      },
      include: { members: true }
    });
    res.status(201).json(apiSuccess(household));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to create household', { error: err.message }));
  }
});

// PUT /api/v1/households/:id - Update household info
router.put('/households/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    // Only allow update if user is a member
    const household = await prisma.household.findUnique({
      where: { id },
      include: { members: true }
    });
    if (!household || !household.members.some(m => m.id === req.user.id)) {
      return res.status(404).json(apiError('NOT_FOUND', 'Household not found'));
    }
    const updated = await prisma.household.update({
      where: { id },
      data: req.body,
      include: { members: true }
    });
    res.json(apiSuccess(updated));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to update household', { error: err.message }));
  }
});

module.exports = { householdsRouter: router };
