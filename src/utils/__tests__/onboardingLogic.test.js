// src/utils/_tests_/onboardingLogic.test.js
import {
  WORK_AUTH_BY_VISA,
  URGENCY_BY_EXPIRY,
  redactAnswer,
  pruneOrphanedAnswers,
  applyProfileInference,
} from "../onboardingLogic";

// ── Minimal questions fixture mirroring the real gating + option sets ─────────
const opts = (...v) => v.map((x) => ({ value: x }));
const QUESTIONS = [
  { id: "location", options: opts("inside_us", "outside_us") }, // always-on
  {
    id: "outsideUsStage",
    showIf: (p) => p.location === "outside_us",
    options: opts("no_case", "petition_filed", "petition_approved", "interview_scheduled", "has_us_visa", "exploring"),
  },
  {
    id: "hasReceiptNumber",
    showIf: (p) =>
      p.location === "outside_us" &&
      ["petition_filed", "petition_approved", "interview_scheduled"].includes(p.outsideUsStage),
    options: opts("yes", "no"),
  },
  {
    id: "currentVisa",
    showIf: (p) => p.location === "inside_us",
    options: opts("H1B", "L1", "EAD", "F1", "OPT", "J1", "GC", "GC_pending", "B1B2", "other", "none"),
  },
  {
    id: "gcYearsHeld",
    showIf: (p) => p.location === "inside_us" && p.currentVisa === "GC",
    options: opts("under2", "2to3", "3to5", "over5", "military"),
  },
  { id: "purpose", showIf: (p) => p.currentVisa !== "GC", options: opts("work", "family", "study", "protection") },
  { id: "purpose", showIf: (p) => p.location === "inside_us" && p.currentVisa === "GC", options: opts("citizenship", "family", "work") },
  {
    id: "urgency",
    showIf: (p) => p.location === "inside_us" && p.currentVisa !== "GC" && p.purpose === "protection",
    options: opts("immediate", "soon", "planning"),
  },
  {
    id: "hasWorkAuth",
    showIf: (p) => p.location === "inside_us" && p.currentVisa !== "GC" && WORK_AUTH_BY_VISA[p.currentVisa] === undefined,
    options: opts("yes_unrestricted", "yes_restricted", "yes_ead", "pending", "no"),
  },
  { id: "countryOfCitizenship", options: opts("IN", "CN", "MX", "other"), hasTextInput: true, textInputShowIf: "other" }, // always-on
  {
    id: "expiryTimeline",
    showIf: (p) =>
      p.purpose !== "protection" &&
      p.currentVisa !== "GC" &&
      (p.location === "inside_us" || (p.location === "outside_us" && p.outsideUsStage === "has_us_visa")),
    options: opts("expired", "30days", "90days", "6months", "year", "safe"),
  },
  {
    id: "complianceRisk",
    showIf: (p) => p.location === "inside_us" && p.currentVisa !== "GC",
    options: opts("none", "gap", "unauthorized_work", "overstay", "denied", "prefer_not"),
  },
];

const prune = (profile) => pruneOrphanedAnswers(profile, QUESTIONS);

describe("inference maps", () => {
  it("WORK_AUTH_BY_VISA covers the unambiguous visas only", () => {
    expect(WORK_AUTH_BY_VISA.H1B).toBe("yes_restricted");
    expect(WORK_AUTH_BY_VISA.L1).toBe("yes_restricted");
    expect(WORK_AUTH_BY_VISA.OPT).toBe("yes_ead");
    expect(WORK_AUTH_BY_VISA.EAD).toBe("yes_ead");
    expect(WORK_AUTH_BY_VISA.B1B2).toBe("no");
    expect(WORK_AUTH_BY_VISA.F1).toBe(undefined); // ambiguous — still asked
    expect(WORK_AUTH_BY_VISA.GC).toBe(undefined); // gated out separately
  });

  it("URGENCY_BY_EXPIRY maps every expiry bucket", () => {
    expect(URGENCY_BY_EXPIRY.expired).toBe("immediate");
    expect(URGENCY_BY_EXPIRY["30days"]).toBe("immediate");
    expect(URGENCY_BY_EXPIRY["90days"]).toBe("soon");
    expect(URGENCY_BY_EXPIRY["6months"]).toBe("soon");
    expect(URGENCY_BY_EXPIRY.year).toBe("planning");
    expect(URGENCY_BY_EXPIRY.safe).toBe("planning");
    expect(URGENCY_BY_EXPIRY[""]).toBe(undefined);
  });
});

describe("redactAnswer", () => {
  it("redacts every complianceRisk value uniformly (incl. benign ones)", () => {
    ["none", "gap", "unauthorized_work", "overstay", "denied", "prefer_not"].forEach((v) => {
      expect(redactAnswer("complianceRisk", v)).toBe("[redacted]");
    });
  });

  it("passes through non-sensitive answers unchanged", () => {
    expect(redactAnswer("currentVisa", "H1B")).toBe("H1B");
    expect(redactAnswer("purpose", "work")).toBe("work");
    expect(redactAnswer("gcYearsHeld", "over5")).toBe("over5");
  });
});

describe("applyProfileInference", () => {
  it("infers hasWorkAuth from an unambiguous visa", () => {
    expect(applyProfileInference({ currentVisa: "H1B" }).hasWorkAuth).toBe("yes_restricted");
    expect(applyProfileInference({ currentVisa: "OPT" }).hasWorkAuth).toBe("yes_ead");
  });

  it("visa is authoritative — corrects a stale hasWorkAuth", () => {
    expect(applyProfileInference({ currentVisa: "H1B", hasWorkAuth: "no" }).hasWorkAuth).toBe("yes_restricted");
  });

  it("leaves hasWorkAuth untouched for an ambiguous visa", () => {
    expect(applyProfileInference({ currentVisa: "F1", hasWorkAuth: "yes_ead" }).hasWorkAuth).toBe("yes_ead");
    expect(applyProfileInference({ currentVisa: "F1" }).hasWorkAuth).toBe(undefined);
  });

  it("does not infer work-auth for GC", () => {
    expect(applyProfileInference({ currentVisa: "GC" }).hasWorkAuth).toBe(undefined);
  });

  it("infers urgency from expiry only when urgency is empty", () => {
    expect(applyProfileInference({ expiryTimeline: "30days" }).urgency).toBe("immediate");
    expect(applyProfileInference({ expiryTimeline: "year" }).urgency).toBe("planning");
  });

  it("never overrides an explicit urgency (protection user)", () => {
    expect(
      applyProfileInference({ expiryTimeline: "30days", urgency: "planning" }).urgency
    ).toBe("planning");
  });

  it("is fail-safe on null", () => {
    expect(applyProfileInference(null).hasWorkAuth).toBe(undefined);
  });
});

describe("pruneOrphanedAnswers", () => {
  it("clears gcYearsHeld after switching off GC", () => {
    const r = prune({ location: "inside_us", currentVisa: "F1", gcYearsHeld: "over5", purpose: "study" });
    expect(r.gcYearsHeld).toBe("");
    expect(r.purpose).toBe("study");
  });

  it("clears expiryTimeline after switching to protection", () => {
    const r = prune({ location: "inside_us", currentVisa: "F1", purpose: "protection", expiryTimeline: "90days" });
    expect(r.expiryTimeline).toBe("");
    expect(r.purpose).toBe("protection");
  });

  it("clears a cross-variant GC 'citizenship' purpose under a non-GC visa", () => {
    const r = prune({ location: "inside_us", currentVisa: "H1B", purpose: "citizenship" });
    expect(r.purpose).toBe("");
  });

  it("keeps a normal GC user's purpose + gcYearsHeld", () => {
    const r = prune({ location: "inside_us", currentVisa: "GC", purpose: "citizenship", gcYearsHeld: "over5" });
    expect(r.purpose).toBe("citizenship");
    expect(r.gcYearsHeld).toBe("over5");
  });

  it("keeps a normal non-GC user's purpose/expiry/compliance", () => {
    const r = prune({ location: "inside_us", currentVisa: "H1B", purpose: "work", expiryTimeline: "year", complianceRisk: "none" });
    expect(r.purpose).toBe("work");
    expect(r.expiryTimeline).toBe("year");
    expect(r.complianceRisk).toBe("none");
  });

  it("never prunes a free-text country (always-on)", () => {
    const r = prune({ location: "inside_us", currentVisa: "H1B", purpose: "work", countryOfCitizenship: "BR" });
    expect(r.countryOfCitizenship).toBe("BR");
  });

  it("clears a stale hasWorkAuth when the visa becomes unambiguous", () => {
    const r = prune({ location: "inside_us", currentVisa: "H1B", purpose: "work", hasWorkAuth: "yes_ead" });
    expect(r.hasWorkAuth).toBe("");
  });

  it("clears inside-only fields after switching to outside-US", () => {
    const r = prune({ location: "outside_us", outsideUsStage: "petition_filed", currentVisa: "GC", gcYearsHeld: "over5", complianceRisk: "gap", purpose: "family" });
    expect(r.currentVisa).toBe("");
    expect(r.gcYearsHeld).toBe("");
    expect(r.complianceRisk).toBe("");
    expect(r.outsideUsStage).toBe("petition_filed");
  });

  it("clears hasReceiptNumber when outsideUsStage no longer qualifies", () => {
    const r = prune({ location: "outside_us", outsideUsStage: "exploring", hasReceiptNumber: "yes", purpose: "work" });
    expect(r.hasReceiptNumber).toBe("");
  });
});