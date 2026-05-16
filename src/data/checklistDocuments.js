// src/data/checklistDocuments.js
// Created: April 2026
// Purpose: Document requirements per immigration pathway, using translation-key pattern.
//
// Pattern: data-only file. All user-facing strings (document names, descriptions,
// quantity/who/whenNeeded/cost annotations) are translation keys referenced via
// i18n.t(). See src/i18n/locales/{en,es,pt,zh}.json under the
// `checklistDocuments.*` namespace.
//
// Render sites should call getPathwayDocuments(pathwayId) which returns a
// fully-translated structure with `required`, `oneOf`, and `recommended`
// arrays. Universal/medical/interview-prep sections are also exposed via
// getCommonDocuments(), getMedicalDocuments(), getInterviewPrepDocuments().

import i18n from "../i18n";

const t = (key) => {
  const out = i18n.t(key);
  // i18next returns the key itself when missing — return null so the
  // consumer can ignore the field cleanly (e.g. don't render an empty
  // "quantity" line).
  return out === key ? null : out;
};

// =========================================================
// PATHWAY DOCUMENT STRUCTURE
// =========================================================
// Each entry has:
//   - id: stable identifier (used in checked-items state and analytics)
//   - i18nBase: translation key path
//   - required / alternative: data flags (NOT translated)
//   - hasQuantity / hasWho / hasWhenNeeded / hasCost: tells the helper
//     which optional translation fields to look up
//
// Document IDs MUST match the IDs the screen uses for AsyncStorage state.

const PATHWAY_DOCUMENTS = {
  work: {
    required: [
      { id: "passport", i18nBase: "checklistDocuments.work.required.passport", required: true },
      { id: "photos", i18nBase: "checklistDocuments.work.required.photos", required: true, hasQuantity: true },
      { id: "ds160", i18nBase: "checklistDocuments.work.required.ds160", required: true },
      { id: "i129", i18nBase: "checklistDocuments.work.required.i129", required: true, hasWho: true },
      { id: "lca", i18nBase: "checklistDocuments.work.required.lca", required: true, hasWho: true },
      { id: "degree", i18nBase: "checklistDocuments.work.required.degree", required: true },
      { id: "resume", i18nBase: "checklistDocuments.work.required.resume", required: true },
    ],
    oneOf: [
      { id: "employment_letter", i18nBase: "checklistDocuments.work.oneOf.employment_letter", alternative: true },
      { id: "employment_contract", i18nBase: "checklistDocuments.work.oneOf.employment_contract", alternative: true },
    ],
    recommended: [
      { id: "experience_letters", i18nBase: "checklistDocuments.work.recommended.experience_letters" },
      { id: "awards", i18nBase: "checklistDocuments.work.recommended.awards" },
    ],
  },

  family: {
    required: [
      { id: "passport", i18nBase: "checklistDocuments.family.required.passport", required: true },
      { id: "photos", i18nBase: "checklistDocuments.family.required.photos", required: true, hasQuantity: true },
      { id: "ds260", i18nBase: "checklistDocuments.family.required.ds260", required: true },
      { id: "i130", i18nBase: "checklistDocuments.family.required.i130", required: true, hasWho: true },
      { id: "birth_cert", i18nBase: "checklistDocuments.family.required.birth_cert", required: true },
      { id: "marriage_cert", i18nBase: "checklistDocuments.family.required.marriage_cert", required: true, hasWhenNeeded: true },
      { id: "i864", i18nBase: "checklistDocuments.family.required.i864", required: true, hasWho: true },
      { id: "police_cert", i18nBase: "checklistDocuments.family.required.police_cert", required: true },
    ],
    oneOf: [
      { id: "petitioner_citizenship", i18nBase: "checklistDocuments.family.oneOf.petitioner_citizenship", alternative: true },
      { id: "petitioner_greencard", i18nBase: "checklistDocuments.family.oneOf.petitioner_greencard", alternative: true },
    ],
    recommended: [
      { id: "photos_together", i18nBase: "checklistDocuments.family.recommended.photos_together" },
      { id: "correspondence", i18nBase: "checklistDocuments.family.recommended.correspondence" },
      { id: "joint_accounts", i18nBase: "checklistDocuments.family.recommended.joint_accounts" },
    ],
  },

  student: {
    required: [
      { id: "passport", i18nBase: "checklistDocuments.student.required.passport", required: true },
      { id: "photos", i18nBase: "checklistDocuments.student.required.photos", required: true, hasQuantity: true },
      { id: "ds160", i18nBase: "checklistDocuments.student.required.ds160", required: true },
      { id: "i20", i18nBase: "checklistDocuments.student.required.i20", required: true, hasWho: true },
      { id: "sevis", i18nBase: "checklistDocuments.student.required.sevis", required: true },
      { id: "acceptance", i18nBase: "checklistDocuments.student.required.acceptance", required: true },
      { id: "transcripts", i18nBase: "checklistDocuments.student.required.transcripts", required: true },
      { id: "financial_proof", i18nBase: "checklistDocuments.student.required.financial_proof", required: true },
    ],
    oneOf: [
      { id: "test_scores", i18nBase: "checklistDocuments.student.oneOf.test_scores", alternative: true },
      { id: "english_medium", i18nBase: "checklistDocuments.student.oneOf.english_medium", alternative: true },
    ],
    recommended: [
      { id: "sponsor_letter", i18nBase: "checklistDocuments.student.recommended.sponsor_letter" },
      { id: "study_plan", i18nBase: "checklistDocuments.student.recommended.study_plan" },
      { id: "gre_gmat", i18nBase: "checklistDocuments.student.recommended.gre_gmat" },
    ],
  },

  citizenship: {
    required: [
      { id: "n400", i18nBase: "checklistDocuments.citizenship.required.n400", required: true, hasWho: true },
      { id: "green_card_copy", i18nBase: "checklistDocuments.citizenship.required.green_card_copy", required: true },
      { id: "passport_photos", i18nBase: "checklistDocuments.citizenship.required.passport_photos", required: true, hasQuantity: true },
      { id: "passport_copy", i18nBase: "checklistDocuments.citizenship.required.passport_copy", required: true },
      { id: "tax_returns", i18nBase: "checklistDocuments.citizenship.required.tax_returns", required: true },
      { id: "travel_records", i18nBase: "checklistDocuments.citizenship.required.travel_records", required: true },
      { id: "selective_service", i18nBase: "checklistDocuments.citizenship.required.selective_service", required: true, hasWhenNeeded: true },
    ],
    oneOf: [
      { id: "marriage_cert_3yr", i18nBase: "checklistDocuments.citizenship.oneOf.marriage_cert_3yr", alternative: true, hasWhenNeeded: true },
      { id: "dd214", i18nBase: "checklistDocuments.citizenship.oneOf.dd214", alternative: true, hasWhenNeeded: true },
    ],
    recommended: [
      { id: "birth_cert_citizenship", i18nBase: "checklistDocuments.citizenship.recommended.birth_cert_citizenship" },
      { id: "prior_marriage_docs", i18nBase: "checklistDocuments.citizenship.recommended.prior_marriage_docs" },
      { id: "criminal_records", i18nBase: "checklistDocuments.citizenship.recommended.criminal_records", hasWhenNeeded: true },
      { id: "name_change", i18nBase: "checklistDocuments.citizenship.recommended.name_change" },
      { id: "civics_study", i18nBase: "checklistDocuments.citizenship.recommended.civics_study" },
    ],
  },
};

// Universal sections — appended for non-citizenship pathways
const COMMON_DOCUMENTS = [
  { id: "interview_appt", i18nBase: "checklistDocuments.common.interview_appt", required: true },
  { id: "fee_receipt", i18nBase: "checklistDocuments.common.fee_receipt", required: true },
];

const MEDICAL_DOCUMENTS = [
  { id: "medical_exam", i18nBase: "checklistDocuments.medical.medical_exam", hasWhenNeeded: true, hasCost: true },
  { id: "vaccinations", i18nBase: "checklistDocuments.medical.vaccinations", hasWhenNeeded: true },
];

// Interview prep — citizenship only
const INTERVIEW_PREP_DOCUMENTS = [
  { id: "civics_100", i18nBase: "checklistDocuments.interviewPrep.civics_100", hasWhenNeeded: true },
  { id: "english_reading", i18nBase: "checklistDocuments.interviewPrep.english_reading", hasWhenNeeded: true },
  { id: "english_writing", i18nBase: "checklistDocuments.interviewPrep.english_writing", hasWhenNeeded: true },
  { id: "n400_review", i18nBase: "checklistDocuments.interviewPrep.n400_review", hasWhenNeeded: true },
];

// =========================================================
// HELPERS — translate at call time so language switches reflect immediately
// =========================================================

function inflateDoc(def) {
  const base = def.i18nBase;
  const out = {
    id: def.id,
    name: t(`${base}.name`),
    description: t(`${base}.description`),
  };
  if (def.required) out.required = true;
  if (def.alternative) out.alternative = true;
  if (def.hasQuantity) {
    const q = t(`${base}.quantity`);
    if (q) out.quantity = q;
  }
  if (def.hasWho) {
    const w = t(`${base}.who`);
    if (w) out.who = w;
  }
  if (def.hasWhenNeeded) {
    const wn = t(`${base}.whenNeeded`);
    if (wn) out.whenNeeded = wn;
  }
  if (def.hasCost) {
    const c = t(`${base}.cost`);
    if (c) out.cost = c;
  }
  return out;
}

/**
 * Returns translated document structure for a pathway.
 * Shape:
 *   { required: [{...}], oneOf: [{...}], recommended: [{...}] }
 * Returns empty arrays for unknown pathway.
 */
export function getPathwayDocuments(pathwayId) {
  const defs = PATHWAY_DOCUMENTS[pathwayId];
  if (!defs) return { required: [], oneOf: [], recommended: [] };
  return {
    required: (defs.required || []).map(inflateDoc),
    oneOf: (defs.oneOf || []).map(inflateDoc),
    recommended: (defs.recommended || []).map(inflateDoc),
  };
}

export function getCommonDocuments() {
  return COMMON_DOCUMENTS.map(inflateDoc);
}

export function getMedicalDocuments() {
  return MEDICAL_DOCUMENTS.map(inflateDoc);
}

export function getInterviewPrepDocuments() {
  return INTERVIEW_PREP_DOCUMENTS.map(inflateDoc);
}

export default {
  getPathwayDocuments,
  getCommonDocuments,
  getMedicalDocuments,
  getInterviewPrepDocuments,
};