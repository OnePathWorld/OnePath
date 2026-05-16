// src/data/immigrationData.js
// PURPOSE: UI structure + pathway schema
// NO volatile data (fees, times, caps) lives here
//
// Updated: April 2026 — converted to translation-key pattern.
// Pattern: data-only file. All user-facing strings (title, name,
// description, overview, requirements arrays) are translation keys
// referenced via i18n.t(). See src/i18n/locales/{en,es,pt,zh}.json
// under the `pathwaysData.*` namespace.
//
// ARCHITECTURE NOTE:
// We use JS getter properties so existing consumers that read e.g.
// `pathwaysData.work.title` keep working unchanged — every read of
// a translatable property goes through i18n.t() at access time, so
// language switches reflect immediately.
//
// Stable identifiers (id, key, icon, processingKey, feeForms, etc.)
// remain as plain values. Those are not user-facing.

import i18n from "../i18n";

const t = (key) => {
  const out = i18n.t(key);
  return out === key ? null : out;
};

// =========================================================
// Helper: build a requirements array from N translation keys
// =========================================================
function buildRequirements(base, count) {
  const out = [];
  for (let i = 1; i <= count; i++) {
    const v = t(`${base}.requirements.r${i}`);
    if (v) out.push(v);
  }
  return out;
}

export const PATHWAYS_LAST_REVIEWED = "March 2026";

// =========================================================
// Pathway shape definitions (stable, non-translated)
// Counts of requirements per category drive the helper above.
// =========================================================

const WORK_DEFS = {
  h1b: { reqCount: 4 },
  l1: { reqCount: 3 },
  o1: { reqCount: 3 },
  eb: { reqCount: 0 },
};

const FAMILY_DEFS = {
  immediate: { reqCount: 0 },
  k1: { reqCount: 3 },
  f1: { reqCount: 0 },
  f2a: { reqCount: 0 },
  f2b: { reqCount: 0 },
  f3: { reqCount: 0 },
  f4: { reqCount: 0 },
};

const STUDENT_DEFS = {
  f1_student: { reqCount: 4 },
  j1: { reqCount: 0 },
  m1: { reqCount: 0 },
};

const PROTECTION_DEFS = {
  asylum: { reqCount: 0 },
  refugee: { reqCount: 0 },
};

const CITIZENSHIP_DEFS = {
  standard: { reqCount: 8 },
  marriage: { reqCount: 7 },
  military: { reqCount: 5 },
  children: { reqCount: 4 },
};

// =========================================================
// pathwaysData — uses getters for translated fields
// =========================================================
export const pathwaysData = {
  // ---------------------------------------------------------
  // WORK-BASED
  // ---------------------------------------------------------
  work: {
    id: "work",
    icon: "💼",
    get title() { return t("pathwaysData.work.title"); },
    get overview() { return t("pathwaysData.work.overview"); },
    categories: {
      h1b: {
        key: "H1B",
        get name() { return t("pathwaysData.work.categories.h1b.name"); },
        get description() { return t("pathwaysData.work.categories.h1b.description"); },
        processingKey: "H1B",
        feeForms: ["I129", "H1B_REGISTRATION", "H1B_FRAUD_PREVENTION", "H1B_ACWIA"],
        hasPremiumProcessing: true,
        capSubject: true,
        requiresPrevailingWage: true,
        pathToGreenCard: true,
        get requirements() {
          return buildRequirements("pathwaysData.work.categories.h1b", WORK_DEFS.h1b.reqCount);
        },
      },
      l1: {
        key: "L1",
        get name() { return t("pathwaysData.work.categories.l1.name"); },
        get description() { return t("pathwaysData.work.categories.l1.description"); },
        processingKey: "L1",
        feeForms: ["I129", "H1B_FRAUD_PREVENTION"],
        hasPremiumProcessing: true,
        capSubject: false,
        requiresPrevailingWage: false,
        pathToGreenCard: true,
        get requirements() {
          return buildRequirements("pathwaysData.work.categories.l1", WORK_DEFS.l1.reqCount);
        },
      },
      o1: {
        key: "O1",
        get name() { return t("pathwaysData.work.categories.o1.name"); },
        get description() { return t("pathwaysData.work.categories.o1.description"); },
        processingKey: "O1",
        feeForms: ["I129"],
        hasPremiumProcessing: true,
        capSubject: false,
        requiresPrevailingWage: false,
        pathToGreenCard: true,
        get requirements() {
          return buildRequirements("pathwaysData.work.categories.o1", WORK_DEFS.o1.reqCount);
        },
      },
      eb: {
        key: "EB",
        get name() { return t("pathwaysData.work.categories.eb.name"); },
        get description() { return t("pathwaysData.work.categories.eb.description"); },
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

  // ---------------------------------------------------------
  // FAMILY-BASED
  // ---------------------------------------------------------
  family: {
    id: "family",
    icon: "👨‍👩‍👧‍👦",
    get title() { return t("pathwaysData.family.title"); },
    get overview() { return t("pathwaysData.family.overview"); },
    categories: {
      immediate: {
        key: "IR",
        get name() { return t("pathwaysData.family.categories.immediate.name"); },
        get description() { return t("pathwaysData.family.categories.immediate.description"); },
        processingKey: "I130_IR",
        feeForms: ["I130", "I485"],
        subjectToVisaBulletin: false,
      },
      k1: {
        key: "K1",
        get name() { return t("pathwaysData.family.categories.k1.name"); },
        get description() { return t("pathwaysData.family.categories.k1.description"); },
        processingKey: "K1",
        feeForms: ["I130", "I485"],
        subjectToVisaBulletin: false,
        get requirements() {
          return buildRequirements("pathwaysData.family.categories.k1", FAMILY_DEFS.k1.reqCount);
        },
      },
      f1: {
        key: "F1",
        get name() { return t("pathwaysData.family.categories.f1.name"); },
        get description() { return t("pathwaysData.family.categories.f1.description"); },
        processingKey: "I130_PREF",
        feeForms: ["I130", "I485"],
        subjectToVisaBulletin: true,
      },
      f2a: {
        key: "F2A",
        get name() { return t("pathwaysData.family.categories.f2a.name"); },
        get description() { return t("pathwaysData.family.categories.f2a.description"); },
        processingKey: "I130_PREF",
        feeForms: ["I130", "I485"],
        subjectToVisaBulletin: true,
      },
      f2b: {
        key: "F2B",
        get name() { return t("pathwaysData.family.categories.f2b.name"); },
        get description() { return t("pathwaysData.family.categories.f2b.description"); },
        processingKey: "I130_PREF",
        feeForms: ["I130", "I485"],
        subjectToVisaBulletin: true,
      },
      f3: {
        key: "F3",
        get name() { return t("pathwaysData.family.categories.f3.name"); },
        get description() { return t("pathwaysData.family.categories.f3.description"); },
        processingKey: "I130_PREF",
        feeForms: ["I130", "I485"],
        subjectToVisaBulletin: true,
      },
      f4: {
        key: "F4",
        get name() { return t("pathwaysData.family.categories.f4.name"); },
        get description() { return t("pathwaysData.family.categories.f4.description"); },
        processingKey: "I130_PREF",
        feeForms: ["I130", "I485"],
        subjectToVisaBulletin: true,
      },
    },
  },

  // ---------------------------------------------------------
  // STUDENT
  // ---------------------------------------------------------
  student: {
    id: "student",
    icon: "🎓",
    get title() { return t("pathwaysData.student.title"); },
    get overview() { return t("pathwaysData.student.overview"); },
    categories: {
      f1_student: {
        key: "STUDENT",
        get name() { return t("pathwaysData.student.categories.f1_student.name"); },
        get description() { return t("pathwaysData.student.categories.f1_student.description"); },
        processingKey: "F1",
        feeForms: ["I765"],
        allowsWork: ["CPT", "OPT", "STEM_OPT"],
        subjectToVisaBulletin: false,
        get requirements() {
          return buildRequirements("pathwaysData.student.categories.f1_student", STUDENT_DEFS.f1_student.reqCount);
        },
      },
      j1: {
        key: "J1",
        get name() { return t("pathwaysData.student.categories.j1.name"); },
        get description() { return t("pathwaysData.student.categories.j1.description"); },
        processingKey: "J1",
        feeForms: [],
        mayHaveHomeResidencyRequirement: true,
      },
      m1: {
        key: "M1",
        get name() { return t("pathwaysData.student.categories.m1.name"); },
        get description() { return t("pathwaysData.student.categories.m1.description"); },
        processingKey: "M1",
        feeForms: [],
        allowsWork: ["Limited_Practical_Training"],
      },
    },
  },

  // ---------------------------------------------------------
  // PROTECTION
  // ---------------------------------------------------------
  protection: {
    id: "protection",
    icon: "🛡️",
    get title() { return t("pathwaysData.protection.title"); },
    get overview() { return t("pathwaysData.protection.overview"); },
    categories: {
      asylum: {
        key: "ASYLUM",
        get name() { return t("pathwaysData.protection.categories.asylum.name"); },
        get description() { return t("pathwaysData.protection.categories.asylum.description"); },
        processingKey: "ASYLUM",
        feeForms: ["I765"],
        subjectToVisaBulletin: false,
      },
      refugee: {
        key: "REFUGEE",
        get name() { return t("pathwaysData.protection.categories.refugee.name"); },
        get description() { return t("pathwaysData.protection.categories.refugee.description"); },
        processingKey: "REFUGEE",
        feeForms: [],
        subjectToVisaBulletin: false,
      },
    },
  },

  // ---------------------------------------------------------
  // CITIZENSHIP / NATURALIZATION
  // ---------------------------------------------------------
  citizenship: {
    id: "citizenship",
    icon: "🇺🇸",
    get title() { return t("pathwaysData.citizenship.title"); },
    get overview() { return t("pathwaysData.citizenship.overview"); },
    categories: {
      standard: {
        key: "N400_5YR",
        get name() { return t("pathwaysData.citizenship.categories.standard.name"); },
        get description() { return t("pathwaysData.citizenship.categories.standard.description"); },
        processingKey: "N400",
        feeForms: ["N400"],
        hasPremiumProcessing: false,
        subjectToVisaBulletin: false,
        get requirements() {
          return buildRequirements("pathwaysData.citizenship.categories.standard", CITIZENSHIP_DEFS.standard.reqCount);
        },
        // keyFacts kept as literal strings — these are quick-reference
        // dollar/timing values not surfaced as primary UI text. Most
        // consumers don't render them. If you need them translated, add
        // a similar getter pattern.
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
        get name() { return t("pathwaysData.citizenship.categories.marriage.name"); },
        get description() { return t("pathwaysData.citizenship.categories.marriage.description"); },
        processingKey: "N400",
        feeForms: ["N400"],
        hasPremiumProcessing: false,
        subjectToVisaBulletin: false,
        get requirements() {
          return buildRequirements("pathwaysData.citizenship.categories.marriage", CITIZENSHIP_DEFS.marriage.reqCount);
        },
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
        get name() { return t("pathwaysData.citizenship.categories.military.name"); },
        get description() { return t("pathwaysData.citizenship.categories.military.description"); },
        processingKey: "N400",
        feeForms: [],
        hasPremiumProcessing: false,
        subjectToVisaBulletin: false,
        get requirements() {
          return buildRequirements("pathwaysData.citizenship.categories.military", CITIZENSHIP_DEFS.military.reqCount);
        },
        keyFacts: {
          waitTime: "Varies — can be expedited during active duty",
          fee: "$0 — filing fee waived for military applicants",
          immediateEligibility: "Yes, during designated periods of hostility",
          form: "N-400 or N-426 (for active duty abroad)",
        },
      },
      children: {
        key: "N600",
        get name() { return t("pathwaysData.citizenship.categories.children.name"); },
        get description() { return t("pathwaysData.citizenship.categories.children.description"); },
        processingKey: "N600",
        feeForms: ["N600"],
        hasPremiumProcessing: false,
        subjectToVisaBulletin: false,
        get requirements() {
          return buildRequirements("pathwaysData.citizenship.categories.children", CITIZENSHIP_DEFS.children.reqCount);
        },
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
// COUNTRY BACKLOG MAP (unchanged, country names are English/locale-agnostic)
// =========================================================
export const BACKLOG_COUNTRIES = {
    india: { hasBacklog: true, ebWait: "12+ years EB-2/EB-3", familyWait: "5-15 years" },
    china: { hasBacklog: true, ebWait: "4+ years EB-2", familyWait: "5-12 years" },
    mexico: { hasBacklog: true, ebWait: "Current for most EB", familyWait: "10-20 years" },
    philippines: { hasBacklog: true, ebWait: "Current for most EB", familyWait: "10-15 years" },
    haiti: { hasBacklog: false, ebWait: "Current", familyWait: "Standard", tpsEligible: true, humanitarianNote: "TPS historically available — check current designation status" },
    canada: { hasBacklog: false, ebWait: "Current", familyWait: "Standard" },
    uk: { hasBacklog: false, ebWait: "Current", familyWait: "Standard" },
    brazil: { hasBacklog: false, ebWait: "Current", familyWait: "Standard" },
    nigeria: { hasBacklog: false, ebWait: "Current", familyWait: "Standard" },
    south_korea: { hasBacklog: false, ebWait: "Current", familyWait: "Standard" },
    japan: { hasBacklog: false, ebWait: "Current", familyWait: "Standard" },
    germany: { hasBacklog: false, ebWait: "Current", familyWait: "Standard" },
  };
