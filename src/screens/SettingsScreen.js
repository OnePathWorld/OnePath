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
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import analytics from "../utils/analytics";
import { PROCESSING_TIMES_META } from "../data/processingTimes";
import { setAppLanguage, getCurrentLanguage } from "../i18n";
import {
  buildPrimaryCountryOptions,
  filterCountrySearch,
  getCountryLabel,
} from "../data/countries";

// i18n prefix for the pinned country quick-pick labels in this screen.
const COUNTRY_KEY_PREFIX = "settings.fieldOptions.countryOfCitizenship.options";

const SettingsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);

  // Country search state — only active while editing countryOfCitizenship and
  // the user has tapped "Other" to reveal the full searchable list.
  const [countrySearch, setCountrySearch] = useState("");
  const [countrySearchResults, setCountrySearchResults] = useState([]);
  const [countryOtherSelected, setCountryOtherSelected] = useState(false);

  // Reset transient country-search UI. Called when opening or closing the modal.
  const resetCountrySearch = () => {
    setCountrySearch("");
    setCountrySearchResults([]);
    setCountryOtherSelected(false);
  };

  const closeModal = () => {
    setEditModal(null);
    resetCountrySearch();
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await AsyncStorage.getItem("@userProfile_v2");
      if (data) setProfile(JSON.parse(data));
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
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

  // Commit a country chosen from the search list. Writes BOTH the stable
  // value (used by analytics + country-keyed data like countrySpecificTips)
  // and the captured label (countrySpecified), mirroring OnboardingScreen so
  // the two entry points store the profile identically.
  const updateCountryFromSearch = async (country) => {
    try {
      const updated = {
        ...profile,
        countryOfCitizenship: country.value,
        countrySpecified: country.label,
      };
      setProfile(updated);
      await AsyncStorage.setItem("@userProfile_v2", JSON.stringify(updated));
      analytics.identifyUser(updated);
      closeModal();
      Alert.alert(
        t("settings.updateAlert.title"),
        t("settings.updateAlert.body")
      );
    } catch (err) {
      console.error("Failed to update country:", err);
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
        // Pinned quick-pick list from the shared module (same order as
        // Onboarding). The full searchable list is reachable via the "Other"
        // option, which reveals a search box in the edit modal below.
        options: buildPrimaryCountryOptions(t, COUNTRY_KEY_PREFIX),
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

    // Country needs special resolution: a stored value may be a pinned
    // quick-pick (translated), a full-list country like "jamaica" (flag +
    // English label), or — for older profiles — an unknown value. The shared
    // helper handles all three, using countrySpecified when present. Without
    // this, non-pinned countries fell through to the raw lowercase value.
    if (field === "countryOfCitizenship") {
      return getCountryLabel(
        value,
        t,
        COUNTRY_KEY_PREFIX,
        profile.countrySpecified
      );
    }

    const fieldConfig = FIELD_OPTIONS[field];
    if (fieldConfig) {
      const match = fieldConfig.options.find((o) => o.value === value);
      if (match) return match.label;
    }
    return value;
  };

  if (loading) {
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

  // Loaded, but no profile exists — e.g. a track-before-onboard user who
  // entered the app via the case tracker without completing onboarding. Show a
  // real empty state that invites profile completion instead of the perpetual
  // "loading" text. We deliberately do NOT render the editable field rows for
  // this state: editing one field with no base profile would spread into a
  // one-key fragment. The CTA routes into onboarding (its routes are still
  // registered while onboarding is incomplete).
  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            {t("settings.emptyState.title", "Set up your profile")}
          </Text>
          <Text style={styles.emptyBody}>
            {t(
              "settings.emptyState.body",
              "Answer a few quick questions to unlock guidance tailored to your situation — your pathways, timelines, and what to watch for."
            )}
          </Text>
          <TouchableOpacity
            style={styles.emptyCta}
            onPress={() => navigation.navigate("Onboarding")}
          >
            <Text style={styles.emptyCtaText}>
              {t("settings.emptyState.cta", "Get started")}
            </Text>
          </TouchableOpacity>
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
            onPress={() => {
              resetCountrySearch();
              setEditModal(FIELD_OPTIONS.countryOfCitizenship);
            }}
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
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          {/* Stop taps inside the sheet from bubbling up to the overlay's
              close handler (important now that the sheet contains a TextInput). */}
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editModal?.title}</Text>
              <ScrollView
                style={styles.modalScroll}
                keyboardShouldPersistTaps="handled"
              >
                {editModal?.options.map((opt) => {
                  const isCountry =
                    editModal.field === "countryOfCitizenship";
                  const isOtherCountry = isCountry && opt.value === "other";
                  // "Other" highlights while the user is in search mode; all
                  // other rows highlight on an exact stored-value match.
                  const isActive = isOtherCountry
                    ? countryOtherSelected
                    : profile[editModal.field] === opt.value;

                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.modalOption,
                        isActive && styles.modalOptionActive,
                      ]}
                      onPress={() => {
                        // Tapping "Other" for the country field reveals the
                        // search box instead of committing "other" + closing.
                        // Committing "other" was the old bug — it clobbered
                        // real values like "jamaica" and disabled country tips.
                        if (isOtherCountry) {
                          setCountryOtherSelected(true);
                          return;
                        }
                        updateField(editModal.field, opt.value);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          isActive && styles.modalOptionTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {isActive && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}

                {/* COUNTRY SEARCH — shown after the user taps "Other".
                    Same searchable list and behaviour as OnboardingScreen. */}
                {editModal?.field === "countryOfCitizenship" &&
                  countryOtherSelected && (
                    <View>
                      <TextInput
                        style={styles.textInput}
                        placeholder={t(
                          "onboarding.countryOfCitizenship.searchPlaceholder"
                        )}
                        value={countrySearch}
                        onChangeText={(text) => {
                          setCountrySearch(text);
                          setCountrySearchResults(filterCountrySearch(text));
                        }}
                        autoCapitalize="words"
                        autoCorrect={false}
                      />

                      {countrySearch.length > 0 &&
                        countrySearchResults.length === 0 && (
                          <Text style={styles.countrySearchEmpty}>
                            {t("onboarding.countryOfCitizenship.noResults")}
                          </Text>
                        )}

                      {countrySearchResults.map((c) => (
                        <TouchableOpacity
                          key={c.value}
                          style={styles.countrySearchResult}
                          onPress={() => updateCountryFromSearch(c)}
                        >
                          <Text style={styles.countrySearchResultText}>
                            {c.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
              </ScrollView>
              <TouchableOpacity style={styles.modalCancel} onPress={closeModal}>
                <Text style={styles.modalCancelText}>
                  {t("settings.modal.cancel")}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
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

  // Empty state shown when no profile exists (track-before-onboard users).
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A2E",
    textAlign: "center",
    marginBottom: 12,
  },
  emptyBody: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  emptyCta: {
    backgroundColor: "#2E86AB",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
  },
  emptyCtaText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

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

  // Country search (modal) — mirrors OnboardingScreen styling.
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
  countrySearchEmpty: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
  },
});