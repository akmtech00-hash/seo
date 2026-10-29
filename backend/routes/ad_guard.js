/**
 * Aegis Growth OS — Programmatic Real-Time Ad Guard Router
 * Routes: POST /evaluate-visibility-drop, GET /status, POST /simulate-drop
 */

const express = require('express');
const router = express.Router();
const adGuardService = require('../services/ad_guard_service');

// Evaluate visibility drop
router.post('/evaluate-visibility-drop', async (req, res) => {
  try {
    const result = await adGuardService.evaluateVisibilityDrop(req.body || {});
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: 'Failed to adjust ad spending parameters', details: err.message });
  }
});

// Get status
router.get('/status', async (req, res) => {
  try {
    const status = await adGuardService.getAdGuardStatus(req.query.website_id);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger quick simulation for testing & demonstration
router.post('/simulate-drop', async (req, res) => {
  try {
    const result = await adGuardService.evaluateVisibilityDrop({
      website_id: req.body.website_id || 'site_01',
      keyword_topic: req.body.keyword_topic || 'enterprise distributed db',
      current_share_of_voice: req.body.current_share_of_voice || 32.4
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
