// src/data/immigrationData.js
// PURPOSE: UI structure + pathway schema
// NO volatile data (fees, times, caps) lives here

export const PATHWAYS_LAST_REVIEWED = "March 2026";

export const pathwaysData = {
  work: {
    id: "work",
    title: "Work-Based Immigration",
    icon: "💼",
    overview:
      "Employment-based immigration allows foreign nationals to work in the United States. Most categories require employer sponsorship.",
    categories: {
      h1b: {
        key: "H1B",
        name: "H-1B Specialty Occupation",
        description:
          "For positions requiring specialized knowledge and a bachelor's degree or higher.",
        processingKey: "H1B",
        feeForms: ["I129", "H1B_REGISTRATION", "H1B_FRAUD_PREVENTION", "H1B_ACWIA"],
        hasPremiumProcessing: true,
        capSubject: true,
        requiresPrevailingWage: true,
        pathToGreenCard: true,
        requirements: [
          "Bachelor's degree or equivalent",
          "Job offer from U.S. employer",
          "Specialty occupation",
          "Employer must pay prevailing wage",
        ],
      },

      l1: {
        key: "L1",
        name: "L-1 Intracompany Transfer",
        description:
          "For employees of multinational companies transferring to a U.S. office.",
        processingKey: "L1",
        feeForms: ["I129", "H1B_FRAUD_PREVENTION"],
        hasPremiumProcessing: true,
        capSubject: false,
        requiresPrevailingWage: false,
        pathToGreenCard: true,
        requirements: [
          "Worked for company for 1 year in past 3 years",
          "Transfer to qualifying U.S. entity",
          "Executive, managerial, or specialized role",
        ],
      },

      o1: {
        key: "O1",
        name: "O-1 Extraordinary Ability",
        description:
          "For individuals with extraordinary ability in sciences, arts, education, business, or athletics.",
        processingKey: "O1",
        feeForms: ["I129"],
        hasPremiumProcessing: true,
        capSubject: false,
        requiresPrevailingWage: false,
        pathToGreenCard: true,
        requirements: [
          "Demonstrated extraordinary ability",
          "National or international recognition",
          "Work in area of expertise",
        ],
      },

      eb: {
        key: "EB",
        name: "Employment-Based Green Cards",
        description:
          "Permanent residence through employment-based categories (EB-1, EB-2, EB-3).",
        processingKey: "EB",
        feeForms: ["I140", "I485"],
        hasPremiumProcessing: true,
        capSubject: false,
        requiresPrevailingWage: true,
        pathToGreenCard: "Direct",
        subcategories: ["EB1", "EB2", "EB3", "EB4", "EB5"],
      },
    },
  },

  family: {
    id: "family",
    title: "Family-Based Immigration",
    icon: "👨‍👩‍👧‍👦",
    overview:
      "U.S. citizens and permanent residents can sponsor eligible family members. Immediate relatives have no annual limits.",
    categories: {
      immediate: {
        key: "IR",
        name: "Immediate Relatives",
        description:
          "Spouses, unmarried children under 21, and parents of U.S. citizens. No annual limits.",
        processingKey: "I130_IR",
        feeForms: ["I130", "I485"],
        subjectToVisaBulletin: false,
      },

      k1: {
        key: "K1",
        name: "K-1 Fiancé(e) Visa",
        description: "For fiancé(e)s of U.S. citizens.",
        processingKey: "K1",
        feeForms: ["I130", "I485"],
        subjectToVisaBulletin: false,
        requirements: [
          "Intent to marry within 90 days",
          "Met in person within last 2 years",
          "Legally free to marry",
        ],
      },

      f1: {
        key: "F1",
        name: "F-1: Unmarried Sons/Daughters of U.S. Citizens",
        description:
          "For unmarried children 21+ of U.S. citizens. Current wait: 7-8 years.",
        processingKey: "I130_PREF",
        feeForms: ["I130", "I485"],
        subjectToVisaBulletin: true,
      },

      f2a: {
        key: "F2A",
        name: "F-2A: Spouses/Children of Green Card Holders",
        description:
          "For spouses and unmarried children under 21 of permanent residents. Current wait: 2-3 years.",
        processingKey: "I130_PREF",
        feeForms: ["I130", "I485"],
        subjectToVisaBulletin: true,
      },

      f2b: {
        key: "F2B",
        name: "F-2B: Unmarried Adult Children of Green Card Holders",
        description:
          "For unmarried children 21+ of permanent residents. Current wait: 6-7 years.",
        processingKey: "I130_PREF",
        feeForms: ["I130", "I485"],
        subjectToVisaBulletin: true,
      },

      f3: {
        key: "F3",
        name: "F-3: Married Children of U.S. Citizens",
        description:
          "For married children of U.S. citizens. Current wait: 12-13 years.",
        processingKey: "I130_PREF",
        feeForms: ["I130", "I485"],
        subjectToVisaBulletin: true,
      },

      f4: {
        key: "F4",
        name: "F-4: Siblings of U.S. Citizens",
        description:
          "For brothers/sisters of U.S. citizens (petitioner must be 21+). Current wait: 13-24 years.",
        processingKey: "I130_PREF",
        feeForms: ["I130", "I485"],
        subjectToVisaBulletin: true,
      },
    },
  },

  student: {
    id: "student",
    title: "Student Pathway",
    icon: "🎓",
    overview:
      "International students may study full-time at SEVP-certified U.S. institutions. F-1 students can work through OPT (12 months) and STEM OPT (24 additional months) after graduation.",
    categories: {
      f1_student: {
        key: "STUDENT",
        name: "F-1 Academic Student",
        description:
          "Full-time study at a U.S. university or college. OPT allows 1-3 years of work after graduation.",
        processingKey: "F1",
        feeForms: ["I765"],
        allowsWork: ["CPT", "OPT", "STEM_OPT"],
        subjectToVisaBulletin: false,
        requirements: [
          "SEVP-approved school admission",
          "Full course of study",
          "Financial proof (~$40,000/year)",
          "Intent to depart after study",
        ],
      },

      j1: {
        key: "J1",
        name: "J-1 Exchange Visitor",
        description:
          "For exchange programs (research, teaching, au pair). Many subject to 2-year home residency requirement.",
        processingKey: "J1",
        feeForms: [],
        mayHaveHomeResidencyRequirement: true,
      },

      m1: {
        key: "M1",
        name: "M-1 Vocational Student",
        description:
          "For vocational or non-academic programs. Limited work options after completion.",
        processingKey: "M1",
        feeForms: [],
        allowsWork: ["Limited_Practical_Training"],
      },
    },
  },

  protection: {
    id: "protection",
    title: "Humanitarian Protection",
    icon: "🛡️",
    overview:
      "Protection pathways for individuals unable to return home safely. Asylum must be filed within 1 year of arrival in the U.S. Policy environment is currently volatile.",
    categories: {
      asylum: {
        key: "ASYLUM",
        name: "Asylum",
        description:
          "For those with a well-founded fear of persecution. Must file within 1 year of arrival.",
        processingKey: "ASYLUM",
        feeForms: ["I765"],
        subjectToVisaBulletin: false,
      },

      refugee: {
        key: "REFUGEE",
        name: "Refugee Status",
        description:
          "For individuals referred by UNHCR or a U.S. embassy while outside the United States.",
        processingKey: "REFUGEE",
        feeForms: [],
        subjectToVisaBulletin: false,
      },
    },
  },

  // =========================================================
  // NEW: CITIZENSHIP / NATURALIZATION PATHWAY
  // =========================================================
  citizenship: {
    id: "citizenship",
    title: "Path to Citizenship",
    icon: "🇺🇸",
    overview:
      "U.S. naturalization allows lawful permanent residents (green card holders) to become U.S. citizens. Most applicants are eligible after 5 years of continuous residence. Spouses of U.S. citizens may qualify after 3 years.",
    categories: {

      standard: {
        key: "N400_5YR",
        name: "5-Year Continuous Residence",
        description:
          "The standard naturalization path for most green card holders after 5 years of continuous residence.",
        processingKey: "N400",
        feeForms: ["N400"],
        hasPremiumProcessing: false,
        subjectToVisaBulletin: false,
        requirements: [
          "Green card held for at least 5 years",
          "Continuous residence in the U.S. for 5 years",
          "Physical presence for at least 30 months of the 5 years",
          "No single trip abroad longer than 6 months",
          "18 years of age or older",
          "Good moral character",
          "Ability to read, write, and speak English",
          "Pass the 100-question civics test",
        ],
        keyFacts: {
          waitTime: "8–14 months from filing to oath ceremony",
          fee: "$760 paper / $710 online",
          reducedFee: "$380 (income-based reduction available)",
          physicalPresence: "30 of 60 months required",
          travelLimit: "No single trip over 6 months",
        },
      },

      marriage: {
        key: "N400_3YR",
        name: "3-Year Rule (Married to U.S. Citizen)",
        description:
          "Expedited path for green card holders married to and living with a U.S. citizen. Eligible after 3 years instead of 5.",
        processingKey: "N400",
        feeForms: ["N400"],
        hasPremiumProcessing: false,
        subjectToVisaBulletin: false,
        requirements: [
          "Green card held for at least 3 years",
          "Currently married to and living with a U.S. citizen",
          "Spouse has been a U.S. citizen for all 3 years",
          "Physical presence for at least 18 months of the 3 years",
          "No single trip abroad longer than 6 months",
          "Good moral character",
          "Pass English and civics requirements",
        ],
        keyFacts: {
          waitTime: "8–14 months from filing to oath ceremony",
          fee: "$760 paper / $710 online",
          physicalPresence: "18 of 36 months required",
          travelLimit: "No single trip over 6 months",
          note: "Must still be married to same U.S. citizen at time of filing",
        },
      },

      military: {
        key: "N400_MIL",
        name: "Military Service",
        description:
          "Expedited or immediate naturalization for active duty service members and honorably discharged veterans.",
        processingKey: "N400",
        feeForms: [], // N-400 filing fee is $0 for military
        hasPremiumProcessing: false,
        subjectToVisaBulletin: false,
        requirements: [
          "Active duty or honorably discharged from U.S. armed forces",
          "1 year of honorable service (peacetime)",
          "Active duty during designated hostility period = immediate eligibility",
          "Good moral character",
          "Pass English and civics requirements",
        ],
        keyFacts: {
          waitTime: "Varies — can be expedited during active duty",
          fee: "$0 — filing fee waived for military applicants",
          immediateEligibility: "Yes, during designated periods of hostility",
          form: "N-400 or N-426 (for active duty abroad)",
        },
      },

      children: {
        key: "N600",
        name: "Citizenship for Children",
        description:
          "Children under 18 with a green card may automatically acquire citizenship when a parent naturalizes. N-600 documents this citizenship.",
        processingKey: "N600",
        feeForms: ["N600"],
        hasPremiumProcessing: false,
        subjectToVisaBulletin: false,
        requirements: [
          "Under 18 years old",
          "Lawful permanent resident",
          "At least one parent is a U.S. citizen (by birth or naturalization)",
          "Residing in the U.S. in legal and physical custody of citizen parent",
        ],
        keyFacts: {
          note: "Citizenship may be automatic — N-600 just documents it",
          fee: "$1,170 (N-600 Certificate of Citizenship)",
          militaryFee: "$0 for children of military",
        },
      },

    },
  },
};

// =========================================================
// COUNTRY BACKLOG MAP
// Used across app to determine if country has EB/family backlogs
// Updated to include Germany (no backlog)
// =========================================================
export const BACKLOG_COUNTRIES = {
  india: { hasBacklog: true, ebWait: "12+ years EB-2/EB-3", familyWait: "5-15 years" },
  china: { hasBacklog: true, ebWait: "4+ years EB-2", familyWait: "5-12 years" },
  mexico: { hasBacklog: true, ebWait: "Current for most EB", familyWait: "10-20 years" },
  philippines: { hasBacklog: true, ebWait: "Current for most EB", familyWait: "10-15 years" },
  canada: { hasBacklog: false, ebWait: "Current", familyWait: "Standard" },
  uk: { hasBacklog: false, ebWait: "Current", familyWait: "Standard" },
  brazil: { hasBacklog: false, ebWait: "Current", familyWait: "Standard" },
  nigeria: { hasBacklog: false, ebWait: "Current", familyWait: "Standard" },
  south_korea: { hasBacklog: false, ebWait: "Current", familyWait: "Standard" },
  japan: { hasBacklog: false, ebWait: "Current", familyWait: "Standard" },
  // NEW
  germany: { hasBacklog: false, ebWait: "Current", familyWait: "Standard" },
};