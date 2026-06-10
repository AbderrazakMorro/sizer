import { describe, it, expect } from "vitest";
import { resolveLocaleFromAcceptLanguage } from "./resolve-locale-from-accept-language";

describe("resolveLocaleFromAcceptLanguage", () => {
  it("returns fr for null or empty", () => {
    expect(resolveLocaleFromAcceptLanguage(null)).toBe("fr");
    expect(resolveLocaleFromAcceptLanguage("")).toBe("fr");
  });

  it("picks en from primary tag", () => {
    expect(resolveLocaleFromAcceptLanguage("en-US,en;q=0.9")).toBe("en");
    expect(resolveLocaleFromAcceptLanguage("en")).toBe("en");
  });

  it("picks fr from primary tag", () => {
    expect(resolveLocaleFromAcceptLanguage("fr-FR,fr;q=0.9")).toBe("fr");
  });

  it("respects order of preferences", () => {
    expect(resolveLocaleFromAcceptLanguage("fr-FR, en-GB")).toBe("fr");
    expect(resolveLocaleFromAcceptLanguage("de, es-MX")).toBe("fr");
  });

  it("respects q weights before declaration order", () => {
    expect(resolveLocaleFromAcceptLanguage("en;q=0.5,es;q=0.9")).toBe("en");
    expect(resolveLocaleFromAcceptLanguage("es;q=0.4,en;q=0.8")).toBe("en");
  });

  it("keeps declaration order when q weights are equal", () => {
    expect(resolveLocaleFromAcceptLanguage("es;q=0.8,en;q=0.8")).toBe("en");
    expect(resolveLocaleFromAcceptLanguage("en;q=0.8,es;q=0.8")).toBe("en");
  });

  it("falls back to fr when no supported language", () => {
    expect(resolveLocaleFromAcceptLanguage("fr-FR,de;q=0.8")).toBe("fr");
  });
});
