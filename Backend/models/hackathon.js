const { pool } = require("../config/database");
const User = require("../models/user");
const oracledb = require("oracledb");
const clobToString = require("../utils/clobToStrings");


oracledb.fetchAsString = [oracledb.CLOB];

class Hackathon {

  static async host_hackathon(hackathon_data, username) {
    const {
      hackathon_name,
      duration,
      genre,
      rule_book = "",
      hackathon_image,
      starting_date,
      ending_date,
      judge_username = "",
      judging_criteria = [],
    } = hackathon_data;

    // Insert hackathon and get hackathon_id
    const result = await pool.execute(
      `
      INSERT INTO hackathon 
        (hackathon_name, host_username, duration, genre, rule_book, hackathon_image, starting_date, ending_date, added_date)
      VALUES (:hackathon_name, :username, :duration, :genre, :rule_book, :hackathon_image,
        TO_DATE(:starting_date,'YYYY-MM-DD'), TO_DATE(:ending_date,'YYYY-MM-DD'), SYSDATE)
      RETURNING hackathon_id INTO :hackathon_id
      `,
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


    const judgeUsernames = judge_username
      .split(",")
      .map((j) => j.trim())
      .filter(Boolean);
    for (const judge of judgeUsernames) {
      const user = await User.findByUsername(judge);
      if (user) {
        await pool.execute(
          `INSERT INTO judges (judge_username, hackathon_id) VALUES (:judge_username, :hackathon_id)`,
          { judge_username: judge, hackathon_id }
        );
      }
    }


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


  static async mapHackathon(rows) {
    return await Promise.all(
      rows.map(async (r) => {

        const criteriaResult = await pool.execute(
          `SELECT criteria_id, criteria_info FROM criterias WHERE hackathon_id = :hackathon_id ORDER BY criteria_id`,
          { hackathon_id: r.HACKATHON_ID },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );


        const judgeResult = await pool.execute(
          `SELECT judge_username FROM judges WHERE hackathon_id = :hackathon_id`,
          { hackathon_id: r.HACKATHON_ID },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return {
          hackathon_id: r.HACKATHON_ID,
          hackathon_name: r.HACKATHON_NAME,
          host_username: r.HOST_USERNAME,
          duration: r.DURATION,
          genre: r.GENRE,
          rule_book: await clobToString(r.RULE_BOOK),
          hackathon_image: r.HACKATHON_IMAGE,
          starting_date: r.STARTING_DATE,
          ending_date: r.ENDING_DATE,
          added_date: r.ADDED_DATE,
          judging_criteria: criteriaResult.rows.map((c) => ({
            criteria_id: c.CRITERIA_ID,
            criteriainfo: c.CRITERIA_INFO,
          })),
          judges: judgeResult.rows.map((j) => j.JUDGE_USERNAME),
        };
      })
    );
  }


  static async get_all_hackathon() {
    const result = await pool.execute(
      `
      SELECT * FROM hackathon ORDER BY added_date DESC
      `,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return this.mapHackathon(result.rows);
  }


  static async get_hackathon_by_column(column, value) {
    const sql = `SELECT * FROM hackathon WHERE ${column} = :value`;
    const result = await pool.execute(
      sql,
      { value },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return this.mapHackathon(result.rows);
  }

  static async get_hackathon_by_username(username) {
    return this.get_hackathon_by_column("host_username", username);
  }

  static async get_hackathon_by_genre(genre) {
    return this.get_hackathon_by_column("genre", genre);
  }

  static async get_hackathon_by_id(hackathon_id) {
    return this.get_hackathon_by_column("hackathon_id", hackathon_id);
  }

  static async get_hackathon_by_name(hackathon_name) {
    return this.get_hackathon_by_column("hackathon_name", hackathon_name);
  }

  static async get_hackathon_by_duration(duration) {
    return this.get_hackathon_by_column("duration", duration);
  }

  // Get judge details
  static async get_judge_details(hackathon_id) {
    const result = await pool.execute(
      `
      SELECT u.username, u.full_name, u.email, u.image
      FROM users u
      JOIN judges j ON u.username = j.judge_username
      WHERE j.hackathon_id = :hackathon_id
      `,
      { hackathon_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.map((r) => ({
      username: r.USERNAME,
      full_name: r.FULL_NAME,
      email: r.EMAIL,
      image: r.IMAGE,
    }));
  }


  static async get_hackathons_by_judges(judge_username, only_upcoming = true) {
    const sql = `
      SELECT h.*
      FROM hackathon h
      JOIN judges j ON h.hackathon_id = j.hackathon_id
      WHERE j.judge_username = :judge_username
      ${only_upcoming ? "AND h.ending_date >= TRUNC(SYSDATE)" : ""}
    `;
    const result = await pool.execute(
      sql,
      { judge_username },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return this.mapHackathon(result.rows);
  }


  static async role_finding(username, hackathon_id) {
    const result = await pool.execute(
      `
      SELECT 
        CASE
          WHEN h.host_username = :username THEN 'Host'
          WHEN j.judge_username = :username THEN 'Judge'
          WHEN tp.username = :username THEN 'Participant'
          ELSE 'No Role'
        END AS role
      FROM hackathon h
      LEFT JOIN judges j ON j.hackathon_id = h.hackathon_id
      LEFT JOIN team_participants tp ON tp.hackathon_id = h.hackathon_id
      WHERE h.hackathon_id = :hackathon_id
      `,
      { username, hackathon_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.length > 0 ? result.rows[0].ROLE : "No Role";
  }
}

module.exports = Hackathon;
