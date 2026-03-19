import status from "http-status";
import { Role, Specialty } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateAdmin, ICreateDoctorPayload, ICreateSuperAdmin } from "./user.interface";

const createDoctor = async (payload: ICreateDoctorPayload) => {

    const specialties: Specialty[] = [];

    for (const specialtyId of payload.specialties) {
        const specialty = await prisma.specialty.findUnique({
            where: {
                id: specialtyId
            }
        })

        if (!specialty) {
            // throw new Error(`Specialty with id  ${specialtyId} not found`)
            throw new AppError(status.NOT_FOUND, `Specialty with id  ${specialtyId} not found`);

        }
        specialties.push(specialty);
    }

    const userExists = await prisma.user.findUnique({
        where: {
            email: payload.doctor.email
        }
    })
    if (userExists) {
        // throw new Error("User with this email is exists!");
        throw new AppError(status.CONFLICT, "User with this email is exists!");
    }

    const userData = await auth.api.signUpEmail({
        body: {
            email: payload.doctor.email.toLowerCase(),
            password: payload.password,
            role: Role.DOCTOR,
            name: payload.doctor.name,
            needPasswordChange: true
        }
    })

    try {
        const result = await prisma.$transaction(async (tx) => {
            const doctorData = await tx.doctor.create({
                data: {
                    userId: userData.user.id,
                    ...payload.doctor,
                    email: payload.doctor.email.toLowerCase(),
                }
            })

            const doctorSpecialtyData = specialties.map((specialty) => {
                return {
                    doctorId: doctorData.id,
                    specialtyId: specialty.id
                }
            })
            // console.log(doctorSpecialtyData);

            await tx.doctorSpecialty.createMany({
                data: doctorSpecialtyData
            })

            const doctor = await tx.doctor.findUnique({
                where: {
                    id: doctorData.id,
                },
                select: {
                    id: true,
                    userId: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    address: true,
                    experience: true,
                    gender: true,
                    appointmentFee: true,
                    qualification: true,
                    currentWorkingPlace: true,
                    designation: true,
                    createdAt: true,
                    updatedAt: true,
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            role: true,
                            status: true,
                            emailVerified: true,
                            image: true,
                            isDeleted: true,
                            createdAt: true,
                            updatedAt: true,
                        }
                    },
                    specialties: {
                        select: {
                            specialty: {
                                select: {
                                    title: true,
                                    id: true
                                }
                            }
                        }
                    }
                }
            })

            return doctor;
        })

        return result;
    } catch (error) {
        console.log("Transaction error: ", error);
        await prisma.user.delete({
            where: {
                id: userData.user.id
            }
        })
        throw error
    }
}

const createAdmin = async (payload: ICreateAdmin) => {
  // Step 1: Check if user already exists
  const userExists = await prisma.user.findUnique({
    where: {
      email: payload.admin.email,
    },
  });

  if (userExists) {
    throw new Error("User with this email already exists");
  }

  // Step 2: Create user account with Better Auth
  const userData = await auth.api.signUpEmail({
    body: {
      email: payload.admin.email,
      password: payload.password,
      role: Role.ADMIN,
      name: payload.admin.name,
      needPasswordChange: true,
      rememberMe: false,
    },
  });

  // Step 3: Create admin profile in transaction
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create admin record
      const admin = await tx.admin.create({
        data: {
          userId: userData.user.id,
          name: payload.admin.name,
          email: payload.admin.email,
          profilePhoto: payload.admin.profilePhoto,
          contactNumber: payload.admin.contactNumber,
        },
      });

      // Fetch created admin with user data
      const createdAdmin = await tx.admin.findUnique({
        where: { id: admin.id },
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              status: true,
            },
          },
        },
      });

      return createdAdmin;
    });

    return result;
  } catch (error) {
    // Cleanup: Delete user if admin creation fails
    await prisma.user.delete({
      where: { id: userData.user.id },
    });
    throw new AppError(status.CONFLICT, "Failed to create admin");
  }
};

const createSuperAdmin = async (payload: ICreateSuperAdmin) => {
  // Step 1: Check if user already exists
  // console.log(payload.superAdmin.email);
  const userExists = await prisma.user.findUnique({
    where: {
      email: payload.superAdmin.email,
    },
  });

  if (userExists) {
    throw new Error("User with this email already exists");
  }

  // Step 2: Create user account with Better Auth
  const userData = await auth.api.signUpEmail({
    body: {
      email: payload.superAdmin.email,
      password: payload.password,
      role: Role.SUPER_ADMIN,
      name: payload.superAdmin.name,
      needPasswordChange: true,
      rememberMe: false,
    },
  });

  // Step 3: Create superAdmin profile in transaction
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create superAdmin record
      const superAdmin = await tx.superAdmin.create({
        data: {
          userId: userData.user.id,
          name: payload.superAdmin.name,
          email: payload.superAdmin.email,
          profilePhoto: payload.superAdmin.profilePhoto,
          contactNumber: payload.superAdmin.contactNumber,
        },
      });

      // Fetch created superAdmin with user data
      const createdsuperAdmin = await tx.superAdmin.findUnique({
        where: { id: superAdmin.id },
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              status: true,
            },
          },
        },
      });

      return createdsuperAdmin;
    });

    return result;
  } catch (error) {
    // Cleanup: Delete user if admin creation fails
    await prisma.user.delete({
      where: { id: userData.user.id },
    });
    throw new AppError(status.CONFLICT, "Failed to create admin");
  }
};

export const userService = {
    createDoctor,
    createAdmin,
    createSuperAdmin,
}