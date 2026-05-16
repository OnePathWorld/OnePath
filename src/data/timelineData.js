// src/data/timelineData.js
// Created: April 2026
// Purpose: Process timelines per immigration pathway, using translation-key pattern.
//
// Pattern: data-only file. All user-facing strings (visa labels, totalTime,
// alert text, step title/duration/description) are translation keys
// referenced via i18n.t(). See src/i18n/locales/{en,es,pt,zh}.json under
// the `timelineData.*` namespace.
//
// Render sites should call getTimelinesFor(pathwayId) which returns an
// array of fully-translated visa timelines, each with steps inflated.

import i18n from "../i18n";

const t = (key) => {
  const out = i18n.t(key);
  return out === key ? null : out;
};

// =========================================================
// TIMELINE STRUCTURE
// =========================================================
// Each visa entry has:
//   - key: stable id (used for analytics)
//   - i18nBase: translation key path
//   - hasAlert: whether to look up an alert string
//   - stepCount: number of s1..sN steps to inflate
//   - stepFlags[i]: optional flags per step ({ isWarning, isHighlight })
//
// The order of visas in the array IS the display order in the selector tabs.

const PATHWAY_TIMELINES = {
  work: [
    {
      key: "h1b",
      i18nBase: "timelineData.work.h1b",
      hasAlert: true,
      stepCount: 8,
      // step 6 ($100K Fee) was flagged as warning in original
      stepFlags: { 6: { isWarning: true } },
    },
    {
      key: "l1",
      i18nBase: "timelineData.work.l1",
      stepCount: 5,
    },
    {
      key: "o1",
      i18nBase: "timelineData.work.o1",
      stepCount: 4,
    },
    {
      key: "eb",
      i18nBase: "timelineData.work.eb",
      hasAlert: true,
      stepCount: 5,
      stepFlags: { 5: { isHighlight: true } },
    },
  ],

  family: [
    {
      key: "immediateRelative",
      i18nBase: "timelineData.family.immediateRelative",
      stepCount: 4,
      stepFlags: { 4: { isHighlight: true } },
    },
    {
      key: "f4",
      i18nBase: "timelineData.family.f4",
      hasAlert: true,
      stepCount: 4,
    },
  ],

  student: [
    {
      key: "f1",
      i18nBase: "timelineData.student.f1",
      stepCount: 6,
      stepFlags: { 6: { isHighlight: true } },
    },
    {
      key: "opt",
      i18nBase: "timelineData.student.opt",
      hasAlert: true,
      stepCount: 6,
      stepFlags: { 5: { isHighlight: true } },
    },
  ],

  citizenship: [
    {
      key: "standard5yr",
      i18nBase: "timelineData.citizenship.standard5yr",
      hasAlert: true,
      stepCount: 7,
      stepFlags: { 7: { isHighlight: true } },
    },
    {
      key: "marriage3yr",
      i18nBase: "timelineData.citizenship.marriage3yr",
      hasAlert: true,
      stepCount: 6,
      stepFlags: { 6: { isHighlight: true } },
    },
    {
      key: "military",
      i18nBase: "timelineData.citizenship.military",
      hasAlert: true,
      stepCount: 6,
      stepFlags: { 6: { isHighlight: true } },
    },
  ],
};

// =========================================================
// HELPERS
// =========================================================

function inflateTimeline(def) {
  const base = def.i18nBase;
  const steps = [];
  for (let i = 1; i <= def.stepCount; i++) {
    const stepBase = `${base}.steps.s${i}`;
    const stepFlags = (def.stepFlags && def.stepFlags[i]) || {};
    steps.push({
      title: t(`${stepBase}.title`),
      duration: t(`${stepBase}.duration`),
      description: t(`${stepBase}.description`),
      ...stepFlags,
    });
  }

  const out = {
    key: def.key,
    visa: t(`${base}.label`),
    totalTime: t(`${base}.totalTime`),
    steps,
  };

  if (def.hasAlert) {
    const alert = t(`${base}.alert`);
    if (alert) out.alert = alert;
  }

  return out;
}

/**
 * Returns translated timelines for a pathway.
 * Shape: array of { key, visa, totalTime, alert?, steps: [{title, duration, description, isWarning?, isHighlight?}] }
 *
 * Falls back to "work" if pathway is unknown (matching original behavior:
 * `return timelines[pathway] || timelines.work`).
 */
export function getTimelinesFor(pathwayId) {
  const defs = PATHWAY_TIMELINES[pathwayId] || PATHWAY_TIMELINES.work;
  return defs.map(inflateTimeline);
}

export default {
  getTimelinesFor,
};