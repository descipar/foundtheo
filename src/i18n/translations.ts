export type Lang = "de" | "en";

export const translations = {
  de: {
    pageTitle: (name: string) => `${name} gefunden! 🐾`,
    heading: (name: string) => `Ich habe ${name} gefunden!`,
    subtitle: "Bitte melde dich beim Besitzer",
    labelName: "Name",
    labelBreed: "🐶 Rasse",
    labelAge: "🎂 Alter",
    contactPrompt: "Gefunden? Bitte melde dich:",
    contactSubject: (name: string) => `Ich habe ${name} gefunden!`,
    contactButton: (email: string) => `✉ ${email}`,
    age: (years: number, months: number, days: number): string => {
      const parts: string[] = [];
      if (years > 0) parts.push(`${years} Jahr${years !== 1 ? "e" : ""}`);
      if (months > 0) parts.push(`${months} Monat${months !== 1 ? "e" : ""}`);
      if (days > 0 || parts.length === 0) parts.push(`${days} Tag${days !== 1 ? "e" : ""}`);
      return parts.join(", ");
    },
    imgAlt: (name: string) => `Foto von ${name}`,
  },
  en: {
    pageTitle: (name: string) => `Found ${name}! 🐾`,
    heading: (name: string) => `I found ${name}!`,
    subtitle: "Please contact the owner",
    labelName: "Name",
    labelBreed: "🐶 Breed",
    labelAge: "🎂 Age",
    contactPrompt: "Found them? Please get in touch:",
    contactSubject: (name: string) => `I found ${name}!`,
    contactButton: (email: string) => `✉ ${email}`,
    age: (years: number, months: number, days: number): string => {
      const parts: string[] = [];
      if (years > 0) parts.push(`${years} year${years !== 1 ? "s" : ""}`);
      if (months > 0) parts.push(`${months} month${months !== 1 ? "s" : ""}`);
      if (days > 0 || parts.length === 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
      return parts.join(", ");
    },
    imgAlt: (name: string) => `Photo of ${name}`,
  },
} as const satisfies Record<Lang, object>;

export function detectLang(param: string | undefined): Lang {
  return param === "en" ? "en" : "de";
}
