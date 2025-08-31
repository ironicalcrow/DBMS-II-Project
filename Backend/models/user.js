const { pool } = require("../config/database");
const oracledb = require("oracledb");

// Automatically fetch CLOBs as strings
oracledb.fetchAsString = [oracledb.CLOB];

class User {
  // ✅ Helper to map a single user row to consistent object
  static async mapUserRow(row) {
    if (!row) return null;
    return {
      username: row.USERNAME,
      full_name: row.FULL_NAME,
      email: row.EMAIL,
      password_hash: row.PASSWORD_HASH ? String(row.PASSWORD_HASH) : null,
      date_of_birth: row.DATE_OF_BIRTH,
      skills: row.SKILLS || "",
      interests: row.INTERESTS || "",
      achievement: row.ACHIEVEMENT || "",
      bio: row.BIO || "",
      github_link: row.GITHUB_LINK,
      institution: row.INSTITUTION,
      phone: row.PHONE,
      image: row.IMAGE,
    };
  }

  static async mapUserRows(rows) {
    return await Promise.all(rows.map((r) => User.mapUserRow(r)));
  }

  // ✅ Create User
  static async create_user(userData) {
    const { username, full_name, email, password_hash, date_of_birth } =
      userData;

    const sql = `
      INSERT INTO users (username, full_name, email, password_hash, date_of_birth)
      VALUES (:username, :full_name, :email, :password_hash, TO_DATE(:date_of_birth, 'YYYY-MM-DD'))
    `;
    await pool.execute(
      sql,
      { username, full_name, email, password_hash, date_of_birth },
      { autoCommit: true }
    );
    return { message: "User created successfully" };
  }

  // ✅ Find by Username or Email
  static async findByUsernameOrEmail(username, email) {
    const sql = `SELECT * FROM users WHERE USERNAME = :username OR EMAIL = :email`;
    const result = await pool.execute(
      sql,
      { username, email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return await User.mapUserRow(result.rows[0]);
  }

  // ✅ Find by Username
  static async findByUsername(username) {
    const sql = `SELECT * FROM users WHERE USERNAME = :username`;
    const result = await pool.execute(
      sql,
      { username },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return await User.mapUserRow(result.rows[0]);
  }

  // ✅ Find by Email
  static async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE EMAIL = :email`;
    const result = await pool.execute(
      sql,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return await User.mapUserRow(result.rows[0]);
  }

  // ✅ Find by Username with Password
  static async findByUsernameWithPassword(username) {
    const sql = `SELECT * FROM users WHERE USERNAME = :username`;
    const result = await pool.execute(
      sql,
      { username },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const row = result.rows[0];
    if (!row) return null;

    const user = await User.mapUserRow(row);
    user.password_hash = row.PASSWORD_HASH ? String(row.PASSWORD_HASH) : null;
    return user;
  }

  // ✅ Find by Email with Password
  static async findByEmailWithPassword(email) {
    const sql = `SELECT * FROM users WHERE EMAIL = :email`;
    const result = await pool.execute(
      sql,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const row = result.rows[0];
    if (!row) return null;

    const user = await User.mapUserRow(row);
    user.password_hash = row.PASSWORD_HASH ? String(row.PASSWORD_HASH) : null;
    return user;
  }

  // ✅ Get Profile
  static async getProfile(username) {
    return await User.findByUsername(username);
  }

  // ✅ Update Profile
  static async updateProfile(username, updateData) {
    const {
      full_name,
      skills,
      interests,
      achievement,
      bio,
      github_link,
      institution,
      phone,
      image,
    } = updateData;

    let sql = `
      UPDATE users SET
        full_name = NVL(:full_name, full_name),
        github_link = NVL(:github_link, github_link),
        institution = NVL(:institution, institution),
        phone = NVL(:phone, phone),
        image = NVL(:image, image)
    `;

    const binds = {
      username,
      full_name,
      github_link,
      institution,
      phone,
      image,
    };

    if (skills !== undefined) {
      sql += ", skills = :skills";
      binds.skills = skills;
    }
    if (interests !== undefined) {
      sql += ", interests = :interests";
      binds.interests = interests;
    }
    if (achievement !== undefined) {
      sql += ", achievement = :achievement";
      binds.achievement = achievement;
    }
    if (bio !== undefined) {
      sql += ", bio = :bio";
      binds.bio = bio;
    }

    sql += " WHERE username = :username";

    const result = await pool.execute(sql, binds, { autoCommit: true });
    return { rowsAffected: result.rowsAffected || 0 };
  }

  // ✅ Update Password
  static async updatePassword(username, newPasswordHash) {
    const sql = `UPDATE users SET PASSWORD_HASH = :password_hash WHERE USERNAME = :username`;
    const result = await pool.execute(
      sql,
      { password_hash: newPasswordHash, username },
      { autoCommit: true }
    );
    return { rowsAffected: result.rowsAffected || 0 };
  }
}

module.exports = User;
