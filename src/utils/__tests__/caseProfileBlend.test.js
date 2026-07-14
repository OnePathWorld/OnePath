// src/utils/_tests_/caseProfileBlend.test.js
// Regression suite for the form-aware case × profile blend. Same
// spirit as caseGuidance.test.js: prove each rule fires on the RIGHT
// form, prove it FAILS CLOSED on the wrong or missing form and on
// categories we never personalize, and prove null/garbage safety.
// Precision is the whole point here, so "does not fire" matters as
// much as "fires."

import { blendCaseWithProfile } from "../caseProfileBlend";
import { CATEGORY } from "../caseGuidance";

const key = (r) => (r ? r.templateKey : null);
// Minimal normalized-profile view; only riskFactors.countryBacklog is read.
const profile = (over = {}) => ({
  riskFactors: { countryBacklog: false, ...(over.riskFactors || {}) },
});

describe("approved — one note per form, each specific and correct", () => {
  const cases = [
    ["I-140", "approved_i140"],
    ["I-130", "approved_i130"],
    ["I-485", "approved_adjustment"],
    ["N-400", "approved_naturalization"],
    ["I-751", "approved_remove_conditions"],
    ["I-765", "approved_ead"],
    ["I-131", "approved_advance_parole"],
    ["I-129", "approved_employer_petition"],
    ["I-539", "approved_extend_change"],
  ];
  test.each(cases)("approved %s -> %s", (form, expected) => {
    expect(key(blendCaseWithProfile(CATEGORY.APPROVED, profile(), form))).toBe(
      `caseGuidance.blend.${expected}`
    );
  });
});

describe("I-140 backlog variant takes precedence", () => {
  test("I-140 + country backlog -> backlog note", () => {
    const r = blendCaseWithProfile(
      CATEGORY.APPROVED,
      profile({ riskFactors: { countryBacklog: true } }),
      "I-140"
    );
    expect(key(r)).toBe("caseGuidance.blend.approved_i140_backlog");
  });
  test("I-140 without backlog -> base note", () => {
    const r = blendCaseWithProfile(
      CATEGORY.APPROVED,
      profile({ riskFactors: { countryBacklog: false } }),
      "I-140"
    );
    expect(key(r)).toBe("caseGuidance.blend.approved_i140");
  });
});

describe("document production splits green card vs EAD", () => {
  test.each([["I-485"], ["I-90"], ["I-751"]])(
    "%s in production -> green card note",
    (form) => {
      expect(
        key(blendCaseWithProfile(CATEGORY.DOCUMENT_PRODUCTION, profile(), form))
      ).toBe("caseGuidance.blend.docprod_greencard");
    }
  );
  test("I-765 in production -> EAD note", () => {
    expect(
      key(blendCaseWithProfile(CATEGORY.DOCUMENT_PRODUCTION, profile(), "I-765"))
    ).toBe("caseGuidance.blend.docprod_ead");
  });
});

describe("denied — split by cascade impact", () => {
  test.each([
    ["I-485", "denied_adjustment"],
    ["I-765", "denied_ead"],
    ["I-129", "denied_employer_petition"],
    ["N-400", "denied_naturalization"],
  ])("denied %s -> %s", (form, expected) => {
    expect(key(blendCaseWithProfile(CATEGORY.DENIED, profile(), form))).toBe(
      `caseGuidance.blend.${expected}`
    );
  });
});

describe("form normalization", () => {
  test("no hyphen matches", () => {
    expect(key(blendCaseWithProfile(CATEGORY.APPROVED, profile(), "I485"))).toBe(
      "caseGuidance.blend.approved_adjustment"
    );
  });
  test("whitespace + lowercase matches", () => {
    expect(
      key(blendCaseWithProfile(CATEGORY.APPROVED, profile(), " i-485 "))
    ).toBe("caseGuidance.blend.approved_adjustment");
  });
});

describe("fails closed — wrong / missing form, unpersonalized categories", () => {
  test("approved with a form not in any rule -> null", () => {
    expect(blendCaseWithProfile(CATEGORY.APPROVED, profile(), "Z-999")).toBeNull();
  });
  test("denied I-130 (not in the denied set) -> null", () => {
    expect(blendCaseWithProfile(CATEGORY.DENIED, profile(), "I-130")).toBeNull();
  });
  test("document production I-129 (not a card) -> null", () => {
    expect(
      blendCaseWithProfile(CATEGORY.DOCUMENT_PRODUCTION, profile(), "I-129")
    ).toBeNull();
  });
  test("missing / empty form on a form-gated category -> null", () => {
    expect(blendCaseWithProfile(CATEGORY.APPROVED, profile(), undefined)).toBeNull();
    expect(blendCaseWithProfile(CATEGORY.APPROVED, profile(), "")).toBeNull();
    expect(blendCaseWithProfile(CATEGORY.DENIED, profile(), null)).toBeNull();
  });
  test("categories we never personalize -> null even with a form", () => {
    for (const c of [
      CATEGORY.RECEIVED,
      CATEGORY.UNDER_REVIEW,
      CATEGORY.BIOMETRICS,
      CATEGORY.INTERVIEW,
      CATEGORY.ACTION_REQUIRED,
      CATEGORY.TRANSFERRED,
      CATEGORY.REJECTED,
      CATEGORY.CLOSED,
      CATEGORY.UNKNOWN,
    ]) {
      expect(blendCaseWithProfile(c, profile(), "I-485")).toBeNull();
    }
  });
});

describe("null / garbage safety — never throws; profile is optional", () => {
  test("null category -> null", () => {
    expect(blendCaseWithProfile(null, profile(), "I-485")).toBeNull();
  });
  test("null profile is fine for form-only rules", () => {
    expect(key(blendCaseWithProfile(CATEGORY.APPROVED, null, "I-485"))).toBe(
      "caseGuidance.blend.approved_adjustment"
    );
  });
  test("empty profile is fine for form-only rules", () => {
    expect(key(blendCaseWithProfile(CATEGORY.APPROVED, {}, "N-400"))).toBe(
      "caseGuidance.blend.approved_naturalization"
    );
  });
  test("never throws on null/empty/garbage", () => {
    expect(() => {
      blendCaseWithProfile(CATEGORY.APPROVED, null, undefined);
      blendCaseWithProfile(CATEGORY.DENIED, {}, null);
      blendCaseWithProfile(null, null, null);
      blendCaseWithProfile(CATEGORY.APPROVED, { riskFactors: null }, "I-140");
    }).not.toThrow();
  });
});