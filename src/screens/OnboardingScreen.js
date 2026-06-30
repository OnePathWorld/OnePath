import { getCurrentLanguage } from "../i18n";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import analytics, { EVENTS } from "../utils/analytics";

// -----------------------------------------------------------------
// COUNTRY SEARCH LIST
// ---------------------------------------------------------
// Used when the user selects "Other" on countryOfCitizenship.
// Covers ~150 countries not in the top-12 pinned list.
// Values are stored in AsyncStorage and used by analytics —
// keep them stable across releases.
// -----------------------------------------------------------------
const COUNTRY_SEARCH_LIST = [
  { value: "afghanistan",        label: "🇦🇫 Afghanistan" },
  { value: "albania",            label: "🇦🇱 Albania" },
  { value: "algeria",            label: "🇩🇿 Algeria" },
  { value: "angola",             label: "🇦🇴 Angola" },
  { value: "antigua_barbuda",    label: "🇦🇬 Antigua & Barbuda" },
  { value: "argentina",          label: "🇦🇷 Argentina" },
  { value: "armenia",            label: "🇦🇲 Armenia" },
  { value: "australia",          label: "🇦🇺 Australia" },
  { value: "austria",            label: "🇦🇹 Austria" },
  { value: "azerbaijan",         label: "🇦🇿 Azerbaijan" },
  { value: "bahamas",            label: "🇧🇸 Bahamas" },
  { value: "bahrain",            label: "🇧🇭 Bahrain" },
  { value: "bangladesh",         label: "🇧🇩 Bangladesh" },
  { value: "barbados",           label: "🇧🇧 Barbados" },
  { value: "belarus",            label: "🇧🇾 Belarus" },
  { value: "belgium",            label: "🇧🇪 Belgium" },
  { value: "belize",             label: "🇧🇿 Belize" },
  { value: "benin",              label: "🇧🇯 Benin" },
  { value: "bolivia",            label: "🇧🇴 Bolivia" },
  { value: "bosnia",             label: "🇧🇦 Bosnia & Herzegovina" },
  { value: "botswana",           label: "🇧🇼 Botswana" },
  { value: "bulgaria",           label: "🇧🇬 Bulgaria" },
  { value: "burkina_faso",       label: "🇧🇫 Burkina Faso" },
  { value: "burundi",            label: "🇧🇮 Burundi" },
  { value: "cambodia",           label: "🇰🇭 Cambodia" },
  { value: "cameroon",           label: "🇨🇲 Cameroon" },
  { value: "cape_verde",         label: "🇨🇻 Cape Verde" },
  { value: "cayman_islands",     label: "🇰🇾 Cayman Islands" },
  { value: "chad",               label: "🇹🇩 Chad" },
  { value: "chile",              label: "🇨🇱 Chile" },
  { value: "colombia",           label: "🇨🇴 Colombia" },
  { value: "comoros",            label: "🇰🇲 Comoros" },
  { value: "congo",              label: "🇨🇬 Congo" },
  { value: "costa_rica",         label: "🇨🇷 Costa Rica" },
  { value: "croatia",            label: "🇭🇷 Croatia" },
  { value: "cuba",               label: "🇨🇺 Cuba" },
  { value: "curacao",            label: "🇨🇼 Curaçao" },
  { value: "cyprus",             label: "🇨🇾 Cyprus" },
  { value: "czech_republic",     label: "🇨🇿 Czech Republic" },
  { value: "denmark",            label: "🇩🇰 Denmark" },
  { value: "djibouti",           label: "🇩🇯 Djibouti" },
  { value: "dominica",           label: "🇩🇲 Dominica" },
  { value: "dominican_republic", label: "🇩🇴 Dominican Republic" },
  { value: "dr_congo",           label: "🇨🇩 DR Congo" },
  { value: "ecuador",            label: "🇪🇨 Ecuador" },
  { value: "egypt",              label: "🇪🇬 Egypt" },
  { value: "el_salvador",        label: "🇸🇻 El Salvador" },
  { value: "eritrea",            label: "🇪🇷 Eritrea" },
  { value: "estonia",            label: "🇪🇪 Estonia" },
  { value: "ethiopia",           label: "🇪🇹 Ethiopia" },
  { value: "fiji",               label: "🇫🇯 Fiji" },
  { value: "finland",            label: "🇫🇮 Finland" },
  { value: "france",             label: "🇫🇷 France" },
  { value: "gabon",              label: "🇬🇦 Gabon" },
  { value: "gambia",             label: "🇬🇲 Gambia" },
  { value: "georgia",            label: "🇬🇪 Georgia" },
  { value: "ghana",              label: "🇬🇭 Ghana" },
  { value: "greece",             label: "🇬🇷 Greece" },
  { value: "grenada",            label: "🇬🇩 Grenada" },
  { value: "guadeloupe",         label: "🇬🇵 Guadeloupe" },
  { value: "guatemala",          label: "🇬🇹 Guatemala" },
  { value: "guinea",             label: "🇬🇳 Guinea" },
  { value: "guyana",             label: "🇬🇾 Guyana" },
  { value: "honduras",           label: "🇭🇳 Honduras" },
  { value: "hungary",            label: "🇭🇺 Hungary" },
  { value: "iceland",            label: "🇮🇸 Iceland" },
  { value: "indonesia",          label: "🇮🇩 Indonesia" },
  { value: "iran",               label: "🇮🇷 Iran" },
  { value: "iraq",               label: "🇮🇶 Iraq" },
  { value: "ireland",            label: "🇮🇪 Ireland" },
  { value: "israel",             label: "🇮🇱 Israel" },
  { value: "italy",              label: "🇮🇹 Italy" },
  { value: "ivory_coast",        label: "🇨🇮 Ivory Coast" },
  { value: "jamaica",            label: "🇯🇲 Jamaica" },
  { value: "jordan",             label: "🇯🇴 Jordan" },
  { value: "kazakhstan",         label: "🇰🇿 Kazakhstan" },
  { value: "kenya",              label: "🇰🇪 Kenya" },
  { value: "kosovo",             label: "🇽🇰 Kosovo" },
  { value: "kuwait",             label: "🇰🇼 Kuwait" },
  { value: "kyrgyzstan",         label: "🇰🇬 Kyrgyzstan" },
  { value: "laos",               label: "🇱🇦 Laos" },
  { value: "latvia",             label: "🇱🇻 Latvia" },
  { value: "lebanon",            label: "🇱🇧 Lebanon" },
  { value: "liberia",            label: "🇱🇷 Liberia" },
  { value: "libya",              label: "🇱🇾 Libya" },
  { value: "lithuania",          label: "🇱🇹 Lithuania" },
  { value: "luxembourg",         label: "🇱🇺 Luxembourg" },
  { value: "madagascar",         label: "🇲🇬 Madagascar" },
  { value: "malawi",             label: "🇲🇼 Malawi" },
  { value: "malaysia",           label: "🇲🇾 Malaysia" },
  { value: "mali",               label: "🇲🇱 Mali" },
  { value: "martinique",         label: "🇲🇶 Martinique" },
  { value: "mauritania",         label: "🇲🇷 Mauritania" },
  { value: "mauritius",          label: "🇲🇺 Mauritius" },
  { value: "moldova",            label: "🇲🇩 Moldova" },
  { value: "mongolia",           label: "🇲🇳 Mongolia" },
  { value: "montenegro",         label: "🇲🇪 Montenegro" },
  { value: "montserrat",         label: "🇲🇸 Montserrat" },
  { value: "morocco",            label: "🇲🇦 Morocco" },
  { value: "mozambique",         label: "🇲🇿 Mozambique" },
  { value: "myanmar",            label: "🇲🇲 Myanmar" },
  { value: "namibia",            label: "🇳🇦 Namibia" },
  { value: "nepal",              label: "🇳🇵 Nepal" },
  { value: "netherlands",        label: "🇳🇱 Netherlands" },
  { value: "new_zealand",        label: "🇳🇿 New Zealand" },
  { value: "nicaragua",          label: "🇳🇮 Nicaragua" },
  { value: "niger",              label: "🇳🇪 Niger" },
  { value: "north_korea",        label: "🇰🇵 North Korea" },
  { value: "north_macedonia",    label: "🇲🇰 North Macedonia" },
  { value: "norway",             label: "🇳🇴 Norway" },
  { value: "oman",               label: "🇴🇲 Oman" },
  { value: "pakistan",           label: "🇵🇰 Pakistan" },
  { value: "palestine",          label: "🇵🇸 Palestine" },
  { value: "panama",             label: "🇵🇦 Panama" },
  { value: "papua_new_guinea",   label: "🇵🇬 Papua New Guinea" },
  { value: "paraguay",           label: "🇵🇾 Paraguay" },
  { value: "peru",               label: "🇵🇪 Peru" },
  { value: "poland",             label: "🇵🇱 Poland" },
  { value: "portugal",           label: "🇵🇹 Portugal" },
  { value: "puerto_rico",        label: "🇵🇷 Puerto Rico (US Territory)" },
  { value: "qatar",              label: "🇶🇦 Qatar" },
  { value: "romania",            label: "🇷🇴 Romania" },
  { value: "russia",             label: "🇷🇺 Russia" },
  { value: "rwanda",             label: "🇷🇼 Rwanda" },
  { value: "saint_kitts_nevis",  label: "🇰🇳 Saint Kitts & Nevis" },
  { value: "saint_lucia",        label: "🇱🇨 Saint Lucia" },
  { value: "saint_vincent",      label: "🇻🇨 Saint Vincent & the Grenadines" },
  { value: "saudi_arabia",       label: "🇸🇦 Saudi Arabia" },
  { value: "senegal",            label: "🇸🇳 Senegal" },
  { value: "serbia",             label: "🇷🇸 Serbia" },
  { value: "sierra_leone",       label: "🇸🇱 Sierra Leone" },
  { value: "singapore",          label: "🇸🇬 Singapore" },
  { value: "sint_maarten",       label: "🇸🇽 Sint Maarten" },
  { value: "slovakia",           label: "🇸🇰 Slovakia" },
  { value: "slovenia",           label: "🇸🇮 Slovenia" },
  { value: "somalia",            label: "🇸🇴 Somalia" },
  { value: "south_africa",       label: "🇿🇦 South Africa" },
  { value: "south_sudan",        label: "🇸🇸 South Sudan" },
  { value: "spain",              label: "🇪🇸 Spain" },
  { value: "sri_lanka",          label: "🇱🇰 Sri Lanka" },
  { value: "sudan",              label: "🇸🇩 Sudan" },
  { value: "suriname",           label: "🇸🇷 Suriname" },
  { value: "sweden",             label: "🇸🇪 Sweden" },
  { value: "switzerland",        label: "🇨🇭 Switzerland" },
  { value: "syria",              label: "🇸🇾 Syria" },
  { value: "taiwan",             label: "🇹🇼 Taiwan" },
  { value: "tajikistan",         label: "🇹🇯 Tajikistan" },
  { value: "tanzania",           label: "🇹🇿 Tanzania" },
  { value: "thailand",           label: "🇹🇭 Thailand" },
  { value: "timor_leste",        label: "🇹🇱 Timor-Leste" },
  { value: "togo",               label: "🇹🇬 Togo" },
  { value: "trinidad_tobago",    label: "🇹🇹 Trinidad & Tobago" },
  { value: "tunisia",            label: "🇹🇳 Tunisia" },
  { value: "turkey",             label: "🇹🇷 Turkey" },
  { value: "turkmenistan",       label: "🇹🇲 Turkmenistan" },
  { value: "turks_caicos",       label: "🇹🇨 Turks & Caicos" },
  { value: "uganda",             label: "🇺🇬 Uganda" },
  { value: "ukraine",            label: "🇺🇦 Ukraine" },
  { value: "united_arab_emirates", label: "🇦🇪 United Arab Emirates" },
  { value: "uruguay",            label: "🇺🇾 Uruguay" },
  { value: "us_virgin_islands",  label: "🇻🇮 US Virgin Islands (US Territory)" },
  { value: "uzbekistan",         label: "🇺🇿 Uzbekistan" },
  { value: "venezuela",          label: "🇻🇪 Venezuela" },
  { value: "vietnam",            label: "🇻🇳 Vietnam" },
  { value: "yemen",              label: "🇾🇪 Yemen" },
  { value: "zambia",             label: "🇿🇲 Zambia" },
  { value: "zimbabwe",           label: "🇿🇼 Zimbabwe" },
];

const OnboardingScreen = ({ navigation, onDone }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false); // locked during auto-advance timeout

  // Country search state — only active when user picks "Other" on countryOfCitizenship
  const [countrySearch, setCountrySearch] = useState("");
  const [countrySearchResults, setCountrySearchResults] = useState([]);

  const [userProfile, setUserProfile] = useState({
    location: "",
    purpose: "",
    urgency: "",
    language: getCurrentLanguage(),
    currentVisa: "",
    hasWorkAuth: "",
    countryOfCitizenship: "",
    expiryTimeline: "",
    complianceRisk: "",
    gcYearsHeld: "",
    // Outside-US branch fields (added v1.3)
    outsideUsStage: "",     // no_case | petition_filed | petition_approved | interview_scheduled | has_us_visa | former_visa_holder | exploring
    hasReceiptNumber: "",   // yes | no  (only relevant when outsideUsStage indicates a filed/approved case)
  });

  // Animated scale values keyed by option value — stored in a ref so they
  // don't trigger re-renders and persist across renders of the same step.
  const scaleAnims = useRef({}).current;

  // Track onboarding start + begin timing
  useEffect(() => {
    analytics.track(EVENTS.ONBOARDING_STARTED);
    analytics.timeStart(EVENTS.ONBOARDING_COMPLETED);
  }, []);

  // Reset interaction lock and country search whenever the step changes
  useEffect(() => {
    setIsAdvancing(false);
    setCountrySearch("");
    setCountrySearchResults([]);
  }, [currentStep]);

  // -----------------------------------------------------------------
  // QUESTIONS
  // ---------------------------------------------------------
  // Built inside the component so t() picks up the active locale.
  // All strings live in src/i18n/locales/{en,es,pt,zh}.json under the
  // `onboarding.*` namespace. The `option.value` strings are kept in
  // English because they're enum values stored in AsyncStorage and
  // referenced by the guidance engine — they must NOT be translated.
  // -----------------------------------------------------------------
  const questions = [
    {
      id: "welcome",
      title: t("onboarding.welcome.title"),
      subtitle: t("onboarding.welcome.subtitle"),
      type: "info",
    },
    {
      id: "location",
      title: t("onboarding.location.title"),
      subtitle: t("onboarding.location.subtitle"),
      options: [
        { value: "outside_us", label: t("onboarding.location.options.outside_us") },
        { value: "inside_us",  label: t("onboarding.location.options.inside_us") },
      ],
    },

    // -------------------------------------------------------------
    // OUTSIDE-US BRANCH (v1.3)
    // For users outside the US: ask where they are in the immigration
    // process. This unlocks Case Tracker for users with a USCIS receipt
    // number (pending I-130, I-140, etc.) and gives OnboardingSummary
    // enough context to render meaningful guidance instead of a
    // generic "you're outside the US" page.
    // -------------------------------------------------------------
    {
      id: "outsideUsStage",
      title: t("onboarding.outsideUsStage.title"),
      subtitle: t("onboarding.outsideUsStage.subtitle"),
      showIf: (profile) => profile.location === "outside_us",
      options: [
        { value: "no_case",             label: t("onboarding.outsideUsStage.options.no_case") },
        { value: "petition_filed",      label: t("onboarding.outsideUsStage.options.petition_filed") },
        { value: "petition_approved",   label: t("onboarding.outsideUsStage.options.petition_approved") },
        { value: "interview_scheduled", label: t("onboarding.outsideUsStage.options.interview_scheduled") },
        { value: "has_us_visa",         label: t("onboarding.outsideUsStage.options.has_us_visa") },
        { value: "former_visa_holder",  label: t("onboarding.outsideUsStage.options.former_visa_holder") },
        { value: "exploring",           label: t("onboarding.outsideUsStage.options.exploring") },
      ],
    },

    // Bridge to Case Tracker — only ask if they have a filed/approved case
    {
      id: "hasReceiptNumber",
      title: t("onboarding.hasReceiptNumber.title"),
      subtitle: t("onboarding.hasReceiptNumber.subtitle"),
      showIf: (profile) =>
        profile.location === "outside_us" &&
        (profile.outsideUsStage === "petition_filed" ||
          profile.outsideUsStage === "petition_approved" ||
          profile.outsideUsStage === "interview_scheduled"),
      options: [
        { value: "yes", label: t("onboarding.hasReceiptNumber.options.yes") },
        { value: "no",  label: t("onboarding.hasReceiptNumber.options.no") },
      ],
    },

    // currentVisa comes before purpose so purpose can react to GC holder status
    {
      id: "currentVisa",
      title: t("onboarding.currentVisa.title"),
      subtitle: t("onboarding.currentVisa.subtitle"),
      showIf: (profile) => profile.location === "inside_us",
      options: [
        // Work
        { value: "H1B",        label: t("onboarding.currentVisa.options.H1B"),        group: t("onboarding.currentVisa.groups.work") },
        { value: "L1",         label: t("onboarding.currentVisa.options.L1"),         group: t("onboarding.currentVisa.groups.work") },
        { value: "EAD",        label: t("onboarding.currentVisa.options.EAD"),        group: t("onboarding.currentVisa.groups.work") },
        // Study
        { value: "F1",         label: t("onboarding.currentVisa.options.F1"),         group: t("onboarding.currentVisa.groups.study") },
        { value: "OPT",        label: t("onboarding.currentVisa.options.OPT"),        group: t("onboarding.currentVisa.groups.study") },
        { value: "J1",         label: t("onboarding.currentVisa.options.J1"),         group: t("onboarding.currentVisa.groups.study") },
        // Resident / Visitor
        { value: "GC",         label: t("onboarding.currentVisa.options.GC"),         group: t("onboarding.currentVisa.groups.resident") },
        { value: "GC_pending", label: t("onboarding.currentVisa.options.GC_pending"), group: t("onboarding.currentVisa.groups.resident") },
        { value: "B1B2",       label: t("onboarding.currentVisa.options.B1B2"),       group: t("onboarding.currentVisa.groups.resident") },
        // Other
        { value: "other",      label: t("onboarding.currentVisa.options.other"),      group: t("onboarding.currentVisa.groups.other") },
        { value: "none",       label: t("onboarding.currentVisa.options.none"),       group: t("onboarding.currentVisa.groups.other") },
      ],
    },

    // gcYearsHeld immediately after GC selection
    {
      id: "gcYearsHeld",
      title: t("onboarding.gcYearsHeld.title"),
      subtitle: t("onboarding.gcYearsHeld.subtitle"),
      showIf: (profile) =>
        profile.location === "inside_us" && profile.currentVisa === "GC",
      options: [
        { value: "under2",   label: t("onboarding.gcYearsHeld.options.under2") },
        { value: "2to3",     label: t("onboarding.gcYearsHeld.options.2to3") },
        { value: "3to5",     label: t("onboarding.gcYearsHeld.options.3to5") },
        { value: "over5",    label: t("onboarding.gcYearsHeld.options.over5") },
        { value: "military", label: t("onboarding.gcYearsHeld.options.military") },
      ],
    },

    // PURPOSE — non-GC version
    {
      id: "purpose",
      title: t("onboarding.purpose.title"),
      subtitle: t("onboarding.purpose.subtitle"),
      showIf: (profile) => profile.currentVisa !== "GC",
      options: [
        { value: "work",       label: t("onboarding.purpose.options.work") },
        { value: "family",     label: t("onboarding.purpose.options.family") },
        { value: "study",      label: t("onboarding.purpose.options.study") },
        { value: "protection", label: t("onboarding.purpose.options.protection") },
      ],
    },

    // PURPOSE — GC holder version (overrides above when GC)
    {
      id: "purpose",
      title: t("onboarding.purposeGc.title"),
      subtitle: t("onboarding.purposeGc.subtitle"),
      showIf: (profile) =>
        profile.location === "inside_us" && profile.currentVisa === "GC",
      options: [
        { value: "citizenship", label: t("onboarding.purposeGc.options.citizenship") },
        { value: "family",      label: t("onboarding.purposeGc.options.family") },
        { value: "work",        label: t("onboarding.purposeGc.options.work") },
      ],
    },

    // URGENCY — skipped for GC holders
    {
      id: "urgency",
      title: t("onboarding.urgency.title"),
      subtitle: t("onboarding.urgency.subtitle"),
      showIf: (profile) => profile.currentVisa !== "GC",
      options: [
        { value: "immediate", label: t("onboarding.urgency.options.immediate") },
        { value: "soon",      label: t("onboarding.urgency.options.soon") },
        { value: "planning",  label: t("onboarding.urgency.options.planning") },
      ],
    },

    {
      id: "hasWorkAuth",
      title: t("onboarding.hasWorkAuth.title"),
      subtitle: t("onboarding.hasWorkAuth.subtitle"),
      showIf: (profile) =>
        profile.location === "inside_us" && profile.currentVisa !== "GC",
      options: [
        { value: "yes_unrestricted", label: t("onboarding.hasWorkAuth.options.yes_unrestricted") },
        { value: "yes_restricted",   label: t("onboarding.hasWorkAuth.options.yes_restricted") },
        { value: "yes_ead",          label: t("onboarding.hasWorkAuth.options.yes_ead") },
        { value: "pending",          label: t("onboarding.hasWorkAuth.options.pending") },
        { value: "no",               label: t("onboarding.hasWorkAuth.options.no") },
      ],
    },

    {
      id: "countryOfCitizenship",
      title: t("onboarding.countryOfCitizenship.title"),
      subtitle: t("onboarding.countryOfCitizenship.subtitle"),
      options: [
        { value: "mexico",      label: t("onboarding.countryOfCitizenship.options.mexico") },
        { value: "india",       label: t("onboarding.countryOfCitizenship.options.india") },
        { value: "china",       label: t("onboarding.countryOfCitizenship.options.china") },
        { value: "haiti",       label: t("onboarding.countryOfCitizenship.options.haiti") },
        { value: "philippines", label: t("onboarding.countryOfCitizenship.options.philippines") },
        { value: "brazil",      label: t("onboarding.countryOfCitizenship.options.brazil") },
        { value: "nigeria",     label: t("onboarding.countryOfCitizenship.options.nigeria") },
        { value: "canada",      label: t("onboarding.countryOfCitizenship.options.canada") },
        { value: "uk",          label: t("onboarding.countryOfCitizenship.options.uk") },
        { value: "germany",     label: t("onboarding.countryOfCitizenship.options.germany") },
        { value: "south_korea", label: t("onboarding.countryOfCitizenship.options.south_korea") },
        { value: "japan",       label: t("onboarding.countryOfCitizenship.options.japan") },
        { value: "other",       label: t("onboarding.countryOfCitizenship.options.other") },
      ],
      hasTextInput: true,
      textInputPlaceholder: t("onboarding.countryOfCitizenship.searchPlaceholder"),
      textInputShowIf: "other",
    },

    {
      id: "expiryTimeline",
      title: t("onboarding.expiryTimeline.title"),
      // Dynamic subtitle — looks up visa-specific text, falls back to default
      subtitle: (profile) => {
        if (!profile.currentVisa) {
          return t("onboarding.expiryTimeline.subtitleDefault");
        }
        const key = `onboarding.expiryTimeline.subtitleByVisa.${profile.currentVisa}`;
        const translated = t(key);
        // i18next returns the key itself if not found — fall back to default
        return translated === key
          ? t("onboarding.expiryTimeline.subtitleDefault")
          : translated;
      },
      showIf: (profile) =>
        profile.purpose !== "protection" &&
        profile.currentVisa !== "GC" &&
        (profile.location === "inside_us" ||
          (profile.location === "outside_us" &&
            profile.outsideUsStage === "has_us_visa")),
      options: [
        { value: "expired", label: t("onboarding.expiryTimeline.options.expired") },
        { value: "30days",  label: t("onboarding.expiryTimeline.options.30days") },
        { value: "90days",  label: t("onboarding.expiryTimeline.options.90days") },
        { value: "6months", label: t("onboarding.expiryTimeline.options.6months") },
        { value: "year",    label: t("onboarding.expiryTimeline.options.year") },
        { value: "safe",    label: t("onboarding.expiryTimeline.options.safe") },
      ],
    },

    {
      id: "complianceRisk",
      title: t("onboarding.complianceRisk.title"),
      subtitle: (profile) => {
        if (profile.currentVisa === "F1" || profile.currentVisa === "OPT") {
          return t("onboarding.complianceRisk.subtitleStudent");
        }
        return t("onboarding.complianceRisk.subtitle");
      },
      showIf: (profile) =>
        profile.location === "inside_us" && profile.currentVisa !== "GC",
      options: [
        { value: "none",              label: t("onboarding.complianceRisk.options.none") },
        { value: "gap",               label: t("onboarding.complianceRisk.options.gap") },
        { value: "unauthorized_work", label: t("onboarding.complianceRisk.options.unauthorized_work") },
        { value: "overstay",          label: t("onboarding.complianceRisk.options.overstay") },
        { value: "denied",            label: t("onboarding.complianceRisk.options.denied") },
        { value: "prefer_not",        label: t("onboarding.complianceRisk.options.prefer_not") },
      ],
    },
  ];

  const visibleQuestions = questions.reduce((acc, q) => {
    if (q.showIf && !q.showIf(userProfile)) return acc;
    // If a question with this id already exists, replace it
    // (handles dynamic purpose question swap for GC holders)
    const existingIndex = acc.findIndex((existing) => existing.id === q.id);
    if (existingIndex >= 0) {
      acc[existingIndex] = q;
      return acc;
    }
    return [...acc, q];
  }, []);

  const question = visibleQuestions[currentStep];
  const progress = ((currentStep + 1) / visibleQuestions.length) * 100;

  // canProceed: for countryOfCitizenship, "other" is only valid once the user
  // has selected a real country from the search results (value will no longer
  // be "other" at that point). If they're still on "other" without picking a
  // search result, they need to either search or tap Next to skip.
  const canProceed =
    question.type === "info" || Boolean(userProfile[question.id]);

  const handleSelection = (value) => {
    // Block any tap during the auto-advance window
    if (isAdvancing) return;

    // Update profile state
    setUserProfile((prev) => ({ ...prev, [question.id]: value }));

    // Ensure an Animated.Value exists for this option
    if (!scaleAnims[value]) {
      scaleAnims[value] = new Animated.Value(1);
    }

    // Brief pop animation: squish → bounce back
    Animated.sequence([
      Animated.timing(scaleAnims[value], {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[value], {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-advance unless:
    // - it's the last step (let the user consciously tap Finish)
    // - the question has a text input and "other" was picked (user needs to search)
    const isLastStep = currentStep === visibleQuestions.length - 1;
    const needsTextInput =
      question.hasTextInput && value === question.textInputShowIf;

    if (!isLastStep && !needsTextInput) {
      setIsAdvancing(true); // lock interactions

      setTimeout(() => {
        analytics.track(EVENTS.ONBOARDING_STEP, {
          step: currentStep,
          questionId: question.id,
          answer: value,
        });
        setCurrentStep((s) => s + 1);
        // isAdvancing resets via the useEffect that watches currentStep
      }, 400);
    }
  };

  // Called when user taps a country from the search results dropdown
  const handleCountrySearchSelect = (country) => {
    if (isAdvancing) return;

    // Store the real country code — replaces "other" as the field value
    setUserProfile((prev) => ({
      ...prev,
      countryOfCitizenship: country.value,
      countrySpecified: country.label,
    }));
    setCountrySearch("");
    setCountrySearchResults([]);

    // Animate the "other" button (the one that was selected) as feedback
    if (!scaleAnims["other"]) {
      scaleAnims["other"] = new Animated.Value(1);
    }
    Animated.sequence([
      Animated.timing(scaleAnims["other"], {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims["other"], {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-advance after selection
    const isLastStep = currentStep === visibleQuestions.length - 1;
    if (!isLastStep) {
      setIsAdvancing(true);
      setTimeout(() => {
        analytics.track(EVENTS.ONBOARDING_STEP, {
          step: currentStep,
          questionId: question.id,
          answer: country.value,
        });
        setCurrentStep((s) => s + 1);
      }, 400);
    }
  };

  const handleNext = () => {
    if (isAdvancing) return;

    // Track step completion
    analytics.track(EVENTS.ONBOARDING_STEP, {
      step: currentStep,
      questionId: question.id,
      answer: question.type === "info" ? "start" : userProfile[question.id],
    });

    if (currentStep < visibleQuestions.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (isAdvancing) return;
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const completeOnboarding = async () => {
    if (saving) return;
    setSaving(true);

    try {
      await AsyncStorage.setItem("@hasLaunched", "true");

      await AsyncStorage.setItem(
        "@userProfile_v2",
        JSON.stringify(userProfile)
      );

      const legacyProfile = {
        location: userProfile.location,
        purpose: userProfile.purpose,
        urgency: userProfile.urgency,
        language: userProfile.language,
      };
      await AsyncStorage.setItem(
        "@userProfile",
        JSON.stringify(legacyProfile)
      );

      // Track completion and identify user
      analytics.track(EVENTS.ONBOARDING_COMPLETED, {
        purpose: userProfile.purpose,
        country: userProfile.countryOfCitizenship,
        countrySpecified: userProfile.countrySpecified || "",
        visa: userProfile.currentVisa,
        location: userProfile.location,
        gcYearsHeld: userProfile.gcYearsHeld || "",
        outsideUsStage: userProfile.outsideUsStage || "",
        hasReceiptNumber: userProfile.hasReceiptNumber || "",
      });
      analytics.identifyUser(userProfile);

      if (typeof onDone === "function") onDone();

      navigation.replace("OnboardingSummary", {
        userProfile,
      });
    } catch (err) {
      console.error("Onboarding save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (isAdvancing) return;
    analytics.track(EVENTS.ONBOARDING_SKIPPED, {
      skippedAtStep: currentStep,
      questionId: question.id,
    });
    completeOnboarding();
  };

  // -----------------------------------------------------------------
  // RENDER OPTIONS
  // ---------------------------------------------------------
  // Renders option buttons for the current question.
  // If any option has a `group` property, injects a small uppercase
  // divider label whenever the group changes — used by currentVisa
  // to break 11 options into Work / Study / Resident & Visitor / Other.
  // All other questions fall through to the flat render path so
  // nothing changes for them.
  // -----------------------------------------------------------------
  const renderOptions = (q) => {
    const hasGroups = q.options.some((o) => o.group);

    if (!hasGroups) {
      return q.options.map((opt) => {
        if (!scaleAnims[opt.value]) {
          scaleAnims[opt.value] = new Animated.Value(1);
        }
        const isSelected = userProfile[q.id] === opt.value;
        return (
          <Animated.View
            key={opt.value}
            style={{ transform: [{ scale: scaleAnims[opt.value] }] }}
          >
            <TouchableOpacity
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
              ]}
              onPress={() => handleSelection(opt.value)}
              disabled={isAdvancing}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      });
    }

    // Grouped render — inject a divider label when the group name changes
    let lastGroup = null;
    return q.options.map((opt) => {
      if (!scaleAnims[opt.value]) {
        scaleAnims[opt.value] = new Animated.Value(1);
      }
      const isSelected = userProfile[q.id] === opt.value;
      const showDivider = opt.group !== lastGroup;
      lastGroup = opt.group;

      return (
        <View key={opt.value}>
          {showDivider && (
            <Text style={styles.optionGroupLabel}>{opt.group}</Text>
          )}
          <Animated.View
            style={{ transform: [{ scale: scaleAnims[opt.value] }] }}
          >
            <TouchableOpacity
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
              ]}
              onPress={() => handleSelection(opt.value)}
              disabled={isAdvancing}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* SKIP */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={saving || isAdvancing}
        >
          <Text style={styles.skipButtonText}>{t("onboarding.skip")}</Text>
        </TouchableOpacity>

        {/* PROGRESS */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
          <Text style={styles.progressStep}>
            {t("onboarding.stepIndicator", {
              current: currentStep + 1,
              total: visibleQuestions.length,
            })}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {question.type === "info" ? (
            <View style={styles.infoContainer}>
              <Image
                source={require("../../assets/icon.png")}
                style={styles.logoImage}
              />
              <Text style={styles.title}>{question.title}</Text>
              <Text style={styles.subtitle}>
                {typeof question.subtitle === "function"
                  ? question.subtitle(userProfile)
                  : question.subtitle}
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleNext}
              >
                <Text style={styles.primaryButtonText}>
                  {t("onboarding.getStarted")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.questionContainer}>
              <Text style={styles.title}>{question.title}</Text>
              <Text style={styles.subtitle}>
                {typeof question.subtitle === "function"
                  ? question.subtitle(userProfile)
                  : question.subtitle}
              </Text>

              <ScrollView
                style={styles.optionsScroll}
                showsVerticalScrollIndicator={false}
              >
                {renderOptions(question)}
              </ScrollView>

              {/* COUNTRY SEARCH — shown when user picks "Other" on countryOfCitizenship */}
              {question.hasTextInput &&
                userProfile[question.id] === question.textInputShowIf && (
                  <View>
                    <TextInput
                      style={styles.textInput}
                      placeholder={question.textInputPlaceholder}
                      value={countrySearch}
                      onChangeText={(text) => {
                        setCountrySearch(text);
                        const q = text.toLowerCase().trim();
                        if (q.length === 0) {
                          setCountrySearchResults([]);
                          return;
                        }
                        setCountrySearchResults(
                          COUNTRY_SEARCH_LIST.filter((c) =>
                            c.label.toLowerCase().includes(q)
                          ).slice(0, 6)
                        );
                      }}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />

                    {/* No results message */}
                    {countrySearch.length > 0 &&
                      countrySearchResults.length === 0 && (
                        <Text style={styles.countrySearchEmpty}>
                          {t("onboarding.countryOfCitizenship.noResults")}
                        </Text>
                      )}

                    {/* Search results dropdown */}
                    {countrySearchResults.map((c) => (
                      <TouchableOpacity
                        key={c.value}
                        style={styles.countrySearchResult}
                        onPress={() => handleCountrySearchSelect(c)}
                        disabled={isAdvancing}
                      >
                        <Text style={styles.countrySearchResultText}>
                          {c.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

              <View style={styles.navRow}>
                {currentStep > 0 && (
                  <TouchableOpacity
                    onPress={handleBack}
                    disabled={isAdvancing}
                  >
                    <Text style={styles.backText}>{t("onboarding.back")}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    (!canProceed || isAdvancing) && styles.disabledButton,
                  ]}
                  disabled={!canProceed || isAdvancing}
                  onPress={handleNext}
                >
                  <Text style={styles.primaryButtonText}>
                    {currentStep === visibleQuestions.length - 1
                      ? t("onboarding.finish")
                      : t("onboarding.next")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* PRIVACY DISCLAIMER */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            {t("onboarding.privacyDisclaimer")}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF" },
  container: { flex: 1 },

  skipButton: {
    position: "absolute",
    right: 16,
    top: 0,
    zIndex: 10,
    padding: 10,
  },
  skipButtonText: {
    color: "#999",
    fontSize: 14,
    fontWeight: "600",
  },

  progressContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: "#2E86AB",
  },
  progressStep: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 6,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },

  infoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  questionContainer: { flex: 1 },

  emoji: { fontSize: 80, marginBottom: 20 },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 24,
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },

  optionsScroll: {
    maxHeight: 400,
  },

  // Group divider label — shown above the first option in each group
  optionGroupLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 6,
    marginLeft: 4,
  },

  optionButton: {
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionButtonSelected: {
    backgroundColor: "#E8F4F8",
    borderWidth: 2,
    borderColor: "#2E86AB",
  },
  optionText: { fontSize: 16 },
  optionTextSelected: {
    color: "#2E86AB",
    fontWeight: "600",
  },

  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    alignItems: "center",
  },

  backText: { fontSize: 16, color: "#666" },

  primaryButton: {
    backgroundColor: "#2E86AB",
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 25,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: { backgroundColor: "#CCC" },

  disclaimerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 14,
    alignItems: "center",
  },
  disclaimerText: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    lineHeight: 16,
  },

  textInput: {
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#DDD",
  },

  // Country search result rows
  countrySearchResult: {
    backgroundColor: "#F0F8FF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#D0E8F5",
  },
  countrySearchResultText: {
    fontSize: 15,
    color: "#1A1A1A",
  },

  // Shown when search text yields no matches
  countrySearchEmpty: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
  },
});

export default OnboardingScreen;