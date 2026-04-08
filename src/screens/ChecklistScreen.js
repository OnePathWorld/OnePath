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

import { pathwaysData } from "../data/immigrationData";
import { PROCESSING_TIMES_META } from "../data/processingTimes";
import DataUpdateBadge from "../components/DataUpdateBadge";
import analytics, { EVENTS } from "../utils/analytics";

const ChecklistScreen = ({ route }) => {
  // Get pathway from navigation or saved preference
  const [selectedPathway, setSelectedPathway] = useState(route.params?.pathway || "work");
  const [checkedItems, setCheckedItems] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [showPathwaySelector, setShowPathwaySelector] = useState(false);

  const pathway = pathwaysData[selectedPathway];
  const storageKey = `@checklist_progress_${selectedPathway}`;

  useEffect(() => {
    analytics.screen("Checklist", { pathway: selectedPathway });
    loadUserPathway();
  }, []);

  useEffect(() => {
    loadProgress();
  }, [selectedPathway]);

  const loadUserPathway = async () => {
    try {
      // Load user's onboarding selection
      const userProfile = await AsyncStorage.getItem("@userProfile");
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        // Map purpose to pathway
        const pathwayMap = {
          "work": "work",
          "family": "family", 
          "study": "student",
          "protection": "family" // Default protection to family as it has relevant forms
        };
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

  const toggleItem = (id) => {
    analytics.track(EVENTS.CHECKLIST_ITEM_TOGGLED, {
      item: id,
      checked: !checkedItems[id],
      pathway: selectedPathway,
    });
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
    analytics.track(EVENTS.PATHWAY_VIEWED, { pathway: pathwayId, source: "checklist_switch" });
    setSelectedPathway(pathwayId);
    setShowPathwaySelector(false);
    setCheckedItems({}); // Clear checks when switching
    setExpandedSections({});
  };

  // Build pathway-specific document requirements
  const getPathwayDocuments = (pathwayId) => {
    switch (pathwayId) {
      case "work":
        return {
          required: [
            {
              id: "passport",
              name: "Valid Passport",
              description: "Must be valid at least 6 months beyond intended stay",
              required: true,
            },
            {
              id: "photos",
              name: "Passport Photos",
              description: "2x2 inches, white background",
              required: true,
              quantity: "2 photos",
            },
            {
              id: "ds160",
              name: "Form DS-160",
              description: "Online visa application confirmation",
              required: true,
            },
            {
              id: "i129",
              name: "Form I-129 Approval",
              description: "Employer's petition approval from USCIS",
              required: true,
              who: "Employer provides",
            },
            {
              id: "lca",
              name: "Labor Condition Application",
              description: "DOL certification for H-1B",
              required: true,
              who: "Employer files",
            },
            {
              id: "degree",
              name: "Bachelor's Degree or Higher",
              description: "In specialty field with transcripts",
              required: true,
            },
            {
              id: "resume",
              name: "Resume/CV",
              description: "Professional experience",
              required: true,
            },
          ],
          oneOf: [
            {
              id: "employment_letter",
              name: "Employment Offer Letter",
              description: "Details position, salary, duties",
              alternative: true,
            },
            {
              id: "employment_contract",
              name: "Employment Contract",
              description: "Signed agreement with employer",
              alternative: true,
            },
          ],
          recommended: [
            {
              id: "experience_letters",
              name: "Experience Letters",
              description: "From previous employers",
            },
            {
              id: "awards",
              name: "Awards/Publications",
              description: "Professional achievements",
            },
          ],
        };

      case "family":
        return {
          required: [
            {
              id: "passport",
              name: "Valid Passport",
              description: "Must be valid at least 6 months",
              required: true,
            },
            {
              id: "photos",
              name: "Passport Photos",
              description: "2x2 inches, white background",
              required: true,
              quantity: "2 photos",
            },
            {
              id: "ds260",
              name: "Form DS-260",
              description: "Online immigrant visa application",
              required: true,
            },
            {
              id: "i130",
              name: "Form I-130 Approval",
              description: "Family petition approval from USCIS",
              required: true,
              who: "Petitioner files",
            },
            {
              id: "birth_cert",
              name: "Birth Certificate",
              description: "Original with translation",
              required: true,
            },
            {
              id: "marriage_cert",
              name: "Marriage Certificate",
              description: "If spouse petition",
              required: true,
              whenNeeded: "Spouse petitions",
            },
            {
              id: "i864",
              name: "Form I-864 Affidavit of Support",
              description: "Financial sponsorship from petitioner",
              required: true,
              who: "Petitioner provides",
            },
            {
              id: "police_cert",
              name: "Police Certificates",
              description: "From all countries lived 6+ months",
              required: true,
            },
          ],
          oneOf: [
            {
              id: "petitioner_citizenship",
              name: "Petitioner's US Passport",
              description: "Proof of U.S. citizenship",
              alternative: true,
            },
            {
              id: "petitioner_greencard",
              name: "Petitioner's Green Card",
              description: "If petitioner is LPR",
              alternative: true,
            },
          ],
          recommended: [
            {
              id: "photos_together",
              name: "Photos Together",
              description: "Evidence of relationship",
            },
            {
              id: "correspondence",
              name: "Communication Records",
              description: "Emails, messages, letters",
            },
            {
              id: "joint_accounts",
              name: "Joint Accounts",
              description: "Bank, insurance, property",
            },
          ],
        };

      case "student":
        return {
          required: [
            {
              id: "passport",
              name: "Valid Passport",
              description: "Must be valid for entire study period",
              required: true,
            },
            {
              id: "photos",
              name: "Passport Photos",
              description: "2x2 inches, white background",
              required: true,
              quantity: "2 photos",
            },
            {
              id: "ds160",
              name: "Form DS-160",
              description: "Online visa application confirmation",
              required: true,
            },
            {
              id: "i20",
              name: "Form I-20",
              description: "Certificate of Eligibility from school",
              required: true,
              who: "School provides",
            },
            {
              id: "sevis",
              name: "SEVIS Fee Receipt",
              description: "I-901 payment confirmation ($350)",
              required: true,
            },
            {
              id: "acceptance",
              name: "Admission Letter",
              description: "Official acceptance from SEVP school",
              required: true,
            },
            {
              id: "transcripts",
              name: "Academic Transcripts",
              description: "Previous education records",
              required: true,
            },
            {
              id: "financial_proof",
              name: "Financial Evidence",
              description: "Bank statements showing ~$40,000/year",
              required: true,
            },
          ],
          oneOf: [
            {
              id: "test_scores",
              name: "TOEFL/IELTS Scores",
              description: "English proficiency test",
              alternative: true,
            },
            {
              id: "english_medium",
              name: "English Medium Certificate",
              description: "If previous education was in English",
              alternative: true,
            },
          ],
          recommended: [
            {
              id: "sponsor_letter",
              name: "Sponsor Letter",
              description: "If someone else is paying",
            },
            {
              id: "study_plan",
              name: "Study Plan",
              description: "Why this program and future goals",
            },
            {
              id: "gre_gmat",
              name: "GRE/GMAT Scores",
              description: "If submitted to school",
            },
          ],
        };

      default:
        return { required: [], oneOf: [], recommended: [] };
    }
  };

  // Build sections based on selected pathway
  const sections = useMemo(() => {
    const docs = getPathwayDocuments(selectedPathway);
    const sections = [];

    // Common section for all pathways
    const common = {
      id: "common",
      title: "Universal Requirements",
      subtitle: "Required for ALL visa types",
      requirementLevel: "required",
      items: [
        {
          id: "interview_appt",
          name: "Interview Appointment Confirmation",
          description: "Embassy/consulate appointment",
          required: true,
        },
        {
          id: "fee_receipt",
          name: "Visa Fee Payment Receipt",
          description: "MRV fee payment confirmation",
          required: true,
        },
      ],
    };

    // Required documents section
    if (docs.required?.length > 0) {
      sections.push({
        id: "required",
        title: `${pathway?.title} - Required Documents`,
        subtitle: "Must have ALL of these",
        requirementLevel: "required",
        items: docs.required,
      });
    }

    // One-of documents section
    if (docs.oneOf?.length > 0) {
      sections.push({
        id: "oneof",
        title: "Choose One Document",
        subtitle: "Need ONE from this list",
        requirementLevel: "one-of",
        items: docs.oneOf,
      });
    }

    // Recommended documents section
    if (docs.recommended?.length > 0) {
      sections.push({
        id: "recommended",
        title: "Supporting Documents",
        subtitle: "Strengthen your application",
        requirementLevel: "recommended",
        items: docs.recommended,
      });
    }

    // Medical section (conditional)
    const medical = {
      id: "medical",
      title: "Medical Requirements",
      subtitle: "Only if requested by embassy",
      requirementLevel: "conditional",
      items: [
        {
          id: "medical_exam",
          name: "Medical Examination",
          description: "From panel physician only",
          whenNeeded: "Green card applicants",
          cost: "$200-500",
        },
        {
          id: "vaccinations",
          name: "Vaccination Records",
          description: "Required vaccines vary by age",
          whenNeeded: "If requested",
        },
      ],
    };

    sections.push(common);
    sections.push(medical);

    return sections;
  }, [selectedPathway, pathway]);

  // Calculate progress
  const requiredItems = sections.reduce((sum, section) => {
    if (section.requirementLevel === "required") {
      return sum + section.items.filter(item => item.required !== false).length;
    } else if (section.requirementLevel === "one-of") {
      return sum + 1;
    }
    return sum;
  }, 0);

  const requiredCompleted = sections.reduce((sum, section) => {
    if (section.requirementLevel === "required") {
      return sum + section.items.filter(item => item.required !== false && checkedItems[item.id]).length;
    } else if (section.requirementLevel === "one-of") {
      const hasOne = section.items.some(item => checkedItems[item.id]);
      return sum + (hasOne ? 1 : 0);
    }
    return sum;
  }, 0);

  const getRequirementBadge = (level) => {
    switch (level) {
      case "required":
        return { text: "REQUIRED", color: "#D32F2F" };
      case "one-of":
        return { text: "NEED ONE", color: "#F57C00" };
      case "recommended":
        return { text: "RECOMMENDED", color: "#388E3C" };
      case "conditional":
        return { text: "IF REQUESTED", color: "#7B1FA2" };
      default:
        return { text: "", color: "#999" };
    }
  };

  const pathwayOptions = [
    { id: "work", title: "Work-Based Immigration", icon: "💼" },
    { id: "family", title: "Family-Based Immigration", icon: "👨‍👩‍👧‍👦" },
    { id: "student", title: "Student Pathway", icon: "🎓" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER WITH PATHWAY SELECTOR */}
        <View style={styles.header}>
          <Text style={styles.title}>Document Checklist</Text>
          
          <TouchableOpacity
            style={styles.pathwaySelector}
            onPress={() => setShowPathwaySelector(true)}
          >
            <Text style={styles.pathwayIcon}>
              {pathwayOptions.find(p => p.id === selectedPathway)?.icon}
            </Text>
            <Text style={styles.pathwayName}>
              {pathway?.title || "Select Pathway"}
            </Text>
            <Text style={styles.changeText}>Change ›</Text>
          </TouchableOpacity>

          <View style={styles.badges}>
            <DataUpdateBadge
              label="Updated"
              lastUpdated={PROCESSING_TIMES_META.lastUpdated}
            />
          </View>
        </View>

        {/* PROGRESS */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Required Documents</Text>
            <Text style={styles.progressCount}>
              {requiredCompleted} of {requiredItems}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${requiredItems > 0 ? (requiredCompleted / requiredItems) * 100 : 0}%` },
              ]}
            />
          </View>
        </View>

        {/* LEGEND */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Document Requirements</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#D32F2F" }]} />
              <Text style={styles.legendText}>Required</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#F57C00" }]} />
              <Text style={styles.legendText}>Need One</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#388E3C" }]} />
              <Text style={styles.legendText}>Recommended</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#7B1FA2" }]} />
              <Text style={styles.legendText}>If Requested</Text>
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
                    <View style={[styles.requirementBadge, { backgroundColor: badge.color }]}>
                        <Text style={styles.requirementBadgeText}>{badge.text}</Text>
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
                      onPress={() => toggleItem(item.id)}
                    >
                      <Text style={[
                        styles.checkbox,
                        item.required && styles.checkboxRequired,
                      ]}>
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
                        <Text style={styles.itemDesc}>
                          {item.description}
                        </Text>
                        {item.whenNeeded && (
                          <Text style={styles.whenNeeded}>
                            📌 {item.whenNeeded}
                          </Text>
                        )}
                        {item.who && (
                          <Text style={styles.who}>
                            👤 {item.who}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* TIPS */}
        <View style={styles.tip}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            Focus on REQUIRED documents first. Your checklist is customized for {pathway?.title}.
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
            <Text style={styles.modalTitle}>Select Pathway</Text>
            {pathwayOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.pathwayOption,
                  selectedPathway === option.id && styles.pathwayOptionActive,
                ]}
                onPress={() => switchPathway(option.id)}
              >
                <Text style={styles.pathwayOptionIcon}>{option.icon}</Text>
                <Text style={[
                  styles.pathwayOptionText,
                  selectedPathway === option.id && styles.pathwayOptionTextActive,
                ]}>
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
  title: { fontSize: 26, fontWeight: "bold" },
  
  pathwaySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F4F8",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  pathwayIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  pathwayName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  changeText: {
    color: "#2E86AB",
    fontWeight: "600",
  },

  badges: { flexDirection: "row", gap: 8, marginTop: 8 },

  progressCard: {
    margin: 20,
    padding: 16,
    backgroundColor: "#2E86AB",
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  progressCount: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
  },
  progressFill: {
    height: 8,
    backgroundColor: "#FFF",
    borderRadius: 4,
  },

  legendCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  legendItems: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },

  section: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    padding: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flex: 1,
    flexShrink: 1,
  },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: "600", 
    flex: 1,
    marginRight: 8,
  },
  requirementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  requirementBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  sectionTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  expand: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    backgroundColor: "#2E86AB",
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: "center",
    lineHeight: 28,
    overflow: "hidden",
    marginLeft: 8,
    flexShrink: 0,
  },

  items: { padding: 10 },
  item: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
    marginBottom: 8,
  },
  itemRequired: {
    borderLeftWidth: 3,
    borderLeftColor: "#D32F2F",
  },
  itemAlternative: {
    borderLeftWidth: 3,
    borderLeftColor: "#F57C00",
  },
  itemChecked: { 
    backgroundColor: "#E8F4F8" 
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#DDD",
    borderRadius: 4,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "bold",
    color: "#2E86AB",
    marginRight: 12,
  },
  checkboxRequired: {
    borderColor: "#D32F2F",
  },
  itemText: { flex: 1 },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  itemName: { 
    fontSize: 15, 
    fontWeight: "500",
    flex: 1,
  },
  itemNameChecked: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  requiredIndicator: {
    color: "#D32F2F",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 4,
  },
  quantity: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    color: "#1976D2",
    marginLeft: 8,
  },
  itemDesc: { 
    fontSize: 12, 
    color: "#666", 
    marginTop: 2 
  },
  whenNeeded: {
    fontSize: 11,
    color: "#7B1FA2",
    marginTop: 4,
    fontStyle: "italic",
  },
  who: {
    fontSize: 11,
    color: "#1976D2",
    marginTop: 2,
  },

  tip: {
    flexDirection: "row",
    margin: 20,
    padding: 16,
    backgroundColor: "#E8F4F8",
    borderRadius: 12,
  },
  tipIcon: { fontSize: 20, marginRight: 10 },
  tipText: { fontSize: 14, color: "#555", flex: 1 },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  pathwayOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    marginBottom: 10,
  },
  pathwayOptionActive: {
    backgroundColor: "#E8F4F8",
    borderWidth: 2,
    borderColor: "#2E86AB",
  },
  pathwayOptionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  pathwayOptionText: {
    flex: 1,
    fontSize: 16,
  },
  pathwayOptionTextActive: {
    fontWeight: "600",
    color: "#2E86AB",
  },
  checkmark: {
    fontSize: 20,
    color: "#2E86AB",
    fontWeight: "bold",
  },
});