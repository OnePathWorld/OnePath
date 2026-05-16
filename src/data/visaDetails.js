// src/data/visaDetails.js
// PURPOSE: Per-visa metadata for PathwayDetailScreen (fullName, purpose,
//          eligibility, pros, cons, forms, etc.)
//
// All user-facing strings live in src/i18n/locales/{en,es,pt,zh,ht}.json
// under the `visaDetails.*` namespace. This file translates that
// object-of-objects shape into the array shape PathwayDetailScreen consumes,
// and exposes a single getter: getVisaDetails(visaKey) -> object | null.
//
// VISA KEYS WITH FULL DETAILS (as of v1.2):
//   Work:         H1B, L1, O1
//   Family:       IR, F1, F2A, F2B, F3, F4
//   Student:      STUDENT, J1
//   Citizenship:  N400_5YR, N400_3YR, N400_MIL, N600
//
// VISA KEYS WITHOUT FULL DETAILS (graceful null fallback):
//   EB, K1, M1, ASYLUM, REFUGEE — pathwaysData provides name/description/
//   processing times/fees, so cards still render. Rich detail section is
//   simply not shown for these.
//
// To add details for the missing keys, populate the corresponding block
// under `visaDetails.*` in en.json (and the other locales) following the
// same shape as the existing entries.

import i18n from "../i18n";

// =========================================================
// HELPERS
// =========================================================

// Translate a single key, returning null if the key isn't present
// (i18next returns the literal key when missing — we treat that as null
// so consumers can use optional chaining / falsy checks).
const tOrNull = (key) => {
  const out = i18n.t(key);
  return out === key ? null : out;
};

// Convert an i18n object-of-objects ({e1: "...", e2: "..."}) into an array.
// Stops as soon as a key is missing, so en.json can have e1...e8 with no
// padding required for shorter lists.
function objectToArray(basePath, prefix) {
  const out = [];
  for (let i = 1; i <= 20; i++) {
    const v = tOrNull(`${basePath}.${prefix}${i}`);
    if (v == null) break;
    out.push(v);
  }
  return out;
}

// Forms have a nested shape: visaDetails.X.forms.f1.{name,purpose,who,link?}
function buildFormsArray(basePath) {
  const out = [];
  for (let i = 1; i <= 20; i++) {
    const formBase = `${basePath}.forms.f${i}`;
    const name = tOrNull(`${formBase}.name`);
    if (name == null) break;
    const form = {
      name,
      purpose: tOrNull(`${formBase}.purpose`),
      who: tOrNull(`${formBase}.who`),
    };
    const link = tOrNull(`${formBase}.link`);
    if (link) form.link = link;
    out.push(form);
  }
  return out;
}

// =========================================================
// MAIN EXPORT
// =========================================================

/**
 * Return per-visa detail metadata for the requested visa key, or null
 * if no entry exists in the visaDetails namespace.
 *
 * Shape returned:
 *   {
 *     fullName:         string,
 *     purpose:          string,
 *     note?:            string,
 *     duration:         string,
 *     currentWait?:     string,
 *     pathToGreenCard?: string,
 *     spouseWork?:      string,
 *     eligibility:      string[],
 *     pros:             string[],
 *     cons:             string[],
 *     forms:            Array<{name, purpose, who, link?}>,
 *   }
 */
export function getVisaDetails(visaKey) {
  if (!visaKey) return null;

  const base = `visaDetails.${visaKey}`;

  // Use fullName as the existence check — every visa entry in en.json has it.
  // If it's missing, this visa has no rich detail data; return null and let
  // PathwayDetailScreen fall back to whatever pathwaysData provides.
  const fullName = tOrNull(`${base}.fullName`);
  if (fullName == null) return null;

  return {
    fullName,
    purpose: tOrNull(`${base}.purpose`),
    note: tOrNull(`${base}.note`),
    duration: tOrNull(`${base}.duration`),
    currentWait: tOrNull(`${base}.currentWait`),
    pathToGreenCard: tOrNull(`${base}.pathToGreenCard`),
    spouseWork: tOrNull(`${base}.spouseWork`),
    eligibility: objectToArray(`${base}.eligibility`, "e"),
    pros: objectToArray(`${base}.pros`, "p"),
    cons: objectToArray(`${base}.cons`, "c"),
    forms: buildFormsArray(base),
  };
}