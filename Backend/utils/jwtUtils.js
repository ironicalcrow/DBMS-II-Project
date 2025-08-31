const jwt= require('jsonwebtoken');
require('dotenv').config();

class JWTUtils {
    static generateToken(payload){
        try
        {
            return  jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRATION});
        }
        catch(error)
        {
            throw new Error("Failed to generate token");
        }
    }

    static verifyToken(token){
        try
        {
            return jwt.verify(token,process.env.JWT_SECRET);
        }
        catch(error)
        {
            if(error.name==="TokenExpiredError"){
                throw new Error("Token has expired")
            }
            else if(error.name==="JsonWebTokenError")
            {
                throw new Error("Invalid token");
            }

            throw new Error("Token varification failed");
        }
    }
    static extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      throw new Error("Authorization header missing")
    }

    const parts = authHeader.split(" ")
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new Error("Invalid authorization header format")
    }

    return parts[1]
  }

  static generateRefreshToken(payload) {
    return this.generateToken(payload, "30d")
  }
}

module.exports= JWTUtils;