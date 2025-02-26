import express from "express";
import { login, signup } from "../controllers/user/authController";
import { validate } from "../middleware/validate";
import { createUserSchema,loginUserSchema } from "../schemas/user.schema";



const router = express.Router();


router.post('/signup',validate(createUserSchema),signup)
router.post('/login',validate(loginUserSchema),login)


export default router;