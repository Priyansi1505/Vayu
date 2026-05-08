const axios = require("axios");

const WAQI_TOKEN = process.env.WAQI_API_KEY;

const getColor = (aqi) => {
  if (aqi <= 50) return "#A8D5BA";
  if (aqi <= 100) return "#FFE66D";
  if (aqi <= 150) return "#FFA552";
  if (aqi <= 200) return "#FF6B6B";
  if (aqi <= 300) return "#C44569";
  return "#8B3A62";
};

const getStatus = (aqi) => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

const indianCities = [
  { name: "Delhi",      lat: 28.6139, lon: 77.2090 },
  { name: "Mumbai",     lat: 19.0760, lon: 72.8777 },
  { name: "Bangalore",  lat: 12.9716, lon: 77.5946 },
  { name: "Chennai",    lat: 13.0827, lon: 80.2707 },
  { name: "Kolkata",    lat: 22.5726, lon: 88.3639 },
  { name: "Hyderabad",  lat: 17.3850, lon: 78.4867 },
  { name: "Pune",       lat: 18.5204, lon: 73.8567 },
  { name: "Ahmedabad",  lat: 23.0225, lon: 72.5714 },
  { name: "Jaipur",     lat: 26.9124, lon: 75.7873 },
  { name: "Lucknow",    lat: 26.8467, lon: 80.9462 },
  { name: "Chandigarh", lat: 30.7333, lon: 76.7794 },
  { name: "Bhopal",     lat: 23.2599, lon: 77.4126 },
  { name: "Indore",     lat: 22.7196, lon: 75.8577 },
  { name: "Patna",      lat: 25.5941, lon: 85.1376 },
  { name: "Kanpur",     lat: 26.4499, lon: 80.3319 },
];

let cache = null;
let lastFetch = 0;
const CACHE_DURATION = 10 * 60 * 1000;

async function fetchCitiesData() {
  console.log("🔄 Fetching AQI for cities...");

  const responses = await Promise.allSettled(
    indianCities.map((city) =>
      axios.get(
        `https://api.waqi.info/feed/geo:${city.lat};${city.lon}/?token=${WAQI_TOKEN}`,
        { timeout: 5000 }
      )
    )
  );

  const validData = responses
    .map((res, index) => {
      if (res.status === "fulfilled" && res.value.data.status === "ok") {
        const data = res.value.data.data;
        const aqi = Number(data.aqi);
        if (isNaN(aqi) || aqi <= 0 || aqi > 999) return null;
        return {
          city: indianCities[index].name,
          aqi,
          status: getStatus(aqi),
          color: getColor(aqi),
        };
      }
      return null;
    })
    .filter(Boolean);

  if (validData.length > 0) {
    cache = [...validData].sort((a, b) => a.aqi - b.aqi);
    lastFetch = Date.now();
    console.log(`✅ Cities cached: ${validData.length} cities`);
  }

  return cache;
}

exports.prefetch = async () => {
  try {
    await fetchCitiesData();
  } catch (err) {
    console.error("Pre-fetch error:", err.message);
  }
};

exports.startAutoRefresh = () => {
  setInterval(async () => {
    try {
      await fetchCitiesData();
    } catch (err) {
      console.error("Auto-refresh error:", err.message);
    }
  }, CACHE_DURATION);
};

exports.getTopCitiesIndia = async (req, res) => {
  try {
    if (cache && Date.now() - lastFetch < CACHE_DURATION) {
      return res.json(cache);
    }
    if (cache) {
      fetchCitiesData().catch(console.error);
      return res.json(cache);
    }
    const data = await fetchCitiesData();
    return res.json(data || []);
  } catch (err) {
    console.error("Cities handler error:", err.message);
    if (cache) return res.json(cache);
    res.json([]);
  }
};