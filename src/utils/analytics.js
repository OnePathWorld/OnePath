// src/utils/analytics.js
// Wraps Mixpanel React Native SDK so screens never import it directly.
// If Mixpanel fails to load, all calls silently no-op.
//
// SETUP:
//   1. npx expo install mixpanel-react-native
//   2. Call analytics.init() once in App.js

import { Mixpanel } from "mixpanel-react-native";

// =========================================================
// CONFIG
// =========================================================
const MIXPANEL_TOKEN = "08a2a97802fd2b5195b31f1d108e007e";
const TRACK_AUTOMATIC_EVENTS = true;

// =========================================================
// EVENT NAMES — use these constants, never raw strings
// =========================================================
export const EVENTS = {
  // Onboarding
  ONBOARDING_STARTED: "Onboarding Started",
  ONBOARDING_STEP: "Onboarding Step Completed",
  ONBOARDING_COMPLETED: "Onboarding Completed",
  ONBOARDING_SKIPPED: "Onboarding Skipped",

  // Pathways
  PATHWAY_VIEWED: "Pathway Viewed",
  PATHWAY_VIABILITY_TAPPED: "Viability Badge Tapped",
  VISA_CARD_EXPANDED: "Visa Card Expanded",
  FORM_LINK_TAPPED: "Form Link Tapped",

  // Timeline
  TIMELINE_VIEWED: "Timeline Viewed",
  TIMELINE_VISA_SELECTED: "Timeline Visa Selected",

  // Fees
  FEE_CALCULATOR_VIEWED: "Fee Calculator Viewed",

  // Policy
  POLICY_TRACKER_VIEWED: "Policy Tracker Viewed",
  POLICY_CARD_EXPANDED: "Policy Card Expanded",
  POLICY_TAB_SWITCHED: "Policy Tab Switched",

  // Status
  STATUS_DASHBOARD_VIEWED: "Status Dashboard Viewed",
  COMPLIANCE_UPDATED: "Compliance Tracking Updated",

  // Checklist
  CHECKLIST_VIEWED: "Checklist Viewed",
  CHECKLIST_ITEM_TOGGLED: "Checklist Item Toggled",

  // Navigation
  TAB_SWITCHED: "Tab Switched",
  LIFE_SETUP_VIEWED: "Life Setup Viewed",
  RESOURCES_VIEWED: "Resources Viewed",
  EMBASSY_SELECTOR_USED: "Embassy Selector Used",

  // Engagement
  APP_OPENED: "App Opened",
  SESSION_START: "Session Start",
};

// =========================================================
// ANALYTICS MODULE
// =========================================================

let mixpanel = null;
let isInitialized = false;

const analytics = {
  /**
   * Initialize Mixpanel. Call once in App.js.
   */
  async init() {
    try {
      mixpanel = new Mixpanel(MIXPANEL_TOKEN, TRACK_AUTOMATIC_EVENTS);
      await mixpanel.init();
      isInitialized = true;

      this.track(EVENTS.APP_OPENED);

      console.log("[Analytics] Mixpanel initialized");
    } catch (error) {
      console.warn("[Analytics] Failed to initialize:", error.message);
      isInitialized = false;
    }
  },

  /**
   * Track an event with optional properties.
   * Silently no-ops if not initialized.
   */
  track(eventName, properties = {}) {
    if (!isInitialized || !mixpanel) return;

    try {
      mixpanel.track(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.warn("[Analytics] Track failed:", error.message);
    }
  },

  /**
   * Identify a user (call after onboarding).
   * Creates a stable ID from profile data — no PII sent.
   */
  identifyUser(profile) {
    if (!isInitialized || !mixpanel) return;

    try {
      const userId = `${profile.purpose || "unknown"}_${profile.countryOfCitizenship || "unknown"}_${profile.currentVisa || "unknown"}`;

      mixpanel.identify(userId);

      // Super properties — attached to every future event
      mixpanel.registerSuperProperties({
        purpose: profile.purpose,
        country: profile.countryOfCitizenship,
        countrySpecified: profile.countrySpecified || "",
        currentVisa: profile.currentVisa,
        location: profile.location,
      });
      // User profile properties
      mixpanel.getPeople().set({
        purpose: profile.purpose,
        country: profile.countryOfCitizenship,
        visa_type: profile.currentVisa,
        location: profile.location,
        onboarded_at: new Date().toISOString(),
      });
    } catch (error) {
      console.warn("[Analytics] Identify failed:", error.message);
    }
  },

  /**
   * Track screen view.
   */
  screen(screenName, params = {}) {
    this.track("Screen Viewed", { screen: screenName, ...params });
  },

  /**
   * Start timing an event (e.g., onboarding duration).
   */
  timeStart(eventName) {
    if (!isInitialized || !mixpanel) return;
    try {
      mixpanel.timeEvent(eventName);
    } catch (error) {
      console.warn("[Analytics] TimeStart failed:", error.message);
    }
  },

  /**
   * Increment a user property counter.
   */
  increment(property, amount = 1) {
    if (!isInitialized || !mixpanel) return;
    try {
      mixpanel.getPeople().increment(property, amount);
    } catch (error) {
      console.warn("[Analytics] Increment failed:", error.message);
    }
  },

  /**
   * Reset analytics (call on app reset).
   */
  reset() {
    if (!isInitialized || !mixpanel) return;
    try {
      mixpanel.reset();
    } catch (error) {
      console.warn("[Analytics] Reset failed:", error.message);
    }
  },
};

export default analytics;