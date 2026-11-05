import { describe, it, expect } from "vitest";
import { isBot } from "../../utils/isBot";

describe("isBot", () => {
  it.each([
    "Hello from Palo Alto Networks, find out more about our scans in https://docs-cortex.paloaltonetworks.com/",
    "Mozilla/5.0 (compatible; CMS-Checker/1.0; +https://example.com)",
    "Mozilla/5.0 (compatible; InternetMeasurement/1.0; +https://internet-measurement.com/)",
    "Mozilla/5.0 (compatible; CensysInspect/1.1; +https://about.censys.io/)",
    "Go-http-client/1.1",
    "Python/3.10 aiohttp/3.11.11",
    "curl/8.4.0",
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36",
  ])("erkennt Bot: %s", (ua) => {
    expect(isBot(ua)).toBe(true);
  });

  it("behandelt fehlenden oder sehr kurzen UA als Bot", () => {
    expect(isBot(null)).toBe(true);
    expect(isBot(undefined)).toBe(true);
    expect(isBot("")).toBe(true);
    expect(isBot("Mozilla")).toBe(true);
  });

  it.each([
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0",
  ])("lässt echten Browser durch: %s", (ua) => {
    expect(isBot(ua)).toBe(false);
  });
});
