// src/screens/PolicyTrackerScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ACTIVE_POLICIES,
  COURT_CASES,
  EMBASSY_ALERTS,
  UPCOMING_CHANGES,
  checkPolicyUpdates,
  getNextImportantDate,
  POLICY_TRACKER_META,
} from "../data/policyTracker";
import analytics, { EVENTS } from "../utils/analytics";

const PolicyTrackerScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState("affecting_you");
  const [userImpact, setUserImpact] = useState(null);
  const [nextDate, setNextDate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

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
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderPolicyCard = (policy, isPersonalized = false) => {
    const isExpanded = expandedItems[policy.id];
    const daysUntil = policy.effectiveDate ? 
      Math.ceil((new Date(policy.effectiveDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;

    return (
      <TouchableOpacity
        key={policy.id}
        style={[
          styles.policyCard,
          policy.severity === "critical" && styles.criticalCard,
          policy.severity === "warning" && styles.warningCard
        ]}
        onPress={() => toggleExpanded(policy.id)}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.severityBadge}>
              {policy.severity === "critical" ? "🔴" : 
               policy.severity === "warning" ? "🟡" : "🔵"}
            </Text>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {policy.title}
            </Text>
          </View>
          {daysUntil !== null && daysUntil > 0 && (
            <Text style={[
              styles.daysUntil,
              daysUntil < 30 && styles.urgentText
            ]}>
              {daysUntil} days
            </Text>
          )}
        </View>

        {/* Summary */}
        <Text style={styles.cardSummary}>{policy.summary}</Text>

        {/* Personal Impact - Only on personalized view */}
        {isPersonalized && policy.personalImpact && (
          <View style={styles.personalImpactBox}>
            <Text style={styles.personalImpactLabel}>Your Impact:</Text>
            <Text style={styles.personalImpactText}>{policy.personalImpact}</Text>
          </View>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.detailsText}>{policy.details}</Text>
            
            {policy.actions && policy.actions.length > 0 && (
              <View style={styles.actionsSection}>
                <Text style={styles.actionsTitle}>Recommended Actions:</Text>
                {policy.actions.map((action, idx) => (
                  <View key={idx} style={styles.actionItem}>
                    <Text style={styles.actionBullet}>•</Text>
                    <Text style={styles.actionText}>{action}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>Source: {policy.source}</Text>
              <Text style={styles.metaText}>
                Published: {new Date(policy.publishedDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}

        {/* Expand Indicator */}
        <Text style={styles.expandIndicator}>
          {isExpanded ? "˄" : "˅"} {isExpanded ? "Less" : "More"}
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
        
        <Text style={styles.courtStatus}>Status: {courtCase.status}</Text>
        <Text style={styles.courtImpact}>{courtCase.impact}</Text>
        
        {expandedItems[courtCase.id] && (
          <View style={styles.courtDetails}>
            <Text style={styles.courtProbability}>{courtCase.probability}</Text>
            <Text style={styles.courtDate}>
              Expected decision: {courtCase.expectedDate}
            </Text>
            
            {courtCase.contingencyActions && (
              <View style={styles.actionsSection}>
                <Text style={styles.actionsTitle}>Contingency Plans:</Text>
                {courtCase.contingencyActions.map((action, idx) => (
                  <Text key={idx} style={styles.actionText}>• {action}</Text>
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
        
        <Text style={[
          styles.embassyType,
          alert.severity === "high" && styles.urgentText
        ]}>
          {alert.type.replace(/_/g, " ").toUpperCase()}
        </Text>
        
        <Text style={styles.embassyReason}>{alert.reason}</Text>
        
        {alert.currentWait && (
          <Text style={styles.embassyWait}>
            Current wait: {alert.currentWait}
          </Text>
        )}
        
        {alert.alternatives && (
          <Text style={styles.embassyAlternatives}>
            Alternatives: {alert.alternatives.join(", ")}
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
          <Text style={[
            styles.upcomingDays,
            daysUntil < 30 && styles.urgentText
          ]}>
            {daysUntil} days
          </Text>
        </View>
        <Text style={styles.upcomingTitle}>{change.title}</Text>
        <Text style={styles.upcomingImpact}>{change.impact}</Text>
        <Text style={styles.upcomingAction}>→ {change.action}</Text>
      </View>
    );
  };

  const tabs = [
    { id: "affecting_you", label: "Affecting You", count: userImpact?.totalAlerts },
    { id: "all_policies", label: "All Policies" },
    { id: "court_cases", label: "Court Cases" },
    { id: "calendar", label: "Calendar" }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Alert */}
      {nextDate && (
        <View style={styles.headerAlert}>
          <Text style={styles.headerAlertIcon}>📅</Text>
          <View style={styles.headerAlertContent}>
            <Text style={styles.headerAlertTitle}>Next Important Date</Text>
            <Text style={styles.headerAlertText}>
              {nextDate.title} in {nextDate.daysUntil} days
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
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              selectedTab === tab.id && styles.tabActive
            ]}
            onPress={() => {
                analytics.track(EVENTS.POLICY_TAB_SWITCHED, { tab: tab.id });
                setSelectedTab(tab.id);
              }}
          >
            <Text style={[
              styles.tabText,
              selectedTab === tab.id && styles.tabTextActive
            ]}>
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
                  {userImpact.affected.length} policies affect your status
                </Text>
                {userImpact.affected.map(policy => 
                  renderPolicyCard(policy, true)
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>✅</Text>
                <Text style={styles.emptyTitle}>No Critical Changes</Text>
                <Text style={styles.emptyText}>
                  No current policies directly affect your immigration status
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
                <Text style={styles.sectionTitle}>Critical Changes</Text>
                {ACTIVE_POLICIES.critical.map(policy => renderPolicyCard(policy))}
              </>
            )}
            
            {ACTIVE_POLICIES.warning.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Warnings</Text>
                {ACTIVE_POLICIES.warning.map(policy => renderPolicyCard(policy))}
              </>
            )}
            
            {ACTIVE_POLICIES.info.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Information</Text>
                {ACTIVE_POLICIES.info.map(policy => renderPolicyCard(policy))}
              </>
            )}
          </View>
        )}

        {/* COURT CASES TAB */}
        {selectedTab === "court_cases" && (
          <View>
            <Text style={styles.sectionTitle}>Cases Being Monitored</Text>
            {COURT_CASES.map(courtCase => renderCourtCase(courtCase))}
            
            {EMBASSY_ALERTS.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Embassy Alerts</Text>
                {EMBASSY_ALERTS.map(alert => renderEmbassyAlert(alert))}
              </>
            )}
          </View>
        )}

        {/* CALENDAR TAB */}
        {selectedTab === "calendar" && (
          <View>
            <Text style={styles.sectionTitle}>Upcoming Changes</Text>
            {UPCOMING_CHANGES.map(change => renderUpcomingChange(change))}
          </View>
        )}

        {/* Last Updated */}
        <Text style={styles.lastUpdated}>
          Last checked: {new Date(POLICY_TRACKER_META.lastChecked).toLocaleString()}
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
    marginBottom: 15,
    color: "#1A1A1A",
  },
  
  // Policy Cards
  policyCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#2E86AB",
  },
  criticalCard: {
    borderLeftColor: "#F44336",
    backgroundColor: "#FFF5F5",
  },
  warningCard: {
    borderLeftColor: "#FF9800",
    backgroundColor: "#FFFBF0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
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
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    color: "#1A1A1A",
  },
  daysUntil: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  urgentText: {
    color: "#F44336",
  },
  cardSummary: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 10,
  },
  personalImpactBox: {
    backgroundColor: "#E8F4F8",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  personalImpactLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E86AB",
    marginBottom: 4,
  },
  personalImpactText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
  },
  expandedContent: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  detailsText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 15,
  },
  actionsSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  actionItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  actionBullet: {
    marginRight: 8,
    color: "#2E86AB",
  },
  actionText: {
    flex: 1,
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  metaText: {
    fontSize: 11,
    color: "#999",
  },
  expandIndicator: {
    textAlign: "center",
    fontSize: 12,
    color: "#2E86AB",
    marginTop: 10,
  },
  
  // Court Cases
  courtCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  courtHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  courtIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  courtCase: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  courtStatus: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  courtImpact: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  courtDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  courtProbability: {
    fontSize: 13,
    color: "#E65100",
    fontWeight: "500",
    marginBottom: 4,
  },
  courtDate: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },
  
  // Embassy Alerts
  embassyCard: {
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  embassyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  embassyIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  embassyLocation: {
    fontSize: 16,
    fontWeight: "600",
  },
  embassyType: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#E65100",
    marginBottom: 6,
  },
  embassyReason: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
  embassyWait: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  embassyAlternatives: {
    fontSize: 13,
    color: "#2E86AB",
    fontStyle: "italic",
  },
  
  // Calendar
  upcomingCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  upcomingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  upcomingDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  upcomingDays: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#666",
  },
  upcomingTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
  },
  upcomingImpact: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  upcomingAction: {
    fontSize: 13,
    color: "#2E86AB",
    fontStyle: "italic",
  },
  
  // Empty State
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  
  // Meta
  lastUpdated: {
    textAlign: "center",
    fontSize: 11,
    color: "#999",
    marginTop: 30,
    marginBottom: 20,
  },
});