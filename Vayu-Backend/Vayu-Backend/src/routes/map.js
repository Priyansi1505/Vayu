const express = require("express");
const router = express.Router();

// ✅ controller import
const { getMapAQI } = require("../controllers/mapController");

// 🔥 route for heatmap data
router.get("/", getMapAQI);

module.exports = router;