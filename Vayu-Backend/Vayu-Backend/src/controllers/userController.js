exports.getProfile = (req, res) => {
  res.json({
    message: "Protected data accessed ✅",
    user: req.user,
  });
};

exports.addFavoriteCity = (req, res) => {
  const { city } = req.body;

  if (!req.user.favorites) {
    req.user.favorites = [];
  }

  if (!req.user.favorites.includes(city)) {
    req.user.favorites.push(city);
  }

  res.json({
    message: "City added to favorites ⭐",
    favorites: req.user.favorites,
  });
};

exports.getFavorites = (req, res) => {
  res.json({
    favorites: req.user.favorites || [],
  });
};