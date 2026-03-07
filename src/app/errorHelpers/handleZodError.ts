import status from "http-status";
import { TErrorResponse, TErrorSource } from "../interface/error.interface";
import z from "zod";

export const handleZodError = (err: z.ZodError): TErrorResponse => {

 const statusCode = status.BAD_REQUEST;
       const  message = "Zod Validation Error";
       const errorSources: TErrorSource[] = [];

        err.issues.forEach((issue) => {
            errorSources.push({
                path: issue.path.join(" => ") || "unknown",
                // path: issue.path.length > 1 ? issue.path.join(" => ") : issue.path[0].toString(),
                message: issue.message,
            })
        })

        return {
            success: false,
            statusCode,
            message,
            errorSources,
        }
}