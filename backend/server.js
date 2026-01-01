import express, { Router } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import db from "./config/db.js";
import router from "./routes/admin-routes/admin.routes.js";
import authRouter from "./routes/auth/auth.routes.js";
import activityLogger from "./middlewares/activityLogger.js";
import systemErrorHandler from "./middlewares/systemErrorHandler.js";
// Startup Manager
import startupManager from "./startup-manager/startupManager.js";
await startupManager.startupManager();

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Activity Logger Middleware
app.use(activityLogger);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
// Routes
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.use("/api/auth", authRouter);
app.use("/api/admin", router);

// System Error Handler Middleware
app.use(systemErrorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
