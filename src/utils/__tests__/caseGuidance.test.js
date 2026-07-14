// src/utils/_tests_/caseGuidance.test.js
import {
  classifyCaseStatus,
  templateKeyFor,
  CATEGORY,
} from "../caseGuidance";

// Convenience: classify a bare status string.
const cat = (statusText) => classifyCaseStatus({ statusText }).category;

describe("classifyCaseStatus — category recognition", () => {
  it("received", () => {
    expect(cat("Case Was Received")).toBe(CATEGORY.RECEIVED);
    expect(cat("Receipt Notice Was Sent")).toBe(CATEGORY.RECEIVED);
  });

  it("under review", () => {
    expect(cat("Case Is Being Actively Reviewed")).toBe(CATEGORY.UNDER_REVIEW);
    expect(cat("Case Is Currently Under Review")).toBe(CATEGORY.UNDER_REVIEW);
  });

  it("biometrics", () => {
    expect(cat("Your Biometrics Appointment Was Scheduled")).toBe(CATEGORY.BIOMETRICS);
    expect(cat("Fingerprint Review Was Completed")).toBe(CATEGORY.BIOMETRICS);
  });

  it("interview", () => {
    expect(cat("Interview Was Scheduled")).toBe(CATEGORY.INTERVIEW);
  });

  it("action required (RFE / NOID / intent to revoke)", () => {
    expect(cat("Request For Additional Evidence Was Sent")).toBe(CATEGORY.ACTION_REQUIRED);
    expect(cat("Evidence Was Requested")).toBe(CATEGORY.ACTION_REQUIRED);
    expect(cat("Notice Of Intent To Revoke Was Sent")).toBe(CATEGORY.ACTION_REQUIRED);
  });

  it("denied", () => {
    expect(cat("Case Was Denied")).toBe(CATEGORY.DENIED);
    expect(cat("Your Case Has Been Denied")).toBe(CATEGORY.DENIED);
  });

  it("rejected", () => {
    expect(cat("Case Was Rejected")).toBe(CATEGORY.REJECTED);
    expect(cat("Case Was Rejected Because The Filing Fee Was Incorrect")).toBe(
      CATEGORY.REJECTED
    );
  });

  it("closed / withdrawn / terminated", () => {
    expect(cat("Case Was Administratively Closed")).toBe(CATEGORY.CLOSED);
    expect(cat("Case Was Withdrawn")).toBe(CATEGORY.CLOSED);
    expect(cat("Case Was Terminated")).toBe(CATEGORY.CLOSED);
  });

  it("document production", () => {
    expect(cat("Card Is Being Produced")).toBe(CATEGORY.DOCUMENT_PRODUCTION);
    expect(cat("Card Was Mailed To Me")).toBe(CATEGORY.DOCUMENT_PRODUCTION);
  });

  it("approved / reaffirmed", () => {
    expect(cat("Case Was Approved")).toBe(CATEGORY.APPROVED);
    expect(cat("Approval Was Reaffirmed")).toBe(CATEGORY.APPROVED);
  });

  it("transferred", () => {
    expect(cat("Case Was Transferred To Another Office")).toBe(CATEGORY.TRANSFERRED);
    expect(cat("A New Office Has Jurisdiction")).toBe(CATEGORY.TRANSFERRED);
  });
});

describe("classifyCaseStatus — order-sensitive collisions (regression guards)", () => {
  it("'Intent To Deny' is action_required, NOT denied", () => {
    expect(cat("Notice Of Intent To Deny Was Sent")).toBe(CATEGORY.ACTION_REQUIRED);
  });

  it("'Fingerprint Fee Was Received' is biometrics, NOT received", () => {
    expect(cat("Fingerprint Fee Was Received")).toBe(CATEGORY.BIOMETRICS);
  });

  it("an already-answered RFE is under_review, NOT action_required", () => {
    expect(
      cat(
        "Response To USCIS' Request For Evidence Was Received And Case Processing Has Resumed"
      )
    ).toBe(CATEGORY.UNDER_REVIEW);
  });

  it("'Processing Has Resumed' alone is under_review", () => {
    expect(cat("Case Processing Has Resumed")).toBe(CATEGORY.UNDER_REVIEW);
  });
});

describe("classifyCaseStatus — urgency mapping", () => {
  const urgency = (statusText) => classifyCaseStatus({ statusText }).urgency;

  it("monitor states", () => {
    expect(urgency("Case Was Received")).toBe("monitor");
    expect(urgency("Case Was Transferred To Another Office")).toBe("monitor");
    expect(urgency("Case Was Withdrawn")).toBe("monitor");
  });

  it("prepare states", () => {
    expect(urgency("Interview Was Scheduled")).toBe("prepare");
    expect(urgency("Case Was Approved")).toBe("prepare");
    expect(urgency("Card Is Being Produced")).toBe("prepare");
  });

  it("action states", () => {
    expect(urgency("Request For Evidence Was Sent")).toBe("action");
    expect(urgency("Case Was Denied")).toBe("action");
    expect(urgency("Case Was Rejected")).toBe("action");
  });
});

describe("classifyCaseStatus — confidence & safe fallbacks", () => {
  it("recognized status is high confidence", () => {
    expect(classifyCaseStatus({ statusText: "Case Was Approved" }).confidence).toBe(
      "high"
    );
  });

  it("unrecognized status resolves to unknown/monitor/low, never throws", () => {
    const r = classifyCaseStatus({ statusText: "The Weather Is Nice Today" });
    expect(r.category).toBe(CATEGORY.UNKNOWN);
    expect(r.urgency).toBe("monitor");
    expect(r.confidence).toBe("low");
  });

  it("null / empty / missing input resolves to unknown (fail-safe)", () => {
    expect(classifyCaseStatus(null).category).toBe(CATEGORY.UNKNOWN);
    expect(classifyCaseStatus({}).category).toBe(CATEGORY.UNKNOWN);
    expect(classifyCaseStatus({ statusText: "" }).category).toBe(CATEGORY.UNKNOWN);
    expect(classifyCaseStatus({ statusText: "   " }).category).toBe(CATEGORY.UNKNOWN);
  });

  it("falls back to statusDescription when statusText is empty", () => {
    expect(
      classifyCaseStatus({ statusText: "", statusDescription: "Case Was Approved" })
        .category
    ).toBe(CATEGORY.APPROVED);
  });

  it("classification is case-insensitive", () => {
    expect(cat("CASE WAS APPROVED")).toBe(CATEGORY.APPROVED);
    expect(cat("case was approved")).toBe(CATEGORY.APPROVED);
  });
});

describe("templateKeyFor & CATEGORY", () => {
  it("builds the namespaced template key", () => {
    expect(templateKeyFor(CATEGORY.UNDER_REVIEW)).toBe(
      "caseGuidance.templates.under_review"
    );
  });

  it("every classification's templateKey matches templateKeyFor", () => {
    const r = classifyCaseStatus({ statusText: "Case Was Denied" });
    expect(r.templateKey).toBe(templateKeyFor(r.category));
  });

  it("CATEGORY is frozen (stable enum)", () => {
    expect(Object.isFrozen(CATEGORY)).toBe(true);
  });
});