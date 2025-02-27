import {  NextFunction, Request, Response } from "express";
import User from "../../model/userModel";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt/generateToken";
import { hashPassword } from "../../utils/validation/hashedPassword";
import RefreshToken from "../../model/refreshToken"
import setCookie from "../../utils/jwt/setCookie";
import AppError from "../../utils/appError";
import bcrypt from "bcryptjs";
import validator from "validator";
import OTP from "../../model/otpModel";
import { sendVerificationEmail } from "../../utils/nodeMailer/sendVerificationEmail";
import { generateOTP } from "../../utils/otp/generateOTP";
import jwt, { JwtPayload } from 'jsonwebtoken';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            
             return next(new AppError("User already exists", 409));
        }

        const securePassword = await hashPassword(password);

        const newUser = await User.create({
            name,
            email,
            phone,
            password: securePassword,
        });

        console.log("User registered successfully");

        // const userData = { id: newUser._id, email: newUser.email };
        const accessToken = generateAccessToken(newUser);
        const refreshToken = generateRefreshToken(newUser);

        const newRefreshToken = new RefreshToken({
            token: refreshToken,
            user: newUser._id,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        await newRefreshToken.save();
        setCookie("userRefreshToken", refreshToken, 24 * 60 * 60 * 1000, res);

        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            newUser: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                // verified:false

            },
            accessToken,
        });

    } catch (error:any) {
        console.log("error in signup", error);
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;


    try {
        
  
    const userExist = await User.findOne({ email });

    if (!userExist) {
       
        return next(new AppError("User doesn't exist.Please create a new account.", 404));
      }

      if (!userExist.password) {
        return next(new AppError("You signed up with Google. Please log in using Google.", 404));
      }


      const isPasswordCorrect = await bcrypt.compare(
        password,
        userExist.password
      );


      if (!isPasswordCorrect) {

        return next(new AppError("Incorrect Password", 401));
      }



      const accessToken = generateAccessToken(userExist);
      const refreshToken = generateRefreshToken(userExist);
  
      const newRefreshToken = new RefreshToken({
        token: refreshToken,
        user: userExist._id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      await newRefreshToken.save();
      setCookie("userRefreshToken", refreshToken, 24 * 60 * 60 * 1000, res);

       res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          _id: userExist._id,
          name: userExist.name,
          email: userExist.email,
          phone: userExist.phone,  
        },
        accessToken,
      });
      

    }

    catch (error:any) {
        console.log("error in signup", error);
        next(error);
    }
}



export const sendOTP = async(req: Request, res: Response, next: NextFunction)=>{

    const {email} = req.body
    
    if (!validator.isEmail(email)) {

        return next(new AppError("Invalid email address", 400));
      }

      try {
        
        const isUserExist= await User.findOne({email})
        if (isUserExist) {
           
            return next(new AppError("user already exist", 409));
          }

          const otp = generateOTP();
          console.log("otp:", otp);



          const otpEntry = await OTP.create({
            email,
            otp,
          });
          console.log("otp saved in db", otpEntry);

          sendVerificationEmail(email,otp)

          res.status(200).json({ success: true, message: "OTP sent successfully" });

      } catch (error:any) {
        console.log(error);
        res.status(error.status||500).json({success:false,message:"Internal server error."})
      }
      

}



export const verifyOTP = async(req: Request, res: Response, next: NextFunction)=>{
  const {otp,email} = req.body
   
  try {
    const otpData = await OTP.find({email}).sort({createdAt:-1}).limit(1);
    console.log("otp query", otpData)

    if(!otpData.length || otp !== otpData[0].otp){
      const errorMessage:string = otpData.length ? "OTP is not valid" : "OTP expired"; 
      return next(new AppError(errorMessage, 400));
    }

    const user = await User.findOne({email}).select("-password")


     
    console.log("user",user)

    res
    .status(200)
    .json({ success: true, message: "OTP verified successfully", user });

 
    console.log("otp verified");


  } catch (error:any) {
    console.log("error in otp verification", error.message);
  }


}


export const refreshUserToken = async(req: Request, res: Response, next: NextFunction)=>{

  console.log("refreshing access token")
 
  const refreshToken = req.cookies.userRefreshToken;

  if(!refreshToken){
    console.log("No refresh token provided")
  }

  try {
    const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_KEY as string) as JwtPayload
    
    const userId = decoded.user.id
    console.log("decoded and userid", decoded, userId,refreshToken);
    const storedToken = await RefreshToken.find({token:refreshToken, user:userId, expiresAt: { $gt: new Date() } })
    .limit(1);
   

    if(!storedToken){
      console.log("Invalid refresh token in database",storedToken);
      
    
      return next(new AppError("Invalid refresh token", 403))
    }
    const newAccessToken =generateAccessToken({id:userId,email:decoded.email})

    res.status(200).json({success:true,accessToken:newAccessToken})
   

  } catch (error:any) {
    console.log("error in refreshing token",error.message);
    res.status(403).json({success:false,message:'Token verification failed',error})
  }


}


export const logout = async(req: Request, res: Response, next: NextFunction)=>{

  try {
    
    const refreshToken= req.cookies['userRefreshToken']
    console.log(refreshToken)

    setCookie("userRefreshToken","",1,res)
    res.status(200).json({message:"Logged out successfully"})
  } catch (error:any) {
    return next(new AppError(error.message, 404))
  }
}