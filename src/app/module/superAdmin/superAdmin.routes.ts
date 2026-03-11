import { Router } from "express";
import { superAdminController } from "./superAdmin.controller";
import { checkAuth } from "../../lib/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { updateSuperAdminZodSchema } from "./superAdmin.validation";


const router = Router();

router.get("/", checkAuth(Role.SUPER_ADMIN), superAdminController.getallSuperAdmin);
router.get("/:adminId", checkAuth(Role.SUPER_ADMIN), superAdminController.getSuperAdminById);
router.patch("/:adminId",  checkAuth(Role.SUPER_ADMIN), validateRequest(updateSuperAdminZodSchema), superAdminController.updateSuperAdmin);
router.delete("/:adminId", checkAuth(Role.SUPER_ADMIN), superAdminController.softDeleteSuperAdmin);

export const superAdminRouter = router;