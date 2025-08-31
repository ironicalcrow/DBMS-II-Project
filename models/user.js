const { pool } = require("../config/database");
const PasswordUtils = require("../utils/passwordUtils");

class User {
  // ✅ Create User
  static async create_user(userData) {
    const { username, full_name, email, password_hash, date_of_birth } =
      userData;

    const sql = `
      INSERT INTO users (
        username, full_name, email, password_hash, date_of_birth
      ) VALUES (:username, :full_name, :email, :password_hash, TO_DATE(:date_of_birth, 'YYYY-MM-DD'))
    `;

    await pool.execute(
      sql,
      {
        username,
        full_name,
        email,
        password_hash,
        date_of_birth,
      },
      { autoCommit: true }
    );

    return { message: "User created successfully" };
  }

  // ✅ Find by Username OR Email
  static async findByUsernameOrEmail(username, email) {
    const sql = `
      SELECT username, email FROM users 
      WHERE username = :username OR email = :email
    `;

    const result = await pool.execute(sql, { username, email });
    if (!result.rows || result.rows.length === 0) return null;

    const [row] = result.rows;
    return {
      username: row[0],
      email: row[1],
    };
  }

  // ✅ Find by Username
  static async findByUsername(username) {
    const sql = `SELECT * FROM users WHERE username = :username`;
    const result = await pool.execute(sql, { username });
    if (!result.rows || result.rows.length === 0) return null;

    const [row] = result.rows;
    return {
      username: row[0],
      full_name: row[1],
      email: row[2],
      password_hash: row[3],
      date_of_birth: row[4],
      skills: row[5],
      interests: row[6],
      achievement: row[7],
      bio: row[8],
      github_link: row[9],
      institution: row[10],
      phone: row[11],
      image: row[12],
    };
  }

  // ✅ Find by Email
  static async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE email = :email`;
    const result = await pool.execute(sql, { email });
    if (!result.rows || result.rows.length === 0) return null;

    const [row] = result.rows;
    return {
      username: row[0],
      full_name: row[1],
      email: row[2],
      password_hash: row[3],
      date_of_birth: row[4],
      skills: row[5],
      interests: row[6],
      achievement: row[7],
      bio: row[8],
      github_link: row[9],
      institution: row[10],
      phone: row[11],
      image: row[12],
    };
  }

  // ✅ Find by Username with Password
  static async findByUsernameWithPassword(username) {
    const sql = `
      SELECT username, email, full_name, password_hash 
      FROM users WHERE username = :username
    `;
    const result = await pool.execute(sql, { username });
    if (!result.rows || result.rows.length === 0) return null;

    const [row] = result.rows;
    return {
      username: row[0],
      email: row[1],
      full_name: row[2],
      password_hash: row[3],
    };
  }

  // ✅ Find by Email with Password
  static async findByEmailWithPassword(email) {
    const sql = `
      SELECT username, full_name, password_hash 
      FROM users WHERE email = :email
    `;
    const result = await pool.execute(sql, { email });
    if (!result.rows || result.rows.length === 0) return null;

    const [row] = result.rows;
    return {
      username: row[0],
      full_name: row[1],
      password_hash: row[2],
    };
  }

  // ✅ Get Profile
  static async getProfile(username) {
    const sql = `SELECT * FROM users WHERE username = :username`;
    const result = await pool.execute(sql, { username });
    if (!result.rows || result.rows.length === 0) return null;

    const [row] = result.rows;
    return {
      username: row[0],
      full_name: row[1],
      email: row[2],
      password_hash: row[3],
      date_of_birth: row[4],
      skills: row[5],
      interests: row[6],
      achievement: row[7],
      bio: row[8],
      github_link: row[9],
      institution: row[10],
      phone: row[11],
      image: row[12],
    };
  }

  // ✅ Update Profile
  static async updateProfile(username, updateData) {
    const {
      full_name,
      date_of_birth,
      skills,
      interests,
      achievement,
      bio,
      github_link,
      institution,
      phone,
      image,
    } = updateData;

    const sql = `
      UPDATE users SET
        full_name = NVL(:full_name, full_name),
        skills = NVL(:skills, skills),
        interests = NVL(:interests, interests),
        achievement = NVL(:achievement, achievement),
        bio = NVL(:bio, bio),
        github_link = NVL(:github_link, github_link),
        institution = NVL(:institution, institution),
        phone = NVL(:phone, phone),
        image = NVL(:image, image)
      WHERE username = :username
    `;

    const result = await pool.execute(
      sql,
      {
        full_name,
        skills,
        interests,
        achievement,
        bio,
        github_link,
        institution,
        phone,
        image,
        username,
      },
      { autoCommit: true }
    );

    return { rowsAffected: result.rowsAffected || 0 };
  }

  // ✅ Update Password
  static async updatePassword(username, newPasswordHash) {
    const sql = `UPDATE users SET password_hash = :password_hash WHERE username = :username`;
    const result = await pool.execute(
      sql,
      { password_hash: newPasswordHash, username },
      { autoCommit: true }
    );

    return { rowsAffected: result.rowsAffected || 0 };
  }
}

module.exports = User;
