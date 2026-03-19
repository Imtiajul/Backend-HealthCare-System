import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequest = (zodSchema: z.ZodObject) => {
    return (req:Request, res:Response, next:NextFunction) => {
        // console.log(req.body);
        if(req.body.data) {
            req.body = JSON.parse(req.body.data);
        }

        const parsedResult = zodSchema.safeParse(req.body);
        // console.log(parsedResult)
        // console.log(parsedResult.data);
        if(!parsedResult.success) {
            next(parsedResult.error);
        }

        //sanitizing the data
        req.body = parsedResult.data

        // console.log(req.body);
        next();
    }
}