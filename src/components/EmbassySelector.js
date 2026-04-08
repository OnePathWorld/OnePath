// src/components/EmbassySelector.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  EMBASSY_WAITS,
  EMBASSY_WAITS_META,
} from "../data/embassyWaits";

/**
 * EmbassySelector
 *
 * Props:
 * - visaType (string)   -> e.g. "F1", "H1B", "B1B2"
 * - country (string)    -> e.g. "India", "Mexico"
 */
export default function EmbassySelector({
  visaType,
  country,
}) {
  const embassies =
    EMBASSY_WAITS?.[visaType]?.[country] ||
    EMBASSY_WAITS?.[visaType]?.default ||
    [];

  if (!embassies.length) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>
          Embassy appointment wait time data is not available for this visa and
          country.
        </Text>
      </View>
    );
  }

  // Sort by shortest wait
  const sorted = [...embassies].sort((a, b) => a.days - b.days);
  const fastest = sorted[0];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Embassy Appointment Estimates</Text>

      <View style={styles.highlight}>
        <Text style={styles.highlightLabel}>Fastest option</Text>
        <Text style={styles.highlightValue}>
          {fastest.city} — ~{fastest.days} days
        </Text>
      </View>

      <View style={styles.list}>
        {sorted.map((e, idx) => (
          <View key={idx} style={styles.row}>
            <Text style={styles.city}>{e.city}</Text>
            <Text style={styles.days}>~{e.days} days</Text>
          </View>
        ))}
      </View>

      <Text style={styles.updated}>
        Last updated: {EMBASSY_WAITS_META.lastUpdated}
      </Text>

      <Text style={styles.disclaimer}>
        Appointment availability may vary and does not guarantee interview
        scheduling.
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
  highlight: {
    backgroundColor: "#eef4ff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  highlightLabel: {
    fontSize: 12,
    color: "#555",
  },
  highlightValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  list: {
    marginTop: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  city: {
    fontSize: 14,
  },
  days: {
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
    padding: 14,
  },
  fallbackText: {
    fontSize: 13,
    color: "#666",
  },
});
