import { UserStatus } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import { envVars } from "../../config/env";
import { IRequestUser } from "../../interface/requestUser.interface";
import { jwtUtils } from "../../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { ILoginUserPayload, IRegisterPatientPayload, IChangePasswordPayload } from "./auth.interface";


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

    console.log((envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN), "type");

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

const getNewToken = async (refressToken: string, sessionToken: string) => {
    const isSessionTokenExists = await prisma.session.findUnique({
        where: {
            token: sessionToken,
        },
        include: {
            user: true
        }
    })

    if (!isSessionTokenExists) {
        throw new AppError(status.UNAUTHORIZED, "Invalid Session Token");
    }

    const verifyRefreshToken = jwtUtils.varifyToken(refressToken, envVars.REFRESH_TOKEN_SECRET);

    if (!verifyRefreshToken.success && verifyRefreshToken.error) {
        throw new AppError(status.BAD_REQUEST, "Invalid Refresh Token");
    }

    const data = verifyRefreshToken.data as JwtPayload;
    // console.log(data)
    const newAccessToken = tokenUtils.getAccessToken({
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,
    })

    const newRefreshToken = tokenUtils.getRefreshToken({
        userId: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,
    })

    const { token } = await prisma.session.update({
        where: {
            token: sessionToken
        },
        data: {
            token: sessionToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000 * 24),
            updatedAt: new Date(),
        }
    })

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        sessionToken: token,
    }
}

const changePassword = async (payload: IChangePasswordPayload, sessionToken: string) => {
    // console.log(payload)
    const session = await auth.api.getSession({
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    })
    // console.log(session)

    if (!session) {
        throw new AppError(status.UNAUTHORIZED, "Invalid Session Token");
    }

    const { currentPassword, newPassword } = payload;

    const result = await auth.api.changePassword({
        body: {
            currentPassword,
            newPassword,
            revokeOtherSessions: true
        },
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    })

    if (session.user.needPasswordChange) {
        await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                needPasswordChange: false
            }
        })
    }
    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,
    });


    return {
        ...result,
        accessToken,
        refreshToken
    }

}

const logoutUser = async (sessionToken: string) => {
    const result = await auth.api.signOut({
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    })
    return result;
}

const getMe = async (user: IRequestUser) => {
    const isUserExist = await prisma.user.findUnique({
        where: {
            id: user.userId
        },
        include: {
            patient: {
                include: {
                    prescriptions: true,
                    medicalReports: true,
                    reviews: true,
                    appointments: true,
                }
            },
            doctor: {
                include: {
                    specialties: true,
                    appointments: true,
                    reviews: true,
                }
            },
            admin: true
        }
    })

    return isUserExist;
}

const verifyEmail = async (email: string, otp: string) => {
    const result = await auth.api.verifyEmailOTP({
        body: {
            email,
            otp
        }
    })

    if (result.status && !result.user.emailVerified) {
        await prisma.user.update({
            where: {
                email,
            },
            data: {
                emailVerified: true
            }
        })
    }
}

const forgetPassword = async (email: string) => {
    const isUserExist = await prisma.user.findUnique({
        where: { email }
    })

    if (!isUserExist) {
        throw new AppError(status.NOT_FOUND, "User Not Found");
    }
    if (!isUserExist.emailVerified) {
        throw new AppError(status.BAD_REQUEST, "Email Not Verified");
    }
    if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "User Not Found");
    }

    await auth.api.requestPasswordResetEmailOTP({
        body: {
            email
        }
    })
}

const resetPassword = async (email: string, otp: string, newPassword: string) => {
    const isUserExist = await prisma.user.findUnique({
        where: { email }
    })

    if (!isUserExist) {
        throw new AppError(status.NOT_FOUND, "User Not Found");
    }
    if (!isUserExist.emailVerified) {
        throw new AppError(status.BAD_REQUEST, "Email Not Verified");
    }
    if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "User Not Found");
    }

    await auth.api.resetPasswordEmailOTP({
        body: {
            email,
            otp,
            password: newPassword,
        }
    })

    if (isUserExist.needPasswordChange) {
        await prisma.user.update({
            where: {
                id: isUserExist.id,
            },
            data: {
                needPasswordChange: false
            }
        })
    }

    await prisma.session.deleteMany({
        where: {
            userId: isUserExist.id,
        }
    })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const googleLoginSuccess = async (session: Record<string, any>) => {
    const isPatientExists = await prisma.patient.findUnique({
        where: {
            userId: session.user.id,
        }
    })

    if (!isPatientExists) {
        await prisma.patient.create({
            data: {
                userId: session.user.id,
                name: session.user.name,
                email: session.user.email,
            }
        })
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name
    })

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name
    })

    return {
        accessToken,
        refreshToken
    }
}

export const authService = {
    registerPatient, loginUser, getMe, getNewToken,
    changePassword, logoutUser, verifyEmail,
    forgetPassword, resetPassword,
    googleLoginSuccess,
}