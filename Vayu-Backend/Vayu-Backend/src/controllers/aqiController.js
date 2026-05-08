const axios = require("axios");

// ✅ Hardcoded coords — bypasses rate-limited search API
const CITY_COORDS = {
  delhi: [28.6139, 77.2090],
  mumbai: [19.0760, 72.8777],
  bangalore: [12.9716, 77.5946],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  hyderabad: [17.3850, 78.4867],
  pune: [18.5204, 73.8567],
  ahmedabad: [23.0225, 72.5714],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462],
  chandigarh: [30.7333, 76.7794],
  bhopal: [23.2599, 77.4126],
  indore: [22.7196, 75.8577],
  patna: [25.5941, 85.1376],
  kanpur: [26.4499, 80.3319],
  nagpur: [21.1458, 79.0882],
  surat: [21.1702, 72.8311],
  varanasi: [25.3176, 82.9739],
  agra: [27.1767, 78.0081],
  amritsar: [31.6340, 74.8723],
  jodhpur: [26.2389, 73.0243],
  kota: [25.2138, 75.8648],
  guwahati: [26.1445, 91.7362],
  raipur: [21.2514, 81.6296],
  ranchi: [23.3441, 85.3096],
  coimbatore: [11.0168, 76.9558],
  visakhapatnam: [17.6868, 83.2185],
  bhubaneswar: [20.2961, 85.8245],
  dehradun: [30.3165, 78.0322],
  noida: [28.5355, 77.3910],
  gurgaon: [28.4595, 77.0266],
  kolhapur: [16.7050, 74.2433],
  mysore: [12.2958, 76.6394],
  madurai: [9.9252, 78.1198],
  nashik: [19.9975, 73.7898],
  aurangabad: [19.8762, 75.3433],
  rajkot: [22.3039, 70.8022],
  meerut: [28.9845, 77.7064],
  faridabad: [28.4089, 77.3178],
  vijayawada: [16.5062, 80.6480],
  tiruchirappalli: [10.7905, 78.7047],
  ludhiana: [30.9010, 75.8573],
  jalandhar: [31.3260, 75.5762],
  allahabad: [25.4358, 81.8463],
  prayagraj: [25.4358, 81.8463],
  jammu: [32.7266, 74.8570],
  srinagar: [34.0837, 74.7973],
  shimla: [31.1048, 77.1734],
  manali: [32.2396, 77.1887],
};

// ✅ Get coords for a city name
function getCityCoords(cityName) {
  const key = cityName.toLowerCase().trim();
  return CITY_COORDS[key] || null;
}

// ✅ Shared function to fetch AQI by coordinates
async function fetchAQIByCoords(lat, lon) {
  const response = await axios.get(
    `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${process.env.WAQI_API_KEY}`
  );
  return response.data;
}

// ===================== CITY AQI =====================
exports.getAQI = async (req, res) => {
  const { city } = req.params;
  console.log("🔍 getAQI called for:", city);

  try {
    // ✅ Get coords from map
    const coords = getCityCoords(city);

    if (!coords) {
      console.log("❌ City not in coords map:", city);
      return res.status(404).json({ message: "City not found ❌" });
    }

    const [lat, lon] = coords;
    console.log("📍 Using coords:", lat, lon);

    const aqiData = await fetchAQIByCoords(lat, lon);

    if (aqiData.status !== "ok") {
      console.log("WAQI ERROR:", aqiData.data);
      return res.status(500).json({ error: "WAQI API failed" });
    }

    const data = aqiData.data;

    if (!data || data.aqi === undefined || !data.city || !data.city.geo) {
      console.log("Invalid data format:", data);
      return res.status(500).json({ error: "Invalid AQI data" });
    }

    
      res.json({
  city: data.city.name,
  aqi: data.aqi,
  lat: parseFloat(lat),   // ✅ use actual coords passed in
  lon: parseFloat(lon),
      temperature: data.iaqi?.t?.v ?? null,
      humidity: data.iaqi?.h?.v ?? null,
      wind: data.iaqi?.w?.v ?? null,
      pollutants: {
        pm25: data.iaqi?.pm25?.v ?? null,
        pm10: data.iaqi?.pm10?.v ?? null,
        no2: data.iaqi?.no2?.v ?? null,
        so2: data.iaqi?.so2?.v ?? null,
        co: data.iaqi?.co?.v ?? null,
        o3: data.iaqi?.o3?.v ?? null,
      },
    });

  } catch (err) {
    console.error("CITY AQI ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch AQI ❌" });
  }
};

// ===================== HYPERLOCAL AQI =====================
exports.getAQIByCoords = async (req, res) => {
  const { lat, lon } = req.query;

  try {
    if (!lat || !lon) {
      return res.status(400).json({ message: "Lat/Lon required ❌" });
    }

    const aqiData = await fetchAQIByCoords(lat, lon);

    if (aqiData.status !== "ok") {
      return res.status(500).json({ error: "WAQI API failed" });
    }

    const data = aqiData.data;

    if (!data || data.aqi === undefined || !data.city || !data.city.geo) {
      return res.status(500).json({ error: "Invalid AQI data" });
    }

    
      res.json({
  city: data.city.name,
  aqi: data.aqi,
  lat: lat,   // ✅ use our hardcoded coords, not WAQI station coords
  lon: lon,
      temperature: data.iaqi?.t?.v ?? null,
      humidity: data.iaqi?.h?.v ?? null,
      wind: data.iaqi?.w?.v ?? null,
      pollutants: {
        pm25: data.iaqi?.pm25?.v ?? null,
        pm10: data.iaqi?.pm10?.v ?? null,
        no2: data.iaqi?.no2?.v ?? null,
        so2: data.iaqi?.so2?.v ?? null,
        co: data.iaqi?.co?.v ?? null,
        o3: data.iaqi?.o3?.v ?? null,
      },
    });

  } catch (err) {
    console.error("HYPERLOCAL ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch hyperlocal AQI ❌" });
  }
};

// ===================== FORECAST =====================
exports.getForecast = async (req, res) => {
  const { city } = req.params;
  console.log("🔍 getForecast called for:", city);

  try {
    let lat, lon;

    const coordsMatch = city.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/);

    if (coordsMatch) {
      // 📍 Coordinates passed directly
      lat = parseFloat(coordsMatch[1]);
      lon = parseFloat(coordsMatch[2]);
    } else {
      // 🏙️ City name — use coords map
      const coords = getCityCoords(city);
      if (!coords) {
        return res.status(404).json({ message: "City not found ❌" });
      }
      [lat, lon] = coords;
    }

    const forecastRes = await axios.get(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5`
    );

    const hourly = forecastRes.data.hourly;

    if (!hourly || !hourly.time || !hourly.pm2_5) {
      return res.status(500).json({ error: "Forecast data missing ❌" });
    }

    const range = req.query.range;
    const limit = range === "week" ? 168 : range === "3days" ? 72 : 24;

    const slicedTime = hourly.time.slice(0, limit);
    const slicedPm = hourly.pm2_5.slice(0, limit);

    const formatted = slicedTime.map((t, i) => {
      const date = new Date(t);
      const hourLabel = date.toLocaleString("en-US", {
        hour: "numeric",
        hour12: true,
      });
      const aqi = Math.round(slicedPm[i] || 0);
      let status = "";
      if (aqi <= 50) status = "Good";
      else if (aqi <= 100) status = "Satisfactory";
      else if (aqi <= 200) status = "Moderate";
      else if (aqi <= 300) status = "Poor";
      else status = "Very Poor";

      return { time: hourLabel, fullTime: date.toLocaleString(), aqi, status };
    });

    res.json({ city, lat, lon, forecast: formatted });

  } catch (err) {
    console.error("FORECAST ERROR:", err.message);
    res.status(500).json({ error: "Forecast fetch failed ❌" });
  }
};