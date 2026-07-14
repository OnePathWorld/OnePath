// src/utils/profileNextAction.js
//
// Pure, read-only, language-free. Derives the single most relevant "next action"
// from the onboarding profile as an ordered rule list (first match wins), so the
// dashboard can lead with something tailored instead of a generic all-clear.
//
// Mirrors caseGuidance / caseProfileBlend by design:
//   • Returns an i18n TEMPLATE KEY (never hardcoded English) plus a `fallback`
//     string that doubles as the i18next defaultValue, so it renders before the
//     locale keys are added.
//   • Never promises outcomes and never gives legal advice — copy is always
//     "may / consider / review / keep an eye," routable to official sources.
//   • Fail-closed: an unknown or empty profile yields the calm all-clear.
//
// `urgency` uses a 3-level vocabulary — "action" (time-sensitive) · "prepare"
// (worth doing, not alarming) · "monitor" (all good / just keep tracking) — which
// drives the card color + icon via NEXT_ACTION_VISUALS below.
//
// Reads only flat onboarding fields; a stale field can't leak in because
// OnboardingScreen prunes orphaned answers (§11) before the profile is saved.

const NS = "profileNextAction";

export const NEXT_ACTION_VISUALS = {
  action: { color: "#F44336", emoji: "⏰" },
  prepare: { color: "#2E86AB", emoji: "📋" },
  monitor: { color: "#4CAF50", emoji: "✅" },
};

function act(id, urgency, fallback) {
  return { templateKey: `${NS}.${id}`, urgency, fallback };
}

export function getProfileNextAction(profile) {
  const p = profile || {};
  const visa = p.currentVisa || "";
  const purpose = p.purpose || "";
  const expiry = p.expiryTimeline || "";
  const gcYears = p.gcYearsHeld || "";
  const compliance = p.complianceRisk || "";
  const location = p.location || "";
  const outsideStage = p.outsideUsStage || "";

  // 1. Status ending imminently — the most time-sensitive thing on the board.
  //    (expiryTimeline is gated out for GC and protection, so this only fires
  //    for people it actually applies to.)
  if (expiry === "expired" || expiry === "30days") {
    return act(
      "expiryImmediate",
      "action",
      "Your status may be ending very soon — look into an extension or change of status right away."
    );
  }

  // 2. A status history that can materially change the options → route to a pro.
  if (
    compliance === "overstay" ||
    compliance === "unauthorized_work" ||
    compliance === "denied"
  ) {
    return act(
      "complianceAttorney",
      "prepare",
      "Your status history can affect your options — a qualified immigration attorney can advise on next steps."
    );
  }

  // 3. Protection seekers are inherently time-sensitive (and have no expiry to
  //    read from) — point them to qualified help rather than a self-serve step.
  if (purpose === "protection") {
    return act(
      "protection",
      "prepare",
      "Protection cases are time-sensitive — consider speaking with an immigration attorney or an accredited representative."
    );
  }

  // 4. Green-card holders: naturalization eligibility by time held.
  if (visa === "GC") {
    if (gcYears === "over5" || gcYears === "3to5" || gcYears === "military") {
      return act(
        "naturalizationEligible",
        "prepare",
        "You may be eligible to apply for U.S. citizenship — review the N-400 requirements to confirm."
      );
    }
    if (gcYears === "2to3") {
      return act(
        "naturalizationSoon",
        "monitor",
        "You're approaching citizenship eligibility — a good time to start gathering your N-400 documents."
      );
    }
    return act(
      "gcMaintain",
      "monitor",
      "Keep your green card valid and track your time toward citizenship eligibility."
    );
  }

  // 5. Green card in progress — the live case tracker is the thing to watch.
  if (visa === "GC_pending") {
    return act(
      "gcPending",
      "monitor",
      "Your green card application is in progress — keep your case tracked for updates."
    );
  }

  // 6. Status on the horizon (a few months out) — plan the next step now.
  if (expiry === "90days" || expiry === "6months") {
    return act(
      "expirySoon",
      "prepare",
      "Plan your renewal or next step before your status expires."
    );
  }

  // 7. Outside the US with a petition moving — prepare for the consular stage.
  if (
    location === "outside_us" &&
    (outsideStage === "petition_approved" ||
      outsideStage === "interview_scheduled")
  ) {
    return act(
      "consularNext",
      "prepare",
      "With your petition moving forward, prepare for your consular interview and the documents it requires."
    );
  }

  // 8. Longer-horizon expiry — nothing pressing, just keep it in view.
  if (expiry === "year" || expiry === "safe") {
    return act(
      "expiryPlanning",
      "monitor",
      "Nothing urgent right now — keep an eye on your status expiry and plan ahead."
    );
  }

  // Fallback: genuinely nothing pressing.
  return act(
    "allClear",
    "monitor",
    "Nothing needs your attention right now."
  );
}