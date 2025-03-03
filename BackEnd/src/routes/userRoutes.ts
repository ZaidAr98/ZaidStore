import express from "express";
import { changePassword, forgetPassword, googleAuth, login, logout, refreshUserToken, resetPassword, sendOTP, signup, verifyOTP, verifyPassword, verifyResetOtp } from "../controllers/user/authController";
import { validate } from "../middleware/validate";
import { createUserSchema,loginUserSchema, sendOTPSchema, verifyOTPSchema } from "../schemas/user.schema";
import authenticateToken from "../middleware/user/authMiddleware";
// import { refreshTokenSchema } from "../schemas/refreshToken.schema";




const router = express.Router();

//authentication
router.post('/signup',validate(createUserSchema),signup)
router.post('/login',validate(loginUserSchema),login)
router.post('/send-otp',validate(sendOTPSchema),sendOTP)
router.post('/verify-otp',validate(verifyOTPSchema),verifyOTP)
router.post('/refresh-token',refreshUserToken)
router.post('/logout',logout)
router.post('/google-auth',googleAuth)

//forget passwords
router.post('/forget-password',forgetPassword)
router.post('/resend-otp',forgetPassword)
router.post('/reset/verify-otp',verifyResetOtp)
router.post('/reset-password',resetPassword)

//change password
router.post('/verify-password/:userId',authenticateToken,verifyPassword)
router.post('/change-password/:userId',authenticateToken,changePassword)


export default router;