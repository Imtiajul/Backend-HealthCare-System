import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelpers/AppError";
import { cookieUtils } from "../../utils/cookies";

const registerPatient = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        // console.log(payload)

        const result = await authService.registerPatient(payload);
        const { accessToken, refreshToken, token, ...rest } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token as string);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Patient Registered Successful",
            data: {
                token,
                accessToken,
                refreshToken,
                rest
            }
        })
    })

const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;

        const result = await authService.loginUser(payload);
        const { accessToken, refreshToken, token, ...rest } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token);


        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User Login Successful",
            data: {
                token,
                accessToken,
                refreshToken,
                ...rest
            }
        })
    })

const getMe = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;
        const result = await authService.getMe(user);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User Profile Fetched Successfully",
            data: result
        })
    }
)

const getNewToken = catchAsync(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];

        if (!refreshToken) {
            throw new AppError(status.UNAUTHORIZED, "Refresh Token Missing");
        }

        const result = await authService.getNewToken(refreshToken, betterAuthSessionToken);

        const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, sessionToken);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "New Tokens Generated Successfully",
            data: {
                accessToken,
                refreshToken,
                sessionToken,
            }
        })
    }
)

const changePassword = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];

        const result = await authService.changePassword(payload, betterAuthSessionToken);

        const { accessToken, refreshToken, token } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password changed successfully",
            data: result,
        });
    }
)
const logoutUser = catchAsync(
    async (req: Request, res: Response) => {
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];
        const result = await authService.logoutUser(betterAuthSessionToken);

        cookieUtils.clearCookie(res, 'accessToken', {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })

        cookieUtils.clearCookie(res, 'refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })

        cookieUtils.clearCookie(res, 'better-auth.session_token', {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged out successfully",
            data: result
        })
    }
)


const verifyEmail = catchAsync(
    async (req: Request, res: Response) => {
        const {email, otp } = req.body;

        await authService.verifyEmail(email, otp);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Email Verified Successfully",
        })
    })
export const authController = {
    registerPatient, loginUser, getMe, getNewToken,
    changePassword, logoutUser, verifyEmail,
}