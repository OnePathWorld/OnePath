// src/components/TimelineCalculator.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  getProcessingTime,
  formatProcessingTime,
  PROCESSING_TIMES_META,
} from "../data/processingTimes";

/**
 * TimelineCalculator
 *
 * Props:
 * - processingKey (string)  -> e.g. "H1B", "I130_PREF"
 * - country (string)        -> e.g. "India", "Mexico"
 * - category (string|null)  -> e.g. "F1", "F4" (family pref only)
 * - usePremium (boolean)
 * - includePriorityWait (boolean)
 */
export default function TimelineCalculator({
  processingKey,
  country = "default",
  category = null,
  usePremium = false,
  includePriorityWait = true,
}) {
  const data = getProcessingTime(processingKey);

  if (!data) {
    return (
      <Text style={styles.fallback}>
        Timeline varies based on individual circumstances.
      </Text>
    );
  }

  let mainTimeline = "";
  let priorityTimeline = null;

  // -------------------------
  // MAIN PROCESSING TIME
  // -------------------------
  if (usePremium && data.premium) {
    mainTimeline = formatProcessingTime(data.premium);
  } else if (data.regular) {
    mainTimeline = formatProcessingTime(data.regular);
  }

  // -------------------------
  // PRIORITY DATE (FAMILY / EB)
  // -------------------------
  if (
    includePriorityWait &&
    data.subjectToVisaBulletin &&
    data.categoryWaits &&
    category
  ) {
    const wait = data.categoryWaits[category];

    if (wait) {
      priorityTimeline = `${wait.minYears}–${wait.maxYears}+ years`;
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estimated Timeline</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Processing time</Text>
        <Text style={styles.value}>{mainTimeline}</Text>
      </View>

      {priorityTimeline && (
        <View style={styles.row}>
          <Text style={styles.label}>Visa availability wait</Text>
          <Text style={styles.value}>{priorityTimeline}</Text>
        </View>
      )}

      <Text style={styles.updated}>
        Last updated: {PROCESSING_TIMES_META.lastUpdated}
      </Text>

      <Text style={styles.disclaimer}>
        Timelines are estimates and may vary by country, workload, and case
        complexity.
      </Text>
    </View>
  );
}

// -------------------------
// Styles
// -------------------------

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8f9fb",
    marginTop: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: "#444",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
  },
  updated: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
  },
  disclaimer: {
    marginTop: 6,
    fontSize: 11,
    color: "#888",
  },
  fallback: {
    fontSize: 13,
    color: "#666",
    padding: 12,
  },
});
