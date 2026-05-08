const express = require("express");
const router = express.Router();
const axios = require("axios");

// Fallback Indian cities list
const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata",
  "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur",
  "Nagpur", "Indore", "Bhopal", "Patna", "Vadodara", "Ludhiana",
  "Agra", "Varanasi", "Meerut", "Rajkot", "Amritsar", "Allahabad",
  "Ranchi", "Chandigarh", "Coimbatore", "Guwahati", "Visakhapatnam",
  "Bhubaneswar", "Kochi", "Mysore", "Jodhpur", "Raipur", "Gwalior",
  "Vijayawada", "Madurai", "Faridabad", "Noida", "Gurgaon", "Dehradun",
  "Srinagar", "Shimla", "Jammu", "Mangalore", "Hubli", "Tirupati",
  "Udaipur", "Ajmer", "Bikaner"
];

router.get("/search", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ message: "Query required ❌" });
  }

  try {
    // Try OpenWeather API first
    const indiaRes = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${query},India&limit=5&appid=${process.env.OPENWEATHER_API_KEY}`,
      { timeout: 5000 }
    );

    let results = indiaRes.data.filter((r) => r.country === "IN");

    if (results.length === 0) {
      const globalRes = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${process.env.OPENWEATHER_API_KEY}`,
        { timeout: 5000 }
      );
      results = globalRes.data;
    }

    results = results.map((r) => ({
      ...r,
      state: r.state && r.state !== r.name ? r.state : null,
    }));

    res.json(results);

  } catch (err) {
    console.error("OpenWeather API failed, using fallback:", err.message);

    // ✅ FALLBACK: filter from local list
    const filtered = INDIAN_CITIES
      .filter((c) => c.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 6)
      .map((c) => ({ name: c, state: "India", country: "IN" }));

    res.json(filtered);
  }
});

module.exports = router;