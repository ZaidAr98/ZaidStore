import express from "express";
import { creatAdminSchema } from "../schemas/user.schema";

import { validate } from "../middleware/validate";
import { adminLogin, adminLogout, refreshAdminAccessToken } from "../controllers/admin/adminController";




const router = express.Router();

router.post('/login',validate(creatAdminSchema),adminLogin)
router.post('/logout',adminLogout)
router.post('/refresh-token',refreshAdminAccessToken)