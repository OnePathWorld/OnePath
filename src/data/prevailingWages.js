// src/data/prevailingWages.js
// Updated: March 20, 2026
// Sources: DOL FLAG system (March 5, 2026), BLS OEWS May 2024 estimates,
//          OFLC July 2025–June 2026 wage year data

export const PREVAILING_WAGES_META = {
    lastUpdated: "March 20, 2026",
    source: "Department of Labor FLC Data Center / BLS OEWS",
    wageYear: "July 2025 – June 2026",
    wageDataBasis: "BLS May 2024 Occupational Employment and Wage Statistics",
    note:
      "Wages vary by location and SOC code. Examples shown for major metro areas. New OEWS data is released around July 1 each year. Under the FY2027 H-1B wage-weighted lottery, higher wage levels have significantly better selection odds.",
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
   * Updated: March 5, 2026 (DOL FLAG system)
   */
  export const WAGE_DETERMINATION_PROCESSING = {
    PWD: {
      OEWS: {
        processing: "December 2025 filings",
        estimatedWait: "~3 months",
        note: "Improved from ~6 months. Processing PERM and H-1B OEWS requests filed Dec 2025.",
      },
      nonOEWS: {
        processing: "December 2025 filings",
        estimatedWait: "~3 months",
        note: "Non-OEWS includes private wage surveys and CBAs.",
      },
      redetermination: {
        processing: "October 2025 filings",
        estimatedWait: "~5 months",
      },
      lastUpdated: "March 5, 2026",
      source: "DOL FLAG system",
    },
    PERM: {
      analystReview: {
        processing: "October 2024 filings",
        estimatedWait: "~17 months (503 days average)",
        note: "DOL adjudicating PERM applications filed Oct 2024 or earlier.",
      },
      auditReview: {
        processing: "June 2025 filings",
        estimatedWait: "~9 months",
        note: "Audited cases filed Jun 2025 or earlier under review.",
      },
      reconsideration: {
        processing: "September 2025 filings",
        estimatedWait: "~6 months",
      },
      lastUpdated: "March 5, 2026",
      governmentShutdownNote:
        "DOL was closed Oct 1–30, 2025 due to federal government shutdown. Accumulated backlogs are still being worked through.",
    },
    // Legacy format for backward compatibility
    H1B: {
      OEWS: "~3 months",
      nonOEWS: "~3 months",
      currentlyProcessing: "December 2025",
    },
    lastUpdated: "March 2026",
  };
  
  /**
   * Total green card timeline estimates (PWD + PERM + I-140 + I-485)
   */
  export const GREEN_CARD_TIMELINE_ESTIMATES = {
    nonBacklogCountry: {
      pwd: "3 months",
      recruitment: "2-3 months",
      perm: "17 months",
      i140: "6-12 months (or 15 days premium)",
      i485: "10-12 months",
      total: "~3-4 years",
    },
    india: {
      pwd: "3 months",
      recruitment: "2-3 months",
      perm: "17 months",
      i140: "6-12 months",
      priorityDateWait: "12+ years (EB-2) / 12+ years (EB-3)",
      i485: "10-12 months",
      total: "15+ years",
    },
    china: {
      pwd: "3 months",
      recruitment: "2-3 months",
      perm: "17 months",
      i140: "6-12 months",
      priorityDateWait: "4+ years (EB-2) / 5+ years (EB-3)",
      i485: "10-12 months",
      total: "7+ years",
    },
  };
  
  /**
   * Helper: Check if salary meets prevailing wage for a given level
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