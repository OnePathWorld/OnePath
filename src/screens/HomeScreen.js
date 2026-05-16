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
import { useTranslation } from "react-i18next";

// Import data
import { PROCESSING_TIMES_META } from "../data/processingTimes";
import {
  checkCriticalDates,
  calculateHealthScore,
} from "../data/userProfile";
import { checkPolicyUpdates } from "../data/policyTracker";
import {
  getViability,
  getLevel,  
  PATHWAY_TO_VIABILITY_MAP,
} from "../data/pathwayViability";

// Centralized labels (replaces local getVisaLabel/getExpiryLabel/getGCYearsLabel)
import {
  getVisaLabelShort,
  getExpiryLabel,
  getGCYearsLabel,
  getLocationLabel,
} from "../utils/labels";

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
      const assessment = getViability(key);
      if (assessment && order[assessment.viability] > bestScore) {
        bestScore = order[assessment.viability];
        best = assessment.viability;
      }
    }
    return best ? getLevel(best) : null;
  };
   

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();

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
    if (hour < 12) return t("home.greeting.morning");
    if (hour < 17) return t("home.greeting.afternoon");
    return t("home.greeting.evening");
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

  // Translate the english status string returned by calculateHealthScore.
  // healthScore.status comes from data layer as "Critical" | "Attention" | "Good".
  // We map to translation keys here so non-English users see their language.
  const getStatusText = () => {
    if (!healthScore) return t("home.status.loading");
    const map = {
      Critical: t("home.status.critical"),
      Attention: t("home.status.attention"),
      Good: t("home.status.good"),
    };
    return map[healthScore.status] || healthScore.status;
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
  // PATHWAYS — citizenship highlighted only for GC holders,
  // but visible to all users as a standard pathway row
  // =========================================================
  const isGCHolder =
    userProfile?.currentVisa === "GC" ||
    userProfile?.purpose === "citizenship";

  const pathways = [
    { id: "work", title: t("home.pathways.work"), icon: "💼", color: "#4CAF50" },
    { id: "family", title: t("home.pathways.family"), icon: "👨‍👩‍👧‍👦", color: "#FF9800" },
    { id: "student", title: t("home.pathways.student"), icon: "🎓", color: "#9C27B0" },
    {
      id: "citizenship",
      title: t("home.pathways.citizenship"),
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
              {getVisaLabelShort(userProfile.currentVisa)} •{" "}
              {getLocationLabel(userProfile.location)}
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
                <Text style={styles.statusTitle}>{t("home.status.title")}</Text>
                <Text
                  style={[styles.statusScore, { color: getStatusColor() }]}
                >
                  {getStatusEmoji()} {getStatusText()}
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
                      {t("home.alerts.policyChanges", { count: urgentItem.count })}
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

            {/* GC holder naturalization nudge */}
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
                      title: t("home.pathways.citizenship"),
                      icon: "🇺🇸",
                      color: "#1565C0",
                    },
                  });
                }}
              >
                <Text style={styles.urgentIcon}>🇺🇸</Text>
                <Text style={styles.urgentText}>
                  {t("home.alerts.citizenshipNudge")}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.quickStats}>
              {userProfile.expiryTimeline && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>
                    {t("home.stats.visaExpiration")}
                  </Text>
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
              {/* GC years held shown instead of expiry for GC holders */}
              {userProfile.currentVisa === "GC" &&
                userProfile.gcYearsHeld && (
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>{t("home.stats.gcHeld")}</Text>
                    <Text style={styles.statValue}>
                      {getGCYearsLabel(userProfile.gcYearsHeld)}
                    </Text>
                  </View>
                )}
              {criticalWarnings.length > 0 && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>{t("home.stats.alerts")}</Text>
                  <Text style={styles.statValue}>
                    {criticalWarnings.length}
                  </Text>
                </View>
              )}
              {policyAlerts > 0 && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>{t("home.stats.policies")}</Text>
                  <Text style={styles.statValue}>{policyAlerts}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* CONTROL CENTER */}
        <View style={styles.controlCenter}>
          <Text style={styles.sectionTitle}>{t("home.controlCenter.title")}</Text>

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
              <Text style={styles.controlLabel}>
                {t("home.controlCenter.policyTracker")}
              </Text>
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
              <Text style={styles.controlLabel}>
                {t("home.controlCenter.checklist")}
              </Text>
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
                navigation.navigate("Timeline", {
                  pathway: isGCHolder ? "citizenship" : undefined,
                });
              }}
            >
              <Text style={styles.controlIcon}>📅</Text>
              <Text style={styles.controlLabel}>
                {t("home.controlCenter.timeline")}
              </Text>
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
              <Text style={styles.controlLabel}>
                {t("home.controlCenter.resources")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.controlItem}
                onPress={() => {
                    analytics.track("Case Tracker Viewed", { source: "home" });
                    navigation.navigate("CaseStatusTracker");
                }}
                >
                <Text style={styles.controlIcon}>📬</Text>
                <Text style={styles.controlLabel}>
                    {t("home.controlCenter.caseTracker")}
                </Text>
            </TouchableOpacity>


          </View>
        </View>

        {/* PATHWAYS WITH VIABILITY BADGES */}
        <View style={styles.pathwaysSection}>
          <Text style={styles.sectionTitle}>{t("home.pathways.title")}</Text>

          {pathways.map((pw) => {
            const viability = getPathwaySummaryViability(pw.id);

            return (
              <TouchableOpacity
                key={pw.id}
                style={[
                  styles.pathwayRow,
                  pw.isHighlighted && styles.pathwayRowHighlighted,
                ]}
                onPress={() => {
                  analytics.track(EVENTS.PATHWAY_VIEWED, {
                    pathway: pw.id,
                    source: "home",
                  });
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
                  {pw.isHighlighted && (
                    <Text style={styles.pathwayNextStep}>
                      {t("home.pathways.yourNextStep")}
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
            <Text style={styles.lifeSetupTitle}>
              {t("home.lifeSetup.title")}
            </Text>
            <Text style={styles.lifeSetupText}>
              {t("home.lifeSetup.subtitle")}
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
              t("home.help.dialogTitle"),
              t("home.help.dialogBody"),
              [
                { text: t("common.cancel"), style: "cancel" },
                { text: t("home.help.callUscis"), onPress: () => {} },
              ]
            );
          }}
        >
          <Text style={styles.helpIcon}>🆘</Text>
          <Text style={styles.helpText}>{t("home.help.title")}</Text>
        </TouchableOpacity>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t("common.dataUpdated", { date: PROCESSING_TIMES_META.lastUpdated })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
    width: "31.5%",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
  },
  controlIcon: { fontSize: 24, marginBottom: 6 },  // was 28, marginBottom: 8
  controlLabel: { fontSize: 12, fontWeight: "500", color: "#333", textAlign: "center" },  // added textAlign
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
  pathwayRowHighlighted: {
    borderWidth: 2,
    borderColor: "#1565C0",
    backgroundColor: "#F0F4FF",
  },
  pathwayIcon: { fontSize: 24, marginRight: 12 },
  pathwayContent: { flex: 1 },
  pathwayName: { fontSize: 15, fontWeight: "500", color: "#333" },
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