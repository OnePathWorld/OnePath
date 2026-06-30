require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

// Railway runs your app behind a proxy. Without this, every request
// appears to come from the proxy's IP, which breaks per-IP rate
// limiting (and makes express-rate-limit throw a validation error).
// "1" trusts the single Railway proxy hop in front of us.
app.set("trust proxy", 1);

app.use(express.json());

// =========================================================
// CORS — locked down
// =========================================================
// The React Native app uses native fetch, which does NOT send an
// Origin header and is unaffected by CORS — so restricting origins
// costs the app nothing while stopping arbitrary websites from
// calling this endpoint from a browser.
//
// Requests with no Origin (mobile apps, curl, server-to-server) are
// allowed. Browser origins are allowed only if listed in the
// ALLOWED_ORIGINS env var (comma-separated). Leave it unset for a
// mobile-only deployment.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // No origin = native app / curl / server-to-server → allow.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  })
);

// =========================================================
// Optional shared-secret check
// =========================================================
// A secret baked into a mobile binary can be extracted, so this is a
// deterrent, not real authentication — it raises the bar above "anyone
// with the URL". Enabled ONLY if APP_SHARED_SECRET is set in the env;
// if you enable it, the app must send the same value in an
// "x-app-key" header (add it to the fetch in caseStatus.js).
function requireAppKey(req, res, next) {
  const expected = process.env.APP_SHARED_SECRET;
  if (!expected) return next(); // disabled when unset
  if (req.get("x-app-key") === expected) return next();
  return res.status(401).json(
    buildLocalError({
      code: "UNAUTHORIZED",
      message: "Missing or invalid application key.",
      category: "AUTH",
      status: 401,
    })
  );
}

// =========================================================
// Rate limiting
// =========================================================
// Protects your production USCIS quota from abuse and from
// pull-to-refresh loops (?refresh=true bypasses the cache, so each
// refresh is a real upstream call). Returns the RFC-9457 error shape
// so the client's single error renderer handles it like any other 429.
const caseStatusLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // per IP per window — generous for real use, tight enough to deter abuse
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json(
      buildLocalError({
        code: "RATE_LIMITED",
        message: "Too many requests. Please wait a moment before trying again.",
        category: "RATE_LIMIT",
        status: 429,
      })
    ),
});

// =========================================================
// OAuth Token Cache
// =========================================================
// USCIS tokens expire after a set time. We cache the token and only
// refresh when it's expired or about to expire.

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  // If we have a valid token with at least 60 seconds left, reuse it.
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
// Case statuses don't change every minute. Cache responses for 30
// minutes to be respectful of USCIS rate limits.
//
// The cache is bypassed when the client sends ?refresh=true (user
// explicitly tapped refresh / pulled to refresh). In that case we
// always call USCIS so the user gets the latest status, then write the
// fresh response back into the cache.

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
// Receipt helpers — masking + 429-safe fetch
// =========================================================

// Mask receipt numbers in logs — they're real people's case IDs, so
// they must never appear in plaintext in production logs.
// EAC9999103403 -> EAC*******403 (prefix + last 3 stay for support).
function maskReceipt(r) {
  if (!r || r.length < 6) return "***";
  return r.slice(0, 3) + "*".repeat(r.length - 6) + r.slice(-3);
}

// Retry upstream 429s server-side so a brief burst doesn't surface as
// an error in the app. USCIS enforces an Apigee spike-arrest policy;
// spacing one or two retries a few hundred ms apart turns a transient
// 429 into a 200 the user never sees fail. (Note: production rate
// limits differ from sandbox — adjust if you observe sustained 429s.)
async function fetchUSCISWithRetry(receiptNumber, token, attempt = 0) {
  const response = await fetch(
    `${process.env.USCIS_API_BASE_URL}/${receiptNumber}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (response.status === 429 && attempt < 2) {
    await new Promise((r) => setTimeout(r, 300 * (attempt + 1))); // 300ms, 600ms
    return fetchUSCISWithRetry(receiptNumber, token, attempt + 1);
  }
  return response;
}

// Identify which USCIS environment the configured base URL points at.
function resolveUscisEnvironment() {
  const base = process.env.USCIS_API_BASE_URL || "";
  let host = "";
  try {
    host = new URL(base).host;
  } catch {
    host = "unparseable";
  }
  let environment = "unknown";
  if (host.includes("api-int.uscis.gov")) environment = "sandbox";
  else if (host.includes("api.uscis.gov")) environment = "production";
  return { environment, host };
}

// =========================================================
// Routes
// =========================================================

// Health check — also reports which USCIS host this deployment
// resolved, so you can confirm a sandbox/production cutover at a glance.
app.get("/health", (req, res) => {
  const { environment, host } = resolveUscisEnvironment();
  res.json({
    status: "ok",
    uscisEnvironment: environment,
    uscisHost: host,
    timestamp: new Date().toISOString(),
  });
});

// Case status lookup
app.get(
  "/case-status/:receiptNumber",
  requireAppKey,
  caseStatusLimiter,
  async (req, res) => {
    const { receiptNumber } = req.params;

    // ?refresh=true → user explicitly asked for fresh data, so bypass
    // the cache and call USCIS directly.
    const forceRefresh = req.query.refresh === "true";

    // Basic validation — USCIS receipt numbers are 3 letters + 10 digits.
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
        console.log(
          `[Force Refresh] ${maskReceipt(receiptNumber)} — bypassing cache`
        );
      }

      const response = await fetchUSCISWithRetry(receiptNumber, token);

      // Pass USCIS responses through as-is — preserves the RFC-9457 error
      // shape so the client's single error renderer can display
      // error.message directly.
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

      // Cache the successful response (also refreshes the TTL on a forced
      // refresh, so the next normal lookup gets the new value).
      setCachedStatus(receiptNumber, data);
      console.log(
        `[USCIS] ${maskReceipt(receiptNumber)}: ${
          data.case_status?.current_case_status_text_en || "OK"
        }`
      );

      res.json(data);
    } catch (error) {
      console.error(
        `[Server Error] ${maskReceipt(receiptNumber)}:`,
        error.message
      );
      res.status(500).json(
        buildLocalError({
          code: "INTERNAL_ERROR",
          message: error.message || "Internal server error",
          category: "INTERNAL",
          status: 500,
        })
      );
    }
  }
);

// =========================================================
// Start Server
// =========================================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  const { environment, host } = resolveUscisEnvironment();
  console.log(`\n  OnePath Backend running on port ${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log(`  USCIS env: ${environment} (${host})`);
});
