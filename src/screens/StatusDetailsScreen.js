// src/screens/StatusDetailsScreen.js

import React, { useState } from "react";
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
import { getWarningsFor } from "../constants/immigrationWarnings";
import {
  PATHWAY_VIABILITY,
  VIABILITY_LEVELS,
  PATHWAY_TO_VIABILITY_MAP,
} from "../data/pathwayViability";
import analytics, { EVENTS } from "../utils/analytics";

const StatusDetailsScreen = ({ route, navigation }) => {
  const { profile, warnings = [], healthScore } = route.params || {};

  const [daysTracking, setDaysTracking] = useState({
    optUnemployment: profile?.complianceTracking?.optUnemploymentDays || 0,
    daysOutsideUS: profile?.complianceTracking?.daysOutsideUS || 0,
  });

  const [editMode, setEditMode] = useState(false);

  // -------------------------
  // IMMIGRATION WARNINGS — dynamic based on user's visa type and country
  // -------------------------
  const visaType = profile?.currentVisa || profile?.purpose || "";
  const country = profile?.countryOfCitizenship || null;
  const immigrationWarnings = getWarningsFor(visaType, country);

  // Viability for user's pathway
  const pathwayId = profile?.purpose || null;
  const viabilityKeys = pathwayId
    ? PATHWAY_TO_VIABILITY_MAP[pathwayId] || []
    : [];
    analytics.screen("StatusDetails", {
        visaType: profile?.currentVisa,
        healthStatus: healthScore?.status,
      });

  const getStatusColor = () => {
    if (!healthScore) return "#2E86AB";
    if (healthScore.status === "critical") return "#F44336";
    if (healthScore.status === "attention") return "#FF9800";
    return "#4CAF50";
  };

  const getStatusEmoji = () => {
    if (!healthScore) return "📊";
    if (healthScore.status === "critical") return "🚨";
    if (healthScore.status === "attention") return "⚠️";
    return "✅";
  };

  const updateDaysTracking = async (field, value) => {
    analytics.track(EVENTS.COMPLIANCE_UPDATED, { field, value });
    const newTracking = { ...daysTracking, [field]: value };
    setDaysTracking(newTracking);

    try {
      const profileData = await AsyncStorage.getItem("@userProfile_v2");
      if (profileData) {
        const updatedProfile = JSON.parse(profileData);
        updatedProfile.complianceTracking = {
          ...updatedProfile.complianceTracking,
          [field]: value,
        };
        await AsyncStorage.setItem(
          "@userProfile_v2",
          JSON.stringify(updatedProfile)
        );
      }
    } catch (error) {
      console.error("Error updating tracking:", error);
    }
  };

  const getComplianceStatus = () => {
    const issues = [];

    if (profile?.currentVisa === "OPT") {
      const remaining = 90 - daysTracking.optUnemployment;
      if (remaining < 30) {
        issues.push({
          type: "critical",
          text: `Only ${remaining} unemployment days remaining`,
        });
      }
    }

    if (profile?.complianceRisk && profile.complianceRisk !== "none") {
      issues.push({
        type: "warning",
        text: "Previous compliance issues detected",
      });
    }

    return issues;
  };

  const complianceIssues = getComplianceStatus();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.headerEmoji}>{getStatusEmoji()}</Text>
          <Text style={styles.headerTitle}>
            Immigration Status Dashboard
          </Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreNumber}>
              {healthScore?.score || 0}
            </Text>
            <Text style={styles.scoreLabel}>/100</Text>
          </View>
          <Text style={styles.scoreStatus}>
            Status: {healthScore?.status?.toUpperCase() || "UNKNOWN"}
          </Text>
        </View>

        {/* CRITICAL ALERTS */}
        {warnings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 Critical Alerts</Text>
            {warnings.map((warning, idx) => (
              <View key={idx} style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <Text style={styles.alertType}>
                    {warning.type.toUpperCase()}
                  </Text>
                  {warning.daysUntil !== undefined && (
                    <Text
                      style={[
                        styles.alertDays,
                        warning.daysUntil < 30 && styles.urgentText,
                      ]}
                    >
                      {warning.daysUntil} days
                    </Text>
                  )}
                </View>
                <Text style={styles.alertMessage}>{warning.message}</Text>
                <TouchableOpacity
                  style={styles.alertAction}
                  onPress={() => {
                    if (
                      warning.type === "ead" ||
                      warning.type === "visa"
                    ) {
                      navigation.navigate("Checklist", {
                        pathway: profile?.purpose || "work",
                        focusOn: "renewal",
                      });
                    }
                  }}
                >
                  <Text style={styles.alertActionText}>
                    Take Action ›
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* POLICY & EAD WARNINGS — Dynamic from immigrationWarnings.js */}
        {immigrationWarnings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📢 Policy Alerts Affecting You
            </Text>
            {immigrationWarnings.map((w) => (
              <View
                key={w.id}
                style={[
                  styles.policyWarningCard,
                  w.severity === "alert" && styles.policyAlertCard,
                  w.severity === "warning" && styles.policyWarnCard,
                ]}
              >
                <Text style={styles.policyWarningIcon}>
                  {w.severity === "alert"
                    ? "🔴"
                    : w.severity === "warning"
                    ? "🟡"
                    : "🔵"}
                </Text>
                <Text style={styles.policyWarningText}>{w.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* PATHWAY VIABILITY */}
        {viabilityKeys.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📊 Your Pathway Viability
            </Text>
            {viabilityKeys.map((key) => {
              const assessment = PATHWAY_VIABILITY[key];
              if (!assessment) return null;
              const level = VIABILITY_LEVELS[assessment.viability];

              return (
                <View
                  key={key}
                  style={[
                    styles.viabilityCard,
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
                      {level?.label}
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

        {/* CURRENT STATUS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Current Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusItemLabel}>Visa Type</Text>
              <Text style={styles.statusItemValue}>
                {getVisaLabel(profile?.currentVisa) || "Not specified"}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusItemLabel}>Work Auth</Text>
              <Text style={styles.statusItemValue}>
                {getWorkAuthLabel(profile?.hasWorkAuth) || "Not specified"}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusItemLabel}>Country</Text>
              <Text style={styles.statusItemValue}>
                {getCountryLabel(profile?.countryOfCitizenship) ||
                  "Not specified"}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusItemLabel}>Location</Text>
              <Text style={styles.statusItemValue}>
                {profile?.location === "inside_us"
                  ? "Inside US"
                  : "Outside US"}
              </Text>
            </View>
          </View>
        </View>

        {/* COMPLIANCE TRACKING */}
        {(profile?.currentVisa === "OPT" ||
          profile?.currentVisa === "F1") && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                ⏱️ Compliance Tracking
              </Text>
              <TouchableOpacity
                onPress={() => setEditMode(!editMode)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>
                  {editMode ? "Done" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>

            {profile?.currentVisa === "OPT" && (
              <View style={styles.trackingCard}>
                <Text style={styles.trackingLabel}>
                  OPT Unemployment Days
                </Text>
                <View style={styles.trackingRow}>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${(daysTracking.optUnemployment / 90) * 100}%`,
                          backgroundColor:
                            daysTracking.optUnemployment > 60
                              ? "#F44336"
                              : "#4CAF50",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.trackingValue}>
                    {daysTracking.optUnemployment} / 90
                  </Text>
                </View>
                {editMode && (
                  <View style={styles.editControls}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() =>
                        updateDaysTracking(
                          "optUnemployment",
                          Math.max(0, daysTracking.optUnemployment - 1)
                        )
                      }
                    >
                      <Text style={styles.editBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.editValue}>
                      {daysTracking.optUnemployment}
                    </Text>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() =>
                        updateDaysTracking(
                          "optUnemployment",
                          Math.min(90, daysTracking.optUnemployment + 1)
                        )
                      }
                    >
                      <Text style={styles.editBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {daysTracking.optUnemployment > 60 && (
                  <Text style={styles.warningText}>
                    ⚠️ Approaching 90-day limit! Find employment soon.
                  </Text>
                )}
              </View>
            )}

            <View style={styles.trackingCard}>
              <Text style={styles.trackingLabel}>
                Days Outside US (This Year)
              </Text>
              <View style={styles.trackingRow}>
                <Text style={styles.trackingValue}>
                  {daysTracking.daysOutsideUS} days
                </Text>
              </View>
              {editMode && (
                <View style={styles.editControls}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() =>
                      updateDaysTracking(
                        "daysOutsideUS",
                        Math.max(0, daysTracking.daysOutsideUS - 1)
                      )
                    }
                  >
                    <Text style={styles.editBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.editValue}>
                    {daysTracking.daysOutsideUS}
                  </Text>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() =>
                      updateDaysTracking(
                        "daysOutsideUS",
                        daysTracking.daysOutsideUS + 1
                      )
                    }
                  >
                    <Text style={styles.editBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              )}
              {daysTracking.daysOutsideUS > 150 && (
                <Text style={styles.warningText}>
                  ⚠️ Extended absence may affect continuous residence
                </Text>
              )}
            </View>
          </View>
        )}

        {/* UPCOMING DEADLINES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Important Dates</Text>

          {profile?.expiryTimeline && (
            <TouchableOpacity
              style={styles.deadlineCard}
              onPress={() =>
                navigation.navigate("Checklist", {
                  pathway: profile?.purpose || "work",
                })
              }
            >
              <View style={styles.deadlineRow}>
                <Text style={styles.deadlineLabel}>Status Expiry</Text>
                <Text
                  style={[
                    styles.deadlineValue,
                    profile.expiryTimeline === "expired" &&
                      styles.expiredText,
                  ]}
                >
                  {getExpiryLabel(profile.expiryTimeline)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* HEALTH SCORE BREAKDOWN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Score Breakdown</Text>
          <View style={styles.scoreBreakdown}>
            {healthScore?.issues?.map((issue, idx) => (
              <View key={idx} style={styles.issueRow}>
                <Text style={styles.issueIcon}>⚠️</Text>
                <Text style={styles.issueText}>{issue}</Text>
                <Text style={styles.issuePoints}>-10</Text>
              </View>
            ))}
            {(!healthScore?.issues ||
              healthScore.issues.length === 0) && (
              <Text style={styles.noIssues}>
                ✅ No major issues detected
              </Text>
            )}
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              navigation.navigate("Checklist", {
                pathway: profile?.purpose || "work",
              })
            }
          >
            <Text style={styles.primaryButtonText}>
              Update Documents
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              navigation.navigate("Timeline", {
                pathway: profile?.purpose || "work",
              })
            }
          >
            <Text style={styles.secondaryButtonText}>
              View Timeline
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("PolicyTracker")}
          >
            <Text style={styles.secondaryButtonText}>
              Policy Tracker
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={() =>
              Alert.alert(
                "Export Status Report",
                "Generate a PDF summary of your immigration status?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Export",
                    onPress: () => {
                      Alert.alert(
                        "Coming Soon",
                        "PDF export feature coming in next update"
                      );
                    },
                  },
                ]
              )
            }
          >
            <Text style={styles.tertiaryButtonText}>
              Export Report 📄
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper functions
const getVisaLabel = (visa) => {
  const labels = {
    F1: "F-1 Student",
    H1B: "H-1B Work",
    L1: "L-1 Transfer",
    B1B2: "B-1/B-2 Visitor",
    J1: "J-1 Exchange",
    OPT: "OPT",
    EAD: "EAD",
    GC_pending: "GC Pending",
    none: "Out of Status",
  };
  return labels[visa] || visa;
};

const getWorkAuthLabel = (auth) => {
  const labels = {
    yes_unrestricted: "✅ Unrestricted",
    yes_restricted: "⚠️ Employer-specific",
    yes_ead: "EAD Card",
    pending: "⏳ Pending",
    no: "❌ None",
  };
  return labels[auth] || auth;
};

const getCountryLabel = (country) => {
  const labels = {
    india: "🇮🇳 India",
    china: "🇨🇳 China",
    mexico: "🇲🇽 Mexico",
    philippines: "🇵🇭 Philippines",
    canada: "🇨🇦 Canada",
    uk: "🇬🇧 UK",
  };
  return labels[country] || "Other";
};

const getExpiryLabel = (expiry) => {
  const labels = {
    expired: "EXPIRED",
    "30days": "Within 30 days",
    "90days": "Within 90 days",
    "6months": "Within 6 months",
    year: "Within 1 year",
    safe: "1+ year",
  };
  return labels[expiry] || "Unknown";
};

export default StatusDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  // Header
  header: { padding: 30, alignItems: "center" },
  headerEmoji: { fontSize: 48, marginBottom: 10 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
  },
  scoreContainer: { flexDirection: "row", alignItems: "flex-end" },
  scoreNumber: { fontSize: 48, fontWeight: "bold", color: "#FFF" },
  scoreLabel: { fontSize: 24, color: "#FFF", marginBottom: 6, opacity: 0.9 },
  scoreStatus: {
    fontSize: 16,
    color: "#FFF",
    marginTop: 10,
    fontWeight: "500",
  },

  // Sections
  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1A1A1A",
  },
  editButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: "#2E86AB",
    borderRadius: 15,
  },
  editButtonText: { color: "#FFF", fontSize: 14, fontWeight: "500" },

  // Alert Cards
  alertCard: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  alertType: { fontSize: 12, fontWeight: "bold", color: "#F44336" },
  alertDays: { fontSize: 14, fontWeight: "bold" },
  urgentText: { color: "#F44336" },
  alertMessage: { fontSize: 14, color: "#333", lineHeight: 20 },
  alertAction: { marginTop: 10 },
  alertActionText: { color: "#2E86AB", fontWeight: "600", fontSize: 14 },

  // Policy Warning Cards (NEW)
  policyWarningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0F7FA",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  policyAlertCard: {
    backgroundColor: "#FFEBEE",
  },
  policyWarnCard: {
    backgroundColor: "#FFF8E1",
  },
  policyWarningIcon: {
    fontSize: 14,
    marginRight: 10,
    marginTop: 1,
  },
  policyWarningText: {
    fontSize: 13,
    color: "#333",
    flex: 1,
    lineHeight: 18,
  },

  // Viability Cards (NEW)
  viabilityCard: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  viabilityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  viabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
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

  // Status Grid
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statusItem: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    width: "48%",
    marginBottom: 12,
  },
  statusItemLabel: { fontSize: 12, color: "#666", marginBottom: 6 },
  statusItemValue: { fontSize: 14, fontWeight: "600", color: "#333" },

  // Tracking
  trackingCard: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  trackingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  trackingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginRight: 15,
  },
  progressBarFill: { height: 8, borderRadius: 4 },
  trackingValue: { fontSize: 14, fontWeight: "bold", color: "#333" },
  editControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2E86AB",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
  },
  editBtnText: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
  editValue: { fontSize: 18, fontWeight: "bold", minWidth: 50, textAlign: "center" },
  warningText: { fontSize: 13, color: "#E65100", marginTop: 10 },

  // Deadlines
  deadlineCard: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  deadlineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deadlineLabel: { fontSize: 14, color: "#666" },
  deadlineValue: { fontSize: 14, fontWeight: "600" },
  expiredText: { color: "#F44336", fontWeight: "bold" },

  // Score Breakdown
  scoreBreakdown: { backgroundColor: "#FFF", padding: 15, borderRadius: 12 },
  issueRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  issueIcon: { fontSize: 16, marginRight: 10 },
  issueText: { flex: 1, fontSize: 14, color: "#333" },
  issuePoints: { fontSize: 14, fontWeight: "bold", color: "#F44336" },
  noIssues: {
    fontSize: 14,
    color: "#4CAF50",
    textAlign: "center",
    padding: 20,
  },

  // Actions
  actionSection: { padding: 20 },
  primaryButton: {
    backgroundColor: "#2E86AB",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  secondaryButton: {
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#2E86AB",
  },
  secondaryButtonText: { color: "#2E86AB", fontSize: 16, fontWeight: "600" },
  tertiaryButton: { padding: 18, alignItems: "center" },
  tertiaryButtonText: { color: "#666", fontSize: 14, fontWeight: "500" },
});