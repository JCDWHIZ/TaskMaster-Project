const { configDotenv } = require("dotenv");
const jwt = require("jsonwebtoken");
configDotenv();

const authenticate = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Access denied. Token is required." });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    if (!decoded.userId) {
      throw new Error("userId not found in token payload");
    }
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token Verification Error:", err);
    return res.status(403).json({ error: "Invalid token." });
  }
};

module.exports = authenticate;
