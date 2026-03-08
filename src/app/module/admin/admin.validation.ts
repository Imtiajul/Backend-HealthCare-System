import z from "zod";


//update route
const updateAdminZodSchema = z.object({
    name: z.string().optional(),
    profilePhoto: z.url("Invalid URL format").optional(),
    contactNumber: z.string().min(11, "Contact number is required, minimum Digit 11").max(14, "Maximum Digit 14"),
    registrationNumber: z.string().optional(),
    experience: z
        .int("Experience must be a whole number")
        .min(0, "Experience cannot be negative")
        .optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    appointmentFee: z
        .number()
        .positive("Appointment fee must be positive")
        .optional(),
    qualification: z.string().optional(),
    currentWorkingPlace: z.string().optional(),
    designation: z.string().optional(),
    specialties: z
        .array(z.uuid("Each specialty ID must be a valid UUID"))
        .optional(),
// }).partial();
})

export const adminValidation = {
    updateAdminZodSchema,
}