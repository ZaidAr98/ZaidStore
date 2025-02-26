import express from "express";
import { signup } from "../controllers/user/authController";
import { validate } from "../middleware/validate";
import { createUserSchema } from "../schemas/user.schema";



const router = express.Router();


router.post('/signup',validate(createUserSchema),signup)


export default router;