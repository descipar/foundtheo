import { describe, it, expect } from "vitest";
import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import app from "../../index";

function makeRequest(path: string, authPassword?: string) {
  const headers: Record<string, string> = { host: "foundtheo.de" };
  if (authPassword) {
    headers["authorization"] = "Basic " + btoa("admin:" + authPassword);
  }
  return new Request(`https://foundtheo.de${path}`, { headers });
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
