const User = require("../models/user");
const ResponseHandler = require("../utils/responseHandler");
const Hackathon = require("../models/hackathon");
const Team = require("../models/participants"); // Fix missing import

class HackathonController {

  static async host_hackathons(req, res) {
    try {
      const {
        hackathon_name,
        host_username,
        duration,
        genre,
        rule_book,
        hackathon_image,
        starting_date,
        ending_date,
        judge_username,
        judging_criteria,
      } = req.body;

      const hackathon_data = {
        hackathon_name,
        duration,
        genre,
        rule_book,
        hackathon_image,
        starting_date,
        ending_date,
        judge_username,
        judging_criteria,
      };

      const hackathon_id = await Hackathon.host_hackathon(
        hackathon_data,
        host_username
      );

      return ResponseHandler.success(
        res,
        { hackathon_id, hackathon_data },
        "Hackathon hosted successfully"
      );
    } catch (error) {
      console.error("Hackathon hosting failed", error);
      return ResponseHandler.error(
        res,
        "Hackathon hosting failed",
        500,
        error.message
      );
    }
  }


  static async retrieve_hackathon(req, res) {
    try {
      const { username } = req.user;
      const hackathons = await Hackathon.get_hackathon_by_username(username);

      if (!hackathons || hackathons.length === 0) {
        return ResponseHandler.notFound(
          res,
          `No hackathons hosted by ${username}`
        );
      }

      return ResponseHandler.success(
        res,
        { hackathons },
        "Hackathons retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving hackathons:", error);
      return ResponseHandler.error(
        res,
        "Failed retrieving hackathons",
        500,
        error.message
      );
    }
  }


  static async get_hackathons_by_name(req, res) {
    try {
      const { name } = req.params;
      const hackathons = await Hackathon.get_hackathon_by_name(name);

      if (!hackathons || hackathons.length === 0) {
        return ResponseHandler.notFound(
          res,
          `No hackathon named ${name} found`
        );
      }

      return ResponseHandler.success(res, { hackathons }, "Hackathon found");
    } catch (error) {
      console.error("Error retrieving hackathon by name:", error);
      return ResponseHandler.error(
        res,
        `Failed retrieving hackathon ${req.params.name}`,
        500,
        error.message
      );
    }
  }


  static async get_hackathons_by_genre(req, res) {
    try {
      const { genre } = req.params;
      const hackathons = await Hackathon.get_hackathon_by_genre(genre);

      if (!hackathons || hackathons.length === 0) {
        return ResponseHandler.notFound(
          res,
          `No hackathon of the genre ${genre} found`
        );
      }

      return ResponseHandler.success(res, { hackathons }, "Hackathons found");
    } catch (error) {
      console.error("Error retrieving hackathons by genre:", error);
      return ResponseHandler.error(
        res,
        "Failed to retrieve hackathons",
        500,
        error.message
      );
    }
  }


  static async get_hackathons_by_duration(req, res) {
    try {
      const { duration } = req.params;
      const hackathons = await Hackathon.get_hackathon_by_duration(duration);

      if (!hackathons || hackathons.length === 0) {
        return ResponseHandler.notFound(
          res,
          `No hackathon of duration ${duration} found`
        );
      }

      return ResponseHandler.success(res, { hackathons }, "Hackathons found");
    } catch (error) {
      console.error("Error retrieving hackathons by duration:", error);
      return ResponseHandler.error(
        res,
        "Failed to retrieve hackathons",
        500,
        error.message
      );
    }
  }


  static async getJudgedetails(req, res) {
    try {
      const { hackathon_id } = req.params;
      const judges = await Hackathon.get_judge_details(hackathon_id);

      if (!judges || judges.length === 0) {
        return ResponseHandler.notFound(res, "No judges found");
      }

      return ResponseHandler.success(
        res,
        { judges },
        "Judges retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving judges:", error);
      return ResponseHandler.error(
        res,
        "Failed retrieving judges info",
        500,
        error.message
      );
    }
  }


  static async get_all_hackathon(req, res) {
    try {
      const hackathons = await Hackathon.get_all_hackathon();
      if (!hackathons || hackathons.length === 0) {
        return ResponseHandler.notFound(res, "No hackathons found");
      }

      return ResponseHandler.success(
        res,
        { hackathons },
        "Hackathons retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving all hackathons:", error);
      return ResponseHandler.error(
        res,
        "Failed to retrieve hackathons",
        500,
        error.message
      );
    }
  }


  static async get_judges_hackathons(req, res) {
    try {
      const { username } = req.query;
      const hackathons = await Hackathon.get_hackathons_by_judges(username);

      if (!hackathons || hackathons.length === 0) {
        return ResponseHandler.notFound(
          res,
          `No hackathons assigned to judge ${username}`
        );
      }

      return ResponseHandler.success(
        res,
        { hackathons },
        "Hackathons retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving judge hackathons:", error);
      return ResponseHandler.error(
        res,
        "Failed retrieving hackathons",
        500,
        error.message
      );
    }
  }

  static async get_judges_all_hackathons(req, res) {
    try {
      const { username } = req.query;
      const hackathons = await Hackathon.get_all_hackathons_by_judges(username);

      if (!hackathons || hackathons.length === 0) {
        return ResponseHandler.notFound(
          res,
          `No hackathons assigned to judge ${username}`
        );
      }

      return ResponseHandler.success(
        res,
        { hackathons },
        "Hackathons retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving all judge hackathons:", error);
      return ResponseHandler.error(
        res,
        "Failed retrieving hackathons",
        500,
        error.message
      );
    }
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

      return ResponseHandler.success(
        res,
        { role },
        "Role retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving role:", error);
      return ResponseHandler.error(
        res,
        "Failed retrieving role",
        500,
        error.message
      );
    }
  }


  static async getGivenMarks(req, res) {
    try {
      const { username } = req.user;
      const { team_id } = req.params;

      const marks = await Team.finding_given_marks(username, team_id);

      if (!marks || marks.length === 0) {
        return ResponseHandler.notFound(
          res,
          "No marks found for this judge on this team"
        );
      }

      return ResponseHandler.success(
        res,
        { marks },
        "Marks retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving given marks:", error);
      return ResponseHandler.error(
        res,
        "Failed to retrieve marks",
        500,
        error.message
      );
    }
  }
}

module.exports = HackathonController;
