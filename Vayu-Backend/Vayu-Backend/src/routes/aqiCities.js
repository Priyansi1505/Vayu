const express = require("express");
const router = express.Router();
const { getTopCitiesIndia } = require("../controllers/aqiCities");

router.get("/", getTopCitiesIndia);

module.exports = router;