import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Data
import {
  getProcessingTime,
  formatProcessingTime,
  getGreenCardTimeline,
  PROCESSING_TIMES_META,
} from "../data/processingTimes";
import { CURRENT_CAP_STATUS } from "../data/h1bCapData";
import { SEVIS_FEES, OPT_TIMELINE } from "../data/sevisData";
import analytics, { EVENTS } from "../utils/analytics";

const TimelineScreen = ({ route }) => {
  const pathway = route.params?.pathway || "general";
  const [selectedVisa, setSelectedVisa] = useState(0);
  analytics.screen("Timeline", { pathway });

  const getTimelineData = () => {
    const timelines = {
      work: [
        {
          visa: "H-1B",
          totalTime: "8-14 months (plus lottery wait)",
          alert: `FY2027 registration closed March 19. Wage-weighted lottery — higher wages = better odds.`,
          steps: [
            {
              title: "Job Offer",
              duration: "Variable",
              description:
                "Secure employment with sponsoring employer. Wage level affects lottery odds.",
            },
            {
              title: "H-1B Registration",
              duration: "March 4-19",
              description:
                "Registration fee: $215. Employer submits via MyUSCIS. SOC code and wage level required.",
            },
            {
              title: "Selection Notice",
              duration: "By March 31",
              description:
                "Wage-weighted selection: Level IV up to 4x odds vs Level I.",
            },
            {
              title: "LCA Filing",
              duration: "7 days",
              description: "Labor Condition Application with DOL",
            },
            {
              title: "I-129 Petition",
              duration: "6-8 months",
              description:
                "USCIS regular processing (actual: 8+ months). Premium: 15 days for $2,965",
            },
            {
              title: "$100K Fee (if applicable)",
              duration: "At filing",
              description:
                "Applies to consular processing cases. Does NOT apply to most F-1→H-1B changes of status.",
              isWarning: true,
            },
            {
              title: "Visa Stamp (if abroad)",
              duration: "1-3 months",
              description: "DS-160 + embassy interview. India: ~1 month, Mexico: ~1 month",
            },
            {
              title: "Start Work",
              duration: "Oct 1 or later",
              description: "Cannot start before fiscal year begins",
            },
          ],
        },
        {
          visa: "L-1",
          totalTime: "4-8 months total",
          steps: [
            {
              title: "Eligibility Check",
              duration: "1 week",
              description: "Confirm 1 year employment abroad with qualifying company",
            },
            {
              title: "I-129 Petition",
              duration: "4-6 months",
              description: "USCIS regular processing. No cap or lottery.",
            },
            {
              title: "Premium Option",
              duration: "15 days",
              description: "Expedite for $2,965",
              isHighlight: true,
            },
            {
              title: "Visa Stamp (if abroad)",
              duration: "1-2 months",
              description: "DS-160 + embassy interview",
            },
            {
              title: "Start Work",
              duration: "Upon approval",
              description: "No October 1 wait — can start immediately",
            },
          ],
        },
        {
          visa: "O-1",
          totalTime: "5-10 months",
          steps: [
            {
              title: "Evidence Collection",
              duration: "1-3 months",
              description:
                "Gather extraordinary ability evidence — awards, publications, media, salary",
            },
            {
              title: "Advisory Opinion",
              duration: "2-4 weeks",
              description: "Peer group or union consultation letter",
            },
            {
              title: "I-129 Petition",
              duration: "4-8 months",
              description: "USCIS regular processing. No cap or lottery.",
            },
            {
              title: "Premium Option",
              duration: "15 days",
              description: "Expedite for $2,965",
              isHighlight: true,
            },
            {
              title: "Visa Stamp (if abroad)",
              duration: "Varies",
              description: "If outside U.S., consular processing required",
            },
          ],
        },
        {
          visa: "Green Card (EB)",
          totalTime: getGreenCardTimeline("default").formatted,
          alert: "India/China: Add 4-12+ years for priority date wait",
          steps: [
            {
              title: "Prevailing Wage (PWD)",
              duration: "~3 months",
              description:
                "DOL processing Dec 2025 filings. Improved from ~6 months.",
              isHighlight: true,
            },
            {
              title: "Recruitment",
              duration: "2-3 months",
              description:
                "Job ads, resume review, interviews — must document no qualified U.S. workers",
            },
            {
              title: "PERM Filing",
              duration: "~17 months",
              description:
                "DOL adjudicating Oct 2024 filings (503 days avg). Audit adds ~9 months.",
              isWarning: true,
            },
            {
              title: "I-140 Petition",
              duration: "6-12 months",
              description: "USCIS immigrant petition. Premium: 15 days for $2,965",
            },
            {
              title: "Priority Date Wait",
              duration: "Varies by country",
              description:
                "India EB-2: 12+ years. China EB-2: 4+ years. Others: may be current.",
              isWarning: true,
            },
            {
              title: "I-485 / Consular Processing",
              duration: "8-14 months",
              description:
                "Adjustment of status or immigrant visa interview. EAD validity: 18 months max.",
            },
            {
              title: "Green Card",
              duration: "1-2 months",
              description: "Card arrives by mail after approval",
            },
          ],
        },
      ],
      family: [
        {
          visa: "Immediate Relative",
          totalTime: "58+ months (almost 5 years)",
          alert: "Presidential Proclamations may impact processing for certain nationalities",
          steps: [
            {
              title: "I-130 Petition",
              duration: "~50 months",
              description: "USCIS processing for immediate relatives",
              isWarning: true,
            },
            {
              title: "NVC Processing",
              duration: "2-3 months",
              description: "Document collection and review",
            },
            {
              title: "Medical Exam",
              duration: "1 week",
              description: "Panel physician examination",
            },
            {
              title: "Embassy Interview",
              duration: "2-12 months",
              description: "Varies significantly by country and nationality",
            },
            {
              title: "Visa Issuance",
              duration: "1-2 weeks",
              description: "Immigrant visa issued",
            },
            {
              title: "Enter U.S.",
              duration: "Within 6 months",
              description: "Must enter before visa expires",
            },
            {
              title: "Green Card",
              duration: "1-2 months",
              description: "Arrives by mail after entry",
            },
          ],
        },
        {
          visa: "F4 Sibling",
          totalTime: "13-24+ years",
          alert: "Longest wait in immigration system",
          steps: [
            {
              title: "I-130 Petition",
              duration: "~95 months",
              description: "8 years just for petition approval",
              isWarning: true,
            },
            {
              title: "Priority Date Wait",
              duration: "5-16+ years",
              description:
                "India: 19+ yrs, Mexico: 25+ yrs, Philippines: 20+ yrs",
              isWarning: true,
            },
            {
              title: "NVC Processing",
              duration: "2-3 months",
              description: "Once visa number available",
            },
            {
              title: "Embassy Interview",
              duration: "2-12 months",
              description: "Final step",
            },
          ],
        },
      ],
      student: [
        {
          visa: "F-1 Student",
          totalTime: "3-4 months",
          steps: [
            {
              title: "School Acceptance",
              duration: "Variable",
              description: "Get I-20 from SEVP-certified school",
            },
            {
              title: "SEVIS Payment",
              duration: "1 day",
              description: `Pay $${SEVIS_FEES.F.amount} I-901 fee online`,
            },
            {
              title: "DS-160",
              duration: "1 day",
              description: "Complete visa application",
            },
            {
              title: "Interview Wait",
              duration: "1-4 months",
              description: "India: 1-3 months, China: 1 month",
            },
            {
              title: "Embassy Interview",
              duration: "1 day",
              description: "Bring I-20, SEVIS receipt, financials",
            },
            {
              title: "Visa Issuance",
              duration: "3-7 days",
              description: "Passport returned with visa",
            },
            {
              title: "Enter U.S.",
              duration: "30 days before",
              description: "Can enter up to 30 days before program start",
            },
          ],
        },
        {
          visa: "F-1 to OPT",
          totalTime: `${OPT_TIMELINE.POST_COMPLETION.earliest} days before to ${OPT_TIMELINE.POST_COMPLETION.latest} days after graduation`,
          steps: [
            {
              title: "Apply Early",
              duration: "90 days before",
              description: "Apply up to 90 days before graduation",
            },
            {
              title: "I-765 Processing",
              duration: "3-5 months",
              description:
                "USCIS processing. Premium: 30 days for $1,780",
            },
            {
              title: "EAD Card",
              duration: "1 week",
              description: "Arrives by mail",
            },
            {
              title: "Start Work",
              duration: "Within 60 days",
              description: "Must start within 60 days of graduation",
            },
            {
              title: "Unemployment Limit",
              duration: "90 days total",
              description: "Cannot exceed 90 days unemployed",
            },
            {
              title: "STEM Extension",
              duration: "24 months",
              description:
                "Additional time for STEM graduates (36 months total OPT). Requires E-Verify employer.",
              isHighlight: true,
            },
            {
              title: "H-1B Transition",
              duration: "March annually",
              description:
                "Apply for H-1B lottery. Cap-gap extends OPT if petition filed before expiry.",
              isHighlight: true,
            },
          ],
        },
      ],
    };

    return timelines[pathway] || timelines.work;
  };

  const timelineData = getTimelineData();
  const currentTimeline = timelineData[selectedVisa];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Process Timeline</Text>
          <Text style={styles.subtitle}>
            Based on {PROCESSING_TIMES_META.lastUpdated} USCIS / DOL data
          </Text>
        </View>

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
                ]}
                onPress={() => {
                    analytics.track(EVENTS.TIMELINE_VISA_SELECTED, {
                      visa: item.visa,
                      pathway,
                    });
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

        {currentTimeline.alert && (
          <View style={styles.alertCard}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <Text style={styles.alertText}>{currentTimeline.alert}</Text>
          </View>
        )}

        <View style={styles.totalTimeCard}>
          <Text style={styles.totalTimeLabel}>Total Timeline</Text>
          <Text style={styles.totalTimeValue}>
            {currentTimeline.totalTime}
          </Text>
          <Text style={styles.disclaimer}>
            Based on {PROCESSING_TIMES_META.lastUpdated} data
          </Text>
        </View>

        <View style={styles.timelineContainer}>
          {currentTimeline.steps.map((step, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineNode,
                    step.isWarning && styles.timelineNodeWarning,
                    step.isHighlight && styles.timelineNodeHighlight,
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
                ]}
              >
                <View style={styles.stepHeader}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text
                    style={[
                      styles.stepDuration,
                      step.isWarning && styles.stepDurationWarning,
                    ]}
                  >
                    {step.duration}
                  </Text>
                </View>
                <Text style={styles.stepDescription}>
                  {step.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* PREMIUM PROCESSING INFO */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            ⚡ Premium Processing (March 2026)
          </Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              I-129 (H-1B, L-1, O-1): 15 days for $2,965
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              I-140 (EB-1, EB-2, EB-3): 15-45 days for $2,965
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              I-765 (OPT/STEM OPT): 30 days for $1,780
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              I-539 (Status Change): 30 days for $2,075
            </Text>
          </View>
        </View>

        {/* CURRENT DELAYS */}
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⏱️ Current Delays</Text>
          <View style={styles.warningItem}>
            <Text style={styles.warningBullet}>•</Text>
            <Text style={styles.warningText}>
              Family I-130: 50-95 months (4-8 years)
            </Text>
          </View>
          <View style={styles.warningItem}>
            <Text style={styles.warningBullet}>•</Text>
            <Text style={styles.warningText}>
              India EB-2/3: 12+ year priority date wait
            </Text>
          </View>
          <View style={styles.warningItem}>
            <Text style={styles.warningBullet}>•</Text>
            <Text style={styles.warningText}>
              PERM labor certification: ~17 months (503 days)
            </Text>
          </View>
          <View style={styles.warningItem}>
            <Text style={styles.warningBullet}>•</Text>
            <Text style={styles.warningText}>
              Canada B-1/B-2 visitor visa: 16 month wait
            </Text>
          </View>
          <View style={styles.warningItem}>
            <Text style={styles.warningBullet}>•</Text>
            <Text style={styles.warningText}>
              EAD validity now 18 months max — plan renewals early
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.updateButton}>
          <Text style={styles.updateButtonText}>
            Data Updated: {PROCESSING_TIMES_META.lastUpdated}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TimelineScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { padding: 20, backgroundColor: "#FFFFFF" },
  title: { fontSize: 28, fontWeight: "bold", color: "#1A1A1A" },
  subtitle: { fontSize: 16, color: "#666666", marginTop: 5 },
  visaSelector: { paddingHorizontal: 20, paddingVertical: 15 },
  visaTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  visaTabActive: { backgroundColor: "#2E86AB", borderColor: "#2E86AB" },
  visaTabText: { fontSize: 14, fontWeight: "500", color: "#666666" },
  visaTabTextActive: { color: "#FFFFFF" },
  alertCard: {
    backgroundColor: "#FFF3CD",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  alertIcon: { fontSize: 16, marginRight: 8 },
  alertText: { flex: 1, fontSize: 13, color: "#333" },
  totalTimeCard: {
    backgroundColor: "#2E86AB",
    margin: 20,
    padding: 25,
    borderRadius: 12,
    alignItems: "center",
  },
  totalTimeLabel: { fontSize: 14, color: "#FFFFFF", opacity: 0.9, marginBottom: 5 },
  totalTimeValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  disclaimer: { fontSize: 12, color: "#FFFFFF", opacity: 0.7, fontStyle: "italic" },
  timelineContainer: { paddingHorizontal: 20, marginBottom: 20 },
  timelineItem: { flexDirection: "row", marginBottom: 30 },
  timelineLeft: { width: 40, alignItems: "center" },
  timelineNode: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#2E86AB",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineNodeWarning: { backgroundColor: "#FF5252" },
  timelineNodeHighlight: { backgroundColor: "#4CAF50" },
  timelineNodeInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#E0E0E0",
    marginTop: 5,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginLeft: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineContentWarning: {
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  timelineContentHighlight: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  stepTitle: { fontSize: 16, fontWeight: "bold", color: "#1A1A1A", flex: 1 },
  stepDuration: { fontSize: 13, color: "#2E86AB", fontWeight: "500" },
  stepDurationWarning: { color: "#D32F2F" },
  stepDescription: { fontSize: 14, color: "#666666", lineHeight: 20 },
  infoCard: {
    backgroundColor: "#E8F4F8",
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: { fontSize: 16, fontWeight: "bold", color: "#1A1A1A", marginBottom: 15 },
  infoItem: { flexDirection: "row", marginBottom: 10 },
  infoBullet: { fontSize: 14, color: "#2E86AB", marginRight: 10 },
  infoText: { fontSize: 14, color: "#333333", flex: 1, lineHeight: 20 },
  warningCard: {
    backgroundColor: "#FFF3E0",
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  warningTitle: { fontSize: 16, fontWeight: "bold", color: "#1A1A1A", marginBottom: 15 },
  warningItem: { flexDirection: "row", marginBottom: 10 },
  warningBullet: { fontSize: 14, color: "#FF9800", marginRight: 10 },
  warningText: { fontSize: 14, color: "#333333", flex: 1, lineHeight: 20 },
  updateButton: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2E86AB",
    marginBottom: 30,
  },
  updateButtonText: { color: "#2E86AB", fontSize: 16, fontWeight: "bold" },
});