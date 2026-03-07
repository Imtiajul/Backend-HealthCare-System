
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { specialtyService } from "./specialty.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const createSpecialty = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await specialtyService.createSpecialty(payload);
        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: 'Specialty created successfully',
            data: result
        });
    }
)

const getAllSpecialties = catchAsync(
    async (req: Request, res: Response) => {
        const result = await specialtyService.getAllSpecialties();

        sendResponse(res, {
            httpStatusCode: 200,
            success: true,
            message: 'All Specialties fetched successfully',
            data: result
        });
    }
)

const deleteSpecialty = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
       const result = await specialtyService.deleteSpecialty(id as string);

       sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Specialties Deleted Successfully",
        data: result
       })
    }
)

export const specialtyController = {
    createSpecialty, getAllSpecialties, deleteSpecialty,

}