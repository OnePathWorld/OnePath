// src/components/FeeCalculator.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { FEES, FEES_LAST_UPDATED } from "../data/fees";

export default function FeeCalculator({ formKeys = [], context = {} }) {
  const { t } = useTranslation();

  /**
   * context example:
   * {
   *   filingMethod: "online",
   *   employerSize: "standard",
   *   asylumApplicant: false,
   *   includeH1BFee: false,
   * }
   */

  let minTotal = 0;
  let maxTotal = 0;

  const breakdown = formKeys.map((key) => {
    const form = FEES[key];
    if (!form) return null;

    let fee = 0;
    let range = null;
    let note = null;

    // Handle common patterns
    if (form.feesUSD?.online && context.filingMethod === "online") {
      fee = form.feesUSD.online;
    } else if (form.feesUSD?.paper) {
      fee = form.feesUSD.paper;
    } else if (Array.isArray(form.feesUSD?.asyleesRange)) {
      range = form.feesUSD.asyleesRange;
    } else if (form.feesUSD?.standard) {
      fee = form.feesUSD.standard;
    } else if (form.feesUSD?.standardEmployer) {
      fee = form.feesUSD.standardEmployer;
    }

    // Check for recently changed fees
    if (form.previousFee && form.effectiveDate) {
      note = t("feeCalculator.feeUpdatedNote", {
        date: form.effectiveDate,
        previous: form.previousFee.toLocaleString(),
      });
    }

    if (range) {
      minTotal += range[0];
      maxTotal += range[1];
    } else {
      minTotal += fee;
      maxTotal += fee;
    }

    return {
      form: form.form,
      name: form.name,
      tooltip: form.tooltip,
      fee,
      range,
      note,
      timeframe: form.timeframe || null,
      category: form.category,
    };
  });

  // Filter valid items
  const validBreakdown = breakdown.filter(Boolean);

  // Check if any premium processing items are included
  const hasPremium = validBreakdown.some((item) => item.category === "premium");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("feeCalculator.title")}</Text>

      {validBreakdown.map((item, idx) => (
        <View key={idx}>
          <View style={styles.row}>
            <View style={styles.formInfo}>
              <Text style={styles.formName}>{item.form}</Text>
              {item.timeframe && (
                <Text style={styles.timeframe}>{item.timeframe}</Text>
              )}
            </View>
            <Text
              style={[styles.amount, item.fee >= 10000 && styles.highAmount]}
            >
              {item.range
                ? `$${item.range[0].toLocaleString()}–$${item.range[1].toLocaleString()}`
                : `$${item.fee.toLocaleString()}`}
            </Text>
          </View>
          {item.note && <Text style={styles.feeNote}>{item.note}</Text>}
        </View>
      ))}

      <View style={styles.total}>
        <Text style={styles.totalLabel}>{t("feeCalculator.totalLabel")}</Text>
        <Text style={styles.totalAmount}>
          {minTotal === maxTotal
            ? `$${minTotal.toLocaleString()}`
            : `$${minTotal.toLocaleString()}–$${maxTotal.toLocaleString()}`}
        </Text>
      </View>

      <Text style={styles.updated}>
        {t("feeCalculator.lastUpdated", { date: FEES_LAST_UPDATED })}
      </Text>

      <Text style={styles.disclaimer}>
        {hasPremium
          ? t("feeCalculator.disclaimerWithPremium")
          : t("feeCalculator.disclaimer")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8f9fb",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  formInfo: {
    flex: 1,
    marginRight: 12,
  },
  formName: {
    fontSize: 14,
  },
  timeframe: {
    fontSize: 11,
    color: "#2E86AB",
    marginTop: 1,
  },
  amount: {
    fontSize: 14,
    fontWeight: "500",
  },
  highAmount: {
    color: "#D32F2F",
    fontWeight: "700",
  },
  feeNote: {
    fontSize: 11,
    color: "#888",
    marginBottom: 6,
    marginTop: -2,
    fontStyle: "italic",
  },
  total: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
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
});