const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  console.log("Auth middleware called");

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("Token:", token ? "Present" : "Missing");

  if (!token) {
    console.log("No token");
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token invalid:", err.message);
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    console.log("User authenticated:", user); //remove before deployment
    req.user = user;
    console.log(req.user)
    next();
  });
}

module.exports = authenticateToken;
