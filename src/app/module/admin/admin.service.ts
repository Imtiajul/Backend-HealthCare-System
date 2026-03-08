import { prisma } from "../../lib/prisma"
import { IUpdateAdminPayload } from "./admin.interface";

const getAllAdmin = async () => {
    const result = await prisma.admin.findMany({
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

const getAdminById = async (id: string) => {
    const result = await prisma.admin.findUnique({
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
        throw new Error("Admin not found");
    }


    return result;
}

const updateAdmin = async (id: string, payload: IUpdateAdminPayload) => {
    // Check if admin exists and not deleted
    const existingAdmin = await prisma.admin.findUnique({
        where: { id, isDeleted: false },
    });

    if (!existingAdmin) {
        throw new Error("Admin not found");
    }

    // Update admin basic information
    return await prisma.admin.update({
        where: { id },
        data: payload,
    });
}

const softDeleteAdmin = async (id: string) => {
    // Check if admin exists and not already deleted
    const admin = await prisma.admin.findUnique({
        where: { id },
    });

    if (!admin) {
        throw new Error("Admin not found");
    }

    if (admin.isDeleted) {
        throw new Error("admin is already deleted");
    }
    // Mark admin as deleted
    return await prisma.admin.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        }
    })
}

export const adminService = {
    getAllAdmin,
    getAdminById,
    updateAdmin,
    softDeleteAdmin
}