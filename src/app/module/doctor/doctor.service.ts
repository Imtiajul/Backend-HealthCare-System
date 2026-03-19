import { Doctor, Prisma, Specialty } from "../../../generated/prisma/client";
import { UserStatus } from "../../../generated/prisma/enums";
import { IQueryParams } from "../../interface/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
  doctorFilterableFields,
  doctorIncludeConfig,
  doctorSearchableFields,
} from "./doctor.constant";
import { IUpdateDoctorPayload } from "./doctor.Interface";

const getAllDoctor = async (query: IQueryParams) => {
  // const data = await prisma.doctor.findMany({
  //   where: {
  //     isDeleted: false,
  //   },
  //   orderBy: {
  //     createdAt: "desc",
  //   },
  //   // include: {
  //   //     // user: true,
  //   //     specialties: {
  //   //         include: {
  //   //             specialty: true,
  //   //         }
  //   //     }
  //   // },
  //   select: {
  //     id: true,
  //     name: true,
  //     email: true,
  //     profilePhoto: true,
  //     contactNumber: true,
  //     registrationNumber: true,
  //     experience: true,
  //     gender: true,
  //     appointmentFee: true,
  //     qualification: true,
  //     currentWorkingPlace: true,
  //     designation: true,
  //     averageRating: true,
  //     createdAt: true,
  //     updatedAt: true,
  //     specialties: {
  //       select: {
  //         specialty: true
  //         // {
  //         //   select: {
  //         //     id: true,
  //         //     title: true,
  //         //   },
  //         // },
  //       },
  //     },
  //   }
  // })

  // Transform specialties (flatten structure)
  // const doctors = data.map((doctor) => ({
  //   ...doctor,
  //   specialties: doctor.specialties.map((s) => s.specialty),
  // }));

  // return doctors;

  const queryBuilder = new QueryBuilder<
    Doctor,
    Prisma.DoctorWhereInput,
    Prisma.DoctorInclude
  >(prisma.doctor, query, {
    searchableFields: doctorSearchableFields,
    filterableFields: doctorFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({
      isDeleted: false,
    })
    .include({
      user: true,
      specialties: {
        include: {
          specialty: true,
        },
      },
    })
    .dynamicInclude(doctorIncludeConfig)
    .paginate()
    .sort()
    .fields()
    .execute();

  return result;
};

const getDoctorById = async (id: string) => {
  const result = await prisma.doctor.findUnique({
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
      registrationNumber: true,
      experience: true,
      gender: true,
      appointmentFee: true,
      qualification: true,
      currentWorkingPlace: true,
      designation: true,
      averageRating: true,
      createdAt: true,
      updatedAt: true,
      specialties: {
        select: {
          specialty: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!result) {
    throw new Error("Doctor not found");
  }
  // Transform specialties (flatten structure)
  const doctors = {
    ...result,
    specialties: result.specialties.map((s) => s.specialty),
  };

  return doctors;
};

const updateDoctor = async (id: string, payload: IUpdateDoctorPayload) => {
  // Check if doctor exists and not deleted
  const existingDoctor = await prisma.doctor.findUnique({
    where: { id, isDeleted: false },
  });

  if (!existingDoctor) {
    throw new Error("Doctor not found");
  }

  // Separate specialties from doctor data
  const { specialties, ...doctorData } = payload;

  // Update doctor basic information
  const updatedDoctor = await prisma.doctor.update({
    where: { id },
    data: doctorData,
    include: {
      specialties: {
        include: {
          specialty: true,
        },
      },
    },
  });

  // If specialties are provided, update them separately
  if (specialties && specialties.length > 0) {
    // Delete old specialties
    await prisma.doctorSpecialty.deleteMany({
      where: { doctorId: id },
    });

    // Add new specialties
    const specialtiesData = specialties.map((specialtyId: string) => ({
      doctorId: id,
      specialtyId,
    }));

    await prisma.doctorSpecialty.createMany({
      data: specialtiesData,
    });

    // Fetch updated doctor with new specialties
    const result = await prisma.doctor.findUnique({
      where: { id },
      include: {
        specialties: {
          include: {
            specialty: true,
          },
        },
      },
    });

    return {
      ...result,
      specialties: result?.specialties.map((s) => s.specialty) || [],
    };
  }

  // Return updated doctor with transformed specialties
  return {
    ...updatedDoctor,
    specialties: updatedDoctor.specialties.map((s) => s.specialty),
  };
};

const softDeleteDoctor = async (id: string) => {
  // Check if doctor exists and not already deleted
  const isDoctorExist = await prisma.doctor.findUnique({
    where: { id },
  });

  if (!isDoctorExist) {
    throw new Error("Doctor not found");
  }

  if (isDoctorExist.isDeleted) {
    throw new Error("Doctor is already deleted");
  }
  // Mark doctor as deleted
  await prisma.$transaction(async (tx) => {
    await tx.doctor.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: isDoctorExist.userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });

    await tx.session.deleteMany({
      where: { userId: isDoctorExist.userId },
    });

    await tx.doctorSpecialty.deleteMany({
      where: { doctorId: id },
    });
  });

  return { message: "Doctor deleted successfully" };
};

export const doctorService = {
  getAllDoctor,
  getDoctorById,
  updateDoctor,
  softDeleteDoctor,
};
