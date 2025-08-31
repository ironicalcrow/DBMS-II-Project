const { pool } = require("../config/database");
const oracledb = require("oracledb");
const clobToString = require("../utils/clobToStrings");


oracledb.fetchAsString = [oracledb.CLOB];

class Team {

  static async team_creation(team_name, team_info) {
    const sql = `
      INSERT INTO teams (team_name, team_info)
      VALUES (:team_name, :team_info)
      RETURNING team_id INTO :team_id
    `;
    const binds = {
      team_name,
      team_info,
      team_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };
    const result = await pool.execute(sql, binds, { autoCommit: false });
    return result.outBinds.team_id[0];
  }


  static async team_participants({
    hackathon_id,
    team_name,
    team_info,
    team_participants = [],
  }) {
    const team_id = await this.team_creation(team_name, team_info);

    for (const username of team_participants
      .map((p) => p.trim())
      .filter(Boolean)) {
      const existing = await pool.execute(
        `SELECT COUNT(*) AS COUNT FROM team_participants WHERE username = :username AND hackathon_id = :hackathon_id`,
        { username, hackathon_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      if (existing.rows[0].COUNT > 0) continue;

      await pool.execute(
        `INSERT INTO team_participants (team_id, hackathon_id, username) VALUES (:team_id, :hackathon_id, :username)`,
        { team_id, hackathon_id, username }
      );
    }

    await pool.commit();
    return team_id;
  }


  static async mapTeam(rows) {
    return await Promise.all(
      rows.map(async (r) => ({
        team_id: r.TEAM_ID,
        team_name: r.TEAM_NAME,
        team_info: await clobToString(r.TEAM_INFO),
      }))
    );
  }


  static async finding_team(hackathon_id) {
    const result = await pool.execute(
      `SELECT DISTINCT t.team_id, t.team_name, t.team_info
       FROM teams t
       JOIN team_participants tp ON t.team_id = tp.team_id
       WHERE tp.hackathon_id = :hackathon_id`,
      { hackathon_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return this.mapTeam(result.rows);
  }


  static async team_members(team_id) {
    const result = await pool.execute(
      `SELECT team_id, hackathon_id, username FROM team_participants WHERE team_id = :team_id`,
      { team_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.map((r) => ({
      team_id: r.TEAM_ID,
      hackathon_id: r.HACKATHON_ID,
      username: r.USERNAME,
    }));
  }


  static async findByHackathonAndUser(hackathon_id, username) {
    const result = await pool.execute(
      `SELECT t.team_id, t.team_name, t.team_info
       FROM teams t
       JOIN team_participants tp ON t.team_id = tp.team_id
       WHERE tp.hackathon_id = :hackathon_id AND tp.username = :username`,
      { hackathon_id, username },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return this.mapTeam(result.rows);
  }


  static async team_marking(
    team_id,
    hackathon_id,
    judge_username,
    criteria_ids = [],
    marks = [],
    comments = ""
  ) {
    for (let i = 0; i < criteria_ids.length; i++) {
      await pool.execute(
        `INSERT INTO marking (hackathon_id, judge_username, team_id, criteria_id, marks, comments)
         VALUES (:hackathon_id, :judge_username, :team_id, :criteria_id, :marks, :comments)`,
        {
          hackathon_id,
          judge_username,
          team_id,
          criteria_id: criteria_ids[i],
          marks: marks[i],
          comments,
        }
      );
    }
    await pool.commit();
  }


  static async leader_board(hackathon_id) {
    const result = await pool.execute(
      `SELECT 
         t.team_id, 
         t.team_name, 
         NVL(SUM(m.marks), 0) AS total_marks, 
         RANK() OVER (ORDER BY NVL(SUM(m.marks),0) DESC NULLS LAST) AS team_rank
       FROM teams t
       JOIN team_participants tp ON t.team_id = tp.team_id
       LEFT JOIN marking m ON t.team_id = m.team_id AND tp.hackathon_id = m.hackathon_id
       WHERE tp.hackathon_id = :hackathon_id
       GROUP BY t.team_id, t.team_name
       ORDER BY total_marks DESC NULLS LAST`,
      { hackathon_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.map((r) => ({
      team_id: r.TEAM_ID,
      team_name: r.TEAM_NAME,
      total_marks: r.TOTAL_MARKS,
      team_rank: r.TEAM_RANK,
    }));
  }


  static async team_finding_by_username(username, hackathon_id) {
    return this.findByHackathonAndUser(hackathon_id, username);
  }


  static async get_project_data_by_team_id(team_id) {
    const result = await pool.execute(
      `SELECT p.project_id, p.project_name, p.description
       FROM projects p
       JOIN p_t_junction pt ON p.project_id = pt.project_id
       WHERE pt.team_id = :team_id`,
      { team_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.map((r) => ({
      project_id: r.PROJECT_ID,
      project_name: r.PROJECT_NAME,
      description: r.DESCRIPTION,
    }));
  }
}

module.exports = Team;
