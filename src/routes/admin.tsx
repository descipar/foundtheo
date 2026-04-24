/** @jsxImportSource hono/jsx */
import { Hono } from "hono";
import { AdminPage } from "../components/AdminPage";
import { getAdminStats } from "../db/scans";
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

/** GET /admin – Dashboard */
adminRoutes.get("/", async (c) => {
  const authHeader = c.req.header("authorization");

  if (!checkAuth(authHeader, c.env.ADMIN_PASSWORD)) {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="foundtheo Admin"',
        "Content-Type": "text/plain",
      },
    });
  }

  const stats = await getAdminStats(c.env.DB);
  return c.html(<AdminPage stats={stats} />);
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
