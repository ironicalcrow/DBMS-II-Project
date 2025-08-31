const { pool } = require("../config/database");
const team = require("../models/participants");
const User = require('../models/user');
const oracledb = require("oracledb");

class Project {
  // Create project for a single user
  static async createProject(projectData, username) {
    const { project_name, git_repo, overview, motivation, features, project_genre } = projectData;

    const result = await pool.execute(
      `INSERT INTO projects 
        (project_name, git_repo, overview, motivation, features, project_genre, creation_date)
       VALUES (:project_name, :git_repo, :overview, :motivation, :features, :project_genre, SYSDATE)
       RETURNING project_id INTO :project_id`,
      { 
        project_name, git_repo, overview, motivation, features, project_genre,
        project_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    const project_id = result.outBinds.project_id[0];

    await pool.execute(
      `INSERT INTO p_u_junction (project_id, username) VALUES (:project_id, :username)`,
      { project_id, username }
    );

    return { project_id };
  }

  // Create project for a team
  static async createProject_for_team(projectData, team_id) {
    const { project_name, git_repo, overview, motivation, features, project_genre } = projectData;

    const result = await pool.execute(
      `INSERT INTO projects 
        (project_name, git_repo, overview, motivation, features, project_genre, creation_date)
       VALUES (:project_name, :git_repo, :overview, :motivation, :features, :project_genre, SYSDATE)
       RETURNING project_id INTO :project_id`,
      { 
        project_name, git_repo, overview, motivation, features, project_genre,
        project_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    const project_id = result.outBinds.project_id[0];

    const team_info = await team.team_members(team_id);
    if (!team_info.length) throw new Error("No team participants found");
    const hackathon_id = team_info[0].hackathon_id;

    await pool.execute(
      `INSERT INTO p_t_junction (team_id, project_id, hackathon_id)
       VALUES (:team_id, :project_id, :hackathon_id)`,
      { team_id, project_id, hackathon_id }
    );

    for (const participant of team_info) {
      const username = (participant.username || "").trim();
      if (!username) continue;

      const user = await User.findByUsername(username);
      if (user) {
        await pool.execute(
          `INSERT INTO p_u_junction (project_id, username) VALUES (:project_id, :username)`,
          { project_id, username }
        );
      }
    }

    return { project_id };
  }

  // Get project by ID
  static async getProjectById(project_id) {
    const result = await pool.execute(
      `SELECT * FROM projects WHERE project_id = :project_id`,
      { project_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows[0] || null;
  }

  // Get all projects
  static async getAllProjects() {
    const result = await pool.execute(
      `SELECT * FROM projects`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  }

  // Get projects by username
  static async getProjectsByUsername(username) {
    const result = await pool.execute(
      `SELECT p.* 
       FROM projects p
       JOIN p_u_junction pu ON p.project_id = pu.project_id
       WHERE pu.username = :username`,
      { username },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  }

  // Update project
  static async updateProject(project_id, updateData) {
    const { project_name, git_repo, overview, motivation, features, project_genre } = updateData;

    await pool.execute(
      `UPDATE projects SET
         project_name = NVL(:project_name, project_name),
         git_repo = NVL(:git_repo, git_repo),
         overview = NVL(:overview, overview),
         motivation = NVL(:motivation, motivation),
         features = NVL(:features, features),
         project_genre = NVL(:project_genre, project_genre)
       WHERE project_id = :project_id`,
      { project_name, git_repo, overview, motivation, features, project_genre, project_id }
    );

    return await Project.getProjectById(project_id);
  }

  // Delete project
  static async deleteProject(project_id) {
    await pool.execute(
      `DELETE FROM p_u_junction WHERE project_id = :project_id`,
      { project_id }
    );
    await pool.execute(
      `DELETE FROM projects WHERE project_id = :project_id`,
      { project_id }
    );
    return { project_id };
  }

  // Get users by project
  static async getUsersByProject(project_id) {
    const result = await pool.execute(
      `SELECT u.username, u.full_name
       FROM users u
       JOIN p_u_junction pu ON u.username = pu.username
       WHERE pu.project_id = :project_id`,
      { project_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  }

  // Get projects by genre
  static async getProjectsByGenre(project_genre) {
    const result = await pool.execute(
      `SELECT * FROM projects WHERE project_genre = :project_genre`,
      { project_genre },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  }

  // Get projects by creation date descending
  static async getProjectbyDate() {
    const result = await pool.execute(
      `SELECT * FROM projects ORDER BY creation_date DESC`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  }

  // Get project by team
  static async teams_project(team_id) {
    const result = await pool.execute(
      `SELECT p.*
       FROM projects p
       JOIN p_t_junction ptj ON p.project_id = ptj.project_id
       WHERE ptj.team_id = :team_id`,
      { team_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  }

  // Get projects by hackathon and user (using procedure)
  static async getProjectsByHackathonAndUser(hackathonId, username) {
    const result = await pool.execute(
      `BEGIN GetProjectsByHackathonAndUser(:hackathon_id, :username, :cursor); END;`,
      { hackathon_id: hackathonId, username, cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const rs = result.outBinds.cursor;
    const rows = await rs.getRows(); // fetch all rows
    await rs.close();

    return rows;
  }
}

module.exports = Project;
