const { pool } = require("../config/database");
const User = require("../models/user");
const oracledb = require("oracledb");

class Hackathon {
  // Host a hackathon
  static async host_hackathon(hackathon_data, username) {
    const {
      hackathon_name,
      duration,
      genre,
      rule_book,
      hackathon_image,
      starting_date,
      ending_date,
      judge_username = [],
      judging_criteria = []
    } = hackathon_data;

    const result = await pool.execute(
      `INSERT INTO hackathon(
         hackathon_name, host_username, duration, genre, rule_book,
         hackathon_image, starting_date, ending_date, added_date
       ) VALUES (
         :hackathon_name, :username, :duration, :genre, :rule_book,
         :hackathon_image, TO_DATE(:starting_date,'YYYY-MM-DD'), TO_DATE(:ending_date,'YYYY-MM-DD'), SYSDATE
       )
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
        hackathon_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    const hackathon_id = result.outBinds.hackathon_id[0];

    // Insert judges
    const judgeUsernames = Array.isArray(judge_username)
      ? judge_username.map(j => (j || "").toString().trim())
      : (typeof judge_username === "string" ? judge_username.split(",").map(j => j.trim()) : []);

    for (const judge of judgeUsernames) {
      if (!judge) continue;
      const user = await User.findByUsername(judge);
      if (user) {
        await pool.execute(
          `INSERT INTO judges (judge_username, hackathon_id) VALUES (:judge_username, :hackathon_id)`,
          { judge_username: judge, hackathon_id }
        );
      }
    }

    // Insert criteria
    if (Array.isArray(judging_criteria)) {
      for (const c of judging_criteria) {
        const criteriaInfo = (c.criteriainfo || "").trim();
        if (!criteriaInfo) continue;

        await pool.execute(
          `INSERT INTO criterias (hackathon_id, criteria_info) VALUES (:hackathon_id, :criteria_info)`,
          { hackathon_id, criteria_info: criteriaInfo }
        );
      }
    }

    return { hackathon_id };
  }

  static async get_hackathon_by_username(username) {
    const result = await pool.execute(
      `SELECT * FROM hackathon WHERE host_username = :username`,
      { username },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  }

  static async get_hackathon_by_genre(genre) {
    const result = await pool.execute(
      `SELECT * FROM hackathon WHERE genre = :genre`,
      { genre },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  }

  static async get_all_hackathon() {
    const result = await pool.execute(
      `SELECT h.*, 
              LISTAGG(c.criteria_id || ':' || c.criteria_info, ',') WITHIN GROUP (ORDER BY c.criteria_id) AS criterias,
              LISTAGG(j.judge_username, ',') WITHIN GROUP (ORDER BY j.judge_username) AS judges
       FROM hackathon h
       LEFT JOIN criterias c ON h.hackathon_id = c.hackathon_id
       LEFT JOIN judges j ON h.hackathon_id = j.hackathon_id
       GROUP BY h.hackathon_id, h.hackathon_name, h.host_username, h.duration, h.genre, h.rule_book,
                h.hackathon_image, h.starting_date, h.ending_date, h.added_date`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.map(h => ({
      ...h,
      judging_criteria: h.criterias
        ? h.criterias.split(",").map(c => {
            const [id, info] = c.split(":");
            return { criteria_id: Number(id), criteriainfo: info };
          })
        : [],
      judges: h.judges ? h.judges.split(",") : []
    }));
  }

  static async get_hackathon_by_id(hackathon_id) {
    const result = await pool.execute(
      `SELECT * FROM hackathon WHERE hackathon_id = :hackathon_id`,
      { hackathon_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows[0] || null;
  }

  static async get_judge_details(hackathon_id) {
    const result = await pool.execute(
      `SELECT u.*, j.hackathon_id
       FROM users u
       JOIN judges j ON u.username = j.judge_username
       WHERE j.hackathon_id = :hackathon_id`,
      { hackathon_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  }

  static async get_hackathon_by_name(hackathon_name) {
    const result = await pool.execute(
      `SELECT * FROM hackathon WHERE hackathon_name = :hackathon_name`,
      { hackathon_name },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  }

  static async get_hackathon_by_duration(duration) {
    const result = await pool.execute(
      `SELECT * FROM hackathon WHERE duration = :duration`,
      { duration },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  }

  static async get_hackathons_by_judges(judge_username) {
    const result = await pool.execute(
      `SELECT h.*
       FROM hackathon h
       JOIN judges j ON h.hackathon_id = j.hackathon_id
       WHERE j.judge_username = :judge_username
         AND h.ending_date >= TRUNC(SYSDATE)`,
      { judge_username },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  }

  static async get_all_hackathons_by_judges(judge_username) {
    const result = await pool.execute(
      `SELECT h.*
       FROM hackathon h
       JOIN judges j ON h.hackathon_id = j.hackathon_id
       WHERE j.judge_username = :judge_username`,
      { judge_username },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  }

  static async role_finding(username, hackathon_id) {
    const result = await pool.execute(
      `SELECT role
       FROM user_roles
       WHERE username = :username AND hackathon_id = :hackathon_id`,
      { username, hackathon_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows[0] || null;
  }
}

module.exports = Hackathon;
