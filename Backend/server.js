require('dotenv').config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/project");
const hackathonRoutes= require("./routes/hackathon");
const participationRoutes = require('./routes/participation')
const { testConnection } = require("./config/database");
const pblRoutes= require('./routes/pbl')
const app = express();


console.log("DB_HOST:", process.env.DB_HOST); 
testConnection();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/project", projectRoutes);

app.use("/api/hackathon",hackathonRoutes);
app.use('/api/participation',participationRoutes)
app.use(`/api/pbl`,pblRoutes);

app.get("/", (req, res) => {
  res.send("API is working!");
});

const PORT = process.env.PORT || 5000;

process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection:", reason);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
