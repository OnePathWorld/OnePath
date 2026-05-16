// src/data/resources.js
// Centralized immigration resources
// Updated: April 2026 — converted to translation-key pattern.
//
// Pattern: data-only file. All user-facing strings (category names,
// resource names, descriptions, service tags) are translation keys
// referenced via i18n.t(). See src/i18n/locales/{en,es,pt,zh}.json
// under the `resources.*` namespace for the actual text.
//
// URLs and phone numbers stay literal — they are not translated.
//
// Render sites should call getResources() / getEmergencyResources() /
// getResourceCategories() to get fully-translated arrays.

import i18n from "../i18n";
import { PROCESSING_TIMES_META } from "./processingTimes";

export const RESOURCES_META = {
  get lastUpdated() {
    return PROCESSING_TIMES_META.lastUpdated;
  },
  // Disclaimer is now a translation key.
  disclaimerKey: "resources.disclaimer",
};

/**
 * Resource category IDs in display order.
 * The "id" is the stable filter key — never translate it. The label
 * comes from translation at render time.
 */
const CATEGORY_IDS_IN_ORDER = ["all", "government", "legal", "nonprofit", "education"];

const CATEGORY_ICONS = {
  all: "📋",
  government: "🏛️",
  legal: "⚖️",
  nonprofit: "🤝",
  education: "🎓",
};

/**
 * Resource entries — order matters and is preserved here.
 * Each entry has:
 *   - id: stable identifier (used in filter logic and i18n key paths)
 *   - category: filter category id
 *   - official: optional flag
 *   - phone / website: literal strings, not translated
 *   - serviceIds: array of stable service identifiers (used to look up
 *     translated labels under resources.items.{id}.services.*)
 */
const RESOURCE_ENTRIES = [
  {
    id: "uscis",
    category: "government",
    official: true,
    phone: "1-800-375-5283",
    website: "https://www.uscis.gov",
    serviceIds: ["forms", "caseStatus", "appointments"],
  },
  {
    id: "dos_visa",
    category: "government",
    official: true,
    website: "https://travel.state.gov",
    serviceIds: ["visaBulletin", "embassyInfo", "ds160"],
  },
  {
    id: "doj_eoir",
    category: "government",
    official: true,
    website: "https://www.justice.gov/eoir",
    serviceIds: ["courtInfo", "hearingNotices"],
  },
  {
    id: "dol_flag",
    category: "government",
    official: true,
    website: "https://flag.dol.gov",
    serviceIds: ["perm", "lca", "prevailingWages"],
  },
  {
    id: "imm_advocates",
    category: "legal",
    website: "https://www.immigrationadvocates.org/legaldirectory/",
    serviceIds: ["proBono", "knowYourRights"],
  },
  {
    id: "lawhelp",
    category: "legal",
    website: "https://www.lawhelp.org",
    serviceIds: ["legalAidDirectory", "stateResources"],
  },
  {
    id: "aila",
    category: "legal",
    website: "https://www.aila.org/find-an-attorney",
    serviceIds: ["referrals", "lawUpdates"],
  },
  {
    id: "catholic_charities",
    category: "nonprofit",
    website: "https://www.catholiccharitiesusa.org",
    serviceIds: ["legalAid", "refugeeServices"],
  },
  {
    id: "raices",
    category: "nonprofit",
    website: "https://www.raicestexas.org",
    serviceIds: ["legalRep", "bondAssistance"],
  },
  {
    id: "clinic",
    category: "nonprofit",
    website: "https://cliniclegal.org",
    serviceIds: ["network", "training", "advocacy"],
  },
  {
    id: "usa_hello",
    category: "education",
    website: "https://usahello.org",
    serviceIds: ["englishClasses", "citizenshipPrep", "gedPrep"],
  },
  {
    id: "uscis_civics",
    category: "education",
    official: true,
    website:
      "https://www.uscis.gov/citizenship/find-study-materials-and-resources",
    serviceIds: ["civicsTestPrep", "studyMaterials", "practiceTests"],
  },
];

/**
 * Emergency resources — phone numbers stay literal,
 * names come from translations.
 */
const EMERGENCY_ENTRIES = [
  { id: "humanTrafficking", phone: "1-888-373-7888" },
  { id: "domesticViolence", phone: "1-800-799-7233" },
  { id: "uscisContactCenter", phone: "1-800-375-5283" },
];

// ============================================================
// HELPERS — these translate at call time
// ============================================================

/**
 * Returns the resource categories array with translated names.
 * Shape:
 *   [{ id, name, icon }, ...]
 */
export function getResourceCategories() {
  return CATEGORY_IDS_IN_ORDER.map((id) => ({
    id,
    name: i18n.t(`resources.categories.${id}`),
    icon: CATEGORY_ICONS[id],
  }));
}

/**
 * Returns the full resources list with translated name, description,
 * and services. URL/phone/category/official are pass-through.
 *
 * Shape:
 *   [{ id, name, category, official, description, phone, website, services }, ...]
 */
export function getResources() {
  return RESOURCE_ENTRIES.map((entry) => {
    const baseKey = `resources.items.${entry.id}`;
    const descriptionKey = `${baseKey}.description`;
    const description = i18n.t(descriptionKey);
    return {
      id: entry.id,
      category: entry.category,
      official: entry.official === true,
      name: i18n.t(`${baseKey}.name`),
      // i18next is configured with returnEmptyString: false, which means
      // an intentionally-empty translation comes back as the key string
      // itself. Detect that case and collapse to "" so we don't render
      // raw keys like "resources.items.doj_eoir.description" in the UI.
      description: description === descriptionKey ? "" : description || "",
      phone: entry.phone || null,
      website: entry.website || null,
      services: (entry.serviceIds || []).map((sid) =>
        i18n.t(`${baseKey}.services.${sid}`)
      ),
    };
  });
}

/**
 * Returns emergency resources with translated names.
 * Shape: [{ name, phone }, ...]
 */
export function getEmergencyResources() {
  return EMERGENCY_ENTRIES.map((entry) => ({
    name: i18n.t(`resources.emergency.${entry.id}`),
    phone: entry.phone,
  }));
}

/**
 * Returns translated meta info.
 */
export function getResourcesMeta() {
  return {
    lastUpdated: RESOURCES_META.lastUpdated,
    disclaimer: i18n.t(RESOURCES_META.disclaimerKey),
  };
}

// ============================================================
// LEGACY EXPORTS — for backward compatibility
// ============================================================
// These are pre-translated at module load time using whatever the
// active language is at that moment. Most consumers should migrate
// to the helpers above (getResources, etc.) which translate at
// call time and respond correctly to language switches.
//
// If you see screens that reference RESOURCES or EMERGENCY_RESOURCES
// directly, update them to call getResources() / getEmergencyResources()
// inside the render so they re-translate when the user switches
// languages.

export const RESOURCE_CATEGORIES = getResourceCategories();
export const RESOURCES = getResources();
export const EMERGENCY_RESOURCES = getEmergencyResources();