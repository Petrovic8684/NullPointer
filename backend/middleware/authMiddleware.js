const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

const authenticateUser = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided!" });

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(401).json({ message: "User not found!" });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token!" });
  }
};

module.exports = authenticateUser;
