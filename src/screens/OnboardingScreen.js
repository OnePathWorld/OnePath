import { getCurrentLanguage } from "../i18n";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import analytics, { EVENTS } from "../utils/analytics";
import {
  buildPrimaryCountryOptions,
  filterCountrySearch,
} from "../data/countries";
import {
  WORK_AUTH_BY_VISA,
  redactAnswer,
  pruneOrphanedAnswers,
  applyProfileInference,
} from "../utils/onboardingLogic";

// NOTE: COUNTRY_SEARCH_LIST and the pinned quick-pick list now live in
// src/data/countries.js (shared with SettingsScreen). The inline array that
// used to be here was removed in the shared-list refactor.

// The pure onboarding helpers — WORK_AUTH_BY_VISA / URGENCY_BY_EXPIRY inference,
// redactAnswer (§10), pruneOrphanedAnswers (§11), and applyProfileInference (§7)
// — now live in src/utils/onboardingLogic.js so they can be unit-tested without
// dragging React Native into the test. Imported above.

const OnboardingScreen = ({ navigation, onDone }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false); // locked during auto-advance timeout

  // Country search state — only active when user picks "Other" on countryOfCitizenship
  const [countrySearch, setCountrySearch] = useState("");
  const [countrySearchResults, setCountrySearchResults] = useState([]);

  const [userProfile, setUserProfile] = useState({
    location: "",
    purpose: "",
    urgency: "",
    language: getCurrentLanguage(),
    currentVisa: "",
    hasWorkAuth: "",
    countryOfCitizenship: "",
    expiryTimeline: "",
    complianceRisk: "",
    gcYearsHeld: "",
    // Outside-US branch fields (added v1.3)
    outsideUsStage: "",     // no_case | petition_filed | petition_approved | interview_scheduled | has_us_visa | former_visa_holder | exploring
    hasReceiptNumber: "",   // yes | no  (only relevant when outsideUsStage indicates a filed/approved case)
  });

  // Animated scale values keyed by option value — stored in a ref so they
  // don't trigger re-renders and persist across renders of the same step.
  const scaleAnims = useRef({}).current;

  // Track onboarding start + begin timing
  useEffect(() => {
    analytics.track(EVENTS.ONBOARDING_STARTED);
    analytics.timeStart(EVENTS.ONBOARDING_COMPLETED);
  }, []);

  // Reset interaction lock and country search whenever the step changes
  useEffect(() => {
    setIsAdvancing(false);
    setCountrySearch("");
    setCountrySearchResults([]);
  }, [currentStep]);

  // -----------------------------------------------------------------
  // QUESTIONS
  // ---------------------------------------------------------
  // Built inside the component so t() picks up the active locale.
  // All strings live in src/i18n/locales/{en,es,pt,zh}.json under the
  // `onboarding.*` namespace. The `option.value` strings are kept in
  // English because they're enum values stored in AsyncStorage and
  // referenced by the guidance engine — they must NOT be translated.
  // -----------------------------------------------------------------
  const questions = [
    {
      id: "welcome",
      title: t("onboarding.welcome.title"),
      subtitle: t("onboarding.welcome.subtitle"),
      type: "info",
    },
    {
      id: "location",
      title: t("onboarding.location.title"),
      subtitle: t("onboarding.location.subtitle"),
      options: [
        { value: "outside_us", label: t("onboarding.location.options.outside_us") },
        { value: "inside_us",  label: t("onboarding.location.options.inside_us") },
      ],
    },

    // -------------------------------------------------------------
    // OUTSIDE-US BRANCH (v1.3)
    // For users outside the US: ask where they are in the immigration
    // process. This unlocks Case Tracker for users with a USCIS receipt
    // number (pending I-130, I-140, etc.) and gives OnboardingSummary
    // enough context to render meaningful guidance instead of a
    // generic "you're outside the US" page.
    // -------------------------------------------------------------
    {
      id: "outsideUsStage",
      title: t("onboarding.outsideUsStage.title"),
      subtitle: t("onboarding.outsideUsStage.subtitle"),
      showIf: (profile) => profile.location === "outside_us",
      options: [
        { value: "no_case",             label: t("onboarding.outsideUsStage.options.no_case") },
        { value: "petition_filed",      label: t("onboarding.outsideUsStage.options.petition_filed") },
        { value: "petition_approved",   label: t("onboarding.outsideUsStage.options.petition_approved") },
        { value: "interview_scheduled", label: t("onboarding.outsideUsStage.options.interview_scheduled") },
        { value: "has_us_visa",         label: t("onboarding.outsideUsStage.options.has_us_visa") },
        { value: "former_visa_holder",  label: t("onboarding.outsideUsStage.options.former_visa_holder") },
        { value: "exploring",           label: t("onboarding.outsideUsStage.options.exploring") },
      ],
    },

    // Bridge to Case Tracker — only ask if they have a filed/approved case
    {
      id: "hasReceiptNumber",
      title: t("onboarding.hasReceiptNumber.title"),
      subtitle: t("onboarding.hasReceiptNumber.subtitle"),
      showIf: (profile) =>
        profile.location === "outside_us" &&
        (profile.outsideUsStage === "petition_filed" ||
          profile.outsideUsStage === "petition_approved" ||
          profile.outsideUsStage === "interview_scheduled"),
      options: [
        { value: "yes", label: t("onboarding.hasReceiptNumber.options.yes") },
        { value: "no",  label: t("onboarding.hasReceiptNumber.options.no") },
      ],
    },

    // currentVisa comes before purpose so purpose can react to GC holder status
    {
      id: "currentVisa",
      title: t("onboarding.currentVisa.title"),
      subtitle: t("onboarding.currentVisa.subtitle"),
      showIf: (profile) => profile.location === "inside_us",
      options: [
        // Work
        { value: "H1B",        label: t("onboarding.currentVisa.options.H1B"),        group: t("onboarding.currentVisa.groups.work") },
        { value: "L1",         label: t("onboarding.currentVisa.options.L1"),         group: t("onboarding.currentVisa.groups.work") },
        { value: "EAD",        label: t("onboarding.currentVisa.options.EAD"),        group: t("onboarding.currentVisa.groups.work") },
        // Study
        { value: "F1",         label: t("onboarding.currentVisa.options.F1"),         group: t("onboarding.currentVisa.groups.study") },
        { value: "OPT",        label: t("onboarding.currentVisa.options.OPT"),        group: t("onboarding.currentVisa.groups.study") },
        { value: "J1",         label: t("onboarding.currentVisa.options.J1"),         group: t("onboarding.currentVisa.groups.study") },
        // Resident / Visitor
        { value: "GC",         label: t("onboarding.currentVisa.options.GC"),         group: t("onboarding.currentVisa.groups.resident") },
        { value: "GC_pending", label: t("onboarding.currentVisa.options.GC_pending"), group: t("onboarding.currentVisa.groups.resident") },
        { value: "B1B2",       label: t("onboarding.currentVisa.options.B1B2"),       group: t("onboarding.currentVisa.groups.resident") },
        // Other
        { value: "other",      label: t("onboarding.currentVisa.options.other"),      group: t("onboarding.currentVisa.groups.other") },
        { value: "none",       label: t("onboarding.currentVisa.options.none"),       group: t("onboarding.currentVisa.groups.other") },
      ],
    },

    // gcYearsHeld immediately after GC selection
    {
      id: "gcYearsHeld",
      title: t("onboarding.gcYearsHeld.title"),
      subtitle: t("onboarding.gcYearsHeld.subtitle"),
      showIf: (profile) =>
        profile.location === "inside_us" && profile.currentVisa === "GC",
      options: [
        { value: "under2",   label: t("onboarding.gcYearsHeld.options.under2") },
        { value: "2to3",     label: t("onboarding.gcYearsHeld.options.2to3") },
        { value: "3to5",     label: t("onboarding.gcYearsHeld.options.3to5") },
        { value: "over5",    label: t("onboarding.gcYearsHeld.options.over5") },
        { value: "military", label: t("onboarding.gcYearsHeld.options.military") },
      ],
    },

    // PURPOSE — non-GC version
    {
      id: "purpose",
      title: t("onboarding.purpose.title"),
      subtitle: t("onboarding.purpose.subtitle"),
      showIf: (profile) => profile.currentVisa !== "GC",
      options: [
        { value: "work",       label: t("onboarding.purpose.options.work") },
        { value: "family",     label: t("onboarding.purpose.options.family") },
        { value: "study",      label: t("onboarding.purpose.options.study") },
        { value: "protection", label: t("onboarding.purpose.options.protection") },
      ],
    },

    // PURPOSE — GC holder version (overrides above when GC)
    {
      id: "purpose",
      title: t("onboarding.purposeGc.title"),
      subtitle: t("onboarding.purposeGc.subtitle"),
      showIf: (profile) =>
        profile.location === "inside_us" && profile.currentVisa === "GC",
      options: [
        { value: "citizenship", label: t("onboarding.purposeGc.options.citizenship") },
        { value: "family",      label: t("onboarding.purposeGc.options.family") },
        { value: "work",        label: t("onboarding.purposeGc.options.work") },
      ],
    },

    // URGENCY — skipped for GC holders
    {
      id: "urgency",
      title: t("onboarding.urgency.title"),
      subtitle: t("onboarding.urgency.subtitle"),
      // Protection seekers only. Everyone else inside-US non-GC answers
      // expiryTimeline, from which urgency is inferred at completion (see
      // URGENCY_BY_EXPIRY), so the standalone question is skipped for them.
      // Protection users are the one inside-US group with no expiryTimeline
      // (it's gated out for purpose === "protection"), so we keep asking them
      // directly to avoid losing the signal. Outside-US never reaches this
      // (currentVisa is unset there); its one soft consumer, policyTracker's
      // "imminent effect" line, degrades safely to "" and it stays editable
      // in Settings.
      showIf: (profile) =>
        profile.location === "inside_us" &&
        profile.currentVisa !== "GC" &&
        profile.purpose === "protection",
      options: [
        { value: "immediate", label: t("onboarding.urgency.options.immediate") },
        { value: "soon",      label: t("onboarding.urgency.options.soon") },
        { value: "planning",  label: t("onboarding.urgency.options.planning") },
      ],
    },

    {
      id: "hasWorkAuth",
      title: t("onboarding.hasWorkAuth.title"),
      subtitle: t("onboarding.hasWorkAuth.subtitle"),
      showIf: (profile) =>
        profile.location === "inside_us" &&
        profile.currentVisa !== "GC" &&
        // ambiguous visas only — unambiguous ones are inferred at completion
        WORK_AUTH_BY_VISA[profile.currentVisa] === undefined,
      options: [
        { value: "yes_unrestricted", label: t("onboarding.hasWorkAuth.options.yes_unrestricted") },
        { value: "yes_restricted",   label: t("onboarding.hasWorkAuth.options.yes_restricted") },
        { value: "yes_ead",          label: t("onboarding.hasWorkAuth.options.yes_ead") },
        { value: "pending",          label: t("onboarding.hasWorkAuth.options.pending") },
        { value: "no",               label: t("onboarding.hasWorkAuth.options.no") },
      ],
    },

    {
      id: "countryOfCitizenship",
      title: t("onboarding.countryOfCitizenship.title"),
      subtitle: t("onboarding.countryOfCitizenship.subtitle"),
      // Pinned quick-pick list sourced from the shared module so it can never
      // drift from SettingsScreen again. Labels resolved under this screen's
      // i18n namespace; "other" is appended by the builder.
      options: buildPrimaryCountryOptions(
        t,
        "onboarding.countryOfCitizenship.options"
      ),
      hasTextInput: true,
      textInputPlaceholder: t("onboarding.countryOfCitizenship.searchPlaceholder"),
      textInputShowIf: "other",
    },

    {
      id: "expiryTimeline",
      title: t("onboarding.expiryTimeline.title"),
      // Dynamic subtitle — looks up visa-specific text, falls back to default
      subtitle: (profile) => {
        if (!profile.currentVisa) {
          return t("onboarding.expiryTimeline.subtitleDefault");
        }
        const key = `onboarding.expiryTimeline.subtitleByVisa.${profile.currentVisa}`;
        const translated = t(key);
        // i18next returns the key itself if not found — fall back to default
        return translated === key
          ? t("onboarding.expiryTimeline.subtitleDefault")
          : translated;
      },
      showIf: (profile) =>
        profile.purpose !== "protection" &&
        profile.currentVisa !== "GC" &&
        (profile.location === "inside_us" ||
          (profile.location === "outside_us" &&
            profile.outsideUsStage === "has_us_visa")),
      options: [
        { value: "expired", label: t("onboarding.expiryTimeline.options.expired") },
        { value: "30days",  label: t("onboarding.expiryTimeline.options.30days") },
        { value: "90days",  label: t("onboarding.expiryTimeline.options.90days") },
        { value: "6months", label: t("onboarding.expiryTimeline.options.6months") },
        { value: "year",    label: t("onboarding.expiryTimeline.options.year") },
        { value: "safe",    label: t("onboarding.expiryTimeline.options.safe") },
      ],
    },

    {
      id: "complianceRisk",
      title: t("onboarding.complianceRisk.title"),
      subtitle: (profile) => {
        if (profile.currentVisa === "F1" || profile.currentVisa === "OPT") {
          return t("onboarding.complianceRisk.subtitleStudent");
        }
        return t("onboarding.complianceRisk.subtitle");
      },
      showIf: (profile) =>
        profile.location === "inside_us" && profile.currentVisa !== "GC",
      options: [
        { value: "none",              label: t("onboarding.complianceRisk.options.none") },
        { value: "gap",               label: t("onboarding.complianceRisk.options.gap") },
        { value: "unauthorized_work", label: t("onboarding.complianceRisk.options.unauthorized_work") },
        { value: "overstay",          label: t("onboarding.complianceRisk.options.overstay") },
        { value: "denied",            label: t("onboarding.complianceRisk.options.denied") },
        { value: "prefer_not",        label: t("onboarding.complianceRisk.options.prefer_not") },
      ],
    },
  ];

  const visibleQuestions = questions.reduce((acc, q) => {
    if (q.showIf && !q.showIf(userProfile)) return acc;
    // If a question with this id already exists, replace it
    // (handles dynamic purpose question swap for GC holders)
    const existingIndex = acc.findIndex((existing) => existing.id === q.id);
    if (existingIndex >= 0) {
      acc[existingIndex] = q;
      return acc;
    }
    return [...acc, q];
  }, []);

  const question = visibleQuestions[currentStep];
  const progress = ((currentStep + 1) / visibleQuestions.length) * 100;

  // canProceed: for countryOfCitizenship, "other" is only valid once the user
  // has selected a real country from the search results (value will no longer
  // be "other" at that point). If they're still on "other" without picking a
  // search result, they need to either search or tap Next to skip.
  const canProceed =
    question.type === "info" || Boolean(userProfile[question.id]);

  const handleSelection = (value) => {
    // Block any tap during the auto-advance window
    if (isAdvancing) return;

    // Update profile state. Prune immediately so that changing a gating answer
    // on back-navigation clears now-unreachable dependents right away (not just
    // at completion) — otherwise a stale gate (e.g. a leftover currentVisa="GC"
    // after switching to outside-US) would keep suppressing downstream questions
    // like purpose, so the user never gets re-asked them. The current question
    // stays visible (its own value doesn't change its showIf), so it's untouched;
    // for non-gating answers this is a no-op.
    setUserProfile((prev) =>
      pruneOrphanedAnswers({ ...prev, [question.id]: value }, questions)
    );

    // Ensure an Animated.Value exists for this option
    if (!scaleAnims[value]) {
      scaleAnims[value] = new Animated.Value(1);
    }

    // Brief pop animation: squish → bounce back
    Animated.sequence([
      Animated.timing(scaleAnims[value], {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[value], {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-advance unless:
    // - it's the last step (let the user consciously tap Finish)
    // - the question has a text input and "other" was picked (user needs to search)
    const isLastStep = currentStep === visibleQuestions.length - 1;
    const needsTextInput =
      question.hasTextInput && value === question.textInputShowIf;

    if (!isLastStep && !needsTextInput) {
      setIsAdvancing(true); // lock interactions

      setTimeout(() => {
        analytics.track(EVENTS.ONBOARDING_STEP, {
          step: currentStep,
          questionId: question.id,
          answer: redactAnswer(question.id, value),
        });
        setCurrentStep((s) => s + 1);
        // isAdvancing resets via the useEffect that watches currentStep
      }, 400);
    }
  };

  // Called when user taps a country from the search results dropdown
  const handleCountrySearchSelect = (country) => {
    if (isAdvancing) return;

    // Store the real country code — replaces "other" as the field value
    setUserProfile((prev) => ({
      ...prev,
      countryOfCitizenship: country.value,
      countrySpecified: country.label,
    }));
    setCountrySearch("");
    setCountrySearchResults([]);

    // Animate the "other" button (the one that was selected) as feedback
    if (!scaleAnims["other"]) {
      scaleAnims["other"] = new Animated.Value(1);
    }
    Animated.sequence([
      Animated.timing(scaleAnims["other"], {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims["other"], {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-advance after selection
    const isLastStep = currentStep === visibleQuestions.length - 1;
    if (!isLastStep) {
      setIsAdvancing(true);
      setTimeout(() => {
        analytics.track(EVENTS.ONBOARDING_STEP, {
          step: currentStep,
          questionId: question.id,
          answer: redactAnswer(question.id, country.value),
        });
        setCurrentStep((s) => s + 1);
      }, 400);
    }
  };

  const handleNext = () => {
    if (isAdvancing) return;

    // Track step completion
    analytics.track(EVENTS.ONBOARDING_STEP, {
      step: currentStep,
      questionId: question.id,
      answer:
        question.type === "info"
          ? "start"
          : redactAnswer(question.id, userProfile[question.id]),
    });

    if (currentStep < visibleQuestions.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (isAdvancing) return;
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  // `overrides` is merged over the current profile before saving. It exists so a
  // last-step "Not sure" (handleNotSure) can clear that final field at save time
  // — completeOnboarding reads profile state via closure, so a setUserProfile
  // call in the same tick wouldn't be visible here yet. Every other caller passes
  // nothing, so effectiveProfile === userProfile and behavior is unchanged.
  const completeOnboarding = async (overrides = {}) => {
    if (saving) return;
    setSaving(true);

    try {
      await AsyncStorage.setItem("@hasLaunched", "true");

      const effectiveProfile = { ...userProfile, ...overrides };

      // Drop answers stranded by a back-nav gating change (see pruneOrphanedAnswers)
      // BEFORE inferring, so a stale expiryTimeline/visa can't seed a wrong value.
      const cleanedProfile = pruneOrphanedAnswers(effectiveProfile, questions);

      // Fill values for questions skipped by inference (work-auth from the visa;
      // urgency from expiry, only when urgency is empty). Extracted to
      // onboardingLogic.applyProfileInference; see its comments for the rules.
      const profileToSave = applyProfileInference(cleanedProfile);

      await AsyncStorage.setItem(
        "@userProfile_v2",
        JSON.stringify(profileToSave)
      );

      // Mirror from profileToSave (not the raw userProfile) so the legacy
      // store carries the same inferred urgency as @userProfile_v2.
      const legacyProfile = {
        location: profileToSave.location,
        purpose: profileToSave.purpose,
        urgency: profileToSave.urgency,
        language: profileToSave.language,
      };
      await AsyncStorage.setItem(
        "@userProfile",
        JSON.stringify(legacyProfile)
      );

      // Track completion and identify user
      analytics.track(EVENTS.ONBOARDING_COMPLETED, {
        purpose: profileToSave.purpose,
        country: profileToSave.countryOfCitizenship,
        countrySpecified: profileToSave.countrySpecified || "",
        visa: profileToSave.currentVisa,
        location: profileToSave.location,
        gcYearsHeld: profileToSave.gcYearsHeld || "",
        outsideUsStage: profileToSave.outsideUsStage || "",
        hasReceiptNumber: profileToSave.hasReceiptNumber || "",
      });
      analytics.identifyUser(profileToSave);

      if (typeof onDone === "function") onDone();

      navigation.replace("OnboardingSummary", {
        userProfile: profileToSave,
      });
    } catch (err) {
      console.error("Onboarding save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (isAdvancing || saving) return;
    analytics.track(EVENTS.ONBOARDING_SKIPPED, {
      skippedAtStep: currentStep,
      questionId: question.id,
    });

    // "Skip for now" means later, not done. Unlike completeOnboarding() — which
    // sets @hasLaunched and thereby de-registers the Onboarding routes — skip
    // enters the app via @hasEnteredApp only, exactly like the track-first path.
    // That keeps @hasLaunched false, so the Onboarding routes stay registered and
    // the existing Home/Settings "complete your profile" invites can bring the
    // user back in. No profile is written, matching the profile-absent state those
    // surfaces were hardened for in §8. reset() (not navigate) makes MainApp the
    // root, discarding the onboarding stack — and sidesteps OnboardingSummary,
    // which the normal completion path still routes through.
    try {
      await AsyncStorage.setItem("@hasEnteredApp", "true");
    } catch (err) {
      console.error("Skip-for-now failed to persist entry flag:", err);
    }

    if (typeof onDone === "function") onDone();
    navigation.reset({ index: 0, routes: [{ name: "MainApp" }] });
  };

  // Per-question "I'm not sure". Unlike handleSkip (which ends onboarding
  // entirely), this advances to the NEXT question so no single question is a
  // dead end. It records NO answer on purpose: the field is cleared to "".
  //   - The §7 completion-time inference guards fill work-auth/urgency only when
  //     their field is empty, and every downstream consumer was audited to
  //     degrade cleanly on "", so an unknown answer never becomes a wrong one.
  //   - Clearing (rather than leaving a prior tap) keeps "not sure" honest if the
  //     user had already selected something, e.g. on the last step where
  //     selecting doesn't auto-advance.
  // On the last step we hand the cleared value to completeOnboarding as an
  // override, because its profile read is a closure that wouldn't see the
  // setUserProfile above in the same tick. Not shown for `location` (the first
  // inside/outside-US fork, which every user knows and which would collapse both
  // downstream branches at once) or `info` steps (rendered on the other branch).
  const handleNotSure = () => {
    if (isAdvancing || saving) return;

    setUserProfile((prev) => {
      const next = { ...prev, [question.id]: "" };
      // country stores a display label alongside the enum — clear it too
      if (question.id === "countryOfCitizenship") next.countrySpecified = "";
      return next;
    });

    analytics.track(EVENTS.ONBOARDING_STEP, {
      step: currentStep,
      questionId: question.id,
      answer: "not_sure",
    });

    if (currentStep < visibleQuestions.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      const override = { [question.id]: "" };
      if (question.id === "countryOfCitizenship") override.countrySpecified = "";
      completeOnboarding(override);
    }
  };

  // -----------------------------------------------------------------
  // RENDER OPTIONS
  // ---------------------------------------------------------
  // Renders option buttons for the current question.
  // If any option has a `group` property, injects a small uppercase
  // divider label whenever the group changes — used by currentVisa
  // to break 11 options into Work / Study / Resident & Visitor / Other.
  // All other questions fall through to the flat render path so
  // nothing changes for them.
  // -----------------------------------------------------------------
  const renderOptions = (q) => {
    const hasGroups = q.options.some((o) => o.group);

    if (!hasGroups) {
      return q.options.map((opt) => {
        if (!scaleAnims[opt.value]) {
          scaleAnims[opt.value] = new Animated.Value(1);
        }
        const isSelected = userProfile[q.id] === opt.value;
        return (
          <Animated.View
            key={opt.value}
            style={{ transform: [{ scale: scaleAnims[opt.value] }] }}
          >
            <TouchableOpacity
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
              ]}
              onPress={() => handleSelection(opt.value)}
              disabled={isAdvancing}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      });
    }

    // Grouped render — inject a divider label when the group name changes
    let lastGroup = null;
    return q.options.map((opt) => {
      if (!scaleAnims[opt.value]) {
        scaleAnims[opt.value] = new Animated.Value(1);
      }
      const isSelected = userProfile[q.id] === opt.value;
      const showDivider = opt.group !== lastGroup;
      lastGroup = opt.group;

      return (
        <View key={opt.value}>
          {showDivider && (
            <Text style={styles.optionGroupLabel}>{opt.group}</Text>
          )}
          <Animated.View
            style={{ transform: [{ scale: scaleAnims[opt.value] }] }}
          >
            <TouchableOpacity
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
              ]}
              onPress={() => handleSelection(opt.value)}
              disabled={isAdvancing}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* SKIP FOR NOW — whole-flow escape hatch: ends onboarding and goes
            straight to the summary. Distinct from the per-question "I'm not
            sure" affordance below, which skips a single question. New key with
            an English defaultValue so it renders before the locale pass; the
            old `onboarding.skip` key is now unused and can be dropped then. */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={saving || isAdvancing}
        >
          <Text style={styles.skipButtonText}>
            {t("onboarding.skipForNow", "Skip for now")}
          </Text>
        </TouchableOpacity>

        {/* PROGRESS */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
          <Text style={styles.progressStep}>
            {t("onboarding.stepIndicator", {
              current: currentStep + 1,
              total: visibleQuestions.length,
            })}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {question.type === "info" ? (
            <View style={styles.infoContainer}>
              <Image
                source={require("../../assets/icon.png")}
                style={styles.logoImage}
              />
              <Text style={styles.title}>{question.title}</Text>
              <Text style={styles.subtitle}>
                {typeof question.subtitle === "function"
                  ? question.subtitle(userProfile)
                  : question.subtitle}
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleNext}
              >
                <Text style={styles.primaryButtonText}>
                  {t("onboarding.getStarted")}
                </Text>
              </TouchableOpacity>

              {/* Track-first entry: a one-tap path to the case tracker for
                  users who already have a receipt number and want an answer
                  before filling out a profile. The CaseStatusTracker route is
                  already registered for pre-onboard users; { preOnboard: true }
                  tells that screen to set @hasEnteredApp on first add and to
                  offer a "continue to app" action. Copy uses a defaultValue so
                  it renders before the locale keys are added. */}
              <TouchableOpacity
                style={styles.trackInsteadButton}
                onPress={() => {
                  analytics.track(EVENTS.TRACK_FIRST_SELECTED);
                  navigation.navigate("CaseStatusTracker", {
                    preOnboard: true,
                  });
                }}
              >
                <Text style={styles.trackInsteadText}>
                  {t(
                    "onboarding.welcome.trackInstead",
                    "I already have a case number — just track it"
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.questionContainer}>
              <Text style={styles.title}>{question.title}</Text>
              <Text style={styles.subtitle}>
                {typeof question.subtitle === "function"
                  ? question.subtitle(userProfile)
                  : question.subtitle}
              </Text>

              <ScrollView
                style={styles.optionsScroll}
                showsVerticalScrollIndicator={false}
              >
                {renderOptions(question)}
              </ScrollView>

              {/* COUNTRY SEARCH — shown when user picks "Other" on countryOfCitizenship */}
              {question.hasTextInput &&
                userProfile[question.id] === question.textInputShowIf && (
                  <View>
                    <TextInput
                      style={styles.textInput}
                      placeholder={question.textInputPlaceholder}
                      value={countrySearch}
                      onChangeText={(text) => {
                        setCountrySearch(text);
                        setCountrySearchResults(filterCountrySearch(text));
                      }}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />

                    {/* No results message */}
                    {countrySearch.length > 0 &&
                      countrySearchResults.length === 0 && (
                        <Text style={styles.countrySearchEmpty}>
                          {t("onboarding.countryOfCitizenship.noResults")}
                        </Text>
                      )}

                    {/* Search results dropdown */}
                    {countrySearchResults.map((c) => (
                      <TouchableOpacity
                        key={c.value}
                        style={styles.countrySearchResult}
                        onPress={() => handleCountrySearchSelect(c)}
                        disabled={isAdvancing}
                      >
                        <Text style={styles.countrySearchResultText}>
                          {c.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

              <View style={styles.navRow}>
                {currentStep > 0 && (
                  <TouchableOpacity
                    onPress={handleBack}
                    disabled={isAdvancing}
                  >
                    <Text style={styles.backText}>{t("onboarding.back")}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    (!canProceed || isAdvancing) && styles.disabledButton,
                  ]}
                  disabled={!canProceed || isAdvancing}
                  onPress={handleNext}
                >
                  <Text style={styles.primaryButtonText}>
                    {currentStep === visibleQuestions.length - 1
                      ? t("onboarding.finish")
                      : t("onboarding.next")}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* NOT SURE — per-question skip. Subordinate to the primary Next
                  CTA (no fill, muted), advances one question without recording
                  an answer. Hidden on `location`: it's the first inside/outside
                  fork, something every user knows, and an empty value there
                  collapses both downstream branches at once. Copy uses a
                  defaultValue so English renders before the locale pass. */}
              {question.id !== "location" && (
                <TouchableOpacity
                  style={styles.notSureButton}
                  onPress={handleNotSure}
                  disabled={isAdvancing || saving}
                >
                  <Text style={styles.notSureText}>
                    {t("onboarding.notSure", "I'm not sure — skip this question")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>

        {/* PRIVACY DISCLAIMER */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            {t("onboarding.privacyDisclaimer")}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF" },
  container: { flex: 1 },

  skipButton: {
    position: "absolute",
    right: 16,
    top: 0,
    zIndex: 10,
    padding: 10,
  },
  skipButtonText: {
    color: "#999",
    fontSize: 14,
    fontWeight: "600",
  },

  progressContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: "#2E86AB",
  },
  progressStep: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 6,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },

  infoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  questionContainer: { flex: 1 },

  emoji: { fontSize: 80, marginBottom: 20 },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 24,
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },

  optionsScroll: {
    maxHeight: 400,
  },

  // Group divider label — shown above the first option in each group
  optionGroupLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 6,
    marginLeft: 4,
  },

  optionButton: {
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionButtonSelected: {
    backgroundColor: "#E8F4F8",
    borderWidth: 2,
    borderColor: "#2E86AB",
  },
  optionText: { fontSize: 16 },
  optionTextSelected: {
    color: "#2E86AB",
    fontWeight: "600",
  },

  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    alignItems: "center",
  },

  backText: { fontSize: 16, color: "#666" },

  primaryButton: {
    backgroundColor: "#2E86AB",
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 25,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: { backgroundColor: "#CCC" },

  // Secondary, deliberately subordinate to primaryButton: no fill, muted
  // color, so track-first reads as an alternative rather than a competing CTA.
  trackInsteadButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  trackInsteadText: {
    color: "#2E86AB",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },

  // Per-question "I'm not sure": deliberately quiet — no fill, muted grey,
  // centered under the nav row — so it reads as an unobtrusive escape from a
  // single question, never competing with the primary Next button.
  notSureButton: {
    marginTop: 14,
    paddingVertical: 8,
    alignItems: "center",
  },
  notSureText: {
    color: "#999",
    fontSize: 14,
    fontWeight: "500",
  },

  disclaimerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 14,
    alignItems: "center",
  },
  disclaimerText: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    lineHeight: 16,
  },

  textInput: {
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#DDD",
  },

  // Country search result rows
  countrySearchResult: {
    backgroundColor: "#F0F8FF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#D0E8F5",
  },
  countrySearchResultText: {
    fontSize: 15,
    color: "#1A1A1A",
  },

  // Shown when search text yields no matches
  countrySearchEmpty: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
  },
});

export default OnboardingScreen;