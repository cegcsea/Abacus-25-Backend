import express from "express";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import morgan from "morgan";
import AuthRouter from "./routes/AuthRoutes.js";
import AdminRouter from "./routes/AdminRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
config();

console.log("APP ENTRY FILE LOADED");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Current Directory:", __dirname);

const app = express();
const prisma = new PrismaClient();

app.use(
  cors({
    origin: [
      "https://www.abacus.org.in",
      "https://abacus.org.in",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:8080",
      "https://abacus-admin-25.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "token", "Authorization"],
    credentials: false,
  }),
);

//Serve the images folder as a static directory
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(express.json());
app.use(morgan("dev"));

const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Backend Running!");
});
app.use("/admin", AdminRouter);
app.use("/user", AuthRouter);
console.log("AuthRouter registered at /user");

app.listen(port, () => {
  console.log("Server running on port", port);
  console.log("Running on port:", port);
});

const connection = async () => {
  try {
    //Attempt to connect to the database
    await prisma.$connect();
    console.log("Connected to the database.");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
  // } finally {
  //   // Disconnect from the database
  //   await prisma.$disconnect();
  // }
};
connection();
