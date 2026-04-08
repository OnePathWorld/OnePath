// src/data/pathwayViability.js
// Created: March 2026
// Purpose: Provides current viability assessments for each immigration pathway
// Update this file whenever policy or conditions change materially.

export const VIABILITY_META = {
    lastUpdated: "March 2026",
    disclaimer:
      "Viability assessments are general guidance based on current policy and processing conditions. Individual circumstances vary. Consult an immigration attorney for personalized advice.",
  };
  
  /**
   * Viability Levels
   */
  export const VIABILITY_LEVELS = {
    HIGH: {
      key: "HIGH",
      label: "High Viability",
      color: "#2E7D32", // green
      bgColor: "#E8F5E9",
      description: "Structurally stable path with predictable process",
    },
    CONDITIONAL: {
      key: "CONDITIONAL",
      label: "Conditional",
      color: "#F57F17", // amber
      bgColor: "#FFF8E1",
      description: "Viable for the right candidate, but narrower or competitive",
    },
    LOWER: {
      key: "LOWER",
      label: "Lower / Volatile",
      color: "#C62828", // red
      bgColor: "#FFEBEE",
      description: "Significant barriers, long waits, or policy uncertainty",
    },
  };
  
  /**
   * Pathway Viability Assessments
   */
  export const PATHWAY_VIABILITY = {
    // ---------------------------------------------------------
    // WORK-BASED
    // ---------------------------------------------------------
    H1B: {
      viability: "LOWER",
      shortReason: "Cap competition is high. New weighted lottery favors higher wages.",
      details: [
        "FY2027 introduces wage-weighted selection — entry-level positions face reduced odds.",
        "$100,000 additional fee for certain consular-processing petitions.",
        "Registration fee increased to $215. Premium processing now $2,965.",
        "Demand consistently exceeds the 85,000 annual cap by 4–8x.",
      ],
      recommendation:
        "Best for candidates offered wages at OEWS Level III or IV. Consider O-1 or L-1 alternatives if eligible.",
      updatedDate: "March 2026",
    },
  
    L1: {
      viability: "CONDITIONAL",
      shortReason: "Not cap-subject. Good for qualifying multinational employees.",
      details: [
        "Not subject to the H-1B annual cap or lottery.",
        "Requires 1 year of employment with qualifying multinational company.",
        "Narrower eligibility, but avoids the cap-season bottleneck.",
        "Can file year-round.",
      ],
      recommendation:
        "High viability for the right candidate. If you've worked for a multinational for 1+ year, this may be stronger than H-1B.",
      updatedDate: "March 2026",
    },
  
    O1: {
      viability: "CONDITIONAL",
      shortReason: "No cap, but requires extraordinary ability evidence.",
      details: [
        "Not subject to annual cap — can file any time.",
        "Requires documented extraordinary ability or achievement.",
        "Strategically attractive for founders, researchers, creatives, athletes.",
        "Harder to qualify for, but more predictable than H-1B if eligible.",
      ],
      recommendation:
        "If you have awards, publications, media coverage, or high salary evidence, explore this before H-1B.",
      updatedDate: "March 2026",
    },
  
    // ---------------------------------------------------------
    // FAMILY-BASED
    // ---------------------------------------------------------
    IMMEDIATE_RELATIVE: {
      viability: "HIGH",
      shortReason: "Strongest family path. Not subject to preference backlog system.",
      details: [
        "Immediate relatives of U.S. citizens are not constrained by per-country limits.",
        "Includes spouses, unmarried children under 21, and parents of adult citizens.",
        "Processing times are measured in months, not years (unlike preference categories).",
        "Structurally stable and well-documented process.",
      ],
      recommendation:
        "If you qualify as an immediate relative, this is one of the most reliable paths available.",
      updatedDate: "March 2026",
    },
  
    FAMILY_PREFERENCE: {
      viability: "LOWER",
      shortReason: "Backlogs of 5–20+ years depending on category and country.",
      details: [
        "F1, F2B, F3, F4 categories all face multi-year waits.",
        "Mexico and Philippines face the longest backlogs (some 20+ years).",
        "Presidential Proclamations have further impacted issuance rates for certain nationalities.",
        "Retrogression is possible later in FY2026.",
      ],
      recommendation:
        "File early to establish a priority date, but plan for a long wait. Consider whether other pathways are available in parallel.",
      updatedDate: "March 2026",
    },
  
    // ---------------------------------------------------------
    // STUDENT
    // ---------------------------------------------------------
    F1_STUDENT: {
      viability: "HIGH",
      shortReason: "Stable entry path. OPT/STEM OPT provide a work bridge.",
      details: [
        "F-1 status, OPT, and 24-month STEM OPT extension remain active and structurally intact.",
        "Not a direct immigrant path, but a realistic 'enter, study, work, then transition' route.",
        "Embassy wait times for F-1 are generally shorter than other visa types.",
        "SEVIS fee: $350 for F-1 students.",
      ],
      recommendation:
        "One of the most practical entry paths for younger applicants. Plan your STEM major carefully for the 36-month OPT window.",
      updatedDate: "March 2026",
    },
  
    // ---------------------------------------------------------
    // EMPLOYMENT-BASED GREEN CARD
    // ---------------------------------------------------------
    EB_GENERAL: {
      viability: "CONDITIONAL",
      shortReason: "Viable for most countries, but India/China face severe backlogs.",
      details: [
        "Rest-of-world EB-2 and EB-3 are relatively current or have short waits.",
        "India EB-2: final action date Sep 15, 2013 (12+ year backlog).",
        "China EB-2: final action date Sep 1, 2021 (4+ year backlog).",
        "Per-country limits create massive disparities in wait times.",
      ],
      recommendation:
        "For non-backlogged countries, this is a strong path. For India/China, plan for a very long wait and explore alternatives like EB-1 or NIW.",
      updatedDate: "March 2026",
    },
  
    // ---------------------------------------------------------
    // ASYLUM / PROTECTION
    // ---------------------------------------------------------
    ASYLUM: {
      viability: "LOWER",
      shortReason: "Policy environment is volatile. Enhanced screening in effect.",
      details: [
        "Active policy changes including proposed rules for stronger screening.",
        "EAD validity for asylum applicants reduced to 18 months.",
        "Automatic EAD extensions eliminated (effective Oct 30, 2025).",
        "Should not be treated as a stable 'strategy' — it's a protection pathway for those in genuine need.",
      ],
      recommendation:
        "If you have a legitimate fear of persecution, seek legal counsel immediately. Do not rely on asylum as a planned immigration strategy.",
      updatedDate: "March 2026",
    },
  
    // ---------------------------------------------------------
    // CONSULAR PROCESSING (NVC)
    // ---------------------------------------------------------
    CONSULAR_PROCESSING: {
      viability: "HIGH",
      shortReason: "Trackable process through NVC for qualifying family relationships.",
      details: [
        "State Department's NVC and IV scheduling tools make this path more trackable.",
        "Structurally stable for immediate relatives and qualifying family/employment cases.",
        "Can be slow, but the pipeline is visible through official tools.",
        "Presidential Proclamations have impacted processing for certain nationalities.",
      ],
      recommendation:
        "If abroad with a qualifying petition approved, this is a well-documented and trackable path.",
      updatedDate: "March 2026",
    },
  };
  
  /**
   * Helper: Get viability info for a pathway
   */
  export function getViability(pathwayKey) {
    const assessment = PATHWAY_VIABILITY[pathwayKey];
    if (!assessment) return null;
  
    const level = VIABILITY_LEVELS[assessment.viability];
    return {
      ...assessment,
      level,
    };
  }
  
  /**
   * Helper: Map pathway IDs from app to viability keys
   */
  export const PATHWAY_TO_VIABILITY_MAP = {
    work: ["H1B", "L1", "O1"],
    family: ["IMMEDIATE_RELATIVE", "FAMILY_PREFERENCE"],
    student: ["F1_STUDENT"],
    protection: ["ASYLUM"],
  };
  
  export default {
    VIABILITY_META,
    VIABILITY_LEVELS,
    PATHWAY_VIABILITY,
    getViability,
    PATHWAY_TO_VIABILITY_MAP,
  };