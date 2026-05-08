const express = require("express");
const router = express.Router();
const axios = require("axios");

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

let cache = {};

const newsTopics = [
  "air pollution India",
  "AQI India",
  "health tips India",
  "environment India",
  "climate change India",
  "pollution control India",
];

router.get("/", async (req, res) => {
  try {
    const city = req.query.city || "India";
    const cacheKey = city.toLowerCase();

    // ✅ CACHE CHECK (2 hours)
    if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < 120 * 60 * 1000) {
      console.log("✅ News cache hit for:", city);
      return res.json(cache[cacheKey].data);
    }

    const randomTopic = newsTopics[Math.floor(Math.random() * newsTopics.length)];
    const cityTopic = `air quality ${city}`;

    let articles = [];

    // ── TRY NEWSAPI FIRST (no IP restrictions) ──────────────
    if (NEWSAPI_KEY) {
      try {
        const [cityRes, topicRes] = await Promise.allSettled([
          axios.get("https://newsapi.org/v2/everything", {
            params: {
              q: cityTopic,
              language: "en",
              pageSize: 5,
              sortBy: "publishedAt",
              apiKey: NEWSAPI_KEY,
            },
            timeout: 8000,
          }),
          axios.get("https://newsapi.org/v2/everything", {
            params: {
              q: randomTopic,
              language: "en",
              pageSize: 5,
              sortBy: "publishedAt",
              apiKey: NEWSAPI_KEY,
            },
            timeout: 8000,
          }),
        ]);

        if (cityRes.status === "fulfilled" && cityRes.value.data.articles) {
          articles = [...articles, ...cityRes.value.data.articles];
        }
        if (topicRes.status === "fulfilled" && topicRes.value.data.articles) {
          articles = [...articles, ...topicRes.value.data.articles];
        }

        console.log(`✅ NewsAPI: got ${articles.length} articles`);
      } catch (err) {
        console.error("NewsAPI error:", err.message);
      }
    }

    // ── FALLBACK TO GNEWS if NewsAPI failed ─────────────────
    if (articles.length === 0 && GNEWS_API_KEY) {
      try {
        const [cityRes, topicRes] = await Promise.allSettled([
          axios.get("https://gnews.io/api/v4/search", {
            params: { q: cityTopic, lang: "en", max: 5, sortby: "publishedAt", token: GNEWS_API_KEY },
            timeout: 8000,
          }),
          axios.get("https://gnews.io/api/v4/search", {
            params: { q: randomTopic, lang: "en", max: 5, sortby: "publishedAt", token: GNEWS_API_KEY },
            timeout: 8000,
          }),
        ]);

        if (cityRes.status === "fulfilled" && cityRes.value.data.articles) {
          articles = [...articles, ...cityRes.value.data.articles.map(a => ({
            ...a, urlToImage: a.image, source: { name: a.source?.name || "News" }
          }))];
        }
        if (topicRes.status === "fulfilled" && topicRes.value.data.articles) {
          articles = [...articles, ...topicRes.value.data.articles.map(a => ({
            ...a, urlToImage: a.image, source: { name: a.source?.name || "News" }
          }))];
        }
        console.log(`✅ GNews fallback: got ${articles.length} articles`);
      } catch (err) {
        console.error("GNews error:", err.message);
      }
    }

    // ── LAST RESORT: static placeholder news ────────────────
    if (articles.length === 0) {
      console.log("⚠️ Using placeholder news");
      return res.json([
        {
          title: `Air Quality Update for ${city}`,
          description: "Check the latest AQI data and take necessary precautions to protect your health.",
          url: "https://cpcb.nic.in",
          urlToImage: null,
          source: { name: "CPCB India" },
          publishedAt: new Date().toISOString(),
        },
        {
          title: "Health Tips for Poor Air Quality Days",
          description: "Wear N95 masks, avoid outdoor activities, and use air purifiers indoors on high pollution days.",
          url: "https://mohfw.gov.in",
          urlToImage: null,
          source: { name: "Ministry of Health" },
          publishedAt: new Date().toISOString(),
        },
        {
          title: "Understanding AQI Levels in Indian Cities",
          description: "AQI above 150 is considered unhealthy. Cities like Delhi, Mumbai face seasonal pollution spikes.",
          url: "https://app.cpcbccr.com",
          urlToImage: null,
          source: { name: "CPCB" },
          publishedAt: new Date().toISOString(),
        },
      ]);
    }

    // ── DEDUPLICATE + FORMAT ─────────────────────────────────
    const seen = new Set();
    const unique = articles.filter((a) => {
      const key = a.url || a.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    unique.sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    const formatted = unique.slice(0, 10).map((a) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      urlToImage: a.urlToImage || a.image || null,
      source: typeof a.source === "string"
        ? { name: a.source }
        : { name: a.source?.name || "News" },
      publishedAt: a.publishedAt,
    }));

    cache[cacheKey] = { timestamp: Date.now(), data: formatted };
    res.json(formatted);

  } catch (error) {
    console.error("NEWS ERROR:", error.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

module.exports = router;