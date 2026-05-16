// src/data/lifeSetupGuides.js
// Created: April 2026
// Purpose: Shared guide content between LifeSetupScreen and GuideDetailScreen.
//
// Pattern: data-only file. All user-facing strings (title, description,
// shortDescription, section titles, content bullet items) are translation
// keys referenced via i18n.t(). See src/i18n/locales/{en,es,pt,zh}.json
// under the `lifeSetupGuides.*` namespace.
//
// Stable per-guide values (NOT translated): id, icon, color.
//
// Render sites should call getLifeSetupGuide(id) which returns a fully
// translated object: { id, title, description, shortDescription?, icon,
// color, guides: [{ title, content: [...] }] }

import i18n from "../i18n";

const t = (key) => {
  const out = i18n.t(key);
  return out === key ? null : out;
};

// =========================================================
// GUIDE STRUCTURE — stable id/icon/color + per-section content counts
// =========================================================

const GUIDE_DEFINITIONS = {
  ssn: {
    icon: "🆔",
    color: "#4CAF50",
    sections: [
      { i18nKey: "s1", contentCount: 4 },
      { i18nKey: "s2", contentCount: 5 },
      { i18nKey: "s3", contentCount: 4 },
    ],
  },
  banking: {
    icon: "🏦",
    color: "#2196F3",
    sections: [
      { i18nKey: "s1", contentCount: 5 },
      { i18nKey: "s2", contentCount: 5 },
      { i18nKey: "s3", contentCount: 4 },
    ],
  },
  credit: {
    icon: "💳",
    color: "#FF9800",
    sections: [
      { i18nKey: "s1", contentCount: 6 },
      { i18nKey: "s2", contentCount: 4 },
      { i18nKey: "s3", contentCount: 5 },
    ],
  },
  job: {
    icon: "💼",
    color: "#9C27B0",
    sections: [
      { i18nKey: "s1", contentCount: 5 },
      { i18nKey: "s2", contentCount: 6 },
      { i18nKey: "s3", contentCount: 6 },
    ],
  },
  itin: {
    icon: "📄",
    color: "#4CAF50",
    sections: [
      { i18nKey: "s1", contentCount: 4 },
      { i18nKey: "s2", contentCount: 5 },
    ],
  },
  dmv: {
    icon: "🚗",
    color: "#2196F3",
    sections: [
      { i18nKey: "s1", contentCount: 5 },
      { i18nKey: "s2", contentCount: 5 },
    ],
  },
  healthcare: {
    icon: "🏥",
    color: "#FF9800",
    sections: [
      { i18nKey: "s1", contentCount: 5 },
      { i18nKey: "s2", contentCount: 6 },
    ],
  },
  tax: {
    icon: "📄",
    color: "#4CAF50",
    sections: [
      { i18nKey: "s1", contentCount: 5 },
      { i18nKey: "s2", contentCount: 5 },
      { i18nKey: "s3", contentCount: 5 },
    ],
  },
};

// =========================================================
// HELPERS
// =========================================================

function inflateContent(base, count) {
  const out = [];
  for (let i = 1; i <= count; i++) {
    const val = t(`${base}.c${i}`);
    if (val) out.push(val);
  }
  return out;
}

function inflateSection(guideBase, sectionDef) {
  const sectionBase = `${guideBase}.sections.${sectionDef.i18nKey}`;
  return {
    title: t(`${sectionBase}.title`),
    content: inflateContent(`${sectionBase}.content`, sectionDef.contentCount),
  };
}

/**
 * Returns translated guide for an id.
 * Returns null for unknown ids.
 *
 * Shape: { id, title, description, shortDescription?, icon, color,
 *          guides: [{ title, content: [...] }] }
 *
 * Note: the field is named `guides` (plural) on the returned object to
 * match the original LifeSetupScreen + GuideDetailScreen prop expectations.
 * The screens iterate `guide.guides` to render sections.
 */
export function getLifeSetupGuide(id) {
  const def = GUIDE_DEFINITIONS[id];
  if (!def) return null;

  const base = `lifeSetupGuides.${id}`;
  const out = {
    id,
    title: t(`${base}.title`),
    description: t(`${base}.description`),
    icon: def.icon,
    color: def.color,
    guides: def.sections.map((s) => inflateSection(base, s)),
  };

  // shortDescription is only present on resource-style guides (itin/dmv/healthcare)
  const shortDesc = t(`${base}.shortDescription`);
  if (shortDesc) out.shortDescription = shortDesc;

  return out;
}

export default { getLifeSetupGuide };