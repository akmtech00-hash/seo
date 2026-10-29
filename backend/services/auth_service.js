/**
 * Aegis Growth OS — Authentication & Subscription Gate Service
 * Handles user identity, 1-Day Free Trial (24 hours) lifecycle, and subscription tier enforcement.
 */

const crypto = require('crypto');
const db = require('../database/db');

// Exact 1-day free trial duration: 24 hours in milliseconds
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

class AuthService {
  /**
   * Hash password with SHA-256 and constant salt
   */
  hashPassword(password) {
    if (!password) return '';
    return crypto.createHash('sha256').update(password + 'aegis_salt_2026_growth_os').digest('hex');
  }

  /**
   * Generate secure session token
   */
  generateSessionToken() {
    return 'sess_' + crypto.randomBytes(24).toString('hex');
  }

  /**
   * Register a new user with optional 1-day trial or paid subscription
   */
  async signup({ email, password, name, companyName, plan, startTrial = true }) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await db.getUserByEmail(cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists. Please sign in.');
    }

    const now = new Date();
    let subscription_status = 'none';
    let subscription_tier = null;
    let trial_started_at = null;
    let trial_ends_at = null;

    if (startTrial) {
      subscription_status = 'trialing';
      subscription_tier = 'trial_1day';
      trial_started_at = now;
      trial_ends_at = new Date(now.getTime() + ONE_DAY_MS);
    } else if (plan && plan !== 'none') {
      subscription_status = 'active';
      subscription_tier = plan;
    }

    const session_token = this.generateSessionToken();

    const newUser = await db.createUser({
      email: cleanEmail,
      passwordHash: this.hashPassword(password),
      name: name || cleanEmail.split('@')[0],
      company_id: companyName ? `comp_${Date.now()}` : 'comp_01',
      subscription_status,
      subscription_tier,
      trial_started_at,
      trial_ends_at,
      session_token
    });

    let connectedDomain = null;
    if (companyName) {
      const cleanCandidate = companyName.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (cleanCandidate) {
        try {
          const site = await db.addWebsite(cleanCandidate, newUser.company_id);
          connectedDomain = site.domain;
        } catch (e) {
          console.warn('Auto-domain add skipped:', e.message);
        }
      }
    } else if (cleanEmail.includes('@')) {
      const emailDomain = cleanEmail.split('@')[1];
      if (!['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'].includes(emailDomain)) {
        try {
          const site = await db.addWebsite(emailDomain, newUser.company_id);
          connectedDomain = site.domain;
        } catch (e) {
          // ignore
        }
      }
    }

    return {
      user: this.sanitizeUser(newUser),
      token: session_token,
      connectedDomain,
      allowed: this.isUserAllowed(newUser)
    };
  }

  /**
   * Authenticate user with email and password
   */
  async login({ email, password }) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await db.getUserByEmail(cleanEmail);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const computedHash = this.hashPassword(password);
    if (user.passwordHash !== computedHash) {
      throw new Error('Invalid email or password');
    }

    // Refresh trial expiry check
    await this.refreshUserTrialState(user);

    // Update session token
    const session_token = this.generateSessionToken();
    await db.updateUser(user.id, { session_token });
    user.session_token = session_token;

    return {
      user: this.sanitizeUser(user),
      token: session_token,
      allowed: this.isUserAllowed(user)
    };
  }

  /**
   * Start 1-day free trial for an existing user
   */
  async startOneDayTrial(userId) {
    const user = await db.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const trial_started_at = now;
    const trial_ends_at = new Date(now.getTime() + ONE_DAY_MS);

    const updated = await db.updateUser(userId, {
      subscription_status: 'trialing',
      subscription_tier: 'trial_1day',
      trial_started_at,
      trial_ends_at
    });

    return this.sanitizeUser(updated);
  }

  /**
   * Subscribe user to a paid plan
   */
  async subscribe(userId, plan) {
    const user = await db.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const validPlans = ['growth_monthly', 'scale_monthly', 'enterprise_monthly', 'growth_pro'];
    const chosenPlan = validPlans.includes(plan) ? plan : 'growth_monthly';

    const updated = await db.updateUser(userId, {
      subscription_status: 'active',
      subscription_tier: chosenPlan,
      trial_ends_at: null
    });

    return this.sanitizeUser(updated);
  }

  /**
   * Verify session token and check portal access permissions
   */
  async verifySession(token) {
    if (!token) {
      return { valid: false, allowed: false, reason: 'no_token_provided' };
    }

    const user = await db.getUserByToken(token);
    if (!user) {
      return { valid: false, allowed: false, reason: 'invalid_or_expired_session' };
    }

    await this.refreshUserTrialState(user);
    const allowed = this.isUserAllowed(user);

    let trialRemainingMs = 0;
    if (user.subscription_status === 'trialing' && user.trial_ends_at) {
      trialRemainingMs = Math.max(0, new Date(user.trial_ends_at).getTime() - Date.now());
    }

    return {
      valid: true,
      allowed,
      reason: allowed ? 'authorized' : (user.subscription_status === 'expired' ? 'trial_expired' : 'subscription_required'),
      user: this.sanitizeUser(user),
      trialRemainingMs
    };
  }

  /**
   * Check if user is legally allowed into client portal
   */
  isUserAllowed(user) {
    if (!user) return false;

    // Active paid subscriber
    if (user.subscription_status === 'active') return true;

    // Active 1-day free trial within 24h window
    if (user.subscription_status === 'trialing' && user.trial_ends_at) {
      const remaining = new Date(user.trial_ends_at).getTime() - Date.now();
      return remaining > 0;
    }

    return false;
  }

  /**
   * Check trial timestamp and auto-transition to expired if 24h passed
   */
  async refreshUserTrialState(user) {
    if (user.subscription_status === 'trialing' && user.trial_ends_at) {
      const remaining = new Date(user.trial_ends_at).getTime() - Date.now();
      if (remaining <= 0) {
        user.subscription_status = 'expired';
        await db.updateUser(user.id, { subscription_status: 'expired' });
      }
    }
  }

  /**
   * Sanitize user object to avoid leaking hashes
   */
  sanitizeUser(user) {
    if (!user) return null;
    let trialRemainingMs = 0;
    if (user.subscription_status === 'trialing' && user.trial_ends_at) {
      trialRemainingMs = Math.max(0, new Date(user.trial_ends_at).getTime() - Date.now());
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      company_id: user.company_id,
      subscription_status: user.subscription_status,
      subscription_tier: user.subscription_tier,
      trial_started_at: user.trial_started_at,
      trial_ends_at: user.trial_ends_at,
      trialRemainingMs,
      created_at: user.created_at
    };
  }
}

module.exports = new AuthService();
