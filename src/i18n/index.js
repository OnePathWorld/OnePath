// src/i18n/index.js
// =========================================================
// OnePath i18n configuration
// ---------------------------------------------------------
// Behavior:
//   1. On first launch, detect device locale via expo-localization.
//      If supported (en/es/pt/zh) → use it. Otherwise fall back to "en".
//   2. The user's stored preference (userProfile.language) ALWAYS wins
//      over device locale once it has been set.
//   3. Calling setAppLanguage() persists the choice and switches the UI
//      live without an app restart.
//
// Setup:
//   npx expo install expo-localization
//   npm install i18next react-i18next
//
// Note: We use expo-localization (not react-native-localize) because
// expo-localization is built into Expo Go's native binary, while
// react-native-localize requires a custom dev build.
//
// Usage in App.js:
//   import "./src/i18n";   // side-effect import — initializes i18next
//
// Usage in screens:
//   import { useTranslation } from "react-i18next";
//   const { t } = useTranslation();
//   <Text>{t("home.greeting.morning")}</Text>
// =========================================================

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./locales/en.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";
import zh from "./locales/zh.json";
import ht from "./locales/ht.json";

// =========================================================
// Constants
// =========================================================
export const SUPPORTED_LANGUAGES = ["en", "es", "pt", "zh","ht"];
export const DEFAULT_LANGUAGE = "en";

// Human-readable names — used in the Settings language picker.
// Each name is shown in its OWN language so a user who can't read English
// can still find their language. (e.g. "中文" not "Chinese")
export const LANGUAGE_LABELS = {
  en: "English",
  es: "Español",
  pt: "Português",
  zh: "中文",
  ht: "Kreyòl",
};

// AsyncStorage key for the persisted user choice.
// Note: we ALSO mirror this into userProfile.language so the existing
// profile shape stays valid. This key is the single source of truth
// for i18n bootstrap.
const LANGUAGE_STORAGE_KEY = "@onepath_language";

// =========================================================
// Locale detection
// =========================================================
/**
 * Pick the best language to start with.
 * Priority: stored override → device locale → English.
 */
async function resolveInitialLanguage() {
  try {
    // 1. User-set override (highest priority)
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
      return stored;
    }

    // 2. Device locale match. expo-localization returns an array of
    //    locales in user-preferred order, each with a `languageCode`
    //    field that's already stripped to the 2-letter code (e.g.
    //    "es-MX" → languageCode: "es", "zh-Hans-CN" → languageCode: "zh").
    //    We walk the list in order and pick the first one we support.
    const locales = Localization.getLocales();
    if (Array.isArray(locales)) {
      for (const locale of locales) {
        const code = locale?.languageCode;
        if (code && SUPPORTED_LANGUAGES.includes(code)) {
          return code;
        }
      }
    }
  } catch (err) {
    // AsyncStorage / Localization failures should never crash startup.
    console.warn("[i18n] Failed to resolve initial language:", err);
  }

  // 3. Hard fallback
  return DEFAULT_LANGUAGE;
}

// =========================================================
// Initialization
// =========================================================
// We initialize synchronously with the default language so React doesn't
// render against an uninitialized i18next, then asynchronously swap to the
// resolved language. The swap is fast enough that users almost never see
// the English flash, but if it ever becomes noticeable we can move
// initialization behind the SplashScreen.
i18n.use(initReactI18next).init({
  compatibilityJSON: "v3", // required for older RN/Hermes versions
  resources: {
    en: { translation: en },
    es: { translation: es },
    pt: { translation: pt },
    zh: { translation: zh },
    ht: { translation: ht },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false, // React already escapes
  },
  // Don't crash on missing keys — return the key string so we can spot
  // gaps in QA without breaking the app.
  returnEmptyString: false,
  returnNull: false,
});

// Resolve and apply the real language asynchronously.
resolveInitialLanguage().then((lng) => {
  if (lng !== i18n.language) {
    i18n.changeLanguage(lng);
  }
});

// =========================================================
// Public API
// =========================================================
/**
 * Change the app's language and persist the choice.
 * Call this from the Settings language picker.
 *
 * @param {string} lng — one of SUPPORTED_LANGUAGES
 */
export async function setAppLanguage(lng) {
  if (!SUPPORTED_LANGUAGES.includes(lng)) {
    console.warn(`[i18n] Unsupported language: ${lng}`);
    return;
  }
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    await i18n.changeLanguage(lng);

    // Mirror into userProfile_v2 so existing analytics/profile code
    // sees the change. We don't fail if the profile doesn't exist yet
    // (e.g. user picked language during onboarding before saving).
    try {
      const raw = await AsyncStorage.getItem("@userProfile_v2");
      if (raw) {
        const profile = JSON.parse(raw);
        profile.language = lng;
        await AsyncStorage.setItem("@userProfile_v2", JSON.stringify(profile));
      }
    } catch (innerErr) {
      console.warn("[i18n] Failed to mirror language into profile:", innerErr);
    }
  } catch (err) {
    console.warn("[i18n] Failed to persist language:", err);
  }
}

/**
 * Get the current language code (e.g. "en", "es").
 * Useful for analytics events and conditional rendering.
 */
export function getCurrentLanguage() {
  return i18n.language || DEFAULT_LANGUAGE;
}

export default i18n;