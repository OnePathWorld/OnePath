// src/data/policyTracker.js
// Updated: April 2026 — converted to translation-key pattern.
//
// Pattern: data file with one class. All user-facing strings are translation
// keys referenced via i18n.t(). See src/i18n/locales/{en,es,pt,zh}.json under
// the `policyTracker.*` namespace for the actual text.
//
// Render sites should call:
//   - getActivePolicies() → translated policies grouped by severity
//   - getCourtCases() → translated court cases
//   - getUpcomingChanges() → translated upcoming changes
//   - getEmbassyAlerts() → translated embassy alerts
// or use the analyzer (policyImpactAnalyzer.analyzeUserImpact()) which
// returns translated objects.
//
// Dates, severities, IDs, and impact codes (HIGH/MODERATE/LOW/CRITICAL)
// are part of the translation strings themselves so they can be localized
// where appropriate (e.g. ALTO/MODERADO in Spanish).

import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../i18n";

export const POLICY_TRACKER_META = {
  lastChecked: new Date().toISOString(),
  version: "2.0",
  lastUpdated: "April 3, 2026",
  sources: [
    "Federal Register",
    "USCIS Policy Manual",
    "State Department Visa Bulletin",
    "Presidential Proclamations",
    "Court Decisions",
    "H.R. 1 (One Big Beautiful Bill Act)",
  ],
};

// ============================================================
// POLICY DEFINITIONS — data shape only
// ============================================================
// Each policy entry has:
//   - id: stable identifier
//   - i18nBaseKey: base path for translation lookups
//     (title, summary, details, actions.a1..aN, impactByStatus.{visa})
//   - actionsCount: number of a1..aN actions to look up
//   - impactStatuses: which visa codes have status-specific impact text
//   - everything else (severity, dates, affected lists, source) is data

const POLICY_DEFINITIONS = {
  critical: [
    {
      id: "h1b-100k-fee-consular",
      type: "fee_increase",
      severity: "critical",
      i18nBaseKey: "policyTracker.policies.h1b100kFee",
      actionsCount: 3,
      impactStatuses: ["F1", "OPT", "H1B", "B1B2"],
      effectiveDate: "2025-09-21",
      affectedVisas: ["H1B"],
      affectedCountries: ["all"],
      source: "Presidential Proclamation 10973",
      publishedDate: "2025-09-19",
    },
    {
      id: "ead-validity-18-months",
      type: "policy_change",
      severity: "critical",
      i18nBaseKey: "policyTracker.policies.eadValidity18Months",
      actionsCount: 3,
      impactStatuses: ["GC_pending", "EAD", "H1B", "F1"],
      effectiveDate: "2025-12-05",
      affectedVisas: ["I485", "ASYLUM", "REFUGEE", "EAD"],
      affectedCountries: ["all"],
      source: "USCIS Policy Alert PA-2025-27",
      publishedDate: "2025-12-04",
    },
    {
      id: "ead-auto-extension-ended",
      type: "policy_change",
      severity: "critical",
      i18nBaseKey: "policyTracker.policies.eadAutoExtensionEnded",
      actionsCount: 3,
      impactStatuses: [],
      effectiveDate: "2025-10-30",
      affectedVisas: ["I485", "ASYLUM", "REFUGEE", "EAD"],
      affectedCountries: ["all"],
      source: "DHS Interim Final Rule",
      publishedDate: "2025-10-30",
    },
  ],

  warning: [
    {
      id: "h1b-weighted-lottery-fy2027",
      type: "process_change",
      severity: "warning",
      i18nBaseKey: "policyTracker.policies.h1bWeightedLottery",
      actionsCount: 3,
      impactStatuses: ["OPT", "F1", "H1B"],
      effectiveDate: "2026-02-27",
      affectedVisas: ["H1B"],
      affectedCountries: ["all"],
      source: "DHS Final Rule (Dec 23, 2025)",
      publishedDate: "2025-12-23",
    },
    {
      id: "premium-processing-fee-increase",
      type: "fee_increase",
      severity: "warning",
      i18nBaseKey: "policyTracker.policies.premiumProcessingFeeIncrease",
      actionsCount: 3,
      impactStatuses: [],
      effectiveDate: "2026-03-01",
      affectedVisas: ["H1B", "L1", "O1", "EB1", "EB2", "EB3", "F1", "OPT"],
      affectedCountries: ["all"],
      source: "DHS Final Rule — Adjustment to Premium Processing Fees",
      publishedDate: "2026-01-12",
    },
    {
      id: "visa-bulletin-proclamation-impact",
      type: "visa_bulletin",
      severity: "warning",
      i18nBaseKey: "policyTracker.policies.visaBulletinProclamationImpact",
      actionsCount: 3,
      impactStatuses: [],
      effectiveDate: "2025-06-01",
      affectedVisas: ["EB1", "EB2", "EB3", "F1", "F2A", "F2B", "F3", "F4"],
      affectedCountries: ["all"],
      source: "Department of State — Visa Bulletin March 2026",
      publishedDate: "2026-02-04",
    },
    {
      id: "tps-parole-ead-one-year",
      type: "legislation",
      severity: "warning",
      i18nBaseKey: "policyTracker.policies.tpsParoleEadOneYear",
      actionsCount: 3,
      impactStatuses: [],
      effectiveDate: "2025-07-22",
      affectedVisas: ["TPS", "PAROLE"],
      affectedCountries: ["all"],
      source: "H.R. 1, Pub. L. 119-21 (signed July 4, 2025)",
      publishedDate: "2025-07-04",
    },
    {
      id: "india-eb-backlog-update",
      type: "visa_bulletin",
      severity: "warning",
      i18nBaseKey: "policyTracker.policies.indiaEbBacklogUpdate",
      actionsCount: 4,
      impactStatuses: [],
      effectiveDate: "2026-03-01",
      affectedVisas: ["EB2", "EB3"],
      affectedCountries: ["india"],
      source: "Visa Bulletin March 2026",
      publishedDate: "2026-02-04",
    },
  ],

  info: [
    {
      id: "h4-ead-premium-available",
      type: "process_improvement",
      severity: "info",
      i18nBaseKey: "policyTracker.policies.h4EadPremiumAvailable",
      actionsCount: 2,
      impactStatuses: [],
      effectiveDate: "2025-01-27",
      affectedVisas: ["H4"],
      affectedCountries: ["all"],
      source: "USCIS",
      publishedDate: "2025-01-10",
    },
    {
      id: "sr-category-extended",
      type: "legislation",
      severity: "info",
      i18nBaseKey: "policyTracker.policies.srCategoryExtended",
      actionsCount: 0,
      impactStatuses: [],
      effectiveDate: "2026-02-03",
      affectedVisas: ["EB4"],
      affectedCountries: ["all"],
      source: "H.R. 7148 (signed Feb 3, 2026)",
      publishedDate: "2026-02-03",
    },
  ],
};

const COURT_CASE_DEFINITIONS = [
  {
    id: "weighted-lottery-challenge",
    i18nBaseKey: "policyTracker.courtCases.weightedLotteryChallenge",
    contingencyActionsCount: 2,
    status: "pending",
    expectedDate: "2026-06-01",
    affectedVisas: ["H1B"],
  },
];

const UPCOMING_CHANGE_DEFINITIONS = [
  {
    id: "fy2027SelectionsComplete",
    i18nBaseKey: "policyTracker.upcomingChanges.fy2027SelectionsComplete",
    date: "2026-03-31",
  },
  {
    id: "h1bFilingWindowOpen",
    i18nBaseKey: "policyTracker.upcomingChanges.h1bFilingWindowOpen",
    date: "2026-04-01",
  },
  {
    id: "h1bFilingWindowCloses",
    i18nBaseKey: "policyTracker.upcomingChanges.h1bFilingWindowCloses",
    date: "2026-06-30",
  },
  {
    id: "newOewsWageData",
    i18nBaseKey: "policyTracker.upcomingChanges.newOewsWageData",
    date: "2026-07-01",
  },
  {
    id: "fy2026EndsDvExpires",
    i18nBaseKey: "policyTracker.upcomingChanges.fy2026EndsDvExpires",
    date: "2026-09-30",
  },
  {
    id: "fy2027EmploymentStart",
    i18nBaseKey: "policyTracker.upcomingChanges.fy2027EmploymentStart",
    date: "2026-10-01",
  },
];

const EMBASSY_ALERT_DEFINITIONS = [
  {
    id: "canada-toronto-delays-2026",
    i18nBaseKey: "policyTracker.embassyAlerts.torontoDelays",
    alternativesCount: 2,
    type: "processing_delay",
    severity: "warning",
  },
  {
    id: "mexico-juarez-b1b2-delays",
    i18nBaseKey: "policyTracker.embassyAlerts.juarezB1B2Delays",
    alternativesCount: 2,
    type: "processing_delay",
    severity: "warning",
  },
];

// ============================================================
// TRANSLATION HELPERS — internal
// ============================================================

const t = (key, opts) => i18n.t(key, opts);

function buildActionsArray(baseKey, count) {
  const out = [];
  for (let i = 1; i <= count; i++) {
    out.push(t(`${baseKey}.actions.a${i}`));
  }
  return out;
}

function buildImpactByStatus(baseKey, statuses) {
  const out = {};
  for (const s of statuses) {
    out[s] = t(`${baseKey}.impactByStatus.${s}`);
  }
  return out;
}

function inflatePolicy(def) {
  const base = def.i18nBaseKey;
  const out = {
    id: def.id,
    type: def.type,
    severity: def.severity,
    title: t(`${base}.title`),
    summary: t(`${base}.summary`),
    effectiveDate: def.effectiveDate,
    affectedVisas: def.affectedVisas,
    affectedCountries: def.affectedCountries,
    source: def.source,
    publishedDate: def.publishedDate,
    details: t(`${base}.details`),
  };
  if (def.actionsCount > 0) {
    out.actions = buildActionsArray(base, def.actionsCount);
  }
  if (def.impactStatuses.length > 0) {
    out.impactByStatus = buildImpactByStatus(base, def.impactStatuses);
  }
  return out;
}

function inflateCourtCase(def) {
  const base = def.i18nBaseKey;
  const out = {
    id: def.id,
    case: t(`${base}.case`),
    status: def.status,
    expectedDate: def.expectedDate,
    impact: t(`${base}.impact`),
    affectedVisas: def.affectedVisas,
    probability: t(`${base}.probability`),
  };
  // Court cases use `contingencyActions.a1, .a2, ...` keys (different
  // from policies which use `actions.a1`).
  if (def.contingencyActionsCount > 0) {
    const actions = [];
    for (let i = 1; i <= def.contingencyActionsCount; i++) {
      actions.push(t(`${base}.contingencyActions.a${i}`));
    }
    out.contingencyActions = actions;
  }
  return out;
}

function inflateUpcomingChange(def) {
  const base = def.i18nBaseKey;
  return {
    date: def.date,
    title: t(`${base}.title`),
    impact: t(`${base}.impact`),
    action: t(`${base}.action`),
  };
}

function inflateEmbassyAlert(def) {
  const base = def.i18nBaseKey;
  const alternatives = [];
  for (let i = 1; i <= (def.alternativesCount || 0); i++) {
    alternatives.push(t(`${base}.alternatives.alt${i}`));
  }
  return {
    id: def.id,
    location: t(`${base}.location`),
    type: def.type,
    severity: def.severity,
    currentWait: t(`${base}.currentWait`),
    normalWait: t(`${base}.normalWait`),
    reason: t(`${base}.reason`),
    alternatives,
    action: t(`${base}.action`),
  };
}

// ============================================================
// PUBLIC HELPERS — what render sites should use
// ============================================================

/**
 * Returns ACTIVE_POLICIES with all strings translated. Same shape
 * as the previous inline-string version: { critical: [...], warning: [...], info: [...] }
 */
export function getActivePolicies() {
  return {
    critical: POLICY_DEFINITIONS.critical.map(inflatePolicy),
    warning: POLICY_DEFINITIONS.warning.map(inflatePolicy),
    info: POLICY_DEFINITIONS.info.map(inflatePolicy),
  };
}

export function getCourtCases() {
  return COURT_CASE_DEFINITIONS.map(inflateCourtCase);
}

export function getUpcomingChanges() {
  return UPCOMING_CHANGE_DEFINITIONS.map(inflateUpcomingChange);
}

export function getEmbassyAlerts() {
  return EMBASSY_ALERT_DEFINITIONS.map(inflateEmbassyAlert);
}

// ============================================================
// LEGACY EXPORTS — pre-translated at module load
// ============================================================
// Existing screens that reference these directly still work, but
// strings are frozen at module-load language. New code should call
// the helpers above (getActivePolicies, etc.) inside render so they
// react to language switches.

export const ACTIVE_POLICIES = getActivePolicies();
export const COURT_CASES = getCourtCases();
export const UPCOMING_CHANGES = getUpcomingChanges();
export const EMBASSY_ALERTS = getEmbassyAlerts();

// ============================================================
// POLICY IMPACT ANALYZER
// ============================================================
// Behavior is identical to the previous version. The only change is
// that the inline English strings inside getPersonalImpact() and
// getCourtCaseImpact() now come from translations.
//
// Important: each call to analyzeUserImpact() re-inflates the policy
// data fresh (via getActivePolicies / getCourtCases), so the output
// reflects the current language.

export class PolicyImpactAnalyzer {
  constructor() {
    this.userProfileKey = "@userProfile_v2";
  }

  async analyzeUserImpact() {
    try {
      const profileData = await AsyncStorage.getItem(this.userProfileKey);
      if (!profileData) {
        return { affected: [], riskLevel: "unknown" };
      }

      const profile = JSON.parse(profileData);
      const affectedPolicies = [];
      let highestSeverity = "info";

      // Re-inflate fresh each call so language switches take effect
      const policies = getActivePolicies();
      const courtCases = getCourtCases();

      [
        ...policies.critical,
        ...policies.warning,
        ...policies.info,
      ].forEach((policy) => {
        if (this.isPolicyRelevant(policy, profile)) {
          affectedPolicies.push({
            ...policy,
            personalImpact: this.getPersonalImpact(policy, profile),
          });

          if (policy.severity === "critical") highestSeverity = "critical";
          else if (
            policy.severity === "warning" &&
            highestSeverity !== "critical"
          )
            highestSeverity = "warning";
        }
      });

      courtCases.forEach((courtCase) => {
        if (this.isCourtCaseRelevant(courtCase, profile)) {
          affectedPolicies.push({
            ...courtCase,
            type: "court_case",
            severity: "warning",
            personalImpact: this.getCourtCaseImpact(courtCase, profile),
          });
        }
      });

      // Embassy alerts are shown on the Court Cases tab via renderEmbassyAlert,
      // not in the "Affecting You" personalized policy list

      return {
        affected: affectedPolicies,
        riskLevel: highestSeverity,
        totalAlerts: affectedPolicies.length,
      };
    } catch (error) {
      console.error("Error analyzing policy impact:", error);
      return { affected: [], riskLevel: "unknown" };
    }
  }

  isPolicyRelevant(policy, profile) {
    const userVisa = profile.currentVisa || "";
    const userPurpose = profile.purpose || "";

    const purposeVisaMap = {
      work: ["H1B", "L1", "O1", "EB1", "EB2", "EB3"],
      study: ["F1", "OPT", "J1"],
      family: ["F1", "F2A", "F2B", "F3", "F4", "IR"],
      protection: ["ASYLUM", "TPS", "PAROLE"],
    };
    const purposeVisas = purposeVisaMap[userPurpose] || [];

    const visaRelevant =
      policy.affectedVisas.includes("all") ||
      policy.affectedVisas.some((visa) => {
        const v = visa.toLowerCase();
        return (
          userVisa.toLowerCase().includes(v) ||
          purposeVisas.some((pv) => pv.toLowerCase() === v)
        );
      });

    const userCountry = profile.countryOfCitizenship;
    const countryRelevant =
      policy.affectedCountries.includes("all") ||
      policy.affectedCountries.includes(userCountry);

    return visaRelevant && countryRelevant;
  }

  getPersonalImpact(policy, profile) {
    if (policy.impactByStatus && profile.currentVisa) {
      const statusImpact = policy.impactByStatus[profile.currentVisa];
      if (statusImpact) return statusImpact;
    }

    if (profile.urgency === "immediate" && policy.effectiveDate) {
      const daysUntil = this.daysUntilDate(policy.effectiveDate);
      if (daysUntil > 0 && daysUntil < 30) {
        return t("policyTracker.analyzer.imminentEffect", {
          days: daysUntil,
        });
      }
    }

    if (
      profile.currentVisa === "OPT" &&
      policy.affectedVisas.includes("H1B")
    ) {
      return t("policyTracker.analyzer.optToH1bImpact");
    }

    if (
      profile.countryOfCitizenship === "india" &&
      policy.affectedCountries.includes("india")
    ) {
      return t("policyTracker.analyzer.indiaSpecific");
    }

    return t("policyTracker.analyzer.genericImpact");
  }

  isCourtCaseRelevant(courtCase, profile) {
    const userVisa = profile.currentVisa || "";
    return courtCase.affectedVisas.some((visa) =>
      userVisa.toLowerCase().includes(visa.toLowerCase())
    );
  }

  getCourtCaseImpact(courtCase, profile) {
    return t("policyTracker.analyzer.courtCaseImpact", {
      probability: courtCase.probability,
      date: courtCase.expectedDate,
    });
  }

  isEmbassyAlertRelevant(alert, profile) {
    const userCountry = profile.countryOfCitizenship;
    if (!userCountry) return false;

    const countryLocationMap = {
      canada: "canada",
      mexico: "mexico",
      india: "india",
      china: "china",
    };

    const locationKeyword = countryLocationMap[userCountry];
    if (!locationKeyword) return false;

    return alert.location.toLowerCase().includes(locationKeyword);
  }

  daysUntilDate(dateString) {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async getNextImportantDate() {
    const relevantDates = [];
    const upcoming = getUpcomingChanges();

    upcoming.forEach((change) => {
      const daysUntil = this.daysUntilDate(change.date);
      if (daysUntil > 0 && daysUntil < 90) {
        relevantDates.push({ ...change, daysUntil });
      }
    });

    relevantDates.sort((a, b) => a.daysUntil - b.daysUntil);
    return relevantDates[0] || null;
  }

  subscribeToUpdates(callback) {
    const interval = setInterval(async () => {
      const impact = await this.analyzeUserImpact();
      if (impact.totalAlerts > 0) {
        callback(impact);
      }
    }, 3600000);

    return () => clearInterval(interval);
  }
}

export const policyImpactAnalyzer = new PolicyImpactAnalyzer();

export const checkPolicyUpdates = () =>
  policyImpactAnalyzer.analyzeUserImpact();
export const getNextImportantDate = () =>
  policyImpactAnalyzer.getNextImportantDate();
export const subscribeToUpdates = (callback) =>
  policyImpactAnalyzer.subscribeToUpdates(callback);