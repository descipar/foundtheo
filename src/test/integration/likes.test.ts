import { describe, it, expect, beforeEach } from "vitest";
import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import app from "../../index";
import { getLikes, incrementLike, decrementLike, resetLikes } from "../../db/likes";

/** Hilfsfunktion: POST-Request mit foundtheo.de Host-Header */
function makePost(path: string) {
  return new Request(`https://foundtheo.de${path}`, {
    method: "POST",
    headers: { host: "foundtheo.de" },
  });
}

// ── DB-Funktionen ─────────────────────────────────────────────────────────────

describe("getLikes", () => {
  beforeEach(async () => {
    await env.DB.exec("DELETE FROM image_likes;");
  });

  it("gibt leeres Objekt zurück wenn keine Likes vorhanden", async () => {
    const result = await getLikes(env.DB);
    expect(result).toEqual({});
  });

  it("gibt korrekten Zähler für vorhandenen Eintrag zurück", async () => {
    await env.DB.prepare("INSERT INTO image_likes (image_key, cnt) VALUES (?, ?)").bind("dogs/theo/a.jpg", 5).run();
    const result = await getLikes(env.DB);
    expect(result["dogs/theo/a.jpg"]).toBe(5);
  });

  it("gibt mehrere Einträge zurück", async () => {
    await env.DB.prepare("INSERT INTO image_likes (image_key, cnt) VALUES (?, ?), (?, ?)").bind(
      "dogs/theo/a.jpg", 3,
      "dogs/theo/b.jpg", 7
    ).run();
    const result = await getLikes(env.DB);
    expect(result["dogs/theo/a.jpg"]).toBe(3);
    expect(result["dogs/theo/b.jpg"]).toBe(7);
  });
});

describe("incrementLike", () => {
  beforeEach(async () => {
    await env.DB.exec("DELETE FROM image_likes;");
  });

  it("legt neuen Eintrag mit cnt=1 an", async () => {
    const cnt = await incrementLike(env.DB, "dogs/theo/a.jpg");
    expect(cnt).toBe(1);
  });

  it("erhöht vorhandenen Zähler um 1", async () => {
    await incrementLike(env.DB, "dogs/theo/a.jpg");
    await incrementLike(env.DB, "dogs/theo/a.jpg");
    const cnt = await incrementLike(env.DB, "dogs/theo/a.jpg");
    expect(cnt).toBe(3);
  });

  it("zählt verschiedene Keys unabhängig", async () => {
    await incrementLike(env.DB, "dogs/theo/a.jpg");
    await incrementLike(env.DB, "dogs/theo/a.jpg");
    const cntB = await incrementLike(env.DB, "dogs/theo/b.jpg");
    expect(cntB).toBe(1);
  });
});

describe("decrementLike", () => {
  beforeEach(async () => {
    await env.DB.exec("DELETE FROM image_likes;");
  });

  it("verringert vorhandenen Zähler um 1", async () => {
    await env.DB.prepare("INSERT INTO image_likes (image_key, cnt) VALUES (?, ?)").bind("dogs/theo/a.jpg", 5).run();
    const cnt = await decrementLike(env.DB, "dogs/theo/a.jpg");
    expect(cnt).toBe(4);
  });

  it("klemmt bei 0 – geht nie in negativ (MAX-Schutz)", async () => {
    await env.DB.prepare("INSERT INTO image_likes (image_key, cnt) VALUES (?, ?)").bind("dogs/theo/a.jpg", 1).run();
    await decrementLike(env.DB, "dogs/theo/a.jpg"); // → 0
    const cnt = await decrementLike(env.DB, "dogs/theo/a.jpg"); // → bleibt 0
    expect(cnt).toBe(0);
  });

  it("gibt 0 zurück für unbekannten Key (kein Fehler)", async () => {
    const cnt = await decrementLike(env.DB, "dogs/theo/unbekannt.jpg");
    expect(cnt).toBe(0);
  });
});

describe("resetLikes", () => {
  beforeEach(async () => {
    await env.DB.exec("DELETE FROM image_likes;");
  });

  it("löscht alle Einträge und gibt Anzahl zurück", async () => {
    await env.DB.prepare("INSERT INTO image_likes (image_key, cnt) VALUES (?, ?), (?, ?)").bind(
      "dogs/theo/a.jpg", 3,
      "dogs/theo/b.jpg", 7
    ).run();
    const deleted = await resetLikes(env.DB);
    expect(deleted).toBe(2);
    const result = await getLikes(env.DB);
    expect(result).toEqual({});
  });

  it("gibt 0 zurück wenn bereits leer", async () => {
    const deleted = await resetLikes(env.DB);
    expect(deleted).toBe(0);
  });
});

// ── Route /api/like und /api/like/unlike ──────────────────────────────────────

describe("POST /api/like/:key – Key-Validierung und Zähler", () => {
  beforeEach(async () => {
    await env.DB.exec("DELETE FROM image_likes;");
  });

  it("gibt 200 und cnt zurück für gültigen Key", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makePost("/api/like/dogs/theo/foto.jpg"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(200);
    const body = await res.json() as { cnt: number };
    expect(body.cnt).toBe(1);
  });

  it("inkrementiert bei mehrfachem Aufruf korrekt", async () => {
    for (let i = 0; i < 3; i++) {
      const ctx = createExecutionContext();
      await app.fetch(makePost("/api/like/dogs/theo/foto.jpg"), env, ctx);
      await waitOnExecutionContext(ctx);
    }
    const ctx = createExecutionContext();
    const res = await app.fetch(makePost("/api/like/dogs/theo/foto.jpg"), env, ctx);
    await waitOnExecutionContext(ctx);
    const body = await res.json() as { cnt: number };
    expect(body.cnt).toBe(4);
  });

  it("gibt 403 für Key ohne 'dogs/'-Präfix", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makePost("/api/like/etc/passwd"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(403);
  });

  it("gibt 403 für Path-Traversal mit '..'", async () => {
    const ctx = createExecutionContext();
    const key = encodeURIComponent("dogs/../etc/passwd");
    const res = await app.fetch(makePost(`/api/like/${key}`), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(403);
  });

  it("gibt 403 für Key ohne Dateiendung", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makePost("/api/like/dogs/theo/keinextension"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(403);
  });

  it("akzeptiert .png, .webp, .avif als gültige Endungen", async () => {
    for (const ext of ["png", "webp", "avif"]) {
      const ctx = createExecutionContext();
      const res = await app.fetch(makePost(`/api/like/dogs/theo/bild.${ext}`), env, ctx);
      await waitOnExecutionContext(ctx);
      expect(res.status).toBe(200);
    }
  });
});

describe("POST /api/like/unlike/:key – Unlike und Key-Validierung", () => {
  beforeEach(async () => {
    await env.DB.exec("DELETE FROM image_likes;");
  });

  it("dekrementiert vorhandenen Like", async () => {
    // Erst 2× liken
    for (let i = 0; i < 2; i++) {
      const ctx = createExecutionContext();
      await app.fetch(makePost("/api/like/dogs/theo/foto.jpg"), env, ctx);
      await waitOnExecutionContext(ctx);
    }
    // Dann unlike
    const ctx = createExecutionContext();
    const res = await app.fetch(makePost("/api/like/unlike/dogs/theo/foto.jpg"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(200);
    const body = await res.json() as { cnt: number };
    expect(body.cnt).toBe(1);
  });

  it("bleibt bei 0 und gibt 200 zurück – geht nicht negativ", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makePost("/api/like/unlike/dogs/theo/foto.jpg"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(200);
    const body = await res.json() as { cnt: number };
    expect(body.cnt).toBe(0);
  });

  it("gibt 403 für ungültigen Key", async () => {
    const ctx = createExecutionContext();
    const res = await app.fetch(makePost("/api/like/unlike/etc/passwd"), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(403);
  });

  it("gibt 403 für Path-Traversal", async () => {
    const ctx = createExecutionContext();
    const key = encodeURIComponent("dogs/../etc/passwd");
    const res = await app.fetch(makePost(`/api/like/unlike/${key}`), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(403);
  });
});

// ── Client-Script ↔ Route: gleiche URLs wie im Browser ───────────────────────

describe("Like/Unlike mit den URLs aus clientScript.ts", () => {
  beforeEach(async () => {
    await env.DB.exec("DELETE FROM image_likes;");
  });

  /** Baut den Pfad exakt so wie das Client-Script (encodeURIComponent → %2F). */
  function clientPath(action: "like" | "unlike", key: string) {
    return action === "like"
      ? `/api/like/${encodeURIComponent(key)}`
      : `/api/like/unlike/${encodeURIComponent(key)}`;
  }

  it("clientScript nutzt die richtigen Endpunkte", async () => {
    const { clientScript } = await import("../../scripts/clientScript");
    expect(clientScript).toContain("fetch('/api/like/' + encodeURIComponent(imgKey)");
    expect(clientScript).toContain("fetch('/api/like/unlike/' + encodeURIComponent(imgKey)");
    expect(clientScript).not.toContain("fetch('/api/unlike/'");
  });

  it("Like und anschließendes Unlike landen beim selben Key", async () => {
    const key = "dogs/theo/foto.jpg";

    let ctx = createExecutionContext();
    let res = await app.fetch(makePost(clientPath("like", key)), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(200);
    expect(((await res.json()) as { cnt: number }).cnt).toBe(1);

    ctx = createExecutionContext();
    res = await app.fetch(makePost(clientPath("unlike", key)), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(200);
    expect(((await res.json()) as { cnt: number }).cnt).toBe(0);

    expect((await getLikes(env.DB))[key]).toBe(0);
  });
});
