// src/data/processingTimes.js
// PURPOSE: Centralized, verified USCIS + DOS + DOL processing times
// Updated: March 20, 2026
// Used by TimelineScreen, PathwaysScreen, ChecklistScreen, calculators

export const PROCESSING_TIMES_META = {
    lastUpdated: "April 3, 2026",
    dataVersion: "2026-04-03",
    disclaimer:
      "Processing times are estimates and may vary by workload, location, and individual case factors. USCIS posted times may differ from actual adjudication times.",
  };
  
  // All times are expressed in MONTHS unless otherwise noted
  export const PROCESSING_TIMES = {
    // =========================
    // WORK VISAS
    // =========================
    H1B: {
      regular: { min: 6, max: 8 },
      premium: { days: 15 },
      notes: [
        "Subject to annual cap and wage-weighted lottery (FY2027+)",
        "Premium processing does not bypass lottery",
        "Actual regular processing now 8+ months for change of status",
        "Premium processing fee: $2,965 (effective March 1, 2026)",
      ],
      countryAdjustments: {
        default: 0,
        India: 0,
        China: 0,
      },
    },
  
    L1: {
      regular: { min: 4, max: 6 },
      premium: { days: 15 },
      notes: [
        "Not subject to annual cap or lottery",
        "L-1A (manager/exec): up to 7 years total",
        "L-1B (specialized knowledge): up to 5 years total",
      ],
      countryAdjustments: { default: 0 },
    },
  
    O1: {
      regular: { min: 4, max: 8 },
      premium: { days: 15 },
      notes: [
        "Not subject to annual cap",
        "Requires advisory opinion from peer group",
        "Extensive documentation typically needed",
      ],
      countryAdjustments: { default: 0 },
    },
  
    // =========================
    // EMPLOYMENT GREEN CARDS
    // =========================
    EB: {
      i140: {
        regular: { min: 6, max: 12 },
        premium: { days: 15 },
        notes: ["45 days for EB-1C and EB-2 NIW premium processing"],
      },
      i485: {
        regular: { min: 8, max: 14 },
        notes: [
          "EAD validity now 18 months max (effective Dec 5, 2025)",
          "540-day auto-extensions eliminated (effective Oct 30, 2025)",
        ],
      },
      perm: {
        pwd: { min: 3, max: 4 },
        recruitment: { min: 2, max: 3 },
        filing: { min: 16, max: 18 },
        notes: [
          "DOL processing PERM applications filed Oct 2024 (as of Mar 2026)",
          "Average PERM processing: ~503 days (~17 months)",
          "PWD processing improved to ~3 months (processing Dec 2025 filings)",
          "Oct 2025 government shutdown added to backlog",
        ],
      },
      priorityDateRequired: true,
    },
  
    // =========================
    // FAMILY
    // =========================
    I130_IR: {
      regular: { min: 8, max: 14 },
      subjectToVisaBulletin: false,
      notes: [
        "Immediate relatives not subject to annual visa limits",
        "Processing at National Benefits Center",
      ],
    },
  
    I130_PREF: {
      regular: { min: 10, max: 18 },
      subjectToVisaBulletin: true,
      categoryWaits: {
        F1: { minYears: 7, maxYears: 10 },
        F2A: { minYears: 2, maxYears: 3 },
        F2B: { minYears: 6, maxYears: 8 },
        F3: { minYears: 11, maxYears: 15 },
        F4: { minYears: 14, maxYears: 20 },
      },
      countryMultipliers: {
        India: 1.3,
        Mexico: 1.4,
        Philippines: 1.35,
        China: 1.2,
        default: 1,
      },
      notes: [
        "Presidential Proclamations 10949/10998 have reduced issuance rates for certain nationalities",
        "Retrogression possible later in FY2026",
      ],
    },
  
    K1: {
      regular: { min: 6, max: 9 },
      subjectToVisaBulletin: false,
    },
  
    // =========================
    // STUDENTS
    // =========================
    F1: {
      regular: { min: 2, max: 3 },
      notes: [
        "Embassy wait times may add delays",
        "SEVIS fee: $350 (must be paid before interview)",
      ],
    },
  
    OPT: {
      regular: { min: 3, max: 5 },
      premium: { days: 30 },
      notes: [
        "Apply up to 90 days before graduation",
        "Premium processing: $1,780 (effective March 1, 2026)",
        "STEM OPT extension: additional 24 months",
      ],
    },
  
    J1: {
      regular: { minWeeks: 4, maxWeeks: 6 },
      notes: ["Many subject to 2-year home residency requirement"],
    },
  
    M1: {
      regular: { min: 2, max: 3 },
    },
  
    // =========================
    // HUMANITARIAN
    // =========================
    ASYLUM: {
      regular: { minMonths: 6, maxYears: 5 },
      notes: [
        "Clock may pause due to applicant delays",
        "Employment authorization eligible after 150 days",
        "EAD validity now 18 months max (effective Dec 5, 2025)",
        "Auto-extensions eliminated — plan renewals 6 months ahead",
        "Policy environment is volatile — enhanced screening rules in effect",
      ],
    },
  
    REFUGEE: {
      regular: { minMonths: 18, maxMonths: 24 },
      notes: [
        "EAD validity now 18 months max",
      ],
    },
  
    // =========================
    // DOL PROCESSING (for green card timeline)
    // =========================
    DOL_PWD: {
      regular: { min: 3, max: 4 },
      notes: [
        "As of March 2026: Processing OEWS and non-OEWS requests filed Dec 2025",
        "Improved from ~6 months — currently ~3 months",
        "Redeterminations: processing Oct 2025 filings (~5 months)",
      ],
    },
  
    DOL_PERM: {
      regular: { min: 16, max: 18 },
      notes: [
        "As of March 2026: Adjudicating applications filed Oct 2024",
        "Average processing: 503 days (~17 months)",
        "Audit review: processing Jun 2025 filings (~9 months)",
        "Oct 2025 government shutdown added to backlog",
      ],
    },
  };
  
  // =========================
  // UTILITY FUNCTIONS
  // =========================
  
  /**
   * Get processing time data by key
   */
  export function getProcessingTime(processingKey) {
    return PROCESSING_TIMES?.[processingKey] ?? null;
  }
  
  /**
   * Convert processing time object into readable string
   */
  export function formatProcessingTime(timeObj) {
    if (!timeObj) return "Varies";
  
    if (timeObj.days) return `${timeObj.days} days`;
    if (timeObj.minWeeks)
      return `${timeObj.minWeeks}-${timeObj.maxWeeks} weeks`;
    if (timeObj.minMonths && timeObj.maxYears)
      return `${timeObj.minMonths} months – ${timeObj.maxYears}+ years`;
    if (timeObj.minMonths && timeObj.maxMonths)
      return `${timeObj.minMonths}-${timeObj.maxMonths} months`;
    if (timeObj.minYears)
      return `${timeObj.minYears}-${timeObj.maxYears}+ years`;
  
    return `${timeObj.min}-${timeObj.max} months`;
  }
  
  /**
   * Apply country-based multipliers where relevant
   */
  export function applyCountryAdjustment(
    baseYears,
    country,
    multipliers = {}
  ) {
    const multiplier = multipliers[country] || multipliers.default || 1;
    return Math.round(baseYears * multiplier);
  }
  
  /**
   * Get full green card timeline estimate
   */
  export function getGreenCardTimeline(country = "default") {
    const pwd = PROCESSING_TIMES.DOL_PWD.regular;
    const perm = PROCESSING_TIMES.DOL_PERM.regular;
    const i140 = PROCESSING_TIMES.EB.i140.regular;
    const i485 = PROCESSING_TIMES.EB.i485.regular;
  
    const minMonths = pwd.min + 2 + perm.min + i140.min + i485.min; // +2 for recruitment
    const maxMonths = pwd.max + 3 + perm.max + i140.max + i485.max;
  
    let priorityWait = null;
    if (country === "India") {
      priorityWait = "12+ years (EB-2/EB-3)";
    } else if (country === "China") {
      priorityWait = "4-5 years (EB-2) / 5+ years (EB-3)";
    }
  
    return {
      minMonths,
      maxMonths,
      priorityWait,
      formatted: priorityWait
        ? `${Math.round(minMonths / 12)}-${Math.round(maxMonths / 12)} years processing + ${priorityWait} priority date wait`
        : `${Math.round(minMonths / 12)}-${Math.round(maxMonths / 12)} years total`,
    };
  }