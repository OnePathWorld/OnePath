// src/components/ViabilityBadge.js
// Created: March 2026
// Displays a viability label (High / Conditional / Lower) for immigration pathways

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { getViability } from "../data/pathwayViability";

/**
 * ViabilityBadge
 *
 * Props:
 * - pathwayKey (string)       -> e.g. "H1B", "L1", "IMMEDIATE_RELATIVE"
 * - showReason (boolean)      -> show the short reason text (default: true)
 * - onPress (function|null)   -> optional tap handler for expanded details
 * - compact (boolean)         -> smaller badge for inline use (default: false)
 */
export default function ViabilityBadge({
  pathwayKey,
  showReason = true,
  onPress = null,
  compact = false,
}) {
  const { t } = useTranslation();
  const assessment = getViability(pathwayKey);
  if (!assessment) return null;
  const level = assessment.level;
  if (!level) return null;

  const Wrapper = onPress ? TouchableOpacity : View;

  if (compact) {
    return (
      <Wrapper
        onPress={onPress}
        style={[
          styles.compactBadge,
          { backgroundColor: level.bgColor, borderColor: level.color },
        ]}
      >
        <Text style={[styles.compactLabel, { color: level.color }]}>
          {level.label}
        </Text>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      onPress={onPress}
      style={[styles.container, { backgroundColor: level.bgColor }]}
    >
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: level.color }]} />
        <Text style={[styles.label, { color: level.color }]}>
          {level.label}
        </Text>
      </View>

      {showReason && (
        <Text style={styles.reason}>{assessment.shortReason}</Text>
      )}

      {onPress && (
        <Text style={styles.tapHint}>{t("viabilityBadge.tapHint")}</Text>
      )}

      <Text style={styles.updated}>
        {t("viabilityBadge.updated", { date: assessment.updatedDate })}
      </Text>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  reason: {
    fontSize: 13,
    color: "#444",
    marginTop: 4,
    lineHeight: 18,
  },
  tapHint: {
    fontSize: 11,
    color: "#888",
    marginTop: 6,
  },
  updated: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
  },

  // Compact variant
  compactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  compactLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});