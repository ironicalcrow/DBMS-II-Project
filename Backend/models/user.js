const { pool } = require("../config/database");
const PasswordUtils = require("../utils/passwordUtils");
const oracledb = require("oracledb");

class User {
  // Create user
  static async create_user(userData) {
    const { username, full_name, email, password_hash, date_of_birth } = userData;

    await pool.execute(
      `BEGIN
         INSERT INTO users (
           username, full_name, email, password_hash, date_of_birth
         ) VALUES (
           :username, :full_name, :email, :password_hash, :date_of_birth
         );
       END;`,
      { username, full_name, email, password_hash, date_of_birth }
    );
  }

  // Find by username or email
  static async findByUsernameOrEmail(username, email) {
    const result = await pool.execute(
      `BEGIN
         OPEN :cursor FOR
         SELECT username, email
         FROM users
         WHERE username = :username OR email = :email;
       END;`,
      { username, email, cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();
    return rows[0] || null;
  }

  // Find by username
  static async findByUsername(username) {
    const result = await pool.execute(
      `BEGIN
         OPEN :cursor FOR
         SELECT * FROM users WHERE username = :username;
       END;`,
      { username, cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();
    return rows[0] || null;
  }

  // Find by email
  static async findByEmail(email) {
    const result = await pool.execute(
      `BEGIN
         OPEN :cursor FOR
         SELECT * FROM users WHERE email = :email;
       END;`,
      { email, cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();
    return rows[0] || null;
  }

  // Find by username with password
  static async findByUsernameWithPassword(username) {
    const result = await pool.execute(
      `BEGIN
         OPEN :cursor FOR
         SELECT username, email, full_name, password_hash
         FROM users WHERE username = :username;
       END;`,
      { username, cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();
    return rows[0] || null;
  }

  // Find by email with password
  static async findByEmailWithPassword(email) {
    const result = await pool.execute(
      `BEGIN
         OPEN :cursor FOR
         SELECT username, full_name, password_hash
         FROM users WHERE email = :email;
       END;`,
      { email, cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();
    return rows[0] || null;
  }

  // Get profile
  static async getProfile(username) {
    const result = await pool.execute(
      `BEGIN
         OPEN :cursor FOR SELECT * FROM users WHERE username = :username;
       END;`,
      { username, cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();
    return rows[0] || null;
  }

  // Update profile
  static async updateProfile(username, updateData) {
    const { full_name, date_of_birth, skills, interests, achievement, bio, github_link, institution, phone, image } = updateData;

    await pool.execute(
      `BEGIN
         UPDATE users SET
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
         WHERE username = :username;
       END;`,
      { full_name, date_of_birth, skills, interests, achievement, bio, github_link, institution, phone, image, username }
    );

    return { username };
  }

  // Update password
  static async updatePassword(username, newPasswordHash) {
    await pool.execute(
      `BEGIN
         UPDATE users SET password_hash = :password_hash WHERE username = :username;
       END;`,
      { password_hash: newPasswordHash, username }
    );
    return { username };
  }
}

module.exports = User;
