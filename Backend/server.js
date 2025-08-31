// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool } = require("./config/database"); // our pool wrapper from config/database.js

const app = express();

// Useful process-level handlers (kept from your original file)
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection:", reason);
});

console.log("DB_HOST:", process.env.DB_HOST);

// Wrap startup in an async IIFE so we can await pool creation before loading routes
(async () => {
  try {
    console.log("Waiting for DB pool to initialize...");
    await pool._poolPromise; // ensure the underlying pool has been created

    // optional light DB ping to confirm connectivity (doesn't throw on pool creation failure)
    try {
      const ping = await pool.execute("SELECT 1 AS ping FROM dual");
      console.log("DB ping OK:", ping.rows && ping.rows[0]);
    } catch (pingErr) {
      console.warn("DB ping failed (pool exists):", pingErr.message);
    }

    // Now require routes AFTER the pool is ready so model requires won't race
    const authRoutes = require("./routes/auth");
    const projectRoutes = require("./routes/project");
    const hackathonRoutes = require("./routes/hackathon");
    const participationRoutes = require("./routes/participation");

    app.use(
      cors({
        origin: "http://localhost:3000",
        credentials: true,
      })
    );
    app.use(express.json());

    app.use("/api/auth", authRoutes);
    app.use("/api/project", projectRoutes);
    app.use("/api/hackathon", hackathonRoutes);
    app.use("/api/participation", participationRoutes);

    app.get("/", (req, res) => {
      res.send("API is working!");
    });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to initialize DB pool or start server:", err);
    process.exit(1);
  }
})();
