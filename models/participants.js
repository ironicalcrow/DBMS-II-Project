const { pool } = require("../config/database");
const oracledb = require("oracledb");

class Team {
  // ✅ Create a team and return team_id
  static async team_creation(team_name, team_info) {
    const result = await pool.execute(
      `INSERT INTO teams (team_name, team_info) 
       VALUES (:team_name, :team_info)
       RETURNING team_id INTO :team_id`,
      {
        team_name,
        team_info,
        team_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: false }
    );

    return result.outBinds.team_id[0];
  }

  // ✅ Add participants to a team
  static async team_participants(data) {
    const { hackathon_id, team_name, team_info, team_participants } = data;

    const team_id = await this.team_creation(team_name, team_info);

    for (const user of team_participants.map((p) => p.trim())) {
      // Check if user already exists for this hackathon
      const result = await pool.execute(
        `SELECT COUNT(*) AS count FROM team_participants 
         WHERE username = :username AND hackathon_id = :hackathon_id`,
        { username: user, hackathon_id }
      );

      const count = result.rows[0][0];
      if (count > 0) {
        console.error(`User already exists, Username: ${user}`);
        continue;
      }

      await pool.execute(
        `INSERT INTO team_participants (team_id, hackathon_id, username) 
         VALUES (:team_id, :hackathon_id, :username)`,
        { team_id, hackathon_id, username: user }
      );
    }

    await pool.commit();
    return team_id;
  }

  // ✅ Find all teams in a hackathon
  static async finding_team(hackathon_id) {
    const result = await pool.execute(
      `SELECT DISTINCT t.team_id, t.team_name, t.team_info
       FROM teams t
       JOIN team_participants tp ON t.team_id = tp.team_id
       WHERE tp.hackathon_id = :hackathon_id`,
      { hackathon_id }
    );

    return result.rows.map((r) => ({
      team_id: r[0],
      team_name: r[1],
      team_info: r[2],
    }));
  }

  // ✅ Get members of a team
  static async team_members(team_id) {
    const result = await pool.execute(
      `SELECT * FROM team_participants WHERE team_id = :team_id`,
      { team_id }
    );

    return result.rows.map((r) => ({
      team_id: r[0],
      hackathon_id: r[1],
      username: r[2],
    }));
  }

  // ✅ Find team by hackathon and user
  static async findByHackathonAndUser(hackathon_id, username) {
    const result = await pool.execute(
      `SELECT t.team_id, t.team_name, t.team_info
       FROM teams t
       JOIN team_participants tp ON t.team_id = tp.team_id
       WHERE tp.hackathon_id = :hackathon_id AND tp.username = :username`,
      { hackathon_id, username }
    );

    return result.rows.map((r) => ({
      team_id: r[0],
      team_name: r[1],
      team_info: r[2],
    }));
  }

  // ✅ Insert marks for a team
  static async team_marking(
    team_id,
    hackathon_id,
    judge_username,
    criteria_ids,
    marks,
    comments
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

  // ✅ Leaderboard
  static async leader_board(hackathon_id) {
    const result = await pool.execute(
      `SELECT 
          t.team_id, 
          t.team_name, 
          SUM(m.marks) AS total_marks, 
          RANK() OVER (ORDER BY SUM(m.marks) DESC NULLS LAST) AS team_rank
       FROM teams t
       JOIN team_participants tp ON t.team_id = tp.team_id
       LEFT JOIN marking m ON t.team_id = m.team_id AND tp.hackathon_id = m.hackathon_id
       WHERE tp.hackathon_id = :hackathon_id
       GROUP BY t.team_id, t.team_name
       ORDER BY total_marks DESC NULLS LAST`,
      { hackathon_id }
    );

    return result.rows.map((r) => ({
      team_id: r[0],
      team_name: r[1],
      total_marks: r[2] || 0,
      team_rank: r[3],
    }));
  }

  // ✅ Find team by username in a hackathon
  static async team_finding_by_username(username, hackathon_id) {
    const result = await pool.execute(
      `SELECT t.team_id, t.team_name, t.team_info
       FROM teams t
       JOIN team_participants tp ON t.team_id = tp.team_id
       WHERE tp.username = :username AND tp.hackathon_id = :hackathon_id`,
      { username, hackathon_id }
    );

    return result.rows.map((r) => ({
      team_id: r[0],
      team_name: r[1],
      team_info: r[2],
    }));
  }

  // ✅ Get project data by team ID
  static async get_project_data_by_team_id(team_id) {
    const result = await pool.execute(
      `SELECT p.project_id, p.project_name, p.description
       FROM projects p
       JOIN p_t_junction pt ON p.project_id = pt.project_id
       WHERE pt.team_id = :team_id`,
      { team_id }
    );

    return result.rows.map((r) => ({
      project_id: r[0],
      project_name: r[1],
      description: r[2],
    }));
  }
}

module.exports = Team;
