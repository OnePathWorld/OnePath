// src/data/prevailingWages.js
// Updated: July 13, 2026
// Sources: DOL FLAG (flag.dol.gov/processingtimes, as of June 30, 2026),
//          BLS OEWS, OFLC wage-year releases
//
// 🔴 THE WAGE TABLE BELOW IS FROM AN EXPIRED WAGE YEAR. READ THIS FIRST.
//
// On June 29, 2026 OFLC released updated OEWS prevailing wage data for
// WAGE YEAR 2026-27, effective JULY 1, 2026 through June 30, 2027. The National
// Prevailing Wage Center is issuing determinations off that new data NOW.
//
// Every figure in PREVAILING_WAGES is from the PRIOR wage year (July 2025 –
// June 2026, BLS May 2024 estimates). It is superseded.
//
// The numbers were NOT regenerated, deliberately. The WY2026-27 tables are
// occupation × MSA × level and must come from DOL directly (flag.dol.gov
// wage-search / wage-data downloads). Estimating them would be WORSE than
// leaving them stale: a wrong prevailing wage can lead an employer to underpay
// (an LCA/PERM violation), and under the FY2027 wage-weighted lottery a wrong
// LEVEL assessment directly changes a beneficiary's selection odds. A number
// invented to look current is more dangerous than one honestly marked stale.
//
// WHAT TO DO: gate every wage-facing surface on WAGE_DATA_STATUS.isStale and
// route users to the official calculator. Refresh from flag.dol.gov, then set
// isStale: false and update dataWageYear.
//
// ⚠️ DUPLICATION: WAGE_DETERMINATION_PROCESSING below restates DOL queue data
// that also lives in processingTimes.js. Two sources of truth for the same
// facts — they had already drifted (this file was 4 months staler). Both are
// synced as of 2026-07-13. Prefer processingTimes.js as authoritative; collapse
// this block into it when convenient.

/**
 * Wage-data freshness gate. UI MUST respect isStale.
 */
export const WAGE_DATA_STATUS = {
  isStale: true, // <-- flip to false ONLY after refreshing from flag.dol.gov
  currentWageYear: "July 2026 – June 2027",
  dataWageYear: "July 2025 – June 2026",
  newDataEffective: "July 1, 2026",
  newDataReleased: "June 29, 2026",
  officialCalculator: "https://flag.dol.gov/wage-data/wage-search",
  userWarning:
    "These wage figures are from the previous wage year and are no longer the ones the Department of Labor uses. New prevailing wage data took effect July 1, 2026. Check the official DOL wage search for the current figure before relying on it.",
  // O*NET 30.3 merged Job Zones 1 and 2 into a combined "Job Zone 1-2". OFLC
  // keeps the prior-year Job Zone for occupations that were in Zone 1 or 2 in
  // WY2025-26, and applies Job Zone 2 to Zone 1-2 occupations that were Zone 3.
  jobZoneNote:
    "O*NET 30.3 consolidated Job Zones 1 and 2. OFLC preserves the WY2025-26 Job Zone where one existed.",
};

export const PREVAILING_WAGES_META = {
    lastUpdated: "July 13, 2026",
    source: "Department of Labor FLC Data Center / BLS OEWS",
    wageYear: "July 2025 – June 2026 (EXPIRED — see WAGE_DATA_STATUS)",
    wageDataBasis: "BLS May 2024 Occupational Employment and Wage Statistics",
    dataIsCurrent: false,
    note:
      "⚠️ The wage figures in this file are from an EXPIRED wage year. New OEWS data took effect July 1, 2026 (wage year July 2026 – June 2027). Verify any figure at flag.dol.gov before relying on it. Under the FY2027 H-1B wage-weighted lottery, higher wage levels have significantly better selection odds — so an out-of-date level assessment can mislead.",
  };
  
  /**
   * Prevailing wage levels for H-1B and PERM applications
   * Level 1: Entry level (17th percentile)
   * Level 2: Qualified (34th percentile)
   * Level 3: Experienced (50th percentile)
   * Level 4: Fully competent (67th percentile)
   *
   * NEW CONTEXT: Under the FY2027 wage-weighted H-1B lottery:
   *   Level I  → 1x baseline selection odds
   *   Level II → ~2x baseline
   *   Level III → ~3x baseline
   *   Level IV → Up to 4x baseline
   */
  export const WAGE_LEVELS = {
    1: {
      name: "Entry Level",
      description: "Beginning level, routine tasks, close supervision",
      percentile: 17,
      lotteryOdds: "Lowest — 1x baseline",
    },
    2: {
      name: "Qualified",
      description: "Moderate complexity, limited judgment, some supervision",
      percentile: 34,
      lotteryOdds: "Moderate — ~2x baseline",
    },
    3: {
      name: "Experienced",
      description: "Complex tasks, sound judgment, minimal supervision",
      percentile: 50,
      lotteryOdds: "Good — ~3x baseline",
    },
    4: {
      name: "Expert",
      description: "Leadership role, advanced skills, complex decisions",
      percentile: 67,
      lotteryOdds: "Best — up to 4x baseline",
    },
  };
  
  /**
   * Sample prevailing wages by occupation and location
   * Format: occupation -> location -> level -> wage data
   *
   * Based on July 2025–June 2026 OEWS wage year (May 2024 BLS data).
   * Tech salaries saw notable increases in the 2025-2026 update.
   * Wages shown are approximate and should be verified via the
   * FLC Prevailing Wage Calculator at flcprevailingwage.com
   */
  export const PREVAILING_WAGES = {
    "Software Developer": {
      socCode: "15-1252",
      "Miami-Fort Lauderdale, FL": {
        1: { hourly: 42.5, annual: 88400 },
        2: { hourly: 56.0, annual: 116480 },
        3: { hourly: 69.5, annual: 144560 },
        4: { hourly: 83.0, annual: 172640 },
      },
      "San Francisco Bay Area, CA": {
        1: { hourly: 60.0, annual: 124800 },
        2: { hourly: 76.0, annual: 158080 },
        3: { hourly: 92.0, annual: 191360 },
        4: { hourly: 108.0, annual: 224640 },
      },
      "New York City, NY": {
        1: { hourly: 52.0, annual: 108160 },
        2: { hourly: 67.0, annual: 139360 },
        3: { hourly: 82.0, annual: 170560 },
        4: { hourly: 97.0, annual: 201760 },
      },
      "Austin, TX": {
        1: { hourly: 46.0, annual: 95680 },
        2: { hourly: 60.0, annual: 124800 },
        3: { hourly: 74.0, annual: 153920 },
        4: { hourly: 88.0, annual: 183040 },
      },
      "Seattle, WA": {
        1: { hourly: 58.0, annual: 120640 },
        2: { hourly: 74.0, annual: 153920 },
        3: { hourly: 90.0, annual: 187200 },
        4: { hourly: 106.0, annual: 220480 },
      },
    },
    "Financial Analyst": {
      socCode: "13-2051",
      "New York City, NY": {
        1: { hourly: 40.0, annual: 83200 },
        2: { hourly: 51.0, annual: 106080 },
        3: { hourly: 62.0, annual: 128960 },
        4: { hourly: 73.0, annual: 151840 },
      },
      "Chicago, IL": {
        1: { hourly: 36.0, annual: 74880 },
        2: { hourly: 46.0, annual: 95680 },
        3: { hourly: 56.0, annual: 116480 },
        4: { hourly: 66.0, annual: 137280 },
      },
    },
    "Mechanical Engineer": {
      socCode: "17-2141",
      "Detroit, MI": {
        1: { hourly: 37.5, annual: 78000 },
        2: { hourly: 47.0, annual: 97760 },
        3: { hourly: 56.5, annual: 117520 },
        4: { hourly: 66.0, annual: 137280 },
      },
      "Houston, TX": {
        1: { hourly: 40.5, annual: 84240 },
        2: { hourly: 51.0, annual: 106080 },
        3: { hourly: 61.5, annual: 127920 },
        4: { hourly: 72.0, annual: 149760 },
      },
    },
    "Marketing Manager": {
      socCode: "11-2021",
      "Los Angeles, CA": {
        1: { hourly: 44.0, annual: 91520 },
        2: { hourly: 57.0, annual: 118560 },
        3: { hourly: 70.0, annual: 145600 },
        4: { hourly: 83.0, annual: 172640 },
      },
    },
    "Registered Nurse": {
      socCode: "29-1141",
      "National Average": {
        1: { hourly: 32.0, annual: 66560 },
        2: { hourly: 39.5, annual: 82160 },
        3: { hourly: 47.0, annual: 97760 },
        4: { hourly: 54.5, annual: 113360 },
      },
    },
    "Data Scientist": {
      socCode: "15-2051",
      "San Francisco Bay Area, CA": {
        1: { hourly: 62.0, annual: 128960 },
        2: { hourly: 79.0, annual: 164320 },
        3: { hourly: 96.0, annual: 199680 },
        4: { hourly: 113.0, annual: 235040 },
      },
      "New York City, NY": {
        1: { hourly: 54.0, annual: 112320 },
        2: { hourly: 69.0, annual: 143520 },
        3: { hourly: 84.0, annual: 174720 },
        4: { hourly: 99.0, annual: 205920 },
      },
    },
  };
  
  /**
   * DOL Processing times for wage determinations and PERM
   * Updated: July 13, 2026 — flag.dol.gov/processingtimes (data as of June 30, 2026)
   *
   * ⚠️ DUPLICATE SOURCE OF TRUTH. These same facts live in processingTimes.js
   * (DOL_PWD / DOL_PERM / EB.perm). They had already drifted — this copy was
   * four months staler and still said PERM was at Oct 2024 filings when DOL had
   * moved to June 2025. Both are now synced. processingTimes.js is authoritative;
   * fold this block into it when convenient rather than maintaining two.
   */
  export const WAGE_DETERMINATION_PROCESSING = {
    PWD: {
      OEWS: {
        processing: "April 2026 filings",
        estimatedWait: "~3 months",
        note: "NPWC issuing OEWS-based PWDs for H-1B and PERM requests filed April 2026 (as of June 30, 2026).",
      },
      nonOEWS: {
        processing: "March 2026 filings",
        estimatedWait: "~4 months",
        note: "Non-OEWS includes private wage surveys and CBAs.",
      },
      redetermination: {
        processing: "February 2026 filings",
        estimatedWait: "~5 months",
        note: "Reconsideration appeals filed February 2026 and earlier under review.",
      },
      lastUpdated: "June 30, 2026",
      source: "DOL FLAG system (flag.dol.gov/processingtimes)",
    },
    PERM: {
      analystReview: {
        processing: "June 2025 filings",
        // Was "~17 months (503 days average)". DOL's queue advanced ~8 months
        // (Oct 2024 -> June 2025) and PERM has IMPROVED. Sources now disagree on
        // the average (~403 days vs ~17 months), so state a range, not a number.
        estimatedWait: "~13-17 months (sources vary; treat as a range)",
        note: "DOL adjudicating PERM applications filed June 2025 or earlier (as of June 30, 2026).",
      },
      auditReview: {
        processing: "Audited cases sit in a separate, slower queue",
        estimatedWait: "Varies — substantially longer than analyst review",
        note: "Verify the current audit queue at flag.dol.gov.",
      },
      reconsideration: {
        processing: "February 2026 filings",
        estimatedWait: "~5 months",
      },
      lastUpdated: "June 30, 2026",
      note:
        "End-to-end standard PERM (PWD + recruitment + ETA-9089) is running ~18-22 months, improved from 22-26 months earlier in 2026.",
    },
    // Legacy format for backward compatibility
    H1B: {
      OEWS: "~3 months",
      nonOEWS: "~4 months",
      currentlyProcessing: "April 2026",
    },
    lastUpdated: "July 13, 2026",
  };
  
  /**
   * Total green card timeline estimates (PWD + PERM + I-140 + I-485)
   *
   * ⚠️ Third copy of the India priority-date claim (see also processingTimes.js
   * getGreenCardTimeline and visaBulletin.js). Keep them in step.
   *
   * "Unavailable" is NOT a long wait — it is a different thing. Per the July
   * 2026 Visa Bulletin, India EB-2 and India EB-5 Unreserved are "U" for the
   * remainder of FY2026: the pro-rated annual limit was reached, so NO visas
   * are issued in those categories this fiscal year regardless of priority
   * date. A "12+ years" figure implies a moving queue. EB-2 India is not moving.
   * DOS expects advancement in October (FY2027) — an expectation, not a date.
   */
  export const GREEN_CARD_TIMELINE_ESTIMATES = {
    nonBacklogCountry: {
      pwd: "3 months",
      recruitment: "2-3 months",
      perm: "13-17 months", // was "17 months" — DOL queue moved; PERM improved
      i140: "6-12 months (or 15 days premium)",
      i485: "10-12 months",
      total: "~3-4 years",
    },
    india: {
      pwd: "3 months",
      recruitment: "2-3 months",
      perm: "13-17 months",
      i140: "6-12 months",
      eb2Unavailable: true, // gate the UI on this — do not render a year figure
      priorityDateWait:
        "EB-2: Unavailable — no visas issued for the remainder of FY2026 (may advance in October). EB-3: 12+ years.",
      i485: "10-12 months",
      total: "EB-2 cannot complete this fiscal year; EB-3 15+ years",
    },
    china: {
      pwd: "3 months",
      recruitment: "2-3 months",
      perm: "13-17 months",
      i140: "6-12 months",
      eb2Unavailable: false,
      priorityDateWait: "4+ years (EB-2) / 5+ years (EB-3)",
      i485: "10-12 months",
      total: "7+ years",
      note: "DOS has warned China EB-2 may retrogress or become Unavailable in coming months.",
    },
  };
  
  /**
   * Helper: Check if salary meets prevailing wage for a given level
   *
   * ⚠️ Returns `stale: true` while WAGE_DATA_STATUS.isStale is set (it is —
   * the wage year rolled over July 1, 2026). Callers MUST surface `warning`
   * alongside any figure. Consumed by ResourcesScreen's wage checker.
   *
   * The result is still returned rather than nulled, because a stale figure
   * with an honest warning is more useful than nothing — but it must never be
   * presented as the operative prevailing wage.
   */
  export function meetsWageRequirement(
    offeredSalary,
    occupation,
    location,
    level = 1
  ) {
    const wageData = PREVAILING_WAGES[occupation]?.[location]?.[level];
    if (!wageData) return null;
  
    return {
      meets: offeredSalary >= wageData.annual,
      required: wageData.annual,
      difference: offeredSalary - wageData.annual,
      level: WAGE_LEVELS[level].name,
      lotteryContext: WAGE_LEVELS[level].lotteryOdds,
      // Freshness contract — do not drop these on the floor.
      stale: WAGE_DATA_STATUS.isStale,
      wageYear: PREVAILING_WAGES_META.wageYear,
      warning: WAGE_DATA_STATUS.isStale ? WAGE_DATA_STATUS.userWarning : null,
      officialSource: WAGE_DATA_STATUS.officialCalculator,
    };
  }
  
  /**
   * Helper: Get all wage levels for an occupation and location
   */
  export function getWageLevels(occupation, location) {
    return PREVAILING_WAGES[occupation]?.[location] || null;
  }
  
  /**
   * Helper: Determine appropriate wage level based on job requirements
   */
  export function determineWageLevel(requirements) {
    const {
      yearsExperience = 0,
      requiresSupervision = true,
      hasLeadershipRole = false,
      complexityLevel = "routine",
    } = requirements;
  
    if (hasLeadershipRole || yearsExperience >= 7) return 4;
    if (yearsExperience >= 4 || complexityLevel === "complex") return 3;
    if (yearsExperience >= 2 || !requiresSupervision) return 2;
    return 1;
  }
  
  /**
   * Helper: Get lottery odds context for a wage level
   */
  export function getLotteryContext(level) {
    const contexts = {
      1: {
        odds: "Lowest",
        advice:
          "Entry-level wages face significantly reduced selection odds under the weighted lottery. Consider whether the role can justify a higher wage level.",
      },
      2: {
        odds: "Moderate",
        advice:
          "Qualified-level wages offer better odds than entry-level. Ensure the offered wage is at or above Level II for the SOC code and location.",
      },
      3: {
        odds: "Good",
        advice:
          "Experienced-level wages receive favorable weighting. This is a strong position for lottery selection.",
      },
      4: {
        odds: "Best",
        advice:
          "Expert-level wages receive the highest weighting (up to 4x). Best possible lottery position.",
      },
    };
    return contexts[level] || contexts[1];
  }
  
  /**
   * Helper: Get list of available occupations
   */
  export function getAvailableOccupations() {
    return Object.keys(PREVAILING_WAGES).filter((k) => k !== "undefined");
  }
  
  /**
   * Helper: Get list of available locations for an occupation
   */
  export function getAvailableLocations(occupation) {
    const data = PREVAILING_WAGES[occupation];
    if (!data) return [];
    return Object.keys(data).filter((k) => k !== "socCode");
  }
  
  export default {
    WAGE_LEVELS,
    PREVAILING_WAGES,
    WAGE_DATA_STATUS,
    WAGE_DETERMINATION_PROCESSING,
    GREEN_CARD_TIMELINE_ESTIMATES,
    PREVAILING_WAGES_META,
    meetsWageRequirement,
    getWageLevels,
    determineWageLevel,
    getLotteryContext,
    getAvailableOccupations,
    getAvailableLocations,
  };