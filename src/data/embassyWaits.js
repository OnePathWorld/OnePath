// src/data/embassyWaits.js
// Updated: May 8, 2026
// Note: Embassy wait times change frequently. These are baseline estimates.
// Users should check travel.state.gov for the most current appointment availability.

export const EMBASSY_WAITS_META = {
    lastUpdated: "May 8, 2026",
    source: "U.S. Department of State — Visa Appointment Wait Times",
    disclaimer:
      "Embassy wait times are estimates and may change frequently. Actual scheduling availability depends on demand, staffing, and policy changes. Always verify at travel.state.gov.",
    refreshFrequency: "Check weekly for changes",
  };
  
  export const EMBASSY_WAITS = {
    // =========================================================
    // F-1 STUDENT VISA
    // =========================================================
    F1: {
      India: [
        { city: "Chennai", days: 21 },
        { city: "Kolkata", days: 14 },
        { city: "New Delhi", days: 30 },
        { city: "Hyderabad", days: 60 },
        { city: "Mumbai", days: 90 },
      ],
      China: [
        { city: "Guangzhou", days: 14 },
        { city: "Shenyang", days: 21 },
        { city: "Beijing", days: 30 },
        { city: "Shanghai", days: 30 },
      ],
      Mexico: [
        { city: "Ciudad Juarez", days: 14 },
        { city: "Monterrey", days: 21 },
        { city: "Mexico City", days: 42 },
        { city: "Guadalajara", days: 30 },
      ],
      Canada: [
        { city: "Toronto", days: 30 },
        { city: "Ottawa", days: 60 },
        { city: "Vancouver", days: 75 },
      ],
      Haiti: [
        { city: "Port-au-Prince", days: 60 },
      ],
      default: [
        { city: "Check travel.state.gov", days: null },
      ],
    },
  
    // =========================================================
    // B1/B2 TOURIST / BUSINESS VISA
    // =========================================================
    B1B2: {
      India: [
        { city: "Hyderabad", days: 180 },
        { city: "Chennai", days: 210 },
        { city: "Mumbai", days: 300 },
        { city: "New Delhi", days: 365 },
      ],
      China: [
        { city: "Beijing", days: 30 },
        { city: "Shanghai", days: 30 },
        { city: "Guangzhou", days: 30 },
      ],
      Mexico: [
        { city: "Monterrey", days: 120 },
        { city: "Mexico City", days: 450 },
        { city: "Guadalajara", days: 345 },
        { city: "Ciudad Juarez", days: 465 },
      ],
      Canada: [
        { city: "Vancouver", days: 240 },
        { city: "Ottawa", days: 345 },
        { city: "Toronto", days: 480 },
      ],
      Haiti: [
        { city: "Port-au-Prince", days: 180 },
      ],
      default: [],
    },
  
    // =========================================================
    // H-1B / L-1 WORK VISAS
    // =========================================================
    H1B: {
      India: [
        { city: "New Delhi", days: 30 },
        { city: "Chennai", days: 30 },
        { city: "Mumbai", days: 60 },
        { city: "Hyderabad", days: 90 },
      ],
      China: [
        { city: "Beijing", days: 30 },
        { city: "Guangzhou", days: 30 },
        { city: "Shanghai", days: 105 },
      ],
      Mexico: [
        { city: "Ciudad Juarez", days: 14 },
        { city: "Mexico City", days: 30 },
      ],
      Canada: [
        { city: "Toronto", days: 45 },
        { city: "Vancouver", days: 60 },
        { city: "Ottawa", days: 135 },
      ],
      Haiti: [
        { city: "Port-au-Prince", days: 90 },
      ],
      default: [],
    },
  
    L1: {
      India: [
        { city: "New Delhi", days: 30 },
        { city: "Mumbai", days: 30 },
        { city: "Hyderabad", days: 90 },
      ],
      China: [
        { city: "Beijing", days: 30 },
        { city: "Shanghai", days: 105 },
      ],
      Mexico: [
        { city: "Mexico City", days: 30 },
      ],
      Canada: [
        { city: "Toronto", days: 45 },
        { city: "Ottawa", days: 135 },
      ],
      Haiti: [
        { city: "Port-au-Prince", days: 90 },
      ],
      default: [],
    },
  
    // =========================================================
    // IMMIGRANT VISAS (IV) — for consular processing
    // =========================================================
    IV: {
      India: [
        { city: "Mumbai", days: "Varies by category" },
        { city: "New Delhi", days: "Varies by category" },
      ],
      China: [
        { city: "Guangzhou", days: "Varies by category" },
      ],
      Mexico: [
        { city: "Ciudad Juarez", days: "Varies by category" },
      ],
      Haiti: [
        { city: "Port-au-Prince", days: "Varies by category" },
      ],
      default: [],
    },
  };
  
  /**
   * Helper: Get sorted embassy options for a visa type and country
   * Returns sorted by shortest wait, filtering out null/non-numeric days
   */
  export function getEmbassyOptions(visaType, country) {
    const embassies =
      EMBASSY_WAITS?.[visaType]?.[country] ||
      EMBASSY_WAITS?.[visaType]?.default ||
      [];
  
    return [...embassies]
      .filter((e) => typeof e.days === "number")
      .sort((a, b) => a.days - b.days);
  }
  
  /**
   * Helper: Get the fastest embassy for a visa type and country
   */
  export function getFastestEmbassy(visaType, country) {
    const sorted = getEmbassyOptions(visaType, country);
    return sorted.length > 0 ? sorted[0] : null;
  }
  
  export default {
    EMBASSY_WAITS,
    EMBASSY_WAITS_META,
    getEmbassyOptions,
    getFastestEmbassy,
  };