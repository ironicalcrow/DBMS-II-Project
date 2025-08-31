const express = require("express");
const router = express.Router();
const JWTUtils = require("../utils/jwtUtils");
const {authenticateToken,verifyToken}= require("../middleware/auth")

const AuthController = require("../controllers/authController");
const {
  validateRegistration,
  validateLogin,
  handleValidationErrors,
} = require("../middleware/validation");

router.post(
  "/register",
  validateRegistration,
  handleValidationErrors,
  AuthController.register
);

router.post(
  "/login",
  validateLogin,
  handleValidationErrors,
  AuthController.login
);



router.get("/profile", verifyToken, AuthController.fetchProfile);
router.put("/profile", verifyToken, AuthController.update_profile);
module.exports = router;
