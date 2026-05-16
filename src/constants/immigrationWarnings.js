// src/constants/immigrationWarnings.js
// Updated: March 2026
//
// Pattern: data-only file. All user-facing strings are translation keys
// referenced via i18n.t(messageKey). See src/i18n/locales/{en,es,pt,zh}.json
// under the `warnings.*` namespace for the actual text.
//
// To update a warning's wording: edit the JSON locale files.
// To add a new warning: add an entry here AND add the key to all 4 JSON files.
//
// Render sites should use getWarningMessage(warning) to get the translated
// text — they should NOT read warning.messageKey directly.

import i18n from "../i18n";

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
    country: "India",
    messageKey: "warnings.indiaEbBacklog",
  },

  CHINA_EB_BACKLOG: {
    id: "china_eb",
    severity: "info",
    appliesTo: ["EB2", "EB3"],
    country: "China",
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
 * Behavior unchanged from the previous version — still returns the same warning
 * objects, just with `messageKey` instead of inline `message`.
 */
export function getWarningsFor(visaType, country = null) {
  return Object.values(IMMIGRATION_WARNINGS).filter((w) => {
    const typeMatch =
      w.appliesTo.includes(visaType) || w.appliesTo.includes("ALL");
    const countryMatch = !w.country || w.country === country;
    return typeMatch && countryMatch;
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