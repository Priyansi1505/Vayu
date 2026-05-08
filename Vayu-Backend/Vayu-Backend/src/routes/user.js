const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const {
  getProfile,
  addFavoriteCity,
  getFavorites,
} = require("../controllers/userController");

router.get("/profile", verifyToken, getProfile);

router.post("/favorites", verifyToken, addFavoriteCity);
router.get("/favorites", verifyToken, getFavorites);

module.exports = router;