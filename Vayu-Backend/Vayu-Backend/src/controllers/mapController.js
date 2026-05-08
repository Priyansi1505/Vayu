const https = require("https");

const WAQI_TOKEN = process.env.WAQI_API_KEY || process.env.WAQI_TOKEN || "demo";

console.log("WAQI TOKEN:", WAQI_TOKEN);

const httpGet = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
};

const getMapAQI = async (req, res) => {
  const { lat, lon } = req.query;

  console.log("MAP API called:", lat, lon);
  console.log("WAQI URL:", `https://api.waqi.info/map/bounds/?latlng=${parseFloat(lat)-1.5},${parseFloat(lon)-1.5},${parseFloat(lat)+1.5},${parseFloat(lon)+1.5}&networks=all&token=${WAQI_TOKEN}`);

  if (!lat || !lon) {
    return res.status(400).json({ error: "lat and lon are required" });
  }

  try {
    const delta = 1.5;
    const latlng = `${parseFloat(lat) - delta},${parseFloat(lon) - delta},${parseFloat(lat) + delta},${parseFloat(lon) + delta}`;

    const boundsUrl = `https://api.waqi.info/map/bounds/?latlng=${latlng}&networks=all&token=${WAQI_TOKEN}`;
    const geoUrl = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_TOKEN}`;

    const [boundsData, geoData] = await Promise.all([
      httpGet(boundsUrl),
      httpGet(geoUrl),
    ]);

    let stations = [];

    if (boundsData.status === "ok" && Array.isArray(boundsData.data)) {
      stations = boundsData.data
        .filter((s) => s.lat && s.lon && s.aqi && s.aqi !== "-")
        .map((s) => ({
          lat: parseFloat(s.lat),
          lon: parseFloat(s.lon),
          aqi: parseFloat(s.aqi),
          station: s.station?.name || "Unknown",
        }));
    }

    if (geoData.status === "ok" && geoData.data?.aqi) {
      stations.push({
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        aqi: parseFloat(geoData.data.aqi),
        station: geoData.data.city?.name || "City Center",
      });
    }

    return res.json(stations);
  } catch (err) {
    console.error("Map controller error:", err);
    return res.status(500).json({ error: "Failed to fetch map data" });
  }
};

module.exports = { getMapAQI };