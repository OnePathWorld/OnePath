import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

// Import data
import { PROCESSING_TIMES_META } from "../data/processingTimes";
import {
  checkCriticalDates,
  calculateHealthScore,
  getUserProfile,
} from "../data/userProfile";
import { checkPolicyUpdates } from "../data/policyTracker";
import {
  getViability,
  getLevel,  
  PATHWAY_TO_VIABILITY_MAP,
} from "../data/pathwayViability";

// Centralized labels (replaces local getVisaLabel/getExpiryLabel/getGCYearsLabel)
import {
  getVisaLabelShort,
  getExpiryLabel,
  getGCYearsLabel,
  getLocationLabel,
} from "../utils/labels";

// Analytics
import analytics, { EVENTS } from "../utils/analytics";
import { getTrackedCases } from "../utils/caseStorage";
import { classifyCaseStatus } from "../utils/caseGuidance";
import { blendCaseWithProfile } from "../utils/caseProfileBlend";
import {
  getProfileNextAction,
  NEXT_ACTION_VISUALS,
} from "../utils/profileNextAction";
import { useFocusEffect } from "@react-navigation/native";

/**
 * Get a summary viability level for a pathway
 * Shows the "best" viability among its sub-pathways
 */
const getPathwaySummaryViability = (pathwayId) => {
    const keys = PATHWAY_TO_VIABILITY_MAP[pathwayId];
    if (!keys || keys.length === 0) return null;
   
    const order = { HIGH: 3, CONDITIONAL: 2, LOWER: 1 };
    let best = null;
    let bestScore = 0;
   
    for (const key of keys) {
      const assessment = getViability(key);
      if (assessment && order[assessment.viability] > bestScore) {
        bestScore = order[assessment.viability];
        best = assessment.viability;
      }
    }
    return best ? getLevel(best) : null;
  };

/**
 * Case-alert tone by urgency.
 *
 * The dashboard alert now ALWAYS renders for the top tracked case — a tracked
 * case is the reason the user came back, so urgency drives color/icon/copy
 * rather than presence. A routine "received" case reads calm (green), an
 * upcoming interview reads as preparation (blue), and only an RFE/denial reads
 * as an alarm (red).
 */
const CASE_ALERT_VISUALS = {
  action: { bg: "#FFEBEE", icon: "🚨", key: "home.alerts.case.action" },
  prepare: { bg: "#E3F2FD", icon: "📋", key: "home.alerts.case.prepare" },
  monitor: { bg: "#E8F5E9", icon: "✅", key: "home.alerts.case.monitor" },
};

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const [userProfile, setUserProfile] = useState(null);
  const [criticalWarnings, setCriticalWarnings] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [policyAlerts, setPolicyAlerts] = useState(0);
  const [caseAlert, setCaseAlert] = useState(null);
  const [checkedItems, setCheckedItems] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    analytics.track(EVENTS.SESSION_START);
  }, []);

  // Fire the profile-invite impression once, when a no-profile
  // (track-before-onboard) user lands on Home after load completes. Guarded on
  // `loaded` so it never fires during the initial null-profile load window.
  useEffect(() => {
    if (loaded && !userProfile) {
      analytics.track(EVENTS.PROFILE_INVITE_SHOWN);
    }
  }, [loaded, userProfile]);

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [])
  );

  const loadAllData = async () => {
    try {
      const v2Profile = await AsyncStorage.getItem("@userProfile_v2");
      const profile = v2Profile ? JSON.parse(v2Profile) : null;

      if (profile) {
        setUserProfile(profile);

        const warnings = await checkCriticalDates();
        setCriticalWarnings(warnings);
        const score = await calculateHealthScore();
        setHealthScore(score);

        const policyImpact = await checkPolicyUpdates();
        setPolicyAlerts(policyImpact.totalAlerts || 0);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }

    try {
      const keys = await AsyncStorage.getAllKeys();
      const checklistKeys = keys.filter((k) =>
        k.startsWith("@checklist_progress_")
      );

      let checked = 0;
      let total = 0;

      for (const key of checklistKeys) {
        const data = JSON.parse((await AsyncStorage.getItem(key)) || "{}");
        const values = Object.values(data);
        total += values.length;
        checked += values.filter(Boolean).length;
      }

      setCheckedItems(checked);
      setTotalItems(total);
    } catch (err) {
      console.error("Failed to load progress:", err);
    }

    // Case-status seam. Reduces all tracked cases to at most ONE dashboard
    // alert: the highest-urgency case, most-recently-updated as the tiebreak.
    //
    // This previously filtered to `action` urgency ONLY, which meant the
    // dashboard said NOTHING for the most common case state by far — a normal
    // pending case sits in received/under_review (urgency `monitor`) for
    // months. A user who added their case and returned to a silent dashboard
    // had no reason to come back, the exact opposite of the retention hook the
    // tracker is meant to be. The top case now always surfaces; urgency drives
    // TONE (color/icon/copy via CASE_ALERT_VISUALS), not presence.
    //
    // Ownership (isSelf) deliberately does NOT filter here: a case tracked for
    // a spouse or child still matters to the user, and the alert itself is
    // case-only — it says nothing about them. isSelf gates only the
    // personalized blend line below, which would be wrong on someone else's
    // case. Own try/catch so a case-load failure can never blank the rest of
    // the dashboard.
    try {
      const parseTime = (d) => {
        const ms = d ? Date.parse(d) : NaN;
        return Number.isNaN(ms) ? 0 : ms;
      };
      const URGENCY_RANK = { action: 0, prepare: 1, monitor: 2 };
      const rankOf = (u) => (u in URGENCY_RANK ? URGENCY_RANK[u] : 2);

      const tracked = (await getTrackedCases()) || [];
      const ranked = tracked
        .filter((c) => c && c.snapshot)
        .map((c) => ({ entry: c, interp: classifyCaseStatus(c.snapshot) }))
        .sort((a, b) => {
          const ua = rankOf(a.interp.urgency);
          const ub = rankOf(b.interp.urgency);
          if (ua !== ub) return ua - ub;
          return (
            parseTime(b.entry.snapshot.modifiedDate) -
            parseTime(a.entry.snapshot.modifiedDate)
          );
        });

      if (ranked.length > 0) {
        const top = ranked[0];

        // Profile blending is quarantined to the dashboard AND gated on
        // explicit ownership. Only a case the user confirmed is their own
        // (isSelf === true) is personalized; legacy/unknown/someone-else's
        // cases still show the alert, just without a note about the wrong
        // person. Best-effort: a blend failure must never break the alert.
        let blendKey = null;
        let blendValues = {};
        if (top.entry.isSelf === true) {
          try {
            const profile = await getUserProfile();
            const blend = blendCaseWithProfile(
              top.interp.category,
              profile,
              top.entry.snapshot?.formNumber
            );
            if (blend) {
              blendKey = blend.templateKey;
              blendValues = blend.values;
            }
          } catch (e) {
            console.warn("case blend skipped:", e.message);
          }
        }

        setCaseAlert({
          type: "case",
          receiptNumber: top.entry.receiptNumber,
          label: top.entry.nickname || top.entry.receiptNumber,
          category: top.interp.category,
          urgency: top.interp.urgency || "monitor",
          blendKey,
          blendValues,
        });
      } else {
        setCaseAlert(null);
      }
    } catch (err) {
      console.error("Failed to load case alert:", err);
    }

    // Signals load completion so the no-profile invite can distinguish
    // "still loading" from "genuinely has no profile" and never flashes
    // mid-load for an onboarded user.
    setLoaded(true);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("home.greeting.morning");
    if (hour < 17) return t("home.greeting.afternoon");
    return t("home.greeting.evening");
  };

  // The dashboard card now leads with a tailored next action derived from the
  // profile (see profileNextAction), replacing the numeric score AND the vague
  // Good/Attention/Critical grade — the latter keyed on a health score that,
  // absent collected expiry dates, was almost always "Good" regardless. Color +
  // emoji follow the action's urgency so a positive step (e.g. "you may be
  // eligible for citizenship") never reads like an emergency.
  const nextAction = getProfileNextAction(userProfile || {});
  const actionVisuals =
    NEXT_ACTION_VISUALS[nextAction.urgency] || NEXT_ACTION_VISUALS.monitor;

  const getStatusColor = () => actionVisuals.color;

  const getStatusEmoji = () => actionVisuals.emoji;

  const getStatusHeadline = () => t(nextAction.templateKey, nextAction.fallback);

  // =========================================================
  // DASHBOARD SIGNALS — presence decoupled from urgency
  // ---------------------------------------------------------
  // These used to funnel through a single getMostUrgent() reducer that returned
  // exactly ONE item. That was correct while the case alert was `action`-only,
  // and therefore genuinely an urgency signal. It no longer is: the case line
  // now always renders for a tracked case, and its urgency drives TONE, not
  // presence. A `monitor` case explicitly says "nothing to do right now" — so
  // letting it win a most-urgent contest would suppress real information (a
  // policy change) behind an explicit non-event. That's a signal inversion.
  //
  // So the reducer is gone. Each signal is independent and renders in its own
  // slot, in descending severity: critical date warning → case → policy.
  // Nothing suppresses anything, and the case line — the reason a user comes
  // back at all — is reliably present whenever they have a case tracked.
  // =========================================================
  const criticalWarning =
    criticalWarnings.find((w) => w.severity === "critical") || null;

  const hasPolicyAlert = policyAlerts > 0;

  // The GC naturalization nudge is filler: it earns its place only when the
  // card has nothing else to say.
  const hasAnySignal = Boolean(criticalWarning || caseAlert || hasPolicyAlert);

  // One renderer, two mount points (profiled card + no-profile block). The JSX
  // was duplicated; a single source keeps the two from drifting.
  const renderCaseAlert = () => {
    if (!caseAlert) return null;
    const cv =
      CASE_ALERT_VISUALS[caseAlert.urgency] || CASE_ALERT_VISUALS.monitor;
    return (
      <TouchableOpacity
        style={[styles.urgentAlert, { backgroundColor: cv.bg }]}
        onPress={() => navigation.navigate("CaseStatusTracker")}
      >
        <Text style={styles.urgentIcon}>{cv.icon}</Text>
        <View style={styles.urgentTextWrap}>
          <Text style={styles.urgentTextMain}>
            {t(cv.key, { case: caseAlert.label })}
          </Text>
          {caseAlert.blendKey && (
            <Text style={styles.urgentBlendText}>
              {t("caseGuidance.blend.label")}:{" "}
              {t(caseAlert.blendKey, caseAlert.blendValues)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // =========================================================
  // PATHWAYS — citizenship highlighted only for GC holders,
  // but visible to all users as a standard pathway row
  // =========================================================
  const isGCHolder =
    userProfile?.currentVisa === "GC" ||
    userProfile?.purpose === "citizenship";

  const pathways = [
    { id: "work", title: t("home.pathways.work"), icon: "💼", color: "#4CAF50" },
    { id: "family", title: t("home.pathways.family"), icon: "👨‍👩‍👧‍👦", color: "#FF9800" },
    { id: "student", title: t("home.pathways.student"), icon: "🎓", color: "#9C27B0" },
    {
      id: "citizenship",
      title: t("home.pathways.citizenship"),
      icon: "🇺🇸",
      color: "#1565C0",
      // Only highlighted when user is a confirmed GC holder
      isHighlighted: isGCHolder === true && userProfile !== null,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Settings")}
              style={styles.settingsButton}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
          {userProfile?.currentVisa && (
            <Text style={styles.userStatus}>
              {getVisaLabelShort(userProfile.currentVisa)} •{" "}
              {getLocationLabel(userProfile.location)}
            </Text>
          )}
        </View>

        {/* PRIMARY STATUS CARD */}
        {userProfile && (
          <TouchableOpacity
            style={[
              styles.primaryCard,
              { borderTopColor: getStatusColor() },
            ]}
            onPress={() => {
              analytics.track(EVENTS.STATUS_DASHBOARD_VIEWED, {
                source: "home",
              });
              navigation.navigate("StatusDetails", {
                profile: userProfile,
                warnings: criticalWarnings,
                healthScore,
              });
            }}
          >
            <View style={styles.statusHeader}>
              <View style={styles.statusHeaderText}>
                <Text style={styles.statusTitle}>{t("home.status.title")}</Text>
                <Text
                  style={[styles.statusScore, { color: getStatusColor() }]}
                >
                  {getStatusEmoji()} {getStatusHeadline()}
                </Text>
              </View>
            </View>

            {/* 1. Critical date warning — the most severe signal, so it leads.
                   (Only `critical` severity ever reaches here, which is why the
                   icon is unconditional; the old ⚠️ branch was unreachable.) */}
            {criticalWarning && (
              <View style={styles.urgentAlert}>
                <Text style={styles.urgentIcon}>🚨</Text>
                <Text style={styles.urgentText}>{criticalWarning.message}</Text>
              </View>
            )}

            {/* 2. Case line — always present when a case is tracked. Urgency
                   tints it; it is never suppressed by another signal. */}
            {renderCaseAlert()}

            {/* 3. Policy alerts — no longer hidden behind a calm case line. */}
            {hasPolicyAlert && (
              <View style={styles.urgentAlert}>
                <Text style={styles.urgentIcon}>📢</Text>
                <Text style={styles.urgentText}>
                  {t("home.alerts.policyChanges", { count: policyAlerts })}
                </Text>
              </View>
            )}

            {/* GC holder naturalization nudge — filler, only when nothing else */}
            {isGCHolder && !hasAnySignal && (
              <TouchableOpacity
                style={styles.citizenshipNudge}
                onPress={() => {
                  analytics.track(EVENTS.CITIZENSHIP_PATHWAY_VIEWED, {
                    source: "home_nudge",
                    gc_years_held: userProfile?.gcYearsHeld || "unknown",
                  });
                  navigation.navigate("PathwayDetail", {
                    pathway: {
                      id: "citizenship",
                      title: t("home.pathways.citizenship"),
                      icon: "🇺🇸",
                      color: "#1565C0",
                    },
                  });
                }}
              >
                <Text style={styles.urgentIcon}>🇺🇸</Text>
                <Text style={styles.urgentText}>
                  {t("home.alerts.citizenshipNudge")}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.quickStats}>
              {userProfile.expiryTimeline && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>
                    {t("home.stats.visaExpiration")}
                  </Text>
                  <Text
                    style={[
                      styles.statValue,
                      userProfile.expiryTimeline === "expired" &&
                        styles.expiredText,
                    ]}
                  >
                    {getExpiryLabel(userProfile.expiryTimeline)}
                  </Text>
                </View>
              )}
              {/* GC years held shown instead of expiry for GC holders */}
              {userProfile.currentVisa === "GC" &&
                userProfile.gcYearsHeld && (
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>{t("home.stats.gcHeld")}</Text>
                    <Text style={styles.statValue}>
                      {getGCYearsLabel(userProfile.gcYearsHeld)}
                    </Text>
                  </View>
                )}
              {criticalWarnings.length > 0 && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>{t("home.stats.alerts")}</Text>
                  <Text style={styles.statValue}>
                    {criticalWarnings.length}
                  </Text>
                </View>
              )}
              {policyAlerts > 0 && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>{t("home.stats.policies")}</Text>
                  <Text style={styles.statValue}>{policyAlerts}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* NO-PROFILE STATE (track-before-onboard)
            A user who entered via the case tracker has no profile, so the
            profile-gated primary card above is hidden — which would also hide
            their case alert. Re-surface the case here (it's why they came),
            then offer a calm, non-alarming invite to complete the profile.
            Gated on `loaded` so it never flashes during the initial load. */}
        {loaded && !userProfile && (
          <View style={styles.noProfileSection}>
            {renderCaseAlert()}

            <View style={styles.inviteCard}>
              <Text style={styles.inviteTitle}>
                {t("home.profileInvite.title", "Get guidance tailored to you")}
              </Text>
              <Text style={styles.inviteBody}>
                {t(
                  "home.profileInvite.body",
                  "Tell us about your situation to see your pathways, timelines, and what to watch for."
                )}
              </Text>
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={() => {
                  analytics.track(EVENTS.PROFILE_INVITE_TAPPED);
                  navigation.navigate("Onboarding");
                }}
              >
                <Text style={styles.inviteButtonText}>
                  {t("home.profileInvite.cta", "Complete your profile")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* CONTROL CENTER */}
        <View style={styles.controlCenter}>
          <Text style={styles.sectionTitle}>{t("home.controlCenter.title")}</Text>

          <View style={styles.controlGrid}>
            <TouchableOpacity
              style={styles.controlItem}
              onPress={() => {
                analytics.track(EVENTS.POLICY_TRACKER_VIEWED, {
                  source: "home",
                });
                navigation.navigate("PolicyTracker");
              }}
            >
              <Text style={styles.controlIcon}>📢</Text>
              <Text style={styles.controlLabel}>
                {t("home.controlCenter.policyTracker")}
              </Text>
              {policyAlerts > 0 && (
                <View style={styles.controlBadge}>
                  <Text style={styles.badgeText}>{policyAlerts}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlItem}
              onPress={() => {
                analytics.track(EVENTS.CHECKLIST_VIEWED, {
                  source: "home",
                });
                navigation.navigate("Checklist", {
                  pathway: isGCHolder ? "citizenship" : undefined,
                });
              }}
            >
              <Text style={styles.controlIcon}>📋</Text>
              <Text style={styles.controlLabel}>
                {t("home.controlCenter.checklist")}
              </Text>
              {totalItems > 0 && (
                <View style={styles.progressMini}>
                  <View
                    style={[
                      styles.progressMiniFill,
                      { width: `${(checkedItems / totalItems) * 100}%` },
                    ]}
                  />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlItem}
              onPress={() => {
                analytics.track(EVENTS.TIMELINE_VIEWED, {
                  source: "home",
                });
                navigation.navigate("Timeline", {
                  pathway: isGCHolder ? "citizenship" : undefined,
                });
              }}
            >
              <Text style={styles.controlIcon}>📅</Text>
              <Text style={styles.controlLabel}>
                {t("home.controlCenter.timeline")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlItem}
              onPress={() => {
                analytics.track(EVENTS.RESOURCES_VIEWED, {
                  source: "home",
                });
                navigation.navigate("Resources");
              }}
            >
              <Text style={styles.controlIcon}>🔍</Text>
              <Text style={styles.controlLabel}>
                {t("home.controlCenter.resources")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.controlItem}
                onPress={() => {
                    analytics.track("Case Tracker Viewed", { source: "home" });
                    navigation.navigate("CaseStatusTracker");
                }}
                >
                <Text style={styles.controlIcon}>📬</Text>
                <Text style={styles.controlLabel}>
                    {t("home.controlCenter.caseTracker")}
                </Text>
            </TouchableOpacity>


          </View>
        </View>

        {/* PATHWAYS WITH VIABILITY BADGES */}
        <View style={styles.pathwaysSection}>
          <Text style={styles.sectionTitle}>{t("home.pathways.title")}</Text>

          {pathways.map((pw) => {
            const viability = getPathwaySummaryViability(pw.id);

            return (
              <TouchableOpacity
                key={pw.id}
                style={[
                  styles.pathwayRow,
                  pw.isHighlighted && styles.pathwayRowHighlighted,
                ]}
                onPress={() => {
                  analytics.track(EVENTS.PATHWAY_VIEWED, {
                    pathway: pw.id,
                    source: "home",
                  });
                  if (pw.id === "citizenship") {
                    analytics.track(EVENTS.CITIZENSHIP_PATHWAY_VIEWED, {
                      source: "home",
                      gc_years_held: userProfile?.gcYearsHeld || "unknown",
                    });
                  }
                  navigation.navigate("PathwayDetail", { pathway: pw });
                }}
              >
                <Text style={styles.pathwayIcon}>{pw.icon}</Text>
                <View style={styles.pathwayContent}>
                  <Text style={styles.pathwayName}>{pw.title}</Text>
                  {pw.isHighlighted && (
                    <Text style={styles.pathwayNextStep}>
                      {t("home.pathways.yourNextStep")}
                    </Text>
                  )}
                  {viability && !pw.isHighlighted && (
                    <View
                      style={[
                        styles.viabilityPill,
                        {
                          backgroundColor: viability.bgColor,
                          borderColor: viability.color,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.viabilityDot,
                          { backgroundColor: viability.color },
                        ]}
                      />
                      <Text
                        style={[
                          styles.viabilityText,
                          { color: viability.color },
                        ]}
                      >
                        {viability.label}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.pathwayArrow}>›</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* LIFE SETUP */}
        <TouchableOpacity
          style={styles.lifeSetupCard}
          onPress={() => {
            analytics.track(EVENTS.LIFE_SETUP_VIEWED, { source: "home" });
            navigation.navigate("LifeSetup");
          }}
        >
          <Text style={styles.lifeSetupIcon}>🏡</Text>
          <View style={styles.lifeSetupContent}>
            <Text style={styles.lifeSetupTitle}>
              {t("home.lifeSetup.title")}
            </Text>
            <Text style={styles.lifeSetupText}>
              {t("home.lifeSetup.subtitle")}
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* HELP */}
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => {
            analytics.track("Emergency Help Tapped");
            Alert.alert(
              t("home.help.dialogTitle"),
              t("home.help.dialogBody"),
              [
                { text: t("common.cancel"), style: "cancel" },
                { text: t("home.help.callUscis"), onPress: () => {} },
              ]
            );
          }}
        >
          <Text style={styles.helpIcon}>🆘</Text>
          <Text style={styles.helpText}>{t("home.help.title")}</Text>
        </TouchableOpacity>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t("common.dataUpdated", { date: PROCESSING_TIMES_META.lastUpdated })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  greeting: { fontSize: 28, fontWeight: "bold", color: "#1A1A1A" },
  userStatus: { fontSize: 14, color: "#666", marginTop: 4 },

  primaryCard: {
    backgroundColor: "#FFF",
    margin: 20,
    marginTop: 15,
    borderRadius: 16,
    padding: 20,
    borderTopWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  statusTitle: { fontSize: 14, color: "#999", marginBottom: 4 },
  statusScore: { fontSize: 18, fontWeight: "600" },
  statusHeaderText: { flex: 1 },
  urgentAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  citizenshipNudge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8EAF6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  urgentIcon: { fontSize: 20, marginRight: 10 },
  urgentText: { flex: 1, fontSize: 14, color: "#333", fontWeight: "500" },
  // Wrap so the personalized blend line can sit under the main case line
  // inside the same tappable alert. urgentTextMain mirrors urgentText but
  // without flex (the wrap owns the flex now).
  urgentTextWrap: { flex: 1 },
  urgentTextMain: { fontSize: 14, color: "#333", fontWeight: "500" },
  urgentBlendText: { marginTop: 4, fontSize: 13, lineHeight: 18, color: "#5D4037" },
  quickStats: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statLabel: { fontSize: 11, color: "#999", marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: "600", color: "#333" },
  expiredText: { color: "#F44336" },

  // No-profile (track-before-onboard) block: re-surfaced case alert reuses
  // urgentAlert above; the invite is a calm, distinct card (not an alert tint).
  noProfileSection: { marginHorizontal: 20, marginBottom: 20 },
  inviteCard: {
    backgroundColor: "#EDF6FB",
    borderRadius: 12,
    padding: 18,
  },
  inviteTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 6,
  },
  inviteBody: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 14,
  },
  inviteButton: {
    backgroundColor: "#2E86AB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  inviteButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },

  controlCenter: { marginHorizontal: 20, marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1A1A1A",
  },
  controlGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  controlItem: {
    backgroundColor: "#FFF",
    width: "31.5%",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
  },
  controlIcon: { fontSize: 24, marginBottom: 6 },  // was 28, marginBottom: 8
  controlLabel: { fontSize: 12, fontWeight: "500", color: "#333", textAlign: "center" },  // added textAlign
  controlBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#F44336",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: "#FFF", fontSize: 11, fontWeight: "bold" },
  progressMini: {
    width: "100%",
    height: 3,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginTop: 8,
  },
  progressMiniFill: {
    height: 3,
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },

  pathwaysSection: { marginHorizontal: 20, marginBottom: 20 },
  pathwayRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  pathwayRowHighlighted: {
    borderWidth: 2,
    borderColor: "#1565C0",
    backgroundColor: "#F0F4FF",
  },
  pathwayIcon: { fontSize: 24, marginRight: 12 },
  pathwayContent: { flex: 1 },
  pathwayName: { fontSize: 15, fontWeight: "500", color: "#333" },
  pathwayNextStep: {
    fontSize: 11,
    color: "#1565C0",
    fontWeight: "600",
    marginTop: 2,
  },
  viabilityPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 4,
  },
  viabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  viabilityText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  pathwayArrow: { fontSize: 20, color: "#CCC" },

  lifeSetupCard: {
    backgroundColor: "#E8F4F8",
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  lifeSetupIcon: { fontSize: 28, marginRight: 12 },
  lifeSetupContent: { flex: 1 },
  lifeSetupTitle: { fontSize: 15, fontWeight: "600", color: "#2E86AB" },
  lifeSetupText: { fontSize: 13, color: "#5A9FBF", marginTop: 2 },
  arrow: { fontSize: 20, color: "#2E86AB" },

  helpButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 14,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFD6D6",
  },
  helpIcon: { fontSize: 20, marginRight: 8 },
  helpText: { fontSize: 14, fontWeight: "500", color: "#D32F2F" },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingsButton: { padding: 8 },
  settingsIcon: { fontSize: 24 },
  footer: { alignItems: "center", paddingBottom: 20, paddingTop: 10 },
  footerText: { fontSize: 11, color: "#999" },
});