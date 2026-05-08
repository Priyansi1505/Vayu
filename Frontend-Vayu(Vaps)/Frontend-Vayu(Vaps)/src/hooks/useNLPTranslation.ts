import { useState, useCallback } from "react";

const TRANSLATE_API = "http://localhost:5000/api/translate";

// ── PERSISTENT CACHE (survives re-renders, shared across all components) ──
const translationCache = new Map<string, string>();

// ── PENDING DEDUP (if same text is already in-flight, reuse that promise) ──
const pendingRequests = new Map<string, Promise<string[]>>();

function getCacheKey(text: string, lang: string) {
  return `${lang}::${text}`;
}

// ── SESSION STORAGE PERSISTENCE (survives page refresh) ──
function loadSessionCache() {
  try {
    const raw = sessionStorage.getItem("nlp_cache");
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, string>;
      Object.entries(parsed).forEach(([k, v]) => translationCache.set(k, v));
    }
  } catch {}
}

function saveToSession(key: string, value: string) {
  try {
    translationCache.set(key, value);
    const obj: Record<string, string> = {};
    translationCache.forEach((v, k) => { obj[k] = v; });
    sessionStorage.setItem("nlp_cache", JSON.stringify(obj));
  } catch {}
}

// Load from session on module init
loadSessionCache();

export function useNLPTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);

  const translate = useCallback(async (text: string, targetLang: string): Promise<string> => {
    if (!text || targetLang === "en") return text;
    const key = getCacheKey(text, targetLang);
    if (translationCache.has(key)) return translationCache.get(key)!;

    try {
      const res = await fetch(TRANSLATE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang }),
      });
      const data = await res.json();
      const translated = data.translatedText || text;
      saveToSession(key, translated);
      return translated;
    } catch {
      return text;
    }
  }, []);

  const translateBatch = useCallback(async (texts: string[], targetLang: string): Promise<string[]> => {
    if (targetLang === "en") return texts;
    if (!texts.length) return texts;

    // Step 1 — split into cached vs uncached
    const uncachedIndexes: number[] = [];
    const results: string[] = texts.map((text, i) => {
      const key = getCacheKey(text, targetLang);
      if (translationCache.has(key)) return translationCache.get(key)!;
      uncachedIndexes.push(i);
      return text;
    });

    // Step 2 — everything cached → instant return
    if (uncachedIndexes.length === 0) return results;

    // Step 3 — dedup: if exact same batch already in-flight, reuse it
    const uncachedTexts = uncachedIndexes.map((i) => texts[i]);
    const dedupKey = `${targetLang}::${uncachedTexts.join("|")}`;

    let batchPromise = pendingRequests.get(dedupKey);
    if (!batchPromise) {
      setIsTranslating(true);
      batchPromise = fetch(`${TRANSLATE_API}/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: uncachedTexts, targetLang }),
      })
        .then((res) => res.json())
        .then((data) => data.translations || uncachedTexts)
        .catch(() => uncachedTexts)
        .finally(() => {
          pendingRequests.delete(dedupKey);
          setIsTranslating(false);
        });

      pendingRequests.set(dedupKey, batchPromise);
    }

    // Step 4 — await and fill results
    const translated = await batchPromise;
    uncachedIndexes.forEach((originalIdx, partIdx) => {
      const t = translated[partIdx] || texts[originalIdx];
      saveToSession(getCacheKey(texts[originalIdx], targetLang), t);
      results[originalIdx] = t;
    });

    return results;
  }, [translate]);

  return { translate, translateBatch, isTranslating };
}