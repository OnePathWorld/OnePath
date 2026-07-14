// src/data/sevisData.js
// Updated: July 13, 2026 — verified against ICE.gov/SEVIS, fmjfee.com, USCIS.
//
// ⚠️ WATCH ITEM — "Duration of Status" (D/S) final rule is IMMINENT but NOT YET
//    IN EFFECT. Timeline: NPRM published Aug 28, 2025 (90 FR 42070, RIN 1653-AA95)
//    → final rule sent to OMB May 5, 2026 → OIRA completed review June 17, 2026
//    ("consistent with change") → NOT yet published in the Federal Register.
//    It takes effect 60 DAYS AFTER publication.
//
//    Until then the CURRENT D/S framework stands, and every grace period and
//    admission rule in this file remains correct as written. Several secondary
//    sources are already reporting the proposed terms (4-year fixed admission,
//    a 30-day F-1 grace period) as if they were law. THEY ARE NOT. Do not
//    shorten any value in this file on the strength of those reports — telling
//    a student they have 30 days when they in fact have 60 would push them to
//    leave the country a month early. See DURATION_OF_STATUS_RULE below.
//
//    When the rule publishes, the changes land here AND in processingTimes.js,
//    immigrationWarnings.js, and policyTracker.js. Re-verify the final text —
//    OIRA cleared it "with change," so the final terms may differ from the NPRM.

export const SEVIS_META = {
    lastUpdated: "July 13, 2026",
    source: "ICE.gov/SEVIS, fmjfee.com, StudyInTheStates.dhs.gov, USCIS.gov",
    disclaimer: "SEVIS fees are separate from visa application fees and school tuition.",
    // I-901 amounts were set by a final rule effective June 24, 2019 and are
    // UNCHANGED as of July 2026 (verified). Always reconfirm at fmjfee.com —
    // it is the only official payment site (scam sites are common).
    feesVerified: "July 13, 2026",
  };
  
  /**
   * SEVIS I-901 Fee Structure
   */
  export const SEVIS_FEES = {
    F: {
      type: "F-1/F-3 Student Visa",
      amount: 350,
      description: "Academic students and their dependents",
      paymentRequired: "Before visa interview",
    },
    M: {
      type: "M-1/M-3 Vocational Student",
      amount: 350,
      description: "Vocational/technical students and dependents",
      paymentRequired: "Before visa interview",
    },
    J: {
      type: "J-1 Exchange Visitor",
      amount: 220,
      description: "Exchange visitors (most categories)",
      paymentRequired: "Before visa interview",
    },
    J_SUBSIDIZED: {
      type: "J-1 Special Categories",
      amount: 35,
      description: "Camp counselors, au pairs, secondary school students",
      categories: [
        "Au pair",
        "Camp Counselor",
        "Secondary School Student",
        "Summer Work Travel",
      ],
    },
    J_GOVERNMENT: {
      type: "J-1 Government Sponsored",
      amount: 0,
      description: "U.S. government-sponsored programs",
    },
  };
  
  /**
   * School Certification Fees (for institutions)
   */
  export const SCHOOL_FEES = {
    initialCertification: 3000,
    siteVisit: 655,
    changeOfOwnership: 3000,
    addCampus: 655,
    appeals: 675,
  };
  
  /**
   * Optional Practical Training (OPT) Timeline
   */
  export const OPT_TIMELINE = {
    PRE_COMPLETION: {
      earliest: 90, // days before program end
      latest: "Before program completion",
      duration: "Up to 12 months total",
      partTime: "20 hours/week while school in session",
      fullTime: "40 hours/week during breaks",
    },
    POST_COMPLETION: {
      earliest: 90, // days before program end
      latest: 60, // days after program end
      duration: "12 months total",
      mustStart: "Within 60 days of program completion",
      unemploymentLimit: 90, // total days allowed
    },
    PROCESSING: {
      // Was "4.5 months" / premiumAvailable: false — both wrong, and the second
      // directly contradicted fees.js (I907_I765) and processingTimes.js, which
      // have correctly listed OPT premium processing all along. USCIS phased in
      // premium processing for F-1 OPT categories (c)(3)(A), (c)(3)(B) and
      // (c)(3)(C) starting March 6, 2023; it has been available ever since.
      normalProcessing: "2-3 months (online) / 3-5 months (paper)",
      premiumAvailable: true,
      premiumFee: 1780, // I-907, effective March 1, 2026 (was $1,685)
      premiumTimeframe: "30 business days",
      premiumNote:
        "Premium covers the decision only. Card production and USPS delivery typically add 2-4 more weeks.",
      tip: "Apply as early as possible (90 days before graduation)",
    },
  };
  
  /**
   * STEM OPT Extension
   */
  export const STEM_OPT = {
    eligibility: {
      degreeRequired: "STEM-designated program",
      employerRequirement: "E-Verify enrolled",
      priorOPT: "Must have used initial 12-month OPT",
    },
    duration: 24, // additional months
    totalOPT: 36, // months total possible (12 + 24)
    application: {
      earliest: 90, // days before OPT expires
      processingTime: "3-5 months",
      tip: "File I-765 with I-20 endorsed by DSO",
    },
    eligibleMajors: [
      "Computer Science",
      "Engineering (all fields)",
      "Mathematics",
      "Physical Sciences",
      "Biological Sciences",
      "Actuarial Science",
      "Data Science",
      "Statistics",
      "Medical Sciences",
    ],
  };
  
  /**
   * Curricular Practical Training (CPT)
   */
  export const CPT_REQUIREMENTS = {
    eligibility: {
      enrollment: "One academic year",
      requirement: "Must be integral part of curriculum",
      types: ["Required for degree", "Internship for credit", "Cooperative education"],
    },
    duration: {
      partTime: "20 hours/week or less - no limit",
      fullTime: "More than 20 hours/week",
      warning: "12+ months of full-time CPT eliminates OPT eligibility",
    },
    authorization: "Through DSO, no USCIS application needed",
    workBegins: "Only after CPT authorization on I-20",
  };
  
  /**
   * ⚠️ PENDING RULE — Duration of Status (D/S) → fixed period of admission
   *
   * NOT IN EFFECT as of July 13, 2026. Recorded here so the app can warn users
   * that a major change is coming, WITHOUT asserting terms that aren't law yet.
   *
   * Same discipline as the TPS entry (see policyTracker): where a government
   * change is imminent but unsettled, ship the SHAPE of the truth — "this is
   * changing, watch the official page, talk to your DSO" — not a number that
   * will be wrong either way.
   */
  export const DURATION_OF_STATUS_RULE = {
    inEffect: false, // <-- gate ALL UI on this. Do not present terms as current.
    status: "Final rule cleared OMB review June 17, 2026; awaiting Federal Register publication.",
    effectiveWhen: "60 days after publication in the Federal Register (not yet published).",
    rin: "1653-AA95",
    nprm: "90 FR 42070 (Aug. 28, 2025)",
    source: "DHS/ICE; OIRA review record",

    // What CURRENTLY applies (unchanged, still correct):
    currentFramework:
      "F-1 and J-1 nonimmigrants are admitted for 'duration of status' (D/S) — they may remain as long as they comply with their status. The grace periods in SEVIS_TIMELINES below still apply.",

    // What the PROPOSED rule would change. NOT LAW. Terms may change — OIRA
    // cleared the final rule "consistent with change," so the published text
    // may differ from the NPRM. Do not quote these as facts.
    proposedChanges: [
      "Fixed admission period tied to the I-20 / DS-2019 program end date, capped at 4 years",
      "Form I-539 extension of stay (with fee) required to stay beyond the fixed period",
      "Shorter grace periods (reported; the exact F-1 figure is not settled — see gracePeriodCaution)",
      "New limits on changing academic program or education level",
      "Unlawful presence would begin accruing automatically once the fixed period expires",
    ],

    gracePeriodCaution:
      "Secondary sources conflict on whether the F-1 post-completion grace period drops from 60 days to 30. Some report a cut to 30; the transition provisions describe 60 (F) / 30 (J). Until the Federal Register text publishes, THE CURRENT 60-DAY F-1 GRACE PERIOD APPLIES. Do not shorten it in the UI, and do not advise anyone to act as if it were 30.",

    userGuidance:
      "A significant change to how long F and J visa holders may stay is expected soon. It is not in effect yet, and nothing you need to do has changed today. Watch the official ICE/SEVP announcements and talk to your DSO or a qualified immigration attorney before making plans around your program end date.",
  };

  /**
   * Important SEVIS Timelines
   *
   * ⚠️ These reflect the CURRENT D/S framework and are correct as of July 2026.
   *    The pending rule above (DURATION_OF_STATUS_RULE) may change several of
   *    them — most notably F1_completion — but IT IS NOT IN EFFECT. Do not
   *    shorten any value here until the final rule publishes and is verified.
   */
  export const SEVIS_TIMELINES = {
    INITIAL_ENTRY: {
      earliest: 30, // days before program start
      requirement: "Must have I-20 and paid SEVIS fee",
    },
    GRACE_PERIODS: {
      F1_completion: 60, // days after program end
      F1_authorized_early_withdrawal: 15, // days
      M1_completion: 30, // days
      J1_completion: 30, // days
      OPT_unemployment: 90, // total days
      STEM_OPT_unemployment: 150, // total days (90 + 60)
    },
    TRANSFER: {
      deadline: "Within 60 days of program completion",
      releaseDate: "Specified by current school",
      requirement: "Must be in valid F-1 status",
    },
    TRAVEL: {
      signature: "I-20 travel signature valid for 12 months",
      optTravel: "Valid EAD card required",
      warning: "Cannot re-enter during grace period without valid status",
    },
  };
  
  /**
   * Address Reporting Requirements
   */
  export const ADDRESS_REPORTING = {
    deadline: 10, // days to report change
    whoReports: "Student reports to DSO",
    consequences: "Failure to report can result in termination",
  };
  
  /**
   * Common SEVIS Violations (leads to termination)
   */
  export const SEVIS_VIOLATIONS = [
    "Unauthorized employment",
    "Failure to maintain full course load",
    "Exceeding OPT unemployment limits",
    "Not reporting address change within 10 days",
    "Unauthorized drop below full-time enrollment",
    "Failure to report for classes",
    "Suspended or expelled from school",
  ];
  
  /**
   * Helper function to calculate OPT application window
   */
  export function calculateOPTWindow(programEndDate) {
    const end = new Date(programEndDate);
    const earliest = new Date(end);
    const latest = new Date(end);
    
    earliest.setDate(earliest.getDate() - 90);
    latest.setDate(latest.getDate() + 60);
    
    return {
      earliest: earliest.toISOString().split('T')[0],
      latest: latest.toISOString().split('T')[0],
      programEnd: programEndDate,
    };
  }
  
  /**
   * Check STEM eligibility
   */
  export function isSTEMEligible(major) {
    return STEM_OPT.eligibleMajors.some(
      eligible => major.toLowerCase().includes(eligible.toLowerCase())
    );
  }
  
  /**
   * Calculate grace period end date
   */
  export function calculateGracePeriod(completionDate, visaType = 'F1') {
    const completion = new Date(completionDate);
    const graceDays = visaType === 'F1' ? 60 : visaType === 'M1' ? 30 : 30;
    
    completion.setDate(completion.getDate() + graceDays);
    return completion.toISOString().split('T')[0];
  }
  
  export default {
    SEVIS_FEES,
    SCHOOL_FEES,
    OPT_TIMELINE,
    STEM_OPT,
    CPT_REQUIREMENTS,
    SEVIS_TIMELINES,
    DURATION_OF_STATUS_RULE,
    ADDRESS_REPORTING,
    SEVIS_VIOLATIONS,
    SEVIS_META,
    calculateOPTWindow,
    isSTEMEligible,
    calculateGracePeriod,
  };