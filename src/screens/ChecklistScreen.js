// src/screens/ChecklistScreen.js

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

import { pathwaysData } from "../data/immigrationData";
import { PROCESSING_TIMES_META } from "../data/processingTimes";
import {
  getPathwayDocuments,
  getCommonDocuments,
  getMedicalDocuments,
  getInterviewPrepDocuments,
} from "../data/checklistDocuments";
import DataUpdateBadge from "../components/DataUpdateBadge";
import analytics, { EVENTS } from "../utils/analytics";

const ChecklistScreen = ({ route }) => {
  const { t } = useTranslation();
  const [selectedPathway, setSelectedPathway] = useState(
    route.params?.pathway || "work"
  );
  const [checkedItems, setCheckedItems] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [showPathwaySelector, setShowPathwaySelector] = useState(false);

  const pathway = pathwaysData[selectedPathway];
  const storageKey = `@checklist_progress_${selectedPathway}`;

  useEffect(() => {
    analytics.screen("Checklist", { pathway: selectedPathway });
    if (
      selectedPathway === "citizenship" ||
      route.params?.pathway === "citizenship"
    ) {
      analytics.track(EVENTS.CITIZENSHIP_CHECKLIST_OPENED, {
        source: route.params?.pathway ? "navigation" : "auto",
      });
    }
    loadUserPathway();
  }, []);

  useEffect(() => {
    loadProgress();
  }, [selectedPathway]);

  const loadUserPathway = async () => {
    try {
      if (route.params?.pathway) {
        setSelectedPathway(route.params.pathway);
        return;
      }
      const userProfile = await AsyncStorage.getItem("@userProfile_v2");
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        const pathwayMap = {
          work: "work",
          family: "family",
          study: "student",
          protection: "family",
          citizenship: "citizenship",
        };
        if (
          profile.currentVisa === "GC" ||
          profile.purpose === "citizenship"
        ) {
          setSelectedPathway("citizenship");
          return;
        }
        const userPathway = pathwayMap[profile.purpose] || "work";
        setSelectedPathway(userPathway);
      }
    } catch (err) {
      console.log("No saved pathway preference");
    }
  };

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem(storageKey);
      if (saved) setCheckedItems(JSON.parse(saved));
      else setCheckedItems({});
    } catch {
      setCheckedItems({});
    }
  };

  const saveProgress = async (items) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(items));
    } catch {}
  };

  const toggleItem = (id, itemName, sectionId) => {
    analytics.track(EVENTS.CHECKLIST_ITEM_TOGGLED, {
      item: id,
      checked: !checkedItems[id],
      pathway: selectedPathway,
    });
    if (selectedPathway === "citizenship") {
      analytics.track(EVENTS.CITIZENSHIP_CHECKLIST_ITEM_TOGGLED, {
        item_id: id,
        item_name: itemName || id,
        checked: !checkedItems[id],
        section: sectionId || "unknown",
      });
    }
    if (!checkedItems[id]) analytics.increment("checklist_items_completed");
    const updated = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(updated);
    saveProgress(updated);
  };

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const switchPathway = (pathwayId) => {
    analytics.track(EVENTS.PATHWAY_VIEWED, {
      pathway: pathwayId,
      source: "checklist_switch",
    });
    if (pathwayId === "citizenship") {
      analytics.track(EVENTS.CITIZENSHIP_CHECKLIST_OPENED, {
        source: "checklist_switch",
      });
    }
    setSelectedPathway(pathwayId);
    setShowPathwaySelector(false);
    setCheckedItems({});
    setExpandedSections({});
  };

  // =========================================================
  // BUILD SECTIONS — uses getPathwayDocuments helper for hot language switching
  // =========================================================
  const sections = useMemo(() => {
    const docs = getPathwayDocuments(selectedPathway);
    const builtSections = [];
    const pathwayTitle = pathway?.title || "";

    if (docs.required?.length > 0) {
      builtSections.push({
        id: "required",
        title: t("checklistScreen.sections.requiredTitle", {
          pathway: pathwayTitle,
        }),
        subtitle: t("checklistScreen.sections.requiredSubtitle"),
        requirementLevel: "required",
        items: docs.required,
      });
    }

    if (docs.oneOf?.length > 0) {
      builtSections.push({
        id: "oneof",
        title: t("checklistScreen.sections.oneOfTitle"),
        subtitle: t("checklistScreen.sections.oneOfSubtitle"),
        requirementLevel: "one-of",
        items: docs.oneOf,
      });
    }

    if (docs.recommended?.length > 0) {
      builtSections.push({
        id: "recommended",
        title: t("checklistScreen.sections.recommendedTitle"),
        subtitle: t("checklistScreen.sections.recommendedSubtitle"),
        requirementLevel: "recommended",
        items: docs.recommended,
      });
    }

    if (selectedPathway !== "citizenship") {
      builtSections.push({
        id: "common",
        title: t("checklistScreen.sections.commonTitle"),
        subtitle: t("checklistScreen.sections.commonSubtitle"),
        requirementLevel: "required",
        items: getCommonDocuments(),
      });

      builtSections.push({
        id: "medical",
        title: t("checklistScreen.sections.medicalTitle"),
        subtitle: t("checklistScreen.sections.medicalSubtitle"),
        requirementLevel: "conditional",
        items: getMedicalDocuments(),
      });
    } else {
      builtSections.push({
        id: "interview_prep",
        title: t("checklistScreen.sections.interviewPrepTitle"),
        subtitle: t("checklistScreen.sections.interviewPrepSubtitle"),
        requirementLevel: "conditional",
        items: getInterviewPrepDocuments(),
      });
    }

    return builtSections;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPathway, pathway, t]);

  // =========================================================
  // PROGRESS CALCULATION
  // =========================================================
  const requiredItems = sections.reduce((sum, section) => {
    if (section.requirementLevel === "required") {
      return (
        sum + section.items.filter((item) => item.required !== false).length
      );
    } else if (section.requirementLevel === "one-of") {
      return sum + 1;
    }
    return sum;
  }, 0);

  const requiredCompleted = sections.reduce((sum, section) => {
    if (section.requirementLevel === "required") {
      return (
        sum +
        section.items.filter(
          (item) => item.required !== false && checkedItems[item.id]
        ).length
      );
    } else if (section.requirementLevel === "one-of") {
      const hasOne = section.items.some((item) => checkedItems[item.id]);
      return sum + (hasOne ? 1 : 0);
    }
    return sum;
  }, 0);

  const getRequirementBadge = (level) => {
    switch (level) {
      case "required":
        return { text: t("checklistScreen.badges.required"), color: "#D32F2F" };
      case "one-of":
        return { text: t("checklistScreen.badges.oneOf"), color: "#F57C00" };
      case "recommended":
        return {
          text: t("checklistScreen.badges.recommended"),
          color: "#388E3C",
        };
      case "conditional":
        return {
          text: t("checklistScreen.badges.conditional"),
          color: "#7B1FA2",
        };
      default:
        return { text: "", color: "#999" };
    }
  };

  // =========================================================
  // PATHWAY OPTIONS — labels translated
  // =========================================================
  const pathwayOptions = [
    {
      id: "work",
      title: t("checklistScreen.pathwayOptions.work"),
      icon: "💼",
    },
    {
      id: "family",
      title: t("checklistScreen.pathwayOptions.family"),
      icon: "👨‍👩‍👧‍👦",
    },
    {
      id: "student",
      title: t("checklistScreen.pathwayOptions.student"),
      icon: "🎓",
    },
    {
      id: "citizenship",
      title: t("checklistScreen.pathwayOptions.citizenship"),
      icon: "🇺🇸",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>{t("checklistScreen.title")}</Text>

          <TouchableOpacity
            style={[
              styles.pathwaySelector,
              selectedPathway === "citizenship" &&
                styles.pathwaySelectorCitizenship,
            ]}
            onPress={() => setShowPathwaySelector(true)}
          >
            <Text style={styles.pathwayIcon}>
              {pathwayOptions.find((p) => p.id === selectedPathway)?.icon}
            </Text>
            <Text style={styles.pathwayName}>
              {pathway?.title ||
                t("checklistScreen.selectPathwayPlaceholder")}
            </Text>
            <Text style={styles.changeText}>
              {t("checklistScreen.changeButton")}
            </Text>
          </TouchableOpacity>

          <View style={styles.badges}>
            <DataUpdateBadge
              label={t("checklistScreen.dataUpdateBadgeLabel")}
              lastUpdated={PROCESSING_TIMES_META.lastUpdated}
            />
          </View>
        </View>

        {/* CITIZENSHIP INFO BANNER */}
        {selectedPathway === "citizenship" && (
          <View style={styles.citizenshipInfoBanner}>
            <Text style={styles.citizenshipInfoIcon}>🇺🇸</Text>
            <Text style={styles.citizenshipInfoText}>
              {t("checklistScreen.citizenshipBanner")}
            </Text>
          </View>
        )}

        {/* PROGRESS */}
        <View
          style={[
            styles.progressCard,
            selectedPathway === "citizenship" && styles.progressCardCitizenship,
          ]}
        >
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              {selectedPathway === "citizenship"
                ? t("checklistScreen.progressTitle.citizenship")
                : t("checklistScreen.progressTitle.default")}
            </Text>
            <Text style={styles.progressCount}>
              {t("checklistScreen.progressCount", {
                completed: requiredCompleted,
                total: requiredItems,
              })}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    requiredItems > 0
                      ? (requiredCompleted / requiredItems) * 100
                      : 0
                  }%`,
                },
              ]}
            />
          </View>
        </View>

        {/* LEGEND */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>
            {t("checklistScreen.legendTitle")}
          </Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#D32F2F" }]}
              />
              <Text style={styles.legendText}>
                {t("checklistScreen.legendRequired")}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#F57C00" }]}
              />
              <Text style={styles.legendText}>
                {t("checklistScreen.legendNeedOne")}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#388E3C" }]}
              />
              <Text style={styles.legendText}>
                {t("checklistScreen.legendRecommended")}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#7B1FA2" }]}
              />
              <Text style={styles.legendText}>
                {t("checklistScreen.legendIfRequested")}
              </Text>
            </View>
          </View>
        </View>

        {/* SECTIONS */}
        {sections.map((section) => {
          const badge = getRequirementBadge(section.requirementLevel);

          return (
            <View key={section.id} style={styles.section}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection(section.id)}
              >
                <View style={styles.sectionTopRow}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <View
                      style={[
                        styles.requirementBadge,
                        { backgroundColor: badge.color },
                      ]}
                    >
                      <Text style={styles.requirementBadgeText}>
                        {badge.text}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.expand}>
                    {expandedSections[section.id] === false ? "+" : "−"}
                  </Text>
                </View>
                {section.subtitle && (
                  <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
                )}
              </TouchableOpacity>

              {expandedSections[section.id] !== false && (
                <View style={styles.items}>
                  {section.items.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.item,
                        checkedItems[item.id] && styles.itemChecked,
                        item.required && styles.itemRequired,
                        item.alternative && styles.itemAlternative,
                      ]}
                      onPress={() => toggleItem(item.id, item.name, section.id)}
                    >
                      <Text
                        style={[
                          styles.checkbox,
                          item.required && styles.checkboxRequired,
                        ]}
                      >
                        {checkedItems[item.id] ? "✓" : ""}
                      </Text>
                      <View style={styles.itemText}>
                        <View style={styles.itemHeader}>
                          <Text
                            style={[
                              styles.itemName,
                              checkedItems[item.id] && styles.itemNameChecked,
                            ]}
                          >
                            {item.name}
                          </Text>
                          {item.required && (
                            <Text style={styles.requiredIndicator}>*</Text>
                          )}
                          {item.quantity && (
                            <Text style={styles.quantity}>{item.quantity}</Text>
                          )}
                        </View>
                        <Text style={styles.itemDesc}>{item.description}</Text>
                        {item.whenNeeded && (
                          <Text style={styles.whenNeeded}>
                            📌 {item.whenNeeded}
                          </Text>
                        )}
                        {item.who && (
                          <Text style={styles.who}>👤 {item.who}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* TIP */}
        <View style={styles.tip}>
          <Text style={styles.tipIcon}>
            {selectedPathway === "citizenship" ? "🇺🇸" : "💡"}
          </Text>
          <Text style={styles.tipText}>
            {selectedPathway === "citizenship"
              ? t("checklistScreen.tip.citizenshipText")
              : t("checklistScreen.tip.defaultText", {
                  pathway: pathway?.title || "",
                })}
          </Text>
        </View>
      </ScrollView>

      {/* PATHWAY SELECTOR MODAL */}
      <Modal
        visible={showPathwaySelector}
        transparent={true}
        animationType="slide"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPathwaySelector(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t("checklistScreen.modal.title")}
            </Text>
            {pathwayOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.pathwayOption,
                  selectedPathway === option.id && styles.pathwayOptionActive,
                  option.id === "citizenship" &&
                    styles.pathwayOptionCitizenship,
                  selectedPathway === option.id &&
                    option.id === "citizenship" &&
                    styles.pathwayOptionCitizenshipActive,
                ]}
                onPress={() => switchPathway(option.id)}
              >
                <Text style={styles.pathwayOptionIcon}>{option.icon}</Text>
                <Text
                  style={[
                    styles.pathwayOptionText,
                    selectedPathway === option.id &&
                      styles.pathwayOptionTextActive,
                  ]}
                >
                  {option.title}
                </Text>
                {selectedPathway === option.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default ChecklistScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { padding: 20, backgroundColor: "#FFF" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 12 },
  pathwaySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  pathwaySelectorCitizenship: { backgroundColor: "#E3F2FD" },
  pathwayIcon: { fontSize: 18, marginRight: 8 },
  pathwayName: { flex: 1, fontSize: 15, fontWeight: "600", color: "#1A1A1A" },
  changeText: { fontSize: 13, color: "#2E86AB", fontWeight: "600" },
  badges: { flexDirection: "row" },

  citizenshipInfoBanner: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    margin: 16,
    padding: 12,
    borderRadius: 12,
    alignItems: "flex-start",
  },
  citizenshipInfoIcon: { fontSize: 18, marginRight: 10, marginTop: 2 },
  citizenshipInfoText: { flex: 1, fontSize: 13, color: "#1565C0", lineHeight: 18 },

  progressCard: {
    backgroundColor: "#FFF",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  progressCardCitizenship: { backgroundColor: "#FFF" },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressTitle: { fontSize: 14, fontWeight: "600", color: "#1A1A1A" },
  progressCount: { fontSize: 14, fontWeight: "600", color: "#2E86AB" },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#4CAF50" },

  legendCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
  },
  legendTitle: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  legendItems: { flexDirection: "row", flexWrap: "wrap" },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 12, color: "#666" },

  section: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionHeader: { padding: 14 },
  sectionTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
  requirementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 10,
  },
  requirementBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  expand: { fontSize: 22, color: "#999", marginLeft: 8 },
  sectionSubtitle: { fontSize: 12, color: "#666", marginTop: 4 },

  items: { paddingHorizontal: 14, paddingBottom: 12 },
  item: {
    flexDirection: "row",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  itemChecked: { opacity: 0.55 },
  itemRequired: {},
  itemAlternative: {},
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#999",
    borderRadius: 4,
    textAlign: "center",
    lineHeight: 22,
    marginRight: 10,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  checkboxRequired: { borderColor: "#D32F2F" },
  itemText: { flex: 1 },
  itemHeader: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  itemName: { fontSize: 14, fontWeight: "600", color: "#1A1A1A" },
  itemNameChecked: { textDecorationLine: "line-through", color: "#999" },
  requiredIndicator: { color: "#D32F2F", fontWeight: "bold", marginLeft: 4 },
  quantity: {
    fontSize: 11,
    color: "#666",
    marginLeft: 8,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemDesc: { fontSize: 12, color: "#666", lineHeight: 17, marginTop: 4 },
  whenNeeded: { fontSize: 11, color: "#7B1FA2", marginTop: 4 },
  who: { fontSize: 11, color: "#1976D2", marginTop: 2 },

  tip: {
    flexDirection: "row",
    backgroundColor: "#FFF8E1",
    margin: 16,
    padding: 14,
    borderRadius: 12,
    alignItems: "flex-start",
  },
  tipIcon: { fontSize: 20, marginRight: 10 },
  tipText: { flex: 1, fontSize: 13, color: "#5D4037", lineHeight: 18 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 14 },
  pathwayOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    marginBottom: 8,
  },
  pathwayOptionActive: { backgroundColor: "#E3F2FD" },
  pathwayOptionCitizenship: {},
  pathwayOptionCitizenshipActive: { backgroundColor: "#BBDEFB" },
  pathwayOptionIcon: { fontSize: 22, marginRight: 12 },
  pathwayOptionText: { flex: 1, fontSize: 15, color: "#1A1A1A" },
  pathwayOptionTextActive: { fontWeight: "600", color: "#1565C0" },
  checkmark: { fontSize: 16, color: "#1976D2" },
});