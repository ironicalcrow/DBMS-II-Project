// models/user.js
const { pool } = require("../config/database");
const oracledb = require("oracledb");

class User {
  // Create a new user
  static async create_user(userData) {
    const { username, full_name, email, password_hash, date_of_birth } = userData;

   await pool.execute(
  `INSERT INTO users (username, full_name, email, password_hash, date_of_birth)
   VALUES (:username, :full_name, :email, :password_hash, TO_DATE(:date_of_birth, 'YYYY-MM-DD'))`,
  { username, full_name, email, password_hash, date_of_birth }
);

    return { username, full_name, email, date_of_birth };
  }

  // Find by username or email
  static async findByUsernameOrEmail(username, email) {
    const result = await pool.execute(
      `SELECT username, email FROM users WHERE username = :username OR email = :email`,
      { username, email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows[0] || null;
  }

  // Find by username
  static async findByUsername(username) {
    const result = await pool.execute(
      `SELECT * FROM users WHERE username = :username`,
      { username },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows[0] || null;
  }

  // Find by email
  static async findByEmail(email) {
    const result = await pool.execute(
      `SELECT * FROM users WHERE email = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows[0] || null;
  }

  // Find by username including password
  static async findByUsernameWithPassword(username) {
    const result = await pool.execute(
      `SELECT username, email, full_name, password_hash FROM users WHERE username = :username`,
      { username },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows[0] || null;
  }

  // Find by email including password
  static async findByEmailWithPassword(email) {
    const result = await pool.execute(
      `SELECT username, full_name, password_hash FROM users WHERE email = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows[0] || null;
  }

  // Get full user profile
  static async getProfile(username) {
    const result = await pool.execute(
      `SELECT * FROM users WHERE username = :username`,
      { username },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows[0] || null;
  }

  // Update user profile
  static async updateProfile(username, updateData) {
    const { full_name, date_of_birth, skills, interests, achievement, bio, github_link, institution, phone, image } = updateData;

    await pool.execute(
      `UPDATE users SET
         full_name = NVL(:full_name, full_name),
         date_of_birth = NVL(:date_of_birth, date_of_birth),
         skills = NVL(:skills, skills),
         interests = NVL(:interests, interests),
         achievement = NVL(:achievement, achievement),
         bio = NVL(:bio, bio),
         github_link = NVL(:github_link, github_link),
         institution = NVL(:institution, institution),
         phone = NVL(:phone, phone),
         image = NVL(:image, image)
       WHERE username = :username`,
      { full_name, date_of_birth, skills, interests, achievement, bio, github_link, institution, phone, image, username }
    );

    return await User.getProfile(username);
  }

  // Update password
  static async updatePassword(username, newPasswordHash) {
    await pool.execute(
      `UPDATE users SET password_hash = :password_hash WHERE username = :username`,
      { password_hash: newPasswordHash, username }
    );
    return { username };
  }
}

module.exports = User;
