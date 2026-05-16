import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import analytics, { EVENTS } from "../utils/analytics";

// Centralized labels (replaces local helper functions)
import {
  getVisaLabel,
  getWorkAuthLabel,
  getCountryLabel,
  getExpiryWarning,
  getGCYearsLabelDescriptive,
} from "../utils/labels";

// i18n instance — used inside helper functions that aren't React components
import i18n from "../i18n";

// Viability data
import {
  PATHWAY_VIABILITY,
  VIABILITY_LEVELS,
  PATHWAY_TO_VIABILITY_MAP,
  getViability,
} from "../data/pathwayViability";

// =========================================================
// GUIDANCE ENGINE
// ---------------------------------------------------------
// All helper functions below use `i18n.t()` directly because they
// are not React components — they're pure functions called during
// rendering to produce structured guidance objects.
// =========================================================

// Local shorthand
const t = (key, opts) => i18n.t(key, opts);

const getGuidance = (profile) => {
  const {
    location,
    purpose,
    urgency,
    currentVisa,
    hasWorkAuth,
    countryOfCitizenship,
    expiryTimeline,
    complianceRisk,
    gcYearsHeld,
    outsideUsStage,
    hasReceiptNumber,
  } = profile;

  // Critical alerts based on status
  const criticalAlerts = [];

  if (expiryTimeline === "expired") {
    criticalAlerts.push({
      type: "critical",
      message: t("onboardingSummary.alerts.expired.message"),
      action: t("onboardingSummary.alerts.expired.action"),
    });
  } else if (expiryTimeline === "30days") {
    criticalAlerts.push({
      type: "warning",
      message: t("onboardingSummary.alerts.expiry30days.message"),
      action: t("onboardingSummary.alerts.expiry30days.action"),
    });
  }

  if (complianceRisk === "gap" || complianceRisk === "overstay") {
    criticalAlerts.push({
      type: "critical",
      message: t("onboardingSummary.alerts.outOfStatus.message"),
      action: t("onboardingSummary.alerts.outOfStatus.action"),
    });
  }

  if (hasWorkAuth === "no" && purpose === "work") {
    criticalAlerts.push({
      type: "warning",
      message: t("onboardingSummary.alerts.noWorkAuth.message"),
      action: t("onboardingSummary.alerts.noWorkAuth.action"),
    });
  }

  const backlogCountries = ["india", "china", "mexico", "philippines", "haiti"];
  const hasBacklog = backlogCountries.includes(countryOfCitizenship);

  // Purpose -> pathwaysData key mapping. The onboarding `purpose` enum uses
  // "study" but pathwaysData (immigrationData.js) keys the pathway as
  // "student" — same pattern the inside-US `case "study"` branch uses.
  // Every other purpose maps identity.
  const purposeToPathwayId = (p) => (p === "study" ? "student" : p);

  // -------------------------------------------------------------
  // OUTSIDE-US BRANCH (v1.3)
  // ---------------------------------------------------------
  // Users outside the US fall into a few distinct buckets that
  // don't map cleanly onto the inside-US purpose switch:
  //
  //   - has a pending USCIS petition → primary action is Case Tracker
  //   - just exploring / no case yet → fall through to purpose switch
  //     (which still produces useful pathway guidance)
  //   - has US visa already (returning) → fall through; expiryTimeline
  //     was captured during onboarding and the work/family/etc. branch
  //     handles it correctly
  //   - former US visa holder → fall through with a returning-traveler
  //     warning injected into criticalAlerts
  //
  // For "petition_*" stages with hasReceiptNumber === "yes", we
  // short-circuit to a Case-Tracker-first guidance object. The user's
  // stated `purpose` is preserved as a secondary action so they can
  // still navigate to the relevant pathway later.
  // -------------------------------------------------------------
  const isOutsideUsWithCase =
    location === "outside_us" &&
    (outsideUsStage === "petition_filed" ||
      outsideUsStage === "petition_approved" ||
      outsideUsStage === "interview_scheduled");

  if (isOutsideUsWithCase && hasReceiptNumber === "yes") {
    const mappedPathwayId = purpose ? purposeToPathwayId(purpose) : null;
    return {
      title: t("onboardingSummary.outsideUs.caseTracker.title"),
      summary: t(
        `onboardingSummary.outsideUs.caseTracker.summary.${outsideUsStage}`
      ),
      criticalAlerts,
      pathwayId: mappedPathwayId,

      statusInfo: {
        stage: t(`onboardingSummary.outsideUs.statusInfo.${outsideUsStage}`),
        country: countryOfCitizenship
          ? t("onboardingSummary.statusInfo.country", {
              country: getCountryLabel(countryOfCitizenship),
            })
          : null,
        backlog: hasBacklog
          ? t("onboardingSummary.statusInfo.backlogged")
          : null,
      },

      primaryAction: {
        text: t("onboardingSummary.outsideUs.caseTracker.primaryAction"),
        navigationType: "caseTracker",
      },

      secondaryAction: purpose
        ? {
            text: t(
              `onboardingSummary.outsideUs.caseTracker.secondaryAction.${purpose}`
            ),
            navigationType: "pathway",
            pathway: {
              id: mappedPathwayId,
              title: t(`onboardingSummary.${purpose}.pathway.title`),
              icon:
                purpose === "work"
                  ? "💼"
                  : purpose === "family"
                  ? "👨‍👩‍👧‍👦"
                  : purpose === "study"
                  ? "🎓"
                  : "🇺🇸",
              subtitle: t(`onboardingSummary.${purpose}.pathway.subtitle`),
              color:
                purpose === "work"
                  ? "#4CAF50"
                  : purpose === "family"
                  ? "#FF9800"
                  : purpose === "study"
                  ? "#9C27B0"
                  : "#1565C0",
              description: t(
                `onboardingSummary.${purpose}.pathway.description`
              ),
            },
          }
        : null,

      warnings: hasBacklog
        ? [t("onboardingSummary.outsideUs.warnings.backlog")]
        : [],
      recommendations: [
        t("onboardingSummary.outsideUs.recommendations.checkUscisRegularly"),
        t("onboardingSummary.outsideUs.recommendations.gatherDocs"),
        t("onboardingSummary.outsideUs.recommendations.embassyWaits"),
      ],
    };
  }

  // Petition users WITHOUT a receipt number — guide them to find it
  if (isOutsideUsWithCase && hasReceiptNumber === "no") {
    const mappedPathwayId = purpose ? purposeToPathwayId(purpose) : null;
    return {
      title: t("onboardingSummary.outsideUs.findReceipt.title"),
      summary: t("onboardingSummary.outsideUs.findReceipt.summary"),
      criticalAlerts,
      pathwayId: mappedPathwayId,

      statusInfo: {
        stage: t(`onboardingSummary.outsideUs.statusInfo.${outsideUsStage}`),
        country: countryOfCitizenship
          ? t("onboardingSummary.statusInfo.country", {
              country: getCountryLabel(countryOfCitizenship),
            })
          : null,
      },

      primaryAction: {
        text: t("onboardingSummary.outsideUs.findReceipt.primaryAction"),
        navigationType: "resources",
      },

      secondaryAction: purpose
        ? {
            text: t(
              `onboardingSummary.outsideUs.caseTracker.secondaryAction.${purpose}`
            ),
            navigationType: "pathway",
            pathway: {
              id: mappedPathwayId,
              title: t(`onboardingSummary.${purpose}.pathway.title`),
              icon:
                purpose === "work"
                  ? "💼"
                  : purpose === "family"
                  ? "👨‍👩‍👧‍👦"
                  : purpose === "study"
                  ? "🎓"
                  : "🇺🇸",
              subtitle: t(`onboardingSummary.${purpose}.pathway.subtitle`),
              color:
                purpose === "work"
                  ? "#4CAF50"
                  : purpose === "family"
                  ? "#FF9800"
                  : purpose === "study"
                  ? "#9C27B0"
                  : "#1565C0",
              description: t(
                `onboardingSummary.${purpose}.pathway.description`
              ),
            },
          }
        : null,

      warnings: [t("onboardingSummary.outsideUs.findReceipt.tipI797")],
      recommendations: [
        t("onboardingSummary.outsideUs.findReceipt.recCheckEmail"),
        t("onboardingSummary.outsideUs.findReceipt.recCheckSpouse"),
        t("onboardingSummary.outsideUs.findReceipt.recReturnLater"),
      ],
    };
  }

  // Returning visa holder — inject a heads-up alert before falling through
  if (
    location === "outside_us" &&
    outsideUsStage === "former_visa_holder"
  ) {
    criticalAlerts.unshift({
      type: "warning",
      message: t("onboardingSummary.alerts.formerVisaHolder.message"),
      action: t("onboardingSummary.alerts.formerVisaHolder.action"),
    });
  }

  switch (purpose) {
    case "work": {
      const isOnOPT = currentVisa === "OPT";
      const needsH1B = isOnOPT || currentVisa === "F1";

      return {
        title: t("onboardingSummary.work.title"),
        summary: buildWorkSummary(profile),
        criticalAlerts,
        pathwayId: "work",

        statusInfo: currentVisa && {
          current: t("onboardingSummary.statusInfo.currentStatus", {
            visa: getVisaLabel(currentVisa),
          }),
          workAuth: t("onboardingSummary.statusInfo.workAuthorization", {
            auth: getWorkAuthLabel(hasWorkAuth),
          }),
          timeline: getExpiryWarning(expiryTimeline),
        },

        primaryAction: {
          text: getWorkPrimaryAction(profile),
          navigationType: "pathway",
          pathway: {
            id: "work",
            title: t("onboardingSummary.work.pathway.title"),
            icon: "💼",
            subtitle: t("onboardingSummary.work.pathway.subtitle"),
            color: "#4CAF50",
            description: t("onboardingSummary.work.pathway.description"),
          },
        },

        secondaryAction: {
          text: needsH1B
            ? t("onboardingSummary.work.secondaryAction.h1bLotteryInfo")
            : t("onboardingSummary.work.secondaryAction.documentChecklist"),
          navigationType: needsH1B ? "timeline" : "checklist",
          pathwayId: "work",
        },

        warnings: buildWorkWarnings(profile),
        recommendations: buildWorkRecommendations(profile),
      };
    }

    case "family":
      return {
        title: t("onboardingSummary.family.title"),
        summary: buildFamilySummary(profile),
        criticalAlerts,
        pathwayId: "family",

        statusInfo: currentVisa && {
          current: t("onboardingSummary.statusInfo.currentStatus", {
            visa: getVisaLabel(currentVisa),
          }),
          country: t("onboardingSummary.statusInfo.country", {
            country: getCountryLabel(countryOfCitizenship),
          }),
          backlog: hasBacklog
            ? t("onboardingSummary.statusInfo.backlogged")
            : t("onboardingSummary.statusInfo.backlogClear"),
        },

        primaryAction: {
          text: t("onboardingSummary.family.primaryAction.viewFamilyPathways"),
          navigationType: "pathway",
          pathway: {
            id: "family",
            title: t("onboardingSummary.family.pathway.title"),
            icon: "👨‍👩‍👧‍👦",
            subtitle: t("onboardingSummary.family.pathway.subtitle"),
            color: "#FF9800",
            description: t("onboardingSummary.family.pathway.description"),
          },
        },

        secondaryAction: {
          text: hasBacklog
            ? t("onboardingSummary.family.secondaryAction.checkVisaBulletin")
            : t("onboardingSummary.family.secondaryAction.processingTimes"),
          navigationType: "timeline",
          pathwayId: "family",
        },

        warnings: buildFamilyWarnings(profile),
        recommendations: buildFamilyRecommendations(profile),
      };

    case "study": {
      const needsStatusChange =
        location === "inside_us" && currentVisa === "B1B2";

      return {
        title: t("onboardingSummary.study.title"),
        summary: buildStudySummary(profile),
        criticalAlerts,
        pathwayId: "student",

        statusInfo: currentVisa && {
          current: t("onboardingSummary.statusInfo.currentStatus", {
            visa: getVisaLabel(currentVisa),
          }),
          needsChange: needsStatusChange
            ? t("onboardingSummary.statusInfo.needsStatusChange")
            : null,
        },

        primaryAction: {
          text: t("onboardingSummary.study.primaryAction.studentVisaOptions"),
          navigationType: "pathway",
          pathway: {
            id: "student",
            title: t("onboardingSummary.study.pathway.title"),
            icon: "🎓",
            subtitle: t("onboardingSummary.study.pathway.subtitle"),
            color: "#9C27B0",
            description: t("onboardingSummary.study.pathway.description"),
          },
        },

        secondaryAction: {
          text: t("onboardingSummary.study.secondaryAction.lifeSetupGuide"),
          navigationType: "lifesetup",
        },

        warnings: buildStudyWarnings(profile),
        recommendations: buildStudyRecommendations(profile),
      };
    }

    case "protection": {
      const mustFileWithinYear = location === "inside_us";

      return {
        title: t("onboardingSummary.protection.title"),
        summary: buildProtectionSummary(profile),
        criticalAlerts: [
          ...criticalAlerts,
          mustFileWithinYear && {
            type: "critical",
            message: t("onboardingSummary.alerts.asylumDeadline.message"),
            action: t("onboardingSummary.alerts.asylumDeadline.action"),
          },
        ].filter(Boolean),
        pathwayId: "protection",

        primaryAction: {
          text:
            urgency === "immediate"
              ? t("onboardingSummary.protection.primaryAction.emergencyResources")
              : t("onboardingSummary.protection.primaryAction.protectionOptions"),
          navigationType: "resources",
        },

        secondaryAction: {
          text: t("onboardingSummary.protection.secondaryAction.legalAidResources"),
          navigationType: "resources",
        },

        resources: [
          {
            name: t("onboardingSummary.protection.resources.uscis"),
            phone: t("onboardingSummary.protection.resources.uscisPhone"),
          },
          {
            name: t("onboardingSummary.protection.resources.legalAid"),
            url: t("onboardingSummary.protection.resources.legalAidUrl"),
          },
          {
            name: t("onboardingSummary.protection.resources.unhcr"),
            url: t("onboardingSummary.protection.resources.unhcrUrl"),
          },
        ],

        warnings: [
          t("onboardingSummary.protection.warnings.immediateLegal"),
          t("onboardingSummary.protection.warnings.asylumVolatile"),
        ],
      };
    }

    case "citizenship": {
      const eligibilityAlert = buildCitizenshipEligibilityAlert(gcYearsHeld);
      if (eligibilityAlert) criticalAlerts.unshift(eligibilityAlert);

      return {
        title: t("onboardingSummary.citizenship.title"),
        summary: buildCitizenshipSummary(profile),
        criticalAlerts,
        pathwayId: "citizenship",

        statusInfo: {
          current: t("onboardingSummary.statusInfo.currentStatus", {
            visa: getVisaLabel(currentVisa || "GC"),
          }),
          gcTime: gcYearsHeld
            ? t("onboardingSummary.statusInfo.greenCardHeld", {
                years: getGCYearsLabelDescriptive(gcYearsHeld),
              })
            : null,
          country: t("onboardingSummary.statusInfo.countryOfBirth", {
            country: getCountryLabel(countryOfCitizenship),
          }),
        },

        primaryAction: {
          text: getNaturalizationPrimaryAction(gcYearsHeld),
          navigationType: "pathway",
          pathway: {
            id: "citizenship",
            title: t("onboardingSummary.citizenship.pathway.title"),
            icon: "🇺🇸",
            subtitle: t("onboardingSummary.citizenship.pathway.subtitle"),
            color: "#1565C0",
            description: t("onboardingSummary.citizenship.pathway.description"),
          },
        },

        secondaryAction: {
          text: t("onboardingSummary.citizenship.secondaryAction.n400Checklist"),
          navigationType: "checklist",
          pathwayId: "citizenship",
        },

        warnings: buildCitizenshipWarnings(profile),
        recommendations: buildCitizenshipRecommendations(profile),
      };
    }

    default:
      return {
        title: t("onboardingSummary.default.title"),
        summary: t("onboardingSummary.default.summary"),
        criticalAlerts,
        pathwayId: null,
        primaryAction: {
          text: t("onboardingSummary.default.primaryAction"),
          navigationType: "home",
        },
      };
  }
};

// =========================================================
// CITIZENSHIP HELPER FUNCTIONS
// =========================================================

function buildCitizenshipEligibilityAlert(gcYearsHeld) {
  if (gcYearsHeld === "under2") {
    return {
      type: "warning",
      message: t("onboardingSummary.alerts.citizenshipUnder2.message"),
      action: t("onboardingSummary.alerts.citizenshipUnder2.action"),
    };
  }
  if (gcYearsHeld === "2to3") {
    return {
      type: "warning",
      message: t("onboardingSummary.alerts.citizenship2to3.message"),
      action: t("onboardingSummary.alerts.citizenship2to3.action"),
    };
  }
  if (gcYearsHeld === "over5") {
    return {
      type: null,
      message: t("onboardingSummary.alerts.citizenshipOver5.message"),
      action: t("onboardingSummary.alerts.citizenshipOver5.action"),
    };
  }
  return null;
}

function buildCitizenshipSummary(profile) {
  const { gcYearsHeld } = profile;

  if (gcYearsHeld === "military") {
    return t("onboardingSummary.citizenship.summary.military");
  }
  if (gcYearsHeld === "over5") {
    return t("onboardingSummary.citizenship.summary.over5");
  }
  if (gcYearsHeld === "3to5") {
    return t("onboardingSummary.citizenship.summary.3to5");
  }
  if (gcYearsHeld === "2to3") {
    return t("onboardingSummary.citizenship.summary.2to3");
  }
  if (gcYearsHeld === "under2") {
    return t("onboardingSummary.citizenship.summary.under2");
  }
  return t("onboardingSummary.citizenship.summary.default");
}

function buildCitizenshipWarnings(profile) {
  const warnings = [];
  const { gcYearsHeld, complianceRisk } = profile;

  if (
    complianceRisk === "gap" ||
    complianceRisk === "overstay" ||
    complianceRisk === "unauthorized_work"
  ) {
    warnings.push(t("onboardingSummary.citizenship.warnings.priorViolations"));
  }

  if (complianceRisk === "denied") {
    warnings.push(t("onboardingSummary.citizenship.warnings.priorDenial"));
  }

  warnings.push(t("onboardingSummary.citizenship.warnings.extendedTrips"));
  warnings.push(t("onboardingSummary.citizenship.warnings.goodMoralCharacter"));

  if (gcYearsHeld === "3to5") {
    warnings.push(t("onboardingSummary.citizenship.warnings.threeYearMarriage"));
  }

  return warnings;
}

function buildCitizenshipRecommendations(profile) {
  const recs = [];
  const { gcYearsHeld } = profile;

  if (gcYearsHeld === "over5" || gcYearsHeld === "3to5") {
    recs.push(t("onboardingSummary.citizenship.recommendations.fileN400"));
    recs.push(t("onboardingSummary.citizenship.recommendations.studyCivics"));
    recs.push(t("onboardingSummary.citizenship.recommendations.gatherDocs"));
  } else {
    recs.push(t("onboardingSummary.citizenship.recommendations.startStudying"));
    recs.push(t("onboardingSummary.citizenship.recommendations.trackTrips"));
    recs.push(t("onboardingSummary.citizenship.recommendations.keepTaxes"));
  }

  recs.push(t("onboardingSummary.citizenship.recommendations.renewGc"));
  recs.push(t("onboardingSummary.citizenship.recommendations.consultAttorney"));

  return recs;
}

function getNaturalizationPrimaryAction(gcYearsHeld) {
  if (gcYearsHeld === "over5")
    return t("onboardingSummary.citizenship.primaryAction.startN400");
  if (gcYearsHeld === "3to5")
    return t("onboardingSummary.citizenship.primaryAction.check3Year");
  if (gcYearsHeld === "military")
    return t("onboardingSummary.citizenship.primaryAction.militaryInfo");
  return t("onboardingSummary.citizenship.primaryAction.timelineRequirements");
}

// =========================================================
// WORK / FAMILY / STUDY / PROTECTION HELPERS
// =========================================================

function buildWorkSummary(profile) {
  const { currentVisa, hasWorkAuth, countryOfCitizenship, urgency } = profile;

  if (currentVisa === "OPT") {
    return countryOfCitizenship === "india"
      ? t("onboardingSummary.work.summary.opt_india")
      : t("onboardingSummary.work.summary.opt_other");
  }

  if (countryOfCitizenship === "haiti" && currentVisa === "EAD") {
    return t("onboardingSummary.work.summary.haiti_tps");
  }

  if (hasWorkAuth === "yes_restricted") {
    return t("onboardingSummary.work.summary.restricted");
  }

  if (urgency === "immediate" && !hasWorkAuth) {
    return t("onboardingSummary.work.summary.urgentNoAuth");
  }

  return t("onboardingSummary.work.summary.default");
}

function buildWorkWarnings(profile) {
  const warnings = [];

  if (
    profile.countryOfCitizenship === "india" ||
    profile.countryOfCitizenship === "china"
  ) {
    warnings.push(t("onboardingSummary.work.warnings.backlog"));
  }

  if (profile.currentVisa === "B1B2") {
    warnings.push(t("onboardingSummary.work.warnings.cantWorkOnB1B2"));
  }

  if (
    profile.expiryTimeline === "30days" ||
    profile.expiryTimeline === "expired"
  ) {
    warnings.push(t("onboardingSummary.work.warnings.urgentExpiry"));
  }

  if (profile.currentVisa === "OPT") {
    warnings.push(t("onboardingSummary.work.warnings.optUnemployment"));
  }

  warnings.push(t("onboardingSummary.work.warnings.eadValidity"));

  return warnings;
}

function buildWorkRecommendations(profile) {
  const recs = [];

  if (profile.currentVisa === "F1" || profile.currentVisa === "OPT") {
    recs.push(t("onboardingSummary.work.recommendations.h1bLottery"));
    recs.push(t("onboardingSummary.work.recommendations.dayOneCpt"));
  }

  if (profile.hasWorkAuth === "no") {
    recs.push(t("onboardingSummary.work.recommendations.cantWorkApplyFirst"));
  }

  if (profile.countryOfCitizenship === "canada") {
    recs.push(t("onboardingSummary.work.recommendations.tnVisa"));
  }

  recs.push(t("onboardingSummary.work.recommendations.nonCapVisas"));

  return recs;
}

function buildFamilySummary(profile) {
  const { countryOfCitizenship, location, currentVisa } = profile;

  if (
    countryOfCitizenship === "mexico" ||
    countryOfCitizenship === "philippines" ||
     countryOfCitizenship === "haiti"
  ) {
    return t("onboardingSummary.family.summary.backloggedCountry");
  }

  if (location === "inside_us" && currentVisa) {
    return t("onboardingSummary.family.summary.insideUsWithVisa");
  }

  return t("onboardingSummary.family.summary.default");
}

function buildFamilyWarnings(profile) {
  const warnings = [];
  // Wait ranges are looked up by country code, then translated separately
  const backlogCountries = ["india", "china", "mexico", "philippines"];

  if (backlogCountries.includes(profile.countryOfCitizenship)) {
    const range = t(
      `onboardingSummary.family.waitRanges.${profile.countryOfCitizenship}`
    );
    warnings.push(
      t("onboardingSummary.family.warnings.expectedWait", { range })
    );
  }

  if (
    profile.complianceRisk !== "none" &&
    profile.complianceRisk !== "prefer_not"
  ) {
    warnings.push(t("onboardingSummary.family.warnings.priorIssues"));
  }

  warnings.push(t("onboardingSummary.family.warnings.proclamations"));

  return warnings;
}

function buildFamilyRecommendations() {
  return [
    t("onboardingSummary.family.recommendations.fileI130"),
    t("onboardingSummary.family.recommendations.considerEmployment"),
    t("onboardingSummary.family.recommendations.maintainStatus"),
  ];
}

function buildStudySummary(profile) {
  const { currentVisa, location } = profile;

  if (currentVisa === "B1B2" && location === "inside_us") {
    return t("onboardingSummary.study.summary.changeFromB1B2");
  }

  if (currentVisa === "F1") {
    return t("onboardingSummary.study.summary.alreadyOnF1");
  }

  return t("onboardingSummary.study.summary.default");
}

function buildStudyWarnings(profile) {
  const warnings = [];

  if (profile.currentVisa === "B1B2") {
    warnings.push(t("onboardingSummary.study.warnings.maintainUntilF1"));
    warnings.push(t("onboardingSummary.study.warnings.cantStartUntilApproved"));
  }

  return warnings;
}

function buildStudyRecommendations() {
  return [
    t("onboardingSummary.study.recommendations.sevpSchools"),
    t("onboardingSummary.study.recommendations.financialProof"),
    t("onboardingSummary.study.recommendations.fullTimeEnrollment"),
    t("onboardingSummary.study.recommendations.cptOpt"),
    t("onboardingSummary.study.recommendations.stemMajor"),
  ];
}

function buildProtectionSummary(profile) {
  if (profile.location === "inside_us") {
    return t("onboardingSummary.protection.summary.insideUs");
  }
  return t("onboardingSummary.protection.summary.outsideUs");
}

// =========================================================
// UTILITY FUNCTIONS
// =========================================================

function getWorkPrimaryAction(profile) {
  if (profile.expiryTimeline === "expired")
    return t("onboardingSummary.work.primaryAction.expiredStatus");
  if (profile.currentVisa === "OPT")
    return t("onboardingSummary.work.primaryAction.findH1bSponsor");
  if (profile.hasWorkAuth === "no")
    return t("onboardingSummary.work.primaryAction.getWorkAuth");
  return t("onboardingSummary.work.primaryAction.exploreWorkVisas");
}

// =========================================================
// URGENT FORM RECOMMENDATION
// Returns the most critical form to file based on
// visa type + expiry timeline combo
// =========================================================
function buildUrgentFormRecommendation(profile) {
  const { currentVisa, expiryTimeline } = profile;

  // Only show for urgent situations
  if (
    !expiryTimeline ||
    expiryTimeline === "safe" ||
    expiryTimeline === "year"
  ) {
    return null;
  }

  const isUrgent = expiryTimeline === "expired" || expiryTimeline === "30days";
  const isSoon = expiryTimeline === "90days" || expiryTimeline === "6months";

  // Map visa type to its color (kept here, not in JSON, since this is style)
  const colorMap = {
    H1B: "#D32F2F",
    F1: "#9C27B0",
    OPT: "#FF9800",
    L1: "#1565C0",
    J1: "#388E3C",
    B1B2: "#D32F2F",
    EAD: "#D32F2F",
    GC_pending: "#FF9800",
  };

  // Look up base translation key for this visa
  const baseKey = `onboardingSummary.urgentForm.forms.${currentVisa}`;

  // Verify this visa has a form recommendation
  // (i18n.t returns the key if missing — we check existence via the .form sub-key)
  const formNameKey = `${baseKey}.form`;
  const formName = t(formNameKey);
  if (formName === formNameKey) return null;

  return {
    form: formName,
    purpose: t(`${baseKey}.purpose`),
    fee: t(`${baseKey}.fee`),
    deadline: isUrgent
      ? t(`${baseKey}.deadlineUrgent`)
      : t(`${baseKey}.deadlineSoon`),
    tip: t(`${baseKey}.tip`),
    color: colorMap[currentVisa] || "#D32F2F",
    isUrgent,
    isSoon,
  };
}

// =========================================================
// COMPONENT
// =========================================================

const OnboardingSummaryScreen = ({ route, navigation }) => {
  const { t: tHook } = useTranslation();
  const { userProfile } = route.params || {};
  const guidance = getGuidance(userProfile || {});

  // Viability keys for the recommended pathway
  const viabilityKeys = guidance.pathwayId
    ? PATHWAY_TO_VIABILITY_MAP[guidance.pathwayId] || []
    : [];

  useEffect(() => {
    AsyncStorage.setItem("@hasLaunched", "true").catch(console.error);

    if (userProfile) {
      AsyncStorage.setItem(
        "@userProfile_v2",
        JSON.stringify(userProfile)
      ).catch(console.error);

      const legacyProfile = {
        location: userProfile.location,
        purpose: userProfile.purpose,
        urgency: userProfile.urgency,
        language: userProfile.language,
      };
      AsyncStorage.setItem(
        "@userProfile",
        JSON.stringify(legacyProfile)
      ).catch(console.error);
    }

    if (guidance.primaryAction?.pathway?.id) {
      initializePathwayProgress(guidance.primaryAction.pathway.id);
    }

    // Analytics
    analytics.screen("OnboardingSummary", { pathway: guidance.pathwayId });

    // Citizenship eligibility event
    if (
      userProfile?.purpose === "citizenship" ||
      userProfile?.currentVisa === "GC"
    ) {
      analytics.track(EVENTS.CITIZENSHIP_ELIGIBILITY_VIEWED, {
        gc_years_held: userProfile?.gcYearsHeld || "unknown",
        eligible:
          userProfile?.gcYearsHeld === "over5" ||
          userProfile?.gcYearsHeld === "3to5" ||
          userProfile?.gcYearsHeld === "military",
        route:
          userProfile?.gcYearsHeld === "military"
            ? "military"
            : userProfile?.gcYearsHeld === "3to5"
            ? "3yr_marriage"
            : userProfile?.gcYearsHeld === "over5"
            ? "5yr_standard"
            : "not_yet_eligible",
      });
    }
  }, []);

  const initializePathwayProgress = async (pathwayId) => {
    try {
      const key = `@checklist_progress_${pathwayId}`;
      const existing = await AsyncStorage.getItem(key);
      if (!existing) {
        await AsyncStorage.setItem(key, JSON.stringify({}));
      }
    } catch (error) {
      console.error("Failed to initialize pathway progress:", error);
    }
  };

  const handleNavigation = (action) => {
    if (action.navigationType === "pathway" && action.pathway) {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: "MainApp" },
            { name: "PathwayDetail", params: { pathway: action.pathway } },
          ],
        })
      );
    } else if (action.navigationType === "checklist") {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: "MainApp" },
            { name: "Checklist", params: { pathway: action.pathwayId } },
          ],
        })
      );
    } else if (action.navigationType === "timeline") {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: "MainApp" },
            { name: "Timeline", params: { pathway: action.pathwayId } },
          ],
        })
      );
    } else if (action.navigationType === "resources") {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: "MainApp" }, { name: "Resources" }],
        })
      );
    } else if (action.navigationType === "lifesetup") {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: "MainApp" }, { name: "LifeSetup" }],
        })
      );
    } else if (action.navigationType === "caseTracker") {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: "MainApp" }, { name: "CaseStatusTracker" }],
        })
      );
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "MainApp" }],
        })
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* CRITICAL ALERTS */}
          {guidance.criticalAlerts?.length > 0 && (
            <View style={styles.alertSection}>
              {guidance.criticalAlerts.map((alert, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.alertBox,
                    alert.type === "critical"
                      ? styles.criticalAlert
                      : styles.warningAlert,
                  ]}
                >
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Text style={styles.alertAction}>{alert.action}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.title}>{guidance.title}</Text>
          <Text style={styles.text}>{guidance.summary}</Text>

          {/* STATUS INFO */}
          {guidance.statusInfo && (
            <View style={styles.statusBox}>
              {Object.values(guidance.statusInfo)
                .filter(Boolean)
                .map((info, idx) => (
                  <Text key={idx} style={styles.statusText}>
                    {info}
                  </Text>
                ))}
            </View>
          )}

          {/* VIABILITY BADGES */}
          {viabilityKeys.length > 0 && (
            <View style={styles.viabilityContainer}>
              <Text style={styles.viabilityTitle}>
                {tHook("onboardingSummary.currentViability")}
              </Text>
              {viabilityKeys.map((key) => {
                const assessment = getViability(key);
                if (!assessment) return null;
                const level = assessment.level;

                return (
                  <View
                    key={key}
                    style={[
                      styles.viabilityItem,
                      { backgroundColor: level?.bgColor || "#F5F5F5" },
                    ]}
                  >
                    <View style={styles.viabilityHeader}>
                      <View
                        style={[
                          styles.viabilityDot,
                          { backgroundColor: level?.color || "#999" },
                        ]}
                      />
                      <Text
                        style={[
                          styles.viabilityLabel,
                          { color: level?.color || "#999" },
                        ]}
                      >
                        {level?.label || tHook("common.unknown")}
                      </Text>
                    </View>
                    <Text style={styles.viabilityReason}>
                      {assessment.shortReason}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* URGENT FORM CARD — shown when expiry is critical */}
          {(() => {
            const urgentForm = buildUrgentFormRecommendation(userProfile || {});
            if (!urgentForm) return null;
            return (
              <View
                style={[
                  styles.urgentFormCard,
                  { borderLeftColor: urgentForm.color },
                ]}
              >
                <View style={styles.urgentFormHeader}>
                  <Text style={styles.urgentFormIcon}>
                    {urgentForm.isUrgent ? "🚨" : "📋"}
                  </Text>
                  <View style={styles.urgentFormTitleBlock}>
                    <Text style={styles.urgentFormLabel}>
                      {urgentForm.isUrgent
                        ? tHook("onboardingSummary.urgentForm.labelUrgent")
                        : tHook("onboardingSummary.urgentForm.labelAction")}
                    </Text>
                    <Text style={styles.urgentFormName}>{urgentForm.form}</Text>
                  </View>
                </View>
                <Text style={styles.urgentFormPurpose}>
                  {urgentForm.purpose}
                </Text>
                <View style={styles.urgentFormRow}>
                  <Text style={styles.urgentFormKey}>
                    {tHook("onboardingSummary.urgentForm.feeKey")}
                  </Text>
                  <Text style={styles.urgentFormValue}>{urgentForm.fee}</Text>
                </View>
                <View style={styles.urgentFormRow}>
                  <Text style={styles.urgentFormKey}>
                    {tHook("onboardingSummary.urgentForm.deadlineKey")}
                  </Text>
                  <Text
                    style={[
                      styles.urgentFormValue,
                      urgentForm.isUrgent && styles.urgentFormValueRed,
                    ]}
                  >
                    {urgentForm.deadline}
                  </Text>
                </View>
                <View style={styles.urgentFormTip}>
                  <Text style={styles.urgentFormTipText}>
                    💡 {urgentForm.tip}
                  </Text>
                </View>
              </View>
            );
          })()}

          {/* WARNINGS */}
          {guidance.warnings?.length > 0 && (
            <View style={styles.warningBox}>
              {guidance.warnings.map((warning, idx) => (
                <Text key={idx} style={styles.warning}>
                  {warning}
                </Text>
              ))}
            </View>
          )}

          {/* RECOMMENDATIONS */}
          {guidance.recommendations?.length > 0 && (
            <View style={styles.recsBox}>
              <Text style={styles.recsTitle}>
                {tHook("onboardingSummary.recommendedActions")}
              </Text>
              {guidance.recommendations.map((rec, idx) => (
                <Text key={idx} style={styles.recItem}>
                  {rec}
                </Text>
              ))}
            </View>
          )}

          {/* PRIMARY ACTION */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              // Track N-400 intent for citizenship pathway
              if (guidance.pathwayId === "citizenship") {
                analytics.track(EVENTS.N400_INTENT_SIGNALED, {
                  cta_text: guidance.primaryAction.text,
                  gc_years_held: userProfile?.gcYearsHeld || "unknown",
                });
              }
              handleNavigation(guidance.primaryAction);
            }}
          >
            <Text style={styles.primaryButtonText}>
              {guidance.primaryAction.text}
            </Text>
          </TouchableOpacity>

          {/* SECONDARY ACTION */}
          {guidance.secondaryAction && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                // Track checklist open for citizenship pathway
                if (guidance.pathwayId === "citizenship") {
                  analytics.track(EVENTS.CITIZENSHIP_CHECKLIST_OPENED, {
                    source: "onboarding_summary",
                  });
                }
                handleNavigation(guidance.secondaryAction);
              }}
            >
              <Text style={styles.secondaryButtonText}>
                {guidance.secondaryAction.text}
              </Text>
            </TouchableOpacity>
          )}

          {/* RESOURCES — for protection seekers */}
          {guidance.resources && (
            <View style={styles.resourceBox}>
              <Text style={styles.resourceTitle}>
                {tHook("onboardingSummary.immediateHelp")}
              </Text>
              {guidance.resources.map((resource, idx) => (
                <View key={idx} style={styles.resourceItem}>
                  <Text style={styles.resourceName}>{resource.name}</Text>
                  {resource.phone && (
                    <Text style={styles.resourceContact}>
                      {resource.phone}
                    </Text>
                  )}
                  {resource.url && (
                    <Text style={styles.resourceContact}>{resource.url}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* CASE TRACKER SUGGESTION — for users likely to have or want a pending USCIS case */}
          {/* Suppressed when the primary action already routes to Case Tracker (avoids duplicate CTAs) */}
          {(() => {
            const visaSuggestsCase = [
              "F1", "H1B", "L1", "J1", "OPT", "EAD", "GC_pending", "GC", "other"
            ].includes(userProfile?.currentVisa);

            // Outside-US users who already saw a Case Tracker primary action don't need a duplicate
            const primaryAlreadyCaseTracker =
              guidance.primaryAction?.navigationType === "caseTracker";

            // Outside-US users on no_case/exploring/has_us_visa stages may want to add a future case
            const outsideUsMayWantTracker =
              userProfile?.location === "outside_us" &&
              ["no_case", "exploring", "has_us_visa", "former_visa_holder"].includes(
                userProfile?.outsideUsStage
              );

            const shouldShow =
              !primaryAlreadyCaseTracker &&
              (visaSuggestsCase || outsideUsMayWantTracker);

            if (!shouldShow) return null;

            return (
              <TouchableOpacity
                style={styles.caseTrackerSuggestion}
                onPress={() => {
                  analytics.track("Case Tracker Viewed", {
                    source: "onboarding_summary",
                  });
                  handleNavigation({ navigationType: "caseTracker" });
                }}
              >
                <Text style={styles.caseTrackerIcon}>📬</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.caseTrackerTitle}>
                    {tHook("onboardingSummary.caseTrackerSuggestion.title")}
                  </Text>
                  <Text style={styles.caseTrackerBody}>
                    {tHook("onboardingSummary.caseTrackerSuggestion.body")}
                  </Text>
                </View>
                <Text style={styles.caseTrackerArrow}>→</Text>
              </TouchableOpacity>
            );
          })()}

          {/* SKIP TO HOME */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => handleNavigation({ navigationType: "home" })}
          >
            <Text style={styles.skipText}>
              {tHook("onboardingSummary.exploreAllOptions")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OnboardingSummaryScreen;

// =========================================================
// STYLES
// =========================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  card: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 30,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  // ALERTS
  alertSection: { marginBottom: 20 },
  alertBox: { padding: 12, borderRadius: 8, marginBottom: 10 },
  criticalAlert: {
    backgroundColor: "#FFEBEE",
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  warningAlert: {
    backgroundColor: "#FFF3E0",
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  alertAction: { fontSize: 13, color: "#666" },

  // STATUS
  statusBox: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  statusText: { fontSize: 14, color: "#333", marginBottom: 4 },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 15,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 20,
  },

  // VIABILITY
  viabilityContainer: { marginBottom: 16 },
  viabilityTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  viabilityItem: { padding: 12, borderRadius: 10, marginBottom: 8 },
  viabilityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  viabilityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  viabilityLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  viabilityReason: {
    fontSize: 13,
    color: "#444",
    lineHeight: 18,
    marginLeft: 16,
  },

  // WARNINGS
  warningBox: {
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  warning: { fontSize: 14, color: "#E65100", lineHeight: 20, marginBottom: 4 },

  // RECOMMENDATIONS
  recsBox: {
    backgroundColor: "#E8F4F8",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  recsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2E86AB",
    marginBottom: 8,
  },
  recItem: { fontSize: 14, color: "#333", lineHeight: 20, marginBottom: 4 },

  // RESOURCES
  resourceBox: {
    backgroundColor: "#FFEBEE",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#C62828",
    marginBottom: 8,
  },
  resourceItem: { marginBottom: 8 },
  resourceName: { fontSize: 14, fontWeight: "500", color: "#333" },
  resourceContact: { fontSize: 13, color: "#666" },

  // BUTTONS
  primaryButton: {
    backgroundColor: "#2E86AB",
    paddingVertical: 14,
    borderRadius: 25,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 25,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#2E86AB",
  },
  secondaryButtonText: {
    color: "#2E86AB",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  skipButton: { paddingVertical: 12 },
  skipText: { color: "#999", fontSize: 14, textAlign: "center" },

  // URGENT FORM CARD
  urgentFormCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  urgentFormHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  urgentFormIcon: { fontSize: 24, marginRight: 10 },
  urgentFormTitleBlock: { flex: 1 },
  urgentFormLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#D32F2F",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  urgentFormName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  urgentFormPurpose: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
    lineHeight: 18,
  },
  urgentFormRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  urgentFormKey: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    width: 70,
  },
  urgentFormValue: {
    fontSize: 13,
    color: "#444",
    flex: 1,
    lineHeight: 18,
  },
  urgentFormValueRed: {
    color: "#D32F2F",
    fontWeight: "600",
  },
  urgentFormTip: {
    backgroundColor: "#F5F5F5",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  urgentFormTipText: {
    fontSize: 12,
    color: "#555",
    lineHeight: 17,
  },

  caseTrackerSuggestion: {
    backgroundColor: "#E3F2FD",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  caseTrackerIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  caseTrackerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E86AB",
    marginBottom: 2,
  },
  caseTrackerBody: {
    fontSize: 12,
    color: "#5A9FBF",
    lineHeight: 16,
  },
  caseTrackerArrow: {
    fontSize: 20,
    color: "#2E86AB",
    marginLeft: 8,
  },

});