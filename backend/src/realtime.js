const express = require('express');
const { authenticate } = require('./auth');
const router = express.Router();

// Simple in-memory event queue for demo (replace with real pub/sub or DB in prod)
let eventQueue = [];

// Helper: format API response
function apiSuccess(data, meta = {}) {
  return { success: true, data, meta: { timestamp: new Date().toISOString(), ...meta } };
}

// POST /api/v1/events - Publish a new event (for testing)
router.post('/events', authenticate, (req, res) => {
  const { type, payload } = req.body;
  if (!type || !payload) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing type or payload' }, meta: { timestamp: new Date().toISOString() } });
  }
  const event = {
    type,
    payload,
    timestamp: new Date().toISOString(),
    userId: req.user.id,
    householdId: req.user.householdId
  };
  eventQueue.push(event);
  res.status(201).json(apiSuccess(event));
});

// GET /api/v1/events/stream - Server-Sent Events (SSE) endpoint for real-time updates
router.get('/events/stream', authenticate, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial event(s)
  eventQueue.forEach(event => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  // Simple polling every 2s for new events (replace with real pub/sub for scale)
  const interval = setInterval(() => {
    eventQueue.forEach(event => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });
    eventQueue = [];
  }, 2000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

module.exports = { realtimeRouter: router };
