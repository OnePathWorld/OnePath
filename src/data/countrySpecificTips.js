// src/data/countrySpecificTips.js
// Created: June 2026
//
// Per-country guidance tips for the Caribbean immigration feature.
//
// Pattern: data-only file, matching pathwayViability.js / immigrationWarnings.js.
// All user-facing strings are translation keys under the `countryTips.*`
// namespace — add matching keys to ALL FIVE locale files (en, es, pt, zh, ht).
// Render sites call getCountryTips(countryValue, profile); they should NOT read
// the *Key fields directly.
//
// `showIf` uses predicate FUNCTIONS taking the profile, matching the convention
// already used in OnboardingScreen.js (e.g. profile.location === "inside_us").
// Profile values: location ∈ {inside_us, outside_us};
//                 purpose  ∈ {work, family, study, protection}.
//
// The travel-proclamation status (Step 2) is merged in automatically as a lead
// badge by getCountryTips — do NOT duplicate ban text in the tip bodies below.

import i18n from "../i18n";
import {
  getProclamationStatus,
  getProclamationLevel,
} from "./travelProclamation";

export const COUNTRY_TIPS_META = {
  lastUpdated: "July 2026",
  disclaimerKey: "countryTips.disclaimer",
};

// ---------------------------------------------------------------------------
// Tip data. Each tip:
//   id, severity ("info"|"warning"|"alert"),
//   titleKey, bodyKey, lastVerified,
//   showIf?(profile) -> boolean   (omit = always show)
// ---------------------------------------------------------------------------
export const COUNTRY_TIPS = {
  cuba: [
    {
      // Always-on baseline so the Country Guidance box never collapses for
      // Cuba (whose proclamation badge is stripped by StatusDetailsScreen and
      // whose CAA tip is inside_us-only). Kept general — ban mechanics live in
      // the pathway/viability section, not here.
      id: "cuba_general",
      severity: "warning",
      titleKey: "countryTips.cuba.general.title",
      bodyKey: "countryTips.cuba.general.body",
      lastVerified: "July 2026",
    },
    {
      id: "cuba_caa",
      severity: "info",
      titleKey: "countryTips.cuba.caa.title",
      bodyKey: "countryTips.cuba.caa.body",
      lastVerified: "June 2026",
      // Cuban Adjustment Act only helps those already in the US.
      showIf: (p) => p.location === "inside_us",
    },
  ],

  haiti: [
    {
      id: "haiti_general",
      severity: "warning",
      titleKey: "countryTips.haiti.general.title",
      bodyKey: "countryTips.haiti.general.body",
      lastVerified: "July 2026",
    },
{
      id: "haiti_tps",
      severity: "alert",
      titleKey: "countryTips.haiti.tps.title",
      bodyKey: "countryTips.haiti.tps.body",
      lastVerified: "July 2026",
      showIf: (p) => p.location === "inside_us",
    },
  ],

  jamaica: [
    {
      id: "jamaica_general",
      severity: "info",
      titleKey: "countryTips.jamaica.general.title",
      bodyKey: "countryTips.jamaica.general.body",
      lastVerified: "July 2026",
    },
    {
      id: "jamaica_e2",
      severity: "info",
      titleKey: "countryTips.jamaica.e2.title",
      bodyKey: "countryTips.jamaica.e2.body",
      lastVerified: "June 2026",
      showIf: (p) => p.purpose === "work",
    },
  ],

  trinidad_tobago: [
    {
      // CORRECTION: T&T IS DV-eligible for DV-2027 (was wrongly excluded in spec).
      id: "tt_dv",
      severity: "info",
      titleKey: "countryTips.trinidad.dv.title",
      bodyKey: "countryTips.trinidad.dv.body",
      lastVerified: "June 2026",
    },
    {
      id: "tt_e2",
      severity: "info",
      titleKey: "countryTips.trinidad.e2.title",
      bodyKey: "countryTips.trinidad.e2.body",
      lastVerified: "June 2026",
      showIf: (p) => p.purpose === "work",
    },
  ],

  dominican_republic: [
    {
      id: "dr_family",
      severity: "info",
      titleKey: "countryTips.dominicanRepublic.family.title",
      bodyKey: "countryTips.dominicanRepublic.family.body",
      lastVerified: "June 2026",
    },
  ],

  grenada: [
    {
      id: "grenada_general",
      severity: "info",
      titleKey: "countryTips.grenada.general.title",
      bodyKey: "countryTips.grenada.general.body",
      lastVerified: "July 2026",
    },
    {
      id: "grenada_e2_cbi",
      severity: "info",
      titleKey: "countryTips.grenada.e2cbi.title",
      bodyKey: "countryTips.grenada.e2cbi.body",
      lastVerified: "June 2026",
      showIf: (p) => p.purpose === "work",
    },
  ],

  // US territories — citizens by birth, no immigration pathway needed.
  puerto_rico: [
    {
      id: "territory_uscitizen",
      severity: "info",
      titleKey: "countryTips.territory.title",
      bodyKey: "countryTips.territory.body",
      lastVerified: "June 2026",
    },
  ],
  us_virgin_islands: [
    {
      id: "territory_uscitizen",
      severity: "info",
      titleKey: "countryTips.territory.title",
      bodyKey: "countryTips.territory.body",
      lastVerified: "June 2026",
    },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Synthesize the proclamation lead badge for a country (or null). */
export function getCountryProclamationBadge(countryValue) {
  const status = getProclamationStatus(countryValue);

  if (status.tier !== "NONE") {
    const level = getProclamationLevel(status.tier);
    return {
      id: "proclamation",
      isProclamation: true,
      severity: status.tier === "FULL_BAN" ? "alert" : "warning",
      title: level.label,
      body: level.description,
      color: level.color,
      bgColor: level.bgColor,
    };
  }

  // NONE tier but still on an immigrant-visa pause / adjudication hold.
  if (status.immigrantVisaPaused || status.adjudicationHold) {
    const level = getProclamationLevel("PARTIAL_BAN"); // amber styling
    return {
      id: "proclamation",
      isProclamation: true,
      severity: "warning",
      title: i18n.t("countryTips.proclamationGenericTitle"),
      body: i18n.t("countryTips.proclamationGenericBody"),
      color: level.color,
      bgColor: level.bgColor,
    };
  }

  return null;
}

/**
 * Translated, profile-filtered tips for a country, with the proclamation badge
 * (if any) prepended. Render layer maps over the returned array.
 */
export function getCountryTips(countryValue, profile = {}) {
  const tips = (COUNTRY_TIPS[countryValue] || [])
    .filter((t) => !t.showIf || t.showIf(profile))
    .map((t) => ({
      id: t.id,
      severity: t.severity,
      title: i18n.t(t.titleKey),
      body: i18n.t(t.bodyKey),
      lastVerified: t.lastVerified,
    }));

  const badge = getCountryProclamationBadge(countryValue);
  return badge ? [badge, ...tips] : tips;
}

/** Translated meta (disclaimer). */
export function getCountryTipsMeta() {
  return {
    lastUpdated: COUNTRY_TIPS_META.lastUpdated,
    disclaimer: i18n.t(COUNTRY_TIPS_META.disclaimerKey),
  };
}