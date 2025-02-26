
import { Response } from 'express';

const setCookie = async (
    tokenName: string,
    token: string,
    maxAge: number,
    res: Response
): Promise<void> => {
    res.cookie(tokenName, token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: maxAge,
    });
};

export default setCookie;