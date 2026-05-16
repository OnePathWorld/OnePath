// src/screens/PolicyTrackerScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import {
  getActivePolicies,
  getCourtCases,
  getEmbassyAlerts,
  getUpcomingChanges,
  checkPolicyUpdates,
  getNextImportantDate,
  POLICY_TRACKER_META,
} from "../data/policyTracker";
import analytics, { EVENTS } from "../utils/analytics";

const PolicyTrackerScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("affecting_you");
  const [userImpact, setUserImpact] = useState(null);
  const [nextDate, setNextDate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  // Computed inside render so language switches re-translate the data
  const ACTIVE_POLICIES = getActivePolicies();
  const COURT_CASES = getCourtCases();
  const EMBASSY_ALERTS = getEmbassyAlerts();
  const UPCOMING_CHANGES = getUpcomingChanges();

  useEffect(() => {
    analytics.screen("PolicyTracker");
    loadPolicyData();
  }, []);

  const loadPolicyData = async () => {
    try {
      const impact = await checkPolicyUpdates();
      setUserImpact(impact);

      const next = await getNextImportantDate();
      setNextDate(next);
    } catch (error) {
      console.error("Error loading policy data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPolicyData();
    setRefreshing(false);
  };

  const toggleExpanded = (id) => {
    analytics.track(EVENTS.POLICY_CARD_EXPANDED, { policyId: id });
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Translate court case status (raw enum: "pending", etc.)
  const translateCaseStatus = (raw) => {
    if (!raw) return "";
    const key = `policyTrackerScreen.caseStatuses.${raw}`;
    const translated = t(key);
    return translated === key ? raw : translated;
  };

  // Translate embassy alert type (raw enum: "processing_delay", etc.)
  const translateAlertType = (raw) => {
    if (!raw) return "";
    const key = `policyTrackerScreen.alertTypes.${raw}`;
    const translated = t(key);
    // Fall back to the original "PROCESSING_DELAY" → "PROCESSING DELAY" transform
    return translated === key
      ? raw.replace(/_/g, " ").toUpperCase()
      : translated;
  };

  // =========================================================
  // RENDER HELPERS
  // =========================================================

  const renderPolicyCard = (policy, isPersonalized = false) => {
    const isExpanded = expandedItems[policy.id];
    const daysUntil = policy.effectiveDate
      ? Math.ceil(
          (new Date(policy.effectiveDate) - new Date()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

    return (
      <TouchableOpacity
        key={policy.id}
        style={[
          styles.policyCard,
          policy.severity === "critical" && styles.criticalCard,
          policy.severity === "warning" && styles.warningCard,
        ]}
        onPress={() => toggleExpanded(policy.id)}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.severityBadge}>
              {policy.severity === "critical"
                ? "🔴"
                : policy.severity === "warning"
                ? "🟡"
                : "🔵"}
            </Text>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {policy.title}
            </Text>
          </View>
          {daysUntil !== null && daysUntil > 0 && (
            <Text
              style={[
                styles.daysUntil,
                daysUntil < 30 && styles.urgentText,
              ]}
            >
              {t("policyTrackerScreen.daysSuffix", { count: daysUntil })}
            </Text>
          )}
        </View>

        {/* Summary */}
        <Text style={styles.cardSummary}>{policy.summary}</Text>

        {/* Personal Impact - Only on personalized view */}
        {isPersonalized && policy.personalImpact && (
          <View style={styles.personalImpactBox}>
            <Text style={styles.personalImpactLabel}>
              {t("policyTrackerScreen.policyCard.yourImpact")}
            </Text>
            <Text style={styles.personalImpactText}>
              {policy.personalImpact}
            </Text>
          </View>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.detailsText}>{policy.details}</Text>

            {policy.actions && policy.actions.length > 0 && (
              <View style={styles.actionsSection}>
                <Text style={styles.actionsTitle}>
                  {t("policyTrackerScreen.policyCard.recommendedActions")}
                </Text>
                {policy.actions.map((action, idx) => (
                  <View key={idx} style={styles.actionItem}>
                    <Text style={styles.actionBullet}>•</Text>
                    <Text style={styles.actionText}>{action}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                {t("policyTrackerScreen.policyCard.source", {
                  source: policy.source,
                })}
              </Text>
              <Text style={styles.metaText}>
                {t("policyTrackerScreen.policyCard.published", {
                  date: new Date(policy.publishedDate).toLocaleDateString(),
                })}
              </Text>
            </View>
          </View>
        )}

        {/* Expand Indicator */}
        <Text style={styles.expandIndicator}>
          {isExpanded ? "˄" : "˅"}{" "}
          {isExpanded
            ? t("policyTrackerScreen.policyCard.less")
            : t("policyTrackerScreen.policyCard.more")}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCourtCase = (courtCase) => {
    return (
      <TouchableOpacity
        key={courtCase.id}
        style={styles.courtCard}
        onPress={() => toggleExpanded(courtCase.id)}
      >
        <View style={styles.courtHeader}>
          <Text style={styles.courtIcon}>⚖️</Text>
          <Text style={styles.courtCase}>{courtCase.case}</Text>
        </View>

        <Text style={styles.courtStatus}>
          {t("policyTrackerScreen.courtCard.status", {
            status: translateCaseStatus(courtCase.status),
          })}
        </Text>
        <Text style={styles.courtImpact}>{courtCase.impact}</Text>

        {expandedItems[courtCase.id] && (
          <View style={styles.courtDetails}>
            <Text style={styles.courtProbability}>{courtCase.probability}</Text>
            <Text style={styles.courtDate}>
              {t("policyTrackerScreen.courtCard.expectedDecision", {
                date: courtCase.expectedDate,
              })}
            </Text>

            {courtCase.contingencyActions && (
              <View style={styles.actionsSection}>
                <Text style={styles.actionsTitle}>
                  {t("policyTrackerScreen.courtCard.contingencyPlans")}
                </Text>
                {courtCase.contingencyActions.map((action, idx) => (
                  <Text key={idx} style={styles.actionText}>
                    • {action}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmbassyAlert = (alert) => {
    return (
      <View key={alert.id} style={styles.embassyCard}>
        <View style={styles.embassyHeader}>
          <Text style={styles.embassyIcon}>🏛️</Text>
          <Text style={styles.embassyLocation}>{alert.location}</Text>
        </View>

        <Text
          style={[
            styles.embassyType,
            alert.severity === "high" && styles.urgentText,
          ]}
        >
          {translateAlertType(alert.type)}
        </Text>

        <Text style={styles.embassyReason}>{alert.reason}</Text>

        {alert.currentWait && (
          <Text style={styles.embassyWait}>
            {t("policyTrackerScreen.embassyCard.currentWait", {
              wait: alert.currentWait,
            })}
          </Text>
        )}

        {alert.alternatives && (
          <Text style={styles.embassyAlternatives}>
            {t("policyTrackerScreen.embassyCard.alternatives", {
              list: alert.alternatives.join(", "),
            })}
          </Text>
        )}
      </View>
    );
  };

  const renderUpcomingChange = (change) => {
    const daysUntil = Math.ceil(
      (new Date(change.date) - new Date()) / (1000 * 60 * 60 * 24)
    );

    return (
      <View key={change.date} style={styles.upcomingCard}>
        <View style={styles.upcomingHeader}>
          <Text style={styles.upcomingDate}>
            {new Date(change.date).toLocaleDateString()}
          </Text>
          <Text
            style={[
              styles.upcomingDays,
              daysUntil < 30 && styles.urgentText,
            ]}
          >
            {t("policyTrackerScreen.daysSuffix", { count: daysUntil })}
          </Text>
        </View>
        <Text style={styles.upcomingTitle}>{change.title}</Text>
        <Text style={styles.upcomingImpact}>{change.impact}</Text>
        <Text style={styles.upcomingAction}>→ {change.action}</Text>
      </View>
    );
  };

  const tabs = [
    {
      id: "affecting_you",
      label: t("policyTrackerScreen.tabs.affectingYou"),
      count: userImpact?.totalAlerts,
    },
    { id: "all_policies", label: t("policyTrackerScreen.tabs.allPolicies") },
    { id: "court_cases", label: t("policyTrackerScreen.tabs.courtCases") },
    { id: "calendar", label: t("policyTrackerScreen.tabs.calendar") },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Alert */}
      {nextDate && (
        <View style={styles.headerAlert}>
          <Text style={styles.headerAlertIcon}>📅</Text>
          <View style={styles.headerAlertContent}>
            <Text style={styles.headerAlertTitle}>
              {t("policyTrackerScreen.nextImportantDate")}
            </Text>
            <Text style={styles.headerAlertText}>
              {t("policyTrackerScreen.nextImportantDateText", {
                title: nextDate.title,
                days: nextDate.daysUntil,
              })}
            </Text>
          </View>
        </View>
      )}

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, selectedTab === tab.id && styles.tabActive]}
            onPress={() => {
              analytics.track(EVENTS.POLICY_TAB_SWITCHED, { tab: tab.id });
              setSelectedTab(tab.id);
            }}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.id && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{tab.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* AFFECTING YOU TAB */}
        {selectedTab === "affecting_you" && (
          <View>
            {userImpact?.affected?.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>
                  {t("policyTrackerScreen.affectsYour.count", {
                    count: userImpact.affected.length,
                  })}
                </Text>
                {userImpact.affected.map((policy) =>
                  renderPolicyCard(policy, true)
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>✅</Text>
                <Text style={styles.emptyTitle}>
                  {t("policyTrackerScreen.emptyState.title")}
                </Text>
                <Text style={styles.emptyText}>
                  {t("policyTrackerScreen.emptyState.body")}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ALL POLICIES TAB */}
        {selectedTab === "all_policies" && (
          <View>
            {ACTIVE_POLICIES.critical.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  {t("policyTrackerScreen.sectionTitles.criticalChanges")}
                </Text>
                {ACTIVE_POLICIES.critical.map((policy) =>
                  renderPolicyCard(policy)
                )}
              </>
            )}

            {ACTIVE_POLICIES.warning.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  {t("policyTrackerScreen.sectionTitles.warnings")}
                </Text>
                {ACTIVE_POLICIES.warning.map((policy) =>
                  renderPolicyCard(policy)
                )}
              </>
            )}

            {ACTIVE_POLICIES.info.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  {t("policyTrackerScreen.sectionTitles.information")}
                </Text>
                {ACTIVE_POLICIES.info.map((policy) =>
                  renderPolicyCard(policy)
                )}
              </>
            )}
          </View>
        )}

        {/* COURT CASES TAB */}
        {selectedTab === "court_cases" && (
          <View>
            <Text style={styles.sectionTitle}>
              {t("policyTrackerScreen.sectionTitles.casesMonitored")}
            </Text>
            {COURT_CASES.map((courtCase) => renderCourtCase(courtCase))}

            {EMBASSY_ALERTS.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  {t("policyTrackerScreen.sectionTitles.embassyAlerts")}
                </Text>
                {EMBASSY_ALERTS.map((alert) => renderEmbassyAlert(alert))}
              </>
            )}
          </View>
        )}

        {/* CALENDAR TAB */}
        {selectedTab === "calendar" && (
          <View>
            <Text style={styles.sectionTitle}>
              {t("policyTrackerScreen.sectionTitles.upcomingChanges")}
            </Text>
            {UPCOMING_CHANGES.map((change) => renderUpcomingChange(change))}
          </View>
        )}

        {/* Last Updated */}
        <Text style={styles.lastUpdated}>
          {t("policyTrackerScreen.lastChecked", {
            datetime: new Date(POLICY_TRACKER_META.lastChecked).toLocaleString(),
          })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PolicyTrackerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  // Header Alert
  headerAlert: {
    backgroundColor: "#2E86AB",
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
  },
  headerAlertIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  headerAlertContent: {
    flex: 1,
  },
  headerAlertTitle: {
    color: "#FFF",
    fontSize: 12,
    opacity: 0.9,
  },
  headerAlertText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // Tabs
  tabContainer: {
    backgroundColor: "#FFF",
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: "#2E86AB",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  tabTextActive: {
    color: "#2E86AB",
    fontWeight: "600",
  },
  tabBadge: {
    backgroundColor: "#F44336",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  tabBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
  },

  // Content
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginVertical: 12,
  },

  // Policy Card
  policyCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  criticalCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: "row",
    flex: 1,
    alignItems: "flex-start",
  },
  severityBadge: {
    fontSize: 16,
    marginRight: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  daysUntil: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    marginLeft: 8,
  },
  urgentText: {
    color: "#F44336",
  },
  cardSummary: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 8,
  },
  personalImpactBox: {
    backgroundColor: "#E8F4F8",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  personalImpactLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E86AB",
    marginBottom: 4,
  },
  personalImpactText: {
    fontSize: 13,
    color: "#1A1A1A",
    lineHeight: 18,
  },
  expandedContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  detailsText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 19,
    marginBottom: 12,
  },
  actionsSection: {
    marginTop: 8,
  },
  actionsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  actionItem: {
    flexDirection: "row",
    paddingVertical: 2,
  },
  actionBullet: {
    marginRight: 6,
    color: "#666",
  },
  actionText: {
    flex: 1,
    fontSize: 13,
    color: "#444",
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  metaText: {
    fontSize: 11,
    color: "#999",
  },
  expandIndicator: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 12,
    color: "#999",
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 40,
  },

  // Court Card
  courtCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#9C27B0",
  },
  courtHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  courtIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  courtCase: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  courtStatus: {
    fontSize: 12,
    color: "#9C27B0",
    fontWeight: "600",
    marginBottom: 6,
  },
  courtImpact: {
    fontSize: 13,
    color: "#444",
    lineHeight: 18,
  },
  courtDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  courtProbability: {
    fontSize: 13,
    color: "#1A1A1A",
    fontWeight: "500",
    marginBottom: 6,
  },
  courtDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },

  // Embassy Card
  embassyCard: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  embassyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  embassyIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  embassyLocation: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  embassyType: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FF9800",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  embassyReason: {
    fontSize: 13,
    color: "#444",
    marginBottom: 6,
    lineHeight: 18,
  },
  embassyWait: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  embassyAlternatives: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },

  // Upcoming
  upcomingCard: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  upcomingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  upcomingDate: {
    fontSize: 13,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  upcomingDays: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  upcomingImpact: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    lineHeight: 16,
  },
  upcomingAction: {
    fontSize: 12,
    color: "#2E86AB",
    fontWeight: "500",
  },

  // Footer
  lastUpdated: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
  },
});
