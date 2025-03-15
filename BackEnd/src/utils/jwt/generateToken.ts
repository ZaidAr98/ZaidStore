import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
import config from 'config';
import { refreshTokenInput } from '../../schemas/refreshToken.schema';

dotenv.config();



const tokenKey = process.env.TOKEN_KEY as string;
const adminTokenKey = process.env.ADMIN_TOKEN_KEY as string;

const refreshTokenKey = process.env.REFRESH_TOKEN_KEY as string; // Use a separate secret key for refresh tokens
const adminRefreshTokenKey = process.env.ADMIN_REFRESH_TOKEN_KEY as string;

const generateAccessToken = (user: refreshTokenInput) => {
    if (!user?.role) {
        console.log("Generating access token for user");
        return jwt.sign({ user }, tokenKey, { expiresIn:`${config.get<number>('accessTokenExpiresIn')}m`});
    }
    console.log("Generating access token for admin");
    return jwt.sign({ user }, adminTokenKey, { expiresIn:`${config.get<number>('accessTokenExpiresIn')}m`});
};

const generateRefreshToken = (user: refreshTokenInput) => {
    if (!user?.role) {
        console.log("Generating refresh token for user");
        return jwt.sign({ user }, refreshTokenKey, { expiresIn: `${config.get<number>('accessTokenExpiresIn')}m` });
    }
    // Generate refresh token for admin
    console.log("Generating refresh token for admin");
    return jwt.sign({ user }, adminRefreshTokenKey, { expiresIn:`${config.get<number>('accessTokenExpiresIn')}m` });
};

export { generateAccessToken, generateRefreshToken };