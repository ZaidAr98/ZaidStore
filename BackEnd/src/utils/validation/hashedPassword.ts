import bcrypt from "bcryptjs"

export const hashPassword = async (password:string) => {
    try {
      const securePassword = await bcrypt.hash(password, 10);
      console.log("password hashed", securePassword);
  
      return securePassword;
    } catch (error) {
      console.log("error in hashing password");
    }
  };

