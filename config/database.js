// config/database.js
const oracledb = require("oracledb");
require("dotenv").config();

// Enable auto-commit globally
oracledb.autoCommit = true;

// Optional Oracle Instant Client init
try {
  oracledb.initOracleClient?.();
} catch (err) {
  console.warn("Oracle client init skipped:", err.message);
}

// Create a pool (do NOT await at top-level)
const _poolPromise = oracledb.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE}`,
  poolMin: Number(process.env.DB_POOL_MIN) || 1,
  poolMax: Number(process.env.DB_POOL_MAX) || 10,
  poolIncrement: Number(process.env.DB_POOL_INCREMENT) || 1,
});

// Pool wrapper
const pool = {
  execute: async (sql, binds = {}, options = {}) => {
    const connection = await (await _poolPromise).getConnection();
    try {
      // Always return rows as objects
      const opts = { outFormat: oracledb.OUT_FORMAT_OBJECT, ...options };
      const result = await connection.execute(sql, binds, opts);
      return result;
    } catch (err) {
      console.error("Database execution error:", err);
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  },

  getConnection: async () => {
    return (await _poolPromise).getConnection();
  },

  close: async () => {
    const pool = await _poolPromise;
    await pool.close(0);
  },

  _poolPromise, // expose in case you need to await pool creation
};

module.exports = { pool };
