const axios = require('axios');

const fetchAQI = async (city) => {
  // ================================
  // 🌫️ AQI (WAQI API - already working)
  // ================================

  const searchRes = await axios.get(
    `https://api.waqi.info/search/?token=${process.env.WAQI_API_KEY}&keyword=${city}`
  );

  const results = searchRes.data.data;

  if (!results || results.length === 0) {
    throw new Error('City not found');
  }

  let selectedStation = results.find(item =>
    item.station.name.toLowerCase().includes(city.toLowerCase())
  );

  if (!selectedStation) {
    selectedStation = results[0];
  }

  const uid = selectedStation.uid;

  const aqiRes = await axios.get(
    `https://api.waqi.info/feed/@${uid}/?token=${process.env.WAQI_API_KEY}`
  );

  const data = aqiRes.data.data;

  // ================================
  // 🌤️ WEATHER (OpenWeather API - NEW)
  // ================================

  const weatherRes = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
  );

  const weather = {
    temperature: weatherRes.data.main.temp,
    humidity: weatherRes.data.main.humidity,
    wind: weatherRes.data.wind.speed
  };

  // ================================
  // FINAL RESPONSE
  // ================================

  return {
    city: data.city.name,
    aqi: data.aqi,

    // 🔥 NOW from OpenWeather
    temperature: weather.temperature,
    humidity: weather.humidity,
    wind: weather.wind,

    pollutants: {
      pm25: data.iaqi?.pm25?.v,
      pm10: data.iaqi?.pm10?.v,
      no2: data.iaqi?.no2?.v,
      so2: data.iaqi?.so2?.v,
      co: data.iaqi?.co?.v,
      o3: data.iaqi?.o3?.v
    }
  };
};

module.exports = { fetchAQI };