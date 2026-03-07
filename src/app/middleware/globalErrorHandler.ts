
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import status from "http-status";
import z from "zod";
import { TErrorResponse, TErrorSource } from "../interface/error.interface";
import { handleZodError } from "../errorHelpers/handleZodError";
import AppError from "../errorHelpers/AppError";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const globalErrorHandler = (err:any, req: Request, res: Response, _next: NextFunction) => {
    // console.log(err);

    if(envVars.NODE_ENV === "development") {
        console.log("Error from Global Error Handler", err);
    }

    let errorSources: TErrorSource[] =[];
    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    let message: string = "Internal Server Error";
    let stack: string | undefined = undefined;

    if(err instanceof z.ZodError) {
        const simplifiedError = handleZodError(err);
        statusCode = simplifiedError.statusCode as number;
        message = simplifiedError.message;
        errorSources.push(...simplifiedError.errorSources!);
    } else if(err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        stack= err.stack;
        errorSources = [
            {
                path: '',
                message: err.message            }
        ]
    } else if(err instanceof Error) {
        statusCode = status.INTERNAL_SERVER_ERROR;
        message = err.message;
        stack = err.stack;
        errorSources = [
            {
                path: '',
                message: err.message
            }
        ]
    }

    const errorResonse: TErrorResponse = {
        statusCode: statusCode,
        success: false,
        message: message,
        errorSources,
        stack:envVars.NODE_ENV === "development"? stack : undefined,
        error:envVars.NODE_ENV === "development" ? err : undefined,
    }

    // res.status(statusCode).json({
    //    success: false,
    //    message,
    //    error: envVars.NODE_ENV === 'development' ? err.message : undefined,
    //    errorSource,
    // })

    res.status(statusCode).json(errorResonse);
}