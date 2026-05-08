const express = require('express');
const router = express.Router();

const {
  getAQI,
  getForecast,
  getAQIByCoords
} = require('../controllers/aqiController');

// 🔥 FORECAST (keep this on top)
router.get('/forecast/:city', getForecast);

// 🔥 HYPERLOCAL AQI
router.get('/coords', getAQIByCoords);

// 🔥 CURRENT AQI (keep this LAST)
router.get('/:city', getAQI);

module.exports = router;