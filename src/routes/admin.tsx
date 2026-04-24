/** @jsxImportSource hono/jsx */
import { Hono } from "hono";
import { AdminPage } from "../components/AdminPage";
import { getAdminStats, deleteScans } from "../db/scans";
import { resetLikes } from "../db/likes";
import type { Bindings } from "../index";

export const adminRoutes = new Hono<{ Bindings: Bindings }>();

/** Prüft HTTP Basic Auth gegen ADMIN_PASSWORD */
function checkAuth(authHeader: string | undefined, password: string): boolean {
  if (!authHeader?.startsWith("Basic ")) return false;
  try {
    const decoded = atob(authHeader.slice(6));
    const colonIndex = decoded.indexOf(":");
    if (colonIndex === -1) return false;
    const pass = decoded.slice(colonIndex + 1);
    return pass === password;
  } catch {
    // atob wirft bei ungültigem Base64
    return false;
  }
}

/** Hilfsfunktion: 401-Response für fehlende/falsche Auth */
function unauthorized() {
  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="foundtheo Admin"',
      "Content-Type": "text/plain",
    },
  });
}

/** GET /admin – Dashboard */
adminRoutes.get("/", async (c) => {
  if (!checkAuth(c.req.header("authorization"), c.env.ADMIN_PASSWORD)) {
    return unauthorized();
  }
  const stats = await getAdminStats(c.env.DB);
  const deletedMsg = c.req.query("deleted") ?? null;
  return c.html(<AdminPage stats={stats} deletedMsg={deletedMsg} />);
});

/** POST /admin/delete – Scans löschen (alle oder nach Badge) */
adminRoutes.post("/delete", async (c) => {
  if (!checkAuth(c.req.header("authorization"), c.env.ADMIN_PASSWORD)) {
    return unauthorized();
  }

  const body = await c.req.formData();
  const badgeId = body.get("badge_id");

  const deleted = await deleteScans(
    c.env.DB,
    typeof badgeId === "string" && badgeId !== "" ? badgeId : undefined
  );

  const message = badgeId
    ? `${deleted} Scans für Badge „${badgeId}" gelöscht.`
    : `Alle ${deleted} Scans gelöscht.`;

  // Nach dem Löschen zurück zum Dashboard mit Bestätigungsmeldung
  return c.redirect(`/admin?deleted=${encodeURIComponent(message)}`);
});

/** POST /admin/reset-likes – Alle Like-Zähler auf 0 zurücksetzen */
adminRoutes.post("/reset-likes", async (c) => {
  if (!checkAuth(c.req.header("authorization"), c.env.ADMIN_PASSWORD)) {
    return unauthorized();
  }
  const deleted = await resetLikes(c.env.DB);
  const message = `${deleted} Like-Einträge zurückgesetzt.`;
  return c.redirect(`/admin?deleted=${encodeURIComponent(message)}`);
});

/** GET /admin/logout – Browser-Auth vergessen lassen */
adminRoutes.get("/logout", () => {
  return new Response(
    `<html><body><p>Abgemeldet. <a href="/admin">Neu anmelden</a></p></body></html>`,
    {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="foundtheo Admin"',
        "Content-Type": "text/html",
      },
    }
  );
});
