import { email, string } from "better-auth";
import { User, UserStatus } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

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
        throw new Error("Faild to register patient!");
    }

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

    const data = await auth.api.signInEmail({
        body: {
            email,
            password
        }
    })

    if (data.user.status === UserStatus.BLOCKED) {
        throw new Error("User is Blocked!!");
    }
    if (!data.user.isDeleted) {
        throw new Error("Sorry, the user is deleted!!")
    }

    return data;
}

export const authService = {
    registerPatient, loginUser
}