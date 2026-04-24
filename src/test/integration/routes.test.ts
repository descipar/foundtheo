import { describe, it, expect, beforeEach } from "vitest";
import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import app from "../../index";

// Migrations werden automatisch via wrangler.toml migrations_dir angewendet.

/** Hilfsfunktion: Request mit foundtheo.de Host-Header */
function makeRequest(path: string, init?: RequestInit) {
  return new Request(`https://foundtheo.de${path}`, {
    headers: { host: "foundtheo.de", ...(init?.headers as Record<string, string>) },
    ...init,
  });
}

describe("Host-Check Middleware", () => {
  it("blockiert Anfragen von workers.dev (gibt 404 zurück)", async () => {
    const req = new Request("https://foundtheo.descipar.workers.dev/", {
      headers: { host: "foundtheo.descipar.workers.dev" },
    });
    const ctx = createExecutionContext();
    const res = await app.fetch(req, env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(404);
  });

  it("lässt foundtheo.de durch", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makeRequest("/robots.txt"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(200);
  });
});

describe("GET /theo/:badge", () => {
  beforeEach(async () => {
    await env.DB.exec("DELETE FROM scans;");
  });

  it("gibt 200 für gültigen Badge 'adesso' zurück", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makeRequest("/theo/adesso"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(200);
  });

  it("gibt 200 für gültigen Badge 'nemetschek' zurück", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makeRequest("/theo/nemetschek"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(200);
  });

  it("gibt 404 für ungültigen Badge zurück", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makeRequest("/theo/unbekannt"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(404);
  });

  it("gibt HTML-Content zurück", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makeRequest("/theo/adesso"), env, ctx);
    await waitOnExecutionContext(ctx);
    const ct = res.headers.get("content-type") ?? "";
    expect(ct).toContain("text/html");
  });

  it("gibt 200 für direkte Route '/theo' zurück", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makeRequest("/theo"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(200);
  });

  it("akzeptiert Badge-Namen case-insensitiv (z.B. 'ADESSO' → 200)", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makeRequest("/theo/ADESSO"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(200);
  });
});

describe("GET /api/images/:key – Sicherheitscheck", () => {
  it("gibt 404 zurück, wenn Key nicht mit 'dogs/' beginnt", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makeRequest("/api/images/secret/file.jpg"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(404);
  });

  it("gibt 404 zurück, wenn Key einen Path-Traversal enthält", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(
      makeRequest("/api/images/" + encodeURIComponent("../etc/passwd")),
      env,
      ctx
    );
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(404);
  });

  it("gibt 404 zurück, wenn Bild nicht in R2 existiert", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makeRequest("/api/images/dogs/theo/nonexistent.jpg"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(404);
  });
});

describe("GET /robots.txt", () => {
  it("verbietet allen Crawlern den Zugriff", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makeRequest("/robots.txt"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("Disallow: /");
  });
});
