// src/screens/PathwayDetailScreen.js

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
import { useTranslation } from "react-i18next";

// Data
import { pathwaysData } from "../data/immigrationData";
import { FEES_LAST_UPDATED } from "../data/fees";
import { PROCESSING_TIMES_META } from "../data/processingTimes";
import { getWarningsFor } from "../constants/immigrationWarnings";
import {
  PATHWAY_VIABILITY,
  PATHWAY_TO_VIABILITY_MAP,
  getViability,
  getViabilityMeta,
} from "../data/pathwayViability";
import { getVisaDetails } from "../data/visaDetails";

// Components
import TimelineCalculator from "../components/TimelineCalculator";
import FeeCalculator from "../components/FeeCalculator";
import DataUpdateBadge from "../components/DataUpdateBadge";
import AlertBanner from "../components/AlertBanner";
import ViabilityBadge from "../components/ViabilityBadge";
import analytics, { EVENTS } from "../utils/analytics";

const PathwayDetailScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const pathway = route?.params?.pathway;
  const pathwayData = pathway ? pathwaysData[pathway.id] : null;
  const [detailModal, setDetailModal] = useState(null);

  if (!pathwayData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>
            {t("pathwayDetailScreen.errorTitle")}
          </Text>
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
          t("pathwayDetailScreen.formLinkErrors.cantOpenTitle"),
          t("pathwayDetailScreen.formLinkErrors.cantOpenBody", { formName }),
          [{ text: t("pathwayDetailScreen.formLinkErrors.ok") }]
        );
      });
    } else {
      Alert.alert(
        formName,
        t("pathwayDetailScreen.formLinkErrors.noLinkBody"),
        [{ text: t("pathwayDetailScreen.formLinkErrors.ok") }]
      );
    }
  };

  const showImmediateRelativeInfo = () => {
    Alert.alert(
      t("pathwayDetailScreen.immediateRelativeAlert.dialogTitle"),
      t("pathwayDetailScreen.immediateRelativeAlert.dialogBody"),
      [
        {
          text: t("pathwayDetailScreen.immediateRelativeAlert.gotIt"),
          style: "default",
        },
      ]
    );
  };

  const showCitizenshipInfo = () => {
    Alert.alert(
      t("pathwayDetailScreen.citizenshipAlert.dialogTitle"),
      t("pathwayDetailScreen.citizenshipAlert.dialogBody"),
      [
        {
          text: t("pathwayDetailScreen.immediateRelativeAlert.gotIt"),
          style: "default",
        },
      ]
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
            <Text style={styles.viabilitySectionTitle}>
              {t("pathwayDetailScreen.currentViability")}
            </Text>
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
              {getViabilityMeta().disclaimer}
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
                {t("pathwayDetailScreen.immediateRelativeAlert.bannerTitle")}
              </Text>
              <Text style={styles.immediateRelativeText}>
                {t("pathwayDetailScreen.immediateRelativeAlert.bannerText")}
              </Text>
            </View>
            <Text style={styles.immediateRelativeArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* CITIZENSHIP EXPLAINER BANNER */}
        {pathway.id === "citizenship" && (
          <TouchableOpacity
            style={styles.citizenshipBanner}
            onPress={showCitizenshipInfo}
          >
            <Text style={styles.citizenshipBannerIcon}>🇺🇸</Text>
            <View style={styles.immediateRelativeContent}>
              <Text style={styles.citizenshipBannerTitle}>
                {t("pathwayDetailScreen.citizenshipAlert.bannerTitle")}
              </Text>
              <Text style={styles.immediateRelativeText}>
                {t("pathwayDetailScreen.citizenshipAlert.bannerText")}
              </Text>
            </View>
            <Text style={styles.immediateRelativeArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* OVERVIEW */}
        <View style={styles.overviewCard}>
          <Text style={styles.sectionTitle}>
            {t("pathwayDetailScreen.overview")}
          </Text>
          <Text style={styles.overviewText}>{pathwayData.overview}</Text>
        </View>

        {/* DATA BADGES */}
        <View style={styles.badgeRow}>
          <DataUpdateBadge
            label={t("pathwayDetailScreen.processingTimes")}
            lastUpdated={PROCESSING_TIMES_META.lastUpdated}
          />
          <DataUpdateBadge
            label={t("pathwayDetailScreen.governmentFees")}
            lastUpdated={FEES_LAST_UPDATED}
          />
        </View>

        {/* VISA OPTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {pathway.id === "citizenship"
              ? t("pathwayDetailScreen.visaCategoriesTitle.citizenship")
              : t("pathwayDetailScreen.visaCategoriesTitle.default")}
          </Text>

          {Object.values(pathwayData.categories).map((visa, index) => {
          const details = getVisaDetails(visa.key);
            const warnings = visa.key ? getWarningsFor(visa.key) : [];

            return (
              <View key={index} style={styles.visaCard}>
                {/* HEADER ROW */}
                <View style={styles.visaHeaderRow}>
                  <Text style={styles.visaName}>
                    {details?.fullName || visa.name}
                  </Text>
                  {pathway.id === "citizenship" ? (
                    <View style={styles.citizenBadge}>
                      <Text style={styles.citizenBadgeText}>
                        {t("pathwayDetailScreen.ucBadge")}
                      </Text>
                    </View>
                  ) : (
                    details?.pathToGreenCard && (
                      <View style={styles.greenCardBadge}>
                        <Text style={styles.greenCardBadgeText}>
                          {t("pathwayDetailScreen.gcBadge")}
                        </Text>
                      </View>
                    )
                  )}
                </View>

                {/* INLINE VIABILITY BADGE — uses raw VISA_DETAILS-style viabilityKey
                    which we no longer maintain in this screen. The original
                    looked up details.viabilityKey; that field is no longer
                    present on the inflated visa details (intentional — it's
                    a stable mapping, not user-facing content). The inline
                    ViabilityBadge below works off visa.key directly which is
                    what PATHWAY_VIABILITY actually uses. */}
                {visa.key && PATHWAY_VIABILITY[visa.key] && (
                  <ViabilityBadge
                    pathwayKey={visa.key}
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
                      <Text style={styles.detailLabel}>
                        {t("pathwayDetailScreen.details.durationLabel")}
                      </Text>
                      <Text style={styles.detailValue}>{details.duration}</Text>
                    </View>
                    {details.currentWait && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          {pathway.id === "citizenship"
                            ? t(
                                "pathwayDetailScreen.details.currentWaitLabel.citizenship"
                              )
                            : t(
                                "pathwayDetailScreen.details.currentWaitLabel.default"
                              )}
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
                            ? t(
                                "pathwayDetailScreen.details.spouseWorkLabel.citizenship"
                              )
                            : t(
                                "pathwayDetailScreen.details.spouseWorkLabel.default"
                              )}
                        </Text>
                        <Text style={styles.detailValue}>
                          {details.spouseWork}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* ELIGIBILITY */}
                {details?.eligibility && details.eligibility.length > 0 && (
                  <View style={styles.requirementsContainer}>
                    <Text style={styles.subLabel}>
                      {pathway.id === "citizenship"
                        ? t("pathwayDetailScreen.eligibilityLabel.citizenship")
                        : t("pathwayDetailScreen.eligibilityLabel.default")}
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
                {details?.pros && details.pros.length > 0 && (
                  <View style={styles.prosConsContainer}>
                    <View style={styles.prosColumn}>
                      <Text style={styles.prosLabel}>
                        {t("pathwayDetailScreen.benefitsLabel")}
                      </Text>
                      {details.pros.map((pro, idx) => (
                        <Text key={idx} style={styles.proItem}>
                          • {pro}
                        </Text>
                      ))}
                    </View>
                    <View style={styles.consColumn}>
                      <Text style={styles.consLabel}>
                        {t("pathwayDetailScreen.considerationsLabel")}
                      </Text>
                      {details.cons.map((con, idx) => (
                        <Text key={idx} style={styles.conItem}>
                          • {con}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}

                {/* FORMS WITH LINKS */}
                {details?.forms && details.forms.length > 0 && (
                  <View style={styles.formsContainer}>
                    <Text style={styles.subLabel}>
                      {t("pathwayDetailScreen.formsLabel")}
                    </Text>
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
                          <Text style={styles.formPurpose}>{form.purpose}</Text>
                          {form.who && (
                            <Text style={styles.formWho}>👤 {form.who}</Text>
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
                      {t("pathwayDetailScreen.greenCardPath.title")}
                    </Text>
                    <Text style={styles.pathText}>
                      {details.pathToGreenCard}
                    </Text>
                    {pathway.id === "work" && visa.key === "H1B" && (
                      <Text style={styles.pathWarning}>
                        {t("pathwayDetailScreen.greenCardPath.h1bIndiaWarning")}
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

                {/* MILITARY FEE NOTE */}
                {pathway.id === "citizenship" && visa.key === "N400_MIL" && (
                  <View style={styles.militaryFeeNote}>
                    <Text style={styles.militaryFeeText}>
                      {t("pathwayDetailScreen.militaryFeeNote")}
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
                ? t("pathwayDetailScreen.buttons.checklistCitizenship")
                : t("pathwayDetailScreen.buttons.checklistDefault")}
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
                ? t("pathwayDetailScreen.buttons.timelineCitizenship")
                : t("pathwayDetailScreen.buttons.timelineDefault")}
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
                ? t("pathwayDetailScreen.buttons.uscisCitizenship")
                : t("pathwayDetailScreen.buttons.uscisDefault")}
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
            {detailModal &&
              (() => {
                const detail = getViability(detailModal);
                if (!detail) return null;
                return (
                  <>
                    <View style={styles.modalHeader}>
                      <View
                        style={[
                          styles.modalDot,
                          { backgroundColor: detail.level?.color },
                        ]}
                      />
                      <Text
                        style={[
                          styles.modalTitle,
                          { color: detail.level?.color },
                        ]}
                      >
                        {detail.level?.label}
                      </Text>
                    </View>

                    <Text style={styles.modalReason}>{detail.shortReason}</Text>

                    <ScrollView style={styles.modalScroll}>
                      <View style={styles.modalDetails}>
                        {detail.details.map((line, idx) => (
                          <View key={idx} style={styles.modalDetailItem}>
                            <Text style={styles.modalBullet}>•</Text>
                            <Text style={styles.modalDetailText}>{line}</Text>
                          </View>
                        ))}
                      </View>

                      {detail.recommendation && (
                        <View style={styles.modalRecommendation}>
                          <Text style={styles.modalRecLabel}>
                            {t("pathwayViability.modal.recommendation")}
                          </Text>
                          <Text style={styles.modalRecText}>
                            {detail.recommendation}
                          </Text>
                        </View>
                      )}

                      <Text style={styles.modalUpdated}>
                        {t("pathwayViability.modal.updated", {
                          date: detail.updatedDate,
                        })}
                      </Text>
                    </ScrollView>
                  </>
                );
              })()}

            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setDetailModal(null)}
            >
              <Text style={styles.modalCloseText}>
                {t("pathwayViability.modal.close")}
              </Text>
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

  errorBox: { padding: 40, alignItems: "center" },
  errorTitle: { fontSize: 18, color: "#666" },

  header: { padding: 20, alignItems: "center", backgroundColor: "#FFF" },
  pathwayIcon: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1A1A1A", textAlign: "center" },

  viabilitySection: { padding: 16, backgroundColor: "#FFF", marginTop: 12 },
  viabilitySectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1A1A1A", marginBottom: 8 },
  viabilityDisclaimer: { fontSize: 11, color: "#999", marginTop: 8, fontStyle: "italic" },

  immediateRelativeCard: {
    backgroundColor: "#FFF8E1",
    margin: 16,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#FFD700",
  },
  immediateRelativeIcon: { fontSize: 22, marginRight: 10 },
  immediateRelativeContent: { flex: 1 },
  immediateRelativeTitle: { fontSize: 14, fontWeight: "700", color: "#5D4037" },
  immediateRelativeText: { fontSize: 12, color: "#5D4037", marginTop: 4, lineHeight: 16 },
  immediateRelativeArrow: { fontSize: 20, color: "#5D4037", marginLeft: 8 },

  citizenshipBanner: {
    backgroundColor: "#E3F2FD",
    margin: 16,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#1565C0",
  },
  citizenshipBannerIcon: { fontSize: 22, marginRight: 10 },
  citizenshipBannerTitle: { fontSize: 14, fontWeight: "700", color: "#1565C0" },

  overviewCard: { backgroundColor: "#FFF", margin: 16, padding: 14, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1A1A1A", marginBottom: 8 },
  overviewText: { fontSize: 13, color: "#444", lineHeight: 19 },

  badgeRow: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 12 },

  section: { padding: 16 },

  visaCard: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  visaHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  visaName: { flex: 1, fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
  greenCardBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  greenCardBadgeText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  citizenBadge: {
    backgroundColor: "#1565C0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  citizenBadgeText: { color: "#FFF", fontSize: 11, fontWeight: "700" },

  visaPurpose: { fontSize: 13, color: "#444", marginVertical: 8, lineHeight: 18 },

  specialNote: {
    backgroundColor: "#FFF8E1",
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  specialNoteText: { fontSize: 12, color: "#5D4037", lineHeight: 17 },

  keyDetails: { marginVertical: 8 },
  detailRow: { flexDirection: "row", paddingVertical: 4 },
  detailLabel: { fontSize: 12, color: "#666", width: 130, fontWeight: "600" },
  detailValue: { flex: 1, fontSize: 12, color: "#1A1A1A" },
  waitTime: { color: "#FF9800", fontWeight: "600" },

  requirementsContainer: { marginVertical: 8 },
  subLabel: { fontSize: 13, fontWeight: "700", color: "#1A1A1A", marginBottom: 6 },
  requirementItem: { flexDirection: "row", paddingVertical: 2 },
  bullet: { color: "#666", marginRight: 6 },
  requirementText: { flex: 1, fontSize: 12, color: "#444", lineHeight: 17 },

  prosConsContainer: { flexDirection: "row", marginVertical: 8 },
  prosColumn: { flex: 1, paddingRight: 4 },
  consColumn: { flex: 1, paddingLeft: 4 },
  prosLabel: { fontSize: 12, fontWeight: "700", color: "#388E3C", marginBottom: 4 },
  consLabel: { fontSize: 12, fontWeight: "700", color: "#FF9800", marginBottom: 4 },
  proItem: { fontSize: 11, color: "#1B5E20", marginBottom: 2, lineHeight: 16 },
  conItem: { fontSize: 11, color: "#E65100", marginBottom: 2, lineHeight: 16 },

  formsContainer: { marginVertical: 8 },
  formItem: {
    backgroundColor: "#F5F5F5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  formInfo: { flex: 1 },
  formName: { fontSize: 13, fontWeight: "600", color: "#2E86AB" },
  formPurpose: { fontSize: 11, color: "#666", marginTop: 2 },
  formWho: { fontSize: 11, color: "#1976D2", marginTop: 2 },

  pathContainer: {
    backgroundColor: "#E8F5E9",
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  pathLabel: { fontSize: 12, fontWeight: "700", color: "#1B5E20", marginBottom: 4 },
  pathText: { fontSize: 12, color: "#2E7D32", lineHeight: 17 },
  pathWarning: { fontSize: 11, color: "#E65100", marginTop: 6, fontWeight: "600" },

  militaryFeeNote: {
    backgroundColor: "#E8F5E9",
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  militaryFeeText: { fontSize: 12, color: "#1B5E20", fontWeight: "600" },

  buttonContainer: { padding: 16 },
  primaryButton: {
    backgroundColor: "#2E86AB",
    padding: 16,
    borderRadius: 25,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 25,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#2E86AB",
  },
  secondaryButtonText: {
    color: "#2E86AB",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  tertiaryButton: { padding: 14, alignItems: "center" },
  tertiaryButtonText: { color: "#666", fontSize: 14 },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  modalDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  modalReason: { fontSize: 14, color: "#1A1A1A", marginBottom: 12, lineHeight: 20 },
  modalScroll: { maxHeight: 400 },
  modalDetails: { marginBottom: 12 },
  modalDetailItem: { flexDirection: "row", paddingVertical: 4 },
  modalBullet: { color: "#666", marginRight: 8 },
  modalDetailText: { flex: 1, fontSize: 13, color: "#444", lineHeight: 18 },
  modalRecommendation: {
    backgroundColor: "#E8F4F8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalRecLabel: { fontSize: 12, fontWeight: "700", color: "#2E86AB", marginBottom: 4 },
  modalRecText: { fontSize: 13, color: "#1A1A1A", lineHeight: 18 },
  modalUpdated: { fontSize: 11, color: "#999", fontStyle: "italic", textAlign: "center" },
  modalClose: {
    marginTop: 12,
    padding: 14,
    backgroundColor: "#2E86AB",
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
});