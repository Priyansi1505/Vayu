const { spawn } = require("child_process");
const axios = require("axios");

// 🧠 PREDICTION CACHE (per city, 10 min)
const predictionCache = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function pm25ToAQI(pm25) {
  pm25 = Number(pm25) || 0;

  if (pm25 <= 50) return pm25;
  if (pm25 <= 100) return pm25 * 2;
  if (pm25 <= 200) return pm25 * 3;
  return pm25 * 4;
}

exports.getPrediction = async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: "City is required" });
  }

  // ✅ CHECK CACHE FIRST
  const cached = predictionCache[city];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`✅ Cache hit for ${city}`);
    return res.json(cached.data);
  }

  try {
    // ✅ Step 1+2: fetch BOTH in parallel
const [currentRes, forecastRes] = await Promise.all([
  axios.get(`http://localhost:5000/api/aqi/${city}`),
  axios.get(`http://localhost:5000/api/aqi/forecast/${city}`)
]);

const currentAQI = Number(currentRes.data.aqi) || 0;
const forecast = forecastRes.data.forecast || [];

    // ❗ IMPORTANT FIX: send only numbers (not objects)
    const data = forecast
  .slice(0, 72)
  .map((item, index) => ({
    aqi: pm25ToAQI(item.aqi) + Math.round(currentAQI * 0.08 * Math.sin(index * 0.5))
  }));
    // 🧪 DEBUG (optional)
    console.log("DATA SENT TO PYTHON 👉", data);

    // ✅ Step 3: call Python
    const python = spawn("python", ["ml/lstm_model.py"]);

python.stdin.write(
  JSON.stringify({
    data: data,
    steps: 72
  })
);

    python.stdin.end();

    let result = "";

    python.stdout.on("data", (chunk) => {
      result += chunk.toString();
    });

    python.stderr.on("data", (err) => {
      console.error("PYTHON ERROR:", err.toString());
    });

    python.on("close", () => {
  try {
    const parsed = JSON.parse(result);

    const responseData = {
      city,
      currentAQI,
      predictions: parsed.map(v => Number(v) || 0)
    };

    // ✅ SAVE TO CACHE
    predictionCache[city] = {
      timestamp: Date.now(),
      data: responseData
    };

    res.json(responseData);

      } catch (e) {
        console.error("PARSE ERROR:", e);
        res.status(500).json({ error: "ML prediction failed" });
      }
    });

  } catch (err) {
    console.error("ML CONTROLLER ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch AQI data" });
  }
};
