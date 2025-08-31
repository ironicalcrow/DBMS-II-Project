const { pool } = require("../config/database");
const team = require("../models/participants");
const User = require("../models/user");
const oracledb = require("oracledb");
const clobToString = require("../utils/clobToStrings");


oracledb.fetchAsString = [oracledb.CLOB];

class Project {

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
      const result = await conn.execute(
        `INSERT INTO projects (
          project_id, project_name, git_repo, overview, motivation, features, project_genre, creation_date
        ) VALUES (projects_seq.NEXTVAL, :project_name, :git_repo, :overview, :motivation, :features, :project_genre, SYSDATE)
        RETURNING project_id INTO :project_id`,
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


  static async createProjectForTeam(projectData, team_id) {
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
      const result = await conn.execute(
        `INSERT INTO projects (
          project_id, project_name, git_repo, overview, motivation, features, project_genre, creation_date
        ) VALUES (projects_seq.NEXTVAL, :project_name, :git_repo, :overview, :motivation, :features, :project_genre, SYSDATE)
        RETURNING project_id INTO :project_id`,
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
        const username = (participant.USERNAME || "").trim();
        if (!username) continue;

        const user = await User.findByUsername(username);
        if (user) {
          await conn.execute(
            `INSERT INTO p_u_junction (project_id, username) VALUES (:project_id, :username)`,
            { project_id, username },
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


  static async mapProjectRow(row) {
    if (!row) return null;
    return {
      project_id: row.PROJECT_ID,
      project_name: row.PROJECT_NAME,
      git_repo: row.GIT_REPO,
      demo_link: row.DEMO_LINK || "",
      overview: await clobToString(row.OVERVIEW),
      motivation: await clobToString(row.MOTIVATION),
      features: await clobToString(row.FEATURES),
      project_genre: row.PROJECT_GENRE,
      creation_date: row.CREATION_DATE,
    };
  }

  static async mapProjectRows(rows) {
    return await Promise.all(rows.map((r) => Project.mapProjectRow(r)));
  }


  static async getProjectById(project_id) {
    const conn = await pool.getConnection();
    try {
      const result = await conn.execute(
        `SELECT * FROM projects WHERE project_id = :project_id`,
        { project_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return await Project.mapProjectRow(result.rows[0]);
    } finally {
      await conn.close();
    }
  }


  static async getAllProjects() {
    const conn = await pool.getConnection();
    try {
      const result = await conn.execute(
        `SELECT * FROM projects`,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return await Project.mapProjectRows(result.rows);
    } finally {
      await conn.close();
    }
  }


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
      return await Project.mapProjectRows(result.rows);
    } finally {
      await conn.close();
    }
  }


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
      await conn.execute(
        `UPDATE projects SET
          project_name = NVL(:project_name, project_name),
          git_repo = NVL(:git_repo, git_repo),
          overview = NVL(:overview, overview),
          motivation = NVL(:motivation, motivation),
          features = NVL(:features, features),
          project_genre = NVL(:project_genre, project_genre)
         WHERE project_id = :project_id`,
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
      return result.rows.map((row) => ({
        username: row.USERNAME,
        full_name: row.FULL_NAME,
      }));
    } finally {
      await conn.close();
    }
  }


  static async getProjectsByGenre(project_genre) {
    const conn = await pool.getConnection();
    try {
      const result = await conn.execute(
        `SELECT * FROM projects WHERE project_genre = :project_genre`,
        { project_genre },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return await Project.mapProjectRows(result.rows);
    } finally {
      await conn.close();
    }
  }


  static async getProjectsByDate() {
    const conn = await pool.getConnection();
    try {
      const result = await conn.execute(
        `SELECT * FROM projects ORDER BY creation_date DESC`,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return await Project.mapProjectRows(result.rows);
    } finally {
      await conn.close();
    }
  }


  static async getProjectByTeamId(team_id) {
    const conn = await pool.getConnection();
    try {
      const result = await conn.execute(
        `SELECT p.* FROM projects p
         JOIN p_t_junction ptj ON p.project_id = ptj.project_id
         WHERE ptj.team_id = :team_id`,
        { team_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return await Project.mapProjectRows(result.rows);
    } finally {
      await conn.close();
    }
  }


  static async getProjectsByHackathonAndUser(hackathonId, username) {
    const conn = await pool.getConnection();
    try {
      const result = await conn.execute(
        `SELECT DISTINCT 
          p.project_id, p.project_name, p.git_repo, p.demo_link, p.overview, p.motivation, p.features, p.project_genre, p.creation_date,
          t.team_id, t.team_name,
          h.hackathon_id, h.hackathon_name
         FROM projects p
         JOIN p_u_junction pu ON p.project_id = pu.project_id
         JOIN p_t_junction pt ON p.project_id = pt.project_id
         JOIN teams t ON pt.team_id = t.team_id
         JOIN hackathon h ON pt.hackathon_id = h.hackathon_id
         WHERE pu.username = :username AND pt.hackathon_id = :hackathonId`,
        { username, hackathonId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return await Promise.all(
        result.rows.map(async (row) => ({
          project_id: row.PROJECT_ID,
          project_name: row.PROJECT_NAME,
          git_repo: row.GIT_REPO,
          demo_link: row.DEMO_LINK || "",
          overview: await clobToString(row.OVERVIEW),
          motivation: await clobToString(row.MOTIVATION),
          features: await clobToString(row.FEATURES),
          project_genre: row.PROJECT_GENRE,
          creation_date: row.CREATION_DATE,
          team_id: row.TEAM_ID,
          team_name: row.TEAM_NAME,
          hackathon_id: row.HACKATHON_ID,
          hackathon_name: row.HACKATHON_NAME,
        }))
      );
    } finally {
      await conn.close();
    }
  }
}

module.exports = Project;
