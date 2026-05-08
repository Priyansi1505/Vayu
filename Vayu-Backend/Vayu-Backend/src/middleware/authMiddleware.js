const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "No token ❌" });
  }

  try {
    const decoded = jwt.verify(token, "secretkey123"); // ✅ SAME SECRET
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token ❌" });
  }
};