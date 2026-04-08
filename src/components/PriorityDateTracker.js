// src/components/PriorityDateTracker.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { VISA_BULLETIN } from "../data/visaBulletin";

/**
 * PriorityDateTracker
 *
 * Props:
 * - category (string)        -> e.g. "F1", "F4", "EB2"
 * - country (string)         -> e.g. "India", "Mexico"
 * - priorityDate (string)    -> YYYY-MM-DD
 */
export default function PriorityDateTracker({
  category,
  country = "default",
  priorityDate,
}) {
  if (!priorityDate || !category) {
    return (
      <Text style={styles.fallback}>
        Priority date information not available.
      </Text>
    );
  }

  const bulletinCategory = VISA_BULLETIN?.categories?.[category];
  if (!bulletinCategory) {
    return (
      <Text style={styles.fallback}>
        Visa bulletin data not available for this category.
      </Text>
    );
  }

  const cutoff =
    bulletinCategory[country] || bulletinCategory.default;

  if (!cutoff) {
    return (
      <Text style={styles.fallback}>
        Country-specific cutoff date not available.
      </Text>
    );
  }

  const userDate = new Date(priorityDate);
  const cutoffDate = new Date(cutoff);

  const isCurrent = userDate <= cutoffDate;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visa Availability</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Your priority date</Text>
        <Text style={styles.value}>{priorityDate}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Current cutoff date</Text>
        <Text style={styles.value}>{cutoff}</Text>
      </View>

      <View style={styles.statusRow}>
        <Text
          style={[
            styles.status,
            isCurrent ? styles.current : styles.backlogged,
          ]}
        >
          {isCurrent ? "Current" : "Not current"}
        </Text>
      </View>

      {!isCurrent && (
        <Text style={styles.warning}>
          Your category is currently backlogged. Movement depends on annual visa
          limits and demand.
        </Text>
      )}

      <Text style={styles.updated}>
        Visa Bulletin: {VISA_BULLETIN.lastUpdated}
      </Text>

      <Text style={styles.disclaimer}>
        This information is based on the U.S. Department of State Visa Bulletin
        and does not guarantee visa availability.
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
  statusRow: {
    marginTop: 10,
    marginBottom: 6,
  },
  status: {
    fontSize: 15,
    fontWeight: "700",
  },
  current: {
    color: "#2e7d32",
  },
  backlogged: {
    color: "#c62828",
  },
  warning: {
    marginTop: 6,
    fontSize: 13,
    color: "#b71c1c",
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
