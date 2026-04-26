import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import data
import { PROCESSING_TIMES_META } from "../data/processingTimes";
import { FEES_LAST_UPDATED } from "../data/fees";
import {
  userProfileManager,
  checkCriticalDates,
  calculateHealthScore,
} from "../data/userProfile";
import { checkPolicyUpdates } from "../data/policyTracker";
import {
  PATHWAY_VIABILITY,
  VIABILITY_LEVELS,
  PATHWAY_TO_VIABILITY_MAP,
} from "../data/pathwayViability";

// Analytics
import analytics, { EVENTS } from "../utils/analytics";
import { useFocusEffect } from "@react-navigation/native";

/**
 * Get a summary viability level for a pathway
 * Shows the "best" viability among its sub-pathways
 */
const getPathwaySummaryViability = (pathwayId) => {
  const keys = PATHWAY_TO_VIABILITY_MAP[pathwayId];
  if (!keys || keys.length === 0) return null;

  const order = { HIGH: 3, CONDITIONAL: 2, LOWER: 1 };
  let best = null;
  let bestScore = 0;

  for (const key of keys) {
    const assessment = PATHWAY_VIABILITY[key];
    if (assessment && order[assessment.viability] > bestScore) {
      bestScore = order[assessment.viability];
      best = assessment.viability;
    }
  }

  return best ? VIABILITY_LEVELS[best] : null;
};

const HomeScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [criticalWarnings, setCriticalWarnings] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [policyAlerts, setPolicyAlerts] = useState(0);
  const [checkedItems, setCheckedItems] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    analytics.track(EVENTS.SESSION_START);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [])
  );

  const loadAllData = async () => {
    try {
      const v2Profile = await AsyncStorage.getItem("@userProfile_v2");
      const profile = v2Profile ? JSON.parse(v2Profile) : null;

      if (profile) {
        setUserProfile(profile);

        const warnings = await checkCriticalDates();
        setCriticalWarnings(warnings);
        const score = await calculateHealthScore();
        setHealthScore(score);

        const policyImpact = await checkPolicyUpdates();
        setPolicyAlerts(policyImpact.totalAlerts || 0);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }

    try {
      const keys = await AsyncStorage.getAllKeys();
      const checklistKeys = keys.filter((k) =>
        k.startsWith("@checklist_progress_")
      );

      let checked = 0;
      let total = 0;

      for (const key of checklistKeys) {
        const data = JSON.parse((await AsyncStorage.getItem(key)) || "{}");
        const values = Object.values(data);
        total += values.length;
        checked += values.filter(Boolean).length;
      }

      setCheckedItems(checked);
      setTotalItems(total);
    } catch (err) {
      console.error("Failed to load progress:", err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getStatusColor = () => {
    if (!healthScore) return "#2E86AB";
    if (healthScore.status === "Critical") return "#F44336";
    if (healthScore.status === "Attention") return "#FF9800";
    return "#4CAF50";
  };

  const getStatusEmoji = () => {
    if (!healthScore) return "📊";
    if (healthScore.status === "Critical") return "🚨";
    if (healthScore.status === "Attention") return "⚠️";
    return "✅";
  };

  const getMostUrgent = () => {
    if (criticalWarnings.some((w) => w.severity === "critical")) {
      return criticalWarnings.find((w) => w.severity === "critical");
    }
    if (policyAlerts > 0) {
      return { type: "policy", count: policyAlerts };
    }
    return null;
  };

  const urgentItem = getMostUrgent();

  // =========================================================
  // PATHWAYS — now includes citizenship for GC holders
  // Citizenship pathway only shown if user is a GC holder
  // or selected citizenship as their purpose
  // =========================================================
// =========================================================
  // PATHWAYS — citizenship highlighted only for GC holders,
  // but visible to all users as a standard pathway row
  // =========================================================
  const isGCHolder =
    userProfile?.currentVisa === "GC" ||
    userProfile?.purpose === "citizenship";

  const pathways = [
    { id: "work", title: "Work-Based", icon: "💼", color: "#4CAF50" },
    { id: "family", title: "Family-Based", icon: "👨‍👩‍👧‍👦", color: "#FF9800" },
    { id: "student", title: "Student", icon: "🎓", color: "#9C27B0" },
    {
      id: "citizenship",
      title: "U.S. Citizenship",
      icon: "🇺🇸",
      color: "#1565C0",
      // Only highlighted when user is a confirmed GC holder
      isHighlighted: isGCHolder === true && userProfile !== null,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Settings")}
              style={styles.settingsButton}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
          {userProfile?.currentVisa && (
            <Text style={styles.userStatus}>
              {getVisaLabel(userProfile.currentVisa)} •{" "}
              {userProfile.location === "inside_us"
                ? "In USA"
                : "Outside USA"}
            </Text>
          )}
        </View>

        {/* PRIMARY STATUS CARD */}
        {userProfile && (
          <TouchableOpacity
            style={[
              styles.primaryCard,
              { borderTopColor: getStatusColor() },
            ]}
            onPress={() => {
              analytics.track(EVENTS.STATUS_DASHBOARD_VIEWED, {
                source: "home",
              });
              navigation.navigate("StatusDetails", {
                profile: userProfile,
                warnings: criticalWarnings,
                healthScore,
              });
            }}
          >
            <View style={styles.statusHeader}>
              <View>
                <Text style={styles.statusTitle}>Your Status</Text>
                <Text
                  style={[styles.statusScore, { color: getStatusColor() }]}
                >
                  {getStatusEmoji()} {healthScore?.status || "Loading..."}
                </Text>
              </View>
              <View
                style={[
                  styles.scoreBubble,
                  { backgroundColor: getStatusColor() },
                ]}
              >
                <Text style={styles.scoreText}>
                  {healthScore?.score || "-"}
                </Text>
              </View>
            </View>

            {urgentItem && (
              <View style={styles.urgentAlert}>
                {urgentItem.type === "policy" ? (
                  <>
                    <Text style={styles.urgentIcon}>📢</Text>
                    <Text style={styles.urgentText}>
                      {urgentItem.count} policy changes affect you
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.urgentIcon}>
                      {urgentItem.severity === "critical" ? "🚨" : "⚠️"}
                    </Text>
                    <Text style={styles.urgentText}>
                      {urgentItem.message}
                    </Text>
                  </>
                )}
              </View>
            )}

            {/* NEW: GC holder naturalization nudge */}
            {isGCHolder && !urgentItem && (
            <TouchableOpacity
                style={styles.citizenshipNudge}
                onPress={() => {
                analytics.track(EVENTS.CITIZENSHIP_PATHWAY_VIEWED, {
                    source: "home_nudge",
                    gc_years_held: userProfile?.gcYearsHeld || "unknown",
                });
                navigation.navigate("PathwayDetail", {
                    pathway: {
                    id: "citizenship",
                    title: "U.S. Citizenship",
                    icon: "🇺🇸",
                    color: "#1565C0",
                    },
                });
                }}
            >
                <Text style={styles.urgentIcon}>🇺🇸</Text>
                <Text style={styles.urgentText}>
                Ready to explore citizenship? See your naturalization options.
                </Text>
            </TouchableOpacity>
            )}

            <View style={styles.quickStats}>
              {userProfile.expiryTimeline && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Visa Expiration</Text>
                  <Text
                    style={[
                      styles.statValue,
                      userProfile.expiryTimeline === "expired" &&
                        styles.expiredText,
                    ]}
                  >
                    {getExpiryLabel(userProfile.expiryTimeline)}
                  </Text>
                </View>
              )}
              {/* NEW: GC years held shown instead of expiry for GC holders */}
              {userProfile.currentVisa === "GC" &&
                userProfile.gcYearsHeld && (
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>GC Held</Text>
                    <Text style={styles.statValue}>
                      {getGCYearsLabel(userProfile.gcYearsHeld)}
                    </Text>
                  </View>
                )}
              {criticalWarnings.length > 0 && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Alerts</Text>
                  <Text style={styles.statValue}>
                    {criticalWarnings.length}
                  </Text>
                </View>
              )}
              {policyAlerts > 0 && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Policies</Text>
                  <Text style={styles.statValue}>{policyAlerts}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* CONTROL CENTER */}
        <View style={styles.controlCenter}>
          <Text style={styles.sectionTitle}>Control Center</Text>

          <View style={styles.controlGrid}>
            <TouchableOpacity
              style={styles.controlItem}
              onPress={() => {
                analytics.track(EVENTS.POLICY_TRACKER_VIEWED, {
                  source: "home",
                });
                navigation.navigate("PolicyTracker");
              }}
            >
              <Text style={styles.controlIcon}>📢</Text>
              <Text style={styles.controlLabel}>Policy Tracker</Text>
              {policyAlerts > 0 && (
                <View style={styles.controlBadge}>
                  <Text style={styles.badgeText}>{policyAlerts}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlItem}
              onPress={() => {
                analytics.track(EVENTS.CHECKLIST_VIEWED, {
                  source: "home",
                });
                navigation.navigate("Checklist", {
                    pathway: isGCHolder ? "citizenship" : undefined,
                  });
              }}
            >
              <Text style={styles.controlIcon}>📋</Text>
              <Text style={styles.controlLabel}>Checklist</Text>
              {totalItems > 0 && (
                <View style={styles.progressMini}>
                  <View
                    style={[
                      styles.progressMiniFill,
                      { width: `${(checkedItems / totalItems) * 100}%` },
                    ]}
                  />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
  style={styles.controlItem}
  onPress={() => {
    analytics.track(EVENTS.TIMELINE_VIEWED, {
      source: "home",
    });
    // NEW: pass citizenship pathway for GC holders
    navigation.navigate("Timeline", {
      pathway: isGCHolder ? "citizenship" : undefined,
    });
  }}
>
              <Text style={styles.controlIcon}>📅</Text>
              <Text style={styles.controlLabel}>Timeline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlItem}
              onPress={() => {
                analytics.track(EVENTS.RESOURCES_VIEWED, {
                  source: "home",
                });
                navigation.navigate("Resources");
              }}
            >
              <Text style={styles.controlIcon}>🔍</Text>
              <Text style={styles.controlLabel}>Resources</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PATHWAYS WITH VIABILITY BADGES */}
        <View style={styles.pathwaysSection}>
          <Text style={styles.sectionTitle}>Immigration Pathways</Text>

          {pathways.map((pw) => {
            const viability = getPathwaySummaryViability(pw.id);

            return (
              <TouchableOpacity
                key={pw.id}
                style={[
                  styles.pathwayRow,
                  // NEW: highlighted border for citizenship when user is GC holder
                  pw.isHighlighted && styles.pathwayRowHighlighted,
                ]}

                onPress={() => {
                    analytics.track(EVENTS.PATHWAY_VIEWED, {
                      pathway: pw.id,
                      source: "home",
                    });
                    // NEW: additional citizenship-specific event
                    if (pw.id === "citizenship") {
                      analytics.track(EVENTS.CITIZENSHIP_PATHWAY_VIEWED, {
                        source: "home",
                        gc_years_held: userProfile?.gcYearsHeld || "unknown",
                      });
                    }
                    navigation.navigate("PathwayDetail", { pathway: pw });
                  }}
              >
                <Text style={styles.pathwayIcon}>{pw.icon}</Text>
                <View style={styles.pathwayContent}>
                  <Text style={styles.pathwayName}>{pw.title}</Text>
                  {/* NEW: "Your next step" label for highlighted citizenship */}
                  {pw.isHighlighted && (
                    <Text style={styles.pathwayNextStep}>
                      Your next step →
                    </Text>
                  )}
                  {viability && !pw.isHighlighted && (
                    <View
                      style={[
                        styles.viabilityPill,
                        {
                          backgroundColor: viability.bgColor,
                          borderColor: viability.color,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.viabilityDot,
                          { backgroundColor: viability.color },
                        ]}
                      />
                      <Text
                        style={[
                          styles.viabilityText,
                          { color: viability.color },
                        ]}
                      >
                        {viability.label}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.pathwayArrow}>›</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* LIFE SETUP */}
        <TouchableOpacity
          style={styles.lifeSetupCard}
          onPress={() => {
            analytics.track(EVENTS.LIFE_SETUP_VIEWED, { source: "home" });
            navigation.navigate("LifeSetup");
          }}
        >
          <Text style={styles.lifeSetupIcon}>🏡</Text>
          <View style={styles.lifeSetupContent}>
            <Text style={styles.lifeSetupTitle}>Life in America Guide</Text>
            <Text style={styles.lifeSetupText}>
              SSN • Banking • Credit • Jobs
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* HELP */}
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => {
            analytics.track("Emergency Help Tapped");
            Alert.alert(
              "Need Help?",
              "USCIS: 1-800-375-5283\nLegal Aid: immigrationadvocates.org",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Call USCIS", onPress: () => {} },
              ]
            );
          }}
        >
          <Text style={styles.helpIcon}>🆘</Text>
          <Text style={styles.helpText}>Emergency Help</Text>
        </TouchableOpacity>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Data updated: {PROCESSING_TIMES_META.lastUpdated}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// =========================================================
// HELPER FUNCTIONS
// =========================================================
const getVisaLabel = (visa) => {
  const labels = {
    F1: "F-1",
    H1B: "H-1B",
    L1: "L-1",
    B1B2: "B-1/B-2",
    J1: "J-1",
    OPT: "OPT",
    EAD: "EAD",
    GC_pending: "GC Pending",
    GC: "🟢 Green Card Holder", // NEW
    none: "No Status",
  };
  return labels[visa] || visa;
};

const getExpiryLabel = (expiry) => {
  const labels = {
    expired: "EXPIRED",
    "30days": "< 30 days",
    "90days": "< 90 days",
    "6months": "< 6 months",
    year: "< 1 year",
    safe: "1+ year",
  };
  return labels[expiry] || "Unknown";
};

// NEW: green card years held label for status card
const getGCYearsLabel = (gcYearsHeld) => {
  const labels = {
    under2: "< 2 yrs",
    "2to3": "2–3 yrs",
    "3to5": "3–5 yrs",
    over5: "5+ yrs ✅",
    military: "Military 🎖️",
  };
  return labels[gcYearsHeld] || gcYearsHeld;
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  greeting: { fontSize: 28, fontWeight: "bold", color: "#1A1A1A" },
  userStatus: { fontSize: 14, color: "#666", marginTop: 4 },

  primaryCard: {
    backgroundColor: "#FFF",
    margin: 20,
    marginTop: 15,
    borderRadius: 16,
    padding: 20,
    borderTopWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  statusTitle: { fontSize: 14, color: "#999", marginBottom: 4 },
  statusScore: { fontSize: 18, fontWeight: "600" },
  scoreBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: { color: "#FFF", fontSize: 22, fontWeight: "bold" },
  urgentAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  // NEW: citizenship nudge — same layout as urgentAlert but blue
  citizenshipNudge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8EAF6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  urgentIcon: { fontSize: 20, marginRight: 10 },
  urgentText: { flex: 1, fontSize: 14, color: "#333", fontWeight: "500" },
  quickStats: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statLabel: { fontSize: 11, color: "#999", marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: "600", color: "#333" },
  expiredText: { color: "#F44336" },

  controlCenter: { marginHorizontal: 20, marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1A1A1A",
  },
  controlGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  controlItem: {
    backgroundColor: "#FFF",
    width: "48%",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
  },
  controlIcon: { fontSize: 28, marginBottom: 8 },
  controlLabel: { fontSize: 13, fontWeight: "500", color: "#333" },
  controlBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#F44336",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: "#FFF", fontSize: 11, fontWeight: "bold" },
  progressMini: {
    width: "100%",
    height: 3,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginTop: 8,
  },
  progressMiniFill: {
    height: 3,
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },

  pathwaysSection: { marginHorizontal: 20, marginBottom: 20 },
  pathwayRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  // NEW: highlighted border for citizenship pathway when user is GC holder
  pathwayRowHighlighted: {
    borderWidth: 2,
    borderColor: "#1565C0",
    backgroundColor: "#F0F4FF",
  },
  pathwayIcon: { fontSize: 24, marginRight: 12 },
  pathwayContent: { flex: 1 },
  pathwayName: { fontSize: 15, fontWeight: "500", color: "#333" },
  // NEW: "Your next step" label
  pathwayNextStep: {
    fontSize: 11,
    color: "#1565C0",
    fontWeight: "600",
    marginTop: 2,
  },
  viabilityPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 4,
  },
  viabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  viabilityText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  pathwayArrow: { fontSize: 20, color: "#CCC" },

  lifeSetupCard: {
    backgroundColor: "#E8F4F8",
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  lifeSetupIcon: { fontSize: 28, marginRight: 12 },
  lifeSetupContent: { flex: 1 },
  lifeSetupTitle: { fontSize: 15, fontWeight: "600", color: "#2E86AB" },
  lifeSetupText: { fontSize: 13, color: "#5A9FBF", marginTop: 2 },
  arrow: { fontSize: 20, color: "#2E86AB" },

  helpButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 14,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFD6D6",
  },
  helpIcon: { fontSize: 20, marginRight: 8 },
  helpText: { fontSize: 14, fontWeight: "500", color: "#D32F2F" },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingsButton: { padding: 8 },
  settingsIcon: { fontSize: 24 },
  footer: { alignItems: "center", paddingBottom: 20, paddingTop: 10 },
  footerText: { fontSize: 11, color: "#999" },
});