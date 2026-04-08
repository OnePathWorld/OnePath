import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  RESOURCES,
  RESOURCE_CATEGORIES,
  RESOURCES_META,
  EMERGENCY_RESOURCES,
} from "../data/resources";
import DataUpdateBadge from "../components/DataUpdateBadge";
import { calculateH1BCost } from "../data/h1bCapData";
import { meetsWageRequirement } from "../data/prevailingWages";

const ResourcesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredResources = RESOURCES.filter((resource) => {
    const matchesCategory =
      selectedCategory === "all" ||
      resource.category === selectedCategory;

    const matchesSearch =
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleCall = (phone) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleWebsite = (url) => {
    Linking.openURL(url);
  };

  // Calculator functions
  const showH1BCostCalculator = () => {
    const cost = calculateH1BCost({
      companySize: 50,
      percentageOnH1BOrL: 30,
      filedAfterSept21_2025: true,
      premiumProcessing: true,
    });

    Alert.alert(
      "💰 H-1B Cost Calculator",
      `Total Estimated Cost: $${cost.total.toLocaleString()}\n\n` +
      `Breakdown:\n` +
      `• Registration: $${cost.breakdown.registration}\n` +
      `• Filing: $${cost.breakdown.filing}\n` +
      `• Fraud Prevention: $${cost.breakdown.fraudPrevention}\n` +
      `• Competitiveness: $${cost.breakdown.competitiveness}\n` +
      `• Presidential Fee: $${cost.breakdown.presidentialFee.toLocaleString()}\n` +
      `• Premium Processing: $${cost.breakdown.premium}\n\n` +
      `⚠️ Presidential fee applies after Sept 21, 2025`,
      [{ text: "OK" }]
    );
  };

  const showWageChecker = () => {
    const result = meetsWageRequirement(
      85000, // offered salary
      "Software Developer",
      "Miami-Fort Lauderdale, FL",
      1 // Level 1
    );

    if (result) {
      Alert.alert(
        "💼 Wage Requirement Check",
        result.meets 
          ? `✅ Salary MEETS requirement\n\n` +
            `Offered: $${(85000).toLocaleString()}\n` +
            `Required: $${result.required.toLocaleString()}\n` +
            `Difference: +$${result.difference.toLocaleString()}\n` +
            `Level: ${result.level}`
          : `❌ Salary BELOW requirement\n\n` +
            `Offered: $${(85000).toLocaleString()}\n` +
            `Required: $${result.required.toLocaleString()}\n` +
            `Shortfall: $${Math.abs(result.difference).toLocaleString()}\n` +
            `Level: ${result.level}`,
        [{ text: "OK" }]
      );
    }
  };

  const showTimelineCalculator = () => {
    Alert.alert(
      "⏱️ Timeline Calculator",
      "Example: Family-Based (Immediate Relative)\n\n" +
      "• I-130 Processing: 50 months\n" +
      "• NVC Processing: 2-3 months\n" +
      "• Embassy Interview: 2-12 months\n" +
      "• Total: ~58 months (5 years)\n\n" +
      "For personalized timeline, use Timeline Visualizer",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Open Timeline", 
          onPress: () => navigation.navigate("Timeline") 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Resources & Tools</Text>
          <Text style={styles.subtitle}>
            Official information and calculators
          </Text>

          <DataUpdateBadge
            label="Resources"
            lastUpdated={RESOURCES_META.lastUpdated}
          />
        </View>

        {/* CALCULATOR TOOLS */}
        <View style={styles.toolsSection}>
          <Text style={styles.toolsTitle}>🧮 Quick Calculators</Text>
          <View style={styles.toolsGrid}>
            <TouchableOpacity
              style={styles.toolCard}
              onPress={showH1BCostCalculator}
            >
              <Text style={styles.toolIcon}>💰</Text>
              <Text style={styles.toolName}>H-1B Cost</Text>
              <Text style={styles.toolDesc}>With $100k fee</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={showWageChecker}
            >
              <Text style={styles.toolIcon}>💼</Text>
              <Text style={styles.toolName}>Wage Check</Text>
              <Text style={styles.toolDesc}>Prevailing wage</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={showTimelineCalculator}
            >
              <Text style={styles.toolIcon}>⏱️</Text>
              <Text style={styles.toolName}>Timeline</Text>
              <Text style={styles.toolDesc}>Total journey</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => Alert.alert(
                "📊 Priority Date",
                "Check Visa Bulletin for current dates:\n\n" +
                "• Family F4 (siblings): 2001-2008\n" +
                "• India EB-2: May 2013\n" +
                "• India EB-3: Sept 2013\n\n" +
                "Updated monthly on travel.state.gov",
                [{ text: "OK" }]
              )}
            >
              <Text style={styles.toolIcon}>📊</Text>
              <Text style={styles.toolName}>Priority Date</Text>
              <Text style={styles.toolDesc}>Visa bulletin</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* CATEGORIES */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
        >
          {RESOURCE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id &&
                  styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat.id &&
                    styles.categoryTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* OFFICIAL LINKS */}
        <View style={styles.officialCard}>
          <Text style={styles.officialTitle}>🏛️ Official Processing Times</Text>
          <TouchableOpacity
            style={styles.officialLink}
            onPress={() => Linking.openURL("https://egov.uscis.gov/processing-times/")}
          >
            <Text style={styles.officialLinkText}>USCIS Processing Times</Text>
            <Text style={styles.officialLinkArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.officialLink}
            onPress={() => Linking.openURL("https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html")}
          >
            <Text style={styles.officialLinkText}>Visa Bulletin</Text>
            <Text style={styles.officialLinkArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.officialLink}
            onPress={() => Linking.openURL("https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/wait-times.html")}
          >
            <Text style={styles.officialLinkText}>Embassy Wait Times</Text>
            <Text style={styles.officialLinkArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* EMERGENCY */}
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>
            🆘 Emergency Hotlines (24/7)
          </Text>
          {EMERGENCY_RESOURCES.map((r, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.emergencyItem}
              onPress={() => handleCall(r.phone)}
            >
              <Text style={styles.emergencyName}>{r.name}</Text>
              <Text style={styles.emergencyNumber}>{r.phone}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* RESOURCE LIST */}
        <View style={styles.resourcesList}>
          {filteredResources.map((resource) => (
            <View key={resource.id} style={styles.resourceCard}>
              <View style={styles.resourceHeader}>
                <Text style={styles.resourceName}>
                  {resource.name}
                </Text>
                {resource.official && (
                  <Text style={styles.officialBadge}>
                    Official
                  </Text>
                )}
              </View>

              <Text style={styles.resourceDescription}>
                {resource.description}
              </Text>

              <View style={styles.services}>
                {resource.services.map((s, i) => (
                  <Text key={i} style={styles.serviceChip}>
                    {s}
                  </Text>
                ))}
              </View>

              <View style={styles.actions}>
                {resource.phone && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleCall(resource.phone)}
                  >
                    <Text>📞 Call</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleWebsite(resource.website)}
                >
                  <Text>🌐 Website</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* DISCLAIMER */}
        <Text style={styles.disclaimer}>
          {RESOURCES_META.disclaimer}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResourcesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    padding: 20,
    backgroundColor: "#FFF",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },

  // Calculator Tools
  toolsSection: {
    padding: 20,
  },
  toolsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  toolCard: {
    width: "48%",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  toolIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  toolName: {
    fontSize: 14,
    fontWeight: "600",
  },
  toolDesc: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },

  // Official Links
  officialCard: {
    backgroundColor: "#E8F4F8",
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  officialTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  officialLink: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#D1E9F1",
  },
  officialLinkText: {
    fontSize: 14,
    color: "#2E86AB",
    fontWeight: "500",
  },
  officialLinkArrow: {
    fontSize: 16,
    color: "#2E86AB",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 25,
    height: 45,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },

  categories: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  categoryChipActive: {
    backgroundColor: "#2E86AB",
    borderColor: "#2E86AB",
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
  },
  categoryTextActive: {
    color: "#FFF",
  },

  emergencyCard: {
    backgroundColor: "#FFEBEE",
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#C62828",
    marginBottom: 10,
  },
  emergencyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  emergencyName: {
    fontSize: 14,
    fontWeight: "500",
  },
  emergencyNumber: {
    fontSize: 14,
    color: "#2E86AB",
    fontWeight: "bold",
  },

  resourcesList: {
    paddingHorizontal: 20,
  },
  resourceCard: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  resourceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  officialBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    color: "#1976D2",
    fontWeight: "600",
  },
  resourceDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  services: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  serviceChip: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  disclaimer: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    padding: 20,
  },
});