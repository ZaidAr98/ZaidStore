import {  NextFunction, Request, Response } from "express";
import User from "../../model/userModel";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt/generateToken";
import { hashPassword } from "../../utils/validation/hashedPassword";
import RefreshToken from "../../model/refreshToken"
import setCookie from "../../utils/jwt/setCookie";
import bcrypt from "bcryptjs";
import validator from "validator";
import OTP from "../../model/otpModel";
import { sendVerificationEmail } from "../../utils/nodeMailer/sendVerificationEmail";
import { generateOTP } from "../../utils/otp/generateOTP";
import jwt, { JwtPayload } from 'jsonwebtoken';
import {OAuth2Client, TokenPayload} from "google-auth-library"
import { refreshTokenInput } from "../../schemas/refreshToken.schema";
import {sendResetPasswordMail} from "../../utils/nodeMailer/forgetPasswordMail"
import { any } from "zod";
import { Types } from "mongoose";



const client =new OAuth2Client(process.env.GOOGLE_CLIENT_ID)


export const signup = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
    const { name, email, phone, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            
           res.status(404).json({
            success:false,
            message: "User doesn't exist.Please create a new account.",
          });
          return
        }

        const securePassword = await hashPassword(password);

        const newUser = await User.create({
            name,
            email,
            phone,
            password: securePassword,
        });

        console.log("User registered successfully");

        const userData: refreshTokenInput = { 
          id: (newUser._id as Types.ObjectId).toString(), 
          email: newUser.email 
        }; 
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

export const login = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
    const { email, password } = req.body;


    try {
        
  
    const userExist = await User.findOne({ email });

    if (!userExist) {
       
      res.status(404).json({
        success:false,
        message: "User doesn't exist.Please create a new account.",
      });

      return 
      }

      if (!userExist.password) {
        res.status(400).json({
          success: false,
          message: "You signed up with Google. Please log in using Google.",
        });
        return
    }
      


      const isPasswordCorrect = await bcrypt.compare(
        password,
        userExist.password
      );


      if (!isPasswordCorrect) {

         res
        .status(401)
        .json({ success: false, message: "Incorrect Password",error:any });
         return
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



export const sendOTP = async(req: Request, res: Response, next: NextFunction):Promise<void>=>{

    const {email} = req.body
    
    if (!validator.isEmail(email)) {

      res.status(400).json({ message: "Invalid email address" });
      return  
    }

      try {
        
        const isUserExist= await User.findOne({email})
        if (isUserExist) {
           
          res.status(409).json({ message: "user already exist" });
          return 
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



export const verifyOTP = async(req: Request, res: Response, next: NextFunction):Promise<void>=>{
  const {otp,email} = req.body
   
  try {
    const otpData = await OTP.find({email}).sort({createdAt:-1}).limit(1);
    console.log("otp query", otpData)

    if(!otpData.length || otp !== otpData[0].otp){
      const errorMessage:string = otpData.length ? "OTP is not valid" : "OTP expired"; 
      res.status(400).json({ success: false, message: errorMessage });
      return
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


export const refreshUserToken = async(req: Request, res: Response, next: NextFunction):Promise<void>=>{

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
      
    
      res.status(403).json({success:false, error:"Invalid refresh token"})
      return
    }
    const newAccessToken =generateAccessToken({id:userId,email:decoded.email})

    res.status(200).json({success:true,accessToken:newAccessToken})
   

  } catch (error:any) {
    console.log("error in refreshing token",error.message);
    res.status(403).json({success:false,message:'Token verification failed',error})
  }


}


export const logout = async(req: Request, res: Response, next: NextFunction):Promise<void>=>{

  try {
    
    const refreshToken= req.cookies['userRefreshToken']
    console.log(refreshToken)
    await RefreshToken.deleteOne({token:refreshToken})

    setCookie("userRefreshToken","",1,res)
    res.status(200).json({message:"Logged out successfully"})
  } catch (error:any) {
    console.log("error in logout",error);
    res.json({success:false,error:error})
  }
}



export const googleAuth = async(req:Request,res:Response,next: NextFunction):Promise<void>=>{
  const {token} = req.body

  try {
    
const ticket = await client.verifyIdToken({
  idToken:token,
  audience:process.env.GOOGLE_CLIENT_ID
})

const {name,email}= ticket.getPayload() as TokenPayload

let user = await User.findOne({ email }).select('-password');

if(!user){

  user =await User.create({name,email})
  console.log("proceed signup");

}

console.log("user",user);
const userData:refreshTokenInput = {  id: (user._id as Types.ObjectId).toString(),  email: user.email };
const accessToken = generateAccessToken(userData);
const refreshToken = generateRefreshToken(userData);


const newRefreshToken = new RefreshToken({
  token:refreshToken,
  user:user._id,
  expiresAt:new Date(Date.now()+  24 * 60 * 60 * 1000)
})

setCookie("userRefreshToken",refreshToken,24 * 60 * 60 * 1000, res)
res.status(200).json({ success:true, message:"User logged in successfully", user,accessToken})

  } catch (error:any) {
    console.log("Error in google authentication",error);
    res.status(500).json({success:false, message: "Google authentication failed!"})
  }
}



export const forgetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;


  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({ success: false, message: 'Request body cannot be empty.' });
    return 
  }

  if (!validator.isEmail(email)) {
    res.status(400).json({ success: false, message: 'Invalid email address.' });
    return 
  }

  if (!email) {
    res.status(400).json({ success: false, error: 'Invalid credentials' });
    return 
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: 'User does not exist' });
      return 
    }

    const otp = generateOTP();

    await OTP.create({ email, otp });

    await sendResetPasswordMail(email, otp);

    res.status(201).json({ success: true, message: 'OTP sent successfully' });
  } catch (error: unknown) {
    const statusCode = (error as any).status || 500;
    res.status(statusCode).json({ success: false, message: 'Internal server error.' });
  }
};



export const verifyResetOtp = async(req:Request,res:Response):Promise<void>=>{
  const {email,otp}=req.body;
  console.log("verifying otp",otp);

  try {
    //check otp with email and otp and newest otp
   const otpData= await OTP.findOne({email}).sort({createdAt:-1}).limit(1)
   console.log("otpdata",otpData);
   
   if(otp!=otpData?.otp || !otpData?.otp.length){
    const errorMessage=!otpData?.otp.length?"OTP Expired.":"OTP is not valid."
   res.status(400).json({message:errorMessage})
   return
  }
  res.status(200).json({success:true,message:"OTP Verfied successfully"})
  } catch (error:any) {
    const errorMessage=error.message||"OTP Verification failed."
    res.status(error.status||500).json({success:false,message:errorMessage})
  }

}



export const resetPassword = async(req:Request,res:Response):Promise<void>=>{
  const {email,password} = req.body
  
  if(!email.trim() || !password.trim()|| password.length<6){
     res.status(400).json({success:false,message:"Invalid credentials"})
     return
  }
  try {
    const user=await User.findOne({email})
    if(!user){
   res.status(404).json({message:"User doesnt exist."})
   return 
    }
    const securePassword=await hashPassword(password)
    user.password=securePassword;
    await user.save()
    res.status(200).json({success:true,message:'Password updated successfully'})
   } catch (error:any) {
     console.log("error resdetting password",error);
     res.status(error.status||500).json({success:false,message:"Password resetting failed."})
   }
}




export const verifyPassword=async(req:Request,res:Response):Promise<void>=>{
  console.log("verifiying password");
  const{userId}=req.params
  const{currentPassword}=req.body;
try {
  if(!userId || !currentPassword){
    res.status(400).json({success:false, message:"Invalid credentials"})
    return
  }

 const user= await User.findById(userId)
 if(!user){
  res.status(404).json({success:false, message:"User not found."})
return 
}

if(!user.password){
  res.status(404).json({success:false, message:"User password not found."})
  return 
}

 const isPasswordCorrect=await bcrypt.compare(currentPassword,user.password)
 if(!isPasswordCorrect){
  res.status(400).json({success:false, message:"Incorrect Password"})
  return 
}
 console.log("verified successfully");
 
res.status(200).json({success:true, message:"Password verified."})
} catch (error:any) {
  console.log("error verifying password",error);
  res.status(error.status||500).json({success:false, message:'Password verification failed.'})
}
}

export const changePassword=async(req:Request,res:Response):Promise<void>=>{
  console.log("changing");
  const {userId}=req.params
  const {currentPassword,newPassword}=req.body;
  if(!newPassword.trim()||newPassword.length<6||!userId){
   res.status(400).json({success:false,message:"Invalid credentials"})
   return 
  }
if(currentPassword===newPassword){
  res.status(400).json({success:false, message:"New password cannot be the old password."})
  return
}
  try {
    const user=await User.findById(userId)
    if(!user){
  res.status(404).json({success:false, message:"User not found"})
  return
    }
    const securePassword= await hashPassword(newPassword)
    await User.findOneAndUpdate({_id:userId},{$set:{password:securePassword}})
    res.status(200).json({success:true,message:"Password updated"})
  } catch (error:any) {
    console.log("Error CHANGING PASSWORD",error);
    res.status(error.status||500).json({success:true, message:"Failed to update password"})
  }
}



