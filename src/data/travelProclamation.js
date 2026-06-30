// src/data/travelProclamation.js
// Created: June 2026
//
// Travel-proclamation status layer.
// Sources: Presidential Proclamation 10949 (June 4, 2025) and the
// December 16, 2025 proclamation "Restricting and Limiting the Entry of
// Foreign Nationals..." (effective January 1, 2026), plus the related
// immigrant-visa pause (eff. Jan 21, 2026) and USCIS adjudication hold
// (Dec 2, 2025). REVERIFY against travel.state.gov before each release —
// the proclamation directs a status review every 180 days.
//
// Pattern: data-only file, matching pathwayViability.js / immigrationWarnings.js.
// All user-facing strings are translation keys under the `travelProclamation.*`
// namespace. Add the matching keys to ALL FIVE locale files
// (en, es, pt, zh, ht) — see the companion key list. Render sites should call
// the getter helpers, NOT read keys directly.
//
// IMPORTANT: country membership is derived from the arrays below, keyed by the
// same `value` strings used in OnboardingScreen.js COUNTRY_SEARCH_LIST.
// Countries not present in COUNTRY_SEARCH_LIST are noted in comments and simply
// omitted (e.g. equatorial_guinea, nigeria, tonga are on the proclamation but
// not in the app's country list as of this writing).

import i18n from "../i18n";

export const TRAVEL_PROCLAMATION_META = {
  lastUpdated: "June 2026",
  effectiveDate: "January 1, 2026",
  sourceUrl:
    "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/presidential-proclamation-on-visas.html",
  // Translation key — render sites call getProclamationMeta() for the
  // translated disclaimer.
  disclaimerKey: "travelProclamation.disclaimer",
};

// ---------------------------------------------------------------------------
// Status tiers (colors literal; label/description are i18n keys)
// ---------------------------------------------------------------------------
export const PROCLAMATION_LEVELS = {
  FULL_BAN: {
    key: "FULL_BAN",
    color: "#C62828",
    bgColor: "#FFEBEE",
    labelKey: "travelProclamation.levels.FULL_BAN.label",
    descriptionKey: "travelProclamation.levels.FULL_BAN.description",
  },
  PARTIAL_BAN: {
    key: "PARTIAL_BAN",
    color: "#F57F17",
    bgColor: "#FFF8E1",
    labelKey: "travelProclamation.levels.PARTIAL_BAN.label",
    descriptionKey: "travelProclamation.levels.PARTIAL_BAN.description",
  },
  NONE: {
    key: "NONE",
    color: "#2E7D32",
    bgColor: "#E8F5E9",
    labelKey: "travelProclamation.levels.NONE.label",
    descriptionKey: "travelProclamation.levels.NONE.description",
  },
};

// ---------------------------------------------------------------------------
// Country membership arrays (app country `value` keys)
// ---------------------------------------------------------------------------

// Full suspension of entry — immigrant AND nonimmigrant visas.
// Proclamation full-ban set (19). Not in app list: equatorial_guinea.
export const FULL_BAN = [
  "afghanistan", "burkina_faso", "myanmar", "chad", "congo", // congo = Republic of the Congo (Brazzaville)
  "eritrea", "haiti", "iran", "laos", "libya", "mali", "niger",
  "sierra_leone", "somalia", "south_sudan", "sudan", "syria", "yemen",
];

// Partial suspension — immigrant visas + B/F/M/J nonimmigrant visas.
// Proclamation partial set (20). Not in app list: nigeria, tonga.
// Caribbean-feature members: antigua_barbuda, cuba, dominica.
export const PARTIAL_BAN = [
  "angola", "antigua_barbuda", "benin", "burundi", "ivory_coast", // ivory_coast = Côte d'Ivoire
  "cuba", "dominica", "gabon", "gambia", "malawi", "mauritania",
  "senegal", "tanzania", "togo", "turkmenistan", "venezuela",
  "zambia", "zimbabwe",
];

// Separate immigrant-visa issuance pause (effective Jan 21, 2026) — 23 countries.
// Not in app list: nigeria.
export const IMMIGRANT_VISA_PAUSE = [
  "afghanistan", "antigua_barbuda", "myanmar", "ivory_coast", "cuba",
  "dominica", "eritrea", "haiti", "iran", "gambia", "laos", "libya",
  "congo", "senegal", "sierra_leone", "somalia", "south_sudan", "sudan",
  "syria", "tanzania", "togo", "yemen",
];

// USCIS adjudication hold on benefit applications (Dec 2, 2025) — June-4 list.
// Not in app list: equatorial_guinea.
export const ADJUDICATION_HOLD = [
  "afghanistan", "myanmar", "burundi", "chad", "congo", "cuba", "eritrea",
  "haiti", "iran", "laos", "libya", "sierra_leone", "somalia", "sudan",
  "togo", "turkmenistan", "venezuela", "yemen",
];

// ---------------------------------------------------------------------------
// Pathway → visa class (used by the gate). Extend as pathways are added.
//   "immigrant"        → blocked by full ban, partial ban, and immigrant-visa pause
//   "nonimmigrant"     → blocked by full ban; cautioned (not blocked) under partial ban
//   "humanitarian_us"  → in-US relief (TPS/asylum/CAA); not consular-gated, but the
//                        ban still affects relatives abroad / re-entry — surface a note
// ---------------------------------------------------------------------------
export const PATHWAY_VISA_CLASS = {
  // ── existing PATHWAY_VIABILITY keys ──
  H1B: "nonimmigrant",
  L1: "nonimmigrant",
  O1: "nonimmigrant",
  IMMEDIATE_RELATIVE: "immigrant",
  FAMILY_PREFERENCE: "immigrant",
  F1_STUDENT: "nonimmigrant_bfmj", // F/M/J are suspended under a partial ban
  EB_GENERAL: "immigrant",
  ASYLUM: "humanitarian_us",
  CONSULAR_PROCESSING: "immigrant",
  // ── planned (Caribbean feature) keys, safe to include now ──
  DV: "immigrant",
  H2B: "nonimmigrant",
  E2: "nonimmigrant",
  TPS: "humanitarian_us",
  CUBAN_ADJUSTMENT: "humanitarian_us",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Raw status for a country value. */
export function getProclamationStatus(countryValue) {
  const tier = FULL_BAN.includes(countryValue)
    ? "FULL_BAN"
    : PARTIAL_BAN.includes(countryValue)
    ? "PARTIAL_BAN"
    : "NONE";
  return {
    tier,
    immigrantVisaPaused: IMMIGRANT_VISA_PAUSE.includes(countryValue),
    adjudicationHold: ADJUDICATION_HOLD.includes(countryValue),
  };
}

/** Translated level object for a tier key. */
export function getProclamationLevel(tier) {
  const level = PROCLAMATION_LEVELS[tier] || PROCLAMATION_LEVELS.NONE;
  return {
    key: level.key,
    color: level.color,
    bgColor: level.bgColor,
    label: i18n.t(level.labelKey),
    description: i18n.t(level.descriptionKey),
  };
}

/** Translated meta (disclaimer + dates/source). */
export function getProclamationMeta() {
  return {
    lastUpdated: TRAVEL_PROCLAMATION_META.lastUpdated,
    effectiveDate: TRAVEL_PROCLAMATION_META.effectiveDate,
    sourceUrl: TRAVEL_PROCLAMATION_META.sourceUrl,
    disclaimer: i18n.t(TRAVEL_PROCLAMATION_META.disclaimerKey),
  };
}

/**
 * The gate. Call BEFORE surfacing a pathway for a given country.
 * @param {Object} args
 * @param {string} args.countryValue  app country value (COUNTRY_SEARCH_LIST)
 * @param {string} args.pathwayKey    e.g. "DV", "H2B", "E2" (preferred), OR
 * @param {string} [args.visaClass]   explicit class if pathwayKey is unknown
 * @returns {{ blocked: boolean, severity: "alert"|"warning"|"none",
 *             reason: string|null, status: object, level: object }}
 */
export function assessPathway({ countryValue, pathwayKey, visaClass }) {
  const status = getProclamationStatus(countryValue);
  const level = getProclamationLevel(status.tier);
  const klass = visaClass || PATHWAY_VISA_CLASS[pathwayKey] || "nonimmigrant";

  const result = (blocked, severity, reasonKey) => ({
    blocked,
    severity,
    reason: reasonKey ? i18n.t(reasonKey) : null,
    status,
    level,
  });

  // Full ban: blocks everything issued at a consulate.
  if (status.tier === "FULL_BAN") {
    if (klass === "humanitarian_us") {
      return result(false, "warning", "travelProclamation.reasons.fullBanHumanitarian");
    }
    return result(true, "alert", "travelProclamation.reasons.fullBan");
  }

  // Partial ban: immigrant (and B/F/M/J) blocked; other nonimmigrant cautioned.
  if (status.tier === "PARTIAL_BAN") {
    if (klass === "immigrant" || klass === "nonimmigrant_bfmj") {
      return result(true, "alert", "travelProclamation.reasons.partialBanImmigrant");
    }
    if (klass === "humanitarian_us") {
      return result(false, "warning", "travelProclamation.reasons.partialBanHumanitarian");
    }
    return result(false, "warning", "travelProclamation.reasons.partialBanCaution");
  }

  // No tier, but standalone immigrant-visa pause / adjudication hold may apply.
  if (klass === "immigrant" && status.immigrantVisaPaused) {
    return result(true, "alert", "travelProclamation.reasons.immigrantVisaPause");
  }
  if (status.adjudicationHold) {
    return result(false, "warning", "travelProclamation.reasons.adjudicationHold");
  }

  return result(false, "none", null);
}

/** Convenience: is this country affected at all (for a list badge)? */
export function isProclamationAffected(countryValue) {
  const s = getProclamationStatus(countryValue);
  return s.tier !== "NONE" || s.immigrantVisaPaused || s.adjudicationHold;
}