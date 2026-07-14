// src/utils/caseGuidance.js
// =========================================================
// OnePath — USCIS Case Status Interpretation Layer
// ---------------------------------------------------------
// PURE and READ-ONLY. Given a snapshot from getCaseSnapshot()
// (see caseStatus.js), it returns a safe interpretation:
//
//     { category, urgency, confidence, templateKey }
//
// This module deliberately NEVER:
//   - fetches anything (no network — retrieval lives in caseStatus.js)
//   - reads or writes storage (no AsyncStorage, no caseStorage)
//   - strips HTML (getCaseSnapshot already cleaned the text)
//   - throws (null / empty / unrecognized input -> 'unknown')
//
// It also contains NO user-facing sentences. `templateKey` points
// at an i18n key that is resolved with t(templateKey) at display
// time, so all five languages (en/es/pt/zh/ht) stay in sync and
// the module itself stays language-free.
//
// It is also multi-case-agnostic: it interprets ONE snapshot. A user
// with several tracked cases just means calling it once per case.
//
// Note on language: USCIS returns the status text in English
// (the API field is `current_case_status_text_en`) regardless of
// the app's UI language. So classifying on English keywords below
// is correct for every user — only the explanation template is
// translated, not the source text we classify.
// =========================================================

/**
 * The twelve interpretation buckets. Frozen so callers reference
 * CATEGORY.APPROVED etc. instead of scattering magic strings.
 */
export const CATEGORY = Object.freeze({
  RECEIVED: "received",
  UNDER_REVIEW: "under_review",
  BIOMETRICS: "biometrics",
  INTERVIEW: "interview",
  ACTION_REQUIRED: "action_required",
  TRANSFERRED: "transferred",
  APPROVED: "approved",
  DOCUMENT_PRODUCTION: "document_production",
  DENIED: "denied",
  REJECTED: "rejected",
  CLOSED: "closed",
  UNKNOWN: "unknown",
});

/**
 * category -> dashboard urgency. Three levels only:
 *   monitor : informational, nothing to do
 *   prepare : something upcoming to get ready for
 *   action  : needs attention, or a decision has landed
 *
 * Notes:
 *  - 'rejected' is 'action': the filing was NOT accepted and the user
 *    often must correct and resubmit (sometimes within a window).
 *  - 'closed' is 'monitor': the case is over/terminal — informational,
 *    not an alarm (e.g. a case the user themselves withdrew).
 *  - 'unknown' is 'monitor' on purpose — we never manufacture a false
 *    alarm out of a status we could not confidently read.
 */
const CATEGORY_URGENCY = Object.freeze({
  [CATEGORY.RECEIVED]: "monitor",
  [CATEGORY.UNDER_REVIEW]: "monitor",
  [CATEGORY.TRANSFERRED]: "monitor",
  [CATEGORY.BIOMETRICS]: "prepare",
  [CATEGORY.INTERVIEW]: "prepare",
  [CATEGORY.APPROVED]: "prepare",
  [CATEGORY.DOCUMENT_PRODUCTION]: "prepare",
  [CATEGORY.ACTION_REQUIRED]: "action",
  [CATEGORY.DENIED]: "action",
  [CATEGORY.REJECTED]: "action",
  [CATEGORY.CLOSED]: "monitor",
  [CATEGORY.UNKNOWN]: "monitor",
});

/**
 * Ordered rule list. ORDER IS LOAD-BEARING: the first matching rule
 * wins, so the most specific and highest-stakes patterns are checked
 * before broad or benign ones.
 *
 * Real USCIS phrasings that collide if order is wrong:
 *   - "Notice Of Intent To Deny Was Sent" contains "deny" but is
 *     action-required, NOT a denial  -> action_required before denied.
 *   - "Fingerprint Fee Was Received" contains "received" but is
 *     biometrics                      -> biometrics before received.
 *   - "Response To USCIS' Request For Evidence Was Received And Case
 *     Processing Has Resumed" contains "request for evidence" but the
 *     RFE is already answered         -> the benign "resumed / response
 *     received" guard runs before action_required.
 *
 * Each `test` receives the lowercased, trimmed status text.
 */
const RULES = [
  // 0. Guard: an RFE that has already been answered / processing resumed.
  //    Must run BEFORE the action_required rule so we don't tell a user
  //    to respond to a request they have already responded to.
  {
    category: CATEGORY.UNDER_REVIEW,
    test: (t) =>
      (t.includes("response") && t.includes("was received")) ||
      t.includes("processing has resumed"),
  },

  // 1. Action required — RFE / NOID / intent to revoke. Highest stakes,
  //    so it is checked first among the "real state" rules.
  {
    category: CATEGORY.ACTION_REQUIRED,
    test: (t) =>
      (t.includes("request for") && t.includes("evidence")) ||
      t.includes("intent to deny") ||
      t.includes("intent to revoke") ||
      t.includes("evidence was requested"),
  },

  // 2. Denied — a decision on the merits against the applicant.
  {
    category: CATEGORY.DENIED,
    test: (t) => t.includes("was denied") || t.includes("has been denied"),
  },

  // 3. Rejected — filing was NOT accepted (wrong fee, unsigned, wrong
  //    edition, missing initial evidence). Not a merits denial; the user
  //    often must correct and resubmit, so this is its own action-urgency
  //    bucket, separate from 'closed'. (Template wording must stay cautious
  //    — refiling is not always available, so it must not promise it.)
  {
    category: CATEGORY.REJECTED,
    test: (t) => t.includes("was rejected") || t.includes("rejected because"),
  },

  // 4. Closed / withdrawn / terminated — case is over, nothing to do.
  //    Monitor urgency: terminal and informational, not an alarm.
  {
    category: CATEGORY.CLOSED,
    test: (t) =>
      t.includes("was closed") ||
      t.includes("administratively closed") ||
      t.includes("was withdrawn") ||
      t.includes("was terminated"),
  },

  // 5. Biometrics — checked BEFORE 'received' because
  //    "Fingerprint Fee Was Received" also contains "received".
  {
    category: CATEGORY.BIOMETRICS,
    test: (t) =>
      t.includes("fingerprint") ||
      t.includes("biometric") ||
      (t.includes("appointment") && t.includes("asc")),
  },

  // 6. Interview.
  {
    category: CATEGORY.INTERVIEW,
    test: (t) => t.includes("interview"),
  },

  // 7. Document / card production and delivery.
  {
    category: CATEGORY.DOCUMENT_PRODUCTION,
    test: (t) =>
      t.includes("card is being produced") ||
      t.includes("card was mailed") ||
      t.includes("card was picked up") ||
      t.includes("card was delivered") ||
      t.includes("document is being produced"),
  },

  // 8. Approved / reaffirmed.
  {
    category: CATEGORY.APPROVED,
    test: (t) =>
      t.includes("was approved") ||
      t.includes("approval was reaffirmed") ||
      t.includes("was reaffirmed"),
  },

  // 9. Transferred to another office.
  {
    category: CATEGORY.TRANSFERRED,
    test: (t) =>
      t.includes("was transferred") ||
      t.includes("transferred to") ||
      t.includes("new office has jurisdiction"),
  },

  // 10. Actively reviewed / under review (the normal pending-review state).
  {
    category: CATEGORY.UNDER_REVIEW,
    test: (t) =>
      t.includes("actively reviewed") ||
      t.includes("being reviewed") ||
      t.includes("under review"),
  },

  // 11. Received — the broadest "we got it" bucket, checked near last so
  //     more specific "...was received" phrasings above win first.
  {
    category: CATEGORY.RECEIVED,
    test: (t) => t.includes("was received") || t.includes("receipt notice"),
  },
];

/**
 * Build the i18n key for a category. Single source of truth for the
 * key namespace, so callers never hand-assemble key strings.
 *
 * @param {string} category - one of CATEGORY.*
 * @returns {string} e.g. "caseGuidance.templates.under_review"
 */
export function templateKeyFor(category) {
  return `caseGuidance.templates.${category}`;
}

/**
 * Classify a case-status snapshot into a safe interpretation.
 *
 * @param {object|null} snapshot - the object returned by getCaseSnapshot().
 * @returns {{ category: string, urgency: string, confidence: string, templateKey: string }}
 *
 * Never throws. null / empty / unrecognized input resolves to
 * { category: 'unknown', urgency: 'monitor', confidence: 'low', ... }.
 */
export function classifyCaseStatus(snapshot) {
  // Primary signal is the short current-status text. Fall back to the
  // longer description only when the short text is empty — occasionally
  // the state is carried there when the headline text is blank.
  const raw =
    (snapshot && (snapshot.statusText || snapshot.statusDescription)) || "";
  const text = String(raw).toLowerCase().trim();

  if (!text) {
    return buildResult(CATEGORY.UNKNOWN, "low");
  }

  for (const rule of RULES) {
    if (rule.test(text)) {
      return buildResult(rule.category, "high");
    }
  }

  // Found a real status string but nothing matched — this is the safe
  // long-tail fallback. Track how often this fires in analytics later;
  // a rising 'unknown' rate is the signal to add or refine a rule.
  return buildResult(CATEGORY.UNKNOWN, "low");
}

/**
 * Assemble the return object from a category + confidence. Urgency is
 * derived from CATEGORY_URGENCY so there is one source of truth for it.
 * @param {string} category
 * @param {'high'|'low'} confidence
 */
function buildResult(category, confidence) {
  return {
    category,
    urgency: CATEGORY_URGENCY[category] || "monitor",
    confidence,
    templateKey: templateKeyFor(category),
  };
}