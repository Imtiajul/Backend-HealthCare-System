
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { doctorService } from "./doctor.service";
import { IQueryParams } from "../../interface/query.interface";

const getAllDoctor = catchAsync(
    async (req: Request, res: Response) => {
        const query = req.query;
        const result = await doctorService.getAllDoctor(query as IQueryParams);
        console.log(result);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'Fetched All Doctors Data',
            data: result.data,
            meta: result.meta,
        });
    }
)

const getDoctorById = catchAsync(
    async (req: Request, res: Response) => {
        const doctorId = req.params.doctorId;
        const result = await doctorService.getDoctorById(doctorId as string);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'Fetched Doctor\'s Data',
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
            message: 'Doctor Data Updated',
            data: result
        });
    }
)

const softDeleteDoctor = catchAsync(
    async (req: Request, res: Response) => {
        const doctorId = req.params.doctorId;
        const result = await doctorService.softDeleteDoctor(doctorId as string);
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
    getDoctorById,
    updateDoctor,
    softDeleteDoctor,
}