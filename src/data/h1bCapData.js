// src/data/h1bCapData.js
// Updated: March 19, 2026 — Verified against USCIS.gov

export const H1B_CAP_META = {
    lastUpdated: "April 3, 2026",
    source: "USCIS.gov H-1B Specialty Occupations & H-1B Cap Season",
    criticalUpdate:
  "FY2027 lottery selections announced March 27-31. Filing window open April 1 – June 30. Estimated 34-42% selection rate. Wage-weighted system favored Level III-IV positions.",
  };
  
  /**
   * Current Fiscal Year Status
   */
  export const CURRENT_CAP_STATUS = {
    fiscalYear: "2027",
    regularCap: {
        limit: 65000,
        status: "SELECTION_COMPLETE",
        note: "FY2027 initial selection complete. Filing window: April 1 – June 30, 2026.",
      },
      mastersCap: {
        limit: 20000,
        status: "SELECTION_COMPLETE",
        note: "Selection notifications sent March 27-31, 2026. Second round possible if cap not met.",
      },
    currentRegistration: {
      fiscalYear: "2027",
      registrationOpens: "March 4, 2026 (noon ET)",
      registrationCloses: "March 19, 2026 (5:00 PM ET)",
      selectionNotifications: "By March 31, 2026",
      filingWindowStart: "April 1, 2026",
      filingWindowEnd: "June 30, 2026",
      employmentStartDate: "October 1, 2026",
    },
    priorYear: {
      fiscalYear: "2026",
      regularCap: { limit: 65000, status: "REACHED" },
      mastersCap: { limit: 20000, status: "REACHED" },
      uniqueBeneficiaries: 339000,
      uniqueEmployers: 57600,
    },
  };
  
  /**
   * H-1B Registration Process
   */
  export const REGISTRATION_PROCESS = {
    registrationFee: 215, // Updated from $10 — now $215 per registration
    filingFee: {
      base: 1015, // Standard employer (I-129)
      smallEmployerNonprofit: 510, // Small employer / nonprofit
      asylumProgramFee: {
        standard: 600,
        small: 300,
        nonprofit: 0,
      },
      publicLaw114_113: 4000, // For 50+ employees with >50% H-1B/L
      fraudPrevention: 500,
      americanCompetitiveness: {
        under25Employees: 750,
        over25Employees: 1500,
      },
    },
    premiumProcessing: {
      fee: 2965, // Updated from $2,805 — effective March 1, 2026
      previousFee: 2805,
      effectiveDate: "March 1, 2026",
      timeframe: "15 calendar days",
    },
    timeline: {
      registration: "March 4–19, 2026",
      selection: "By March 31, 2026",
      filingWindow: "April 1 – June 30, 2026 (selected only)",
      startDate: "October 1, 2026",
    },
  };
  
  /**
   * NEW: Weighted Selection Process (FY2027 — First year in effect)
   * Final Rule effective February 27, 2026
   */
  export const WEIGHTED_SELECTION = {
    effectiveDate: "February 27, 2026",
    appliesTo: "FY2027 H-1B cap registration season and beyond",
    description:
      "USCIS will use a wage-weighted selection process that favors higher-skilled and higher-paid workers. Higher wage levels receive greater selection probability.",
    wageLevelWeighting: {
      level1: {
        name: "Entry Level (OEWS Level I)",
        description: "Lowest selection probability",
        multiplier: "1x (baseline)",
      },
      level2: {
        name: "Qualified (OEWS Level II)",
        description: "Moderate selection probability",
        multiplier: "~2x baseline",
      },
      level3: {
        name: "Experienced (OEWS Level III)",
        description: "Higher selection probability",
        multiplier: "~3x baseline",
      },
      level4: {
        name: "Expert (OEWS Level IV)",
        description: "Highest selection probability",
        multiplier: "Up to 4x baseline",
      },
    },
    keyRequirements: [
      "Registration must include SOC code and OEWS wage level",
      "Offered salary must be at or above the OEWS wage level selected",
      "Evidence of wage level basis must be submitted with petition if selected",
      "USCIS verifies identity through passport/travel document to ensure one chance per beneficiary",
    ],
    impact:
      "Entry-level and lower-paid positions face significantly reduced odds of selection compared to prior random lottery system.",
  };
  
  /**
   * Presidential Proclamation 10973 — $100K Fee
   */
  export const PRESIDENTIAL_PROCLAMATION = {
    proclamationNumber: "10973",
    title: "Restriction on Entry of Certain Nonimmigrant Workers",
    issuedDate: "September 19, 2025",
    effectiveDate: "September 21, 2025",
    additionalFee: 100000,
    // IMPORTANT CLARIFICATION: Does not apply to all H-1B petitions
    applicability: {
      applies: [
        "Beneficiary is located outside the U.S. at time of filing",
        "Petition is approved for consular processing (not change of status)",
        "USCIS determines beneficiary is not eligible to change status in the U.S.",
      ],
      generallyDoesNotApply: [
        "Beneficiary is already in the U.S. and eligible for change of status",
        "Many F-1 students transitioning to H-1B (cap-gap eligible)",
        "Individuals in valid nonimmigrant status requesting change of status",
      ],
      exemptions:
        "Extraordinarily rare national-interest circumstances. Requests must be submitted to [email protected] with compelling evidence. Routine business needs do not qualify.",
    },
    warning:
      "This fee is IN ADDITION to all regular filing fees. Budget accordingly.",
    totalCostExample: {
      description: "Typical employer (26+ employees), consular processing",
      registration: 215,
      baseFiling: 1015,
      fraudPrevention: 500,
      competitiveness: 1500,
      proclamationFee: 100000,
      premiumProcessing: 2965,
      total: 106195,
    },
  };
  
  /**
   * Historical Lottery Statistics
   */
  export const LOTTERY_STATISTICS = {
    FY2026: {
      registrations: "~339,000 unique beneficiaries",
      uniqueEmployers: "~57,600",
      selected: "TBD",
      selectionMethod: "Beneficiary-centric (random)",
      note: "Significant decrease from FY2025 due to anti-fraud measures",
    },
    FY2025: {
      registrations: "~442,000 unique beneficiaries",
      uniqueEmployers: "~52,700",
      selected: "~120,000",
      odds: "~25%",
      selectionMethod: "Beneficiary-centric (random)",
      multipleRegistrations: "Prohibited — fraud detection enhanced",
    },
    FY2024: {
      registrations: "~780,000",
      selected: "~110,000",
      odds: "~14%",
      note: "High volume before beneficiary-centric rule took effect",
    },
    FY2023: {
      registrations: "~483,000",
      selected: "~127,600",
      odds: "~26%",
    },
    FY2027: {
      selectionMethod: "Wage-weighted (first year)",
      note: "Odds will vary based on wage level offered. Higher wages = higher odds.",
    },
    trends: {
      directionNote: "Demand consistently exceeds supply. Weighted lottery shifts advantage to higher-paid positions.",
    },
  };
  
  /**
   * Cap-Exempt Categories (Not subject to lottery)
   */
  export const CAP_EXEMPT = {
    categories: [
      {
        type: "Higher Education Institution",
        description: "Universities and affiliated nonprofits",
        requirements: "Primary purpose must be education",
      },
      {
        type: "Nonprofit Research Organization",
        description: "Research as primary mission",
        requirements: "IRS 501(c)(3) status required",
      },
      {
        type: "Government Research Organization",
        description: "Federal, state, or local government research",
        requirements: "Direct government entity",
      },
    ],
    benefits: [
      "No lottery required",
      "Can file year-round",
      "Can start work immediately upon approval",
      "No October 1 wait",
    ],
    warning: "Moving to cap-subject employer requires new lottery selection",
  };
  
  /**
   * Important H-1B Requirements
   */
  export const H1B_REQUIREMENTS = {
    position: {
      specialtyOccupation: true,
      bachelorsDegreeMinimum: true,
      prevailingWage: "Must meet or exceed",
      LCA: "Required before filing",
    },
    beneficiary: {
      education: "Bachelor's degree or equivalent",
      degreeField: "Related to position",
      equivalency: "3 years experience = 1 year education",
    },
    employer: {
      employerEmployeeRelationship: true,
      abilityToPay: "Demonstrated through financial docs",
      worksite: "Must have actual work location",
    },
  };
  
  /**
   * Timeline for Selected Petitions
   */
  export const SELECTED_TIMELINE = {
    1: { action: "Selection notification", days: "By March 31, 2026" },
    2: { action: "Prepare petition documents", days: "1-30 days" },
    3: { action: "File I-129 with USCIS", days: "April 1 – June 30, 2026" },
    4: { action: "USCIS processing (regular)", days: "120-240 days" },
    5: { action: "Premium processing (optional)", days: "15 calendar days" },
    6: { action: "RFE response (if issued)", days: "87 days to respond" },
    7: { action: "Approval notice", days: "Varies" },
    8: { action: "Visa stamping (if abroad)", days: "30-60 days" },
    9: { action: "Begin employment", days: "October 1, 2026 or after approval" },
  };
  
  /**
   * Common RFE Topics
   */
  export const COMMON_RFE_TOPICS = [
    "Specialty occupation qualification",
    "Employer-employee relationship",
    "Availability of work at third-party sites",
    "Beneficiary qualifications",
    "Maintenance of status",
    "Level 1 wage justification (especially important under weighted selection)",
  ];
  
  /**
   * Calculate total H-1B cost
   */
  export function calculateH1BCost(options = {}) {
    const {
      companySize = 26,
      percentageOnH1BOrL = 30,
      requiresConsularProcessing = false,
      premiumProcessing = false,
    } = options;
  
    let total = REGISTRATION_PROCESS.registrationFee;
    total += REGISTRATION_PROCESS.filingFee.base;
    total += REGISTRATION_PROCESS.filingFee.fraudPrevention;
  
    // American Competitiveness fee
    if (companySize >= 25) {
      total +=
        REGISTRATION_PROCESS.filingFee.americanCompetitiveness.over25Employees;
    } else {
      total +=
        REGISTRATION_PROCESS.filingFee.americanCompetitiveness.under25Employees;
    }
  
    // Public Law 114-113 fee
    if (companySize >= 50 && percentageOnH1BOrL > 50) {
      total += REGISTRATION_PROCESS.filingFee.publicLaw114_113;
    }
  
    // Presidential Proclamation fee (consular processing)
    if (requiresConsularProcessing) {
      total += PRESIDENTIAL_PROCLAMATION.additionalFee;
    }
  
    // Premium processing
    if (premiumProcessing) {
      total += REGISTRATION_PROCESS.premiumProcessing.fee;
    }
  
    return {
      total,
      includesProclamationFee: requiresConsularProcessing,
      breakdown: {
        registration: REGISTRATION_PROCESS.registrationFee,
        filing: REGISTRATION_PROCESS.filingFee.base,
        fraudPrevention: REGISTRATION_PROCESS.filingFee.fraudPrevention,
        competitiveness:
          companySize >= 25
            ? REGISTRATION_PROCESS.filingFee.americanCompetitiveness
                .over25Employees
            : REGISTRATION_PROCESS.filingFee.americanCompetitiveness
                .under25Employees,
        publicLaw:
          companySize >= 50 && percentageOnH1BOrL > 50
            ? REGISTRATION_PROCESS.filingFee.publicLaw114_113
            : 0,
        presidentialFee: requiresConsularProcessing
          ? PRESIDENTIAL_PROCLAMATION.additionalFee
          : 0,
        premium: premiumProcessing
          ? REGISTRATION_PROCESS.premiumProcessing.fee
          : 0,
      },
    };
  }
  
  /**
   * Calculate lottery odds hint based on wage level
   */
  export function getLotteryOddsHint(wageLevel = 1, hasUSMasters = false) {
    const hints = {
      1: "Lower odds under weighted system. Entry-level positions face the most competition.",
      2: "Moderate odds. Qualified-level wages offer better chances than entry-level.",
      3: "Good odds. Experienced-level wages receive favorable weighting.",
      4: "Best odds. Expert-level wages receive the highest weighting (up to 4x).",
    };
  
    return {
      hint: hints[wageLevel] || hints[1],
      mastersAdvantage: hasUSMasters
        ? "Additional chance in U.S. master's cap pool."
        : "Regular cap only.",
      note: "Exact selection probabilities depend on total registrations received and wage distribution across all registrants.",
    };
  }
  
  /**
   * Check if currently in filing or registration window
   */
  export function getCapSeasonStatus() {
    const today = new Date();
    const regOpen = new Date("2026-03-04T12:00:00-05:00");
    const regClose = new Date("2026-03-19T17:00:00-04:00");
    const fileOpen = new Date("2026-04-01");
    const fileClose = new Date("2026-06-30");
  
    if (today >= regOpen && today <= regClose) {
      return {
        phase: "REGISTRATION_OPEN",
        message: "FY2027 H-1B registration is currently OPEN. Closes March 19.",
      };
    }
    if (today > regClose && today < fileOpen) {
      return {
        phase: "AWAITING_SELECTION",
        message: "Registration closed. Selection results expected by March 31.",
      };
    }
    if (today >= fileOpen && today <= fileClose) {
      return {
        phase: "FILING_WINDOW_OPEN",
        message: "FY2027 filing window is open for selected registrations.",
      };
    }
    return {
      phase: "OFF_SEASON",
      message: "FY2027 registration and filing windows have closed.",
    };
  }
  
  export default {
    CURRENT_CAP_STATUS,
    REGISTRATION_PROCESS,
    WEIGHTED_SELECTION,
    PRESIDENTIAL_PROCLAMATION,
    LOTTERY_STATISTICS,
    CAP_EXEMPT,
    H1B_REQUIREMENTS,
    SELECTED_TIMELINE,
    COMMON_RFE_TOPICS,
    H1B_CAP_META,
    calculateH1BCost,
    getLotteryOddsHint,
    getCapSeasonStatus,
  };