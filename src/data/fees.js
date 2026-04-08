// src/data/fees.js
// Verified USCIS fees — March 2026
// Premium processing fees updated effective March 1, 2026
// Base filing fees unchanged from April 2024 fee rule

export const FEES_LAST_UPDATED = "March 20, 2026";
export const FEES_DATA_VERSION = "2026-03-20";

export const FEES = {
  I130: {
    form: "I-130",
    name: "Petition for Alien Relative",
    category: "family",
    description: "Starts family-based immigration process",
    tooltip:
      "Approval confirms a qualifying family relationship but does not grant immigration status.",
    feesUSD: {
      paper: 675,
      online: 625,
    },
  },

  I485: {
    form: "I-485",
    name: "Adjustment of Status",
    category: "green_card",
    description: "Apply for permanent residence from within the U.S.",
    tooltip:
      "This form is only available if you are already in the U.S. and eligible to adjust status.",
    feesUSD: {
      standard: 1440,
      under14WithParent: 950,
    },
  },

  I129: {
    form: "I-129",
    name: "Nonimmigrant Worker Petition",
    category: "work",
    description: "Employer petition for temporary work visas",
    tooltip:
      "Filed by the employer. Final cost depends on company size, visa type, and asylum program fees.",
    feesUSD: {
      standardEmployer: 1015,
      smallEmployerOrNonprofit: 510,
      asylumProgramFee: {
        standard: 600,
        small: 300,
        nonprofit: 0,
      },
    },
  },

  I765: {
    form: "I-765",
    name: "Employment Authorization (EAD)",
    category: "work_authorization",
    description: "Request permission to work in the U.S.",
    tooltip:
      "Some applicants qualify for reduced or $0 fees. EAD validity now 18 months max for AOS/asylum/refugee categories (effective Dec 5, 2025).",
    feesUSD: {
      paper: 520,
      online: 470,
      withPendingI485_afterApr012024: 260,
      asylumApplicants: 0,
    },
  },

  I131: {
    form: "I-131",
    name: "Travel Document",
    category: "travel",
    description: "Advance parole or re-entry permit",
    tooltip:
      "Leaving the U.S. without an approved travel document may cancel certain applications.",
    feesUSD: {
      advanceParole: { paper: 630, online: 580 },
      refugeeTravel: {
        refugees: 0,
        asyleesRange: [135, 165],
      },
      cbpPortEntryFeeEachEntry: 1000,
    },
  },

  N400: {
    form: "N-400",
    name: "Naturalization",
    category: "citizenship",
    description: "Apply for U.S. citizenship",
    tooltip:
      "Reduced fees may apply based on income level or military service.",
    feesUSD: {
      paper: 760,
      online: 710,
      reducedIncome: 380,
      military: 0,
    },
  },

  I539: {
    form: "I-539",
    name: "Extend/Change Nonimmigrant Status",
    category: "status_change",
    description: "Extend stay or change to a different nonimmigrant status",
    tooltip:
      "Used for B→F status changes, extensions of stay, and dependent status changes.",
    feesUSD: {
      paper: 470,
      online: 420,
    },
  },

  I140: {
    form: "I-140",
    name: "Immigrant Petition for Alien Workers",
    category: "green_card",
    description: "Employer petition for employment-based green card",
    tooltip:
      "Filed by employer after PERM approval (EB-2/EB-3) or directly (EB-1). Fee is same regardless of category.",
    feesUSD: {
      standard: 715,
    },
  },

  I589: {
    form: "I-589",
    name: "Application for Asylum",
    category: "protection",
    description: "Asylum and withholding of removal application",
    tooltip:
      "Must be filed within 1 year of arrival in the U.S. No filing fee required.",
    feesUSD: {
      standard: 0,
    },
  },

  // =========================================================
  // PREMIUM PROCESSING (I-907) — Updated March 1, 2026
  // =========================================================
  I907_I129: {
    form: "I-907 (with I-129)",
    name: "Premium Processing — Work Petitions",
    category: "premium",
    description: "Expedited processing for H-1B, L-1, O-1, E-3, TN, P petitions",
    tooltip:
      "USCIS must act within 15 calendar days. Fee increased ~5.7% effective March 1, 2026.",
    feesUSD: {
      standard: 2965,
    },
    previousFee: 2805,
    effectiveDate: "2026-03-01",
    timeframe: "15 calendar days",
  },

  I907_I140: {
    form: "I-907 (with I-140)",
    name: "Premium Processing — Immigrant Petitions",
    category: "premium",
    description: "Expedited processing for EB-1, EB-2, EB-3 immigrant petitions",
    tooltip:
      "15 days for most; 45 days for EB-1C and EB-2 NIW.",
    feesUSD: {
      standard: 2965,
    },
    previousFee: 2805,
    effectiveDate: "2026-03-01",
    timeframe: "15-45 calendar days",
  },

  I907_I539: {
    form: "I-907 (with I-539)",
    name: "Premium Processing — Status Changes",
    category: "premium",
    description: "Expedited processing for F-1, F-2, J-1, J-2 status changes",
    tooltip:
      "30 calendar days for student status changes.",
    feesUSD: {
      standard: 2075,
    },
    previousFee: 1965,
    effectiveDate: "2026-03-01",
    timeframe: "30 calendar days",
  },

  I907_I765: {
    form: "I-907 (with I-765)",
    name: "Premium Processing — EAD",
    category: "premium",
    description: "Expedited processing for OPT, STEM OPT employment authorization",
    tooltip:
      "30 calendar days for OPT/STEM OPT applications.",
    feesUSD: {
      standard: 1780,
    },
    previousFee: 1685,
    effectiveDate: "2026-03-01",
    timeframe: "30 calendar days",
  },

  // =========================================================
  // H-1B SPECIFIC FEES
  // =========================================================
  H1B_REGISTRATION: {
    form: "H-1B Registration",
    name: "H-1B Cap Registration Fee",
    category: "h1b",
    description: "Electronic registration for H-1B cap lottery",
    tooltip:
      "Required for each beneficiary. Non-refundable. FY2027 registration: March 4-19, 2026.",
    feesUSD: {
      standard: 215,
    },
  },

  H1B_FRAUD_PREVENTION: {
    form: "H-1B Fraud Prevention Fee",
    name: "Fraud Prevention and Detection Fee",
    category: "h1b",
    description: "Required with all H-1B and L-1 petitions",
    feesUSD: {
      standard: 500,
    },
  },

  H1B_ACWIA: {
    form: "ACWIA Fee",
    name: "American Competitiveness & Workforce Improvement Act Fee",
    category: "h1b",
    description: "Training fee based on employer size",
    feesUSD: {
      under25Employees: 750,
      over25Employees: 1500,
    },
  },

  H1B_PUBLIC_LAW: {
    form: "Public Law 114-113 Fee",
    name: "50% H-1B/L Dependent Employer Fee",
    category: "h1b",
    description: "For employers with 50+ employees where >50% are H-1B/L workers",
    feesUSD: {
      standard: 4000,
    },
  },

  H1B_PROCLAMATION: {
    form: "Presidential Proclamation Fee",
    name: "$100,000 H-1B Additional Payment",
    category: "h1b",
    description:
      "Required for certain H-1B petitions involving consular processing",
    tooltip:
      "Applies when beneficiary is outside the U.S. or petition approved for consular processing. Generally does NOT apply to F-1→H-1B change of status within the U.S.",
    feesUSD: {
      standard: 100000,
    },
    effectiveDate: "2025-09-21",
    source: "Presidential Proclamation 10973",
  },
};

// =========================================================
// HELPERS
// =========================================================

export function getFormFeeData(formKey) {
  return FEES?.[formKey] ?? null;
}

export function getFee(formKey, pathArray) {
  let cur = FEES?.[formKey];
  if (!cur) return null;

  for (const key of pathArray) {
    cur = cur?.[key];
    if (cur === undefined) return null;
  }
  return cur;
}

/**
 * Calculate total H-1B employer cost
 */
export function calculateH1BTotalCost(options = {}) {
  const {
    employerSize = 26,
    percentH1BL = 30,
    consularProcessing = false,
    premiumProcessing = false,
  } = options;

  let total = 0;
  total += FEES.H1B_REGISTRATION.feesUSD.standard;
  total += FEES.I129.feesUSD.standardEmployer;
  total += FEES.I129.feesUSD.asylumProgramFee.standard;
  total += FEES.H1B_FRAUD_PREVENTION.feesUSD.standard;

  total +=
    employerSize >= 25
      ? FEES.H1B_ACWIA.feesUSD.over25Employees
      : FEES.H1B_ACWIA.feesUSD.under25Employees;

  if (employerSize >= 50 && percentH1BL > 50) {
    total += FEES.H1B_PUBLIC_LAW.feesUSD.standard;
  }

  if (consularProcessing) {
    total += FEES.H1B_PROCLAMATION.feesUSD.standard;
  }

  if (premiumProcessing) {
    total += FEES.I907_I129.feesUSD.standard;
  }

  return total;
}