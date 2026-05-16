// src/screens/GuideDetailScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { getLifeSetupGuide } from "../data/lifeSetupGuides";
import analytics, { EVENTS } from "../utils/analytics";

// Related guides shown at the bottom of every guide detail screen
// (excluding whichever guide is currently being viewed).
const RELATED_GUIDE_IDS = ["tax", "healthcare", "dmv"];

// Helpful links — URLs preserved exactly as literal English (URLs aren't translated)
const HELPFUL_LINK_URLS = {
  immigrationAdvocates: "https://www.immigrationadvocates.org/legaldirectory/",
  uscisOfficeLocator: "https://www.uscis.gov/about-us/find-a-uscis-office",
  legalAidDirectory: "https://www.lawhelp.org/",
};

const GuideDetailScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { guide } = route.params;
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (index) => {
    setExpandedSections({
      ...expandedSections,
      [index]:
        expandedSections[index] === undefined ? false : !expandedSections[index],
    });
  };

  const openRelatedGuide = (guideKey) => {
    const relatedGuide = getLifeSetupGuide(guideKey);
    if (relatedGuide) {
      analytics.track(EVENTS.LIFE_SETUP_VIEWED, {
        guide: relatedGuide.id,
        source: "related_guide",
      });
      navigation.push("GuideDetail", { guide: relatedGuide });
    }
  };

  const openLink = (url, name) => {
    analytics.track(EVENTS.FORM_LINK_TAPPED, {
      form: name,
      source: "guide_detail",
    });
    Linking.openURL(url).catch(() => {
      Alert.alert(
        t("guideDetailScreen.cantOpenLinkTitle"),
        t("guideDetailScreen.cantOpenLinkBody", { name })
      );
    });
  };

  // Determine which related guides to show (exclude current guide)
  const relatedGuideKeys = RELATED_GUIDE_IDS.filter((key) => key !== guide.id);

  // Build helpful links list with translated names + literal URLs
  const helpfulLinks = [
    {
      key: "immigrationAdvocates",
      name: t("guideDetailScreen.helpfulLinks.immigrationAdvocates"),
      url: HELPFUL_LINK_URLS.immigrationAdvocates,
    },
    {
      key: "uscisOfficeLocator",
      name: t("guideDetailScreen.helpfulLinks.uscisOfficeLocator"),
      url: HELPFUL_LINK_URLS.uscisOfficeLocator,
    },
    {
      key: "legalAidDirectory",
      name: t("guideDetailScreen.helpfulLinks.legalAidDirectory"),
      url: HELPFUL_LINK_URLS.legalAidDirectory,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.icon}>{guide.icon}</Text>
          <Text style={styles.title}>{guide.title}</Text>
          <Text style={styles.description}>{guide.description}</Text>
        </View>

        <View style={styles.sectionsContainer}>
          {guide.guides.map((section, index) => (
            <View key={index} style={styles.section}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection(index)}
              >
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.expandIcon}>
                  {expandedSections[index] === false ? "+" : "−"}
                </Text>
              </TouchableOpacity>

              {expandedSections[index] !== false && (
                <View style={styles.sectionContent}>
                  {section.content.map((item, itemIndex) => (
                    <View key={itemIndex} style={styles.contentItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.contentText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* RELATED GUIDES */}
        <View style={styles.relatedCard}>
          <Text style={styles.relatedTitle}>
            {t("guideDetailScreen.relatedGuidesTitle")}
          </Text>
          {relatedGuideKeys.map((key) => {
            const related = getLifeSetupGuide(key);
            if (!related) return null;
            return (
              <TouchableOpacity
                key={key}
                style={styles.relatedItem}
                onPress={() => openRelatedGuide(key)}
              >
                <Text style={styles.relatedItemIcon}>{related.icon}</Text>
                <Text style={styles.relatedItemText}>{related.title}</Text>
                <Text style={styles.relatedArrow}>›</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* FIND HELP */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>
            {t("guideDetailScreen.needHelpTitle")}
          </Text>
          <Text style={styles.helpText}>
            {t("guideDetailScreen.needHelpText")}
          </Text>
          {helpfulLinks.map((link) => (
            <TouchableOpacity
              key={link.key}
              style={styles.helpLink}
              onPress={() => openLink(link.url, link.name)}
            >
              <Text style={styles.helpLinkText}>{link.name} 🔗</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    alignItems: "center",
  },
  icon: { fontSize: 48, marginBottom: 15 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  description: { fontSize: 16, color: "#666666", textAlign: "center" },
  sectionsContainer: { padding: 20 },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    flex: 1,
  },
  expandIcon: { fontSize: 24, color: "#666666" },
  sectionContent: { padding: 20, paddingTop: 15 },
  contentItem: { flexDirection: "row", marginBottom: 12 },
  bullet: {
    fontSize: 14,
    color: "#2E86AB",
    marginRight: 10,
    marginTop: 2,
  },
  contentText: { fontSize: 14, color: "#333333", flex: 1, lineHeight: 22 },
  relatedCard: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 15,
  },
  relatedItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  relatedItemIcon: { fontSize: 20, marginRight: 12 },
  relatedItemText: { fontSize: 15, color: "#2E86AB", flex: 1 },
  relatedArrow: { fontSize: 20, color: "#CCCCCC" },
  helpCard: {
    backgroundColor: "#E8F4F8",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 30,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  helpLink: {
    backgroundColor: "#2E86AB",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
    width: "100%",
    alignItems: "center",
  },
  helpLinkText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default GuideDetailScreen;