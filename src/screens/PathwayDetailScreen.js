import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Data
import { pathwaysData } from "../data/immigrationData";
import { FEES_LAST_UPDATED } from "../data/fees";
import { PROCESSING_TIMES_META } from "../data/processingTimes";
import { getWarningsFor } from "../constants/immigrationWarnings";
import {
  PATHWAY_VIABILITY,
  VIABILITY_LEVELS,
  PATHWAY_TO_VIABILITY_MAP,
  VIABILITY_META,
} from "../data/pathwayViability";

// Components
import TimelineCalculator from "../components/TimelineCalculator";
import FeeCalculator from "../components/FeeCalculator";
import DataUpdateBadge from "../components/DataUpdateBadge";
import AlertBanner from "../components/AlertBanner";
import ViabilityBadge from "../components/ViabilityBadge";
import analytics, { EVENTS } from "../utils/analytics";

// =========================================================
// VISA DETAILS — comprehensive per-visa info
// =========================================================
const VISA_DETAILS = {
  // ----- WORK VISAS -----
  H1B: {
    fullName: "H-1B Specialty Occupation Visa",
    viabilityKey: "H1B",
    purpose:
      "For professionals in specialty occupations requiring a bachelor's degree or higher",
    eligibility: [
      "Bachelor's degree or equivalent in specialty field",
      "Job offer from U.S. employer",
      "Position requires specialized knowledge",
      "Employer must pay prevailing wage",
    ],
    duration: "Initially 3 years, extendable to 6 years total",
    pathToGreenCard:
      "Yes — employer can sponsor EB-2 or EB-3 green card while on H-1B",
    spouseWork: "H-4 spouse can work with EAD if primary has approved I-140",
    pros: [
      "Dual intent allowed (can pursue green card)",
      "Spouse and children can accompany",
      "Can change employers (with new petition)",
    ],
    cons: [
      "Subject to annual lottery — now wage-weighted",
      "Tied to sponsoring employer",
      "$100,000 additional fee for consular-processing cases (Sept 2025+)",
      "6-year maximum without green card progress",
    ],
    forms: [
      {
        name: "LCA (Labor Condition Application)",
        purpose: "Certifies wages and working conditions",
        link: "https://flag.dol.gov/programs/LCA",
        who: "Employer files with DOL",
      },
      {
        name: "Form I-129",
        purpose: "Petition for nonimmigrant worker",
        link: "https://www.uscis.gov/i-129",
        who: "Employer files with USCIS",
      },
      {
        name: "Form DS-160",
        purpose: "Visa application for consular processing",
        link: "https://ceac.state.gov/genniv/",
        who: "Employee completes online",
      },
    ],
  },

  L1: {
    fullName: "L-1 Intracompany Transfer Visa",
    viabilityKey: "L1",
    purpose:
      "For employees transferring from foreign branch to U.S. office of same company",
    eligibility: [
      "Worked for company abroad for 1+ year in past 3 years",
      "Manager/Executive (L-1A) or Specialized Knowledge (L-1B)",
      "Company must have qualifying relationship",
    ],
    duration: "L-1A: 3 years initially (7 total), L-1B: 3 years (5 total)",
    pathToGreenCard:
      "Yes — L-1A can lead to EB-1C green card (faster than H-1B route)",
    spouseWork: "L-2 spouse can work with EAD immediately",
    pros: [
      "No lottery or cap",
      "No prevailing wage requirement",
      "Spouse can work immediately",
      "L-1A to EB-1C is faster green card route",
    ],
    cons: [
      "Must work for same employer",
      "Cannot change companies",
      "Requires prior employment abroad",
    ],
    forms: [
      {
        name: "Form I-129S",
        purpose: "L Classification Supplement",
        link: "https://www.uscis.gov/i-129",
        who: "Employer files with I-129",
      },
      {
        name: "Form DS-160",
        purpose: "Visa application",
        link: "https://ceac.state.gov/genniv/",
        who: "Employee completes",
      },
    ],
  },

  O1: {
    fullName: "O-1 Extraordinary Ability Visa",
    viabilityKey: "O1",
    purpose:
      "For individuals with extraordinary ability in sciences, arts, education, business, or athletics",
    eligibility: [
      "Demonstrated extraordinary ability",
      "National/international recognition",
      "Substantial evidence of achievements",
      "Job offer in field of expertise",
    ],
    duration: "Up to 3 years initially, unlimited 1-year extensions",
    pathToGreenCard:
      "Yes — can self-petition for EB-1A or employer can sponsor",
    spouseWork: "O-3 spouse cannot work",
    pros: [
      "No lottery or cap",
      "No degree requirement",
      "Unlimited extensions possible",
      "Can have multiple employers",
    ],
    cons: [
      "High evidence threshold",
      "Spouse cannot work",
      "Extensive documentation needed",
    ],
    forms: [
      {
        name: "Form I-129",
        purpose: "Petition with O supplement",
        link: "https://www.uscis.gov/i-129",
        who: "Employer or agent files",
      },
      {
        name: "Advisory Opinion",
        purpose: "Peer group consultation letter",
        link: null,
        who: "From relevant union/peer group",
      },
    ],
  },

  // ----- FAMILY VISAS -----
  IR: {
    fullName: "Immediate Relative of U.S. Citizen",
    viabilityKey: "IMMEDIATE_RELATIVE",
    purpose:
      "For spouses, unmarried children under 21, and parents of U.S. citizens",
    eligibility: [
      "Spouse of U.S. citizen (IR-1/CR-1)",
      "Unmarried child under 21 of U.S. citizen (IR-2/CR-2)",
      "Parent of U.S. citizen who is 21+ (IR-5)",
    ],
    duration: "Permanent residence (green card) immediately",
    pathToGreenCard: "This IS the green card — immediate permanent residence",
    spouseWork: "Yes — green card allows unrestricted work",
    pros: [
      "No annual limits or waiting for priority date",
      "Fastest family immigration category",
      "Direct to green card",
      "Can work immediately upon arrival",
    ],
    cons: [
      "Still takes 12-24 months processing",
      "Must prove genuine relationship",
      "CR-1 conditional if married <2 years",
    ],
    note:
      "IMMEDIATE RELATIVE means no visa number wait — you skip the line! Other family categories wait years for visa numbers.",
    forms: [
      {
        name: "Form I-130",
        purpose: "Establishes qualifying family relationship",
        link: "https://www.uscis.gov/i-130",
        who: "U.S. citizen files for relative",
      },
      {
        name: "Form I-864",
        purpose: "Affidavit of Support — financial sponsorship",
        link: "https://www.uscis.gov/i-864",
        who: "Petitioner provides",
      },
      {
        name: "Form DS-260",
        purpose: "Immigrant visa application",
        link: "https://ceac.state.gov/ceac/",
        who: "Beneficiary completes",
      },
    ],
  },

  F1: {
    fullName: "F-1: Unmarried Sons/Daughters of U.S. Citizens",
    viabilityKey: "FAMILY_PREFERENCE",
    purpose: "For unmarried children 21+ years old of U.S. citizens",
    eligibility: ["Must be unmarried", "21 years or older", "Child of U.S. citizen"],
    duration: "Permanent residence after visa available",
    currentWait: "7-8 years from petition to visa availability",
    pathToGreenCard:
      "This leads directly to green card once visa number available",
    spouseWork: "N/A — must be unmarried",
    pros: ["Leads to permanent residence", "Can include unmarried children under 21"],
    cons: [
      "7-8 year wait for visa number",
      "Must remain unmarried",
      "Marriage terminates eligibility",
    ],
    forms: [
      {
        name: "Form I-130",
        purpose: "Family petition to establish relationship",
        link: "https://www.uscis.gov/i-130",
        who: "U.S. citizen parent files",
      },
    ],
  },

  F2A: {
    fullName: "F-2A: Spouses and Minor Children of Green Card Holders",
    viabilityKey: "FAMILY_PREFERENCE",
    purpose:
      "For spouses and unmarried children under 21 of lawful permanent residents",
    eligibility: ["Spouse of green card holder", "Unmarried child under 21 of LPR"],
    duration: "Permanent residence after visa available",
    currentWait: "2-3 years from petition to visa availability",
    pathToGreenCard: "This leads directly to green card",
    spouseWork: "Yes — once green card received",
    pros: ["Shorter wait than other family preferences", "Includes spouse and minor children"],
    cons: ["2-3 year wait for visa number", "Petitioner must maintain LPR status"],
    forms: [
      {
        name: "Form I-130",
        purpose: "Family petition",
        link: "https://www.uscis.gov/i-130",
        who: "Green card holder files",
      },
    ],
  },

  F2B: {
    fullName: "F-2B: Unmarried Adult Children of Green Card Holders",
    viabilityKey: "FAMILY_PREFERENCE",
    purpose: "For unmarried children 21+ of lawful permanent residents",
    eligibility: ["Unmarried", "21 years or older", "Child of green card holder"],
    duration: "Permanent residence after visa available",
    currentWait: "6-7 years from petition to visa availability",
    pathToGreenCard: "This leads directly to green card",
    spouseWork: "N/A — must be unmarried",
    pros: ["Leads to permanent residence"],
    cons: [
      "6-7 year wait",
      "Must remain unmarried",
      "If petitioner naturalizes, moves to F-1 (may be longer wait)",
    ],
    forms: [
      {
        name: "Form I-130",
        purpose: "Family petition",
        link: "https://www.uscis.gov/i-130",
        who: "Green card holder parent files",
      },
    ],
  },

  F3: {
    fullName: "F-3: Married Children of U.S. Citizens",
    viabilityKey: "FAMILY_PREFERENCE",
    purpose: "For married children of any age of U.S. citizens",
    eligibility: ["Married", "Any age", "Child of U.S. citizen"],
    duration: "Permanent residence after visa available",
    currentWait: "12-13 years from petition to visa availability",
    pathToGreenCard: "This leads directly to green card for entire family",
    spouseWork: "Yes — spouse and children included",
    pros: ["Includes spouse and children", "No age limit"],
    cons: ["12-13 year wait for most countries", "23+ years for Philippines"],
    forms: [
      {
        name: "Form I-130",
        purpose: "Family petition",
        link: "https://www.uscis.gov/i-130",
        who: "U.S. citizen parent files",
      },
    ],
  },

  F4: {
    fullName: "F-4: Brothers and Sisters of U.S. Citizens",
    viabilityKey: "FAMILY_PREFERENCE",
    purpose: "For siblings of U.S. citizens (petitioner must be 21+)",
    eligibility: [
      "Sibling of U.S. citizen",
      "Petitioner must be 21+ years old",
      "Includes half-siblings and step-siblings",
    ],
    duration: "Permanent residence after visa available",
    currentWait: "13-24 years depending on country",
    pathToGreenCard: "This leads directly to green card for entire family",
    spouseWork: "Yes — spouse and children included",
    pros: [
      "Includes spouse and all unmarried children under 21",
      "Leads to permanent residence",
    ],
    cons: [
      "Longest wait of all categories (13-24 years)",
      "India: 15+ years, Mexico: 23+ years, Philippines: 24+ years",
      "Many proposals to eliminate this category",
    ],
    forms: [
      {
        name: "Form I-130",
        purpose: "Family petition proving sibling relationship",
        link: "https://www.uscis.gov/i-130",
        who: "U.S. citizen sibling files",
      },
    ],
  },

  // ----- STUDENT VISAS -----
  STUDENT: {
    fullName: "F-1 Student Visa",
    viabilityKey: "F1_STUDENT",
    purpose:
      "For academic study at U.S. universities, colleges, high schools, or language programs",
    eligibility: [
      "Accepted to SEVP-certified school",
      "Demonstrate financial support",
      "Maintain full course load",
      "Prove ties to home country",
    ],
    duration: "Duration of study (D/S) plus 60-day grace period",
    pathToGreenCard:
      "No direct path — but can change to H-1B through employer after graduation",
    spouseWork: "F-2 spouse cannot work or study",
    pros: [
      "Can work on campus",
      "OPT allows 1-3 years work after graduation",
      "CPT allows internships during study",
      "Can apply for H-1B while on OPT",
    ],
    cons: [
      "Must maintain full-time enrollment",
      "Limited work options",
      "Spouse cannot work",
      "Must show non-immigrant intent",
    ],
    forms: [
      {
        name: "Form I-20",
        purpose: "Certificate of Eligibility from school",
        link: null,
        who: "School issues after admission",
      },
      {
        name: "SEVIS I-901",
        purpose: "SEVIS fee payment ($350)",
        link: "https://www.fmjfee.com",
        who: "Student pays online",
      },
      {
        name: "Form DS-160",
        purpose: "Visa application",
        link: "https://ceac.state.gov/genniv/",
        who: "Student completes",
      },
      {
        name: "Form I-765 (OPT)",
        purpose: "Optional Practical Training work permit",
        link: "https://www.uscis.gov/i-765",
        who: "Student files 90 days before graduation",
      },
    ],
  },

  J1: {
    fullName: "J-1 Exchange Visitor Visa",
    viabilityKey: "F1_STUDENT",
    purpose: "For educational and cultural exchange programs",
    eligibility: [
      "Accepted to designated exchange program",
      "Categories: student, research, teacher, au pair, etc.",
      "Must have program sponsor",
    ],
    duration: "Varies by program (1-7 years typically)",
    pathToGreenCard:
      "Complicated — many subject to 2-year home residency requirement",
    spouseWork: "J-2 spouse can apply for work permit",
    pros: [
      "Wide variety of programs",
      "Spouse can work with EAD",
      "Some programs allow repeat participation",
    ],
    cons: [
      "Many subject to 2-year home rule",
      "Must return home for 2 years before H/L/green card",
      "Waiver process complex and uncertain",
    ],
    forms: [
      {
        name: "Form DS-2019",
        purpose: "Certificate of Eligibility from sponsor",
        link: null,
        who: "Program sponsor provides",
      },
      {
        name: "SEVIS I-901",
        purpose: "SEVIS fee ($220)",
        link: "https://www.fmjfee.com",
        who: "Participant pays",
      },
    ],
  },

  // =========================================================
  // NEW: CITIZENSHIP / NATURALIZATION VISA DETAILS
  // =========================================================
  N400_5YR: {
    fullName: "Naturalization — 5-Year Continuous Residence",
    viabilityKey: "CITIZENSHIP",
    purpose:
      "Standard path to U.S. citizenship for green card holders after 5 years of continuous residence",
    eligibility: [
      "Held green card for at least 5 years",
      "Continuous residence in the U.S. for 5 years",
      "Physical presence for at least 30 of the past 60 months",
      "No single trip abroad longer than 6 months",
      "18 years of age or older",
      "Good moral character for the full 5-year period",
      "Ability to read, write, and speak basic English",
      "Pass the 100-question civics test",
    ],
    duration: "Permanent — you become a U.S. citizen for life",
    currentWait: "8–14 months from filing to oath ceremony",
    pathToGreenCard: "N/A — this is the step after the green card",
    spouseWork:
      "As a U.S. citizen, your spouse becomes an Immediate Relative — fastest family sponsorship category",
    pros: [
      "Vote in federal elections",
      "U.S. passport — visa-free travel to 180+ countries",
      "Sponsor immediate relatives with no quota wait",
      "Cannot be deported",
      "Eligible for federal jobs and security clearances",
      "Children under 18 may automatically acquire citizenship",
    ],
    cons: [
      "Must renounce prior citizenship (some countries allow dual — check yours)",
      "8–14 month processing time",
      "Must pass English and civics tests",
      "Prior violations or criminal history can disqualify",
    ],
    note:
      "You can file Form N-400 up to 90 days before you reach your 5-year eligibility date.",
    forms: [
      {
        name: "Form N-400",
        purpose: "Application for Naturalization",
        link: "https://www.uscis.gov/n-400",
        who: "Applicant files with USCIS",
      },
      {
        name: "Form I-90 (if needed)",
        purpose: "Renew green card if expired before naturalization",
        link: "https://www.uscis.gov/i-90",
        who: "Applicant files if GC is expired or expiring",
      },
    ],
  },

  N400_3YR: {
    fullName: "Naturalization — 3-Year Rule (Married to U.S. Citizen)",
    viabilityKey: "CITIZENSHIP",
    purpose:
      "Expedited naturalization path for green card holders married to and living with a U.S. citizen",
    eligibility: [
      "Held green card for at least 3 years",
      "Currently married to the same U.S. citizen who petitioned for you",
      "U.S. citizen spouse has been a citizen for all 3 years",
      "Living together with citizen spouse at time of filing",
      "Physical presence for at least 18 of the past 36 months",
      "No single trip abroad longer than 6 months",
      "Good moral character",
      "Pass English and civics requirements",
    ],
    duration: "Permanent — U.S. citizenship for life",
    currentWait: "8–14 months from filing to oath ceremony",
    pathToGreenCard: "N/A — this is the step after the green card",
    spouseWork:
      "Once you naturalize, you can immediately sponsor other family members as a U.S. citizen",
    pros: [
      "Eligible 2 years earlier than the standard 5-year route",
      "All benefits of U.S. citizenship",
      "U.S. passport and visa-free travel",
      "Sponsor family members immediately",
    ],
    cons: [
      "Must still be married to and living with same citizen spouse",
      "If marriage ends before filing, must wait for 5-year route",
      "Divorce or separation can disqualify you from this route",
    ],
    note:
      "You must still be married to the same U.S. citizen at the time you file AND at the time of your interview.",
    forms: [
      {
        name: "Form N-400",
        purpose: "Application for Naturalization",
        link: "https://www.uscis.gov/n-400",
        who: "Applicant files with USCIS",
      },
      {
        name: "Marriage Certificate",
        purpose: "Proof of valid marriage to U.S. citizen",
        link: null,
        who: "Applicant provides",
      },
      {
        name: "Proof of Spouse's Citizenship",
        purpose: "U.S. passport or birth certificate of citizen spouse",
        link: null,
        who: "Applicant provides",
      },
    ],
  },

  N400_MIL: {
    fullName: "Naturalization — Military Service",
    viabilityKey: "CITIZENSHIP",
    purpose:
      "Expedited or immediate naturalization for active duty service members and honorably discharged veterans",
    eligibility: [
      "Active duty or honorably discharged from U.S. armed forces",
      "1 year of honorable service during peacetime",
      "Immediate eligibility during designated periods of hostility",
      "Good moral character",
      "Pass English and civics requirements (some exemptions apply)",
    ],
    duration: "Permanent — U.S. citizenship for life",
    currentWait: "Expedited — can be processed faster than civilian route",
    pathToGreenCard: "N/A — can apply even without a green card in some cases",
    spouseWork:
      "As a U.S. citizen, you can sponsor immediate family members with no wait",
    pros: [
      "N-400 filing fee is completely waived ($0)",
      "Can naturalize abroad through U.S. embassy",
      "Immediate eligibility during hostility periods",
      "Some English/civics test exemptions for long-serving members",
      "Posthumous citizenship available for those who die in service",
    ],
    cons: [
      "Must have honorable discharge — dishonorable discharge disqualifies",
      "Requires military documentation (DD-214)",
    ],
    note:
      "Filing fee is $0 for all active duty and honorably discharged veterans. Use Form N-426 if filing while serving abroad.",
    forms: [
      {
        name: "Form N-400",
        purpose: "Application for Naturalization ($0 fee for military)",
        link: "https://www.uscis.gov/n-400",
        who: "Applicant files with USCIS",
      },
      {
        name: "Form N-426",
        purpose: "Request for Certification of Military or Naval Service",
        link: "https://www.uscis.gov/n-426",
        who: "Required for active duty abroad",
      },
      {
        name: "DD-214",
        purpose: "Certificate of Release or Discharge from Active Duty",
        link: null,
        who: "Issued by branch of service",
      },
    ],
  },

  N600: {
    fullName: "Certificate of Citizenship for Children",
    viabilityKey: "CITIZENSHIP",
    purpose:
      "Documents U.S. citizenship for children who acquired it automatically when a parent naturalized",
    eligibility: [
      "Under 18 years old",
      "Lawful permanent resident (green card holder)",
      "At least one parent is a U.S. citizen by birth or naturalization",
      "Residing in the U.S. in legal and physical custody of citizen parent",
    ],
    duration: "Permanent — documents existing citizenship",
    currentWait: "Varies — this documents citizenship that already occurred",
    pathToGreenCard: "N/A — child is already a citizen",
    spouseWork: "N/A — child citizenship document",
    pros: [
      "May have already happened automatically — N-600 just proves it",
      "Child gets U.S. passport and all citizen rights",
      "Protects against deportation as an adult",
      "Military fee waiver available",
    ],
    cons: [
      "$1,170 filing fee (highest citizenship form fee)",
      "Processing can take 12+ months",
      "Does not apply if child was born after parent already naturalized",
    ],
    note:
      "If your parent naturalized while you were under 18 and you had a green card, you may ALREADY be a U.S. citizen — N-600 just documents it. Check before applying!",
    forms: [
      {
        name: "Form N-600",
        purpose: "Application for Certificate of Citizenship",
        link: "https://www.uscis.gov/n-600",
        who: "Parent files on behalf of child (or adult child files themselves)",
      },
      {
        name: "Parent's Naturalization Certificate",
        purpose: "Proof parent is a U.S. citizen",
        link: null,
        who: "Applicant provides",
      },
      {
        name: "Child's Green Card",
        purpose: "Proof of LPR status at time of parent's naturalization",
        link: null,
        who: "Applicant provides",
      },
    ],
  },
};

// =========================================================
// COMPONENT
// =========================================================
const PathwayDetailScreen = ({ route, navigation }) => {
  const pathway = route?.params?.pathway;
  const pathwayData = pathway ? pathwaysData[pathway.id] : null;
  const [detailModal, setDetailModal] = useState(null);

  if (!pathwayData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Pathway not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const viabilityKeys = PATHWAY_TO_VIABILITY_MAP[pathway.id] || [];
  analytics.screen("PathwayDetail", { pathway: pathway.id });

  const openFormLink = (url, formName) => {
    analytics.track(EVENTS.FORM_LINK_TAPPED, { form: formName, hasUrl: !!url });
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert(
          "Cannot Open Link",
          `Unable to open ${formName}. Please search for it on USCIS.gov`,
          [{ text: "OK" }]
        );
      });
    } else {
      Alert.alert(
        formName,
        "This form is provided by your school/employer or requires special access.",
        [{ text: "OK" }]
      );
    }
  };

  const showImmediateRelativeInfo = () => {
    Alert.alert(
      "What are Immediate Relatives?",
      `Immediate Relatives are the FASTEST family category because they have NO annual limits!\n\n` +
        `WHO QUALIFIES:\n` +
        `• Spouse of U.S. citizen\n` +
        `• Unmarried children under 21 of U.S. citizen\n` +
        `• Parents of U.S. citizen (if citizen is 21+)\n\n` +
        `WHY IT'S SPECIAL:\n` +
        `• No waiting for visa numbers\n` +
        `• No annual caps\n` +
        `• Process in 12-24 months vs 5-20 years\n\n` +
        `All other family categories must wait years for visa numbers to become available.`,
      [{ text: "Got it!", style: "default" }]
    );
  };

  // NEW: citizenship-specific explainer
  const showCitizenshipInfo = () => {
    Alert.alert(
      "Why Naturalize?",
      `Becoming a U.S. citizen gives you rights and protections beyond a green card:\n\n` +
        `🗳️ VOTE in federal, state, and local elections\n` +
        `🛂 U.S. PASSPORT — visa-free travel to 180+ countries\n` +
        `👨‍👩‍👧 SPONSOR FAMILY immediately as Immediate Relatives\n` +
        `🛡️ CANNOT BE DEPORTED — permanent security\n` +
        `💼 FEDERAL JOBS & security clearances\n` +
        `👶 CHILDREN under 18 may automatically become citizens\n\n` +
        `Most green card holders are eligible after 5 years. Married to a U.S. citizen? You may qualify after just 3 years.`,
      [{ text: "Got it!", style: "default" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.pathwayIcon}>{pathwayData.icon}</Text>
          <Text style={styles.title}>{pathwayData.title}</Text>
        </View>

        {/* VIABILITY SECTION */}
        {viabilityKeys.length > 0 && (
          <View style={styles.viabilitySection}>
            <Text style={styles.viabilitySectionTitle}>Current Viability</Text>
            {viabilityKeys.map((key) => (
              <ViabilityBadge
                key={key}
                pathwayKey={key}
                showReason
                onPress={() => {
                  analytics.track(EVENTS.PATHWAY_VIABILITY_TAPPED, {
                    pathwayKey: key,
                    viability: PATHWAY_VIABILITY[key]?.viability,
                  });
                  setDetailModal(key);
                }}
              />
            ))}
            <Text style={styles.viabilityDisclaimer}>
              {VIABILITY_META.disclaimer}
            </Text>
          </View>
        )}

        {/* FAMILY IMMEDIATE RELATIVE EXPLAINER */}
        {pathway.id === "family" && (
          <TouchableOpacity
            style={styles.immediateRelativeCard}
            onPress={showImmediateRelativeInfo}
          >
            <Text style={styles.immediateRelativeIcon}>⭐</Text>
            <View style={styles.immediateRelativeContent}>
              <Text style={styles.immediateRelativeTitle}>
                Immediate Relatives = No Waiting Line!
              </Text>
              <Text style={styles.immediateRelativeText}>
                Spouse, minor children, and parents of U.S. citizens. Tap to
                learn why this matters.
              </Text>
            </View>
            <Text style={styles.immediateRelativeArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* NEW: CITIZENSHIP EXPLAINER BANNER */}
        {pathway.id === "citizenship" && (
          <TouchableOpacity
            style={styles.citizenshipBanner}
            onPress={showCitizenshipInfo}
          >
            <Text style={styles.citizenshipBannerIcon}>🇺🇸</Text>
            <View style={styles.immediateRelativeContent}>
              <Text style={styles.citizenshipBannerTitle}>
                Why become a U.S. citizen?
              </Text>
              <Text style={styles.immediateRelativeText}>
                Passport, voting rights, family sponsorship & more. Tap to learn.
              </Text>
            </View>
            <Text style={styles.immediateRelativeArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* OVERVIEW */}
        <View style={styles.overviewCard}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overviewText}>{pathwayData.overview}</Text>
        </View>

        {/* DATA BADGES */}
        <View style={styles.badgeRow}>
          <DataUpdateBadge
            label="Processing times"
            lastUpdated={PROCESSING_TIMES_META.lastUpdated}
          />
          <DataUpdateBadge
            label="Government fees"
            lastUpdated={FEES_LAST_UPDATED}
          />
        </View>

        {/* VISA OPTIONS — ENHANCED */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {pathway.id === "citizenship"
              ? "Naturalization Routes"
              : "Visa Categories Explained"}
          </Text>

          {Object.values(pathwayData.categories).map((visa, index) => {
            const details = VISA_DETAILS[visa.key];
            const warnings = visa.key ? getWarningsFor(visa.key) : [];

            return (
              <View key={index} style={styles.visaCard}>
                {/* HEADER ROW */}
                <View style={styles.visaHeaderRow}>
                  <Text style={styles.visaName}>
                    {details?.fullName || visa.name}
                  </Text>
                  {/* Show citizenship badge instead of GC badge for citizenship pathway */}
                  {pathway.id === "citizenship" ? (
                    <View style={styles.citizenBadge}>
                      <Text style={styles.citizenBadgeText}>🇺🇸 USC</Text>
                    </View>
                  ) : (
                    details?.pathToGreenCard && (
                      <View style={styles.greenCardBadge}>
                        <Text style={styles.greenCardBadgeText}>→ GC</Text>
                      </View>
                    )
                  )}
                </View>

                {/* INLINE VIABILITY BADGE */}
                {details?.viabilityKey &&
                  PATHWAY_VIABILITY[details.viabilityKey] && (
                    <ViabilityBadge
                      pathwayKey={details.viabilityKey}
                      compact
                      showReason={false}
                    />
                  )}

                {details?.purpose && (
                  <Text style={styles.visaPurpose}>{details.purpose}</Text>
                )}

                {details?.note && (
                  <View style={styles.specialNote}>
                    <Text style={styles.specialNoteText}>
                      ⭐ {details.note}
                    </Text>
                  </View>
                )}

                {/* DYNAMIC WARNINGS */}
                {warnings.map((w) => (
                  <AlertBanner
                    key={w.id}
                    severity={w.severity}
                    message={w.message}
                  />
                ))}

                {/* KEY DETAILS */}
                {details && (
                  <View style={styles.keyDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Duration:</Text>
                      <Text style={styles.detailValue}>
                        {details.duration}
                      </Text>
                    </View>
                    {details.currentWait && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          {pathway.id === "citizenship"
                            ? "Processing Time:"
                            : "Current Wait:"}
                        </Text>
                        <Text
                          style={[
                            styles.detailValue,
                            pathway.id !== "citizenship" && styles.waitTime,
                          ]}
                        >
                          {details.currentWait}
                        </Text>
                      </View>
                    )}
                    {details.spouseWork && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          {pathway.id === "citizenship"
                            ? "Family Benefit:"
                            : "Spouse Can Work:"}
                        </Text>
                        <Text style={styles.detailValue}>
                          {details.spouseWork}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* ELIGIBILITY */}
                {details?.eligibility && (
                  <View style={styles.requirementsContainer}>
                    <Text style={styles.subLabel}>
                      {pathway.id === "citizenship"
                        ? "Requirements:"
                        : "Eligibility Requirements:"}
                    </Text>
                    {details.eligibility.map((req, idx) => (
                      <View key={idx} style={styles.requirementItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.requirementText}>{req}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* PROS AND CONS */}
                {details?.pros && (
                  <View style={styles.prosConsContainer}>
                    <View style={styles.prosColumn}>
                      <Text style={styles.prosLabel}>✅ Benefits</Text>
                      {details.pros.map((pro, idx) => (
                        <Text key={idx} style={styles.proItem}>
                          • {pro}
                        </Text>
                      ))}
                    </View>
                    <View style={styles.consColumn}>
                      <Text style={styles.consLabel}>⚠️ Considerations</Text>
                      {details.cons.map((con, idx) => (
                        <Text key={idx} style={styles.conItem}>
                          • {con}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}

                {/* FORMS WITH LINKS */}
                {details?.forms && (
                  <View style={styles.formsContainer}>
                    <Text style={styles.subLabel}>Required Forms:</Text>
                    {details.forms.map((form, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.formItem}
                        onPress={() => openFormLink(form.link, form.name)}
                      >
                        <View style={styles.formInfo}>
                          <Text style={styles.formName}>
                            {form.name} {form.link && "🔗"}
                          </Text>
                          <Text style={styles.formPurpose}>
                            {form.purpose}
                          </Text>
                          {form.who && (
                            <Text style={styles.formWho}>
                              👤 {form.who}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* PATH TO GREEN CARD — hide for citizenship pathway */}
                {details?.pathToGreenCard && pathway.id !== "citizenship" && (
                  <View style={styles.pathContainer}>
                    <Text style={styles.pathLabel}>
                      🟢 Path to Permanent Residence (Green Card)
                    </Text>
                    <Text style={styles.pathText}>
                      {details.pathToGreenCard}
                    </Text>
                    {pathway.id === "work" && visa.key === "H1B" && (
                      <Text style={styles.pathWarning}>
                        ⚠️ India/China nationals: 12+ year wait for EB-2/EB-3
                        green cards
                      </Text>
                    )}
                  </View>
                )}

                {/* TIMELINE — skip for citizenship (uses N-400 processing) */}
                {visa.processingKey && pathway.id !== "citizenship" && (
                  <TimelineCalculator
                    processingKey={visa.processingKey}
                    country={pathway.id === "work" ? "India" : "default"}
                    category={visa.key}
                    usePremium={visa.hasPremiumProcessing}
                  />
                )}

                {/* FEES */}
                {Array.isArray(visa.feeForms) && visa.feeForms.length > 0 && (
                  <FeeCalculator
                    formKeys={visa.feeForms}
                    context={{
                      filingMethod: "online",
                      includeH1BFee: visa.key === "H1B",
                    }}
                  />
                )}

                {/* NEW: CITIZENSHIP FEE NOTE for military (no feeForms) */}
                {pathway.id === "citizenship" &&
                  visa.key === "N400_MIL" && (
                    <View style={styles.militaryFeeNote}>
                      <Text style={styles.militaryFeeText}>
                        🎖️ Filing fee: $0 — completely waived for military applicants
                      </Text>
                    </View>
                  )}
              </View>
            );
          })}
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              navigation.navigate("Checklist", { pathway: pathway.id })
            }
          >
            <Text style={styles.primaryButtonText}>
              {pathway.id === "citizenship"
                ? "📋 N-400 Document Checklist"
                : "📋 View Document Checklist"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              navigation.navigate("Timeline", { pathway: pathway.id })
            }
          >
            <Text style={styles.secondaryButtonText}>
              {pathway.id === "citizenship"
                ? "📅 Naturalization Timeline"
                : "📅 See Processing Timeline"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={() =>
              Linking.openURL(
                pathway.id === "citizenship"
                  ? "https://www.uscis.gov/citizenship"
                  : "https://www.uscis.gov/forms"
              )
            }
          >
            <Text style={styles.tertiaryButtonText}>
              {pathway.id === "citizenship"
                ? "🔗 USCIS Citizenship Center"
                : "🔗 Visit USCIS Forms Center"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* VIABILITY DETAIL MODAL */}
      <Modal
        visible={!!detailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {detailModal && PATHWAY_VIABILITY[detailModal] && (
              <>
                <View style={styles.modalHeader}>
                  <View
                    style={[
                      styles.modalDot,
                      {
                        backgroundColor:
                          VIABILITY_LEVELS[
                            PATHWAY_VIABILITY[detailModal].viability
                          ]?.color,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.modalTitle,
                      {
                        color:
                          VIABILITY_LEVELS[
                            PATHWAY_VIABILITY[detailModal].viability
                          ]?.color,
                      },
                    ]}
                  >
                    {
                      VIABILITY_LEVELS[
                        PATHWAY_VIABILITY[detailModal].viability
                      ]?.label
                    }
                  </Text>
                </View>

                <Text style={styles.modalReason}>
                  {PATHWAY_VIABILITY[detailModal].shortReason}
                </Text>

                <ScrollView style={styles.modalScroll}>
                  <View style={styles.modalDetails}>
                    {PATHWAY_VIABILITY[detailModal].details.map(
                      (detail, idx) => (
                        <View key={idx} style={styles.modalDetailItem}>
                          <Text style={styles.modalBullet}>•</Text>
                          <Text style={styles.modalDetailText}>
                            {detail}
                          </Text>
                        </View>
                      )
                    )}
                  </View>

                  {PATHWAY_VIABILITY[detailModal].recommendation && (
                    <View style={styles.modalRecommendation}>
                      <Text style={styles.modalRecLabel}>Recommendation</Text>
                      <Text style={styles.modalRecText}>
                        {PATHWAY_VIABILITY[detailModal].recommendation}
                      </Text>
                    </View>
                  )}

                  <Text style={styles.modalUpdated}>
                    Updated: {PATHWAY_VIABILITY[detailModal].updatedDate}
                  </Text>
                </ScrollView>
              </>
            )}

            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setDetailModal(null)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PathwayDetailScreen;

// =========================================================
// STYLES
// =========================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  pathwayIcon: { fontSize: 48, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1A1A1A" },

  // VIABILITY
  viabilitySection: { marginHorizontal: 20, marginTop: 12 },
  viabilitySectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  viabilityDisclaimer: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
    lineHeight: 14,
  },

  // IMMEDIATE RELATIVE
  immediateRelativeCard: {
    backgroundColor: "#E8F5E9",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  immediateRelativeIcon: { fontSize: 24, marginRight: 12 },
  immediateRelativeContent: { flex: 1 },
  immediateRelativeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  immediateRelativeText: { fontSize: 12, color: "#555", marginTop: 2 },
  immediateRelativeArrow: { fontSize: 20, color: "#999" },

  // NEW: CITIZENSHIP BANNER
  citizenshipBanner: {
    backgroundColor: "#E8EAF6",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1565C0",
  },
  citizenshipBannerIcon: { fontSize: 24, marginRight: 12 },
  citizenshipBannerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1565C0",
  },

  // NEW: CITIZEN BADGE
  citizenBadge: {
    backgroundColor: "#1565C0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  citizenBadgeText: { color: "#FFF", fontSize: 11, fontWeight: "bold" },

  // NEW: MILITARY FEE NOTE
  militaryFeeNote: {
    backgroundColor: "#E8F5E9",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  militaryFeeText: {
    fontSize: 13,
    color: "#2E7D32",
    fontWeight: "600",
    textAlign: "center",
  },

  overviewCard: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  overviewText: { fontSize: 16, color: "#666666", lineHeight: 24 },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },

  // VISA CARD
  visaCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  visaHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  visaName: { fontSize: 17, fontWeight: "bold", color: "#2E86AB", flex: 1 },
  greenCardBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  greenCardBadgeText: { color: "#FFF", fontSize: 11, fontWeight: "bold" },
  visaPurpose: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
    marginTop: 6,
    lineHeight: 20,
  },
  specialNote: {
    backgroundColor: "#FFF8E1",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  specialNoteText: { fontSize: 13, color: "#F57C00", lineHeight: 18 },

  // KEY DETAILS
  keyDetails: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailLabel: { fontSize: 13, color: "#666", fontWeight: "500" },
  detailValue: { fontSize: 13, color: "#333", flex: 1, textAlign: "right" },
  waitTime: { color: "#D32F2F", fontWeight: "600" },

  // REQUIREMENTS
  requirementsContainer: { marginTop: 12 },
  subLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8, color: "#333" },
  requirementItem: { flexDirection: "row", marginBottom: 4, paddingLeft: 8 },
  bullet: { marginRight: 6, color: "#666" },
  requirementText: { flex: 1, color: "#666666", fontSize: 13, lineHeight: 18 },

  // PROS / CONS
  prosConsContainer: { flexDirection: "row", marginTop: 12, gap: 10 },
  prosColumn: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    padding: 10,
    borderRadius: 8,
  },
  consColumn: {
    flex: 1,
    backgroundColor: "#FFEBEE",
    padding: 10,
    borderRadius: 8,
  },
  prosLabel: { fontSize: 12, fontWeight: "600", marginBottom: 6, color: "#2E7D32" },
  consLabel: { fontSize: 12, fontWeight: "600", marginBottom: 6, color: "#C62828" },
  proItem: { fontSize: 11, color: "#1B5E20", marginBottom: 3, lineHeight: 16 },
  conItem: { fontSize: 11, color: "#B71C1C", marginBottom: 3, lineHeight: 16 },

  // FORMS
  formsContainer: {
    marginTop: 12,
    backgroundColor: "#F8F9FB",
    padding: 12,
    borderRadius: 8,
  },
  formItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  formInfo: { flex: 1 },
  formName: { fontSize: 14, fontWeight: "600", color: "#1976D2", marginBottom: 2 },
  formPurpose: { fontSize: 12, color: "#666", marginBottom: 2 },
  formWho: { fontSize: 11, color: "#999", fontStyle: "italic" },

  // PATH TO GREEN CARD
  pathContainer: {
    backgroundColor: "#E8F4F8",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  pathLabel: { fontSize: 13, fontWeight: "600", color: "#2E86AB", marginBottom: 6 },
  pathText: { fontSize: 13, color: "#333333", lineHeight: 18 },
  pathWarning: { fontSize: 12, color: "#D32F2F", marginTop: 6, fontWeight: "500" },

  // BUTTONS
  buttonContainer: { padding: 20 },
  primaryButton: {
    backgroundColor: "#2E86AB",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2E86AB",
    marginBottom: 12,
  },
  secondaryButtonText: { color: "#2E86AB", fontSize: 16, fontWeight: "bold" },
  tertiaryButton: {
    backgroundColor: "#F5F5F5",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  tertiaryButtonText: { color: "#666", fontSize: 16, fontWeight: "600" },

  errorBox: {
    margin: 40,
    padding: 20,
    backgroundColor: "#FFF3F3",
    borderRadius: 12,
  },
  errorTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#B00020" },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "75%",
  },
  modalScroll: { maxHeight: "80%" },
  modalHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  modalDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalReason: { fontSize: 15, color: "#333", marginBottom: 16, lineHeight: 22 },
  modalDetails: { marginBottom: 16 },
  modalDetailItem: { flexDirection: "row", marginBottom: 8 },
  modalBullet: { fontSize: 14, color: "#2E86AB", marginRight: 8, marginTop: 1 },
  modalDetailText: { fontSize: 14, color: "#444", flex: 1, lineHeight: 20 },
  modalRecommendation: {
    backgroundColor: "#F0F7FA",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  modalRecLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E86AB",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  modalRecText: { fontSize: 14, color: "#333", lineHeight: 20 },
  modalUpdated: { fontSize: 11, color: "#999", marginBottom: 16 },
  modalClose: {
    backgroundColor: "#2E86AB",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  modalCloseText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
});