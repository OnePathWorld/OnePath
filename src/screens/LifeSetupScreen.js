// src/screens/LifeSetupScreen.js

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { getLifeSetupGuide } from "../data/lifeSetupGuides";

const MAIN_GUIDE_IDS = ["ssn", "banking", "credit", "job"];
const RESOURCE_GUIDE_IDS = ["itin", "dmv", "healthcare"];

const LifeSetupScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const handleGuidePress = (guide) => {
    navigation.navigate("GuideDetail", { guide });
  };

  // Inflate all guides at render time so language switches re-translate
  const mainGuides = MAIN_GUIDE_IDS.map((id) => getLifeSetupGuide(id)).filter(
    Boolean
  );
  const resourceGuides = RESOURCE_GUIDE_IDS.map((id) =>
    getLifeSetupGuide(id)
  ).filter(Boolean);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>{t("lifeSetupScreen.title")}</Text>
          <Text style={styles.subtitle}>{t("lifeSetupScreen.subtitle")}</Text>
        </View>

        {/* FIRST 30 DAYS TIMELINE */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>
            {t("lifeSetupScreen.first30DaysTitle")}
          </Text>
          {[1, 2, 3, 4, 5].map((n) => (
            <View key={n} style={styles.timelineItem}>
              <Text style={styles.timelineNumber}>{n}</Text>
              <Text style={styles.timelineText}>
                {t(`lifeSetupScreen.first30Days.step${n}`)}
              </Text>
            </View>
          ))}
        </View>

        {/* MAIN GUIDES */}
        <View style={styles.guidesContainer}>
          {mainGuides.map((guide) => (
            <TouchableOpacity
              key={guide.id}
              style={[styles.guideCard, { borderLeftColor: guide.color }]}
              onPress={() => handleGuidePress(guide)}
            >
              <View style={styles.guideHeader}>
                <Text style={styles.guideIcon}>{guide.icon}</Text>
                <View style={styles.guideInfo}>
                  <Text style={styles.guideTitle}>{guide.title}</Text>
                  <Text style={styles.guideDescription}>
                    {guide.description}
                  </Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </View>

              {/* Preview: first 3 items from first section */}
              {guide.guides?.[0]?.content && (
                <View style={styles.guidePreview}>
                  {guide.guides[0].content.slice(0, 3).map((item, index) => (
                    <View key={index} style={styles.previewItem}>
                      <Text style={styles.previewBullet}>•</Text>
                      <Text style={styles.previewText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* ADDITIONAL RESOURCES */}
        <View style={styles.resourcesCard}>
          <Text style={styles.resourcesTitle}>
            {t("lifeSetupScreen.additionalResourcesTitle")}
          </Text>
          {resourceGuides.map((guide) => (
            <TouchableOpacity
              key={guide.id}
              style={styles.resourceItem}
              onPress={() => handleGuidePress(guide)}
            >
              <Text style={styles.resourceName}>{guide.title}</Text>
              <Text style={styles.resourceDescription}>
                {guide.shortDescription || guide.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AVOID SCAMS */}
        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>
              {t("lifeSetupScreen.avoidScams.title")}
            </Text>
            <Text style={styles.warningText}>
              {t("lifeSetupScreen.avoidScams.body")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginTop: 5,
  },
  timelineCard: {
    backgroundColor: "#E8F4F8",
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 15,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  timelineNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2E86AB",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 28,
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 12,
  },
  timelineText: {
    fontSize: 14,
    color: "#333333",
    flex: 1,
  },
  guidesContainer: {
    paddingHorizontal: 20,
  },
  guideCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  guideIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  guideInfo: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  guideDescription: {
    fontSize: 13,
    color: "#666666",
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: "#999999",
  },
  guidePreview: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  previewItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  previewBullet: {
    fontSize: 12,
    color: "#2E86AB",
    marginRight: 8,
    marginTop: 2,
  },
  previewText: {
    fontSize: 13,
    color: "#666666",
    flex: 1,
    lineHeight: 18,
  },
  resourcesCard: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  resourcesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  resourceItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  resourceName: {
    fontSize: 15,
    color: "#2E86AB",
    fontWeight: "600",
  },
  resourceDescription: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  warningCard: {
    flexDirection: "row",
    backgroundColor: "#FFF3E0",
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E65100",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: "#5D4037",
    lineHeight: 18,
  },
});

export default LifeSetupScreen;