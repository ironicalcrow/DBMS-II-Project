const express = require("express")
const router = express.Router()
const JWTUtils = require("../utils/jwtUtils")
const {validateHackathon, handleValidationErrors} = require("../middleware/validation");
const HackathonController= require("../controllers/hackathonController");
const {authenticateToken,verifyToken}= require("../middleware/auth")

router.post(`/host`,  verifyToken, validateHackathon, HackathonController.host_hackathons);

router.get(`/my-hackathons`,verifyToken, HackathonController.retrieve_hackathon);

router.get(`/genre/:genre`,HackathonController.get_hackathons_by_genre);

router.get(`/duration/:duration`,HackathonController.get_hackathons_by_duration);

router.get(`/name/:name`,HackathonController.get_hackathons_by_name);

router.get(`/judges/:hackathon_id`,HackathonController.getJudgedetails);

router.get(`/all-hackathons`,HackathonController.get_all_hackathon);

router.get(`/my-judged`,verifyToken,HackathonController.get_judges_hackathons);

router.get(`/my-all-judged-hackathons`,HackathonController.get_judges_all_hackathons);

router.get(`/role/:hackathon_id`, verifyToken, HackathonController.get_user_role);

module.exports = router;
