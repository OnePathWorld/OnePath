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
import { useTranslation } from "react-i18next";
import analytics from "../utils/analytics";
import { PROCESSING_TIMES_META } from "../data/processingTimes";
import { setAppLanguage, getCurrentLanguage } from "../i18n";

const SettingsScreen = ({ navigation }) => {
  const { t } = useTranslation();
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
      // Special-case language: route through setAppLanguage so i18next
      // switches the active locale AND mirrors into userProfile_v2.
      if (field === "language") {
        await setAppLanguage(value);
        // setAppLanguage already updates @userProfile_v2.language and
        // calls i18n.changeLanguage. Reload profile to reflect change.
        const data = await AsyncStorage.getItem("@userProfile_v2");
        if (data) setProfile(JSON.parse(data));
        analytics.identifyUser({ ...(profile || {}), language: value });
        setEditModal(null);
        // Don't show the generic "go back to home" alert for language —
        // the change is immediately visible across the whole app.
        return;
      }

      const updated = { ...profile, [field]: value };
      setProfile(updated);
      await AsyncStorage.setItem("@userProfile_v2", JSON.stringify(updated));

      // Update legacy profile too
      if (["location", "purpose", "urgency", "language"].includes(field)) {
        const legacy = await AsyncStorage.getItem("@userProfile");
        if (legacy) {
          const legacyProfile = JSON.parse(legacy);
          legacyProfile[field] = value;
          await AsyncStorage.setItem(
            "@userProfile",
            JSON.stringify(legacyProfile)
          );
        }
      }

      // Update Mixpanel
      analytics.identifyUser(updated);

      setEditModal(null);
      Alert.alert(
        t("settings.updateAlert.title"),
        t("settings.updateAlert.body")
      );
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const resetApp = () => {
    Alert.alert(
      t("settings.reset.confirmTitle"),
      t("settings.reset.confirmBody"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.reset.confirmAction"),
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            analytics.reset();
            Alert.alert(
              t("settings.reset.doneTitle"),
              t("settings.reset.doneBody")
            );
          },
        },
      ]
    );
  };

  // -----------------------------------------------------------------
  // FIELD_OPTIONS
  // ---------------------------------------------------------
  // Built inside the component so t() picks up the active locale.
  // Keyed by the profile field name (stable English identifier) — this
  // is the identifier passed to updateField() and is NEVER translated.
  // The `title` and `options[].label` are user-facing and use t().
  // -----------------------------------------------------------------
  const FIELD_OPTIONS = {
    purpose: {
      field: "purpose",
      title: t("settings.fieldOptions.purpose.title"),
      options: [
        { value: "work", label: t("settings.fieldOptions.purpose.options.work") },
        { value: "family", label: t("settings.fieldOptions.purpose.options.family") },
        { value: "study", label: t("settings.fieldOptions.purpose.options.study") },
        { value: "protection", label: t("settings.fieldOptions.purpose.options.protection") },
        { value: "citizenship", label: t("settings.fieldOptions.purpose.options.citizenship") },
      ],
    },
    location: {
      field: "location",
      title: t("settings.fieldOptions.location.title"),
      options: [
        { value: "outside_us", label: t("settings.fieldOptions.location.options.outside_us") },
        { value: "inside_us", label: t("settings.fieldOptions.location.options.inside_us") },
      ],
    },
    currentVisa: {
      field: "currentVisa",
      title: t("settings.fieldOptions.currentVisa.title"),
      options: [
        { value: "F1", label: t("settings.fieldOptions.currentVisa.options.F1") },
        { value: "H1B", label: t("settings.fieldOptions.currentVisa.options.H1B") },
        { value: "L1", label: t("settings.fieldOptions.currentVisa.options.L1") },
        { value: "B1B2", label: t("settings.fieldOptions.currentVisa.options.B1B2") },
        { value: "J1", label: t("settings.fieldOptions.currentVisa.options.J1") },
        { value: "OPT", label: t("settings.fieldOptions.currentVisa.options.OPT") },
        { value: "EAD", label: t("settings.fieldOptions.currentVisa.options.EAD") },
        { value: "GC_pending", label: t("settings.fieldOptions.currentVisa.options.GC_pending") },
        { value: "GC", label: t("settings.fieldOptions.currentVisa.options.GC") },
        { value: "other", label: t("settings.fieldOptions.currentVisa.options.other") },
        { value: "none", label: t("settings.fieldOptions.currentVisa.options.none") },
        { value: "", label: t("settings.fieldOptions.currentVisa.options.empty") },
      ],
    },
    countryOfCitizenship: {
        field: "countryOfCitizenship",
        title: t("settings.fieldOptions.countryOfCitizenship.title"),
        options: [
          { value: "mexico", label: t("settings.fieldOptions.countryOfCitizenship.options.mexico") },
          { value: "india", label: t("settings.fieldOptions.countryOfCitizenship.options.india") },
          { value: "china", label: t("settings.fieldOptions.countryOfCitizenship.options.china") },
          { value: "haiti", label: t("settings.fieldOptions.countryOfCitizenship.options.haiti") },
          { value: "brazil", label: t("settings.fieldOptions.countryOfCitizenship.options.brazil") }, 
          { value: "philippines", label: t("settings.fieldOptions.countryOfCitizenship.options.philippines") },
          { value: "nigeria", label: t("settings.fieldOptions.countryOfCitizenship.options.nigeria") },
          { value: "canada", label: t("settings.fieldOptions.countryOfCitizenship.options.canada") },
          { value: "uk", label: t("settings.fieldOptions.countryOfCitizenship.options.uk") },
          { value: "germany", label: t("settings.fieldOptions.countryOfCitizenship.options.germany") },
          { value: "south_korea", label: t("settings.fieldOptions.countryOfCitizenship.options.south_korea") },
          { value: "japan", label: t("settings.fieldOptions.countryOfCitizenship.options.japan") },
          { value: "other", label: t("settings.fieldOptions.countryOfCitizenship.options.other") },
        ],
      },
    urgency: {
      field: "urgency",
      title: t("settings.fieldOptions.urgency.title"),
      options: [
        { value: "immediate", label: t("settings.fieldOptions.urgency.options.immediate") },
        { value: "soon", label: t("settings.fieldOptions.urgency.options.soon") },
        { value: "planning", label: t("settings.fieldOptions.urgency.options.planning") },
        { value: "", label: t("settings.fieldOptions.urgency.options.empty") },
      ],
    },
    expiryTimeline: {
      field: "expiryTimeline",
      title: t("settings.fieldOptions.expiryTimeline.title"),
      options: [
        { value: "expired", label: t("settings.fieldOptions.expiryTimeline.options.expired") },
        { value: "30days", label: t("settings.fieldOptions.expiryTimeline.options.30days") },
        { value: "90days", label: t("settings.fieldOptions.expiryTimeline.options.90days") },
        { value: "6months", label: t("settings.fieldOptions.expiryTimeline.options.6months") },
        { value: "year", label: t("settings.fieldOptions.expiryTimeline.options.year") },
        { value: "safe", label: t("settings.fieldOptions.expiryTimeline.options.safe") },
        { value: "", label: t("settings.fieldOptions.expiryTimeline.options.empty") },
      ],
    },
    gcYearsHeld: {
      field: "gcYearsHeld",
      title: t("settings.fieldOptions.gcYearsHeld.title"),
      options: [
        { value: "under2", label: t("settings.fieldOptions.gcYearsHeld.options.under2") },
        { value: "2to3", label: t("settings.fieldOptions.gcYearsHeld.options.2to3") },
        { value: "3to5", label: t("settings.fieldOptions.gcYearsHeld.options.3to5") },
        { value: "over5", label: t("settings.fieldOptions.gcYearsHeld.options.over5") },
        { value: "military", label: t("settings.fieldOptions.gcYearsHeld.options.military") },
        { value: "", label: t("settings.fieldOptions.gcYearsHeld.options.empty") },
      ],
    },
    // NEW: language picker
    language: {
        field: "language",
        title: t("settings.fieldOptions.language.title"),
        options: [
          { value: "en", label: t("settings.fieldOptions.language.options.en") },
          { value: "es", label: t("settings.fieldOptions.language.options.es") },
          { value: "pt", label: t("settings.fieldOptions.language.options.pt") },
          { value: "zh", label: t("settings.fieldOptions.language.options.zh") },
          { value: "ht", label: t("settings.fieldOptions.language.options.ht") },
        ],
      },
  };

  const getDisplayValue = (field) => {
    if (!profile) return "—";
    const value = profile[field];
    // Language defaults to whatever i18n is currently using if profile.language
    // hasn't been explicitly set yet — covers the auto-detected case where
    // a Spanish device user hasn't manually saved a language preference yet.
    if (field === "language" && !value) {
      const currentLang = getCurrentLanguage();
      return t(`settings.fieldOptions.language.options.${currentLang}`);
    }
    if (!value) return t("common.notSet");

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
          <Text style={styles.loadingText}>
            {t("settings.loadingProfile")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PROFILE SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.profile.title")}</Text>
          <Text style={styles.sectionSubtitle}>
            {t("settings.profile.subtitle")}
          </Text>

          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => setEditModal(FIELD_OPTIONS.purpose)}
          >
            <Text style={styles.fieldLabel}>
              {t("settings.profile.fields.goal")}
            </Text>
            <Text style={styles.fieldValue}>{getDisplayValue("purpose")}</Text>
            <Text style={styles.fieldArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => setEditModal(FIELD_OPTIONS.location)}
          >
            <Text style={styles.fieldLabel}>
              {t("settings.profile.fields.location")}
            </Text>
            <Text style={styles.fieldValue}>{getDisplayValue("location")}</Text>
            <Text style={styles.fieldArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => setEditModal(FIELD_OPTIONS.countryOfCitizenship)}
          >
            <Text style={styles.fieldLabel}>
              {t("settings.profile.fields.country")}
            </Text>
            <Text style={styles.fieldValue}>
              {getDisplayValue("countryOfCitizenship")}
            </Text>
            <Text style={styles.fieldArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => setEditModal(FIELD_OPTIONS.currentVisa)}
          >
            <Text style={styles.fieldLabel}>
              {t("settings.profile.fields.visaStatus")}
            </Text>
            <Text style={styles.fieldValue}>
              {getDisplayValue("currentVisa")}
            </Text>
            <Text style={styles.fieldArrow}>›</Text>
          </TouchableOpacity>

          {/* GC years held — only shown for GC holders */}
          {profile?.currentVisa === "GC" && (
            <TouchableOpacity
              style={styles.fieldRow}
              onPress={() => setEditModal(FIELD_OPTIONS.gcYearsHeld)}
            >
              <Text style={styles.fieldLabel}>
                {t("settings.profile.fields.gcHeld")}
              </Text>
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
              <Text style={styles.fieldLabel}>
                {t("settings.profile.fields.timeline")}
              </Text>
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
              <Text style={styles.fieldLabel}>
                {t("settings.profile.fields.visaExpiry")}
              </Text>
              <Text style={styles.fieldValue}>
                {getDisplayValue("expiryTimeline")}
              </Text>
              <Text style={styles.fieldArrow}>›</Text>
            </TouchableOpacity>
          )}

          {/* NEW: Language picker — always visible */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => setEditModal(FIELD_OPTIONS.language)}
          >
            <Text style={styles.fieldLabel}>
              {t("settings.profile.fields.language")}
            </Text>
            <Text style={styles.fieldValue}>{getDisplayValue("language")}</Text>
            <Text style={styles.fieldArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ABOUT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.about.title")}</Text>

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>{t("settings.about.version")}</Text>
            <Text style={styles.aboutValue}>
              {Constants.expoConfig?.version || "1.2.0"}
            </Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>
              {t("settings.about.dataUpdated")}
            </Text>
            <Text style={styles.aboutValue}>
              {PROCESSING_TIMES_META.lastUpdated}
            </Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>{t("settings.about.sources")}</Text>
            <Text style={styles.aboutValue}>
              {t("settings.about.sourcesValue")}
            </Text>
          </View>
        </View>

        {/* DISCLAIMER */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>
            {t("settings.disclaimer")}
          </Text>
        </View>

        {/* PRIVACY */}
        <View style={styles.section}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>{t("settings.privacy.label")}</Text>
            <Text style={styles.aboutValue}>{t("settings.privacy.value")}</Text>
          </View>
        </View>

        {/* RESET */}
        <TouchableOpacity style={styles.resetButton} onPress={resetApp}>
          <Text style={styles.resetButtonText}>
            {t("settings.reset.button")}
          </Text>
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
                    profile[editModal.field] === opt.value &&
                      styles.modalOptionActive,
                  ]}
                  onPress={() => updateField(editModal.field, opt.value)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      profile[editModal.field] === opt.value &&
                        styles.modalOptionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {profile[editModal.field] === opt.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setEditModal(null)}
            >
              <Text style={styles.modalCancelText}>
                {t("settings.modal.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

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
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  aboutLabel: { fontSize: 14, color: "#666" },
  aboutValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
  },

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