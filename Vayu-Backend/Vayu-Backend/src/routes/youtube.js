const express = require("express");
const router = express.Router();
const axios = require("axios");

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const cache = {};

router.get("/", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Query required" });
  }

  if (cache[query] && Date.now() - cache[query].timestamp < 60 * 60 * 1000) {
    return res.json(cache[query].data);
  }

  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          type: "video",
          videoEmbeddable: "true",
          key: YOUTUBE_API_KEY,
          maxResults: 1,
        },
      }
    );

    const video = response.data.items[0];

    if (!video) {
      return res.status(404).json({ error: "No video found" });
    }

    const result = {
      videoId: video.id.videoId,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.medium.url,
    };

    cache[query] = { timestamp: Date.now(), data: result };

    res.json(result);
  } catch (err) {
    console.error("YOUTUBE ERROR:", err.message);
    res.status(500).json({ error: "YouTube fetch failed" });
  }
});

module.exports = router;