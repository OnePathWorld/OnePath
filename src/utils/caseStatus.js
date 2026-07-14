// src/utils/caseStatus.js
// =========================================================
// USCIS Case Status API Client
// ---------------------------------------------------------
// 
// Backend contract:
//   GET https://onepath-production.up.railway.app/case-status/:receiptNumber
//   GET https://onepath-production.up.railway.app/case-status/:receiptNumber?refresh=true
//
// The optional ?refresh=true query param tells the backend to
// BYPASS its 30-minute response cache and make a fresh call to
// USCIS. Used when the user explicitly taps the refresh button —
// they are asking "has anything changed?", which can only be
// answered by going to USCIS directly. Normal lookups (initial
// add, screen mounts) omit the param and use the cache, which
// protects the USCIS API from duplicate incidental traffic.
//
// Success (200) → raw USCIS response body, e.g.:
//   {
//     "case_status": {
//       "receipt_number": "EAC9999103403",
//       "form_number": "I-130",
//       "submitted_date": "...",
//       "modified_date": "...",
//       "current_case_status_text_en": "Case Was Received",
//       "current_case_status_desc_en": "On ..., we received your...",
//       "hist_case_status": [...]
//     }
//   }
//
// Error (4xx/5xx) → RFC-9457 Problem Details:
//   {
//     "errors": [
//       {
//         "code": "INVALID_RECEIPT_FORMAT" | "RECEIPT_NOT_FOUND" | ...,
//         "message": "Human readable description",
//         "category": "VALIDATION" | "UPSTREAM" | "INTERNAL",
//         "reference": "https://...",
//         "status": "400" | "404" | "500",
//         "traceId": "..."
//       }
//     ]
//   }
// =========================================================

const API_BASE_URL = "https://onepath-production.up.railway.app";


const REQUEST_TIMEOUT_MS = 15000;

/**
 * Validate USCIS receipt number format on the client BEFORE
 * hitting the network. Pattern: 3 letters + 10 digits.
 * Examples: EAC9999103403, MSC2190000000, WAC1234567890
 *
 * The backend re-validates server-side as a safety net, but
 * client-side validation gives instant feedback and avoids
 * wasting a sandbox API call during the 5-day traffic window.
 */
export const RECEIPT_PATTERN = /^[A-Z]{3}\d{10}$/;

export function isValidReceiptNumber(input) {
  if (!input) return false;
  return RECEIPT_PATTERN.test(input.trim().toUpperCase());
}

/**
 * Normalize receipt input — trim whitespace, uppercase,
 * strip any spaces/dashes the user might paste in.
 */
export function normalizeReceiptNumber(input) {
  if (!input) return "";
  return input.replace(/[\s-]/g, "").trim().toUpperCase();
}

/**
 * Fetch case status from the backend.
 *
 * @param {string} receiptNumber - USCIS receipt number
 * @param {object} [options]
 * @param {boolean} [options.forceRefresh=false] - When true, appends
 *        ?refresh=true so the Railway backend bypasses its cache and
 *        makes a fresh call to USCIS. Use for user-initiated refresh.
 *
 * Returns:
 *   { ok: true,  data: <USCIS response>, cached: boolean }
 *   { ok: false, error: { code, message, category, status, traceId } }
 *
 * NEVER throws — all error paths resolve to { ok: false }.
 * The caller can render error.message directly (criterion #6).
 */
export async function fetchCaseStatus(receiptNumber, { forceRefresh = false } = {}) {
  const normalized = normalizeReceiptNumber(receiptNumber);

  // Pre-flight validation — saves a network round-trip on
  // obviously bad input.
  if (!isValidReceiptNumber(normalized)) {
    return {
      ok: false,
      error: {
        code: "INVALID_RECEIPT_FORMAT",
        message:
          "Receipt number must be 3 letters followed by 10 digits (e.g., EAC9999103403).",
        category: "VALIDATION",
        status: "400",
        traceId: `client-${Date.now()}`,
      },
    };
  }

  // Build the request URL. When forceRefresh is set, add ?refresh=true
  // so the backend skips its cache and calls USCIS fresh.
  const url = forceRefresh
    ? `${API_BASE_URL}/case-status/${normalized}?refresh=true`
    : `${API_BASE_URL}/case-status/${normalized}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Try to parse JSON regardless of status — both success and
    // error responses from our backend are JSON.
    let body;
    try {
      body = await response.json();
    } catch (parseError) {
      return {
        ok: false,
        error: {
          code: "INVALID_RESPONSE",
          message: "The server returned an unreadable response. Please try again.",
          category: "INTERNAL",
          status: String(response.status),
          traceId: `client-${Date.now()}`,
        },
      };
    }

    if (!response.ok) {
      // Handle 404 explicitly — case not found is a known, expected
      // state and should show a clear message rather than "unknown error".
      if (response.status === 404) {
        return {
          ok: false,
          error: {
            code: "RECEIPT_NOT_FOUND",
            message:
              "No case found for this receipt number. Please check the number on your I-797 notice and try again.",
            category: "NOT_FOUND",
            status: "404",
            traceId: body?.errors?.[0]?.traceId || `client-${Date.now()}`,
          },
        };
      }

      // Handle 400 explicitly — bad format caught server-side.
      if (response.status === 400) {
        const firstError = body?.errors?.[0];
        return {
          ok: false,
          error: firstError || {
            code: "INVALID_RECEIPT_FORMAT",
            message:
              "Invalid receipt number format. Please check the number and try again.",
            category: "VALIDATION",
            status: "400",
            traceId: `client-${Date.now()}`,
          },
        };
      }

      // Handle 429 — sandbox rate limit during the 5-day window.
      if (response.status === 429) {
        return {
          ok: false,
          error: {
            code: "RATE_LIMITED",
            message:
              "Too many requests. Please wait a moment before trying again.",
            category: "RATE_LIMIT",
            status: "429",
            traceId: body?.errors?.[0]?.traceId || `client-${Date.now()}`,
          },
        };
      }

      // Handle 500+ — USCIS upstream or Railway backend error.
      if (response.status >= 500) {
        return {
          ok: false,
          error: {
            code: "SERVER_ERROR",
            message:
              "USCIS is temporarily unavailable. Please try again in a few minutes.",
            category: "UPSTREAM",
            status: String(response.status),
            traceId: body?.errors?.[0]?.traceId || `client-${Date.now()}`,
          },
        };
      }

      // Fallback for any other non-200 — use RFC-9457 body if present.
      const firstError = body?.errors?.[0];
      return {
        ok: false,
        error: firstError || {
          code: "UNKNOWN_ERROR",
          message: `Request failed with status ${response.status}. Please try again.`,
          category: "INTERNAL",
          status: String(response.status),
          traceId: `client-${Date.now()}`,
        },
      };
    }

    return {
      ok: true,
      data: body,
      cached: Boolean(body?.cached),
    };
  } catch (err) {
    clearTimeout(timeoutId);

    // Distinguish network errors from timeouts so the user gets
    // the right message.
    if (err.name === "AbortError") {
      return {
        ok: false,
        error: {
          code: "REQUEST_TIMEOUT",
          message:
            "The request took too long. USCIS may be slow right now — please try again.",
          category: "NETWORK",
          status: "408",
          traceId: `client-${Date.now()}`,
        },
      };
    }

    return {
      ok: false,
      error: {
        code: "NETWORK_ERROR",
        message:
          "Couldn't reach the server. Check your internet connection and try again.",
        category: "NETWORK",
        status: "0",
        traceId: `client-${Date.now()}`,
      },
    };
  }
}

/**
 * Strip HTML tags from USCIS description strings.
 * USCIS embeds raw HTML in status descriptions (e.g. <a href="...">,
 * <strong>, <br>) which render as literal text in React Native.
 * This replaces <br> and <p> with newlines for readable spacing,
 * replaces <a href="...">text</a> with just the link text,
 * then strips any remaining tags.
 */
function stripHtml(html) {
  if (!html) return "";
  return html
    // Convert block-level line breaks to newlines before stripping
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    // Replace <a href="...">label</a> with just the label text
    .replace(/<a\s+[^>]*>([^<]*)<\/a>/gi, "$1")
    // Strip all remaining HTML tags
    .replace(/<[^>]+>/g, "")
    // Decode common HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Collapse more than 2 consecutive newlines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Extract a clean, display-ready snapshot from a USCIS
 * case status response. Used by HomeScreen's compact view
 * and the tracker screen's status card.
 *
 * Returns null if the response shape is unexpected.
 */
export function getCaseSnapshot(data) {
  const cs = data?.case_status;
  if (!cs) return null;

  return {
    receiptNumber: cs.receipt_number || "",
    formNumber: cs.form_number || "",
    statusText: stripHtml(cs.current_case_status_text_en || ""),
    statusDescription: stripHtml(cs.current_case_status_desc_en || ""),
    submittedDate: cs.submitted_date || null,
    modifiedDate: cs.modified_date || null,
    history: Array.isArray(cs.hist_case_status)
      ? cs.hist_case_status.map((h) => ({
          ...h,
          completed_case_status_text_en: stripHtml(
            h.completed_case_status_text_en || ""
          ),
        }))
      : [],
  };
}

/**
 * Format an ISO date string from USCIS as a human-readable
 * date. Handles malformed input gracefully.
 */
export function formatCaseDate(isoString) {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoString;
  }
}