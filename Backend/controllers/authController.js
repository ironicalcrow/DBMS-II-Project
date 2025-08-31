const User = require("../models/user");
const PasswordUtils = require("../utils/passwordUtils");
const JWTUtils = require("../utils/jwtUtils");
const ResponseHandler = require("../utils/responseHandler");

class AuthController {
  static async register(req, res) {
    try {
      const { username, full_name, email, password, date_of_birth } = req.body;

      const usernameExists = await User.findByUsername(username);
      const emailExists = await User.findByEmail(email);

      if (emailExists) {
        return ResponseHandler.conflict(res, "An account has already been created using this email");
      }

      if (usernameExists) {
        return ResponseHandler.conflict(res, "Username already exists");
      }

      const password_hash = await PasswordUtils.hashpassword(password);

      const userData = {
        username,
        full_name,
        email,
        password_hash,
        date_of_birth,
      };

      await User.create_user(userData);

      const token = JWTUtils.generateToken({ username, email });

      return ResponseHandler.success(res, {
        token,
        user: { username, full_name, email },
      }, "User Created Successfully");
    } catch (error) {
      console.error("Registration error:", error);
      return ResponseHandler.error(res, "Registration failed", 500, error.message);
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findByEmailWithPassword(email);

      if (!user) {
        return ResponseHandler.notFound(res, "User");
      }

      const isValidPassword = await PasswordUtils.comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        return ResponseHandler.unauthorized(res, "Invalid credentials");
      }

      const token = JWTUtils.generateToken({ username: user.username, email });
      console.log(token)
      res.cookie('tokenkey',token)
      return ResponseHandler.success(res, {
        token,
        user: {
          username: user.username,
          full_name: user.full_name,
          email,
        },
      }, "Login successful");
    } catch (error) {
      console.error("Login error:", error);
      return ResponseHandler.error(res, "Login failed", 500, error.message);
    }
  }

  static async fetchProfile(req, res) {
    try {
      const username = req.user.username;
      const user = await User.getProfile(username);

      if (!user) {
        return ResponseHandler.notFound(res, "User");
      }

      return ResponseHandler.success(res, { user });
    } catch (error) {
      console.error("Profile fetch error:", error);
      return ResponseHandler.error(res, "Failed to fetch profile", 500, error.message);
    }
  }

  static async update_profile(req, res) {
    try {
      console.log(req.user)
      const username = req.user.username; // ✅ safer than relying on client
      const userData = req.body;

      const update_done = await User.updateProfile(username, userData);

      if (!update_done.affectedRows) {
        return ResponseHandler.error(res, "Data could not be updated", 500);
      }

      return ResponseHandler.success(res, { message: "Profile updated successfully" });
    } catch (error) {
      console.error("Profile update error:", error);
      return ResponseHandler.error(res, "Data could not be updated", 500, error.message);
    }
  }
}

module.exports = AuthController;
