// src/components/DataUpdateBadge.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";

/**
 * DataUpdateBadge
 *
 * Props:
 * - label (string)         -> e.g. "Fees", "Processing Times"
 * - lastUpdated (string)   -> e.g. "December 13, 2024"
 */
export default function DataUpdateBadge({
  label = "Data",
  lastUpdated,
}) {
  if (!lastUpdated) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {label}: {lastUpdated}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    backgroundColor: "#eef1f6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  text: {
    fontSize: 11,
    color: "#555",
  },
});
