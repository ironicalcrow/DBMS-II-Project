const { pool } = require("../config/database");
const User = require("../models/user");
const oracledb = require("oracledb");

class Hackathon {
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

    // Insert hackathon & get ID back (Oracle RETURNING INTO)
    const result = await pool.execute(
      `INSERT INTO hackathon(
          hackathon_name, host_username, duration, genre, rule_book,
          hackathon_image, starting_date, ending_date, added_date
        ) VALUES (
          :hackathon_name, :username, :duration, :genre, :rule_book,
          :hackathon_image, :starting_date, :ending_date, SYSDATE
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

    // Judges (split string like in MySQL version)
    const judgeUsernames = judge_username.split(",").map(j => j.trim());

    for (const judge of judgeUsernames) {
      const judge_name = (judge || "").trim();
      if (!judge_name) continue;

      const user = await User.findByUsername(judge_name);
      if (user) {
        await pool.execute(
          `INSERT INTO judges (judge_username, hackathon_id) VALUES (:judge_username, :hackathon_id)`,
          { judge_username: judge_name, hackathon_id }
        );
      } else {
        console.warn(`User not found: ${judge_name} — skipping judge_entry`);
      }
    }

    // Criteria
    for (const c of judging_criteria) {
      const criteriaInfo = (c.criteriainfo || "").trim();
      if (!criteriaInfo) continue;

      await pool.execute(
        `INSERT INTO criterias (hackathon_id, criteria_info) VALUES (:hackathon_id, :criteria_info)`,
        { hackathon_id, criteria_info: criteriaInfo }
      );
    }

    return hackathon_id;
  }

  static async get_hackathon_by_username(username) {
    const result = await pool.execute(
      `BEGIN
         OPEN :cursor FOR
         SELECT * FROM hackathon WHERE host_username = :username;
       END;`,
      {
        username,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );
    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();
    return rows;
  }

  static async get_hackathon_by_genre(genre) {
    const result = await pool.execute(
      `BEGIN
         OPEN :cursor FOR
         SELECT * FROM hackathon WHERE genre = :genre;
       END;`,
      {
        genre,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );
    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();
    return rows;
  }

  static async get_all_hackathon() {
    const result = await pool.execute(
      `BEGIN GetHackathonDetails(:cursor); END;`,
      { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();

    return rows.map(h => ({
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
      `BEGIN
         OPEN :cursor FOR
         SELECT * FROM hackathon WHERE hackathon_id = :hackathon_id;
       END;`,
      {
        hackathon_id,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );
    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();
    return rows;
  }

  static async get_judge_details(hackathon_id) {
    const result = await pool.execute(
      `BEGIN
         OPEN :cursor FOR
         SELECT u.*, j.hackathon_id
         FROM users u
         JOIN judges j ON u.username = j.judge_username
         WHERE j.hackathon_id = :hackathon_id;
       END;`,
      {
        hackathon_id,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );
    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();
    return rows;
  }

  static async get_hackathon_by_name(hackathon_name) {
    const result = await pool.execute(
      `BEGIN
         OPEN :cursor FOR
         SELECT * FROM hackathon WHERE hackathon_name = :hackathon_name;
       END;`,
      {
        hackathon_name,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );
    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();
    return rows;
  }

  static async get_hackathon_by_duration(duration) {
    const result = await pool.execute(
      `BEGIN
         OPEN :cursor FOR
         SELECT * FROM hackathon WHERE duration = :duration;
       END;`,
      {
        duration,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );
    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();
    return rows;
  }

  static async get_hackathons_by_judges(judge_username) {
    const result = await pool.execute(
      `BEGIN
         OPEN :cursor FOR
         SELECT h.*
         FROM hackathon h
         JOIN judges j ON h.hackathon_id = j.hackathon_id
         WHERE j.judge_username = :judge_username
           AND h.ending_date >= TRUNC(SYSDATE);
       END;`,
      {
        judge_username,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );
    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();
    return rows;
  }

  static async get_all_hackathons_by_judges(judge_username) {
    const result = await pool.execute(
      `BEGIN
         OPEN :cursor FOR
         SELECT h.*
         FROM hackathon h
         JOIN judges j ON h.hackathon_id = j.hackathon_id
         WHERE j.judge_username = :judge_username;
       END;`,
      {
        judge_username,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );
    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();
    return rows;
  }

  static async role_finding(username, hackathon_id) {
    const result = await pool.execute(
      `BEGIN GetUserRole(:username, :hackathon_id, :cursor); END;`,
      {
        username,
        hackathon_id,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();

    return rows.length > 0 ? rows[0] : null;
  }

  static async get_user_role(req, res) {
    try {
      const { username } = req.user;
      const { hackathon_id } = req.params;

      const role = await Hackathon.role_finding(username, hackathon_id);

      if (!role) {
        return ResponseHandler.notFound(
          res,
          `No role found for ${username} in hackathon ${hackathon_id}`
        );
      }

      return ResponseHandler.success(res, { role }, "Role retrieved successfully");
    } catch (error) {
      console.error("Error retrieving role:", error);
      ResponseHandler.error(res, "Failed retrieving role", 500, error.message);
    }
  }
}

module.exports = Hackathon;
