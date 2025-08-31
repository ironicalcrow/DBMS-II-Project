const express = require("express");
const router = express.Router();
const participantController = require("../controllers/participantController");
const { verifyToken } = require("../middleware/auth");

router.post("/create", verifyToken, participantController.team_creation);
router.get("/hackathon/:hackathon_id", verifyToken, participantController.get_teams);
router.get("/members/:team_id", verifyToken, participantController.get_team_members);
router.post("/mark", verifyToken, participantController.marking_teams);
router.get("/leaderboard/:hackathon_id", verifyToken, participantController.leader_board);

router.get("/hackathon/:hackathon_id/my-team", verifyToken, participantController.getUserTeamByHackathon);
module.exports = router;
