import { describe, it, expect } from "vitest";
import { getTheme, themes } from "../../themes";

describe("getTheme", () => {
  it("gibt adesso-Theme zurück", () => {
    expect(getTheme("adesso")).toBe(themes.adesso);
  });

  it("gibt nemetschek-Theme zurück", () => {
    expect(getTheme("nemetschek")).toBe(themes.nemetschek);
  });

  it("gibt direct-Theme zurück für 'direct'", () => {
    expect(getTheme("direct")).toBe(themes.direct);
  });

  it("fällt auf direct-Theme zurück für unbekannten Badge", () => {
    expect(getTheme("unbekannt")).toBe(themes.direct);
  });

  it("fällt auf direct-Theme zurück für leeren String", () => {
    expect(getTheme("")).toBe(themes.direct);
  });
});
