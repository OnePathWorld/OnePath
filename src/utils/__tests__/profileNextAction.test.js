// src/utils/__tests__/profileNextAction.test.js
import {
  getProfileNextAction,
  NEXT_ACTION_VISUALS,
} from "../profileNextAction";

const idOf = (r) => r.templateKey.split(".")[1];

describe("getProfileNextAction — rule priority & coverage", () => {
  it("flags imminent expiry (30 days) as an action", () => {
    const r = getProfileNextAction({
      currentVisa: "F1",
      purpose: "study",
      expiryTimeline: "30days",
    });
    expect(idOf(r)).toBe("expiryImmediate");
    expect(r.urgency).toBe("action");
  });

  it("treats an already-expired status as an action", () => {
    const r = getProfileNextAction({ currentVisa: "F1", expiryTimeline: "expired" });
    expect(idOf(r)).toBe("expiryImmediate");
  });

  it("prefers imminent expiry over compliance history", () => {
    const r = getProfileNextAction({
      currentVisa: "H1B",
      expiryTimeline: "expired",
      complianceRisk: "denied",
    });
    expect(idOf(r)).toBe("expiryImmediate");
  });

  it("routes a status-history flag to an attorney (prepare)", () => {
    const r = getProfileNextAction({
      currentVisa: "H1B",
      purpose: "work",
      expiryTimeline: "year",
      complianceRisk: "overstay",
    });
    expect(idOf(r)).toBe("complianceAttorney");
    expect(r.urgency).toBe("prepare");
  });

  it("routes protection seekers to qualified help", () => {
    const r = getProfileNextAction({
      location: "inside_us",
      currentVisa: "none",
      purpose: "protection",
      urgency: "immediate",
    });
    expect(idOf(r)).toBe("protection");
    expect(r.urgency).toBe("prepare");
  });

  it("surfaces naturalization eligibility for a GC held 5+ years", () => {
    const r = getProfileNextAction({
      location: "inside_us",
      currentVisa: "GC",
      purpose: "citizenship",
      gcYearsHeld: "over5",
    });
    expect(idOf(r)).toBe("naturalizationEligible");
    expect(r.urgency).toBe("prepare");
  });

  it("nudges a GC held 2–3 years toward preparing", () => {
    const r = getProfileNextAction({ currentVisa: "GC", gcYearsHeld: "2to3" });
    expect(idOf(r)).toBe("naturalizationSoon");
    expect(r.urgency).toBe("monitor");
  });

  it("keeps a newer GC in maintain mode", () => {
    const r = getProfileNextAction({ currentVisa: "GC", gcYearsHeld: "under2" });
    expect(idOf(r)).toBe("gcMaintain");
  });

  it("keeps a pending green card in monitor", () => {
    const r = getProfileNextAction({ currentVisa: "GC_pending", purpose: "work" });
    expect(idOf(r)).toBe("gcPending");
    expect(r.urgency).toBe("monitor");
  });

  it("plans mid-horizon expiry (90 days–6 months)", () => {
    const r = getProfileNextAction({
      currentVisa: "H1B",
      purpose: "work",
      expiryTimeline: "90days",
    });
    expect(idOf(r)).toBe("expirySoon");
    expect(r.urgency).toBe("prepare");
  });

  it("prepares the consular stage for an approved petition abroad", () => {
    const r = getProfileNextAction({
      location: "outside_us",
      outsideUsStage: "petition_approved",
      purpose: "family",
    });
    expect(idOf(r)).toBe("consularNext");
  });

  it("monitors long-horizon expiry", () => {
    const r = getProfileNextAction({
      currentVisa: "H1B",
      purpose: "work",
      expiryTimeline: "safe",
    });
    expect(idOf(r)).toBe("expiryPlanning");
    expect(r.urgency).toBe("monitor");
  });

  it("falls back to a calm all-clear on an empty profile", () => {
    expect(idOf(getProfileNextAction({}))).toBe("allClear");
  });

  it("falls back to all-clear on a null profile (fail-closed)", () => {
    const r = getProfileNextAction(null);
    expect(idOf(r)).toBe("allClear");
    expect(r.urgency).toBe("monitor");
  });

  it("does not fire consular/expiry rules for someone just exploring abroad", () => {
    const r = getProfileNextAction({
      location: "outside_us",
      outsideUsStage: "exploring",
      purpose: "work",
    });
    expect(idOf(r)).toBe("allClear");
  });
});

describe("getProfileNextAction — shape contract", () => {
  it("always returns a namespaced template key and a non-empty fallback", () => {
    const r = getProfileNextAction({});
    expect(r.templateKey).toMatch(/^profileNextAction\./);
    expect(typeof r.fallback).toBe("string");
    expect(r.fallback.length).toBeGreaterThan(0);
  });

  it("only ever returns a known urgency level", () => {
    const known = ["action", "prepare", "monitor"];
    const samples = [
      { expiryTimeline: "expired" },
      { currentVisa: "GC", gcYearsHeld: "over5" },
      {},
    ];
    samples.forEach((s) => {
      expect(known).toContain(getProfileNextAction(s).urgency);
    });
  });
});

describe("NEXT_ACTION_VISUALS", () => {
  it("defines a color + emoji for every urgency level", () => {
    ["action", "prepare", "monitor"].forEach((u) => {
      expect(NEXT_ACTION_VISUALS[u]).toBeDefined();
      expect(typeof NEXT_ACTION_VISUALS[u].color).toBe("string");
      expect(typeof NEXT_ACTION_VISUALS[u].emoji).toBe("string");
    });
  });

  it("every produced action urgency has a matching visual", () => {
    [
      { expiryTimeline: "30days" },
      { currentVisa: "GC", gcYearsHeld: "over5" },
      { currentVisa: "GC_pending" },
      {},
    ].forEach((s) => {
      const { urgency } = getProfileNextAction(s);
      expect(NEXT_ACTION_VISUALS[urgency]).toBeDefined();
    });
  });
});