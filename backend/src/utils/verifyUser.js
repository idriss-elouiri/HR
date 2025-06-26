import { errorHandler } from "./error.js";
import jwt from "jsonwebtoken"

export const verifyToken = (req, res, next) => {
  console.log('Cookies:', req.cookies);
  const token = req.cookies.access_token;
  if (!token) {
      return next(errorHandler(401, "Unauthorized: No token provided"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
          console.error("Token verification error:", err);
          return next(errorHandler(401, "Unauthorized: Invalid token"));
      }
      
      req.user = user;
      next();
  });
};