import { describe, it, expect, vi, afterEach } from "vitest";
import { sendScanNotification, escapeHtml } from "../../email/notify";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("sendScanNotification", () => {
  it("ruft die Resend API mit URL, Methode und korrektem Empfänger auf", async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", mockFetch);

    await sendScanNotification("test-api-key", "owner@example.com", {
      badge: "adesso",
      source: "qr",
      country: "DE",
      city: "München",
      ua: "Mozilla/5.0",
    });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.method).toBe("POST");

    const body = JSON.parse(init.body as string);
    expect(body.to).toContain("owner@example.com");
    expect(body.subject).toContain("adesso");
    expect(body.html).toContain("München");
    expect(body.html).toContain("DE");
  });

  it("schlägt still fehl bei non-OK Response – kein throw", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response("Internal Server Error", { status: 500 })
    ));

    await expect(
      sendScanNotification("test-key", "owner@example.com", {
        badge: "nemetschek",
        source: "qr",
        country: null,
        city: null,
        ua: null,
      })
    ).resolves.toBeUndefined();
  });

  it("schlägt still fehl bei Netzwerkfehler – kein throw", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));

    await expect(
      sendScanNotification("test-key", "owner@example.com", {
        badge: "adesso",
        source: "qr",
        country: null,
        city: null,
        ua: null,
      })
    ).resolves.toBeUndefined();
  });

  it("kürzt langen UA auf 200 Zeichen im HTML", async () => {
    const longUa = "A".repeat(300);
    const mockFetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", mockFetch);

    await sendScanNotification("test-key", "owner@example.com", {
      badge: "adesso",
      source: "qr",
      country: null,
      city: null,
      ua: longUa,
    });

    const body = JSON.parse((mockFetch.mock.calls[0] as [string, RequestInit])[1].body as string);
    expect(body.html).toContain("A".repeat(200));
    expect(body.html).not.toContain("A".repeat(201));
  });

  it("escaped HTML im User-Agent und Standort (keine Injection in die Mail)", async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", mockFetch);

    await sendScanNotification("test-key", "owner@example.com", {
      badge: "adesso",
      source: "qr",
      country: "DE",
      city: "<b>Köln</b>",
      ua: '<a href="https://evil.example">Klick</a><img src=x>',
    });

    const body = JSON.parse((mockFetch.mock.calls[0] as [string, RequestInit])[1].body as string);
    expect(body.html).not.toContain("<a href=\"https://evil.example\"");
    expect(body.html).not.toContain("<img src=x>");
    expect(body.html).not.toContain("<b>Köln</b>");
    expect(body.html).toContain("&lt;a href=&quot;https://evil.example&quot;&gt;");
    expect(body.html).toContain("&lt;b&gt;Köln&lt;/b&gt;");
  });
});

describe("escapeHtml", () => {
  it("escaped alle HTML-Sonderzeichen", () => {
    expect(escapeHtml(`<>&"'`)).toBe("&lt;&gt;&amp;&quot;&#39;");
  });

  it("lässt normalen Text unverändert", () => {
    expect(escapeHtml("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)")).toBe("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)");
  });
});
