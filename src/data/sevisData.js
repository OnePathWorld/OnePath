export const SEVIS_META = {
    lastUpdated: "December 13, 2024",
    source: "ICE.gov/SEVIS and StudyInTheStates.dhs.gov",
    disclaimer: "SEVIS fees are separate from visa application fees and school tuition.",
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
      normalProcessing: "4.5 months",
      premiumAvailable: false,
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
   * Important SEVIS Timelines
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
    ADDRESS_REPORTING,
    SEVIS_VIOLATIONS,
    SEVIS_META,
    calculateOPTWindow,
    isSTEMEligible,
    calculateGracePeriod,
  };