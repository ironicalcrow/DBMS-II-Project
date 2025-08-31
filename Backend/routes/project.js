const express = require("express")
const router = express.Router()
const JWTUtils = require("../utils/jwtUtils")
const ProjectController = require("../controllers/projectController")
const { validateProject, handleValidationErrors } = require("../middleware/validation")

const {authenticateToken,verifyToken}= require("../middleware/auth")

router.post(
  "/create",
  verifyToken,
  validateProject,
  handleValidationErrors,
  ProjectController.createProject
)

router.get("/my-projects", verifyToken, ProjectController.retrieveProjectsbyUsername)

router.get("/genre/:genre", ProjectController.getprojectsbyGenre)


router.get(`/all-projects`,ProjectController.get_all_projects);
router.post("/team-project", verifyToken, ProjectController.createProjectForTeam);
router.get("/:id", ProjectController.getProjectById);
router.delete("/:id", verifyToken, ProjectController.deleteProject);
router.get("/:id/users", ProjectController.getUsersByProject);
router.get("/filter/by-date", ProjectController.getProjectsByDate);
router.get("/team/:team_id", ProjectController.getTeamProject);
router.get(
  "/:hackathon_id/user/:username",
  ProjectController.getUserProjectsInHackathon
);
module.exports = router
