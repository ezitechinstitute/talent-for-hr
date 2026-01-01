const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const db = require("./config/db.js");
const router = require("./routes/admin-routes/admin.routes.js");
const authRouter = require("./routes/auth/auth.routes.js");
const activityLogger = require("./middlewares/activityLogger.js");
const systemErrorHandler = require("./middlewares/systemErrorHandler.js");
// Startup Manager
const startupManager = require("./startup-manager/startupManager.js");

(async () => {
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
})();
