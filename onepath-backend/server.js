require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

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

  console.log(
    `[Token] New token obtained, expires in ${expiresIn}s`
  );

  return cachedToken;
}

// =========================================================
// Case Status Response Cache
// =========================================================
// Case statuses don't change every minute. Cache responses
// for 30 minutes to be respectful of USCIS rate limits.

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
// Routes
// =========================================================

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Case status lookup
app.get("/case-status/:receiptNumber", async (req, res) => {
  const { receiptNumber } = req.params;

  // Basic validation — USCIS receipt numbers are 3 letters + 10 digits
  const receiptPattern = /^[A-Z]{3}\d{10}$/;
  if (!receiptPattern.test(receiptNumber)) {
    return res.status(400).json({
      error: "Invalid receipt number format",
      expected: "3 letters followed by 10 digits (e.g., EAC9999103403)",
    });
  }

  // Check cache first
  const cached = getCachedStatus(receiptNumber);
  if (cached) {
    console.log(`[Cache Hit] ${receiptNumber}`);
    return res.json({ ...cached, cached: true });
  }

  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${process.env.USCIS_API_BASE_URL}/${receiptNumber}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[USCIS Error] ${receiptNumber}: ${response.status}`,
        errorText
      );
      return res.status(response.status).json({
        error: "USCIS API error",
        status: response.status,
        detail: errorText,
      });
    }

    const data = await response.json();

    // Cache the successful response
    setCachedStatus(receiptNumber, data);
    console.log(`[USCIS] ${receiptNumber}: ${data.case_status?.current_case_status_text_en || "OK"}`);

    res.json(data);
  } catch (error) {
    console.error(`[Server Error] ${receiptNumber}:`, error.message);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

// =========================================================
// Start Server
// =========================================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  OnePath Backend running on port ${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log(`  Case:   http://localhost:${PORT}/case-status/EAC9999103403`);
  console.log(`  USCIS:  ${process.env.USCIS_API_BASE_URL}\n`);
});
