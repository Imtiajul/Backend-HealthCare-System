
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { userService } from "./user.service";
import status from "http-status";

const createDoctor = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await userService.createDoctor(payload);
        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: 'Doctor created successfully',
            data: result
        });
    }
)


const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createAdmin(req.body);
    // console.log(req.body)
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Admin created successfully",
    data: result,
  });
});

const createSuperAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createSuperAdmin(req.body);
    // console.log(req.body)
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Super Admin created successfully",
    data: result,
  });
});

export const userController = {
    createDoctor,
    createAdmin,
    createSuperAdmin,
}