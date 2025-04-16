import jwt from "jsonwebtoken";
import config from "../config.js";

function userMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided!" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.JWT_USER_PASSWORD); // Or JWT_USER_SECRET
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error("Invalid or expired token:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export default userMiddleware;
