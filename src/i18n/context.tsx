import React, { createContext, useContext, useState, useCallback } from "react";
import { translations, type Locale } from "./translations";

export type TKey = string;

function getNested(obj: object, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const p of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[p];
  }
  return typeof current === "string" ? current : undefined;
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  defaultLocale = "vi",
}: {
  children: React.ReactNode;
  defaultLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const t = useCallback(
    (key: TKey) => {
      const obj = translations[locale];
      return getNested(obj as object, key) ?? getNested(translations.vi as object, key) ?? key;
    },
    [locale]
  );
  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) return { locale: "vi" as Locale, setLocale: () => {}, t: (k: TKey) => k };
  return ctx;
}
