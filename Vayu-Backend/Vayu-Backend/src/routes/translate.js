const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ── PERSISTENT DISK CACHE ──────────────────────────────────
const CACHE_FILE = path.join(__dirname, "../../translate_cache.json");
let cache = {};

// Load cache from disk on startup
try {
  if (fs.existsSync(CACHE_FILE)) {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
    console.log(`✅ Translation cache loaded: ${Object.keys(cache).length} entries`);
  }
} catch (e) {
  cache = {};
}

// Save cache to disk (debounced — don't write on every request)
let saveTimer = null;
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cache), "utf8");
    } catch (e) {}
  }, 2000);
}

// ── LANGUAGE MAP ──────────────────────────────────────────
const langMap = {
  en: "en", hi: "hi", mr: "mr", bn: "bn", te: "te", ta: "ta",
  gu: "gu", kn: "kn", ml: "ml", pa: "pa", or: "or", as: "as",
  ur: "ur", sa: "sa", es: "es", fr: "fr", ar: "ar", zh: "zh-CN",
  ne: "ne", mai: "mai", bho: "bho",
};

// ── SINGLE TRANSLATE ─────────────────────────────────────
router.post("/", async (req, res) => {
  const { text, targetLang } = req.body;
  if (!text || !targetLang) return res.status(400).json({ error: "text and targetLang required" });
  if (targetLang === "en") return res.json({ translatedText: text });

  const cacheKey = `${targetLang}:${text}`;
  if (cache[cacheKey]) return res.json({ translatedText: cache[cacheKey] });

  try {
    const langCode = langMap[targetLang] || "hi";
    const response = await axios.get("https://api.mymemory.translated.net/get", {
      params: { q: text, langpair: `en|${langCode}` },
      timeout: 5000,
    });
    const translated = response.data?.responseData?.translatedText || text;
    cache[cacheKey] = translated;
    scheduleSave();
    res.json({ translatedText: translated });
  } catch (err) {
    res.json({ translatedText: text });
  }
});

// ── BATCH TRANSLATE ───────────────────────────────────────
const SEPARATOR = " ~|~ ";
const MAX_BATCH_CHARS = 400; // MyMemory limit per request

router.post("/batch", async (req, res) => {
  const { texts, targetLang } = req.body;
  if (!texts || !Array.isArray(texts) || !targetLang)
    return res.status(400).json({ error: "texts array and targetLang required" });
  if (targetLang === "en") return res.json({ translations: texts });

  const langCode = langMap[targetLang] || "hi";

  // Step 1 — check cache
  const uncachedIndexes = [];
  const results = texts.map((text, i) => {
    const key = `${targetLang}:${text}`;
    if (cache[key]) return cache[key];
    uncachedIndexes.push(i);
    return null;
  });

  if (uncachedIndexes.length === 0) return res.json({ translations: results });

  try {
    // Step 2 — split into chunks to stay under MyMemory char limit
    const uncachedTexts = uncachedIndexes.map((i) => texts[i]);
    const chunks = [];
    let currentChunk = [];
    let currentLen = 0;

    for (const text of uncachedTexts) {
      if (currentLen + text.length > MAX_BATCH_CHARS && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [text];
        currentLen = text.length;
      } else {
        currentChunk.push(text);
        currentLen += text.length + SEPARATOR.length;
      }
    }
    if (currentChunk.length > 0) chunks.push(currentChunk);

    // Step 3 — translate all chunks in PARALLEL
    const chunkResults = await Promise.all(
      chunks.map(async (chunk) => {
        const joined = chunk.join(SEPARATOR);
        try {
          const response = await axios.get("https://api.mymemory.translated.net/get", {
            params: { q: joined, langpair: `en|${langCode}` },
            timeout: 6000,
          });
          const translatedJoined = response.data?.responseData?.translatedText || joined;
          const parts = translatedJoined.split(SEPARATOR);
          return chunk.map((orig, i) => parts[i]?.trim() || orig);
        } catch {
          return chunk; // fallback to original on error
        }
      })
    );

    // Step 4 — flatten chunk results back into uncachedTexts order
    const allTranslated = chunkResults.flat();
    uncachedIndexes.forEach((originalIdx, partIdx) => {
      const translated = allTranslated[partIdx] || texts[originalIdx];
      cache[`${targetLang}:${texts[originalIdx]}`] = translated;
      results[originalIdx] = translated;
    });

    scheduleSave();
    return res.json({ translations: results });
  } catch (err) {
    uncachedIndexes.forEach((i) => { results[i] = texts[i]; });
    return res.json({ translations: results });
  }
});

module.exports = router;