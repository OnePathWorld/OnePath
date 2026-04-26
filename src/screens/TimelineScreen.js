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
              description:
                "DS-160 + embassy interview. India: ~1 month, Mexico: ~1 month",
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
              description:
                "Confirm 1 year employment abroad with qualifying company",
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
              description:
                "USCIS immigrant petition. Premium: 15 days for $2,965",
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
          alert:
            "Presidential Proclamations may impact processing for certain nationalities",
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
              description: "USCIS processing. Premium: 30 days for $1,780",
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

      // =========================================================
      // NEW: CITIZENSHIP / NATURALIZATION TIMELINES
      // =========================================================
      citizenship: [
        {
          visa: "5-Year Standard",
          totalTime: "8-14 months from filing",
          alert:
            "You can file N-400 up to 90 days before your 5-year eligibility date — don't wait!",
          steps: [
            {
              title: "Confirm Eligibility",
              duration: "Before filing",
              description:
                "Verify 5 years as LPR, 30 months physical presence, no single trip over 6 months, good moral character",
            },
            {
              title: "Gather Documents",
              duration: "2-4 weeks",
              description:
                "Tax returns (5 yrs), travel records, green card copies, passport photos, selective service if applicable",
            },
            {
              title: "File Form N-400",
              duration: "1 day",
              description:
                "Online: $710 / Paper: $760 / Military: $0. File up to 90 days before eligibility date.",
              isHighlight: true,
            },
            {
              title: "Biometrics Appointment",
              duration: "~1 month after filing",
              description:
                "Fingerprints and photo taken at an Application Support Center (ASC)",
            },
            {
              title: "Background Check",
              duration: "Runs concurrently",
              description:
                "FBI name and fingerprint check — runs in background while application is processed",
            },
            {
              title: "Interview Notice",
              duration: "3-12 months",
              description:
                "USCIS schedules interview at local field office. Wait times vary significantly by location.",
              isWarning: true,
            },
            {
              title: "Naturalization Interview",
              duration: "1 day",
              description:
                "Officer reviews N-400 answers, administers English reading/writing test and up to 10 civics questions (must pass 6)",
            },
            {
              title: "Decision",
              duration: "Same day or weeks",
              description:
                "Granted (most common), continued (more info needed), or denied. Most approvals happen at interview.",
              isHighlight: true,
            },
            {
              title: "Oath Ceremony",
              duration: "Days to weeks after approval",
              description:
                "Take the Oath of Allegiance. Can be same-day administrative ceremony or scheduled court ceremony.",
              isHighlight: true,
            },
            {
              title: "🇺🇸 U.S. Citizen",
              duration: "Official at oath",
              description:
                "Receive Certificate of Naturalization. Apply for U.S. passport immediately — no waiting period.",
              isHighlight: true,
            },
          ],
        },

        {
          visa: "3-Year (Marriage)",
          totalTime: "8-14 months from filing",
          alert:
            "Must still be married to and living with the same U.S. citizen at interview — not just at filing.",
          steps: [
            {
              title: "Confirm Eligibility",
              duration: "Before filing",
              description:
                "3 years as LPR, still married to same U.S. citizen, 18 months physical presence, spouse citizen for all 3 years",
            },
            {
              title: "Gather Documents",
              duration: "2-4 weeks",
              description:
                "Tax returns (3 yrs), travel records, marriage certificate, spouse's proof of citizenship, joint evidence",
            },
            {
              title: "File Form N-400",
              duration: "1 day",
              description:
                "Online: $710 / Paper: $760. File up to 90 days before 3-year eligibility date.",
              isHighlight: true,
            },
            {
              title: "Biometrics Appointment",
              duration: "~1 month after filing",
              description: "Fingerprints and photo at Application Support Center",
            },
            {
              title: "Interview Notice",
              duration: "3-12 months",
              description:
                "Officer will verify marriage is genuine and ongoing — bring joint evidence",
              isWarning: true,
            },
            {
              title: "Naturalization Interview",
              duration: "1 day",
              description:
                "Standard civics and English test plus verification that marriage is still intact",
            },
            {
              title: "Oath Ceremony",
              duration: "Days to weeks after approval",
              description: "Take the Oath of Allegiance — become a U.S. citizen",
              isHighlight: true,
            },
            {
              title: "🇺🇸 U.S. Citizen",
              duration: "Official at oath",
              description:
                "Certificate of Naturalization issued. Apply for passport immediately.",
              isHighlight: true,
            },
          ],
        },

        {
          visa: "Military Service",
          totalTime: "Expedited — varies by branch",
          alert:
            "Filing fee is $0 for all military applicants. Active duty during hostility periods = immediate eligibility.",
          steps: [
            {
              title: "Confirm Service Eligibility",
              duration: "Before filing",
              description:
                "1 year honorable service (peacetime) OR active duty during designated hostility period = immediate",
              isHighlight: true,
            },
            {
              title: "Get Form N-426 Certified",
              duration: "1-2 weeks",
              description:
                "Commanding officer certifies military service. Required before or with N-400 filing.",
              who: "Commanding officer certifies",
            },
            {
              title: "File Form N-400",
              duration: "1 day",
              description:
                "Filing fee: $0 for military. Can file at overseas U.S. embassy if on active duty abroad.",
              isHighlight: true,
            },
            {
              title: "Biometrics",
              duration: "~1 month",
              description:
                "Can be completed at military installation in many cases",
            },
            {
              title: "Interview",
              duration: "Expedited",
              description:
                "Military cases often processed faster than civilian. Some ceremonies held on base.",
              isHighlight: true,
            },
            {
              title: "Oath Ceremony",
              duration: "Can be on base",
              description:
                "Military oath ceremonies can happen abroad at U.S. embassies or on military installations",
              isHighlight: true,
            },
            {
              title: "🇺🇸 U.S. Citizen",
              duration: "Official at oath",
              description:
                "Certificate of Naturalization issued. $0 total cost for the entire process.",
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
  const isCitizenshipPathway = pathway === "citizenship";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isCitizenshipPathway ? "Naturalization Timeline" : "Process Timeline"}
          </Text>
          <Text style={styles.subtitle}>
            Based on {PROCESSING_TIMES_META.lastUpdated} USCIS / DOL data
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
                    // NEW: fire naturalization route selected for citizenship pathway
                    if (isCitizenshipPathway) {
                      const routeMap = {
                        "5-Year Standard": "5yr_standard",
                        "3-Year (Marriage)": "3yr_marriage",
                        "Military Service": "military",
                      };
                      analytics.track(EVENTS.NATURALIZATION_ROUTE_SELECTED, {
                        route: routeMap[item.visa] || item.visa,
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
        {currentTimeline.alert && (
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
            {isCitizenshipPathway ? "Typical Timeline" : "Total Timeline"}
          </Text>
          <Text style={styles.totalTimeValue}>
            {currentTimeline.totalTime}
          </Text>
          <Text style={styles.disclaimer}>
            Based on {PROCESSING_TIMES_META.lastUpdated} data
          </Text>
        </View>

        {/* TIMELINE STEPS */}
        <View style={styles.timelineContainer}>
          {currentTimeline.steps.map((step, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineNode,
                    step.isWarning && styles.timelineNodeWarning,
                    step.isHighlight && styles.timelineNodeHighlight,
                    // Citizenship final step gets special star styling
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

        {/* INFO CARD — citizenship gets its own version */}
        {isCitizenshipPathway ? (
  <View style={styles.citizenshipInfoCard}>
    <Text style={styles.infoTitle}>🇺🇸 After You Naturalize</Text>
    <TouchableOpacity
      style={styles.infoItem}
      onPress={() =>
        analytics.track(EVENTS.PASSPORT_INFO_TAPPED, { source: "timeline" })
      }
    >
      <Text style={styles.infoBullet}>•</Text>
      <Text style={styles.infoText}>
        Apply for U.S. passport immediately — no waiting period
      </Text>
    </TouchableOpacity>

            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                Sponsor immediate family members (spouse, children, parents) with no visa quota wait
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                Children under 18 with green cards may automatically acquire citizenship
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                Register to vote — federal elections require U.S. citizenship
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                Check if your birth country allows dual citizenship before renouncing
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>⚡ Premium Processing (March 2026)</Text>
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
        )}

        {/* DELAYS CARD — citizenship gets naturalization-specific delays */}
        {isCitizenshipPathway ? (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⏱️ N-400 Processing Notes</Text>
            <View style={styles.warningItem}>
              <Text style={styles.warningBullet}>•</Text>
              <Text style={styles.warningText}>
                Interview wait varies widely by field office — some cities take 12+ months
              </Text>
            </View>
            <View style={styles.warningItem}>
              <Text style={styles.warningBullet}>•</Text>
              <Text style={styles.warningText}>
                Extended trips abroad (6+ months) can break continuous residence — affects eligibility
              </Text>
            </View>
            <View style={styles.warningItem}>
              <Text style={styles.warningBullet}>•</Text>
              <Text style={styles.warningText}>
                Criminal history — even dismissed charges — must be disclosed and can delay or deny
              </Text>
            </View>
            <View style={styles.warningItem}>
              <Text style={styles.warningBullet}>•</Text>
              <Text style={styles.warningText}>
                Missing tax returns are a common denial reason — file any missing years before applying
              </Text>
            </View>
            <View style={styles.warningItem}>
              <Text style={styles.warningBullet}>•</Text>
              <Text style={styles.warningText}>
                N-400 has no premium processing option — standard processing only
              </Text>
            </View>
          </View>
        ) : (
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
        )}

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
  // NEW: navy blue active tab for citizenship
  visaTabActiveCitizenship: {
    backgroundColor: "#1565C0",
    borderColor: "#1565C0",
  },
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
  // NEW: blue alert for citizenship pathway
  alertCardCitizenship: {
    backgroundColor: "#E8EAF6",
    borderWidth: 1,
    borderColor: "#1565C0",
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
  // NEW: navy blue total time card for citizenship
  totalTimeCardCitizenship: {
    backgroundColor: "#1565C0",
  },
  totalTimeLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 5,
  },
  totalTimeValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  disclaimer: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.7,
    fontStyle: "italic",
  },

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
  // NEW: navy blue highlight node for citizenship
  timelineNodeCitizenship: { backgroundColor: "#1565C0" },
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
  // NEW: blue highlight for citizenship milestone steps
  timelineContentCitizenship: {
    backgroundColor: "#E8EAF6",
    borderWidth: 1,
    borderColor: "#9FA8DA",
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
  // NEW: navy duration text for citizenship milestones
  stepDurationCitizenship: { color: "#1565C0" },
  stepDescription: { fontSize: 14, color: "#666666", lineHeight: 20 },
  // NEW: "who" field for military step
  stepWho: { fontSize: 12, color: "#1976D2", marginTop: 4, fontStyle: "italic" },

  infoCard: {
    backgroundColor: "#E8F4F8",
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  // NEW: citizenship "after you naturalize" card
  citizenshipInfoCard: {
    backgroundColor: "#E8EAF6",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#9FA8DA",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 15,
  },
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
  warningTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 15,
  },
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