const JWTUtils = require("../utils/jwtUtils");
const User = require("../models/user")
const ResponseHandler = require("../utils/responseHandler")

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = JWTUtils.extractTokenFromHeader(authHeader)

    const decoded = JWTUtils.verifyToken(token)


    const user = await User.findByUsername(decoded.username)
    if (!user) {
      return ResponseHandler.unauthorized(res, "User not found")
    }

    req.user = {
      username: user.username,
      email: user.email,
      full_name: user.full_name,
    }

    next()
  } catch (error) {
    if (error.message === "Authorization header missing") {
      return ResponseHandler.unauthorized(res, "Access token required")
    }
    return ResponseHandler.forbidden(res, error.message)
  }
}

const verifyToken = (req, res, next) => {
 
  const authHeader = req.headers.authorization
  console.log('mb')
  console.log('Print token')
  console.log('koi re')
  console.log(authHeader)
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token missing or invalid" })
  }

  try {
    const token = authHeader.split(" ")[1]
    const user = JWTUtils.verifyToken(token)
    req.user = user
    console.log(user)
    next()
  } catch (err) {
    return res.status(401).json({ error: err.message || "Invalid token" })
  }
}

module.exports = { authenticateToken, verifyToken }
