/**
 * Aegis Growth OS — Secure Credential Vault Service
 * Implements authenticated AES-256-GCM encryption/decryption for OAuth tokens and API keys.
 */

const crypto = require('crypto');

class CryptoVault {
  constructor() {
    // 32-byte master key derived from environment or secure fallback for dev
    const envKey = process.env.AEGIS_MASTER_VAULT_KEY;
    if (envKey) {
      if (envKey.length === 44 && envKey.endsWith('=')) {
        this.masterKey = Buffer.from(envKey, 'base64');
      } else {
        this.masterKey = crypto.createHash('sha256').update(envKey).digest();
      }
    } else {
      // Default deterministic dev key (Warns in logs)
      console.warn('⚠️ [CryptoVault] AEGIS_MASTER_VAULT_KEY not set. Using secure development fallback key.');
      this.masterKey = crypto.createHash('sha256').update('aegis_default_development_secret_key_2026').digest();
    }
  }

  /**
   * Encrypts plaintext or object payload using AES-256-GCM
   * @param {string|object} data 
   * @returns {string} Hex-encoded string (IV + AuthTag + Ciphertext)
   */
  encrypt(data) {
    try {
      const plaintext = typeof data === 'object' ? JSON.stringify(data) : String(data);
      const iv = crypto.randomBytes(12); // 12-byte standard GCM nonce
      const cipher = crypto.createCipheriv('aes-256-gcm', this.masterKey, iv);

      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag(); // 16-byte authentication tag

      // Pack IV (24 hex chars) + AuthTag (32 hex chars) + Ciphertext
      return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    } catch (err) {
      throw new Error(`[CryptoVault] Encryption failed: ${err.message}`);
    }
  }

  /**
   * Decrypts AES-256-GCM hex payload with authentication tag validation
   * @param {string} packedPayload 
   * @returns {string|object} Decrypted data
   */
  decrypt(packedPayload) {
    try {
      const parts = packedPayload.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted payload structure. Expected IV:AuthTag:Ciphertext');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const ciphertext = parts[2];

      const decipher = crypto.createDecipheriv('aes-256-gcm', this.masterKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (err) {
      throw new Error(`[CryptoVault] Decryption failed or tampered data: ${err.message}`);
    }
  }
}

module.exports = new CryptoVault();
