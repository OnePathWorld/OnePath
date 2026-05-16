// src/screens/TimelineScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

// Data
import {
  getProcessingTime,
  formatProcessingTime,
  getGreenCardTimeline,
  PROCESSING_TIMES_META,
} from "../data/processingTimes";
import { CURRENT_CAP_STATUS } from "../data/h1bCapData";
import { SEVIS_FEES, OPT_TIMELINE } from "../data/sevisData";
import { getTimelinesFor } from "../data/timelineData";
import analytics, { EVENTS } from "../utils/analytics";

const TimelineScreen = ({ route }) => {
  const { t } = useTranslation();
  const pathway = route.params?.pathway || "general";
  const [selectedVisa, setSelectedVisa] = useState(0);
  analytics.screen("Timeline", { pathway });

  // Pull translated timeline data inside render so language switches reflect
  const timelineData = getTimelinesFor(pathway === "general" ? "work" : pathway);
  const currentTimeline = timelineData[selectedVisa];
  const isCitizenshipPathway = pathway === "citizenship";

  // Map visa labels to stable analytics route IDs (matches original)
  const buildRouteId = (visaKey) => {
    const routeMap = {
      standard5yr: "5yr_standard",
      marriage3yr: "3yr_marriage",
      military: "military",
    };
    return routeMap[visaKey] || visaKey;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isCitizenshipPathway
              ? t("timelineScreen.title.citizenship")
              : t("timelineScreen.title.default")}
          </Text>
          <Text style={styles.subtitle}>
            {t("timelineScreen.subtitle", {
              date: PROCESSING_TIMES_META.lastUpdated,
            })}
          </Text>
        </View>

        {/* VISA / ROUTE SELECTOR */}
        {timelineData.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.visaSelector}
          >
            {timelineData.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.visaTab,
                  selectedVisa === index && styles.visaTabActive,
                  selectedVisa === index &&
                    isCitizenshipPathway &&
                    styles.visaTabActiveCitizenship,
                ]}
                onPress={() => {
                  analytics.track(EVENTS.TIMELINE_VISA_SELECTED, {
                    visa: item.visa,
                    pathway,
                  });
                  if (isCitizenshipPathway) {
                    analytics.track(EVENTS.NATURALIZATION_ROUTE_SELECTED, {
                      route: buildRouteId(item.key),
                    });
                  }
                  setSelectedVisa(index);
                }}
              >
                <Text
                  style={[
                    styles.visaTabText,
                    selectedVisa === index && styles.visaTabTextActive,
                  ]}
                >
                  {item.visa}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ALERT */}
        {currentTimeline?.alert && (
          <View
            style={[
              styles.alertCard,
              isCitizenshipPathway && styles.alertCardCitizenship,
            ]}
          >
            <Text style={styles.alertIcon}>
              {isCitizenshipPathway ? "🇺🇸" : "⚠️"}
            </Text>
            <Text style={styles.alertText}>{currentTimeline.alert}</Text>
          </View>
        )}

        {/* TOTAL TIME CARD */}
        <View
          style={[
            styles.totalTimeCard,
            isCitizenshipPathway && styles.totalTimeCardCitizenship,
          ]}
        >
          <Text style={styles.totalTimeLabel}>
            {isCitizenshipPathway
              ? t("timelineScreen.totalTimeLabel.citizenship")
              : t("timelineScreen.totalTimeLabel.default")}
          </Text>
          <Text style={styles.totalTimeValue}>
            {currentTimeline?.totalTime}
          </Text>
          <Text style={styles.disclaimer}>
            {t("timelineScreen.disclaimer", {
              date: PROCESSING_TIMES_META.lastUpdated,
            })}
          </Text>
        </View>

        {/* TIMELINE STEPS */}
        <View style={styles.timelineContainer}>
          {currentTimeline?.steps?.map((step, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineNode,
                    step.isWarning && styles.timelineNodeWarning,
                    step.isHighlight && styles.timelineNodeHighlight,
                    isCitizenshipPathway &&
                      step.isHighlight &&
                      styles.timelineNodeCitizenship,
                  ]}
                >
                  <View style={styles.timelineNodeInner} />
                </View>
                {index < currentTimeline.steps.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>
              <View
                style={[
                  styles.timelineContent,
                  step.isWarning && styles.timelineContentWarning,
                  step.isHighlight && styles.timelineContentHighlight,
                  isCitizenshipPathway &&
                    step.isHighlight &&
                    styles.timelineContentCitizenship,
                ]}
              >
                <View style={styles.stepHeader}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text
                    style={[
                      styles.stepDuration,
                      step.isWarning && styles.stepDurationWarning,
                      isCitizenshipPathway &&
                        step.isHighlight &&
                        styles.stepDurationCitizenship,
                    ]}
                  >
                    {step.duration}
                  </Text>
                </View>
                <Text style={styles.stepDescription}>{step.description}</Text>
                {step.who && (
                  <Text style={styles.stepWho}>👤 {step.who}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* INFO CARD */}
        {isCitizenshipPathway ? (
          <View style={styles.citizenshipInfoCard}>
            <Text style={styles.infoTitle}>
              {t("timelineScreen.afterNaturalize.title")}
            </Text>
            <TouchableOpacity
              style={styles.infoItem}
              onPress={() =>
                analytics.track(EVENTS.PASSPORT_INFO_TAPPED, {
                  source: "timeline",
                })
              }
            >
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                {t("timelineScreen.afterNaturalize.passport")}
              </Text>
            </TouchableOpacity>

            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                {t("timelineScreen.afterNaturalize.sponsorFamily")}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                {t("timelineScreen.afterNaturalize.childCitizenship")}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                {t("timelineScreen.afterNaturalize.vote")}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                {t("timelineScreen.afterNaturalize.dualCitizenship")}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              {t("timelineScreen.premiumProcessing.title")}
            </Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                {t("timelineScreen.premiumProcessing.i129")}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                {t("timelineScreen.premiumProcessing.i140")}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                {t("timelineScreen.premiumProcessing.i765")}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                {t("timelineScreen.premiumProcessing.i539")}
              </Text>
            </View>
          </View>
        )}

        {/* DELAYS CARD */}
        {isCitizenshipPathway ? (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>
              {t("timelineScreen.n400Notes.title")}
            </Text>
            <View style={styles.warningItem}>
              <Text style={styles.warningBullet}>•</Text>
              <Text style={styles.warningText}>
                {t("timelineScreen.n400Notes.interviewWait")}
              </Text>
            </View>
            <View style={styles.warningItem}>
              <Text style={styles.warningBullet}>•</Text>
              <Text style={styles.warningText}>
                {t("timelineScreen.n400Notes.extendedTrips")}
              </Text>
            </View>
            <View style={styles.warningItem}>
              <Text style={styles.warningBullet}>•</Text>
              <Text style={styles.warningText}>
                {t("timelineScreen.n400Notes.criminalHistory")}
              </Text>
            </View>
            <View style={styles.warningItem}>
              <Text style={styles.warningBullet}>•</Text>
              <Text style={styles.warningText}>
                {t("timelineScreen.n400Notes.missingTaxes")}
              </Text>
            </View>
            <View style={styles.warningItem}>
              <Text style={styles.warningBullet}>•</Text>
              <Text style={styles.warningText}>
                {t("timelineScreen.n400Notes.noPremium")}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>
              {t("timelineScreen.currentDelays.title")}
            </Text>
            <View style={styles.warningItem}>
              <Text style={styles.warningBullet}>•</Text>
              <Text style={styles.warningText}>
                {t("timelineScreen.currentDelays.familyI130")}
              </Text>
            </View>
            <View style={styles.warningItem}>
              <Text style={styles.warningBullet}>•</Text>
              <Text style={styles.warningText}>
                {t("timelineScreen.currentDelays.indiaEb")}
              </Text>
            </View>
            <View style={styles.warningItem}>
              <Text style={styles.warningBullet}>•</Text>
              <Text style={styles.warningText}>
                {t("timelineScreen.currentDelays.perm")}
              </Text>
            </View>
            <View style={styles.warningItem}>
              <Text style={styles.warningBullet}>•</Text>
              <Text style={styles.warningText}>
                {t("timelineScreen.currentDelays.canadaB1B2")}
              </Text>
            </View>
            <View style={styles.warningItem}>
              <Text style={styles.warningBullet}>•</Text>
              <Text style={styles.warningText}>
                {t("timelineScreen.currentDelays.eadValidity")}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.updateButton}>
          <Text style={styles.updateButtonText}>
            {t("timelineScreen.dataUpdated", {
              date: PROCESSING_TIMES_META.lastUpdated,
            })}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TimelineScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { padding: 20, backgroundColor: "#FFF" },
  title: { fontSize: 26, fontWeight: "bold", color: "#1A1A1A" },
  subtitle: { fontSize: 13, color: "#666", marginTop: 4 },

  visaSelector: {
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    maxHeight: 50,
  },
  visaTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
  },
  visaTabActive: { borderBottomWidth: 3, borderBottomColor: "#2E86AB" },
  visaTabActiveCitizenship: { borderBottomColor: "#1565C0" },
  visaTabText: { fontSize: 14, color: "#666" },
  visaTabTextActive: { color: "#2E86AB", fontWeight: "600" },

  alertCard: {
    flexDirection: "row",
    backgroundColor: "#FFF8E1",
    margin: 16,
    padding: 12,
    borderRadius: 12,
    alignItems: "flex-start",
  },
  alertCardCitizenship: { backgroundColor: "#E3F2FD" },
  alertIcon: { fontSize: 18, marginRight: 10, marginTop: 2 },
  alertText: { flex: 1, fontSize: 13, color: "#5D4037", lineHeight: 18 },

  totalTimeCard: {
    backgroundColor: "#2E86AB",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  totalTimeCardCitizenship: { backgroundColor: "#1565C0" },
  totalTimeLabel: { color: "#FFF", fontSize: 12, opacity: 0.9 },
  totalTimeValue: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 4,
  },
  disclaimer: { color: "#FFF", fontSize: 11, opacity: 0.8 },

  timelineContainer: { paddingHorizontal: 16 },
  timelineItem: { flexDirection: "row" },
  timelineLeft: { width: 24, alignItems: "center" },
  timelineNode: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#2E86AB",
    marginTop: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineNodeWarning: { backgroundColor: "#FF9800" },
  timelineNodeHighlight: { backgroundColor: "#4CAF50" },
  timelineNodeCitizenship: { backgroundColor: "#FFD700" },
  timelineNodeInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFF",
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#E0E0E0",
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 14,
    marginVertical: 6,
    marginLeft: 10,
    borderRadius: 12,
  },
  timelineContentWarning: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  timelineContentHighlight: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  timelineContentCitizenship: {
    borderLeftWidth: 4,
    borderLeftColor: "#FFD700",
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  stepTitle: { fontSize: 14, fontWeight: "600", color: "#1A1A1A", flex: 1 },
  stepDuration: { fontSize: 12, color: "#2E86AB", fontWeight: "600" },
  stepDurationWarning: { color: "#FF9800" },
  stepDurationCitizenship: { color: "#B8860B" },
  stepDescription: { fontSize: 12, color: "#666", lineHeight: 17, marginTop: 4 },
  stepWho: { fontSize: 11, color: "#1976D2", marginTop: 4 },

  infoCard: {
    backgroundColor: "#E3F2FD",
    margin: 16,
    padding: 14,
    borderRadius: 12,
  },
  citizenshipInfoCard: {
    backgroundColor: "#FFF8E1",
    margin: 16,
    padding: 14,
    borderRadius: 12,
  },
  infoTitle: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  infoItem: { flexDirection: "row", paddingVertical: 4 },
  infoBullet: { color: "#1565C0", marginRight: 6 },
  infoText: { flex: 1, fontSize: 13, color: "#1A1A1A", lineHeight: 18 },

  warningCard: {
    backgroundColor: "#FFEBEE",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#C62828",
    marginBottom: 8,
  },
  warningItem: { flexDirection: "row", paddingVertical: 4 },
  warningBullet: { color: "#C62828", marginRight: 6 },
  warningText: { flex: 1, fontSize: 13, color: "#5D2A2A", lineHeight: 18 },

  updateButton: {
    backgroundColor: "#FFF",
    margin: 16,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  updateButtonText: { fontSize: 12, color: "#666" },
});