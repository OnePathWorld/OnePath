import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";

// Analytics
import analytics from "./src/utils/analytics";

// Screens
import SplashScreen from "./src/screens/SplashScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import OnboardingSummaryScreen from "./src/screens/OnboardingSummaryScreen";
import PathwayDetailScreen from "./src/screens/PathwayDetailScreen";
import ChecklistScreen from "./src/screens/ChecklistScreen";
import TimelineScreen from "./src/screens/TimelineScreen";
import LifeSetupScreen from "./src/screens/LifeSetupScreen";
import ResourcesScreen from "./src/screens/ResourcesScreen";
import GuideDetailScreen from "./src/screens/GuideDetailScreen";
import StatusDetailsScreen from "./src/screens/StatusDetailsScreen";
import PolicyTrackerScreen from "./src/screens/PolicyTrackerScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

// Navigation
import TabNavigator from "./src/navigation/TabNavigator";

const Stack = createStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [hasLaunched, setHasLaunched] = useState(false);

  useEffect(() => {
    // Initialize analytics
    analytics.init();

    const init = async () => {
      try {
        const stored = await AsyncStorage.getItem("@hasLaunched");
        setHasLaunched(stored === "true");
      } catch (e) {
        console.error("Startup error:", e);
        setHasLaunched(false);
      } finally {
        setIsReady(true);
      }
    };

    init();
  }, []);

  if (!isReady) return <SplashScreen />;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />

        <Stack.Navigator
          initialRouteName={hasLaunched ? "MainApp" : "Onboarding"}
          screenOptions={{
            headerStyle: { backgroundColor: "#2E86AB" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          }}
        >
          {/* ONBOARDING FLOW */}
          {!hasLaunched && (
            <>
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="OnboardingSummary"
                component={OnboardingSummaryScreen}
                options={{ headerShown: false }}
              />
            </>
          )}

          {/* MAIN APP WITH TABS */}
          <Stack.Screen
            name="MainApp"
            component={TabNavigator}
            options={{ headerShown: false }}
          />

          {/* DETAIL SCREENS */}
          <Stack.Screen
            name="PathwayDetail"
            component={PathwayDetailScreen}
            options={{
              title: "Pathway Details",
              headerShown: true,
            }}
          />

          <Stack.Screen
            name="Checklist"
            component={ChecklistScreen}
            options={{
              title: "Document Checklist",
              headerShown: true,
            }}
          />

          <Stack.Screen
            name="Timeline"
            component={TimelineScreen}
            options={{
              title: "Process Timeline",
              headerShown: true,
            }}
          />

          <Stack.Screen
            name="LifeSetup"
            component={LifeSetupScreen}
            options={{
              title: "Life Setup Guide",
              headerShown: true,
            }}
          />

          <Stack.Screen
            name="Resources"
            component={ResourcesScreen}
            options={{
              title: "Find Resources",
              headerShown: true,
            }}
          />

          <Stack.Screen
            name="GuideDetail"
            component={GuideDetailScreen}
            options={{
              title: "Guide",
              headerShown: true,
            }}
          />

          <Stack.Screen
            name="StatusDetails"
            component={StatusDetailsScreen}
            options={{
              title: "Status Dashboard",
              headerShown: true,
            }}
          />

          <Stack.Screen
            name="PolicyTracker"
            component={PolicyTrackerScreen}
            options={{
              title: "Policy Tracker",
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: "Settings",
              headerShown: true,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}