const User = require("../models/user");
const PasswordUtils = require("../utils/passwordUtils");
const JWTUtils = require("../utils/jwtUtils");
const ResponseHandler = require("../utils/responseHandler");

class AuthController {
  // ✅ User registration
  static async register(req, res) {
    try {
      const { username, full_name, email, password, date_of_birth } = req.body;
      console.log("Register request body:", req.body);

      const usernameExists = await User.findByUsername(username);
      const emailExists = await User.findByEmail(email);

      if (emailExists) {
        console.error("Email already exists:", email);
        return ResponseHandler.conflict(
          res,
          "An account has already been created using this email"
        );
      }

      if (usernameExists) {
        console.error("Username already exists:", username);
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

      return ResponseHandler.success(
        res,
        {
          token,
          user: { username, full_name, email },
        },
        "User Created Successfully"
      );
    } catch (error) {
      console.error("Registration error:", error);
      return ResponseHandler.error(
        res,
        "Registration failed",
        500,
        error.message
      );
    }
  }

  // ✅ User login
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      console.log("Login request:", req.body);

      // Fetch user and normalize column names
      const user = await User.findByEmailWithPassword(email);
      console.log("User fetched for login:", user);
      if (!user) return ResponseHandler.notFound(res, "User");

      // Compare password
      const isValidPassword = await PasswordUtils.comparePassword(
        password,
        user.password_hash // mapUserRow ensures lowercase
      );

      if (!isValidPassword) {
        return ResponseHandler.unauthorized(res, "Invalid credentials");
      }

      const token = JWTUtils.generateToken({
        username: user.username,
        email: user.email,
      });
      res.cookie("tokenkey", token, { httpOnly: true });

      return ResponseHandler.success(
        res,
        {
          token,
          user: {
            username: user.username,
            full_name: user.full_name,
            email: user.email,
          },
        },
        "Login successful"
      );
    } catch (error) {
      console.error("Login error:", error);
      return ResponseHandler.error(res, "Login failed", 500, error.message);
    }
  }

  // ✅ Fetch user profile
  static async fetchProfile(req, res) {
    try {
      const username = req.user.username;
      console.log("Fetching profile for:", username);

      const user = await User.getProfile(username);
      if (!user) return ResponseHandler.notFound(res, "User");

      return ResponseHandler.success(res, { user });
    } catch (error) {
      console.error("Profile fetch error:", error);
      return ResponseHandler.error(
        res,
        "Failed to fetch profile",
        500,
        error.message
      );
    }
  }

  // ✅ Update profile
  static async update_profile(req, res) {
    try {
      const username = req.user.username;
      const updateData = req.body;
      console.log("Updating profile for:", username, updateData);

      const update_done = await User.updateProfile(username, updateData);

      if (!update_done.rowsAffected) {
        return ResponseHandler.error(res, "Data could not be updated", 500);
      }

      return ResponseHandler.success(res, {
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      return ResponseHandler.error(
        res,
        "Data could not be updated",
        500,
        error.message
      );
    }
  }

  // ✅ Update password
  static async updatePassword(req, res) {
    try {
      const username = req.user.username;
      const { newPassword } = req.body;

      const newPasswordHash = await PasswordUtils.hashpassword(newPassword);
      const result = await User.updatePassword(username, newPasswordHash);

      if (!result.rowsAffected) {
        return ResponseHandler.error(res, "Password could not be updated", 500);
      }

      return ResponseHandler.success(res, {
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error("Password update error:", error);
      return ResponseHandler.error(
        res,
        "Password could not be updated",
        500,
        error.message
      );
    }
  }
}

module.exports = AuthController;
