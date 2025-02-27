import express from "express";
import { login, logout, refreshUserToken, sendOTP, signup, verifyOTP } from "../controllers/user/authController";
import { validate } from "../middleware/validate";
import { createUserSchema,loginUserSchema, sendOTPSchema, verifyOTPSchema } from "../schemas/user.schema";
// import { refreshTokenSchema } from "../schemas/refreshToken.schema";




const router = express.Router();

//authentication
router.post('/signup',validate(createUserSchema),signup)
router.post('/login',validate(loginUserSchema),login)
router.post('/send-otp',validate(sendOTPSchema),sendOTP)
router.post('/verify-otp',validate(verifyOTPSchema),verifyOTP)
router.post('/refresh-token',refreshUserToken)
router.post('/logout',logout)





export default router;