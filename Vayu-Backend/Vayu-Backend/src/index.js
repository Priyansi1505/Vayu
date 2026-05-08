require("dotenv").config({ path: __dirname + "/../.env" });

const express = require("express");
const cors = require("cors");

const app = express();

// ===================== MIDDLEWARE =====================
app.use(cors());
app.use(express.json());

// ===================== ROUTES =====================
const mlRoutes = require("./routes/ml");
app.use("/api/ml", mlRoutes);

app.use("/api/auth",       require("./routes/auth"));
app.use("/api/aqi",        require("./routes/aqi"));
app.use("/api/user",       require("./routes/user"));
app.use("/api/cities",     require("./routes/cities"));
app.use("/api/aqi-cities", require("./routes/aqiCities"));
app.use("/api/map",        require("./routes/map"));
app.use("/api/news",       require("./routes/news"));
app.use("/api/youtube",    require("./routes/youtube"));
app.use("/api/translate",  require("./routes/translate"));

// ===================== PRE-FETCH ON BOOT =====================
const citiesController = require("./controllers/aqiCities");
citiesController.prefetch();
citiesController.startAutoRefresh();

// ===================== TEST ROUTE =====================
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ===================== 404 HANDLER =====================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found ❌" });
});

// ===================== GLOBAL ERROR HANDLER =====================
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({
    message: err.message || "Something went wrong ❌",
  });
});

// ===================== SERVER =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});