// src/components/AlertBanner.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";

const COLORS = {
  info: "#e3f2fd",
  warning: "#fff8e1",
  alert: "#fdecea",
};

export default function AlertBanner({ severity = "info", message }) {
  if (!message) return null;

  return (
    <View style={[styles.container, { backgroundColor: COLORS[severity] }]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
  },
  text: {
    fontSize: 13,
    color: "#333",
  },
});
