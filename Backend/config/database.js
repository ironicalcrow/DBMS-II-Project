// config/database.js
const oracledb = require("oracledb");
require("dotenv").config();

// Auto-commit enabled by default
oracledb.autoCommit = true;

// Optional Oracle Instant Client init
try {
  oracledb.initOracleClient?.();
} catch (err) {
  console.warn("Oracle client init skipped:", err.message);
}

// Create a pool promise (do NOT await at top-level)
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
    const p = await _poolPromise;
    let connection;
    try {
      connection = await p.getConnection();
      const opts = Object.assign({ outFormat: oracledb.OUT_FORMAT_OBJECT }, options);
      const result = await connection.execute(sql, binds, opts);
      return result;
    } finally {
      if (connection) await connection.close();
    }
  },

  getConnection: async () => {
    const p = await _poolPromise;
    return p.getConnection();
  },

  close: async () => {
    const p = await _poolPromise;
    await p.close(0);
  },

  _poolPromise, // in case you want to await pool creation explicitly
};

module.exports = { pool };
