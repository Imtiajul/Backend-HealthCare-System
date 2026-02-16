import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";
import status from "http-status";

const registerPatient = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;

        const result = await authService.registerPatient(payload);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Patient Registered Successful",
            data: result
        })
    })

const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;

        const result = await authService.loginUser(payload);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Patient Login Successful",
            data: result
        })
    })

export const authController = {
    registerPatient, loginUser,
}