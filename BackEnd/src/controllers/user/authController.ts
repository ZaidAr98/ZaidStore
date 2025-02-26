import {  NextFunction, Request, Response } from "express";
import User from "../../model/userModel";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt/generateToken";
import { hashPassword } from "../../utils/validation/hashedPassword";
import RefreshToken from "../../model/refreshToken"
import setCookie from "../../utils/jwt/SetCookie";
import AppError from "../../utils/appError";


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