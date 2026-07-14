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
import { useTranslation } from "react-i18next";
import {
  getWarningsFor,
  getWarningMessage,
} from "../constants/immigrationWarnings";
import {
  getViability,
  getViabilityKeys,
} from "../data/pathwayViability";
import {
  getVisaLabel,
  getWorkAuthLabel,
  getCountryLabel,
  getExpiryLabel,
} from "../utils/labels";
import analytics, { EVENTS } from "../utils/analytics";
import {
  getProfileNextAction,
  NEXT_ACTION_VISUALS,
} from "../utils/profileNextAction";
import { assessPathway } from "../data/travelProclamation";
import { getCountryTips } from "../data/countrySpecificTips";

const StatusDetailsScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
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
  const countryTips = country
    ? getCountryTips(country, profile).filter((tip) => !tip.isProclamation)
    : [];
  const immigrationWarnings = getWarningsFor(visaType, country);

  // Viability for user's pathway (country-filtered: drops DV where ineligible)
  const pathwayId = profile?.purpose || null;
  const viabilityKeys = getViabilityKeys(pathwayId, country);
  
  analytics.screen("StatusDetails", {
    visaType: profile?.currentVisa,
    healthStatus: healthScore?.status,
  });

  // Header action: prefer a concrete dated warning (a hard deadline) if one
  // exists; otherwise derive a tailored action from the profile. The numeric
  // health score is no longer shown — the header now leads with what to DO.
  // Color + emoji follow the action's urgency, so an "apply for citizenship"
  // (prepare) never gets painted like an emergency and an imminent expiry does.
  const nextAction = (() => {
    if (warnings.length > 0) {
      const urgent = warnings.reduce((a, b) =>
        (a.daysUntil ?? Infinity) <= (b.daysUntil ?? Infinity) ? a : b
      );
      return {
        text: urgent.message,
        urgency: urgent.severity === "critical" ? "action" : "prepare",
      };
    }
    const a = getProfileNextAction(profile);
    return { text: t(a.templateKey, a.fallback), urgency: a.urgency };
  })();

  const actionVisuals =
    NEXT_ACTION_VISUALS[nextAction.urgency] || NEXT_ACTION_VISUALS.monitor;

  const getStatusColor = () => actionVisuals.color;
  const getStatusEmoji = () => actionVisuals.emoji;
  const getNextAction = () => nextAction.text;

  // Inside-US / Outside-US display
  const getLocationLabel = () => {
    if (profile?.location === "inside_us") {
      return t("statusDetailsScreen.statusGrid.insideUs");
    }
    return t("statusDetailsScreen.statusGrid.outsideUs");
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.headerEmoji}>{getStatusEmoji()}</Text>
          <Text style={styles.headerTitle}>
            {t("statusDetailsScreen.headerTitle")}
          </Text>
          <Text style={styles.nextActionText}>{getNextAction()}</Text>
        </View>

        {/* CRITICAL ALERTS */}
        {warnings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("statusDetailsScreen.sections.criticalAlerts")}
            </Text>
            {warnings.map((warning, idx) => (
              <View key={idx} style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <Text style={styles.alertType}>
                    {warning.type?.toUpperCase()}
                  </Text>
                  {warning.daysUntil !== undefined && (
                    <Text
                      style={[
                        styles.alertDays,
                        warning.daysUntil < 30 && styles.urgentText,
                      ]}
                    >
                      {t("statusDetailsScreen.alertDays", {
                        count: warning.daysUntil,
                      })}
                    </Text>
                  )}
                </View>
                <Text style={styles.alertMessage}>{warning.message}</Text>
                <TouchableOpacity
                  style={styles.alertAction}
                  onPress={() => {
                    if (warning.type === "ead" || warning.type === "visa") {
                      navigation.navigate("Checklist", {
                        pathway: profile?.purpose || "work",
                        focusOn: "renewal",
                      });
                    }
                  }}
                >
                  <Text style={styles.alertActionText}>
                    {t("statusDetailsScreen.takeAction")}
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
              {t("statusDetailsScreen.sections.policyAlerts")}
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
                <Text style={styles.policyWarningText}>
                  {getWarningMessage(w)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* PATHWAY VIABILITY */}
        {viabilityKeys.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("statusDetailsScreen.sections.pathwayViability")}
            </Text>
            {viabilityKeys.map((key) => {
              const assessment = getViability(key);
              if (!assessment) return null;
              const level = assessment.level;

            const gate = country
                ? assessPathway({ countryValue: country, pathwayKey: key })
                : null;

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

                               {/* ── add this ── travel-proclamation gate notice */}
                  {gate && gate.severity !== "none" && (
                    <View
                      style={[
                        styles.proclamationNotice,
                        { backgroundColor: gate.level.bgColor, borderColor: gate.level.color },
                      ]}
                    >
                      <Text style={[styles.proclamationLabel, { color: gate.level.color }]}>
                        {gate.blocked ? "⛔ " : "⚠️ "}{gate.level.label}
                      </Text>
                      <Text style={styles.proclamationReason}>{gate.reason}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* COUNTRY GUIDANCE */}
        {countryTips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("statusDetailsScreen.sections.countryGuidance")}
            </Text>
            {countryTips.map((tip) => (
              <View key={tip.id} style={styles.tipCard}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipBody}>{tip.body}</Text>
              </View>
            ))}
          </View>
        )}


        {/* CURRENT STATUS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("statusDetailsScreen.sections.currentStatus")}
          </Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusItemLabel}>
                {t("statusDetailsScreen.statusGrid.visaType")}
              </Text>
              <Text style={styles.statusItemValue}>
                {profile?.currentVisa
                  ? getVisaLabel(profile.currentVisa)
                  : t("statusDetailsScreen.statusGrid.notSpecified")}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusItemLabel}>
                {t("statusDetailsScreen.statusGrid.workAuth")}
              </Text>
              <Text style={styles.statusItemValue}>
                {profile?.hasWorkAuth
                  ? getWorkAuthLabel(profile.hasWorkAuth)
                  : t("statusDetailsScreen.statusGrid.notSpecified")}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusItemLabel}>
                {t("statusDetailsScreen.statusGrid.country")}
              </Text>
              <Text style={styles.statusItemValue}>
                {profile?.countryOfCitizenship
                  ? getCountryLabel(profile.countryOfCitizenship)
                  : t("statusDetailsScreen.statusGrid.notSpecified")}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusItemLabel}>
                {t("statusDetailsScreen.statusGrid.location")}
              </Text>
              <Text style={styles.statusItemValue}>{getLocationLabel()}</Text>
            </View>
          </View>
        </View>

        {/* COMPLIANCE TRACKING */}
        {(profile?.currentVisa === "OPT" ||
          profile?.currentVisa === "F1") && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {t("statusDetailsScreen.sections.complianceTracking")}
              </Text>
              <TouchableOpacity
                onPress={() => setEditMode(!editMode)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>
                  {editMode
                    ? t("statusDetailsScreen.compliance.doneButton")
                    : t("statusDetailsScreen.compliance.editButton")}
                </Text>
              </TouchableOpacity>
            </View>

            {profile?.currentVisa === "OPT" && (
              <View style={styles.trackingCard}>
                <Text style={styles.trackingLabel}>
                  {t("statusDetailsScreen.compliance.optUnemploymentDays")}
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
                    {t("statusDetailsScreen.compliance.optProgress", {
                      used: daysTracking.optUnemployment,
                    })}
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
                    {t("statusDetailsScreen.compliance.approachingLimit")}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.trackingCard}>
              <Text style={styles.trackingLabel}>
                {t("statusDetailsScreen.compliance.daysOutsideUs")}
              </Text>
              <View style={styles.trackingRow}>
                <Text style={styles.trackingValue}>
                  {t("statusDetailsScreen.compliance.daysSuffix", {
                    count: daysTracking.daysOutsideUS,
                  })}
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
                  {t("statusDetailsScreen.compliance.extendedAbsence")}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* UPCOMING DEADLINES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("statusDetailsScreen.sections.importantDates")}
          </Text>

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
                <Text style={styles.deadlineLabel}>
                  {t("statusDetailsScreen.statusExpiry")}
                </Text>
                <Text
                  style={[
                    styles.deadlineValue,
                    profile.expiryTimeline === "expired" && styles.expiredText,
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
          <Text style={styles.sectionTitle}>
            {t("statusDetailsScreen.sections.scoreBreakdown")}
          </Text>
          <View style={styles.scoreBreakdown}>
            {healthScore?.issues?.map((issue, idx) => (
              <View key={idx} style={styles.issueRow}>
                <Text style={styles.issueIcon}>⚠️</Text>
                <Text style={styles.issueText}>{issue}</Text>
                <Text style={styles.issuePoints}>
                  {t("statusDetailsScreen.issuePoints")}
                </Text>
              </View>
            ))}
            {(!healthScore?.issues || healthScore.issues.length === 0) && (
              <Text style={styles.noIssues}>
                {t("statusDetailsScreen.noIssues")}
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
              {t("statusDetailsScreen.actions.updateDocuments")}
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
              {t("statusDetailsScreen.actions.viewTimeline")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("PolicyTracker")}
          >
            <Text style={styles.secondaryButtonText}>
              {t("statusDetailsScreen.actions.policyTracker")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={() =>
              Alert.alert(
                t("statusDetailsScreen.exportDialog.title"),
                t("statusDetailsScreen.exportDialog.body"),
                [
                  { text: t("common.cancel"), style: "cancel" },
                  {
                    text: t("statusDetailsScreen.exportDialog.export"),
                    onPress: () => {
                      Alert.alert(
                        t("statusDetailsScreen.exportDialog.comingSoonTitle"),
                        t("statusDetailsScreen.exportDialog.comingSoonBody")
                      );
                    },
                  },
                ]
              )
            }
          >
            <Text style={styles.tertiaryButtonText}>
              {t("statusDetailsScreen.actions.exportReport")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  nextActionText: {
    fontSize: 17,
    color: "#FFF",
    marginTop: 8,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 23,
  },

  // Sections
  section: {
    backgroundColor: "#FFF",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  // Critical Alerts
  alertCard: {
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  alertType: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E65100",
    letterSpacing: 0.5,
  },
  alertDays: { fontSize: 12, color: "#666", fontWeight: "600" },
  urgentText: { color: "#F44336" },
  alertMessage: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
    lineHeight: 20,
  },
  alertAction: { alignSelf: "flex-end" },
  alertActionText: { color: "#2E86AB", fontSize: 13, fontWeight: "600" },

  // Policy Warnings
  policyWarningCard: {
    flexDirection: "row",
    backgroundColor: "#FAFAFA",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: "flex-start",
  },
  policyAlertCard: { backgroundColor: "#FFEBEE" },
  policyWarnCard: { backgroundColor: "#FFF8E1" },
  policyWarningIcon: { fontSize: 16, marginRight: 8, marginTop: 2 },
  policyWarningText: {
    flex: 1,
    fontSize: 13,
    color: "#444",
    lineHeight: 18,
  },

  // Viability
  viabilityCard: { padding: 12, borderRadius: 10, marginBottom: 8 },
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

  // Current Status grid
  statusGrid: { flexDirection: "row", flexWrap: "wrap" },
  statusItem: { width: "50%", padding: 8 },
  statusItemLabel: { fontSize: 11, color: "#999", marginBottom: 2 },
  statusItemValue: { fontSize: 14, color: "#1A1A1A", fontWeight: "500" },

  // Compliance Tracking
  trackingCard: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  trackingLabel: { fontSize: 13, color: "#666", marginBottom: 8 },
  trackingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trackingValue: { fontSize: 14, fontWeight: "600", color: "#1A1A1A" },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginRight: 12,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 4 },
  warningText: {
    fontSize: 12,
    color: "#F44336",
    marginTop: 8,
    fontWeight: "500",
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#E8F4F8",
    borderRadius: 4,
  },
  editButtonText: { fontSize: 12, color: "#2E86AB", fontWeight: "600" },
  editControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2E86AB",
    justifyContent: "center",
    alignItems: "center",
  },
  editBtnText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  editValue: { fontSize: 16, fontWeight: "600", marginHorizontal: 16 },

  // Deadlines
  deadlineCard: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  deadlineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deadlineLabel: { fontSize: 14, color: "#1A1A1A", fontWeight: "500" },
  deadlineValue: { fontSize: 14, color: "#666", fontWeight: "600" },
  expiredText: { color: "#F44336" },

  // Score Breakdown
  scoreBreakdown: { padding: 8 },
  issueRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  issueIcon: { fontSize: 14, marginRight: 8 },
  issueText: { flex: 1, fontSize: 13, color: "#333" },
  issuePoints: { fontSize: 13, color: "#F44336", fontWeight: "600" },
  noIssues: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
    textAlign: "center",
    padding: 12,
  },

  // Action Buttons
  actionSection: { padding: 16 },
  primaryButton: {
    backgroundColor: "#2E86AB",
    padding: 16,
    borderRadius: 25,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 25,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#2E86AB",
  },
  secondaryButtonText: {
    color: "#2E86AB",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  tertiaryButton: {
    padding: 14,
    alignItems: "center",
  },
  tertiaryButtonText: { color: "#666", fontSize: 14 },
  proclamationNotice: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  proclamationLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  proclamationReason: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
  },
  tipCard: { backgroundColor: "#F5F7FA", borderRadius: 8, padding: 12, marginBottom: 8 },
  tipTitle: { fontSize: 14, fontWeight: "700", color: "#1A1A1A", marginBottom: 4 },
  tipBody: { fontSize: 13, color: "#333", lineHeight: 18 },

});