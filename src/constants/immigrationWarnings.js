// src/constants/immigrationWarnings.js
// Updated: June 2026
//
// Pattern: data-only file. All user-facing strings are translation keys
// referenced via i18n.t(messageKey). See src/i18n/locales/{en,es,pt,zh,ht}.json
// under the `warnings.*` namespace for the actual text.
//
// To update a warning's wording: edit the JSON locale files.
// To add a new warning: add an entry here AND add the key to all 5 JSON files.
//
// Render sites should use getWarningMessage(warning) to get the translated
// text — they should NOT read warning.messageKey directly.
//
// Matching: a warning shows when its `appliesTo` includes the user's visaType
// (or "ALL"), AND any `country` (exact snake_case match) is satisfied, AND any
// `countryFilter(country)` predicate returns true. `country` here is the
// snake_case value from profile.countryOfCitizenship (e.g. "india", "jamaica").

import i18n from "../i18n";
import { isDvEligible } from "../data/pathwayViability";

export const IMMIGRATION_WARNINGS = {
  // =========================================================
  // H-1B WARNINGS
  // =========================================================
  H1B_CAP: {
    id: "h1b_cap",
    severity: "warning",
    appliesTo: ["H1B"],
    messageKey: "warnings.h1bCap",
  },

  H1B_WEIGHTED_LOTTERY: {
    id: "h1b_weighted",
    severity: "alert",
    appliesTo: ["H1B"],
    messageKey: "warnings.h1bWeightedLottery",
  },

  H1B_FEE_ALERT: {
    id: "h1b_fee",
    severity: "alert",
    appliesTo: ["H1B"],
    messageKey: "warnings.h1bFeeAlert",
  },

  H1B_PREMIUM_INCREASE: {
    id: "h1b_premium",
    severity: "info",
    appliesTo: ["H1B", "L1", "O1", "EB1", "EB2", "EB3"],
    messageKey: "warnings.h1bPremiumIncrease",
  },

  // =========================================================
  // FAMILY WARNINGS
  // =========================================================
  FAMILY_LONG_WAIT: {
    id: "family_wait",
    severity: "info",
    appliesTo: ["F1", "F2B", "F3", "F4"],
    messageKey: "warnings.familyLongWait",
  },

  FAMILY_POLICY_SHIFTS: {
    id: "family_policy",
    severity: "warning",
    appliesTo: ["F1", "F2A", "F2B", "F3", "F4"],
    messageKey: "warnings.familyPolicyShifts",
  },

  // =========================================================
  // EMPLOYMENT-BASED GREEN CARD WARNINGS
  // =========================================================
  INDIA_EB_BACKLOG: {
    id: "india_eb",
    severity: "warning",
    appliesTo: ["EB2", "EB3"],
    country: "india", // FIX: was "India" (capitalized) — never matched the
    // snake_case profile.countryOfCitizenship, so this warning was dead code.
    messageKey: "warnings.indiaEbBacklog",
  },

  CHINA_EB_BACKLOG: {
    id: "china_eb",
    severity: "info",
    appliesTo: ["EB2", "EB3"],
    country: "china", // FIX: was "China" (capitalized) — see note above.
    messageKey: "warnings.chinaEbBacklog",
  },

  // =========================================================
  // EAD / WORK AUTHORIZATION WARNINGS
  // =========================================================
  EAD_VALIDITY_REDUCED: {
    id: "ead_validity",
    severity: "alert",
    appliesTo: ["I485", "ASYLUM", "REFUGEE", "TPS", "PAROLE"],
    messageKey: "warnings.eadValidityReduced",
  },

  EAD_AUTO_EXTENSION_ENDED: {
    id: "ead_auto_ext",
    severity: "alert",
    appliesTo: ["I485", "ASYLUM", "REFUGEE", "TPS", "PAROLE"],
    messageKey: "warnings.eadAutoExtensionEnded",
  },

  EAD_TPS_PAROLE_ONE_YEAR: {
    id: "ead_tps_parole",
    severity: "warning",
    appliesTo: ["TPS", "PAROLE"],
    messageKey: "warnings.eadTpsParoleOneYear",
  },

  // =========================================================
  // ASYLUM WARNING
  // =========================================================
  ASYLUM_VOLATILITY: {
    id: "asylum_volatile",
    severity: "alert",
    appliesTo: ["ASYLUM"],
    messageKey: "warnings.asylumVolatility",
  },

  // =========================================================
  // STUDENT WARNINGS
  // =========================================================
  STUDENT_OPT_PLANNING: {
    id: "student_opt",
    severity: "info",
    appliesTo: ["F1", "OPT", "STEM_OPT"],
    messageKey: "warnings.studentOptPlanning",
  },

  // =========================================================
  // DIVERSITY VISA (DV) WARNINGS
  // Surfaced for prospective immigrants (visaType falls back to purpose
  // "work"/"family" when there's no current visa) and only for DV-eligible
  // countries via countryFilter. Also matches an explicit "DV" visaType so
  // these can surface on a DV pathway detail view.
  // =========================================================
  DV_SCAM: {
    id: "dv_scam",
    severity: "alert",
    appliesTo: ["work", "family", "DV"],
    countryFilter: isDvEligible,
    messageKey: "warnings.dvScam",
  },

  DV_PAUSED: {
    id: "dv_paused",
    severity: "warning",
    appliesTo: ["work", "family", "DV"],
    countryFilter: isDvEligible,
    messageKey: "warnings.dvPaused",
  },

  // =========================================================
  // GENERAL
  // =========================================================
  PROCESSING_TIMES_DISCLAIMER: {
    id: "processing_disclaimer",
    severity: "info",
    appliesTo: ["ALL"],
    messageKey: "warnings.processingTimesDisclaimer",
  },
};

/**
 * Helper: Get all warnings that apply to a given pathway/visa type and country.
 *
 * A warning matches when:
 *   - appliesTo includes visaType (or "ALL"), AND
 *   - it has no `country`, or `country` equals the given country, AND
 *   - it has no `countryFilter`, or `countryFilter(country)` is true.
 *
 * `countryFilter` is backward-compatible: existing warnings without it are
 * unaffected.
 */
export function getWarningsFor(visaType, country = null) {
  return Object.values(IMMIGRATION_WARNINGS).filter((w) => {
    const typeMatch =
      w.appliesTo.includes(visaType) || w.appliesTo.includes("ALL");
    const countryMatch = !w.country || w.country === country;
    const filterMatch = !w.countryFilter || w.countryFilter(country);
    return typeMatch && countryMatch && filterMatch;
  });
}

/**
 * Helper: Get the translated message text for a warning object.
 * Use this at every render site that displays warning text.
 *
 * Example:
 *   <Text>{getWarningMessage(warning)}</Text>
 *
 * If the warning has no messageKey (legacy/malformed data), falls back to
 * a literal `message` field if present, then to an empty string.
 */
export function getWarningMessage(warning) {
  if (!warning) return "";
  if (warning.messageKey) {
    const translated = i18n.t(warning.messageKey);
    // i18next returns the key itself when the key isn't in the locale.
    // Guard against that to avoid showing "warnings.h1bCap" in the UI.
    if (translated !== warning.messageKey) return translated;
  }
  return warning.message || "";
}

export default IMMIGRATION_WARNINGS;