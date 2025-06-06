// Another trivial comment to verify Codecov backend coverage mapping
const express = require('express');
const { authenticate } = require('./auth');
const { households } = require('./households');

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

// GET /api/v1/bills - List bills (with filtering, pagination, sorting)
router.get('/bills', authenticate, async (req, res) => {
  const { householdId, status, page = 1, limit = 20, sort = 'dueDate' } = req.query;
  try {
    const where = {
      householdId,
      ...(status && { status }),
      household: {
        members: {
          some: { id: req.user.id }
        }
      }
    };
    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: { [sort]: 'asc' }
      }),
      prisma.bill.count({ where })
    ]);
    res.json(apiSuccess(bills, { page: Number(page), limit: Number(limit), total }));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to list bills', { error: err.message }));
  }
});

// GET /api/v1/bills/:id - Get a single bill by ID
router.get('/bills/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const bill = await prisma.bill.findUnique({ where: { id } });
    if (!bill) return res.status(404).json(apiError('NOT_FOUND', 'Bill not found'));
    const household = await prisma.household.findUnique({
      where: { id: bill.householdId },
      include: { members: true }
    });
    if (!household || !household.members.some(m => m.id === req.user.id)) {
      return res.status(403).json(apiError('FORBIDDEN', 'Not a household member'));
    }
    res.json(apiSuccess(bill));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to get bill', { error: err.message }));
  }
});

// POST /api/v1/bills - Create a new bill
router.post('/bills', authenticate, async (req, res) => {
  const { householdId, amount, dueDate, status = 'upcoming', billerName, category, isRecurring, predictedAmount } = req.body;
  if (!householdId || !amount || !dueDate || !billerName) {
    return res.status(400).json(apiError('VALIDATION_ERROR', 'Missing required fields'));
  }
  try {
    const bill = await prisma.bill.create({
      data: {
        householdId,
        amount,
        dueDate: new Date(dueDate),
        status,
        billerName,
        ...(category && { category }),
        ...(typeof isRecurring !== 'undefined' && { isRecurring }),
        ...(typeof predictedAmount !== 'undefined' && { predictedAmount })
      }
    });
    res.status(201).json(apiSuccess(bill));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to create bill', { error: err.message }));
  }
});

// PUT /api/v1/bills/:id - Update bill
router.put('/bills/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    // Only allow update if user is a member of the household
    const bill = await prisma.bill.findUnique({ where: { id } });
    if (!bill) return res.status(404).json(apiError('NOT_FOUND', 'Bill not found'));
    const household = await prisma.household.findUnique({
      where: { id: bill.householdId },
      include: { members: true }
    });
    if (!household || !household.members.some(m => m.id === req.user.id)) {
      return res.status(403).json(apiError('FORBIDDEN', 'Not a household member'));
    }
    const updated = await prisma.bill.update({
      where: { id },
      data: req.body
    });
    res.json(apiSuccess(updated));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to update bill', { error: err.message }));
  }
});

// DELETE /api/v1/bills/:id - Delete a bill
router.delete('/bills/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    // Only allow delete if user is a member of the household
    const bill = await prisma.bill.findUnique({ where: { id } });
    if (!bill) return res.status(404).json(apiError('NOT_FOUND', 'Bill not found'));
    const household = await prisma.household.findUnique({
      where: { id: bill.householdId },
      include: { members: true }
    });
    if (!household || !household.members.some(m => m.id === req.user.id)) {
      return res.status(403).json(apiError('FORBIDDEN', 'Not a household member'));
    }
    await prisma.bill.delete({ where: { id } });
    res.json(apiSuccess({ id }));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to delete bill', { error: err.message }));
  }

});

module.exports = { billsRouter: router };
