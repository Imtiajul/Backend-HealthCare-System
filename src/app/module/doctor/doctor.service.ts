import { prisma } from "../../lib/prisma"
import { IUpdateDoctorPayload } from "./doctorInterface";

const getAllDoctor = async () => {
    const doctors = await prisma.doctor.findMany({
        include: {
            user: true,
            specialties: {
                include: {
                    specialty: true,
                }
            }
        }
    })

    return doctors;
}

const getDoctorById = async (id: string) => {
    return await prisma.doctor.findUnique({
        where: {
            id,
        }
    })
}
const updateDoctor = async (id: string, payload: IUpdateDoctorPayload) => {
    return await prisma.doctor.update({
        where: {id},
        data: {
            ...payload,
        }
    })
}
const deleteDoctor = async(id: string) => {
    return await prisma.doctor.update({
        where: {id},
        data: {
            isDeleted: true,
            deleteAt: new Date(),
        }
    })
}

export const doctorService = {
    getAllDoctor,
    getDoctorById,
    updateDoctor,
    deleteDoctor
}  