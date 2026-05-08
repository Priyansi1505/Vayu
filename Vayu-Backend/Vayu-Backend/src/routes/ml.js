const express = require("express");
const router = express.Router();
const { getPrediction } = require("../controllers/mlController");

router.get("/predict", getPrediction);

module.exports = router;
