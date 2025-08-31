const { pool } = require("../config/database");
const User = require("../models/user");
const oracledb = require("oracledb");

class Hackathon {
  // ✅ Host a hackathon
  static async host_hackathon(hackathon_data, username) {
    const {
      hackathon_name,
      duration,
      genre,
      rule_book,
      hackathon_image,
      starting_date,
      ending_date,
      judge_username = "",
      judging_criteria = [],
    } = hackathon_data;

    // Insert hackathon and return ID
    const result = await pool.execute(
      `INSERT INTO hackathon 
        (hackathon_name, host_username, duration, genre, rule_book, hackathon_image, starting_date, ending_date, added_date)
       VALUES (:hackathon_name, :username, :duration, :genre, :rule_book, :hackathon_image,
       TO_DATE(:starting_date,'YYYY-MM-DD'), TO_DATE(:ending_date,'YYYY-MM-DD'), SYSDATE)
       RETURNING hackathon_id INTO :hackathon_id`,
      {
        hackathon_name,
        username,
        duration,
        genre,
        rule_book,
        hackathon_image,
        starting_date,
        ending_date,
        hackathon_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: false }
    );

    const hackathon_id = result.outBinds.hackathon_id[0];

    // ✅ Insert judges
    const judgeUsernames = judge_username.split(",").map((j) => j.trim());
    for (const judge of judgeUsernames) {
      const judge_user = (judge || "").trim();
      if (!judge_user) continue;

      const user = await User.findByUsername(judge_user);
      if (user) {
        await pool.execute(
          `INSERT INTO judges (judge_username, hackathon_id) VALUES (:judge_username, :hackathon_id)`,
          { judge_username: judge_user, hackathon_id }
        );
      }
    }

    // ✅ Insert judging criteria
    for (const c of judging_criteria) {
      const criteriaInfo = (c.criteriainfo || "").trim();
      if (!criteriaInfo) continue;

      await pool.execute(
        `INSERT INTO criterias (hackathon_id, criteria_info) VALUES (:hackathon_id, :criteria_info)`,
        { hackathon_id, criteria_info: criteriaInfo }
      );
    }

    await pool.commit();

    return { hackathon_id };
  }

  // ✅ Get all hackathons with judges & criteria
  static async get_all_hackathon() {
    const result = await pool.execute(
      `
      SELECT 
        h.hackathon_id,
        h.hackathon_name,
        h.host_username,
        h.duration,
        h.genre,
        h.rule_book,
        h.hackathon_image,
        TO_CHAR(h.starting_date, 'YYYY-MM-DD') AS starting_date,
        TO_CHAR(h.ending_date, 'YYYY-MM-DD') AS ending_date,
        TO_CHAR(h.added_date, 'YYYY-MM-DD') AS added_date,
        LISTAGG(c.criteria_id || ':' || c.criteria_info, ',') WITHIN GROUP (ORDER BY c.criteria_id) AS criterias,
        LISTAGG(j.judge_username, ',') WITHIN GROUP (ORDER BY j.judge_username) AS judges
      FROM hackathon h
      LEFT JOIN criterias c ON h.hackathon_id = c.hackathon_id
      LEFT JOIN judges j ON h.hackathon_id = j.hackathon_id
      GROUP BY h.hackathon_id, h.hackathon_name, h.host_username, h.duration, h.genre, h.rule_book, h.hackathon_image, h.starting_date, h.ending_date, h.added_date
      ORDER BY h.added_date DESC
      `
    );

    const rows = result.rows || [];
    return rows.map((r) => ({
      hackathon_id: r[0],
      hackathon_name: r[1],
      host_username: r[2],
      duration: r[3],
      genre: r[4],
      rule_book: r[5],
      hackathon_image: r[6],
      starting_date: r[7],
      ending_date: r[8],
      added_date: r[9],
      judging_criteria: r[10]
        ? r[10].split(",").map((c) => {
            const [id, info] = c.split(":");
            return { criteria_id: Number(id), criteriainfo: info };
          })
        : [],
      judges: r[11] ? r[11].split(",") : [],
    }));
  }

  // ✅ Get hackathon by username
  static async get_hackathon_by_username(username) {
    const result = await pool.execute(
      `SELECT * FROM hackathon WHERE host_username = :username`,
      { username }
    );
    return this.mapHackathon(result.rows);
  }

  // ✅ Get hackathon by genre
  static async get_hackathon_by_genre(genre) {
    const result = await pool.execute(
      `SELECT * FROM hackathon WHERE genre = :genre`,
      { genre }
    );
    return this.mapHackathon(result.rows);
  }

  // ✅ Get hackathon by ID
  static async get_hackathon_by_id(hackathon_id) {
    const result = await pool.execute(
      `SELECT * FROM hackathon WHERE hackathon_id = :hackathon_id`,
      { hackathon_id }
    );
    return this.mapHackathon(result.rows);
  }

  // ✅ Get judge details
  static async get_judge_details(hackathon_id) {
    const result = await pool.execute(
      `SELECT u.username, u.full_name, u.email, u.image
       FROM users u
       JOIN judges j ON u.username = j.judge_username
       WHERE j.hackathon_id = :hackathon_id`,
      { hackathon_id }
    );
    return result.rows.map((r) => ({
      username: r[0],
      full_name: r[1],
      email: r[2],
      image: r[3],
    }));
  }

  // ✅ Get hackathon by name
  static async get_hackathon_by_name(hackathon_name) {
    const result = await pool.execute(
      `SELECT * FROM hackathon WHERE hackathon_name = :hackathon_name`,
      { hackathon_name }
    );
    return this.mapHackathon(result.rows);
  }

  // ✅ Get hackathon by duration
  static async get_hackathon_by_duration(duration) {
    const result = await pool.execute(
      `SELECT * FROM hackathon WHERE duration = :duration`,
      { duration }
    );
    return this.mapHackathon(result.rows);
  }

  // ✅ Get upcoming hackathons for a judge
  static async get_hackathons_by_judges(judge_username) {
    const result = await pool.execute(
      `SELECT h.* 
       FROM hackathon h 
       JOIN judges j ON h.hackathon_id = j.hackathon_id 
       WHERE j.judge_username = :judge_username AND h.ending_date >= TRUNC(SYSDATE)`,
      { judge_username }
    );
    return this.mapHackathon(result.rows);
  }

  // ✅ Get all hackathons by judge
  static async get_all_hackathons_by_judges(judge_username) {
    const result = await pool.execute(
      `SELECT h.* 
       FROM hackathon h 
       JOIN judges j ON h.hackathon_id = j.hackathon_id 
       WHERE j.judge_username = :judge_username`,
      { judge_username }
    );
    return this.mapHackathon(result.rows);
  }

  // ✅ Role finding
  static async role_finding(username, hackathon_id) {
    const result = await pool.execute(
      `SELECT 
          CASE
            WHEN h.host_username = :username THEN 'Host'
            WHEN j.judge_username = :username THEN 'Judge'
            WHEN tp.username = :username THEN 'Participant'
            ELSE 'No Role'
          END AS role
       FROM hackathon h
       LEFT JOIN judges j ON j.hackathon_id = h.hackathon_id
       LEFT JOIN team_participants tp ON tp.hackathon_id = h.hackathon_id
       WHERE h.hackathon_id = :hackathon_id`,
      { username, hackathon_id }
    );

    return result.rows.length > 0
      ? { role: result.rows[0][0] }
      : { role: "No Role" };
  }

  // ✅ Get user role
  static async get_user_role(req, res) {
    try {
      const { username } = req.user;
      const { hackathon_id } = req.params;

      const role = await this.role_finding(username, hackathon_id);

      if (!role) {
        return ResponseHandler.notFound(
          res,
          `No role found for ${username} in hackathon ${hackathon_id}`
        );
      }

      return ResponseHandler.success(
        res,
        { role },
        "Role retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving role:", error);
      ResponseHandler.error(res, "Failed retrieving role", 500, error.message);
    }
  }

  // ✅ Helper for mapping hackathon rows
  static mapHackathon(rows) {
    return rows.map((r) => ({
      hackathon_id: r[0],
      hackathon_name: r[1],
      host_username: r[2],
      duration: r[3],
      genre: r[4],
      rule_book: r[5],
      hackathon_image: r[6],
      starting_date: r[7],
      ending_date: r[8],
      added_date: r[9],
    }));
  }
}

module.exports = Hackathon;
