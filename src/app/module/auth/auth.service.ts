import { UserStatus } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import { envVars } from "../../config/env";

interface IRegisterPatientPayload {
    name: string;
    email: string;
    password: string
}

interface ILoginUserPayload {
    email: string;
    password: string
}

const registerPatient = async (payload: IRegisterPatientPayload) => {
    const { name, email, password } = payload;

    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
            // default value
            // needPassChange,
            // role
        }
    })
    if (!data.user) {
        // throw new Error("Faild to register patient!");
        throw new AppError(status.BAD_REQUEST, "Faild to register patient!");
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    })

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    })

    try {
        const patient = await prisma.$transaction(async (tx) => {
            const patientTx = await tx.patient.create({
                data: {
                    userId: data.user.id,
                    name: payload.name,
                    email: payload.email,
                }
            })

            return patientTx;
        })

        return {
            ...data,
            accessToken,
            refreshToken,
            patient
        }
    } catch (error) {
        console.log("Transaction Error: ", error);

        await prisma.user.delete({
            where: {
                id: data.user.id,
            }
        })
        throw error;
    }
}


const loginUser = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;
    console.log("first")
        console.log((envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN));

    const data = await auth.api.signInEmail({
        body: {
            email,
            password
        }
    })

    if (data.user.status === UserStatus.BLOCKED) {
        // throw new Error("User is Blocked!!");
        throw new AppError(status.FORBIDDEN, "User is Blocked!!");
    }
    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
        // throw new Error("Sorry, the user is deleted!!")
        throw new AppError(status.NOT_FOUND, "Sorry, the user is deleted!!");
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    })

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    })

    return {
        ...data,
        accessToken,
        refreshToken
    };
}

export const authService = {
    registerPatient, loginUser
}