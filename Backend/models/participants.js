const { pool } = require("../config/database");

class team {
  // Insert into teams and return team_id
  static async team_creation(team_name, team_info) {
    const result = await pool.execute(
      `BEGIN
         INSERT INTO teams (team_name, team_info)
         VALUES (:team_name, :team_info)
         RETURNING team_id INTO :team_id;
       END;`,
      {
        team_name,
        team_info,
        team_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );
    return result.outBinds.team_id;
  }

  // Insert participants into team_participants table
  static async team_participants(data) {
    const { hackathon_id, team_name, team_info, team_participants } = data;

    const team_id = await this.team_creation(team_name, team_info);
    const participants_username = team_participants.map((p) => p.trim());

    for (const users of participants_username) {
      const [exists] = await pool.execute(
        `SELECT COUNT(*) as count
         FROM team_participants
         WHERE username = :username AND hackathon_id = :hackathon_id`,
        { username: users, hackathon_id }
      );

      if (exists.COUNT > 0) {
        console.error(`User already exists, Username: ${users}`);
        continue;
      }

      await pool.execute(
        `INSERT INTO team_participants (team_id, hackathon_id, username)
         VALUES (:team_id, :hackathon_id, :username)`,
        { team_id, hackathon_id, username: users }
      );
    }

    return team_id;
  }

  // Get teams in a hackathon
  static async finding_team(hackathon_id) {
    const result = await pool.execute(
      `SELECT DISTINCT t.team_id, t.team_name, t.team_info
       FROM teams t
       JOIN team_participants tp ON t.team_id = tp.team_id
       WHERE tp.hackathon_id = :hackathon_id`,
      { hackathon_id }
    );
    return result.rows;
  }

  // Get team members
  static async team_members(team_id) {
    const result = await pool.execute(
      `SELECT * FROM team_participants WHERE team_id = :team_id`,
      { team_id }
    );
    return result.rows;
  }

  // Find team by hackathon and user
  static async findByHackathonAndUser(hackathon_id, username) {
    const result = await pool.execute(
      `SELECT t.team_id, t.team_name, t.team_info
       FROM teams t
       JOIN team_participants tp ON t.team_id = tp.team_id
       WHERE tp.hackathon_id = :hackathon_id AND tp.username = :username`,
      { hackathon_id, username }
    );
    return result.rows;
  }

  // Judges mark teams
  static async team_marking(team_id, hackathon_id, judge_username, criteria_ids, marks, comments) {
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
  }

  // Leaderboard for hackathon
static async leader_board(hackathon_id) {
  const result = await pool.execute(
    `BEGIN GetLeaderBoard(:hackathon_id, :cursor); END;`,
    {
      hackathon_id: hackathon_id,
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
    }
  );

  const rs = result.outBinds.cursor;
  const rows = await rs.getRows(); // fetch all rows
  await rs.close();

  // ✅ Ensures output format matches your original MySQL version
  return rows.map(r => ({
    TEAM_ID: r.TEAM_ID,
    TEAM_NAME: r.TEAM_NAME,
    TOTAL_MARKS: r.TOTAL_MARKS,
    TEAM_RANK: r.TEAM_RANK
  }));
}

  // Find team by username
  static async team_finding_by_username(username, hackathon_id) {
    const result = await pool.execute(
      `SELECT *
       FROM teams t
       JOIN team_participants tp ON t.team_id = tp.team_id
       WHERE tp.username = :username AND tp.hackathon_id = :hackathon_id`,
      { username, hackathon_id }
    );
    return result.rows;
  }

  // Get project by team_id
  static async get_project_data_by_team_id(team_id) {
    const result = await pool.execute(
      `SELECT *
       FROM projects p
       JOIN p_t_junction pt ON p.project_id = pt.project_id
       WHERE pt.team_id = :team_id`,
      { team_id }
    );
    return result.rows;
  }
}

module.exports = team;
