# OnePath Backend

Lightweight Express server that proxies USCIS Case Status API requests.

**Architecture:** iPhone app → this server → USCIS API

This keeps your OAuth credentials on the server (required by USCIS)
and caches responses to respect rate limits.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create your `.env` file:
   ```
   cp .env.example .env
   ```

3. Edit `.env` and add your real USCIS client ID and secret.

4. Start the server:
   ```
   npm run dev
   ```

5. Test it:
   ```
   curl http://localhost:3000/health
   curl http://localhost:3000/case-status/EAC9999103403
   ```

## Endpoints

- `GET /health` — Server health check
- `GET /case-status/:receiptNumber` — Lookup case status by receipt number

## Deployment

Deploy to Railway, Render, or Fly.io. Set the same environment
variables from `.env` in your hosting provider's dashboard.

**Never commit `.env` to git.**
