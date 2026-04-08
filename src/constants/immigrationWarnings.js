// src/constants/immigrationWarnings.js
// Updated: March 2026

export const IMMIGRATION_WARNINGS = {
    // =========================================================
    // H-1B WARNINGS
    // =========================================================
    H1B_CAP: {
      id: "h1b_cap",
      severity: "warning",
      appliesTo: ["H1B"],
      message:
        "The FY2027 H-1B registration period closes March 19, 2026. A new wage-weighted lottery favors higher-paid positions.",
    },
  
    H1B_WEIGHTED_LOTTERY: {
      id: "h1b_weighted",
      severity: "alert",
      appliesTo: ["H1B"],
      message:
        "New for FY2027: USCIS uses a weighted selection process. Higher wage levels have significantly better odds of selection. Entry-level positions face reduced chances.",
    },
  
    H1B_FEE_ALERT: {
      id: "h1b_fee",
      severity: "alert",
      appliesTo: ["H1B"],
      message:
        "Presidential Proclamation 10973: A $100,000 additional fee applies to certain H-1B petitions requiring consular processing (beneficiary outside the U.S.). This is in addition to all regular filing fees.",
    },
  
    H1B_PREMIUM_INCREASE: {
      id: "h1b_premium",
      severity: "info",
      appliesTo: ["H1B", "L1", "O1", "EB1", "EB2", "EB3"],
      message:
        "Premium processing fees increased effective March 1, 2026. I-129/I-140: now $2,965. I-765: now $1,780. I-539: now $2,075.",
    },
  
    // =========================================================
    // FAMILY WARNINGS
    // =========================================================
    FAMILY_LONG_WAIT: {
      id: "family_wait",
      severity: "info",
      appliesTo: ["F1", "F2B", "F3", "F4"],
      message:
        "Some family preference categories have multi-year waiting periods due to annual visa limits. F4 siblings can wait 15+ years for certain countries.",
    },
  
    FAMILY_POLICY_SHIFTS: {
      id: "family_policy",
      severity: "warning",
      appliesTo: ["F1", "F2A", "F2B", "F3", "F4"],
      message:
        "Presidential Proclamations have reduced visa issuance rates for certain nationalities. Dates have been advanced for other countries but retrogression is possible later in FY2026.",
    },
  
    // =========================================================
    // EMPLOYMENT-BASED GREEN CARD WARNINGS
    // =========================================================
    INDIA_EB_BACKLOG: {
      id: "india_eb",
      severity: "warning",
      appliesTo: ["EB2", "EB3"],
      country: "India",
      message:
        "India EB-2 final action date: September 15, 2013. EB-3: November 15, 2013. The backlog remains 12+ years. Some forward movement occurred in early 2026.",
    },
  
    CHINA_EB_BACKLOG: {
      id: "china_eb",
      severity: "info",
      appliesTo: ["EB2", "EB3"],
      country: "China",
      message:
        "China EB-2 final action date: September 1, 2021. EB-3: May 1, 2021. Multi-year backlog persists for mainland-born applicants.",
    },
  
    // =========================================================
    // EAD / WORK AUTHORIZATION WARNINGS (NEW)
    // =========================================================
    EAD_VALIDITY_REDUCED: {
      id: "ead_validity",
      severity: "alert",
      appliesTo: ["I485", "ASYLUM", "REFUGEE", "TPS", "PAROLE"],
      message:
        "Effective December 5, 2025: EAD maximum validity reduced from 5 years to 18 months for adjustment of status applicants, refugees, asylees, and related categories. File renewals early — gaps in work authorization are now more likely.",
    },
  
    EAD_AUTO_EXTENSION_ENDED: {
      id: "ead_auto_ext",
      severity: "alert",
      appliesTo: ["I485", "ASYLUM", "REFUGEE", "TPS", "PAROLE"],
      message:
        "Effective October 30, 2025: Automatic 540-day EAD extensions have been eliminated for most categories. EADs now expire on their printed date. Plan renewals at least 6 months ahead.",
    },
  
    EAD_TPS_PAROLE_ONE_YEAR: {
      id: "ead_tps_parole",
      severity: "warning",
      appliesTo: ["TPS", "PAROLE"],
      message:
        "Per H.R. 1 (One Big Beautiful Bill Act): TPS and parole EADs are now valid for a maximum of 1 year or the end of the authorized period, whichever is shorter.",
    },
  
    // =========================================================
    // ASYLUM WARNING (NEW)
    // =========================================================
    ASYLUM_VOLATILITY: {
      id: "asylum_volatile",
      severity: "alert",
      appliesTo: ["ASYLUM"],
      message:
        "Asylum policy is subject to active changes including enhanced screening rules and proposed regulations. Treat this as a high-volatility pathway and consult an attorney for current guidance.",
    },
  
    // =========================================================
    // STUDENT WARNINGS
    // =========================================================
    STUDENT_OPT_PLANNING: {
      id: "student_opt",
      severity: "info",
      appliesTo: ["F1", "OPT", "STEM_OPT"],
      message:
        "Apply for OPT up to 90 days before graduation. STEM OPT requires E-Verify employer. Processing currently takes ~4.5 months — plan accordingly.",
    },
  
    // =========================================================
    // GENERAL
    // =========================================================
    PROCESSING_TIMES_DISCLAIMER: {
      id: "processing_disclaimer",
      severity: "info",
      appliesTo: ["ALL"],
      message:
        "USCIS processing times have slowed significantly in recent months. Actual times may exceed posted estimates. Consider premium processing where available.",
    },
  };
  
  /**
   * Helper: Get all warnings that apply to a given pathway/visa type and country
   */
  export function getWarningsFor(visaType, country = null) {
    return Object.values(IMMIGRATION_WARNINGS).filter((w) => {
      const typeMatch =
        w.appliesTo.includes(visaType) || w.appliesTo.includes("ALL");
      const countryMatch = !w.country || w.country === country;
      return typeMatch && countryMatch;
    });
  }
  
  export default IMMIGRATION_WARNINGS;