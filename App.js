import "./src/i18n";
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
import CaseStatusTrackerScreen from "./src/screens/CaseStatusTrackerScreen";

// Navigation
import TabNavigator from "./src/navigation/TabNavigator";

const Stack = createStackNavigator();

// =========================================================
// Launch state model (three states, two flags)
// ---------------------------------------------------------
// The app distinguishes THREE first-run states, expressed with two
// independent booleans so no single flag carries two meanings:
//
//   @hasLaunched  = the user COMPLETED (or skipped) onboarding.
//                   Written once by OnboardingScreen.completeOnboarding().
//   @hasEnteredApp = the user entered the app via the "track my case
//                   first" path WITHOUT completing onboarding. Written by
//                   CaseStatusTrackerScreen the first time a pre-onboard
//                   user successfully adds a case (their commitment moment).
//
//   State                     hasLaunched | hasEnteredApp | starts at
//   ------------------------- ----------- | ------------- | ----------
//   Brand-new user              false     |    false      | Onboarding
//   Tracked-first, no profile   false     |    true        | MainApp
//   Onboarded (normal)          true      |  (either)      | MainApp
//
// Routing rule: go straight to the app if EITHER flag is set. We keep the
// onboarding routes registered whenever !hasLaunched, so a tracked-first
// user (who is in MainApp but has no profile) can still be sent INTO the
// onboarding flow by the "complete your profile" invite on Home/Settings.
// Once they finish, completeOnboarding sets @hasLaunched and the existing
// summary -> app transition carries them back; on the next cold start the
// onboarding routes drop out normally.
//
// NOTE: presence of tracked cases is deliberately NOT used as a routing
// signal — it's application data, not navigation state, and would misfire
// for onboarded users who track cases or users who delete their only case.
// =========================================================

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [hasLaunched, setHasLaunched] = useState(false);
  const [hasEnteredApp, setHasEnteredApp] = useState(false);

  useEffect(() => {
    // Initialize analytics
    analytics.init();

    const init = async () => {
      try {
        const [launched, entered] = await Promise.all([
          AsyncStorage.getItem("@hasLaunched"),
          AsyncStorage.getItem("@hasEnteredApp"),
        ]);
        setHasLaunched(launched === "true");
        setHasEnteredApp(entered === "true");
      } catch (e) {
        console.error("Startup error:", e);
        setHasLaunched(false);
        setHasEnteredApp(false);
      } finally {
        setIsReady(true);
      }
    };

    init();
  }, []);

  if (!isReady) return <SplashScreen />;

  // Start in the app if the user has either completed onboarding OR entered
  // via the track-first path. Onboarding routes remain registered while
  // onboarding is still incomplete (!hasLaunched) so the profile-completion
  // invite can navigate into them.
  const startInApp = hasLaunched || hasEnteredApp;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />

        <Stack.Navigator
          initialRouteName={startInApp ? "MainApp" : "Onboarding"}
          screenOptions={{
            headerStyle: { backgroundColor: "#2E86AB" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          }}
        >
          {/* ONBOARDING FLOW
              Registered while onboarding is incomplete. This covers both the
              brand-new user (who starts here) and the tracked-first user (who
              starts in MainApp but can be routed here by the invite). */}
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
            name="CaseStatusTracker"
            component={CaseStatusTrackerScreen}
            options={{
                title: "Case Tracker",
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