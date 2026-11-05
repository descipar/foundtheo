import { describe, it, expect, beforeEach } from "vitest";
import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import app from "../../index";

const BROWSER_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

function scanRequest(
  body: unknown,
  opts: { ua?: string | null; cookie?: string; contentType?: string; ip?: string } = {}
) {
  const headers: Record<string, string> = {
    host: "foundtheo.de",
    "content-type": opts.contentType ?? "application/json",
    "cf-connecting-ip": opts.ip ?? "203.0.113.10",
  };
  const ua = opts.ua === undefined ? BROWSER_UA : opts.ua;
  if (ua) headers["user-agent"] = ua;
  if (opts.cookie) headers["cookie"] = opts.cookie;
  return new Request("https://foundtheo.de/api/scan", {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function send(req: Request) {
  const ctx = createExecutionContext();
  const res = await app.fetch(req, env, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

async function scanCount(badge?: string) {
  const row = badge
    ? await env.DB.prepare("SELECT COUNT(*) as cnt FROM scans WHERE badge_id = ?").bind(badge).first<{ cnt: number }>()
    : await env.DB.prepare("SELECT COUNT(*) as cnt FROM scans").first<{ cnt: number }>();
  return row?.cnt ?? 0;
}

beforeEach(async () => {
  await env.DB.exec("DELETE FROM scans;");
});

describe("GET-Seiten zählen nicht mehr selbst", () => {
  it("GET /theo/adesso legt keinen Scan an", async () => {
    const res = await send(new Request("https://foundtheo.de/theo/adesso", {
      headers: { host: "foundtheo.de", "user-agent": BROWSER_UA },
    }));
    expect(res.status).toBe(200);
    expect(await scanCount()).toBe(0);
  });

  it("GET /theo legt keinen Scan an und bettet den Badge fürs Client-Script ein", async () => {
    const res = await send(new Request("https://foundtheo.de/theo", {
      headers: { host: "foundtheo.de", "user-agent": BROWSER_UA },
    }));
    expect(await res.text()).toContain('var CURRENT_BADGE = "direct";');
    expect(await scanCount()).toBe(0);
  });
});

describe("POST /api/scan", () => {
  it("zählt QR-Scan eines echten Browsers und setzt Dedupe-Cookie", async () => {
    const res = await send(scanRequest({ badge: "adesso" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ counted: true });
    expect(res.headers.get("set-cookie")).toContain("scanned_adesso=1");

    const row = await env.DB.prepare("SELECT source, ip_hash FROM scans").first<{ source: string; ip_hash: string }>();
    expect(row?.source).toBe("qr");
    expect(row?.ip_hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("zählt Direktaufruf mit source = direct", async () => {
    await send(scanRequest({ badge: "direct" }));
    const row = await env.DB.prepare("SELECT badge_id, source FROM scans").first<{ badge_id: string; source: string }>();
    expect(row).toEqual({ badge_id: "direct", source: "direct" });
  });

  it("zählt Bots nicht", async () => {
    const res = await send(scanRequest({ badge: "direct" }, { ua: "Mozilla/5.0 (compatible; CensysInspect/1.1; +https://about.censys.io/)" }));
    expect(await res.json()).toEqual({ counted: false });
    expect(await scanCount()).toBe(0);
  });

  it("zählt Requests ohne User-Agent nicht", async () => {
    const res = await send(scanRequest({ badge: "direct" }, { ua: null }));
    expect(await res.json()).toEqual({ counted: false });
    expect(await scanCount()).toBe(0);
  });

  it("zählt nicht erneut bei gesetztem Cookie", async () => {
    const res = await send(scanRequest({ badge: "adesso" }, { cookie: "scanned_adesso=1" }));
    expect(await res.json()).toEqual({ counted: false });
    expect(await scanCount()).toBe(0);
  });

  it("dedupliziert per IP-Hash innerhalb von 12h", async () => {
    await send(scanRequest({ badge: "adesso" }, { ip: "198.51.100.1" }));
    const res = await send(scanRequest({ badge: "adesso" }, { ip: "198.51.100.1" }));
    expect(await res.json()).toEqual({ counted: false });
    expect(await scanCount("adesso")).toBe(1);
  });

  it("lehnt unbekannten Badge ab", async () => {
    const res = await send(scanRequest({ badge: "evil" }));
    expect(res.status).toBe(400);
    expect(await scanCount()).toBe(0);
  });

  it("lehnt Nicht-JSON-Requests ab (Cross-Site-Formulare)", async () => {
    const res = await send(scanRequest("badge=adesso", { contentType: "application/x-www-form-urlencoded" }));
    expect(res.status).toBe(415);
    expect(await scanCount()).toBe(0);
  });

  it("lehnt kaputtes JSON ab", async () => {
    const res = await send(scanRequest("{nope"));
    expect(res.status).toBe(400);
  });
});
