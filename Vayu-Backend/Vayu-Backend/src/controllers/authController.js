const jwt = require("jsonwebtoken");

// Dummy users (abhi ke liye memory me)
let users = [];

// ✅ SIGNUP
exports.signup = (req, res) => {
  const { email, password } = req.body;

  const userExists = users.find((u) => u.email === email);

  if (userExists) {
    return res.status(400).json({ message: "User already exists ❌" });
  }

  const newUser = { email, password };
  users.push(newUser);

  res.json({
    message: "Signup successful ✅",
    user: { email }
  });
};

// ✅ LOGIN
exports.login = (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials ❌" });
  }

  // 🔥 JWT TOKEN
  const token = jwt.sign(
    { email: user.email },
    "secretkey123",   // ✅ SAME SECRET
    { expiresIn: "1h" }
  );

  res.json({
    message: "Login successful ✅",
    token: token
  });
};