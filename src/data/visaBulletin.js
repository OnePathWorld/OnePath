// src/data/visaBulletin.js
// Updated: April 2026 — Official U.S. Department of State Visa Bulletin
// Source: travel.state.gov/content/dam/visas/Bulletins/visabulletin_April2026.pdf

export const VISA_BULLETIN = {
    lastUpdated: "April 2026",
    source: "U.S. Department of State, Visa Bulletin for April 2026",
    bulletinMonth: "April",
    bulletinYear: 2026,
  
    // =========================================================
    // FAMILY-SPONSORED FINAL ACTION DATES
    // =========================================================
    familyFinalAction: {
      F1: {
        label: "F1 — Unmarried Sons/Daughters of U.S. Citizens",
        default: "2017-05-01",
        China: "2017-05-01",
        India: "2017-05-01",
        Mexico: "2007-02-15",
        Philippines: "2013-05-01",
      },
      F2A: {
        label: "F2A — Spouses/Children of Permanent Residents",
        default: "2024-02-01",
        China: "2024-02-01",
        India: "2024-02-01",
        Mexico: "2023-02-01",
        Philippines: "2024-02-01",
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
        default: "2011-12-22",
        China: "2011-12-22",
        India: "2011-12-22",
        Mexico: "2001-05-01",
        Philippines: "2005-07-01",
      },
      F4: {
        label: "F4 — Siblings of Adult U.S. Citizens",
        default: "2008-06-08",
        China: "2008-06-08",
        India: "2006-11-01",
        Mexico: "2001-04-08",
        Philippines: "2007-02-01",
      },
    },
  
    // =========================================================
    // FAMILY-SPONSORED DATES FOR FILING
    // =========================================================
    familyDatesForFiling: {
      F1: {
        default: "2018-03-01",
        China: "2018-03-01",
        India: "2018-03-01",
        Mexico: "2008-04-15",
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
        default: "2017-08-08",
        China: "2017-08-08",
        India: "2017-08-08",
        Mexico: "2010-05-15",
        Philippines: "2013-10-01",
      },
      F3: {
        default: "2012-11-22",
        China: "2012-11-22",
        India: "2012-11-22",
        Mexico: "2001-07-01",
        Philippines: "2006-07-15",
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
        default: "2021-11-01",
        China: "2019-02-01",
        India: "2013-11-15",
        Mexico: "2021-11-01",
        Philippines: "2021-11-01",
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
        China: "2016-09-01",
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
        China: "2016-10-01",
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
    // NOTABLE CHANGES & POLICY NOTES (April 2026)
    // =========================================================
    policyNotes: [
      "EB-2 India advances 10 months: Sep 15, 2013 → Jul 15, 2014. Significant forward movement.",
      "EB-2 Rest of World, Mexico, Philippines now CURRENT for Final Action — first time in years.",
      "EB-1 China and India advance to April 1, 2023.",
      "EB-3 Rest of World advances to June 1, 2024.",
      "USCIS will use Dates for Filing chart for all employment-based categories in April.",
      "Immigrant visa issuance rates decreased due to Presidential Proclamations 10949 and 10998.",
      "Retrogression may occur later in FY2026 as demand materializes or administration actions change.",
      "Employment Fourth Religious Workers (SR) category extended through September 30, 2026 via H.R. 7148.",
      "FY 2026 family-sponsored preference limit: 226,000. Employment-based worldwide level: at least 140,000.",
    ],
  
    // =========================================================
    // BACKWARD COMPAT — legacy "categories" shape
    // used by PriorityDateTracker component
    // =========================================================
    categories: {
      F1: {
        default: "2017-05-01",
        China: "2017-05-01",
        India: "2017-05-01",
        Mexico: "2007-02-15",
        Philippines: "2013-05-01",
      },
      F2A: {
        default: "2024-02-01",
        China: "2024-02-01",
        India: "2024-02-01",
        Mexico: "2023-02-01",
        Philippines: "2024-02-01",
      },
      F2B: {
        default: "2017-05-22",
        China: "2017-05-22",
        India: "2017-05-22",
        Mexico: "2009-02-15",
        Philippines: "2013-04-08",
      },
      F3: {
        default: "2011-12-22",
        China: "2011-12-22",
        India: "2011-12-22",
        Mexico: "2001-05-01",
        Philippines: "2005-07-01",
      },
      F4: {
        default: "2008-06-08",
        China: "2008-06-08",
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