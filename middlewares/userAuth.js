import jwt from 'jsonwebtoken'; // Correct import
import { config } from "dotenv"; // Assuming dotenv is properly configured

const auth = (req, res, next) => {
  const token = req.headers["token"]; // Extract token from headers

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

    req.id = decoded.id; // Add user ID to request object
    console.log("authorized");
    next(); // Proceed to the next middleware
  });
};

export default auth;
