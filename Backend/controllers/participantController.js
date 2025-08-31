const Team = require("../models/participants");
const ResponseHandler = require("../utils/responseHandler");

class participantController {


    static async team_creation(req, res) {
        try {
            const data = req.body;
            const team_id = await Team.team_participants(data);

            return ResponseHandler.success(res, { team_id }, "Team participants added successfully");
        } catch (error) {
            console.error("Adding team participants error:", error);
            return ResponseHandler.error(res, "Failed to add participants", 500, error.message);
        }
    }

    static async get_teams(req, res) {
        try {
            const { hackathon_id } = req.params;
            const teams = await Team.finding_team(hackathon_id);

            if (!teams || teams.length === 0) return ResponseHandler.notFound(res, "No teams found");

            return ResponseHandler.success(res, { teams }, "Teams retrieved successfully");
        } catch (error) {
            console.error("Retrieving teams error:", error);
            return ResponseHandler.error(res, "Failed to retrieve teams", 500, error.message);
        }
    }

     static async getUserTeamByHackathon(req, res) {
    try {
      const { hackathon_id } = req.params;

      const username = req.user.username; // or from token: req.user.username

      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }

      const team = await Team.findByHackathonAndUser
      (hackathon_id, username);
      console.log("controller ",team)
      return res.status(200).json(team);
    } catch (err) {
      console.error("❌ Error fetching user team:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

    static async get_team_members(req, res) {
        try {
            const { team_id } = req.params;
            const members = await Team.team_members(team_id);

            if (!members || members.length === 0) return ResponseHandler.notFound(res, "No team members found");

            return ResponseHandler.success(res, { members }, "Team members retrieved successfully");
        } catch (error) {
            console.error("Retrieving team members error:", error);
            return ResponseHandler.error(res, "Failed to retrieve team members", 500, error.message);
        }
    }

    static async marking_teams(req, res) {
        try {
            const { team_id, hackathon_id, judge_username, criteria_ids, marks, comments } = req.body;
            console.log(req.body)
            
            await Team.team_marking(team_id, hackathon_id, judge_username, criteria_ids, marks, comments);

            return ResponseHandler.success(res, { team_id, hackathon_id }, "Team marked successfully");
        } catch (error) {
            console.error("Team marking error:", error);
            return ResponseHandler.error(res, "Failed to mark team", 500, error.message);
        }
    }

    static async leader_board(req, res) {
        try {
            const { hackathon_id } = req.params;
            const leaderboard = await Team.leader_board(hackathon_id);

            if (!leaderboard || leaderboard.length === 0) return ResponseHandler.notFound(res, "No leaderboard data found");

            return ResponseHandler.success(res, { leaderboard }, "Leaderboard retrieved successfully");
        } catch (error) {
            console.error("Retrieving leaderboard error:", error);
            return ResponseHandler.error(res, "Failed to retrieve leaderboard", 500, error.message);
        }
    }

    static async team_by_username(req,res)
    {
        try
        {
            const {username} = req.user;
            const {hackathon_id} = req.params;
            const team = await Team.team_finding_by_username(username, hackathon_id);

            if (!team || team.length === 0)
                return ResponseHandler.notFound(res, "No team found for this user in this hackathon");

                return ResponseHandler.success(res, { team }, "Team retrieved successfully");
        }
        catch (error) {
            console.error("Retrieving team by username error:", error);
            return ResponseHandler.error(res, "Failed to retrieve team", 500, error.message);
        }
    }
    
    static async getProjectDataByTeamId(req, res) {
        try {
            const { team_id } = req.params;

            const project = await Project.get_project_data_by_team_id(team_id);

            if (!project || project.length === 0) {
                return ResponseHandler.notFound(res, "No project found for this team");
            }

            return ResponseHandler.success(
                res,
                { project },
                "Project data retrieved successfully"
            );
        } catch (error) {
            console.error("Error retrieving project by team ID:", error);
            return ResponseHandler.error(res, "Failed to retrieve project", 500, error.message);
        }
    }
}

module.exports = participantController;
