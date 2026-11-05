/**
 * Erkennt offensichtliche Bots/Scanner am User-Agent.
 *
 * Nur ein Vorfilter: Scanner mit gefälschtem Browser-UA werden hier nicht erkannt –
 * die fallen größtenteils dadurch raus, dass Scans erst per JavaScript-Beacon
 * (POST /api/scan) gezählt werden, das solche Scanner nicht ausführen.
 */
const BOT_UA_PATTERN = new RegExp(
  [
    "bot", "crawl", "spider", "slurp", "scan", "inspect", "checker", "monitor",
    "measurement", "probe", "fetch", "preview", "headless", "phantom", "selenium",
    "puppeteer", "playwright", "lighthouse",
    "curl", "wget", "python", "aiohttp", "httpx", "go-http-client", "java/", "okhttp",
    "node-fetch", "axios", "libwww", "zgrab", "masscan", "nmap", "nuclei",
    "censys", "shodan", "palo alto", "expanse", "netcraft",
  ].join("|"),
  "i"
);

export function isBot(ua: string | null | undefined): boolean {
  if (!ua || ua.trim().length < 10) return true;
  return BOT_UA_PATTERN.test(ua);
}
