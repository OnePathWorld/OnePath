// src/utils/caseProfileBlend.js
// =========================================================
// OnePath — Case × Profile Blend (dashboard personalization)
// ---------------------------------------------------------
// PURE and READ-ONLY. Given a case CATEGORY (from
// classifyCaseStatus), the user's NORMALIZED profile (from
// getUserProfile), and the case's FORM NUMBER (from the
// snapshot), it returns an OPTIONAL personalized note:
//
//     { templateKey, values } | null
//
// This is the one piece of profile/form-AWARE logic in the case
// layer. The tracker stays generic-per-category; anything that
// depends on WHICH form this is, or on the user's profile, lives
// here, behind an explicit ownership gate.
//
// Discipline (mirrors caseGuidance.js on purpose):
//   - never fetches, never stores, never throws
//   - contains NO user-facing sentences — returns an i18n key,
//     resolved with t(templateKey, values) at display time
//   - returns null BY DEFAULT: a note appears only when the
//     (category + form) — and, where used, a profile fact — line
//     up into something reliably TRUE and useful. Restraint over
//     noise is the product's north star.
//   - NEVER promises an outcome and NEVER gives legal advice.
//     Copy is always "appears / may / can / typically," routed to
//     the official notice — never "you will get X, file Y."
//
// WHY FORM-AWARE: "approved" means very different things on an
// I-140 (a petition — NOT a green card) vs. an I-485 (adjustment —
// IS the green card) vs. an N-400 (oath next). Keying only on the
// category would force vague, hedged copy; keying on the form lets
// each note be specific and correct. A user commonly has several
// of their OWN cases at once (I-485 + I-765 + I-131), so precision
// by form is what keeps the note about the RIGHT case.
//
// GATING CONTRACT (enforced by the caller, restated here):
//   Call this ONLY for a case the user confirmed is their own
//   (trackedCase.isSelf === true). For someone else's case, or a
//   case whose ownership is unknown (legacy entries), do NOT call
//   this — show the case-only guidance instead.
// =========================================================

import { CATEGORY } from "./caseGuidance";

const BLEND_NS = "caseGuidance.blend";

// Normalize a form number so "I-485", "I485", and " i-485 " all
// compare equal. Returns "" for missing/garbage input.
function normForm(f) {
  return String(f == null ? "" : f).toUpperCase().replace(/[^A-Z0-9]/g, "");
}
function formIn(form, list) {
  const n = normForm(form);
  return n !== "" && list.some((x) => normForm(x) === n);
}

/**
 * Read a nested profile field without throwing on a missing
 * profile or section. Returns undefined when absent.
 */
function field(profile, section, key) {
  return profile && profile[section] ? profile[section][key] : undefined;
}

/**
 * Ordered rule list. ORDER IS LOAD-BEARING (first match wins), so
 * a more specific rule (e.g. the country-backlog I-140 variant) is
 * listed before its general form. Within a category the form sets
 * are otherwise mutually exclusive — a case carries one form.
 *
 * Each rule:
 *   key      -> i18n suffix under caseGuidance.blend.*
 *   category -> the classified CATEGORY.* it applies to
 *   forms    -> (optional) form numbers it applies to; omit = any
 *   when     -> (optional) extra predicate over a flat profile view
 *
 * Keep every rule RELIABLE: the note must be true for anyone whose
 * own case matches, without asserting anything the signals don't
 * actually imply.
 */
const RULES = [
  // ---- APPROVED ----------------------------------------------------
  // I-140: an employment green-card PETITION. Approval secures a place
  // in line; it is NOT the green card. Backlog variant flags the wait.
  { key: "approved_i140_backlog", category: CATEGORY.APPROVED, forms: ["I-140"],
    when: (p) => p.countryBacklog === true },
  { key: "approved_i140", category: CATEGORY.APPROVED, forms: ["I-140"] },

  // I-130: a family PETITION — a step, not the green card.
  { key: "approved_i130", category: CATEGORY.APPROVED, forms: ["I-130"] },

  // I-485: adjustment of status — approval can mean the green card.
  { key: "approved_adjustment", category: CATEGORY.APPROVED, forms: ["I-485"] },

  // N-400: naturalization — oath ceremony is the usual next step.
  { key: "approved_naturalization", category: CATEGORY.APPROVED, forms: ["N-400"] },

  // I-751: remove conditions — typically leads to a 10-year card.
  { key: "approved_remove_conditions", category: CATEGORY.APPROVED, forms: ["I-751"] },

  // I-765: work permit (EAD) — check validity dates.
  { key: "approved_ead", category: CATEGORY.APPROVED, forms: ["I-765"] },

  // I-131: Advance Parole (travel document) — confirm dates before travel.
  { key: "approved_advance_parole", category: CATEGORY.APPROVED, forms: ["I-131"] },

  // I-129: employer petition — inside-US vs. visa-abroad differ.
  { key: "approved_employer_petition", category: CATEGORY.APPROVED, forms: ["I-129"] },

  // I-539: extend / change status — check new status and dates.
  { key: "approved_extend_change", category: CATEGORY.APPROVED, forms: ["I-539"] },

  // ---- DOCUMENT PRODUCTION ----------------------------------------
  // Green-card card (adjustment / renewal / conditions removed).
  { key: "docprod_greencard", category: CATEGORY.DOCUMENT_PRODUCTION,
    forms: ["I-485", "I-90", "I-751"] },
  // EAD card.
  { key: "docprod_ead", category: CATEGORY.DOCUMENT_PRODUCTION, forms: ["I-765"] },

  // ---- DENIED ------------------------------------------------------
  // I-485 denial can cascade to a tied EAD / Advance Parole.
  { key: "denied_adjustment", category: CATEGORY.DENIED, forms: ["I-485"] },
  // I-765 denial can affect the ability to work.
  { key: "denied_ead", category: CATEGORY.DENIED, forms: ["I-765"] },
  // I-129 denial can affect status that depends on it.
  { key: "denied_employer_petition", category: CATEGORY.DENIED, forms: ["I-129"] },
  // N-400 denial does NOT remove an existing green card.
  { key: "denied_naturalization", category: CATEGORY.DENIED, forms: ["N-400"] },
];

/**
 * Blend a classified case with the user's profile + form into an
 * optional personalized note.
 *
 * @param {string} category    - one of CATEGORY.* (from classifyCaseStatus)
 * @param {object|null} profile - normalized profile from getUserProfile()
 * @param {string} [formNumber] - snapshot.formNumber (e.g. "I-485")
 * @returns {{ templateKey: string, values: object } | null}
 *
 * Never throws. Returns null when no rule matches (including when the
 * form number is missing for a form-gated rule) — the case-only
 * guidance already stands on its own, so silence is the safe default.
 */
export function blendCaseWithProfile(category, profile, formNumber) {
  if (!category) return null;

  // Flatten just the handful of profile facts the rules read. Missing
  // fields stay undefined, so strict === checks below fail closed.
  const p = {
    countryBacklog: field(profile, "riskFactors", "countryBacklog"),
  };

  for (const rule of RULES) {
    if (rule.category !== category) continue;
    if (rule.forms && !formIn(formNumber, rule.forms)) continue;
    if (rule.when && !rule.when(p)) continue;
    return { templateKey: `${BLEND_NS}.${rule.key}`, values: {} };
  }
  return null;
}