import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    TextInput,
  } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import analytics, { EVENTS } from "../utils/analytics";

const OnboardingScreen = ({ navigation, onDone }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [userProfile, setUserProfile] = useState({
    location: "",
    purpose: "",
    urgency: "",
    language: "en",
    currentVisa: "",
    hasWorkAuth: "",
    countryOfCitizenship: "",
    expiryTimeline: "",
    complianceRisk: "",
  });

  // Track onboarding start + begin timing
  useEffect(() => {
    analytics.track(EVENTS.ONBOARDING_STARTED);
    analytics.timeStart(EVENTS.ONBOARDING_COMPLETED);
  }, []);

  const questions = [
    {
      id: "welcome",
      title: "Welcome to Your Immigration Journey",
      subtitle:
        "We'll help you navigate the U.S. immigration process step by step",
      type: "info",
    },
    {
      id: "location",
      title: "Where are you currently?",
      subtitle: "This helps us show relevant pathways",
      options: [
        { value: "outside_us", label: "🌍 Outside the United States" },
        { value: "inside_us", label: "🇺🇸 Inside the United States" },
      ],
    },
    {
      id: "purpose",
      title: "What brings you to the U.S.?",
      subtitle: "Select your primary reason",
      options: [
        { value: "work", label: "💼 Work Opportunity" },
        { value: "family", label: "👨‍👩‍👧‍👦 Family Reunification" },
        { value: "study", label: "🎓 Education" },
        { value: "protection", label: "🛡️ Seeking Protection" },
      ],
    },
    {
      id: "urgency",
      title: "What's your timeline?",
      subtitle: "This helps us prioritize information",
      options: [
        { value: "immediate", label: "🚨 Immediate (< 1 month)" },
        { value: "soon", label: "📅 Soon (1–6 months)" },
        { value: "planning", label: "📊 Planning (6+ months)" },
      ],
    },
    {
      id: "currentVisa",
      title: "What's your current immigration status?",
      subtitle: "This helps us identify risks and opportunities",
      showIf: (profile) => profile.location === "inside_us",
      options: [
        { value: "F1", label: "📚 F-1 Student" },
        { value: "H1B", label: "💼 H-1B Work Visa" },
        { value: "L1", label: "🏢 L-1 Transfer" },
        { value: "B1B2", label: "✈️ B-1/B-2 Visitor" },
        { value: "J1", label: "🔄 J-1 Exchange" },
        { value: "OPT", label: "🎓 OPT/STEM OPT" },
        { value: "EAD", label: "💳 EAD Holder" },
        { value: "GC_pending", label: "⏳ Green Card Pending" },
        { value: "other", label: "📋 Other Status" },
        { value: "none", label: "❌ Out of Status" },
      ],
    },
    {
      id: "hasWorkAuth",
      title: "Do you have work authorization?",
      subtitle: "This affects your employment options",
      showIf: (profile) => profile.location === "inside_us",
      options: [
        { value: "yes_unrestricted", label: "✅ Yes - Any employer" },
        { value: "yes_restricted", label: "⚠️ Yes - Specific employer only" },
        { value: "yes_ead", label: "💳 Yes - EAD card" },
        { value: "pending", label: "⏳ Application pending" },
        { value: "no", label: "❌ No work authorization" },
      ],
    },
    {
        id: "countryOfCitizenship",
        title: "What's your country of citizenship?",
        subtitle: "This affects wait times and visa availability",
        options: [
          { value: "india", label: "🇮🇳 India" },
          { value: "china", label: "🇨🇳 China" },
          { value: "mexico", label: "🇲🇽 Mexico" },
          { value: "philippines", label: "🇵🇭 Philippines" },
          { value: "canada", label: "🇨🇦 Canada" },
          { value: "uk", label: "🇬🇧 United Kingdom" },
          { value: "brazil", label: "🇧🇷 Brazil" },
          { value: "nigeria", label: "🇳🇬 Nigeria" },
          { value: "south_korea", label: "🇰🇷 South Korea" },
          { value: "japan", label: "🇯🇵 Japan" },
          { value: "other", label: "🌍 Other" },
        ],
        hasTextInput: true,
        textInputPlaceholder: "Enter your country",
        textInputShowIf: "other",
      },
    {
        id: "expiryTimeline",
        title: "Any critical dates coming up?",
        subtitle: "We'll help you track important deadlines",
        showIf: (profile) => profile.location === "inside_us" && profile.purpose !== "protection",
      options: [
        { value: "expired", label: "🔴 Already expired" },
        { value: "30days", label: "⚠️ Within 30 days" },
        { value: "90days", label: "📅 Within 90 days" },
        { value: "6months", label: "📆 Within 6 months" },
        { value: "year", label: "📍 Within 1 year" },
        { value: "safe", label: "✅ More than 1 year" },
      ],
    },
    {
      id: "complianceRisk",
      title: "Have you experienced any of these?",
      subtitle: "Be honest - we'll help you understand your options",
      showIf: (profile) => profile.location === "inside_us",
      options: [
        { value: "none", label: "✅ None - Clean record" },
        { value: "gap", label: "📋 Status gap (out of status)" },
        { value: "unauthorized_work", label: "💼 Worked without authorization" },
        { value: "overstay", label: "⏰ Overstayed visa" },
        { value: "denied", label: "❌ Previous denial/RFE" },
        { value: "prefer_not", label: "🔒 Prefer not to say" },
      ],
    },
  ];

  const visibleQuestions = questions.filter(
    (q) => !q.showIf || q.showIf(userProfile)
  );
  const question = visibleQuestions[currentStep];
  const progress = ((currentStep + 1) / visibleQuestions.length) * 100;
  const canProceed =
    question.type === "info" || Boolean(userProfile[question.id]);

  const handleSelection = (value) => {
    setUserProfile((prev) => ({
      ...prev,
      [question.id]: value,
    }));
  };

  const handleNext = () => {
    // Track step completion
    analytics.track(EVENTS.ONBOARDING_STEP, {
      step: currentStep,
      questionId: question.id,
      answer: question.type === "info" ? "start" : userProfile[question.id],
    });

    if (currentStep < visibleQuestions.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const completeOnboarding = async () => {
    if (saving) return;
    setSaving(true);

    try {
      await AsyncStorage.setItem("@hasLaunched", "true");

      await AsyncStorage.setItem(
        "@userProfile_v2",
        JSON.stringify(userProfile)
      );

      const legacyProfile = {
        location: userProfile.location,
        purpose: userProfile.purpose,
        urgency: userProfile.urgency,
        language: userProfile.language,
      };
      await AsyncStorage.setItem(
        "@userProfile",
        JSON.stringify(legacyProfile)
      );

      // Track completion and identify user
      analytics.track(EVENTS.ONBOARDING_COMPLETED, {
        purpose: userProfile.purpose,
        country: userProfile.countryOfCitizenship,
        countrySpecified: userProfile.countrySpecified || "",
        visa: userProfile.currentVisa,
        location: userProfile.location,
      });
      analytics.identifyUser(userProfile);

      if (typeof onDone === "function") onDone();

      navigation.replace("OnboardingSummary", {
        userProfile,
      });
    } catch (err) {
      console.error("Onboarding save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    analytics.track(EVENTS.ONBOARDING_SKIPPED, {
      skippedAtStep: currentStep,
      questionId: question.id,
    });
    completeOnboarding();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* SKIP */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={saving}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        {/* PROGRESS */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
          <Text style={styles.progressStep}>
            Step {currentStep + 1} of {visibleQuestions.length}
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
              <Text style={styles.subtitle}>{question.subtitle}</Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleNext}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.questionContainer}>
              <Text style={styles.title}>{question.title}</Text>
              <Text style={styles.subtitle}>{question.subtitle}</Text>

              <ScrollView
                style={styles.optionsScroll}
                showsVerticalScrollIndicator={false}
              >
                {question.options.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.optionButton,
                      userProfile[question.id] === opt.value &&
                        styles.optionButtonSelected,
                    ]}
                    onPress={() => handleSelection(opt.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        userProfile[question.id] === opt.value &&
                          styles.optionTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
        

              </ScrollView>

              {question.hasTextInput && userProfile[question.id] === question.textInputShowIf && (
                <TextInput
                  style={styles.textInput}
                  placeholder={question.textInputPlaceholder}
                  value={userProfile.countrySpecified || ""}
                  onChangeText={(text) =>
                    setUserProfile((prev) => ({ ...prev, countrySpecified: text }))
                  }
                  autoCapitalize="words"
                />
              )}

              <View style={styles.navRow}>
                {currentStep > 0 && (
                  <TouchableOpacity onPress={handleBack}>
                    <Text style={styles.backText}>Back</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    !canProceed && styles.disabledButton,
                  ]}
                  disabled={!canProceed}
                  onPress={handleNext}
                >
                  <Text style={styles.primaryButtonText}>
                    {currentStep === visibleQuestions.length - 1
                      ? "Finish"
                      : "Next"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* PRIVACY DISCLAIMER */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            🔒 We don't collect or share personal data. Your answers stay on
            your device and are used only to personalize your experience and
            provide safety alerts.
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
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DDD",
  },

});

export default OnboardingScreen;