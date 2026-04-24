import { describe, it, expect } from "vitest";
import { pickImages } from "../../r2/images";

describe("pickImages", () => {
  it("gibt alle Keys zurück, wenn weniger als 4 vorhanden", () => {
    const keys = ["a.jpg", "b.jpg", "c.jpg"];
    expect(pickImages(keys)).toEqual(keys);
  });

  it("gibt genau 4 Keys zurück, wenn genau 4 vorhanden", () => {
    const keys = ["a.jpg", "b.jpg", "c.jpg", "d.jpg"];
    expect(pickImages(keys)).toHaveLength(4);
  });

  it("gibt genau 4 Keys zurück aus einem größeren Pool", () => {
    const keys = Array.from({ length: 20 }, (_, i) => `img${i}.jpg`);
    const result = pickImages(keys);
    expect(result).toHaveLength(4);
  });

  it("gibt nur Keys zurück, die im Original-Array vorhanden sind", () => {
    const keys = Array.from({ length: 10 }, (_, i) => `img${i}.jpg`);
    const result = pickImages(keys);
    for (const key of result) {
      expect(keys).toContain(key);
    }
  });

  it("gibt keine Duplikate zurück", () => {
    const keys = Array.from({ length: 10 }, (_, i) => `img${i}.jpg`);
    const result = pickImages(keys);
    const unique = new Set(result);
    expect(unique.size).toBe(result.length);
  });

  it("lässt den Original-Array unverändert (keine Mutation)", () => {
    const keys = Array.from({ length: 10 }, (_, i) => `img${i}.jpg`);
    const original = [...keys];
    pickImages(keys);
    expect(keys).toEqual(original);
  });

  it("gibt leeres Array für leeren Input zurück", () => {
    expect(pickImages([])).toEqual([]);
  });

  it("liefert bei mehreren Aufrufen unterschiedliche Reihenfolgen (Zufälligkeit)", () => {
    const keys = Array.from({ length: 20 }, (_, i) => `img${i}.jpg`);
    const results = new Set(
      Array.from({ length: 10 }, () => pickImages(keys).join(","))
    );
    // Mit 20 Bildern und 10 Versuchen ist statisch fast sicher, dass mind. 2 Ergebnisse verschieden sind
    expect(results.size).toBeGreaterThan(1);
  });
});
