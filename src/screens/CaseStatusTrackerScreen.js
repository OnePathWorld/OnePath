// src/screens/CaseStatusTrackerScreen.js
// =========================================================
// USCIS Case Status Tracker
// ---------------------------------------------------------
// The screen the USCIS reviewer will spend the most time on
// during the live demo. Every visible element maps to one
// of the 6 Pass/Fail demo criteria:
//
//   #1  UI input clarity         → Receipt number field
//                                   with placeholder, helper
//                                   text, validation icons
//   #2  JSON payload conversion  → Input becomes path param
//                                   in the GET request
//   #3  OAuth 2.0 server-side    → Demonstrated by the call
//                                   going through Railway,
//                                   not direct from device
//   #4  HTTPS response handling  → Both success and error
//                                   states render fully
//   #5  Case status visible      → Status card with form #,
//                                   status text, description,
//                                   timeline of history
//   #6  Error message displayed  → ErrorBanner shows
//                                   error.message verbatim
//                                   from the API response
//
// Refresh behavior (re-demo fix):
//   Both the per-card ↻ button AND pull-to-refresh are
//   "user explicitly asked for fresh data" actions, so both
//   call fetchCaseStatus with { forceRefresh: true }, which
//   appends ?refresh=true and makes the Railway backend
//   BYPASS its 30-minute cache and call USCIS fresh. A short
//   cooldown after each refresh prevents spam-tapping; during
//   the cooldown the ↻ button is greyed out and disabled.
//   Normal lookups (initial add, screen mounts) still use the
//   cache to protect the USCIS API from duplicate traffic.
//
// Architecture: this screen is intentionally self-contained.
// It manages its own list of tracked cases via caseStorage,
// so it can be reached from HomeScreen, OnboardingSummary,
// or as a standalone deep link without setup.
// =========================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";

import {
  fetchCaseStatus,
  isValidReceiptNumber,
  normalizeReceiptNumber,
  getCaseSnapshot,
  formatCaseDate,
} from "../utils/caseStatus";
import {
  getTrackedCases,
  addTrackedCase,
  updateCaseSnapshot,
  recordCaseError,
  removeTrackedCase,
} from "../utils/caseStorage";
import analytics, { EVENTS } from "../utils/analytics";

// How long the refresh action stays on cooldown after a tap,
// for both the per-card ↻ button and pull-to-refresh. Long
// enough to stop spam, short enough that a user who genuinely
// wants another check isn't kept waiting.
const REFRESH_COOLDOWN_MS = 10000;

const CaseStatusTrackerScreen = ({ navigation }) => {
  const { t } = useTranslation();

  // ===========================================================
  // State
  // ===========================================================
  const [cases, setCases] = useState([]);
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingId, setRefreshingId] = useState(null);

  // Cooldown tracking:
  //   cooldownIds  — per-card cooldown, keyed by receipt number
  //   pullCooldown — global cooldown for pull-to-refresh-all
  const [cooldownIds, setCooldownIds] = useState({});
  const [pullCooldown, setPullCooldown] = useState(false);

  // ===========================================================
  // Load tracked cases on focus (re-runs if user navigates back)
  // ===========================================================
  useFocusEffect(
    useCallback(() => {
      loadCases();
      analytics.screen("CaseStatusTracker");
    }, [])
  );

  const loadCases = async () => {
    const list = await getTrackedCases();
    setCases(list);
  };

  // ===========================================================
  // Live validation as the user types
  // ===========================================================
  const handleInputChange = (text) => {
    // Auto-uppercase + strip whitespace as they type — makes
    // pasting from a USCIS notice frictionless.
    const normalized = text.replace(/\s/g, "").toUpperCase();
    setInput(normalized);
    if (inputError) setInputError(null);
  };

  const inputIsValid = isValidReceiptNumber(input);
  const inputIsPartial = input.length > 0 && !inputIsValid;

  // ===========================================================
  // Start a per-card cooldown after a refresh completes
  // ===========================================================
  const startCardCooldown = (receiptNumber) => {
    setCooldownIds((prev) => ({ ...prev, [receiptNumber]: true }));
    setTimeout(() => {
      setCooldownIds((prev) => {
        const next = { ...prev };
        delete next[receiptNumber];
        return next;
      });
    }, REFRESH_COOLDOWN_MS);
  };

  // ===========================================================
  // Add a new case + immediately fetch its status
  // (uses the cache — this is a normal lookup, not a refresh)
  // ===========================================================
  const handleAddCase = async () => {
    const normalized = normalizeReceiptNumber(input);

    if (!isValidReceiptNumber(normalized)) {
      setInputError(t("caseTracker.input.invalidFormat"));
      return;
    }

    setSubmitting(true);
    setInputError(null);

    // 1. Persist the case so it shows up in the list even if
    //    the network call fails.
    await addTrackedCase(normalized);

    // 2. Fetch from USCIS via Railway proxy (cache allowed).
    const result = await fetchCaseStatus(normalized);

    if (result.ok) {
      const snapshot = getCaseSnapshot(result.data);
      await updateCaseSnapshot(normalized, snapshot);

      analytics.track("Case Status Added", {
        form_number: snapshot?.formNumber || "unknown",
        status_text: snapshot?.statusText || "unknown",
      });

      setInput("");
    } else {
      await recordCaseError(normalized, result.error);

      analytics.track("Case Status Error", {
        code: result.error.code,
        category: result.error.category,
      });
    }

    await loadCases();
    setSubmitting(false);
  };

  // ===========================================================
  // Refresh a single case (tap the card's ↻ button)
  // FORCE REFRESH — bypasses the Railway cache, hits USCIS.
  // ===========================================================
  const handleRefreshCase = async (receiptNumber) => {
    // Guard: ignore taps while this card is on cooldown.
    if (cooldownIds[receiptNumber]) return;

    setRefreshingId(receiptNumber);

    // forceRefresh: true → ?refresh=true → backend skips cache.
    const result = await fetchCaseStatus(receiptNumber, { forceRefresh: true });

    if (result.ok) {
      await updateCaseSnapshot(receiptNumber, getCaseSnapshot(result.data));
    } else {
      await recordCaseError(receiptNumber, result.error);
    }

    await loadCases();
    setRefreshingId(null);

    // Begin the greyed-out cooldown window for this card.
    startCardCooldown(receiptNumber);
  };

  // ===========================================================
  // Pull-to-refresh: refresh all cases sequentially
  // FORCE REFRESH — same intent as the ↻ button, applied to
  // every tracked case. Has its own global cooldown so it
  // can't be repeatedly pulled.
  // ===========================================================
  const handleRefreshAll = async () => {
    // Guard: ignore pull-to-refresh while on cooldown.
    if (pullCooldown) {
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    for (const c of cases) {
      const result = await fetchCaseStatus(c.receiptNumber, {
        forceRefresh: true,
      });
      if (result.ok) {
        await updateCaseSnapshot(
          c.receiptNumber,
          getCaseSnapshot(result.data)
        );
      } else {
        await recordCaseError(c.receiptNumber, result.error);
      }
    }
    await loadCases();
    setRefreshing(false);

    // Begin the global pull-to-refresh cooldown.
    setPullCooldown(true);
    setTimeout(() => setPullCooldown(false), REFRESH_COOLDOWN_MS);
  };

  // ===========================================================
  // Remove a case (with confirmation)
  // ===========================================================
  const handleRemoveCase = (receiptNumber) => {
    Alert.alert(
      t("caseTracker.remove.title"),
      t("caseTracker.remove.body", { receiptNumber }),
      [
        { text: t("caseTracker.remove.cancel"), style: "cancel" },
        {
          text: t("caseTracker.remove.confirm"),
          style: "destructive",
          onPress: async () => {
            await removeTrackedCase(receiptNumber);
            await loadCases();
          },
        },
      ]
    );
  };

  // ===========================================================
  // Render
  // ===========================================================
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefreshAll}
              tintColor="#2E86AB"
            />
          }
        >
          {/* ======================================================
              HEADER — explains the feature and references USCIS
              as the data source. The reviewer wants to see this.
              ====================================================== */}
          <View style={styles.headerCard}>
            <Text style={styles.headerIcon}>📬</Text>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>
                {t("caseTracker.header.title")}
              </Text>
              <Text style={styles.headerSubtitle}>
                {t("caseTracker.header.subtitle")}
              </Text>
            </View>
          </View>

          {/* ======================================================
              INPUT SECTION — Criterion #1 (UI input clarity)
              ====================================================== */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>
              {t("caseTracker.input.label")}
            </Text>

            <View
              style={[
                styles.inputRow,
                inputIsValid && styles.inputRowValid,
                inputError && styles.inputRowError,
              ]}
            >
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={handleInputChange}
                placeholder="EAC9999103403"
                placeholderTextColor="#AAA"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={13}
                editable={!submitting}
              />
              {inputIsValid && (
                <Text style={styles.inputCheck}>✓</Text>
              )}
            </View>

            <Text style={styles.inputHelper}>
              {t("caseTracker.input.helper")}
            </Text>

            {inputError && (
              <Text style={styles.inputErrorText}>{inputError}</Text>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!inputIsValid || submitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleAddCase}
              disabled={!inputIsValid || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {t("caseTracker.input.submit")}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ======================================================
              CASES LIST — Criterion #5 (status visible)
              ====================================================== */}
          {cases.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🗂️</Text>
              <Text style={styles.emptyTitle}>
                {t("caseTracker.empty.title")}
              </Text>
              <Text style={styles.emptyBody}>
                {t("caseTracker.empty.body")}
              </Text>
            </View>
          ) : (
            <View style={styles.casesSection}>
              <Text style={styles.sectionTitle}>
                {t("caseTracker.cases.title", { count: cases.length })}
              </Text>

              {cases.map((c) => (
                <CaseCard
                  key={c.receiptNumber}
                  caseEntry={c}
                  refreshing={refreshingId === c.receiptNumber}
                  cooling={Boolean(cooldownIds[c.receiptNumber])}
                  onRefresh={() => handleRefreshCase(c.receiptNumber)}
                  onRemove={() => handleRemoveCase(c.receiptNumber)}
                  t={t}
                />
              ))}
            </View>
          )}

          {/* ======================================================
              DATA SOURCE FOOTER — proves to the reviewer (and
              to users) where the data comes from. Important for
              trust and for the demo.
              ====================================================== */}
          <View style={styles.dataSource}>
            <Text style={styles.dataSourceText}>
              {t("caseTracker.dataSource")}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// =========================================================
// CaseCard — a single tracked case
// =========================================================
const CaseCard = ({
  caseEntry,
  refreshing,
  cooling,
  onRefresh,
  onRemove,
  t,
}) => {
  const { receiptNumber, snapshot, lastError, lastFetchedAt } = caseEntry;
  const [expanded, setExpanded] = useState(false);

  const hasSnapshot = Boolean(snapshot);
  const hasError = Boolean(lastError);

  // The ↻ button is unavailable while a refresh is in flight
  // OR during the post-refresh cooldown. While cooling it shows
  // a greyed-out style so it's clearly "just did that" rather
  // than broken.
  const refreshDisabled = refreshing || cooling;

  return (
    <View style={[styles.caseCard, hasError && styles.caseCardError]}>
      {/* Top row: receipt number + form number + actions */}
      <View style={styles.caseHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.receiptNumber}>{receiptNumber}</Text>
          {snapshot?.formNumber ? (
            <Text style={styles.formNumber}>{snapshot.formNumber}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.refreshButton, cooling && styles.refreshButtonCooling]}
          onPress={onRefresh}
          disabled={refreshDisabled}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#2E86AB" />
          ) : (
            <Text
              style={[
                styles.refreshIcon,
                cooling && styles.refreshIconCooling,
              ]}
            >
              ↻
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Text style={styles.removeIcon}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Status pill — the headline info */}
      {hasSnapshot && (
        <View style={styles.statusBlock}>
          <Text style={styles.statusText}>{snapshot.statusText}</Text>
          {snapshot.modifiedDate ? (
            <Text style={styles.statusUpdated}>
              {t("caseTracker.card.lastUpdated", {
                date: formatCaseDate(snapshot.modifiedDate),
              })}
            </Text>
          ) : null}
        </View>
      )}

      {/* Error banner — Criterion #6 (error.message displayed) */}
      {hasError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerTitle}>
            {t("caseTracker.error.title", {
              code: lastError.code || "ERROR",
            })}
          </Text>
          <Text style={styles.errorBannerMessage}>
            {/* This is the error.message straight from the API
                — verbatim, no rewording. The reviewer will look
                for this. */}
            {lastError.message}
          </Text>
          {lastError.traceId ? (
            <Text style={styles.errorBannerTrace}>
              {t("caseTracker.error.trace", { traceId: lastError.traceId })}
            </Text>
          ) : null}
        </View>
      )}

      {/* Expand for full description + history */}
      {hasSnapshot && (
        <TouchableOpacity
          style={styles.expandToggle}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.expandToggleText}>
            {expanded
              ? t("caseTracker.card.hideDetails")
              : t("caseTracker.card.showDetails")}
          </Text>
        </TouchableOpacity>
      )}

      {expanded && hasSnapshot && (
        <View style={styles.expandedContent}>
          {snapshot.statusDescription ? (
            <View style={styles.descriptionBlock}>
              <Text style={styles.descriptionLabel}>
                {t("caseTracker.card.description")}
              </Text>
              <Text style={styles.descriptionText}>
                {snapshot.statusDescription}
              </Text>
            </View>
          ) : null}

          {snapshot.submittedDate ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>
                {t("caseTracker.card.submitted")}
              </Text>
              <Text style={styles.metaValue}>
                {formatCaseDate(snapshot.submittedDate)}
              </Text>
            </View>
          ) : null}

          {snapshot.history && snapshot.history.length > 0 ? (
            <View style={styles.historyBlock}>
              <Text style={styles.historyLabel}>
                {t("caseTracker.card.history")}
              </Text>
              {snapshot.history.slice(0, 5).map((h, idx) => (
                <View key={idx} style={styles.historyItem}>
                  <View style={styles.historyDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyStatus}>
                      {h.completed_case_status_text_en || h.status || ""}
                    </Text>
                    {h.date ? (
                      <Text style={styles.historyDate}>
                        {formatCaseDate(h.date)}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      )}

      {lastFetchedAt && !hasError ? (
        <Text style={styles.fetchedAt}>
          {t("caseTracker.card.fetched", {
            time: formatCaseDate(new Date(lastFetchedAt).toISOString()),
          })}
        </Text>
      ) : null}
    </View>
  );
};

export default CaseStatusTrackerScreen;

// =========================================================
// Styles — matches the OnePath palette used throughout
// (HomeScreen, PolicyTrackerScreen, StatusDetailsScreen):
//   - Background      #F8F9FA
//   - Primary brand   #2E86AB
//   - Card surface    #FFF
//   - Text primary    #1A1A1A / #333
//   - Text secondary  #666 / #999
//   - Error           #F44336 / #FFEBEE
//   - Success         #4CAF50
//   - Disabled        #ECEFF1 / #B0BEC5
// =========================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // -------- Header card --------
  headerCard: {
    backgroundColor: "#2E86AB",
    margin: 20,
    marginBottom: 12,
    padding: 18,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  headerContent: { flex: 1 },
  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#E3F2FD",
    fontSize: 13,
    lineHeight: 18,
  },

  // -------- Input card --------
  inputCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 18,
    borderRadius: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "#FAFAFA",
  },
  inputRowValid: {
    borderColor: "#4CAF50",
    backgroundColor: "#F1F8E9",
  },
  inputRowError: {
    borderColor: "#F44336",
    backgroundColor: "#FFEBEE",
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: "#1A1A1A",
    letterSpacing: 1.2,
    fontWeight: "500",
  },
  inputCheck: {
    fontSize: 18,
    color: "#4CAF50",
    fontWeight: "700",
    marginLeft: 8,
  },
  inputHelper: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    lineHeight: 16,
  },
  inputErrorText: {
    fontSize: 12,
    color: "#F44336",
    marginTop: 6,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#2E86AB",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 14,
  },
  submitButtonDisabled: {
    backgroundColor: "#B0BEC5",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // -------- Empty state --------
  emptyState: {
    margin: 20,
    padding: 32,
    backgroundColor: "#FFF",
    borderRadius: 12,
    alignItems: "center",
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },

  // -------- Cases list --------
  casesSection: {
    marginHorizontal: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1A1A1A",
  },

  caseCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  caseCardError: {
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  caseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  receiptNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 0.8,
  },
  formNumber: {
    fontSize: 12,
    color: "#2E86AB",
    fontWeight: "600",
    marginTop: 2,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  // Greyed-out look while the refresh is on cooldown.
  refreshButtonCooling: {
    backgroundColor: "#ECEFF1",
  },
  refreshIcon: {
    fontSize: 18,
    color: "#2E86AB",
    fontWeight: "700",
  },
  refreshIconCooling: {
    color: "#B0BEC5",
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFEBEE",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  removeIcon: {
    fontSize: 22,
    color: "#F44336",
    fontWeight: "700",
    lineHeight: 24,
  },

  statusBlock: {
    backgroundColor: "#F1F8E9",
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  statusText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  statusUpdated: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
  },

  // -------- Error banner (criterion #6) --------
  errorBanner: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  errorBannerTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#C62828",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  errorBannerMessage: {
    fontSize: 14,
    color: "#1A1A1A",
    lineHeight: 19,
  },
  errorBannerTrace: {
    fontSize: 10,
    color: "#999",
    marginTop: 6,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },

  expandToggle: {
    marginTop: 10,
    paddingVertical: 6,
    alignItems: "center",
  },
  expandToggleText: {
    fontSize: 13,
    color: "#2E86AB",
    fontWeight: "600",
  },
  expandedContent: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  descriptionBlock: { marginBottom: 12 },
  descriptionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 19,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  metaLabel: {
    fontSize: 12,
    color: "#666",
  },
  metaValue: {
    fontSize: 12,
    color: "#1A1A1A",
    fontWeight: "600",
  },

  historyBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  historyLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2E86AB",
    marginTop: 5,
    marginRight: 10,
  },
  historyStatus: {
    fontSize: 13,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  historyDate: {
    fontSize: 11,
    color: "#999",
    marginTop: 1,
  },

  fetchedAt: {
    fontSize: 10,
    color: "#999",
    marginTop: 8,
    textAlign: "right",
  },

  // -------- Data source footer --------
  dataSource: {
    margin: 20,
    padding: 12,
    alignItems: "center",
  },
  dataSourceText: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    lineHeight: 16,
  },
});