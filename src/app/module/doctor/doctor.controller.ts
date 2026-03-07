
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { doctorService } from "./doctor.service";

const getAllDoctor = catchAsync(
    async (req: Request, res: Response) => {
        const result = await doctorService.getAllDoctor();
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'Fetched All Doctors Data',
            data: result
        });
    }
)

const updateDoctor = catchAsync(
    async (req: Request, res: Response) => {
        const doctorId = req.params.doctorId;
        const result = await doctorService.updateDoctor(doctorId as string, req.body);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'Updated Doctor Data',
            data: result
        });
    }
)
const deleteDoctor = catchAsync(
    async (req: Request, res: Response) => {
        const doctorId = req.params.doctorId;
        const result = await doctorService.deleteDoctor(doctorId as string);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'Doctor Deleted Successfully',
            data: result
        });
    }
)
export const doctorController = {
    getAllDoctor,
    updateDoctor,
    deleteDoctor,
}