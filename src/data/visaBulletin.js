// src/data/visaBulletin.js
// Updated: July 2026 — Official U.S. Department of State Visa Bulletin
// Source: travel.state.gov/content/dam/visas/Bulletins/visabulletin_July2026.pdf
// Verified against the official July 2026 bulletin (CA/VO data cutoff: June 2, 2026).
//
// ⚠️ DEPLOY ON/AFTER JULY 1, 2026. Until July 1, the June 2026 bulletin is the one
//    legally in effect. This file is the July edition staged for deployment.
//
// ⚠️ NEW STATUS VALUE "U" (Unavailable): India EB-2 and India EB-5 Unreserved are
//    "U" for the remainder of FY2026 (through Sep 30, 2026). Display/calculation code
//    (PriorityDateTracker, ViabilityBadge, TimelineCalculator, etc.) MUST handle "U"
//    distinctly from "C" and from an ISO date. Treat "U" as "no visas issued; cannot
//    be current this fiscal year."

export const VISA_BULLETIN = {
    lastUpdated: "July 2026",
    source: "U.S. Department of State, Visa Bulletin for July 2026",
    bulletinMonth: "July",
    bulletinYear: 2026,

    // =========================================================
    // USCIS CHART INSTRUCTIONS FOR JULY 2026
    // Family-sponsored: Dates for Filing (continuing prior determination)
    // Employment-based: Final Action Dates
    // ⚠️ REVERIFY at uscis.gov/visabulletininfo — USCIS sets chart use each month.
    // =========================================================
    uscisChartInstructions: {
      familySponsored: "datesForFiling",
      employmentBased: "finalAction",
    },

    // =========================================================
    // FAMILY-SPONSORED FINAL ACTION DATES (July 2026)
    // =========================================================
    familyFinalAction: {
      F1: {
        label: "F1 — Unmarried Sons/Daughters of U.S. Citizens",
        default: "2018-02-01",
        China: "2018-02-01",
        India: "2018-02-01",
        Mexico: "2007-11-08",
        Philippines: "2013-05-01",
      },
      F2A: {
        label: "F2A — Spouses/Children of Permanent Residents",
        default: "2025-01-01",
        China: "2025-01-01",
        India: "2025-01-01",
        Mexico: "2024-01-01",
        Philippines: "2025-01-01",
      },
      F2B: {
        label: "F2B — Unmarried Sons/Daughters (21+) of Permanent Residents",
        default: "2017-11-22",
        China: "2017-11-22",
        India: "2017-11-22",
        Mexico: "2009-02-15",
        Philippines: "2013-05-15",
      },
      F3: {
        label: "F3 — Married Sons/Daughters of U.S. Citizens",
        default: "2012-04-15",
        China: "2012-04-15",
        India: "2012-04-15",
        Mexico: "2001-06-01",
        Philippines: "2006-02-22",
      },
      F4: {
        label: "F4 — Siblings of Adult U.S. Citizens",
        default: "2009-01-01",
        China: "2009-01-01",
        India: "2006-11-01",
        Mexico: "2001-04-08",
        Philippines: "2007-08-01",
      },
    },

    // =========================================================
    // FAMILY-SPONSORED DATES FOR FILING (July 2026)
    // (USCIS honors this chart for family categories in July 2026)
    // =========================================================
    familyDatesForFiling: {
      F1: {
        default: "2019-01-01",
        China: "2019-01-01",
        India: "2019-01-01",
        Mexico: "2008-10-01",
        Philippines: "2015-04-22",
      },
      F2A: {
        default: "C",
        China: "C",
        India: "C",
        Mexico: "C",
        Philippines: "C",
      },
      F2B: {
        default: "2018-06-08",
        China: "2018-06-08",
        India: "2018-06-08",
        Mexico: "2010-05-15",
        Philippines: "2013-10-01",
      },
      F3: {
        default: "2012-12-08",
        China: "2012-12-08",
        India: "2012-12-08",
        Mexico: "2001-07-15",
        Philippines: "2006-08-08",
      },
      F4: {
        default: "2010-03-01",
        China: "2010-03-01",
        India: "2006-12-15",
        Mexico: "2001-04-30",
        Philippines: "2008-03-22",
      },
    },

    // =========================================================
    // EMPLOYMENT-BASED FINAL ACTION DATES (July 2026)
    // ⚠️ "U" = Unavailable for the rest of FY2026 (India EB-2, India EB-5 Unreserved)
    // =========================================================
    employmentFinalAction: {
      EB1: {
        label: "EB-1 — Priority Workers",
        default: "C",
        China: "2023-06-01",
        India: "2022-10-15",
        Mexico: "C",
        Philippines: "C",
      },
      EB2: {
        label: "EB-2 — Advanced Degree / Exceptional Ability",
        default: "C",
        China: "2021-09-01",
        India: "U",
        Mexico: "C",
        Philippines: "C",
      },
      EB3: {
        label: "EB-3 — Skilled Workers / Professionals",
        default: "2024-08-01",
        China: "2021-12-22",
        India: "2014-01-01",
        Mexico: "2024-08-01",
        Philippines: "2023-08-01",
      },
      OtherWorkers: {
        label: "EB-3 Other Workers",
        default: "2022-03-01",
        China: "2019-04-01",
        India: "2014-01-01",
        Mexico: "2022-03-01",
        Philippines: "2021-12-01",
      },
      EB4: {
        label: "EB-4 — Certain Special Immigrants",
        default: "2022-09-15",
        China: "2022-09-15",
        India: "2022-09-15",
        Mexico: "2022-09-15",
        Philippines: "2022-09-15",
      },
      EB5_Unreserved: {
        label: "EB-5 — Unreserved",
        default: "C",
        China: "2016-12-01",
        India: "U",
        Mexico: "C",
        Philippines: "C",
      },
      EB5_Rural: {
        label: "EB-5 — Rural (20%)",
        default: "C",
        China: "C",
        India: "C",
        Mexico: "C",
        Philippines: "C",
      },
      EB5_HighUnemployment: {
        label: "EB-5 — High Unemployment (10%)",
        default: "C",
        China: "C",
        India: "C",
        Mexico: "C",
        Philippines: "C",
      },
      EB5_Infrastructure: {
        label: "EB-5 — Infrastructure (2%)",
        default: "C",
        China: "C",
        India: "C",
        Mexico: "C",
        Philippines: "C",
      },
    },

    // =========================================================
    // EMPLOYMENT-BASED DATES FOR FILING (July 2026)
    // (NOT used by USCIS in July 2026 — Final Action Dates apply.
    //  Unchanged from June 2026; verified against the July bulletin.)
    // =========================================================
    employmentDatesForFiling: {
      EB1: {
        default: "C",
        China: "2023-12-01",
        India: "2023-12-01",
        Mexico: "C",
        Philippines: "C",
      },
      EB2: {
        default: "C",
        China: "2022-01-01",
        India: "2015-01-15",
        Mexico: "C",
        Philippines: "C",
      },
      EB3: {
        default: "C",
        China: "2022-01-01",
        India: "2015-01-15",
        Mexico: "C",
        Philippines: "2024-01-01",
      },
      OtherWorkers: {
        default: "2022-08-01",
        China: "2019-10-01",
        India: "2015-01-15",
        Mexico: "2022-08-01",
        Philippines: "2022-08-01",
      },
      EB4: {
        default: "2023-01-01",
        China: "2023-01-01",
        India: "2023-01-01",
        Mexico: "2023-01-01",
        Philippines: "2023-01-01",
      },
      EB5_Unreserved: {
        default: "C",
        China: "2017-03-01",
        India: "2024-05-01",
        Mexico: "C",
        Philippines: "C",
      },
      EB5_Rural: {
        default: "C",
        China: "C",
        India: "C",
        Mexico: "C",
        Philippines: "C",
      },
      EB5_HighUnemployment: {
        default: "C",
        China: "C",
        India: "C",
        Mexico: "C",
        Philippines: "C",
      },
      EB5_Infrastructure: {
        default: "C",
        China: "C",
        India: "C",
        Mexico: "C",
        Philippines: "C",
      },
    },

    // =========================================================
    // NOTABLE CHANGES & POLICY NOTES (July 2026)
    // =========================================================
    policyNotes: [
      "CHART USE: USCIS honors Final Action Dates for employment-based categories and Dates for Filing for family-sponsored categories in July 2026. Reverify at uscis.gov/visabulletininfo.",
      "UNAVAILABLE: India EB-2 is 'U' (Unavailable) for the rest of FY2026 — India's pro-rated EB-2 limit was reached. Likely to advance in October (start of FY2027) to at least the May 2026 final action date.",
      "UNAVAILABLE: India EB-5 Unreserved is 'U' (Unavailable) for the rest of FY2026 — pro-rated limit reached. Likely to advance in October to at least the June 2026 final action date.",
      "RETROGRESSION: India EB-1 retrogressed further to Oct 15, 2022 (from Dec 15, 2022 in June). China EB-1 advanced to Jun 1, 2023.",
      "EB-3 advanced: worldwide to Aug 1, 2024; China to Dec 22, 2021; India to Jan 1, 2014. EB-4 worldwide advanced to Sep 15, 2022.",
      "FAMILY advanced broadly: F1 worldwide to Feb 1, 2018; F2B worldwide to Nov 22, 2017; F3 worldwide to Apr 15, 2012; F4 worldwide to Jan 1, 2009. F2A holds at Jan 1, 2025 (Mexico Jan 1, 2024).",
      "DOS warnings for coming months: China EB-2 may retrogress or become 'Unavailable'; Philippines EB-3 may retrogress or become 'Unavailable'; further India EB-1 retrogression possible.",
      "FY2026 family-sponsored preference limit: 226,000. Employment-based worldwide level: at least 140,000. Per-country limit: 25,620 (2% dependent-area: 7,320).",
    ],

    // =========================================================
    // BACKWARD COMPAT — legacy "categories" shape
    // used by PriorityDateTracker component
    // Mirrors familyFinalAction + employmentFinalAction (July 2026)
    // ⚠️ Contains "U" values — ensure consumers handle Unavailable.
    // =========================================================
    categories: {
      F1: {
        default: "2018-02-01",
        China: "2018-02-01",
        India: "2018-02-01",
        Mexico: "2007-11-08",
        Philippines: "2013-05-01",
      },
      F2A: {
        default: "2025-01-01",
        China: "2025-01-01",
        India: "2025-01-01",
        Mexico: "2024-01-01",
        Philippines: "2025-01-01",
      },
      F2B: {
        default: "2017-11-22",
        China: "2017-11-22",
        India: "2017-11-22",
        Mexico: "2009-02-15",
        Philippines: "2013-05-15",
      },
      F3: {
        default: "2012-04-15",
        China: "2012-04-15",
        India: "2012-04-15",
        Mexico: "2001-06-01",
        Philippines: "2006-02-22",
      },
      F4: {
        default: "2009-01-01",
        China: "2009-01-01",
        India: "2006-11-01",
        Mexico: "2001-04-08",
        Philippines: "2007-08-01",
      },
      EB1: {
        default: "C",
        China: "2023-06-01",
        India: "2022-10-15",
        Mexico: "C",
        Philippines: "C",
      },
      EB2: {
        default: "C",
        China: "2021-09-01",
        India: "U",
        Mexico: "C",
        Philippines: "C",
      },
      EB3: {
        default: "2024-08-01",
        China: "2021-12-22",
        India: "2014-01-01",
        Mexico: "2024-08-01",
        Philippines: "2023-08-01",
      },
    },
  };

  export default VISA_BULLETIN;