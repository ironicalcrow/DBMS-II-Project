
const oracledb = require("oracledb");
require("dotenv").config();


oracledb.autoCommit = true;


try {
  oracledb.initOracleClient?.();
} catch (err) {
  console.warn("Oracle client init skipped:", err.message);
}

const _poolPromise = oracledb.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE}`,
  poolMin: Number(process.env.DB_POOL_MIN) || 1,
  poolMax: Number(process.env.DB_POOL_MAX) || 10,
  poolIncrement: Number(process.env.DB_POOL_INCREMENT) || 1,
});


const pool = {
  execute: async (sql, binds = {}, options = {}) => {
    const poolInstance = await _poolPromise;
    const connection = await poolInstance.getConnection();
    try {
      // Keep OUT_FORMAT_OBJECT so that rows are always objects (or array if desired)
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
    const poolInstance = await _poolPromise;
    return poolInstance.getConnection();
  },

  close: async () => {
    const poolInstance = await _poolPromise;
    await poolInstance.close(0);
  },

  _poolPromise,
};

module.exports = { pool };
