// src/screens/SettingsScreen.js
import Constants from "expo-constants";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import analytics from "../utils/analytics";
import { PROCESSING_TIMES_META } from "../data/processingTimes";

const SettingsScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [editModal, setEditModal] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await AsyncStorage.getItem("@userProfile_v2");
      if (data) setProfile(JSON.parse(data));
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  const updateField = async (field, value) => {
    try {
      const updated = { ...profile, [field]: value };
      setProfile(updated);
      await AsyncStorage.setItem("@userProfile_v2", JSON.stringify(updated));

      // Update legacy profile too
      if (["location", "purpose", "urgency", "language"].includes(field)) {
        const legacy = await AsyncStorage.getItem("@userProfile");
        if (legacy) {
          const legacyProfile = JSON.parse(legacy);
          legacyProfile[field] = value;
          await AsyncStorage.setItem("@userProfile", JSON.stringify(legacyProfile));
        }
      }

      // Update Mixpanel
      analytics.identifyUser(updated);

      setEditModal(null);
      Alert.alert("Updated", "Your profile has been updated. Go back to the home screen to see your changes.");
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const resetApp = () => {
    Alert.alert(
      "Reset App",
      "This will clear all your data and restart the onboarding process. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            analytics.reset();
            Alert.alert("App Reset", "Please close and reopen the app to start fresh.");
          },
        },
      ]
    );
  };

  const FIELD_OPTIONS = {
    // UPDATED: title and options now match onboarding + includes citizenship
    purpose: {
      title: "What's your immigration goal?",
      options: [
        { value: "work", label: "💼 Work Opportunity" },
        { value: "family", label: "👨‍👩‍👧‍👦 Family Reunification" },
        { value: "study", label: "🎓 Education" },
        { value: "protection", label: "🛡️ Seeking Protection" },
        { value: "citizenship", label: "🇺🇸 Naturalization & Citizenship" },
      ],
    },
    location: {
      title: "Where are you currently?",
      options: [
        { value: "outside_us", label: "🌍 Outside the United States" },
        { value: "inside_us", label: "🇺🇸 Inside the United States" },
      ],
    },
    // UPDATED: added GC holder option
    currentVisa: {
      title: "Current immigration status",
      options: [
        { value: "F1", label: "📚 F-1 Student" },
        { value: "H1B", label: "💼 H-1B Work Visa" },
        { value: "L1", label: "🏢 L-1 Transfer" },
        { value: "B1B2", label: "✈️ B-1/B-2 Visitor" },
        { value: "J1", label: "🔄 J-1 Exchange" },
        { value: "OPT", label: "🎓 OPT/STEM OPT" },
        { value: "EAD", label: "💳 EAD Holder" },
        { value: "GC_pending", label: "⏳ Green Card Pending" },
        { value: "GC", label: "🟢 Green Card Holder (LPR)" },
        { value: "other", label: "📋 Other Status" },
        { value: "none", label: "❌ Out of Status" },
        { value: "", label: "⬜ Not applicable" },
      ],
    },
    // UPDATED: added Germany
    countryOfCitizenship: {
      title: "Country of citizenship",
      options: [
        { value: "india", label: "🇮🇳 India" },
        { value: "china", label: "🇨🇳 China" },
        { value: "mexico", label: "🇲🇽 Mexico" },
        { value: "philippines", label: "🇵🇭 Philippines" },
        { value: "canada", label: "🇨🇦 Canada" },
        { value: "uk", label: "🇬🇧 United Kingdom" },
        { value: "germany", label: "🇩🇪 Germany" },
        { value: "brazil", label: "🇧🇷 Brazil" },
        { value: "nigeria", label: "🇳🇬 Nigeria" },
        { value: "south_korea", label: "🇰🇷 South Korea" },
        { value: "japan", label: "🇯🇵 Japan" },
        { value: "other", label: "🌍 Other" },
      ],
    },
    urgency: {
      title: "What's your timeline?",
      options: [
        { value: "immediate", label: "🚨 Immediate (< 1 month)" },
        { value: "soon", label: "📅 Soon (1–6 months)" },
        { value: "planning", label: "📊 Planning (6+ months)" },
        { value: "", label: "⬜ Not applicable" },
      ],
    },
    // UPDATED: title matches getFieldKey mapping
    expiryTimeline: {
      title: "Visa expiration date",
      options: [
        { value: "expired", label: "🔴 Already expired" },
        { value: "30days", label: "⚠️ Within 30 days" },
        { value: "90days", label: "📅 Within 90 days" },
        { value: "6months", label: "📆 Within 6 months" },
        { value: "year", label: "📍 Within 1 year" },
        { value: "safe", label: "✅ More than 1 year" },
        { value: "", label: "⬜ Not applicable" },
      ],
    },
    // NEW: green card years held for naturalization eligibility
    gcYearsHeld: {
      title: "How long have you held your green card?",
      options: [
        { value: "under2", label: "⏳ Less than 2 years" },
        { value: "2to3", label: "📅 2–3 years" },
        { value: "3to5", label: "🗓️ 3–5 years" },
        { value: "over5", label: "✅ 5+ years — Eligible to naturalize" },
        { value: "military", label: "🎖️ Military service" },
        { value: "", label: "⬜ Not applicable" },
      ],
    },
  };

  const getDisplayValue = (field) => {
    if (!profile) return "—";
    const value = profile[field];
    if (!value) return "Not set";

    const fieldConfig = FIELD_OPTIONS[field];
    if (fieldConfig) {
      const match = fieldConfig.options.find((o) => o.value === value);
      if (match) return match.label;
    }
    return value;
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PROFILE SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Profile</Text>
          <Text style={styles.sectionSubtitle}>
            Tap any field to update it
          </Text>

          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => setEditModal(FIELD_OPTIONS.purpose)}
          >
            <Text style={styles.fieldLabel}>Goal</Text>
            <Text style={styles.fieldValue}>{getDisplayValue("purpose")}</Text>
            <Text style={styles.fieldArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => setEditModal(FIELD_OPTIONS.location)}
          >
            <Text style={styles.fieldLabel}>Location</Text>
            <Text style={styles.fieldValue}>{getDisplayValue("location")}</Text>
            <Text style={styles.fieldArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => setEditModal(FIELD_OPTIONS.countryOfCitizenship)}
          >
            <Text style={styles.fieldLabel}>Country</Text>
            <Text style={styles.fieldValue}>
              {getDisplayValue("countryOfCitizenship")}
            </Text>
            <Text style={styles.fieldArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => setEditModal(FIELD_OPTIONS.currentVisa)}
          >
            <Text style={styles.fieldLabel}>Visa Status</Text>
            <Text style={styles.fieldValue}>
              {getDisplayValue("currentVisa")}
            </Text>
            <Text style={styles.fieldArrow}>›</Text>
          </TouchableOpacity>

          {/* NEW: GC years held — only shown for GC holders */}
          {profile?.currentVisa === "GC" && (
            <TouchableOpacity
              style={styles.fieldRow}
              onPress={() => setEditModal(FIELD_OPTIONS.gcYearsHeld)}
            >
              <Text style={styles.fieldLabel}>GC Held</Text>
              <Text style={styles.fieldValue}>
                {getDisplayValue("gcYearsHeld")}
              </Text>
              <Text style={styles.fieldArrow}>›</Text>
            </TouchableOpacity>
          )}

          {/* Timeline — hidden for GC holders since not relevant */}
          {profile?.currentVisa !== "GC" && (
            <TouchableOpacity
              style={styles.fieldRow}
              onPress={() => setEditModal(FIELD_OPTIONS.urgency)}
            >
              <Text style={styles.fieldLabel}>Timeline</Text>
              <Text style={styles.fieldValue}>{getDisplayValue("urgency")}</Text>
              <Text style={styles.fieldArrow}>›</Text>
            </TouchableOpacity>
          )}

          {/* Visa expiration — hidden for GC holders */}
          {profile?.currentVisa !== "GC" && (
            <TouchableOpacity
              style={styles.fieldRow}
              onPress={() => setEditModal(FIELD_OPTIONS.expiryTimeline)}
            >
              <Text style={styles.fieldLabel}>Visa Expiry</Text>
              <Text style={styles.fieldValue}>
                {getDisplayValue("expiryTimeline")}
              </Text>
              <Text style={styles.fieldArrow}>›</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* ABOUT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About OnePath</Text>

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>
              {Constants.expoConfig?.version || "1.1.0"}
            </Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Data Updated</Text>
            <Text style={styles.aboutValue}>{PROCESSING_TIMES_META.lastUpdated}</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Sources</Text>
            <Text style={styles.aboutValue}>
              USCIS, DOS, DOL, Federal Register
            </Text>
          </View>
        </View>

        {/* DISCLAIMER */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>
            OnePath provides immigration information for educational purposes
            only. This app is not a law firm and does not provide legal advice.
            Consult a licensed immigration attorney for advice specific to your
            situation.
          </Text>
        </View>

        {/* PRIVACY */}
        <View style={styles.section}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>🔒 Privacy</Text>
            <Text style={styles.aboutValue}>All data stays on your device</Text>
          </View>
        </View>

        {/* RESET */}
        <TouchableOpacity style={styles.resetButton} onPress={resetApp}>
          <Text style={styles.resetButtonText}>Reset App & Start Over</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal
        visible={!!editModal}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModal(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setEditModal(null)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editModal?.title}</Text>
            <ScrollView style={styles.modalScroll}>
              {editModal?.options.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.modalOption,
                    profile[getFieldKey(editModal)] === opt.value &&
                      styles.modalOptionActive,
                  ]}
                  onPress={() => updateField(getFieldKey(editModal), opt.value)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      profile[getFieldKey(editModal)] === opt.value &&
                        styles.modalOptionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {profile[getFieldKey(editModal)] === opt.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setEditModal(null)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

// =========================================================
// HELPER — reverse-lookup which profile field a modal edits
// FIXED: titles now match FIELD_OPTIONS titles exactly
// =========================================================
function getFieldKey(modalConfig) {
  if (!modalConfig) return "";
  const fieldMap = {
    "What's your immigration goal?": "purpose",
    "Where are you currently?": "location",
    "Current immigration status": "currentVisa",
    "Country of citizenship": "countryOfCitizenship",
    "What's your timeline?": "urgency",
    "Visa expiration date": "expiryTimeline",
    "How long have you held your green card?": "gcYearsHeld",
  };
  return fieldMap[modalConfig.title] || "";
}

export default SettingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { fontSize: 16, color: "#666" },

  section: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#999",
    marginBottom: 16,
  },

  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  fieldLabel: {
    fontSize: 15,
    color: "#666",
    width: 90,
  },
  fieldValue: {
    fontSize: 15,
    color: "#1A1A1A",
    flex: 1,
    textAlign: "right",
    marginRight: 8,
  },
  fieldArrow: {
    fontSize: 18,
    color: "#CCC",
  },

  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  aboutLabel: { fontSize: 14, color: "#666" },
  aboutValue: { fontSize: 14, color: "#333", fontWeight: "500" },

  disclaimerCard: {
    backgroundColor: "#FFF8E1",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
    textAlign: "center",
  },

  resetButton: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F44336",
    alignItems: "center",
  },
  resetButtonText: {
    color: "#F44336",
    fontSize: 15,
    fontWeight: "600",
  },

  // Modal
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
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    marginBottom: 8,
  },
  modalOptionActive: {
    backgroundColor: "#E8F4F8",
    borderWidth: 2,
    borderColor: "#2E86AB",
  },
  modalOptionText: {
    flex: 1,
    fontSize: 16,
  },
  modalOptionTextActive: {
    fontWeight: "600",
    color: "#2E86AB",
  },
  checkmark: {
    fontSize: 20,
    color: "#2E86AB",
    fontWeight: "bold",
  },
  modalCancel: {
    marginTop: 12,
    padding: 14,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    color: "#666",
  },
});