// src/data/countries.js
// -----------------------------------------------------------------
// SHARED COUNTRY DATA — single source of truth
// -----------------------------------------------------------------
// Previously COUNTRY_SEARCH_LIST lived inline in OnboardingScreen.js and
// SettingsScreen.js kept its own hardcoded 12-country quick-pick with no
// search box. The two drifted (Brazil/Philippines were in opposite order)
// and the Caribbean countries that back countrySpecificTips.js
// (jamaica, cuba, trinidad_tobago, dominican_republic, grenada, etc.)
// were unreachable AND undisplayable from Settings — selecting "Other"
// there overwrote the stored value with the literal string "other",
// silently disabling the country-specific tips.
//
// Both screens now import from here.
//
// IMPORTANT: `value` strings are persisted to AsyncStorage and used by
// analytics + country-keyed data lookups (countrySpecificTips, embassyWaits,
// BACKLOG_COUNTRIES). They are stable identifiers — DO NOT rename them.
// Only the human-facing labels are translated/derived.
// -----------------------------------------------------------------

// Pinned quick-pick countries, in canonical order (language match + active
// migration volume). Labels are resolved per-screen via t() so each screen
// keeps its own i18n namespace. "other" is appended by the option builder.
export const PRIMARY_COUNTRY_VALUES = [
  "mexico",
  "india",
  "china",
  "haiti",
  "philippines",
  "brazil",
  "nigeria",
  "canada",
  "uk",
  "germany",
  "south_korea",
  "japan",
];

// Full searchable list (flag + English label). Shown when the user picks
// "Other". Labels are intentionally NOT translated — they are proper nouns
// with flags and are searched as-is.
export const COUNTRY_SEARCH_LIST = [
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

// Fast value -> search-list label lookup.
const SEARCH_LABEL_BY_VALUE = COUNTRY_SEARCH_LIST.reduce((acc, c) => {
  acc[c.value] = c.label;
  return acc;
}, {});

/**
 * Build the pinned quick-pick options for a screen. Each value is mapped to
 * its translated label under `keyPrefix`, then an "other" entry is appended.
 *
 * @param {Function} t          i18next translate fn (locale-aware)
 * @param {string}   keyPrefix  e.g. "settings.fieldOptions.countryOfCitizenship.options"
 * @returns {{value: string, label: string}[]}
 */
export function buildPrimaryCountryOptions(t, keyPrefix) {
  const options = PRIMARY_COUNTRY_VALUES.map((value) => ({
    value,
    label: t(`${keyPrefix}.${value}`),
  }));
  options.push({ value: "other", label: t(`${keyPrefix}.other`) });
  return options;
}

/**
 * Humanize an unknown stored value as a last resort.
 * "trinidad_tobago" -> "Trinidad Tobago"
 */
function humanize(value) {
  return String(value)
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Resolve a stored countryOfCitizenship value to a human-facing label.
 * Resolution order:
 *   1. pinned quick-pick (and "other") -> translated label via t()
 *   2. full search list                -> flag + English label
 *   3. countrySpecified (label captured at search-select time, if present)
 *   4. humanized fallback
 *
 * @param {string}   value            stored value, e.g. "jamaica"
 * @param {Function} t                i18next translate fn
 * @param {string}   keyPrefix        i18n prefix for the pinned options
 * @param {string}   [countrySpecified] optional label saved alongside value
 */
export function getCountryLabel(value, t, keyPrefix, countrySpecified) {
  if (!value) return "";
  if (value === "other" || PRIMARY_COUNTRY_VALUES.includes(value)) {
    return t(`${keyPrefix}.${value}`);
  }
  if (SEARCH_LABEL_BY_VALUE[value]) return SEARCH_LABEL_BY_VALUE[value];
  if (countrySpecified) return countrySpecified;
  return humanize(value);
}

/**
 * Filter the search list for a query, capped at `limit` results.
 * Matches the onboarding behaviour (case-insensitive label substring).
 */
export function filterCountrySearch(query, limit = 6) {
  const q = String(query || "").toLowerCase().trim();
  if (q.length === 0) return [];
  return COUNTRY_SEARCH_LIST.filter((c) =>
    c.label.toLowerCase().includes(q)
  ).slice(0, limit);
}

/**
 * Look up the flag + English label for a value in the full search list.
 * Returns undefined if the value isn't in the list. Used by callers that
 * have their own primary/pinned label source (e.g. utils/labels.js) and
 * only need the full-list fallback for non-pinned countries.
 *
 * @param {string} value e.g. "jamaica"
 * @returns {string|undefined} e.g. "🇯🇲 Jamaica"
 */
export function getSearchCountryLabel(value) {
  return SEARCH_LABEL_BY_VALUE[value];
}