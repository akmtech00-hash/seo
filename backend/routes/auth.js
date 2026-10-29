/**
 * Aegis Growth OS — Authentication & Subscription Gate Routes
 * Public endpoints for login, signup, 1-day free trial activation, and subscription upgrades.
 */

const express = require('express');
const router = express.Router();
const authService = require('../services/auth_service');

// Helper to extract session token from cookies, headers, or query
function extractToken(req) {
  if (req.cookies && req.cookies.aegis_session_token) {
    return req.cookies.aegis_session_token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
}

// 1. User Signup (Defaults to activating 1-Day Free Trial unless paid plan chosen)
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, companyName, plan, startTrial } = req.body;
    const shouldStartTrial = startTrial !== undefined ? Boolean(startTrial) : !plan;

    const result = await authService.signup({
      email,
      password,
      name,
      companyName,
      plan,
      startTrial: shouldStartTrial
    });

    // Set cookie for browser sessions (1 day expiry or 30 days)
    const maxAge = shouldStartTrial ? 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
    res.setHeader('Set-Cookie', `aegis_session_token=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge / 1000}`);

    res.status(201).json({
      success: true,
      message: shouldStartTrial 
        ? 'Account created with 1-Day Full Access Free Trial!' 
        : 'Account created with subscription!',
      token: result.token,
      user: result.user,
      allowed: result.allowed,
      redirectUrl: result.allowed ? '/dashboard' : '/login.html?step=subscribe'
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 2. User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.setHeader('Set-Cookie', `aegis_session_token=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);

    res.json({
      success: true,
      message: 'Authentication successful',
      token: result.token,
      user: result.user,
      allowed: result.allowed,
      redirectUrl: result.allowed ? '/dashboard' : '/login.html?reason=' + (result.user.subscription_status === 'expired' ? 'trial_expired' : 'subscription_required')
    });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
});

// 3. Current User Session Check
router.get('/me', async (req, res) => {
  try {
    const token = extractToken(req);
    const session = await authService.verifySession(token);

    if (!session.valid) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        allowed: false,
        reason: session.reason
      });
    }

    res.json({
      success: true,
      authenticated: true,
      allowed: session.allowed,
      reason: session.reason,
      user: session.user,
      trialRemainingMs: session.trialRemainingMs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Activate 1-Day Free Trial (24 Hours)
router.post('/start-trial', async (req, res) => {
  try {
    const token = extractToken(req);
    const session = await authService.verifySession(token);

    if (!session.valid || !session.user) {
      return res.status(401).json({ success: false, error: 'Authentication required to activate free trial' });
    }

    const updatedUser = await authService.startOneDayTrial(session.user.id);
    res.json({
      success: true,
      message: '1-Day Free Trial activated! You have 24 hours of full platform access.',
      user: updatedUser,
      allowed: true,
      redirectUrl: '/dashboard'
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 5. Upgrade or Subscribe to a Paid Plan
router.post('/subscribe', async (req, res) => {
  try {
    const token = extractToken(req);
    const session = await authService.verifySession(token);

    if (!session.valid || !session.user) {
      return res.status(401).json({ success: false, error: 'Authentication required to subscribe' });
    }

    const { plan = 'growth_monthly' } = req.body;
    const updatedUser = await authService.subscribe(session.user.id, plan);

    res.json({
      success: true,
      message: `Successfully subscribed to ${plan}! Client portal access unlocked.`,
      user: updatedUser,
      allowed: true,
      redirectUrl: '/dashboard'
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 6. Logout
router.post('/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'aegis_session_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
