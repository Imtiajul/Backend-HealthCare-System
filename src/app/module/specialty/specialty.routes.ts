import { Router } from "express";
import { specialtyController } from "./specialty.controller";
import { checkAuth } from "../../lib/checkAuth";
import { Role } from "../../../generated/prisma/enums";
const router = Router();

router.post('/', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), specialtyController.createSpecialty);
router.get("/", 
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR) , 
    specialtyController.getAllSpecialties);
router.delete("/:id", specialtyController.deleteSpecialty);


export const specialtyRouter = router;