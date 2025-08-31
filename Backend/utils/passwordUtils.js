const bcrypt= require('bcryptjs');

class PasswordUtils{
    
    static async hashpassword(password, saltRounds=12)
    {
        try{
            return await bcrypt.hash(password,saltRounds);
        }
        catch(error){
            throw new Error("Failed to hash password");
        }
    }

    static async comparePassword(password,hashedPassword)
    {
        try
        {
            return await bcrypt.compare(password,hashedPassword);
        }
        catch(error)
        {
            throw new Error("Failed to compare password");
        }
    }
}

module.exports = PasswordUtils;