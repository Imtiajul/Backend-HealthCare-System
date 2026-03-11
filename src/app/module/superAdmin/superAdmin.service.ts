import { prisma } from "../../lib/prisma"
import { IUpdateSuperAdminPayload } from "./superAdmin.interface";

const getAllSuperAdmin = async () => {
    const result = await prisma.superAdmin.findMany({
        where: {
            isDeleted: false,
        },
        orderBy: {
            createdAt: "desc",
        },
        // include: {
        //     user: true,
        //     specialties: {
        //         include: {
        //             specialty: true,
        //         }
        //     }
        // },
        select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            contactNumber: true,

            createdAt: true,
            updatedAt: true,
            isDeleted: true,
            deletedAt: true,
        }
    })


    return result;
}

const getSuperAdminById = async (id: string) => {
    const result = await prisma.superAdmin.findUnique({
        where: {
            isDeleted: false,
            id,
        },
        // include: {
        //     // user: true,
        //     specialties: {
        //         include: {
        //             specialty: true,
        //         }
        //     }
        // },
        select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            contactNumber: true,

            createdAt: true,
            updatedAt: true,
            isDeleted: true,
            deletedAt: true,
        }
    });

    if (!result) {
        throw new Error("SuperAdmin not found");
    }


    return result;
}

const updateSuperAdmin = async (id: string, payload: IUpdateSuperAdminPayload) => {
    // Check if SuperAdmin exists and not deleted
    const existingSuperAdmin = await prisma.superAdmin.findUnique({
        where: { id, isDeleted: false },
    });

    if (!existingSuperAdmin) {
        throw new Error("SuperAdmin not found");
    }

    // Update SuperAdmin basic information
    return await prisma.superAdmin.update({
        where: { id },
        data: payload,
    });
}

const softDeleteSuperAdmin = async (id: string) => {
    // Check if SuperAdmin exists and not already deleted
    const superAdmin = await prisma.superAdmin.findUnique({
        where: { id },
    });

    if (!superAdmin) {
        throw new Error("SuperAdmin not found");
    }

    if (superAdmin.isDeleted) {
        throw new Error("SuperAdmin is already deleted");
    }
    // Mark SuperAdmin as deleted
    return await prisma.superAdmin.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        }
    })
}

export const superAdminService = {
    getAllSuperAdmin,
    getSuperAdminById,
    updateSuperAdmin,
    softDeleteSuperAdmin
}