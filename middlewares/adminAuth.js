import jwt from "jsonwebtoken";

import dotenv from 'dotenv';
dotenv.config();


const auth = (req, res, next) => {
  const token = req.header("token");
  if (!token) {
    // No token provided
    return res.status(401).json({
      status: "error",
      error: "Unauthorized",
      message: "No token provided",
    });
  }

  jwt.verify(token, process.env.JWTPRIVATEKEY, (err, decoded) => {
    if (err) {
      // Invalid token provided
      return res.status(401).json({
        status: "error",
        error: "Unauthorized",
        message: "Invalid Token",
      });
    }

    if (decoded.role !== "ADMIN") {
      return res.status(401).json({
        status: "error",
        error: "Unauthorized",
        message: "Invalid Token",
      });
    }

    req.id = decoded.id;
    next();
  });
};

export default auth;
