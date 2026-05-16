// src/data/visaBulletin.js
// Updated: May 2026 — Official U.S. Department of State Visa Bulletin
// Source: travel.state.gov/content/dam/visas/Bulletins/visabulletin_May2026.pdf

export const VISA_BULLETIN = {
    lastUpdated: "May 2026",
    source: "U.S. Department of State, Visa Bulletin for May 2026",
    bulletinMonth: "May",
    bulletinYear: 2026,

    // =========================================================
    // USCIS CHART INSTRUCTIONS FOR MAY 2026
    // =========================================================
    // Family-sponsored: use Dates for Filing chart
    // Employment-based: use Final Action Dates chart
    uscisChartInstructions: {
      familySponsored: "datesForFiling",
      employmentBased: "finalAction",
    },
  
    // =========================================================
    // FAMILY-SPONSORED FINAL ACTION DATES
    // =========================================================
    familyFinalAction: {
      F1: {
        label: "F1 — Unmarried Sons/Daughters of U.S. Citizens",
        default: "2017-09-01",
        China: "2017-09-01",
        India: "2017-09-01",
        Mexico: "2007-08-15",
        Philippines: "2013-05-01",
      },
      F2A: {
        label: "F2A — Spouses/Children of Permanent Residents",
        default: "2024-08-01",
        China: "2024-08-01",
        India: "2024-08-01",
        Mexico: "2023-08-01",
        Philippines: "2024-08-01",
      },
      F2B: {
        label: "F2B — Unmarried Sons/Daughters (21+) of Permanent Residents",
        default: "2017-05-22",
        China: "2017-05-22",
        India: "2017-05-22",
        Mexico: "2009-02-15",
        Philippines: "2013-04-08",
      },
      F3: {
        label: "F3 — Married Sons/Daughters of U.S. Citizens",
        default: "2012-02-15",
        China: "2012-02-15",
        India: "2012-02-15",
        Mexico: "2001-05-01",
        Philippines: "2005-11-22",
      },
      F4: {
        label: "F4 — Siblings of Adult U.S. Citizens",
        default: "2008-09-15",
        China: "2008-09-15",
        India: "2006-11-01",
        Mexico: "2001-04-08",
        Philippines: "2007-02-01",
      },
    },
  
    // =========================================================
    // FAMILY-SPONSORED DATES FOR FILING
    // (USCIS honors this chart for family categories in May 2026)
    // =========================================================
    familyDatesForFiling: {
      F1: {
        default: "2018-03-01",
        China: "2018-03-01",
        India: "2018-03-01",
        Mexico: "2008-04-15",
        Philippines: "2015-06-01",
      },
      F2A: {
        default: "C",
        China: "C",
        India: "C",
        Mexico: "C",
        Philippines: "C",
      },
      F2B: {
        default: "2017-08-08",
        China: "2017-08-08",
        India: "2017-08-08",
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
        default: "2009-05-15",
        China: "2009-05-15",
        India: "2006-12-15",
        Mexico: "2001-04-30",
        Philippines: "2008-03-22",
      },
    },
  
    // =========================================================
    // EMPLOYMENT-BASED FINAL ACTION DATES
    // (USCIS honors this chart for employment categories in May 2026)
    // =========================================================
    employmentFinalAction: {
      EB1: {
        label: "EB-1 — Priority Workers",
        default: "C",
        China: "2023-04-01",
        India: "2023-04-01",
        Mexico: "C",
        Philippines: "C",
      },
      EB2: {
        label: "EB-2 — Advanced Degree / Exceptional Ability",
        default: "C",
        China: "2021-09-01",
        India: "2014-07-15",
        Mexico: "C",
        Philippines: "C",
      },
      EB3: {
        label: "EB-3 — Skilled Workers / Professionals",
        default: "2024-06-01",
        China: "2021-06-15",
        India: "2013-11-15",
        Mexico: "2024-06-01",
        Philippines: "2023-08-01",
      },
      OtherWorkers: {
        label: "EB-3 Other Workers",
        default: "2022-01-01",
        China: "2019-02-01",
        India: "2013-11-15",
        Mexico: "2022-01-01",
        Philippines: "2022-01-01",
      },
      EB4: {
        label: "EB-4 — Certain Special Immigrants",
        default: "2022-07-15",
        China: "2022-07-15",
        India: "2022-07-15",
        Mexico: "2022-07-15",
        Philippines: "2022-07-15",
      },
      EB5_Unreserved: {
        label: "EB-5 — Unreserved",
        default: "C",
        China: "2016-09-22",
        India: "2022-05-01",
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
    // EMPLOYMENT-BASED DATES FOR FILING
    // (NOT used by USCIS in May 2026 — Final Action Dates apply)
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
    // NOTABLE CHANGES & POLICY NOTES (May 2026)
    // =========================================================
    policyNotes: [
      "CHART SWITCH: USCIS honors Final Action Dates for employment-based categories in May (was Dates for Filing in April). Critical change for Indian/Chinese EB applicants.",
      "CHART SWITCH: USCIS honors Dates for Filing for family-sponsored categories in May (unchanged from April).",
      "Family F1 advances ~4 months: May 1, 2017 → Sep 1, 2017 for worldwide/China/India. Mexico advances to Aug 15, 2007.",
      "Family F2A advances 6 months: Feb 1, 2024 → Aug 1, 2024 for worldwide/China/India/Philippines. Mexico → Aug 1, 2023.",
      "Family F3 advances ~2 months: Dec 22, 2011 → Feb 15, 2012 worldwide. Philippines → Nov 22, 2005.",
      "Family F4 other countries advance to Sep 15, 2008. India, Mexico, Philippines unchanged.",
      "EB-1, EB-2, EB-3 employment categories hold steady — no movement from April 2026.",
      "EB-5 China Unreserved Final Action advances 3 weeks to Sep 22, 2016.",
      "Retrogression warning: demand may cause retrogression later in FY2026 as presidential proclamation effects materialize.",
      "FY 2026 family-sponsored preference limit: 226,000. Employment-based worldwide level: at least 140,000.",
    ],
  
    // =========================================================
    // BACKWARD COMPAT — legacy "categories" shape
    // used by PriorityDateTracker component
    // Mirrors familyFinalAction + employmentFinalAction
    // =========================================================
    categories: {
      F1: {
        default: "2017-09-01",
        China: "2017-09-01",
        India: "2017-09-01",
        Mexico: "2007-08-15",
        Philippines: "2013-05-01",
      },
      F2A: {
        default: "2024-08-01",
        China: "2024-08-01",
        India: "2024-08-01",
        Mexico: "2023-08-01",
        Philippines: "2024-08-01",
      },
      F2B: {
        default: "2017-05-22",
        China: "2017-05-22",
        India: "2017-05-22",
        Mexico: "2009-02-15",
        Philippines: "2013-04-08",
      },
      F3: {
        default: "2012-02-15",
        China: "2012-02-15",
        India: "2012-02-15",
        Mexico: "2001-05-01",
        Philippines: "2005-11-22",
      },
      F4: {
        default: "2008-09-15",
        China: "2008-09-15",
        India: "2006-11-01",
        Mexico: "2001-04-08",
        Philippines: "2007-02-01",
      },
      EB1: {
        default: "C",
        China: "2023-04-01",
        India: "2023-04-01",
        Mexico: "C",
        Philippines: "C",
      },
      EB2: {
        default: "C",
        China: "2021-09-01",
        India: "2014-07-15",
        Mexico: "C",
        Philippines: "C",
      },
      EB3: {
        default: "2024-06-01",
        China: "2021-06-15",
        India: "2013-11-15",
        Mexico: "2024-06-01",
        Philippines: "2023-08-01",
      },
    },
  };
  
  export default VISA_BULLETIN;