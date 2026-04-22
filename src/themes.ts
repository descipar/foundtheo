export interface BadgeTheme {
  primary: string;       // Hauptfarbe (Header, Buttons, Akzente)
  primaryDark: string;   // Dunklere Variante (Hover)
  primaryLight: string;  // Helle Variante (Hintergrund, Stats-Bar)
  primaryBorder: string; // Border-Farbe
  logoPath: string;      // Pfad zum Logo unter /public/logos/
  logoAlt: string;       // Alt-Text für Logo
  badgeLabel: string;    // Anzeigename
}

export const themes: Record<string, BadgeTheme> = {
  adesso: {
    primary:      "#0060AF",
    primaryDark:  "#004d8f",
    primaryLight: "#e8f2fa",
    primaryBorder:"#cce0f0",
    logoPath:     "/public/logos/adesso.svg",
    logoAlt:      "adesso",
    badgeLabel:   "adesso",
  },
  nemetschek: {
    primary:      "#1A1A1A",   // Nemetschek Corporate Black / Charcoal
    primaryDark:  "#000000",
    primaryLight: "#F4F4F4",
    primaryBorder:"#E0E0E0",
    logoPath:     "/public/logos/nemetschek.svg",
    logoAlt:      "Nemetschek",
    badgeLabel:   "Nemetschek",
  },
  // Fallback für direkte Aufrufe ohne Badge
  direct: {
    primary:      "#333333",
    primaryDark:  "#111111",
    primaryLight: "#f5f5f5",
    primaryBorder:"#e0e0e0",
    logoPath:     "",
    logoAlt:      "",
    badgeLabel:   "Direkt",
  },
};

export function getTheme(badgeId: string): BadgeTheme {
  return themes[badgeId] ?? themes["direct"];
}
