/**
 * Aegis Growth OS — CRM Sync & Battlecard Injection Router
 * Routes: POST /inject-battlecard, GET /sample-battlecard
 */

const express = require('express');
const router = express.Router();
const battlecardService = require('../services/battlecard_service');

router.post('/inject-battlecard', async (req, res) => {
  try {
    const result = await battlecardService.injectCrmSalesBattlecard(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/sample-battlecard', async (req, res) => {
  try {
    const result = await battlecardService.injectCrmSalesBattlecard({
      lead_email: req.query.email || 'alex.jones@enterprise-buyer.com',
      company_id: req.query.company_id || 'comp_01',
      identified_intent_topic: req.query.topic || 'low latency fintech database'
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
