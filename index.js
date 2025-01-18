import express from "express";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import morgan from "morgan";
import AuthRouter from "./routes/AuthRoutes.js";
import AdminRouter from "./routes/adminRoutes.js";
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const port = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("Backend Running!");
});

app.use("/user", AuthRouter);
app.use("/admin", AdminRouter);
app.listen(port, () => {
  console.log("Running on port:", port);
});

const connection = async () => {
  try {
    // Attempt to connect to the database
    await prisma.$connect();
    console.log("Connected to the database.");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
  }
};
connection();
