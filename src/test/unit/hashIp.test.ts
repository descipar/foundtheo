import { describe, it, expect, vi, afterEach } from "vitest";
import { hashIp } from "../../utils/hashIp";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("hashIp", () => {
  it("gibt null zurück ohne IP", async () => {
    expect(await hashIp(null, "secret")).toBeNull();
  });

  it("gibt null zurück ohne Secret (speichert nichts Rückrechenbares)", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await hashIp("203.0.113.7", undefined)).toBeNull();
    expect(await hashIp("203.0.113.7", "")).toBeNull();
  });

  it("liefert einen stabilen 64-stelligen Hex-Hash für gleiche IP + Secret", async () => {
    const a = await hashIp("203.0.113.7", "secret");
    const b = await hashIp("203.0.113.7", "secret");
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).toBe(b);
  });

  it("liefert unterschiedliche Hashes für unterschiedliche Secrets", async () => {
    expect(await hashIp("203.0.113.7", "secret-a")).not.toBe(await hashIp("203.0.113.7", "secret-b"));
  });

  it("entspricht NICHT dem ungesalzenen SHA-256 der IP", async () => {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("203.0.113.7"));
    const plain = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
    expect(await hashIp("203.0.113.7", "secret")).not.toBe(plain);
  });
});
