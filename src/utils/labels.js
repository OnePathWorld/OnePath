// src/utils/labels.js
// =========================================================
// Centralized label helpers
// ---------------------------------------------------------
// Replaces the duplicated getVisaLabel / getCountryLabel /
// getExpiryLabel / getWorkAuthLabel / getGCYearsLabel helpers
// previously defined inside HomeScreen, StatusDetailsScreen,
// and OnboardingSummaryScreen.
//
// Two visa label variants exist because screens disagree on
// detail level:
//   - getVisaLabel       → descriptive: "F-1 Student", "OPT Work Permit"
//                          (used by OnboardingSummary, StatusDetails)
//   - getVisaLabelShort  → compact:    "F-1", "OPT"
//                          (used by HomeScreen header)
//
// Same pattern for green-card-years labels.
//
// Emoji are kept in the translation JSON (not in this code) so
// that flag emoji stay associated with country names across
// languages and any tweak (e.g. swapping a flag) is a JSON edit.
// =========================================================

import i18n from "../i18n";
import { getSearchCountryLabel } from "../data/countries";

// =========================================================
// VISA STATUS — DESCRIPTIVE
// "F-1 Student", "OPT Work Permit", "🟢 Green Card Holder (LPR)"
// Used by: OnboardingSummary, StatusDetails
// =========================================================
export function getVisaLabel(visa) {
  if (!visa) return i18n.t("labels.visaDescriptive.unknown");
  const key = `labels.visaDescriptive.${visa}`;
  const translated = i18n.t(key);
  // Fall back to compact label, then to raw code
  if (translated !== key) return translated;
  return getVisaLabelShort(visa);
}

// =========================================================
// VISA STATUS — SHORT/COMPACT
// "F-1", "OPT", "🟢 Green Card Holder"
// Used by: HomeScreen header (space-constrained)
// =========================================================
export function getVisaLabelShort(visa) {
  if (!visa) return i18n.t("labels.visa.unknown");
  const key = `labels.visa.${visa}`;
  const translated = i18n.t(key);
  return translated === key ? visa : translated;
}

// =========================================================
// VISA EXPIRY TIMELINE — COMPACT
// "EXPIRED", "< 30 days", "1+ year"
// Used by: HomeScreen status card stats
// =========================================================
export function getExpiryLabel(expiry) {
  if (!expiry) return i18n.t("labels.expiry.unknown");
  const key = `labels.expiry.${expiry}`;
  const translated = i18n.t(key);
  return translated === key ? i18n.t("labels.expiry.unknown") : translated;
}

// =========================================================
// VISA EXPIRY TIMELINE — DESCRIPTIVE WARNING
// "🔴 EXPIRED — Immediate action required!", "⚠️ Expires within 30 days"
// Used by: OnboardingSummary statusInfo
// Returns null for non-urgent timelines (year/safe).
// =========================================================
export function getExpiryWarning(expiry) {
  if (!expiry) return null;
  // Only return a warning for the four urgent timelines
  if (!["expired", "30days", "90days", "6months"].includes(expiry)) return null;
  const key = `labels.expiryWarning.${expiry}`;
  const translated = i18n.t(key);
  return translated === key ? null : translated;
}

// =========================================================
// WORK AUTHORIZATION
// "✅ Unrestricted", "⚠️ Employer-specific", "❌ None"
// Used by: StatusDetails, OnboardingSummary
// =========================================================
export function getWorkAuthLabel(auth) {
  if (!auth) return i18n.t("labels.workAuth.unknown");
  const key = `labels.workAuth.${auth}`;
  const translated = i18n.t(key);
  return translated === key ? auth : translated;
}

// =========================================================
// COUNTRY OF CITIZENSHIP
// "🇮🇳 India", "🇲🇽 México" (translated), "🇯🇲 Jamaica", "🌍 Other"
// Used by: StatusDetails, OnboardingSummary
//
// Resolution order:
//   1. labels.country.<value>  → the 12 pinned countries, translated per locale
//   2. shared COUNTRY_SEARCH_LIST → flag + English name for the ~167 other
//      countries (e.g. "jamaica" → "🇯🇲 Jamaica"). This is what stops
//      non-pinned countries — including the Caribbean countries that back
//      countrySpecificTips — from rendering as "Other" on the tips screen.
//   3. labels.country.other    → final fallback for truly unknown values
// =========================================================
export function getCountryLabel(country) {
  if (!country) return i18n.t("labels.country.other");
  const key = `labels.country.${country}`;
  const translated = i18n.t(key);
  if (translated !== key) return translated;

  // Not in the pinned/translated set — try the shared full-country list so
  // values like "jamaica" / "cuba" / "trinidad_tobago" show their real name
  // (flag + English) instead of collapsing to "Other".
  const searchLabel = getSearchCountryLabel(country);
  if (searchLabel) return searchLabel;

  // Unknown country code → fall back to the "other" label, matching the
  // legacy behavior in OnboardingSummary's getCountryLabel which returned
  // "Other" for any unmapped country.
  return i18n.t("labels.country.other");
}

// =========================================================
// GREEN CARD YEARS HELD — COMPACT
// "< 2 yrs", "5+ yrs ✅"
// Used by: HomeScreen quick-stats
// =========================================================
export function getGCYearsLabel(years) {
  if (!years) return "";
  const key = `labels.gcYears.${years}`;
  const translated = i18n.t(key);
  return translated === key ? years : translated;
}

// =========================================================
// GREEN CARD YEARS HELD — DESCRIPTIVE
// "Less than 2 years", "5+ years ✅", "Military service 🎖️"
// Used by: OnboardingSummary statusInfo
// =========================================================
export function getGCYearsLabelDescriptive(years) {
  if (!years) return "";
  const key = `labels.gcYearsDescriptive.${years}`;
  const translated = i18n.t(key);
  return translated === key ? years : translated;
}

// =========================================================
// LOCATION (inside/outside US)
// =========================================================
export function getLocationLabel(location) {
  if (!location) return "";
  return i18n.t(`labels.location.${location}`);
}