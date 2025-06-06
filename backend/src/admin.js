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

// CREATE compliance status
router.post('/admin/compliance', authenticate, async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json(apiError('VALIDATION_ERROR', 'Missing status'));
  try {
    const cs = await prisma.complianceStatus.create({ data: { status } });
    res.status(201).json(apiSuccess(cs));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to create compliance status', { error: err.message }));
  }
});

// UPDATE compliance status
router.put('/admin/compliance/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const cs = await prisma.complianceStatus.update({ where: { id }, data: req.body });
    res.json(apiSuccess(cs));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to update compliance status', { error: err.message }));
  }
});

// DELETE compliance status
router.delete('/admin/compliance/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.complianceStatus.delete({ where: { id } });
    res.json(apiSuccess({ id }));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to delete compliance status', { error: err.message }));
  }
});

// GET /api/v1/admin/compliance - List compliance statuses
router.get('/admin/compliance', authenticate, async (req, res) => {
  try {
    const statuses = await prisma.complianceStatus.findMany();
    res.json(apiSuccess(statuses));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to fetch compliance statuses', { error: err.message }));
  }
});

// CREATE risk flag
router.post('/admin/risks', authenticate, async (req, res) => {
  const { userId, userName, type, category, title, description, severity, status } = req.body;
  if (!userId || !userName || !type || !category || !title || !description || typeof severity === 'undefined' || !status) {
    return res.status(400).json(apiError('VALIDATION_ERROR', 'Missing required fields'));
  }
  try {
    const flag = await prisma.riskFlag.create({ data: { userId, userName, type, category, title, description, severity, status } });
    res.status(201).json(apiSuccess(flag));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to create risk flag', { error: err.message }));
  }
});

// UPDATE risk flag
router.put('/admin/risks/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const flag = await prisma.riskFlag.update({ where: { id }, data: req.body });
    res.json(apiSuccess(flag));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to update risk flag', { error: err.message }));
  }
});

// DELETE risk flag
router.delete('/admin/risks/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.riskFlag.delete({ where: { id } });
    res.json(apiSuccess({ id }));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to delete risk flag', { error: err.message }));
  }
});

// GET /api/v1/admin/risks - List risk flags (with filtering)
router.get('/admin/risks', authenticate, async (req, res) => {
  const { status, type, category } = req.query;
  try {
    const where = {
      ...(status && { status }),
      ...(type && { type }),
      ...(category && { category })
    };
    const flags = await prisma.riskFlag.findMany({ where });
    res.json(apiSuccess(flags));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to fetch risk flags', { error: err.message }));
  }
});

// CREATE webhook status
router.post('/admin/webhooks', authenticate, async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json(apiError('VALIDATION_ERROR', 'Missing status'));
  try {
    const webhook = await prisma.webhookStatus.create({ data: { status } });
    res.status(201).json(apiSuccess(webhook));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to create webhook status', { error: err.message }));
  }
});

// UPDATE webhook status
router.put('/admin/webhooks/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const webhook = await prisma.webhookStatus.update({ where: { id }, data: req.body });
    res.json(apiSuccess(webhook));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to update webhook status', { error: err.message }));
  }
});

// DELETE webhook status
router.delete('/admin/webhooks/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.webhookStatus.delete({ where: { id } });
    res.json(apiSuccess({ id }));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to delete webhook status', { error: err.message }));
  }
});

// GET /api/v1/admin/webhooks - List webhook statuses
router.get('/admin/webhooks', authenticate, async (req, res) => {
  try {
    const webhooks = await prisma.webhookStatus.findMany();
    res.json(apiSuccess(webhooks));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to fetch webhook statuses', { error: err.message }));
  }
});

// GET /api/v1/admin/compliance/metrics - Example metrics endpoint
router.get('/admin/compliance/metrics', authenticate, async (req, res) => {
  try {
    const compliantCount = await prisma.complianceStatus.count({ where: { status: 'compliant' } });
    res.json(apiSuccess({ compliantCount }));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to fetch compliance metrics', { error: err.message }));
  }
});

// GET /api/v1/admin/risks/flags - Example risk flags refresh endpoint
router.get('/admin/risks/flags', authenticate, async (req, res) => {
  try {
    const flags = await prisma.riskFlag.findMany();
    res.json(apiSuccess(flags));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to fetch risk flags', { error: err.message }));
  }
});

// GET /api/v1/admin/webhooks/health - Example webhook health endpoint
router.get('/admin/webhooks/health', authenticate, async (req, res) => {
  try {
    const webhooks = await prisma.webhookStatus.findMany();
    const healthy = webhooks.every(w => w.status === 'healthy');
    res.json(apiSuccess({ healthy }));
  } catch (err) {
    res.status(500).json(apiError('SERVER_ERROR', 'Failed to fetch webhook health', { error: err.message }));
  }
});

module.exports = { adminRouter: router };
