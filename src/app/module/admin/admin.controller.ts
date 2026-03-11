
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { adminService } from "./admin.service";

const getAllAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const result = await adminService.getAllAdmin();
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'Fetched All Admin Data',
            data: result
        });
    }
)

const getAdminById = catchAsync(
    async (req: Request, res: Response) => {
        const adminId = req.params.adminId;
        const result = await adminService.getAdminById(adminId as string);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'Fetched Admin\'s Data',
            data: result
        });
    }
)

const updateAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const adminId = req.params.adminId;
        const result = await adminService.updateAdmin(adminId as string, req.body);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'Admin Data Updated',
            data: result
        });
    }
)

const softDeleteAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const adminId = req.params.adminId;
        const user = req.user;

        const result = await adminService.softDeleteAdmin(adminId as string, req.user, user);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'Admin Deleted Successfully',
            data: result
        });
    }
)
export const AdminController = {
    getAllAdmin,
    getAdminById,
    updateAdmin,
    softDeleteAdmin,
}