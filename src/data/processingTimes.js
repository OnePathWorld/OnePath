// src/data/processingTimes.js
// PURPOSE: Centralized, verified USCIS + DOS + DOL processing times
// Updated: May 8, 2026
// Used by TimelineScreen, PathwaysScreen, ChecklistScreen, calculators

export const PROCESSING_TIMES_META = {
    lastUpdated: "May 8, 2026",
    dataVersion: "2026-05-08",
    disclaimer:
      "Processing times are estimates and may vary by workload, location, and individual case factors. USCIS posted times may differ from actual adjudication times.",
  };
  
  // All times are expressed in MONTHS unless otherwise noted
  export const PROCESSING_TIMES = {
    // =========================
    // WORK VISAS
    // =========================
    H1B: {
      regular: { min: 6, max: 10 },
      premium: { days: 15 },
      notes: [
        "Subject to annual cap and wage-weighted lottery (FY2027+)",
        "Premium processing does not bypass lottery",
        "Actual regular processing now 8-10+ months for change of status",
        "Premium processing fee: $2,965 (effective March 1, 2026)",
        "FY2027 filing window open through June 30, 2026",
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
      regular: { min: 4, max: 9 },
      premium: { days: 15 },
      notes: [
        "Not subject to annual cap",
        "Requires advisory opinion from peer group",
        "Extensive documentation typically needed",
        "Processing times have slowed — plan 9 months for regular",
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
        regular: { min: 8, max: 22 },
        notes: [
          "Employment-based I-485: 8-16 months (USCIS waiving interviews for ~72% of EB cases)",
          "Family-based I-485: 12-22 months",
          "EAD validity now 18 months max (effective Dec 5, 2025)",
          "540-day auto-extensions eliminated (effective Oct 30, 2025)",
          "USCIS using Final Action Dates chart for EB adjustment of status in May 2026",
        ],
      },
      perm: {
        pwd: { min: 3, max: 5 },
        recruitment: { min: 2, max: 3 },
        filing: { min: 16, max: 18 },
        notes: [
          "DOL processing PERM applications filed Oct 2024 (as of May 2026)",
          "Average PERM processing: ~503 days (~17 months)",
          "PWD processing: ~3-5 months (processing Dec 2025–Jan 2026 filings)",
          "Oct 2025 government shutdown added to backlog — still working through",
        ],
      },
      priorityDateRequired: true,
    },
  
    // =========================
    // FAMILY
    // =========================
    I130_IR: {
      regular: { min: 12, max: 18 },
      subjectToVisaBulletin: false,
      notes: [
        "Immediate relatives not subject to annual visa limits",
        "Processing at National Benefits Center: 12-18 months typical",
        "Concurrent I-485 filing: 8-14 months at better-performing field offices",
        "USCIS using Dates for Filing chart for family AOS in May 2026",
      ],
    },
  
    I130_PREF: {
      regular: { min: 12, max: 20 },
      subjectToVisaBulletin: true,
      categoryWaits: {
        F1: { minYears: 7, maxYears: 10 },
        F2A: { minYears: 2, maxYears: 3 },
        F2B: { minYears: 6, maxYears: 8 },
        F3: { minYears: 12, maxYears: 15 },
        F4: { minYears: 15, maxYears: 20 },
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
        "Family categories showed significant forward movement in May 2026 bulletin",
        "Retrogression possible later in FY2026 as demand materializes",
        "F4 siblings: 80% of cases taking 106+ months per USCIS data",
      ],
    },
  
    K1: {
      regular: { min: 6, max: 9 },
      subjectToVisaBulletin: false,
    },
  
    // =========================
    // ADJUSTMENT OF STATUS
    // =========================
    I485: {
      employmentBased: { min: 8, max: 16 },
      familyBased: { min: 12, max: 22 },
      notes: [
        "Employment-based: USCIS waiving interviews for ~72% of EB cases",
        "Family-based: varies significantly by field office",
        "USCIS using Final Action Dates for EB, Dates for Filing for family in May 2026",
      ],
    },

    // =========================
    // EAD / WORK PERMITS
    // =========================
    I765: {
      regular: { min: 4, max: 8 },
      premium: { days: 30 },
      notes: [
        "Standard processing: 4-8 months (slowed from prior year)",
        "Premium processing: $1,780 for 30-day decision (effective March 1, 2026)",
        "EAD validity now 18 months max for most categories (Dec 5, 2025)",
        "Auto-extensions eliminated Oct 30, 2025 — file renewals 6 months early",
        "TPS/parole EADs: 1 year maximum per H.R. 1",
        "H-4 EAD premium processing available standalone: $1,780",
      ],
    },

    // =========================
    // NATURALIZATION
    // =========================
    N400: {
      regular: { min: 8, max: 14 },
      notes: [
        "Processing has improved — currently 8-14 months at most field offices",
        "No premium processing available for N-400",
        "Interview wait varies widely by field office — some cities 12+ months",
        "File up to 90 days before 5-year eligibility date",
      ],
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
      regular: { min: 4, max: 6 },
      premium: { days: 30 },
      notes: [
        "Apply up to 90 days before graduation",
        "Premium processing: $1,780 (effective March 1, 2026)",
        "STEM OPT extension: additional 24 months",
        "Processing has slowed — plan 5-6 months for regular",
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
        "TPS EADs now 1-year maximum per H.R. 1",
      ],
    },
  
    REFUGEE: {
      regular: { minMonths: 18, maxMonths: 24 },
      notes: [
        "EAD validity now 18 months max",
        "Processing times remain slow due to high demand",
      ],
    },
  
    // =========================
    // DOL PROCESSING (for green card timeline)
    // =========================
    DOL_PWD: {
      regular: { min: 3, max: 5 },
      notes: [
        "As of May 2026: Processing OEWS and non-OEWS requests filed Dec 2025–Jan 2026",
        "Improved from ~6 months — currently ~3-5 months",
        "Redeterminations: processing Oct–Nov 2025 filings (~5 months)",
        "New OEWS wage data expected July 2026 for FY2026-2027",
      ],
    },
  
    DOL_PERM: {
      regular: { min: 16, max: 18 },
      notes: [
        "As of May 2026: Adjudicating applications filed Oct 2024",
        "Average processing: 503 days (~17 months) — unchanged",
        "Audit review: processing Jun–Jul 2025 filings (~9-10 months)",
        "Oct 2025 government shutdown backlog still being worked through",
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