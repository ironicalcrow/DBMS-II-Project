const { pool } = require("../config/database");
const team = require("../models/participants");
const User = require("../models/user");
const { formatRows } = require("../utils/formatOracle");

class Project {
  // ✅ Create Project for Individual User
  static async createProject(projectData, username) {
    const {
      project_name,
      git_repo,
      overview,
      motivation,
      features,
      project_genre,
    } = projectData;

    const conn = await pool.getConnection();
    try {
      const insertProjectQuery = `
        INSERT INTO projects (
          project_id, project_name, git_repo, overview, motivation, features, project_genre, creation_date
        ) VALUES (projects_seq.NEXTVAL, :project_name, :git_repo, :overview, :motivation, :features, :project_genre, SYSDATE)
        RETURNING project_id INTO :project_id
      `;

      const result = await conn.execute(
        insertProjectQuery,
        {
          project_name,
          git_repo,
          overview,
          motivation,
          features,
          project_genre,
          project_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
        { autoCommit: false }
      );

      const project_id = result.outBinds.project_id[0];

      await conn.execute(
        `INSERT INTO p_u_junction (project_id, username) VALUES (:project_id, :username)`,
        { project_id, username },
        { autoCommit: true }
      );

      return { project_id };
    } finally {
      await conn.close();
    }
  }

  // ✅ Create Project for Team
  static async createProject_for_team(projectData, team_id) {
    const {
      project_name,
      git_repo,
      overview,
      motivation,
      features,
      project_genre,
    } = projectData;

    const conn = await pool.getConnection();
    try {
      const insertProjectQuery = `
        INSERT INTO projects (
          project_id, project_name, git_repo, overview, motivation, features, project_genre, creation_date
        ) VALUES (projects_seq.NEXTVAL, :project_name, :git_repo, :overview, :motivation, :features, :project_genre, SYSDATE)
        RETURNING project_id INTO :project_id
      `;

      const result = await conn.execute(
        insertProjectQuery,
        {
          project_name,
          git_repo,
          overview,
          motivation,
          features,
          project_genre,
          project_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
        { autoCommit: false }
      );

      const project_id = result.outBinds.project_id[0];

      const team_info = await team.team_members(team_id);
      if (!team_info.length) throw new Error("No team participants found");

      const hackathon_id = team_info[0].HACKATHON_ID;

      await conn.execute(
        `INSERT INTO p_t_junction (team_id, project_id, hackathon_id) VALUES (:team_id, :project_id, :hackathon_id)`,
        { team_id, project_id, hackathon_id },
        { autoCommit: false }
      );

      for (const participant of team_info) {
        const participants_username = (participant.USERNAME || "").trim();
        if (!participants_username) continue;

        const user = await User.findByUsername(participants_username);
        if (user) {
          await conn.execute(
            `INSERT INTO p_u_junction (project_id, username) VALUES (:project_id, :username)`,
            { project_id, username: participants_username },
            { autoCommit: false }
          );
        }
      }

      await conn.commit();
      return { project_id };
    } finally {
      await conn.close();
    }
  }

  // ✅ Get Project by ID
  static async getProjectById(project_id) {
    const conn = await pool.getConnection();
    try {
      const result = await conn.execute(
        `SELECT * FROM projects WHERE project_id = :project_id`,
        { project_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows.length ? formatRows(result.rows)[0] : null;
    } finally {
      await conn.close();
    }
  }

  // ✅ Get All Projects
  static async getAllProjects() {
    const conn = await pool.getConnection();
    try {
      const result = await conn.execute(`SELECT * FROM projects`, [], {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      return formatRows(result.rows);
    } finally {
      await conn.close();
    }
  }

  // ✅ Get Projects by Username
  static async getProjectsByUsername(username) {
    const conn = await pool.getConnection();
    try {
      const result = await conn.execute(
        `SELECT p.* FROM projects p
         JOIN p_u_junction pu ON p.project_id = pu.project_id
         WHERE pu.username = :username`,
        { username },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return formatRows(result.rows);
    } finally {
      await conn.close();
    }
  }

  // ✅ Update Project
  static async updateProject(project_id, updateData) {
    const {
      project_name,
      git_repo,
      overview,
      motivation,
      features,
      project_genre,
    } = updateData;

    const conn = await pool.getConnection();
    try {
      const query = `
        UPDATE projects SET
          project_name = NVL(:project_name, project_name),
          git_repo = NVL(:git_repo, git_repo),
          overview = NVL(:overview, overview),
          motivation = NVL(:motivation, motivation),
          features = NVL(:features, features),
          project_genre = NVL(:project_genre, project_genre)
        WHERE project_id = :project_id
      `;
      await conn.execute(
        query,
        {
          project_name,
          git_repo,
          overview,
          motivation,
          features,
          project_genre,
          project_id,
        },
        { autoCommit: true }
      );

      return { success: true };
    } finally {
      await conn.close();
    }
  }

  // ✅ Delete Project
  static async deleteProject(project_id) {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        `DELETE FROM p_u_junction WHERE project_id = :project_id`,
        { project_id }
      );
      const result = await conn.execute(
        `DELETE FROM projects WHERE project_id = :project_id`,
        { project_id },
        { autoCommit: true }
      );
      return { rowsAffected: result.rowsAffected };
    } finally {
      await conn.close();
    }
  }

  // ✅ Get Users by Project
  static async getUsersByProject(project_id) {
    const conn = await pool.getConnection();
    try {
      const result = await conn.execute(
        `SELECT u.username, u.full_name FROM users u
         JOIN p_u_junction pu ON u.username = pu.username
         WHERE pu.project_id = :project_id`,
        { project_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return formatRows(result.rows);
    } finally {
      await conn.close();
    }
  }

  // ✅ Get Projects by Genre
  static async getProjectsByGenre(project_genre) {
    const conn = await pool.getConnection();
    try {
      const result = await conn.execute(
        `SELECT * FROM projects WHERE project_genre = :project_genre`,
        { project_genre },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return formatRows(result.rows);
    } finally {
      await conn.close();
    }
  }

  // ✅ Get Projects by Date
  static async getProjectbyDate() {
    const conn = await pool.getConnection();
    try {
      const result = await conn.execute(
        `SELECT * FROM projects ORDER BY creation_date DESC`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return formatRows(result.rows);
    } finally {
      await conn.close();
    }
  }

  // ✅ Get Project by Team ID
  static async teams_project(team_id) {
    const conn = await pool.getConnection();
    try {
      const result = await conn.execute(
        `SELECT p.* FROM projects p
         JOIN p_t_junction ptj ON p.project_id = ptj.project_id
         WHERE ptj.team_id = :team_id`,
        { team_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return formatRows(result.rows);
    } finally {
      await conn.close();
    }
  }

  // ✅ Get Projects by Hackathon & User
  static async getProjectsByHackathonAndUser(hackathonId, username) {
    const conn = await pool.getConnection();
    try {
      const query = `
        SELECT DISTINCT 
          p.project_id,
          p.project_name,
          p.git_repo,
          p.demo_link,
          p.overview,
          p.motivation,
          p.features,
          p.project_genre,
          p.creation_date,
          t.team_id,
          t.team_name,
          h.hackathon_id,
          h.hackathon_name
        FROM projects p
        JOIN p_u_junction pu ON p.project_id = pu.project_id
        JOIN p_t_junction pt ON p.project_id = pt.project_id
        JOIN teams t ON pt.team_id = t.team_id
        JOIN hackathon h ON pt.hackathon_id = h.hackathon_id
        WHERE pu.username = :username AND pt.hackathon_id = :hackathonId
      `;
      const result = await conn.execute(
        query,
        { username, hackathonId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return formatRows(result.rows);
    } finally {
      await conn.close();
    }
  }
}

module.exports = Project;
