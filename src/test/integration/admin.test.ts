import { describe, it, expect, beforeEach } from "vitest";
import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import app from "../../index";

function makeRequest(path: string, authPassword?: string) {
  const headers: Record<string, string> = { host: "foundtheo.de" };
  if (authPassword) {
    headers["authorization"] = "Basic " + btoa("admin:" + authPassword);
  }
  return new Request(`https://foundtheo.de${path}`, { headers });
}

function makePostRequest(path: string, authPassword?: string, body?: URLSearchParams) {
  const headers: Record<string, string> = { host: "foundtheo.de" };
  if (authPassword) {
    headers["authorization"] = "Basic " + btoa("admin:" + authPassword);
  }
  if (body) {
    headers["content-type"] = "application/x-www-form-urlencoded";
  }
  return new Request(`https://foundtheo.de${path}`, {
    method: "POST",
    headers,
    body: body ? body.toString() : undefined,
  });
}

describe("GET /admin", () => {
  it("gibt 401 zurück ohne Auth-Header", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makeRequest("/admin"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(401);
    expect(res.headers.get("www-authenticate")).toContain("Basic");
  });

  it("gibt 401 zurück bei falschem Passwort", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makeRequest("/admin", "wrongpassword"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(401);
  });

  it("gibt 200 zurück bei richtigem Passwort", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makeRequest("/admin", "testpassword"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(200);
  });

  it("gibt HTML zurück bei richtigem Passwort", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makeRequest("/admin", "testpassword"), env, ctx);
    await waitOnExecutionContext(ctx);
    const ct = res.headers.get("content-type") ?? "";
    expect(ct).toContain("text/html");
    const html = await res.text();
    expect(html).toContain("Admin");
  });

  it("gibt 401 zurück für /admin/logout", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makeRequest("/admin/logout"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(401);
  });
});

describe("POST /admin/delete – Scans löschen", () => {
  it("gibt 401 zurück ohne Auth", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makePostRequest("/admin/delete"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(401);
  });

  it("gibt 401 zurück bei falschem Passwort", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makePostRequest("/admin/delete", "wrongpassword"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(401);
  });

  it("löscht alle Scans und leitet zurück zu /admin", async () => {
    // Einen Scan einfügen
    await env.DB.prepare(
      "INSERT INTO scans (dog_id, badge_id, scanned_at, source) VALUES ('theo', 'adesso', datetime('now'), 'qr')"
    ).run();
    const ctx = createExecutionContext();
    // Leerer Body nötig damit Hono formData() parsen kann (Content-Type wird gesetzt)
    const res = await app.fetch(makePostRequest("/admin/delete", "testpassword", new URLSearchParams()), env, ctx);
    await waitOnExecutionContext(ctx);
    // Redirect nach erfolgreicher Aktion
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toContain("/admin");
  });

  it("löscht nur Scans für einen bestimmten Badge-Typ", async () => {
    // Zwei verschiedene Badges einfügen
    await env.DB.prepare(
      "INSERT INTO scans (dog_id, badge_id, scanned_at, source) VALUES ('theo', 'adesso', datetime('now'), 'qr'), ('theo', 'nemetschek', datetime('now'), 'qr')"
    ).run();
    const body = new URLSearchParams({ badge_id: "adesso" });
    const ctx = createExecutionContext();
    const res = await app.fetch(makePostRequest("/admin/delete", "testpassword", body), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(302);
    // Nur adesso-Scan wurde gelöscht – nemetschek bleibt
    const remaining = await env.DB.prepare(
      "SELECT COUNT(*) as cnt FROM scans WHERE badge_id = 'nemetschek'"
    ).first<{ cnt: number }>();
    expect(remaining?.cnt).toBe(1);
    const deletedAdesso = await env.DB.prepare(
      "SELECT COUNT(*) as cnt FROM scans WHERE badge_id = 'adesso'"
    ).first<{ cnt: number }>();
    expect(deletedAdesso?.cnt).toBe(0);
  });
});

describe("POST /admin/reset-likes – Likes zurücksetzen", () => {
  beforeEach(async () => {
    await env.DB.exec("DELETE FROM image_likes;");
  });

  it("gibt 401 zurück ohne Auth", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makePostRequest("/admin/reset-likes"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(401);
  });

  it("gibt 401 zurück bei falschem Passwort", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makePostRequest("/admin/reset-likes", "wrongpassword"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(401);
  });

  it("setzt alle Likes zurück und leitet zu /admin", async () => {
    await env.DB.prepare(
      "INSERT INTO image_likes (image_key, cnt) VALUES ('dogs/theo/a.jpg', 5), ('dogs/theo/b.jpg', 3)"
    ).run();
    const ctx = createExecutionContext();
    const res = await app.fetch(makePostRequest("/admin/reset-likes", "testpassword"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toContain("/admin");
    const remaining = await env.DB.prepare("SELECT COUNT(*) as cnt FROM image_likes").first<{ cnt: number }>();
    expect(remaining?.cnt).toBe(0);
  });

  it("funktioniert korrekt auch wenn keine Likes vorhanden", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makePostRequest("/admin/reset-likes", "testpassword"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(302);
  });
});
