# Contributing to Aegis Growth OS

Thank you for your interest in contributing to Aegis Growth OS!

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/aegis-growth/seo-platform.git
   cd seo-platform
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start Development Server:**
   ```bash
   node backend/server.js
   ```
   API Gateway runs on port `4000`, and Client Dashboard is accessible at `http://localhost:4000/dashboard`.

4. **Run Platform Test Suite:**
   ```bash
   node tests/platform.test.js
   ```

## Development Guidelines
- **Zero Cumulative Layout Shift (Zero-CLS):** Personalizations and DOM injections must never cause visual shifts. Use server-side edge workers or micro-opacity cross-fades.
- **Cryptographic Security:** External tokens (Shopify, Google Ads, HubSpot, GSC) must be encrypted via AES-256-GCM before database writes.
- **Database Architecture:** Time-series records must be written to TimescaleDB hypertables with appropriate chunk compression policies.
- **Design Consistency:** All UI components in the dashboard must adhere to the Calendly design tokens (Ink Navy `#0b3558`, Signal Blue `#006bff`, Slate Gray `#476788`, Cloud `#f8f9fb`, Paper `#ffffff`, Pebble `#f0f3f8`, Hairline `#d4e0ed`).
