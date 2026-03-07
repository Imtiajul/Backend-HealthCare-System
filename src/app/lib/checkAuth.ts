import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookies";
import AppError from "../errorHelpers/AppError";
import status from "http-status";
import { prisma } from "./prisma";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../config/env";

export const checkAuth = (...authRoles: Role[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        //Session Token Verification
        // console.log(req.body);
        const session_token = cookieUtils.getCookie(req, "better-auth.session_token");

        if (!session_token) {
            throw new AppError(status.UNAUTHORIZED, "Unauthoriszed Access! No Access Token is Provided.")
        }

        if (session_token) {
            const sessionExists = await prisma.session.findFirst({
                where: {
                    token: session_token,
                    expiresAt: {
                        gt: new Date(),
                    }
                },
                include: {
                    user: true,
                }
            })
            if (sessionExists && sessionExists.user) {
                const user = sessionExists.user;

                const now = new Date();
                const expiresAt = new Date(sessionExists.expiresAt);
                const createAt = new Date(sessionExists.createdAt);

                const sessionLifeTime = expiresAt.getTime() - createAt.getTime();
                const timeRemaining = expiresAt.getTime() - now.getTime();
                const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

                if (percentRemaining < 20) {
                    res.setHeader("X-Session-Refresh", 'true');
                    res.setHeader("X-Session-Expire-At", expiresAt.toISOString())
                    res.setHeader("X-Time-Remaining'", timeRemaining.toString())

                    console.log("Session Expire Soon!!");
                }
                if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED) {
                    throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! User is not active.');
                }

                if (user.isDeleted) {
                    throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! User is deleted.');
                }

                if (authRoles.length > 0 && !authRoles.includes(user.role)) {
                    throw new AppError(status.FORBIDDEN, 'Forbidden access! You do not have permission to access this resource.');
                }

            }

            //Access Token Verification
            const accessToken = cookieUtils.getCookie(req, 'accessToken');

            if (!accessToken) {
                throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! No access token provided.');
            }
            const verifiedToken = jwtUtils.varifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);

            if (!verifiedToken.success) {
                throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! Invalid access token.');
            }

            if (authRoles.length > 0 && typeof verifiedToken.data === 'object' && !authRoles.includes(verifiedToken.data.role as Role)) {
                throw new AppError(status.FORBIDDEN, 'Forbidden access! You do not have permission to access this resource.');
            }

            next()
        }

    } catch (error) {
        next(error);
    }
}