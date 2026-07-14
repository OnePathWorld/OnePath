// src/utils/onboardingLogic.js
//
// Pure, read-only, language-free helpers extracted from OnboardingScreen so they
// can be unit-tested without pulling React Native, AsyncStorage, or analytics
// into the test. No imports, no side effects — every function is deterministic.

// ── §7 inference maps ────────────────────────────────────────────────────────
// Visas whose work-authorization is unambiguous, so hasWorkAuth is inferred at
// completion rather than asked. Anything NOT listed — F1, J1, GC_pending, other,
// none — is genuinely ambiguous and still asked. GC is excluded by its own gate
// and left untouched (hasWorkAuth stays "" for GC).
export const WORK_AUTH_BY_VISA = {
  H1B: "yes_restricted", // employer-sponsored, tied to a specific employer
  L1: "yes_restricted", // intracompany transfer, employer-specific
  EAD: "yes_ead", // the status itself is an EAD
  OPT: "yes_ead", // OPT work authorization is documented via an EAD
  B1B2: "no", // visitor status — not work-authorized
};

// Urgency is inferable from how soon the user's status expires, so the standalone
// urgency question is skipped for anyone who answers expiryTimeline (every
// non-protection user) and derived here at completion. Protection users have no
// expiry to read, so they are still asked urgency directly.
export const URGENCY_BY_EXPIRY = {
  expired: "immediate",
  "30days": "immediate",
  "90days": "soon",
  "6months": "soon",
  year: "planning",
  safe: "planning",
};

// ── §10 sensitive-answer redaction ───────────────────────────────────────────
// Question IDs whose ANSWER VALUE must never leave the device. complianceRisk
// asks about overstays / unauthorized work / denials, and its onboarding screen
// promises "your answers stay private on your device." We still track that the
// step completed (funnel analytics), but redact the value uniformly — every
// option, including "none"/"prefer_not", so the redaction itself can't reveal
// which users chose a sensitive answer. Applied at every ONBOARDING_STEP site.
export const SENSITIVE_ANSWER_QUESTIONS = new Set(["complianceRisk"]);

export const redactAnswer = (questionId, answer) =>
  SENSITIVE_ANSWER_QUESTIONS.has(questionId) ? "[redacted]" : answer;

// ── §11 back-navigation cleanup ──────────────────────────────────────────────
// When a gating answer changes on back-navigation, downstream answers can be
// left stranded — e.g. gcYearsHeld after switching off GC, expiryTimeline after
// switching to protection, a GC-only purpose after switching to a non-GC visa.
// Mid-flow the screen keeps them (re-showing a question with its prior answer is
// helpful), but at completion we drop any answer whose question isn't reachable
// under the final answers, so the saved profile carries no contradictory fields.
// A field is orphaned only if NONE of its question variants is currently visible
// (purpose has a GC and a non-GC variant); always-on questions are never pruned.
// Non-question fields (language, countrySpecified) aren't touched.
export const pruneOrphanedAnswers = (profile, questions) => {
  const byId = {};
  for (const q of questions) (byId[q.id] = byId[q.id] || []).push(q);

  const pruned = { ...profile };
  for (const [id, variants] of Object.entries(byId)) {
    const alwaysOn = variants.some((q) => typeof q.showIf !== "function");
    const visibleVariants = variants.filter(
      (q) => typeof q.showIf !== "function" || q.showIf(profile)
    );

    // No variant reachable under the current answers → orphaned, clear it.
    if (visibleVariants.length === 0) {
      pruned[id] = "";
      continue;
    }
    // Always-on questions (e.g. countryOfCitizenship, which also accepts a
    // free-text value outside its option list) are never pruned.
    if (alwaysOn) continue;

    // A variant IS visible, but the stored value may be stale from a sibling
    // variant with a different option set — e.g. a GC-only "citizenship" purpose
    // left behind after switching to a non-GC visa, where the non-GC purpose
    // question is shown but doesn't offer "citizenship". canProceed only checks
    // non-empty, so without this it would save an invalid value. Clear it unless
    // it's valid for at least one visible variant.
    const val = pruned[id];
    if (!val) continue;
    const validForSomeVisible = visibleVariants.some((q) => {
      if (!Array.isArray(q.options)) return true; // no fixed set → don't judge
      if (q.hasTextInput && val === q.textInputShowIf) return true;
      return q.options.some((o) => o.value === val);
    });
    if (!validForSomeVisible) pruned[id] = "";
  }
  return pruned;
};

// ── §7 inference application ──────────────────────────────────────────────────
// Fill values for questions skipped by inference. Runs at completion, AFTER
// pruneOrphanedAnswers (so a stale expiryTimeline can't seed a wrong urgency):
//   • hasWorkAuth from the visa — the visa is authoritative, so this also
//     corrects a stale answer if the user changed visa. Ambiguous visas aren't
//     in the map, so an explicit answer is preserved.
//   • urgency from expiry — but ONLY when urgency is empty, so a protection
//     user's direct answer is never overwritten by a stale expiryTimeline.
export function applyProfileInference(profile) {
  const p = profile || {};
  const inferredWorkAuth = WORK_AUTH_BY_VISA[p.currentVisa];
  const inferredUrgency = URGENCY_BY_EXPIRY[p.expiryTimeline];
  return {
    ...p,
    ...(inferredWorkAuth ? { hasWorkAuth: inferredWorkAuth } : {}),
    ...(inferredUrgency && !p.urgency ? { urgency: inferredUrgency } : {}),
  };
}