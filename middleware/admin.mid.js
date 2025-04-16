import jwt from "jsonwebtoken";
import config from "../config.js";

function adminMiddleware(req, res, next) {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ errors: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_ADMIN_PASSWORD);
    req.adminId = decoded.id;
    next();
  } catch (error) {
    console.log("Error in admin middleware:", error);
    return res.status(401).json({ errors: "Invalid or expired token" });
  }
}

export default adminMiddleware;
