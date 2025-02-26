import {  NextFunction, Request, Response } from "express";
import User from "../../model/userModel";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt/generateToken";
import { hashPassword } from "../../utils/validation/hashedPassword";
import RefreshToken from "../../model/refreshToken"
import setCookie from "../../utils/jwt/SetCookie";
import AppError from "../../utils/appError";
import bcrypt from "bcryptjs";


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