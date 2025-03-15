import bcrypt from "bcryptjs"
import RefreshToken from "../../model/refreshToken"

import jwt, { JwtPayload } from 'jsonwebtoken';
import { generateAccessToken,generateRefreshToken } from "../../utils/jwt/generateToken"
import setCookie from "../../utils/jwt/setCookie"
import Admin from "../../model/adminModel"

import {  NextFunction, Request, Response } from "express";
import { refreshTokenInput } from "../../schemas/refreshToken.schema"




export const adminLogin = async (req:Request, res:Response):Promise<void> => {
    const { email, password } = req.body;
    console.log(req.body);
    
    try {
      //check user
      //check password
      console.log("finding user");
      
      const admin = await Admin.findOne({ email });
      console.log(admin);
      
        if(!admin){
          console.log("User doesnt exist");
          
          res.status(400).json({success:false ,message: "User doesn't exist!"})
          return
        }
        if (!admin.password) {
          console.log("Admin password is undefined");
          res.status(500).json({ success: false, message: "Internal server error" });
          return;
      }
      
        console.log("password checking");
        const checkPassword = await bcrypt.compare(password, admin.password);
        console.log("check",checkPassword);
        
        if(!checkPassword){
           res.status(401).json({success: false, message: "Incorrect password"})
           return 
        }
  
        const adminData:refreshTokenInput ={id:admin._id.toString(), email:admin.email, role:admin.role}
             //generate token
             
             const adminAccessToken=generateAccessToken(adminData)
             const adminRefreshToken=generateRefreshToken(adminData)
              //save refresh token
              const newRefreshToken=new RefreshToken({
                token:adminRefreshToken,
                user:admin._id,
                role:admin.role,
                expiresAt:new Date(Date.now()+24*60*60*1000)
               })
         
               await newRefreshToken.save();
               setCookie("adminRefreshToken",adminRefreshToken,24*60*60*100,res)
               res.status(200).json({
                success: true,
                message: "Admin logged in successfully.",
                admin: {
                  id: admin._id,
                  name: admin.name,
                  email: admin.email,
                  role: admin.role,
                },
                adminAccessToken
              });
  
    
    } catch (error:any) {
      console.log("error in admin login", error);
      res.status(error.status).json({ success: false, message: "Login failed", error:error.message });
    }
  };



  export const adminLogout=async(req:Request,res:Response)=>{
    try {
      const adminRefreshToken= req.cookies['adminRefreshToken']
      console.log("admin REF",adminRefreshToken);
      await RefreshToken.findOne({token:adminRefreshToken})
      setCookie("adminRefreshToken","",1,res)
      res.status(200).json({message:"Admin logout successfully"})
    } catch (error:any) {
      console.log("error in logout",error);
      res.status(error.status).json({success:false,error:error})
    }
  }



  export const refreshAdminAccessToken =async(req:Request,res:Response):Promise<void>=>{
    console.log("REFRESHING ADMIN ACCESS TOKEN");
    
    const refreshToken =req.cookies.adminRefreshToken
    if(!refreshToken){
      console.log("NO tokrn provided");
      res.status(401).json({error:"No refresh token provided.",success:false})
      return
    }
    try {
    const decoded=jwt.verify(refreshToken,process.env.ADMIN_REFRESH_TOKEN_KEY as string) as JwtPayload
    const admin_id =decoded.user.id
    const storedToken =await RefreshToken.find({token:refreshToken,user:admin_id,role:"admin",expiresAt:{ $gt: new Date() }}).limit(1)
   if(!storedToken) {
    console.log("Invalid refresh token in database",storedToken);
      
       res.status(403).json({success:false, error:"Invalid refresh token"})
      return
    }
   const newAccessToken =await generateAccessToken({id:admin_id,email:decoded.email,role:decoded.role})
  
   res.status(200).json({success:true,adminAccessToken:newAccessToken})
  } catch (error:any) {
    console.log("error in refreshing token",error.message);
    res.status(403).json({success:false,message:'Token verification failed',error})
    }
  }