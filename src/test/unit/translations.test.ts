import { describe, it, expect } from "vitest";
import { detectLang, translations } from "../../i18n/translations";

describe("translations – photoHint vorhanden", () => {
  it("DE hat photoHint", () => {
    expect(translations.de.photoHint).toContain("📸");
  });
  it("EN hat photoHint", () => {
    expect(translations.en.photoHint).toContain("📸");
  });
});

describe("detectLang", () => {
  it("gibt 'de' zurück für undefined", () => {
    expect(detectLang(undefined)).toBe("de");
  });

  it("gibt 'de' zurück als Standard für unbekannte Sprache", () => {
    expect(detectLang("fr")).toBe("de");
    expect(detectLang("")).toBe("de");
    expect(detectLang("DE")).toBe("de"); // case-sensitive
  });

  it("gibt 'en' zurück für 'en'", () => {
    expect(detectLang("en")).toBe("en");
  });
});

describe("translations.de.age", () => {
  const { age } = translations.de;

  it("zeigt nur Tage, wenn Jahre und Monate 0 sind", () => {
    expect(age(0, 0, 5)).toBe("5 Tage");
  });

  it("singular: 1 Tag", () => {
    expect(age(0, 0, 1)).toBe("1 Tag");
  });

  it("singular: 1 Jahr, 1 Monat, 1 Tag", () => {
    expect(age(1, 1, 1)).toBe("1 Jahr, 1 Monat, 1 Tag");
  });

  it("plural: 2 Jahre, 3 Monate, 4 Tage", () => {
    expect(age(2, 3, 4)).toBe("2 Jahre, 3 Monate, 4 Tage");
  });

  it("lässt Monate weg, wenn 0", () => {
    expect(age(1, 0, 5)).toBe("1 Jahr, 5 Tage");
  });

  it("zeigt nur 0 Tage, wenn alles 0 ist", () => {
    expect(age(0, 0, 0)).toBe("0 Tage");
  });
});

describe("translations.en.age", () => {
  const { age } = translations.en;

  it("singular: 1 day", () => {
    expect(age(0, 0, 1)).toBe("1 day");
  });

  it("plural: 2 years, 3 months, 4 days", () => {
    expect(age(2, 3, 4)).toBe("2 years, 3 months, 4 days");
  });

  it("singular: 1 year, 1 month, 1 day", () => {
    expect(age(1, 1, 1)).toBe("1 year, 1 month, 1 day");
  });
});
