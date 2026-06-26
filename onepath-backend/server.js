require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// =========================================================
// DEMO BUILD — gate REMOVED
// ---------------------------------------------------------
// This is the demo-day version of server.js. The beta gate
// (SANDBOX_PATTERN / DEMO_ALLOWLIST / 403 "coming soon") has
// been removed, so EVERY validly-formatted receipt number is
// proxied straight to USCIS — sandbox numbers return data,
// any other number returns whatever USCIS has (data or a real
// 404). No number can ever return "coming soon".
//
// KEPT from the gated build (both help the demo, neither gates
// anything): the 429 spike-arrest retry, and receipt-number log
// masking.
//
// After the demo, swap back to the gated server.js to protect
// the publicly-reachable tracker again.
// =========================================================

// =========================================================
// OAuth Token Cache
// =========================================================
// USCIS tokens expire after a set time. We cache the token
// and only refresh when it's expired or about to expire.

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  // If we have a valid token with at least 60 seconds left, reuse it
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  const response = await fetch(process.env.USCIS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.USCIS_CLIENT_ID,
      client_secret: process.env.USCIS_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Token Error]", response.status, errorText);
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;

  // USCIS typically returns expires_in (seconds). Default to 30 min if missing.
  const expiresIn = data.expires_in || 1800;
  tokenExpiresAt = Date.now() + expiresIn * 1000;

  console.log(`[Token] New token obtained, expires in ${expiresIn}s`);

  return cachedToken;
}

// =========================================================
// Case Status Response Cache
// =========================================================
// Case statuses don't change every minute. Cache responses
// for 30 minutes to be respectful of USCIS rate limits.
//
// The cache is bypassed when the client sends ?refresh=true
// (user explicitly tapped refresh / pulled to refresh). In
// that case we always call USCIS so the user gets the latest
// status, then write the fresh response back into the cache.

const statusCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCachedStatus(receiptNumber) {
  const entry = statusCache.get(receiptNumber);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  statusCache.delete(receiptNumber);
  return null;
}

function setCachedStatus(receiptNumber, data) {
  statusCache.set(receiptNumber, {
    data,
    timestamp: Date.now(),
  });
}

// =========================================================
// Error helpers — RFC-9457 Problem Details shape
// =========================================================
// USCIS returns errors as: { errors: [{ code, message, category, reference, status, traceId }] }
// We mirror that shape for our own validation errors so the React Native
// client has ONE error renderer for both.

function buildLocalError({ code, message, category, status }) {
  return {
    errors: [
      {
        code,
        message,
        category: category || "VALIDATION",
        reference: "https://developer.uscis.gov/api/case-status",
        status: String(status),
        traceId: `local-${Date.now()}`,
      },
    ],
  };
}

// =========================================================
// Receipt helpers — masking + 429-safe fetch  (gate removed)
// =========================================================

// Mask receipt numbers in logs — they're real people's case IDs.
// EAC9999103403 -> EAC*******403 (prefix + last 3 stay, enough to
// tell sandbox numbers apart in the demo).
function maskReceipt(r) {
  if (!r || r.length < 6) return "***";
  return r.slice(0, 3) + "*".repeat(r.length - 6) + r.slice(-3);
}

// Retry sandbox spike-arrest 429s server-side so they never reach
// the app's error banner during the demo. The USCIS sandbox enforces
// an Apigee spike-arrest policy (~5 req/s, burst 1); a fast
// pull-to-refresh loop can trip it. Spacing one retry ~300-600ms
// later turns a 429 into a 200 the user never sees fail.
async function fetchUSCISWithRetry(receiptNumber, token, attempt = 0) {
  const response = await fetch(
    `${process.env.USCIS_API_BASE_URL}/${receiptNumber}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, demo_id: "3811" },
    }
  );
  if (response.status === 429 && attempt < 2) {
    await new Promise((r) => setTimeout(r, 300 * (attempt + 1))); // 300ms, 600ms
    return fetchUSCISWithRetry(receiptNumber, token, attempt + 1);
  }
  return response;
}

// =========================================================
// Routes
// =========================================================

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Case status lookup
app.get("/case-status/:receiptNumber", async (req, res) => {
  const { receiptNumber } = req.params;

  // ?refresh=true → user explicitly asked for fresh data, so
  // bypass the cache and call USCIS directly.
  const forceRefresh = req.query.refresh === "true";

  // Basic validation — USCIS receipt numbers are 3 letters + 10 digits
  const receiptPattern = /^[A-Z]{3}\d{10}$/;
  if (!receiptPattern.test(receiptNumber)) {
    return res.status(400).json(
      buildLocalError({
        code: "INVALID_RECEIPT_FORMAT",
        message:
          "Receipt number must be 3 letters followed by 10 digits (e.g., EAC9999103403).",
        category: "VALIDATION",
        status: 400,
      })
    );
  }

  // ---- NO GATE IN THIS BUILD ----
  // Every validly-formatted number proceeds to USCIS below.

  // Check cache first — UNLESS this is a forced refresh.
  if (!forceRefresh) {
    const cached = getCachedStatus(receiptNumber);
    if (cached) {
      console.log(`[Cache Hit] ${maskReceipt(receiptNumber)}`);
      return res.json({ ...cached, cached: true });
    }
  }

  try {
    const token = await getAccessToken();

    if (forceRefresh) {
      console.log(`[Force Refresh] ${maskReceipt(receiptNumber)} — bypassing cache`);
    }

    const response = await fetchUSCISWithRetry(receiptNumber, token);

    // Pass USCIS responses through as-is — preserves RFC-9457 error shape
    // for the demo (criterion #6: error.message must be displayable).
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (!response.ok) {
      let body;
      if (isJson) {
        body = await response.json();
      } else {
        const text = await response.text();
        body = buildLocalError({
          code: "USCIS_NON_JSON_ERROR",
          message: text || `USCIS returned ${response.status}`,
          category: "UPSTREAM",
          status: response.status,
        });
      }
      console.error(
        `[USCIS Error] ${maskReceipt(receiptNumber)}: ${response.status}`,
        JSON.stringify(body)
      );
      return res.status(response.status).json(body);
    }

    const data = await response.json();

    // Cache the successful response (also refreshes the TTL on a
    // forced refresh, so the next normal lookup gets the new value).
    setCachedStatus(receiptNumber, data);
    console.log(
      `[USCIS] ${maskReceipt(receiptNumber)}: ${
        data.case_status?.current_case_status_text_en || "OK"
      }`
    );

    res.json(data);
  } catch (error) {
    console.error(`[Server Error] ${maskReceipt(receiptNumber)}:`, error.message);
    res.status(500).json(
      buildLocalError({
        code: "INTERNAL_ERROR",
        message: error.message || "Internal server error",
        category: "INTERNAL",
        status: 500,
      })
    );
  }
});

// =========================================================
// Start Server
// =========================================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  OnePath Backend running on port ${PORT}  [DEMO BUILD — gate removed]`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log(`  Case:   http://localhost:${PORT}/case-status/EAC9999103403`);
  console.log(`  USCIS:  ${process.env.USCIS_API_BASE_URL}\n`);
});
