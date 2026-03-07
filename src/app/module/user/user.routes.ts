import { validateRequest } from "../../middleware/validateRequest";
import { userController } from "./user.controller";
import { Router } from "express";
import { createAdminValidationSchema, createDoctorZodSchema, createSuperAdminValidationSchema } from "./user.validation";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../lib/checkAuth";

const router = Router();



router.post("/create-doctor",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(createDoctorZodSchema),
    userController.createDoctor);

router.post("/create-admin",
    checkAuth(Role.SUPER_ADMIN),
    validateRequest(createAdminValidationSchema),
    userController.createAdmin);

router.post("/create-superadmin",
    checkAuth(Role.SUPER_ADMIN),
    validateRequest(createSuperAdminValidationSchema),
    userController.createSuperAdmin);

export const userRouter = router;