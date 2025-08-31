const { body, validationResult } = require("express-validator");

const validateRegistration = [
  body("username")
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username must be 3-50 characters and contain only letters, numbers, and underscores"),

  body("full_name").isLength({ min: 2, max: 100 }).withMessage("Full name must be 2-100 characters"),

  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),

  body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must be at least 8 characters with uppercase, lowercase, and number"),
];

const validateLogin = [
  body("email").notEmpty().isEmail().normalizeEmail().withMessage("Email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const validateProject = [
  body("project_name")
    .isLength({ min: 3, max: 100 })
    .withMessage("Project name must be between 3 and 100 characters"),

  body("git_repo")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("GitHub repo must be a valid URL"),

  body("overview")
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage("Overview should be less than 1000 characters"),

  body("motivation")
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage("Motivation should be less than 1000 characters"),

  body("features")
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage("Features should be less than 1000 characters"),

  body("project_genre")
    .isLength({ min: 3, max: 50 })
    .withMessage("Project genre must be between 3 and 50 characters"),
];

const validateHackathon = [
  body("hackathon_name")
    .notEmpty().withMessage("Hackathon name is required")
    .isLength({ min: 3, max: 100 }).withMessage("Hackathon name must be 3-100 characters"),

  body("duration")
    .notEmpty().withMessage("Duration is required")
    .isLength({ max: 50 }).withMessage("Duration must be under 50 characters"),

  body("genre")
    .notEmpty().withMessage("Genre is required")
    .isLength({ max: 100 }).withMessage("Genre must be under 100 characters"),

  body("rule_book")
    .optional({ checkFalsy: true })
    .isURL().withMessage("Rule book must be a valid URL"),

  body("hackathon_image")
    .optional({ checkFalsy: true })
    .isURL().withMessage("Hackathon image must be a valid URL"),

  body("starting_date")
    .notEmpty().withMessage("Starting date is required")
    .isISO8601().toDate().withMessage("Invalid starting date"),

  body("ending_date")
    .notEmpty().withMessage("Ending date is required")
    .isISO8601().toDate().withMessage("Invalid ending date"),

  body("judge_username")
    .notEmpty().withMessage("At least one judge username is required")
    .matches(/^([a-zA-Z0-9_]+)(,\s*[a-zA-Z0-9_]+)*$/)
    .withMessage("Judge usernames must be comma-separated valid usernames (letters, numbers, underscores)")
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProject,
  validateHackathon,
  handleValidationErrors,
};

