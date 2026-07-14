// src/data/userProfile.js

import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Enhanced User Profile Structure
 */
export const DEFAULT_USER_PROFILE = {
    basicInfo: {
        location: "",
        purpose: "",
        urgency: "",
        language: "",
        outsideUsStage: "",      // ← add
        hasReceiptNumber: "",    // ← add
      },
  personalInfo: {
    countryOfCitizenship: "",
    currentState: "",
    dateOfBirth: "",
    dateOfEntry: "",
  },
  currentStatus: {
    visaType: "",
    visaExpiry: "",
    i94Number: "",
    i94Expiry: "",
    eadExpiry: "",
    greenCardPending: false,
    priorityDate: "",
  },
  criticalDates: {
    passportExpiry: "",
    dsSignatureDate: "",
    nextFilingDeadline: "",
    gracePeriodsEnd: "",
    visaInterviewDate: "",
  },
  complianceTracking: {
    daysOutsideUS: 0,
    lastExitDate: "",
    lastEntryDate: "",
    optUnemploymentDays: 0,
    optStartDate: "",
    stemOptEligible: false,
    hasBeenOutOfStatus: false,
  },
  riskFactors: {
    // countryBacklog is the only live risk factor (read by calculateHealthScore
    // and caseProfileBlend). capSubject/travelPlanned/employerDependent/ageingOut
    // were computed but read nowhere — removed after a full reference trace (2026-07).
    countryBacklog: false,
  },
  documentStatus: {
    hasValidPassport: false,
    hasI20: false,
    hasI797: false,
    hasEAD: false,
    hasBirthCertificate: false,
    hasMarriageCertificate: false,
  },
  notifications: {
    criticalAlerts: true,
    expiryReminders: true,
    policyUpdates: true,
    reminderDays: 30,
  },
  profileCreated: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  profileVersion: "2.0",
};

/**
 * Normalize any profile format (flat from onboarding or nested from v2 manager)
 * into the nested structure that checkCriticalDates/calculateHealthScore expect.
 */
function normalizeProfile(raw) {
  if (!raw) return DEFAULT_USER_PROFILE;

  // Already nested format — has basicInfo or criticalDates
  if (raw.basicInfo || raw.criticalDates) {
    return {
      ...DEFAULT_USER_PROFILE,
      ...raw,
      basicInfo: { ...DEFAULT_USER_PROFILE.basicInfo, ...raw.basicInfo },
      personalInfo: { ...DEFAULT_USER_PROFILE.personalInfo, ...raw.personalInfo },
      currentStatus: { ...DEFAULT_USER_PROFILE.currentStatus, ...raw.currentStatus },
      criticalDates: { ...DEFAULT_USER_PROFILE.criticalDates, ...raw.criticalDates },
      complianceTracking: { ...DEFAULT_USER_PROFILE.complianceTracking, ...raw.complianceTracking },
      riskFactors: { ...DEFAULT_USER_PROFILE.riskFactors, ...raw.riskFactors },
      documentStatus: { ...DEFAULT_USER_PROFILE.documentStatus, ...raw.documentStatus },
      notifications: { ...DEFAULT_USER_PROFILE.notifications, ...raw.notifications },
    };
  }

  // Flat format from OnboardingScreen — map to nested
  const backlogCountries = ["india", "china", "mexico", "philippines"];

  return {
    ...DEFAULT_USER_PROFILE,
        basicInfo: {
            location: raw.location || "",
            purpose: raw.purpose || "",
            urgency: raw.urgency || "",
            language: raw.language || "",
            outsideUsStage: raw.outsideUsStage || "",      // ← add
            hasReceiptNumber: raw.hasReceiptNumber || "",  // ← add
        },
    personalInfo: {
      ...DEFAULT_USER_PROFILE.personalInfo,
      countryOfCitizenship: raw.countryOfCitizenship || "",
    },
    currentStatus: {
      ...DEFAULT_USER_PROFILE.currentStatus,
      visaType: raw.currentVisa || "",
      greenCardPending: raw.currentVisa === "GC_pending",
    },
    criticalDates: {
      ...DEFAULT_USER_PROFILE.criticalDates,
      // Flat format doesn't have specific dates — just the timeline bucket
    },
    complianceTracking: {
      ...DEFAULT_USER_PROFILE.complianceTracking,
      optUnemploymentDays: raw.complianceTracking?.optUnemploymentDays || 0,
      daysOutsideUS: raw.complianceTracking?.daysOutsideUS || 0,
      hasBeenOutOfStatus: raw.complianceRisk === "gap" ||
                          raw.complianceRisk === "overstay" ||
                          raw.complianceRisk === "unauthorized_work",
    },
    riskFactors: {
      ...DEFAULT_USER_PROFILE.riskFactors,
      countryBacklog: backlogCountries.includes(raw.countryOfCitizenship),
    },
    documentStatus: {
      ...DEFAULT_USER_PROFILE.documentStatus,
    },
    lastUpdated: new Date().toISOString(),
    profileVersion: "2.0",
  };
}

/**
 * User Profile Manager Class
 */
class UserProfileManager {
  constructor() {
    // ── @userProfile_v2 SHAPE CONTRACT ───────────────────────────────────
    // On disk this key holds the FLAT onboarding shape (top-level enum keys:
    // location, purpose, currentVisa, countryOfCitizenship, expiryTimeline,
    // urgency, complianceRisk, gcYearsHeld, …). It is WRITTEN flat by
    // OnboardingScreen, SettingsScreen, StatusDetailsScreen and index.js, and
    // READ raw-as-flat by HomeScreen, SettingsScreen, StatusDetailsScreen,
    // ChecklistScreen and policyTracker. Only this manager's read path
    // (get()/getUserProfile() → normalizeProfile) adapts it to the nested shape
    // its own consumers expect. This manager's WRITE path (save/updateSection/
    // initialize/migrate) instead emits NESTED — see the guard in save(). Those
    // writers are unreferenced today (verified 2026-07), so the shapes never
    // collide. Keep it that way, or migrate the raw flat readers first.
    this.storageKey = "@userProfile_v2";
    this.legacyKey = "@userProfile";
  }

  async initialize() {
    try {
      const v2Profile = await AsyncStorage.getItem(this.storageKey);
      if (v2Profile) {
        return normalizeProfile(JSON.parse(v2Profile));
      }

      const legacyProfile = await AsyncStorage.getItem(this.legacyKey);
      if (legacyProfile) {
        const migrated = this.migrateLegacyProfile(JSON.parse(legacyProfile));
        await this.save(migrated);
        return migrated;
      }

      return DEFAULT_USER_PROFILE;
    } catch (error) {
      console.error("Error initializing user profile:", error);
      return DEFAULT_USER_PROFILE;
    }
  }

  migrateLegacyProfile(legacy) {
    return normalizeProfile(legacy);
  }

  async save(profile) {
    // TRIPWIRE (see the shape contract on storageKey above). save() writes the
    // NESTED shape to @userProfile_v2, but several screens read that key raw as
    // FLAT. This method — and updateSection()/initialize()/migrateLegacyProfile(),
    // which all funnel through it — is currently called nowhere, so no nested
    // shape is ever persisted. If you wire it up, those raw readers will silently
    // get `undefined` for every enum field. Migrate them to getUserProfile()
    // first. Dev-only warning so the moment of adoption is loud, not silent.
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.warn(
        "[userProfile] save() persists the NESTED @userProfile_v2 shape, but " +
          "HomeScreen/SettingsScreen/StatusDetailsScreen/ChecklistScreen/policyTracker " +
          "read that key raw as FLAT. Migrate those readers to getUserProfile() " +
          "before relying on save(). See the shape-contract note in userProfile.js."
      );
    }
    try {
      const normalized = normalizeProfile(profile);
      normalized.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(normalized));

      const legacyFormat = {
        location: normalized.basicInfo.location,
        purpose: normalized.basicInfo.purpose,
        urgency: normalized.basicInfo.urgency,
        language: normalized.basicInfo.language,
      };
      await AsyncStorage.setItem(this.legacyKey, JSON.stringify(legacyFormat));

      return true;
    } catch (error) {
      console.error("Error saving user profile:", error);
      return false;
    }
  }

  async get() {
    try {
      const profile = await AsyncStorage.getItem(this.storageKey);
      return profile ? normalizeProfile(JSON.parse(profile)) : DEFAULT_USER_PROFILE;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return DEFAULT_USER_PROFILE;
    }
  }

  async updateSection(section, data) {
    try {
      const profile = await this.get();
      profile[section] = { ...profile[section], ...data };
      await this.save(profile);
      return profile;
    } catch (error) {
      console.error("Error updating profile section:", error);
      return null;
    }
  }

  /**
   * Check critical dates and return warnings
   * Safely handles missing/empty fields
   */
  async checkCriticalDates() {
    const profile = await this.get();
    const warnings = [];
    const today = new Date();

    // Check passport expiry
    const passportExpiry = profile?.criticalDates?.passportExpiry;
    if (passportExpiry) {
      const expiryDate = new Date(passportExpiry);
      const daysUntil = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));

      if (daysUntil < 180) {
        warnings.push({
          type: "passport",
          severity: daysUntil < 90 ? "critical" : "warning",
          message: `Passport expires in ${daysUntil} days`,
          daysUntil,
        });
      }
    }

    // Check visa expiry
    const visaExpiry = profile?.currentStatus?.visaExpiry;
    if (visaExpiry) {
      const expiryDate = new Date(visaExpiry);
      const daysUntil = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));

      if (daysUntil < 90) {
        warnings.push({
          type: "visa",
          severity: daysUntil < 30 ? "critical" : "warning",
          message: `Visa expires in ${daysUntil} days`,
          daysUntil,
        });
      }
    }

    // Check EAD expiry
    const eadExpiry = profile?.currentStatus?.eadExpiry;
    if (eadExpiry) {
      const expiryDate = new Date(eadExpiry);
      const daysUntil = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));

      if (daysUntil < 120) {
        warnings.push({
          type: "ead",
          severity: daysUntil < 60 ? "critical" : "warning",
          message: `EAD expires in ${daysUntil} days — File renewal now!`,
          daysUntil,
        });
      }
    }

    // Check OPT unemployment days
    const optDays = profile?.complianceTracking?.optUnemploymentDays || 0;
    if (optDays > 60) {
      warnings.push({
        type: "opt_unemployment",
        severity: "critical",
        message: `OPT unemployment: ${optDays}/90 days used`,
        daysRemaining: 90 - optDays,
      });
    }

    return warnings;
  }

  /**
   * Calculate immigration health score
   * Safely handles missing/empty fields
   */
  async calculateHealthScore() {
    const profile = await this.get();
    let score = 100;
    const issues = [];

    // Deduct points for upcoming expiries
    const warnings = await this.checkCriticalDates();
    warnings.forEach((warning) => {
      if (warning.severity === "critical") {
        score -= 20;
        issues.push(warning.message);
      } else {
        score -= 10;
      }
    });

    // Deduct for risk factors
    if (profile?.riskFactors?.countryBacklog) {
      score -= 10;
      issues.push("Subject to country backlog");
    }

    // Deduct for compliance issues
    if (profile?.complianceTracking?.hasBeenOutOfStatus) {
      score -= 25;
      issues.push("Previous out-of-status history");
    }

    return {
      score: Math.max(0, score),
      // Status enum: "Good" | "Attention" | "Critical"
      // Must match the strings consumed by HomeScreen.js and StatusDetailsScreen.js
      // (color/emoji conditionals + the home.status.* / statusDetailsScreen.status.* translation keys).
      status: score >= 80 ? "Good" : score >= 60 ? "Attention" : "Critical",
      issues,
    };
  }

  async clear() {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      await AsyncStorage.removeItem(this.legacyKey);
      return true;
    } catch (error) {
      console.error("Error clearing user profile:", error);
      return false;
    }
  }
}

// Export singleton instance
export const userProfileManager = new UserProfileManager();

// Export helper functions
export const getUserProfile = () => userProfileManager.get();
export const saveUserProfile = (profile) => userProfileManager.save(profile);
export const updateProfileSection = (section, data) =>
  userProfileManager.updateSection(section, data);
export const checkCriticalDates = () =>
  userProfileManager.checkCriticalDates();
export const calculateHealthScore = () =>
  userProfileManager.calculateHealthScore();