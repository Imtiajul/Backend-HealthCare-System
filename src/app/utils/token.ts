import { Response } from "express";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { envVars } from "../config/env";
import { jwtUtils } from "./jwt";
import { cookieUtils } from "./cookies";


//Creating access token
const getAccessToken = (payload: JwtPayload) => {
    const accessToken = jwtUtils.createToken(
        payload,
        envVars.ACCESS_TOKEN_SECRET,
        { expiresIn: Number(envVars.ACCESS_TOKEN_EXPIRES_IN) } as SignOptions
    );

    return accessToken;
}

const getRefreshToken = (payload: JwtPayload) => {
    const refreshToken = jwtUtils.createToken(
        payload,
        envVars.REFRESH_TOKEN_SECRET,
        { expiresIn: Number(envVars.REFRESH_TOKEN_EXPIRES_IN) } as SignOptions
    );
    return refreshToken;
}

const setAccessTokenCookie = (res: Response, token: string) => {
       cookieUtils.setCookie(res, 'accessToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        //1 day
        maxAge: Number(envVars.ACCESS_TOKEN_EXPIRES_IN),
    });
}

const setRefreshTokenCookie = (res: Response, token: string) => {
    cookieUtils.setCookie(res, 'refreshToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        //7d
        maxAge: Number(envVars.REFRESH_TOKEN_EXPIRES_IN),
    });
}

const setBetterAuthSessionCookie = (res: Response, token: string) => {
    cookieUtils.setCookie(res, "better-auth.session_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        //1 day
        maxAge: Number(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN),
    });
}

export const tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setAccessTokenCookie,
    setRefreshTokenCookie,
    setBetterAuthSessionCookie,
}