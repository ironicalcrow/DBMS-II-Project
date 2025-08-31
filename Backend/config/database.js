const oracledb = require("oracledb");
require("dotenv").config();

// Optional: enable auto commit for convenience
oracledb.autoCommit = true;

// Oracle Instant Client initialization is optional in v6+, so this is safe
oracledb.initOracleClient?.();

// Connection Pool Configuration
const dataConfiguration = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, // EZCONNECT format
  poolMin: 1,
  poolMax: 10,
  poolIncrement: 1,
};

let pool;

// Initialize the connection pool
const initPool = async () => {
  try {
    if (!pool) {
      pool = await oracledb.createPool(dataConfiguration);
      console.log("✅ Oracle connection pool created successfully!");
    }
  } catch (error) {
    console.error("❌ Failed to create Oracle connection pool:", error.message);
    process.exit(1);
  }
};

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to Oracle database successfully!");
    await connection.close();
  } catch (error) {
    console.error("❌ Failed to connect to Oracle database:", error.message);
    process.exit(1);
  }
};

// Graceful shutdown (to close pool on app exit)
const closePool = async () => {
  try {
    if (pool) {
      await pool.close(10); // 10 seconds timeout
      console.log("✅ Oracle connection pool closed.");
    }
  } catch (error) {
    console.error("❌ Error closing Oracle connection pool:", error.message);
  }
};

module.exports = {
  initPool,
  testConnection,
  getPool: () => pool,
  closePool,
};
