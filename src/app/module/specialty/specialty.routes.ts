import { Router } from "express";
import { specialtyController } from "./specialty.controller";
import { checkAuth } from "../../lib/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { validateRequest } from "../../middleware/validateRequest";
import { specialtyValidation } from "./specialty.validation";
const router = Router();

router.post('/',
    // checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.single("file"),
    validateRequest(specialtyValidation.createSpecialtyZodSchema),
    specialtyController.createSpecialty);
router.get("/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
    specialtyController.getAllSpecialties);
router.delete("/:id", specialtyController.deleteSpecialty);


export const specialtyRouter = router;