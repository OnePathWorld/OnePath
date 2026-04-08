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
import analytics, { EVENTS } from "../utils/analytics";

// Viability data
import {
  PATHWAY_VIABILITY,
  VIABILITY_LEVELS,
  PATHWAY_TO_VIABILITY_MAP,
} from "../data/pathwayViability";

// =========================================================
// GUIDANCE ENGINE
// =========================================================

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
  } = profile;

  // Critical alerts based on status
  const criticalAlerts = [];

  if (expiryTimeline === "expired") {
    criticalAlerts.push({
      type: "critical",
      message: "🔴 Your status has expired. Immediate action required!",
      action: "Consult an immigration attorney TODAY",
    });
  } else if (expiryTimeline === "30days") {
    criticalAlerts.push({
      type: "warning",
      message: "⚠️ Critical deadline approaching within 30 days",
      action: "File extensions/renewals immediately",
    });
  }

  if (complianceRisk === "gap" || complianceRisk === "overstay") {
    criticalAlerts.push({
      type: "critical",
      message: "⚠️ Out-of-status situation detected",
      action: "Legal consultation strongly recommended",
    });
  }

  if (hasWorkAuth === "no" && purpose === "work") {
    criticalAlerts.push({
      type: "warning",
      message: "📋 No work authorization — Cannot begin employment",
      action: "Must obtain proper work visa first",
    });
  }

  const backlogCountries = ["india", "china", "mexico", "philippines"];
  const hasBacklog = backlogCountries.includes(countryOfCitizenship);

  switch (purpose) {
    case "work": {
      const isOnOPT = currentVisa === "OPT";
      const needsH1B = isOnOPT || currentVisa === "F1";

      return {
        title: "Work-Based Immigration Strategy",
        summary: buildWorkSummary(profile),
        criticalAlerts,
        pathwayId: "work",

        statusInfo: currentVisa && {
          current: `Current Status: ${getVisaLabel(currentVisa)}`,
          workAuth: `Work Authorization: ${getWorkAuthLabel(hasWorkAuth)}`,
          timeline: getExpiryWarning(expiryTimeline),
        },

        primaryAction: {
          text: getWorkPrimaryAction(profile),
          navigationType: "pathway",
          pathway: {
            id: "work",
            title: "Work-Based Immigration",
            icon: "💼",
            subtitle: "H-1B, L-1, O-1 Visas",
            color: "#4CAF50",
            description: "For skilled workers and professionals",
          },
        },

        secondaryAction: {
          text: needsH1B ? "H-1B Lottery Info" : "Document Checklist",
          navigationType: needsH1B ? "timeline" : "checklist",
          pathwayId: "work",
        },

        warnings: buildWorkWarnings(profile),
        recommendations: buildWorkRecommendations(profile),
      };
    }

    case "family":
      return {
        title: "Family-Based Immigration Path",
        summary: buildFamilySummary(profile),
        criticalAlerts,
        pathwayId: "family",

        statusInfo: currentVisa && {
          current: `Current Status: ${getVisaLabel(currentVisa)}`,
          country: `Country: ${getCountryLabel(countryOfCitizenship)}`,
          backlog: hasBacklog
            ? "⚠️ Subject to country quota backlogs"
            : "✅ Current priority dates",
        },

        primaryAction: {
          text: "View Family Pathways",
          navigationType: "pathway",
          pathway: {
            id: "family",
            title: "Family-Based Immigration",
            icon: "👨‍👩‍👧‍👦",
            subtitle: "Marriage, Parents, Siblings",
            color: "#FF9800",
            description: "Reunite with family members",
          },
        },

        secondaryAction: {
          text: hasBacklog ? "Check Visa Bulletin" : "Processing Times",
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
        title: "Student Pathway Guide",
        summary: buildStudySummary(profile),
        criticalAlerts,
        pathwayId: "student",

        statusInfo: currentVisa && {
          current: `Current Status: ${getVisaLabel(currentVisa)}`,
          needsChange: needsStatusChange
            ? "⚠️ Need change of status from B-1/B-2"
            : null,
        },

        primaryAction: {
          text: "Student Visa Options",
          navigationType: "pathway",
          pathway: {
            id: "student",
            title: "Student Pathway",
            icon: "🎓",
            subtitle: "F-1, J-1 Visas",
            color: "#9C27B0",
            description: "Study in the United States",
          },
        },

        secondaryAction: {
          text: "Life Setup Guide",
          navigationType: "lifesetup",
        },

        warnings: buildStudyWarnings(profile),
        recommendations: buildStudyRecommendations(profile),
      };
    }

    case "protection": {
      const mustFileWithinYear = location === "inside_us";

      return {
        title: "Protection & Humanitarian Relief",
        summary: buildProtectionSummary(profile),
        criticalAlerts: [
          ...criticalAlerts,
          mustFileWithinYear && {
            type: "critical",
            message: "⏰ Asylum must be filed within 1 year of arrival",
            action: "Consult attorney immediately",
          },
        ].filter(Boolean),
        pathwayId: "protection",

        primaryAction: {
          text:
            urgency === "immediate"
              ? "🆘 Emergency Resources"
              : "Protection Options",
          navigationType: "resources",
        },

        secondaryAction: {
          text: "Legal Aid Resources",
          navigationType: "resources",
        },

        resources: [
          { name: "USCIS", phone: "1-800-375-5283" },
          { name: "Legal Aid", url: "immigrationadvocates.org" },
          { name: "UNHCR", url: "help.unhcr.org" },
        ],

        warnings: [
          "⚠️ Protection cases require immediate legal assistance",
          "⚠️ Asylum policy environment is currently volatile — seek up-to-date legal counsel",
        ],
      };
    }

    default:
      return {
        title: "Your Immigration Journey",
        summary:
          "Let's explore your options based on your current situation.",
        criticalAlerts,
        pathwayId: null,
        primaryAction: {
          text: "Explore All Pathways",
          navigationType: "home",
        },
      };
  }
};

// =========================================================
// HELPER FUNCTIONS — personalized messages
// =========================================================

function buildWorkSummary(profile) {
  const { currentVisa, hasWorkAuth, countryOfCitizenship, urgency } = profile;

  if (currentVisa === "OPT") {
    return (
      "You're on OPT — time to find an H-1B sponsor. The FY2027 lottery registration ran March 4–19, 2026. " +
      "Note: USCIS now uses a wage-weighted selection process that favors higher-paid positions. " +
      (countryOfCitizenship === "india"
        ? "India has significant EB-2/EB-3 backlogs (12+ years)."
        : "Start preparing your petition early.")
    );
  }

  if (hasWorkAuth === "yes_restricted") {
    return "Your work authorization is tied to a specific employer. Changing jobs requires a new petition.";
  }

  if (urgency === "immediate" && !hasWorkAuth) {
    return "⚠️ Without work authorization, you cannot begin employment. Premium processing (now $2,965) can expedite some visas to 15 days.";
  }

  return "Employment-based immigration requires employer sponsorship. Start by finding an employer willing to sponsor your visa.";
}

function buildWorkWarnings(profile) {
  const warnings = [];

  if (
    profile.countryOfCitizenship === "india" ||
    profile.countryOfCitizenship === "china"
  ) {
    warnings.push(
      "📊 EB-2/EB-3 green cards have 12+ year waits for your country"
    );
  }

  if (profile.currentVisa === "B1B2") {
    warnings.push("⚠️ Cannot work on B-1/B-2 status — visa change required");
  }

  if (
    profile.expiryTimeline === "30days" ||
    profile.expiryTimeline === "expired"
  ) {
    warnings.push("🔴 Urgent: Address expiring/expired status immediately");
  }

  if (profile.currentVisa === "OPT") {
    warnings.push("⏰ OPT has 90-day unemployment limit — track carefully");
  }

  // EAD validity warning for anyone with pending I-485
  warnings.push(
    "📋 EAD validity reduced to 18 months (from 5 years) for adjustment-of-status applicants as of Dec 2025"
  );

  return warnings;
}

function buildWorkRecommendations(profile) {
  const recs = [];

  if (profile.currentVisa === "F1" || profile.currentVisa === "OPT") {
    recs.push("✅ Apply for H-1B lottery (March annually — now wage-weighted)");
    recs.push("✅ Consider Day-1 CPT programs as backup");
  }

  if (profile.hasWorkAuth === "no") {
    recs.push("📋 Cannot work without authorization — apply first");
  }

  if (profile.countryOfCitizenship === "canada") {
    recs.push("🍁 Consider TN visa — faster than H-1B for Canadians");
  }

  recs.push("💡 L-1 and O-1 visas are not cap-subject — explore if eligible");

  return recs;
}

function buildFamilySummary(profile) {
  const { countryOfCitizenship, location, currentVisa } = profile;

  if (
    countryOfCitizenship === "mexico" ||
    countryOfCitizenship === "philippines"
  ) {
    return "⚠️ Your country has significant family preference backlogs. Immediate relatives (spouse/parents of USC) have no quota limits, but other categories can take 10-20 years.";
  }

  if (location === "inside_us" && currentVisa) {
    return "You may be able to adjust status without leaving the U.S. if you maintain legal status and a visa becomes available.";
  }

  return "Family sponsorship is a stable path but can take several years depending on your relationship and country of birth.";
}

function buildFamilyWarnings(profile) {
  const warnings = [];
  const backlogCountries = {
    india: "5-15 years",
    china: "5-12 years",
    mexico: "10-20 years",
    philippines: "10-15 years",
  };

  if (backlogCountries[profile.countryOfCitizenship]) {
    warnings.push(
      `⏰ Expected wait: ${backlogCountries[profile.countryOfCitizenship]} for family preferences`
    );
  }

  if (
    profile.complianceRisk !== "none" &&
    profile.complianceRisk !== "prefer_not"
  ) {
    warnings.push("⚠️ Previous immigration issues may affect eligibility");
  }

  warnings.push(
    "📋 Presidential Proclamations have impacted visa issuance rates for certain nationalities — retrogression possible in FY2026"
  );

  return warnings;
}

function buildFamilyRecommendations() {
  return [
    "📄 File I-130 as soon as possible to establish priority date",
    "💼 Consider employment-based options in parallel",
    "📋 Maintain legal status while waiting",
  ];
}

function buildStudySummary(profile) {
  const { currentVisa, location } = profile;

  if (currentVisa === "B1B2" && location === "inside_us") {
    return "You'll need to change status from B-1/B-2 to F-1. Apply to a SEVP-certified school first, then file I-539 for change of status.";
  }

  if (currentVisa === "F1") {
    return "You're already on F-1. Consider OPT after graduation (apply 90 days before), and explore H-1B options with potential employers. STEM OPT adds 24 months.";
  }

  return "F-1 student visa allows study and limited work (CPT/OPT). After graduation, you can use OPT for practical training and bridge to H-1B.";
}

function buildStudyWarnings(profile) {
  const warnings = [];

  if (profile.currentVisa === "B1B2") {
    warnings.push("📚 Must maintain status until F-1 approved");
    warnings.push("⏰ Cannot start school until status change approved");
  }

  return warnings;
}

function buildStudyRecommendations() {
  return [
    "🎓 Apply to SEVP-certified schools only",
    "💰 Show proof of financial support",
    "📋 Maintain full-time enrollment",
    "💼 Use CPT/OPT for work experience",
    "🔬 Choose a STEM major for 36 months total OPT",
  ];
}

function buildProtectionSummary(profile) {
  if (profile.location === "inside_us") {
    return (
      "Asylum must be filed within 1 year of arrival. You can apply for work authorization 150 days after filing. " +
      "Note: EAD validity for asylum applicants is now 18 months max, and auto-extensions have been eliminated. " +
      "The process is complex — legal representation strongly recommended."
    );
  }
  return (
    "Various protection programs exist including refugee resettlement and humanitarian parole. " +
    "Contact UNHCR or a resettlement agency."
  );
}

// =========================================================
// UTILITY FUNCTIONS
// =========================================================

function getVisaLabel(visa) {
  const labels = {
    F1: "F-1 Student",
    H1B: "H-1B Work",
    L1: "L-1 Transfer",
    B1B2: "B-1/B-2 Visitor",
    J1: "J-1 Exchange",
    OPT: "OPT Work Permit",
    EAD: "EAD Holder",
    GC_pending: "Green Card Pending",
    none: "Out of Status",
  };
  return labels[visa] || visa;
}

function getWorkAuthLabel(workAuth) {
  const labels = {
    yes_unrestricted: "✅ Unrestricted",
    yes_restricted: "⚠️ Employer-specific",
    yes_ead: "EAD Card",
    pending: "Pending",
    no: "❌ None",
  };
  return labels[workAuth] || workAuth;
}

function getCountryLabel(country) {
  const labels = {
    india: "🇮🇳 India",
    china: "🇨🇳 China",
    mexico: "🇲🇽 Mexico",
    philippines: "🇵🇭 Philippines",
    canada: "🇨🇦 Canada",
    uk: "🇬🇧 UK",
  };
  return labels[country] || "Other";
}

function getExpiryWarning(expiry) {
  const warnings = {
    expired: "🔴 EXPIRED — Immediate action required!",
    "30days": "⚠️ Expires within 30 days",
    "90days": "📅 Expires within 90 days",
    "6months": "📆 Expires within 6 months",
  };
  return warnings[expiry] || null;
}

function getWorkPrimaryAction(profile) {
  if (profile.expiryTimeline === "expired") return "🆘 Address Expired Status";
  if (profile.currentVisa === "OPT") return "Find H-1B Sponsor";
  if (profile.hasWorkAuth === "no") return "Get Work Authorization";
  return "Explore Work Visas";
}

// =========================================================
// COMPONENT
// =========================================================

const OnboardingSummaryScreen = ({ route, navigation }) => {
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
              <Text style={styles.viabilityTitle}>Current Viability</Text>
              {viabilityKeys.map((key) => {
                const assessment = PATHWAY_VIABILITY[key];
                if (!assessment) return null;
                const level = VIABILITY_LEVELS[assessment.viability];

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
                        {level?.label || "Unknown"}
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
              <Text style={styles.recsTitle}>Recommended Actions</Text>
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
            onPress={() => handleNavigation(guidance.primaryAction)}
          >
            <Text style={styles.primaryButtonText}>
              {guidance.primaryAction.text}
            </Text>
          </TouchableOpacity>

          {/* SECONDARY ACTION */}
          {guidance.secondaryAction && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => handleNavigation(guidance.secondaryAction)}
            >
              <Text style={styles.secondaryButtonText}>
                {guidance.secondaryAction.text}
              </Text>
            </TouchableOpacity>
          )}

          {/* RESOURCES — for protection seekers */}
          {guidance.resources && (
            <View style={styles.resourceBox}>
              <Text style={styles.resourceTitle}>🆘 Immediate Help</Text>
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

          {/* SKIP TO HOME */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => handleNavigation({ navigationType: "home" })}
          >
            <Text style={styles.skipText}>Explore All Options</Text>
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
  alertMessage: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 4 },
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
  viabilityHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  viabilityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  viabilityLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  viabilityReason: { fontSize: 13, color: "#444", lineHeight: 18, marginLeft: 16 },

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
  recsTitle: { fontSize: 15, fontWeight: "600", color: "#2E86AB", marginBottom: 8 },
  recItem: { fontSize: 14, color: "#333", lineHeight: 20, marginBottom: 4 },

  // RESOURCES
  resourceBox: {
    backgroundColor: "#FFEBEE",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  resourceTitle: { fontSize: 16, fontWeight: "600", color: "#C62828", marginBottom: 8 },
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
});