
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { superAdminService } from "./superAdmin.service";

const getallSuperAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const result = await superAdminService.getAllSuperAdmin();
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'Fetched All Super-admin Data',
            data: result
        });
    }
)

const getSuperAdminById = catchAsync(
    async (req: Request, res: Response) => {
        const adminId = req.params.adminId;
        const result = await superAdminService.getSuperAdminById(adminId as string);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'Fetched Super-admin\'s Data',
            data: result
        });
    }
)

const updateSuperAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const adminId = req.params.adminId;
        const result = await superAdminService.updateSuperAdmin(adminId as string, req.body);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'Super-admin Data Updated',
            data: result
        });
    }
)

const softDeleteSuperAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const adminId = req.params.adminId;
        const result = await superAdminService.softDeleteSuperAdmin(adminId as string);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'Super-admin Deleted Successfully',
            data: result
        });
    }
)
export const superAdminController = {
    getallSuperAdmin,
    getSuperAdminById,
    updateSuperAdmin,
    softDeleteSuperAdmin,
}