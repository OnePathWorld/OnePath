// src/data/pathwayViability.js
// Created: March 2026
// Updated: April 2026 — converted to translation-key pattern.
//
// Pattern: data-only file. All user-facing strings are translation keys
// referenced via i18n.t(). See src/i18n/locales/{en,es,pt,zh}.json under
// the `pathwayViability.*` namespace for the actual text.
//
// To update wording: edit the JSON locale files.
// To add a new pathway:
//   1. Add an entry below with viability + i18nBaseKey
//   2. Add the matching keys to all 4 JSON files
//   3. Run scripts/verify_locales.js (or equivalent) to confirm parity
//
// Render sites should use getViability(pathwayKey) which returns the
// pathway with all strings already translated.

import i18n from "../i18n";

export const VIABILITY_META = {
  // Date strings stay literal — they're not translated, just displayed.
  lastUpdated: "March 2026",
  // The disclaimer is now a translation key. Render sites should
  // call getViabilityMeta() to get the translated version.
  disclaimerKey: "pathwayViability.disclaimer",
};

/**
 * Viability Levels — colors stay literal (not translated).
 * The label and description are translation keys, looked up by getLevel().
 */
export const VIABILITY_LEVELS = {
  HIGH: {
    key: "HIGH",
    color: "#2E7D32",
    bgColor: "#E8F5E9",
  },
  CONDITIONAL: {
    key: "CONDITIONAL",
    color: "#F57F17",
    bgColor: "#FFF8E1",
  },
  LOWER: {
    key: "LOWER",
    color: "#C62828",
    bgColor: "#FFEBEE",
  },
};

/**
 * Pathway Viability Assessments
 *
 * Each pathway has:
 *   - viability: enum referencing VIABILITY_LEVELS
 *   - i18nBaseKey: string base path under pathwayViability.pathways.*
 *     The helper getViability() reads this to build the full key paths
 *     for shortReason, recommendation, and details.
 *   - updatedDate: literal date string
 */
export const PATHWAY_VIABILITY = {
  // ---------------------------------------------------------
  // WORK-BASED
  // ---------------------------------------------------------
  H1B: {
    viability: "LOWER",
    i18nBaseKey: "pathwayViability.pathways.H1B",
    detailsCount: 4,
    updatedDate: "March 2026",
  },

  L1: {
    viability: "CONDITIONAL",
    i18nBaseKey: "pathwayViability.pathways.L1",
    detailsCount: 4,
    updatedDate: "March 2026",
  },

  O1: {
    viability: "CONDITIONAL",
    i18nBaseKey: "pathwayViability.pathways.O1",
    detailsCount: 4,
    updatedDate: "March 2026",
  },

  H2B: {
    viability: "CONDITIONAL",
    i18nBaseKey: "pathwayViability.pathways.H2B",
    detailsCount: 5,
    updatedDate: "June 2026",
  },

  // ---------------------------------------------------------
  // FAMILY-BASED
  // ---------------------------------------------------------
  IMMEDIATE_RELATIVE: {
    viability: "HIGH",
    i18nBaseKey: "pathwayViability.pathways.IMMEDIATE_RELATIVE",
    detailsCount: 4,
    updatedDate: "March 2026",
  },

  FAMILY_PREFERENCE: {
    viability: "LOWER",
    i18nBaseKey: "pathwayViability.pathways.FAMILY_PREFERENCE",
    detailsCount: 4,
    updatedDate: "March 2026",
  },

  // ---------------------------------------------------------
  // STUDENT
  // ---------------------------------------------------------
  F1_STUDENT: {
    viability: "HIGH",
    i18nBaseKey: "pathwayViability.pathways.F1_STUDENT",
    detailsCount: 4,
    updatedDate: "March 2026",
  },

  // ---------------------------------------------------------
  // EMPLOYMENT-BASED GREEN CARD
  // ---------------------------------------------------------
  EB_GENERAL: {
    viability: "CONDITIONAL",
    i18nBaseKey: "pathwayViability.pathways.EB_GENERAL",
    detailsCount: 4,
    updatedDate: "March 2026",
  },

  // ---------------------------------------------------------
  // ASYLUM / PROTECTION
  // ---------------------------------------------------------
  ASYLUM: {
    viability: "LOWER",
    i18nBaseKey: "pathwayViability.pathways.ASYLUM",
    detailsCount: 4,
    updatedDate: "March 2026",
  },

  // ---------------------------------------------------------
  // CONSULAR PROCESSING (NVC)
  // ---------------------------------------------------------
  CONSULAR_PROCESSING: {
    viability: "HIGH",
    i18nBaseKey: "pathwayViability.pathways.CONSULAR_PROCESSING",
    detailsCount: 4,
    updatedDate: "March 2026",
  },
  // ---------------------------------------------------------
  // LOTTERY / OTHER
  // ---------------------------------------------------------
  DV: {
    viability: "LOWER",
    i18nBaseKey: "pathwayViability.pathways.DV",
    detailsCount: 5,
    updatedDate: "June 2026",
  },

  E2: {
    viability: "CONDITIONAL",
    i18nBaseKey: "pathwayViability.pathways.E2",
    detailsCount: 5,
    updatedDate: "June 2026",
  },

};

/**
 * Helper: Get a translated viability level (label + description + colors).
 *
 * Returns:
 *   { key, label, description, color, bgColor }
 */
export function getLevel(levelKey) {
  const level = VIABILITY_LEVELS[levelKey];
  if (!level) return null;
  return {
    ...level,
    label: i18n.t(`pathwayViability.levels.${levelKey}.label`),
    description: i18n.t(`pathwayViability.levels.${levelKey}.description`),
  };
}

/**
 * Helper: Get fully-translated viability info for a pathway.
 *
 * Returns the assessment object with all strings translated and the
 * level inlined. This is what render sites should use.
 *
 * Returns null if the pathway key is unknown.
 */
export function getViability(pathwayKey) {
  const assessment = PATHWAY_VIABILITY[pathwayKey];
  if (!assessment) return null;

  const base = assessment.i18nBaseKey;
  const level = getLevel(assessment.viability);

  // Build details array by reading d1, d2, d3, d4... up to detailsCount
  const details = [];
  for (let i = 1; i <= (assessment.detailsCount || 0); i++) {
    const key = `${base}.details.d${i}`;
    const translated = i18n.t(key);
    // i18next returns the key itself when missing — skip those
    if (translated && translated !== key) {
      details.push(translated);
    }
  }

  return {
    ...assessment,
    level,
    shortReason: i18n.t(`${base}.shortReason`),
    recommendation: i18n.t(`${base}.recommendation`),
    details,
  };
}

/**
 * Helper: Get translated meta info (disclaimer + lastUpdated).
 */
export function getViabilityMeta() {
  return {
    lastUpdated: VIABILITY_META.lastUpdated,
    disclaimer: i18n.t(VIABILITY_META.disclaimerKey),
  };
}

/**
 * Map pathway IDs (used by app navigation) to viability keys (used here).
 * Unchanged from previous version.
 */
export const PATHWAY_TO_VIABILITY_MAP = {
  work: ["H1B", "L1", "O1", "H2B", "E2", "DV"],
  family: ["IMMEDIATE_RELATIVE", "FAMILY_PREFERENCE"],
  student: ["F1_STUDENT"],
  protection: ["ASYLUM"],
};

// Countries excluded from the DV lottery (by country of birth) for the current
// cycle. REVERIFY against the official DV instructions annually — this list
// changes every year. Source: DV-2027 instructions.
export const DV_EXCLUDED_COUNTRIES = [
  "bangladesh", "brazil", "canada", "china", "colombia", "cuba",
  "dominican_republic", "el_salvador", "haiti", "honduras", "india",
  "jamaica", "mexico", "nigeria", "pakistan", "philippines",
  "south_korea", "venezuela", "vietnam",
];

export function isDvEligible(country) {
  return !!country && !DV_EXCLUDED_COUNTRIES.includes(country);
}

// E-2 treaty-investor countries (app country values). E-2 is available ONLY to
// nationals of countries that maintain an E-2 treaty with the U.S. This list is
// seeded with the Caribbean treaty countries relevant to this feature. EXTEND it
// with the full official Treaty Countries list (travel.state.gov) before relying
// on E-2 for non-Caribbean nationals. Anything not listed is treated ineligible.
export const E2_TREATY_COUNTRIES = [
  "grenada", "jamaica", "trinidad_tobago", "suriname",
  // TODO: add the remaining official E-2 treaty countries (argentina, japan,
  // germany, mexico, etc.) mapped to their COUNTRY_SEARCH_LIST values.
];

export function isE2Eligible(country) {
  return !!country && E2_TREATY_COUNTRIES.includes(country);
}

// Purpose → viability keys, filtered by country (drops DV where ineligible).
export function getViabilityKeys(pathwayId, country) {
  const keys = PATHWAY_TO_VIABILITY_MAP[pathwayId] || [];
  return keys.filter((k) => {
    if (k === "DV") return isDvEligible(country);
    if (k === "E2") return isE2Eligible(country);
    return true;
  });
}

export default {
  VIABILITY_META,
  VIABILITY_LEVELS,
  PATHWAY_VIABILITY,
  getViability,
  getLevel,
  getViabilityMeta,
  PATHWAY_TO_VIABILITY_MAP,
};