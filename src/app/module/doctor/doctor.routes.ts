import { Router } from "express";
import { doctorController } from "./doctor.controller";
import { checkAuth } from "../../lib/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { doctorValidation } from "./doctor.validation";


const router = Router();

router.get("/", 
    // checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR), 
    doctorController.getAllDoctor);
router.get("/:doctorId", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR), doctorController.getDoctorById);
router.patch("/:doctorId",  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR), validateRequest(doctorValidation.updateDoctorZodSchema), doctorController.updateDoctor);
router.delete("/:doctorId", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), doctorController.softDeleteDoctor);

export const doctorRouter = router;