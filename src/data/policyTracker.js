// src/data/policyTracker.js

import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Policy Tracker System
 * Monitors immigration policy changes and provides personalized impact analysis
 */

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

/**
 * Current Active Policy Changes
 */
export const ACTIVE_POLICIES = {
  critical: [
    {
      id: "h1b-100k-fee-consular",
      type: "fee_increase",
      severity: "critical",
      title: "$100,000 H-1B Fee — Consular Processing",
      summary:
        "Additional $100,000 payment required for certain H-1B petitions approved for consular processing.",
      effectiveDate: "2025-09-21",
      affectedVisas: ["H1B"],
      affectedCountries: ["all"],
      source: "Presidential Proclamation 10973",
      publishedDate: "2025-09-19",
      details:
        "Applies when the beneficiary is outside the U.S. or when the petition is approved for consular processing. Generally does NOT apply to F-1→H-1B change of status within the U.S. Total employer cost can exceed $106,000.",
      actions: [
        "Determine if beneficiary qualifies for change of status (avoids fee)",
        "Consider L-1 or O-1 alternatives if eligible",
        "Budget accordingly if consular processing is required",
      ],
      impactByStatus: {
        F1: "MODERATE — F-1→H-1B change of status generally avoids this fee",
        OPT: "MODERATE — Cap-gap eligible OPT holders can file change of status",
        H1B: "HIGH — Transfers requiring consular processing trigger the fee",
        B1B2: "HIGH — Must use consular processing, fee applies",
      },
    },
    {
      id: "ead-validity-18-months",
      type: "policy_change",
      severity: "critical",
      title: "EAD Validity Reduced to 18 Months",
      summary:
        "Maximum EAD validity cut from 5 years to 18 months for adjustment-of-status applicants, refugees, asylees, and related categories.",
      effectiveDate: "2025-12-05",
      affectedVisas: ["I485", "ASYLUM", "REFUGEE", "EAD"],
      affectedCountries: ["all"],
      source: "USCIS Policy Alert PA-2025-27",
      publishedDate: "2025-12-04",
      details:
        "Affects pending and new I-765 applications filed on or after Dec 5, 2025. Does NOT affect OPT, STEM OPT, H-4, J-2, or L-2 EADs. Existing EADs retain their printed expiration date.",
      actions: [
        "File EAD renewals at least 6 months before expiration",
        "No automatic 540-day extensions — plan for potential work gaps",
        "Track expiration dates carefully",
      ],
      impactByStatus: {
        GC_pending: "CRITICAL — Must renew EAD every 18 months",
        EAD: "HIGH — Check which category your EAD falls under",
        H1B: "LOW — H-1B status not affected",
        F1: "LOW — OPT EADs not affected by this policy",
      },
    },
    {
      id: "ead-auto-extension-ended",
      type: "policy_change",
      severity: "critical",
      title: "540-Day EAD Auto-Extensions Eliminated",
      summary:
        "Automatic 540-day EAD extensions ended for most categories. EADs now expire on the printed date.",
      effectiveDate: "2025-10-30",
      affectedVisas: ["I485", "ASYLUM", "REFUGEE", "EAD"],
      affectedCountries: ["all"],
      source: "DHS Interim Final Rule",
      publishedDate: "2025-10-30",
      details:
        "Previously, timely-filed EAD renewals automatically extended the old EAD for 540 days. This is no longer the case. If USCIS hasn't adjudicated your renewal by your EAD's expiration date, you must stop working.",
      actions: [
        "File renewals as early as possible (6 months before expiration)",
        "Consider premium processing for I-765 if available ($1,780)",
        "Maintain alternative status if possible",
      ],
    },
  ],

  warning: [
    {
      id: "h1b-weighted-lottery-fy2027",
      type: "process_change",
      severity: "warning",
      title: "H-1B Wage-Weighted Lottery (FY2027+)",
      summary:
        "USCIS replaced the random H-1B lottery with a wage-weighted selection system. Higher wages = better odds.",
      effectiveDate: "2026-02-27",
      affectedVisas: ["H1B"],
      affectedCountries: ["all"],
      source: "DHS Final Rule (Dec 23, 2025)",
      publishedDate: "2025-12-23",
      details:
        "Level I (entry) wages get 1x odds. Level IV (expert) wages get up to 4x odds. Registration must include SOC code and OEWS wage level. First applied to FY2027 registration (March 4-19, 2026).",
      actions: [
        "Offer competitive wages to maximize selection odds",
        "Ensure correct SOC code and wage level on registration",
        "Consider O-1 or L-1 if H-1B odds are unfavorable at your wage level",
      ],
      impactByStatus: {
        OPT: "HIGH — Entry-level offers face significantly reduced odds",
        F1: "HIGH — Affects post-graduation H-1B prospects",
        H1B: "MODERATE — Affects transfers if new registration needed",
      },
    },
    {
      id: "premium-processing-fee-increase",
      type: "fee_increase",
      severity: "warning",
      title: "Premium Processing Fees Increased",
      summary:
        "All premium processing fees increased ~5.7% effective March 1, 2026.",
      effectiveDate: "2026-03-01",
      affectedVisas: ["H1B", "L1", "O1", "EB1", "EB2", "EB3", "F1", "OPT"],
      affectedCountries: ["all"],
      source: "DHS Final Rule — Adjustment to Premium Processing Fees",
      publishedDate: "2026-01-12",
      details:
        "I-129/I-140: $2,965 (was $2,805). I-539: $2,075 (was $1,965). I-765: $1,780 (was $1,685). Filings postmarked before March 1 could use old fees.",
      actions: [
        "Budget for higher premium processing costs",
        "Filings postmarked on or after March 1 must include new fee",
        "Incorrect fees will result in rejection",
      ],
    },
    {
      id: "visa-bulletin-proclamation-impact",
      type: "visa_bulletin",
      severity: "warning",
      title: "Presidential Proclamations Affecting Visa Issuance",
      summary:
        "Proclamations 10949 and 10998 have reduced immigrant visa issuance for certain nationalities. Dates advanced for other countries.",
      effectiveDate: "2025-06-01",
      affectedVisas: ["EB1", "EB2", "EB3", "F1", "F2A", "F2B", "F3", "F4"],
      affectedCountries: ["all"],
      source: "Department of State — Visa Bulletin March 2026",
      publishedDate: "2026-02-04",
      details:
        "Some family and employment categories have been advanced for non-affected countries. Retrogression may occur later in FY2026 as demand materializes or proclamations change.",
      actions: [
        "Check March 2026 Visa Bulletin for current dates",
        "File I-485 promptly when dates become current",
        "Monitor monthly for retrogression risk",
      ],
    },
    {
      id: "tps-parole-ead-one-year",
      type: "legislation",
      severity: "warning",
      title: "TPS/Parole EADs — 1-Year Maximum",
      summary:
        "H.R. 1 (One Big Beautiful Bill Act) limits TPS and parole EADs to 1 year or end of authorized period.",
      effectiveDate: "2025-07-22",
      affectedVisas: ["TPS", "PAROLE"],
      affectedCountries: ["all"],
      source: "H.R. 1, Pub. L. 119-21 (signed July 4, 2025)",
      publishedDate: "2025-07-04",
      details:
        "Initial and renewal EADs for TPS beneficiaries and parolees are now valid for the shorter of 1 year or the end date of the authorized period. Implemented via Federal Register notice July 22, 2025.",
      actions: [
        "File renewals well before expiration",
        "Budget for more frequent filing fees",
        "Track authorization end dates carefully",
      ],
    },
    {
      id: "india-eb-backlog-update",
      type: "visa_bulletin",
      severity: "warning",
      title: "India EB-2/EB-3 — 12+ Year Backlog",
      summary:
        "India EB-2 final action date: Sep 15, 2013. EB-3: Nov 15, 2013. Some forward movement in early 2026.",
      effectiveDate: "2026-03-01",
      affectedVisas: ["EB2", "EB3"],
      affectedCountries: ["india"],
      source: "Visa Bulletin March 2026",
      publishedDate: "2026-02-04",
      details:
        "EB-2 India advanced from May 15, 2013 (Jan 2025) to Sep 15, 2013 (Mar 2026). EB-3 India advanced to Nov 15, 2013. Dates for Filing show further movement. April 2026 bulletin shows additional advances.",
      actions: [
        "Maintain H-1B status — do not let it expire",
        "File H-1B extensions based on approved I-140",
        "Consider EB-1A/EB-1B if qualified",
        "Explore EB-5 as alternative if financially feasible",
      ],
    },
  ],

  info: [
    {
      id: "h4-ead-premium-available",
      type: "process_improvement",
      severity: "info",
      title: "H-4 EAD Premium Processing Available",
      summary:
        "Premium processing available for standalone H-4 EAD applications.",
      effectiveDate: "2025-01-27",
      affectedVisas: ["H4"],
      affectedCountries: ["all"],
      source: "USCIS",
      publishedDate: "2025-01-10",
      details: "30-day processing for $1,780 (updated March 1, 2026).",
      actions: [
        "Consider premium processing if work authorization is urgent",
        "File with H-1B extension to streamline",
      ],
    },
    {
      id: "sr-category-extended",
      type: "legislation",
      severity: "info",
      title: "Religious Workers (SR) Category Extended",
      summary:
        "EB-4 Religious Workers category extended through September 30, 2026.",
      effectiveDate: "2026-02-03",
      affectedVisas: ["EB4"],
      affectedCountries: ["all"],
      source: "H.R. 7148 (signed Feb 3, 2026)",
      publishedDate: "2026-02-03",
      details:
        "SR category subject to same dates for filing and final action dates as other EB-4 categories.",
    },
  ],
};

/**
 * Court Cases Being Monitored
 */
export const COURT_CASES = [
  {
    id: "weighted-lottery-challenge",
    case: "Multiple challenges to wage-weighted H-1B selection",
    status: "pending",
    expectedDate: "2026-06-01",
    impact:
      "Could delay or modify the wage-weighted lottery system",
    affectedVisas: ["H1B"],
    probability: "30% chance of injunction",
    contingencyActions: [
      "Prepare for both random and weighted lottery outcomes",
      "File at appropriate wage level regardless",
    ],
  },
];

/**
 * Upcoming Changes Calendar
 */
export const UPCOMING_CHANGES = [
    {
        date: "2026-03-31",
        title: "FY2027 H-1B Selections Complete",
        impact: "All initial selection notifications sent. ~34-42% selection rate.",
        action: "If selected, begin petition preparation immediately. If 'Submitted', second round possible.",
      },
      {
        date: "2026-04-01",
        title: "H-1B Filing Window NOW OPEN",
        impact: "Selected registrations can file I-129 petitions through June 30",
        action: "File petition as early as possible — 90-day window closes June 30, 2026",
      },
  {
    date: "2026-06-30",
    title: "H-1B Filing Window Closes",
    impact: "Last day to file FY2027 cap-subject petitions",
    action: "Ensure petition is filed before deadline",
  },
  {
    date: "2026-07-01",
    title: "New OEWS Wage Data Expected",
    impact: "Updated prevailing wages for July 2026–June 2027",
    action: "Review new wage levels for pending and future filings",
  },
  {
    date: "2026-09-30",
    title: "FY2026 Ends — DV-2026 Expires",
    impact: "Diversity visa numbers for DV-2026 expire",
    action: "DV-2026 selectees must complete processing before this date",
  },
  {
    date: "2026-10-01",
    title: "FY2027 H-1B Employment Start",
    impact: "Approved FY2027 H-1B beneficiaries can begin work",
    action: "Verify I-797 approval and start date",
  },
];

/**
 * Embassy/Consulate Alerts
 */
export const EMBASSY_ALERTS = [
  {
    id: "canada-toronto-delays-2026",
    location: "Toronto, Canada",
    type: "processing_delay",
    severity: "warning",
    currentWait: "16 months for B-1/B-2",
    normalWait: "3 months",
    reason: "Sustained high demand",
    alternatives: ["Ottawa (11.5 months)", "Vancouver (8 months)"],
    action: "Consider applying in home country or alternative embassy",
  },
  {
    id: "mexico-juarez-b1b2-delays",
    location: "Ciudad Juarez, Mexico",
    type: "processing_delay",
    severity: "warning",
    currentWait: "15.5 months for B-1/B-2",
    normalWait: "3 months",
    reason: "High immigrant and nonimmigrant visa demand",
    alternatives: ["Mexico City (10 months)", "Monterrey (10 months)"],
    action: "Book earliest available appointment; consider alternative posts",
  },
];

/**
 * Policy Impact Analyzer
 */
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

      [
        ...ACTIVE_POLICIES.critical,
        ...ACTIVE_POLICIES.warning,
        ...ACTIVE_POLICIES.info,
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

      COURT_CASES.forEach((courtCase) => {
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
        return `⚠️ Takes effect in ${daysUntil} days — immediate action needed`;
      }
    }

    if (
      profile.currentVisa === "OPT" &&
      policy.affectedVisas.includes("H1B")
    ) {
      return "Directly affects your transition from OPT to H-1B";
    }

    if (
      profile.countryOfCitizenship === "india" &&
      policy.affectedCountries.includes("india")
    ) {
      return "Specifically impacts Indian nationals";
    }

    return "May affect your immigration journey";
  }

  isCourtCaseRelevant(courtCase, profile) {
    const userVisa = profile.currentVisa || "";
    return courtCase.affectedVisas.some((visa) =>
      userVisa.toLowerCase().includes(visa.toLowerCase())
    );
  }

  getCourtCaseImpact(courtCase, profile) {
    return `${courtCase.probability} — Decision expected ${courtCase.expectedDate}`;
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

    UPCOMING_CHANGES.forEach((change) => {
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