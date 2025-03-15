import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

const secretKey =process.env.ADMIN_TOKEN_KEY as string


interface AuthenticatedRequest extends Request {
    user?: any; // Replace `any` with the actual type of your user object
  }

function authenticateAdminToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        console.log("no token");
        res.status(401).json({ success: false, message: 'Access denied, no token provided' });
        return;
    }

    jwt.verify(token, secretKey, (err: any, user: any) => {
        if (err) {
            console.log("invalid token or token expired ", err);
            res.status(401).json({ error: "Invalid token" });
            return;
        }
        req.user = user;
        next();
    });
}

export default authenticateAdminToken;